import Testing
import AppKit  // re-exports Foundation (Data) without triggering _Testing_Foundation
@testable import TelnyxDictationLib

@Suite("PasteboardTextInserter Tests")
struct PasteboardTextInserterTests {

    @Test("Auto-paste preserves all pasteboard items and restores after Command-V")
    func autoPastePreservesAndRestoresPasteboard() throws {
        let recorder = CallRecorder()
        let initialItems = [
            PasteboardItemSnapshot(
                representations: [
                    "public.utf8-plain-text": Data("existing text".utf8),
                    "public.png": Data([0x89, 0x50, 0x4E, 0x47]),
                ]
            ),
            PasteboardItemSnapshot(
                representations: [
                    "com.adobe.pdf": Data([0x25, 0x50, 0x44, 0x46]),
                ]
            ),
        ]

        let pasteboard = MockPasteboardController(initialSnapshot: initialItems, recorder: recorder)
        let commandSender = MockPasteCommandSender(recorder: recorder)
        let sleeper = MockPasteRestoreSleeper(recorder: recorder)
        let access = StaticAccessibilityProvider(isTrusted: true)
        let inserter = PasteboardTextInserter(
            pasteboardController: pasteboard,
            pasteCommandSender: commandSender,
            accessibilityTrustProvider: access,
            pasteRestoreSleeper: sleeper
        )

        try inserter.insert("dictated")

        #expect(pasteboard.setStringCalls == ["dictated"])
        #expect(commandSender.sendCommandVCallCount == 1)
        #expect(sleeper.sleepCallCount == 1)
        #expect(pasteboard.restoreCalls.count == 1)
        #expect(pasteboard.restoreCalls.first == initialItems)
        #expect(
            recorder.events == [
                "snapshotItems",
                "setString",
                "sendCommandV",
                "sleepBeforeClipboardRestore",
                "restoreItems",
            ]
        )
    }

    @Test("Accessibility denied keeps dictated text on clipboard and skips auto-paste")
    func accessibilityDeniedSkipsAutoPasteAndRestore() throws {
        let recorder = CallRecorder()
        let initialItems = [
            PasteboardItemSnapshot(representations: ["public.png": Data([0x89, 0x50, 0x4E, 0x47])]),
        ]

        let pasteboard = MockPasteboardController(initialSnapshot: initialItems, recorder: recorder)
        let commandSender = MockPasteCommandSender(recorder: recorder)
        let sleeper = MockPasteRestoreSleeper(recorder: recorder)
        let access = StaticAccessibilityProvider(isTrusted: false)
        let inserter = PasteboardTextInserter(
            pasteboardController: pasteboard,
            pasteCommandSender: commandSender,
            accessibilityTrustProvider: access,
            pasteRestoreSleeper: sleeper
        )

        try inserter.insert("dictated")

        #expect(pasteboard.setStringCalls == ["dictated"])
        #expect(commandSender.sendCommandVCallCount == 0)
        #expect(sleeper.sleepCallCount == 0)
        #expect(pasteboard.restoreCalls.isEmpty)
        #expect(recorder.events == ["snapshotItems", "setString"])
    }

    @Test("Paste command failures still attempt restore")
    func pasteCommandFailureStillRestoresPasteboard() {
        let recorder = CallRecorder()
        let initialItems = [
            PasteboardItemSnapshot(representations: ["public.tiff": Data([0x49, 0x49, 0x2A, 0x00])]),
        ]

        let pasteboard = MockPasteboardController(initialSnapshot: initialItems, recorder: recorder)
        let commandSender = MockPasteCommandSender(shouldThrow: true, recorder: recorder)
        let sleeper = MockPasteRestoreSleeper(recorder: recorder)
        let access = StaticAccessibilityProvider(isTrusted: true)
        let inserter = PasteboardTextInserter(
            pasteboardController: pasteboard,
            pasteCommandSender: commandSender,
            accessibilityTrustProvider: access,
            pasteRestoreSleeper: sleeper
        )

        do {
            try inserter.insert("dictated")
            Issue.record("Expected insert to throw")
        } catch let error as TextInsertionError {
            #expect(error == .failedToSendPasteCommand)
        } catch {
            Issue.record("Unexpected error type: \(error)")
        }

        #expect(commandSender.sendCommandVCallCount == 1)
        #expect(sleeper.sleepCallCount == 0)
        #expect(pasteboard.restoreCalls.count == 1)
        #expect(pasteboard.restoreCalls.first == initialItems)
        #expect(recorder.events == ["snapshotItems", "setString", "sendCommandV", "restoreItems"])
    }

    @Test("Throws when restore fails after successful paste")
    func throwsWhenRestoreFails() {
        let recorder = CallRecorder()
        let pasteboard = MockPasteboardController(
            initialSnapshot: [PasteboardItemSnapshot(representations: ["public.rtf": Data([0x7B, 0x5C, 0x72, 0x74])])],
            restoreResult: false,
            recorder: recorder
        )
        let commandSender = MockPasteCommandSender(recorder: recorder)
        let sleeper = MockPasteRestoreSleeper(recorder: recorder)
        let access = StaticAccessibilityProvider(isTrusted: true)
        let inserter = PasteboardTextInserter(
            pasteboardController: pasteboard,
            pasteCommandSender: commandSender,
            accessibilityTrustProvider: access,
            pasteRestoreSleeper: sleeper
        )

        do {
            try inserter.insert("dictated")
            Issue.record("Expected insert to throw")
        } catch let error as TextInsertionError {
            #expect(error == .failedToRestorePasteboard)
        } catch {
            Issue.record("Unexpected error type: \(error)")
        }

        #expect(commandSender.sendCommandVCallCount == 1)
        #expect(sleeper.sleepCallCount == 1)
        #expect(pasteboard.restoreCalls.count == 1)
        #expect(
            recorder.events == [
                "snapshotItems",
                "setString",
                "sendCommandV",
                "sleepBeforeClipboardRestore",
                "restoreItems",
            ]
        )
    }

    @Test("Throws when dictated text cannot be set")
    func throwsWhenSettingDictatedTextFails() {
        let recorder = CallRecorder()
        let pasteboard = MockPasteboardController(initialSnapshot: [], setStringResult: false, recorder: recorder)
        let commandSender = MockPasteCommandSender(recorder: recorder)
        let sleeper = MockPasteRestoreSleeper(recorder: recorder)
        let access = StaticAccessibilityProvider(isTrusted: true)
        let inserter = PasteboardTextInserter(
            pasteboardController: pasteboard,
            pasteCommandSender: commandSender,
            accessibilityTrustProvider: access,
            pasteRestoreSleeper: sleeper
        )

        do {
            try inserter.insert("dictated")
            Issue.record("Expected insert to throw")
        } catch let error as TextInsertionError {
            #expect(error == .failedToSetDictatedTextOnPasteboard)
        } catch {
            Issue.record("Unexpected error type: \(error)")
        }

        #expect(commandSender.sendCommandVCallCount == 0)
        #expect(sleeper.sleepCallCount == 0)
        #expect(pasteboard.restoreCalls.isEmpty)
        #expect(recorder.events == ["snapshotItems", "setString"])
    }
}

private final class MockPasteboardController: PasteboardControlling, @unchecked Sendable {
    private let initialSnapshot: [PasteboardItemSnapshot]
    private let setStringResult: Bool
    private let restoreResult: Bool
    private let recorder: CallRecorder?

    private(set) var setStringCalls: [String] = []
    private(set) var restoreCalls: [[PasteboardItemSnapshot]] = []

    init(
        initialSnapshot: [PasteboardItemSnapshot],
        setStringResult: Bool = true,
        restoreResult: Bool = true,
        recorder: CallRecorder? = nil
    ) {
        self.initialSnapshot = initialSnapshot
        self.setStringResult = setStringResult
        self.restoreResult = restoreResult
        self.recorder = recorder
    }

    func snapshotItems() -> [PasteboardItemSnapshot] {
        recorder?.record("snapshotItems")
        return initialSnapshot
    }

    func setString(_ string: String) -> Bool {
        recorder?.record("setString")
        setStringCalls.append(string)
        return setStringResult
    }

    func restoreItems(_ items: [PasteboardItemSnapshot]) -> Bool {
        recorder?.record("restoreItems")
        restoreCalls.append(items)
        return restoreResult
    }
}

private final class MockPasteCommandSender: PasteCommandSending, @unchecked Sendable {
    private let shouldThrow: Bool
    private let recorder: CallRecorder?

    private(set) var sendCommandVCallCount: Int = 0

    init(shouldThrow: Bool = false, recorder: CallRecorder? = nil) {
        self.shouldThrow = shouldThrow
        self.recorder = recorder
    }

    func sendCommandV() throws {
        recorder?.record("sendCommandV")
        sendCommandVCallCount += 1
        if shouldThrow {
            throw MockError.failedToSend
        }
    }
}

private final class MockPasteRestoreSleeper: PasteRestoreSleeping, @unchecked Sendable {
    private let recorder: CallRecorder?

    private(set) var sleepCallCount: Int = 0

    init(recorder: CallRecorder? = nil) {
        self.recorder = recorder
    }

    func sleepBeforeClipboardRestore() {
        recorder?.record("sleepBeforeClipboardRestore")
        sleepCallCount += 1
    }
}

private struct StaticAccessibilityProvider: AccessibilityTrustProviding, Sendable {
    let isTrusted: Bool

    func isAccessibilityTrusted() -> Bool {
        isTrusted
    }
}

private enum MockError: Error {
    case failedToSend
}

private final class CallRecorder: @unchecked Sendable {
    private(set) var events: [String] = []

    func record(_ event: String) {
        events.append(event)
    }
}
