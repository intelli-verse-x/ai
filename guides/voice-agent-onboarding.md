# Production Voice-Agent Onboarding

> One paved-road path for a first Telnyx voice-agent evaluation: create the assistant, wire the answer webhook, capture the right IDs, and debug the first live call.

## Prerequisites

- Telnyx API key ([get one free](https://telnyx.com/agent-signup.md))
- One Telnyx phone number you can assign to a Call Control application
- A real phone you can call from for the first bootstrap test
- Basic familiarity with [AI assistants](/guides/ai-assistants.md), [voice call control](/guides/voice-call-control.md), and [webhooks](/guides/webhooks.md)

## Quick Start

The production-friendly bootstrap path is:

1. Create an AI assistant.
2. Create a Call Control application whose webhook points at `https://api.telnyx.com/v2/ai/assistants/{assistant_id}/answer`.
3. Assign your phone number to that Call Control application.
4. Make one real call to the number and capture the IDs from the resulting webhook and debug surfaces.

```bash
# 1) Create the assistant
curl -X POST "https://api.telnyx.com/v2/ai/assistants" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evaluation Voice Agent",
    "instructions": "You are a concise support voice agent. Confirm the caller goal, answer directly, and keep responses short.",
    "model": "openai/gpt-5.4",
    "voice": {
      "provider": "telnyx",
      "settings": {
        "voice_id": "en-US-Neural2-F"
      }
    },
    "greeting": "Thanks for calling Telnyx. How can I help today?"
  }'
```

Save the returned `assistant_id`.

```bash
# 2) Create the Call Control application wired to the assistant answer webhook
curl -X POST "https://api.telnyx.com/v2/connections" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evaluation Voice Agent App",
    "active": true,
    "webhook_api_url": "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/answer"
  }'
```

Save the returned Call Control application ID as `connection_id`.

```bash
# 3) Assign a number to the Call Control application
curl -X PATCH "https://api.telnyx.com/v2/phone_numbers/{number_id}" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "your-connection-id"
  }'
```

Now place a real call to that number from a mobile phone. After the call ends, inspect the webhook and debug surfaces below.

## What To Capture On The First Call

Capture these IDs during the first live bootstrap call. They are the minimum set that lets you debug and continue the conversation later.

| ID | Where to get it first | Why it matters |
| --- | --- | --- |
| `assistant_id` | Assistant creation response or `call.conversation.ended` | Confirms which assistant revision handled the call |
| `connection_id` | Call Control application creation response or webhook payload | Ties the call to the answer webhook configuration |
| `call_control_id` | Voice events and Voice Monitor | Required for Call Control follow-up actions and call status lookup |
| `call_session_id` | Voice webhooks and Voice Monitor | Correlates all call legs for the same session |
| `conversation_id` | `call.conversation.ended` webhook | Primary handle for post-call AI conversation inspection |

For the bootstrap path, the most important post-call webhook is `call.conversation.ended`. It includes `assistant_id`, `connection_id`, `call_control_id`, `call_session_id`, `conversation_id`, `llm_model`, `stt_model`, `tts_provider`, and `tts_voice_id`.

## API Reference

### Create The Assistant

Use the assistants guide for the full field surface: [AI assistants](/guides/ai-assistants.md).

```bash
curl -X POST "https://api.telnyx.com/v2/ai/assistants" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evaluation Voice Agent",
    "instructions": "Answer inbound voice calls clearly and briefly.",
    "model": "openai/gpt-5.4",
    "voice": {
      "provider": "telnyx",
      "settings": {
        "voice_id": "en-US-Neural2-F"
      }
    }
  }'
```

### Wire The Assistant Answer Webhook

The paved-road answer webhook is:

`https://api.telnyx.com/v2/ai/assistants/{assistant_id}/answer`

Point your Call Control application at that URL so inbound calls on the assigned number are answered by the assistant instead of a custom webhook handler.

```bash
curl -X POST "https://api.telnyx.com/v2/connections" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evaluation Voice Agent App",
    "active": true,
    "webhook_api_url": "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/answer"
  }'
```

For general delivery debugging and signature verification patterns, see [webhooks](/guides/webhooks.md).

### Inspect The Conversation After The Call

Once the first call completes, use `conversation_id` from `call.conversation.ended` to inspect the stored conversation:

```bash
curl "https://api.telnyx.com/v2/ai/conversations/{conversation_id}" \
  -H "Authorization: Bearer $TELNYX_API_KEY"
```

```bash
curl "https://api.telnyx.com/v2/ai/conversations/{conversation_id}/messages" \
  -H "Authorization: Bearer $TELNYX_API_KEY"
```

This is the fastest way to verify that the assistant path worked end-to-end before you change prompts, tools, or routing.

## `conversation_id` Lifecycle

- A new live voice conversation produces a `conversation_id`.
- The bootstrap answer-webhook path surfaces that ID on `call.conversation.ended`.
- Use `conversation_id` for post-call inspection, analytics, and to line up Voice Monitor or webhook evidence with the assistant run that just happened.
- Treat it as the durable handle for the AI side of the call, while `call_control_id` and `call_session_id` remain the telephony-side correlation IDs.

If your first goal is only "did the assistant answer and complete a call correctly?", `conversation_id` is the most important AI identifier to save immediately after the first test call.

## Reusing `message_history`

The assistant answer webhook is the paved road for the first evaluation call. When you later need to continue context in a custom call-control flow, reuse prior turns as `message_history` with voice AI actions such as `ai_assistant_start` or `gather_using_ai`.

```bash
curl -X POST "https://api.telnyx.com/v2/calls/{call_control_id}/actions/ai_assistant_start" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": {
      "id": "your-assistant-id"
    },
    "message_history": [
      {
        "role": "user",
        "content": "The caller already authenticated in the previous call."
      },
      {
        "role": "assistant",
        "content": "I confirmed the account and asked which order needed help."
      }
    ],
    "send_message_history_updates": true
  }'
```

Use this pattern when you intentionally move from the no-code answer-webhook bootstrap into a more controlled Call Control workflow. For the detailed field surface, see [`skills/telnyx-voice-gather-curl/SKILL.md`](/skills/telnyx-voice-gather-curl/SKILL.md).

## Debugging After The First Bootstrap Call

After one successful or failed live call, move to the read-only Voice Monitor path:

- Voice Monitor app: [`tools/mcp-apps/apps/voice-monitor/README.md`](/tools/mcp-apps/apps/voice-monitor/README.md)
- Core voice controls and event patterns: [voice call control](/guides/voice-call-control.md)

Start with at least one of these IDs:

- `call_control_id`
- `call_session_id`
- `connection_id`
- `assistant_id`
- `conversation_id`

Voice Monitor is the paved-road debugger for:

- event timelines
- webhook delivery failures for the Call Control application
- provider and model confirmation
- terminal hangup or failure causes
- post-call recording discovery

## Python Example

```python
import requests

API_KEY = "KEY..."
BASE_URL = "https://api.telnyx.com/v2"
headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

assistant = requests.post(
    f"{BASE_URL}/ai/assistants",
    headers=headers,
    json={
        "name": "Evaluation Voice Agent",
        "instructions": "Answer inbound support calls clearly and briefly.",
        "model": "openai/gpt-5.4",
        "voice": {"provider": "telnyx", "settings": {"voice_id": "en-US-Neural2-F"}},
    },
).json()

assistant_id = assistant["id"]

connection = requests.post(
    f"{BASE_URL}/connections",
    headers=headers,
    json={
        "name": "Evaluation Voice Agent App",
        "active": True,
        "webhook_api_url": f"https://api.telnyx.com/v2/ai/assistants/{assistant_id}/answer",
    },
).json()

print({"assistant_id": assistant_id, "connection_id": connection["data"]["id"]})
```

## TypeScript Example

```typescript
const API_KEY = process.env.TELNYX_API_KEY!;
const BASE_URL = "https://api.telnyx.com/v2";
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const assistantRes = await fetch(`${BASE_URL}/ai/assistants`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "Evaluation Voice Agent",
    instructions: "Answer inbound support calls clearly and briefly.",
    model: "openai/gpt-5.4",
    voice: { provider: "telnyx", settings: { voice_id: "en-US-Neural2-F" } },
  }),
});

const assistant = await assistantRes.json();

const connectionRes = await fetch(`${BASE_URL}/connections`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "Evaluation Voice Agent App",
    active: true,
    webhook_api_url: `https://api.telnyx.com/v2/ai/assistants/${assistant.id}/answer`,
  }),
});

const connection = await connectionRes.json();
console.log({ assistantId: assistant.id, connectionId: connection.data.id });
```
