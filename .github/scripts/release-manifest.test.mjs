import test from "node:test";
import assert from "node:assert/strict";

import { buildManifest, isImmutableUrl, toChecksums, verifyManifest } from "./release-manifest.mjs";

test("isImmutableUrl rejects mutable selectors and requires https", () => {
  assert.equal(isImmutableUrl("https://registry.npmjs.org/@telnyx/agent-cli/-/agent-cli-0.3.0.tgz", "v0.3.0", "0.3.0"), true);
  assert.equal(isImmutableUrl("https://example.com/download/latest/agent-cli.tgz", "v0.3.0", "0.3.0"), false);
  assert.equal(isImmutableUrl("http://example.com/v0.3.0/agent-cli.tgz", "v0.3.0", "0.3.0"), false);
});

test("buildManifest emits deterministic manifest and matching checksums", async () => {
  const releaseFiles = [
    {
      path: "telnyx-agent-cli-0.3.0.tgz",
      sha256: "a".repeat(64),
      size: 123,
      mime: "application/gzip",
      url: "https://registry.npmjs.org/@telnyx/agent-cli/-/agent-cli-0.3.0.tgz",
    },
  ];

  const manifest = await buildManifest({
    artifactName: "@telnyx/agent-cli",
    artifactType: "agent",
    buildTimestamp: "2026-05-22T12:00:00.000Z",
    commit: "b".repeat(40),
    releaseChannel: "production",
    tag: "v0.3.0",
    version: "0.3.0",
    releaseFiles,
  });

  assert.deepEqual(manifest.files, releaseFiles);

  const checksums = toChecksums(manifest.files);
  assert.equal(checksums, `${"a".repeat(64)}  telnyx-agent-cli-0.3.0.tgz\n`);

  assert.doesNotThrow(() => verifyManifest(manifest, checksums, releaseFiles, "0.3.0"));
});
