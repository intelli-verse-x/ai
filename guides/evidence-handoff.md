# Evidence Handoff And Escalation

Use this runbook when the `team-telnyx/ai` release path produces an evidence bundle for either of these incident classes:

- **Publish-path alert**: npm publish is blocked, overridden, or otherwise flagged during [`.github/workflows/publish-npm.yml`](/.github/workflows/publish-npm.yml).
- **Secret-exposure alert**: release automation, CI, or a human reviewer finds a leaked credential, internal URL, or other sensitive artifact in publishable output. The standing external reporting path remains [`.github/SECURITY.md`](/.github/SECURITY.md).

This guide defines who gets the first notification, how acknowledgement is escalated, and what evidence may be handed off.

## Evidence bundle contents

Every alert handoff should include the smallest bundle that lets the next responder act without reopening the investigation:

- incident class: `publish_path` or `secret_exposure`
- current state event from the timeline below
- package or workflow affected
- timestamp in UTC
- actor who triggered or disabled the workflow
- incident or ticket identifier
- reason for the disable, override, or alert
- links or attachments to GitHub Actions step summaries, logs, or PR context

For publish-path incidents, the authoritative audit fields already exist in [`.github/workflows/publish-npm.yml`](/.github/workflows/publish-npm.yml) and [`.github/bin/publish-npm`](/.github/bin/publish-npm):

- `publish_disable_reason`
- `publish_disable_incident_id`
- `publish_disable_by`
- `NPM_PUBLISH_DISABLE_REASON`
- `NPM_PUBLISH_DISABLE_INCIDENT_ID`
- `NPM_PUBLISH_DISABLED_BY`

The workflow step summary and `publish-audit-log.txt` output are the preferred evidence sources for those alerts.

## Recipient order

### Publish-path alerts

Initial recipients:

1. package owner or workflow owner
2. release/on-call operator
3. CTO

Fallback order:

1. If the owner does not acknowledge inside the owner SLA, page the on-call operator and transfer ownership.
2. If on-call does not acknowledge inside the on-call SLA, escalate to the CTO with the evidence bundle attached.
3. If the CTO is unreachable and publish must remain blocked, keep the gate disabled and continue updates through the incident ticket until executive coverage is restored.

### Secret-exposure alerts

Initial recipients:

1. package owner
2. release/on-call operator
3. CTO

Fallback order:

1. Notify owner and on-call at the same time because containment is time-sensitive.
2. Escalate to the CTO immediately if a live credential, signing token, or customer-impacting secret is exposed in a published artifact.
3. If impact is still being verified, escalate to the CTO at the on-call SLA threshold even when the owner has acknowledged but containment is incomplete.

## Ack SLA and escalation thresholds

| Incident class | Owner ack | On-call ack | CTO escalation threshold | Expected response |
|---|---:|---:|---:|---|
| `publish_path` | 10 minutes | 20 minutes | 30 minutes from alert creation | Keep publishing disabled until someone explicitly records restore approval and the incident id. |
| `secret_exposure` | 5 minutes | 10 minutes | Immediate for confirmed live secret, otherwise 15 minutes | Contain first: revoke/rotate secret, block further publish, and hand off only redacted evidence. |

Ack means the responder has posted or otherwise recorded all of the following:

- they own the incident
- the current state event
- the next containment action
- the next status update time

Silence does not count as acknowledgement. Reactions without an explicit owner and next action do not count either.

## State events and timeline

Use these state events in issue comments, incident tickets, or handoff notes so downstream responders can reconstruct the incident quickly.

| State event | When to emit it | Required evidence |
|---|---|---|
| `alert_detected` | The workflow, CI check, or human observer first identifies the condition. | Trigger source, UTC timestamp, affected package or secret scope. |
| `owner_notified` | The owner receives the first handoff. | Owner identity and notification channel. |
| `owner_acked` | The owner accepts responsibility within SLA. | Owner name, next action, next update time. |
| `oncall_notified` | The owner SLA expires or the alert is severity-high on arrival. | Escalation reason and current containment status. |
| `oncall_acked` | On-call takes operational control. | Operator name, mitigation action, next update time. |
| `cto_notified` | On-call SLA expires or the issue meets immediate-executive criteria. | Full redacted evidence bundle and business-risk summary. |
| `containment_started` | Publish is disabled, credentials are being rotated, or artifacts are being quarantined. | Command, workflow change, or revocation action taken. |
| `evidence_bundle_ready` | The bundle is complete enough for a clean handoff. | Links to logs, step summary, ticket, and redacted artifacts. |
| `restore_approved` | A named owner or CTO approves re-enable of the path. | Approval source, incident id, and rollback plan. |
| `resolved` | Containment and follow-up actions are complete. | Final root cause, verification, and remaining follow-ups. |

## Operator response behavior

### Publish-path alerts

1. Confirm whether [`.github/workflows/publish-npm.yml`](/.github/workflows/publish-npm.yml) blocked the run because `PUBLISH_NPM_ENABLED` is false or because a manual override was used.
2. Capture the workflow summary plus the audit values emitted by [`.github/bin/publish-npm`](/.github/bin/publish-npm).
3. If risk is not understood yet, leave publish disabled. Do not force release traffic back on to "see what happens."
4. Hand off the evidence bundle to the next recipient in the order above when the active owner misses SLA or lacks the authority to restore.

### Secret-exposure alerts

1. Stop further distribution first: disable publish, revoke or rotate the secret, and quarantine any copied evidence.
2. Report externally through [`.github/SECURITY.md`](/.github/SECURITY.md) when the alert could expose users, systems, or credentials outside the private incident channel.
3. Use [`.github/bin/check-release-environment`](/.github/bin/check-release-environment) to confirm whether internal URLs or similar release-safety violations are present in publishable files.
4. Do not paste raw secrets into issues, chat, screenshots, or step summaries. Only share fingerprints, prefixes, or other redacted identifiers.

## Evidence handling guardrails

- Redact tokens, API keys, cookies, JWTs, internal hostnames, and customer data before attaching evidence.
- Prefer secret fingerprints, first/last four characters, or one-way hashes over raw values.
- Store one canonical evidence bundle per incident id so responders are not forwarding divergent copies.
- Keep raw logs in the system of record that generated them; handoffs should link to those logs instead of copying entire transcripts.
- If a screenshot is required, crop it to the relevant fields and verify that browser chrome, terminal history, and notification toasts do not leak secrets.
- When a secret might still be live, treat every downstream handoff as need-to-know and include the minimum scope necessary to continue containment.

## Run instructions mapped to the timeline

| Timeline point | Run instruction |
|---|---|
| `alert_detected` | Inspect the current GitHub Actions run in [`.github/workflows/publish-npm.yml`](/.github/workflows/publish-npm.yml). |
| `containment_started` for publish-path | Keep `PUBLISH_NPM_ENABLED=false` and record `publish_disable_reason`, `publish_disable_incident_id`, and `publish_disable_by` on manual dispatch if used. |
| `containment_started` for secret exposure | Revoke or rotate the secret, then rerun release safety checks with [`.github/bin/check-release-environment`](/.github/bin/check-release-environment). |
| `evidence_bundle_ready` | Attach the step summary, audit fields, incident id, and redacted links to the active incident ticket. |
| `restore_approved` | Re-enable publishing only after a named owner or CTO records approval and the restoration reason. |
| `resolved` | Record final verification, including the publish gate state and any follow-up hardening tasks. |

## Success condition for a clean handoff

The handoff is complete when the next responder can answer all of these without re-investigating from scratch:

- What happened?
- Which package, workflow, or secret scope is affected?
- Who owns the incident right now?
- What containment action is already in place?
- What is the next escalation threshold if nobody responds?
