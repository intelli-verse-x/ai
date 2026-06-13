public struct SilenceDetector: Sendable {
    public struct Update: Equatable, Sendable {
        public let didStartSpeech: Bool
        public let didEndUtterance: Bool

        public init(didStartSpeech: Bool, didEndUtterance: Bool) {
            self.didStartSpeech = didStartSpeech
            self.didEndUtterance = didEndUtterance
        }
    }

    public var speechThreshold: Float
    public let requiredSilenceDuration: Double

    public var hasDetectedSpeech = false
    public private(set) var trailingSilenceDuration: Double = 0

    public init(
        speechThreshold: Float = 0.05,
        requiredSilenceDuration: Double = 3.0
    ) {
        self.speechThreshold = speechThreshold
        self.requiredSilenceDuration = requiredSilenceDuration
    }

    public mutating func reset() {
        hasDetectedSpeech = false
        trailingSilenceDuration = 0
    }

    @discardableResult
    public mutating func ingest(level: Float, elapsed: Double) -> Update {
        let clampedElapsed = max(0, elapsed)

        if level >= speechThreshold {
            let startedSpeech = !hasDetectedSpeech
            hasDetectedSpeech = true
            trailingSilenceDuration = 0
            return Update(didStartSpeech: startedSpeech, didEndUtterance: false)
        }

        guard hasDetectedSpeech else {
            return Update(didStartSpeech: false, didEndUtterance: false)
        }

        trailingSilenceDuration += clampedElapsed

        if trailingSilenceDuration >= requiredSilenceDuration {
            hasDetectedSpeech = false
            trailingSilenceDuration = 0
            return Update(didStartSpeech: false, didEndUtterance: true)
        }

        return Update(didStartSpeech: false, didEndUtterance: false)
    }
}
