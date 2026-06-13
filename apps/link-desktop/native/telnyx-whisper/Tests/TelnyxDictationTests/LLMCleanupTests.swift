import Foundation
import Testing
@testable import TelnyxDictationLib

@Suite("LLMCleanup Tests")
struct LLMCleanupTests {

    @Test("Fixture dictation applies LLM cleanup before pasting")
    func fixtureDictationAppliesLLMCleanup() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCaptureForLLM()
        let sttStreaming = MockSTTStreamingForLLM(
            eventsOnConnect: [
                .partial("hello from"),
                .final("hello from telnyx"),
            ]
        )
        let hudPresenter = MockHUDPresenterForLLM()
        let textInserter = MockTextInserterForLLM()
        let llmCleaner = MockLLMCleaner(result: "Hello from Telnyx.")

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 0.30),
            llmCleaner: llmCleaner,
            llmCleanupEnabled: true,
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        // Verify the LLM cleaner was called with the raw transcript
        #expect(llmCleaner.cleanedInputs == ["hello from telnyx"])

        // Verify the pasted text is the LLM-cleaned version
        #expect(textInserter.insertedTexts == ["Hello from Telnyx."])
    }

    @Test("Disabled LLM cleanup pastes raw transcript")
    func disabledLLMCleanupPastesRawTranscript() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCaptureForLLM()
        let sttStreaming = MockSTTStreamingForLLM(
            eventsOnConnect: [
                .final("hello from telnyx"),
            ]
        )
        let hudPresenter = MockHUDPresenterForLLM()
        let textInserter = MockTextInserterForLLM()
        let llmCleaner = MockLLMCleaner(result: "Hello from Telnyx.")

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 0.30),
            llmCleaner: llmCleaner,
            llmCleanupEnabled: false,
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        // LLM cleaner should NOT have been called
        #expect(llmCleaner.cleanedInputs.isEmpty)

        // Raw transcript should be pasted
        #expect(textInserter.insertedTexts == ["hello from telnyx"])
    }

    @Test("LLM cleanup failure falls back to raw transcript")
    func llmCleanupFailureFallsBackToRawTranscript() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCaptureForLLM()
        let sttStreaming = MockSTTStreamingForLLM(
            eventsOnConnect: [
                .final("hello from telnyx"),
            ]
        )
        let hudPresenter = MockHUDPresenterForLLM()
        let textInserter = MockTextInserterForLLM()
        let llmCleaner = MockLLMCleaner(error: LLMCleanupError.networkError("timeout"))

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 0.30),
            llmCleaner: llmCleaner,
            llmCleanupEnabled: true,
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        // LLM cleaner was attempted
        #expect(llmCleaner.cleanedInputs == ["hello from telnyx"])

        // Raw transcript should be pasted as fallback
        #expect(textInserter.insertedTexts == ["hello from telnyx"])
    }

    @Test("Toggle LLM cleanup enabled/disabled at runtime")
    func toggleLLMCleanupAtRuntime() async {
        let coordinator = DictationCoordinator(
            audioCapture: MockAudioCaptureForLLM(),
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: MockSTTStreamingForLLM(eventsOnConnect: []),
            hudPresenter: MockHUDPresenterForLLM(),
            textInserter: MockTextInserterForLLM(),
            llmCleanupEnabled: true,
            feedbackDisplayNanoseconds: 0
        )

        var enabled = await coordinator.isLLMCleanupEnabled()
        #expect(enabled == true)

        await coordinator.setLLMCleanupEnabled(false)
        enabled = await coordinator.isLLMCleanupEnabled()
        #expect(enabled == false)

        await coordinator.setLLMCleanupEnabled(true)
        enabled = await coordinator.isLLMCleanupEnabled()
        #expect(enabled == true)
    }

    // MARK: - Helpers

    private func fixtureFileURL() throws -> URL {
        let packageRoot = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        let fixtureURL = packageRoot.appendingPathComponent("Fixtures/hello-from-telnyx.wav")

        guard FileManager.default.fileExists(atPath: fixtureURL.path) else {
            throw LLMTestFixtureError.missingFixture(fixtureURL.path)
        }

        return fixtureURL
    }
}

// MARK: - Test Doubles

private enum LLMTestFixtureError: Error {
    case missingFixture(String)
}

private final class MockLLMCleaner: LLMCleaning, @unchecked Sendable {
    private let lock = NSLock()
    private let result: String?
    private let error: Error?
    private var _cleanedInputs: [String] = []

    var cleanedInputs: [String] {
        lock.lock()
        defer { lock.unlock() }
        return _cleanedInputs
    }

    init(result: String? = nil, error: Error? = nil) {
        self.result = result
        self.error = error
    }

    func clean(_ transcript: String) async throws -> String {
        lock.lock()
        _cleanedInputs.append(transcript)
        lock.unlock()

        if let error {
            throw error
        }

        return result ?? transcript
    }
}

private final class MockAudioCaptureForLLM: AudioCapturing, @unchecked Sendable {
    private let stream: AsyncStream<Data>
    private let continuation: AsyncStream<Data>.Continuation

    init() {
        var cont: AsyncStream<Data>.Continuation!
        stream = AsyncStream { continuation in
            cont = continuation
        }
        continuation = cont
    }

    var pcmFrames: AsyncStream<Data> { stream }
    func start() throws {}
    func stop() { continuation.finish() }
}

private final class MockSTTStreamingForLLM: STTStreaming, @unchecked Sendable {
    let transcriptEvents: AsyncStream<STTTranscriptEvent>
    private let continuation: AsyncStream<STTTranscriptEvent>.Continuation
    private let eventsOnConnect: [STTTranscriptEvent]

    init(eventsOnConnect: [STTTranscriptEvent]) {
        self.eventsOnConnect = eventsOnConnect
        var cont: AsyncStream<STTTranscriptEvent>.Continuation!
        transcriptEvents = AsyncStream { continuation in
            cont = continuation
        }
        self.continuation = cont
    }

    func connect() async throws {
        Task { [continuation, eventsOnConnect] in
            for event in eventsOnConnect {
                continuation.yield(event)
                try? await Task.sleep(nanoseconds: 5_000_000)
            }
        }
    }

    func sendAudioFrame(_ frame: Data) async throws {}

    func disconnect() async {
        continuation.finish()
    }
}

private final class MockHUDPresenterForLLM: HUDPresenting, @unchecked Sendable {
    func update(state: DictationSession.State, transcript: String?) {}
    func update(level: Float) {}
    func hide() {}
    func updateRecentSessions(_ sessions: [RecentSessionEntry]) {}
}

private final class MockTextInserterForLLM: TextInserting, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var insertedTexts: [String] = []

    func insert(_ text: String) throws {
        lock.lock()
        insertedTexts.append(text)
        lock.unlock()
    }
}
