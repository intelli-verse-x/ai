# Telnyx Link

Telnyx Link is an internal employee AI companion for Telnyx. It combines a desktop workspace, personal and squad agents, Telnyx Skills, memory, safe approvals, phone workflows, and connector-aware tool access into one company harness.

The current repo is an MVP shell. It is designed to be live-ready, but it falls back to deterministic mocked data unless the relevant Okta session, saved Settings credential, or local developer environment variable is configured.

## What Is Included

- `apps/link-desktop` - Electron/React desktop app for Telnyx Link.
- `tools/link` - mocked Link runtime, skills loader, approvals, shared-channel safety, audit logging, and agent/tool definitions.
- `skills` - Git-backed Telnyx skill library used by the Experto Crede page.
- `script/build_and_run.sh` - root helper to build and relaunch the desktop app.

## Desktop App

Run the Electron app from the repo root:

```sh
./script/build_and_run.sh
```

Run verification:

```sh
cd apps/link-desktop
npm run typecheck
npm test
npm run build
```

The desktop app includes:

- Widgets dashboard
- Agent Chat with persistent chat sessions and generated document previews
- Phone setup, contacts, SIP/WebRTC controls, and Telnyx AI Assistant configuration
- My Agents / Agent Control Plane integration path
- Company Library search across internal knowledge adapters
- Task Board
- Memory Bank with Hindsight-style bank tabs
- Experto Crede with Telnyx Skills, squad kits, and app marketplace
- Settings for Okta, credentials, agent plugins, and the design system

## Credentials And Secrets

Do not commit local credentials.

Local developer overrides belong in:

```text
apps/link-desktop/.env.local
```

That file is ignored by git. Credential values saved through the app Settings page are encrypted with Electron `safeStorage`, stored under Electron user data, and never returned to the renderer after save.

Common local variables:

```sh
AGENT_CONTROL_PLANE_URL=http://agent-control-plane.query.prod.telnyx.io:8000
AGENT_CONTROL_PLANE_AUTH_MODE=okta

LITELLM_BASE_URL=http://litellm-aiswe.query.prod.telnyx.io:4000
LITELLM_API_KEY=...
LITELLM_MODEL=...

HINDSIGHT_API_URL=https://api-internal.telnyx.com/hindsight
HINDSIGHT_API_KEY=...
HINDSIGHT_BANK_ID=...

GURU_USER_EMAIL=you@telnyx.com
GURU_USER_TOKEN=...

GH_TOKEN=...
SLACK_USER_TOKEN=...
SLACK_BOT_TOKEN=...
TELNYX_API_KEY=...
LINEAR_API_KEY=...
```

Okta passwords should never be stored in `.env.local`.

## Link Runtime

Run the mocked runtime directly:

```sh
cd tools/link
npm ci
npm run link:dev -- "brief me on Acme Messaging"
npm run link:skill -- "SMS Delivery Investigation"
npm run link:shared-channel
```

Verify it:

```sh
cd tools/link
npm run typecheck
npm test
```

## Safety Model

The MVP preserves these boundaries:

- External/customer-visible actions are approval-gated.
- Shared-channel drafts include customer-safe output plus internal rationale.
- Credentials are not rendered after save.
- Memory writes are explicit and user-controlled.
- Live adapters use mock fallback when access is absent.

## GitHub

This repository is intended to publish to:

```text
https://github.com/team-telnyx/link
```
