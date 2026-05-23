# Managed Telecom Agents

Use this pattern when you want a Telnyx-managed agent package for a bounded telecom workflow instead of an open-ended "agent that can do everything."

## Recommended First Slice

Start with **voice debugging and call-triage**.

This repo already contains the right paved road in [`tools/mcp-apps/apps/voice-monitor`](/tools/mcp-apps/apps/voice-monitor):

- the workflow is operationally real, not a toy demo
- the tool surface is already read-only
- the app preserves the IDs humans need for escalation while redacting sensitive payloads
- the failure modes are familiar and high-value: webhook failures, timing gaps, call status drift, recordings, and AI assistant wiring

This beats messaging deliverability, SIP routing mutation, or assistant self-healing as a first package because it proves the control-plane pattern without requiring write access on day one.

## Package Shape

A managed telecom agent package should map onto existing repo surfaces like this:

| Layer | Repo surface | Role |
| --- | --- | --- |
| Discovery and auth | [`agent.json`](/agent.json), [`README.md`](/README.md) | Publish bearer-auth discovery, MCP entry points, capability links, and quickstarts |
| Runtime operating contract | [`AGENTS.md`](/AGENTS.md) | Define how coding/runtime agents should approach setup, tests, and package boundaries |
| Workflow-specific behavior | `skills/<workflow>/SKILL.md` | Encode the narrow task, required identifiers, escalation path, and safe operating steps |
| Focused tool surface | [`tools/mcp-apps`](/tools/mcp-apps) app or [`tools/mcp`](/tools/mcp) proxy | Expose only the MCP tools the workflow needs |
| Human/operator guide | `guides/<workflow>.md` | Show prerequisites, trust boundaries, and the paved-road debug or recovery flow |
| Optional provisioning wrapper | [`cli/`](/cli) | Collapse setup into a repeatable command when the workflow benefits from one-shot provisioning |

The package should be versioned as a **bundle**, not as disconnected docs. In practice that means the skill, guide, MCP app surface, and any manifest/discovery changes land together in one change set.

## Control Boundaries

Default to **diagnostic-first** packaging.

Diagnostic actions belong in the base package:

- read call state, timelines, recordings, webhook deliveries, and account-safe metadata
- summarize evidence into a debug report
- preserve operational IDs such as `connection_id`, `call_control_id`, `call_leg_id`, `call_session_id`, `assistant_id`, and `conversation_id`
- redact phone numbers, recording URLs, transcripts, credentials, and arbitrary metadata unless the workflow explicitly requires them

Mutating actions should be separated behind a second package or approval gate:

- hanging up or transferring a call
- changing SIP connection or voice application configuration
- patching assistant instructions or model settings
- replaying webhooks or modifying queues/conferences
- buying numbers, changing billing state, or rotating credentials

The rule is simple: if a tool can change customer traffic, billing, routing, policy, or retained content, do not ship it in the diagnostic package by default.

## Least-Privilege Defaults

The default managed package should assume:

- one workflow-specific MCP app, not the entire generic API surface
- read-only Telnyx API credentials where the workflow allows it
- capped lookback windows, page sizes, and discovery breadth
- explicit environment variables for every guardrail
- no cross-account or cross-project actions without an operator choosing the scope

For the first voice package, the existing `voice-monitor` guardrails are the right model:

- read-only app semantics
- bounded page and time windows
- redaction of sensitive artifacts
- manual escalation path once the diagnosis identifies the next human or mutating action

## Audit Expectations

Every managed telecom package should produce enough evidence for a human to understand what happened without replaying the whole session.

Minimum audit trail:

- package version or git revision
- MCP app/tool invoked
- sanitized input filters
- preserved operational IDs
- timestamps and correlation windows
- any redaction behavior applied
- the final recommendation or escalation target

For mutating follow-up packages, add:

- before/after config summary
- actor identity
- approval or confirmation reference
- rollback path

The existing repo already points in this direction through the read-only `voice-monitor` design and the evidence-oriented handoff guidance in [`guides/evidence-handoff.md`](/guides/evidence-handoff.md).

## AGENTS.md and SKILL.md Roles

Use the files differently:

- `AGENTS.md` defines the repo-level operating contract: setup, test commands, generated directories, and where canonical sources live
- `SKILL.md` defines the workflow contract: what the agent is trying to achieve, what identifiers it needs, which tools are allowed, what must be redacted, and when to escalate

Do not put workflow-specific telecom policy only in `AGENTS.md`; runtime agents consuming the package need the narrow instructions in the skill itself.

## MCP Surface Pattern

Prefer a two-tier surface:

1. `tools/mcp` remains the broad remote API proxy for expert or build-your-own clients.
2. `tools/mcp-apps/apps/<workflow>` provides the narrow managed package for a specific telecom job.

That keeps the package aligned with the current repo shape:

- broad access still exists for power users
- the managed package uses a purpose-built MCP app with constrained tools and UI resources
- the guide and skill can describe one stable surface instead of an unbounded API catalog

## First Vertical Slice

Implement the first managed telecom package as **Voice Incident Triage** built on `voice-monitor`.

Scope:

- active-call lookup
- call timeline inspection
- call status lookup
- recording discovery with redaction
- debug report generation for voice AI and call-control incidents

Success criteria for that slice:

- a runtime agent can diagnose a live or recent voice incident without write access
- the package returns stable correlation IDs for human escalation
- the guide, skill, and MCP app all describe the same operational path
- the package makes it obvious when a separate mutating workflow is required

## Follow-Up Implementation Tickets

After the diagnostic voice package is formalized, the next repo tickets should be:

1. Add a dedicated `skills/voice-incident-triage/SKILL.md` that points directly at the `voice-monitor` MCP app and documents escalation rules.
2. Add package-level discovery metadata so the managed workflow is listed as a first-class guided surface, not only as a source tree path.
3. Define a separate approval-gated mutating package for voice remediation actions, if needed, rather than widening the diagnostic package.

## Why This Pattern

The reusable Telnyx pattern is:

- discovery in `agent.json`
- repo/runtime contract in `AGENTS.md`
- narrow workflow behavior in `SKILL.md`
- constrained execution in an MCP app
- audit-ready human handoff in a guide

That gives Telnyx a managed telecom agent package that looks like the rest of the repo, uses existing runtime surfaces, and starts from the safest high-signal workflow already present in code.
