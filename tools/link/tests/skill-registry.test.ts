import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createSkillRegistryServer, listenSkillRegistryServer, SkillRegistryService } from "../src/skill-registry.js";

function registryService(storagePath?: string) {
  let nextId = 0;
  return new SkillRegistryService({
    storagePath,
    idGenerator: () => `test-${++nextId}`,
    now: () => new Date("2026-06-10T12:00:00.000Z"),
  });
}

test("SkillRegistryService tracks unique stars and installs plus run events", () => {
  const service = registryService();

  const firstStar = service.recordEvent("telnyx:sms-delivery-investigation", {
    event_type: "star",
    skill_name: "SMS Delivery Investigation",
    source: "link",
  }, "agent@example.com");
  assert.equal(firstStar.starCount, 1);
  assert.equal(firstStar.starredByActor, true);

  const secondStar = service.recordEvent("telnyx:sms-delivery-investigation", { event_type: "star" }, "agent@example.com");
  assert.equal(secondStar.starCount, 1);

  const install = service.recordEvent("telnyx:sms-delivery-investigation", { event_type: "install" }, "agent@example.com");
  assert.equal(install.installCount, 1);
  assert.equal(install.downloadCount, 1);
  assert.equal(install.installedByActor, true);

  service.recordEvent("telnyx:sms-delivery-investigation", { event_type: "run" }, "agent@example.com");
  const afterRuns = service.recordEvent("telnyx:sms-delivery-investigation", { event_type: "run" }, "agent@example.com");
  assert.equal(afterRuns.runCount, 2);

  const afterUnstar = service.recordEvent("telnyx:sms-delivery-investigation", { event_type: "unstar" }, "agent@example.com");
  assert.equal(afterUnstar.starCount, 0);
  assert.equal(afterUnstar.starredByActor, false);
});

test("SkillRegistryService persists records across restarts", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "link-skill-registry-"));
  const storagePath = path.join(tempDir, "registry.json");
  try {
    registryService(storagePath).recordEvent("link:account-briefing", {
      event_type: "install",
      skill_name: "Account Briefing",
      source: "link",
    }, "agent@example.com");

    const restarted = registryService(storagePath);
    const stats = restarted.getSkill("link:account-briefing", "agent@example.com");
    assert.equal(stats.skillName, "Account Briefing");
    assert.equal(stats.installCount, 1);
    assert.equal(stats.installedByActor, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("SkillRegistry HTTP API requires auth context when configured", async () => {
  const server = createSkillRegistryServer(registryService(), { requireAuth: true, requireAuthContext: true });
  const listener = await listenSkillRegistryServer(server);
  try {
    const missingContext = await fetch(`${listener.url}/skills/link%3Aaccount-briefing/events`, {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({ event_type: "star" }),
    });
    assert.equal(missingContext.status, 401);

    const accepted = await fetch(`${listener.url}/skills/link%3Aaccount-briefing/events`, {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
        "x-telnyx-actor": "agent@example.com",
      },
      body: JSON.stringify({ event_type: "star", skill_name: "Account Briefing" }),
    });
    assert.equal(accepted.status, 202);
    const payload = await accepted.json() as { skill: { starCount: number; starredByActor: boolean } };
    assert.equal(payload.skill.starCount, 1);
    assert.equal(payload.skill.starredByActor, true);
  } finally {
    await listener.close();
  }
});

test("SkillRegistry HTTP API lists requested skill stats", async () => {
  const service = registryService();
  service.recordEvent("link:account-briefing", { event_type: "star", skill_name: "Account Briefing" }, "a@example.com");
  service.recordEvent("link:weekly-team-update", { event_type: "install", skill_name: "Weekly Team Update" }, "b@example.com");
  const server = createSkillRegistryServer(service, { requireAuth: false });
  const listener = await listenSkillRegistryServer(server);
  try {
    const response = await fetch(`${listener.url}/skills?ids=${encodeURIComponent("link:weekly-team-update")}`);
    assert.equal(response.status, 200);
    const payload = await response.json() as { skills: Array<{ skillId: string; installCount: number }> };
    assert.deepEqual(payload.skills.map((skill) => skill.skillId), ["link:weekly-team-update"]);
    assert.equal(payload.skills[0]?.installCount, 1);
  } finally {
    await listener.close();
  }
});

test("SkillRegistry HTTP API exposes Prometheus metrics", async () => {
  const server = createSkillRegistryServer(registryService(), { requireAuth: true });
  const listener = await listenSkillRegistryServer(server);
  try {
    const response = await fetch(`${listener.url}/metrics`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/plain/);
    const metrics = await response.text();
    assert.match(metrics, /link_skill_registry_up 1/);
    assert.match(metrics, /link_skill_registry_http_requests_total \d+/);
  } finally {
    await listener.close();
  }
});

test("SkillRegistryService stores Tool Studio catalog manifests with stats", () => {
  const service = registryService();

  const tool = service.registerCatalogItem({
    name: "Renewal Risk Briefing",
    description: "Summarize renewal risk from account context.",
    owner: "GTM",
    team: "Sales",
    audience: "Sales and Customer Success",
    artifact_type: "skill",
    inputs: "Account name and renewal date.",
    outputs: "Briefing with risks and next actions.",
    tools_required: ["salesforce.account_lookup", "slack.search"],
    source_of_truth: "Salesforce wins for account facts.",
    repeated_checks: "Confirm renewal date and open escalation status.",
    human_checkpoints: "Owner reviews before customer-facing use.",
    test_fixture: "Acme renewal risk chat.",
    reviewers: ["sales.squad"],
    skill_markdown: "---\nname: Renewal Risk Briefing\n---",
  }, "agent@example.com");

  assert.equal(tool.toolId, "tool-studio:renewal-risk-briefing");
  assert.equal(tool.artifactType, "skill");
  assert.equal(tool.approvalRequired, false);
  assert.equal(tool.stats.installCount, 0);

  service.recordEvent(tool.toolId, { event_type: "install", skill_name: tool.name, source: tool.source }, "agent@example.com");
  const listed = service.listCatalog("agent@example.com");
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.stats.installCount, 1);
  assert.equal(listed[0]?.stats.installedByActor, true);
});

test("SkillRegistry catalog HTTP API supports publish, version, and deprecate", async () => {
  const server = createSkillRegistryServer(registryService(), { requireAuth: false });
  const listener = await listenSkillRegistryServer(server);
  try {
    const publish = await fetch(`${listener.url}/catalog`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-telnyx-actor": "agent@example.com" },
      body: JSON.stringify({
        name: "Support Reply Tool",
        description: "Draft support replies with internal checks.",
        owner: "Support",
        team: "Support",
        audience: "Support",
        artifactType: "skill",
        riskLevel: "medium",
        customerSafe: true,
        reviewers: ["support.squad"],
      }),
    });
    assert.equal(publish.status, 201);
    const published = await publish.json() as { tool: { toolId: string; approvalRequired: boolean; version: string } };
    assert.equal(published.tool.toolId, "tool-studio:support-reply-tool");
    assert.equal(published.tool.approvalRequired, true);
    assert.equal(published.tool.version, "1.0.0");

    const version = await fetch(`${listener.url}/catalog/${encodeURIComponent(published.tool.toolId)}/versions`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-telnyx-actor": "agent@example.com" },
      body: JSON.stringify({
        name: "Support Reply Tool",
        description: "Draft support replies with source and approval checks.",
        owner: "Support",
        team: "Support",
        version: "1.1.0",
      }),
    });
    assert.equal(version.status, 201);
    const versionPayload = await version.json() as { tool: { version: string; versions: Array<{ version: string }> } };
    assert.equal(versionPayload.tool.version, "1.1.0");
    assert.deepEqual(versionPayload.tool.versions.map((item) => item.version), ["1.0.0", "1.1.0"]);

    const deprecated = await fetch(`${listener.url}/catalog/${encodeURIComponent(published.tool.toolId)}/deprecations`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-telnyx-actor": "agent@example.com" },
      body: JSON.stringify({ notes: "Replaced by a managed MCP tool." }),
    });
    assert.equal(deprecated.status, 202);
    const deprecatedPayload = await deprecated.json() as { tool: { status: string; deprecatedAt?: string } };
    assert.equal(deprecatedPayload.tool.status, "deprecated");
    assert.ok(deprecatedPayload.tool.deprecatedAt);
  } finally {
    await listener.close();
  }
});
