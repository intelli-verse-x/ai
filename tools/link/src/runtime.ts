import { rootAgent, routePromptToSpecialist } from "./agents/definitions.js";
import { runOpenAILink } from "./agents/openai-sdk.js";
import { InMemoryAuditLogger } from "./audit.js";
import { MemoryStorePlaceholder } from "./memory.js";
import { runSharedChannelDraft } from "./shared-channel.js";
import { runSkill } from "./skills/loader.js";
import { createDefaultToolRegistry, ToolRegistry } from "./tools.js";
import type { AuditLogger, SharedChannelInput } from "./types.js";

export class LinkRuntime {
  readonly auditLogger: AuditLogger;
  readonly toolRegistry: ToolRegistry;
  readonly memoryStore: MemoryStorePlaceholder;

  constructor({
    mode = "mock",
    auditLogger = new InMemoryAuditLogger(),
    toolRegistry = createDefaultToolRegistry(),
    memoryStore = new MemoryStorePlaceholder(),
  }: {
    mode?: "mock" | "live";
    auditLogger?: AuditLogger;
    toolRegistry?: ToolRegistry;
    memoryStore?: MemoryStorePlaceholder;
  } = {}) {
    this.mode = mode;
    this.auditLogger = auditLogger;
    this.toolRegistry = toolRegistry;
    this.memoryStore = memoryStore;
  }

  private readonly mode: "mock" | "live";

  async chat({ prompt, actorId = "anonymous", surface = "cli" }: { prompt: string; actorId?: string; surface?: string }): Promise<{
    agent?: string;
    routedTo?: string;
    mode?: "mocked";
    response?: string;
    finalOutput?: unknown;
  }> {
    this.auditLogger.record({
      actorId,
      surface,
      eventType: "agent.chat_requested",
      action: rootAgent.name,
      metadata: { mode: this.mode },
    });

    if (this.mode === "live") {
      const liveResult = await runOpenAILink(prompt);
      this.auditLogger.record({
        actorId,
        surface,
        eventType: "agent.live_completed",
        action: rootAgent.name,
        metadata: { finalOutputPresent: Boolean(liveResult.finalOutput) },
      });
      return { finalOutput: liveResult.finalOutput };
    }

    const specialist = routePromptToSpecialist(prompt);
    this.auditLogger.record({
      actorId,
      surface,
      eventType: "agent.routed",
      action: rootAgent.name,
      target: specialist.name,
      metadata: {
        allowedToolCategories: specialist.allowedToolCategories,
        riskLevel: specialist.riskLevel,
      },
    });

    return {
      agent: rootAgent.name,
      routedTo: specialist.name,
      mode: "mocked",
      response: [
        `${rootAgent.name} received the request and routed it to ${specialist.name}.`,
        `Purpose: ${specialist.purpose}`,
        "No production systems were contacted. Use a named skill or shared-channel mode for structured workflows.",
      ].join("\n"),
    };
  }

  async runSkill(name: string, inputs: Record<string, unknown> = {}, actorId = "anonymous"): ReturnType<typeof runSkill> {
    return runSkill(name, inputs, {
      toolRegistry: this.toolRegistry,
      auditLogger: this.auditLogger,
      actorId,
    });
  }

  runSharedChannel(input: SharedChannelInput): ReturnType<typeof runSharedChannelDraft> {
    return runSharedChannelDraft(input, { auditLogger: this.auditLogger });
  }
}
