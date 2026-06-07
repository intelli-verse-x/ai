---
name: SMS Delivery Investigation
description: Investigate mocked SMS delivery issues using safe internal context.
owner: Support
team: Messaging
risk_level: medium
tools_required:
  - telnyx.messaging_logs.lookup
  - telnyx.network_carrier_status.lookup
  - datadog.incident_lookup
  - snowflake.query_preview
customer_safe: false
approval_required: false
---

## When to use it

Use when a customer reports delayed, failed, or inconsistent SMS delivery.

## Inputs needed

- Customer or account identifier
- Message ID, campaign, sender, destination country, or time window
- Customer-visible symptom

## Workflow steps

- Review mocked message delivery status and carrier handoff context.
- Check mocked network and carrier status.
- Compare aggregate delivery metrics from mocked analytics.
- Produce likely cause, confidence, and next recommended investigation step.

## Expected output format

- Problem statement
- Evidence summary
- Impact and scope
- Likely cause
- Next steps
- Customer-safe wording

## Safety notes

- Never expose raw message logs or carrier route diagnostics externally.
- Use plain-language summaries in shared customer channels.
