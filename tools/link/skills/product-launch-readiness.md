---
name: Product Launch Readiness
description: Check mocked readiness signals for a product launch.
owner: Product
team: Product
risk_level: medium
tools_required:
  - google_workspace.search
  - guru.search
  - github.repo_search
  - linear_jira.search
customer_safe: false
approval_required: false
---

## When to use it

Use before internal or external product launches to identify missing docs, open issues, dependencies, and stakeholder updates.

## Inputs needed

- Product or launch name
- Target launch date
- Intended audience

## Workflow steps

- Search mocked docs, launch plans, tickets, and code references.
- Check readiness across docs, support, engineering, GTM, and risk.
- List blockers, owners, and next actions.
- Flag customer-visible materials for approval.

## Expected output format

- Readiness score
- Blockers
- Owner map
- Launch risks
- Required approvals
- Next actions

## Safety notes

- Do not publish customer-visible docs or launch announcements without approval.
- Treat unreleased product details as internal-only.
