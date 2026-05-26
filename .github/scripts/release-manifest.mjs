#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const MUTABLE_URL_PATTERN = /(^|[/?#._=-])(latest|main|master)([/?#._=-]|$)/i;
const HEX_40_PATTERN = /^[0-9a-f]{40}$/;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function detectMime(filename) {
  if (filename.endsWith(".tgz")) return "application/gzip";
  if (filename.endsWith(".tar.gz")) return "application/gzip";
  if (filename.endsWith(".zip")) return "application/zip";
  if (filename.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

export function isImmutableUrl(url, tag, version) {
  if (!url.startsWith("https://")) return false;
  if (MUTABLE_URL_PATTERN.test(url)) return false;

  const lowered = url.toLowerCase();
  return lowered.includes(tag.toLowerCase()) || lowered.includes(version.toLowerCase());
}

export function toChecksums(entries) {
  return entries.map((entry) => `${entry.sha256}  ${entry.path}`).join("\n") + "\n";
}

export function verifyManifest(manifest, checksums, releaseFiles, version) {
  assert(manifest.manifest_version === "1.0.0", "manifest_version must be 1.0.0");
  assert(["mcp", "plugin", "agent"].includes(manifest.artifact_type), "artifact_type must be mcp, plugin, or agent");
  assert(HEX_40_PATTERN.test(manifest.commit), "commit must be a 40-character lowercase hex SHA");

  const sortedPaths = [...manifest.files.map((file) => file.path)].sort();
  assert(
    JSON.stringify(sortedPaths) === JSON.stringify(manifest.files.map((file) => file.path)),
    "manifest files must be sorted by path",
  );

  const checksumEntries = new Map();
  for (const line of checksums.trim().split("\n")) {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    assert(match, `invalid checksum line: ${line}`);
    checksumEntries.set(match[2], match[1]);
  }

  const payloadPaths = new Set(releaseFiles.map((file) => file.path));

  for (const file of manifest.files) {
    assert(payloadPaths.has(file.path), `manifest path missing from release payload: ${file.path}`);
    assert(checksumEntries.has(file.path), `manifest path missing from SHA256SUMS: ${file.path}`);
    assert(checksumEntries.get(file.path) === file.sha256, `checksum mismatch for ${file.path}`);
    assert(isImmutableUrl(file.url, manifest.tag, version), `mutable or non-versioned URL: ${file.url}`);
  }

  for (const file of releaseFiles) {
    assert(manifest.files.some((entry) => entry.path === file.path), `release payload file missing from manifest: ${file.path}`);
  }
}

export async function buildManifest({
  artifactName,
  artifactType,
  buildTimestamp,
  commit,
  releaseChannel,
  tag,
  version,
  releaseFiles,
}) {
  const files = [...releaseFiles]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((file) => ({
      path: file.path,
      sha256: file.sha256,
      size: file.size,
      mime: file.mime,
      url: file.url,
    }));

  const manifest = {
    manifest_version: "1.0.0",
    artifact_type: artifactType,
    artifact_name: artifactName,
    tag,
    commit,
    build_timestamp: buildTimestamp,
    release_channel: releaseChannel,
    files,
  };

  verifyManifest(manifest, toChecksums(files), releaseFiles, version);
  return manifest;
}

async function sha256File(filePath) {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

async function git(args, cwd) {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trim();
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  assert(response.ok, `failed to fetch ${url}: ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const [, , packageDirArg, outputDirArg, tarballPathArg] = process.argv;
  assert(packageDirArg, "usage: release-manifest.mjs <package-dir> <output-dir> <local-tarball>");
  assert(outputDirArg, "output directory is required");
  assert(tarballPathArg, "local tarball path is required");

  const packageDir = path.resolve(packageDirArg);
  const outputDir = path.resolve(outputDirArg);
  const tarballPath = path.resolve(tarballPathArg);

  const releaseTag = process.env.RELEASE_TAG;
  const releaseChannel = process.env.RELEASE_CHANNEL ?? "production";
  const artifactType = process.env.RELEASE_ARTIFACT_TYPE ?? "agent";

  assert(releaseTag, "RELEASE_TAG must be set");

  const packageJson = JSON.parse(await readFile(path.join(packageDir, "package.json"), "utf8"));
  const packageName = packageJson.name;
  const version = packageJson.version;
  const safePackageName = packageName.replace(/^@/, "").replace(/\//g, "-");

  const commit = await git(["rev-list", "-n", "1", releaseTag], packageDir);
  assert(HEX_40_PATTERN.test(commit), `tag ${releaseTag} did not resolve to a 40-character commit SHA`);

  const tarballUrl = JSON.parse(
    (await execFileAsync("npm", ["view", `${packageName}@${version}`, "dist.tarball", "--json"], { cwd: packageDir })).stdout,
  );
  assert(isImmutableUrl(tarballUrl, releaseTag, version), `npm dist.tarball URL is mutable or missing version/tag: ${tarballUrl}`);

  const localSha256 = await sha256File(tarballPath);
  const remoteTarball = await fetchBuffer(tarballUrl);
  const remoteSha256 = createHash("sha256").update(remoteTarball).digest("hex");
  assert(localSha256 === remoteSha256, `published tarball hash mismatch for ${packageName}@${version}`);

  const tarballStat = await stat(tarballPath);
  const tarballName = path.basename(tarballPath);

  const releaseFiles = [
    {
      path: tarballName,
      sha256: localSha256,
      size: tarballStat.size,
      mime: detectMime(tarballName),
      url: tarballUrl,
    },
  ];

  const buildTimestamp = new Date().toISOString();
  const manifest = await buildManifest({
    artifactName: packageName,
    artifactType,
    buildTimestamp,
    commit,
    releaseChannel,
    tag: releaseTag,
    version,
    releaseFiles,
  });

  const checksums = toChecksums(manifest.files);

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outputDir, "SHA256SUMS"), checksums);

  const assetBaseName = `${safePackageName}-${version}`;
  await writeFile(path.join(outputDir, `${assetBaseName}.release-manifest.json`), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outputDir, `${assetBaseName}.SHA256SUMS`), checksums);

  process.stdout.write(
    `${JSON.stringify(
      {
        packageName,
        version,
        releaseTag,
        tarballUrl,
        outputDir,
        manifestPath: path.join(outputDir, "release-manifest.json"),
        checksumsPath: path.join(outputDir, "SHA256SUMS"),
        uploadManifestPath: path.join(outputDir, `${assetBaseName}.release-manifest.json`),
        uploadChecksumsPath: path.join(outputDir, `${assetBaseName}.SHA256SUMS`),
      },
      null,
      2,
    )}\n`,
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
