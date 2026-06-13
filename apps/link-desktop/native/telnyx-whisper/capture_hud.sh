#!/bin/bash
set -e

export PATH="/opt/homebrew/opt/swift/bin:$PATH"

echo "Building app..."
bash Scripts/build-app.sh

echo "Launching app..."
open TelnyxDictation.app

echo "Waiting for app to launch and HUD to appear..."
sleep 3

echo "Opening TextEdit..."
open -a TextEdit

echo "Waiting for TextEdit..."
sleep 2

echo "Taking screenshot..."
mkdir -p .sisyphus/evidence
screencapture -x .sisyphus/evidence/task-11-hud.png

echo "Killing app..."
killall TelnyxDictation || true
killall TextEdit || true

echo "Done!"
