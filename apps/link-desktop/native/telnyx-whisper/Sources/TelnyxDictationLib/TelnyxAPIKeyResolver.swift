import Foundation

enum TelnyxAPIKeyResolver {
    static func resolve(
        environment: [String: String] = ProcessInfo.processInfo.environment,
        searchPaths: [URL] = defaultEnvSearchPaths()
    ) -> String? {
        if let envValue = normalize(environment["TELNYX_API_KEY"]) {
            return envValue
        }

        for path in searchPaths {
            guard let content = try? String(contentsOf: path, encoding: .utf8) else {
                continue
            }

            if let value = parseTelnyxAPIKey(from: content) {
                return value
            }
        }

        return nil
    }

    static func defaultEnvSearchPaths(
        fileManager: FileManager = .default,
        bundleURL: URL = Bundle.main.bundleURL
    ) -> [URL] {
        var paths: [URL] = []

        paths.append(URL(fileURLWithPath: fileManager.currentDirectoryPath).appendingPathComponent(".env"))
        paths.append(bundleURL.deletingLastPathComponent().appendingPathComponent(".env"))
        paths.append(bundleURL.deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent(".env"))

        let home = fileManager.homeDirectoryForCurrentUser
        paths.append(home.appendingPathComponent(".env"))
        paths.append(home.appendingPathComponent(".config/telnyx-dictation/.env"))
        paths.append(home.appendingPathComponent(".opencode/.env"))

        return uniquePaths(paths)
    }

    static func parseTelnyxAPIKey(from envContent: String) -> String? {
        for rawLine in envContent.split(whereSeparator: { $0.isNewline }) {
            var line = String(rawLine).trimmingCharacters(in: .whitespacesAndNewlines)
            if line.isEmpty || line.hasPrefix("#") {
                continue
            }

            if line.hasPrefix("export ") {
                line = String(line.dropFirst("export ".count)).trimmingCharacters(in: .whitespaces)
            }

            guard let separator = line.firstIndex(of: "=") else {
                continue
            }

            let key = String(line[..<separator]).trimmingCharacters(in: .whitespaces)
            guard key == "TELNYX_API_KEY" else {
                continue
            }

            let value = String(line[line.index(after: separator)...]).trimmingCharacters(in: .whitespaces)
            if let normalized = normalize(value) {
                return normalized
            }
        }

        return nil
    }

    private static func normalize(_ raw: String?) -> String? {
        guard var value = raw?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else {
            return nil
        }

        if (value.hasPrefix("\"") && value.hasSuffix("\"")) ||
            (value.hasPrefix("'") && value.hasSuffix("'"))
        {
            value = String(value.dropFirst().dropLast()).trimmingCharacters(in: .whitespacesAndNewlines)
        }

        return value.isEmpty ? nil : value
    }

    private static func uniquePaths(_ paths: [URL]) -> [URL] {
        var seen = Set<String>()
        var result: [URL] = []
        for path in paths {
            let key = path.standardizedFileURL.path
            if seen.insert(key).inserted {
                result.append(path)
            }
        }
        return result
    }
}
