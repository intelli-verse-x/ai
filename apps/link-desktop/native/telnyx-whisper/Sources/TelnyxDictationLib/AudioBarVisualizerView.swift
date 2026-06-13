import AppKit
import Foundation

/// An ElevenLabs-style multi-bar audio visualizer.
///
/// Displays N vertical rounded bars whose heights react to incoming
/// audio levels.  Since we only have a single RMS value (not FFT bands),
/// the visualizer distributes energy across bars with per-bar random
/// variation and independent smoothing to create the illusion of
/// frequency-band activity.
///
/// Bars grow from the bottom of the view.  Heights are expressed as
/// fractions of the view height.
@MainActor
public final class AudioBarVisualizerView: NSView {

    // MARK: - Configuration

    /// Number of vertical bars.
    public var barCount: Int = 24 {
        didSet { resetBars() }
    }

    /// Spacing between bars (points).
    public var barSpacing: CGFloat = 2.5

    /// Corner radius of each bar cap (points).
    public var barCornerRadius: CGFloat = 2.0

    /// Minimum bar height as a fraction of view height (0…1).
    public var minHeightFraction: CGFloat = 0.06

    /// Maximum bar height as a fraction of view height (0…1).
    public var maxHeightFraction: CGFloat = 0.95

    /// Bar colour (uses accent colour by default).
    public var barColor: NSColor = .controlAccentColor

    /// Smoothing factor for bar rise (0 = instant, 1 = frozen).  Lower
    /// values track audio faster.
    public var attackSmoothing: CGFloat = 0.25

    /// Smoothing factor for bar fall.  Higher = slower decay.
    public var decaySmoothing: CGFloat = 0.75

    // MARK: - Internal state

    /// Current display height for each bar (fraction 0…1).
    private var barHeights: [CGFloat] = []

    /// Per-bar random "personality" offset so bars don't move in lockstep.
    private var barPersonalities: [CGFloat] = []

    /// Target heights computed from the latest audio level.
    private var targetHeights: [CGFloat] = []

    /// Display link for smooth 60 fps animation.
    private var displayLink: CVDisplayLink?

    /// Latest RMS level fed in (0…1 range, raw).
    private var currentLevel: Float = 0

    /// Whether the view is actively animating.
    private var isAnimating = false

    // MARK: - Init

    public override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        commonInit()
    }

    public required init?(coder: NSCoder) {
        super.init(coder: coder)
        commonInit()
    }

    private func commonInit() {
        wantsLayer = true
        layer?.backgroundColor = .clear
        resetBars()
    }

    deinit {
        // isAnimating is read on the main thread via DispatchQueue.main.asyncAfter;
        // setting it to false here prevents further ticks from scheduling.
        isAnimating = false
    }

    // MARK: - Public API

    /// Feed a new RMS audio level (0.0 … 1.0).
    public func setLevel(_ level: Float) {
        currentLevel = max(0, min(1, level))

        // Compute per-bar target heights from the overall level.
        let energy = CGFloat(pow(currentLevel, 0.35))  // perceptual scaling
        for i in 0..<barCount {
            let personality = barPersonalities[i]
            // Each bar gets the overall energy ± a random-ish offset.
            let variation = personality * energy * 0.6
            let raw = energy + variation
            targetHeights[i] = minHeightFraction + (maxHeightFraction - minHeightFraction) * max(0, min(1, raw))
        }

        if !isAnimating {
            startAnimating()
        }
    }

    /// Reset all bars to minimum height (idle state).
    public func resetToIdle() {
        currentLevel = 0
        for i in 0..<barCount {
            targetHeights[i] = minHeightFraction
        }
    }

    // MARK: - Drawing

    public override func draw(_ dirtyRect: NSRect) {
        guard barCount > 0 else { return }

        let totalSpacing = barSpacing * CGFloat(barCount - 1)
        let barWidth = max(1, (bounds.width - totalSpacing) / CGFloat(barCount))

        let ctx = NSGraphicsContext.current?.cgContext
        ctx?.saveGState()

        for i in 0..<barCount {
            let fraction = barHeights[i]
            let barHeight = max(barCornerRadius * 2, fraction * bounds.height)

            let x = CGFloat(i) * (barWidth + barSpacing)
            let y: CGFloat = 0  // grow from bottom
            let rect = CGRect(x: x, y: y, width: barWidth, height: barHeight)
            let path = NSBezierPath(roundedRect: rect, xRadius: barCornerRadius, yRadius: barCornerRadius)

            // Opacity varies slightly with height for visual depth.
            let alpha = 0.4 + 0.6 * fraction
            barColor.withAlphaComponent(alpha).setFill()
            path.fill()
        }

        ctx?.restoreGState()
    }

    // MARK: - Animation

    private func startAnimating() {
        guard !isAnimating else { return }
        isAnimating = true

        // Use a timer-based approach (simpler and works reliably in popovers
        // where CVDisplayLink can be problematic).
        scheduleAnimationTick()
    }

    private func stopAnimating() {
        isAnimating = false
    }

    private func scheduleAnimationTick() {
        guard isAnimating else { return }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0 / 60.0) { [weak self] in
            self?.animationTick()
        }
    }

    private func animationTick() {
        guard isAnimating else { return }

        var needsRedraw = false
        for i in 0..<barCount {
            let target = targetHeights[i]
            let current = barHeights[i]
            let diff = target - current

            if abs(diff) < 0.001 {
                barHeights[i] = target
            } else if diff > 0 {
                // Rising — use attack smoothing
                barHeights[i] = current + diff * (1 - attackSmoothing)
                needsRedraw = true
            } else {
                // Falling — use decay smoothing
                barHeights[i] = current + diff * (1 - decaySmoothing)
                needsRedraw = true
            }
        }

        // Shuffle personalities slowly so bars don't look static
        if Int.random(in: 0..<10) == 0 {
            let idx = Int.random(in: 0..<barCount)
            barPersonalities[idx] = CGFloat.random(in: -1...1)
        }

        if needsRedraw {
            needsDisplay = true
            scheduleAnimationTick()
        } else {
            // All bars settled — stop animating to save CPU.
            isAnimating = false
        }
    }

    // MARK: - Helpers

    private func resetBars() {
        barHeights = Array(repeating: minHeightFraction, count: barCount)
        targetHeights = Array(repeating: minHeightFraction, count: barCount)
        barPersonalities = (0..<barCount).map { _ in CGFloat.random(in: -1...1) }
        needsDisplay = true
    }
}
