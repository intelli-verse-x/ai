---
name: Support Reply Draft
description: Draft a support reply from mocked investigation context.
owner: Support
team: Customer Support
risk_level: medium
tools_required:
  - linear_jira.search
  - telnyx.account_lookup
  - guru.search
customer_safe: true
approval_required: true
---

## When to use it

Use when support needs a concise reply draft that explains status, next steps, or resolution in customer-safe language.

## Inputs needed

- Customer identifier
- Ticket or thread context
- Desired tone and next update time

## Workflow steps

- Review mocked ticket, account, and knowledge context.
- Strip internal-only diagnostics and private notes.
- Draft a customer-safe reply with clear next steps.
- Require review before sending.

## Expected output format

- Customer-safe reply
- Internal rationale
- Assumptions
- Approval status

## Safety notes

- Sending customer-visible replies requires human approval.
- Do not include internal links, raw logs, or private notes.
