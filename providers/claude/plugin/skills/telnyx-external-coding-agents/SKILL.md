---
name: telnyx-external-coding-agents
description: >-
  Curated Telnyx skill-pack for external coding agents building voice AI,
  messaging, and onboarding flows. Packages discovery, auth, focused MCP apps,
  and the right product guides so agents stay on a bounded, low-hallucination
  path.
user_invocable: true
metadata:
  author: telnyx
  product: external-coding-agents
  compatibility: "Works best with Skills CLI plus either focused MCP Apps or the Telnyx SDKs for Python and TypeScript."
---

# Telnyx External Coding Agents

Use this skill as the default Telnyx entrypoint when a coding agent needs to build a real workflow instead of reading isolated product docs. The package is intentionally narrow: onboarding, voice AI bootstrap, messaging, and the safest MCP surfaces to debug or execute those flows.

## What This Skill-Pack Covers

- agent discovery and auth bootstrap
- first-run Telnyx voice AI setup
- bounded messaging execution and status follow-up
- read-only voice diagnostics after a live call
- the handoff from broad docs to the exact product skill or guide needed for implementation

## Start Here

Always take the same path before writing code:

1. Start discovery at `https://telnyx.com/agents/start`.
2. Read `https://telnyx.com/auth.md` and `https://telnyx.com/agent-signup.md`.
3. Treat `https://telnyx.com/.well-known/agent-access.json`, `https://telnyx.com/.well-known/agent-card.json`, and `https://telnyx.com/.well-known/agent-skills/index.json` as the machine-readable contract.
4. Choose the narrowest execution surface that fits the job.

## Choose The Right Surface

Use these surfaces in order of preference:

| Need | Use | Why |
| --- | --- | --- |
| Read-first voice debugging after a live call or webhook failure | `tools/mcp-apps/apps/voice-monitor` | Preserves `connection_id`, `call_control_id`, `call_leg_id`, `call_session_id`, `assistant_id`, and `conversation_id` while redacting sensitive data |
| Bounded outbound messaging, outbound calling, or verification | `tools/mcp-apps/apps/governed-communications` | Keeps sender, connection, and profile choices inside allowlists and requires idempotency keys |
| Product-specific implementation details | `skills/telnyx-ai-assistants-*`, `skills/telnyx-messaging-*`, `skills/telnyx-account-*`, and related guides | Gives the agent exact REST and SDK patterns for the target language |
| Broad exploratory access for expert operators | `https://api.telnyx.com/v2/mcp` or the SDK/toolkit | Use only when the focused MCP app boundary is too narrow |

Do not start with the broad proxy when a focused MCP app already matches the workflow.

## Recommended Pairings

Choose one language track and keep the rest out of context:

| Workflow | Primary guide | Product skills to load next |
| --- | --- | --- |
| Voice AI bootstrap | `guides/voice-agent-onboarding.md` and `guides/ai-assistants.md` | `telnyx-ai-assistants-<language>`, `telnyx-voice-<language>` |
| SMS follow-up or outbound messaging | `guides/sms-messaging.md` | `telnyx-messaging-<language>`, `telnyx-messaging-profiles-<language>` |
| Auth, webhook validation, and account setup | `auth.md`, `guides/webhooks.md` | `telnyx-account-<language>`, `telnyx-oauth-<language>` when delegated auth is required |

## Voice AI Path

For a first live voice AI path:

1. Create the assistant from `guides/ai-assistants.md`.
2. Use the answer-webhook bootstrap in `guides/voice-agent-onboarding.md`.
3. Capture `assistant_id`, `connection_id`, `call_control_id`, `call_session_id`, and `conversation_id`.
4. Move immediately to `voice-monitor` for diagnosis instead of widening the runtime prompt with raw voice APIs.

Never invent model IDs, connection IDs, or assistant IDs. Resolve them from the live API or CLI first.

## Messaging Path

For messaging or missed-call follow-up:

1. Use `guides/sms-messaging.md` for the API shape.
2. Prefer `governed-communications` when the agent should actually send or inspect messages from a bounded sender set.
3. Keep `messaging_profile_id`, sender numbers, and verify profile IDs explicit in code or environment, never implied from prose.

## Auth And Onboarding Path

Use this order:

1. `agent-signup.md` for account creation expectations
2. `auth.md` for bearer auth and protected-resource discovery
3. `agent.json` for the canonical auth and discovery contract
4. `guides/webhooks.md` for Ed25519 verification and delivery debugging

If the flow can run on a demo or read-first path, prefer that before requiring broad authenticated mutation.

## Hallucination Guards

When building with Telnyx, follow these rules:

- Preserve real operational IDs instead of summarizing them away.
- Keep each workflow on one product surface at a time: voice AI, messaging, auth, or diagnostics.
- Verify hosted model IDs against the live catalog before automating around them.
- Prefer focused MCP apps for execution and use product skills for code generation.
- Escalate from read-only diagnostics to a separate reviewed mutating path rather than quietly broadening the prompt surface.

## Example Installs

Install the skill-pack:

```sh
npx skills add team-telnyx/ai --skill telnyx-external-coding-agents --agent codex
```

Then add the smallest product skills for the target stack:

```sh
npx skills add team-telnyx/ai --skill telnyx-ai-assistants-python --agent codex
npx skills add team-telnyx/ai --skill telnyx-messaging-python --agent codex
```

## Why This Package Exists

External coding agents usually fail on Telnyx in one of four ways:

- they start from a broad API surface instead of a paved-road workflow
- they drop the IDs needed to debug the first live run
- they invent account resources instead of resolving them
- they mix discovery, diagnostics, and mutation in one unbounded prompt

This skill-pack reduces that friction by giving one bounded entrypoint that points agents at the exact guide, skill, or MCP app they should use next.
