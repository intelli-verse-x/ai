import type {
  ActiveCallsInput,
  CallControlApplicationData,
  CallStatusRequest,
  CallTimelineRequest,
  ConnectionData,
  DebugReportRequest,
  DiscoveryOption,
  ListOptionsInput,
  RecordingsRequest,
  TelnyxEnvelope,
  VoiceMonitorClient,
  VoiceMonitorServiceOptions,
  VoiceNumberData
} from "./types.js";
import { sanitizeVoiceMonitorValue } from "./telnyxClient.js";

export const DEFAULT_MAX_PAGE_SIZE = 100;
export const DEFAULT_MAX_DISCOVERY_CONNECTIONS = 10;
export const DEFAULT_MAX_TIMELINE_WINDOW_HOURS = 168;
export const DEFAULT_MAX_RECORDING_WINDOW_HOURS = 168;

export function createVoiceMonitorService(client: VoiceMonitorClient, options: VoiceMonitorServiceOptions = {}) {
  const maxPageSize = options.maxPageSize ?? DEFAULT_MAX_PAGE_SIZE;
  const maxDiscoveryConnections = options.maxDiscoveryConnections ?? DEFAULT_MAX_DISCOVERY_CONNECTIONS;
  const maxTimelineWindowHours = options.maxTimelineWindowHours ?? DEFAULT_MAX_TIMELINE_WINDOW_HOURS;
  const maxRecordingWindowHours = options.maxRecordingWindowHours ?? DEFAULT_MAX_RECORDING_WINDOW_HOURS;
  const now = options.now ?? (() => new Date());

  return {
    async listOptions(input: ListOptionsInput = {}) {
      const page = normalizePage(input, maxPageSize);
      const warnings: Array<{ source: string; message: string }> = [];

      const [connectionsEnvelope, applicationsEnvelope, phoneNumbersEnvelope] = await Promise.all([
        safeRead("connections", () => client.listConnections(page), warnings),
        safeRead("call_control_applications", () => client.listCallControlApplications(page), warnings),
        safeRead("voice_numbers", () => client.listPhoneNumbers(page), warnings)
      ]);

      const connections = dataArray<ConnectionData>(connectionsEnvelope);
      const phoneNumbers = dataArray<VoiceNumberData>(phoneNumbersEnvelope);
      const numberCounts = countNumbersByConnection(phoneNumbers);
      const connectionOptions = connections.map((connection) => connectionOption(connection, numberCounts));
      const applicationOptions = dataArray<Record<string, unknown>>(applicationsEnvelope).map(applicationOption).filter(Boolean) as DiscoveryOption[];
      const voiceNumberOptions = phoneNumbers.map(voiceNumberOption).filter(Boolean) as DiscoveryOption[];

      return sanitizeVoiceMonitorValue({
        options: {
          connections: connectionOptions,
          call_control_applications: applicationOptions,
          active_call_targets: applicationOptions,
          voice_numbers: voiceNumberOptions
        },
        summary: {
          connection_count: connectionOptions.length,
          call_control_application_count: applicationOptions.length,
          voice_number_count: voiceNumberOptions.length
        },
        warnings,
        limits: {
          page_size: page.pageSize,
          max_discovery_connections: maxDiscoveryConnections
        }
      });
    },

    async activeCalls(input: ActiveCallsInput = {}) {
      const page = normalizePage(input, maxPageSize);
      const requestedConnectionId = normalizeOptionalString(input.connectionId);
      const maxConnections = Math.min(normalizePositiveInt(input.maxConnections, maxDiscoveryConnections), maxDiscoveryConnections);
      const warnings: Array<{ source: string; message: string }> = [];
      const connections = requestedConnectionId ? [requestedConnectionId] : await discoverActiveCallTargetIds(client, page, maxConnections, warnings);
      const allCalls: unknown[] = [];
      const perConnection: Array<{ connection_id: string; active_call_count: number; data: unknown[] }> = [];

      for (const connectionId of connections) {
        try {
          const envelope = await client.listActiveCalls(connectionId, page);
          const calls = dataArray(envelope).map((call) => attachConnectionId(call, connectionId));
          allCalls.push(...calls);
          perConnection.push({ connection_id: connectionId, active_call_count: calls.length, data: calls });
        } catch (error) {
          warnings.push({ source: `active_calls:${connectionId}`, message: errorMessage(error) });
        }
      }

      return sanitizeVoiceMonitorValue({
        connections_consulted: connections,
        truncated_connections: !requestedConnectionId && connections.length === maxConnections,
        total_active_calls: allCalls.length,
        active_calls: allCalls,
        per_connection: perConnection,
        warnings,
        limits: { page_size: page.pageSize, max_connections: maxConnections }
      });
    },

    async callTimeline(input: CallTimelineRequest = {}) {
      const page = normalizePage(input, maxPageSize);
      const normalized = normalizeTimelineInput(input, page, now, maxTimelineWindowHours);
      const envelope = await client.listCallEvents(normalized);
      return sanitizeVoiceMonitorValue({
        ...envelope,
        filters_notice: normalized.notice,
        applied_filters: normalized.appliedFilters
      });
    },

    async callStatus(input: CallStatusRequest) {
      const callControlId = normalizeRequiredString(input.callControlId, "call_control_id is required.");
      return sanitizeVoiceMonitorValue(await client.getCallStatus(callControlId));
    },

    async recordings(input: RecordingsRequest = {}) {
      const page = normalizePage(input, maxPageSize);
      const normalized = normalizeRecordingsInput(input, page, now, maxRecordingWindowHours);
      const envelope = await client.listRecordings(normalized);
      return sanitizeVoiceMonitorValue({ ...envelope, applied_filters: normalized.appliedFilters });
    },

    async debugReport(input: DebugReportRequest = {}) {
      const page = normalizePage(input, maxPageSize);
      const warnings: Array<{ source: string; message: string }> = [];
      const hasTimelineContext = Boolean(
        input.callControlId ||
          input.callLegId ||
          input.callSessionId ||
          input.applicationSessionId ||
          input.connectionId
      );
      const normalizedTimeline = hasTimelineContext
        ? normalizeTimelineInput(
            {
              callLegId: input.callLegId,
              callSessionId: input.callSessionId,
              applicationSessionId: input.applicationSessionId,
              connectionId: input.connectionId,
              pageNumber: page.pageNumber,
              pageSize: page.pageSize
            },
            page,
            now,
            maxTimelineWindowHours
          )
        : undefined;
      const timelineEnvelope = normalizedTimeline
        ? await safeRead("call_events", () => client.listCallEvents(normalizedTimeline), warnings)
        : undefined;
      const timelineEvents = dataArray(timelineEnvelope);
      const correlation = buildCorrelationSummary([
        timelineEnvelope,
        compactRecord({
          call_control_id: normalizeOptionalString(input.callControlId),
          call_leg_id: normalizeOptionalString(input.callLegId),
          call_session_id: normalizeOptionalString(input.callSessionId),
          application_session_id: normalizeOptionalString(input.applicationSessionId),
          connection_id: normalizeOptionalString(input.connectionId),
          assistant_id: normalizeOptionalString(input.assistantId),
          conversation_id: normalizeOptionalString(input.conversationId)
        })
      ]);
      const callControlId = normalizeOptionalString(input.callControlId) ?? correlation.call_control_ids[0];
      const connectionId = normalizeOptionalString(input.connectionId) ?? correlation.connection_ids[0];
      const assistantId = normalizeOptionalString(input.assistantId) ?? correlation.assistant_ids[0];
      const callStatusEnvelope = callControlId
        ? await safeRead("call_status", () => client.getCallStatus(callControlId), warnings)
        : undefined;
      const applicationEnvelope = connectionId
        ? await safeRead("call_control_application", () => client.getCallControlApplication(connectionId), warnings)
        : undefined;
      const webhookUrl =
        normalizeOptionalString(input.webhookUrl) ??
        collectUniqueStrings(applicationEnvelope, "webhook_event_url")[0] ??
        collectUniqueStrings(applicationEnvelope, "webhook_url")[0];
      const webhookDeliveriesEnvelope = webhookUrl
        ? await safeRead(
            "webhook_deliveries",
            () => client.listWebhookDeliveries({ pageNumber: page.pageNumber, pageSize: page.pageSize, filterWebhookUrl: webhookUrl }),
            warnings
          )
        : undefined;
      const conversationId = normalizeOptionalString(input.conversationId) ?? correlation.conversation_ids[0];
      let conversationEnvelope: TelnyxEnvelope | undefined;
      let conversationListEnvelope: TelnyxEnvelope | undefined;
      if (conversationId) {
        conversationEnvelope = await safeRead("conversation", () => client.getConversation(conversationId), warnings);
      } else if (assistantId) {
        conversationListEnvelope = await safeRead(
          "conversations",
          () => client.listConversations({ assistantId, pageNumber: page.pageNumber, pageSize: page.pageSize }),
          warnings
        );
        const discoveredConversationId = collectUniqueStrings(conversationListEnvelope, "id")[0];
        if (discoveredConversationId) {
          conversationEnvelope = await safeRead("conversation", () => client.getConversation(discoveredConversationId), warnings);
        }
      }

      return sanitizeVoiceMonitorValue({
        correlation,
        minimum_signal: {
          capture_from_bootstrap: [
            "call_control_id",
            "call_session_id",
            "connection_id",
            "assistant_id",
            "conversation_id"
          ],
          best_lookup_order: [
            "call_control_id",
            "call_session_id",
            "call_leg_id",
            "conversation_id",
            "assistant_id"
          ]
        },
        debug_surfaces: {
          timeline_inspection: summarizeTimelineSurface(timelineEvents, normalizedTimeline?.appliedFilters, normalizedTimeline?.notice),
          webhook_failures: summarizeWebhookFailuresSurface(webhookDeliveriesEnvelope, webhookUrl),
          latency_buckets: summarizeLatencySurface(timelineEvents, callStatusEnvelope),
          provider_usage: summarizeProviderUsageSurface([timelineEnvelope, callStatusEnvelope, conversationEnvelope, applicationEnvelope]),
          terminal_error_reasons: summarizeTerminalReasonsSurface([timelineEnvelope, callStatusEnvelope, conversationEnvelope])
        },
        sources: {
          call_events: timelineEnvelope,
          call_status: callStatusEnvelope,
          call_control_application: applicationEnvelope,
          webhook_deliveries: webhookDeliveriesEnvelope,
          conversations: conversationListEnvelope,
          conversation: conversationEnvelope
        },
        warnings
      });
    }
  };
}

export type VoiceMonitorService = ReturnType<typeof createVoiceMonitorService>;

type Page = { pageNumber: number; pageSize: number };
type TimelineClientInput = Parameters<VoiceMonitorClient["listCallEvents"]>[0] & { notice?: string; appliedFilters?: Record<string, unknown> };
type RecordingsClientInput = Parameters<VoiceMonitorClient["listRecordings"]>[0] & { appliedFilters?: Record<string, unknown> };

async function safeRead<T>(source: string, read: () => Promise<T>, warnings: Array<{ source: string; message: string }>): Promise<T | undefined> {
  try {
    return await read();
  } catch (error) {
    warnings.push({ source, message: errorMessage(error) });
    return undefined;
  }
}

async function discoverActiveCallTargetIds(
  client: VoiceMonitorClient,
  page: Page,
  maxConnections: number,
  warnings: Array<{ source: string; message: string }>
): Promise<string[]> {
  const envelope = await safeRead("call_control_applications", () => client.listCallControlApplications({ pageNumber: page.pageNumber, pageSize: maxConnections }), warnings);
  return dataArray<CallControlApplicationData>(envelope)
    .map((application) => normalizeOptionalString(valueAsString(application.id ?? application.application_id)))
    .filter((value): value is string => Boolean(value))
    .slice(0, maxConnections);
}

function normalizeTimelineInput(input: CallTimelineRequest, page: Page, now: () => Date, maxWindowHours: number): TimelineClientInput {
  const applicationSessionId = normalizeOptionalString(input.applicationSessionId ?? input.callSessionId);
  const callLegId = normalizeOptionalString(input.callLegId);
  const hasLegOrSession = Boolean(callLegId || applicationSessionId);
  let occurredAtGte = normalizeOptionalString(input.occurredAtGte);
  let occurredAtLte = normalizeOptionalString(input.occurredAtLte);
  let notice: string | undefined;

  if (!hasLegOrSession && !input.occurredAtEq && !input.occurredAtGt && !input.occurredAtLt && !occurredAtGte && !occurredAtLte) {
    const end = now();
    const start = new Date(end.getTime() - 24 * 3_600_000);
    occurredAtGte = start.toISOString();
    occurredAtLte = end.toISOString();
    notice = "No call_leg_id or application_session_id was supplied; defaulted to the last 24 hours for Telnyx call_events filtering.";
  }

  enforceWindow(occurredAtGte, occurredAtLte, hasLegOrSession ? maxWindowHours : Math.min(24, maxWindowHours), "Call timeline");

  const normalized: TimelineClientInput = {
    callLegId,
    applicationSessionId,
    connectionId: normalizeOptionalString(input.connectionId),
    product: normalizeOptionalString(input.product),
    failed: input.failed,
    from: normalizeOptionalString(input.from),
    to: normalizeOptionalString(input.to),
    name: normalizeOptionalString(input.name),
    type: normalizeOptionalString(input.type),
    status: normalizeOptionalString(input.status),
    occurredAtEq: normalizeOptionalString(input.occurredAtEq),
    occurredAtGt: normalizeOptionalString(input.occurredAtGt),
    occurredAtGte,
    occurredAtLt: normalizeOptionalString(input.occurredAtLt),
    occurredAtLte,
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    notice
  };
  normalized.appliedFilters = compactRecord({
    call_leg_id: normalized.callLegId,
    application_session_id: normalized.applicationSessionId,
    connection_id: normalized.connectionId,
    product: normalized.product,
    failed: normalized.failed,
    from: normalized.from,
    to: normalized.to,
    name: normalized.name,
    type: normalized.type,
    status: normalized.status,
    occurred_at_eq: normalized.occurredAtEq,
    occurred_at_gt: normalized.occurredAtGt,
    occurred_at_gte: normalized.occurredAtGte,
    occurred_at_lt: normalized.occurredAtLt,
    occurred_at_lte: normalized.occurredAtLte,
    page_number: normalized.pageNumber,
    page_size: normalized.pageSize
  });
  return normalized;
}

function normalizeRecordingsInput(input: RecordingsRequest, page: Page, now: () => Date, maxWindowHours: number): RecordingsClientInput {
  let createdAtGte = normalizeOptionalString(input.occurredAtGte);
  let createdAtLte = normalizeOptionalString(input.occurredAtLte);
  const hasSpecificId = Boolean(input.callControlId || input.callLegId || input.callSessionId || input.connectionId);
  if (!hasSpecificId && !createdAtGte && !createdAtLte) {
    const end = now();
    createdAtLte = end.toISOString();
    createdAtGte = new Date(end.getTime() - 24 * 3_600_000).toISOString();
  }
  enforceWindow(createdAtGte, createdAtLte, maxWindowHours, "Recording search");
  const normalized: RecordingsClientInput = {
    callControlId: normalizeOptionalString(input.callControlId),
    callLegId: normalizeOptionalString(input.callLegId),
    callSessionId: normalizeOptionalString(input.callSessionId),
    connectionId: normalizeOptionalString(input.connectionId),
    createdAtGte,
    createdAtLte,
    pageNumber: page.pageNumber,
    pageSize: page.pageSize
  };
  normalized.appliedFilters = compactRecord({
    call_control_id: normalized.callControlId,
    call_leg_id: normalized.callLegId,
    call_session_id: normalized.callSessionId,
    connection_id: normalized.connectionId,
    created_at_gte: normalized.createdAtGte,
    created_at_lte: normalized.createdAtLte,
    page_number: normalized.pageNumber,
    page_size: normalized.pageSize
  });
  return normalized;
}

function enforceWindow(startText: string | undefined, endText: string | undefined, maxHours: number, label: string): void {
  if (!startText || !endText) return;
  const start = parseIsoDateTime(startText, "start time");
  const end = parseIsoDateTime(endText, "end time");
  if (end < start) throw new Error(`${label} end time must be on or after start time.`);
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  if (hours > maxHours) {
    throw new Error(`${label} windows are capped at ${maxHours} hours by this app.`);
  }
}

function parseIsoDateTime(value: string, label: string): Date {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`${label} must be a valid ISO date-time string.`);
  return date;
}

function connectionOption(connection: ConnectionData, counts: Map<string, number>): DiscoveryOption {
  const value = String(connection.id ?? connection.connection_id ?? "").trim();
  const label = String(connection.connection_name ?? connection.name ?? (value || "Unnamed connection"));
  return {
    kind: "connection",
    label,
    value,
    description: [connection.record_type, connection.active === false ? "inactive" : connection.active === true ? "active" : undefined].filter(Boolean).join("; ") || undefined,
    active: typeof connection.active === "boolean" ? connection.active : undefined,
    associated_number_count: value ? counts.get(value) ?? 0 : 0
  };
}

function applicationOption(application: Record<string, unknown>): DiscoveryOption | undefined {
  const value = normalizeOptionalString(valueAsString(application.id ?? application.application_id));
  if (!value) return undefined;
  return {
    kind: "call_control_application",
    value,
    label: normalizeOptionalString(valueAsString(application.application_name ?? application.name)) ?? value,
    active: typeof application.active === "boolean" ? application.active : undefined,
    description: typeof application.record_type === "string" ? application.record_type : undefined
  };
}

function voiceNumberOption(phoneNumber: VoiceNumberData): DiscoveryOption | undefined {
  const rawNumber = normalizeOptionalString(phoneNumber.phone_number ?? phoneNumber.number);
  const value = normalizeOptionalString(phoneNumber.id);
  if (!value && !rawNumber) return undefined;
  const redacted = sanitizedString("phone_number", rawNumber ?? value ?? "voice number");
  return {
    kind: "voice_number",
    value: value ?? redacted,
    label: redacted,
    connection_id: normalizeOptionalString(phoneNumber.connection_id),
    active: typeof phoneNumber.active === "boolean" ? phoneNumber.active : phoneNumber.status ? phoneNumber.status === "active" : undefined,
    description: phoneNumber.status ? `status: ${phoneNumber.status}` : undefined
  };
}

function countNumbersByConnection(phoneNumbers: VoiceNumberData[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const number of phoneNumbers) {
    const connectionId = normalizeOptionalString(number.connection_id);
    if (connectionId) counts.set(connectionId, (counts.get(connectionId) ?? 0) + 1);
  }
  return counts;
}

function dataArray<T = unknown>(envelope: TelnyxEnvelope<T[] | T> | undefined): T[] {
  const data = envelope?.data;
  if (Array.isArray(data)) return data;
  if (data === undefined || data === null) return [];
  return [data as T];
}

function attachConnectionId(call: unknown, connectionId: string): unknown {
  if (call && typeof call === "object" && !Array.isArray(call)) {
    return { connection_id: connectionId, ...(call as Record<string, unknown>) };
  }
  return { connection_id: connectionId, value: call };
}

function normalizePage(input: { pageNumber?: number; pageSize?: number }, maxPageSize: number): Page {
  return {
    pageNumber: normalizePositiveInt(input.pageNumber, 1),
    pageSize: Math.min(normalizePositiveInt(input.pageSize, Math.min(DEFAULT_MAX_PAGE_SIZE, maxPageSize)), maxPageSize)
  };
}

function normalizePositiveInt(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const normalized = Math.trunc(value);
  return normalized > 0 ? normalized : fallback;
}

function normalizeRequiredString(value: string | undefined, message: string): string {
  const normalized = normalizeOptionalString(value);
  if (!normalized) throw new Error(message);
  return normalized;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function valueAsString(value: unknown): string | undefined {
  return typeof value === "string" ? value : value === undefined || value === null ? undefined : String(value);
}

function sanitizedString(key: string, value: string): string {
  const sanitized = sanitizeVoiceMonitorValue({ [key]: value }) as Record<string, unknown>;
  return String(sanitized[key] ?? value);
}

function compactRecord(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== ""));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function buildCorrelationSummary(sources: unknown[]): Record<string, string[]> {
  return {
    call_control_ids: collectValuesFromSources(sources, "call_control_id"),
    call_leg_ids: collectValuesFromSources(sources, "call_leg_id", "leg_id"),
    call_session_ids: collectValuesFromSources(sources, "call_session_id"),
    application_session_ids: collectValuesFromSources(sources, "application_session_id"),
    connection_ids: collectValuesFromSources(sources, "connection_id"),
    assistant_ids: collectValuesFromSources(sources, "assistant_id"),
    conversation_ids: collectValuesFromSources(sources, "conversation_id"),
    insight_group_ids: collectValuesFromSources(sources, "insight_group_id")
  };
}

function collectValuesFromSources(sources: unknown[], ...keys: string[]): string[] {
  const values = new Set<string>();
  for (const source of sources) {
    for (const key of keys) {
      for (const value of collectUniqueStrings(source, key)) values.add(value);
    }
  }
  return [...values];
}

function collectUniqueStrings(value: unknown, keyName: string): string[] {
  const values = new Set<string>();
  visitValue(value, (candidateKey, candidateValue) => {
    if (candidateKey !== keyName) return;
    const text = valueAsString(candidateValue)?.trim();
    if (text) values.add(text);
  });
  return [...values];
}

function visitValue(value: unknown, visitor: (key: string, value: unknown, owner?: Record<string, unknown>) => void, owner?: Record<string, unknown>): void {
  if (Array.isArray(value)) {
    for (const item of value) visitValue(item, visitor, owner);
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  for (const [key, nested] of Object.entries(record)) {
    visitor(key, nested, record);
    visitValue(nested, visitor, record);
  }
}

function summarizeTimelineSurface(events: unknown[], appliedFilters?: Record<string, unknown>, notice?: string): Record<string, unknown> {
  const names = new Map<string, number>();
  const statuses = new Map<string, number>();
  const eventTypes = new Map<string, number>();
  const timestamps: string[] = [];

  for (const event of events) {
    if (!event || typeof event !== "object" || Array.isArray(event)) continue;
    const record = event as Record<string, unknown>;
    const name = valueAsString(record.name ?? record.event_type);
    const status = valueAsString(record.status);
    const eventType = valueAsString(record.type);
    const timestamp = eventTimestamp(record);
    if (name) names.set(name, (names.get(name) ?? 0) + 1);
    if (status) statuses.set(status, (statuses.get(status) ?? 0) + 1);
    if (eventType) eventTypes.set(eventType, (eventTypes.get(eventType) ?? 0) + 1);
    if (timestamp) timestamps.push(timestamp);
  }

  const sortedTimestamps = timestamps.slice().sort();
  return {
    event_count: events.length,
    applied_filters: appliedFilters ?? {},
    filters_notice: notice,
    window: compactRecord({
      first_event_at: sortedTimestamps[0],
      last_event_at: sortedTimestamps[sortedTimestamps.length - 1]
    }),
    event_names: mapEntries(names),
    statuses: mapEntries(statuses),
    transport_types: mapEntries(eventTypes),
    recent_events: events.slice(-5)
  };
}

function summarizeWebhookFailuresSurface(envelope: TelnyxEnvelope | undefined, webhookUrl: string | undefined): Record<string, unknown> {
  const deliveries = dataArray(envelope);
  const failures = deliveries.filter(isWebhookFailure);
  return {
    source_detected: Boolean(webhookUrl),
    source_label: webhookUrl ? "call control application webhook" : "not provided or not discoverable from call control application",
    failure_count: failures.length,
    delivery_count: deliveries.length,
    failure_samples: failures.slice(0, 5),
    attempt_statuses: countDistinct(deliveries, "attempt_status"),
    status_codes: countDistinct(deliveries, "status_code")
  };
}

function summarizeLatencySurface(events: unknown[], callStatusEnvelope: TelnyxEnvelope | undefined): Record<string, unknown> {
  const timestamps = events
    .map((event) => (event && typeof event === "object" && !Array.isArray(event) ? eventTimestamp(event as Record<string, unknown>) : undefined))
    .filter((value): value is string => Boolean(value))
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const buckets = { under_1s: 0, s1_to_5: 0, s5_to_15: 0, s15_to_60: 0, over_60s: 0 };
  for (let index = 1; index < timestamps.length; index += 1) {
    const deltaMs = timestamps[index] - timestamps[index - 1];
    if (deltaMs < 1_000) buckets.under_1s += 1;
    else if (deltaMs < 5_000) buckets.s1_to_5 += 1;
    else if (deltaMs < 15_000) buckets.s5_to_15 += 1;
    else if (deltaMs < 60_000) buckets.s15_to_60 += 1;
    else buckets.over_60s += 1;
  }

  const durationCandidates = collectValuesFromSources([callStatusEnvelope], "call_duration", "duration_sec");
  return {
    event_gap_buckets: buckets,
    measured_gap_count: Math.max(0, timestamps.length - 1),
    call_duration_candidates: durationCandidates
  };
}

function summarizeProviderUsageSurface(sources: unknown[]): Record<string, unknown> {
  return {
    assistant_ids: collectValuesFromSources(sources, "assistant_id"),
    llm_models: collectValuesFromSources(sources, "llm_model", "model"),
    stt_models: collectValuesFromSources(sources, "stt_model"),
    tts_providers: collectValuesFromSources(sources, "tts_provider"),
    tts_model_ids: collectValuesFromSources(sources, "tts_model_id"),
    tts_voice_ids: collectValuesFromSources(sources, "tts_voice_id", "voice_id")
  };
}

function summarizeTerminalReasonsSurface(sources: unknown[]): Array<Record<string, unknown>> {
  const terminalReasons: Array<Record<string, unknown>> = [];
  for (const source of sources) {
    visitValue(source, (_key, value, owner) => {
      if (!owner) return;
      for (const reasonKey of ["failure_cause", "hangup_cause", "error_reason", "error_code", "error_type", "reason", "result"]) {
        const reason = valueAsString(owner[reasonKey]);
        if (!reason) continue;
        const event = valueAsString(owner.name ?? owner.event_type ?? owner.status);
        if (reasonKey === "result" && !event?.match(/(fail|end|stop|hangup|complete|terminate|error)/i)) continue;
        terminalReasons.push(
          compactRecord({
            event,
            field: reasonKey,
            value: reason,
            occurred_at: eventTimestamp(owner),
            call_control_id: valueAsString(owner.call_control_id),
            call_session_id: valueAsString(owner.call_session_id)
          })
        );
      }
    });
  }
  return dedupeObjects(terminalReasons).slice(0, 10);
}

function dedupeObjects(items: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const seen = new Set<string>();
  const output: Array<Record<string, unknown>> = [];
  for (const item of items) {
    const key = JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function mapEntries(map: Map<string, number>): Array<{ value: string; count: number }> {
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}

function eventTimestamp(record: Record<string, unknown>): string | undefined {
  return (
    normalizeOptionalString(valueAsString(record.occurred_at)) ??
    normalizeOptionalString(valueAsString(record.event_timestamp)) ??
    normalizeOptionalString(valueAsString(record.created_at)) ??
    normalizeOptionalString(valueAsString(record.updated_at)) ??
    normalizeOptionalString(valueAsString(record.end_time))
  );
}

function countDistinct(items: unknown[], field: string): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const value = valueAsString((item as Record<string, unknown>)[field]);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return mapEntries(counts);
}

function isWebhookFailure(item: unknown): boolean {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  const record = item as Record<string, unknown>;
  const statusCode = Number(record.status_code);
  const attemptStatus = valueAsString(record.attempt_status)?.toLowerCase();
  if (Number.isFinite(statusCode) && statusCode >= 400) return true;
  return Boolean(attemptStatus && /(fail|error|timeout|rejected)/.test(attemptStatus));
}
