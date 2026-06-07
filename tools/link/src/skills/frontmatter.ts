import type { RiskLevel, SkillMetadata } from "../types.js";

type ParsedScalar = string | number | boolean;
type RawMetadata = Record<string, ParsedScalar | ParsedScalar[]>;

export function parseFrontmatter(markdown: string, sourcePath = "<memory>"): { metadata: RawMetadata; body: string } {
  const lines = markdown.split(/\r?\n/);

  if (lines[0] !== "---") {
    throw new Error(`Skill ${sourcePath} is missing frontmatter`);
  }

  const closingIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  if (closingIndex === -1) {
    throw new Error(`Skill ${sourcePath} has unterminated frontmatter`);
  }

  return {
    metadata: parseSimpleYaml(lines.slice(1, closingIndex)),
    body: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

export function parseSimpleYaml(lines: string[]): RawMetadata {
  const metadata: RawMetadata = {};
  let currentKey: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === "") {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      const currentValue = metadata[currentKey];
      const listValue = Array.isArray(currentValue) ? currentValue : [];
      listValue.push(parseScalar(listMatch[1]!));
      metadata[currentKey] = listValue;
      continue;
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyValueMatch) {
      throw new Error(`Unsupported frontmatter line: ${rawLine}`);
    }

    const [, key, value] = keyValueMatch;
    currentKey = key!;
    metadata[currentKey] = value === "" ? [] : parseScalar(value!);
  }

  return metadata;
}

export function normalizeSkillMetadata(metadata: RawMetadata, sourcePath = "<memory>"): SkillMetadata {
  const required = [
    "name",
    "description",
    "owner",
    "team",
    "risk_level",
    "tools_required",
    "customer_safe",
    "approval_required",
  ];

  for (const key of required) {
    if (metadata[key] === undefined || metadata[key] === null || metadata[key] === "") {
      throw new Error(`Skill ${sourcePath} is missing required metadata: ${key}`);
    }
  }

  const riskLevel = metadata.risk_level;
  if (riskLevel !== "low" && riskLevel !== "medium" && riskLevel !== "high") {
    throw new Error(`Skill ${sourcePath} has invalid risk_level`);
  }

  if (!Array.isArray(metadata.tools_required)) {
    throw new Error(`Skill ${sourcePath} tools_required must be a list`);
  }

  if (typeof metadata.customer_safe !== "boolean") {
    throw new Error(`Skill ${sourcePath} customer_safe must be a boolean`);
  }

  if (typeof metadata.approval_required !== "boolean") {
    throw new Error(`Skill ${sourcePath} approval_required must be a boolean`);
  }

  return {
    name: String(metadata.name),
    description: String(metadata.description),
    owner: String(metadata.owner),
    team: String(metadata.team),
    riskLevel: riskLevel as RiskLevel,
    toolsRequired: metadata.tools_required.map(String),
    customerSafe: metadata.customer_safe,
    approvalRequired: metadata.approval_required,
  };
}

function parseScalar(value: string): ParsedScalar {
  const trimmed = value.trim();

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  return trimmed.replace(/^["']|["']$/g, "");
}
