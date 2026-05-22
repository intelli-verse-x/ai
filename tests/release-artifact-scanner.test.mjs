import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { scanReleaseArtifact } from "../.github/scripts/scan-release-artifact.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures", "release-artifact-scanner");
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

function runScannerCli(tarballPath) {
  return spawnSync(process.execPath, [join(__dirname, "../.github/scripts/scan-release-artifact.mjs"), tarballPath], {
    cwd: join(__dirname, ".."),
    encoding: "utf8",
  });
}

test("returns no findings for a clean artifact", () => {
  withArtifact(
    {
      "README.md": "# Clean package\n",
      "dist/index.js": "export const value = 'safe';\n",
    },
    (tarballPath) => {
      assert.deepEqual(scanReleaseArtifact(tarballPath), []);
    },
  );
});

test("detects high-confidence tokens without surfacing raw secret text", () => {
  withArtifact(
    {
      "dist/index.js": "export const token = 'github_pat_1234567890abcdefghijklmnopqrstuvwxyz';\n",
    },
    (tarballPath) => {
      const findings = scanReleaseArtifact(tarballPath);
      assert.equal(findings.length, 1);
      assert.equal(findings[0].detector, "github-pat");
      assert.equal(findings[0].path, "package/dist/index.js");
      assert.match(findings[0].fileSha256, /^[a-f0-9]{64}$/);
      assert.match(findings[0].matchSha256, /^[a-f0-9]{64}$/);
      assert.equal("rawMatch" in findings[0], false);
      assert.equal(JSON.stringify(findings).includes("github_pat_"), false);
    },
  );
});

test("allows a clean GitHub release artifact path", () => {
  withFixtureArtifact("github-release-clean", (tarballPath) => {
    assert.deepEqual(scanReleaseArtifact(tarballPath), []);

    const result = runScannerCli(tarballPath);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Release artifact scan passed/);
  });
});

test("blocks a GitHub release artifact path without logging the raw secret", () => {
  withFixtureArtifact("github-release-secret", (tarballPath) => {
    const findings = scanReleaseArtifact(tarballPath);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].detector, "github-pat");
    assert.equal(findings[0].path, "package/.github/releases/telnyx-agent/v1.2.3/checksums.txt");
    assert.equal(JSON.stringify(findings).includes(GITHUB_RELEASE_SECRET), false);

    const result = runScannerCli(tarballPath);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /High-confidence secret findings blocked release artifact publish\./);
    assert.match(result.stderr, /package\/\.github\/releases\/telnyx-agent\/v1\.2\.3\/checksums\.txt/);
    assert.equal(result.stderr.includes(GITHUB_RELEASE_SECRET), false);
  });
});

test("allows a clean n8n generated bundle path", () => {
  withFixtureArtifact("n8n-generated-clean", (tarballPath) => {
    assert.deepEqual(scanReleaseArtifact(tarballPath), []);

    const result = runScannerCli(tarballPath);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Release artifact scan passed/);
  });
});

test("blocks an n8n generated bundle path without logging the raw secret", () => {
  withFixtureArtifact("n8n-generated-secret", (tarballPath) => {
    const findings = scanReleaseArtifact(tarballPath);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].detector, "openai-key");
    assert.equal(findings[0].path, "package/dist/n8n/generated/workflow.bundle.js");
    assert.equal(JSON.stringify(findings).includes(N8N_BUNDLE_SECRET), false);

    const result = runScannerCli(tarballPath);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /High-confidence secret findings blocked release artifact publish\./);
    assert.match(result.stderr, /package\/dist\/n8n\/generated\/workflow\.bundle\.js/);
    assert.equal(result.stderr.includes(N8N_BUNDLE_SECRET), false);
  });
});
