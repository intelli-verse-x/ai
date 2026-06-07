import { ROOT_AGENT_INSTRUCTIONS, rootAgent, specialistAgents } from "./definitions.js";

interface OpenAIAgentsSdk {
  Agent: {
    new (config: Record<string, unknown>): unknown;
    create?: (config: Record<string, unknown>) => unknown;
  };
  run: (agent: unknown, prompt: string, options?: Record<string, unknown>) => Promise<{ finalOutput: unknown }>;
}

export async function loadOpenAIAgentsSdk(): Promise<OpenAIAgentsSdk> {
  return (await import("@openai/agents")) as unknown as OpenAIAgentsSdk;
}

export async function createOpenAIAgentGraph(): Promise<{ root: unknown; specialists: unknown[] }> {
  const sdk = await loadOpenAIAgentsSdk();
  const specialists = specialistAgents.map(
    (definition) =>
      new sdk.Agent({
        name: definition.name,
        instructions: definition.instructions,
        handoffDescription: definition.purpose,
      }),
  );

  const root =
    typeof sdk.Agent.create === "function"
      ? sdk.Agent.create({
          name: rootAgent.name,
          instructions: ROOT_AGENT_INSTRUCTIONS,
          handoffs: specialists,
        })
      : new sdk.Agent({
          name: rootAgent.name,
          instructions: ROOT_AGENT_INSTRUCTIONS,
          handoffs: specialists,
        });

  return { root, specialists };
}

export async function runOpenAILink(
  prompt: string,
  options: { runOptions?: Record<string, unknown> } = {},
): Promise<{ finalOutput: unknown; rawResult: { finalOutput: unknown } }> {
  const sdk = await loadOpenAIAgentsSdk();
  const graph = await createOpenAIAgentGraph();
  const result = await sdk.run(graph.root, prompt, options.runOptions ?? {});

  return {
    finalOutput: result.finalOutput,
    rawResult: result,
  };
}
