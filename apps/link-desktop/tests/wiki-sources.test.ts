import test from "node:test";
import assert from "node:assert/strict";

test("renderer preview Wiki source API manages custom source lifecycle", async () => {
  const localStorageStub: Storage = {
    length: 0,
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    removeItem: () => undefined,
    setItem: () => undefined,
  };

  (globalThis as unknown as { window: { localStorage: Storage } }).window = {
    localStorage: localStorageStub,
  };

  const { linkApi } = await import("../src/renderer/api.js");
  const defaults = await linkApi.resetWikiSources();

  assert.equal(defaults.length, 4);
  assert.deepEqual(
    defaults.map((source) => source.label).sort(),
    ["Dev Docs", "Guru", "Help Center", "Pylon"],
  );
  assert.ok(defaults.every((source) => !source.readonly));
  assert.ok(defaults.every((source) => source.configuredBy === "telnyx"));

  const helpCenter = defaults.find((source) => source.id === "telnyx-help-center");
  assert.ok(helpCenter);
  const renamedDefaults = await linkApi.saveWikiSource({
    id: helpCenter.id,
    type: helpCenter.type,
    label: "Support",
    target: helpCenter.target,
    description: helpCenter.description,
    enabled: true,
    metadata: { ...helpCenter.metadata, icon: "shield" },
  });
  const renamedHelpCenter = renamedDefaults.find((source) => source.id === helpCenter.id);

  assert.ok(renamedHelpCenter);
  assert.equal(renamedHelpCenter.label, "Support");
  assert.equal(renamedHelpCenter.configuredBy, "telnyx");
  assert.equal(renamedHelpCenter.metadata?.icon, "shield");

  const withSource = await linkApi.saveWikiSource({
    type: "github",
    label: "QA GitHub docs",
    target: "team-telnyx/qa-docs",
    description: "QA-only documentation source for Wiki validation.",
    enabled: true,
    metadata: { branch: "main", path: "wiki" },
  });
  const added = withSource.find((source) => source.label === "QA GitHub docs");

  assert.ok(added);
  assert.equal(added.target, "https://github.com/team-telnyx/qa-docs");
  assert.equal(added.readonly, false);
  assert.equal(added.status, "connected");

  const repointedSources = await linkApi.saveWikiSource({
    id: added.id,
    type: "github",
    label: "QA GitHub docs",
    target: "team-telnyx/repointed-docs",
    description: added.description,
    enabled: true,
    metadata: { branch: "main", path: "handbook" },
  });
  const repointed = repointedSources.find((source) => source.id === added.id);

  assert.ok(repointed);
  assert.equal(repointed.target, "https://github.com/team-telnyx/repointed-docs");
  assert.deepEqual(repointed.metadata, { branch: "main", path: "handbook" });

  const afterDelete = await linkApi.deleteWikiSource(added.id);

  assert.equal(afterDelete.length, 4);
  assert.equal(afterDelete.some((source) => source.id === added.id), false);
  assert.ok(afterDelete.every((source) => !source.readonly));

  const afterDefaultDelete = await linkApi.deleteWikiSource(helpCenter.id);

  assert.equal(afterDefaultDelete.length, 3);
  assert.equal(afterDefaultDelete.some((source) => source.id === helpCenter.id), false);

  const afterReset = await linkApi.resetWikiSources();

  assert.equal(afterReset.length, 4);
  assert.equal(afterReset.find((source) => source.id === helpCenter.id)?.label, "Help Center");

  await assert.rejects(
    () => linkApi.saveWikiSource({ type: "telnyx_support" as "github", label: "Help Center", target: "https://support.telnyx.com/en/" }),
    /Only GitHub, MCP, and OKF sources can be added/,
  );
});
