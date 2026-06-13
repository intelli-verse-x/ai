# Telnyx Local Dictation for macOS

A lightweight macOS utility for real-time dictation using the Telnyx STT (Speech-to-Text) service. It captures audio from your microphone, streams it to Telnyx, and automatically pastes the resulting transcript into your active application.

## Prerequisites

- **macOS**: Tested on macOS 14+.
- **Telnyx API Key**: You must have a valid Telnyx API key.
- **Swift Toolchain**: If you do not have Xcode.app installed, ensure you have the Homebrew Swift toolchain:
  ```bash
  export PATH="/opt/homebrew/opt/swift/bin:$PATH"
  ```

## Setup

### Environment Variables

The app resolves `TELNYX_API_KEY` in this order:

1. Process environment (e.g. `export TELNYX_API_KEY=...`)
2. `.env` next to the app bundle
3. `.env` in the parent of the app bundle
4. `~/.env`
5. `~/.config/telnyx-dictation/.env`
6. `~/.opencode/.env`

This means Finder-launched app restarts work even without a terminal export if one of those `.env` files exists.

```bash
export TELNYX_API_KEY="your_api_key_here"
```

Example `.env` line:

```bash
TELNYX_API_KEY=your_api_key_here
```

### Permissions

Permissions are requested only when needed:

1.  **Microphone**: Requested when you start dictation (not at app launch).
2.  **Accessibility**: Required to automatically paste the transcript into other applications.
    - If Accessibility is denied, the app will fall back to **Clipboard-only mode**, where the transcript is copied to your clipboard but not pasted.
    - To enable: **System Settings** > **Privacy & Security** > **Accessibility** > Toggle **TelnyxDictation**.

## Usage

- **Start Dictation**: Press `Cmd + Shift + L`.
- **Cancel Dictation**: Press `Esc` while recording or finalizing to stop without pasting.
- **Stop Dictation**: The app automatically detects silence and stops recording.
- **Input Microphone**: Use the menu-bar item `Input Microphone` to select a specific input device or `System Default`.
- **Microphone Test**: Use `Test Selected Microphone` to keep the meter visible for several seconds while you speak.
- **Session History**: Use `Show Last 5 Dictations` or `Show Last 10 Dictations` from the menu.

### Menubar Status Popover

A status popover is shown from the menubar icon during dictation:
- **Recording**: Shows real-time partial transcripts and audio levels.
- **Finalizing**: Waiting for the final transcript from Telnyx.
- **Pasting**: Inserting the text into the active application.
- **Recent**: Shows recent session outcomes in the popover.

### Build and Test Commands

#### Homebrew Swift (Recommended for this environment)
If you do not have Xcode.app installed, use the Homebrew Swift toolchain:
```bash
# Build project
swift build

# Run tests
swift test
```

#### xcodebuild (Requires Xcode.app)
If you have Xcode.app installed, you can use `xcodebuild`:
```bash
# Build project
xcodebuild -scheme TelnyxDictation build

# Run tests
xcodebuild -scheme TelnyxDictation test
```


### Local Development (Swift Run)

To run the project directly from the source:

```bash
TELNYX_API_KEY="your_key" swift run TelnyxDictation
```

### Packaging as an App Bundle

Use the provided script to build and package the application into `TelnyxDictation.app`:

```bash
./Scripts/build-app.sh
```

This will create `TelnyxDictation.app` in the root directory. You can then run it with:

```bash
open TelnyxDictation.app
```

*Note: Ensure `TELNYX_API_KEY` is available in the environment where the app is launched.*




## Troubleshooting

- **No Transcript / Connection Error**:
    - Verify your `TELNYX_API_KEY` is correct and has STT permissions.
    - Check your internet connection.
    - Ensure the Telnyx STT service is operational.
- **No Auto-Paste**:
    - Ensure Accessibility permissions are granted in System Settings.
    - If denied, check your clipboard; the text should still be there.
- **Microphone Issues**:
    - Ensure the correct input device is selected in System Settings > Sound.
    - Verify Microphone permissions are granted for TelnyxDictation.
- **WebSocket / Auth Errors**:
    - Check the console output if running via `swift run` for specific error messages.

---

<details>
<summary><strong>LLM Instructions (automated setup)</strong></summary>

Use these instructions to fully set up and run TelnyxDictation on a fresh macOS machine. Execute each step in order. Do not skip steps or re-order them.

### Prerequisites

- macOS 14+ (Sonoma or later)
- Git access to `team-telnyx/telnyx-whisper` (internal repo — any org member can read)
- A valid Telnyx API key with STT permissions
- Swift toolchain: either Xcode.app or the Homebrew Swift package (`brew install swift`)

### Step 1: Clone the repository

```bash
git clone git@github.com:team-telnyx/telnyx-whisper.git
cd telnyx-whisper
```

### Step 2: Configure the API key

The app resolves `TELNYX_API_KEY` from environment variables and `.env` files. The recommended persistent location is `~/.config/telnyx-dictation/.env` — this survives app rebuilds and works when launched from Finder.

```bash
mkdir -p ~/.config/telnyx-dictation
echo 'TELNYX_API_KEY=<REPLACE_WITH_ACTUAL_KEY>' > ~/.config/telnyx-dictation/.env
chmod 600 ~/.config/telnyx-dictation/.env
```

The full resolution order (first match wins):
1. `TELNYX_API_KEY` process environment variable
2. `.env` in the current working directory
3. `.env` next to the `.app` bundle
4. `.env` in the parent of the `.app` bundle
5. `~/.env`
6. `~/.config/telnyx-dictation/.env`
7. `~/.opencode/.env`

**Do not hardcode the key in source files.** Do not commit `.env` files — they are gitignored.

### Step 3: Ensure Swift toolchain is available

```bash
# If using Homebrew Swift (no Xcode.app):
export PATH="/opt/homebrew/opt/swift/bin:$PATH"

# Verify:
swift --version
```

### Step 4: Build the project

```bash
swift build
```

This compiles debug binaries to `.build/debug/TelnyxDictation`.

### Step 5: Run tests

```bash
swift test
```

All tests should pass. Tests do not require a real API key — they use mocks.

### Step 6: Set up code signing (one-time, optional but recommended)

Code signing with a stable identity means macOS TCC permission grants (Microphone, Accessibility) persist across rebuilds. Without this, you must re-grant permissions after every rebuild.

```bash
./Scripts/create-codesign-cert.sh
```

This creates a self-signed "TelnyxDictation Dev" certificate in your login keychain. You will be prompted for your macOS login password. You only need to run this once per machine.

### Step 7: Build, sign, and launch the app bundle

For development (debug build + launch):

```bash
./Scripts/dev.sh
```

For a release build:

```bash
./Scripts/build-app.sh
open TelnyxDictation.app
```

### Step 8: Grant macOS permissions

On first launch, the app will request:

1. **Microphone access** — prompted automatically when you start dictation. Click Allow.
2. **Accessibility access** — required for auto-paste into the active application. The app will show an alert with a button to open System Settings. Navigate to: **System Settings > Privacy & Security > Accessibility** and toggle **TelnyxDictation** on.

If Accessibility is not granted, the app falls back to clipboard-only mode (copies text but does not auto-paste).

### Step 9: Verify the app works

1. Press `Cmd + Shift + L` to start dictation.
2. Speak into your microphone.
3. The app detects silence and auto-stops.
4. The transcript is pasted into the active application (or copied to clipboard if Accessibility is not granted).

### Architecture overview

```
Sources/
  TelnyxDictation/         # App entry point (main.swift)
  TelnyxDictationLib/      # All app logic
    AppDelegate.swift       # Menu bar UI, permission checks, session orchestration
    TelnyxAPIKeyResolver.swift   # .env file parsing and key resolution
    TelnyxSTTStreamingClient.swift  # WebSocket client for Telnyx STT API
    DictationCoordinator.swift   # Orchestrates audio capture → STT → text insertion
    AudioCaptureEngine.swift     # AVAudioEngine microphone capture
    SilenceDetector.swift        # RMS-based silence detection to auto-stop
    PasteboardTextInserter.swift # Clipboard + Accessibility paste
    GlobalHotKeyController.swift # Cmd+Shift+L / Esc hotkey registration
    HUDWindowController.swift    # Floating status popover
    MenuBarHUDPresenter.swift    # Menu bar icon state management
    DictationSession.swift       # Single dictation session state machine
    DictationSessionLogger.swift # NDJSON session logging
    AudioBarVisualizerView.swift # Audio level visualization
    SilenceThresholdSliderView.swift # Adjustable silence threshold UI
    MicrophoneDeviceManager.swift    # Input device enumeration
    PermissionManager.swift          # Microphone + Accessibility permission checks
    AudioMath.swift                  # RMS-to-display-level conversion
  TelnyxSTTSpike/          # Standalone WebSocket spike for debugging
Tests/
  TelnyxDictationTests/    # Unit tests (mocked, no API key needed)
Scripts/
  build-app.sh             # Release .app bundle builder
  create-codesign-cert.sh  # One-time code signing certificate setup
  dev.sh                   # Dev build + sign + launch
  measure-ambient.swift    # Microphone ambient noise measurement tool
SupportingFiles/
  Info.plist               # App bundle metadata (LSUIElement, mic usage description)
```

### Key technical details

- **WebSocket endpoint**: `wss://api.telnyx.com/v2/speech-to-text/transcription`
- **STT engine**: Deepgram/nova-3 via Telnyx (configurable in `TelnyxSTTStreamingClient.swift`)
- **Audio format**: 16-bit PCM, 16kHz, mono — converted from AVAudioEngine's native format
- **Auth**: `Authorization: Bearer <TELNYX_API_KEY>` header on the WebSocket handshake
- **Bundle ID**: `com.telnyx.dictation`
- **Minimum macOS**: 14.0 (Sonoma)
- **Swift tools version**: 5.9
- **No external dependencies** — pure Swift Package Manager, no CocoaPods/Carthage/SPM remote packages

### Common errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `Missing TELNYX_API_KEY` | No key found in env or any `.env` file | Create `~/.config/telnyx-dictation/.env` per Step 2 |
| `Microphone permission required` | macOS denied mic access | System Settings > Privacy & Security > Microphone > enable TelnyxDictation |
| `Clipboard-only mode` | Accessibility not granted | System Settings > Privacy & Security > Accessibility > enable TelnyxDictation |
| Build fails with `no such module` | Swift toolchain not found | `export PATH="/opt/homebrew/opt/swift/bin:$PATH"` |
| TCC resets after rebuild | Ad-hoc signing used | Run `./Scripts/create-codesign-cert.sh` once, then use `./Scripts/dev.sh` |

</details>
