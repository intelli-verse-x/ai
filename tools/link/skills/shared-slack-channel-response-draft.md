---
name: Shared Slack Channel Response Draft
description: Draft a customer-safe response for a shared Slack channel.
owner: Support
team: Customer Support
risk_level: high
tools_required:
  - slack.search
  - telnyx.account_lookup
customer_safe: true
approval_required: true
---

## When to use it

Use when a Telnyx employee needs a draft response for a Slack Connect or other shared customer channel.

## Inputs needed

- Channel type
- Customer or account identifier
- User prompt
- Thread context
- Requested action

## Workflow steps

- Separate internal rationale from customer-facing content.
- Remove internal-only links, raw logs, private notes, and confidential account details.
- Draft a concise customer-safe response.
- Mark approval as required before posting.

## Expected output format

- Customer-safe draft
- Internal rationale
- Sources used
- Approval status

## Safety notes

- Never post externally without human approval.
- Do not reveal internal Slack messages, raw logs, private records, or internal-only systems.
