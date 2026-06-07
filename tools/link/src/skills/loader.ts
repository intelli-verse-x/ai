import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, normalizeSkillMetadata } from "./frontmatter.js";
import type { AuditLogger, SkillDefinition, ToolContext } from "../types.js";
import type { ToolRegistry } from "../tools.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SKILLS_DIR = path.resolve(dirname, "../../skills");

export async function discoverSkills(skillsDir = DEFAULT_SKILLS_DIR): Promise<SkillDefinition[]> {
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const skills: SkillDefinition[] = [];

  for (const entry of entries) {
    const fullPath = path.join(skillsDir, entry.name);

    if (entry.isDirectory()) {
      skills.push(...(await discoverSkills(fullPath)));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const markdown = await fs.readFile(fullPath, "utf8");
    const parsed = parseFrontmatter(markdown, fullPath);
    const metadata = normalizeSkillMetadata(parsed.metadata, fullPath);
    skills.push({ path: fullPath, metadata, body: parsed.body });
  }

  return skills.sort((left, right) => left.metadata.name.localeCompare(right.metadata.name));
}

export async function getSkillByName(name: string, skillsDir = DEFAULT_SKILLS_DIR): Promise<SkillDefinition | undefined> {
  const skills = await discoverSkills(skillsDir);
  return skills.find((skill) => skill.metadata.name.toLowerCase() === name.toLowerCase());
}

export async function runSkill(
  name: string,
  inputs: Record<string, unknown> = {},
  {
    skillsDir = DEFAULT_SKILLS_DIR,
    toolRegistry,
    auditLogger,
    actorId,
  }: {
    skillsDir?: string;
    toolRegistry?: ToolRegistry;
    auditLogger?: AuditLogger;
    actorId?: string;
  } = {},
): Promise<{
  skill: SkillDefinition["metadata"];
  inputs: Record<string, unknown>;
  toolResults: { tool: unknown; output: unknown }[];
  execution: {
    mode: "mocked";
    summary: string;
    workflowSteps: string[];
    expectedOutputFormat: string[];
    safetyNotes: string[];
  };
}> {
  const skill = await getSkillByName(name, skillsDir);
  if (!skill) {
    throw new Error(`Unknown Link skill: ${name}`);
  }

  const toolResults: { tool: unknown; output: unknown }[] = [];
  if (toolRegistry) {
    for (const toolName of skill.metadata.toolsRequired) {
      if (toolRegistry.get(toolName)) {
        const context: ToolContext = { auditLogger, actorId };
        toolResults.push(await toolRegistry.invoke(toolName, { query: inputs.query, accountId: inputs.accountId }, context));
      }
    }
  }

  auditLogger?.record({
    actorId,
    surface: "skill_runner",
    eventType: "skill.used",
    action: skill.metadata.name,
    target: String(inputs.accountId ?? inputs.customerIdentifier ?? "") || null,
    metadata: {
      riskLevel: skill.metadata.riskLevel,
      toolsRequired: skill.metadata.toolsRequired,
      approvalRequired: skill.metadata.approvalRequired,
    },
  });

  return {
    skill: skill.metadata,
    inputs,
    toolResults,
    execution: {
      mode: "mocked",
      summary: `Loaded and ran the ${skill.metadata.name} workflow with deterministic mocked context.`,
      workflowSteps: extractSection(skill.body, "workflow steps"),
      expectedOutputFormat: extractSection(skill.body, "expected output format"),
      safetyNotes: extractSection(skill.body, "safety notes"),
    },
  };
}

function extractSection(body: string, heading: string): string[] {
  const lines = body.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => normalizeHeading(line) === heading.toLowerCase());

  if (headingIndex === -1) {
    return [];
  }

  const output: string[] = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (/^#{2,3}\s+/.test(line)) break;

    const trimmed = line.trim();
    if (trimmed) output.push(trimmed.replace(/^[-*]\s+/, ""));
  }

  return output;
}

function normalizeHeading(line: string): string {
  return line.replace(/^#{2,3}\s+/, "").trim().toLowerCase();
}
