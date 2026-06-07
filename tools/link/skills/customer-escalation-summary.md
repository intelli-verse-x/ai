---
name: Customer Escalation Summary
description: Summarize a customer escalation for internal stakeholders.
owner: Support
team: Customer Support
risk_level: medium
tools_required:
  - linear_jira.search
  - slack.search
  - telnyx.account_lookup
  - datadog.incident_lookup
customer_safe: false
approval_required: false
---

## When to use it

Use when a customer issue needs an internal update for support, engineering, GTM, or leadership.

## Inputs needed

- Customer identifier
- Escalation or ticket identifier
- Relevant thread or incident context

## Workflow steps

- Gather mocked ticket, account, Slack, and incident context.
- Build a timeline of events and current status.
- Identify impact, owner, next action, and escalation path.
- Flag what is safe versus unsafe to share externally.

## Expected output format

- Executive summary
- Timeline
- Customer impact
- Current owner
- Next update time
- Customer-safe summary candidate

## Safety notes

- Do not expose raw logs, internal channels, private tickets, or unreleased mitigations externally.
- Customer-facing drafts require separate shared-channel review.
