# Intelli-Verse overlay on the Telnyx Agent Skills fork

This repo is a fork of [`team-telnyx/ai`](https://github.com/team-telnyx/ai) (the
Telnyx Agent Skills — dev-time `SKILL.md` references that teach AI coding agents
how to write Telnyx code). We keep the fork **only** to layer our internal
conventions on top; the Telnyx skills themselves should track upstream.

## What we add (and where)
| Path | Purpose | Touched by upstream? |
|---|---|---|
| `skills/intelliverse-conventions/SKILL.md` | Our App-ID contract + SES/SIP defaults, layered over the `telnyx-*` skills | No |
| `intelliverse/README.md` | This file | No |
| `.github/workflows/sync-upstream.yml` | Weekly upstream sync (auto-merge, PR on conflict) | No |

Everything else is upstream Telnyx content — **don't edit it**; let the sync job
update it.

## How to use (day to day)
For coding, install the **live** upstream skills (they stay current) plus our overlay:
```bash
# upstream skills you need for the stack
npx skills add team-telnyx/ai --skill telnyx-messaging-curl --agent cursor
npx skills add team-telnyx/ai --skill telnyx-10dlc-curl --agent cursor
npx skills add team-telnyx/ai --skill telnyx-sip-curl --agent cursor
npx skills add team-telnyx/ai --skill telnyx-numbers-compliance-curl --agent cursor
npx skills add team-telnyx/ai --skill telnyx-twilio-migration --agent cursor
# our conventions overlay (from this fork)
npx skills add intelli-verse-x/ai --skill intelliverse-conventions --agent cursor
```
Then ask your agent normally ("send an SMS to +91… for quizverse") — it follows
Telnyx best practice **and** our App-ID contract / compliance / SES-SIP defaults.

## Which upstream skills map to our stack
| Skill | Why |
|---|---|
| `telnyx-messaging-*` | SMS send/receive + opt-outs (the SMS channel) |
| `telnyx-10dlc-*` | US A2P brand/campaign registration (compliance gate) |
| `telnyx-sip-*` | SIP trunk behind Fonoster voice |
| `telnyx-numbers-*` / `telnyx-numbers-compliance-*` | DID provisioning + per-country regulatory bundles (Tier 1/2/3) |
| `telnyx-twilio-migration` | TwiML→TeXML, porting, auth changes |

## Staying current
- The **sync job** (`.github/workflows/sync-upstream.yml`) merges
  `team-telnyx/ai` weekly; on conflict it opens a PR for review so our overlay is
  never silently overwritten.
- Manual sync: `gh workflow run "Sync upstream (team-telnyx/ai)"`.

## Why a fork at all (vs just installing)
We fork **only** to host the `intelliverse-conventions` overlay in one place the
team can install. The actual Telnyx guidance is consumed live from upstream — so
it never goes stale.
