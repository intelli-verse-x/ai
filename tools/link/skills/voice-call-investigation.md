---
name: Voice Call Investigation
description: Investigate mocked voice call and SIP trace issues.
owner: Support
team: Voice
risk_level: medium
tools_required:
  - telnyx.voice_sip_traces.lookup
  - telnyx.network_carrier_status.lookup
  - datadog.incident_lookup
customer_safe: false
approval_required: false
---

## When to use it

Use for call setup failures, one-way audio reports, dropped calls, latency, or SIP signaling questions.

## Inputs needed

- Call identifier or SIP trace identifier
- Time window
- Reported symptom

## Workflow steps

- Load mocked call and SIP trace summary.
- Check mocked carrier and network status.
- Summarize call path, observed symptom, and likely failure point.
- Recommend internal and customer-safe next steps.

## Expected output format

- Call summary
- Observed behavior
- Evidence
- Likely cause
- Follow-up actions

## Safety notes

- Do not expose raw SIP traces, private routing IDs, or internal network notes externally.
- Shared-channel drafts must be redacted and approval-gated.
