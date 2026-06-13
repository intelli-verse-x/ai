// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TelnyxDictation",
    platforms: [
        .macOS(.v14)
    ],
    targets: [
        .target(
            name: "TelnyxDictationLib",
            path: "Sources/TelnyxDictationLib"
        ),
        .executableTarget(
            name: "TelnyxDictation",
            dependencies: ["TelnyxDictationLib"],
            path: "Sources/TelnyxDictation"
        ),
        .testTarget(
            name: "TelnyxDictationTests",
            dependencies: ["TelnyxDictationLib"],
            path: "Tests/TelnyxDictationTests"
        ),
        .executableTarget(
            name: "TelnyxSTTSpike",
            path: "Sources/TelnyxSTTSpike"
        ),
    ]
)
