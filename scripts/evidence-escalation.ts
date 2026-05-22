import type { ConfidenceLevel, IncidentClass, OwnerIdentity } from "./evidence-handoff.ts";

export type EscalationTimelineEvent =
  | "alert_detected"
  | "owner_notified"
  | "owner_acked"
  | "oncall_notified"
  | "oncall_acked"
  | "cto_notified"
  | "containment_started"
  | "evidence_bundle_ready"
  | "restore_approved"
  | "resolved";

export interface EscalationContact {
  id: string;
  contactTarget: string;
}

export interface EscalationRoute {
  currentEvent: EscalationTimelineEvent;
  escalationState: "owner_notified" | "oncall_notified" | "cto_notified";
  ackDeadlineUtc: string;
  nextEscalationState?: "oncall_notified" | "cto_notified";
  nextEscalationAtUtc?: string;
  targets: {
    owner: OwnerIdentity;
    onCall: EscalationContact;
    cto: EscalationContact;
  };
}

export interface EscalationInput {
  incidentClass: IncidentClass;
  timestampUtc: string;
  owner: OwnerIdentity;
  onCallGroupId: string;
  confidenceLevel: ConfidenceLevel;
  publishGateState?: "enabled" | "disabled" | "override";
}

const DEFAULT_CTO_CONTACT: EscalationContact = {
  id: "cto",
  contactTarget: "group:cto",
};

function addMinutes(timestampUtc: string, minutes: number): string {
  const time = new Date(timestampUtc);
  time.setUTCMinutes(time.getUTCMinutes() + minutes);
  return time.toISOString();
}

function getCurrentState(input: EscalationInput): EscalationRoute["escalationState"] {
  if (input.incidentClass === "publish_path") {
    return input.publishGateState === "override" ? "oncall_notified" : "owner_notified";
  }

  return input.confidenceLevel === "critical" ? "cto_notified" : "oncall_notified";
}

function getAckMinutes(incidentClass: IncidentClass, escalationState: EscalationRoute["escalationState"]): number {
  if (incidentClass === "publish_path") {
    if (escalationState === "owner_notified") return 10;
    if (escalationState === "oncall_notified") return 20;
    return 30;
  }

  if (escalationState === "oncall_notified") return 10;
  if (escalationState === "owner_notified") return 5;
  return 0;
}

function getNextEscalationState(
  incidentClass: IncidentClass,
  escalationState: EscalationRoute["escalationState"],
): EscalationRoute["nextEscalationState"] {
  if (incidentClass === "publish_path") {
    if (escalationState === "owner_notified") return "oncall_notified";
    if (escalationState === "oncall_notified") return "cto_notified";
    return undefined;
  }

  if (escalationState === "oncall_notified") {
    return "cto_notified";
  }

  return undefined;
}

export function buildEscalationRoute(input: EscalationInput): EscalationRoute {
  const escalationState = getCurrentState(input);
  const ackDeadlineUtc = addMinutes(input.timestampUtc, getAckMinutes(input.incidentClass, escalationState));
  const nextEscalationState = getNextEscalationState(input.incidentClass, escalationState);

  return {
    currentEvent: escalationState,
    escalationState,
    ackDeadlineUtc,
    nextEscalationState,
    nextEscalationAtUtc: nextEscalationState ? ackDeadlineUtc : undefined,
    targets: {
      owner: input.owner,
      onCall: {
        id: input.onCallGroupId,
        contactTarget: `group:${input.onCallGroupId}`,
      },
      cto: DEFAULT_CTO_CONTACT,
    },
  };
}
