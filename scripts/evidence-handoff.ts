import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { ScanReport, SecretFinding } from "./publish-secret-scan.ts";
import { assessWorkspaceIntegrity, buildEscalationRoute } from "./evidence-escalation.ts";

export type IncidentClass = "publish_path" | "secret_exposure";
export type EscalationState = "owner_notified" | "oncall_notified" | "cto_notified";
export type OwnerResolutionState = "resolved_owner" | "fallback_owner";
export type ConfidenceLevel = "low" | "medium" | "high" | "critical";
export type EvidenceReferenceType = "workflow_summary" | "audit_log" | "scan_report" | "secret_finding";

export interface OwnerIdentity {
  id: string;
  contactTarget: string;
}

export interface OwnerResolution {
  state: OwnerResolutionState;
  owner: OwnerIdentity;
  source: "explicit" | "codeowners" | "fallback";
  reason?: string;
}

export interface ConfidenceMetadata {
  level: ConfidenceLevel;
  source: string;
  score?: number;
}

export interface EvidenceReference {
  type: EvidenceReferenceType;
  label: string;
  path?: string;
  url?: string;
  line?: number;
  findingId?: string;
  fingerprint?: string;
  classification?: string;
  severity?: SecretFinding["severity"];
  confidence?: SecretFinding["confidence"];
}

export interface ExecutionSnapshot {
  sourceIssueId: string;
  workspaceIdentity: string;
  repoSha: string;
  repositoryRoot: string;
  packageDir: string;
  verificationCommands: string[];
}

export interface EvidenceHandoffPayload {
  schemaVersion: "1";
  incidentClass: IncidentClass;
  workflow: string;
  packageName: string;
  incidentId: string;
  timestampUtc: string;
  actor: string;
  reason: string;
  routing: {
    owner: OwnerIdentity;
    ownerResolutionState: OwnerResolutionState;
    ownerResolutionSource: OwnerResolution["source"];
    onCallGroupId: string;
    ackDeadlineUtc: string;
    escalationState: EscalationState;
    currentEvent: string;
    nextEscalationState?: EscalationState;
    nextEscalationAtUtc?: string;
    notificationTargets: {
      owner: OwnerIdentity;
      onCall: {
        id: string;
        contactTarget: string;
      };
      cto: {
        id: string;
        contactTarget: string;
      };
    };
  };
  confidence: ConfidenceMetadata;
  evidenceReferences: EvidenceReference[];
  snapshot: ExecutionSnapshot;
  metadata: {
    fallbackOwnerUsed: boolean;
    ownerResolutionReason?: string;
    gateState?: "enabled" | "disabled" | "override";
    registryOwnerSnapshot: {
      owner: OwnerIdentity;
      resolutionState: OwnerResolutionState;
      resolutionSource: OwnerResolution["source"];
      missingOwnerContactTarget: boolean;
    };
    containment: {
      state: "publish_disabled" | "publish_override" | "publish_enabled" | "secret_rotation_required";
      status: "active" | "partial" | "none";
      summary: string;
    };
    dependencyAvailability: {
      credentialSource: string;
      missingCredentialSource: boolean;
      registryWebhook: string;
      missingRegistryWebhook: boolean;
      provenanceUrl: string;
      missingProvenanceUrl: boolean;
    };
    workspaceIntegrity: {
      dedupeKey: string;
      suppressCorrectiveChildrenWhileBlocked: boolean;
      reviewerAction: string;
    };
    summary?: Record<string, number | string | boolean>;
  };
}

export interface PublishPathPayloadInput {
  packageName: string;
  packageDir: string;
  workflow: string;
  actor: string;
  incidentId: string;
  reason: string;
  timestampUtc?: string;
  gateState: "enabled" | "disabled" | "override";
  ownerId?: string;
  ownerContactTarget?: string;
  onCallGroupId?: string;
  codeownersText?: string;
  workflowSummaryPath?: string;
  auditLogPath?: string;
  runUrl?: string;
  credentialSource?: string;
  registryWebhook?: string;
  provenanceUrl?: string;
  sourceIssueId?: string;
  workspaceIdentity?: string;
  repoSha?: string;
  repositoryRoot?: string;
  verificationCommands?: string[];
}

export interface SecretExposurePayloadInput {
  packageName: string;
  packageDir: string;
  workflow: string;
  actor: string;
  incidentId: string;
  reason: string;
  report: ScanReport;
  timestampUtc?: string;
  ownerId?: string;
  ownerContactTarget?: string;
  onCallGroupId?: string;
  codeownersText?: string;
  runUrl?: string;
  scanReportPath?: string;
  credentialSource?: string;
  registryWebhook?: string;
  provenanceUrl?: string;
  sourceIssueId?: string;
  workspaceIdentity?: string;
  repoSha?: string;
  repositoryRoot?: string;
  verificationCommands?: string[];
}

const DEFAULT_ONCALL_GROUP_ID = "release-oncall";
const DEFAULT_FALLBACK_OWNER = "release-oncall";
const DEFAULT_FALLBACK_CONTACT = "group:release-oncall";
const VALID_OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const VALID_CONTACT_PATTERN = /^(?:github:@[A-Za-z0-9-]+|group:[A-Za-z0-9._-]+|mailto:[^@\s]+@[^@\s]+\.[^@\s]+)$/;

type CodeownerEntry = {
  pattern: string;
  owners: string[];
};

type SnapshotInput = {
  sourceIssueId?: string;
  workflow: string;
  incidentId: string;
  packageDir: string;
  workspaceIdentity?: string;
  repoSha?: string;
  repositoryRoot?: string;
  verificationCommands?: string[];
};

type DependencyAvailability = EvidenceHandoffPayload["metadata"]["dependencyAvailability"];

function withPlaceholder(value: string | undefined, placeholder: string): { value: string; missing: boolean } {
  if (value && value.trim().length > 0) {
    return { value, missing: false };
  }
  return { value: placeholder, missing: true };
}

function buildDependencyAvailability(input: {
  credentialSource?: string;
  registryWebhook?: string;
  provenanceUrl?: string;
}): DependencyAvailability {
  const credentialSource = withPlaceholder(input.credentialSource, "unknown");
  const registryWebhook = withPlaceholder(input.registryWebhook, "unknown");
  const provenanceUrl = withPlaceholder(input.provenanceUrl, "unknown");

  return {
    credentialSource: credentialSource.value,
    missingCredentialSource: credentialSource.missing,
    registryWebhook: registryWebhook.value,
    missingRegistryWebhook: registryWebhook.missing,
    provenanceUrl: provenanceUrl.value,
    missingProvenanceUrl: provenanceUrl.missing,
  };
}

function buildContainmentMetadata(input: {
  incidentClass: IncidentClass;
  gateState?: "enabled" | "disabled" | "override";
}): EvidenceHandoffPayload["metadata"]["containment"] {
  if (input.incidentClass === "publish_path") {
    if (input.gateState === "disabled") {
      return {
        state: "publish_disabled",
        status: "active",
        summary: "Publish remains blocked while the incident is triaged.",
      };
    }
    if (input.gateState === "override") {
      return {
        state: "publish_override",
        status: "partial",
        summary: "A publish override is active and requires escalated review.",
      };
    }
    return {
      state: "publish_enabled",
      status: "none",
      summary: "No automated publish containment is currently active.",
    };
  }

  return {
    state: "secret_rotation_required",
    status: "active",
    summary: "Further publish must stay blocked until exposed credentials are revoked or rotated.",
  };
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/\/+/g, "/").replace(/^\.?\//, "");
}

function isValidOwner(ownerId: string | undefined): ownerId is string {
  return Boolean(ownerId && VALID_OWNER_PATTERN.test(ownerId));
}

function isValidContactTarget(contactTarget: string | undefined): contactTarget is string {
  return Boolean(contactTarget && VALID_CONTACT_PATTERN.test(contactTarget));
}

function deriveGithubContactTarget(ownerId: string): string {
  return `github:@${ownerId}`;
}

function parseCodeowners(codeownersText: string): CodeownerEntry[] {
  return codeownersText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const parts = line.split(/\s+/).filter(Boolean);
      return {
        pattern: parts[0],
        owners: parts.slice(1).map((owner) => owner.replace(/^@/, "")).filter(isValidOwner),
      };
    })
    .filter((entry) => entry.owners.length > 0);
}

function codeownersPatternMatches(pattern: string, path: string): boolean {
  if (pattern === "*") {
    return true;
  }

  const normalizedPattern = normalizePath(pattern).replace(/\/$/, "");
  const normalizedPath = normalizePath(path);

  if (pattern.endsWith("/")) {
    return normalizedPath.startsWith(`${normalizedPattern}/`) || normalizedPath === normalizedPattern;
  }

  if (normalizedPattern.includes("*")) {
    const regex = new RegExp(`^${normalizedPattern.split("*").map(escapeRegExp).join(".*")}$`);
    return regex.test(normalizedPath);
  }

  return normalizedPath === normalizedPattern || normalizedPath.startsWith(`${normalizedPattern}/`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runGit(args: string[], cwd: string): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

function buildExecutionSnapshot(input: SnapshotInput): ExecutionSnapshot {
  const repositoryRoot = input.repositoryRoot
    ? resolve(input.repositoryRoot)
    : runGit(["rev-parse", "--show-toplevel"], process.cwd()) ?? process.cwd();
  const repoSha = input.repoSha ?? runGit(["rev-parse", "HEAD"], repositoryRoot);

  if (!repoSha) {
    throw new Error("Unable to resolve repository SHA for evidence snapshot");
  }

  const workspaceIdentity = input.workspaceIdentity
    ?? process.env.PAPERCLIP_TASK_ID
    ?? process.env.GITHUB_WORKSPACE
    ?? repositoryRoot;

  const verificationCommands = input.verificationCommands?.filter(Boolean) ?? [
    `git -C ${repositoryRoot} rev-parse HEAD`,
    `git -C ${repositoryRoot} checkout ${repoSha}`,
    `git -C ${repositoryRoot} status --short`,
  ];

  return {
    sourceIssueId: input.sourceIssueId ?? input.incidentId,
    workspaceIdentity,
    repoSha,
    repositoryRoot,
    packageDir: normalizePath(input.packageDir).replace(/\/$/, ""),
    verificationCommands,
  };
}

function resolveOwnerFromCodeowners(packageDir: string, codeownersText?: string): OwnerResolution | null {
  if (!codeownersText) {
    return null;
  }

  const entries = parseCodeowners(codeownersText);
  const normalizedPackageDir = normalizePath(packageDir).replace(/\/$/, "");
  let bestEntry: CodeownerEntry | null = null;

  for (const entry of entries) {
    if (!codeownersPatternMatches(entry.pattern, normalizedPackageDir)) {
      continue;
    }
    if (!bestEntry || entry.pattern.length >= bestEntry.pattern.length) {
      bestEntry = entry;
    }
  }

  if (!bestEntry) {
    return null;
  }

  const ownerId = bestEntry.owners[0];
  return {
    state: "fallback_owner",
    owner: {
      id: ownerId,
      contactTarget: deriveGithubContactTarget(ownerId),
    },
    source: "codeowners",
    reason: `resolved from CODEOWNERS pattern ${bestEntry.pattern}`,
  };
}

export function resolveOwner(input: {
  packageDir: string;
  ownerId?: string;
  ownerContactTarget?: string;
  codeownersText?: string;
}): OwnerResolution {
  if (isValidOwner(input.ownerId)) {
    return {
      state: "resolved_owner",
      owner: {
        id: input.ownerId,
        contactTarget: isValidContactTarget(input.ownerContactTarget)
          ? input.ownerContactTarget
          : deriveGithubContactTarget(input.ownerId),
      },
      source: "explicit",
      reason: isValidContactTarget(input.ownerContactTarget) ? undefined : "derived github contact target from explicit owner",
    };
  }

  const codeownersResolution = resolveOwnerFromCodeowners(input.packageDir, input.codeownersText);
  if (codeownersResolution) {
    return {
      ...codeownersResolution,
      reason: input.ownerId ? `invalid explicit owner "${input.ownerId}"; ${codeownersResolution.reason}` : codeownersResolution.reason,
    };
  }

  return {
    state: "fallback_owner",
    owner: {
      id: DEFAULT_FALLBACK_OWNER,
      contactTarget: DEFAULT_FALLBACK_CONTACT,
    },
    source: "fallback",
    reason: input.ownerId ? `invalid explicit owner "${input.ownerId}" and no CODEOWNERS match` : "missing owner and no CODEOWNERS match",
  };
}

function buildBasePayload(input: {
  incidentClass: IncidentClass;
  workflow: string;
  packageName: string;
  incidentId: string;
  actor: string;
  reason: string;
  timestampUtc?: string;
  packageDir: string;
  ownerId?: string;
  ownerContactTarget?: string;
  onCallGroupId?: string;
  codeownersText?: string;
  confidence: ConfidenceMetadata;
  evidenceReferences: EvidenceReference[];
  snapshot: SnapshotInput;
  dependencyAvailability?: DependencyAvailability;
  metadata?: EvidenceHandoffPayload["metadata"];
}): EvidenceHandoffPayload {
  const timestampUtc = input.timestampUtc ?? new Date().toISOString();
  const ownerResolution = resolveOwner({
    packageDir: input.packageDir,
    ownerId: input.ownerId,
    ownerContactTarget: input.ownerContactTarget,
    codeownersText: input.codeownersText,
  });
  const onCallGroupId = input.onCallGroupId || DEFAULT_ONCALL_GROUP_ID;
  const route = buildEscalationRoute({
    incidentClass: input.incidentClass,
    timestampUtc,
    owner: ownerResolution.owner,
    onCallGroupId,
    confidenceLevel: input.confidence.level,
    publishGateState: input.metadata?.gateState,
  });
  const snapshot = buildExecutionSnapshot(input.snapshot);
  const workspaceIntegrity = assessWorkspaceIntegrity({
    sourceIssueId: snapshot.sourceIssueId,
    evidenceSnapshot: {
      workspaceIdentity: snapshot.workspaceIdentity,
      repoSha: snapshot.repoSha,
    },
    reviewerSnapshot: {
      workspaceIdentity: snapshot.workspaceIdentity,
      repoSha: snapshot.repoSha,
    },
  });
  const dependencyAvailability = input.dependencyAvailability ?? buildDependencyAvailability({});
  const containment = input.metadata?.containment ?? buildContainmentMetadata({
    incidentClass: input.incidentClass,
    gateState: input.metadata?.gateState,
  });

  const payload: EvidenceHandoffPayload = {
    schemaVersion: "1",
    incidentClass: input.incidentClass,
    workflow: input.workflow,
    packageName: input.packageName,
    incidentId: input.incidentId,
    timestampUtc,
    actor: input.actor,
    reason: input.reason,
    routing: {
      owner: ownerResolution.owner,
      ownerResolutionState: ownerResolution.state,
      ownerResolutionSource: ownerResolution.source,
      onCallGroupId,
      ackDeadlineUtc: route.ackDeadlineUtc,
      escalationState: route.escalationState,
      currentEvent: route.currentEvent,
      nextEscalationState: route.nextEscalationState,
      nextEscalationAtUtc: route.nextEscalationAtUtc,
      notificationTargets: route.targets,
    },
    confidence: input.confidence,
    evidenceReferences: input.evidenceReferences,
    snapshot,
    metadata: {
      fallbackOwnerUsed: ownerResolution.state === "fallback_owner",
      ownerResolutionReason: ownerResolution.reason,
      registryOwnerSnapshot: {
        owner: ownerResolution.owner,
        resolutionState: ownerResolution.state,
        resolutionSource: ownerResolution.source,
        missingOwnerContactTarget: !isValidContactTarget(ownerResolution.owner.contactTarget),
      },
      containment,
      dependencyAvailability,
      workspaceIntegrity: {
        dedupeKey: workspaceIntegrity.blocker.dedupeKey,
        suppressCorrectiveChildrenWhileBlocked: workspaceIntegrity.blocker.suppressCorrectiveChildren,
        reviewerAction: workspaceIntegrity.blocker.action,
      },
      ...input.metadata,
    },
  };

  validateEvidenceHandoffPayload(payload);
  return payload;
}

export function buildPublishPathPayload(input: PublishPathPayloadInput): EvidenceHandoffPayload {
  const evidenceReferences: EvidenceReference[] = [
    {
      type: "workflow_summary",
      label: "GitHub Actions workflow context",
      path: input.workflowSummaryPath,
      url: input.runUrl,
    },
  ];
  if (input.auditLogPath) {
    evidenceReferences.push({
      type: "audit_log",
      label: "publish gate audit log",
      path: input.auditLogPath,
    });
  }

  return buildBasePayload({
    incidentClass: "publish_path",
    workflow: input.workflow,
    packageName: input.packageName,
    incidentId: input.incidentId,
    actor: input.actor,
    reason: input.reason,
    timestampUtc: input.timestampUtc,
    packageDir: input.packageDir,
    ownerId: input.ownerId,
    ownerContactTarget: input.ownerContactTarget,
    onCallGroupId: input.onCallGroupId,
    codeownersText: input.codeownersText,
    confidence: {
      level: input.gateState === "override" ? "critical" : "high",
      source: "publish_gate",
      score: input.gateState === "override" ? 1 : 0.95,
    },
    evidenceReferences,
    dependencyAvailability: buildDependencyAvailability({
      credentialSource: input.credentialSource,
      registryWebhook: input.registryWebhook,
      provenanceUrl: input.provenanceUrl,
    }),
    snapshot: {
      sourceIssueId: input.sourceIssueId,
      workflow: input.workflow,
      incidentId: input.incidentId,
      packageDir: input.packageDir,
      workspaceIdentity: input.workspaceIdentity,
      repoSha: input.repoSha,
      repositoryRoot: input.repositoryRoot,
      verificationCommands: input.verificationCommands,
    },
    metadata: {
      gateState: input.gateState,
      summary: {
        gateDisabled: input.gateState === "disabled",
        gateOverride: input.gateState === "override",
      },
    },
  });
}

function findingToEvidenceReference(finding: SecretFinding): EvidenceReference {
  return {
    type: "secret_finding",
    label: `${finding.secretClass} in ${finding.path}:${finding.line}`,
    path: finding.path,
    line: finding.line,
    findingId: finding.findingId,
    fingerprint: finding.evidenceFingerprint,
    classification: finding.secretClass,
    severity: finding.severity,
    confidence: finding.confidence,
  };
}

export function buildSecretExposurePayload(input: SecretExposurePayloadInput): EvidenceHandoffPayload {
  const findings = input.report.findings.filter((finding) => !finding.suppression);
  const highestSeverity = findings.some((finding) => finding.severity === "critical")
    ? "critical"
    : findings.some((finding) => finding.severity === "high")
      ? "high"
      : "medium";

  const evidenceReferences: EvidenceReference[] = [
    {
      type: "scan_report",
      label: "release artifact secret scan report",
      path: input.scanReportPath,
      url: input.runUrl,
    },
    ...findings.map(findingToEvidenceReference),
  ];

  return buildBasePayload({
    incidentClass: "secret_exposure",
    workflow: input.workflow,
    packageName: input.packageName,
    incidentId: input.incidentId,
    actor: input.actor,
    reason: input.reason,
    timestampUtc: input.timestampUtc,
    packageDir: input.packageDir,
    ownerId: input.ownerId,
    ownerContactTarget: input.ownerContactTarget,
    onCallGroupId: input.onCallGroupId,
    codeownersText: input.codeownersText,
    confidence: {
      level: highestSeverity,
      source: "publish_secret_scan",
      score: findings.length > 0 ? 0.95 : 0.5,
    },
    evidenceReferences,
    dependencyAvailability: buildDependencyAvailability({
      credentialSource: input.credentialSource,
      registryWebhook: input.registryWebhook,
      provenanceUrl: input.provenanceUrl,
    }),
    snapshot: {
      sourceIssueId: input.sourceIssueId,
      workflow: input.workflow,
      incidentId: input.incidentId,
      packageDir: input.packageDir,
      workspaceIdentity: input.workspaceIdentity,
      repoSha: input.repoSha,
      repositoryRoot: input.repositoryRoot,
      verificationCommands: input.verificationCommands,
    },
    metadata: {
      summary: {
        filesScanned: input.report.summary.filesScanned,
        findings: input.report.summary.findings,
        blockingFindings: input.report.summary.blockingFindings,
        suppressedFindings: input.report.summary.suppressedFindings,
      },
    },
  });
}

export function validateEvidenceHandoffPayload(payload: EvidenceHandoffPayload): void {
  if (payload.schemaVersion !== "1") {
    throw new Error(`Unsupported evidence handoff schema version: ${payload.schemaVersion}`);
  }
  if (!["publish_path", "secret_exposure"].includes(payload.incidentClass)) {
    throw new Error(`Unsupported incident class: ${payload.incidentClass}`);
  }
  if (!payload.workflow || !payload.packageName || !payload.incidentId || !payload.actor || !payload.reason) {
    throw new Error("Evidence handoff payload is missing required top-level fields");
  }
  if (!isValidOwner(payload.routing.owner.id)) {
    throw new Error(`Invalid routing owner id: ${payload.routing.owner.id}`);
  }
  if (!isValidContactTarget(payload.routing.owner.contactTarget)) {
    throw new Error(`Invalid routing contact target: ${payload.routing.owner.contactTarget}`);
  }
  if (!payload.routing.onCallGroupId) {
    throw new Error("Missing on-call group id");
  }
  if (!isValidContactTarget(payload.routing.notificationTargets.onCall.contactTarget)) {
    throw new Error(`Invalid on-call contact target: ${payload.routing.notificationTargets.onCall.contactTarget}`);
  }
  if (!isValidContactTarget(payload.routing.notificationTargets.cto.contactTarget)) {
    throw new Error(`Invalid CTO contact target: ${payload.routing.notificationTargets.cto.contactTarget}`);
  }
  if (Number.isNaN(Date.parse(payload.timestampUtc)) || Number.isNaN(Date.parse(payload.routing.ackDeadlineUtc))) {
    throw new Error("Evidence handoff payload contains invalid timestamps");
  }
  if (!payload.snapshot.sourceIssueId || !payload.snapshot.workspaceIdentity || !payload.snapshot.repositoryRoot) {
    throw new Error("Evidence handoff payload is missing required snapshot metadata");
  }
  if (!/^[0-9a-f]{7,40}$/i.test(payload.snapshot.repoSha)) {
    throw new Error(`Invalid snapshot repo SHA: ${payload.snapshot.repoSha}`);
  }
  if (!Array.isArray(payload.snapshot.verificationCommands) || payload.snapshot.verificationCommands.length === 0) {
    throw new Error("Evidence handoff payload must include snapshot verification commands");
  }
  if (!payload.metadata.registryOwnerSnapshot.owner.id || !payload.metadata.containment.summary) {
    throw new Error("Evidence handoff payload is missing required owner snapshot or containment metadata");
  }
  if (!payload.metadata.dependencyAvailability.credentialSource || !payload.metadata.dependencyAvailability.registryWebhook || !payload.metadata.dependencyAvailability.provenanceUrl) {
    throw new Error("Evidence handoff payload is missing dependency availability placeholders");
  }
  if (!Array.isArray(payload.evidenceReferences) || payload.evidenceReferences.length === 0) {
    throw new Error("Evidence handoff payload must include at least one evidence reference");
  }

  for (const reference of payload.evidenceReferences) {
    if (!reference.type || !reference.label) {
      throw new Error("Evidence reference is missing type or label");
    }
  }
}

export function loadCodeownersText(path = ".github/CODEOWNERS"): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}
