# Microsoft Agent Framework

> Use Telnyx as an OpenAI-compatible inference provider for Microsoft Agent Framework (formerly AutoGen).

## Prerequisites

- Python 3.10+
- Telnyx API key ([get one free](https://telnyx.com))
- `agent-framework` and `agent-framework-openai` packages

## Installation

```bash
pip install agent-framework agent-framework-openai python-dotenv
```

## Configuration

Create a `.env` file:

```bash
TELNYX_API_KEY=your_api_key_here
TELNYX_MODEL=moonshotai/Kimi-K2.5
TELNYX_EMBEDDING_MODEL=thenlper/gte-large
```

Telnyx provides an OpenAI-compatible API at `https://api.telnyx.com/v2/ai/openai` that supports chat completions, embeddings, and function/tool calling. No custom provider package is needed — just configure the `base_url` on the standard OpenAI clients.

## Chat Completion

```python
import asyncio
import os

from agent_framework import Agent
from agent_framework.openai import OpenAIChatClient
from dotenv import load_dotenv

load_dotenv()

async def main() -> None:
    client = OpenAIChatClient(
        api_key=os.getenv("TELNYX_API_KEY"),
        base_url="https://api.telnyx.com/v2/ai/openai",
        model=os.getenv("TELNYX_MODEL", "moonshotai/Kimi-K2.5"),
    )

    agent = Agent(
        client=client,
        name="TelnyxAgent",
        instructions="You are a helpful assistant.",
    )

    # Non-streaming
    result = await agent.run("What is the capital of France?")
    print(result)

    # Streaming
    async for chunk in agent.run("Explain quantum computing.", stream=True):
        if chunk.text:
            print(chunk.text, end="", flush=True)

asyncio.run(main())
```

## Embeddings

```python
import asyncio
import os

from agent_framework.openai import OpenAIEmbeddingClient
from dotenv import load_dotenv

load_dotenv()

async def main() -> None:
    client = OpenAIEmbeddingClient(
        api_key=os.getenv("TELNYX_API_KEY"),
        base_url="https://api.telnyx.com/v2/ai/openai",
        model=os.getenv("TELNYX_EMBEDDING_MODEL", "thenlper/gte-large"),
    )

    texts = [
        "Telnyx provides telecom infrastructure for AI agents.",
        "Agent Framework makes it easy to build AI agents.",
    ]

    response = await client.get_embeddings(texts)

    for i, embedding in enumerate(response):
        print(f"Text {i + 1}: \"{texts[i]}\"")
        print(f"  Dimensions: {embedding.dimensions}")
        print(f"  Preview: [{', '.join(str(v) for v in embedding.vector[:5])}, ...]")

asyncio.run(main())
```

## Available Models

| Model | Type | Description |
|-------|------|-------------|
| `moonshotai/Kimi-K2.5` | Chat | General-purpose LLM |
| `GLM-5.1-FP8` | Chat | Zhipu AI model |
| `MiniMax-M2.7` | Chat | MiniMax model |
| `Qwen3-235B-A22B` | Chat | Alibaba Qwen3 model |
| `thenlper/gte-large` | Embeddings | 1024-dim text embeddings |

## Telecom Tools (Coming Soon)

Telnyx provides FunctionTools for agent frameworks that give your agents telecom capabilities:

- **SMS** — Send text messages
- **Number Lookup** — Carrier and line-type identification
- **Phone Verification** — OTP verification via SMS/voice

## References

- [Microsoft Agent Framework](https://github.com/microsoft/agent-framework)
- [Telnyx AI API](https://developers.telnyx.com/api/ai)
- [OpenAI Compatibility](https://developers.telnyx.com/docs/ai/openai-compatibility)
