import Testing
import AVFoundation
@testable import TelnyxDictationLib

@Suite("PermissionManager Tests")
struct PermissionManagerTests {

    @Test("PermissionManager can be created")
    func permissionManagerCanBeCreated() {
        let manager = PermissionManager()
        #expect(manager != nil)
    }

    @Test("Accessibility trusted returns Bool without crashing")
    func accessibilityTrustedReturnsBool() {
        let manager = PermissionManager()
        let result = manager.isAccessibilityTrusted(promptIfNeeded: false)
        // Result is either true or false – just ensure no crash.
        #expect(result == true || result == false)
    }

    @Test("Microphone status returns known case")
    func microphoneStatusReturnsKnownCase() {
        let manager = PermissionManager()
        let status = manager.microphoneAuthorizationStatus
        let knownCases: [AVAuthorizationStatus] = [.notDetermined, .restricted, .denied, .authorized]
        #expect(knownCases.contains(status),
                "Unexpected microphone authorization status: \(status.rawValue)")
    }
}
