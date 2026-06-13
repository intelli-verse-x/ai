import Testing
@testable import TelnyxDictationLib

@Suite("DictationSession Tests")
struct DictationSessionTests {

    @Test("Valid transition path")
    func validTransitionPath() {
        var session = DictationSession()

        #expect(session.state == .idle)
        let started = session.handle(.startRecording)
        #expect(started)
        #expect(session.state == .recording)
        let finalized = session.handle(.beginFinalizing)
        #expect(finalized)
        #expect(session.state == .finalizing)
        let startedPasting = session.handle(.beginPasting)
        #expect(startedPasting)
        #expect(session.state == .pasting)
        let completed = session.handle(.complete)
        #expect(completed)
        #expect(session.state == .idle)
    }

    @Test("Invalid transitions are rejected and state is unchanged")
    func invalidTransitionIsRejectedAndStateIsUnchanged() {
        var session = DictationSession()

        let invalidFromIdle = session.handle(.beginFinalizing)
        #expect(!invalidFromIdle)
        #expect(session.state == .idle)

        let startRecording = session.handle(.startRecording)
        #expect(startRecording)
        let startRecordingAgain = session.handle(.startRecording)
        #expect(!startRecordingAgain)
        #expect(session.state == .recording)

        let beginFinalizing = session.handle(.beginFinalizing)
        #expect(beginFinalizing)
        let completeTooEarly = session.handle(.complete)
        #expect(!completeTooEarly)
        #expect(session.state == .finalizing)
    }

    @Test("Cancel from recording transitions to idle")
    func cancelFromRecordingTransitionsToIdle() {
        var session = DictationSession()

        let started = session.handle(.startRecording)
        #expect(started)
        #expect(session.state == .recording)
        let cancelled = session.handle(.cancel)
        #expect(cancelled)
        #expect(session.state == .idle)
    }

    @Test("Cancel from finalizing transitions to idle")
    func cancelFromFinalizingTransitionsToIdle() {
        var session = DictationSession()

        let started = session.handle(.startRecording)
        #expect(started)
        let beganFinalizing = session.handle(.beginFinalizing)
        #expect(beganFinalizing)
        #expect(session.state == .finalizing)
        let cancelled = session.handle(.cancel)
        #expect(cancelled)
        #expect(session.state == .idle)
    }

    @Test("Cancel from pasting transitions to idle")
    func cancelFromPastingTransitionsToIdle() {
        var session = DictationSession()

        let started = session.handle(.startRecording)
        #expect(started)
        let beganFinalizing = session.handle(.beginFinalizing)
        #expect(beganFinalizing)
        let beganPasting = session.handle(.beginPasting)
        #expect(beganPasting)
        #expect(session.state == .pasting)
        let cancelled = session.handle(.cancel)
        #expect(cancelled)
        #expect(session.state == .idle)
    }

    @Test("Completion resets state to idle")
    func completionResetsStateToIdle() {
        var session = DictationSession()

        let started = session.handle(.startRecording)
        #expect(started)
        let beganFinalizing = session.handle(.beginFinalizing)
        #expect(beganFinalizing)
        let beganPasting = session.handle(.beginPasting)
        #expect(beganPasting)
        let completed = session.handle(.complete)
        #expect(completed)
        #expect(session.state == .idle)
    }
}
