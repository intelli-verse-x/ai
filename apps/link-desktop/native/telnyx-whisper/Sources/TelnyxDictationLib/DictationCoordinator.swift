import Foundation

public actor DictationCoordinator {
    private enum Mode {
        case microphone
        case fixture(URL)
    }

    private var session = DictationSession()
    private var silenceDetector: SilenceDetector
    private var latestPartialTranscript = ""
    private var latestFinalTranscript = ""
    private var accumulatedFinalSegments: [String] = []
    private var lastTranscriptEventTime: Date?
    private var isCancelling = false
    private var isStoppingPipelines = false
    private var currentSessionID: UUID?
    private var hasRecordedSessionResult = false
    private var recentSessionEntries: [RecentSessionEntry] = []

    private let audioCapture: any AudioCapturing
    private let audioLevels: @Sendable () -> AsyncStream<Float>
    private let sttStreaming: any STTStreaming
    private let hudPresenter: any HUDPresenting
    private let textInserter: any TextInserting
    private let accessibilityTrustChecker: @Sendable () -> Bool
    private let sessionLogger: any DictationSessionLogging
    private let llmCleaner: (any LLMCleaning)?
    private var llmCleanupEnabled: Bool

    private let fixtureChunkSize: Int
    private let fixtureChunkDelayNanoseconds: UInt64
    private let finalTranscriptWaitNanoseconds: UInt64
    private let finalTranscriptPollNanoseconds: UInt64
    private let feedbackDisplayNanoseconds: UInt64
    private let noSignalWatchdogNanoseconds: UInt64

    private var frameTask: Task<Void, Never>?
    private var levelTask: Task<Void, Never>?
    private var transcriptTask: Task<Void, Never>?
    private var fixtureTask: Task<Void, Never>?
    private var signalWatchdogTask: Task<Void, Never>?
    private var idleWaiters: [CheckedContinuation<Void, Never>] = []
    private var hasObservedAudioLevel = false
    private var hasSentAudioFrame = false

    public init(
        audioCapture: any AudioCapturing,
        audioLevels: @escaping @Sendable () -> AsyncStream<Float>,
        sttStreaming: any STTStreaming,
        hudPresenter: any HUDPresenting,
        textInserter: any TextInserting,
        accessibilityTrustChecker: @escaping @Sendable () -> Bool = { true },
        sessionLogger: any DictationSessionLogging = LocalDictationSessionLogger.shared,
        silenceDetector: SilenceDetector = SilenceDetector(),
        llmCleaner: (any LLMCleaning)? = nil,
        llmCleanupEnabled: Bool = true,
        fixtureChunkSize: Int = 2048,
        fixtureChunkDelayNanoseconds: UInt64 = 100_000_000,
        finalTranscriptWaitNanoseconds: UInt64 = 2_000_000_000,
        finalTranscriptPollNanoseconds: UInt64 = 100_000_000,
        feedbackDisplayNanoseconds: UInt64 = 3_000_000_000,
        noSignalWatchdogNanoseconds: UInt64 = 8_000_000_000
    ) {
        self.audioCapture = audioCapture
        self.audioLevels = audioLevels
        self.sttStreaming = sttStreaming
        self.hudPresenter = hudPresenter
        self.textInserter = textInserter
        self.accessibilityTrustChecker = accessibilityTrustChecker
        self.sessionLogger = sessionLogger
        self.silenceDetector = silenceDetector
        self.llmCleaner = llmCleaner
        self.llmCleanupEnabled = llmCleanupEnabled
        self.fixtureChunkSize = fixtureChunkSize
        self.fixtureChunkDelayNanoseconds = fixtureChunkDelayNanoseconds
        self.finalTranscriptWaitNanoseconds = finalTranscriptWaitNanoseconds
        self.finalTranscriptPollNanoseconds = finalTranscriptPollNanoseconds
        self.feedbackDisplayNanoseconds = feedbackDisplayNanoseconds
        self.noSignalWatchdogNanoseconds = noSignalWatchdogNanoseconds
    }

    public func currentState() -> DictationSession.State {
        session.state
    }

    public func updateSpeechThreshold(_ threshold: Float) {
        silenceDetector.speechThreshold = threshold
    }

    public func setLLMCleanupEnabled(_ enabled: Bool) {
        llmCleanupEnabled = enabled
    }

    public func isLLMCleanupEnabled() -> Bool {
        llmCleanupEnabled
    }

    @discardableResult
    public func startDictation() async -> Bool {
        await start(mode: .microphone)
    }

    @discardableResult
    public func startFixtureDictation(fixtureURL: URL) async -> Bool {
        await start(mode: .fixture(fixtureURL))
    }

    public func waitForIdle() async {
        if session.state == .idle {
            return
        }

        await withCheckedContinuation { continuation in
            idleWaiters.append(continuation)
        }
    }

    @discardableResult
    public func cancelDictation() async -> Bool {
        guard session.state != .idle else {
            return false
        }

        isCancelling = true
        _ = session.handle(.cancel)
        await recordSessionResult("cancelled by user", transcript: nil)

        await stopPipelines()
        hudPresenter.hide()
        resetRuntimeState()
        notifyIdleWaiters()

        return true
    }

    @discardableResult
    public func finishDictation() async -> Bool {
        guard session.state == .recording else {
            return false
        }

        await finalize(reason: "fn released; finalizing", deferForRecentTranscript: false)
        return true
    }

    private func start(mode: Mode) async -> Bool {
        guard session.state == .idle else {
            return false
        }

        // Transition state BEFORE any await to prevent actor reentrancy.
        // Without this, concurrent callers all see .idle during the
        // logEvent() suspension and each spawn a separate session.
        resetRuntimeState()
        currentSessionID = UUID()
        guard session.handle(.startRecording) else {
            return false
        }

        await logEvent(stage: "start", message: "dictation session started")

        hudPresenter.update(state: .recording, transcript: nil)

        do {
            try await sttStreaming.connect()
            // Start transcript pump AFTER connect so it gets the fresh stream.
            // Before this fix, the pump would see a finished stream from the
            // previous session's disconnect() and immediately fail.
            startTranscriptPump()
            await logEvent(stage: "connect", message: "speech stream connected")

            switch mode {
            case .microphone:
                try audioCapture.start()
                startFramePump(stream: audioCapture.pcmFrames)
                startLevelPump(stream: audioLevels())
                startNoSignalWatchdog()
            case .fixture(let fixtureURL):
                startFixturePump(fixtureURL: fixtureURL)
            }

            return true
        } catch {
            await handleStartFailure(error)
            return false
        }
    }

    private func startTranscriptPump() {
        transcriptTask?.cancel()
        let stream = sttStreaming.transcriptEvents

        transcriptTask = Task { [weak self] in
            for await event in stream {
                await self?.handleTranscriptEvent(event)
            }

            if Task.isCancelled {
                return
            }

            await self?.handleTranscriptStreamEndedUnexpectedly()
        }
    }

    private func startFramePump(stream: AsyncStream<Data>) {
        frameTask?.cancel()
        let stt = sttStreaming

        frameTask = Task { [weak self] in
            var sentWAVHeader = false
            for await frame in stream {
                do {
                    if let self {
                        await self.noteAudioFrameSent()
                    }
                    if !sentWAVHeader {
                        let header = Self.streamingWAVHeader(
                            sampleRate: Int(AudioCaptureEngine.targetSampleRate),
                            channels: Int(AudioCaptureEngine.targetChannels),
                            bitsPerSample: 16
                        )
                        var firstPacket = Data(capacity: header.count + frame.count)
                        firstPacket.append(header)
                        firstPacket.append(frame)
                        try await stt.sendAudioFrame(firstPacket)
                        sentWAVHeader = true
                    } else {
                        try await stt.sendAudioFrame(frame)
                    }
                } catch {
                    await self?.handleStreamingFailure(error)
                    return
                }
            }
        }
    }

    private func startLevelPump(stream: AsyncStream<Float>) {
        levelTask?.cancel()

        levelTask = Task { [weak self] in
            var lastSampleTime: Date?

            for await level in stream {
                await self?.noteAudioLevelObservation()
                let now = Date()
                let elapsed = max(0, now.timeIntervalSince(lastSampleTime ?? now))
                lastSampleTime = now

                await self?.ingestLevel(level: level, elapsed: elapsed)
            }
        }
    }

    private func startNoSignalWatchdog() {
        signalWatchdogTask?.cancel()
        signalWatchdogTask = Task { [weak self] in
            guard let self else { return }
            try? await Task.sleep(nanoseconds: self.noSignalWatchdogNanoseconds)
            await self.failIfNoSignal()
        }
    }

    private func noteAudioLevelObservation() {
        if hasObservedAudioLevel {
            return
        }

        hasObservedAudioLevel = true
        signalWatchdogTask?.cancel()
        signalWatchdogTask = nil

        Task { [weak self] in
            await self?.logEvent(stage: "audio", message: "audio level stream active")
        }
    }

    private func noteAudioFrameSent() {
        if hasSentAudioFrame {
            return
        }

        hasSentAudioFrame = true
        signalWatchdogTask?.cancel()
        signalWatchdogTask = nil

        Task { [weak self] in
            await self?.logEvent(stage: "audio", message: "audio frame stream active")
        }
    }

    private func failIfNoSignal() async {
        guard session.state == .recording, !isCancelling, !hasObservedAudioLevel, !hasSentAudioFrame else {
            return
        }

        await finishWithFailureMessage(
            "No microphone signal detected. Choose Input Microphone in the menu and retry."
        )
    }

    private func startFixturePump(fixtureURL: URL) {
        fixtureTask?.cancel()
        let stt = sttStreaming
        let chunkDelay = fixtureChunkDelayNanoseconds

        fixtureTask = Task { [weak self] in
            guard let self else {
                return
            }

            do {
                let fixtureData = try Data(contentsOf: fixtureURL)
                var offset = 0
                var chunkIndex = 0

                while offset < fixtureData.count && !Task.isCancelled {
                    let end = min(offset + self.fixtureChunkSize, fixtureData.count)
                    let chunk = Data(fixtureData[offset..<end])
                    try await stt.sendAudioFrame(chunk)

                    let level = Self.fixtureLevel(for: chunk, chunkIndex: chunkIndex)
                    await self.ingestLevel(
                        level: level,
                        elapsed: Double(chunkDelay) / 1_000_000_000
                    )

                    offset = end
                    chunkIndex += 1
                    try await Task.sleep(nanoseconds: chunkDelay)
                }

                await self.injectTrailingSilenceAfterFixture()
            } catch is CancellationError {
                return
            } catch {
                await self.handleStreamingFailure(error)
            }
        }
    }

    private func ingestLevel(level: Float, elapsed: Double) async {
        guard session.state == .recording else {
            return
        }

        hudPresenter.update(level: level)

        let update = silenceDetector.ingest(level: level, elapsed: elapsed)
        if update.didEndUtterance {
            await finalizeAfterSilence()
        }
    }

    private func handleTranscriptEvent(_ event: STTTranscriptEvent) {
        guard session.state == .recording || session.state == .finalizing else {
            return
        }

        switch event {
        case .partial(let transcript):
            guard !transcript.isEmpty else { return }
            let fullPartial = accumulatedFinalSegments.isEmpty ? transcript : accumulatedFinalSegments.joined(separator: " ") + " " + transcript
            latestPartialTranscript = fullPartial
            lastTranscriptEventTime = Date()
            hudPresenter.update(state: session.state, transcript: fullPartial)
        case .final(let transcript):
            accumulatedFinalSegments.append(transcript)
            latestFinalTranscript = accumulatedFinalSegments.joined(separator: " ")
            lastTranscriptEventTime = Date()
            hudPresenter.update(state: session.state, transcript: latestFinalTranscript)
            Task { [weak self] in
                await self?.logEvent(stage: "transcript_final", message: "received final transcript", transcript: transcript)
            }
        }
    }

    private func finalizeAfterSilence() async {
        await finalize(reason: "silence detected; finalizing", deferForRecentTranscript: true)
    }

    private func finalize(reason: String, deferForRecentTranscript: Bool) async {
        guard session.state == .recording else {
            return
        }

        // If we received a transcript event within the last 3 seconds,
        // Deepgram is still actively processing speech — don't finalize yet.
        // The silence detector will fire again on the next silent audio chunk.
        if deferForRecentTranscript,
           let lastEvent = lastTranscriptEventTime,
           Date().timeIntervalSince(lastEvent) < 3.0 {
            // Reset silence accumulation so it needs another full 5s of silence.
            silenceDetector.reset()
            silenceDetector.hasDetectedSpeech = true
            return
        }

        guard session.handle(.beginFinalizing) else {
            return
        }

        await logEvent(stage: "finalizing", message: reason)
        hudPresenter.update(state: .finalizing, transcript: preferredTranscript())

        audioCapture.stop()
        frameTask?.cancel()
        frameTask = nil
        levelTask?.cancel()
        levelTask = nil
        fixtureTask?.cancel()
        fixtureTask = nil

        do {
            try await sttStreaming.finishAudio()
        } catch {
            await handleStreamingFailure(error)
            return
        }

        await waitForFinalTranscriptIfNeeded()

        isStoppingPipelines = true
        await sttStreaming.disconnect()
        transcriptTask?.cancel()
        transcriptTask = nil
        isStoppingPipelines = false

        guard session.state == .finalizing else {
            return
        }

        if isCancelling {
            hudPresenter.hide()
            resetRuntimeState()
            currentSessionID = nil
            notifyIdleWaiters()
            return
        }

        var text = preferredTranscript()
        guard !text.isEmpty else {
            await finishWithFailureMessage("No transcript received. Nothing was pasted.")
            return
        }

        // LLM cleanup: send raw transcript through Telnyx LLM API to fix
        // capitalization, punctuation, and phrasing before pasting.
        if llmCleanupEnabled, let cleaner = llmCleaner {
            hudPresenter.update(state: .finalizing, transcript: text + "\n(Cleaning up...)")
            await logEvent(stage: "llm_cleanup_start", message: "sending transcript to LLM for cleanup", transcript: text)
            do {
                let cleaned = try await cleaner.clean(text)
                await logEvent(stage: "llm_cleanup_done", message: "LLM cleanup succeeded", transcript: cleaned)
                text = cleaned
            } catch {
                // LLM cleanup is best-effort; fall back to raw transcript on failure.
                await logEvent(stage: "llm_cleanup_failed", message: "LLM cleanup failed: \(error), using raw transcript")
            }
        }

        guard session.handle(.beginPasting) else {
            _ = session.handle(.cancel)
            hudPresenter.hide()
            resetRuntimeState()
            notifyIdleWaiters()
            return
        }

        hudPresenter.update(state: .pasting, transcript: text)
        let accessibilityTrusted = accessibilityTrustChecker()
        await logEvent(
            stage: "paste_attempt",
            message: accessibilityTrusted ? "attempting cmd+v insertion" : "accessibility denied; clipboard-only",
            transcript: text,
            accessibilityTrusted: accessibilityTrusted
        )
        if !accessibilityTrusted {
            hudPresenter.update(
                state: .pasting,
                transcript: "Copied to clipboard only. Enable Accessibility in System Settings -> Privacy & Security -> Accessibility for auto-paste."
            )
        }

        do {
            try textInserter.insert(text)
            hudPresenter.update(
                state: .pasting,
                transcript: accessibilityTrusted
                    ? "Pasted into active app."
                    : "Copied to clipboard only (Accessibility denied)."
            )
            _ = session.handle(.complete)
        } catch {
            await handleInsertionFailure()
            return
        }

        await recordSessionResult(
            accessibilityTrusted ? "pasted" : "clipboard-only",
            transcript: text
        )
        await showFeedbackDelayIfNeeded()

        hudPresenter.hide()
        resetRuntimeState()
        currentSessionID = nil
        notifyIdleWaiters()
    }

    private func waitForFinalTranscriptIfNeeded() async {
        if !latestFinalTranscript.isEmpty {
            return
        }

        var waitedNanoseconds: UInt64 = 0

        while latestFinalTranscript.isEmpty,
              waitedNanoseconds < finalTranscriptWaitNanoseconds,
              !isCancelling,
              session.state == .finalizing {
            try? await Task.sleep(nanoseconds: finalTranscriptPollNanoseconds)
            waitedNanoseconds += finalTranscriptPollNanoseconds
        }
    }

    private func injectTrailingSilenceAfterFixture() async {
        guard session.state == .recording else {
            return
        }

        // Clear transcript timestamp so the silence guard in finalizeAfterSilence
        // doesn't block fixture-driven finalization.
        lastTranscriptEventTime = nil
        let stepSeconds = max(0.05, Double(fixtureChunkDelayNanoseconds) / 1_000_000_000)
        let requiredDuration = silenceDetector.requiredSilenceDuration + stepSeconds
        var accumulated = 0.0

        while accumulated < requiredDuration,
              session.state == .recording,
              !isCancelling {
            await ingestLevel(level: 0, elapsed: stepSeconds)
            accumulated += stepSeconds

            if session.state != .recording {
                break
            }

            try? await Task.sleep(nanoseconds: UInt64(stepSeconds * 1_000_000_000))
        }
    }

    private func stopPipelines() async {
        isStoppingPipelines = true
        defer { isStoppingPipelines = false }

        audioCapture.stop()

        frameTask?.cancel()
        frameTask = nil

        levelTask?.cancel()
        levelTask = nil

        fixtureTask?.cancel()
        fixtureTask = nil

        signalWatchdogTask?.cancel()
        signalWatchdogTask = nil

        transcriptTask?.cancel()
        transcriptTask = nil

        await sttStreaming.disconnect()
    }

    private func handleStartFailure(_ error: Error) async {
        if let sttError = error as? TelnyxSTTError {
            switch sttError {
            case .missingAPIKey:
                await finishWithFailureMessage("Missing TELNYX_API_KEY. Set it, then try dictation again.")
                return
            case .invalidURL:
                await finishWithFailureMessage("Speech service configuration is invalid. Check endpoint settings.")
                return
            case .notConnected:
                await finishWithFailureMessage("Speech service is not connected. Check network and retry.")
                return
            }
        }

        await finishWithFailureMessage("Unable to start dictation. Check microphone and network access, then retry.")
    }

    private func handleTranscriptStreamEndedUnexpectedly() async {
        await handleStreamingFailure(nil)
    }

    private func handleStreamingFailure(_ error: (any Error)?) async {
        guard !isCancelling, !isStoppingPipelines else {
            return
        }

        guard session.state == .recording || session.state == .finalizing else {
            return
        }

        if let sttError = error as? TelnyxSTTError, sttError == .notConnected {
            await finishWithFailureMessage("Speech stream disconnected. Capture stopped and nothing was pasted.")
            return
        }

        await finishWithFailureMessage("Speech service failed. Capture stopped and nothing was pasted.")
    }

    private func handleInsertionFailure() async {
        await logEvent(stage: "paste_failed", message: "failed to insert text into active app")
        await finishWithFailureMessage("Failed to insert text into the active app. Text remains on clipboard.")
    }

    private func finishWithFailureMessage(_ message: String) async {
        if session.state != .idle {
            _ = session.handle(.cancel)
        }

        await stopPipelines()
        hudPresenter.update(state: .idle, transcript: message)
        await logEvent(stage: "failed", message: message)
        await recordSessionResult("failed", transcript: preferredTranscript().isEmpty ? nil : preferredTranscript())
        await showFeedbackDelayIfNeeded()
        hudPresenter.hide()
        resetRuntimeState()
        currentSessionID = nil
        notifyIdleWaiters()
    }

    private func showFeedbackDelayIfNeeded() async {
        guard feedbackDisplayNanoseconds > 0 else {
            return
        }

        try? await Task.sleep(nanoseconds: feedbackDisplayNanoseconds)
    }

    private func resetRuntimeState() {
        silenceDetector.reset()
        latestPartialTranscript = ""
        latestFinalTranscript = ""
        accumulatedFinalSegments = []
        lastTranscriptEventTime = nil
        isCancelling = false
        hasObservedAudioLevel = false
        hasSentAudioFrame = false
        signalWatchdogTask?.cancel()
        signalWatchdogTask = nil
        hasRecordedSessionResult = false
        hudPresenter.updateRecentSessions(recentSessionEntries)
    }

    private func notifyIdleWaiters() {
        let waiters = idleWaiters
        idleWaiters.removeAll(keepingCapacity: false)
        for waiter in waiters {
            waiter.resume()
        }
    }

    private func preferredTranscript() -> String {
        let raw = latestFinalTranscript.isEmpty ? latestPartialTranscript : latestFinalTranscript
        return raw.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    nonisolated private static func fixtureLevel(for chunk: Data, chunkIndex: Int) -> Float {
        if chunkIndex == 0, chunk.count > 44 {
            return AudioMath.rmsLevel(pcm16Data: Data(chunk.dropFirst(44)))
        }

        return AudioMath.rmsLevel(pcm16Data: chunk)
    }

    nonisolated private static func streamingWAVHeader(
        sampleRate: Int,
        channels: Int,
        bitsPerSample: Int
    ) -> Data {
        let byteRate = UInt32(sampleRate * channels * bitsPerSample / 8)
        let blockAlign = UInt16(channels * bitsPerSample / 8)
        let declaredDataSize = UInt32.max
        let riffChunkSize = UInt32.max

        var data = Data(capacity: 44)
        data.append("RIFF".data(using: .ascii)!)
        data.append(contentsOf: withUnsafeBytes(of: riffChunkSize.littleEndian, Array.init))
        data.append("WAVE".data(using: .ascii)!)
        data.append("fmt ".data(using: .ascii)!)

        let fmtChunkSize: UInt32 = 16
        let audioFormatPCM: UInt16 = 1
        let channelCount = UInt16(channels)
        let sampleRateU32 = UInt32(sampleRate)
        let bits = UInt16(bitsPerSample)

        data.append(contentsOf: withUnsafeBytes(of: fmtChunkSize.littleEndian, Array.init))
        data.append(contentsOf: withUnsafeBytes(of: audioFormatPCM.littleEndian, Array.init))
        data.append(contentsOf: withUnsafeBytes(of: channelCount.littleEndian, Array.init))
        data.append(contentsOf: withUnsafeBytes(of: sampleRateU32.littleEndian, Array.init))
        data.append(contentsOf: withUnsafeBytes(of: byteRate.littleEndian, Array.init))
        data.append(contentsOf: withUnsafeBytes(of: blockAlign.littleEndian, Array.init))
        data.append(contentsOf: withUnsafeBytes(of: bits.littleEndian, Array.init))

        data.append("data".data(using: .ascii)!)
        data.append(contentsOf: withUnsafeBytes(of: declaredDataSize.littleEndian, Array.init))
        return data
    }

    private func recordSessionResult(_ result: String, transcript: String?) async {
        guard let sessionID = currentSessionID, !hasRecordedSessionResult else {
            return
        }

        hasRecordedSessionResult = true

        let entry = RecentSessionEntry(
            sessionID: sessionID.uuidString,
            timestamp: Date(),
            result: result,
            transcript: transcript
        )

        recentSessionEntries.insert(entry, at: 0)
        if recentSessionEntries.count > 10 {
            recentSessionEntries = Array(recentSessionEntries.prefix(10))
        }
        hudPresenter.updateRecentSessions(recentSessionEntries)

        await logEvent(stage: "session_result", message: result, transcript: transcript)
    }

    private func logEvent(
        stage: String,
        message: String,
        transcript: String? = nil,
        accessibilityTrusted: Bool? = nil
    ) async {
        guard let sessionID = currentSessionID else {
            return
        }

        await sessionLogger.append(
            DictationSessionLogEntry(
                sessionID: sessionID.uuidString,
                timestamp: Self.currentTimestamp(),
                stage: stage,
                message: message,
                transcript: transcript,
                accessibilityTrusted: accessibilityTrusted,
                error: nil
            )
        )
    }

    nonisolated private static func currentTimestamp() -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.string(from: Date())
    }
}
