import AppKit
import ApplicationServices
import Carbon.HIToolbox.Events
import Foundation

public struct PasteboardItemSnapshot: Equatable, Sendable {
    public let representations: [String: Data]

    public init(representations: [String: Data]) {
        self.representations = representations
    }
}

public protocol PasteboardControlling: Sendable {
    func snapshotItems() -> [PasteboardItemSnapshot]
    func setString(_ string: String) -> Bool
    func restoreItems(_ items: [PasteboardItemSnapshot]) -> Bool
}

public protocol PasteCommandSending: Sendable {
    func sendCommandV() throws
}

public protocol AccessibilityTrustProviding: Sendable {
    func isAccessibilityTrusted() -> Bool
}

public protocol PasteRestoreSleeping: Sendable {
    func sleepBeforeClipboardRestore()
}

public enum TextInsertionError: Error, Equatable {
    case failedToSetDictatedTextOnPasteboard
    case failedToSendPasteCommand
    case failedToRestorePasteboard
}

public final class SystemPasteboardController: PasteboardControlling, @unchecked Sendable {
    private let pasteboard: NSPasteboard

    public init(pasteboard: NSPasteboard = .general) {
        self.pasteboard = pasteboard
    }

    public func snapshotItems() -> [PasteboardItemSnapshot] {
        guard let items = pasteboard.pasteboardItems else {
            return []
        }

        return items.map { item in
            var representations: [String: Data] = [:]
            for type in item.types {
                if let data = item.data(forType: type) {
                    representations[type.rawValue] = data
                }
            }
            return PasteboardItemSnapshot(representations: representations)
        }
    }

    public func setString(_ string: String) -> Bool {
        pasteboard.clearContents()
        return pasteboard.setString(string, forType: .string)
    }

    public func restoreItems(_ items: [PasteboardItemSnapshot]) -> Bool {
        pasteboard.clearContents()
        guard !items.isEmpty else {
            return true
        }

        var restoredItems: [NSPasteboardItem] = []
        restoredItems.reserveCapacity(items.count)

        for snapshot in items {
            let item = NSPasteboardItem()
            for (rawType, data) in snapshot.representations {
                let type = NSPasteboard.PasteboardType(rawValue: rawType)
                guard item.setData(data, forType: type) else {
                    return false
                }
            }
            restoredItems.append(item)
        }

        return pasteboard.writeObjects(restoredItems)
    }
}

public struct CGEventPasteCommandSender: PasteCommandSending, Sendable {
    public init() {}

    public func sendCommandV() throws {
        guard let source = CGEventSource(stateID: .combinedSessionState),
              let keyDown = CGEvent(
                keyboardEventSource: source,
                virtualKey: CGKeyCode(kVK_ANSI_V),
                keyDown: true
              ),
              let keyUp = CGEvent(
                keyboardEventSource: source,
                virtualKey: CGKeyCode(kVK_ANSI_V),
                keyDown: false
              ) else {
            throw TextInsertionError.failedToSendPasteCommand
        }

        keyDown.flags = .maskCommand
        keyUp.flags = .maskCommand
        keyDown.post(tap: .cghidEventTap)
        keyUp.post(tap: .cghidEventTap)
    }
}

public struct AccessibilityTrustProvider: AccessibilityTrustProviding, Sendable {
    public init() {}

    public func isAccessibilityTrusted() -> Bool {
        AXIsProcessTrusted()
    }
}

public struct ThreadSleepPasteRestoreSleeper: PasteRestoreSleeping, Sendable {
    private let delaySeconds: TimeInterval

    public init(delaySeconds: TimeInterval = 0.12) {
        self.delaySeconds = delaySeconds
    }

    public func sleepBeforeClipboardRestore() {
        Thread.sleep(forTimeInterval: delaySeconds)
    }
}

public struct PasteboardTextInserter: TextInserting, Sendable {
    private let pasteboardController: any PasteboardControlling
    private let pasteCommandSender: any PasteCommandSending
    private let accessibilityTrustProvider: any AccessibilityTrustProviding
    private let pasteRestoreSleeper: any PasteRestoreSleeping

    public init(
        pasteboardController: any PasteboardControlling = SystemPasteboardController(),
        pasteCommandSender: any PasteCommandSending = CGEventPasteCommandSender(),
        accessibilityTrustProvider: any AccessibilityTrustProviding = AccessibilityTrustProvider(),
        pasteRestoreSleeper: any PasteRestoreSleeping = ThreadSleepPasteRestoreSleeper()
    ) {
        self.pasteboardController = pasteboardController
        self.pasteCommandSender = pasteCommandSender
        self.accessibilityTrustProvider = accessibilityTrustProvider
        self.pasteRestoreSleeper = pasteRestoreSleeper
    }

    public func insert(_ text: String) throws {
        let preservedItems = pasteboardController.snapshotItems()
        guard pasteboardController.setString(text) else {
            throw TextInsertionError.failedToSetDictatedTextOnPasteboard
        }

        guard accessibilityTrustProvider.isAccessibilityTrusted() else {
            return
        }

        do {
            try pasteCommandSender.sendCommandV()
        } catch {
            if !pasteboardController.restoreItems(preservedItems) {
                throw TextInsertionError.failedToRestorePasteboard
            }
            throw TextInsertionError.failedToSendPasteCommand
        }

        pasteRestoreSleeper.sleepBeforeClipboardRestore()

        guard pasteboardController.restoreItems(preservedItems) else {
            throw TextInsertionError.failedToRestorePasteboard
        }
    }
}
