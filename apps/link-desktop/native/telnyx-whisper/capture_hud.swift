import AppKit
import Foundation

class DummyHUD {
    let effectView = NSVisualEffectView()
    let statusLabel = NSTextField(labelWithString: "Listening...")
    let transcriptLabel = NSTextField(labelWithString: "This is a test transcript.")
    let levelIndicator = NSLevelIndicator()
    
    func setup() -> NSView {
        let contentView = NSView(frame: NSRect(x: 0, y: 0, width: 280, height: 100))
        
        effectView.frame = contentView.bounds
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
        stackView.frame = effectView.bounds
        
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
        
        levelIndicator.levelIndicatorStyle = .continuousCapacity
        levelIndicator.minValue = 0
        levelIndicator.maxValue = 10
        levelIndicator.warningValue = 7
        levelIndicator.criticalValue = 9
        levelIndicator.doubleValue = 5
        
        stackView.addArrangedSubview(statusLabel)
        stackView.addArrangedSubview(levelIndicator)
        stackView.addArrangedSubview(transcriptLabel)
        
        effectView.addSubview(stackView)
        
        // Layout
        statusLabel.sizeToFit()
        transcriptLabel.sizeToFit()
        levelIndicator.frame = NSRect(x: 0, y: 0, width: 120, height: 6)
        
        // Force layout
        stackView.layoutSubtreeIfNeeded()
        
        return contentView
    }
}

let hud = DummyHUD()
let view = hud.setup()

let rep = view.bitmapImageRepForCachingDisplay(in: view.bounds)!
view.cacheDisplay(in: view.bounds, to: rep)

if let data = rep.representation(using: .png, properties: [:]) {
    let url = URL(fileURLWithPath: ".sisyphus/evidence/task-11-hud.png")
    try! data.write(to: url)
    print("Saved to \(url.path)")
} else {
    print("Failed to create PNG data")
}
