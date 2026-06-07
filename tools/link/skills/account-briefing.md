---
name: Account Briefing
description: Create a concise account briefing from internal context.
owner: GTM
team: Sales
risk_level: medium
tools_required:
  - salesforce.account_lookup
  - slack.search
  - google_workspace.search
  - telnyx.account_lookup
customer_safe: false
approval_required: false
---

## When to use it

Use before customer calls, QBRs, renewal reviews, executive escalations, or internal handoffs.

## Inputs needed

- Customer or account identifier
- Meeting or briefing objective
- Time window for recent activity

## Workflow steps

- Load mocked CRM and Telnyx account context.
- Search mocked Slack and workspace notes for recent customer activity.
- Summarize account status, open opportunities, risks, active escalations, and next steps.
- Separate verified facts from assumptions.

## Expected output format

- Account snapshot
- Recent activity
- Product footprint
- Risks and open questions
- Recommended next actions

## Safety notes

- Internal-only by default.
- Do not include private notes, internal links, or revenue details in customer-facing output.
- Use shared-channel mode for any external draft.
