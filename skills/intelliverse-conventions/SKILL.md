---
name: intelliverse-conventions
description: >-
  Intelli-Verse internal conventions for building Telnyx integrations (SMS, SIP,
  numbers) into the self-hosted engagement stack. Layer this skill ON TOP of the
  upstream telnyx-* skills: those teach the Telnyx API, this enforces how we wire
  it into our App-ID contract, SES email, and Fonoster SIP. Use whenever writing
  Telnyx code for Intelli-Verse (quizverse / toba / intelliverse tenants).
metadata:
  author: intelli-verse-x
  product: conventions
  language: any
  generated_by: hand-maintained
---

<!-- Hand-maintained overlay. NOT auto-generated. Survives upstream syncs. -->

# Intelli-Verse — Telnyx Integration Conventions

Read this together with the relevant upstream skill (`telnyx-messaging-*`,
`telnyx-10dlc-*`, `telnyx-sip-*`, `telnyx-numbers-*`, `telnyx-twilio-migration`).
Upstream = "how the Telnyx API works". This = "how we use it here".

## 1. Everything speaks the App-ID contract
Every inbound/outbound Telnyx event MUST be wrapped as a **CanonicalEvent** and
scoped by `appId` (one App per tenant: `quizverse`, `toba`, `intelliverse`).
Source of truth: `intelli-verse-x/twenty` → `crm-schema/contract/contract.mjs`.

- Inbound (Telnyx webhook → n8n): build a CanonicalEvent, call `validateEvent`,
  then `mapToCrm` → upsert into Twenty (scoped by `appId`).
- Outbound (before sending): call `evaluateOutbound(event)` and only send on
  `ALLOW`. `DEFER` = reschedule (quiet hours / coverage). `BLOCK` = do not send.
- Provider enum value for Telnyx is **`telnyx`**; channel is **`sms`** (voice via
  Fonoster uses `fonoster`). Always set `delivery.providerMessageId` to the
  Telnyx message/call id for idempotency (`eventId`).

```js
// n8n Function node (inbound SMS)
import { validateEvent, mapToCrm } from 'crm-schema/contract/contract.mjs';
const event = {
  schemaVersion: '1.0',
  eventId: telnyx.data.id,                 // Telnyx message id (idempotency)
  appId: resolveAppId(telnyx.data.to),     // number -> tenant
  source: 'telnyx', channel: 'sms', direction: 'inbound', type: 'message',
  occurredAt: telnyx.data.received_at,
  party: { address: telnyx.data.from.phone_number, addressType: 'phone' },
  delivery: { provider: 'telnyx', providerMessageId: telnyx.data.id, status: 'received' },
  content: { body: telnyx.data.text },
};
```

## 2. SMS compliance is mandatory, per country
Enforced by `evaluateOutbound`, but set the registration metadata correctly:
- **US/CA** → `delivery.registrationStatus: '10dlc'` (or `'toll_free'`). Register
  the brand+campaign first (`telnyx-10dlc-*`). Unregistered = BLOCK.
- **India** → `'dlt'` + approved template. **Nigeria / Indonesia / UAE / AU** →
  registered alphanumeric sender ID (`senderIdType: 'alphanumeric'`).
- **US rejects alphanumeric** sender IDs — never set alpha for US.
- No marketing SMS without `consent.status === 'opted_in'`.
See the country table in `contract.mjs` (`COUNTRIES`) — extend it, don't fork logic.

## 3. SES defaults (email — Notifuse/Chatwoot, not Telnyx)
When wiring email anywhere in the stack, use AWS SES us-east-1 (production mode;
DKIM-verified domains `intelli-verse-x.ai` and `toba-tech.ai`):
```
SMTP_ADDRESS = email-smtp.us-east-1.amazonaws.com
SMTP_PORT    = 587
SMTP_AUTHENTICATION = plain
SMTP_ENABLE_STARTTLS_AUTO = true
# username = IAM access key id; password = SES-derived password (NOT raw secret)
FROM domains: intelli-verse-x.ai (Intelliverse), toba-tech.ai (ToBa)
```
SMS verification/notification email = SES. Do not hardcode a different provider.

## 4. SIP / numbers defaults (voice — backs Fonoster)
- Telnyx **SIP trunk** is the carrier under Fonoster (`telnyx-sip-*`). Outbound
  voice profile + credential auth; FQDN/credential per environment.
- **Numbers**: provision via `telnyx-numbers-*`; for non-US use
  `telnyx-numbers-compliance-*` regulatory bundles (Tier 1/2/3 — see country
  table). Two-way local voice is NOT available everywhere (ID/NG/AE) → those are
  `DEFER` in the contract; use intl origination and verify reachability.
- Voice calls are represented in the CRM with `channel: 'voice'`, `provider:
  'fonoster'`, `delivery.durationSeconds`, transcript in `content.body`.

## 5. Deploy/runtime facts
- Cluster namespace: `aicart`. Shared RDS:
  `aicart-prod.c8t8osoe03oe.us-east-1.rds.amazonaws.com:5432`.
- The automation brain is **n8n** (`n8n.intelli-verse-x.ai`) — Telnyx webhooks
  point at n8n, which applies this contract and writes to Twenty.
- Secrets are created imperatively (never commit `TELNYX_API_KEY` or SES creds).

## 6. Twilio → Telnyx migration
Use `telnyx-twilio-migration` for TwiML→TeXML, porting (FastPort), and auth
changes (Basic→Bearer, HMAC-SHA1→Ed25519 webhook signatures). Keep our contract
unchanged — only the provider integration swaps.
