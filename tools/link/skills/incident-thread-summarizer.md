---
name: Incident Thread Summarizer
description: Summarize an incident thread for internal coordination.
owner: Engineering
team: SRE
risk_level: medium
tools_required:
  - slack.search
  - datadog.incident_lookup
  - linear_jira.search
customer_safe: false
approval_required: false
---

## When to use it

Use during or after incidents to summarize what happened, who owns what, and what update should go out next.

## Inputs needed

- Incident identifier or thread link
- Desired audience
- Time range

## Workflow steps

- Gather mocked Slack, incident, and ticket context.
- Build a timeline and ownership map.
- Identify unresolved questions and follow-up tasks.
- Produce a customer-safe summary candidate when requested.

## Expected output format

- Current status
- Timeline
- Impact
- Owners
- Decisions made
- Follow-up tasks

## Safety notes

- Internal incident details are not customer-safe by default.
- External summaries require shared-channel approval.
