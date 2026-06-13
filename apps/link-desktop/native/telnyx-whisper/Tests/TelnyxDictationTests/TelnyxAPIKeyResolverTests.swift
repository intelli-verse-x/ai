import Testing
import AVFoundation
@testable import TelnyxDictationLib

@Suite("TelnyxAPIKeyResolver Tests")
struct TelnyxAPIKeyResolverTests {
    @Test("Parses TELNYX_API_KEY from plain/quoted/export .env lines")
    func parseEnvVariants() {
        let plain = TelnyxAPIKeyResolver.parseTelnyxAPIKey(from: "TELNYX_API_KEY=abc123")
        #expect(plain == "abc123")

        let quoted = TelnyxAPIKeyResolver.parseTelnyxAPIKey(from: "TELNYX_API_KEY=\"quoted-key\"")
        #expect(quoted == "quoted-key")

        let exported = TelnyxAPIKeyResolver.parseTelnyxAPIKey(from: "export TELNYX_API_KEY='exported-key'")
        #expect(exported == "exported-key")
    }

    @Test("Environment value takes precedence over .env files")
    func environmentPrecedence() throws {
        let tempDir = try makeTempDirectory()
        defer { try? FileManager.default.removeItem(at: tempDir) }

        let envFile = tempDir.appendingPathComponent(".env")
        try "TELNYX_API_KEY=from-file".write(to: envFile, atomically: true, encoding: .utf8)

        let resolved = TelnyxAPIKeyResolver.resolve(
            environment: ["TELNYX_API_KEY": "from-env"],
            searchPaths: [envFile]
        )

        #expect(resolved == "from-env")
    }

    @Test("Resolves key from first matching .env search path")
    func resolvesFromSearchPath() throws {
        let tempDir = try makeTempDirectory()
        defer { try? FileManager.default.removeItem(at: tempDir) }

        let first = tempDir.appendingPathComponent("first.env")
        let second = tempDir.appendingPathComponent("second.env")
        try "NOT_THIS=1".write(to: first, atomically: true, encoding: .utf8)
        try "TELNYX_API_KEY=from-second".write(to: second, atomically: true, encoding: .utf8)

        let resolved = TelnyxAPIKeyResolver.resolve(
            environment: [:],
            searchPaths: [first, second]
        )

        #expect(resolved == "from-second")
    }

    private func makeTempDirectory() throws -> URL {
        let root = URL(fileURLWithPath: NSTemporaryDirectory())
        let dir = root.appendingPathComponent("telnyx-api-key-tests-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }
}
