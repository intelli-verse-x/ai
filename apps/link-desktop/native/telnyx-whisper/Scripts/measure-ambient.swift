#!/usr/bin/env swift
// Quick script to measure ambient mic level for 3 seconds.
// Run: swift Scripts/measure-ambient.swift

import AVFoundation
import Foundation

let engine = AVAudioEngine()
let inputNode = engine.inputNode
let format = inputNode.outputFormat(forBus: 0)

var levels: [Float] = []
let lock = NSLock()

print("Measuring ambient noise for 3 seconds... (stay quiet)")
print("Sample rate: \(format.sampleRate) Hz, channels: \(format.channelCount)")

inputNode.installTap(onBus: 0, bufferSize: 4096, format: format) { buffer, _ in
    guard let channelData = buffer.floatChannelData else { return }
    let frameCount = Int(buffer.frameLength)
    var sum: Float = 0
    for i in 0..<frameCount {
        let sample = channelData[0][i]
        sum += sample * sample
    }
    let rms = sqrt(sum / Float(max(1, frameCount)))
    lock.lock()
    levels.append(rms)
    lock.unlock()
}

do {
    try engine.start()
} catch {
    print("ERROR: Could not start audio engine: \(error)")
    exit(1)
}

Thread.sleep(forTimeInterval: 3.0)

engine.stop()
inputNode.removeTap(onBus: 0)

lock.lock()
let captured = levels
lock.unlock()

guard !captured.isEmpty else {
    print("ERROR: No audio samples captured. Check mic permissions.")
    exit(1)
}

let avg = captured.reduce(0, +) / Float(captured.count)
let peak = captured.max() ?? 0
let p90 = captured.sorted()[Int(Double(captured.count) * 0.9)]

print("")
print("=== Ambient Noise Results (\(captured.count) samples) ===")
print("  Average RMS:  \(String(format: "%.5f", avg))")
print("  90th %ile:    \(String(format: "%.5f", p90))")
print("  Peak RMS:     \(String(format: "%.5f", peak))")
print("")
print("Current speechThreshold: 0.05")
print("Suggested threshold:     \(String(format: "%.4f", max(0.01, p90 * 2.0))) (2x your 90th percentile)")
print("")
if avg > 0.05 {
    print("⚠️  Your ambient noise EXCEEDS the current threshold!")
    print("    You need a higher threshold or a quieter environment.")
} else if avg > 0.03 {
    print("⚠️  Your ambient noise is close to the threshold.")
    print("    Consider raising it slightly.")
} else {
    print("✅  Current threshold should work well for your environment.")
}
