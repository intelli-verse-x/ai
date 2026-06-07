import { evaluateApproval } from "./approvals.js";
import { assertCustomerSafeText, redactInternalOnlyData } from "./safety/redaction.js";
import type { ApprovalDecision, AuditLogger, SharedChannelInput } from "./types.js";

export interface SharedChannelResult {
  channelType: SharedChannelInput["channelType"];
  customerIdentifier: string;
  customerSafeDraft: string;
  internalRationale: string;
  sourcesUsed: string[];
  approval: ApprovalDecision;
  safetyCheck: ReturnType<typeof assertCustomerSafeText>;
}

export function runSharedChannelDraft(
  input: SharedChannelInput,
  { auditLogger }: { auditLogger?: AuditLogger } = {},
): SharedChannelResult {
  const isSharedCustomer = input.channelType === "shared_customer";
  const safeContext = redactInternalOnlyData(input.threadContext);
  const customerSafeDraft = isSharedCustomer
    ? buildCustomerSafeDraft(input.customerIdentifier, input.userPrompt, safeContext, input.requestedAction)
    : buildInternalDraft(input.customerIdentifier, input.userPrompt, input.threadContext, input.requestedAction);

  const approval = evaluateApproval({
    action: isSharedCustomer ? "post_external_slack" : "internal_slack_reply",
    channelType: input.channelType,
    riskLevel: isSharedCustomer ? "high" : "low",
    customerVisible: isSharedCustomer,
  });

  const result: SharedChannelResult = {
    channelType: input.channelType,
    customerIdentifier: input.customerIdentifier,
    customerSafeDraft,
    internalRationale: buildInternalRationale(input, safeContext),
    sourcesUsed: ["provided_thread_context", "mocked_link_shared_channel_policy", "mocked_tool_registry_metadata"],
    approval,
    safetyCheck: assertCustomerSafeText(customerSafeDraft),
  };

  auditLogger?.record({
    actorId: input.actorId,
    surface: "slack",
    eventType: "shared_channel.draft_created",
    action: input.requestedAction,
    target: input.customerIdentifier,
    metadata: {
      channelType: input.channelType,
      approvalRequired: approval.approvalRequired,
      customerSafe: result.safetyCheck.customerSafe,
    },
  });

  auditLogger?.record({
    actorId: input.actorId,
    surface: "slack",
    eventType: "approval.decision_created",
    action: approval.action ?? "approval",
    target: input.customerIdentifier,
    metadata: { ...approval },
  });

  return result;
}

export function formatSharedChannelResponse(result: SharedChannelResult): string {
  return [
    "Customer-safe draft",
    result.customerSafeDraft,
    "",
    "Internal rationale",
    result.internalRationale,
    "",
    "Sources used",
    result.sourcesUsed.map((source) => `- ${source}`).join("\n"),
    "",
    "Approval status",
    `${result.approval.approvalStatus}: ${result.approval.reason}`,
  ].join("\n");
}

function buildCustomerSafeDraft(customerIdentifier: string, userPrompt: string, safeContext: string, requestedAction: string): string {
  const contextSentence = safeContext
    ? `Based on the latest investigation notes we can safely share, ${summarizeForCustomer(safeContext)}`
    : "We are reviewing the latest available details.";

  return [
    `Hi ${customerIdentifier},`,
    contextSentence,
    `We are continuing to investigate your request about ${normalizeAction(requestedAction || userPrompt)} and will share the next confirmed update as soon as it is ready.`,
    "Thanks for your patience while we work through this.",
  ].join("\n");
}

function buildInternalDraft(customerIdentifier: string, userPrompt: string, threadContext: string, requestedAction: string): string {
  return [
    `Internal draft for ${customerIdentifier}:`,
    `Requested action: ${requestedAction || userPrompt}`,
    `Context: ${threadContext || "No thread context provided."}`,
  ].join("\n");
}

function buildInternalRationale(input: SharedChannelInput, safeContext: string): string {
  return [
    `Channel type is ${input.channelType}.`,
    input.channelType === "shared_customer"
      ? "The customer-facing draft was redacted and approval is required before posting."
      : "Internal channel mode can include internal context.",
    `Safe context basis: ${safeContext || "No shareable context provided."}`,
  ].join(" ");
}

function summarizeForCustomer(text: string): string {
  const firstUsefulLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return (firstUsefulLine ?? "we are reviewing the reported behavior.").replace(/[.。]*$/, ".");
}

function normalizeAction(action: string): string {
  return action.toLowerCase().replace(/\s+/g, " ").trim();
}
