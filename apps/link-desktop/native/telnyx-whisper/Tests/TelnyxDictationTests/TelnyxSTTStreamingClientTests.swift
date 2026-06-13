import Testing
import AVFoundation  // re-exports Foundation without triggering _Testing_Foundation on macOS 14
@testable import TelnyxDictationLib

// MARK: - Mock WebSocket Transport

/// Deterministic mock transport that delivers canned messages, then throws to signal end-of-stream.
final class MockWebSocketTransport: WebSocketTransport, @unchecked Sendable {
    private let messages: [WebSocketMessage]
    private var index = 0
    private let lock = NSLock()

    private(set) var sentMessages: [WebSocketMessage] = []
    private(set) var didResume = false
    private(set) var didCancel = false

    /// The URLRequest passed to the factory, captured for inspection.
    let capturedRequest: URLRequest?

    init(messages: [WebSocketMessage], request: URLRequest? = nil) {
        self.messages = messages
        self.capturedRequest = request
    }

    func send(_ message: WebSocketMessage) async throws {
        lock.lock()
        sentMessages.append(message)
        lock.unlock()
    }

    func receive() async throws -> WebSocketMessage {
        lock.lock()
        guard index < messages.count else {
            lock.unlock()
            throw URLError(.cancelled) // Signal end of stream
        }
        let msg = messages[index]
        index += 1
        lock.unlock()
        return msg
    }

    func resume() {
        lock.lock()
        didResume = true
        lock.unlock()
    }

    func cancel() {
        lock.lock()
        didCancel = true
        lock.unlock()
    }
}

// MARK: - Tests

@Suite("TelnyxSTTStreamingClient Tests")
struct TelnyxSTTStreamingClientTests {

    // MARK: - Connection

    @Test("connect throws missingAPIKey when provider returns nil")
    func connectThrowsMissingAPIKeyWhenNil() async throws {
        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { nil },
            transportFactory: { _ in MockWebSocketTransport(messages: []) }
        )

        var caughtError: TelnyxSTTError?
        do {
            try await client.connect()
        } catch let error as TelnyxSTTError {
            caughtError = error
        }
        #expect(caughtError == .missingAPIKey)
    }

    @Test("connect throws missingAPIKey when provider returns empty string")
    func connectThrowsMissingAPIKeyWhenEmpty() async throws {
        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { "" },
            transportFactory: { _ in MockWebSocketTransport(messages: []) }
        )

        var caughtError: TelnyxSTTError?
        do {
            try await client.connect()
        } catch let error as TelnyxSTTError {
            caughtError = error
        }
        #expect(caughtError == .missingAPIKey)
    }

    @Test("connect builds correct URL and auth header")
    func connectBuildsCorrectRequest() async throws {
        var capturedRequest: URLRequest?
        let mock = MockWebSocketTransport(messages: [])

        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { "key_test_12345" },
            transportFactory: { request in
                capturedRequest = request
                return mock
            }
        )

        try await client.connect()

        // Allow receive loop to finish (mock immediately throws on empty messages)
        try await Task.sleep(nanoseconds: 50_000_000) // 50ms

        let request = try #require(capturedRequest)
        let urlString = try #require(request.url?.absoluteString)

        #expect(urlString.contains("transcription_engine=Deepgram"))
        #expect(urlString.contains("model=deepgram/nova-3") || urlString.contains("model=deepgram%2Fnova-3"))
        #expect(urlString.contains("input_format=wav"))
        #expect(urlString.contains("interim_results=true"))
        #expect(urlString.contains("language=en-US"))
        #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer key_test_12345")
        #expect(mock.didResume)

        await client.disconnect()
    }

    // MARK: - Transcript Parsing

    @Test("parseTranscriptEvent returns partial for non-final message")
    func parsePartial() {
        let json = """
        {"transcript":"Hello from Telenk.","is_final":false,"confidence":0.742,"speech_final":false}
        """
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .string(json))
        #expect(event == .partial("Hello from Telenk."))
    }

    @Test("parseTranscriptEvent returns final for final message")
    func parseFinal() {
        let json = """
        {"transcript":"Hello from Telnyx.","is_final":true,"confidence":0.810,"speech_final":true}
        """
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .string(json))
        #expect(event == .final("Hello from Telnyx."))
    }

    @Test("parseTranscriptEvent skips empty final")
    func parseEmptyFinal() {
        let json = """
        {"transcript":"","is_final":true,"confidence":0.0,"speech_final":false}
        """
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .string(json))
        #expect(event == nil)
    }

    @Test("parseTranscriptEvent returns nil for error messages")
    func parseErrorMessage() {
        let json = """
        {"errors":[{"code":"10004","title":"Bad Request","detail":"Invalid engine"}]}
        """
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .string(json))
        #expect(event == nil)
    }

    @Test("parseTranscriptEvent returns nil for non-JSON data")
    func parseGarbageData() {
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .data(Data([0xFF, 0xFE])))
        #expect(event == nil)
    }

    @Test("parseTranscriptEvent handles data message with JSON")
    func parseDataMessage() {
        let json = """
        {"transcript":"data path","is_final":true,"confidence":0.9}
        """
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .data(json.data(using: .utf8)!))
        #expect(event == .final("data path"))
    }

    @Test("parseTranscriptEvent supports Deepgram channel alternatives payload")
    func parseDeepgramAlternativesPayload() {
        let json = """
        {
          "type": "Results",
          "is_final": true,
          "channel": {
            "alternatives": [
              {"transcript": "hello from deepgram", "confidence": 0.93}
            ]
          }
        }
        """

        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .string(json))
        #expect(event == .final("hello from deepgram"))
    }

    @Test("parseTranscriptEvent defaults is_final to false when missing")
    func parseDefaultsIsFinal() {
        let json = """
        {"transcript":"no is_final field","confidence":0.5}
        """
        let event = TelnyxSTTStreamingClient.parseTranscriptEvent(from: .string(json))
        #expect(event == .partial("no is_final field"))
    }

    // MARK: - Streaming Integration

    @Test("streams partial and final events, skipping empty finals")
    func streamsPartialAndFinalEvents() async throws {
        let partialJSON = """
        {"transcript":"Hello from Telenk.","is_final":false,"confidence":0.742,"speech_final":false}
        """
        let finalJSON = """
        {"transcript":"Hello from Telnyx.","is_final":true,"confidence":0.810,"speech_final":true}
        """
        let emptyFinalJSON = """
        {"transcript":"","is_final":true,"confidence":0.0,"speech_final":false}
        """

        let mock = MockWebSocketTransport(messages: [
            .string(partialJSON),
            .string(finalJSON),
            .string(emptyFinalJSON),
        ])

        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { "test-key" },
            transportFactory: { _ in mock }
        )

        try await client.connect()

        var events: [STTTranscriptEvent] = []
        for await event in client.transcriptEvents {
            events.append(event)
        }

        #expect(events.count == 2)
        #expect(events[0] == .partial("Hello from Telenk."))
        #expect(events[1] == .final("Hello from Telnyx."))
    }

    // MARK: - Send / Disconnect

    @Test("sendAudioFrame throws notConnected before connect")
    func sendThrowsNotConnected() async throws {
        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { "test-key" },
            transportFactory: { _ in MockWebSocketTransport(messages: []) }
        )

        var caughtError: TelnyxSTTError?
        do {
            try await client.sendAudioFrame(Data([0x01, 0x02]))
        } catch let error as TelnyxSTTError {
            caughtError = error
        }
        #expect(caughtError == .notConnected)
    }

    @Test("sendAudioFrame delivers data to transport")
    func sendAudioFrameDeliversData() async throws {
        let mock = MockWebSocketTransport(messages: [])

        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { "test-key" },
            transportFactory: { _ in mock }
        )

        try await client.connect()

        let frame = Data([0x52, 0x49, 0x46, 0x46]) // "RIFF"
        try await client.sendAudioFrame(frame)

        #expect(mock.sentMessages.count == 1)
        #expect(mock.sentMessages[0] == .data(frame))

        await client.disconnect()
    }

    @Test("disconnect cancels transport and finishes stream")
    func disconnectCleansUp() async throws {
        let mock = MockWebSocketTransport(messages: [
            .string("""
            {"transcript":"partial","is_final":false}
            """),
        ])

        let client = TelnyxSTTStreamingClient(
            apiKeyProvider: { "test-key" },
            transportFactory: { _ in mock }
        )

        try await client.connect()

        // Allow receive loop to process
        try await Task.sleep(nanoseconds: 50_000_000) // 50ms

        await client.disconnect()

        #expect(mock.didCancel)
    }
}
