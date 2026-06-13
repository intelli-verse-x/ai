import Foundation

/// Pure audio math helpers — no AVFoundation dependency, fully testable.
public enum AudioMath {

    /// Calculate RMS (root-mean-square) level from PCM16 signed-LE data.
    ///
    /// - Returns: Normalised 0.0 … 1.0 value.  Returns 0 when data has fewer
    ///   than 2 bytes (one sample).
    public static func rmsLevel(pcm16Data: Data) -> Float {
        let sampleCount = pcm16Data.count / 2
        guard sampleCount > 0 else { return 0 }

        var sumSquares: Float = 0
        pcm16Data.withUnsafeBytes { raw in
            let samples = raw.bindMemory(to: Int16.self)
            for i in 0..<sampleCount {
                let normalised = Float(samples[i]) / Float(Int16.max)
                sumSquares += normalised * normalised
            }
        }
        return sqrtf(sumSquares / Float(sampleCount))
    }

    /// Convert an RMS value (0…1) to a dBFS value.
    /// Returns `-Float.infinity` for silence (rms == 0).
    public static func dbFS(rms: Float) -> Float {
        guard rms > 0 else { return -.infinity }
        return 20 * log10f(rms)
    }

    /// Map an RMS (0…1) to the HUD level-indicator scale (0…10).
    ///
    /// Uses a simple dBFS-based mapping:  −60 dBFS → 0,  0 dBFS → 10.
    public static func hudLevel(rms: Float) -> Double {
        let db = dbFS(rms: rms)
        guard db.isFinite else { return 0 }
        // Clamp −60…0 → 0…10
        let clamped = max(-60, min(0, db))
        return Double((clamped + 60) / 60) * 10
    }
}
