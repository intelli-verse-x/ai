export type RiskLevel = "low" | "medium" | "high";
export type ToolVisibility = "internal_only" | "customer_safe";
export type ToolCapability = "read" | "write" | "read_write";
export type ChannelType = "internal" | "shared_customer";

export interface SpecialistAgentDefinition {
  name: string;
  purpose: string;
  instructions: string;
  allowedToolCategories: string[];
  riskLevel: RiskLevel;
  customerSafeRules: string[];
  handoffKeywords: string[];
}

export interface RootAgentDefinition {
  name: string;
  instructions: string;
  handoffs: string[];
  riskLevel: RiskLevel;
}

export interface ToolContext {
  actorId?: string;
  surface?: string;
  auditLogger?: AuditLogger;
}

export interface LinkTool<TInput extends Record<string, unknown> = Record<string, unknown>, TOutput = unknown> {
  name: string;
  description: string;
  category: string;
  visibility: ToolVisibility;
  capability: ToolCapability;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  outputCanBeShownExternally: boolean;
  invoke(input: TInput, context?: ToolContext): Promise<TOutput> | TOutput;
}

export interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  visibility: ToolVisibility;
  capability: ToolCapability;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  outputCanBeShownExternally: boolean;
}

export interface AuditEventInput {
  actorId?: string;
  surface?: string;
  eventType: string;
  action: string;
  target?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent extends Required<Omit<AuditEventInput, "target" | "metadata">> {
  id: string;
  timestamp: string;
  target: string | null;
  metadata: Record<string, unknown>;
}

export interface AuditLogger {
  record(event: AuditEventInput): AuditEvent;
}

export interface ApprovalDecision {
  approvalRequired: boolean;
  approvalStatus: "approval_required" | "not_required";
  action?: string;
  approverRole: "human_owner" | null;
  reason: string;
  policyMatches: string[];
}

export interface SkillMetadata {
  name: string;
  description: string;
  owner: string;
  team: string;
  riskLevel: RiskLevel;
  toolsRequired: string[];
  customerSafe: boolean;
  approvalRequired: boolean;
}

export interface SkillDefinition {
  path: string;
  metadata: SkillMetadata;
  body: string;
}

export interface SharedChannelInput {
  channelType: ChannelType;
  customerIdentifier: string;
  userPrompt: string;
  threadContext: string;
  requestedAction: string;
  actorId?: string;
}
