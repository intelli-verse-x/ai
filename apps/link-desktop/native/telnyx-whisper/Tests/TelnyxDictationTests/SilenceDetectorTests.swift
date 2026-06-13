import Testing
@testable import TelnyxDictationLib

@Suite("SilenceDetector Tests")
struct SilenceDetectorTests {

    @Test("No utterance end before first speech")
    func noUtteranceEndBeforeFirstSpeech() {
        var detector = SilenceDetector(speechThreshold: 0.5, requiredSilenceDuration: 3.0)

        let first = detector.ingest(level: 0.1, elapsed: 10.0)
        let second = detector.ingest(level: 0.2, elapsed: 10.0)

        #expect(!first.didStartSpeech)
        #expect(!first.didEndUtterance)
        #expect(!second.didStartSpeech)
        #expect(!second.didEndUtterance)
        #expect(!detector.hasDetectedSpeech)
        #expect(detector.trailingSilenceDuration == 0)
    }

    @Test("Short pauses do not end utterance")
    func shortPausesDoNotEndUtterance() {
        var detector = SilenceDetector(speechThreshold: 0.5, requiredSilenceDuration: 3.0)

        let started = detector.ingest(level: 0.7, elapsed: 0.1)
        let pause = detector.ingest(level: 0.1, elapsed: 2.9)

        #expect(started.didStartSpeech)
        #expect(!started.didEndUtterance)
        #expect(!pause.didEndUtterance)
        #expect(detector.hasDetectedSpeech)
        #expect(detector.trailingSilenceDuration >= 2.9)
        #expect(detector.trailingSilenceDuration < 3.0)
    }

    @Test("Three seconds of silence after speech ends utterance")
    func threeSecondsOfSilenceAfterSpeechEndsUtterance() {
        var detector = SilenceDetector(speechThreshold: 0.5, requiredSilenceDuration: 3.0)

        _ = detector.ingest(level: 0.8, elapsed: 0.1)
        let ended = detector.ingest(level: 0.1, elapsed: 3.0)

        #expect(!ended.didStartSpeech)
        #expect(ended.didEndUtterance)
        #expect(!detector.hasDetectedSpeech)
        #expect(detector.trailingSilenceDuration == 0)
    }

    @Test("Speech resets trailing silence accumulation")
    func speechResetsTrailingSilenceAccumulation() {
        var detector = SilenceDetector(speechThreshold: 0.5, requiredSilenceDuration: 3.0)

        _ = detector.ingest(level: 0.9, elapsed: 0.1)
        _ = detector.ingest(level: 0.1, elapsed: 2.5)
        let resumed = detector.ingest(level: 0.9, elapsed: 0.1)
        let notEndedYet = detector.ingest(level: 0.1, elapsed: 2.0)

        #expect(!resumed.didStartSpeech)
        #expect(detector.trailingSilenceDuration >= 2.0)
        #expect(detector.hasDetectedSpeech)
        #expect(!notEndedYet.didEndUtterance)

        let ended = detector.ingest(level: 0.1, elapsed: 1.0)
        #expect(ended.didEndUtterance)
        #expect(!detector.hasDetectedSpeech)
    }

    @Test("Threshold boundary controls speech detection for background noise")
    func thresholdBoundaryControlsSpeechDetectionForBackgroundNoise() {
        var detector = SilenceDetector(speechThreshold: 0.5, requiredSilenceDuration: 3.0)

        let noise = detector.ingest(level: 0.49, elapsed: 5.0)
        let boundarySpeech = detector.ingest(level: 0.5, elapsed: 0.1)
        let ended = detector.ingest(level: 0.49, elapsed: 3.0)

        #expect(!noise.didStartSpeech)
        #expect(!noise.didEndUtterance)
        #expect(boundarySpeech.didStartSpeech)
        #expect(ended.didEndUtterance)
    }

    @Test("Detector supports utterance segmentation across cycles")
    func detectorSupportsUtteranceSegmentationAcrossCycles() {
        var detector = SilenceDetector(speechThreshold: 0.5, requiredSilenceDuration: 3.0)

        let firstStart = detector.ingest(level: 0.8, elapsed: 0.1)
        let firstEnd = detector.ingest(level: 0.1, elapsed: 3.0)
        let secondStart = detector.ingest(level: 0.8, elapsed: 0.1)

        #expect(firstStart.didStartSpeech)
        #expect(firstEnd.didEndUtterance)
        #expect(secondStart.didStartSpeech)
        #expect(!secondStart.didEndUtterance)
    }
}
