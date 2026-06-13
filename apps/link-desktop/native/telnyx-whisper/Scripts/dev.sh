#!/usr/bin/env bash
# dev.sh – Build, assemble .app bundle, codesign, and launch.
# Uses a self-signed "TelnyxDictation Dev" certificate so that macOS TCC
# (Accessibility, Microphone) grants persist across rebuilds.
#
# First-time setup (one-time):
#   1. Run: ./Scripts/create-codesign-cert.sh
#   2. Grant Accessibility in System Settings when prompted
#   After that, rebuilds preserve the grant automatically.
#
# Usage:
#   ./Scripts/dev.sh          # build + launch (or relaunch after changes)
#   ./Scripts/dev.sh --open    # skip build, just open the existing .app
set -euo pipefail

PRODUCT_NAME="TelnyxDictation"
APP_BUNDLE="${PRODUCT_NAME}.app"
CONTENTS_DIR="${APP_BUNDLE}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
ENTITLEMENTS="SupportingFiles/TelnyxDictation.entitlements"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Code signing identity — self-signed cert for stable TCC grants across rebuilds.
# Falls back to ad-hoc ("-") if the cert isn't installed.
CODESIGN_IDENTITY="TelnyxDictation Dev"
if ! security find-identity -v -p codesigning 2>/dev/null | grep -q "${CODESIGN_IDENTITY}"; then
    echo "⚠  Certificate '${CODESIGN_IDENTITY}' not found. Using ad-hoc signing."
    echo "   Run ./Scripts/create-codesign-cert.sh for persistent TCC grants."
    CODESIGN_IDENTITY="-"
fi

# --open flag: skip build, just open the existing bundle
if [[ "${1:-}" == "--open" ]]; then
    if [ ! -d "$APP_BUNDLE" ]; then
        echo "Error: ${APP_BUNDLE} does not exist. Run without --open first."
        exit 1
    fi
    open "$APP_BUNDLE"
    exit 0
fi

# 1. Build from source
echo "▸ Building ${PRODUCT_NAME} (debug)…"
PATH="/opt/homebrew/opt/swift/bin:$PATH" swift build 2>&1
echo "  Build complete."

# 2. Kill any running instance BEFORE replacing the binary
if pgrep -f "${PRODUCT_NAME}" >/dev/null 2>&1; then
    echo "▸ Stopping running instance…"
    pkill -f "${PRODUCT_NAME}" || true
    sleep 0.5
fi

# 3. Assemble .app bundle — real binary as main executable
echo "▸ Assembling ${APP_BUNDLE}…"
mkdir -p "$MACOS_DIR"

# Copy the real Swift binary as the CFBundleExecutable
cp ".build/debug/${PRODUCT_NAME}" "${MACOS_DIR}/${PRODUCT_NAME}"
cp SupportingFiles/Info.plist "${CONTENTS_DIR}/Info.plist"

# 4. Codesign the binary with entitlements (mic + accessibility)
if [ -f "$ENTITLEMENTS" ]; then
    codesign --force --sign "${CODESIGN_IDENTITY}" --identifier com.telnyx.dictation \
        --entitlements "$ENTITLEMENTS" \
        "${MACOS_DIR}/${PRODUCT_NAME}"
    if [ "$CODESIGN_IDENTITY" = "-" ]; then
        echo "  Codesigned (ad-hoc) — TCC grants will reset on next rebuild."
    else
        echo "  Codesigned with '${CODESIGN_IDENTITY}' — TCC grants persist across rebuilds."
    fi
fi

echo "  Bundle ready."

# 5. Launch
echo "▸ Launching ${APP_BUNDLE}…"
open "$APP_BUNDLE"

echo ""
echo "✓ To rebuild & relaunch after code changes, just run: ./Scripts/dev.sh"
