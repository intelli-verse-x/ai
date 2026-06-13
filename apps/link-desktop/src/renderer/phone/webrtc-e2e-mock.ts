type Handler = (payload?: unknown) => void;

type E2EWindow = Window & {
  __linkPhoneE2E?: {
    clients: Array<Record<string, unknown>>;
    calls: Array<Record<string, unknown>>;
    hangups: number;
  };
};

function e2eState() {
  const target = window as E2EWindow;
  target.__linkPhoneE2E ??= {
    clients: [],
    calls: [],
    hangups: 0,
  };
  return target.__linkPhoneE2E;
}

class MockCall {
  state = "requesting";
  direction = "outbound" as const;
  remotePartyNumber: string;
  private handlers = new Map<string, Handler[]>();

  constructor(private readonly input: Record<string, unknown>) {
    this.remotePartyNumber = String(input.destinationNumber || "");
  }

  on(event: string, handler: Handler) {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
    return this;
  }

  hangup() {
    e2eState().hangups += 1;
    this.state = "hangup";
    this.emit("telnyx.notification", { type: "callUpdate", call: this });
  }

  hold() {
    this.state = "held";
    this.emit("telnyx.notification", { type: "callUpdate", call: this });
  }

  unhold() {
    this.state = "active";
    this.emit("telnyx.notification", { type: "callUpdate", call: this });
  }

  muteAudio() {
    return undefined;
  }

  unmuteAudio() {
    return undefined;
  }

  dtmf(digit: string) {
    e2eState().calls.push({ type: "dtmf", digit });
  }

  activate() {
    this.state = "active";
    this.emit("telnyx.notification", { type: "callUpdate", call: this });
  }

  private emit(event: string, payload: unknown) {
    for (const handler of this.handlers.get(event) ?? []) handler(payload);
  }
}

export class TelnyxRTC {
  remoteElement?: string;
  private handlers = new Map<string, Handler[]>();

  constructor(private readonly options: Record<string, unknown>) {
    e2eState().clients.push(options);
  }

  on(event: string, handler: Handler) {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
    return this;
  }

  connect() {
    window.setTimeout(() => this.emit("telnyx.ready", undefined), 0);
  }

  disconnect() {
    return undefined;
  }

  removeAllListeners() {
    this.handlers.clear();
  }

  updateToken(token: string) {
    e2eState().clients.push({ login_token: token, refreshed: true });
  }

  newCall(input: Record<string, unknown>) {
    e2eState().calls.push({ type: "newCall", ...input });
    const call = new MockCall(input);
    window.setTimeout(() => {
      this.emit("telnyx.notification", { type: "callUpdate", call });
      call.activate();
    }, 0);
    return call;
  }

  private emit(event: string, payload: unknown) {
    for (const handler of this.handlers.get(event) ?? []) handler(payload);
  }
}
