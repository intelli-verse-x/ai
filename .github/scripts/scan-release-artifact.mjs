#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

function ensureGitleaks() {
  try {
    execFileSync("gitleaks", ["version"], { stdio: "ignore" });
  } catch {
    throw new Error("gitleaks is required on PATH for pre-publish secret scanning");
  }
}

function stageArtifact(tarballPath) {
  const stagingRoot = resolve(
    tmpdir(),
    `release-secret-scan-${process.pid}-${Date.now()}`,
  );
  const artifactRoot = join(stagingRoot, "artifact");
  mkdirSync(artifactRoot, { recursive: true });

  execFileSync("tar", ["-xzf", tarballPath, "-C", artifactRoot], {
    stdio: "inherit",
  });

  const metadataRoot = join(stagingRoot, "release-metadata");
  mkdirSync(metadataRoot, { recursive: true });

  for (const file of ["package.json", "package-lock.json", "npm-shrinkwrap.json"]) {
    const sourcePath = resolve(process.cwd(), file);
    if (existsSync(sourcePath)) {
      cpSync(sourcePath, join(metadataRoot, file));
    }
  }

  writeFileSync(
    join(metadataRoot, "publish-context.json"),
    JSON.stringify(
      {
        package_dir: process.cwd(),
        artifact_name: basename(tarballPath),
        github_repository: process.env.GITHUB_REPOSITORY || null,
        github_workflow: process.env.GITHUB_WORKFLOW || null,
        github_run_id: process.env.GITHUB_RUN_ID || null,
        github_sha: process.env.GITHUB_SHA || null,
        github_ref: process.env.GITHUB_REF || null,
        publish_tag: process.env.NPM_PUBLISH_TAG || null,
      },
      null,
      2,
    ),
  );

  return stagingRoot;
}

export function scanReleaseArtifact(tarballPath) {
  const resolvedTarballPath = resolve(tarballPath);
  if (!existsSync(resolvedTarballPath)) {
    throw new Error(`Artifact not found: ${resolvedTarballPath}`);
  }

  ensureGitleaks();

  const stagingRoot = stageArtifact(resolvedTarballPath);
  const reportPath = join(stagingRoot, "gitleaks-report.json");

  try {
    execFileSync(
      "gitleaks",
      [
        "detect",
        "--no-git",
        "--source",
        stagingRoot,
        "--redact",
        "--report-format",
        "json",
        "--report-path",
        reportPath,
        "--exit-code",
        "0",
        "--log-level",
        "warn",
      ],
      { stdio: "inherit", env: process.env },
    );

    execFileSync(
      "node",
      [
        resolve(dirname(new URL(import.meta.url).pathname), "normalize-gitleaks-results.mjs"),
        "--source-root",
        stagingRoot,
        reportPath,
      ],
      { stdio: "inherit", env: process.env },
    );

    if (!existsSync(resolve(process.cwd(), "secret-scan-results.jsonl"))) {
      throw new Error("secret-scan-results.jsonl was not created");
    }
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
}

function main(argv) {
  const artifactPath = argv[2];
  if (!artifactPath || artifactPath === "--help" || artifactPath === "-h") {
    console.error("Usage: scan-release-artifact.mjs <artifact.tgz>");
    process.exit(artifactPath ? 0 : 2);
  }

  scanReleaseArtifact(artifactPath);
  console.log(`Release artifact scan passed for ${artifactPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv);
}
