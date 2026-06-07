import test from "node:test";
import assert from "node:assert/strict";
import { evaluateApproval } from "../src/approvals.js";
import { InMemoryAuditLogger } from "../src/audit.js";
import { assertCustomerSafeText, redactInternalOnlyData } from "../src/safety/redaction.js";
import { formatSharedChannelResponse, runSharedChannelDraft } from "../src/shared-channel.js";

test("approval is required for shared customer Slack posting", () => {
  const approval = evaluateApproval({
    action: "post_external_slack",
    channelType: "shared_customer",
    riskLevel: "high",
    customerVisible: true,
  });

  assert.equal(approval.approvalRequired, true);
  assert.equal(approval.approvalStatus, "approval_required");
  assert.ok(approval.policyMatches.includes("post_external_slack"));
});

test("redacts internal-only data from customer-safe text", () => {
  const unsafe =
    "Internal note: see #incident-war-room and https://internal.telnyx.com/logs/abc. Raw log trace id abc123.";
  const redacted = redactInternalOnlyData(unsafe);

  assert.doesNotMatch(redacted, /internal\.telnyx\.com/);
  assert.doesNotMatch(redacted, /#incident-war-room/);
  assert.doesNotMatch(redacted, /trace id abc123/);
  assert.doesNotMatch(redacted, /id abc123/);
  assert.equal(assertCustomerSafeText(redacted).customerSafe, true);
});

test("shared-channel draft separates customer draft, rationale, sources, and approval", () => {
  const auditLogger = new InMemoryAuditLogger(() => new Date("2026-06-04T10:00:00.000Z"));
  const result = runSharedChannelDraft(
    {
      actorId: "tester",
      channelType: "shared_customer",
      customerIdentifier: "Acme Messaging Co.",
      userPrompt: "Draft a reply",
      requestedAction: "post update to shared customer Slack channel",
      threadContext:
        "Internal note: see #incident-war-room. Raw log trace id abc123. Customer impact is delayed SMS delivery in US traffic.",
    },
    { auditLogger },
  );

  assert.equal(result.approval.approvalRequired, true);
  assert.equal(result.safetyCheck.customerSafe, true);
  assert.doesNotMatch(result.customerSafeDraft, /#incident-war-room/);
  assert.doesNotMatch(result.customerSafeDraft, /trace id abc123/);
  assert.doesNotMatch(result.customerSafeDraft, /id abc123/);

  const formatted = formatSharedChannelResponse(result);
  assert.match(formatted, /Customer-safe draft/);
  assert.match(formatted, /Internal rationale/);
  assert.match(formatted, /Sources used/);
  assert.match(formatted, /Approval status/);

  const eventTypes = auditLogger.all().map((event) => event.eventType);
  assert.deepEqual(eventTypes, ["shared_channel.draft_created", "approval.decision_created"]);
});

test("audit log event creation includes stable required fields", () => {
  const auditLogger = new InMemoryAuditLogger(() => new Date("2026-06-04T10:00:00.000Z"));
  const event = auditLogger.record({
    actorId: "tester",
    surface: "unit",
    eventType: "approval.decision_created",
    action: "post_external_slack",
    target: "acct_mock_001",
    metadata: { approvalRequired: true },
  });

  assert.equal(event.timestamp, "2026-06-04T10:00:00.000Z");
  assert.equal(event.actorId, "tester");
  assert.equal(event.surface, "unit");
  assert.equal(event.metadata.approvalRequired, true);
  assert.ok(event.id);
});
