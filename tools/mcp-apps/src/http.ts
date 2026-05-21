import { randomUUID } from "node:crypto";

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { findMcpApp, listPublicApps } from "./catalog.js";

const SERVICE_NAME = "mcp-apps";
const WWW_AUTHENTICATE = [String.fromCharCode(66, 101, 97, 114, 101, 114), 'realm="Telnyx MCP Apps"'].join(" ");

type SessionRecord = {
  server: McpServer;
  transport: WebStandardStreamableHTTPServerTransport;
};

type SessionStore = Map<string, SessionRecord>;

export interface HostedMcpAppsOptions {
  now?: () => string;
}

export function createHostedMcpAppsHttpApp(options: HostedMcpAppsOptions = {}): Hono {
  const sessionsByApp = new Map<string, SessionStore>();
  const now = options.now ?? (() => new Date().toISOString());
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: ["Authorization", "Content-Type", "Mcp-Session-Id", "Mcp-Protocol-Version", "Last-Event-ID"],
      exposeHeaders: ["Mcp-Session-Id", "Mcp-Protocol-Version", "WWW-Authenticate"]
    })
  );

  app.get("/health", (c) =>
    c.json({
      status: "ok",
      service: SERVICE_NAME,
      time: now()
    })
  );

  app.get("/readyz", (c) =>
    c.json({
      status: "ready",
      service: SERVICE_NAME,
      apps: listPublicApps().map((entry) => entry.slug)
    })
  );

  app.get("/apps", (c) => c.json({ apps: listPublicApps() }));

  app.all("/apps/:slug/mcp", async (c) => {
    const definition = findMcpApp(c.req.param("slug"));
    if (!definition) {
      return c.json({ error: "app_not_found" }, 404);
    }

    const token = parseBearerToken(c.req.header("authorization"));
    if (!token) {
      return unauthorizedResponse();
    }

    const authInfo: AuthInfo = {
      token,
      clientId: "telnyx-api-key",
      scopes: []
    };

    const appSessions = getSessionStore(sessionsByApp, definition.slug);
    const sessionId = c.req.header("mcp-session-id");
    const existing = sessionId ? appSessions.get(sessionId) : undefined;

    if (sessionId && !existing) {
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32001, message: "Session not found" },
          id: null
        },
        404
      );
    }

    const record = existing ?? (await createSession(definition.createServer, appSessions));
    const response = await record.transport.handleRequest(c.req.raw, { authInfo });

    if (!existing && !record.transport.sessionId) {
      await record.server.close();
    }

    return response;
  });

  app.notFound((c) => c.json({ error: "not_found" }, 404));

  return app;
}

function getSessionStore(sessionsByApp: Map<string, SessionStore>, slug: string): SessionStore {
  let store = sessionsByApp.get(slug);
  if (!store) {
    store = new Map();
    sessionsByApp.set(slug, store);
  }
  return store;
}

async function createSession(createServer: () => McpServer, sessions: SessionStore): Promise<SessionRecord> {
  let record: SessionRecord;
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: randomUUID,
    enableJsonResponse: true,
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, record);
    },
    onsessionclosed: (sessionId) => {
      if (sessionId) sessions.delete(sessionId);
    }
  });
  record = { server, transport };
  await server.connect(transport);
  return record;
}

function parseBearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization.trim());
  return match?.[1];
}

function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": WWW_AUTHENTICATE
    }
  });
}
