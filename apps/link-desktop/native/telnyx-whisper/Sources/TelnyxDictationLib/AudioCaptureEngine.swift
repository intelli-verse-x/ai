import AVFoundation
import AudioToolbox
import CoreAudio
import Foundation
import os.log

private let audioLog = OSLog(subsystem: "com.telnyx.dictation", category: "AudioCapture")

/// Append a diagnostic line to ~/Library/Logs/TelnyxDictation/audio-capture.log
private func audioDiag(_ msg: String) {
    let ts = ISO8601DateFormatter().string(from: Date())
    let line = "[\(ts)] \(msg)\n"
    let baseDir = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask).first!
        .appendingPathComponent("Logs/TelnyxDictation", isDirectory: true)
    try? FileManager.default.createDirectory(at: baseDir, withIntermediateDirectories: true)
    let url = baseDir.appendingPathComponent("audio-capture.log")
    if let handle = try? FileHandle(forWritingTo: url) {
        defer { try? handle.close() }
        try? handle.seekToEnd()
        handle.write(Data(line.utf8))
    } else {
        try? Data(line.utf8).write(to: url, options: .atomic)
    }
}

/// Errors that can occur during audio capture setup.
public enum AudioCaptureError: Error, Sendable {
    case formatCreationFailed
    case converterCreationFailed
    case inputAudioUnitUnavailable
    case failedToSelectInputDevice(OSStatus)
    case invalidInputFormat(sampleRate: Double, channels: UInt32)
}

/// Captures microphone audio via `AVAudioEngine`, converts to 16 kHz mono
/// PCM16 signed-LE, and publishes frames + RMS levels as `AsyncStream`s.
///
/// Supports repeated `start()` / `stop()` cycles — each `start()` creates
/// fresh streams and continuations.  Callers should grab `pcmFrames` /
/// `audioLevels` references **after** calling `start()`.
///
/// Conforms to `AudioCapturing` so it plugs directly into `DictationSession`.
public final class AudioCaptureEngine: AudioCapturing, @unchecked Sendable {

    // MARK: - Target format constants

    public static let targetSampleRate: Double = 16_000
    public static let targetChannels: AVAudioChannelCount = 1

    // MARK: - AudioCapturing protocol (computed — reads mutable backing)

    public var pcmFrames: AsyncStream<Data> {
        lock.lock()
        defer { lock.unlock() }
        return _pcmFrames
    }

    // MARK: - RMS level output (0.0 … 1.0)

    public var audioLevels: AsyncStream<Float> {
        lock.lock()
        defer { lock.unlock() }
        return _audioLevels
    }

    // MARK: - Private mutable state (guarded by lock)

    private let lock = NSLock()
    private var engine: AVAudioEngine
    private var _pcmFrames: AsyncStream<Data>
    private var _audioLevels: AsyncStream<Float>
    private var frameContinuation: AsyncStream<Data>.Continuation?
    private var levelContinuation: AsyncStream<Float>.Continuation?
    private var isRunning = false
    private var preferredInputDeviceID: AudioDeviceID?

    // MARK: - Init

    public init(engine: AVAudioEngine = AVAudioEngine()) {
        self.engine = engine
        // Initial empty streams (immediately finished) -- callers should
        // access streams after start().
        _pcmFrames = AsyncStream { $0.finish() }
        _audioLevels = AsyncStream { $0.finish() }
    }

    // MARK: - AudioCapturing

    public func start() throws {
        lock.lock()

        // Tear down any prior session first.
        if isRunning {
            tearDownLocked()
        }

        // Create a FRESH engine every time -- reusing an engine after stop()
        // leaves the audio graph in a stale state where installTap callbacks
        // silently never fire on macOS.
        engine = AVAudioEngine()

        // Create fresh streams + continuations for this session.
        var fc: AsyncStream<Data>.Continuation!
        _pcmFrames = AsyncStream { fc = $0 }
        frameContinuation = fc

        var lc: AsyncStream<Float>.Continuation!
        _audioLevels = AsyncStream { lc = $0 }
        levelContinuation = lc
        let preferredDeviceID = preferredInputDeviceID

        isRunning = true
        lock.unlock()

        // Check TCC authorization status before touching the audio engine.
        let tccStatus = AVCaptureDevice.authorizationStatus(for: .audio)
        let tccDesc: String
        switch tccStatus {
        case .authorized: tccDesc = "authorized"
        case .denied: tccDesc = "DENIED"
        case .restricted: tccDesc = "RESTRICTED"
        case .notDetermined: tccDesc = "notDetermined"
        @unknown default: tccDesc = "unknown(\(tccStatus.rawValue))"
        }
        audioDiag("TCC mic status: \(tccDesc)")

        // Access inputNode to trigger implicit graph setup.
        let inputNode = engine.inputNode

        // Set preferred input device if specified.
        if let preferredDeviceID {
            audioDiag("Setting preferred input device: \(preferredDeviceID)")
            try Self.setCurrentInputDevice(preferredDeviceID, on: inputNode)
        }

        // Query the ACTUAL hardware sample rate from the audio unit.
        // inputNode.outputFormat(forBus:0) can report a stale/wrong rate (e.g. 44100)
        // while the hardware is actually at 48000, causing engine.start() to fail.
        let hwSampleRate: Double
        if let au = inputNode.audioUnit {
            var streamDesc = AudioStreamBasicDescription()
            var descSize = UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
            let st = AudioUnitGetProperty(
                au,
                kAudioUnitProperty_StreamFormat,
                kAudioUnitScope_Input,
                1, // input element
                &streamDesc,
                &descSize
            )
            if st == noErr, streamDesc.mSampleRate > 0 {
                hwSampleRate = streamDesc.mSampleRate
            } else {
                hwSampleRate = inputNode.outputFormat(forBus: 0).sampleRate
            }
        } else {
            hwSampleRate = inputNode.outputFormat(forBus: 0).sampleRate
        }

        let reportedFormat = inputNode.outputFormat(forBus: 0)
        audioDiag("Reported format: sampleRate=\(reportedFormat.sampleRate) channels=\(reportedFormat.channelCount)")
        audioDiag("Actual HW sampleRate: \(hwSampleRate)")

        guard hwSampleRate > 0 else {
            audioDiag("ERROR: Invalid HW sample rate \(hwSampleRate)")
            throw AudioCaptureError.invalidInputFormat(sampleRate: hwSampleRate, channels: 0)
        }

        guard let targetFormat = AVAudioFormat(
            commonFormat: .pcmFormatInt16,
            sampleRate: Self.targetSampleRate,
            channels: Self.targetChannels,
            interleaved: true
        ) else {
            throw AudioCaptureError.formatCreationFailed
        }

        // Build tap format matching actual hardware rate.
        guard let tapFormat = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: hwSampleRate,
            channels: 1,
            interleaved: false
        ) else {
            audioDiag("ERROR: Failed to create tap format at \(hwSampleRate) Hz")
            throw AudioCaptureError.formatCreationFailed
        }

        audioDiag("Installing tap on bus 0, bufferSize=4096, format=\(hwSampleRate)Hz/Float32/1ch")
        var tapCallbackCount = 0
        var lazyConverter: AVAudioConverter?
        inputNode.installTap(onBus: 0, bufferSize: 4096, format: tapFormat) {
            [weak self] buffer, _ in
            tapCallbackCount += 1
            if tapCallbackCount <= 5 {
                audioDiag("Tap callback #\(tapCallbackCount): frameLength=\(buffer.frameLength) sampleRate=\(buffer.format.sampleRate)")
            }
            // Create converter lazily from the actual buffer format
            if lazyConverter == nil {
                lazyConverter = AVAudioConverter(from: buffer.format, to: targetFormat)
                if lazyConverter == nil {
                    audioDiag("ERROR: Failed to create converter from \(buffer.format) -> \(targetFormat)")
                }
            }
            guard let converter = lazyConverter else { return }
            self?.processBuffer(buffer, converter: converter, targetFormat: targetFormat)
        }

        try engine.start()
        audioDiag("AVAudioEngine started (isRunning=\(engine.isRunning))")
    }

    public func stop() {
        lock.lock()
        tearDownLocked()
        lock.unlock()
    }

    public func setPreferredInputDeviceID(_ deviceID: AudioDeviceID?) {
        lock.lock()
        preferredInputDeviceID = deviceID
        lock.unlock()
    }

    // MARK: - Internal buffer processing (visible to @testable import)

    /// Convert a tap buffer to the target format, emit Data + RMS level.
    func processBuffer(
        _ buffer: AVAudioPCMBuffer,
        converter: AVAudioConverter,
        targetFormat: AVAudioFormat
    ) {
        // Calculate output capacity proportional to sample-rate ratio.
        let ratio = Self.targetSampleRate / buffer.format.sampleRate
        let outputFrameCount = AVAudioFrameCount(Double(buffer.frameLength) * ratio)
        guard outputFrameCount > 0 else { return }

        guard let convertedBuffer = AVAudioPCMBuffer(
            pcmFormat: targetFormat,
            frameCapacity: outputFrameCount
        ) else { return }

        var error: NSError?
        var inputConsumed = false
        converter.convert(to: convertedBuffer, error: &error) { _, outStatus in
            if inputConsumed {
                outStatus.pointee = .noDataNow
                return nil
            }
            inputConsumed = true
            outStatus.pointee = .haveData
            return buffer
        }

        guard error == nil, convertedBuffer.frameLength > 0 else { return }

        let data = Self.extractPCM16Data(from: convertedBuffer)
        let rms = AudioMath.rmsLevel(pcm16Data: data)

        lock.lock()
        frameContinuation?.yield(data)
        levelContinuation?.yield(rms)
        lock.unlock()
    }

    // MARK: - Helpers

    /// Extract raw PCM16-LE bytes from an `AVAudioPCMBuffer` with `.pcmFormatInt16`.
    static func extractPCM16Data(from buffer: AVAudioPCMBuffer) -> Data {
        guard let channelData = buffer.int16ChannelData else { return Data() }
        let frameLength = Int(buffer.frameLength)
        let byteCount = frameLength * MemoryLayout<Int16>.size
        return Data(bytes: channelData[0], count: byteCount)
    }

    // MARK: - Private (must hold lock)

    /// Tear down current session. Caller MUST hold `lock`.
    private func tearDownLocked() {
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        frameContinuation?.finish()
        levelContinuation?.finish()
        frameContinuation = nil
        levelContinuation = nil
        isRunning = false
    }

    private static func setCurrentInputDevice(_ deviceID: AudioDeviceID, on inputNode: AVAudioInputNode) throws {
        guard let audioUnit = inputNode.audioUnit else {
            throw AudioCaptureError.inputAudioUnitUnavailable
        }

        var mutableDeviceID = deviceID
        let status = AudioUnitSetProperty(
            audioUnit,
            kAudioOutputUnitProperty_CurrentDevice,
            kAudioUnitScope_Global,
            0,
            &mutableDeviceID,
            UInt32(MemoryLayout<AudioDeviceID>.size)
        )

        guard status == noErr else {
            throw AudioCaptureError.failedToSelectInputDevice(status)
        }
    }
}
