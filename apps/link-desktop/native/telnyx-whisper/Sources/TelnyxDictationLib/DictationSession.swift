import Foundation

public protocol AudioCapturing: Sendable {
    var pcmFrames: AsyncStream<Data> { get }
    func start() throws
    func stop()
}

public enum STTTranscriptEvent: Equatable, Sendable {
    case partial(String)
    case final(String)
}

public protocol STTStreaming: Sendable {
    var transcriptEvents: AsyncStream<STTTranscriptEvent> { get }
    func connect() async throws
    func sendAudioFrame(_ frame: Data) async throws
    func finishAudio() async throws
    func disconnect() async
}

public extension STTStreaming {
    func finishAudio() async throws {}
}

/// Summary of a completed dictation session for display in the HUD.
public struct RecentSessionEntry: Sendable {
    public let sessionID: String
    public let timestamp: Date
    public let result: String
    public let transcript: String?

    public init(sessionID: String, timestamp: Date, result: String, transcript: String?) {
        self.sessionID = sessionID
        self.timestamp = timestamp
        self.result = result
        self.transcript = transcript
    }
}

public protocol HUDPresenting: Sendable {
    func update(state: DictationSession.State, transcript: String?)
    func update(level: Float)
    func updateRecentSessions(_ sessions: [RecentSessionEntry])
    func hide()
}

public extension HUDPresenting {
    func updateRecentSessions(_ sessions: [RecentSessionEntry]) {
        _ = sessions
    }
}

public protocol TextInserting: Sendable {
    func insert(_ text: String) throws
}

public struct DictationSession: Sendable {
    public enum State: Equatable, Sendable {
        case idle
        case recording
        case finalizing
        case pasting
    }

    public enum Action: Equatable, Sendable {
        case startRecording
        case beginFinalizing
        case beginPasting
        case complete
        case cancel
    }

    public private(set) var state: State

    public init(state: State = .idle) {
        self.state = state
    }

    @discardableResult
    public mutating func handle(_ action: Action) -> Bool {
        switch (state, action) {
        case (.idle, .startRecording):
            state = .recording
            return true
        case (.recording, .beginFinalizing):
            state = .finalizing
            return true
        case (.finalizing, .beginPasting):
            state = .pasting
            return true
        case (.pasting, .complete):
            state = .idle
            return true
        case (.recording, .cancel), (.finalizing, .cancel), (.pasting, .cancel):
            state = .idle
            return true
        default:
            return false
        }
    }
}
