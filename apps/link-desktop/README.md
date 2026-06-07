# Telnyx Link Desktop

This is the first Electron desktop shell for Telnyx Link. It is intentionally wired to the mocked `tools/link` runtime and does not connect to production systems.

## Run Locally

```bash
../../script/build_and_run.sh
```

Browser preview for UI QA:

```bash
npm run preview
```

## Local Credentials

The normal setup path is the Settings page. Credential fields there are write-only: saved values are encrypted with Electron `safeStorage`, stored under Electron user data, and never returned to the renderer after save.

`.env.local` remains supported as a developer override. The root `script/build_and_run.sh` and `npm run dev` both load it automatically. Environment variables take precedence over saved Settings credentials.

The Agent Control Plane should use Okta SSO (`AGENT_CONTROL_PLANE_AUTH_MODE=okta`); do not put an Okta password in this file. `TELNYX_ACTOR` and `TELNYX_ON_BEHALF_OF` are optional routing hints for ACP endpoints that require explicit user or squad context.

The Settings view exposes a `Sign in with Okta` action for Agent Control Plane. It opens ACP `/auth/login` in an Electron auth window and keeps the resulting ACP cookies in the Electron session. If a specific hosted agent endpoint requires a squad context, set `TELNYX_ON_BEHALF_OF` to that squad id ending in `.squad`.

Verification:

```bash
npm run typecheck
npm test
npm run build
```

## Current Surfaces

- Workspaces with persisted tabs, Link-created files, automations, approvals, and change requests
- Explorer search across mocked Guru, Google Drive, Link files, skills, agents, and memory
- Chats with Telnyx LiteLLM-ready runtime fallback and admin-reviewed Link improvement requests
- Skills from `tools/link/skills` and the root Telnyx Git-backed `skills/` directory
- Agents directory with Agent Control Plane Okta readiness and mocked fallback agents
- Connections with connector status and Auto/Allow/Ask tool permission groups
- Memory with Hindsight-ready banks, recall testing, and explicit refresh state
- Dojo with personal and squad bot training kits
- Internal Design System and Settings surfaces

Generated drafts, approval decisions, automations, and connector request state are persisted in Electron user data.

The app uses hybrid live-ready adapters. It contacts production services only when the related saved credentials, environment variables, or Okta session are configured; otherwise it returns deterministic mocked data.

Useful developer override environment variables:

```bash
AGENT_CONTROL_PLANE_URL=http://agent-control-plane.query.prod.telnyx.io:8000
AGENT_CONTROL_PLANE_AUTH_MODE=okta
# Optional ACP routing hints:
TELNYX_ACTOR=
TELNYX_ON_BEHALF_OF=

# LiteLLM base URL defaults to http://litellm-aiswe.query.prod.telnyx.io:4000.
# Get your per-user key from AI-swe-Agent in Slack channel D0995UB1PLY.
LITELLM_API_KEY=...
LITELLM_MODEL=...
# Optional override:
LITELLM_BASE_URL=http://litellm-aiswe.query.prod.telnyx.io:4000

HINDSIGHT_API_URL=https://api-internal.telnyx.com/hindsight
# Hindsight keys are user and bank scoped.
# Create one in Hindsight: http://hindsight-ui.query.prod.telnyx.io:9998/banks/<encoded-bank-id>/keys
# Example bank id: user:pete:test-test
HINDSIGHT_API_KEY=...
HINDSIGHT_BANK_ID=...

# Guru user auth uses Basic Auth: username is your Guru user/email, password is your user token.
# Generate it in Guru: Manage -> Apps & Integrations -> API Access -> Generate User Token.
GURU_USER_EMAIL=you@telnyx.com
GURU_USER_TOKEN=...
# Optional collection-token fallback:
GURU_COLLECTION_ID=
GURU_COLLECTION_TOKEN=
GOOGLE_DRIVE_ACCESS_TOKEN=...
GH_TOKEN=...

# Slack agent directory and interaction.
# SLACK_USER_TOKEN with users:read, im:write, chat:write can discover bot users and open DMs.
# SLACK_BOT_TOKEN with users:read, chat:write can discover bots and post where the app has access.
SLACK_USER_TOKEN=
SLACK_BOT_TOKEN=
```
