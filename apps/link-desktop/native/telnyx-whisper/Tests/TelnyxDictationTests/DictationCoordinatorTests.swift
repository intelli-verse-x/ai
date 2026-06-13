import Testing
import AVFoundation
@testable import TelnyxDictationLib

@Suite("DictationCoordinator Tests")
struct DictationCoordinatorTests {

    @Test("Fixture dictation finalizes and pastes final transcript")
    func fixtureDictationFinalizesAndPastesFinalTranscript() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(
            eventsOnConnect: [
                .partial("hello from"),
                .final("hello from telnyx"),
            ]
        )
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 0.30),
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        #expect(sttStreaming.connectCallCount == 1)
        #expect(sttStreaming.disconnectCallCount == 1)
        #expect(sttStreaming.sentFramesCount > 0)
        #expect(textInserter.insertedTexts == ["hello from telnyx"])

        let states = hudPresenter.recordedStates
        #expect(states.contains(.recording))
        #expect(states.contains(.finalizing))
        #expect(states.contains(.pasting))
        #expect(hudPresenter.hideCallCount == 1)
        #expect(
            hudPresenter.latestRecentSessions.contains {
                $0.result.contains("pasted")
            }
        )

        let state = await coordinator.currentState()
        #expect(state == .idle)
    }

    @Test("Cancel path stops and dismisses without paste")
    func cancelPathStopsAndDismissesWithoutPaste() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(eventsOnConnect: [.partial("hello")])
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 3.0),
            fixtureChunkDelayNanoseconds: 50_000_000,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        let cancelled = await coordinator.cancelDictation()
        #expect(cancelled)

        await coordinator.waitForIdle()

        #expect(textInserter.insertedTexts.isEmpty)
        #expect(hudPresenter.hideCallCount == 1)
        #expect(sttStreaming.disconnectCallCount >= 1)

        let state = await coordinator.currentState()
        #expect(state == .idle)
    }

    @Test("Finish path finalizes and pastes without waiting for silence")
    func finishPathFinalizesAndPastesWithoutWaitingForSilence() async throws {
        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(
            eventsOnConnect: [
                .partial("hold fn"),
                .final("hold fn to dictate"),
            ]
        )
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { _ in } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0,
            noSignalWatchdogNanoseconds: 5_000_000_000
        )

        let started = await coordinator.startDictation()
        #expect(started)

        try? await Task.sleep(nanoseconds: 25_000_000)
        let finished = await coordinator.finishDictation()
        #expect(finished)

        await coordinator.waitForIdle()

        #expect(audioCapture.stopCallCount >= 1)
        #expect(sttStreaming.disconnectCallCount == 1)
        #expect(textInserter.insertedTexts == ["hold fn to dictate"])
        #expect(hudPresenter.recordedStates.contains(.finalizing))
        #expect(hudPresenter.recordedStates.contains(.pasting))

        let state = await coordinator.currentState()
        #expect(state == .idle)
    }

    @Test("Start failure shows HUD error and stays idle")
    func startFailureShowsHUDErrorAndStaysIdle() async {
        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(
            eventsOnConnect: [],
            connectError: MockStreamingError.connectFailed
        )
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startDictation()
        #expect(!started)

        let state = await coordinator.currentState()
        #expect(state == .idle)
        #expect(audioCapture.startCallCount == 0)
        #expect(sttStreaming.connectCallCount == 1)
        #expect(sttStreaming.sentFramesCount == 0)
        #expect(sttStreaming.disconnectCallCount == 1)
        #expect(textInserter.insertedTexts.isEmpty)
        #expect(hudPresenter.recordedStates.contains(.recording))
        #expect(hudPresenter.recordedStates.contains(.idle))
        #expect(
            hudPresenter.recordedTranscripts.contains {
                $0.contains("Unable to start dictation")
            }
        )
    }

    @Test("Streaming failure stops capture and does not paste")
    func streamingFailureStopsCaptureAndDoesNotPaste() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(
            eventsOnConnect: [.partial("hello")],
            sendErrorFrameThreshold: 1
        )
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 1.0),
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 100_000_000,
            finalTranscriptPollNanoseconds: 5_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        #expect(audioCapture.stopCallCount >= 1)
        #expect(sttStreaming.connectCallCount == 1)
        #expect(sttStreaming.disconnectCallCount >= 1)
        #expect(textInserter.insertedTexts.isEmpty)
        #expect(hudPresenter.recordedStates.contains(.idle))
        #expect(
            hudPresenter.recordedTranscripts.contains {
                $0.contains("nothing was pasted")
            }
        )

        let state = await coordinator.currentState()
        #expect(state == .idle)
    }

    @Test("Accessibility denied keeps clipboard-only path explicit in HUD")
    func accessibilityDeniedKeepsClipboardOnlyPathExplicitInHUD() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(
            eventsOnConnect: [
                .partial("clipboard"),
                .final("clipboard only"),
            ]
        )
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            accessibilityTrustChecker: { false },
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 0.30),
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 500_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        #expect(sttStreaming.connectCallCount == 1)
        #expect(sttStreaming.disconnectCallCount == 1)
        #expect(textInserter.insertedTexts == ["clipboard only"])
        #expect(hudPresenter.recordedStates.contains(.pasting))
        #expect(
            hudPresenter.recordedTranscripts.contains {
                $0.contains("Copied to clipboard only")
            }
        )
        #expect(
            hudPresenter.latestRecentSessions.contains {
                $0.result.contains("clipboard-only")
            }
        )
    }

    @Test("Empty transcript reports explicit no-paste reason")
    func emptyTranscriptReportsExplicitNoPasteReason() async throws {
        let fixtureURL = try fixtureFileURL()

        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(eventsOnConnect: [])
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            silenceDetector: SilenceDetector(speechThreshold: 0.0001, requiredSilenceDuration: 0.30),
            fixtureChunkDelayNanoseconds: 5_000_000,
            finalTranscriptWaitNanoseconds: 50_000_000,
            finalTranscriptPollNanoseconds: 10_000_000,
            feedbackDisplayNanoseconds: 0
        )

        let started = await coordinator.startFixtureDictation(fixtureURL: fixtureURL)
        #expect(started)

        await coordinator.waitForIdle()

        #expect(textInserter.insertedTexts.isEmpty)
        #expect(
            hudPresenter.recordedTranscripts.contains {
                $0.contains("No transcript received")
            }
        )
        #expect(
            hudPresenter.latestRecentSessions.contains {
                $0.result.contains("failed")
            }
        )
    }

    @Test("No microphone signal shows explicit input-device guidance")
    func noMicrophoneSignalShowsGuidance() async {
        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(eventsOnConnect: [])
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { _ in } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            feedbackDisplayNanoseconds: 0,
            noSignalWatchdogNanoseconds: 20_000_000
        )

        let started = await coordinator.startDictation()
        #expect(started)

        await coordinator.waitForIdle()

        #expect(
            hudPresenter.recordedTranscripts.contains {
                $0.contains("No microphone signal detected")
            }
        )
        #expect(
            hudPresenter.latestRecentSessions.contains {
                $0.result.contains("failed")
            }
        )
    }


    @Test("Concurrent startDictation calls succeed at most once (actor reentrancy guard)")
    func concurrentStartDictationOnlySucceedsOnce() async {
        let audioCapture = MockAudioCapture()
        let sttStreaming = MockSTTStreaming(eventsOnConnect: [.final("concurrent test")])
        let hudPresenter = MockHUDPresenter()
        let textInserter = MockTextInserter()

        let coordinator = DictationCoordinator(
            audioCapture: audioCapture,
            audioLevels: { AsyncStream { $0.finish() } },
            sttStreaming: sttStreaming,
            hudPresenter: hudPresenter,
            textInserter: textInserter,
            feedbackDisplayNanoseconds: 0,
            noSignalWatchdogNanoseconds: 50_000_000
        )

        // Fire 10 concurrent startDictation() calls.
        // Only one should succeed; the rest should see .recording and bail.
        let results = await withTaskGroup(of: Bool.self, returning: [Bool].self) { group in
            for _ in 0..<10 {
                group.addTask {
                    await coordinator.startDictation()
                }
            }
            var collected: [Bool] = []
            for await result in group {
                collected.append(result)
            }
            return collected
        }

        let successCount = results.filter { $0 }.count
        #expect(successCount == 1, "Expected exactly 1 successful start, got \(successCount)")
        #expect(sttStreaming.connectCallCount == 1, "Expected 1 connect call, got \(sttStreaming.connectCallCount)")

        // Cleanup
        _ = await coordinator.cancelDictation()
    }

    private func fixtureFileURL() throws -> URL {
        let packageRoot = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        let fixtureURL = packageRoot.appendingPathComponent("Fixtures/hello-from-telnyx.wav")

        guard FileManager.default.fileExists(atPath: fixtureURL.path) else {
            throw FixtureError.missingFixture(fixtureURL.path)
        }

        return fixtureURL
    }
}

private enum FixtureError: Error {
    case missingFixture(String)
}

private final class MockAudioCapture: AudioCapturing, @unchecked Sendable {
    private let stream: AsyncStream<Data>
    private let continuation: AsyncStream<Data>.Continuation
    private let lock = NSLock()

    private(set) var startCallCount = 0
    private(set) var stopCallCount = 0

    init() {
        var cont: AsyncStream<Data>.Continuation!
        stream = AsyncStream { continuation in
            cont = continuation
        }
        continuation = cont
    }

    var pcmFrames: AsyncStream<Data> {
        stream
    }

    func start() throws {
        lock.lock()
        startCallCount += 1
        lock.unlock()
    }

    func stop() {
        lock.lock()
        stopCallCount += 1
        lock.unlock()
        continuation.finish()
    }
}

private final class MockSTTStreaming: STTStreaming, @unchecked Sendable {
    let transcriptEvents: AsyncStream<STTTranscriptEvent>

    private let continuation: AsyncStream<STTTranscriptEvent>.Continuation
    private let eventsOnConnect: [STTTranscriptEvent]
    private let connectError: Error?
    private let sendErrorFrameThreshold: Int?

    private(set) var connectCallCount = 0
    private(set) var disconnectCallCount = 0
    private(set) var sentFramesCount = 0

    init(
        eventsOnConnect: [STTTranscriptEvent],
        connectError: Error? = nil,
        sendErrorFrameThreshold: Int? = nil
    ) {
        self.eventsOnConnect = eventsOnConnect
        self.connectError = connectError
        self.sendErrorFrameThreshold = sendErrorFrameThreshold

        var cont: AsyncStream<STTTranscriptEvent>.Continuation!
        transcriptEvents = AsyncStream { continuation in
            cont = continuation
        }
        self.continuation = cont
    }

    func connect() async throws {
        connectCallCount += 1
        if let connectError {
            throw connectError
        }

        Task { [continuation, eventsOnConnect] in
            for event in eventsOnConnect {
                continuation.yield(event)
                try? await Task.sleep(nanoseconds: 5_000_000)
            }
        }
    }

    func sendAudioFrame(_ frame: Data) async throws {
        sentFramesCount += 1
        if let sendErrorFrameThreshold, sentFramesCount >= sendErrorFrameThreshold {
            throw MockStreamingError.sendFailed
        }
    }

    func disconnect() async {
        disconnectCallCount += 1
        continuation.finish()
    }
}

private final class MockHUDPresenter: HUDPresenting, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var updates: [(DictationSession.State, String?)] = []
    private(set) var hideCallCount = 0
    private(set) var recentSessionsSnapshots: [[RecentSessionEntry]] = []

    var recordedStates: [DictationSession.State] {
        lock.lock()
        defer { lock.unlock() }
        return updates.map { $0.0 }
    }

    var recordedTranscripts: [String] {
        lock.lock()
        defer { lock.unlock() }
        return updates.compactMap { $0.1 }
    }

    func update(state: DictationSession.State, transcript: String?) {
        lock.lock()
        updates.append((state, transcript))
        lock.unlock()
    }

    func update(level: Float) {
        // No-op for tests
    }

    func hide() {
        lock.lock()
        hideCallCount += 1
        lock.unlock()
    }

    var latestRecentSessions: [RecentSessionEntry] {
        lock.lock()
        defer { lock.unlock() }
        return recentSessionsSnapshots.last ?? []
    }

    func updateRecentSessions(_ sessions: [RecentSessionEntry]) {
        lock.lock()
        recentSessionsSnapshots.append(sessions)
        lock.unlock()
    }
}

private final class MockTextInserter: TextInserting, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var insertedTexts: [String] = []

    func insert(_ text: String) throws {
        lock.lock()
        insertedTexts.append(text)
        lock.unlock()
    }
}

private enum MockStreamingError: Error {
    case connectFailed
    case sendFailed
}
