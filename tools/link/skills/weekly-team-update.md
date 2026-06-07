---
name: Weekly Team Update
description: Create an internal weekly team update from mocked work context.
owner: Operations
team: All
risk_level: low
tools_required:
  - slack.search
  - google_workspace.search
  - linear_jira.search
customer_safe: false
approval_required: false
---

## When to use it

Use for internal weekly summaries of progress, blockers, customer themes, and decisions.

## Inputs needed

- Team name
- Date range
- Key projects or channels

## Workflow steps

- Gather mocked Slack, workspace, and ticket context.
- Group updates by project, customer theme, decision, and blocker.
- Call out owners and upcoming deadlines.
- Keep sensitive customer details internal.

## Expected output format

- Highlights
- Customer themes
- Decisions
- Blockers
- Next week priorities

## Safety notes

- Internal-only by default.
- Remove private customer details before reusing outside Telnyx.
