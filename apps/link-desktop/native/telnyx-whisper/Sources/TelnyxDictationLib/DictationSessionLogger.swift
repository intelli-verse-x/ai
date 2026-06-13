import Foundation

public enum DictationLogPaths {
    public static func baseDirectory(fileManager: FileManager = .default) -> URL {
        fileManager.urls(for: .libraryDirectory, in: .userDomainMask).first?
            .appendingPathComponent("Logs", isDirectory: true)
            .appendingPathComponent("TelnyxDictation", isDirectory: true)
            ?? URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("TelnyxDictationLogs", isDirectory: true)
    }

    public static func sessionsDirectory(fileManager: FileManager = .default) -> URL {
        baseDirectory(fileManager: fileManager).appendingPathComponent("sessions", isDirectory: true)
    }

    public static func aggregateLogURL(fileManager: FileManager = .default) -> URL {
        baseDirectory(fileManager: fileManager).appendingPathComponent("dictation-sessions.jsonl")
    }
}

public struct DictationSessionLogEntry: Codable, Sendable {
    public let sessionID: String
    public let timestamp: String
    public let stage: String
    public let message: String
    public let transcript: String?
    public let accessibilityTrusted: Bool?
    public let error: String?

    public init(
        sessionID: String,
        timestamp: String,
        stage: String,
        message: String,
        transcript: String?,
        accessibilityTrusted: Bool?,
        error: String?
    ) {
        self.sessionID = sessionID
        self.timestamp = timestamp
        self.stage = stage
        self.message = message
        self.transcript = transcript
        self.accessibilityTrusted = accessibilityTrusted
        self.error = error
    }
}

public protocol DictationSessionLogging: Sendable {
    func append(_ entry: DictationSessionLogEntry) async
}

public actor LocalDictationSessionLogger: DictationSessionLogging {
    public static let shared = LocalDictationSessionLogger()

    private let baseDirectory: URL
    private let sessionsDirectory: URL
    private let aggregateLogURL: URL
    private let encoder = JSONEncoder()

    public init(fileManager: FileManager = .default) {
        self.baseDirectory = DictationLogPaths.baseDirectory(fileManager: fileManager)
        self.sessionsDirectory = DictationLogPaths.sessionsDirectory(fileManager: fileManager)
        self.aggregateLogURL = DictationLogPaths.aggregateLogURL(fileManager: fileManager)
        self.encoder.outputFormatting = [.withoutEscapingSlashes]
    }

    public func append(_ entry: DictationSessionLogEntry) async {
        do {
            try ensureDirectories()
            let data = try encoder.encode(entry)
            if let line = String(data: data, encoding: .utf8) {
                try appendLine(line, to: aggregateLogURL)
                let sessionURL = sessionsDirectory.appendingPathComponent("\(entry.sessionID).log")
                try appendLine("[\(entry.timestamp)] [\(entry.stage)] \(entry.message)", to: sessionURL)
            }
        } catch {
        }
    }

    private func ensureDirectories() throws {
        let fileManager = FileManager.default
        if !fileManager.fileExists(atPath: baseDirectory.path) {
            try fileManager.createDirectory(at: baseDirectory, withIntermediateDirectories: true)
        }
        if !fileManager.fileExists(atPath: sessionsDirectory.path) {
            try fileManager.createDirectory(at: sessionsDirectory, withIntermediateDirectories: true)
        }
    }

    private func appendLine(_ line: String, to url: URL) throws {
        let payload = Data((line + "\n").utf8)
        let fileManager = FileManager.default
        if !fileManager.fileExists(atPath: url.path) {
            try payload.write(to: url, options: .atomic)
            return
        }

        let handle = try FileHandle(forWritingTo: url)
        defer { try? handle.close() }
        try handle.seekToEnd()
        try handle.write(contentsOf: payload)
    }
}
