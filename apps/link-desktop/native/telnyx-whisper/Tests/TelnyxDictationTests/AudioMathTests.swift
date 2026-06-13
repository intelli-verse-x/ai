import Testing
import AVFoundation  // re-exports Foundation (Data) without triggering _Testing_Foundation
@testable import TelnyxDictationLib

@Suite("AudioMath Tests")
struct AudioMathTests {

    // MARK: - rmsLevel

    @Test("Empty data returns 0")
    func rmsEmptyData() {
        #expect(AudioMath.rmsLevel(pcm16Data: Data()) == 0)
    }

    @Test("Single byte (incomplete sample) returns 0")
    func rmsSingleByte() {
        #expect(AudioMath.rmsLevel(pcm16Data: Data([0x42])) == 0)
    }

    @Test("All-zero samples (silence) returns 0")
    func rmsSilence() {
        // 4 zero samples = 8 bytes of 0x00
        let silence = Data(repeating: 0, count: 8)
        #expect(AudioMath.rmsLevel(pcm16Data: silence) == 0)
    }

    @Test("Full-scale positive yields RMS ≈ 1.0")
    func rmsFullScale() {
        // Int16.max = 32767 → 0xFF7F little-endian
        var samples = Data()
        for _ in 0..<100 {
            var value = Int16.max
            withUnsafeBytes(of: &value) { samples.append(contentsOf: $0) }
        }
        let rms = AudioMath.rmsLevel(pcm16Data: samples)
        // Should be very close to 1.0 (32767/32767)
        #expect(rms > 0.99)
        #expect(rms <= 1.0)
    }

    @Test("Full-scale negative yields RMS ≈ 1.0")
    func rmsFullScaleNegative() {
        // Int16.min = -32768, normalised = -32768/32767 ≈ -1.000031
        var samples = Data()
        for _ in 0..<100 {
            var value = Int16.min
            withUnsafeBytes(of: &value) { samples.append(contentsOf: $0) }
        }
        let rms = AudioMath.rmsLevel(pcm16Data: samples)
        #expect(rms > 0.99)
    }

    @Test("Known pattern gives correct RMS")
    func rmsKnownPattern() {
        // Two samples: +16384 and -16384
        // Normalised: +0.5000… and -0.5000…
        // RMS = sqrt((0.5^2 + 0.5^2) / 2) = 0.5
        var samples = Data()
        var pos: Int16 = 16384
        var neg: Int16 = -16384
        withUnsafeBytes(of: &pos) { samples.append(contentsOf: $0) }
        withUnsafeBytes(of: &neg) { samples.append(contentsOf: $0) }

        let rms = AudioMath.rmsLevel(pcm16Data: samples)
        // 16384/32767 ≈ 0.50002 → RMS ≈ 0.50002
        let expected: Float = Float(16384) / Float(Int16.max)
        #expect(abs(rms - expected) < 0.001)
    }

    // MARK: - dbFS

    @Test("Silence gives -infinity dBFS")
    func dbfsSilence() {
        let db = AudioMath.dbFS(rms: 0)
        #expect(db == -.infinity)
    }

    @Test("Full scale gives 0 dBFS")
    func dbfsFullScale() {
        let db = AudioMath.dbFS(rms: 1.0)
        #expect(abs(db) < 0.001)
    }

    @Test("Half amplitude gives ≈ -6 dBFS")
    func dbfsHalfAmplitude() {
        let db = AudioMath.dbFS(rms: 0.5)
        // 20 * log10(0.5) ≈ -6.0206
        #expect(abs(db - (-6.0206)) < 0.01)
    }

    // MARK: - hudLevel

    @Test("Silence maps to 0")
    func hudLevelSilence() {
        let level = AudioMath.hudLevel(rms: 0)
        #expect(level == 0)
    }

    @Test("Full scale maps to 10")
    func hudLevelFullScale() {
        let level = AudioMath.hudLevel(rms: 1.0)
        #expect(abs(level - 10.0) < 0.001)
    }

    @Test("Mid-range RMS maps proportionally")
    func hudLevelMidRange() {
        // rms=0.001 → dBFS = -60 → hudLevel = 0
        let low = AudioMath.hudLevel(rms: 0.001)
        #expect(abs(low) < 0.1)

        // rms=0.5 → dBFS ≈ -6.02 → hudLevel ≈ (54/60)*10 = 9.0
        let mid = AudioMath.hudLevel(rms: 0.5)
        #expect(mid > 8.5 && mid < 9.5)
    }
}
