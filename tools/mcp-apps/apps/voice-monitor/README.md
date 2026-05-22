# Telnyx Voice Monitor MCP App

Read-only Telnyx MCP App for active-call monitoring, call timelines, call status, post-call recording discovery, and paved-road voice AI debugging.

## Tools

- `voice_monitor_list_options` — discovers connections, call-control applications, and voice numbers for dropdowns.
- `voice_monitor_active_calls` — lists active calls for a selected connection, or a capped set of discovered connections when omitted.
- `voice_monitor_call_timeline` — reads `GET /call_events` with supported deepObject filters.
- `voice_monitor_call_status` — reads `GET /calls/{call_control_id}`.
- `voice_monitor_recordings` — searches recordings with sensitive URLs/transcripts/metadata redacted.
- `voice_monitor_debug_report` — summarizes the paved-road debugging surfaces for a live voice AI flow: timeline inspection, webhook failures, latency buckets, provider usage, and terminal error reasons.

## Safety

This app is read-only. It does not answer, hang up, transfer, speak, record, modify conferences, modify queues, or mutate Telnyx resources.

The app preserves operational IDs needed for follow-up (`connection_id`, `call_control_id`, `call_leg_id`, `call_session_id`) while redacting phone numbers, credentials, recording URLs, transcripts, and metadata.

## Paved-Road Debugging

Use `voice_monitor_debug_report` or the UI button after a live bootstrap call. Capture at least one of these IDs from the bootstrap output or `call.conversation.ended` webhook:

- `call_control_id`
- `call_session_id`
- `connection_id`
- `assistant_id`
- `conversation_id`

Minimum signal per surface:

- Timeline inspection: event count, event names, first/last timestamps, and the exact filters used for the lookup.
- Webhook failures: failed delivery count plus sample delivery IDs / status codes for the call control app webhook.
- Latency buckets: histogram of inter-event gaps (`<1s`, `1-5s`, `5-15s`, `15-60s`, `60s+`) plus any call duration returned by call status.
- Provider usage: assistant ID, LLM model, STT model, TTS provider, and TTS voice/model identifiers discovered from the call flow.
- Terminal error reasons: any surfaced `hangup_cause`, `failure_cause`, `error_reason`, `error_code`, or terminal `result` values tied back to the correlated call IDs.

For the paved-road assistant wiring, the call control application webhook URL should point at `https://api.telnyx.com/v2/ai/assistants/{assistant_id}/answer`; the debug report uses the associated call control application ID (`connection_id` in webhook payloads) to discover related webhook delivery failures when possible.

## Configuration

Copy `.env.example` and set:

```sh
TELNYX_API_KEY=***
```

Optional guardrails:

```sh
VOICE_MONITOR_MAX_PAGE_SIZE=100
VOICE_MONITOR_MAX_DISCOVERY_CONNECTIONS=10
VOICE_MONITOR_MAX_TIMELINE_WINDOW_HOURS=168
VOICE_MONITOR_MAX_RECORDING_WINDOW_HOURS=168
```

## Development

From `tools/mcp-apps`:

```sh
npm install
npm --workspace @telnyx-mcp-apps/voice-monitor test
npm --workspace @telnyx-mcp-apps/voice-monitor run typecheck
npm --workspace @telnyx-mcp-apps/voice-monitor run build
```
