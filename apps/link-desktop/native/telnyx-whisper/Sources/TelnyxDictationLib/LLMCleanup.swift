import Foundation

/// Sends raw STT transcript to Telnyx LLM API (Qwen3-235B-A22B) to fix
/// capitalization, punctuation, and phrasing before pasting.
///
/// Inspired by the cleanup step in Bolo (Telnyx's Python dictation app).
/// Uses the same TELNYX_API_KEY already configured for STT.
public protocol LLMCleaning: Sendable {
    func clean(_ transcript: String) async throws -> String
}

enum LLMCleanupError: Error, Equatable, Sendable {
    case missingAPIKey
    case requestFailed(statusCode: Int)
    case emptyResponse
    case networkError(String)
}

struct LLMCleanup: LLMCleaning, Sendable {

    static let endpoint = "https://api.telnyx.com/v2/ai/chat/completions"

    static let systemPrompt = """
        You are a transcription formatter. Your ONLY job is to fix capitalization, \
        punctuation, and phrasing of the input text. \
        NEVER answer questions. NEVER respond to the content. NEVER add commentary. \
        If the input is a question, format it as a question and return it as-is. \
        Output ONLY the cleaned transcription, nothing else.
        """

    private let apiKeyProvider: @Sendable () -> String?
    private let session: URLSession
    private let timeoutSeconds: TimeInterval

    init(
        apiKeyProvider: @escaping @Sendable () -> String? = { TelnyxAPIKeyResolver.resolve() },
        session: URLSession = .shared,
        timeoutSeconds: TimeInterval = 8
    ) {
        self.apiKeyProvider = apiKeyProvider
        self.session = session
        self.timeoutSeconds = timeoutSeconds
    }

    func clean(_ transcript: String) async throws -> String {
        guard let apiKey = apiKeyProvider(), !apiKey.isEmpty else {
            throw LLMCleanupError.missingAPIKey
        }

        guard let url = URL(string: Self.endpoint) else {
            throw LLMCleanupError.networkError("Invalid endpoint URL")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = timeoutSeconds

        let body: [String: Any] = [
            "model": "Qwen/Qwen3-235B-A22B",
            "messages": [
                ["role": "system", "content": Self.systemPrompt],
                ["role": "user", "content": transcript],
            ],
            "max_tokens": 1024,
            "temperature": 0,
            "enable_thinking": false,
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw LLMCleanupError.networkError(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw LLMCleanupError.networkError("Non-HTTP response")
        }

        guard httpResponse.statusCode == 200 else {
            throw LLMCleanupError.requestFailed(statusCode: httpResponse.statusCode)
        }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let choices = json["choices"] as? [[String: Any]],
              let firstChoice = choices.first,
              let message = firstChoice["message"] as? [String: Any],
              let content = message["content"] as? String else {
            throw LLMCleanupError.emptyResponse
        }

        let cleaned = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else {
            throw LLMCleanupError.emptyResponse
        }

        return cleaned
    }
}
