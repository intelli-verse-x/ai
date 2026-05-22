# Publish Re-Enable Checklist

This directory holds the repo-local publish re-enable record used by `.github/bin/check-publish-gate`.

- Source of truth: `.github/release/re-enable-checklist.json`
- Required publish state: `APPROVED`
- Enforced on: `.github/workflows/publish-npm.yml`, `.github/workflows/publish-pypi.yml`, and direct calls to `.github/bin/publish-npm` / `.github/bin/publish-pypi`

Required checklist states follow the TEL-70 model:

- `OPEN`
- `IN_REVIEW`
- `APPROVED`
- `FAILED`
- `EXPIRED`

Each required item must have:

- `required: true`
- `passed: true`
- at least one evidence entry in `evidence`

The top-level approval window must stay current:

- `window.startsAt`
- `window.expiresAt`
- `approver.name`
- `approver.email`
- `approver.approvedAt`

False-positive rollback path:

1. Refresh `.github/release/re-enable-checklist.json` with corrected evidence, signoff, or time-window values.
2. Commit that change to the branch that triggers publish.
3. Rerun the publish workflow with the same package selection. No code rollback is required.

There is no separate manual override or unpause bypass in this repo. Manual `workflow_dispatch` runs use the same checklist gate as release-triggered publishes.
