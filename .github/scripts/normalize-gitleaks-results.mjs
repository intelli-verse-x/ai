#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

const allowlistPath = ".secretscanner-allowlist.json";
let allowlist = [];
try {
  const rawAllowlist = readFileSync(allowlistPath, "utf8");
  allowlist = JSON.parse(rawAllowlist).pathRegex || [];
} catch {
  allowlist = [];
}

const normalizedAllowlist = allowlist.map((pattern) => new RegExp(pattern));
const argv = process.argv.slice(2);
let sourceRoot = process.cwd();
const reportPaths = [];

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === "--source-root") {
    sourceRoot = resolve(argv[i + 1] || process.cwd());
    i += 1;
    continue;
  }
  reportPaths.push(arg);
}

if (reportPaths.length === 0) {
  console.error("Usage: normalize-gitleaks-results.mjs [--source-root <path>] <report.json> [...]");
  process.exit(2);
}

const findings = [];
const counts = { high: 0, medium: 0, low: 0 };

for (const reportPath of reportPaths) {
  const raw = readFileSync(reportPath, "utf8");
  const parsed = raw.trim() ? JSON.parse(raw) : [];
  const reportDir = dirname(resolve(reportPath));

  for (const finding of parsed) {
    const artifactPath = String(finding.File || "");
    const shouldSkip = normalizedAllowlist.some((pattern) => pattern.test(artifactPath));
    if (shouldSkip) {
      continue;
    }

    const normalizedToken = `${finding.RuleID || ""}|${finding.File || ""}|${finding.Line || ""}|${finding.StartLine || ""}`;
    const secretSnippet = String(finding.Match || finding.Secret || "");
    const snippetHash = hash(`${normalizedToken}|${secretSnippet}`);
    const detector = String(finding.RuleID || finding.Description || "unknown");
    const severity = classifySeverity(finding);
    const resolvedArtifactPath = resolveArtifactPath(artifactPath, sourceRoot, reportDir);

    findings.push({
      artifact_path: artifactPath,
      artifact_sha256: fileHash(resolvedArtifactPath),
      detector,
      snippet_hash: snippetHash,
      severity,
      match_count: 1,
      first_seen_file: artifactPath,
    });

    counts[severity] = (counts[severity] || 0) + 1;
  }
}

writeFileSync(
  "secret-scan-results.jsonl",
  findings.map((finding) => JSON.stringify(finding)).join("\n"),
);

console.log(`secret_scan_summary high=${counts.high} medium=${counts.medium} low=${counts.low}`);

const manualApproved = String(process.env.MANUAL_PUBLISH_APPROVED || "false").toLowerCase() === "true";
if (counts.high > 0 || (counts.medium > 0 && !manualApproved)) {
  process.exit(1);
}

function resolveArtifactPath(artifactPath, sourceRootPath, reportDir) {
  if (!artifactPath) return null;
  if (isAbsolute(artifactPath)) return artifactPath;

  const sourceCandidate = join(sourceRootPath, artifactPath);
  if (existsSync(sourceCandidate)) return sourceCandidate;

  const reportCandidate = join(reportDir, artifactPath);
  if (existsSync(reportCandidate)) return reportCandidate;

  return null;
}

function fileHash(path) {
  if (!path || !existsSync(path)) {
    return hash("");
  }
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function classifySeverity(finding) {
  const rule = String(finding.RuleID || "").toLowerCase();
  const description = String(finding.Description || "").toLowerCase();
  const tags = Array.isArray(finding.Tags) ? finding.Tags.join(" ").toLowerCase() : "";
  const text = `${rule} ${description} ${tags}`.toLowerCase();
  const entropy = Number(finding.Entropy || 0);

  if (
    text.includes("private-key") ||
    text.includes("github-pat") ||
    text.includes("access_token") ||
    text.includes("api key") ||
    text.includes("apikey") ||
    entropy >= 4.5
  ) {
    return "high";
  }

  if (
    text.includes("secret") ||
    text.includes("token") ||
    text.includes("jwt") ||
    text.includes("password") ||
    entropy >= 4
  ) {
    return "medium";
  }

  return "low";
}

function hash(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}
