# Telnyx Link Desktop Instructions

This package is the Electron desktop shell for Telnyx Link.

- Keep the app wired to mocked `tools/link` data until production integrations are explicitly requested.
- Shared customer drafts must preserve the Link approval and redaction boundaries.
- Use `tools/link/docs/glass-reference.md` for product direction, but do not copy Ramp branding or assets.
- Add or update tests for IPC, renderer state, or safety-critical UX changes.
- Run `npm run typecheck`, `npm test`, and `npm run build` from `apps/link-desktop` before declaring desktop changes complete.
