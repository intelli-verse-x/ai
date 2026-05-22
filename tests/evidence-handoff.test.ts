import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPublishPathPayload,
  buildSecretExposurePayload,
  resolveOwner,
} from "../scripts/evidence-handoff.ts";
import type { ScanReport } from "../scripts/publish-secret-scan.ts";
import { scanPaths } from "../scripts/publish-secret-scan.ts";

describe("evidence handoff payload builder", () => {
  const codeownersText = [
    "* @aisling404 @Oliver-Zimmerman",
    "/plugins/opencode/ @aaronjo-Telnyx",
  ].join("\n");

  it("builds publish-path payloads with explicit owner routing and ack deadline", () => {
    const payload = buildPublishPathPayload({
      packageName: "@telnyx/agent-toolkit",
      packageDir: "tools/typescript",
      workflow: "publish-npm",
      actor: "release-bot",
      incidentId: "INC-123",
      reason: "manual publish gate disable",
      timestampUtc: "2026-05-22T12:00:00.000Z",
      gateState: "disabled",
      ownerId: "aisling404",
      ownerContactTarget: "github:@aisling404",
      onCallGroupId: "release-oncall",
      codeownersText,
      workflowSummaryPath: "/tmp/summary.md",
      auditLogPath: "/tmp/publish-audit-log.txt",
      runUrl: "https://github.com/team-telnyx/ai/actions/runs/123",
    });

    assert.equal(payload.incidentClass, "publish_path");
    assert.equal(payload.routing.owner.id, "aisling404");
    assert.equal(payload.routing.ownerResolutionState, "resolved_owner");
    assert.equal(payload.routing.ackDeadlineUtc, "2026-05-22T12:10:00.000Z");
    assert.equal(payload.routing.escalationState, "owner_notified");
    assert.equal(payload.routing.currentEvent, "owner_notified");
    assert.equal(payload.routing.nextEscalationState, "oncall_notified");
    assert.equal(payload.routing.nextEscalationAtUtc, "2026-05-22T12:10:00.000Z");
    assert.equal(payload.routing.notificationTargets.onCall.contactTarget, "group:release-oncall");
    assert.equal(payload.metadata.gateState, "disabled");
    assert.equal(payload.evidenceReferences.length, 2);
  });

  it("escalates publish-path overrides to on-call without losing owner routing", () => {
    const payload = buildPublishPathPayload({
      packageName: "@telnyx/opencode",
      packageDir: "plugins/opencode",
      workflow: "publish-npm",
      actor: "release-bot",
      incidentId: "INC-124",
      reason: "manual override while publish gate is active",
      timestampUtc: "2026-05-22T12:00:00.000Z",
      gateState: "override",
      ownerId: "aaronjo-Telnyx",
      onCallGroupId: "release-oncall",
      codeownersText,
      workflowSummaryPath: "/tmp/summary.md",
      auditLogPath: "/tmp/publish-audit-log.txt",
    });

    assert.equal(payload.routing.escalationState, "oncall_notified");
    assert.equal(payload.routing.ackDeadlineUtc, "2026-05-22T12:20:00.000Z");
    assert.equal(payload.routing.nextEscalationState, "cto_notified");
    assert.equal(payload.routing.owner.id, "aaronjo-Telnyx");
  });

  it("builds secret-exposure payloads without leaking raw findings and escalates to CTO for live critical findings", () => {
    const report = scanPaths(["tests/fixtures/publish-secret-scan"], process.cwd());
    const payload = buildSecretExposurePayload({
      packageName: "@telnyx/agent-cli",
      packageDir: "cli",
      workflow: "publish-npm",
      actor: "release-bot",
      incidentId: "INC-456",
      reason: "blocking secret scan findings",
      timestampUtc: "2026-05-22T12:00:00.000Z",
      ownerId: "aisling404",
      ownerContactTarget: "github:@aisling404",
      onCallGroupId: "release-oncall",
      codeownersText,
      scanReportPath: "/tmp/scan-report.json",
      runUrl: "https://github.com/team-telnyx/ai/actions/runs/456",
      report,
    });

    assert.equal(payload.incidentClass, "secret_exposure");
    assert.equal(payload.routing.escalationState, "cto_notified");
    assert.equal(payload.routing.currentEvent, "cto_notified");
    assert.equal(payload.routing.ackDeadlineUtc, "2026-05-22T12:00:00.000Z");
    assert.equal(payload.routing.nextEscalationState, undefined);
    assert.equal(payload.confidence.source, "publish_secret_scan");
    assert.ok(payload.evidenceReferences.some((reference) => reference.type === "secret_finding"));

    const json = JSON.stringify(payload);
    assert.equal(json.includes("ghp_0123456789abcdef0123456789abcdef0123"), false);
    assert.equal(json.includes("npm_0123456789abcdef0123456789abcdef0123"), false);
    assert.equal(json.includes("ProdSecretTokenValue987654321"), false);
  });

  it("keeps non-critical secret exposure handoffs at on-call with the shared escalation route", () => {
    const report: ScanReport = {
      reportVersion: "1",
      scannedPaths: ["cli"],
      summary: {
        filesScanned: 1,
        findings: 1,
        blockingFindings: 1,
        suppressedFindings: 0,
      },
      findings: [
        {
          reportVersion: "1",
          findingId: "finding-1",
          evidenceFingerprint: "abc123def4567890",
          detectorId: "aws_access_key_id",
          secretClass: "aws_access_key_id",
          severity: "high",
          confidence: "high",
          path: "cli/example.ts",
          line: 12,
          sourceSurface: "publish_artifact",
          matchLength: 20,
        },
      ],
    };

    const payload = buildSecretExposurePayload({
      packageName: "@telnyx/agent-cli",
      packageDir: "cli",
      workflow: "publish-npm",
      actor: "release-bot",
      incidentId: "INC-789",
      reason: "blocking secret scan findings",
      timestampUtc: "2026-05-22T12:00:00.000Z",
      ownerId: "aisling404",
      onCallGroupId: "release-oncall",
      codeownersText,
      report,
    });

    assert.equal(payload.routing.escalationState, "oncall_notified");
    assert.equal(payload.routing.ackDeadlineUtc, "2026-05-22T12:10:00.000Z");
    assert.equal(payload.routing.nextEscalationState, "cto_notified");
  });

  it("falls back deterministically when explicit owner input is invalid", () => {
    const resolution = resolveOwner({
      packageDir: "plugins/opencode",
      ownerId: "not valid",
      codeownersText,
    });

    assert.equal(resolution.state, "fallback_owner");
    assert.equal(resolution.source, "codeowners");
    assert.equal(resolution.owner.id, "aaronjo-Telnyx");
    assert.equal(resolution.owner.contactTarget, "github:@aaronjo-Telnyx");
    assert.match(resolution.reason || "", /invalid explicit owner/i);
  });
});
