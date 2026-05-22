import test from "node:test";
import assert from "node:assert/strict";
import { chmodSync, cpSync, existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { delimiter, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures", "release-artifact-scanner");
const SCAN_SCRIPT_PATH = join(__dirname, "../.github/scripts/scan-release-artifact.mjs");
const GITHUB_RELEASE_SECRET = "github_pat_1234567890abcdefghijklmnopqrstuvwxyz";
const N8N_BUNDLE_SECRET = "sk-live-1234567890abcdefghijklmnopqrstuv";

function withArtifact(files, run) {
  const root = mkdtempSync(join(tmpdir(), "release-artifact-scan-"));
  const pkgDir = join(root, "package");
  mkdirSync(pkgDir, { recursive: true });

  for (const [relativePath, contents] of Object.entries(files)) {
    const destination = join(pkgDir, relativePath);
    mkdirSync(join(destination, ".."), { recursive: true });
    writeFileSync(destination, contents);
  }

  const tarballPath = join(root, "artifact.tgz");
  execFileSync("tar", ["-czf", tarballPath, "-C", root, "package"]);

  try {
    run(tarballPath);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withFixtureArtifact(name, run) {
  const root = mkdtempSync(join(tmpdir(), "release-artifact-fixture-"));
  const fixtureDir = join(FIXTURES_DIR, name);
  const packageDir = join(fixtureDir, "package");
  const tarballPath = join(root, `${name}.tgz`);

  cpSync(packageDir, join(root, "package"), { recursive: true });
  execFileSync("tar", ["-czf", tarballPath, "-C", root, "package"]);

  try {
    run(tarballPath);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withScannerRun(tarballPath, run) {
  const root = mkdtempSync(join(tmpdir(), "release-artifact-run-"));
  const binDir = join(root, "bin");
  const resultsPath = join(root, "secret-scan-results.jsonl");
  mkdirSync(binDir, { recursive: true });

  const gitleaksPath = join(binDir, "gitleaks");
  writeFileSync(gitleaksPath, `#!/usr/bin/env node
const { readFileSync, readdirSync, statSync, writeFileSync } = require("node:fs");
const { join, relative } = require("node:path");

const argv = process.argv.slice(2);
if (argv[0] === "version") {
  process.stdout.write("gitleaks-test-stub\\n");
  process.exit(0);
}

if (argv[0] !== "detect") {
  process.stderr.write("unsupported gitleaks invocation\\n");
  process.exit(2);
}

let source = process.cwd();
let reportPath = "";
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--source") source = argv[i + 1];
  if (argv[i] === "--report-path") reportPath = argv[i + 1];
}

const detectors = [
  { id: "github-pat", pattern: /\\bgithub_pat_[A-Za-z0-9_]{20,}\\b/g },
  { id: "openai-key", pattern: /\\bsk-(?:proj-|live-|test-)?[A-Za-z0-9_-]{20,}\\b/g },
];

const findings = [];

function walk(currentPath) {
  for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
    const nextPath = join(currentPath, entry.name);
    if (entry.isDirectory()) {
      walk(nextPath);
      continue;
    }

    const raw = readFileSync(nextPath, "utf8");
    for (const detector of detectors) {
      detector.pattern.lastIndex = 0;
      for (const match of raw.matchAll(detector.pattern)) {
        findings.push({
          RuleID: detector.id,
          Description: detector.id,
          File: relative(source, nextPath).split("\\\\").join("/"),
          Match: match[0],
          Secret: match[0],
          StartLine: 1,
          Line: 1,
          Entropy: 5,
        });
      }
    }
  }
}

walk(source);
writeFileSync(reportPath, JSON.stringify(findings, null, 2));
process.exit(0);
`);
  chmodSync(gitleaksPath, 0o755);

  const result = spawnSync(process.execPath, [SCAN_SCRIPT_PATH, tarballPath], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
    },
  });

  const findings = existsSync(resultsPath)
    ? readFileSync(resultsPath, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
    : [];

  try {
    run({ result, findings });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("returns no findings for a clean artifact", () => {
  withArtifact(
    {
      "README.md": "# Clean package\n",
      "dist/index.js": "export const value = 'safe';\n",
    },
    (tarballPath) => {
      withScannerRun(tarballPath, ({ result, findings }) => {
        assert.equal(result.status, 0);
        assert.deepEqual(findings, []);
        assert.match(result.stdout, /secret_scan_summary high=0 medium=0 low=0/);
        assert.match(result.stdout, /Release artifact scan passed/);
      });
    },
  );
});

test("detects high-confidence tokens without surfacing raw secret text", () => {
  withArtifact(
    {
      "dist/index.js": "export const token = 'github_pat_1234567890abcdefghijklmnopqrstuvwxyz';\n",
    },
    (tarballPath) => {
      withScannerRun(tarballPath, ({ result, findings }) => {
        assert.equal(result.status, 1);
        assert.equal(findings.length, 1);
        assert.equal(findings[0].detector, "github-pat");
        assert.equal(findings[0].artifact_path, "artifact/package/dist/index.js");
        assert.equal(findings[0].severity, "high");
        assert.match(findings[0].artifact_sha256, /^[a-f0-9]{64}$/);
        assert.match(findings[0].snippet_hash, /^[a-f0-9]{64}$/);
        const output = `${result.stdout}\n${result.stderr}`;
        assert.equal(JSON.stringify(findings).includes("github_pat_"), false);
        assert.equal(output.includes("github_pat_"), false);
      });
    },
  );
});

test("allows a clean GitHub release artifact path", () => {
  withFixtureArtifact("github-release-clean", (tarballPath) => {
    withScannerRun(tarballPath, ({ result, findings }) => {
      assert.equal(result.status, 0);
      assert.deepEqual(findings, []);
      assert.match(result.stdout, /Release artifact scan passed/);
    });
  });
});

test("blocks a GitHub release artifact path without logging the raw secret", () => {
  withFixtureArtifact("github-release-secret", (tarballPath) => {
    withScannerRun(tarballPath, ({ result, findings }) => {
      assert.equal(result.status, 1);
      assert.equal(findings.length, 1);
      assert.equal(findings[0].detector, "github-pat");
      assert.equal(findings[0].artifact_path, "artifact/package/.github/releases/telnyx-agent/v1.2.3/checksums.txt");
      assert.equal(findings[0].severity, "high");
      const output = `${result.stdout}\n${result.stderr}`;
      assert.match(output, /secret_scan_summary high=1 medium=0 low=0/);
      assert.equal(JSON.stringify(findings).includes(GITHUB_RELEASE_SECRET), false);
      assert.equal(output.includes(GITHUB_RELEASE_SECRET), false);
    });
  });
});

test("allows a clean n8n generated bundle path", () => {
  withFixtureArtifact("n8n-generated-clean", (tarballPath) => {
    withScannerRun(tarballPath, ({ result, findings }) => {
      assert.equal(result.status, 0);
      assert.deepEqual(findings, []);
      assert.match(result.stdout, /Release artifact scan passed/);
    });
  });
});

test("blocks an n8n generated bundle path without logging the raw secret", () => {
  withFixtureArtifact("n8n-generated-secret", (tarballPath) => {
    withScannerRun(tarballPath, ({ result, findings }) => {
      assert.equal(result.status, 1);
      assert.equal(findings.length, 1);
      assert.equal(findings[0].detector, "openai-key");
      assert.equal(findings[0].artifact_path, "artifact/package/dist/n8n/generated/workflow.bundle.js");
      assert.equal(findings[0].severity, "high");
      const output = `${result.stdout}\n${result.stderr}`;
      assert.match(output, /secret_scan_summary high=1 medium=0 low=0/);
      assert.equal(JSON.stringify(findings).includes(N8N_BUNDLE_SECRET), false);
      assert.equal(output.includes(N8N_BUNDLE_SECRET), false);
    });
  });
});
