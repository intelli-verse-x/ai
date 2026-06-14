import { promises as fs } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { OkfBundleSummary, OkfBundleValidation, OkfConcept, OkfConceptLink, OkfFrontmatter } from "./types.js";

const reservedFilenames = new Set(["index.md", "log.md"]);

export async function validateOkfBundle(rootPath: string): Promise<OkfBundleValidation> {
  const resolvedRoot = path.resolve(rootPath);
  const markdownPaths = await listMarkdownFiles(resolvedRoot);
  const concepts: OkfConcept[] = [];
  const indexes: string[] = [];
  const logs: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const filePath of markdownPaths) {
    const relativePath = toPosix(path.relative(resolvedRoot, filePath));
    const filename = path.basename(filePath);

    if (filename === "index.md") {
      indexes.push(relativePath);
      warnings.push(...validateReservedMarkdown(await fs.readFile(filePath, "utf8"), relativePath, "index"));
      continue;
    }

    if (filename === "log.md") {
      logs.push(relativePath);
      warnings.push(...validateReservedMarkdown(await fs.readFile(filePath, "utf8"), relativePath, "log"));
      continue;
    }

    try {
      const markdown = await fs.readFile(filePath, "utf8");
      concepts.push(parseOkfConceptMarkdown(markdown, relativePath));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Unable to parse ${relativePath}`);
    }
  }

  const conceptPaths = new Set(concepts.map((concept) => concept.path));
  const conceptIdByPath = new Map(concepts.map((concept) => [concept.path, concept.id]));
  const conceptsWithResolvedLinks = concepts.map((concept) => ({
    ...concept,
    links: resolveLinks(concept.links, concept.path, conceptPaths, conceptIdByPath),
    citations: resolveLinks(concept.citations, concept.path, conceptPaths, conceptIdByPath),
  }));

  for (const concept of conceptsWithResolvedLinks) {
    for (const link of concept.links) {
      if (link.broken) warnings.push(`${concept.path} links to missing concept ${link.href}`);
    }
  }

  return {
    rootPath: resolvedRoot,
    concepts: conceptsWithResolvedLinks,
    indexes,
    logs,
    warnings,
    errors,
    summary: summarizeOkfBundle(conceptsWithResolvedLinks),
  };
}

export function parseOkfConceptMarkdown(markdown: string, conceptPath = "<memory>.md"): OkfConcept {
  const normalizedPath = toPosix(conceptPath);
  const { frontmatter, body } = parseFrontmatter(markdown, normalizedPath);
  const type = asNonEmptyString(frontmatter.type);
  if (!type) throw new Error(`OKF concept ${normalizedPath} is missing required frontmatter: type`);

  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];
  const id = conceptIdFromPath(normalizedPath);
  const title = asNonEmptyString(frontmatter.title) || titleFromConceptId(id);
  const description = asNonEmptyString(frontmatter.description);
  const resource = asNonEmptyString(frontmatter.resource);
  const timestamp = asNonEmptyString(frontmatter.timestamp);
  const citationsBody = extractSection(body, "citations");

  return {
    id,
    path: normalizedPath,
    type,
    title,
    ...(description ? { description } : {}),
    ...(resource ? { resource } : {}),
    tags,
    ...(timestamp ? { timestamp } : {}),
    frontmatter,
    body,
    links: extractMarkdownLinks(body),
    citations: extractMarkdownLinks(citationsBody),
  };
}

export function summarizeOkfBundle(concepts: OkfConcept[]): OkfBundleSummary {
  const typeCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  let linkedConceptCount = 0;
  let brokenLinkCount = 0;

  for (const concept of concepts) {
    typeCounts[concept.type] = (typeCounts[concept.type] ?? 0) + 1;
    if (concept.links.some((link) => link.targetConceptId)) linkedConceptCount += 1;
    brokenLinkCount += concept.links.filter((link) => link.broken).length;
    for (const tag of concept.tags) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }

  return {
    conceptCount: concepts.length,
    typeCounts,
    tagCounts,
    linkedConceptCount,
    brokenLinkCount,
  };
}

async function listMarkdownFiles(rootPath: string): Promise<string[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function parseFrontmatter(markdown: string, conceptPath: string): { frontmatter: OkfFrontmatter; body: string } {
  const lines = markdown.split(/\r?\n/);
  if (lines[0] !== "---") throw new Error(`OKF concept ${conceptPath} is missing YAML frontmatter`);

  const closingIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  if (closingIndex === -1) throw new Error(`OKF concept ${conceptPath} has unterminated YAML frontmatter`);

  let parsed: unknown;
  try {
    parsed = parseYaml(lines.slice(1, closingIndex).join("\n")) ?? {};
  } catch (error) {
    const detail = error instanceof Error ? error.message : "YAML parse failed";
    throw new Error(`OKF concept ${conceptPath} has invalid YAML frontmatter: ${detail}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`OKF concept ${conceptPath} frontmatter must be a YAML object`);
  }

  return {
    frontmatter: parsed as OkfFrontmatter,
    body: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

function validateReservedMarkdown(markdown: string, relativePath: string, kind: "index" | "log"): string[] {
  const warnings: string[] = [];
  const trimmed = markdown.trim();
  if (!trimmed) warnings.push(`${relativePath} is empty`);
  if (kind === "log" && trimmed && !/^#\s+/m.test(trimmed)) {
    warnings.push(`${relativePath} should include a markdown title`);
  }
  return warnings;
}

function resolveLinks(
  links: OkfConceptLink[],
  conceptPath: string,
  conceptPaths: Set<string>,
  conceptIdByPath: Map<string, string>,
): OkfConceptLink[] {
  return links.map((link) => {
    if (link.external) return link;
    const targetPath = normalizeInternalLink(link.href, conceptPath);
    if (!targetPath) return { ...link, broken: true };
    const exists = conceptPaths.has(targetPath);
    return {
      ...link,
      targetPath,
      ...(exists ? { targetConceptId: conceptIdByPath.get(targetPath) } : { broken: true }),
    };
  });
}

function extractMarkdownLinks(markdown: string): OkfConceptLink[] {
  const links: OkfConceptLink[] = [];
  const linkPattern = /!?\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const raw = match[0] ?? "";
    if (raw.startsWith("!")) continue;
    const href = (match[2] ?? "").trim();
    links.push({
      label: (match[1] ?? "").trim(),
      href,
      external: isExternalHref(href),
    });
  }

  return links;
}

function extractSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const headingPattern = new RegExp(`^#+\\s+${escapeRegExp(heading)}\\s*$`, "i");
  const start = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (start === -1) return "";

  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#+\s+/.test(line.trim())) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

function normalizeInternalLink(href: string, conceptPath: string): string | undefined {
  const withoutAnchor = href.split("#")[0] ?? "";
  if (!withoutAnchor.endsWith(".md")) return undefined;
  const baseDir = path.posix.dirname(conceptPath);
  const normalized = withoutAnchor.startsWith("/")
    ? path.posix.normalize(withoutAnchor.slice(1))
    : path.posix.normalize(path.posix.join(baseDir, withoutAnchor));
  if (!normalized || normalized.startsWith("../") || normalized === "..") return undefined;
  return normalized;
}

function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#");
}

function asNonEmptyString(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function conceptIdFromPath(conceptPath: string): string {
  return conceptPath.replace(/\.md$/i, "");
}

function titleFromConceptId(conceptId: string): string {
  const basename = conceptId.split("/").pop() ?? conceptId;
  return basename
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toPosix(value: string): string {
  return value.split(path.sep).join(path.posix.sep);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { reservedFilenames };
