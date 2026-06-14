# Crawler Accessibility Audit

Date: 2026-06-14

Scope: public, no-auth discovery and onboarding surfaces that should be reachable by agent user-agents without JavaScript or interactive browser challenges.

## Surfaces Checked

- `https://telnyx.com/robots.txt`
- `https://telnyx.com/agents/start`
- `https://telnyx.com/llms.txt`
- `https://telnyx.com/auth.md`
- `https://telnyx.com/.well-known/agent-access.json`
- `https://telnyx.com/.well-known/mcp`
- `https://api.telnyx.com/.well-known/oauth-authorization-server`
- `https://api.telnyx.com/.well-known/oauth-protected-resource/v2/mcp`
- `https://api.telnyx.com/v2/mcp`

Primary probe user-agent: `OpenAI-Agent/1.0 (+https://openai.com)`

## Findings

### Confirmed accessible

- `robots.txt` returned `200` and explicitly allowlisted major agent user-agents including `ChatGPT-User`, `Claude-User`, and `ora-agent`.
- `agents/start`, `llms.txt`, and `auth.md` all returned `200` for an agent user-agent with no JavaScript challenge body.
- `agents/start` and `auth.md` exposed `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET, OPTIONS`, which is the right shape for safe public read surfaces.
- `https://developers.telnyx.com/development/api-fundamentals/webhooks/receiving-webhooks` resolved successfully from the public internet.

### Gaps that still need production alignment

- `agents/start` is publicly reachable but the live response does not yet include the webhook discovery link or the repo-authored discovery language that names the stable auth and onboarding path.
- `llms.txt` is publicly reachable but still serves older product-summary content instead of the repo-owned agent discovery index with explicit webhook and onboarding pointers.
- `auth.md` is publicly reachable but does not yet mention `/.well-known/agent-access.json` or `https://api.telnyx.com/.well-known/oauth-protected-resource`, so an agent cannot complete auth discovery from that page alone.
- OAuth metadata and MCP protected-resource metadata are still missing the richer `agent_auth` discovery block expected by the repo-owned mirrors.
- An unauthenticated initialize request to `https://api.telnyx.com/v2/mcp` did not return the expected bearer challenge with `resource_metadata`, so auth discovery from the challenge path is still incomplete.

## Smallest Safe Fix List

1. Deploy the repo-owned `agents/start.md`, `llms.txt`, and `auth.md` content so the public text-first surfaces match the checked-in discovery contract.
2. Publish the richer `agent_auth` block from the repo-owned OAuth and protected-resource mirrors onto the live `api.telnyx.com` metadata endpoints.
3. Restore the MCP bearer challenge metadata on unauthenticated requests so agents can discover the protected-resource URL directly from `WWW-Authenticate`.
4. Keep `robots.txt` permissive for agent discovery surfaces and continue blocking only mutation/evaluation paths such as `/ai/evaluate`.
5. Run the live verifier in CI or release preflight so drift between repo-owned discovery assets and the public mirrors fails fast.

## Verification Commands

```bash
npm run verify:live-agent-discovery
npx tsx --test tests/verify-live-agent-discovery.test.ts
curl -sS -D - -A 'OpenAI-Agent/1.0 (+https://openai.com)' https://telnyx.com/robots.txt
curl -sS -D - -A 'OpenAI-Agent/1.0 (+https://openai.com)' https://telnyx.com/agents/start
curl -sS -D - -A 'OpenAI-Agent/1.0 (+https://openai.com)' https://telnyx.com/llms.txt
curl -sS -D - -A 'OpenAI-Agent/1.0 (+https://openai.com)' https://telnyx.com/auth.md
```
