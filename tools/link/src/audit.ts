import { randomUUID } from "node:crypto";
import type { AuditEvent, AuditEventInput, AuditLogger } from "./types.js";

export class InMemoryAuditLogger implements AuditLogger {
  private events: AuditEvent[] = [];

  constructor(private readonly clock: () => Date = () => new Date()) {}

  record(event: AuditEventInput): AuditEvent {
    const normalized: AuditEvent = {
      id: randomUUID(),
      timestamp: this.clock().toISOString(),
      actorId: event.actorId ?? "anonymous",
      surface: event.surface ?? "dev",
      eventType: event.eventType,
      action: event.action,
      target: event.target ?? null,
      metadata: event.metadata ?? {},
    };

    this.events.push(normalized);
    return normalized;
  }

  all(): AuditEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
