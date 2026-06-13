import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

// ============================================================================
// MARK: - Telnyx STT WebSocket Spike
// Purpose: Validate Telnyx STT WS endpoint, query params, audio framing, and
//          transcript JSON format. Sends a committed WAV fixture and logs all
//          server events.
// Usage:   TELNYX_API_KEY=<key> swift run TelnyxSTTSpike [--telnyx-engine]
//                                                        [--skip-interim]
//                                                        [--minimal-params]
// ============================================================================

// MARK: - Configuration

private let wsEndpoint = "wss://api.telnyx.com/v2/speech-to-text/transcription"
private let chunkSize = 2048
private let postSendWaitSeconds: UInt64 = 20  // wait for final results after all audio sent

// MARK: - Spike WebSocket Client

final class SpikeWSClient: NSObject, URLSessionWebSocketDelegate, @unchecked Sendable {
    let apiKey: String
    let fixtureURL: URL
    let queryParams: [(String, String)]

    private var session: URLSession!
    private var wsTask: URLSessionWebSocketTask!

    /// All received events: (timestamp, raw JSON string)
    private(set) var receivedEvents: [(Date, String)] = []
    private let eventLock = NSLock()

    /// Parsed transcript events
    struct TranscriptEvent {
        let transcript: String
        let isFinal: Bool
        let confidence: Double?
        let rawJSON: String
    }
    private(set) var transcriptEvents: [TranscriptEvent] = []

    private var connectionOpened = false
    private var connectionClosed = false
    private var closeReason: String?

    init(apiKey: String, fixtureURL: URL, queryParams: [(String, String)]) {
        self.apiKey = apiKey
        self.fixtureURL = fixtureURL
        self.queryParams = queryParams
        super.init()
        self.session = URLSession(
            configuration: .default,
            delegate: self,
            delegateQueue: nil
        )
    }

    // MARK: - Public API

    func run() async throws {
        log("--- Telnyx STT WebSocket Spike ---")
        log("Fixture: \(fixtureURL.path)")
        log("Query params: \(queryParams.map { "\($0.0)=\($0.1)" }.joined(separator: "&"))")

        // Build URL
        var components = URLComponents(string: wsEndpoint)!
        components.queryItems = queryParams.map { URLQueryItem(name: $0.0, value: $0.1) }

        guard let url = components.url else {
            throw SpikeError.invalidURL(components.string ?? "<nil>")
        }

        // Build request with auth header
        var request = URLRequest(url: url)
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        log("Connecting to \(url.absoluteString)")

        wsTask = session.webSocketTask(with: request)

        // CRITICAL: Start receive loop BEFORE resume() so we never miss messages.
        // URLSessionWebSocketTask queues receive calls even before connection opens.
        let receiveHandle = Task { [weak self] in
            await self?.receiveLoop()
        }

        wsTask.resume()

        // Poll for connection open (non-blocking async)
        for _ in 0..<100 { // 10 seconds
            if connectionOpened { break }
            try await Task.sleep(nanoseconds: 100_000_000)
        }
        guard connectionOpened else {
            throw SpikeError.connectionTimeout
        }
        log("Connection confirmed open. Starting audio send...")

        // Send fixture audio concurrently with receiving
        try await sendFixtureAudio()

        // Wait for server to finish processing
        log("All audio sent. Waiting up to \(postSendWaitSeconds)s for final transcripts...")
        for i in 0..<postSendWaitSeconds {
            if connectionClosed { break }
            try await Task.sleep(nanoseconds: 1_000_000_000) // 1s
            if i > 0, i % 5 == 0 {
                log("  Still waiting... (\(i)s elapsed, \(receivedEvents.count) events so far)")
            }
        }

        // Close cleanly if still open
        if !connectionClosed {
            wsTask.cancel(with: .normalClosure, reason: nil)
        }
        receiveHandle.cancel()

        // Summary
        printSummary()
    }

    // MARK: - Audio Sending

    private func sendFixtureAudio() async throws {
        let data = try Data(contentsOf: fixtureURL)
        log("Fixture loaded: \(data.count) bytes")

        // Log WAV header info
        logWAVHeader(data)

        let totalChunks = (data.count + chunkSize - 1) / chunkSize
        var offset = 0
        var chunkIndex = 0

        while offset < data.count {
            let end = min(offset + chunkSize, data.count)
            let chunk = data[offset..<end]
            do {
                try await wsTask.send(.data(Data(chunk)))
            } catch {
                log("[SEND ERROR at chunk \(chunkIndex + 1)] \(error)")
                throw error
            }
            chunkIndex += 1
            if chunkIndex == 1 || chunkIndex % 5 == 0 || chunkIndex == totalChunks {
                log("  Sent chunk \(chunkIndex)/\(totalChunks) (\(end) of \(data.count) bytes)")
            }
            offset = end
            // Simulate real-time streaming: ~128ms per 2KB at 16kHz 16-bit mono
            try await Task.sleep(nanoseconds: 100_000_000) // 100ms
        }

        log("Finished sending \(totalChunks) chunks (\(data.count) bytes total)")
    }

    // MARK: - Receive Loop

    private func receiveLoop() async {
        while !Task.isCancelled {
            do {
                let message = try await wsTask.receive()
                let text: String
                switch message {
                case .string(let s):
                    text = s
                case .data(let d):
                    text = String(data: d, encoding: .utf8) ?? "<binary \(d.count) bytes>"
                @unknown default:
                    text = "<unknown message type>"
                }

                eventLock.lock()
                receivedEvents.append((Date(), text))
                eventLock.unlock()

                // Parse transcript
                if let jsonData = text.data(using: .utf8),
                   let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {

                    if let transcript = json["transcript"] as? String {
                        let isFinal = json["is_final"] as? Bool ?? false
                        let confidence = json["confidence"] as? Double
                        let event = TranscriptEvent(
                            transcript: transcript,
                            isFinal: isFinal,
                            confidence: confidence,
                            rawJSON: text
                        )
                        eventLock.lock()
                        transcriptEvents.append(event)
                        eventLock.unlock()

                        let marker = isFinal ? "FINAL" : "partial"
                        let confStr = confidence.map { String(format: "%.3f", $0) } ?? "n/a"
                        log("[TRANSCRIPT/\(marker)] \"\(transcript)\" (confidence: \(confStr))")
                    } else if let error = json["error"] as? String {
                        log("[ERROR from server] \(error)")
                    } else if let errors = json["errors"] as? [[String: Any]] {
                        // Telnyx sometimes returns {"errors": [...]}
                        for err in errors {
                            let code = err["code"] as? String ?? "?"
                            let title = err["title"] as? String ?? "?"
                            let detail = err["detail"] as? String ?? "?"
                            log("[API ERROR] code=\(code) title=\(title) detail=\(detail)")
                        }
                    } else {
                        // Log full JSON for debugging unrecognized message formats
                        log("[RECV/json] \(text)")
                    }
                } else {
                    log("[RECV/raw] \(text)")
                }
            } catch {
                if !Task.isCancelled {
                    log("[RECV ERROR] \(error)")
                }
                break
            }
        }
    }

    // MARK: - WAV Header Parsing

    private func logWAVHeader(_ data: Data) {
        guard data.count >= 44 else {
            log("WAV: too small for standard header (\(data.count) bytes)")
            return
        }

        let riff = String(data: data[0..<4], encoding: .ascii) ?? "?"
        let wave = String(data: data[8..<12], encoding: .ascii) ?? "?"
        let audioFormat = data[20..<22].withUnsafeBytes { $0.load(as: UInt16.self) }
        let channels = data[22..<24].withUnsafeBytes { $0.load(as: UInt16.self) }
        let sampleRate = data[24..<28].withUnsafeBytes { $0.load(as: UInt32.self) }
        let bitsPerSample = data[34..<36].withUnsafeBytes { $0.load(as: UInt16.self) }

        log("WAV header: \(riff)/\(wave), format=\(audioFormat) (1=PCM), " +
            "channels=\(channels), sampleRate=\(sampleRate), " +
            "bitsPerSample=\(bitsPerSample)")
    }

    // MARK: - URLSessionWebSocketDelegate

    func urlSession(
        _ session: URLSession,
        webSocketTask: URLSessionWebSocketTask,
        didOpenWithProtocol protocol: String?
    ) {
        connectionOpened = true
        log("[WS] Connected (protocol: \(`protocol` ?? "none"))")
    }

    func urlSession(
        _ session: URLSession,
        webSocketTask: URLSessionWebSocketTask,
        didCloseWith closeCode: URLSessionWebSocketTask.CloseCode,
        reason: Data?
    ) {
        connectionClosed = true
        let reasonStr = reason.flatMap { String(data: $0, encoding: .utf8) } ?? "none"
        closeReason = "code=\(closeCode.rawValue) reason=\(reasonStr)"
        log("[WS] Closed (code: \(closeCode.rawValue), reason: \(reasonStr))")
    }

    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        didCompleteWithError error: Error?
    ) {
        if let error = error {
            connectionClosed = true
            log("[WS/TASK ERROR] \(error.localizedDescription)")
            if let httpResponse = task.response as? HTTPURLResponse {
                log("[WS/HTTP] Status: \(httpResponse.statusCode)")
                log("[WS/HTTP] Headers: \(httpResponse.allHeaderFields)")
            }
        }
    }

    // MARK: - Summary

    func printSummary() {
        log("")
        log("=== SPIKE SUMMARY ===")
        log("Total raw events received: \(receivedEvents.count)")
        log("Transcript events: \(transcriptEvents.count)")

        let finals = transcriptEvents.filter { $0.isFinal }
        let nonEmptyFinals = finals.filter { !$0.transcript.isEmpty }
        let partials = transcriptEvents.filter { !$0.isFinal }
        log("  Partial: \(partials.count)")
        log("  Final:   \(finals.count) (\(nonEmptyFinals.count) non-empty)")

        if let bestFinal = nonEmptyFinals.first ?? finals.first {
            log("Best final transcript: \"\(bestFinal.transcript)\"")
            if let conf = bestFinal.confidence {
                log("Best final confidence: \(String(format: "%.4f", conf))")
            }
        }

        if let reason = closeReason {
            log("Connection close: \(reason)")
        }

        log("")
        log("Query params used: \(queryParams.map { "\($0.0)=\($0.1)" }.joined(separator: "&"))")
        log("=== END SUMMARY ===")
    }

    // MARK: - Logging

    private let logLock = NSLock()
    private(set) var logLines: [String] = []

    func log(_ message: String) {
        let timestamp = ISO8601DateFormatter().string(from: Date())
        let line = "[\(timestamp)] \(message)"
        logLock.lock()
        logLines.append(line)
        logLock.unlock()
        print(line)
        fflush(stdout)
    }
}

// MARK: - Errors

enum SpikeError: Error, CustomStringConvertible {
    case invalidURL(String)
    case connectionTimeout
    case missingAPIKey
    case missingFixture(String)

    var description: String {
        switch self {
        case .invalidURL(let url): return "Invalid WebSocket URL: \(url)"
        case .connectionTimeout: return "WebSocket connection timed out (10s)"
        case .missingAPIKey: return "TELNYX_API_KEY environment variable not set or empty"
        case .missingFixture(let path): return "Fixture file not found: \(path)"
        }
    }
}

// MARK: - Entry Point

@main
struct SpikeEntry {
    static func main() async {
        let args = CommandLine.arguments

        // Parse flags
        let useTelnyxEngine = args.contains("--telnyx-engine")
        let skipInterim = args.contains("--skip-interim")
        let minimalParams = args.contains("--minimal-params")

        // Check API key
        guard let apiKey = ProcessInfo.processInfo.environment["TELNYX_API_KEY"],
              !apiKey.isEmpty else {
            print("ERROR: TELNYX_API_KEY environment variable not set or empty.")
            print("")
            print("Usage:")
            print("  TELNYX_API_KEY=<key> swift run TelnyxSTTSpike")
            print("")
            print("Flags:")
            print("  --telnyx-engine  Use Telnyx engine instead of Deepgram (broken as of Mar 2026)")
            print("  --skip-interim   Omit interim_results param")
            print("  --minimal-params Only transcription_engine + input_format")
            print("")
            print("Default: Deepgram/nova-3 engine (validated working).")
            print("The spike compiles without a key. Set the env var to run.")
            fflush(stdout)
            Foundation.exit(1)
        }

        // Resolve fixture path
        let fixturePath = "Fixtures/hello-from-telnyx.wav"
        let fixtureURL: URL

        if FileManager.default.fileExists(atPath: fixturePath) {
            fixtureURL = URL(fileURLWithPath: fixturePath)
        } else {
            let packageRoot = URL(fileURLWithPath: #filePath)
                .deletingLastPathComponent()
                .deletingLastPathComponent()
                .deletingLastPathComponent()
            let alt = packageRoot.appendingPathComponent(fixturePath)
            if FileManager.default.fileExists(atPath: alt.path) {
                fixtureURL = alt
            } else {
                print("ERROR: Fixture not found at '\(fixturePath)' or '\(alt.path)'")
                print("Generate: say -o /tmp/h.aiff \"hello from telnyx\" && " +
                      "afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/h.aiff Fixtures/hello-from-telnyx.wav")
                fflush(stdout)
                Foundation.exit(1)
            }
        }

        // Build query params — default to Deepgram/nova-3 (validated working)
        // FINDING: Telnyx engine returns 1006 (broken for standalone STT, March 2026)
        let engine = useTelnyxEngine ? "Telnyx" : "Deepgram"
        var params: [(String, String)] = [
            ("transcription_engine", engine),
            ("input_format", "wav"),
        ]

        if !minimalParams {
            if !useTelnyxEngine {
                // Deepgram models validated:
                //   nova-3: best accuracy (0.81 confidence, correct "Telnyx")
                //   nova-2: lower accuracy (0.73 confidence, "Telnex")
                //   flux:   broken (1006 close)
                params.append(("model", "nova-3"))
            }
            params.append(("language", "en-US"))
            if !skipInterim {
                params.append(("interim_results", "true"))
            }
        }

        let client = SpikeWSClient(apiKey: apiKey, fixtureURL: fixtureURL, queryParams: params)

        do {
            try await client.run()
        } catch {
            print("")
            print("SPIKE FAILED: \(error)")
            fflush(stdout)
            Foundation.exit(1)
        }

        // Save evidence log
        saveEvidence(client: client)

        Foundation.exit(0)
    }

    static func saveEvidence(client: SpikeWSClient) {
        let evidenceDir = ".sisyphus/evidence"
        let evidencePath = "\(evidenceDir)/task-3-telnyx-ws-log.txt"

        do {
            try FileManager.default.createDirectory(
                atPath: evidenceDir,
                withIntermediateDirectories: true
            )
            let content = client.logLines.joined(separator: "\n") + "\n"
            try content.write(toFile: evidencePath, atomically: true, encoding: .utf8)
            print("")
            print("Evidence saved to: \(evidencePath)")
            fflush(stdout)
        } catch {
            print("WARNING: Could not save evidence to \(evidencePath): \(error)")
            fflush(stdout)
        }
    }
}
