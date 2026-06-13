import AVFoundation
import ApplicationServices

/// Handles runtime permission checks for microphone and accessibility.
/// Designed to be testable – all platform queries go through overridable methods.
public final class PermissionManager {

    public init() {}

    // MARK: - Microphone

    /// Current microphone authorization status.
    public var microphoneAuthorizationStatus: AVAuthorizationStatus {
        AVCaptureDevice.authorizationStatus(for: .audio)
    }

    /// Request microphone access. Returns `true` if granted.
    /// On first call the system shows its own permission dialog.
    public func requestMicrophoneAccess() async -> Bool {
        switch microphoneAuthorizationStatus {
        case .authorized:
            return true
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .audio)
        case .denied, .restricted:
            return false
        @unknown default:
            return false
        }
    }

    // MARK: - Accessibility

    /// Returns `true` when the process is trusted for Accessibility.
    /// - Parameter promptIfNeeded: If `true`, macOS shows its own prompt
    ///   directing the user to System Settings. Defaults to `false` so
    ///   callers can show a custom alert instead.
    public func isAccessibilityTrusted(promptIfNeeded: Bool = false) -> Bool {
        let opts = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: promptIfNeeded] as CFDictionary
        return AXIsProcessTrustedWithOptions(opts)
    }
}
