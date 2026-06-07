export type ViewId =
  | "workspaces"
  | "onboarding"
  | "widgets"
  | "explorer"
  | "chats"
  | "agents"
  | "workboard"
  | "phone"
  | "memory"
  | "dojo"
  | "settings";

export type Decision = "approve" | "dismiss";
export type ConnectionStatus = "connected" | "needs_access" | "requested" | "signed_in";
export type ConnectionMode = "env" | "saved" | "mocked" | "okta" | "live";

export interface SkillMetadata {
  name: string;
  description: string;
  owner: string;
  team: string;
  riskLevel: "low" | "medium" | "high";
  toolsRequired: string[];
  customerSafe: boolean;
  approvalRequired: boolean;
  source?: "link" | "telnyx";
  product?: string;
  language?: string;
}

export interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  visibility: "internal_only" | "customer_safe";
  capability: "read" | "write" | "read_write";
  riskLevel: "low" | "medium" | "high";
  approvalRequired: boolean;
  outputCanBeShownExternally: boolean;
}

export interface ActiveWorkItem {
  id: string;
  title: string;
  subtitle: string;
  status: "pending" | "ready" | "approved" | "dismissed";
  createdAt: string;
  summary: string;
  details: {
    customerSafeDraft: string;
    internalRationale: string;
    sourcesUsed: string[];
    formatted?: string;
    approval: {
      approvalRequired: boolean;
      approvalStatus: string;
      reason?: string;
    };
  };
}

export interface AutomationItem {
  id: string;
  name: string;
  status: "active" | "paused";
  schedule: string;
  channel: string;
  tools: string[];
  skills: string[];
  instructions: string;
  runHistory: { time: string; duration: string; status: string; tone: "success" | "error" | "warning" }[];
}

export interface WorkspaceTab {
  id: string;
  title: string;
  kind: "chat" | "artifact" | "automation" | "approval" | "explorer";
  status: "open" | "pinned" | "pending" | "complete";
  updatedAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description: string;
  status: "active" | "idle" | "review";
  updatedAt: string;
  tabs: WorkspaceTab[];
  activeWorkIds: string[];
  automationIds: string[];
  fileCount: number;
  memoryBankId?: string;
}

export interface ExplorerResult {
  id: string;
  title: string;
  source: "guru" | "google_drive" | "link_file" | "skill" | "agent" | "memory";
  type: "doc" | "file" | "skill" | "agent" | "memory";
  permission: "allowed" | "needs_access" | "mocked";
  freshness: string;
  excerpt: string;
  workspaceId?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  sources?: ExplorerResult[];
  artifacts?: ChatArtifact[];
}

export interface ChatArtifact {
  id: string;
  title: string;
  kind: "markdown" | "pdf";
  filename: string;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  workspaceId: string;
  model: string;
  status: "active" | "idle";
  updatedAt: string;
  messages: ChatMessage[];
}

export interface LinkChangeRequest {
  id: string;
  title: string;
  summary: string;
  requestedChange: string;
  status: "pending_review" | "approved" | "dismissed" | "draft_pr_created";
  createdAt: string;
  updatedAt: string;
  sourceSessionId?: string;
  workspaceId?: string;
  github?: {
    mode: "mocked" | "live";
    branch?: string;
    prUrl?: string;
    issueUrl?: string;
    note: string;
  };
}

export interface ConnectorStatus {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ConnectionStatus;
  mode: ConnectionMode;
  requiredAccess: string[];
}

export interface CredentialFieldStatus {
  name: string;
  configured: boolean;
  source: "env" | "saved" | "missing";
  updatedAt?: string;
}

export interface CredentialGroupStatus {
  id: string;
  label: string;
  help: string;
  fields: CredentialFieldStatus[];
}

export interface ConnectionSummary extends ConnectorStatus {
  tools: ToolMetadata[];
  permissions: {
    read: string;
    write: string;
    interactive: string;
  };
}

export interface AgentControlPlaneAuthStatus {
  baseUrl: string;
  authMode: "okta" | "rev2";
  signedIn: boolean;
  ready: boolean;
  cookieCount: number;
  actorConfigured: boolean;
  onBehalfOfConfigured: boolean;
  actor?: string;
  userId?: string;
  userName?: string;
  onBehalfOf?: string;
  rev2Configured: boolean;
  message: string;
}

export interface HostedAgentSummary {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: string;
  type: string;
  capabilities: string[];
}

export interface AgentSummary extends HostedAgentSummary {
  visibility: "public" | "slack" | "private" | "internal";
  source: "agent-control-plane" | "a2a-discovery" | "slack" | "mock";
  slackChannel?: string;
  slackUserId?: string;
  slackChannelId?: string;
  squad?: string;
  audience?: string;
  origin?: string;
  url?: string;
  available?: boolean;
  requiresAuthentication?: boolean;
  updatedAt?: string;
}

export interface AgentInteractionResult {
  mode: "slack" | "mocked";
  agentId: string;
  message: string;
  channelId?: string;
  ts?: string;
}

export interface PhoneNumberOption {
  phoneNumber: string;
  countryCode: string;
  locality?: string;
  region?: string;
  type?: string;
  features: string[];
  monthlyCost?: string;
  upfrontCost?: string;
}

export interface PhoneSetupPlan {
  id: string;
  phoneNumber: string;
  sipUsername: string;
  sipPassword: string;
  webhookUrl: string;
  voiceAssistant?: PhoneVoiceAssistantPlan;
  warning: string;
  purchaseReview: {
    endpoint: string;
    method: "POST";
    body: unknown;
  };
  resources: { label: string; endpoint: string; method: "POST" | "PATCH"; body: unknown }[];
  steps: string[];
}

export interface PhoneProvisionResult extends PhoneSetupPlan {
  status: "provisioned" | "needs_regulatory_requirements" | "partial";
  credentialConnectionId?: string;
  callControlApplicationId?: string;
  voiceAssistantId?: string;
  numberOrderId?: string;
  numberOrderStatus?: string;
  orderedPhoneNumberId?: string;
  raw: {
    credentialConnection?: unknown;
    callControlApplication?: unknown;
    voiceAssistant?: unknown;
    numberOrder?: unknown;
  };
}

export interface PhoneVoiceAssistantPlan {
  enabled: boolean;
  name: string;
  mode: "after_hours" | "always" | "manual";
  timezone: string;
  workHours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
  googleCalendar: {
    enabled: boolean;
    calendarId: string;
    mode: "free_busy_only" | "create_tentative_sales_calls";
    webhookUrl: string;
  };
  assistantReview: {
    endpoint: string;
    method: "POST";
    body: unknown;
  };
  callControlRouting: {
    endpoint: string;
    method: "POST";
    body: unknown;
  };
}

export interface PhoneSetupInput {
  phoneNumber: string;
  displayName: string;
  webhookUrl: string;
  voiceAssistantEnabled?: boolean;
  voiceAssistantName?: string;
  voiceAssistantMode?: PhoneVoiceAssistantPlan["mode"];
  voiceAssistantGreeting?: string;
  voiceAssistantInstructions?: string;
  voiceAssistantLanguage?: string;
  voiceAssistantVoice?: string;
  voiceAssistantTemperature?: string;
  voiceAssistantEscalationTarget?: string;
  timezone?: string;
  workHours?: PhoneVoiceAssistantPlan["workHours"];
  googleCalendarEnabled?: boolean;
  googleCalendarId?: string;
  googleCalendarWebhookUrl?: string;
  googleCalendarMode?: PhoneVoiceAssistantPlan["googleCalendar"]["mode"];
}

export type WorkboardProvider = "auto" | "hermes" | "openclaw" | "local";
export type WorkboardStatus =
  | "triage"
  | "backlog"
  | "todo"
  | "scheduled"
  | "ready"
  | "running"
  | "review"
  | "blocked"
  | "done"
  | "archived";

export interface WorkboardProviderStatus {
  id: WorkboardProvider;
  label: string;
  available: boolean;
  mode: "native" | "fallback" | "unavailable";
  message: string;
}

export interface WorkboardBoard {
  id: string;
  name: string;
  description?: string;
  provider: WorkboardProvider;
}

export interface WorkboardCard {
  id: string;
  title: string;
  body?: string;
  status: WorkboardStatus;
  priority: "low" | "normal" | "high" | "urgent" | number;
  labels: string[];
  assignee?: string;
  provider: WorkboardProvider;
  boardId: string;
  tenant?: string;
  workspace?: string;
  sourceUrl?: string;
  linkedSessionId?: string;
  linkedRunId?: string;
  linkedTaskId?: string;
  proof?: string[];
  artifacts?: string[];
  comments?: string[];
  diagnostics?: string[];
  updatedAt: string;
  createdAt: string;
  raw?: unknown;
}

export interface WorkboardSnapshot {
  provider: WorkboardProvider;
  boardId: string;
  providers: WorkboardProviderStatus[];
  boards: WorkboardBoard[];
  columns: WorkboardStatus[];
  cards: WorkboardCard[];
  assignees: string[];
  stats: { label: string; value: number | string; tone?: "success" | "warning" | "danger" | "default" }[];
  message: string;
}

export interface WorkboardCreateInput {
  provider: WorkboardProvider;
  boardId?: string;
  title: string;
  body?: string;
  assignee?: string;
  priority?: WorkboardCard["priority"];
  labels?: string[];
  status?: WorkboardStatus;
  tenant?: string;
  workspace?: string;
  sourceUrl?: string;
}

export interface WorkboardUpdateInput {
  provider: WorkboardProvider;
  boardId?: string;
  cardId: string;
  status?: WorkboardStatus;
  assignee?: string;
  comment?: string;
}

export interface MemoryBank {
  id: string;
  name: string;
  scope: "user" | "workspace" | "bot" | "squad";
  status: "connected" | "mocked" | "needs_key";
  mission: string;
  updatedAt: string;
  observationCount: number;
  sourceCount: number;
}

export interface MemoryRecallResult {
  id: string;
  bankId: string;
  summary: string;
  evidence: string[];
  score: number;
  source: "hindsight" | "mock";
}

export interface DojoProfile {
  id: string;
  name: string;
  rank: string;
  masteredSkills: number;
  nextRankAt: number;
  focus: string;
}

export interface DojoKit {
  id: string;
  name: string;
  description: string;
  mastered: number;
  total: number;
  tone: "blue" | "orange" | "teal" | "pink" | "green" | "purple";
}

export interface TrainingSession {
  id: string;
  title: string;
  target: "personal_bot" | "squad_bot";
  status: "ready" | "running" | "complete";
  updatedAt: string;
  inputs: string[];
}

export interface DojoState {
  profile: DojoProfile;
  kits: DojoKit[];
  sessions: TrainingSession[];
}

export interface OnboardingState {
  dismissed: boolean;
  completed: boolean;
  completedStepIds: string[];
  updatedAt: string;
}

export interface LinkDesktopApi {
  chat(prompt: string): Promise<{ response?: string; routedTo?: string; finalOutput?: unknown }>;
  runSkill(skillName: string): Promise<unknown>;
  listSkills(): Promise<SkillMetadata[]>;
  listTools(): Promise<ToolMetadata[]>;
  createSharedChannelDraft(input: {
    title?: string;
    userPrompt: string;
    requestedAction: string;
    threadContext: string;
  }): Promise<ActiveWorkItem>;
  listActiveWork(): Promise<ActiveWorkItem[]>;
  decideWork(id: string, decision: Decision): Promise<ActiveWorkItem>;
  listAutomations(): Promise<AutomationItem[]>;
  listConnectors(): Promise<ConnectorStatus[]>;
  listCredentials(): Promise<CredentialGroupStatus[]>;
  saveCredential(input: { name: string; value: string }): Promise<CredentialGroupStatus[]>;
  updateConnectorStatus(id: string, status: ConnectorStatus["status"]): Promise<ConnectorStatus[]>;
  listOnboarding(): Promise<OnboardingState>;
  updateOnboarding(input: Partial<Pick<OnboardingState, "dismissed" | "completed" | "completedStepIds">>): Promise<OnboardingState>;
  signInAgentControlPlane(): Promise<AgentControlPlaneAuthStatus>;
  signOutAgentControlPlane(): Promise<AgentControlPlaneAuthStatus>;
  getAgentControlPlaneAuthStatus(): Promise<AgentControlPlaneAuthStatus>;
  listHostedAgents(): Promise<HostedAgentSummary[]>;
  listWorkspaces(): Promise<WorkspaceSummary[]>;
  searchExplorer(input: { query: string; workspaceId?: string }): Promise<ExplorerResult[]>;
  listChatSessions(): Promise<ChatSession[]>;
  sendChatMessage(input: {
    sessionId?: string;
    workspaceId?: string;
    content: string;
    agentId?: string;
    agentName?: string;
    approvalMode?: string;
    modelMode?: string;
    contextScope?: string;
  }): Promise<ChatSession>;
  createChangeRequest(input: {
    title: string;
    summary: string;
    requestedChange: string;
    workspaceId?: string;
    sourceSessionId?: string;
  }): Promise<LinkChangeRequest>;
  approveChangeRequest(id: string): Promise<LinkChangeRequest>;
  dismissChangeRequest(id: string): Promise<LinkChangeRequest>;
  listChangeRequests(): Promise<LinkChangeRequest[]>;
  listAgents(): Promise<AgentSummary[]>;
  sendAgentMessage(input: { agentId: string; content: string }): Promise<AgentInteractionResult>;
  listWorkboard(input?: { provider?: WorkboardProvider; boardId?: string }): Promise<WorkboardSnapshot>;
  createWorkboardCard(input: WorkboardCreateInput): Promise<WorkboardSnapshot>;
  updateWorkboardCard(input: WorkboardUpdateInput): Promise<WorkboardSnapshot>;
  dispatchWorkboard(input: { provider: WorkboardProvider; boardId?: string }): Promise<WorkboardSnapshot>;
  searchPhoneNumbers(input: { countryCode: string; areaCode?: string; locality?: string; region?: string }): Promise<PhoneNumberOption[]>;
  previewPhoneSetup(input: PhoneSetupInput): Promise<PhoneSetupPlan>;
  provisionPhoneSystem(input: PhoneSetupInput): Promise<PhoneProvisionResult>;
  listMemoryBanks(): Promise<MemoryBank[]>;
  recallMemory(input: { query: string; bankId?: string }): Promise<MemoryRecallResult[]>;
  listDojoState(): Promise<DojoState>;
  auditEvents(): Promise<unknown[]>;
}

declare global {
  interface Window {
    linkDesktop?: LinkDesktopApi;
  }
}

const now = new Date().toISOString();

const mockSkills: SkillMetadata[] = [
  {
    name: "Account Briefing",
    description: "Create a concise account briefing from internal context.",
    owner: "GTM",
    team: "Sales",
    riskLevel: "medium",
    toolsRequired: ["salesforce.account_lookup", "slack.search", "google_workspace.search"],
    customerSafe: false,
    approvalRequired: false,
    source: "link",
  },
  {
    name: "SMS Delivery Investigation",
    description: "Investigate mocked SMS delivery issues using safe internal context.",
    owner: "Support",
    team: "Messaging",
    riskLevel: "medium",
    toolsRequired: ["telnyx.messaging_logs.lookup", "datadog.incident_lookup"],
    customerSafe: false,
    approvalRequired: false,
    source: "link",
  },
  {
    name: "telnyx-ai-assistants-python",
    description: "AI voice assistants with custom instructions, knowledge bases, and tool integrations.",
    owner: "telnyx",
    team: "AI",
    riskLevel: "low",
    toolsRequired: ["telnyx.ai_assistants"],
    customerSafe: false,
    approvalRequired: false,
    source: "telnyx",
    product: "ai-assistants",
    language: "python",
  },
  {
    name: "telnyx-messaging-curl",
    description: "Messaging API examples and operational guidance.",
    owner: "telnyx",
    team: "Messaging",
    riskLevel: "low",
    toolsRequired: ["telnyx.messaging"],
    customerSafe: false,
    approvalRequired: false,
    source: "telnyx",
    product: "messaging",
    language: "curl",
  },
];

const mockTools: ToolMetadata[] = [
  tool("slack.search", "Search mocked internal Slack messages and threads.", "slack", "read", "medium", false),
  tool("slack.post_message", "Mock a Slack post action gated by approval.", "slack", "write", "high", true, "customer_safe"),
  tool("guru.search", "Search Guru cards and verified knowledge.", "knowledge", "read", "low", false),
  tool("google_workspace.search", "Search mocked docs and meeting notes.", "workspace", "read", "medium", false),
  tool("github.repo_search", "Search mocked GitHub repositories and code references.", "code", "read", "medium", false),
  tool("github.create_draft_pr", "Create an admin-reviewed Link improvement PR.", "code", "write", "high", true),
  tool("hindsight.recall", "Recall long-term agent memory from Hindsight banks.", "memory", "read", "medium", false),
  tool("telnyx.messaging_logs.lookup", "Look up mocked messaging logs.", "telnyx_messaging", "read", "medium", false),
];

let mockWork: ActiveWorkItem[] = [
  createMockWork("work-seed-1", "Acme SMS delivery response", "Shared-channel draft - Pending review", "pending"),
  createMockWork("work-seed-2", "Acme account briefing", "Account Briefing - Ready", "ready"),
];

let mockWorkboardCards: WorkboardCard[] = [
  createMockWorkboardCard({
    id: "card-triage-agent-directory",
    title: "Tighten Agents directory squad filtering",
    body: "Verify A2A discovery fields, add missing squad labels, and capture a short proof note.",
    status: "ready",
    assignee: "openclaw:support-reviewer",
    provider: "local",
    priority: "high",
    labels: ["agents", "directory"],
    proof: ["Acceptance criteria are ready; no live agent runtime is required in preview."],
  }),
  createMockWorkboardCard({
    id: "card-hermes-kanban-preview",
    title: "Prepare Hermes Kanban adapter smoke test",
    body: "Run hermes kanban list/create/show with JSON output when Hermes is installed.",
    status: "todo",
    assignee: "hermes:researcher",
    provider: "local",
    priority: "normal",
    labels: ["hermes", "kanban"],
  }),
  createMockWorkboardCard({
    id: "card-phone-review",
    title: "Review Link Phone provisioning copy",
    body: "Check that number purchase warnings are clear before enabling real Telnyx account provisioning.",
    status: "review",
    assignee: "openclaw:ops-review",
    provider: "local",
    priority: "normal",
    labels: ["phone", "review"],
    artifacts: ["apps/link-desktop/src/renderer/App.tsx"],
  }),
];

const mockAutomations: AutomationItem[] = [
  {
    id: "automation-doc-maintenance",
    name: "Doc Maintenance",
    status: "active",
    schedule: "Every day at 10:00 AM",
    channel: "#telnyx-link-eng",
    tools: ["slack.post_message", "guru.search"],
    skills: ["Incident Thread Summarizer", "Weekly Team Update"],
    instructions: "Maintain troubleshooting docs by cross-referencing support patterns, internal knowledge, and follow-up items.",
    runHistory: [
      { time: "Today 03:05 PM", duration: "9m 52s", status: "Ran after restart", tone: "success" },
      { time: "Today 09:59 AM", duration: "5m 58s", status: "Ran on schedule", tone: "success" },
      { time: "Yesterday 07:09 PM", duration: "49m 55s", status: "Ran after restart", tone: "error" },
    ],
  },
];

let mockChangeRequests: LinkChangeRequest[] = [
  {
    id: "change-seed-1",
    title: "Improve SMS escalation workspace",
    summary: "Add a prefilled workflow for account context, delivery logs, and customer-safe Slack drafts.",
    requestedChange: "Create a Link skill and workspace template for SMS delivery escalations.",
    status: "pending_review",
    createdAt: now,
    updatedAt: now,
    workspaceId: "workspace-acme",
  },
];

const mockConnectors: ConnectorStatus[] = [
  connector("agent-control-plane", "Agent Control Plane", "Hosted agents", "List and route to hosted Hermes/OpenClaw agents through Link.", ["Okta SSO", "optional TELNYX_ACTOR", "optional TELNYX_ON_BEHALF_OF"], "needs_access", "mocked"),
  connector("litellm", "Telnyx LiteLLM", "Model runtime", "Chat with Telnyx-hosted models from Link.", ["LITELLM_API_KEY", "LITELLM_MODEL"], "needs_access", "mocked"),
  connector("hindsight", "Hindsight", "Memory", "Recall and inspect long-term agent memory banks.", ["Per-user bank-scoped HINDSIGHT_API_KEY"], "needs_access", "mocked"),
  connector("guru", "Guru", "Knowledge", "Search verified cards and knowledge-base context.", ["GURU_USER_EMAIL", "GURU_USER_TOKEN"], "needs_access", "mocked"),
  connector("google-drive", "Google Drive", "Knowledge", "Search docs, Drive files, and meeting artifacts.", ["Google Drive OAuth"], "needs_access", "mocked"),
  connector("github", "GitHub", "Code", "Read repositories and create admin-approved draft PRs.", ["GH_TOKEN or GitHub App"], "connected", "env"),
  connector("slack", "Slack", "Communications", "Search threads and draft shared-channel replies.", ["Slack OAuth or SLACK_BOT_TOKEN"], "needs_access", "mocked"),
  connector("telnyx", "Telnyx", "Internal systems", "Use account, messaging, network, and billing context.", ["TELNYX_API_KEY"], "needs_access", "mocked"),
  connector("linear", "Linear", "Work tracking", "Search projects, issues, and planning context.", ["LINEAR_API_KEY"], "needs_access", "mocked"),
];

let mockCredentials: CredentialGroupStatus[] = [
  credentials("telnyx-okta", "Telnyx Okta", "Okta sign-in uses auth-internal. TELNYX_AUTH_REV2 is created by sign-in and stored securely.", ["AUTH_INTERNAL_URL", "TELNYX_AUTH_REV2"]),
  credentials("litellm", "Telnyx LiteLLM", "Per-user key from AI-swe-Agent in Slack channel D0995UB1PLY.", ["LITELLM_API_KEY", "LITELLM_MODEL"]),
  credentials("hindsight", "Hindsight", "Per-user, bank-scoped key from the Hindsight bank API Keys tab. Hindsight infers the bank from this key.", ["HINDSIGHT_API_KEY"]),
  credentials("guru", "Guru", "Guru user auth from Apps & Integrations > API Access.", ["GURU_USER_EMAIL", "GURU_USER_TOKEN"]),
  credentials("linear", "Linear", "Linear API key for issue and project lookup.", ["LINEAR_API_KEY"]),
  credentials("telnyx", "Telnyx", "Telnyx API key for account, phone, messaging, and network operations.", ["TELNYX_API_KEY"]),
  credentials("github", "GitHub", "Fine-grained GitHub token for approved draft PR creation.", ["GH_TOKEN"]),
  credentials("slack", "Slack", "Slack user token discovers and DMs bot users; bot token can post where the app has access.", ["SLACK_USER_TOKEN", "SLACK_BOT_TOKEN"]),
  credentials("google-drive", "Google Drive", "Temporary Drive token until Google OAuth is implemented.", ["GOOGLE_DRIVE_ACCESS_TOKEN"]),
];

let mockOnboarding: OnboardingState = {
  dismissed: false,
  completed: false,
  completedStepIds: [],
  updatedAt: now,
};

const mockWorkspaces: WorkspaceSummary[] = [
  {
    id: "workspace-acme",
    name: "Acme Messaging Escalation",
    description: "Customer support workspace for SMS delivery context, drafts, and approvals.",
    status: "review",
    updatedAt: now,
    tabs: [
      tab("tab-acme-chat", "Acme account briefing", "chat", "open"),
      tab("tab-acme-draft", "Customer-safe update", "approval", "pending"),
      tab("tab-acme-logs", "Messaging logs", "artifact", "pinned"),
    ],
    activeWorkIds: ["work-seed-1", "change-seed-1"],
    automationIds: ["automation-doc-maintenance"],
    fileCount: 4,
    memoryBankId: "bank-user",
  },
  {
    id: "workspace-link",
    name: "Link Product Improvements",
    description: "Requests from nontechnical users that become admin-reviewed Link changes.",
    status: "active",
    updatedAt: now,
    tabs: [
      tab("tab-link-chat", "Based on everything you can tell me", "chat", "open"),
      tab("tab-link-pr", "Pending improvement requests", "approval", "pending"),
    ],
    activeWorkIds: ["change-seed-1"],
    automationIds: [],
    fileCount: 2,
    memoryBankId: "bank-link",
  },
];

let mockChatSessions: ChatSession[] = [
  {
    id: "chat-seed-1",
    title: "Based on everything you can tell me",
    workspaceId: "workspace-link",
    model: "mock-link-runtime",
    status: "active",
    updatedAt: now,
    messages: [
      message("system", "Telnyx Link can use workspace context, tools, skills, and Hindsight recall when connected."),
      message("assistant", "Ask about customers, internal docs, agents, skills, or a Link improvement you want admins to review."),
    ],
  },
];

const mockMemoryBanks: MemoryBank[] = [
  {
    id: "bank-user",
    name: "Pete - Link working memory",
    scope: "user",
    status: "mocked",
    mission: "Remember personal Link workflows, preferred review style, and recurring customer support patterns.",
    updatedAt: "Today 09:12 AM",
    observationCount: 128,
    sourceCount: 5,
  },
  {
    id: "bank-link",
    name: "Link product memory",
    scope: "workspace",
    status: "mocked",
    mission: "Track Link product decisions, open questions, and admin-reviewed improvement requests.",
    updatedAt: "Yesterday 05:48 PM",
    observationCount: 74,
    sourceCount: 4,
  },
];

const mockDojoState: DojoState = {
  profile: {
    id: "dojo-profile-link",
    name: "Pete's Experto",
    rank: "Warrior",
    masteredSkills: 9,
    nextRankAt: 13,
    focus: "Train personal and squad bots on Telnyx support workflows.",
  },
  kits: [
    kit("essentials", "Essentials", "Core Link workflows and safety boundaries.", 5, 6, "blue"),
    kit("messaging", "Messaging", "SMS delivery, campaigns, and customer escalations.", 3, 5, "orange"),
    kit("account-management", "Account Management", "Account context, renewal prep, and internal handoffs.", 2, 4, "teal"),
    kit("product", "Product", "Docs, feature requests, and product feedback loops.", 1, 4, "purple"),
    kit("data", "Data", "Metrics, evidence, and warehouse-safe previews.", 1, 3, "green"),
    kit("cx", "Customer Experience", "Shared-channel drafts and customer-safe summaries.", 2, 4, "pink"),
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

export const linkApi: LinkDesktopApi = window.linkDesktop ?? {
  async chat(prompt) {
    const routedTo = prompt.toLowerCase().includes("sms") ? "Customer Support Investigation Agent" : "Product/Docs Agent";
    return {
      routedTo,
      response: `Telnyx Link received the request and routed it to ${routedTo}.\nNo production systems were contacted.`,
    };
  },
  async runSkill(skillName) {
    return {
      skill: mockSkills.find((skill) => skill.name === skillName) ?? mockSkills[0],
      execution: {
        mode: "mocked",
        summary: `Loaded and ran ${skillName} with deterministic mocked context.`,
      },
    };
  },
  async listSkills() {
    return mockSkills;
  },
  async listTools() {
    return mockTools;
  },
  async createSharedChannelDraft(input) {
    const work = createMockWork(`work-${Date.now()}`, input.title || "Shared-channel response draft", "Shared-channel draft - Pending review", "pending");
    mockWork = [work, ...mockWork];
    return work;
  },
  async listActiveWork() {
    return mockWork;
  },
  async decideWork(id, decision) {
    mockWork = mockWork.map((item) =>
      item.id === id
        ? {
            ...item,
            status: decision === "approve" ? "approved" : "dismissed",
            subtitle: decision === "approve" ? "Approved by human reviewer" : "Dismissed by human reviewer",
          }
        : item,
    );
    return mockWork.find((item) => item.id === id)!;
  },
  async listAutomations() {
    return mockAutomations;
  },
  async listConnectors() {
    return mockConnectors;
  },
  async listCredentials() {
    return mockCredentials;
  },
  async saveCredential({ name }) {
    mockCredentials = mockCredentials.map((group) => ({
      ...group,
      fields: group.fields.map((field) =>
        field.name === name ? { ...field, configured: true, source: "saved", updatedAt: new Date().toISOString() } : field,
      ),
    }));
    return mockCredentials;
  },
  async updateConnectorStatus(id, status) {
    return mockConnectors.map((connectorItem) =>
      connectorItem.id === id ? { ...connectorItem, status, mode: status === "connected" ? connectorItem.mode : "mocked" } : connectorItem,
    );
  },
  async listOnboarding() {
    return mockOnboarding;
  },
  async updateOnboarding(input) {
    mockOnboarding = {
      ...mockOnboarding,
      ...input,
      completedStepIds: input.completedStepIds ?? mockOnboarding.completedStepIds,
      updatedAt: new Date().toISOString(),
    };
    return mockOnboarding;
  },
  async signInAgentControlPlane() {
    return mockAgentControlPlaneAuthStatus(true);
  },
  async signOutAgentControlPlane() {
    return mockAgentControlPlaneAuthStatus(false);
  },
  async getAgentControlPlaneAuthStatus() {
    return mockAgentControlPlaneAuthStatus(false);
  },
  async listHostedAgents() {
    return mockAgents();
  },
  async listWorkspaces() {
    return mockWorkspaces;
  },
  async searchExplorer({ query }) {
    return explorerResults(query);
  },
  async listChatSessions() {
    return mockChatSessions;
  },
  async sendChatMessage({ sessionId, workspaceId, content, agentId, agentName, approvalMode, modelMode, contextScope }) {
    let session = mockChatSessions.find((item) => item.id === sessionId);
    if (!session) {
      session = {
        id: `chat-${Date.now()}`,
        title: content.slice(0, 54),
        workspaceId: workspaceId ?? "workspace-link",
        model: "mock-link-runtime",
        status: "active",
        updatedAt: new Date().toISOString(),
        messages: [message("system", "You are Telnyx Link.")],
      };
      mockChatSessions = [session, ...mockChatSessions];
    }
    session.messages = [
      ...session.messages,
      message("user", content),
      message(
        "assistant",
        `Mock Link response routed to ${agentName ?? agentId ?? "Personal OpenClaw"} using ${contextScope ?? "workspace"} context, ${modelMode ?? "Default - LiteLLM"}, and ${approvalMode ?? "auto"} approval mode for: ${content}`,
        createChatArtifacts(content),
      ),
    ];
    session.workspaceId = workspaceId ?? session.workspaceId;
    session.updatedAt = new Date().toISOString();
    return session;
  },
  async createChangeRequest(input) {
    const request: LinkChangeRequest = {
      id: `change-${Date.now()}`,
      title: input.title,
      summary: input.summary,
      requestedChange: input.requestedChange,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspaceId: input.workspaceId,
      sourceSessionId: input.sourceSessionId,
    };
    mockChangeRequests = [request, ...mockChangeRequests];
    return request;
  },
  async approveChangeRequest(id) {
    mockChangeRequests = mockChangeRequests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: "draft_pr_created",
            updatedAt: new Date().toISOString(),
            github: {
              mode: "mocked",
              branch: `link/change-${request.id}`,
              prUrl: "https://github.com/team-telnyx/ai/pull/mock-link-change",
              note: "Preview mode created a mocked draft PR record. No GitHub state changed.",
            },
          }
        : request,
    );
    return mockChangeRequests.find((request) => request.id === id)!;
  },
  async dismissChangeRequest(id) {
    mockChangeRequests = mockChangeRequests.map((request) =>
      request.id === id ? { ...request, status: "dismissed", updatedAt: new Date().toISOString() } : request,
    );
    return mockChangeRequests.find((request) => request.id === id)!;
  },
  async listChangeRequests() {
    return mockChangeRequests;
  },
  async listAgents() {
    return mockAgents();
  },
  async sendAgentMessage({ agentId, content }) {
    return {
      mode: "mocked",
      agentId,
      message: `Preview mode staged a Slack agent message: ${content}`,
    };
  },
  async listWorkboard({ provider = "local", boardId = "local" } = {}) {
    return mockWorkboardSnapshot(provider === "auto" ? "local" : provider, boardId);
  },
  async createWorkboardCard(input) {
    const provider = input.provider === "auto" ? "local" : input.provider;
    mockWorkboardCards = [
      createMockWorkboardCard({
        id: `card-${Date.now()}`,
        title: input.title,
        body: input.body,
        status: input.status ?? "triage",
        assignee: input.assignee,
        provider,
        priority: input.priority ?? "normal",
        labels: input.labels ?? [],
        tenant: input.tenant,
        workspace: input.workspace,
        sourceUrl: input.sourceUrl,
      }),
      ...mockWorkboardCards,
    ];
    return mockWorkboardSnapshot(provider, input.boardId ?? "local");
  },
  async updateWorkboardCard(input) {
    const provider = input.provider === "auto" ? "local" : input.provider;
    mockWorkboardCards = mockWorkboardCards.map((card) =>
      card.id === input.cardId
        ? {
            ...card,
            status: input.status ?? card.status,
            assignee: input.assignee ?? card.assignee,
            comments: input.comment ? [...(card.comments ?? []), input.comment] : card.comments,
            updatedAt: new Date().toISOString(),
          }
        : card,
    );
    return mockWorkboardSnapshot(provider, input.boardId ?? "local");
  },
  async dispatchWorkboard({ provider = "local", boardId = "local" }) {
    const resolvedProvider = provider === "auto" ? "local" : provider;
    mockWorkboardCards = mockWorkboardCards.map((card) =>
      card.status === "ready" && card.provider === resolvedProvider
        ? {
            ...card,
            status: "running",
            diagnostics: ["Preview dispatch moved this card to running without starting a worker."],
            updatedAt: new Date().toISOString(),
          }
        : card,
    );
    return mockWorkboardSnapshot(resolvedProvider, boardId);
  },
  async searchPhoneNumbers({ countryCode, areaCode, locality }) {
    const suffix = areaCode || "312";
    return [
      {
        phoneNumber: `+1${suffix}5550142`,
        countryCode: countryCode || "US",
        locality: locality || "Chicago",
        region: "IL",
        type: "local",
        features: ["voice", "emergency"],
        monthlyCost: "1.00 USD",
        upfrontCost: "1.00 USD",
      },
      {
        phoneNumber: `+1${suffix}5550198`,
        countryCode: countryCode || "US",
        locality: locality || "Chicago",
        region: "IL",
        type: "local",
        features: ["voice"],
        monthlyCost: "1.00 USD",
        upfrontCost: "1.00 USD",
      },
    ];
  },
  async previewPhoneSetup(input) {
    const { phoneNumber, displayName, webhookUrl } = input;
    const safeName = displayName.trim() || "Telnyx Link Phone";
    const assistant = mockPhoneVoiceAssistantPlan(input);
    return {
      id: `phone-plan-${Date.now()}`,
      phoneNumber,
      sipUsername: `link_${phoneNumber.replace(/\D/g, "").slice(-10)}`,
      sipPassword: "preview-generated-password",
      webhookUrl,
      voiceAssistant: assistant,
      warning: "Preview mode does not purchase the number or create Telnyx resources.",
      purchaseReview: {
        endpoint: "https://api.telnyx.com/v2/number_orders",
        method: "POST",
        body: {
          phone_numbers: [{ phone_number: phoneNumber }],
          connection_id: "{credential_connection_id}",
          customer_reference: "telnyx-link-personal-phone",
        },
      },
      resources: [
        {
          label: "Credential SIP connection for WebRTC registration",
          endpoint: "https://api.telnyx.com/v2/credential_connections",
          method: "POST",
          body: {
            connection_name: safeName,
            user_name: `link_${phoneNumber.replace(/\D/g, "").slice(-10)}`,
            active: true,
            webhook_event_url: webhookUrl,
            webhook_api_version: "2",
          },
        },
        {
          label: "Call Control application for inbound call events",
          endpoint: "https://api.telnyx.com/v2/call_control_applications",
          method: "POST",
          body: { application_name: safeName, webhook_event_url: webhookUrl },
        },
        {
          label: "Purchase and assign selected number to the SIP/WebRTC connection",
          endpoint: "https://api.telnyx.com/v2/number_orders",
          method: "POST",
          body: {
            phone_numbers: [{ phone_number: phoneNumber }],
            connection_id: "{credential_connection_id}",
            customer_reference: "telnyx-link-personal-phone",
          },
        },
        ...(assistant.enabled
          ? [
              {
                label: "Create Telnyx Voice AI assistant for after-hours call answering",
                endpoint: assistant.assistantReview.endpoint,
                method: "POST" as const,
                body: assistant.assistantReview.body,
              },
              {
                label: "Route inbound calls to Link Call Control so after-hours calls can start the AI assistant",
                endpoint: assistant.callControlRouting.endpoint,
                method: "POST" as const,
                body: assistant.callControlRouting.body,
              },
            ]
          : []),
      ],
      steps: [
        "Review number purchase",
        "Create SIP credential connection",
        "Create Call Control app",
        "Assign phone number",
        ...(assistant.enabled ? ["Create Telnyx Voice AI assistant", "Enable after-hours AI answering and Calendar availability checks"] : []),
        "Connect WebRTC client",
      ],
    };
  },
  async provisionPhoneSystem(input) {
    const plan = await this.previewPhoneSetup(input);
    return {
      ...plan,
      status: "provisioned",
      warning: "Preview mode simulated provisioning without purchasing the number or creating Telnyx resources.",
      credentialConnectionId: "preview-credential-connection",
      callControlApplicationId: "preview-call-control-app",
      voiceAssistantId: plan.voiceAssistant?.enabled ? "assistant-preview-link-phone" : undefined,
      numberOrderId: "preview-number-order",
      numberOrderStatus: "success",
      orderedPhoneNumberId: "preview-number-order-phone-number",
      raw: {
        credentialConnection: { id: "preview-credential-connection" },
        callControlApplication: { id: "preview-call-control-app" },
        voiceAssistant: plan.voiceAssistant?.enabled ? { id: "assistant-preview-link-phone" } : undefined,
        numberOrder: { id: "preview-number-order", status: "success" },
      },
    };
  },
  async listMemoryBanks() {
    return [];
  },
  async recallMemory() {
    return [];
  },
  async listDojoState() {
    return mockDojoState;
  },
  async auditEvents() {
    return [];
  },
};

function tool(
  name: string,
  description: string,
  category: string,
  capability: ToolMetadata["capability"],
  riskLevel: ToolMetadata["riskLevel"],
  approvalRequired: boolean,
  visibility: ToolMetadata["visibility"] = "internal_only",
): ToolMetadata {
  return {
    name,
    description,
    category,
    visibility,
    capability,
    riskLevel,
    approvalRequired,
    outputCanBeShownExternally: visibility === "customer_safe",
  };
}

function createMockWork(
  id: string,
  title: string,
  subtitle: string,
  status: ActiveWorkItem["status"],
): ActiveWorkItem {
  return {
    id,
    title,
    subtitle,
    status,
    createdAt: new Date().toISOString(),
    summary: "Customer-visible action requires human approval before posting.",
    details: {
      customerSafeDraft:
        "Hi Acme Messaging Co.,\nWe are continuing to investigate the reported SMS delivery delay and will share the next confirmed update as soon as it is ready.",
      internalRationale:
        "The draft removes raw logs, internal Slack references, and carrier-private diagnostics. Approval is required before customer-visible posting.",
      sourcesUsed: ["provided_thread_context", "mocked_link_shared_channel_policy", "mocked_tool_registry_metadata"],
      approval: {
        approvalRequired: status === "pending",
        approvalStatus: status === "pending" ? "approval_required" : "not_required",
      },
    },
  };
}

function createMockWorkboardCard(input: {
  id: string;
  title: string;
  body?: string;
  status: WorkboardStatus;
  assignee?: string;
  provider: WorkboardProvider;
  priority: WorkboardCard["priority"];
  labels?: string[];
  tenant?: string;
  workspace?: string;
  sourceUrl?: string;
  proof?: string[];
  artifacts?: string[];
}): WorkboardCard {
  const timestamp = new Date().toISOString();
  return {
    id: input.id,
    title: input.title,
    body: input.body,
    status: input.status,
    priority: input.priority,
    labels: input.labels ?? [],
    assignee: input.assignee,
    provider: input.provider,
    boardId: "local",
    tenant: input.tenant,
    workspace: input.workspace,
    sourceUrl: input.sourceUrl,
    proof: input.proof,
    artifacts: input.artifacts,
    comments: [],
    diagnostics: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function mockWorkboardSnapshot(provider: WorkboardProvider, boardId: string): WorkboardSnapshot {
  const cards = mockWorkboardCards.filter((card) => provider === "local" || card.provider === provider);
  return {
    provider,
    boardId,
    providers: [
      { id: "hermes", label: "Hermes Kanban", available: false, mode: "unavailable", message: "Hermes CLI is not connected in browser preview." },
      { id: "openclaw", label: "OpenClaw Workboard", available: false, mode: "unavailable", message: "OpenClaw Gateway is not connected in browser preview." },
      { id: "local", label: "Link local board", available: true, mode: "fallback", message: "Local fallback board is active." },
    ],
    boards: [{ id: "local", name: "Link local board", provider: "local", description: "Durable Link-owned fallback board." }],
    columns: ["triage", "backlog", "todo", "scheduled", "ready", "running", "review", "blocked", "done"],
    cards,
    assignees: [...new Set(cards.map((card) => card.assignee).filter((assignee): assignee is string => Boolean(assignee)))],
    stats: [
      { label: "Cards", value: cards.length },
      { label: "Running", value: cards.filter((card) => card.status === "running").length, tone: "success" },
      { label: "Blocked", value: cards.filter((card) => card.status === "blocked").length, tone: "warning" },
    ],
    message: "Preview mode uses Link's local fallback board.",
  };
}

function mockPhoneVoiceAssistantPlan(input: PhoneSetupInput): PhoneVoiceAssistantPlan {
  const name = input.voiceAssistantName?.trim() || `${input.displayName.trim() || "Telnyx Link"} Voice AI`;
  const timezone = input.timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
  const workHours = input.workHours ?? {
    mondayToFriday: "09:00-17:00",
    saturday: "closed",
    sunday: "closed",
  };
  const calendarWebhookUrl = input.googleCalendarWebhookUrl?.trim() || "https://link-phone-webhooks.telnyx.io/calendar";
  const assistantBody = {
    name,
    description: "Telnyx Link personal phone after-hours assistant.",
    enabled_features: ["telephony"],
    greeting: "Hi, this is the AI assistant for this Telnyx Link phone. I can help schedule a sales call.",
    instructions:
      `Answer calls for ${input.displayName}. If the call is outside work hours (${workHours.mondayToFriday} ${timezone}), offer to schedule a sales call. Use Google Calendar availability before proposing times.`,
    dynamic_variables_webhook_url: calendarWebhookUrl,
    tools: [
      {
        type: "webhook",
        webhook: {
          name: "check_calendar_availability",
          description: "Check Google Calendar free/busy availability for proposed sales call windows.",
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
          description: "Create a tentative Google Calendar sales-call hold after the caller confirms a time.",
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
  };
  return {
    enabled: Boolean(input.voiceAssistantEnabled),
    name,
    mode: input.voiceAssistantMode ?? "after_hours",
    timezone,
    workHours,
    googleCalendar: {
      enabled: Boolean(input.googleCalendarEnabled),
      calendarId: input.googleCalendarId?.trim() || "primary",
      mode: input.googleCalendarMode ?? "free_busy_only",
      webhookUrl: calendarWebhookUrl,
    },
    assistantReview: {
      endpoint: "https://api.telnyx.com/v2/ai/assistants",
      method: "POST",
      body: assistantBody,
    },
    callControlRouting: {
      endpoint: "https://api.telnyx.com/v2/calls/{call_control_id}/actions/ai_assistant_start",
      method: "POST",
      body: { assistant: { id: "{voice_assistant_id}" } },
    },
  };
}

function connector(
  id: string,
  name: string,
  category: string,
  description: string,
  requiredAccess: string[],
  status: ConnectorStatus["status"],
  mode: ConnectorStatus["mode"] = "mocked",
): ConnectorStatus {
  return { id, name, category, description, requiredAccess, status, mode };
}

function credentials(id: string, label: string, help: string, fields: string[]): CredentialGroupStatus {
  return {
    id,
    label,
    help,
    fields: fields.map((name) => ({ name, configured: false, source: "missing" })),
  };
}

function tab(id: string, title: string, kind: WorkspaceTab["kind"], status: WorkspaceTab["status"]): WorkspaceTab {
  return { id, title, kind, status, updatedAt: now };
}

function message(role: ChatMessage["role"], content: string, artifacts: ChatArtifact[] = []): ChatMessage {
  return { id: `message-${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`, role, content, createdAt: new Date().toISOString(), ...(artifacts.length ? { artifacts } : {}) };
}

function createChatArtifacts(prompt: string): ChatArtifact[] {
  const wantsPdf = /\bpdf\b/i.test(prompt);
  const wantsMarkdown = /\.md\b|\bmarkdown\b|\bmd file\b/i.test(prompt);
  if (!wantsPdf && !wantsMarkdown) return [];
  const createdAt = new Date().toISOString();
  const title = prompt.replace(/\s+/g, " ").trim().slice(0, 48) || "Link generated document";
  const body = `# ${title}\n\nGenerated from the active Link chat.\n\n## Request\n\n${prompt.trim() || "No prompt provided."}\n\n## Notes\n\n- Review content before sharing externally.\n- Attach sources when live connectors are available.`;
  return [
    {
      id: `artifact-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      kind: wantsPdf ? "pdf" : "markdown",
      filename: wantsPdf ? "link-generated-document.pdf" : "link-generated-document.md",
      content: body,
      createdAt,
    },
  ];
}

function kit(
  id: string,
  name: string,
  description: string,
  mastered: number,
  total: number,
  tone: DojoKit["tone"],
): DojoKit {
  return { id, name, description, mastered, total, tone };
}

function explorerResults(query: string): ExplorerResult[] {
  const term = query.trim() || "Telnyx Link";
  return [
    {
      id: "explorer-guru-1",
      title: "Messaging Delivery Investigation Playbook",
      source: "guru",
      type: "doc",
      permission: "mocked",
      freshness: "Updated yesterday",
      excerpt: `Guru card matching ${term}: customer-safe escalation checklist and evidence handling.`,
      workspaceId: "workspace-acme",
    },
    {
      id: "explorer-drive-1",
      title: "Acme QBR and escalation notes",
      source: "google_drive",
      type: "doc",
      permission: "needs_access",
      freshness: "Drive OAuth required",
      excerpt: `Google Drive adapter is ready for ${term}, but OAuth is not connected in preview.`,
      workspaceId: "workspace-acme",
    },
    {
      id: "explorer-link-file-1",
      title: "customer-safe-draft.md",
      source: "link_file",
      type: "file",
      permission: "allowed",
      freshness: "Generated today",
      excerpt: "Link-created artifact from the active Acme SMS delivery response workspace.",
      workspaceId: "workspace-acme",
    },
    {
      id: "explorer-skill-1",
      title: "SMS Delivery Investigation",
      source: "skill",
      type: "skill",
      permission: "allowed",
      freshness: "Git-backed skill",
      excerpt: "Run this skill to inspect delivery signals and generate an internal support timeline.",
    },
  ];
}

function mockAgents(): AgentSummary[] {
  return [
    {
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
    },
    {
      id: "agent-customer-escalation",
      name: "customer-escalation-agent",
      displayName: "Customer Escalation Agent",
      description: "Public hosted agent for customer escalation triage.",
      status: "active",
      type: "hermes",
      capabilities: ["support", "messaging", "customer-safe-drafts"],
      visibility: "public",
      source: "mock",
      squad: "support.squad",
      audience: "internal",
      origin: "mock",
      available: true,
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
      source: "mock",
      slackChannel: "#telnyx-link-eng",
      squad: "ai.platform.squad",
      audience: "internal",
      origin: "mock",
      available: true,
    },
  ];
}

function mockAgentControlPlaneAuthStatus(signedIn: boolean): AgentControlPlaneAuthStatus {
  return {
    baseUrl: "http://agent-control-plane.query.prod.telnyx.io:8000",
    authMode: "okta",
    signedIn,
    ready: signedIn,
    cookieCount: signedIn ? 1 : 0,
    actorConfigured: true,
    onBehalfOfConfigured: true,
    actor: "preview@telnyx.com",
    onBehalfOf: "preview.squad",
    rev2Configured: false,
    message: signedIn ? "Preview Okta session is mocked." : "Preview mode is not connected to Agent Control Plane.",
  };
}
