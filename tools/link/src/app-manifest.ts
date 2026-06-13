export interface LinkAppManifestFields {
  name?: string;
  slug?: string;
  description?: string;
  ownerSquad?: string;
  audience?: string;
  appType?: "web" | "mcp_app";
  sourceRepo?: string;
  sourceRef?: string;
  sourceSubdir?: string;
  installCommand?: string;
  buildCommand?: string;
  startCommand?: string;
  outputDir?: string;
  envSchema: string[];
  access?: string;
  reviewers: string[];
  riskLevel?: "low" | "medium" | "high";
}

type ManifestObject = Record<string, unknown>;

export function parseLinkAppManifestText(text: string, filename = "link-app.yml"): LinkAppManifestFields {
  const raw = filename.endsWith(".json") ? JSON.parse(text) : parseSimpleYaml(text);
  return normalizeLinkAppManifest(raw);
}

export function normalizeLinkAppManifest(raw: unknown): LinkAppManifestFields {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("link-app manifest must be an object.");
  }
  const root = raw as ManifestObject;
  const app = objectValue(root.app) ?? root;
  const source = objectValue(root.source) ?? root;
  const build = objectValue(root.build) ?? root;
  return {
    name: optionalString(app.name),
    slug: optionalString(app.slug),
    description: optionalString(app.description),
    ownerSquad: optionalString(app.owner_squad ?? app.ownerSquad),
    audience: optionalString(app.audience),
    appType: appType(app.app_type ?? app.appType),
    sourceRepo: optionalString(source.repo ?? source.source_repo ?? root.source_repo ?? root.sourceRepo),
    sourceRef: optionalString(source.ref ?? source.source_ref ?? root.source_ref ?? root.sourceRef),
    sourceSubdir: optionalString(source.subdir ?? source.source_subdir ?? root.source_subdir ?? root.sourceSubdir),
    installCommand: optionalString(build.install_command ?? build.installCommand ?? root.install_command ?? root.installCommand),
    buildCommand: optionalString(build.command ?? build.build_command ?? root.build_command ?? root.buildCommand),
    startCommand: optionalString(build.start_command ?? build.startCommand ?? root.start_command ?? root.startCommand),
    outputDir: optionalString(build.output_dir ?? build.outputDir ?? root.output_dir ?? root.outputDir),
    envSchema: stringList(app.env_schema ?? app.envSchema ?? root.env_schema ?? root.envSchema),
    access: optionalString(app.access ?? root.access),
    reviewers: stringList(app.reviewers ?? root.reviewers),
    riskLevel: riskLevel(app.risk_level ?? app.riskLevel ?? root.risk_level ?? root.riskLevel),
  };
}

function parseSimpleYaml(text: string): ManifestObject {
  const root: ManifestObject = {};
  let currentKey = "";

  for (const originalLine of text.split(/\r?\n/)) {
    const withoutComment = stripYamlComment(originalLine);
    if (!withoutComment.trim()) continue;
    const indent = withoutComment.match(/^\s*/)?.[0].length ?? 0;
    const line = withoutComment.trim();

    if (line.startsWith("- ")) {
      if (!currentKey) throw new Error(`Unexpected list item in link-app manifest: ${line}`);
      const current = Array.isArray(root[currentKey]) ? root[currentKey] as unknown[] : [];
      current.push(parseYamlScalar(line.slice(2).trim()));
      root[currentKey] = current;
      continue;
    }

    const match = /^([A-Za-z0-9_]+):(?:\s*(.*))?$/.exec(line);
    if (!match) throw new Error(`Unsupported link-app manifest line: ${line}`);

    const [, key, rawValue = ""] = match;
    if (indent === 0) {
      if (rawValue === "") {
        root[key] = {};
        currentKey = key;
      } else {
        root[key] = parseYamlScalar(rawValue);
        currentKey = "";
      }
      continue;
    }

    if (!currentKey) throw new Error(`Nested link-app manifest field has no parent: ${line}`);
    const parent = objectValue(root[currentKey]) ?? {};
    parent[key] = rawValue === "" ? "" : parseYamlScalar(rawValue);
    root[currentKey] = parent;
  }

  return root;
}

function stripYamlComment(line: string): string {
  let quote: '"' | "'" | "" = "";
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      quote = quote === char ? "" : quote || char;
    }
    if (char === "#" && !quote && (index === 0 || /\s/.test(line[index - 1] ?? ""))) {
      return line.slice(0, index);
    }
  }
  return line;
}

function parseYamlScalar(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const jsonish = trimmed.replace(/'/g, '"');
    try {
      return JSON.parse(jsonish);
    } catch {
      return trimmed.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return trimmed;
}

function objectValue(value: unknown): ManifestObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ManifestObject : undefined;
}

function optionalString(value: unknown): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
  return normalized || undefined;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(optionalString).filter((item): item is string => Boolean(item));
  const normalized = optionalString(value);
  if (!normalized) return [];
  return normalized.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function appType(value: unknown): "web" | "mcp_app" | undefined {
  const normalized = optionalString(value);
  if (!normalized) return undefined;
  return normalized === "mcp_app" ? "mcp_app" : "web";
}

function riskLevel(value: unknown): "low" | "medium" | "high" | undefined {
  const normalized = optionalString(value);
  return normalized === "low" || normalized === "medium" || normalized === "high" ? normalized : undefined;
}
