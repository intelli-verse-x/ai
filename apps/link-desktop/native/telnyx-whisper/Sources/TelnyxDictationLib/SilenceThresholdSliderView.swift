import AppKit

/// Custom view for an NSMenuItem that provides a slider to adjust the silence
/// detection speech threshold, plus a live level indicator showing current
/// ambient microphone level.
@MainActor
final class SilenceThresholdSliderView: NSView {

    private let slider = NSSlider()
    private let titleLabel = NSTextField(labelWithString: "Silence Threshold")
    private let valueLabel = NSTextField(labelWithString: "0.050")
    private let levelBar = NSView()
    private let levelBarTrack = NSView()
    private let levelLabel = NSTextField(labelWithString: "Ambient: —")
    private var levelBarWidthConstraint: NSLayoutConstraint?

    private var onThresholdChanged: ((Float) -> Void)?

    /// Current threshold value (0.01 … 0.20).
    private(set) var threshold: Float

    // MARK: - Init

    init(threshold: Float, onThresholdChanged: @escaping (Float) -> Void) {
        self.threshold = threshold
        self.onThresholdChanged = onThresholdChanged
        super.init(frame: NSRect(x: 0, y: 0, width: 280, height: 72))
        setupViews()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Setup

    private func setupViews() {
        // Title
        titleLabel.font = .systemFont(ofSize: 11, weight: .semibold)
        titleLabel.textColor = .secondaryLabelColor
        titleLabel.translatesAutoresizingMaskIntoConstraints = false

        // Value label
        valueLabel.font = .monospacedDigitSystemFont(ofSize: 11, weight: .regular)
        valueLabel.textColor = .labelColor
        valueLabel.alignment = .right
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        valueLabel.setContentHuggingPriority(.required, for: .horizontal)

        // Slider
        slider.minValue = 0.01
        slider.maxValue = 0.20
        slider.doubleValue = Double(threshold)
        slider.isContinuous = true
        slider.target = self
        slider.action = #selector(sliderChanged(_:))
        slider.translatesAutoresizingMaskIntoConstraints = false

        // Level bar track (background)
        levelBarTrack.wantsLayer = true
        levelBarTrack.layer?.backgroundColor = NSColor.separatorColor.withAlphaComponent(0.3).cgColor
        levelBarTrack.layer?.cornerRadius = 2
        levelBarTrack.translatesAutoresizingMaskIntoConstraints = false

        // Level bar (foreground)
        levelBar.wantsLayer = true
        levelBar.layer?.backgroundColor = NSColor.controlAccentColor.withAlphaComponent(0.6).cgColor
        levelBar.layer?.cornerRadius = 2
        levelBar.translatesAutoresizingMaskIntoConstraints = false

        // Level label
        levelLabel.font = .monospacedDigitSystemFont(ofSize: 10, weight: .regular)
        levelLabel.textColor = .tertiaryLabelColor
        levelLabel.translatesAutoresizingMaskIntoConstraints = false

        addSubview(titleLabel)
        addSubview(valueLabel)
        addSubview(slider)
        addSubview(levelBarTrack)
        levelBarTrack.addSubview(levelBar)
        addSubview(levelLabel)

        let levelBarWidth = levelBar.widthAnchor.constraint(equalToConstant: 0)
        levelBarWidthConstraint = levelBarWidth

        NSLayoutConstraint.activate([
            // Title row
            titleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: 6),

            valueLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            valueLabel.centerYAnchor.constraint(equalTo: titleLabel.centerYAnchor),
            valueLabel.leadingAnchor.constraint(greaterThanOrEqualTo: titleLabel.trailingAnchor, constant: 8),

            // Slider
            slider.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            slider.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            slider.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),

            // Level bar track
            levelBarTrack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            levelBarTrack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            levelBarTrack.topAnchor.constraint(equalTo: slider.bottomAnchor, constant: 4),
            levelBarTrack.heightAnchor.constraint(equalToConstant: 4),

            // Level bar (inside track)
            levelBar.leadingAnchor.constraint(equalTo: levelBarTrack.leadingAnchor),
            levelBar.topAnchor.constraint(equalTo: levelBarTrack.topAnchor),
            levelBar.bottomAnchor.constraint(equalTo: levelBarTrack.bottomAnchor),
            levelBarWidth,

            // Level label
            levelLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            levelLabel.topAnchor.constraint(equalTo: levelBarTrack.bottomAnchor, constant: 2),
            levelLabel.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor, constant: -4),
        ])

        updateValueLabel()
    }

    // MARK: - Actions

    @objc private func sliderChanged(_ sender: NSSlider) {
        threshold = Float(sender.doubleValue)
        updateValueLabel()
        onThresholdChanged?(threshold)
    }

    // MARK: - Public

    /// Update the live ambient level display. Called from the probe engine.
    func updateCurrentLevel(_ rms: Float) {
        let trackWidth = levelBarTrack.bounds.width
        guard trackWidth > 0 else { return }

        // Scale: map rms 0…0.20 to full bar width (matches slider range)
        let fraction = CGFloat(min(rms / 0.20, 1.0))
        levelBarWidthConstraint?.constant = fraction * trackWidth

        // Color the bar: green if below threshold, red if above
        if rms < threshold {
            levelBar.layer?.backgroundColor = NSColor.systemGreen.withAlphaComponent(0.6).cgColor
        } else {
            levelBar.layer?.backgroundColor = NSColor.systemOrange.withAlphaComponent(0.7).cgColor
        }

        if rms > 0 {
            levelLabel.stringValue = String(format: "Ambient: %.4f RMS", rms)
        } else {
            levelLabel.stringValue = "Ambient: —"
        }
    }

    // MARK: - Private

    private func updateValueLabel() {
        valueLabel.stringValue = String(format: "%.3f", threshold)
    }
}
