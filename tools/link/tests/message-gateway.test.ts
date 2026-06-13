import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createMessageGatewayServer,
  listenMessageGatewayServer,
  MessageGatewayService,
  type MessageGatewayAdapter,
  type MessageGatewayAdapterSendRequest,
  type MessageGatewayProviderResult,
  type MessageGatewayServiceOptions,
} from "../src/message-gateway.js";

class CapturingAdapter implements MessageGatewayAdapter {
  readonly mode = "test";
  readonly calls: MessageGatewayAdapterSendRequest[] = [];

  constructor(private readonly sendResult: MessageGatewayProviderResult | ((request: MessageGatewayAdapterSendRequest) => MessageGatewayProviderResult | Promise<MessageGatewayProviderResult>) | Error) {}

  async send(request: MessageGatewayAdapterSendRequest): Promise<MessageGatewayProviderResult> {
    this.calls.push(request);
    if (this.sendResult instanceof Error) throw this.sendResult;
    if (typeof this.sendResult === "function") return this.sendResult(request);
    return this.sendResult;
  }
}

function gatewayService(adapters: MessageGatewayServiceOptions["adapters"] = {}) {
  let nextId = 0;
  return new MessageGatewayService({
    adapters,
    idGenerator: () => `test-${++nextId}`,
    now: () => new Date("2026-06-13T10:00:00.000Z"),
  });
}

test("MessageGatewayService resolves explicit transport, preferences, fallbacks, and A2A agents", async () => {
  const service = gatewayService();

  const explicitSlack = await service.createMessage({
    to: "alice@telnyx.com",
    body: "route this explicitly",
    idempotency_key: "explicit-slack",
  }, { id: "sender@telnyx.com", displayName: "Sender" }, "slack");
  assert.equal(explicitSlack.deliveries[0]?.transport, "slack");
  assert.match(explicitSlack.deliveries[0]?.routeReason ?? "", /Explicit Slack/);

  const preference = await service.createMessage({
    to: "casey@telnyx.com",
    body: "use recipient preference",
    idempotency_key: "preference",
  }, "sender@telnyx.com");
  assert.equal(preference.deliveries[0]?.transport, "google_chat");
  assert.match(preference.deliveries[0]?.routeReason ?? "", /preference/i);

  const slackFallback = await service.createMessage({
    to: "alice@telnyx.com",
    body: "default human route",
    idempotency_key: "slack-fallback",
  }, "sender@telnyx.com");
  assert.equal(slackFallback.deliveries[0]?.transport, "slack");

  const googleFallback = await service.createMessage({
    to: "bob@telnyx.com",
    body: "fallback when Slack is missing",
    idempotency_key: "google-fallback",
  }, "sender@telnyx.com");
  assert.equal(googleFallback.deliveries[0]?.transport, "google_chat");
  assert.match(googleFallback.deliveries[0]?.routeReason ?? "", /Google Chat fallback/);

  const agent = await service.createMessage({
    to: "agent:aida",
    body: "ask the agent",
    idempotency_key: "agent-a2a",
  }, "sender@telnyx.com");
  assert.equal(agent.deliveries[0]?.transport, "a2a");
  assert.equal(agent.deliveries[0]?.taskId, `task-${agent.deliveries[0]?.id}`);
});

test("MessageGatewayService rejects unresolved, inactive, and non-Telnyx human recipients", async () => {
  const service = gatewayService();

  const unresolved = await service.createMessage({
    to: "missing@telnyx.com",
    body: "hello",
    idempotency_key: "missing",
  }, "sender@telnyx.com");
  assert.equal(unresolved.status, "rejected");
  assert.deepEqual(unresolved.deliveries, []);
  assert.match(service.listEvents(unresolved.id).map((event) => event.detail).join("\n"), /not found/);

  const inactive = await service.createMessage({
    to: "inactive@telnyx.com",
    body: "hello",
    idempotency_key: "inactive",
  }, "sender@telnyx.com");
  assert.equal(inactive.status, "rejected");
  assert.match(service.listEvents(inactive.id).map((event) => event.detail).join("\n"), /not active/);

  const outsideDomain = await service.createMessage({
    to: "person@example.com",
    body: "hello",
    idempotency_key: "outside-domain",
  }, "sender@telnyx.com");
  assert.equal(outsideDomain.status, "rejected");
  assert.match(service.listEvents(outsideDomain.id).map((event) => event.detail).join("\n"), /@telnyx\.com/);
});

test("MessageGatewayService idempotency prevents duplicate provider sends", async () => {
  const slack = new CapturingAdapter({ externalId: "slack-1", externalUrl: "https://slack.test/message/1" });
  const service = gatewayService({ slack });

  const first = await service.createMessage({
    to: "alice@telnyx.com",
    body: "exactly once",
    idempotency_key: "same-key",
  }, "sender@telnyx.com");
  const second = await service.createMessage({
    to: "alice@telnyx.com",
    body: "exactly once",
    idempotency_key: "same-key",
  }, "sender@telnyx.com");

  assert.equal(first.id, second.id);
  assert.equal(slack.calls.length, 1);
  assert.equal(second.deliveries[0]?.providerMessageId, "slack-1");
});

test("MessageGatewayService captures adapter success, retryable failure, and permanent failure", async () => {
  const success = new CapturingAdapter({ externalId: "slack-ok", externalUrl: "https://slack.test/ok" });
  const successService = gatewayService({ slack: success });
  const delivered = await successService.createMessage({
    to: "alice@telnyx.com",
    body: "capture provider refs",
    idempotency_key: "provider-success",
  }, "sender@telnyx.com");
  assert.equal(delivered.status, "delivered");
  assert.equal(delivered.deliveries[0]?.providerMessageId, "slack-ok");
  assert.equal(delivered.deliveries[0]?.providerUrl, "https://slack.test/ok");
  assert.match(success.calls[0]?.renderedBody ?? "", /From sender@telnyx\.com via Link/);

  const retryableError = Object.assign(new Error("rate limited"), { retryable: true });
  const retryableService = gatewayService({ slack: new CapturingAdapter(retryableError) });
  const retryable = await retryableService.createMessage({
    to: "alice@telnyx.com",
    body: "retry later",
    idempotency_key: "provider-retry",
  }, "sender@telnyx.com");
  assert.equal(retryable.status, "accepted");
  assert.equal(retryable.deliveries[0]?.status, "retryable_failure");
  assert.equal(retryable.deliveries[0]?.retryCount, 1);

  const failedService = gatewayService({ slack: new CapturingAdapter(new Error("invalid recipient")) });
  const failed = await failedService.createMessage({
    to: "alice@telnyx.com",
    body: "fail permanently",
    idempotency_key: "provider-failure",
  }, "sender@telnyx.com");
  assert.equal(failed.status, "failed");
  assert.equal(failed.deliveries[0]?.status, "failed");
});

test("MessageGatewayService records provider reply and delivery webhook events without a chat transcript", async () => {
  const service = gatewayService();
  const message = await service.createMessage({
    to: "alice@telnyx.com",
    body: "provider webhook source",
    idempotency_key: "provider-webhook",
  }, "sender@telnyx.com");
  const messageCount = service.listMessages().length;

  const reply = service.recordProviderEvent("slack", {
    provider_message_id: message.deliveries[0]?.providerMessageId,
    type: "reply",
    text: "Acknowledged in Slack",
    ts: "1710000000.000100",
  });
  assert.equal(reply.type, "provider.reply");
  assert.equal(service.listMessages().length, messageCount);

  const googleMessage = await service.createMessage({
    to: "bob@telnyx.com",
    body: "google provider webhook source",
    idempotency_key: "google-provider-webhook",
  }, "sender@telnyx.com");
  const server = createMessageGatewayServer(service, { requireAuth: false });
  const listener = await listenMessageGatewayServer(server);
  try {
    const response = await fetch(`${listener.url}/webhooks/google-chat/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message_id: googleMessage.id,
        status: "failed",
        type: "delivery_state",
        detail: "Google Chat delivery failed in a synced provider event.",
      }),
    });
    assert.equal(response.status, 202);
    const updated = service.getMessage(googleMessage.id);
    assert.equal(updated?.status, "failed");
    assert.equal(updated?.deliveries[0]?.status, "failed");
    assert.equal(service.listEvents(googleMessage.id).some((event) => event.type === "provider.delivery_event"), true);
  } finally {
    await listener.close();
  }
});

test("Message Gateway HTTP API enforces auth context and exposes delivery state", async () => {
  const service = gatewayService();
  const server = createMessageGatewayServer(service, { requireAuth: true, requireAuthContext: true });
  const listener = await listenMessageGatewayServer(server);
  try {
    const missingContext = await fetch(`${listener.url}/messages`, {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({ to: "alice@telnyx.com", body: "hello", idempotency_key: "http-missing-context" }),
    });
    assert.equal(missingContext.status, 401);

    const accepted = await fetch(`${listener.url}/messages`, {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
        "x-telnyx-actor": "sender@telnyx.com",
        "x-link-transport": "slack",
      },
      body: JSON.stringify({ to: "alice@telnyx.com", body: "hello", idempotency_key: "http-accepted" }),
    });
    assert.equal(accepted.status, 202);
    const payload = await accepted.json() as { message: { id: string; status: string } };
    assert.equal(payload.message.status, "delivered");

    const read = await fetch(`${listener.url}/messages/${encodeURIComponent(payload.message.id)}`, {
      headers: {
        authorization: "Bearer test-token",
        "x-telnyx-actor": "sender@telnyx.com",
      },
    });
    assert.equal(read.status, 200);
    const readPayload = await read.json() as { message: { id: string } };
    assert.equal(readPayload.message.id, payload.message.id);

    const list = await fetch(`${listener.url}/messages?status=delivered&recipient=${encodeURIComponent("alice@telnyx.com")}`, {
      headers: {
        authorization: "Bearer test-token",
        "x-telnyx-actor": "sender@telnyx.com",
      },
    });
    const listPayload = await list.json() as { messages: Array<{ id: string }> };
    assert.deepEqual(listPayload.messages.map((item) => item.id), [payload.message.id]);
  } finally {
    await listener.close();
  }
});

test("MessageGatewayService persists delivery ledger and idempotency index", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "link-message-gateway-"));
  const storagePath = path.join(tempDir, "ledger.json");
  try {
    await new MessageGatewayService({
      storagePath,
      idGenerator: () => "persisted",
      now: () => new Date("2026-06-13T10:00:00.000Z"),
    }).createMessage({
      to: "alice@telnyx.com",
      body: "persist me",
      idempotency_key: "persist-key",
    }, "sender@telnyx.com");

    const restarted = new MessageGatewayService({
      storagePath,
      idGenerator: () => "new",
      now: () => new Date("2026-06-13T10:00:00.000Z"),
    });
    const replay = await restarted.createMessage({
      to: "alice@telnyx.com",
      body: "do not send again",
      idempotency_key: "persist-key",
    }, "sender@telnyx.com");
    assert.equal(replay.id, "msg-persisted");
    assert.equal(restarted.listMessages().length, 1);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
