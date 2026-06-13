import AppKit

@MainActor
public final class HUDWindowController: NSWindowController, HUDPresenting {
    
    private let statusLabel = NSTextField(labelWithString: "Idle")
    private let transcriptLabel = NSTextField(labelWithString: "")
    private let levelIndicator = NSLevelIndicator()
    private let effectView = NSVisualEffectView()
    
    public init() {
        let panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 280, height: 100),
            styleMask: [.nonactivatingPanel, .borderless],
            backing: .buffered,
            defer: false
        )
        
        panel.isFloatingPanel = true
        panel.level = NSWindow.Level(Int(CGWindowLevelForKey(.floatingWindow)) + 1)
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAllowsTiling]
        panel.backgroundColor = .clear
        panel.isOpaque = false
        panel.hasShadow = true
        panel.center()
        panel.alphaValue = 0.0
        
        super.init(window: panel)
        
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        guard let contentView = window?.contentView else { return }
        
        effectView.translatesAutoresizingMaskIntoConstraints = false
        effectView.material = .hudWindow
        effectView.blendingMode = .behindWindow
        effectView.state = .active
        effectView.wantsLayer = true
        effectView.layer?.cornerRadius = 24
        effectView.layer?.masksToBounds = true
        
        contentView.addSubview(effectView)
        
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.alignment = .centerX
        stackView.spacing = 6
        stackView.edgeInsets = NSEdgeInsets(top: 12, left: 16, bottom: 12, right: 16)
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        statusLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        statusLabel.textColor = .secondaryLabelColor
        statusLabel.isBordered = false
        statusLabel.isEditable = false
        statusLabel.isSelectable = false
        statusLabel.drawsBackground = false
        
        transcriptLabel.font = .systemFont(ofSize: 12, weight: .regular)
        transcriptLabel.textColor = .labelColor
        transcriptLabel.lineBreakMode = .byTruncatingTail
        transcriptLabel.maximumNumberOfLines = 2
        transcriptLabel.preferredMaxLayoutWidth = 240
        transcriptLabel.alignment = .center
        transcriptLabel.isBordered = false
        transcriptLabel.isEditable = false
        transcriptLabel.isSelectable = false
        transcriptLabel.drawsBackground = false
        transcriptLabel.wantsLayer = true
        
        levelIndicator.levelIndicatorStyle = .continuousCapacity
        levelIndicator.minValue = 0
        levelIndicator.maxValue = 10
        levelIndicator.warningValue = 7
        levelIndicator.criticalValue = 9
        levelIndicator.doubleValue = 0
        levelIndicator.translatesAutoresizingMaskIntoConstraints = false
        
        stackView.addArrangedSubview(statusLabel)
        stackView.addArrangedSubview(levelIndicator)
        stackView.addArrangedSubview(transcriptLabel)
        
        effectView.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            effectView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            effectView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            effectView.topAnchor.constraint(equalTo: contentView.topAnchor),
            effectView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            
            stackView.leadingAnchor.constraint(equalTo: effectView.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: effectView.trailingAnchor),
            stackView.topAnchor.constraint(equalTo: effectView.topAnchor),
            stackView.bottomAnchor.constraint(equalTo: effectView.bottomAnchor),
            
            levelIndicator.widthAnchor.constraint(equalToConstant: 120),
            levelIndicator.heightAnchor.constraint(equalToConstant: 6)
        ])
    }
    
    nonisolated public func update(state: DictationSession.State, transcript: String?) {
        Task { @MainActor in
            if window?.isVisible == false {
                window?.alphaValue = 0.0
                window?.orderFrontRegardless()
                NSAnimationContext.runAnimationGroup { context in
                    context.duration = 0.2
                    window?.animator().alphaValue = 1.0
                }
            }
            
            switch state {
            case .idle:
                statusLabel.stringValue = "Idle"
            case .recording:
                statusLabel.stringValue = "Listening..."
            case .finalizing:
                statusLabel.stringValue = "Finalizing..."
            case .pasting:
                statusLabel.stringValue = "Pasting..."
            }
            
            let newTranscript = transcript ?? ""
            if transcriptLabel.stringValue != newTranscript {
                let transition = CATransition()
                transition.duration = 0.15
                transition.type = .fade
                transcriptLabel.layer?.add(transition, forKey: "fade")
                transcriptLabel.stringValue = newTranscript
            }
            
            if state != .recording {
                NSAnimationContext.runAnimationGroup { context in
                    context.duration = 0.2
                    levelIndicator.animator().doubleValue = 0
                }
            }
        }
    }
    
    nonisolated public func update(level: Float) {
        Task { @MainActor in
            NSAnimationContext.runAnimationGroup { context in
                context.duration = 0.1
                levelIndicator.animator().doubleValue = AudioMath.hudLevel(rms: level)
            }
        }
    }
    
    nonisolated public func hide() {
        Task { @MainActor in
            NSAnimationContext.runAnimationGroup({ context in
                context.duration = 0.2
                window?.animator().alphaValue = 0.0
            }, completionHandler: {
                self.window?.orderOut(nil)
            })
        }
    }
}
