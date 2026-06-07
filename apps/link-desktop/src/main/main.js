import { app, BrowserWindow, ipcMain, nativeImage, safeStorage, session } from "electron";
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  createDefaultToolRegistry,
  discoverSkills,
  formatSharedChannelResponse,
  InMemoryAuditLogger,
  LinkRuntime,
  metadataForTool,
} from "../../../../tools/link/dist/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(__dirname, "../../../..");
const auditLogger = new InMemoryAuditLogger();
const runtime = new LinkRuntime({ auditLogger });
const stateVersion = 3;
const defaultAgentControlPlaneUrl = "http://agent-control-plane.query.prod.telnyx.io:8000";
const defaultA2aDiscoveryUrl = "http://a2a-discovery.query.prod.telnyx.io:4000";
const defaultAuthInternalUrl = "https://auth-internal.query.prod.telnyx.io:6674";
const defaultHindsightUrl = "https://api-internal.telnyx.com/hindsight";
const defaultLiteLlmBaseUrl = "http://litellm-aiswe.query.prod.telnyx.io:4000";
const defaultGuruApiBaseUrl = "https://api.getguru.com/api/v1";
const appIconPath = path.resolve(__dirname, "../../public/triforce-26.png");
const keyScopedHindsightBankId = "hindsight-key-scoped";
const agentRescueSlackAgent = {
  id: "slack-bot-troubleshooting",
  name: "bot-troubleshooting",
  displayName: "bot-troubleshooting",
  description: "Slack rescue bot for troubleshooting broken OpenClaw, Hermes, and internal agent workflows.",
  status: "available",
  type: "slack",
  capabilities: ["agent-rescue", "openclaw", "hermes", "troubleshooting", "slack"],
  visibility: "slack",
  source: "slack",
  slackUserId: "U0AR1M7T6GP",
  slackChannelId: "D0ASV9TTDJ7",
  slackChannel: "bot-troubleshooting",
  squad: "agent-infra",
  audience: "internal",
  origin: "slack",
  available: true,
  requiresAuthentication: true,
  updatedAt: "Pinned Link rescue route",
};

let automations = seedAutomations();
let activeWork = [];
let connectorOverrides = {};
let workspaces = [];
let chatSessions = [];
let changeRequests = [];
let storedCredentials = {};
let memoryBanks = seedMemoryBanks();
let dojoState = seedDojoState();
let workboardCards = seedWorkboardCards();
let onboardingState = seedOnboardingState();

const connectorCatalog = [
  {
    id: "agent-control-plane",
    name: "Agent Control Plane",
    category: "Hosted agents",
    description: "List, route to, and chat with hosted Hermes/OpenClaw agents through Link.",
    envGroups: [
      ["AGENT_CONTROL_PLANE_URL"],
      ["AGENT_CONTROL_PLANE_URL", "TELNYX_AUTH_REV2"],
    ],
    requiredAccess: ["Okta SSO via auth-internal", "optional TELNYX_ACTOR", "optional TELNYX_ON_BEHALF_OF"],
  },
  {
    id: "litellm",
    name: "Telnyx LiteLLM",
    category: "Model runtime",
    description: "Chat with Telnyx-hosted models from Link.",
    envGroups: [["LITELLM_API_KEY"]],
    requiredAccess: ["Per-user LITELLM_API_KEY from AI-swe-Agent Slack", "LITELLM_MODEL"],
  },
  {
    id: "hindsight",
    name: "Hindsight",
    category: "Memory",
    description: "Recall and inspect long-term agent memory banks.",
    envGroups: [["HINDSIGHT_API_KEY"], ["HINDSIGHT_API_URL", "HINDSIGHT_API_KEY"]],
    requiredAccess: ["Per-user bank-scoped HINDSIGHT_API_KEY from Hindsight UI"],
  },
  {
    id: "guru",
    name: "Guru",
    category: "Knowledge",
    description: "Search verified cards, docs, and knowledge-base context.",
    envGroups: [
      ["GURU_USER_EMAIL", "GURU_USER_TOKEN"],
      ["GURU_USERNAME", "GURU_USER_TOKEN"],
      ["GURU_COLLECTION_ID", "GURU_COLLECTION_TOKEN"],
    ],
    requiredAccess: ["Guru user token from Apps & Integrations", "GURU_USER_EMAIL or GURU_USERNAME"],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    category: "Knowledge",
    description: "Search Google Docs, Drive files, and meeting artifacts.",
    envGroups: [["GOOGLE_DRIVE_ACCESS_TOKEN"], ["GOOGLE_WORKSPACE_ACCESS_TOKEN"]],
    requiredAccess: ["Google Drive OAuth or GOOGLE_DRIVE_ACCESS_TOKEN"],
  },
  {
    id: "github",
    name: "GitHub",
    category: "Code",
    description: "Read repositories and create admin-approved draft PRs.",
    envGroups: [["GH_TOKEN"], ["GITHUB_TOKEN"]],
    requiredAccess: ["GitHub App installation or GH_TOKEN"],
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communications",
    description: "Search threads and draft approved shared-channel replies.",
    envGroups: [["SLACK_BOT_TOKEN"], ["SLACK_USER_TOKEN"]],
    requiredAccess: ["Slack workspace OAuth or SLACK_BOT_TOKEN"],
  },
  {
    id: "telnyx",
    name: "Telnyx",
    category: "Internal systems",
    description: "Use account, messaging, network, and billing context.",
    envGroups: [["TELNYX_API_KEY"]],
    requiredAccess: ["Telnyx internal API credentials"],
  },
  {
    id: "linear",
    name: "Linear",
    category: "Work tracking",
    description: "Search projects, issues, and planning context.",
    envGroups: [["LINEAR_API_KEY"]],
    requiredAccess: ["Linear OAuth or LINEAR_API_KEY"],
  },
];

const credentialDefinitions = [
  { id: "telnyx-okta", label: "Telnyx Okta", fields: ["AUTH_INTERNAL_URL", "TELNYX_AUTH_REV2"], help: "Okta sign-in uses auth-internal. TELNYX_AUTH_REV2 is created by sign-in and stored securely; do not paste it unless an admin asks you to test manually." },
  { id: "litellm", label: "Telnyx LiteLLM", fields: ["LITELLM_API_KEY", "LITELLM_MODEL"], help: "Per-user key from AI-swe-Agent in Slack channel D0995UB1PLY." },
  { id: "hindsight", label: "Hindsight", fields: ["HINDSIGHT_API_KEY"], help: "Per-user, bank-scoped key from the Hindsight bank API Keys tab. Hindsight infers the bank from this key." },
  { id: "guru", label: "Guru", fields: ["GURU_USER_EMAIL", "GURU_USER_TOKEN"], help: "Guru user auth. Generate the token in Guru Apps & Integrations > API Access." },
  { id: "linear", label: "Linear", fields: ["LINEAR_API_KEY"], help: "Linear API key for issue and project lookup." },
  { id: "telnyx", label: "Telnyx", fields: ["TELNYX_API_KEY"], help: "Telnyx API key for account, phone, messaging, and network operations." },
  { id: "github", label: "GitHub", fields: ["GH_TOKEN"], help: "Fine-grained GitHub token for approved draft PR creation." },
  { id: "slack", label: "Slack", fields: ["SLACK_USER_TOKEN", "SLACK_BOT_TOKEN"], help: "Slack user token discovers and DMs bot users; bot token can post where the app has access." },
  { id: "google-drive", label: "Google Drive", fields: ["GOOGLE_DRIVE_ACCESS_TOKEN"], help: "Temporary Drive token until Google OAuth is implemented." },
];

function createWindow() {
  const appIcon = nativeImage.createFromPath(appIconPath);
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 760,
    title: "Telnyx Link",
    icon: appIcon,
    backgroundColor: "#f7f6f4",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 12, y: 9 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const rendererPath = process.env.LINK_DESKTOP_RENDERER
      ? path.resolve(process.cwd(), process.env.LINK_DESKTOP_RENDERER)
      : path.resolve(__dirname, "../../dist/renderer/index.html");
    void win.loadFile(rendererPath);
  }
}

app.whenReady().then(async () => {
  app.setName("Telnyx Link");
  const appIcon = nativeImage.createFromPath(appIconPath);
  if (process.platform === "darwin" && !appIcon.isEmpty()) {
    app.dock.setIcon(appIcon);
  }

  await loadStoredCredentials();
  await loadDesktopState();
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function registerIpc() {
  ipcMain.handle("link:chat", async (_event, prompt) => {
    const session = await sendChatMessage({ content: prompt, workspaceId: "workspace-link" });
    const lastMessage = [...session.messages].reverse().find((message) => message.role === "assistant");
    return { response: lastMessage?.content ?? "", routedTo: "Telnyx LiteLLM" };
  });

  ipcMain.handle("link:run-skill", async (_event, skillName) =>
    runtime.runSkill(skillName, { accountId: "acct_mock_001", query: skillName }, "desktop_user"),
  );

  ipcMain.handle("link:list-skills", () => listSkills());
  ipcMain.handle("link:list-tools", () => createDefaultToolRegistry().list().map(metadataForTool));

  ipcMain.handle("link:shared-channel-draft", (_event, input) => {
    const work = createActiveWork({
      title: input.title || "Shared-channel response draft",
      subtitle: "Shared-channel draft - Pending review",
      prompt: input.userPrompt,
      requestedAction: input.requestedAction,
      threadContext: input.threadContext,
    });
    activeWork = [work, ...activeWork];
    addWorkspaceTab("workspace-acme", {
      id: `tab-${work.id}`,
      title: work.title,
      kind: "approval",
      status: "pending",
      updatedAt: new Date().toISOString(),
    });
    void saveDesktopState();
    return work;
  });

  ipcMain.handle("link:list-active-work", () => activeWork);
  ipcMain.handle("link:decide-work", (_event, { id, decision }) => decideWork(id, decision));
  ipcMain.handle("link:list-automations", () => automations);
  ipcMain.handle("link:list-connectors", () => listConnectors());
  ipcMain.handle("link:list-credentials", () => listCredentials());
  ipcMain.handle("link:save-credential", (_event, input) => saveCredential(input));
  ipcMain.handle("link:list-onboarding", () => listOnboarding());
  ipcMain.handle("link:update-onboarding", (_event, input) => updateOnboarding(input));

  ipcMain.handle("link:update-connector-status", (_event, { id, status }) => {
    if (!connectorCatalog.some((connector) => connector.id === id)) return listConnectors();
    connectorOverrides = { ...connectorOverrides, [id]: status };
    void saveDesktopState();
    return listConnectors();
  });

  ipcMain.handle("link:agent-control-plane-sign-in", () => signInAgentControlPlane());
  ipcMain.handle("link:agent-control-plane-sign-out", () => signOutAgentControlPlane());
  ipcMain.handle("link:agent-control-plane-auth-status", () => getAgentControlPlaneAuthStatus());
  ipcMain.handle("link:list-hosted-agents", () => listHostedAgents());
  ipcMain.handle("link:list-workspaces", () => listWorkspaces());
  ipcMain.handle("link:search-explorer", (_event, input) => searchExplorer(input));
  ipcMain.handle("link:list-chat-sessions", () => chatSessions);
  ipcMain.handle("link:send-chat-message", (_event, input) => sendChatMessage(input));
  ipcMain.handle("link:create-change-request", (_event, input) => createChangeRequest(input));
  ipcMain.handle("link:approve-change-request", (_event, id) => approveChangeRequest(id));
  ipcMain.handle("link:dismiss-change-request", (_event, id) => dismissChangeRequest(id));
  ipcMain.handle("link:list-change-requests", () => changeRequests);
  ipcMain.handle("link:list-agents", () => listAgents());
  ipcMain.handle("link:send-agent-message", (_event, input) => sendAgentMessage(input));
  ipcMain.handle("link:workboard-list", (_event, input) => listWorkboard(input));
  ipcMain.handle("link:workboard-create-card", (_event, input) => createWorkboardCard(input));
  ipcMain.handle("link:workboard-update-card", (_event, input) => updateWorkboardCard(input));
  ipcMain.handle("link:workboard-dispatch", (_event, input) => dispatchWorkboard(input));
  ipcMain.handle("link:phone-search-numbers", (_event, input) => searchPhoneNumbers(input));
  ipcMain.handle("link:phone-preview-setup", (_event, input) => previewPhoneSetup(input));
  ipcMain.handle("link:phone-provision-system", (_event, input) => provisionPhoneSystem(input));
  ipcMain.handle("link:list-memory-banks", () => listMemoryBanks());
  ipcMain.handle("link:recall-memory", (_event, input) => recallMemory(input));
  ipcMain.handle("link:list-dojo-state", () => dojoState);
  ipcMain.handle("link:audit-events", () => auditLogger.all());
}

async function listSkills() {
  const [linkSkills, telnyxSkills] = await Promise.all([discoverSkills(), discoverTelnyxSkills()]);
  return [
    ...linkSkills.map((skill) => ({ ...skill.metadata, source: "link" })),
    ...telnyxSkills,
  ].sort((left, right) => left.name.localeCompare(right.name));
}

async function discoverTelnyxSkills() {
  const skillsRoot = path.join(repoRoot, "skills");
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true }).catch(() => []);
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
    const markdown = await fs.readFile(skillPath, "utf8").catch(() => "");
    if (!markdown) continue;
    const metadata = parseTelnyxSkillMetadata(markdown, entry.name);
    if (metadata) skills.push(metadata);
  }

  return skills;
}

function parseTelnyxSkillMetadata(markdown, fallbackName) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return null;
  const text = frontmatter[1];
  const name = firstYamlValue(text, "name") || fallbackName;
  const description = yamlBlockValue(text, "description") || firstYamlValue(text, "description") || "Telnyx skill from the Git-backed skills repository.";
  const product = firstYamlValue(text, "product") || firstYamlValue(text, "metadata.product") || productFromSkillName(name);
  const language = firstYamlValue(text, "language") || firstYamlValue(text, "metadata.language") || languageFromSkillName(name);

  return {
    name,
    description,
    owner: "telnyx",
    team: product ? titleize(product) : "Telnyx",
    riskLevel: "low",
    toolsRequired: [`telnyx.${product || "api"}`],
    customerSafe: false,
    approvalRequired: false,
    source: "telnyx",
    product,
    language,
  };
}

function firstYamlValue(text, key) {
  const simpleKey = key.includes(".") ? key.split(".").pop() : key;
  const match = text.match(new RegExp(`^\\s*${simpleKey}:\\s*(.+)$`, "m"));
  if (!match) return "";
  const value = match[1].trim();
  if (value === ">-" || value === "|") return "";
  return value.replace(/^["']|["']$/g, "");
}

function yamlBlockValue(text, key) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.match(new RegExp(`^\\s*${key}:\\s*(>-|\\|)\\s*$`)));
  if (start === -1) return "";
  const output = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && line.includes(":")) break;
    const trimmed = line.trim();
    if (trimmed) output.push(trimmed);
  }
  return output.join(" ");
}

function productFromSkillName(name) {
  const normalized = name.replace(/^telnyx-/, "");
  return normalized.split("-").slice(0, -1).join("-") || normalized;
}

function languageFromSkillName(name) {
  const language = name.split("-").at(-1);
  return ["python", "javascript", "ruby", "go", "java", "curl"].includes(language) ? language : "guide";
}

function titleize(value) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function createActiveWork({ title, subtitle, prompt, requestedAction, threadContext }) {
  const draft = runtime.runSharedChannel({
    actorId: "desktop_seed",
    channelType: "shared_customer",
    customerIdentifier: "Acme Messaging Co.",
    userPrompt: prompt,
    requestedAction,
    threadContext,
  });

  return {
    id: `work-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    subtitle,
    status: "pending",
    createdAt: new Date().toISOString(),
    summary: "Customer-visible action requires human approval before posting.",
    details: {
      ...draft,
      formatted: formatSharedChannelResponse(draft),
    },
  };
}

function decideWork(id, decision) {
  activeWork = activeWork.map((item) =>
    item.id === id
      ? {
          ...item,
          status: decision === "approve" ? "approved" : "dismissed",
          subtitle: decision === "approve" ? "Approved by human reviewer" : "Dismissed by human reviewer",
        }
      : item,
  );

  auditLogger.record({
    actorId: "desktop_user",
    surface: "desktop",
    eventType: decision === "approve" ? "approval.approved" : "approval.dismissed",
    action: "active_work_decision",
    target: id,
    metadata: { decision },
  });

  void saveDesktopState();
  return activeWork.find((item) => item.id === id);
}

async function sendChatMessage({ sessionId, workspaceId = "workspace-link", content, agentId, agentName, approvalMode = "auto", modelMode = "default-litellm", contextScope = "workspace" }) {
  const trimmed = String(content ?? "").trim();
  if (!trimmed) throw new Error("Chat message cannot be empty.");
  const targetAgent = [agentName, agentId].filter(Boolean).join(" / ") || "Personal OpenClaw";
  const chatSettings = `Approval mode: ${approvalMode}. Model route: ${modelMode}. Context scope: ${contextScope}.`;

  let sessionItem = chatSessions.find((item) => item.id === sessionId);
  if (!sessionItem) {
    sessionItem = {
      id: `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: trimmed.slice(0, 54),
      workspaceId,
      model: liteLlmModel(),
      status: "active",
      updatedAt: new Date().toISOString(),
      messages: [
        createMessage("system", `You are Telnyx Link. Route this conversation through ${targetAgent}. ${chatSettings} Use approved tools and Hindsight recall when available.`),
      ],
    };
    chatSessions = [sessionItem, ...chatSessions];
  }

  sessionItem.messages = [
    ...sessionItem.messages,
    createMessage("system", `Selected Link chat agent: ${targetAgent}. ${chatSettings}`),
    createMessage("user", trimmed),
  ];

  const liveResponse = await runLiteLlmChat(sessionItem.messages);
  const responseText =
    liveResponse ??
    (await runtime.chat({ prompt: `${targetAgent} (${chatSettings}): ${trimmed}`, actorId: "desktop_user", surface: "desktop" })).response ??
    "Link completed the request with the mocked local runtime.";

  sessionItem.messages = [
    ...sessionItem.messages,
    createMessage("assistant", liveResponse ? responseText : `${responseText}\n\nNo production model runtime was contacted.`, createChatArtifacts(trimmed)),
  ];
  sessionItem.status = "active";
  sessionItem.updatedAt = new Date().toISOString();
  sessionItem.model = liveResponse ? liteLlmModel() : "mock-link-runtime";

  addWorkspaceTab(workspaceId, {
    id: `tab-${sessionItem.id}`,
    title: sessionItem.title,
    kind: "chat",
    status: "open",
    updatedAt: sessionItem.updatedAt,
  });

  await saveDesktopState();
  return sessionItem;
}

async function runLiteLlmChat(messages) {
  const apiKey = credentialValue("LITELLM_API_KEY");
  if (!apiKey) return null;

  const baseUrl = liteLlmBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: liteLlmModel(),
        messages: messages.map((message) => ({
          role: message.role === "assistant" || message.role === "system" ? message.role : "user",
          content: message.content,
        })),
      }),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function liteLlmModel() {
  return credentialValue("LITELLM_MODEL") || "telnyx-default";
}

function liteLlmBaseUrl() {
  return (process.env.LITELLM_BASE_URL || defaultLiteLlmBaseUrl).replace(/\/$/, "");
}

function createChangeRequest(input) {
  const request = {
    id: `change-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: input.title,
    summary: input.summary,
    requestedChange: input.requestedChange,
    status: "pending_review",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceSessionId: input.sourceSessionId,
    workspaceId: input.workspaceId || "workspace-link",
  };
  changeRequests = [request, ...changeRequests];
  addWorkspaceTab(request.workspaceId, {
    id: `tab-${request.id}`,
    title: request.title,
    kind: "approval",
    status: "pending",
    updatedAt: request.updatedAt,
  });
  void saveDesktopState();
  return request;
}

async function approveChangeRequest(id) {
  const request = changeRequests.find((item) => item.id === id);
  if (!request) throw new Error(`Unknown change request: ${id}`);
  const github = await createGitHubDraftPr(request);
  changeRequests = changeRequests.map((item) =>
    item.id === id
      ? {
          ...item,
          status: "draft_pr_created",
          updatedAt: new Date().toISOString(),
          github,
        }
      : item,
  );

  auditLogger.record({
    actorId: "desktop_user",
    surface: "desktop",
    eventType: "change_request.approved",
    action: "approve_change_request",
    target: id,
    metadata: { github },
  });

  await saveDesktopState();
  return changeRequests.find((item) => item.id === id);
}

function dismissChangeRequest(id) {
  changeRequests = changeRequests.map((item) =>
    item.id === id ? { ...item, status: "dismissed", updatedAt: new Date().toISOString() } : item,
  );
  auditLogger.record({
    actorId: "desktop_user",
    surface: "desktop",
    eventType: "change_request.dismissed",
    action: "dismiss_change_request",
    target: id,
  });
  void saveDesktopState();
  return changeRequests.find((item) => item.id === id);
}

async function createGitHubDraftPr(request) {
  const token = credentialValue("GH_TOKEN") || credentialValue("GITHUB_TOKEN");
  const repo = process.env.LINK_GITHUB_REPO || process.env.GITHUB_REPOSITORY;
  const branch = `link/change-${request.id}`;

  if (!token || !repo || process.env.LINK_PR_MODE !== "live") {
    return {
      mode: "mocked",
      branch,
      prUrl: `https://github.com/${repo || "team-telnyx/ai"}/pull/mock-${request.id}`,
      note: "Admin approval recorded. Draft PR creation is mocked until LINK_PR_MODE=live, a GitHub token, repo, and generated patch are configured.",
    };
  }

  return {
    mode: "mocked",
    branch,
    prUrl: `https://github.com/${repo}/pull/queued-${request.id}`,
    note: "GitHub credentials are present, but Link needs generated file changes before creating a live branch and draft PR.",
  };
}

function listWorkspaces() {
  return workspaces.map((workspace) => ({
    ...workspace,
    activeWorkIds: Array.from(new Set([...(workspace.activeWorkIds ?? []), ...changeRequests.filter((request) => request.workspaceId === workspace.id).map((request) => request.id)])),
  }));
}

async function searchExplorer({ query = "", workspaceId } = {}) {
  const term = String(query || "Telnyx Link").trim();
  const [skills, agents, guruResults] = await Promise.all([listSkills(), listAgents(), searchGuru(term, workspaceId)]);
  const linkFileResults = activeWork.slice(0, 4).map((item) => ({
    id: `explorer-work-${item.id}`,
    title: `${item.title}.md`,
    source: "link_file",
    type: "file",
    permission: "allowed",
    freshness: relativeTime(item.createdAt),
    excerpt: item.summary,
    workspaceId: workspaceId || "workspace-acme",
  }));

  return [
    ...guruResults,
    {
      id: "explorer-drive-1",
      title: "Acme QBR and escalation notes",
      source: "google_drive",
      type: "doc",
      permission: connectorReady("google-drive") ? "allowed" : "needs_access",
      freshness: connectorReady("google-drive") ? "Drive adapter configured" : "Drive OAuth required",
      excerpt: `Google Drive adapter can search docs for ${term} once OAuth or token access is configured.`,
      workspaceId: workspaceId || "workspace-acme",
    },
    ...linkFileResults,
    ...skills.slice(0, 3).map((skill) => ({
      id: `explorer-skill-${skill.name}`,
      title: skill.name,
      source: "skill",
      type: "skill",
      permission: "allowed",
      freshness: skill.source === "telnyx" ? "Root skills repository" : "Link skill",
      excerpt: skill.description,
    })),
    ...agents.slice(0, 2).map((agent) => ({
      id: `explorer-agent-${agent.id}`,
      title: agent.displayName,
      source: "agent",
      type: "agent",
      permission: agent.source === "agent-control-plane" ? "allowed" : "mocked",
      freshness: agent.status,
      excerpt: agent.description,
    })),
  ];
}

async function searchGuru(term, workspaceId) {
  if (!connectorReady("guru")) return [mockGuruExplorerResult(term, workspaceId)];

  try {
    const params = new URLSearchParams({
      q: term,
      searchTerms: term,
      queryType: "cards",
      maxResults: "8",
      includeCardAttributes: "true",
    });
    const response = await fetch(`${guruApiBaseUrl()}/search/query?${params.toString()}`, {
      headers: {
        Authorization: guruAuthorizationHeader(),
      },
    });
    if (!response.ok) return [mockGuruExplorerResult(term, workspaceId, `Guru returned ${response.status}`)];

    const payload = await response.json();
    const records = Array.isArray(payload) ? payload : payload.results ?? payload.cards ?? payload.items ?? [];
    const results = records.map((record, index) => normalizeGuruExplorerResult(record, index, workspaceId)).filter(Boolean);
    return results.length > 0 ? results : [mockGuruExplorerResult(term, workspaceId, "No Guru cards matched")];
  } catch {
    return [mockGuruExplorerResult(term, workspaceId, "Guru search unavailable")];
  }
}

function normalizeGuruExplorerResult(record, index, workspaceId) {
  const card = record.card ?? record.content ?? record;
  const id = card.id ?? card.cardId ?? record.id ?? `guru-${index}`;
  const title = card.title ?? card.preferredPhrase ?? card.name ?? record.title ?? "Guru card";
  const excerpt = stripHtml(card.content ?? card.excerpt ?? card.summary ?? record.snippet ?? record.highlight ?? "Verified Guru knowledge card.");
  const lastModified = card.lastModified ?? card.dateModified ?? card.updatedAt ?? record.lastModified;
  const url = card.shareUrl ?? card.url ?? card.webUrl ?? record.url;
  return {
    id: `explorer-guru-${id}`,
    title,
    source: "guru",
    type: "doc",
    permission: "allowed",
    freshness: lastModified ? `Guru - ${relativeTime(lastModified)}` : "Guru user token",
    excerpt,
    workspaceId: workspaceId || "workspace-acme",
    url,
  };
}

function mockGuruExplorerResult(term, workspaceId, freshness = "Mocked Guru result") {
  return {
    id: "explorer-guru-1",
    title: "Messaging Delivery Investigation Playbook",
    source: "guru",
    type: "doc",
    permission: connectorReady("guru") ? "allowed" : "mocked",
    freshness,
    excerpt: `Guru result for ${term}: escalation checklist, evidence handling, and customer-safe response policy.`,
    workspaceId: workspaceId || "workspace-acme",
  };
}

function guruAuthorizationHeader() {
  const user = credentialValue("GURU_USER_EMAIL") || credentialValue("GURU_USERNAME") || credentialValue("GURU_COLLECTION_ID") || "";
  const token = credentialValue("GURU_USER_TOKEN") || credentialValue("GURU_COLLECTION_TOKEN") || "";
  return `Basic ${Buffer.from(`${user}:${token}`).toString("base64")}`;
}

function guruApiBaseUrl() {
  return (process.env.GURU_API_BASE_URL || defaultGuruApiBaseUrl).replace(/\/$/, "");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

async function listAgents() {
  const slackAgents = mergeAgents([agentRescueSlackAgent, ...(await listSlackBotAgents().catch(() => []))]);
  try {
    const discovered = await listA2aDiscoveryAgents();
    if (discovered.length > 0) return mergeAgents([...discovered, ...slackAgents]);
  } catch {
    // Fall through to the authenticated ACP adapter or mocked local directory.
  }

  try {
    const status = await getAgentControlPlaneAuthStatus();
    if (!status.ready) return mergeAgents([...seedAgents("mock"), ...slackAgents]);
    const hosted = await listHostedAgents();
    return mergeAgents([
      ...hosted.map((agent) => ({
        ...agent,
        visibility: agent.type === "slack" ? "slack" : "public",
        source: "agent-control-plane",
        slackChannel: agent.type === "slack" ? "#telnyx-link-eng" : undefined,
      })),
      ...slackAgents,
    ]);
  } catch {
    return mergeAgents([...seedAgents("mock"), ...slackAgents]);
  }
}

function mergeAgents(agents) {
  const byId = new Map();
  for (const agent of agents) byId.set(agent.id, agent);
  return [...byId.values()];
}

async function listSlackBotAgents() {
  const token = slackToken();
  if (!token) return [];

  const payload = await slackRequest("users.list", { limit: 200 }, "GET", token);
  const members = payload.members ?? [];
  return members
    .filter((member) => member?.is_bot && !member.deleted && member.id !== "USLACKBOT" && member.id !== agentRescueSlackAgent.slackUserId)
    .map((member) => ({
      id: `slack-${member.id}`,
      name: member.name ?? member.profile?.display_name ?? member.id,
      displayName: member.profile?.display_name || member.real_name || member.name || member.id,
      description: member.profile?.status_text || member.profile?.title || "Slack bot available to the configured Slack token.",
      status: "available",
      type: "slack",
      capabilities: ["slack", "chat", "bot"],
      visibility: "slack",
      source: "slack",
      slackUserId: member.id,
      squad: "slack",
      audience: "internal",
      origin: "slack",
      available: true,
      requiresAuthentication: true,
      updatedAt: "Slack Web API",
    }));
}

async function sendAgentMessage({ agentId, content } = {}) {
  const message = String(content || "").trim();
  if (!agentId || !message) throw new Error("Choose an agent and enter a message.");

  const agents = await listAgents();
  const agent = agents.find((item) => item.id === agentId);
  if (!agent) throw new Error("Agent not found.");
  if (agent.source !== "slack" && agent.type !== "slack") {
    return {
      mode: "mocked",
      agentId,
      message: `Link staged a message to ${agent.displayName}. Non-Slack agent chat adapters will route through ACP later.`,
    };
  }

  const userToken = credentialValue("SLACK_USER_TOKEN");
  const botToken = credentialValue("SLACK_BOT_TOKEN");
  const token = userToken || botToken;
  if (!token) throw new Error("Save SLACK_USER_TOKEN or SLACK_BOT_TOKEN in Settings before messaging Slack agents.");

  let channelId = agent.slackChannelId || agent.slackChannel;
  if (userToken && agent.slackUserId && !agent.slackChannelId) {
    const opened = await slackRequest("conversations.open", { users: agent.slackUserId }, "POST", userToken);
    channelId = opened.channel?.id || channelId;
  }
  if (!channelId) throw new Error("Slack could not resolve a DM or channel for this agent.");

  const posted = await slackRequest("chat.postMessage", { channel: channelId, text: message }, "POST", token);
  auditLogger.record({
    actorId: "desktop_user",
    surface: "desktop",
    eventType: "slack_agent.message_sent",
    action: "send_agent_message",
    target: agentId,
    metadata: { channelId, ts: posted.ts },
  });
  return {
    mode: "slack",
    agentId,
    channelId,
    ts: posted.ts,
    message: `Sent to ${agent.displayName}.`,
  };
}

async function slackRequest(methodName, params = {}, httpMethod = "POST", token = slackToken()) {
  if (!token) throw new Error("Slack token is not configured.");
  const url = new URL(`https://slack.com/api/${methodName}`);
  const options = {
    method: httpMethod,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (httpMethod === "GET") {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
  } else {
    options.body = JSON.stringify(params);
  }

  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(`Slack ${methodName} failed: ${payload.error || response.status}`);
  }
  return payload;
}

function slackToken() {
  return credentialValue("SLACK_USER_TOKEN") || credentialValue("SLACK_BOT_TOKEN");
}

const workboardProviderLabels = {
  auto: "Auto",
  hermes: "Hermes Kanban",
  openclaw: "OpenClaw Workboard",
  local: "Link local board",
};

const workboardColumnsByProvider = {
  hermes: ["triage", "todo", "ready", "running", "blocked", "done", "archived"],
  openclaw: ["triage", "backlog", "todo", "scheduled", "ready", "running", "review", "blocked", "done"],
  local: ["triage", "backlog", "todo", "scheduled", "ready", "running", "review", "blocked", "done"],
};

async function listWorkboard(input = {}) {
  const providers = await detectWorkboardProviders();
  const requested = normalizeWorkboardProvider(input.provider);
  const provider = resolveWorkboardProvider(requested, providers);

  if (provider === "hermes") {
    const hermes = providers.find((item) => item.id === "hermes");
    if (!hermes?.available) return unavailableWorkboardSnapshot("hermes", providers, hermes?.message ?? "Hermes CLI is not available.");
    try {
      return await listHermesWorkboard(input.boardId, providers);
    } catch (error) {
      return unavailableWorkboardSnapshot("hermes", providers, errorMessage(error));
    }
  }

  if (provider === "openclaw") {
    const openclaw = providers.find((item) => item.id === "openclaw");
    if (!openclaw?.available) return unavailableWorkboardSnapshot("openclaw", providers, openclaw?.message ?? "OpenClaw CLI is not available.");
    try {
      return await listOpenClawWorkboard(input.boardId, providers);
    } catch (error) {
      return unavailableWorkboardSnapshot("openclaw", providers, errorMessage(error));
    }
  }

  return localWorkboardSnapshot(providers, input.boardId);
}

async function createWorkboardCard(input = {}) {
  const provider = normalizeWorkboardProvider(input.provider);
  const resolved = provider === "auto" ? (await listWorkboard({ provider: "auto" })).provider : provider;
  const title = String(input.title || "").trim();
  if (!title) throw new Error("Workboard card title is required.");

  if (resolved === "hermes") {
    await createHermesWorkboardCard({ ...input, title });
    return listWorkboard({ provider: "hermes", boardId: input.boardId });
  }

  if (resolved === "openclaw") {
    await createOpenClawWorkboardCard({ ...input, title });
    return listWorkboard({ provider: "openclaw", boardId: input.boardId });
  }

  const card = createLocalWorkboardCard({
    title,
    body: input.body,
    status: normalizeWorkboardStatus(input.status || "triage", "local"),
    assignee: input.assignee,
    priority: normalizeWorkboardPriority(input.priority),
    labels: normalizeLabels(input.labels),
    tenant: input.tenant,
    workspace: input.workspace,
    sourceUrl: input.sourceUrl,
  });
  workboardCards = [card, ...workboardCards];
  await saveDesktopState();
  return listWorkboard({ provider: "local", boardId: input.boardId });
}

async function updateWorkboardCard(input = {}) {
  const provider = normalizeWorkboardProvider(input.provider);
  const cardId = String(input.cardId || "").trim();
  if (!cardId) throw new Error("Workboard card id is required.");

  if (provider === "hermes") {
    await updateHermesWorkboardCard(input);
    return listWorkboard({ provider: "hermes", boardId: input.boardId });
  }

  if (provider === "openclaw") {
    throw new Error("OpenClaw Workboard card mutation is not wired yet. Use dispatch or switch to the Link local board for manual tracking.");
  }

  workboardCards = workboardCards.map((card) =>
    card.id === cardId
      ? {
          ...card,
          status: input.status ? normalizeWorkboardStatus(input.status, "local") : card.status,
          assignee: input.assignee ?? card.assignee,
          comments: input.comment ? [...(card.comments || []), String(input.comment)] : card.comments,
          updatedAt: new Date().toISOString(),
        }
      : card,
  );
  await saveDesktopState();
  return listWorkboard({ provider: "local", boardId: input.boardId });
}

async function dispatchWorkboard(input = {}) {
  const provider = normalizeWorkboardProvider(input.provider);
  if (provider === "hermes") {
    await runHermesKanban(input.boardId, ["dispatch", "--json"]);
    return listWorkboard({ provider: "hermes", boardId: input.boardId });
  }
  if (provider === "openclaw") {
    await runCli("openclaw", ["workboard", "dispatch"], 20000);
    return listWorkboard({ provider: "openclaw", boardId: input.boardId });
  }

  workboardCards = workboardCards.map((card) =>
    card.status === "ready"
      ? {
          ...card,
          status: "running",
          diagnostics: [...(card.diagnostics || []), "Link local dispatch marked this card running. No external worker was started."],
          updatedAt: new Date().toISOString(),
        }
      : card,
  );
  await saveDesktopState();
  return listWorkboard({ provider: "local", boardId: input.boardId });
}

async function detectWorkboardProviders() {
  const [hermes, openclaw] = await Promise.all([commandAvailable("hermes"), commandAvailable("openclaw")]);
  return [
    {
      id: "hermes",
      label: workboardProviderLabels.hermes,
      available: hermes,
      mode: hermes ? "native" : "unavailable",
      message: hermes ? "Hermes CLI detected. Link will use Hermes Kanban commands." : "Hermes CLI was not found on PATH.",
    },
    {
      id: "openclaw",
      label: workboardProviderLabels.openclaw,
      available: openclaw,
      mode: openclaw ? "native" : "unavailable",
      message: openclaw ? "OpenClaw CLI detected. Link will use OpenClaw Workboard commands." : "OpenClaw CLI was not found on PATH.",
    },
    {
      id: "local",
      label: workboardProviderLabels.local,
      available: true,
      mode: "fallback",
      message: "Link local board is always available and does not require Hermes or OpenClaw.",
    },
  ];
}

async function commandAvailable(command) {
  try {
    await runCli(command, ["--version"], 5000);
    return true;
  } catch {
    return false;
  }
}

function resolveWorkboardProvider(requested, providers) {
  if (requested !== "auto") return requested;
  if (providers.find((item) => item.id === "hermes")?.available) return "hermes";
  if (providers.find((item) => item.id === "openclaw")?.available) return "openclaw";
  return "local";
}

function normalizeWorkboardProvider(provider) {
  return ["auto", "hermes", "openclaw", "local"].includes(provider) ? provider : "auto";
}

function normalizeWorkboardStatus(status, provider) {
  const columns = workboardColumnsByProvider[provider] || workboardColumnsByProvider.local;
  return columns.includes(status) ? status : columns[0];
}

function normalizeWorkboardPriority(priority) {
  if (typeof priority === "number") return priority;
  return ["low", "normal", "high", "urgent"].includes(priority) ? priority : "normal";
}

function normalizeLabels(labels) {
  if (Array.isArray(labels)) return labels.map((label) => String(label).trim()).filter(Boolean);
  if (typeof labels === "string") return labels.split(",").map((label) => label.trim()).filter(Boolean);
  return [];
}

async function listHermesWorkboard(boardId, providers) {
  const board = boardId || "default";
  const [listResult, statsResult, assigneesResult, boardsResult] = await Promise.all([
    runHermesKanban(boardId, ["list", "--json"]).catch((error) => ({ error })),
    runHermesKanban(boardId, ["stats", "--json"]).catch(() => null),
    runHermesKanban(boardId, ["assignees", "--json"]).catch(() => null),
    runCli("hermes", ["kanban", "boards", "list", "--json"], 10000).catch(() => null),
  ]);
  if (listResult?.error) throw listResult.error;

  const tasks = normalizeArrayPayload(listResult);
  const cards = tasks.map((task) => normalizeHermesWorkboardCard(task, board));
  return {
    provider: "hermes",
    boardId: board,
    providers,
    boards: normalizeHermesBoards(boardsResult),
    columns: workboardColumnsByProvider.hermes,
    cards,
    assignees: normalizeAssignees(assigneesResult, cards),
    stats: normalizeWorkboardStats(statsResult, cards),
    message: "Hermes Kanban is active. Link is using the native Hermes board and dispatcher.",
  };
}

async function createHermesWorkboardCard(input) {
  const args = ["create", input.title, "--json"];
  if (input.body) args.push("--body", String(input.body));
  if (input.assignee) args.push("--assignee", String(input.assignee));
  if (input.tenant) args.push("--tenant", String(input.tenant));
  if (input.workspace) args.push("--workspace", String(input.workspace));
  if (input.priority && typeof input.priority === "number") args.push("--priority", String(input.priority));
  if (input.status === "triage") args.push("--triage");
  await runHermesKanban(input.boardId, args);
}

async function updateHermesWorkboardCard(input) {
  const cardId = String(input.cardId || "").trim();
  if (input.assignee !== undefined) await runHermesKanban(input.boardId, ["assign", cardId, input.assignee ? String(input.assignee) : "none"]);
  if (input.comment) await runHermesKanban(input.boardId, ["comment", cardId, String(input.comment), "--author", "Telnyx Link"]);
  if (!input.status) return;

  const status = normalizeWorkboardStatus(input.status, "hermes");
  if (status === "ready") await runHermesKanban(input.boardId, ["promote", cardId]);
  if (status === "done") await runHermesKanban(input.boardId, ["complete", cardId, "--result", "Marked done from Telnyx Link."]);
  if (status === "blocked") await runHermesKanban(input.boardId, ["block", cardId, input.comment || "Blocked from Telnyx Link."]);
  if (status === "archived") await runHermesKanban(input.boardId, ["archive", cardId]);
  if (status === "todo") await runHermesKanban(input.boardId, ["unblock", cardId]).catch(() => null);
}

async function runHermesKanban(boardId, args) {
  const commandArgs = ["kanban"];
  if (boardId && boardId !== "default") commandArgs.push("--board", String(boardId));
  commandArgs.push(...args);
  return runCli("hermes", commandArgs, 20000);
}

function normalizeHermesWorkboardCard(task, boardId) {
  const id = String(task.id || task.task_id || task.taskId || crypto.randomUUID());
  const status = normalizeWorkboardStatus(task.status, "hermes");
  return {
    id,
    title: String(task.title || task.name || id),
    body: task.body || task.notes || task.description,
    status,
    priority: task.priority ?? "normal",
    labels: normalizeLabels(task.labels || task.skills),
    assignee: task.assignee || task.profile || task.claim_owner,
    provider: "hermes",
    boardId,
    tenant: task.tenant,
    workspace: task.workspace,
    sourceUrl: task.source_url || task.sourceUrl,
    linkedSessionId: task.session_key || task.sessionKey,
    linkedRunId: task.run_id || task.runId,
    linkedTaskId: task.task_id || task.taskId,
    proof: normalizeLabels(task.proof),
    artifacts: normalizeLabels(task.artifacts),
    comments: normalizeLabels(task.comments),
    diagnostics: normalizeLabels(task.diagnostics),
    createdAt: task.created_at || task.createdAt || new Date().toISOString(),
    updatedAt: task.updated_at || task.updatedAt || task.last_heartbeat_at || new Date().toISOString(),
    raw: task,
  };
}

function normalizeHermesBoards(payload) {
  const boards = normalizeArrayPayload(payload);
  const normalized = boards
    .map((board) => ({
      id: String(board.slug || board.id || board.name || "default"),
      name: String(board.name || board.display_name || board.slug || "Default"),
      description: board.description,
      provider: "hermes",
    }))
    .filter((board) => board.id);
  return normalized.length > 0 ? normalized : [{ id: "default", name: "Default", provider: "hermes" }];
}

async function listOpenClawWorkboard(boardId, providers) {
  const result = await runCli("openclaw", ["workboard", "list", "--json"], 20000);
  const cards = normalizeArrayPayload(result).map((card) => normalizeOpenClawWorkboardCard(card, boardId || "default"));
  return {
    provider: "openclaw",
    boardId: boardId || "default",
    providers,
    boards: [{ id: boardId || "default", name: "OpenClaw Gateway", provider: "openclaw" }],
    columns: workboardColumnsByProvider.openclaw,
    cards,
    assignees: [...new Set(cards.map((card) => card.assignee).filter(Boolean))],
    stats: normalizeWorkboardStats(null, cards),
    message: "OpenClaw Workboard is active. Link is reading the native Gateway board.",
  };
}

async function createOpenClawWorkboardCard(input) {
  const args = ["workboard", "create", input.title];
  if (input.priority) args.push("--priority", String(input.priority));
  const labels = normalizeLabels(input.labels);
  if (labels.length > 0) args.push("--labels", labels.join(","));
  await runCli("openclaw", args, 20000);
}

function normalizeOpenClawWorkboardCard(card, boardId) {
  const id = String(card.id || card.card_id || card.cardId || crypto.randomUUID());
  return {
    id,
    title: String(card.title || card.name || id),
    body: card.notes || card.body || card.description,
    status: normalizeWorkboardStatus(card.status, "openclaw"),
    priority: card.priority || "normal",
    labels: normalizeLabels(card.labels),
    assignee: card.agent_id || card.agentId || card.assignee || card.claim_owner,
    provider: "openclaw",
    boardId,
    sourceUrl: card.source_url || card.sourceUrl,
    linkedSessionId: card.session_key || card.sessionKey || card.linked_session || card.linkedSessionId,
    linkedRunId: card.run_id || card.runId,
    linkedTaskId: card.task_id || card.taskId,
    proof: normalizeLabels(card.proof),
    artifacts: normalizeLabels(card.artifacts),
    comments: normalizeLabels(card.comments),
    diagnostics: normalizeLabels(card.diagnostics),
    createdAt: card.created_at || card.createdAt || new Date().toISOString(),
    updatedAt: card.updated_at || card.updatedAt || new Date().toISOString(),
    raw: card,
  };
}

function localWorkboardSnapshot(providers, boardId = "local") {
  return {
    provider: "local",
    boardId: boardId || "local",
    providers,
    boards: [{ id: "local", name: "Link local board", description: "Link-owned fallback board for manual monitoring.", provider: "local" }],
    columns: workboardColumnsByProvider.local,
    cards: workboardCards,
    assignees: [...new Set(workboardCards.map((card) => card.assignee).filter(Boolean))],
    stats: normalizeWorkboardStats(null, workboardCards),
    message: "Link local board is active. Cards are stored in Link state and do not require Hermes or OpenClaw.",
  };
}

function unavailableWorkboardSnapshot(provider, providers, message) {
  return {
    provider,
    boardId: "unavailable",
    providers,
    boards: [],
    columns: workboardColumnsByProvider[provider] || workboardColumnsByProvider.local,
    cards: [],
    assignees: [],
    stats: [],
    message,
  };
}

function createLocalWorkboardCard(input) {
  const timestamp = new Date().toISOString();
  return {
    id: `card-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    title: input.title,
    body: input.body,
    status: input.status,
    priority: input.priority,
    labels: input.labels || [],
    assignee: input.assignee,
    provider: "local",
    boardId: "local",
    tenant: input.tenant,
    workspace: input.workspace,
    sourceUrl: input.sourceUrl,
    proof: [],
    artifacts: [],
    comments: [],
    diagnostics: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function normalizeArrayPayload(payload) {
  if (!payload) return [];
  if (typeof payload === "string") return normalizeArrayPayload(parseJsonOutput(payload));
  if (Array.isArray(payload)) return payload;
  for (const key of ["data", "tasks", "cards", "items", "boards", "assignees", "results"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  if (payload.card || payload.task) return [payload.card || payload.task];
  return [];
}

function normalizeAssignees(payload, cards) {
  const fromPayload = normalizeArrayPayload(payload).map((item) => String(item.name || item.assignee || item.profile || item.id || item)).filter(Boolean);
  const fromCards = cards.map((card) => card.assignee).filter(Boolean);
  return [...new Set([...fromPayload, ...fromCards])];
}

function normalizeWorkboardStats(payload, cards) {
  const statusCounts = workboardColumnsByProvider.local
    .map((status) => [status, cards.filter((card) => card.status === status).length])
    .filter(([, count]) => count > 0);
  const base = [
    { label: "Cards", value: cards.length },
    { label: "Running", value: cards.filter((card) => card.status === "running").length, tone: "success" },
    { label: "Blocked", value: cards.filter((card) => card.status === "blocked").length, tone: "warning" },
  ];
  if (!payload || typeof payload !== "object") return base;
  const extra = Object.entries(payload)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .slice(0, 3)
    .map(([label, value]) => ({ label: label.replaceAll("_", " "), value }));
  return extra.length > 0 ? extra : base.concat(statusCounts.slice(0, 3).map(([label, value]) => ({ label, value })));
}

async function runCli(command, args, timeout = 15000) {
  const { stdout } = await execFileAsync(command, args, {
    timeout,
    maxBuffer: 1024 * 1024 * 4,
    env: process.env,
  });
  const trimmed = String(stdout || "").trim();
  return trimmed ? parseJsonOutput(trimmed) : {};
}

function parseJsonOutput(output) {
  if (typeof output !== "string") return output;
  const trimmed = output.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstObject = trimmed.indexOf("{");
    const firstArray = trimmed.indexOf("[");
    const first = [firstObject, firstArray].filter((index) => index >= 0).sort((left, right) => left - right)[0];
    if (first === undefined) return trimmed;
    return JSON.parse(trimmed.slice(first));
  }
}

function errorMessage(error) {
  if (!error) return "Unknown workboard adapter error.";
  return String(error.stderr || error.message || error);
}

async function searchPhoneNumbers(input = {}) {
  const apiKey = requireTelnyxApiKey(input.apiKey);
  const params = new URLSearchParams();
  params.set("filter[country_code]", input.countryCode || "US");
  params.set("filter[features]", "voice");
  params.set("filter[phone_number_type]", "local");
  params.set("filter[limit]", "10");
  if (input.areaCode) params.set("filter[national_destination_code]", input.areaCode);
  if (input.locality) params.set("filter[locality]", input.locality);
  if (input.region) params.set("filter[administrative_area]", input.region);

  const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${params.toString()}`, {
    headers: telnyxHeaders(apiKey),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telnyx number search returned ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload = await response.json();
  return (payload.data ?? []).map(normalizePhoneNumberOption);
}

function previewPhoneSetup(input = {}) {
  requireTelnyxApiKey(input.apiKey);
  if (!input.phoneNumber) throw new Error("Choose a phone number before generating the setup plan.");
  const setup = buildPhoneSetup(input);

  return {
    id: `phone-plan-${Date.now()}`,
    phoneNumber: input.phoneNumber,
    sipUsername: setup.sipUsername,
    sipPassword: setup.sipPassword,
    webhookUrl: setup.webhookUrl,
    voiceAssistant: setup.voiceAssistant,
    warning:
      "Review only: Link has not purchased this number or created Telnyx resources yet. Use a hosted HTTPS webhook relay; private Tailscale addresses are not reachable by Telnyx webhooks unless exposed through an approved public funnel.",
    purchaseReview: {
      endpoint: "https://api.telnyx.com/v2/number_orders",
      method: "POST",
      body: setup.numberOrderBody("{credential_connection_id}"),
    },
    resources: [
      {
        label: "Credential SIP connection for WebRTC registration",
        endpoint: "https://api.telnyx.com/v2/credential_connections",
        method: "POST",
        body: setup.credentialConnectionBody,
      },
      {
        label: "Call Control application for inbound and diagnostic events",
        endpoint: "https://api.telnyx.com/v2/call_control_applications",
        method: "POST",
        body: setup.callControlApplicationBody,
      },
      {
        label: "Purchase and assign selected number to the SIP/WebRTC connection",
        endpoint: "https://api.telnyx.com/v2/number_orders",
        method: "POST",
        body: setup.numberOrderBody("{credential_connection_id}"),
      },
      ...(setup.voiceAssistant.enabled
        ? [
            {
              label: "Create Telnyx Voice AI assistant for after-hours call answering",
              endpoint: "https://api.telnyx.com/v2/ai/assistants",
              method: "POST",
              body: setup.voiceAssistantBody,
            },
            {
              label: "Start Voice AI assistant from Link Call Control when routing rules match",
              endpoint: "https://api.telnyx.com/v2/calls/{call_control_id}/actions/ai_assistant_start",
              method: "POST",
              body: { assistant: { id: "{voice_assistant_id}" } },
            },
          ]
        : []),
    ],
    steps: [
      "Search and choose a voice-capable Telnyx number.",
      "Show the exact number order before purchase.",
      "Create a credential SIP connection for WebRTC login.",
      "Create a Call Control application that posts events to the Link Phone webhook relay.",
      "Assign the purchased number to the SIP/WebRTC connection.",
      ...(setup.voiceAssistant.enabled
        ? [
            "Create a Telnyx Voice AI assistant with after-hours sales-call scheduling instructions.",
            "Use Google Calendar availability through the Link calendar webhook before offering appointment times.",
            "Have the Link Call Control webhook start the assistant on inbound calls that match the configured routing mode.",
          ]
        : []),
      "Use the generated SIP username and password to connect the in-app WebRTC softphone.",
    ],
  };
}

async function provisionPhoneSystem(input = {}) {
  const apiKey = requireTelnyxApiKey(input.apiKey);
  if (!input.phoneNumber) throw new Error("Choose a phone number before provisioning.");
  const setup = buildPhoneSetup(input);

  const credentialConnection = await telnyxRequest(apiKey, "POST", "/credential_connections", setup.credentialConnectionBody);
  const credentialConnectionId = credentialConnection.data?.id;
  if (!credentialConnectionId) throw new Error("Telnyx did not return a credential connection id.");

  const callControlApplication = await telnyxRequest(apiKey, "POST", "/call_control_applications", setup.callControlApplicationBody);
  const callControlApplicationId = callControlApplication.data?.id;

  const voiceAssistant = setup.voiceAssistant.enabled ? await telnyxRequest(apiKey, "POST", "/ai/assistants", setup.voiceAssistantBody) : null;
  const voiceAssistantId = voiceAssistant?.data?.id ?? voiceAssistant?.id;

  const numberOrder = await telnyxRequest(apiKey, "POST", "/number_orders", setup.numberOrderBody(credentialConnectionId));
  const orderedPhoneNumber = numberOrder.data?.phone_numbers?.find((item) => item.phone_number === input.phoneNumber) ?? numberOrder.data?.phone_numbers?.[0];
  const numberOrderStatus = numberOrder.data?.status;
  const orderPhoneNumberStatus = orderedPhoneNumber?.status;
  const status =
    orderPhoneNumberStatus === "requirement-info-pending" || numberOrder.data?.requirements_met === false
      ? "needs_regulatory_requirements"
      : numberOrderStatus === "success" || orderPhoneNumberStatus === "success"
        ? "provisioned"
        : "partial";

  return {
    ...previewPhoneSetup({ ...input, apiKey, sipPassword: setup.sipPassword }),
    purchaseReview: {
      endpoint: "https://api.telnyx.com/v2/number_orders",
      method: "POST",
      body: setup.numberOrderBody(credentialConnectionId),
    },
    status,
    warning:
      status === "needs_regulatory_requirements"
        ? "The number order was created but Telnyx requires regulatory information before the number can activate."
        : "Provisioning request completed. If the number order is pending, Telnyx may still be activating the number.",
    credentialConnectionId,
    callControlApplicationId,
    voiceAssistantId,
    numberOrderId: numberOrder.data?.id,
    numberOrderStatus,
    orderedPhoneNumberId: orderedPhoneNumber?.id,
    raw: {
      credentialConnection: credentialConnection.data,
      callControlApplication: callControlApplication.data,
      voiceAssistant: voiceAssistant?.data ?? voiceAssistant,
      numberOrder: numberOrder.data,
    },
  };
}

function buildPhoneSetup(input = {}) {
  const displayName = input.displayName?.trim() || "Telnyx Link Phone";
  const webhookUrl = input.webhookUrl?.trim() || "https://link-phone-webhooks.telnyx.io/call-control";
  const calendarWebhookUrl = input.googleCalendarWebhookUrl?.trim() || "https://link-phone-webhooks.telnyx.io/calendar";
  const sipUsername = sanitizeSipUsername(`link${input.phoneNumber.replace(/\D/g, "").slice(-10)}`);
  const sipPassword = input.sipPassword || crypto.randomBytes(18).toString("base64url");
  const timezone = input.timezone?.trim() || "America/Chicago";
  const workHours = normalizeWorkHours(input.workHours);
  const voiceAssistantName = input.voiceAssistantName?.trim() || `${displayName} Voice AI`;
  const voiceAssistantGreeting =
    input.voiceAssistantGreeting?.trim() ||
    "Hi, this is the AI assistant for this Telnyx Link phone. I can help route your call or schedule a sales conversation.";
  const voiceAssistantInstructions = input.voiceAssistantInstructions?.trim();
  const voiceAssistantLanguage = input.voiceAssistantLanguage?.trim() || "en-US";
  const voiceAssistantVoice = input.voiceAssistantVoice?.trim() || "Telnyx Natural";
  const voiceAssistantTemperature = input.voiceAssistantTemperature?.trim() || "0.3";
  const voiceAssistantEscalationTarget = input.voiceAssistantEscalationTarget?.trim() || "link-owner";
  const voiceAssistantEnabled = Boolean(input.voiceAssistantEnabled);
  const voiceAssistantMode = ["after_hours", "always", "manual"].includes(input.voiceAssistantMode) ? input.voiceAssistantMode : "after_hours";
  const googleCalendar = {
    enabled: Boolean(input.googleCalendarEnabled),
    calendarId: input.googleCalendarId?.trim() || "primary",
    mode: ["free_busy_only", "create_tentative_sales_calls"].includes(input.googleCalendarMode) ? input.googleCalendarMode : "free_busy_only",
    webhookUrl: calendarWebhookUrl,
  };
  const voiceAssistantBody = {
    name: voiceAssistantName,
    description: "Telnyx Link personal phone assistant for after-hours call answering and sales-call scheduling.",
    enabled_features: ["telephony"],
    greeting: voiceAssistantGreeting,
    instructions:
      voiceAssistantInstructions ||
      buildVoiceAssistantInstructions({
        displayName,
        phoneNumber: input.phoneNumber,
        timezone,
        workHours,
        mode: voiceAssistantMode,
        googleCalendar,
      }),
    language: voiceAssistantLanguage,
    voice: voiceAssistantVoice,
    temperature: Number.parseFloat(voiceAssistantTemperature) || 0.3,
    escalation_target: voiceAssistantEscalationTarget,
    dynamic_variables_webhook_url: calendarWebhookUrl,
    tools: [
      {
        type: "webhook",
        webhook: {
          name: "check_calendar_availability",
          description:
            "Check Google Calendar free/busy availability for proposed sales call windows. Return available slots in the user's timezone.",
          url: calendarWebhookUrl,
          method: "POST",
          headers: [{ name: "X-Telnyx-Link-Tool", value: "calendar.free_busy" }],
          body_parameters: {
            type: "object",
            properties: {
              start_time: { type: "string", description: "ISO 8601 start time for the availability window." },
              end_time: { type: "string", description: "ISO 8601 end time for the availability window." },
              timezone: { type: "string", description: "IANA timezone for the caller-facing time window." },
              duration_minutes: { type: "integer", description: "Requested meeting duration in minutes." },
            },
            required: ["start_time", "end_time", "timezone"],
          },
          timeout_ms: 5250,
        },
      },
      {
        type: "webhook",
        webhook: {
          name: "schedule_sales_call",
          description:
            "Create a tentative Google Calendar sales-call hold after the caller confirms a time, subject, name, callback number, and email when available.",
          url: calendarWebhookUrl,
          method: "POST",
          headers: [{ name: "X-Telnyx-Link-Tool", value: "calendar.create_tentative_sales_call" }],
          body_parameters: {
            type: "object",
            properties: {
              start_time: { type: "string", description: "ISO 8601 confirmed sales-call start time." },
              end_time: { type: "string", description: "ISO 8601 confirmed sales-call end time." },
              timezone: { type: "string", description: "IANA timezone for the meeting." },
              caller_name: { type: "string", description: "Caller name." },
              caller_company: { type: "string", description: "Caller company, if provided." },
              caller_phone: { type: "string", description: "Caller callback phone number." },
              caller_email: { type: "string", description: "Caller email, if provided." },
              summary: { type: "string", description: "Short meeting subject." },
            },
            required: ["start_time", "end_time", "timezone", "caller_phone", "summary"],
          },
          timeout_ms: 5250,
        },
      },
      { type: "hangup", hangup: {} },
    ],
    tags: ["telnyx-link", "personal-phone", "voice-ai"],
    telephony_settings: {
      supports_unauthenticated_web_calls: false,
    },
    privacy_settings: {
      data_retention: false,
    },
  };
  const credentialConnectionBody = {
    active: true,
    connection_name: displayName,
    user_name: sipUsername,
    password: sipPassword,
    anchorsite_override: "Latency",
    sip_uri_calling_preference: "internal",
    webhook_event_url: webhookUrl,
    webhook_api_version: "2",
    webhook_timeout_secs: 25,
    tags: ["telnyx-link", "personal-phone"],
    inbound: {
      generate_ringback_tone: true,
      shaken_stir_enabled: true,
    },
    outbound: {
      generate_ringback_tone: true,
    },
  };
  const callControlApplicationBody = {
    active: true,
    application_name: `${displayName} Call Control`,
    webhook_event_url: webhookUrl,
    webhook_api_version: "2",
    webhook_timeout_secs: 25,
    call_cost_in_webhooks: true,
  };

  return {
    sipUsername,
    sipPassword,
    webhookUrl,
    voiceAssistant: {
      enabled: voiceAssistantEnabled,
      name: voiceAssistantName,
      mode: voiceAssistantMode,
      timezone,
      workHours,
      googleCalendar,
      assistantReview: {
        endpoint: "https://api.telnyx.com/v2/ai/assistants",
        method: "POST",
        body: voiceAssistantBody,
      },
      callControlRouting: {
        endpoint: "https://api.telnyx.com/v2/calls/{call_control_id}/actions/ai_assistant_start",
        method: "POST",
        body: { assistant: { id: "{voice_assistant_id}" } },
      },
    },
    voiceAssistantBody,
    credentialConnectionBody,
    callControlApplicationBody,
    numberOrderBody: (connectionId) => ({
      phone_numbers: [{ phone_number: input.phoneNumber }],
      connection_id: connectionId,
      customer_reference: "telnyx-link-personal-phone",
    }),
  };
}

function normalizeWorkHours(workHours = {}) {
  return {
    mondayToFriday: workHours.mondayToFriday || "09:00-17:00",
    saturday: workHours.saturday || "closed",
    sunday: workHours.sunday || "closed",
  };
}

function buildVoiceAssistantInstructions({ displayName, phoneNumber, timezone, workHours, mode, googleCalendar }) {
  const routingMode =
    mode === "always"
      ? "Answer every inbound call before routing to the user unless the caller asks for the user directly."
      : mode === "manual"
        ? "Only answer calls when Link Call Control explicitly starts you."
        : "Answer calls outside the configured work hours, when the user is unavailable, or when Link Call Control starts you after a missed call.";
  const calendarPolicy = googleCalendar.enabled
    ? `Use the check_calendar_availability tool before proposing times on calendar ${googleCalendar.calendarId}. ${
        googleCalendar.mode === "create_tentative_sales_calls"
          ? "After the caller confirms a slot, use schedule_sales_call to create a tentative calendar hold."
          : "Do not create calendar events; collect preferred times and tell the caller the user will confirm."
      }`
    : "Calendar is not connected. Collect the caller's preferred times and contact details; do not promise a confirmed meeting.";

  return [
    `You are the Telnyx Voice AI assistant for ${displayName} at ${phoneNumber}.`,
    routingMode,
    `The user's working timezone is ${timezone}. Normal work hours are Monday-Friday ${workHours.mondayToFriday}, Saturday ${workHours.saturday}, Sunday ${workHours.sunday}.`,
    "Your primary after-hours job is to answer politely, qualify whether the caller wants sales help, collect name/company/callback number/email, and schedule or request a sales-call time.",
    calendarPolicy,
    "Offer at most three meeting slots at a time. Prefer hourly slots during business hours on upcoming weekdays.",
    "Never claim a meeting is booked unless the scheduling tool reports success. If scheduling fails, summarize the requested time and promise follow-up.",
    "For urgent support, billing, emergency, or abuse issues, collect context and explain that the right Telnyx team will follow up; do not present yourself as emergency support.",
    "End the call when the caller is done or asks to stop.",
  ].join("\n");
}

function sanitizeSipUsername(value) {
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32).padEnd(4, "0");
}

function normalizePhoneNumberOption(number) {
  const cost = number.cost ?? number.cost_information ?? {};
  return {
    phoneNumber: number.phone_number,
    countryCode: number.country_code ?? "",
    locality: number.locality ?? number.region_information?.locality,
    region: number.administrative_area ?? number.region_information?.region,
    type: number.phone_number_type,
    features: number.features ?? [],
    monthlyCost: formatCost(cost.monthly_cost ?? cost.monthly ?? cost.recurring_cost),
    upfrontCost: formatCost(cost.upfront_cost ?? cost.upfront ?? cost.one_time_cost ?? cost.amount),
  };
}

function formatCost(cost) {
  if (!cost) return undefined;
  if (typeof cost === "string") return cost;
  if (cost.amount && cost.currency) return `${cost.amount} ${cost.currency}`;
  return undefined;
}

function requireTelnyxApiKey(apiKey) {
  const key = apiKey || credentialValue("TELNYX_API_KEY") || "";
  if (!key.trim()) throw new Error("Enter a Telnyx API key to search phone numbers.");
  return key.trim();
}

function telnyxHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function telnyxRequest(apiKey, method, pathName, body) {
  const response = await fetch(`https://api.telnyx.com/v2${pathName}`, {
    method,
    headers: telnyxHeaders(apiKey),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telnyx ${method} ${pathName} returned ${response.status}: ${detail.slice(0, 700)}`);
  }
  return response.json();
}

async function listA2aDiscoveryAgents() {
  const response = await fetch(`${a2aDiscoveryUrl()}/v1/agents`);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`A2A discovery returned ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload = await response.json();
  const records = payload.data ?? payload.items ?? payload.agents ?? [];
  return records.map(normalizeA2aAgent).filter(Boolean).sort((left, right) => {
    const squad = (left.squad ?? "").localeCompare(right.squad ?? "");
    return squad || left.displayName.localeCompare(right.displayName);
  });
}

function normalizeA2aAgent(record) {
  const card = record.agent_card ?? record.agentCard ?? {};
  const skills = Array.isArray(card.skills) ? card.skills : [];
  const toolNames = Array.isArray(record.tools) ? record.tools.map((tool) => tool.name ?? tool.id).filter(Boolean) : [];
  const capabilityNames = [
    ...skills.map((skill) => skill.name ?? skill.id).filter(Boolean),
    ...toolNames,
    card.preferredTransport,
  ].filter(Boolean);
  const id = record.agent_id ?? record.id ?? card.name;
  if (!id) return null;

  return {
    id,
    name: card.name ?? record.name ?? id,
    displayName: card.name ?? record.display_name ?? record.name ?? id,
    description: card.description ?? record.description ?? "A2A-discovered Telnyx agent.",
    status: record.available === false ? "unavailable" : "available",
    type: record.agent_type ?? record.type ?? record.origin ?? "a2a",
    capabilities: [...new Set(capabilityNames)].slice(0, 8),
    visibility: record.audience === "internal" ? "internal" : "public",
    source: "a2a-discovery",
    squad: record.squad ?? "unknown",
    audience: record.audience ?? "internal",
    origin: record.origin ?? "a2a",
    url: card.url,
    available: record.available !== false,
    requiresAuthentication: Boolean(record.requires_authentication),
    updatedAt: record.updated_at ?? record.inserted_at,
  };
}

async function listMemoryBanks() {
  const liveBanks = await fetchHindsightBanks();
  if (liveBanks.length > 0) return liveBanks;
  if (credentialValue("HINDSIGHT_API_KEY")) {
    return [
      {
        id: keyScopedHindsightBankId,
        name: "Hindsight key-scoped memory",
        scope: "user",
        status: "connected",
        mission: "Hindsight infers the selected memory bank from the configured API key.",
        updatedAt: "Configured",
        observationCount: 0,
        sourceCount: 0,
      },
    ];
  }
  return [];
}

async function fetchHindsightBanks() {
  if (!credentialValue("HINDSIGHT_API_KEY")) return [];
  try {
    const response = await fetch(`${hindsightUrl()}/banks`, {
      headers: hindsightHeaders(),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.items ?? payload.banks ?? []).map((bank) => ({
      id: bank.id ?? bank.name,
      name: bank.name ?? bank.id,
      scope: bank.scope ?? "workspace",
      status: "connected",
      mission: bank.mission ?? bank.config?.mission ?? "Hindsight memory bank",
      updatedAt: bank.updated_at ?? "Live Hindsight",
      observationCount: bank.observation_count ?? bank.memories_count ?? 0,
      sourceCount: bank.source_count ?? 0,
    }));
  } catch {
    return [];
  }
}

async function recallMemory({ query, bankId } = {}) {
  if (!credentialValue("HINDSIGHT_API_KEY") || !query) return [];
  return fetchHindsightRecall(query, bankId === keyScopedHindsightBankId ? "" : bankId);
}

async function fetchHindsightRecall(query, bankId) {
  if (!credentialValue("HINDSIGHT_API_KEY") || !query) return [];
  const body = { query };
  if (bankId) body.bank_id = bankId;
  const response = await fetch(`${hindsightUrl()}/recall`, {
    method: "POST",
    headers: hindsightHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Hindsight recall returned ${response.status}: ${detail.slice(0, 300)}`);
  }
  const payload = await response.json();
  return (payload.items ?? payload.results ?? []).map((item, index) => ({
    id: item.id ?? `hindsight-${index}`,
    bankId: item.bank_id ?? bankId ?? keyScopedHindsightBankId,
    summary: item.summary ?? item.text ?? item.content ?? "",
    evidence: item.evidence ?? item.sources ?? [],
    score: item.score ?? 0,
    source: "hindsight",
  }));
}

function hindsightHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${credentialValue("HINDSIGHT_API_KEY")}`,
  };
}

function hindsightUrl() {
  return (credentialValue("HINDSIGHT_API_URL") || defaultHindsightUrl).replace(/\/$/, "");
}

function connectorReady(id) {
  const connector = connectorCatalog.find((item) => item.id === id);
  if (!connector) return false;
  return connector.envGroups.some((group) => group.every((name) => credentialConfigured(name)));
}

function connectorCredentialMode(connector) {
  const readyGroup = connector.envGroups.find((group) => group.every((name) => credentialConfigured(name)));
  if (!readyGroup) return "mocked";
  return readyGroup.some((name) => process.env[name]) ? "env" : "saved";
}

async function listConnectors() {
  const acpStatus = await getAgentControlPlaneAuthStatus();
  return connectorCatalog.map((connector) => {
    const ready = connectorReady(connector.id);
    const mode = connectorCredentialMode(connector);
    const acpConnectorStatus = acpStatus.ready ? "connected" : acpStatus.signedIn ? "signed_in" : null;
    const status = ready ? "connected" : connectorOverrides[connector.id] || "needs_access";
    return {
      id: connector.id,
      name: connector.name,
      category: connector.category,
      description: connector.description,
      requiredAccess: connector.requiredAccess,
      status: connector.id === "agent-control-plane" && acpConnectorStatus ? acpConnectorStatus : status,
      mode: connector.id === "agent-control-plane" && acpStatus.signedIn ? "okta" : mode,
    };
  });
}

async function signInAgentControlPlane() {
  const parent = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  const state = crypto.randomBytes(32).toString("base64url");
  const callbackServer = await createAuthInternalCallbackServer(state);
  const loginUrl = authInternalAuthorizationUrl(callbackServer.callbackUrl, state);
  const authWindow = new BrowserWindow({
    width: 980,
    height: 760,
    title: "Sign in to Telnyx",
    parent,
    modal: false,
    backgroundColor: "#f7f6f4",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  let resolved = false;
  const closeCallbackServer = () => {
    callbackServer.server.close(() => undefined);
  };

  return new Promise((resolve, reject) => {
    const finishWithStatus = async () => {
      if (resolved) return;
      resolved = true;
      closeCallbackServer();
      if (!authWindow.isDestroyed()) authWindow.close();
      resolve(await getAgentControlPlaneAuthStatus());
    };

    callbackServer.callbackPromise
      .then(async ({ code, error, errorDescription }) => {
        if (error) throw new Error(`Okta rejected the sign-in: ${errorDescription || error}`);
        if (!code) throw new Error("Okta sign-in finished without an authorization code.");
        const token = await exchangeAuthInternalCode(code);
        const tar2 = await getAuthInternalTar2(token.access_token);
        await saveSecureCredential("TELNYX_AUTH_REV2", tar2);
        if (token.id) await saveSecureCredential("TELNYX_AUTH_USER_ID", token.id);
        if (token.name) await saveSecureCredential("TELNYX_AUTH_USER_NAME", token.name);
        await finishWithStatus();
      })
      .catch((error) => {
        if (!resolved) {
          resolved = true;
          closeCallbackServer();
          if (!authWindow.isDestroyed()) authWindow.close();
          reject(error);
        }
      });

    authWindow.on("closed", async () => {
      if (!resolved) {
        resolved = true;
        closeCallbackServer();
        resolve(await getAgentControlPlaneAuthStatus());
      }
    });

    authWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(linkOktaSignInHtml(loginUrl))}`).catch((error) => {
      if (!resolved) {
        resolved = true;
        closeCallbackServer();
        if (!authWindow.isDestroyed()) authWindow.close();
        reject(error);
      }
    });
  });
}

function linkOktaSignInHtml(loginUrl) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in to Telnyx Link</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #000000;
      --panel: #191817;
      --panel-soft: #201f1d;
      --border: #34312e;
      --muted: #a49e97;
      --text: #f2efea;
      --accent: #00E3AA;
      --telnyx: #00E3AA;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      display: grid;
      grid-template-rows: 64px minmax(0, 1fr);
      background:
        radial-gradient(circle at 50% 30%, rgba(0, 227, 170, 0.10), transparent 32%),
        linear-gradient(180deg, #151413 0%, var(--bg) 100%);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      border-bottom: 1px solid var(--border);
      background: rgba(17, 16, 15, 0.88);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 760;
      letter-spacing: 0;
    }
    .logo {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: var(--accent);
      color: #141410;
      font-weight: 900;
    }
    .relay {
      color: var(--muted);
      font-size: 13px;
    }
    main {
      display: grid;
      place-items: center;
      min-height: 0;
      padding: 36px;
    }
    .card {
      width: min(520px, 100%);
      padding: 34px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: linear-gradient(180deg, var(--panel-soft), var(--panel));
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
      text-align: center;
    }
    .identity {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 26px;
      color: var(--muted);
      font-weight: 750;
    }
    .identity strong { color: var(--text); }
    .identity .plus { color: #6e6861; }
    h1 {
      margin: 0 0 10px;
      font-size: 28px;
      line-height: 1.1;
      letter-spacing: 0;
    }
    p {
      max-width: 420px;
      margin: 0 auto;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.45;
    }
    a.button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 52px;
      margin-top: 28px;
      border-radius: 8px;
      background: var(--accent);
      color: #171712;
      text-decoration: none;
      font-size: 16px;
      font-weight: 820;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.22) inset;
    }
    a.button:focus {
      outline: 2px solid rgba(0, 227, 170, 0.45);
      outline-offset: 3px;
    }
    .note {
      margin-top: 20px;
      color: #7f7972;
      font-size: 13px;
    }
    .telnyx { color: var(--telnyx); }
  </style>
</head>
<body>
  <header>
    <div class="brand"><span class="logo">TL</span><span>Telnyx Link</span></div>
    <div class="relay">Telnyx internal auth relay</div>
  </header>
  <main>
    <section class="card" aria-labelledby="signin-title">
      <div class="identity"><strong>Link</strong><span class="plus">+</span><span class="telnyx">telnyx</span></div>
      <h1 id="signin-title">Sign in to Telnyx Link</h1>
      <p>Use your Telnyx Okta account to connect Link to internal agents, memory, and company tools.</p>
      <a class="button" href="${escapeHtml(loginUrl)}">Sign in with Okta</a>
      <div class="note">Link opens Okta through the Telnyx internal auth relay and stores the resulting Telnyx session token securely.</div>
    </section>
  </main>
</body>
</html>`;
}

function createAuthInternalCallbackServer(expectedState) {
  let resolveCallback;
  let rejectCallback;
  const callbackPromise = new Promise((resolve, reject) => {
    resolveCallback = resolve;
    rejectCallback = reject;
  });

  const server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url || "/", "http://localhost");
      if (url.pathname !== "/auth/callback") {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Not found");
        return;
      }

      const returnedState = url.searchParams.get("state");
      if (!returnedState || returnedState !== expectedState) {
        response.writeHead(400, { "Content-Type": "text/html" });
        response.end(authCallbackHtml("Sign-in failed", "Invalid state returned by auth-internal."));
        rejectCallback(new Error("Invalid state returned by auth-internal."));
        return;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(authCallbackHtml("Signed in", "You can close this window and return to Telnyx Link."));
      resolveCallback({
        code: url.searchParams.get("code") || "",
        error: url.searchParams.get("error") || "",
        errorDescription: url.searchParams.get("error_description") || "",
      });
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/html" });
      response.end(authCallbackHtml("Sign-in failed", "Telnyx Link could not complete the local callback."));
      rejectCallback(error);
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "localhost", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => undefined);
        reject(new Error("Could not allocate a local callback port for Okta sign-in."));
        return;
      }
      resolve({
        server,
        callbackUrl: `http://localhost:${address.port}/auth/callback`,
        callbackPromise,
      });
    });
  });
}

function authCallbackHtml(title, message) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; --bg: #000; --panel: #191817; --border: #34312e; --text: #f2efea; --muted: #a49e97; --accent: #00E3AA; }
    html, body { height: 100%; }
    body { margin: 0; display: grid; place-items: center; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(440px, calc(100vw - 48px)); padding: 30px; border: 1px solid var(--border); border-radius: 8px; background: var(--panel); text-align: center; }
    .mark { width: 42px; height: 42px; margin: 0 auto 18px; border-radius: 8px; display: grid; place-items: center; background: var(--accent); color: #151410; font-weight: 900; }
    h1 { margin: 0 0 10px; font-size: 24px; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); line-height: 1.45; }
  </style>
</head>
<body>
  <main>
    <div class="mark">TL</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </main>
</body>
</html>`;
}

function authInternalAuthorizationUrl(callbackUrl, state) {
  const url = new URL(`${authInternalUrl()}/rev_a/authenticate`);
  url.searchParams.set("callback_uri", callbackUrl);
  url.searchParams.set("state", state);
  return url.toString();
}

async function exchangeAuthInternalCode(code) {
  const url = new URL(`${authInternalUrl()}/rev_a/token`);
  url.searchParams.set("code", code);
  url.searchParams.set("source", "default");

  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`auth-internal token exchange failed with ${response.status}: ${detail.slice(0, 300)}`);
  }

  const payload = await response.json();
  if (!payload?.access_token) {
    throw new Error("auth-internal token exchange did not return an access token.");
  }

  return {
    access_token: payload.access_token,
    id: typeof payload.id === "string" ? payload.id : "",
    name: typeof payload.name === "string" ? payload.name : "",
  };
}

async function getAuthInternalTar2(accessToken) {
  const response = await fetch(`${authInternalUrl()}/rev_a/edge_auth_internal/x`, {
    method: "HEAD",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`auth-internal TAR2 exchange failed with ${response.status}.`);
  }

  const tar2 = response.headers.get("Telnyx-Auth-Rev2");
  if (!tar2) throw new Error("auth-internal did not return a Telnyx-Auth-Rev2 token.");
  return tar2;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getAgentControlPlaneAuthStatus() {
  const baseUrl = agentControlPlaneUrl();
  const cookies = await agentControlPlaneCookies();
  const authCookies = cookies.filter((cookie) => cookie.name !== "oauth_state");
  const actor = process.env.TELNYX_ACTOR || "";
  const onBehalfOf = process.env.TELNYX_ON_BEHALF_OF || "";
  const userId = credentialValue("TELNYX_AUTH_USER_ID");
  const userName = credentialValue("TELNYX_AUTH_USER_NAME");
  const rev2Configured = credentialConfigured("TELNYX_AUTH_REV2");
  const actorConfigured = Boolean(actor);
  const onBehalfOfConfigured = Boolean(onBehalfOf);
  const signedIn = Boolean(rev2Configured || authCookies.length > 0);
  const authMode = rev2Configured ? "rev2" : "okta";
  const ready = Boolean(signedIn || rev2Configured);

  return {
    baseUrl,
    authMode,
    signedIn,
    ready,
    cookieCount: authCookies.length,
    actorConfigured,
    onBehalfOfConfigured,
    actor: actor || undefined,
    userId: userId || undefined,
    userName: userName || undefined,
    onBehalfOf: onBehalfOf || undefined,
    rev2Configured,
    message: ready
      ? onBehalfOfConfigured
        ? "Agent Control Plane is ready with an explicit squad context."
        : "Agent Control Plane is ready. Link will use the Okta session unless ACP requires a squad context."
      : "Sign in with Okta to create an Agent Control Plane session.",
  };
}

async function signOutAgentControlPlane() {
  const cookies = await agentControlPlaneCookies();
  const baseUrl = agentControlPlaneUrl();
  await Promise.all(
    cookies.map((cookie) => {
      const protocol = cookie.secure ? "https://" : "http://";
      const domain = cookie.domain?.replace(/^\./, "") || new URL(baseUrl).hostname;
      const url = `${protocol}${domain}${cookie.path || "/"}`;
      return session.defaultSession.cookies.remove(url, cookie.name).catch(() => undefined);
    }),
  );
  if (storedCredentials.TELNYX_AUTH_REV2) {
    delete storedCredentials.TELNYX_AUTH_REV2;
  }
  delete storedCredentials.TELNYX_AUTH_USER_ID;
  delete storedCredentials.TELNYX_AUTH_USER_NAME;
  await saveStoredCredentials();
  return getAgentControlPlaneAuthStatus();
}

async function listHostedAgents() {
  const status = await getAgentControlPlaneAuthStatus();
  if (!status.ready) {
    throw new Error("Sign in with Okta before listing hosted agents.");
  }

  const response = await fetch(`${status.baseUrl}/api/agents?page=1&page_size=50`, {
    headers: await agentControlPlaneHeaders(),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Agent Control Plane returned ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload = await response.json();
  return (payload.items ?? []).map((agent) => ({
    id: agent.id,
    name: agent.name,
    displayName: agent.display_name ?? agent.name,
    description: agent.description ?? "",
    status: agent.status,
    type: agent.agent_type,
    capabilities: agent.capabilities ?? [],
  }));
}

async function agentControlPlaneHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (process.env.TELNYX_ACTOR) headers["X-Actor"] = process.env.TELNYX_ACTOR;
  if (process.env.TELNYX_ON_BEHALF_OF) headers["X-On-Behalf-Of"] = process.env.TELNYX_ON_BEHALF_OF;
  const rev2 = credentialValue("TELNYX_AUTH_REV2");
  if (rev2) headers["telnyx-auth-rev2"] = rev2;

  const cookies = await agentControlPlaneCookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  if (cookieHeader) headers.Cookie = cookieHeader;

  return headers;
}

async function agentControlPlaneCookies() {
  return session.defaultSession.cookies.get({ url: agentControlPlaneUrl() });
}

function agentControlPlaneUrl() {
  return (process.env.AGENT_CONTROL_PLANE_URL || defaultAgentControlPlaneUrl).replace(/\/$/, "");
}

function a2aDiscoveryUrl() {
  return (process.env.A2A_DISCOVERY_URL || defaultA2aDiscoveryUrl).replace(/\/$/, "");
}

function authInternalUrl() {
  return (credentialValue("AUTH_INTERNAL_URL") || defaultAuthInternalUrl).replace(/\/$/, "");
}

async function listCredentials() {
  return credentialDefinitions.map((definition) => ({
    ...definition,
    fields: definition.fields.map((name) => ({
      name,
      configured: credentialConfigured(name),
      source: process.env[name] ? "env" : storedCredentials[name] ? "saved" : "missing",
      updatedAt: storedCredentials[name]?.updatedAt,
    })),
  }));
}

async function saveCredential(input = {}) {
  const name = String(input.name || "");
  const value = String(input.value || "");
  const allowedNames = new Set(credentialDefinitions.flatMap((definition) => definition.fields));
  if (!allowedNames.has(name)) throw new Error(`Unsupported credential field: ${name}`);
  if (!value.trim()) throw new Error(`Enter a value for ${name}.`);
  await saveSecureCredential(name, value);
  return listCredentials();
}

async function saveSecureCredential(name, value) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error("Secure credential storage is not available on this Mac session.");

  storedCredentials[name] = {
    encrypted: safeStorage.encryptString(value).toString("base64"),
    updatedAt: new Date().toISOString(),
  };
  await saveStoredCredentials();
}

function listOnboarding() {
  return onboardingState;
}

async function updateOnboarding(input = {}) {
  onboardingState = normalizeOnboardingState({
    ...onboardingState,
    ...(typeof input.dismissed === "boolean" ? { dismissed: input.dismissed } : {}),
    ...(typeof input.completed === "boolean" ? { completed: input.completed } : {}),
    ...(Array.isArray(input.completedStepIds) ? { completedStepIds: input.completedStepIds } : {}),
    updatedAt: new Date().toISOString(),
  });
  await saveDesktopState();
  return onboardingState;
}

function normalizeOnboardingState(input = {}) {
  return {
    dismissed: Boolean(input.dismissed),
    completed: Boolean(input.completed),
    completedStepIds: [...new Set(Array.isArray(input.completedStepIds) ? input.completedStepIds.filter(Boolean) : [])],
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

async function loadStoredCredentials() {
  try {
    const saved = JSON.parse(await fs.readFile(credentialsPath(), "utf8"));
    storedCredentials = saved && typeof saved === "object" ? saved : {};
  } catch {
    storedCredentials = {};
  }
}

async function saveStoredCredentials() {
  await fs.mkdir(app.getPath("userData"), { recursive: true });
  await fs.writeFile(credentialsPath(), JSON.stringify(storedCredentials, null, 2));
}

function credentialValue(name) {
  if (process.env[name]) return process.env[name];
  const record = storedCredentials[name];
  if (!record?.encrypted) return "";
  try {
    return safeStorage.decryptString(Buffer.from(record.encrypted, "base64"));
  } catch {
    return "";
  }
}

function credentialConfigured(name) {
  return Boolean(process.env[name] || storedCredentials[name]?.encrypted);
}

async function loadDesktopState() {
  try {
    const saved = JSON.parse(await fs.readFile(statePath(), "utf8"));
    activeWork = Array.isArray(saved.activeWork) && saved.activeWork.length > 0 ? saved.activeWork : seedActiveWork();
    automations = Array.isArray(saved.automations) && saved.automations.length > 0 ? saved.automations : seedAutomations();
    connectorOverrides = saved.connectorOverrides && typeof saved.connectorOverrides === "object" ? saved.connectorOverrides : {};
    changeRequests = Array.isArray(saved.changeRequests) && saved.changeRequests.length > 0 ? saved.changeRequests : seedChangeRequests();
    chatSessions = Array.isArray(saved.chatSessions) && saved.chatSessions.length > 0 ? saved.chatSessions : seedChatSessions();
    memoryBanks = Array.isArray(saved.memoryBanks) && saved.memoryBanks.length > 0 ? saved.memoryBanks : seedMemoryBanks();
    dojoState = saved.dojoState && typeof saved.dojoState === "object" ? saved.dojoState : seedDojoState();
    workboardCards = Array.isArray(saved.workboardCards) && saved.workboardCards.length > 0 ? saved.workboardCards : seedWorkboardCards();
    workspaces = Array.isArray(saved.workspaces) && saved.workspaces.length > 0 ? saved.workspaces : seedWorkspaces();
    onboardingState = saved.onboardingState && typeof saved.onboardingState === "object" ? normalizeOnboardingState(saved.onboardingState) : seedOnboardingState();
    if (saved.version !== stateVersion) await saveDesktopState();
  } catch {
    activeWork = seedActiveWork();
    automations = seedAutomations();
    connectorOverrides = {};
    changeRequests = seedChangeRequests();
    chatSessions = seedChatSessions();
    memoryBanks = seedMemoryBanks();
    dojoState = seedDojoState();
    workboardCards = seedWorkboardCards();
    workspaces = seedWorkspaces();
    onboardingState = seedOnboardingState();
    await saveDesktopState();
  }
}

async function saveDesktopState() {
  const payload = {
    version: stateVersion,
    updatedAt: new Date().toISOString(),
    activeWork,
    automations,
    connectorOverrides,
    workspaces,
    chatSessions,
    changeRequests,
    memoryBanks,
    dojoState,
    workboardCards,
    onboardingState,
  };
  await fs.mkdir(path.dirname(statePath()), { recursive: true });
  await fs.writeFile(statePath(), JSON.stringify(payload, null, 2));
}

function statePath() {
  return path.join(app.getPath("userData"), "link-desktop-state.json");
}

function credentialsPath() {
  return path.join(app.getPath("userData"), "link-desktop-credentials.v1.json");
}

function seedActiveWork() {
  return [
    createActiveWork({
      title: "Acme SMS delivery response",
      subtitle: "Shared-channel draft - Pending review",
      prompt: "Draft a customer-safe update for the Acme SMS delivery escalation.",
      requestedAction: "post update to shared customer Slack channel",
      threadContext:
        "Internal note: see #incident-war-room. Raw log trace id abc123. Customer impact appears limited to delayed SMS delivery for a subset of US traffic.",
    }),
    {
      id: "work-account-briefing",
      title: "Acme account briefing",
      subtitle: "Account Briefing - Ready",
      status: "ready",
      createdAt: new Date().toISOString(),
      summary: "Prepared a mocked account briefing with CRM, Slack, workspace, and Telnyx account context.",
      details: {
        customerSafeDraft:
          "Internal account briefing is ready. It includes account snapshot, recent activity, risks, open questions, and recommended next actions.",
        internalRationale: "Generated from mocked Salesforce, Slack, Google Workspace, and Telnyx account context.",
        sourcesUsed: ["salesforce.account_lookup", "slack.search", "google_workspace.search", "telnyx.account_lookup"],
        approval: { approvalStatus: "not_required", approvalRequired: false },
      },
    },
  ];
}

function seedOnboardingState() {
  return {
    dismissed: false,
    completed: false,
    completedStepIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function seedWorkboardCards() {
  return [
    createSeedWorkboardCard({
      id: "card-agent-directory",
      title: "Verify A2A agent directory coverage",
      body: "Confirm users can search and filter the internal agent list by name, capability, and squad.",
      status: "ready",
      priority: "high",
      assignee: "openclaw:ai-platform",
      labels: ["agents", "a2a"],
      proof: ["A2A discovery endpoint is wired with local search and squad filtering."],
    }),
    createSeedWorkboardCard({
      id: "card-hermes-adapter",
      title: "Smoke test Hermes Kanban adapter",
      body: "When Hermes is installed, verify list/create/show/dispatch with JSON output against a local board.",
      status: "todo",
      priority: "normal",
      assignee: "hermes:researcher",
      labels: ["hermes", "kanban"],
    }),
    createSeedWorkboardCard({
      id: "card-phone-copy",
      title: "Review Phone provisioning warnings",
      body: "Ensure Telnyx number purchase and Call Control resource creation are explicit before live provisioning.",
      status: "review",
      priority: "normal",
      assignee: "openclaw:ops-review",
      labels: ["phone", "telnyx"],
      artifacts: ["apps/link-desktop/src/renderer/App.tsx"],
    }),
  ];
}

function createSeedWorkboardCard(input) {
  const timestamp = new Date().toISOString();
  return {
    id: input.id,
    title: input.title,
    body: input.body,
    status: input.status,
    priority: input.priority,
    labels: input.labels || [],
    assignee: input.assignee,
    provider: "local",
    boardId: "local",
    proof: input.proof || [],
    artifacts: input.artifacts || [],
    comments: [],
    diagnostics: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function seedAutomations() {
  return [
    {
      id: "automation-doc-maintenance",
      name: "Doc Maintenance",
      status: "active",
      schedule: "Every day at 10:00 AM",
      channel: "#telnyx-link-eng",
      tools: ["slack.post_message", "guru.search"],
      skills: ["Incident Thread Summarizer", "Weekly Team Update"],
      instructions:
        "Maintain troubleshooting docs by cross-referencing recent support patterns, internal knowledge, and open follow-up items.",
      runHistory: [
        { time: "Today 03:05 PM", duration: "9m 52s", status: "Ran after restart", tone: "success" },
        { time: "Today 09:59 AM", duration: "5m 58s", status: "Ran on schedule", tone: "success" },
        { time: "Yesterday 07:09 PM", duration: "49m 55s", status: "Ran after restart", tone: "error" },
        { time: "Yesterday 09:59 AM", duration: "6m 42s", status: "Ran on schedule", tone: "success" },
      ],
    },
    {
      id: "automation-customer-love",
      name: "Daily Customer Love Analyst",
      status: "paused",
      schedule: "Every weekday at 08:30 AM",
      channel: "#customer-success",
      tools: ["slack.search", "salesforce.account_lookup"],
      skills: ["Customer Escalation Summary"],
      instructions: "Summarize positive customer signals and open follow-up work for the customer success team.",
      runHistory: [{ time: "Apr 8 08:30 AM", duration: "4m 20s", status: "Ran on schedule", tone: "success" }],
    },
  ];
}

function seedWorkspaces() {
  const timestamp = new Date().toISOString();
  return [
    {
      id: "workspace-acme",
      name: "Acme Messaging Escalation",
      description: "Customer support workspace for SMS delivery context, drafts, and approvals.",
      status: "review",
      updatedAt: timestamp,
      tabs: [
        createWorkspaceTab("tab-acme-chat", "Acme account briefing", "chat", "open"),
        createWorkspaceTab("tab-acme-draft", "Customer-safe update", "approval", "pending"),
        createWorkspaceTab("tab-acme-logs", "Messaging logs", "artifact", "pinned"),
      ],
      activeWorkIds: ["work-account-briefing"],
      automationIds: ["automation-doc-maintenance"],
      fileCount: 4,
      memoryBankId: "bank-user",
    },
    {
      id: "workspace-link",
      name: "Link Product Improvements",
      description: "Requests from nontechnical users that become admin-reviewed Link changes.",
      status: "active",
      updatedAt: timestamp,
      tabs: [
        createWorkspaceTab("tab-link-chat", "Based on everything you can tell me", "chat", "open"),
        createWorkspaceTab("tab-link-pr", "Pending improvement requests", "approval", "pending"),
      ],
      activeWorkIds: ["change-seed-1"],
      automationIds: [],
      fileCount: 2,
      memoryBankId: "bank-link",
    },
  ];
}

function seedChatSessions() {
  const timestamp = new Date().toISOString();
  return [
    {
      id: "chat-seed-1",
      title: "Based on everything you can tell me",
      workspaceId: "workspace-link",
      model: "mock-link-runtime",
      status: "active",
      updatedAt: timestamp,
      messages: [
        createMessage("system", "Telnyx Link can use workspace context, tools, skills, and Hindsight recall when connected."),
        createMessage("assistant", "Ask about customers, internal docs, agents, skills, or a Link improvement you want admins to review."),
      ],
    },
  ];
}

function seedChangeRequests() {
  const timestamp = new Date().toISOString();
  return [
    {
      id: "change-seed-1",
      title: "Improve SMS escalation workspace",
      summary: "Add a prefilled workflow for account context, delivery logs, and customer-safe Slack drafts.",
      requestedChange: "Create a Link skill and workspace template for SMS delivery escalations.",
      status: "pending_review",
      createdAt: timestamp,
      updatedAt: timestamp,
      workspaceId: "workspace-link",
    },
  ];
}

function seedMemoryBanks() {
  const status = credentialConfigured("HINDSIGHT_API_KEY") ? "connected" : "mocked";
  return [
    {
      id: "bank-user",
      name: "Pete - Link working memory",
      scope: "user",
      status,
      mission: "Remember personal Link workflows, preferred review style, and recurring customer support patterns.",
      updatedAt: "Today 09:12 AM",
      observationCount: 128,
      sourceCount: 5,
    },
    {
      id: "bank-link",
      name: "Link product memory",
      scope: "workspace",
      status,
      mission: "Track Link product decisions, open questions, and admin-reviewed improvement requests.",
      updatedAt: "Yesterday 05:48 PM",
      observationCount: 74,
      sourceCount: 4,
    },
  ];
}

function seedDojoState() {
  return {
    profile: {
      id: "dojo-profile-link",
      name: "Pete's Experto Crede",
      rank: "Warrior",
      masteredSkills: 9,
      nextRankAt: 13,
      focus: "Train personal and squad bots on Telnyx support workflows.",
    },
    kits: [
      createKit("essentials", "Essentials", "Core Link workflows and safety boundaries.", 5, 6, "blue"),
      createKit("messaging", "Messaging", "SMS delivery, campaigns, and customer escalations.", 3, 5, "orange"),
      createKit("account-management", "Account Management", "Account context, renewal prep, and internal handoffs.", 2, 4, "teal"),
      createKit("product", "Product", "Docs, feature requests, and product feedback loops.", 1, 4, "purple"),
      createKit("data", "Data", "Metrics, evidence, and warehouse-safe previews.", 1, 3, "green"),
      createKit("cx", "Customer Experience", "Shared-channel drafts and customer-safe summaries.", 2, 4, "pink"),
    ],
    sessions: [
      {
        id: "training-personal",
        title: "Train my bot to draft like me",
        target: "personal_bot",
        status: "ready",
        updatedAt: "Today 08:40 AM",
        inputs: ["recent chats", "approved drafts", "preferred tone"],
      },
      {
        id: "training-squad",
        title: "Learn Messaging squad escalation style",
        target: "squad_bot",
        status: "running",
        updatedAt: "Today 09:20 AM",
        inputs: ["squad docs", "incident reviews", "support playbooks"],
      },
    ],
  };
}

function seedAgents(source) {
  return [
    {
      id: "agent-customer-escalation",
      name: "customer-escalation-agent",
      displayName: "Customer Escalation Agent",
      description: "Public hosted agent for customer escalation triage.",
      status: "active",
      type: "hermes",
      capabilities: ["support", "messaging", "customer-safe-drafts"],
      visibility: "public",
      source,
    },
    {
      id: "agent-link-assistant",
      name: "link-assistant",
      displayName: "Link Assistant",
      description: "Slack-connected Link assistant for #telnyx-link-eng.",
      status: "active",
      type: "slack",
      capabilities: ["docs", "feature-requests", "handoffs"],
      visibility: "slack",
      source,
      slackChannel: "#telnyx-link-eng",
    },
  ];
}

function createWorkspaceTab(id, title, kind, status) {
  return { id, title, kind, status, updatedAt: new Date().toISOString() };
}

function addWorkspaceTab(workspaceId, tab) {
  workspaces = workspaces.map((workspace) => {
    if (workspace.id !== workspaceId) return workspace;
    const tabs = [tab, ...workspace.tabs.filter((item) => item.id !== tab.id)].slice(0, 8);
    return { ...workspace, tabs, updatedAt: tab.updatedAt };
  });
}

function createMessage(role, content, artifacts = []) {
  return {
    id: `message-${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...(artifacts.length ? { artifacts } : {}),
  };
}

function createChatArtifacts(prompt) {
  const text = String(prompt ?? "");
  const wantsPdf = /\bpdf\b/i.test(text);
  const wantsMarkdown = /\.md\b|\bmarkdown\b|\bmd file\b/i.test(text);
  if (!wantsPdf && !wantsMarkdown) return [];
  const createdAt = new Date().toISOString();
  const title = text.replace(/\s+/g, " ").trim().slice(0, 48) || "Link generated document";
  const content = `# ${title}\n\nGenerated from the active Link chat.\n\n## Request\n\n${text.trim() || "No prompt provided."}\n\n## Notes\n\n- Review content before sharing externally.\n- Attach sources when live connectors are available.`;
  return [
    {
      id: `artifact-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      kind: wantsPdf ? "pdf" : "markdown",
      filename: wantsPdf ? "link-generated-document.pdf" : "link-generated-document.md",
      content,
      createdAt,
    },
  ];
}

function createKit(id, name, description, mastered, total, tone) {
  return { id, name, description, mastered, total, tone };
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
