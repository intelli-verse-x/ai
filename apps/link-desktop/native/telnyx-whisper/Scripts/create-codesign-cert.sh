#!/usr/bin/env bash
# create-codesign-cert.sh — One-time setup for a self-signed code signing certificate.
#
# This creates a "TelnyxDictation Dev" identity in your login keychain so that
# dev.sh can sign the .app bundle with a stable identity. macOS TCC grants
# (Accessibility, Microphone) survive rebuilds because the signing authority
# stays the same.
#
# Usage: ./Scripts/create-codesign-cert.sh
# You only need to run this ONCE per machine.

set -euo pipefail

CERT_NAME="TelnyxDictation Dev"
CERT_ORG="TelnyxDev"
KEYCHAIN="$HOME/Library/Keychains/login.keychain-db"
TMPDIR_CERT="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_CERT"' EXIT

# Check if already installed
if security find-identity -v -p codesigning 2>/dev/null | grep -q "${CERT_NAME}"; then
    echo "✓ Certificate '${CERT_NAME}' already exists. Nothing to do."
    security find-identity -v -p codesigning 2>/dev/null | grep "${CERT_NAME}"
    exit 0
fi

echo "▸ Creating self-signed code signing certificate '${CERT_NAME}'…"

# 1. Create OpenSSL config with Code Signing EKU
cat > "$TMPDIR_CERT/cert.cfg" << EOF
[ req ]
distinguished_name = req_dn
x509_extensions = codesign_ext
prompt = no

[ req_dn ]
CN = ${CERT_NAME}
O = ${CERT_ORG}

[ codesign_ext ]
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, codeSigning
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
EOF

# 2. Generate certificate (valid for 10 years)
openssl req -x509 -newkey rsa:2048 \
    -keyout "$TMPDIR_CERT/key.pem" \
    -out "$TMPDIR_CERT/cert.pem" \
    -days 3650 -nodes \
    -config "$TMPDIR_CERT/cert.cfg" 2>/dev/null

echo "  Certificate generated."

# 3. Export to PKCS12
PASS="tmp$$"
openssl pkcs12 -export \
    -out "$TMPDIR_CERT/cert.p12" \
    -inkey "$TMPDIR_CERT/key.pem" \
    -in "$TMPDIR_CERT/cert.pem" \
    -passout "pass:${PASS}" \
    -legacy 2>/dev/null

# 4. Import into login keychain
echo "▸ Importing into login keychain…"
echo "  (You may be prompted for your macOS login password.)"
security import "$TMPDIR_CERT/cert.p12" \
    -k "$KEYCHAIN" \
    -P "$PASS" \
    -T /usr/bin/codesign \
    -T /usr/bin/security

# 5. Trust the certificate for code signing
echo "▸ Setting trust policy for code signing…"
echo "  (You may be prompted for your macOS login password.)"
security add-trusted-cert -d -r trustRoot -p codeSign \
    -k "$KEYCHAIN" \
    "$TMPDIR_CERT/cert.pem"

# 6. Verify
echo ""
if security find-identity -v -p codesigning 2>/dev/null | grep -q "${CERT_NAME}"; then
    echo "✓ Certificate '${CERT_NAME}' installed successfully!"
    security find-identity -v -p codesigning 2>/dev/null | grep "${CERT_NAME}"
    echo ""
    echo "  You can now run ./Scripts/dev.sh — TCC grants will persist across rebuilds."
else
    echo "✗ Certificate installation failed."
    echo "  Fallback: Open Keychain Access → Certificate Assistant → Create a Certificate"
    echo "  Name: ${CERT_NAME}, Type: Code Signing"
    exit 1
fi
