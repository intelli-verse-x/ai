import {
  Bell,
  BookOpen,
  Bot,
  ChevronDown,
  ChessKnight,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  FolderOpen,
  GitPullRequestDraft,
  Grid2X2,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  PhoneCall,
  PhoneOff,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  Slack,
  SlidersHorizontal,
  SquareTerminal,
  Store,
  Tags,
  Trash2,
  Upload,
  Users,
  Vault,
  X,
  Zap,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveWorkItem,
  AgentControlPlaneAuthStatus,
  AgentSummary,
  AutomationItem,
  ChatArtifact,
  ChatSession,
  ConnectorStatus,
  CredentialGroupStatus,
  DojoKit,
  DojoState,
  ExplorerResult,
  HostedAgentSummary,
  LinkChangeRequest,
  MemoryBank,
  MemoryRecallResult,
  OnboardingState,
  PhoneNumberOption,
  PhoneProvisionResult,
  PhoneSetupPlan,
  SkillMetadata,
  ToolMetadata,
  ViewId,
  WorkboardCard,
  WorkboardProvider,
  WorkboardSnapshot,
  WorkboardStatus,
  WorkspaceSummary,
} from "./api.js";
import { linkApi } from "./api.js";

type AppIcon = ComponentType<{ size?: number; className?: string }>;

function BoardIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3.5H18C19.38 3.5 20.5 4.62 20.5 6V18C20.5 19.38 19.38 20.5 18 20.5H6C4.62 20.5 3.5 19.38 3.5 18V6C3.5 4.62 4.62 3.5 6 3.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 7.5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 16.5H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwordIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.21285 0.1602h-5.01715625c-0.19465 -0.000025 -0.378275 0.09034375 -0.4970125 0.24458125L4.681525 6.927875 3.92424375 6.1721625c-0.4899375 -0.4904875 -1.284875 -0.4904875 -1.77481875 0l-0.99480625 0.99559375c-0.48996875 0.48985625 -0.48996875 1.28418125 0 1.7740375l1.5678625 1.5678625 -2.19500625 2.19500625c-0.48996875 0.48985 -0.48996875 1.28418125 0 1.77403125l0.99480625 0.994025c0.4897625 0.48944375 1.2834875 0.48944375 1.77325 0l2.19500625 -2.19500625 1.5678625 1.5678625c0.48994375 0.4904875 1.28488125 0.4904875 1.774825 0l0.99480625 -0.99559375c0.4899625 -0.48985 0.4899625 -1.28418125 0 -1.77403125l-0.7557125 -0.7557125 6.52309375 -5.01715625c0.154675 -0.119075 0.24509375 -0.30338125 0.2445875 -0.49858125V0.78734375c0 -0.3463625 -0.2807875 -0.62715 -0.62715 -0.62715ZM2.410475 14.584525 1.41566875 13.5905l2.19500625 -2.19500625 0.994025 0.994025Zm5.5353375 -0.62714375 -5.903 -5.9022125 0.99559375 -0.99638125 5.903 5.9037875Zm6.63989375 -8.46175 -6.40785 4.92935625 -0.85761875 -0.85761875 3.94630625 -3.94630625c0.3412625 -0.34156875 0.1848 -0.924475 -0.2816375 -1.04923125 -0.216475 -0.0579 -0.44739375 0.00408125 -0.60576875 0.1626l-3.9463125 3.945525 -0.8568375 -0.85761875L10.5045625 1.4144875h4.08114375Z"
        fill="currentColor"
      />
    </svg>
  );
}

const navItems: { id: ViewId; label: string; icon: AppIcon }[] = [
  { id: "widgets", label: "Widgets", icon: LayoutDashboard },
  { id: "workboard", label: "Tasks", icon: BoardIcon },
  { id: "chats", label: "Chat", icon: MessageSquare },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "explorer", label: "Library", icon: BookOpen },
  { id: "memory", label: "Memory", icon: Vault },
  { id: "dojo", label: "Experto", icon: ChessKnight },
];

const viewMeta: Record<ViewId, { label: string; icon: AppIcon }> = {
  workspaces: { label: "Workspaces", icon: Grid2X2 },
  onboarding: { label: "Onboarding", icon: Flag },
  widgets: { label: "Widgets", icon: LayoutDashboard },
  explorer: { label: "Library", icon: BookOpen },
  chats: { label: "Chat", icon: MessageSquare },
  agents: { label: "Agents", icon: Bot },
  workboard: { label: "Tasks", icon: BoardIcon },
  phone: { label: "Phone", icon: Phone },
  memory: { label: "Memory", icon: Vault },
  dojo: { label: "Experto", icon: ChessKnight },
  settings: { label: "Settings", icon: Settings },
};

interface WidgetLibraryItem {
  id: string;
  title: string;
  source: "Tableau" | "Salesforce" | "Salesloft" | "Linear";
  category: "Revenue" | "Operations" | "Product";
  description: string;
  cadence: string;
  metric: string;
  trend: string;
}

interface DashboardWidget extends WidgetLibraryItem {
  instanceId: string;
}

interface MarketplaceApp {
  id: string;
  name: string;
  publisher: string;
  bot: string;
  audience: string;
  installMode: "Local install" | "VPN access";
  status: "Available" | "Reviewing" | "Installed";
  description: string;
}

const widgetLibrary: WidgetLibraryItem[] = [
  {
    id: "tableau-revenue-pipeline",
    title: "Revenue pipeline",
    source: "Tableau",
    category: "Revenue",
    description: "Pipeline health, commit coverage, and quarter-to-date bookings.",
    cadence: "Refreshes hourly",
    metric: "$18.4M",
    trend: "+7.2% vs last week",
  },
  {
    id: "salesforce-open-opps",
    title: "Open opportunities",
    source: "Salesforce",
    category: "Revenue",
    description: "Owned opportunities by stage, close date, owner, and next step.",
    cadence: "Live report",
    metric: "142",
    trend: "31 closing this month",
  },
  {
    id: "salesloft-activity",
    title: "Salesloft activity",
    source: "Salesloft",
    category: "Revenue",
    description: "Cadence performance, booked meetings, replies, and overdue touches.",
    cadence: "Refreshes every 30 min",
    metric: "64%",
    trend: "+11 reply rate",
  },
  {
    id: "linear-delivery",
    title: "Delivery status",
    source: "Linear",
    category: "Product",
    description: "Cycle progress, blocked work, SLA risk, and shipped issues.",
    cadence: "Live project view",
    metric: "23",
    trend: "5 blocked issues",
  },
  {
    id: "tableau-support-volume",
    title: "Support volume",
    source: "Tableau",
    category: "Operations",
    description: "Ticket volume, backlog, escalation mix, and response-time trend.",
    cadence: "Refreshes daily",
    metric: "418",
    trend: "-9% backlog",
  },
  {
    id: "linear-agent-work",
    title: "Agent work queue",
    source: "Linear",
    category: "Operations",
    description: "Active agent tasks, review handoffs, and work waiting on humans.",
    cadence: "Live board",
    metric: "37",
    trend: "12 ready for review",
  },
];

const marketplaceApps: MarketplaceApp[] = [
  {
    id: "marketplace-support-triage",
    name: "Support Triage Console",
    publisher: "Customer Operations",
    bot: "bot-troubleshooting",
    audience: "Support, Escalations",
    installMode: "Local install",
    status: "Available",
    description: "Route escalations, summarize OpenClaw incidents, and open approved follow-up tasks from one local app.",
  },
  {
    id: "marketplace-carrier-readiness",
    name: "Carrier Readiness Hub",
    publisher: "Messaging Ops",
    bot: "Hermes",
    audience: "Messaging, NOC",
    installMode: "VPN access",
    status: "Available",
    description: "Check carrier launch gates, retrieve internal runbooks, and coordinate squad review before customer updates.",
  },
  {
    id: "marketplace-revenue-brief",
    name: "Revenue Brief Builder",
    publisher: "Sales Engineering",
    bot: "Personal OpenClaw",
    audience: "Sales, SE",
    installMode: "Local install",
    status: "Installed",
    description: "Build account briefs from Salesforce, Guru, and recent agent chats with employee-only source links.",
  },
  {
    id: "marketplace-release-desk",
    name: "Release Desk",
    publisher: "Product Platform",
    bot: "Link reviewer",
    audience: "Product, Engineering",
    installMode: "VPN access",
    status: "Reviewing",
    description: "Publish release notes, inspect pending approvals, and hand off app-specific review steps to the owning squad.",
  },
];

const initialOnboardingState: OnboardingState = {
  dismissed: false,
  completed: false,
  completedStepIds: [],
  updatedAt: "1970-01-01T00:00:00.000Z",
};

export function App() {
  const [view, setView] = useState<ViewId>("widgets");
  const [skills, setSkills] = useState<SkillMetadata[]>([]);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [work, setWork] = useState<ActiveWorkItem[]>([]);
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ChatArtifact | null>(null);
  const [changeRequests, setChangeRequests] = useState<LinkChangeRequest[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [memoryBanks, setMemoryBanks] = useState<MemoryBank[]>([]);
  const [dojoState, setDojoState] = useState<DojoState | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState>(initialOnboardingState);
  const [accountStatus, setAccountStatus] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [signedOutLocally, setSignedOutLocally] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("workspace-acme");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [openChatTabIds, setOpenChatTabIds] = useState<string[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"chat" | "phone">("chat");
  const [widgetLibraryOpen, setWidgetLibraryOpen] = useState(false);
  const [colorMode, setColorMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("telnyx-link-color-mode") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-color-mode", colorMode);
  }, [colorMode]);

  async function refresh() {
    const [
      skillList,
      toolList,
      workList,
      automationList,
      connectorList,
      workspaceList,
      chatList,
      changeList,
      agentList,
      bankList,
      dojo,
      onboardingState,
      authStatus,
    ] = await Promise.all([
      linkApi.listSkills(),
      linkApi.listTools(),
      linkApi.listActiveWork(),
      linkApi.listAutomations(),
      linkApi.listConnectors(),
      linkApi.listWorkspaces(),
      linkApi.listChatSessions(),
      linkApi.listChangeRequests(),
      linkApi.listAgents(),
      linkApi.listMemoryBanks(),
      linkApi.listDojoState(),
      linkApi.listOnboarding(),
      linkApi.getAgentControlPlaneAuthStatus(),
    ]);
    setSkills(skillList);
    setTools(toolList);
    setWork(workList);
    setAutomations(automationList);
    setConnectors(connectorList);
    setWorkspaces(workspaceList);
    setChatSessions(chatList);
    setChangeRequests(changeList);
    setAgents(agentList);
    setMemoryBanks(bankList);
    setDojoState(dojo);
    setOnboarding(onboardingState);
    setAccountStatus(authStatus);
    setSignedOutLocally(false);
    setSelectedWorkspaceId((current) => current || workspaceList[0]?.id || "");
    setSelectedSessionId((current) => current || chatList[0]?.id || "");
    setOpenChatTabIds((current) => {
      const availableIds = new Set(chatList.map((session) => session.id));
      const next = current.filter((id) => availableIds.has(id));
      const selectedId = selectedSessionId || chatList[0]?.id || "";
      if (selectedId && availableIds.has(selectedId) && !next.includes(selectedId)) next.unshift(selectedId);
      if (next.length === 0 && chatList[0]?.id) next.push(chatList[0].id);
      return next.slice(0, 6);
    });
    setSelectedWorkId((current) => current || workList[0]?.id || "");
  }

  useEffect(() => {
    void refresh();
  }, []);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
  const selectedSession = selectedSessionId ? chatSessions.find((session) => session.id === selectedSessionId) : undefined;
  const selectedWork = work.find((item) => item.id === selectedWorkId) ?? work[0];
  const showContextSidebar = false;

  function openChatSession(sessionId: string) {
    if (sessionId) {
      setSelectedSessionId(sessionId);
      setOpenChatTabIds((current) => [sessionId, ...current.filter((id) => id !== sessionId)].slice(0, 6));
    } else {
      setSelectedSessionId("");
    }
    setView("chats");
  }

  function closeChatTab(sessionId: string) {
    setOpenChatTabIds((current) => {
      const next = current.filter((id) => id !== sessionId);
      if (selectedSessionId === sessionId) setSelectedSessionId(next[0] ?? "");
      return next;
    });
  }

  return (
    <div className="desktop" data-theme={colorMode}>
      <TitleBar />
      <div className={`workspace ${showContextSidebar ? "" : "workspaceNoSidebar"} ${railExpanded ? "railExpanded" : "railCollapsed"}`}>
        <Rail
          view={view}
          setView={setView}
          expanded={railExpanded}
          setExpanded={setRailExpanded}
          onboarding={onboarding}
          setOnboarding={setOnboarding}
          accountStatus={accountStatus}
          signedOutLocally={signedOutLocally}
          setAccountStatus={setAccountStatus}
          setSignedOutLocally={setSignedOutLocally}
          colorMode={colorMode}
          setColorMode={setColorMode}
        />
        {showContextSidebar && (
          <Sidebar
            view={view}
            work={work}
            skills={skills}
            connectors={connectors}
            workspaces={workspaces}
            chatSessions={chatSessions}
            changeRequests={changeRequests}
            agents={agents}
            memoryBanks={memoryBanks}
            dojoState={dojoState}
            selectedWorkspaceId={selectedWorkspace?.id ?? ""}
            selectedSessionId={selectedSession?.id ?? ""}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
            setSelectedSessionId={setSelectedSessionId}
            setSelectedWorkId={setSelectedWorkId}
            setView={setView}
          />
        )}
        <main className="mainPane">
          <TabStrip
            view={view}
            setView={setView}
            chatSessions={chatSessions}
            openChatTabIds={openChatTabIds}
            selectedSessionId={selectedSession?.id ?? ""}
            selectSession={openChatSession}
            closeSession={closeChatTab}
            openWidgetLibrary={() => {
              setView("widgets");
              setWidgetLibraryOpen(true);
            }}
          />
          <div className="appSurface">
            <div className="pageSurface">
              {!selectedArtifact && view === "onboarding" && onboarding && (
                <OnboardingView
                  onboarding={onboarding}
                  setOnboarding={setOnboarding}
                  connectors={connectors}
                  memoryBanks={memoryBanks}
                  skills={skills}
                  agents={agents}
                  setView={setView}
                  refresh={refresh}
                />
              )}
              {selectedArtifact && <ArtifactViewer artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />}
              {!selectedArtifact && view === "widgets" && <WidgetsView libraryOpen={widgetLibraryOpen} setLibraryOpen={setWidgetLibraryOpen} />}
              {!selectedArtifact && view === "explorer" && <ExplorerView selectedWorkspace={selectedWorkspace} />}
              {!selectedArtifact && view === "chats" && (
                <ChatsView
                  sessions={chatSessions}
                  workspaces={workspaces}
                  selectedSession={selectedSession}
                  selectSession={openChatSession}
                  openArtifact={setSelectedArtifact}
                />
              )}
              {!selectedArtifact && view === "agents" && <AgentsView agents={agents} connectors={connectors} refresh={refresh} />}
              {!selectedArtifact && view === "workboard" && <WorkboardView agents={agents} />}
              {!selectedArtifact && view === "phone" && <PhoneView connectors={connectors} />}
              {!selectedArtifact && view === "memory" && <MemoryView banks={memoryBanks} openMemory={() => setMemoryOpen(true)} />}
              {!selectedArtifact && view === "dojo" && <DojoView dojoState={dojoState} skills={skills} />}
              {!selectedArtifact && view === "settings" && <SettingsView refresh={refresh} connectors={connectors} tools={tools} />}
            </div>
            <AssistantPanel
              mode={assistantMode}
              setMode={setAssistantMode}
              agents={agents}
              selectedSession={selectedSession}
              selectedWorkspace={selectedWorkspace}
              selectSession={setSelectedSessionId}
              openArtifact={setSelectedArtifact}
              refresh={refresh}
              setView={setView}
            />
          </div>
        </main>
      </div>
      {memoryOpen && <MemoryModal onClose={() => setMemoryOpen(false)} sources={connectors.map((connector) => connector.name)} />}
    </div>
  );
}

function TitleBar() {
  return (
    <header className="titleBar">
      <div className="windowTitle">Telnyx Link</div>
    </header>
  );
}

function OnboardingView({
  onboarding,
  setOnboarding,
  connectors,
  memoryBanks,
  skills,
  agents,
  setView,
  refresh,
}: {
  onboarding: OnboardingState;
  setOnboarding: (state: OnboardingState) => void;
  connectors: ConnectorStatus[];
  memoryBanks: MemoryBank[];
  skills: SkillMetadata[];
  agents: AgentSummary[];
  setView: (view: ViewId) => void;
  refresh: () => Promise<void>;
}) {
  const [acpAuth, setAcpAuth] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [busy, setBusy] = useState("");
  const completed = new Set(onboarding.completedStepIds);
  const connectedConnectors = connectors.filter((connector) => connector.status === "connected" || connector.status === "signed_in");
  const connector = (id: string) => connectors.find((item) => item.id === id);
  const oktaComplete = Boolean(acpAuth?.ready || connector("agent-control-plane")?.status === "connected" || connector("agent-control-plane")?.status === "signed_in");
  const accountComplete = connectedConnectors.length >= 3 || completed.has("accounts");
  const squadToolsComplete = completed.has("squad-tools") || (skills.length > 0 && agents.length > 0 && completed.has("squad-review"));
  const hindsightComplete = connector("hindsight")?.status === "connected" && memoryBanks.length > 0;
  const rescueComplete = agents.some((agent) => agent.id === "slack-bot-troubleshooting");
  const requiredComplete = oktaComplete && accountComplete && squadToolsComplete;
  const squadBank = memoryBanks.find((bank) => bank.scope === "squad" || /squad|team|wiki/i.test(`${bank.name} ${bank.mission}`));

  useEffect(() => {
    void linkApi.getAgentControlPlaneAuthStatus().then(setAcpAuth);
  }, []);

  async function signInOkta() {
    setBusy("okta");
    setAcpAuth(await linkApi.signInAgentControlPlane());
    await refresh();
    setBusy("");
  }

  async function markStep(stepId: string) {
    const nextIds = [...new Set([...onboarding.completedStepIds, stepId])];
    const next = await linkApi.updateOnboarding({ completedStepIds: nextIds });
    setOnboarding(next);
  }

  async function finishOnboarding() {
    const next = await linkApi.updateOnboarding({ completed: true });
    setOnboarding(next);
    setView("widgets");
  }

  async function dismissOnboarding() {
    const next = await linkApi.updateOnboarding({ dismissed: true });
    setOnboarding(next);
    setView("widgets");
  }

  const steps = [
    {
      id: "okta",
      title: "Register with Telnyx Okta",
      body: "Use the native Okta flow so Link can pick up employee identity, internal auth cookies, and future squad context without storing passwords.",
      complete: oktaComplete,
      meta: acpAuth?.message ?? "Okta session not checked yet.",
      action: <button className="button secondary" onClick={() => void signInOkta()} disabled={busy === "okta" || oktaComplete}>{busy === "okta" ? "Signing in" : oktaComplete ? "Okta connected" : "Sign in with Okta"}</button>,
      required: true,
    },
    {
      id: "accounts",
      title: "Set up Agent Plugins",
      body: "Connect the accounts and plugin permissions Link can use: LiteLLM, Slack, Hindsight, Guru or Drive, GitHub, Linear, Telnyx, and squad-standard tools.",
      complete: accountComplete,
      meta: connectedConnectors.length > 0 ? `Connected: ${connectedConnectors.map((item) => item.name).join(", ")}` : "No accounts connected yet.",
      action: (
        <div className="onboardingActions">
          <button className="button secondary" onClick={() => setView("settings")}>Open Settings</button>
          <button className="button ghost" onClick={() => setView("settings")}>Review Agent Plugins</button>
          <button className="button ghost" onClick={() => void markStep("accounts")}>Use current set</button>
        </div>
      ),
      required: true,
    },
    {
      id: "squad-tools",
      title: "Review your squad's standard tools and plugins",
      body: "Confirm the skills, public agents, Slack agents, rescue bot, and workboard adapters your squad expects to use in Link.",
      complete: squadToolsComplete,
      meta: `${skills.length} skills, ${agents.length} agents, ${rescueComplete ? "bot-troubleshooting available" : "rescue bot unavailable"}.`,
      action: (
        <div className="onboardingActions">
          <button className="button secondary" onClick={() => setView("dojo")}>Open Experto</button>
          <button className="button ghost" onClick={() => setView("agents")}>Open Agents</button>
          <button className="button ghost" onClick={() => void markStep("squad-tools")}>Mark reviewed</button>
        </div>
      ),
      required: true,
    },
    {
      id: "hindsight-wiki",
      title: "Attach the squad wiki from Hindsight",
      body: "If a squad memory bank exists, Link can use it as the user's starting wiki and long-term context layer.",
      complete: hindsightComplete || completed.has("hindsight-wiki"),
      meta: squadBank ? `Found ${squadBank.name}` : hindsightComplete ? `${memoryBanks.length} Hindsight banks connected.` : "Connect Hindsight or create a squad bank when ready.",
      action: (
        <div className="onboardingActions">
          <button className="button secondary" onClick={() => setView("memory")}>Open Memory</button>
          <button className="button ghost" onClick={() => void markStep("hindsight-wiki")}>No squad wiki yet</button>
        </div>
      ),
      required: false,
    },
  ];

  return (
    <section className="content onboardingView">
      <header className="pageHeader">
        <div>
          <h1>User onboarding</h1>
        </div>
        <div className="headerActions">
          <button className="button ghost" onClick={() => void dismissOnboarding()}>
            <X size={15} />
            Dismiss
          </button>
          <button className="button primary" onClick={() => void finishOnboarding()} disabled={!requiredComplete}>Finish onboarding</button>
        </div>
      </header>
      <div className="onboardingHero">
        <div>
          <strong>Personal setup, squad defaults, and memory context in one place.</strong>
          <p>Link keeps onboarding visible until setup is dismissed or completed. Okta and internal services can fill in user and squad context later as those adapters come online.</p>
        </div>
        <Badge tone={requiredComplete ? "success" : "warning"}>{steps.filter((step) => step.complete).length}/{steps.length} complete</Badge>
      </div>
      <div className="onboardingGrid">
        {steps.map((step) => (
          <article className={`onboardingStep ${step.complete ? "complete" : ""}`} key={step.id}>
            <div className="stepIcon">{step.complete ? "OK" : step.required ? "!" : "-"}</div>
            <div className="stepBody">
              <div className="connectorTitle">
                <strong>{step.title}</strong>
                <Badge tone={step.complete ? "success" : step.required ? "warning" : "default"}>{step.complete ? "complete" : step.required ? "required" : "optional"}</Badge>
              </div>
              <p>{step.body}</p>
              <small>{step.meta}</small>
              {step.action}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Rail({
  view,
  setView,
  expanded,
  setExpanded,
  onboarding,
  setOnboarding,
  accountStatus,
  signedOutLocally,
  setAccountStatus,
  setSignedOutLocally,
  colorMode,
  setColorMode,
}: {
  view: ViewId;
  setView: (view: ViewId) => void;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  onboarding: OnboardingState;
  setOnboarding?: (onboarding: OnboardingState) => void;
  accountStatus: AgentControlPlaneAuthStatus | null;
  signedOutLocally: boolean;
  setAccountStatus: (status: AgentControlPlaneAuthStatus) => void;
  setSignedOutLocally: (signedOut: boolean) => void;
  colorMode: "light" | "dark";
  setColorMode: (mode: "light" | "dark") => void;
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const showOnboarding = onboarding && !onboarding.dismissed && !onboarding.completed;
  const signedIn = Boolean(accountStatus?.ready && !signedOutLocally);
  const accountIdentity = accountStatus?.userName || accountStatus?.actor || accountStatus?.userId || "";
  const accountLabel = accountIdentity || (signedIn ? "Telnyx Okta" : "Not signed in");
  const accountInitials = accountIdentity ? initialsFromIdentity(accountIdentity) : "TL";

  useEffect(() => {
    if (!accountMenuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [accountMenuOpen]);

  async function dismissOnboarding() {
    const next = await linkApi.updateOnboarding({ dismissed: true });
    setOnboarding?.(next);
    if (view === "onboarding") setView("widgets");
  }

  async function signInAccount() {
    const next = await linkApi.signInAgentControlPlane();
    setAccountStatus(next);
    setSignedOutLocally(false);
    setAccountMenuOpen(false);
  }

  async function logoutAccount() {
    const next = await linkApi.signOutAgentControlPlane();
    setAccountStatus(next);
    setSignedOutLocally(true);
    setAccountMenuOpen(false);
    setView("widgets");
  }

  const renderRailButton = (item: { id: ViewId; label: string; icon: AppIcon }) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        className={`railButton ${view === item.id ? "selected" : ""}`}
        title={item.label}
        onClick={() => setView(item.id)}
      >
        <Icon size={17} />
        <span className="railLabel">{item.label}</span>
        <span className="railTooltip" role="tooltip">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="rail" aria-label="Primary" data-expanded={expanded}>
      <button className="railButton brandButton" title="Telnyx Link" onClick={() => setView("widgets")}>
        <img src="./triforce-26.png" alt="" aria-hidden="true" />
        <span className="railLabel">Telnyx Link</span>
        <span className="railTooltip" role="tooltip">
          Telnyx Link
        </span>
      </button>
      {navItems.map(renderRailButton)}
      <div className="railSpacer" />
      {showOnboarding && (
        <div className="railOnboardingItem">
          {renderRailButton({ id: "onboarding", label: "Start", icon: Flag })}
          <button className="railDismiss" title="Dismiss onboarding" aria-label="Dismiss onboarding" onClick={() => void dismissOnboarding()}>
            <X size={12} />
          </button>
        </div>
      )}
      {renderRailButton({ id: "settings", label: "Settings", icon: Settings })}
      <button
        className="railButton railToggle"
        title={expanded ? "Collapse" : "Expand"}
        aria-label={expanded ? "Collapse" : "Expand"}
        aria-pressed={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        <span className="railLabel">{expanded ? "Collapse" : "Expand"}</span>
        <span className="railTooltip" role="tooltip">
          {expanded ? "Collapse" : "Expand"}
        </span>
      </button>
      <div className="accountMenuWrap" ref={accountMenuRef}>
        <button
          className={`avatar ${accountMenuOpen ? "selected" : ""}`}
          title={signedIn ? accountLabel : "User menu"}
          aria-label={signedIn ? `User menu for ${accountLabel}` : "User menu"}
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((open) => !open)}
        >
          {accountInitials}
        </button>
        {accountMenuOpen && (
          <div className="accountMenu" role="menu">
            <div className="accountMenuHeader">
              <div className="accountAvatar">{accountInitials}</div>
              <div>
                <strong>{signedIn ? "Signed in" : "Signed out"}</strong>
                <small>{accountLabel}</small>
              </div>
            </div>
            <div className="accountMenuTheme" role="group" aria-label="Color mode">
              <span>Theme</span>
              <div className="themeToggle compact">
                <button className={colorMode === "light" ? "selected" : ""} onClick={() => setColorMode("light")}>Light</button>
                <button className={colorMode === "dark" ? "selected" : ""} onClick={() => setColorMode("dark")}>Dark</button>
              </div>
            </div>
            {signedIn ? (
              <button role="menuitem" className="danger" onClick={() => void logoutAccount()}>
                <X size={14} />
                Log out
              </button>
            ) : (
              <button role="menuitem" onClick={() => void signInAccount()}>
                <BookOpen size={14} />
                Sign in with Okta
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function Sidebar({
  view,
  work,
  skills,
  connectors,
  workspaces,
  chatSessions,
  changeRequests,
  agents,
  memoryBanks,
  dojoState,
  selectedWorkspaceId,
  selectedSessionId,
  setSelectedWorkspaceId,
  setSelectedSessionId,
  setSelectedWorkId,
  setView,
}: {
  view: ViewId;
  work: ActiveWorkItem[];
  skills: SkillMetadata[];
  connectors: ConnectorStatus[];
  workspaces: WorkspaceSummary[];
  chatSessions: ChatSession[];
  changeRequests: LinkChangeRequest[];
  agents: AgentSummary[];
  memoryBanks: MemoryBank[];
  dojoState: DojoState | null;
  selectedWorkspaceId: string;
  selectedSessionId: string;
  setSelectedWorkspaceId: (id: string) => void;
  setSelectedSessionId: (id: string) => void;
  setSelectedWorkId: (id: string) => void;
  setView: (view: ViewId) => void;
}) {
  const pendingCount = work.filter((item) => item.status === "pending").length + changeRequests.filter((item) => item.status === "pending_review").length;
  return (
    <aside className="sidebar">
      <div className="searchBox">
        <Search size={15} />
        <input placeholder="Search..." />
      </div>
      <SidebarSection title="Workspaces" count={workspaces.length} icon={<Grid2X2 size={13} />} active={view === "workspaces"}>
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            className={`sideRow ${selectedWorkspaceId === workspace.id ? "selected" : ""}`}
            onClick={() => {
              setSelectedWorkspaceId(workspace.id);
              setView("workspaces");
            }}
          >
            <span>
              <strong>{workspace.name}</strong>
              <small>{workspace.tabs.length} tabs - {workspace.fileCount} files</small>
            </span>
            <StatusDot tone={workspace.status === "review" ? "warning" : workspace.status === "active" ? "success" : "muted"} />
          </button>
        ))}
      </SidebarSection>
      <SidebarSection title="Pending" count={pendingCount} icon={<Bell size={13} />}>
        {work.slice(0, 3).map((item) => (
          <button
            key={item.id}
            className="sideRow slim"
            onClick={() => {
              setSelectedWorkId(item.id);
              setView("workspaces");
            }}
          >
            <span>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </span>
            <StatusDot tone={item.status === "pending" ? "warning" : "muted"} />
          </button>
        ))}
      </SidebarSection>
      <SidebarSection title="Chat" count={chatSessions.length} icon={<MessageSquare size={13} />} compact active={view === "chats"}>
        {chatSessions.slice(0, 4).map((session) => (
          <button
            key={session.id}
            className={`sideRow slim ${selectedSessionId === session.id ? "selected" : ""}`}
            onClick={() => {
              setSelectedSessionId(session.id);
              setView("chats");
            }}
          >
            <span>
              <strong>{session.title}</strong>
              <small>{session.model}</small>
            </span>
            <StatusDot tone={session.status === "active" ? "success" : "muted"} />
          </button>
        ))}
      </SidebarSection>
      <SidebarSection title="Tasks" count={0} icon={<BoardIcon size={13} />} compact active={view === "workboard"} />
      <SidebarSection title="Phone" count={1} icon={<Phone size={13} />} compact active={view === "phone"} />
      <SidebarSection title="Agents" count={agents.length} icon={<Bot size={13} />} compact active={view === "agents"} />
      <SidebarSection title="Library" count={6} icon={<BookOpen size={13} />} compact active={view === "explorer"} />
      <SidebarSection title="Memory" count={memoryBanks.length} icon={<Vault size={13} />} compact active={view === "memory"} />
      <SidebarSection title="Experto" count={dojoState?.profile.masteredSkills ?? 0} icon={<ChessKnight size={13} />} compact active={view === "dojo"} />
    </aside>
  );
}

function SidebarSection({
  title,
  count,
  icon,
  children,
  compact,
  active,
}: {
  title: string;
  count: number;
  icon: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  active?: boolean;
}) {
  return (
    <section className={`sideSection ${compact ? "compact" : ""} ${active ? "active" : ""}`}>
      <div className="sideSectionTitle">
        {icon}
        <span>{title}</span>
        <em>{count}</em>
      </div>
      {children}
    </section>
  );
}

function TabStrip({
  view,
  setView,
  chatSessions,
  openChatTabIds,
  selectedSessionId,
  selectSession,
  closeSession,
  openWidgetLibrary,
}: {
  view: ViewId;
  setView: (view: ViewId) => void;
  chatSessions: ChatSession[];
  openChatTabIds: string[];
  selectedSessionId: string;
  selectSession: (id: string) => void;
  closeSession: (id: string) => void;
  openWidgetLibrary: () => void;
}) {
  const current = viewMeta[view];
  const CurrentIcon = current.icon;
  const openChatTabs = openChatTabIds
    .map((id) => chatSessions.find((session) => session.id === id))
    .filter((session): session is ChatSession => Boolean(session));
  const addLabel = view === "chats" ? "New chat" : view === "widgets" ? "Open widget library" : "Add widget to home";
  return (
    <div className="tabStrip">
      {view === "chats" ? (
        openChatTabs.length > 0 ? (
          openChatTabs.map((session) => (
            <button
              className={`tabPill chatTab ${selectedSessionId === session.id ? "selected" : ""}`}
              key={session.id}
              onClick={() => selectSession(session.id)}
            >
              <MessageSquare size={14} />
              <span>{session.title}</span>
              <span
                className="tabClose"
                role="button"
                tabIndex={0}
                aria-label={`Close ${session.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  closeSession(session.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    closeSession(session.id);
                  }
                }}
              >
                <X size={13} />
              </span>
            </button>
          ))
        ) : (
          <button className="tabPill selected" onClick={() => selectSession("")}>
            <MessageSquare size={14} />
            New chat
          </button>
        )
      ) : (
        <button className="tabPill active" onClick={() => setView(view)}>
          <CurrentIcon size={14} />
          {current.label}
        </button>
      )}
      <button
        className="tabAdd"
        title={addLabel}
        aria-label={addLabel}
        onClick={() => {
          if (view === "chats") selectSession("");
          else openWidgetLibrary();
        }}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function WorkspacesView({
  workspaces,
  work,
  automations,
  changeRequests,
  selectedWorkspace,
  selectedWork,
  selectWorkspace,
  selectWork,
  decideWork,
  approveChange,
  dismissChange,
  refresh,
}: {
  workspaces: WorkspaceSummary[];
  work: ActiveWorkItem[];
  automations: AutomationItem[];
  changeRequests: LinkChangeRequest[];
  selectedWorkspace?: WorkspaceSummary;
  selectedWork?: ActiveWorkItem;
  selectWorkspace: (id: string) => void;
  selectWork: (id: string) => void;
  decideWork: (id: string, decision: "approve" | "dismiss") => Promise<void>;
  approveChange: (id: string) => Promise<void>;
  dismissChange: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}) {
  async function createDraft() {
    await linkApi.createSharedChannelDraft({
      title: "Generated customer-safe update",
      userPrompt: "Draft a customer-safe update for Acme about the SMS delivery investigation.",
      requestedAction: "post update to shared customer Slack channel",
      threadContext:
        "Internal note: see #support-escalations. Raw log trace id msg-891. Customer impact appears limited to delayed SMS delivery in US traffic.",
    });
    await refresh();
  }

  return (
    <section className="content workspacesView">
      <header className="pageHeader">
        <div>
          <h1>Workspaces</h1>
        </div>
        <div className="headerActions">
          <button className="button secondary" onClick={createDraft}>
            <Plus size={15} />
            Draft update
          </button>
        </div>
      </header>

      <div className="workspaceGrid">
        {workspaces.map((workspace) => (
          <button key={workspace.id} className={`workspaceCard ${selectedWorkspace?.id === workspace.id ? "selected" : ""}`} onClick={() => selectWorkspace(workspace.id)}>
            <div className="workspaceCardTop">
              <strong>{workspace.name}</strong>
              <Badge tone={workspace.status === "review" ? "warning" : workspace.status === "active" ? "success" : "default"}>{workspace.status}</Badge>
            </div>
            <p>{workspace.description}</p>
            <div className="workspaceStats">
              <span>{workspace.tabs.length} tabs</span>
              <span>{workspace.fileCount} files</span>
              <span>{workspace.activeWorkIds.length} active</span>
            </div>
          </button>
        ))}
      </div>

      {selectedWorkspace && (
        <>
          <div className="sectionLabel">
            <ChevronDown size={14} />
            Open tabs
          </div>
          <div className="tabGrid">
            {selectedWorkspace.tabs.map((tab) => (
              <article className="workspaceTabCard" key={tab.id}>
                <FileText size={17} />
                <div>
                  <strong>{tab.title}</strong>
                  <small>{tab.kind} - {tab.status}</small>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="sectionLabel">
        <ChevronDown size={14} />
        Active work and admin review
      </div>
      <div className="workspaceDetailGrid">
        <div className="reviewQueue">
          {work.map((item) => (
            <button key={item.id} className={`reviewQueueRow ${selectedWork?.id === item.id ? "selected" : ""}`} onClick={() => selectWork(item.id)}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <StatusDot tone={item.status === "pending" ? "warning" : item.status === "approved" ? "success" : "muted"} />
            </button>
          ))}
          {changeRequests.map((request) => (
            <article className="changeRequestRow" key={request.id}>
              <div>
                <strong>{request.title}</strong>
                <small>{request.status.replaceAll("_", " ")}</small>
              </div>
              <div className="rowActions">
                {request.status === "pending_review" && (
                  <>
                    <button className="button primary" onClick={() => approveChange(request.id)}>Approve</button>
                    <button className="button ghost" onClick={() => dismissChange(request.id)}>Dismiss</button>
                  </>
                )}
                {request.github?.prUrl && <Badge tone="success">PR queued</Badge>}
              </div>
            </article>
          ))}
        </div>
        <ActiveWorkArtifact selectedWork={selectedWork} decideWork={decideWork} />
      </div>

      <div className="sectionLabel">
        <ChevronDown size={14} />
        Automations
      </div>
      <div className="automationStrip">
        {automations.map((automation) => (
          <Panel title={automation.name} key={automation.id}>
            <Badge tone={automation.status === "active" ? "success" : "default"}>{automation.status}</Badge>
            <p>{automation.schedule} in {automation.channel}</p>
          </Panel>
        ))}
      </div>
    </section>
  );
}

function ActiveWorkArtifact({
  selectedWork,
  decideWork,
}: {
  selectedWork?: ActiveWorkItem;
  decideWork: (id: string, decision: "approve" | "dismiss") => Promise<void>;
}) {
  if (!selectedWork) return <Panel title="No work selected"><p>Select a review item to inspect content and approval state.</p></Panel>;

  return (
    <article className="artifactCard">
      <div className="artifactChrome">
        <strong>customer-safe-draft.md</strong>
        <span>{selectedWork.summary}</span>
        <FileText size={16} />
      </div>
      <div className="artifactBody">
        <h2>{selectedWork.title}</h2>
        <p className="draftText">{selectedWork.details.customerSafeDraft}</p>
        <div className="artifactFooter">
          <div>
            <strong>Sources</strong>
            <small>{selectedWork.details.sourcesUsed.join(", ")}</small>
          </div>
          {selectedWork.status === "pending" && (
            <div className="headerActions">
              <button className="button primary" onClick={() => decideWork(selectedWork.id, "approve")}>Approve</button>
              <button className="button ghost" onClick={() => decideWork(selectedWork.id, "dismiss")}>Dismiss</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function WidgetsView({
  libraryOpen,
  setLibraryOpen,
}: {
  libraryOpen: boolean;
  setLibraryOpen: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | WidgetLibraryItem["category"]>("All");
  const [layoutEditing, setLayoutEditing] = useState(false);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(() =>
    widgetLibrary.slice(0, 3).map((widget, index) => ({
      ...widget,
      instanceId: `starter-${widget.id}-${index}`,
    })),
  );

  const filteredLibrary = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return widgetLibrary.filter((widget) => {
      const matchesCategory = category === "All" || widget.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [widget.title, widget.source, widget.category, widget.description].some((field) => field.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function addWidget(widget: WidgetLibraryItem) {
    setDashboardWidgets((current) => {
      if (current.some((item) => item.id === widget.id)) return current;
      return [...current, { ...widget, instanceId: `${widget.id}-${current.length + 1}` }];
    });
  }

  function removeWidget(instanceId: string) {
    setDashboardWidgets((current) => current.filter((widget) => widget.instanceId !== instanceId));
  }

  return (
    <section className="content widgetsView">
      <header className="pageHeader">
        <div>
          <h1>Widgets</h1>
        </div>
        <div className="headerActions">
          <button className="button secondary" onClick={() => setLibraryOpen(true)}>
            <Plus size={15} />
            Widget library
          </button>
          <button className={`button secondary ${layoutEditing ? "active" : ""}`} onClick={() => setLayoutEditing((editing) => !editing)} aria-pressed={layoutEditing}>
            <LayoutDashboard size={15} />
            {layoutEditing ? "Done" : "Manage layout"}
          </button>
        </div>
      </header>

      <div className="widgetHomeGrid">
        {libraryOpen ? (
          <section className="widgetLibrary widgetLibraryTakeover" aria-label="Widget library">
            <div className="widgetLibraryHeader">
              <div>
                <strong>Widget library</strong>
                <small>Browse reports employees can add to their home page</small>
              </div>
              <button className="button ghost" onClick={() => setLibraryOpen(false)}>
                <X size={14} />
                Close
              </button>
            </div>
            <div className="widgetLibraryControls">
              <div className="widgetSearch">
                <Search size={15} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports" autoFocus />
              </div>
              <div className="widgetCategoryTabs" role="tablist" aria-label="Widget categories">
                {(["All", "Revenue", "Operations", "Product"] as const).map((item) => (
                  <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="widgetLibraryList">
              {filteredLibrary.map((widget) => {
                const added = dashboardWidgets.some((item) => item.id === widget.id);
                return (
                  <article className="widgetLibraryItem" key={widget.id}>
                    <div className="widgetLibraryItemTop">
                      <div className="connectorIcon">{sourceInitials(widget.source)}</div>
                      <div>
                        <strong>{widget.title}</strong>
                        <small>{widget.source} - {widget.category}</small>
                      </div>
                    </div>
                    <p>{widget.description}</p>
                    <button className="button secondary" onClick={() => addWidget(widget)} disabled={added}>
                      <Plus size={14} />
                      {added ? "Added" : "Add widget"}
                    </button>
                  </article>
                );
              })}
              {filteredLibrary.length === 0 && <EmptyState title="No widgets found" body="Try another report name, source, or category." />}
            </div>
          </section>
        ) : (
          <section className="widgetCanvas" aria-label="Home widgets">
            <div className="widgetCanvasHeader">
              <div>
                <strong>Home view</strong>
                <small>Personal report snapshots</small>
              </div>
            </div>
            <div className={`dashboardWidgetGrid ${layoutEditing ? "layoutEditing" : ""}`}>
              {dashboardWidgets.map((widget) => (
                <article className="dashboardWidget" key={widget.instanceId}>
                  <div className="widgetCardTop">
                    <div className="connectorIcon">{sourceInitials(widget.source)}</div>
                    <div>
                      <strong>{widget.title}</strong>
                      <small>{widget.source} - {widget.cadence}</small>
                    </div>
                    <button className="iconButton" aria-label={`Remove ${widget.title}`} onClick={() => removeWidget(widget.instanceId)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="widgetMetric">
                    <span>{widget.metric}</span>
                    <small>{widget.trend}</small>
                  </div>
                  <div className="widgetChartPreview" aria-hidden="true">
                    <span style={{ height: "48%" }} />
                    <span style={{ height: "72%" }} />
                    <span style={{ height: "55%" }} />
                    <span style={{ height: "84%" }} />
                    <span style={{ height: "66%" }} />
                    <span style={{ height: "91%" }} />
                  </div>
                  <p>{widget.description}</p>
                </article>
              ))}
              {dashboardWidgets.length === 0 && (
                <EmptyState title="No widgets added" body="Add reports from the widget library to build your home page." />
              )}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function ExplorerView({ selectedWorkspace }: { selectedWorkspace?: WorkspaceSummary }) {
  const [query, setQuery] = useState("Messaging delivery escalation");
  const [results, setResults] = useState<ExplorerResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function search() {
    setBusy(true);
    setResults(await linkApi.searchExplorer({ query, workspaceId: selectedWorkspace?.id }));
    setBusy(false);
  }

  useEffect(() => {
    void search();
  }, [selectedWorkspace?.id]);

  return (
    <section className="content explorerView">
      <header className="pageHeader">
        <div>
          <h1>Library</h1>
        </div>
      </header>
      <div className="explorerSearch">
        <Search size={16} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void search()} />
        <button className="button primary" onClick={search} disabled={busy}>{busy ? "Searching" : "Search"}</button>
      </div>
      <div className="explorerResults">
        {results.map((result) => (
          <article className="explorerResult" key={result.id}>
            <div className="connectorIcon">{sourceInitials(result.source)}</div>
            <div>
              <div className="connectorTitle">
                <strong>{result.title}</strong>
                <Badge tone={result.permission === "allowed" ? "success" : result.permission === "needs_access" ? "warning" : "default"}>{result.permission.replace("_", " ")}</Badge>
              </div>
              <p>{result.excerpt}</p>
              <small>{result.source.replace("_", " ")} - {result.type} - {result.freshness}</small>
            </div>
            <button className="button secondary">Open</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MarketplaceView({ embedded = false }: { embedded?: boolean } = {}) {
  const installedCount = marketplaceApps.filter((app) => app.status === "Installed").length;
  const vpnCount = marketplaceApps.filter((app) => app.installMode === "VPN access").length;

  return (
    <section className={embedded ? "marketplaceView embeddedMarketplace" : "content marketplaceView"}>
      <header className={embedded ? "pageHeader marketplaceEmbeddedHeader" : "pageHeader"}>
        <div>
          <h1>App Marketplace</h1>
        </div>
        <div className="headerActions">
          <button className="button secondary">
            <Plus size={15} />
            Publish app
          </button>
        </div>
      </header>

      <div className="marketplaceSummary">
        <section className="marketplaceSummaryCard">
          <span>Employee apps</span>
          <strong>{marketplaceApps.length}</strong>
          <p>Apps created by Telnyx teams for local Link installs or employee VPN access.</p>
        </section>
        <section className="marketplaceSummaryCard">
          <span>Installed locally</span>
          <strong>{installedCount}</strong>
          <p>Apps already available on this device through the local Link runtime.</p>
        </section>
        <section className="marketplaceSummaryCard">
          <span>VPN access</span>
          <strong>{vpnCount}</strong>
          <p>Apps hosted on internal pages and reachable only from Telnyx network access.</p>
        </section>
      </div>

      <section className="marketplacePublish">
        <div>
          <Store size={18} />
          <div>
            <strong>Publish an app for Telnyx employees</strong>
            <p>Package a bot-owned workflow, define the audience, and choose whether employees install it locally or open the internal page over VPN.</p>
          </div>
        </div>
        <button className="button primary">Start publishing</button>
      </section>

      <div className="marketplaceGrid">
        {marketplaceApps.map((app) => (
          <article className="marketplaceCard" key={app.id}>
            <div className="marketplaceCardHeader">
              <div className="marketplaceIcon">
                <Store size={18} />
              </div>
              <div>
                <strong>{app.name}</strong>
                <small>{app.publisher}</small>
              </div>
              <Badge tone={app.status === "Installed" ? "success" : app.status === "Reviewing" ? "warning" : "default"}>{app.status}</Badge>
            </div>
            <p>{app.description}</p>
            <div className="marketplaceMeta">
              <span><Bot size={13} /> {app.bot}</span>
              <span><Users size={13} /> {app.audience}</span>
              <span><ShieldCheck size={13} /> {app.installMode}</span>
            </div>
            <div className="marketplaceActions">
              <button className={app.status === "Installed" ? "button ghost" : "button secondary"}>
                {app.status === "Installed" ? "Installed" : app.installMode === "VPN access" ? "Open via VPN" : "Install locally"}
              </button>
              <button className="button ghost">Details</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ChatsView({
  sessions,
  workspaces,
  selectedSession,
  selectSession,
  openArtifact,
}: {
  sessions: ChatSession[];
  workspaces: WorkspaceSummary[];
  selectedSession?: ChatSession;
  selectSession: (id: string) => void;
  openArtifact: (artifact: ChatArtifact) => void;
}) {
  const sessionsByWorkspace = workspaces.map((workspace) => ({
    workspace,
    sessions: sessions.filter((session) => session.workspaceId === workspace.id),
  }));
  const ungroupedSessions = sessions.filter((session) => !workspaces.some((workspace) => workspace.id === session.workspaceId));

  return (
    <section className="content chatView canonicalChat">
      <header className="pageHeader">
        <div>
          <h1>Chat</h1>
        </div>
      </header>
      <div className="chatDirectoryLayout">
        <nav className="chatDirectory" aria-label="Chat and projects">
          <div className="chatDirectorySectionTitle">Projects</div>
          {sessionsByWorkspace.map(({ workspace, sessions: workspaceSessions }) => (
            <section className="projectGroup" key={workspace.id}>
              <div className="projectGroupHeader">
                <FolderOpen size={16} />
                <span>{workspace.name}</span>
              </div>
              <div className="projectChatRows">
                {workspaceSessions.slice(0, 6).map((session, index) => (
                  <button key={session.id} className={`projectChatRow ${selectedSession?.id === session.id ? "selected" : ""}`} onClick={() => selectSession(session.id)}>
                    <span>{session.title}</span>
                    <kbd>⌘{index + 1}</kbd>
                  </button>
                ))}
                {workspaceSessions.length > 6 && <button className="showMoreChats">Show more</button>}
                {workspaceSessions.length === 0 && <span className="noProjectChats">No chats</span>}
              </div>
            </section>
          ))}
          <div className="chatDirectorySectionTitle">Chat</div>
          <div className="projectChatRows">
            {ungroupedSessions.map((session, index) => (
              <button key={session.id} className={`projectChatRow ${selectedSession?.id === session.id ? "selected" : ""}`} onClick={() => selectSession(session.id)}>
                <span>{session.title}</span>
                <kbd>⌘{index + 7}</kbd>
              </button>
            ))}
            {ungroupedSessions.length === 0 && <span className="noProjectChats">No standalone chats</span>}
          </div>
        </nav>
        <div className="chatSessionPreview">
          <div>
            <small>Selected chat</small>
            <h2>{selectedSession?.title ?? "No chat selected"}</h2>
            <p>{selectedSession ? `${selectedSession.messages.filter((message) => message.role !== "system").length} messages · ${formatModelLabel(selectedSession.model)}` : "Choose a chat from the project table or start a new one in the assistant."}</p>
          </div>
          <div className="chatPreviewMessages">
            {(selectedSession?.messages ?? []).filter((message) => message.role !== "system").slice(-4).map((message) => (
              <div key={message.id} className={`message ${message.role === "user" ? "you" : "link"}`}>
                <strong>{message.role === "user" ? "You" : "Telnyx Link"}</strong>
                <p>{message.content}</p>
                <MessageArtifacts artifacts={message.artifacts} openArtifact={openArtifact} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MessageArtifacts({ artifacts, openArtifact }: { artifacts?: ChatArtifact[]; openArtifact: (artifact: ChatArtifact) => void }) {
  if (!artifacts?.length) return null;

  return (
    <div className="messageArtifacts">
      {artifacts.map((artifact) => (
        <button key={artifact.id} className="messageArtifactLink" onClick={() => openArtifact(artifact)}>
          <FileText size={14} />
          <span>{artifact.filename}</span>
        </button>
      ))}
    </div>
  );
}

function ArtifactViewer({ artifact, onClose }: { artifact: ChatArtifact; onClose: () => void }) {
  return (
    <section className="content artifactViewer">
      <header className="pageHeader">
        <div>
          <h1>{artifact.title}</h1>
          <p>{artifact.filename} - generated from chat</p>
        </div>
        <div className="headerActions">
          <Badge tone={artifact.kind === "pdf" ? "warning" : "default"}>{artifact.kind.toUpperCase()}</Badge>
          <button className="button secondary" onClick={onClose}>
            <X size={15} />
            Close
          </button>
        </div>
      </header>
      <article className={`artifactDocument artifactDocument-${artifact.kind}`}>
        {artifact.kind === "pdf" && (
          <div className="pdfPreviewChrome">
            <FileText size={18} />
            <span>PDF preview</span>
          </div>
        )}
        <pre>{artifact.content}</pre>
      </article>
    </section>
  );
}

function AssistantPanel({
  mode,
  setMode,
  agents,
  selectedSession,
  selectedWorkspace,
  selectSession,
  openArtifact,
  refresh,
  setView,
}: {
  mode: "chat" | "phone";
  setMode: (mode: "chat" | "phone") => void;
  agents: AgentSummary[];
  selectedSession?: ChatSession;
  selectedWorkspace?: WorkspaceSummary;
  selectSession: (id: string) => void;
  openArtifact: (artifact: ChatArtifact) => void;
  refresh: () => Promise<void>;
  setView: (view: ViewId) => void;
}) {
  const [prompt, setPrompt] = useState("Brief me on Acme Messaging and open escalations.");
  const [busy, setBusy] = useState(false);
  const [changeBusy, setChangeBusy] = useState(false);
  const [changeStatus, setChangeStatus] = useState("");
  const [rescueBusy, setRescueBusy] = useState(false);
  const [rescueStatus, setRescueStatus] = useState("");
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);
  const [agentQuery, setAgentQuery] = useState("");
  const [selectedChatAgentId, setSelectedChatAgentId] = useState("");
  const [assistantActionsOpen, setAssistantActionsOpen] = useState(false);
  const [assistantSettingsOpen, setAssistantSettingsOpen] = useState(false);
  const [acceptMode, setAcceptMode] = useState<"auto" | "review" | "manual">("auto");
  const [modelMode, setModelMode] = useState("default-litellm");
  const [contextScope, setContextScope] = useState("workspace");
  const rescueAgent = agents.find((agent) => agent.id === "slack-bot-troubleshooting" || agent.name === "bot-troubleshooting");
  const chatAgents = useMemo(() => {
    return agents
      .filter((agent) => agent.id !== "slack-bot-troubleshooting" && agent.name !== "bot-troubleshooting")
      .map((agent) => ({
        id: agent.id,
        displayName: agent.displayName,
        description: agent.description,
        source: agent.source,
        type: agent.type,
        status: agent.status,
        squad: agent.squad ?? "directory",
      }));
  }, [agents]);
  const selectedChatAgent = chatAgents.find((agent) => agent.id === selectedChatAgentId) ?? chatAgents[0];
  const filteredChatAgents = chatAgents.filter((agent) =>
    `${agent.displayName} ${agent.description} ${agent.type} ${agent.source} ${agent.squad}`.toLowerCase().includes(agentQuery.toLowerCase()),
  );

  useEffect(() => {
    if (chatAgents.length === 0) {
      if (selectedChatAgentId) setSelectedChatAgentId("");
      return;
    }
    if (!chatAgents.some((agent) => agent.id === selectedChatAgentId)) {
      setSelectedChatAgentId(chatAgents[0]!.id);
    }
  }, [chatAgents, selectedChatAgentId]);

  async function send() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setBusy(true);
    const session = await linkApi.sendChatMessage({
      sessionId: selectedSession?.id,
      workspaceId: selectedWorkspace?.id,
      content: trimmed,
      agentId: selectedChatAgent?.id,
      agentName: selectedChatAgent?.displayName,
      approvalMode: acceptMode,
      modelMode,
      contextScope,
    });
    selectSession(session.id);
    setPrompt("");
    await refresh();
    setBusy(false);
  }

  async function requestImprovement() {
    setChangeBusy(true);
    setChangeStatus("");
    try {
      await linkApi.createChangeRequest({
        title: "Link improvement from assistant",
        summary: "User requested a product improvement from the persistent assistant panel.",
        requestedChange: prompt.trim() || "Review the current assistant context and propose a Link improvement.",
        workspaceId: selectedWorkspace?.id,
        sourceSessionId: selectedSession?.id,
      });
      await refresh();
      setChangeStatus("Created a Link change request for admin review.");
    } catch (err) {
      setChangeStatus(err instanceof Error ? err.message : "Unable to create Link change request.");
    } finally {
      setChangeBusy(false);
    }
  }

  async function requestAgentRescue() {
    if (!rescueAgent) {
      setView("agents");
      return;
    }
    setRescueBusy(true);
    setRescueStatus("");
    try {
      const message = [
        "Link agent rescue request",
        `Workspace: ${selectedWorkspace?.name ?? "Not selected"}`,
        `Chat session: ${selectedSession?.title ?? "Not selected"}`,
        `Model: ${selectedSession?.model ?? "Not selected"}`,
        "",
        prompt.trim() || "A user needs help troubleshooting an OpenClaw or Hermes agent from Link.",
      ].join("\n");
      const result = await linkApi.sendAgentMessage({ agentId: rescueAgent.id, content: message });
      setRescueStatus(result.message);
    } catch (err) {
      setRescueStatus(err instanceof Error ? err.message : "Unable to reach bot-troubleshooting.");
    } finally {
      setRescueBusy(false);
    }
  }

  return (
    <aside className="assistantPanel" aria-label="Assistant">
      <div className="assistantTabs">
        <button className={mode === "chat" ? "selected" : ""} onClick={() => setMode("chat")}><MessageSquare size={15} />Chat</button>
        <button className={mode === "phone" ? "selected" : ""} onClick={() => setMode("phone")}><Phone size={15} />Phone</button>
      </div>
      {mode === "chat" ? (
        <>
          <div className="assistantHeader">
            <button className="button secondary" onClick={() => selectSession("")}>
              <Plus size={15} />
              New Chat
            </button>
            <div className="assistantHeaderActions">
              <button className="iconButton assistantOverflowButton" title="More actions" aria-label="More assistant actions" aria-expanded={assistantActionsOpen} onClick={() => setAssistantActionsOpen((open) => !open)}>
                <SlidersHorizontal size={15} />
              </button>
              {assistantActionsOpen && (
                <div className="assistantActionMenu" role="menu" aria-label="Assistant actions">
                  <button role="menuitem" title="Send this prompt to the Slack bot-troubleshooting agent" onClick={() => { setAssistantActionsOpen(false); void requestAgentRescue(); }} disabled={rescueBusy}>
                    <Slack size={15} />
                    <span>{rescueBusy ? "Sending" : "Message Slack bot"}</span>
                  </button>
                  <button role="menuitem" title="Create an admin-reviewed Link change request" onClick={() => { setAssistantActionsOpen(false); void requestImprovement(); }} disabled={changeBusy}>
                    <GitPullRequestDraft size={15} />
                    <span>{changeBusy ? "Creating" : "Request Link change"}</span>
                  </button>
                  <button role="menuitem" title="Open Settings credentials" onClick={() => { setAssistantActionsOpen(false); setView("settings"); }}>
                    <Settings size={15} />
                    <span>Setup</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="assistantAgentPicker">
            <button className="agentPickerTrigger" onClick={() => setAgentPickerOpen((open) => !open)}>
              <Bot size={15} />
              <span>
                <strong>{selectedChatAgent?.displayName ?? "No connected agent"}</strong>
                <small>{selectedChatAgent?.description ?? "Sign in with Okta or refresh agents to load connected bots."}</small>
              </span>
              <ChevronDown size={15} />
            </button>
            {agentPickerOpen && (
              <div className="agentPickerMenu">
                <div className="agentPickerSearch">
                  <Search size={14} />
                  <input value={agentQuery} onChange={(event) => setAgentQuery(event.target.value)} placeholder="Search connected agents" />
                </div>
                <div className="agentPickerList">
                  {filteredChatAgents.map((agent) => (
                    <button
                      key={agent.id}
                      className={selectedChatAgentId === agent.id ? "selected" : ""}
                      onClick={() => {
                        setSelectedChatAgentId(agent.id);
                        setAgentPickerOpen(false);
                        setAgentQuery("");
                      }}
                    >
                      <span className="agentPickerAvatar"><Bot size={14} /></span>
                      <span>
                        <strong>{agent.displayName}</strong>
                        <small>{agent.description}</small>
                      </span>
                      <em>{agent.source}</em>
                    </button>
                  ))}
                  {filteredChatAgents.length === 0 && (
                    <div className="agentPickerEmpty">
                      No connected agents found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {rescueStatus && (
            <div className={`assistantNotice ${rescueStatus.includes("SLACK_") ? "warning" : ""}`}>
              <p>{rescueStatus}</p>
              {rescueStatus.includes("SLACK_") && (
                <button className="button secondary" onClick={() => setView("settings")}>
                  <Settings size={14} />
                  Open Slack credentials
                </button>
              )}
            </div>
          )}
          {changeStatus && <div className="assistantNotice"><p>{changeStatus}</p></div>}
          <div className="assistantLog">
            {(selectedSession?.messages ?? []).filter((message) => message.role !== "system").map((message) => (
              <div key={message.id} className={`assistantMessage ${message.role === "user" ? "you" : "link"}`}>
                <strong>{message.role === "user" ? "You" : "Telnyx Link"}</strong>
                <p>{message.content}</p>
                <MessageArtifacts artifacts={message.artifacts} openArtifact={openArtifact} />
              </div>
            ))}
            {!selectedSession && <div className="assistantEmpty">Start with a prompt. Link will route through Telnyx LiteLLM when configured.</div>}
          </div>
          <div className="assistantComposer">
            <textarea
              value={prompt}
              placeholder="Reply..."
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void send();
              }}
            />
            <div className="assistantComposerActions">
              <div className="assistantComposerTools">
                <button className="iconButton" title="Attach context"><Plus size={16} /></button>
                <button className="iconButton assistantSettingsTrigger" title="Chat settings" aria-label="Chat settings" onClick={() => setAssistantSettingsOpen((open) => !open)} aria-expanded={assistantSettingsOpen}>
                  <SlidersHorizontal size={16} />
                </button>
              </div>
              <button className="button primary sendSwordButton" aria-label={busy ? "Thinking" : "Send"} title={busy ? "Thinking" : "Send"} onClick={send} disabled={busy}>
                <SwordIcon size={18} />
              </button>
            </div>
          </div>
          <div className="assistantSettingsDock">
            {assistantSettingsOpen && (
              <div className="assistantSettingsPopover" role="dialog" aria-label="Chat settings">
                <header>
                  <strong>Chat settings</strong>
                  <button className="iconButton" aria-label="Close chat settings" onClick={() => setAssistantSettingsOpen(false)}>
                    <X size={14} />
                  </button>
                </header>
                <label className="assistantSettingField">
                  <span>Approval mode</span>
                  <select value={acceptMode} onChange={(event) => setAcceptMode(event.target.value as typeof acceptMode)}>
                    <option value="auto">Auto Accept</option>
                    <option value="review">Ask before actions</option>
                    <option value="manual">Manual only</option>
                  </select>
                </label>
                <label className="assistantSettingField">
                  <span>Model route</span>
                  <select value={modelMode} onChange={(event) => setModelMode(event.target.value)}>
                    <option value="default-litellm">Default - LiteLLM</option>
                    <option value="opus">Opus via LiteLLM</option>
                    <option value="fast">Fast LiteLLM</option>
                  </select>
                </label>
                <label className="assistantSettingField">
                  <span>Context scope</span>
                  <select value={contextScope} onChange={(event) => setContextScope(event.target.value)}>
                    <option value="workspace">{selectedWorkspace?.name ?? "~/Link"}</option>
                    <option value="session">Current chat only</option>
                    <option value="none">No workspace context</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="panelPhonePlaceholder">
            <Phone size={22} />
            <strong>Configure phone first on Phone page</strong>
            <p>Add your Telnyx API key in Settings, then ask the bot to set up calling. Link can handle the phone number, dialer, and Voice AI setup for you.</p>
          </div>
        </>
      )}
    </aside>
  );
}

function SkillsView({ skills }: { skills: SkillMetadata[] }) {
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [result, setResult] = useState("");
  const filtered = skills.filter((skill) => `${skill.name} ${skill.description} ${skill.team}`.toLowerCase().includes(query.toLowerCase()));

  async function runSelected() {
    const name = selectedSkill || filtered[0]?.name;
    if (!name) return;
    const response = await linkApi.runSkill(name);
    setSelectedSkill(name);
    setResult(JSON.stringify(response, null, 2));
  }

  return (
    <section className="content skillsView">
      <header className="pageHeader">
        <div>
          <h1>Skills</h1>
        </div>
        <div className="headerActions">
          <button className="button primary" onClick={runSelected}>
            <Play size={15} />
            Run selected
          </button>
        </div>
      </header>
      <div className="explorerSearch compactSearch">
        <Search size={16} />
        <input value={query} placeholder="Search skills..." onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="skillCatalog">
        {filtered.slice(0, 40).map((skill) => (
          <button key={skill.name} className={`skillCard ${selectedSkill === skill.name ? "selected" : ""}`} onClick={() => setSelectedSkill(skill.name)}>
            <div className="connectorTitle">
              <strong>{skill.name}</strong>
              <Badge tone={skill.source === "telnyx" ? "default" : skill.approvalRequired ? "warning" : "success"}>{skill.source ?? "link"}</Badge>
            </div>
            <p>{skill.description}</p>
            <small>{skill.team} - {skill.product ?? "workflow"} - {skill.language ?? "skill"}</small>
          </button>
        ))}
      </div>
      {result && <pre className="resultPreview">{result}</pre>}
    </section>
  );
}

function AgentsView({ agents, connectors, refresh }: { agents: AgentSummary[]; connectors: ConnectorStatus[]; refresh: () => Promise<void> }) {
  const [acpAuth, setAcpAuth] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [squadFilter, setSquadFilter] = useState("all");
  const [agentDrafts, setAgentDrafts] = useState<Record<string, string>>({});
  const [sendingAgentId, setSendingAgentId] = useState("");
  const [agentMessageStatus, setAgentMessageStatus] = useState("");
  const acpConnector = connectors.find((connector) => connector.id === "agent-control-plane");
  const rescueAgent = agents.find((agent) => agent.id === "slack-bot-troubleshooting" || agent.name === "bot-troubleshooting");
  const squads = useMemo(() => {
    return [...new Set(agents.map((agent) => agent.squad).filter((squad): squad is string => Boolean(squad)))].sort((left, right) =>
      left.localeCompare(right),
    );
  }, [agents]);
  const filteredAgents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return agents.filter((agent) => {
      const matchesSquad = squadFilter === "all" || agent.squad === squadFilter;
      const searchable = [
        agent.displayName,
        agent.name,
        agent.description,
        agent.type,
        agent.status,
        agent.squad,
        agent.audience,
        agent.origin,
        ...agent.capabilities,
      ].join(" ").toLowerCase();
      return matchesSquad && (!term || searchable.includes(term));
    });
  }, [agents, query, squadFilter]);

  async function refreshAuth() {
    setAcpAuth(await linkApi.getAgentControlPlaneAuthStatus());
  }

  useEffect(() => {
    void refreshAuth();
  }, []);

  async function signIn() {
    setBusy(true);
    setAcpAuth(await linkApi.signInAgentControlPlane());
    await refresh();
    setBusy(false);
  }

  async function sendAgent(agent: AgentSummary) {
    const content = agentDrafts[agent.id]?.trim();
    if (!content) return;
    setSendingAgentId(agent.id);
    setAgentMessageStatus("");
    try {
      const result = await linkApi.sendAgentMessage({ agentId: agent.id, content });
      setAgentMessageStatus(result.message);
      setAgentDrafts((current) => ({ ...current, [agent.id]: "" }));
    } catch (err) {
      setAgentMessageStatus(err instanceof Error ? err.message : "Unable to message Slack agent.");
    } finally {
      setSendingAgentId("");
    }
  }

  function draftRescue() {
    if (!rescueAgent) return;
    setAgentDrafts((current) => ({
      ...current,
      [rescueAgent.id]: current[rescueAgent.id] || "OpenClaw/Hermes agent issue:\n\nObserved behavior:\nExpected behavior:\nAgent or workflow URL:\nRecent error/log snippet:",
    }));
    setQuery("bot-troubleshooting");
    setSquadFilter("all");
  }

  return (
    <section className="content agentsView">
      <header className="pageHeader">
        <div>
          <h1>Agents</h1>
        </div>
        <button className="button secondary" onClick={signIn} disabled={busy || acpAuth?.ready}>
          {busy ? "Signing in" : acpAuth?.ready ? "Okta connected" : "Sign in with Okta"}
        </button>
      </header>
      <div className="settingsGrid">
        <Panel title="Agent Control Plane">
          <p>{acpAuth?.message ?? acpConnector?.description ?? "Check Agent Control Plane sign-in state."}</p>
          <div className="authMeta">
            <span>Okta session: {acpAuth?.signedIn ? "present" : "not connected"}</span>
            <span>Actor override: {acpAuth?.actorConfigured ? acpAuth.actor : "optional"}</span>
            <span>Squad context: {acpAuth?.onBehalfOfConfigured ? acpAuth.onBehalfOf : "optional"}</span>
            <span>Session cookies: {acpAuth?.cookieCount ?? 0}</span>
          </div>
        </Panel>
        <Panel title="A2A discovery">
          <p>Agents are loaded from the internal A2A discovery directory, with local filtering by name, capability, and squad.</p>
        </Panel>
      </div>
      <div className="rescueBanner">
        <div className="rescueIcon"><Bot size={18} /></div>
        <div>
          <strong>Agent rescue</strong>
          <p>Use bot-troubleshooting when OpenClaw, Hermes, ACP, or Slack agents are failing and the normal agent path is blocked.</p>
          <small>Slack member U0AR1M7T6GP - channel D0ASV9TTDJ7</small>
        </div>
        <button className="button primary" onClick={draftRescue} disabled={!rescueAgent}>Draft rescue request</button>
      </div>
      <div className="agentControls">
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents, skills, tools, or squads" />
        </div>
        <label className="agentFilter">
          <span>Squad</span>
          <select value={squadFilter} onChange={(event) => setSquadFilter(event.target.value)}>
            <option value="all">All squads</option>
            {squads.map((squad) => (
              <option key={squad} value={squad}>{squad}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="agentGrid">
        {filteredAgents.map((agent) => (
          <article className="agentCard" key={agent.id}>
            <div className="agentAvatar">{agent.displayName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="connectorTitle">
                <strong>{agent.displayName}</strong>
                <Badge tone={agent.source === "mock" ? "default" : agent.available === false ? "warning" : "success"}>{agent.visibility}</Badge>
              </div>
              <p>{agent.description}</p>
              <small>
                {[agent.squad, agent.type, agent.status, agent.origin].filter(Boolean).join(" - ")}
                {agent.slackChannel ? ` - ${agent.slackChannel}` : ""}
              </small>
            </div>
            <div className="tagList">
              {agent.capabilities.slice(0, 4).map((capability) => <span key={capability}>{capability}</span>)}
              {agent.requiresAuthentication && <span>requires auth</span>}
            </div>
            {(agent.source === "slack" || agent.type === "slack") && (
              <div className="agentMessageBox">
                <textarea
                  value={agentDrafts[agent.id] ?? ""}
                  onChange={(event) => setAgentDrafts((current) => ({ ...current, [agent.id]: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void sendAgent(agent);
                  }}
                  placeholder={`Message ${agent.displayName}`}
                />
                <button className="button secondary" onClick={() => void sendAgent(agent)} disabled={sendingAgentId === agent.id || !agentDrafts[agent.id]?.trim()}>
                  {sendingAgentId === agent.id ? "Sending" : "Send"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {agentMessageStatus && <div className="infoBanner">{agentMessageStatus}</div>}
      {filteredAgents.length === 0 && <EmptyState title="No agents found" body="Try a different search term or squad filter." />}
    </section>
  );
}

function WorkboardView({ agents }: { agents: AgentSummary[] }) {
  const [provider, setProvider] = useState<WorkboardProvider>("auto");
  const [boardId, setBoardId] = useState("");
  const [snapshot, setSnapshot] = useState<WorkboardSnapshot | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkboardStatus>("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [labels, setLabels] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const activeProvider = snapshot?.provider ?? provider;
  const availableProvider = snapshot?.providers.find((item) => item.id === activeProvider);
  const assignees = useMemo(() => {
    const agentAssignees = agents
      .filter((agent) => agent.type.toLowerCase().includes("hermes") || agent.type.toLowerCase().includes("openclaw"))
      .map((agent) => `${agent.type}:${agent.name}`);
    return [...new Set([...(snapshot?.assignees ?? []), ...agentAssignees])].sort((left, right) => left.localeCompare(right));
  }, [agents, snapshot?.assignees]);

  const filteredCards = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (snapshot?.cards ?? []).filter((card) => {
      const matchesStatus = statusFilter === "all" || card.status === statusFilter;
      const searchable = [
        card.title,
        card.body,
        card.status,
        card.assignee,
        card.provider,
        card.tenant,
        card.workspace,
        ...card.labels,
        ...(card.diagnostics ?? []),
        ...(card.proof ?? []),
        ...(card.artifacts ?? []),
      ].join(" ").toLowerCase();
      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [snapshot?.cards, query, statusFilter]);

  async function load(nextProvider = provider, nextBoardId = boardId) {
    setBusy(true);
    setError("");
    try {
      const nextSnapshot = await linkApi.listWorkboard({ provider: nextProvider, boardId: nextBoardId || undefined });
      setSnapshot(nextSnapshot);
      setBoardId(nextSnapshot.boardId === "unavailable" ? nextBoardId : nextSnapshot.boardId);
    } catch (loadError) {
      setError(String(loadError instanceof Error ? loadError.message : loadError));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load("auto", "");
  }, []);

  async function selectProvider(nextProvider: WorkboardProvider) {
    setProvider(nextProvider);
    await load(nextProvider, boardId);
  }

  async function createCard() {
    const trimmed = title.trim();
    if (!trimmed || !snapshot) return;
    setBusy(true);
    setError("");
    try {
      const nextSnapshot = await linkApi.createWorkboardCard({
        provider: activeProvider,
        boardId: boardId || undefined,
        title: trimmed,
        body: body.trim() || undefined,
        assignee: assignee || undefined,
        priority,
        labels: labels.split(",").map((label) => label.trim()).filter(Boolean),
        status: activeProvider === "hermes" ? "todo" : "triage",
      });
      setSnapshot(nextSnapshot);
      setTitle("");
      setBody("");
      setLabels("");
    } catch (createError) {
      setError(String(createError instanceof Error ? createError.message : createError));
    } finally {
      setBusy(false);
    }
  }

  async function updateCard(card: WorkboardCard, status: WorkboardStatus) {
    setBusy(true);
    setError("");
    try {
      setSnapshot(await linkApi.updateWorkboardCard({ provider: card.provider, boardId: card.boardId, cardId: card.id, status }));
    } catch (updateError) {
      setError(String(updateError instanceof Error ? updateError.message : updateError));
    } finally {
      setBusy(false);
    }
  }

  async function dispatch() {
    if (!snapshot) return;
    setBusy(true);
    setError("");
    try {
      setSnapshot(await linkApi.dispatchWorkboard({ provider: activeProvider, boardId: boardId || undefined }));
    } catch (dispatchError) {
      setError(String(dispatchError instanceof Error ? dispatchError.message : dispatchError));
    } finally {
      setBusy(false);
    }
  }

  const columns = snapshot?.columns ?? [];

  return (
    <section className="content workboardView">
      <header className="pageHeader">
        <div>
          <h1>Tasks</h1>
        </div>
        <div className="headerActions">
          <button className="button secondary" onClick={() => load(provider, boardId)} disabled={busy}>
            <BoardIcon size={15} />
            Refresh
          </button>
          <button className="button primary" onClick={dispatch} disabled={busy || !snapshot}>
            <Play size={15} />
            Dispatch ready
          </button>
        </div>
      </header>

      {error && <div className="errorBanner">{error}</div>}

      <div className="workboardProviderGrid">
        {(snapshot?.providers ?? []).map((item) => (
          <button
            key={item.id}
            className={`providerTile ${activeProvider === item.id ? "selected" : ""}`}
            onClick={() => selectProvider(item.id)}
          >
            <span>
              <strong>{item.label}</strong>
              <small>{item.message}</small>
            </span>
            <Badge tone={item.available ? "success" : item.mode === "fallback" ? "warning" : "default"}>{item.mode}</Badge>
          </button>
        ))}
      </div>

      <div className="workboardToolbar">
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cards, labels, assignees, or diagnostics" />
        </div>
        <label className="agentFilter">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | WorkboardStatus)}>
            <option value="all">All statuses</option>
            {columns.map((status) => (
              <option key={status} value={status}>{formatStatusLabel(status)}</option>
            ))}
          </select>
        </label>
        <label className="agentFilter">
          <span>Board</span>
          <select value={boardId} onChange={(event) => {
            setBoardId(event.target.value);
            void load(provider, event.target.value);
          }}>
            {(snapshot?.boards.length ? snapshot.boards : [{ id: boardId || "local", name: boardId || "Current board", provider: activeProvider }]).map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="workboardSummary">
        {(snapshot?.stats ?? []).map((stat) => (
          <Panel title={stat.label} key={stat.label}>
            <strong className="metricValue">{stat.value}</strong>
          </Panel>
        ))}
      </div>

      <div className="workboardCreate">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New agent-sized task" />
        <input value={assignee} onChange={(event) => setAssignee(event.target.value)} list="workboardAssignees" placeholder="Assignee profile or agent" />
        <datalist id="workboardAssignees">
          {assignees.map((name) => <option key={name} value={name} />)}
        </datalist>
        <select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="low">Low</option>
        </select>
        <input value={labels} onChange={(event) => setLabels(event.target.value)} placeholder="labels, comma-separated" />
        <button className="button primary" onClick={createCard} disabled={busy || !title.trim()}>
          <Plus size={15} />
          Add card
        </button>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Outcome, constraints, acceptance criteria, artifacts, and handoff notes" />
      </div>

      <div className="kanbanBoard" style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(220px, 1fr))` }}>
        {columns.map((status) => {
          const cards = filteredCards.filter((card) => card.status === status);
          return (
            <section className="kanbanColumn" key={status}>
              <div className="kanbanColumnHeader">
                <strong>{formatStatusLabel(status)}</strong>
                <em>{cards.length}</em>
              </div>
              <div className="kanbanCardStack">
                {cards.map((card) => (
                  <article className="kanbanCard" key={card.id}>
                    <div className="connectorTitle">
                      <strong>{card.title}</strong>
                      <Badge tone={card.provider === "local" ? "warning" : "success"}>{card.provider}</Badge>
                    </div>
                    {card.body && <p>{card.body}</p>}
                    <div className="workboardMeta">
                      {card.assignee && <span><Users size={12} />{card.assignee}</span>}
                      <span><Clock size={12} />{relativeDate(card.updatedAt)}</span>
                      <span>{String(card.priority)}</span>
                    </div>
                    <div className="tagList">
                      {card.labels.slice(0, 5).map((label) => <span key={label}>{label}</span>)}
                    </div>
                    {(card.linkedSessionId || card.linkedRunId || card.linkedTaskId) && (
                      <small>{[card.linkedSessionId, card.linkedRunId, card.linkedTaskId].filter(Boolean).join(" - ")}</small>
                    )}
                    {(card.proof?.length || card.artifacts?.length || card.diagnostics?.length) && (
                      <div className="cardEvidence">
                        {[...(card.proof ?? []), ...(card.artifacts ?? []), ...(card.diagnostics ?? [])].slice(0, 3).map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    )}
                    <label className="statusControl">
                      <span>Move</span>
                      <select value={card.status} onChange={(event) => updateCard(card, event.target.value as WorkboardStatus)} disabled={busy}>
                        {columns.map((column) => (
                          <option key={column} value={column}>{formatStatusLabel(column)}</option>
                        ))}
                      </select>
                    </label>
                    {card.sourceUrl && (
                      <a className="textLink" href={card.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink size={13} />
                        Source
                      </a>
                    )}
                  </article>
                ))}
                {cards.length === 0 && <div className="kanbanEmpty">No cards</div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function PhoneView({ connectors }: { connectors: ConnectorStatus[] }) {
  const [tab, setTab] = useState<"setup" | "numbers" | "contacts" | "assistants" | "sip">("setup");
  const [telnyxCredentialReady, setTelnyxCredentialReady] = useState(false);
  const [displayName, setDisplayName] = useState("Telnyx Link Personal Phone");
  const [countryCode, setCountryCode] = useState("US");
  const [areaCode, setAreaCode] = useState("");
  const [locality, setLocality] = useState("");
  const [region, setRegion] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://link-phone-webhooks.telnyx.io/call-control");
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  const [voiceAssistantName, setVoiceAssistantName] = useState("Telnyx Link After-Hours Assistant");
  const [voiceAssistantMode, setVoiceAssistantMode] = useState<"after_hours" | "always" | "manual">("after_hours");
  const [voiceAssistantGreeting, setVoiceAssistantGreeting] = useState("Thanks for calling Telnyx. I can help route your call, capture urgency, or schedule a follow-up.");
  const [voiceAssistantInstructions, setVoiceAssistantInstructions] = useState(
    "Answer missed calls, qualify urgency, summarize next steps, and create a callback task. Never promise customer-visible action without human review.",
  );
  const [voiceAssistantLanguage, setVoiceAssistantLanguage] = useState("en-US");
  const [voiceAssistantVoice, setVoiceAssistantVoice] = useState("Telnyx Natural");
  const [voiceAssistantTemperature, setVoiceAssistantTemperature] = useState("0.3");
  const [voiceAssistantEscalationTarget, setVoiceAssistantEscalationTarget] = useState("link-owner");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago");
  const [weekdayHours, setWeekdayHours] = useState("09:00-17:00");
  const [saturdayHours, setSaturdayHours] = useState("closed");
  const [sundayHours, setSundayHours] = useState("closed");
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(true);
  const [googleCalendarId, setGoogleCalendarId] = useState("primary");
  const [googleCalendarMode, setGoogleCalendarMode] = useState<"free_busy_only" | "create_tentative_sales_calls">("free_busy_only");
  const [googleCalendarWebhookUrl, setGoogleCalendarWebhookUrl] = useState("https://link-phone-webhooks.telnyx.io/calendar");
  const [numbers, setNumbers] = useState<PhoneNumberOption[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumberOption | null>(null);
  const [plan, setPlan] = useState<PhoneSetupPlan | null>(null);
  const [provisionResult, setProvisionResult] = useState<PhoneProvisionResult | null>(null);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [dialNumber, setDialNumber] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [contactSource, setContactSource] = useState("all");
  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("Not connected");
  const [callStatus, setCallStatus] = useState("Idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientRef = useRef<any>(null);
  const activeCallRef = useRef<any>(null);
  const contactSources = [
    { id: "slack", label: "Slack" },
    { id: "google-drive", label: "Google Drive" },
    { id: "guru", label: "Guru" },
    { id: "telnyx", label: "Telnyx" },
  ];
  const connectedContactSourceIds = new Set(
    connectors
      .filter((connector) => connector.status === "connected" || connector.status === "signed_in")
      .map((connector) => connector.id),
  );
  const contactDirectory = [
    {
      id: "contact-pete",
      name: "Pete",
      role: "Link owner",
      phone: "+15551234567",
      source: "slack",
      detail: "Slack profile phone",
    },
    {
      id: "contact-ai-swe",
      name: "AI SWE Agent",
      role: "Internal agent support",
      phone: "+15557654321",
      source: "slack",
      detail: "AI-swe-Agent workspace contact",
    },
    {
      id: "contact-acme-primary",
      name: "Acme Primary Contact",
      role: "Customer escalation",
      phone: "+13125550120",
      source: "telnyx",
      detail: "Telnyx account contact",
    },
    {
      id: "contact-seb",
      name: "Seb Goodijn",
      role: "Project Glass / docs",
      phone: "+15559870010",
      source: "guru",
      detail: "Guru profile result",
    },
    {
      id: "contact-account-notes",
      name: "Acme QBR attendee",
      role: "Drive document mention",
      phone: "+13125550122",
      source: "google-drive",
      detail: "Google Drive contact reference",
    },
  ];
  const filteredContacts = contactDirectory.filter((contact) => {
    const matchesQuery = `${contact.name} ${contact.role} ${contact.phone} ${contact.detail}`.toLowerCase().includes(contactQuery.toLowerCase());
    const matchesSource = contactSource === "all" || contact.source === contactSource;
    return matchesQuery && matchesSource;
  });

  async function refreshCredentialStatus() {
    const groups = await linkApi.listCredentials();
    const telnyx = groups.find((group) => group.id === "telnyx");
    setTelnyxCredentialReady(Boolean(telnyx?.fields.some((field) => field.name === "TELNYX_API_KEY" && field.configured)));
  }

  useEffect(() => {
    void refreshCredentialStatus();
  }, []);

  async function searchNumbers() {
    setBusy(true);
    setError("");
    try {
      const results = await linkApi.searchPhoneNumbers({ countryCode, areaCode, locality, region });
      setNumbers(results);
      setSelectedNumber(results[0] ?? null);
      setPlan(null);
      setProvisionResult(null);
      setPurchaseConfirmed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to search numbers.");
    } finally {
      setBusy(false);
    }
  }

  async function previewSetup() {
    if (!selectedNumber) return;
    setBusy(true);
    setError("");
    try {
      const nextPlan = await linkApi.previewPhoneSetup(phoneSetupInput(selectedNumber.phoneNumber));
      setPlan(nextPlan);
      setProvisionResult(null);
      setPurchaseConfirmed(false);
      setSipUsername(nextPlan.sipUsername);
      setSipPassword(nextPlan.sipPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate setup plan.");
    } finally {
      setBusy(false);
    }
  }

  async function provisionSystem() {
    if (!selectedNumber || !purchaseConfirmed) return;
    setBusy(true);
    setError("");
    try {
      const result = await linkApi.provisionPhoneSystem(phoneSetupInput(selectedNumber.phoneNumber));
      setPlan(result);
      setProvisionResult(result);
      setSipUsername(result.sipUsername);
      setSipPassword(result.sipPassword);
      setPhoneStatus("Provisioned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to provision the phone system.");
    } finally {
      setBusy(false);
    }
  }

  async function connectSoftphone() {
    if (!sipUsername || !sipPassword) {
      setError("Generate a setup plan or enter SIP credentials before connecting.");
      return;
    }
    setError("");
    setPhoneStatus("Connecting");
    try {
      const { TelnyxRTC } = await import("@telnyx/webrtc");
      const client = new TelnyxRTC({ login: sipUsername, password: sipPassword });
      client.remoteElement = "phoneRemoteAudio";
      client
        .on("telnyx.ready", () => setPhoneStatus("Ready"))
        .on("telnyx.error", (event: unknown) => {
          setPhoneStatus("Error");
          setError(readTelnyxEventMessage(event, "Telnyx WebRTC connection error."));
        })
        .on("telnyx.notification", (notification: any) => {
          if (notification.call) {
            activeCallRef.current = notification.call;
            setCallStatus(notification.call.state ?? notification.type ?? "Call update");
          }
        });
      clientRef.current = client;
      client.connect();
    } catch (err) {
      setPhoneStatus("Error");
      setError(err instanceof Error ? err.message : "Unable to connect WebRTC softphone.");
    }
  }

  async function disconnectSoftphone() {
    activeCallRef.current = null;
    await clientRef.current?.disconnect?.();
    clientRef.current = null;
    setPhoneStatus("Not connected");
    setCallStatus("Idle");
  }

  function makeCall() {
    if (!clientRef.current || !dialNumber.trim()) return;
    const call = clientRef.current.newCall({
      destinationNumber: dialNumber.trim(),
      callerNumber: selectedNumber?.phoneNumber,
      audio: true,
      remoteElement: "phoneRemoteAudio",
    });
    activeCallRef.current = call;
    setCallStatus("Calling");
  }

  function hangupCall() {
    activeCallRef.current?.hangup?.();
    activeCallRef.current = null;
    setCallStatus("Idle");
  }

  function answerCall() {
    activeCallRef.current?.answer?.();
    setCallStatus("Answering");
  }

  function toggleMute() {
    activeCallRef.current?.toggleAudioMute?.();
  }

  function toggleHold() {
    activeCallRef.current?.toggleHold?.();
  }

  function phoneSetupInput(phoneNumber: string) {
    return {
      phoneNumber,
      displayName,
      webhookUrl,
      voiceAssistantEnabled,
      voiceAssistantName,
      voiceAssistantMode,
      voiceAssistantGreeting,
      voiceAssistantInstructions,
      voiceAssistantLanguage,
      voiceAssistantVoice,
      voiceAssistantTemperature,
      voiceAssistantEscalationTarget,
      timezone,
      workHours: {
        mondayToFriday: weekdayHours,
        saturday: saturdayHours,
        sunday: sundayHours,
      },
      googleCalendarEnabled,
      googleCalendarId,
      googleCalendarMode,
      googleCalendarWebhookUrl,
    };
  }

  return (
    <section className="content phoneView">
      <header className="pageHeader">
        <div>
          <h1>Phone</h1>
          <p><span className={telnyxCredentialReady ? "statusDot connected" : "statusDot warning"} />Telnyx phone setup, contacts, AI assistants, and SIP/WebRTC registration.</p>
        </div>
      </header>

      <div className="settingsTabs phoneTabs" role="tablist" aria-label="Phone sections">
        {[
          { id: "setup", label: "Setup" },
          { id: "numbers", label: "Numbers" },
          { id: "contacts", label: "Contacts" },
          { id: "assistants", label: "AI Assistants" },
          { id: "sip", label: "SIP / WebRTC" },
        ].map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "selected" : ""}
            onClick={() => setTab(item.id as typeof tab)}
            role="tab"
            aria-selected={tab === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "setup" && (
      <div className="phoneSetupGrid">
        <Panel title="Account setup">
          <div className="formGrid">
            <label className="componentField">
              <span>Soft phone name</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
            <label className="componentField">
              <span>Webhook relay</span>
              <input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
            </label>
          </div>
          <p>{telnyxCredentialReady ? "Telnyx API access is configured in Settings." : "Add TELNYX_API_KEY in Settings before searching or provisioning numbers."} Use a hosted HTTPS relay for Call Control webhooks.</p>
        </Panel>

        <Panel title="Readiness">
          <div className="phoneReadiness">
            <span><strong>Telnyx API</strong>{telnyxCredentialReady ? "Connected" : "Add key in Settings"}</span>
            <span><strong>Webhook relay</strong>{webhookUrl}</span>
            <span><strong>Calendar relay</strong>{googleCalendarEnabled ? googleCalendarWebhookUrl : "Disabled"}</span>
            <span><strong>WebRTC</strong>{phoneStatus}</span>
          </div>
          <button className="button secondary" onClick={() => setTab("numbers")}>Choose a number</button>
        </Panel>
      </div>
      )}

      {tab === "assistants" && (
      <div className="phoneAssistantGrid">
        <Panel title="Voice AI assistant">
          <label className="confirmPurchase assistantToggle">
            <input type="checkbox" checked={voiceAssistantEnabled} onChange={(event) => setVoiceAssistantEnabled(event.target.checked)} />
            <span>Answer inbound calls with a Telnyx Voice AI assistant when routing rules match.</span>
          </label>
          <div className="formGrid">
            <label className="componentField">
              <span>Assistant name</span>
              <input value={voiceAssistantName} onChange={(event) => setVoiceAssistantName(event.target.value)} disabled={!voiceAssistantEnabled} />
            </label>
            <label className="componentField">
              <span>Answering mode</span>
              <select value={voiceAssistantMode} onChange={(event) => setVoiceAssistantMode(event.target.value as typeof voiceAssistantMode)} disabled={!voiceAssistantEnabled}>
                <option value="after_hours">After hours and missed calls</option>
                <option value="always">Always screen calls</option>
                <option value="manual">Manual / webhook-controlled</option>
              </select>
            </label>
          </div>
          <p>Link creates a Telnyx AI Assistant with telephony enabled and instructs the Call Control webhook to start it for matching inbound calls.</p>
        </Panel>

        <Panel title="Create assistant">
          <div className="formGrid">
            <label className="componentField">
              <span>Greeting</span>
              <textarea value={voiceAssistantGreeting} onChange={(event) => setVoiceAssistantGreeting(event.target.value)} disabled={!voiceAssistantEnabled} />
            </label>
            <label className="componentField">
              <span>Assistant instructions</span>
              <textarea value={voiceAssistantInstructions} onChange={(event) => setVoiceAssistantInstructions(event.target.value)} disabled={!voiceAssistantEnabled} />
            </label>
            <div className="phoneSearchGrid">
              <label className="componentField">
                <span>Language</span>
                <input value={voiceAssistantLanguage} onChange={(event) => setVoiceAssistantLanguage(event.target.value)} disabled={!voiceAssistantEnabled} />
              </label>
              <label className="componentField">
                <span>Voice</span>
                <input value={voiceAssistantVoice} onChange={(event) => setVoiceAssistantVoice(event.target.value)} disabled={!voiceAssistantEnabled} />
              </label>
              <label className="componentField">
                <span>Temperature</span>
                <input value={voiceAssistantTemperature} onChange={(event) => setVoiceAssistantTemperature(event.target.value)} disabled={!voiceAssistantEnabled} />
              </label>
              <label className="componentField">
                <span>Escalation target</span>
                <input value={voiceAssistantEscalationTarget} onChange={(event) => setVoiceAssistantEscalationTarget(event.target.value)} disabled={!voiceAssistantEnabled} />
              </label>
            </div>
          </div>
          <div className="phoneButtonRow">
            <button className="button secondary" onClick={previewSetup} disabled={!selectedNumber || busy || !telnyxCredentialReady}>Preview assistant setup</button>
            <button className="button primary" onClick={provisionSystem} disabled={!purchaseConfirmed || busy || Boolean(provisionResult) || !voiceAssistantEnabled}>
              Create with Telnyx API
            </button>
          </div>
          <p>{selectedNumber ? `Assistant will be attached to ${selectedNumber.phoneNumber} when provisioning is approved.` : "Select a number first in the Numbers tab before creating an assistant."}</p>
        </Panel>

        <Panel title="Availability and calendar">
          <div className="phoneSearchGrid">
            <label className="componentField">
              <span>Timezone</span>
              <input value={timezone} onChange={(event) => setTimezone(event.target.value)} disabled={!voiceAssistantEnabled} />
            </label>
            <label className="componentField">
              <span>Weekday hours</span>
              <input value={weekdayHours} onChange={(event) => setWeekdayHours(event.target.value)} placeholder="09:00-17:00" disabled={!voiceAssistantEnabled} />
            </label>
            <label className="componentField">
              <span>Saturday</span>
              <input value={saturdayHours} onChange={(event) => setSaturdayHours(event.target.value)} placeholder="closed" disabled={!voiceAssistantEnabled} />
            </label>
            <label className="componentField">
              <span>Sunday</span>
              <input value={sundayHours} onChange={(event) => setSundayHours(event.target.value)} placeholder="closed" disabled={!voiceAssistantEnabled} />
            </label>
          </div>
          <label className="confirmPurchase assistantToggle">
            <input type="checkbox" checked={googleCalendarEnabled} onChange={(event) => setGoogleCalendarEnabled(event.target.checked)} disabled={!voiceAssistantEnabled} />
            <span>Use Google Calendar availability before proposing sales-call times.</span>
          </label>
          <div className="formGrid">
            <label className="componentField">
              <span>Calendar ID</span>
              <input value={googleCalendarId} onChange={(event) => setGoogleCalendarId(event.target.value)} disabled={!voiceAssistantEnabled || !googleCalendarEnabled} />
            </label>
            <label className="componentField">
              <span>Calendar action</span>
              <select value={googleCalendarMode} onChange={(event) => setGoogleCalendarMode(event.target.value as typeof googleCalendarMode)} disabled={!voiceAssistantEnabled || !googleCalendarEnabled}>
                <option value="free_busy_only">Check availability only</option>
                <option value="create_tentative_sales_calls">Create tentative sales-call holds</option>
              </select>
            </label>
            <label className="componentField wideField">
              <span>Calendar webhook</span>
              <input value={googleCalendarWebhookUrl} onChange={(event) => setGoogleCalendarWebhookUrl(event.target.value)} disabled={!voiceAssistantEnabled || !googleCalendarEnabled} />
            </label>
          </div>
          <p>Google Calendar OAuth still belongs in Link’s webhook service; the Telnyx assistant calls this endpoint for free/busy checks and optional tentative holds.</p>
        </Panel>
      </div>
      )}

      {tab === "contacts" && (
      <div className="phoneSetupGrid">
        <Panel title="Contact search">
          <div className="contactSearchControls">
            <label className="componentField">
              <span>Find contact</span>
              <input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Search connected contacts..." />
            </label>
            <label className="componentField">
              <span>Source</span>
              <select value={contactSource} onChange={(event) => setContactSource(event.target.value)}>
                <option value="all">All connected sources</option>
                {contactSources.map((source) => (
                  <option key={source.id} value={source.id}>{source.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="contactResults">
            {filteredContacts.map((contact) => {
              const source = contactSources.find((item) => item.id === contact.source);
              const connected = connectedContactSourceIds.has(contact.source);
              return (
                <button
                  key={contact.id}
                  className="contactResult"
                  onClick={() => setDialNumber(contact.phone)}
                  disabled={!connected}
                  title={connected ? `Use ${contact.phone}` : `Connect ${source?.label ?? contact.source} first`}
                >
                  <span>
                    <strong>{contact.name}</strong>
                    <small>{contact.role} - {contact.phone}</small>
                  </span>
                  <em className={connected ? "contactSourceBadge connected" : "contactSourceBadge"}>{connected ? source?.label : "connect source"}</em>
                </button>
              );
            })}
            {filteredContacts.length === 0 && <div className="contactEmpty">No matching contacts from connected sources.</div>}
          </div>
          <p>Contacts resolve through connected sources in Agent Plugins. Link never shows hidden tokens or stores imported contact secrets in the renderer.</p>
        </Panel>

        <Panel title="Selected contact">
          <p>{dialNumber ? `${dialNumber} is ready for the softphone dialer once SIP is connected.` : "Choose a contact to prefill the softphone dialer."}</p>
          <button className="button secondary" onClick={() => setDialNumber("")} disabled={!dialNumber}>Clear selected contact</button>
        </Panel>
      </div>
      )}

      {error && <div className="errorBanner">{error}</div>}

      {tab === "numbers" && (
        <>
        <div className="phoneSetupGrid">
          <Panel title="Number search">
            <div className="phoneSearchGrid">
              <label className="componentField">
                <span>Country</span>
                <input value={countryCode} onChange={(event) => setCountryCode(event.target.value.toUpperCase())} />
              </label>
              <label className="componentField">
                <span>Area code</span>
                <input value={areaCode} onChange={(event) => setAreaCode(event.target.value)} placeholder="312" />
              </label>
              <label className="componentField">
                <span>City</span>
                <input value={locality} onChange={(event) => setLocality(event.target.value)} placeholder="Chicago" />
              </label>
              <label className="componentField">
                <span>State</span>
                <input value={region} onChange={(event) => setRegion(event.target.value.toUpperCase())} placeholder="IL" />
              </label>
            </div>
            <button className="button primary" onClick={searchNumbers} disabled={busy || !telnyxCredentialReady}>{busy ? "Searching" : "Search voice numbers"}</button>
          </Panel>

          <Panel title="Purchase review">
            <p>{selectedNumber ? `${selectedNumber.phoneNumber} is selected. Link will show the number order before placing it.` : "Search and choose a number to review purchase details."}</p>
            <button className="button secondary" onClick={previewSetup} disabled={!selectedNumber || busy || !telnyxCredentialReady}>Generate setup plan</button>
            {plan && (
              <>
                <label className="confirmPurchase">
                  <input type="checkbox" checked={purchaseConfirmed} onChange={(event) => setPurchaseConfirmed(event.target.checked)} />
                  <span>I understand this will create Telnyx resources, purchase {selectedNumber?.phoneNumber} in this account, and {voiceAssistantEnabled ? "create a Telnyx Voice AI assistant for inbound call handling." : "not create an AI assistant."}</span>
                </label>
                <button className="button primary" onClick={provisionSystem} disabled={!purchaseConfirmed || busy || Boolean(provisionResult)}>
                  {busy ? "Provisioning" : provisionResult ? "Provisioned" : "Purchase & provision"}
                </button>
                <pre className="resultPreview">{JSON.stringify({ purchaseReview: plan.purchaseReview, warning: plan.warning }, null, 2)}</pre>
              </>
            )}
            {provisionResult && (
              <div className="provisionSummary">
                <span>Status: {provisionResult.status}</span>
                <span>Credential connection: {provisionResult.credentialConnectionId}</span>
                <span>Call Control app: {provisionResult.callControlApplicationId}</span>
                {provisionResult.voiceAssistantId && <span>Voice AI assistant: {provisionResult.voiceAssistantId}</span>}
                <span>Number order: {provisionResult.numberOrderId} ({provisionResult.numberOrderStatus})</span>
              </div>
            )}
          </Panel>
        </div>

      {numbers.length > 0 && (
        <div className="numberResults">
          {numbers.map((number) => (
            <button
              className={`numberOption ${selectedNumber?.phoneNumber === number.phoneNumber ? "selected" : ""}`}
              key={number.phoneNumber}
              onClick={() => setSelectedNumber(number)}
            >
              <strong>{number.phoneNumber}</strong>
              <span>{[number.locality, number.region, number.type].filter(Boolean).join(" - ") || number.countryCode}</span>
              <small>{[number.monthlyCost && `${number.monthlyCost}/mo`, number.upfrontCost && `${number.upfrontCost} upfront`].filter(Boolean).join(" - ") || "Telnyx inventory"}</small>
            </button>
          ))}
        </div>
      )}
        </>
      )}

      {tab === "sip" && (
      <div className="phoneSetupGrid">
        <Panel title="Softphone">
          <div className="phoneStatus">
            <span>Registration: {phoneStatus}</span>
            <span>Call: {callStatus}</span>
          </div>
          <div className="phoneButtonRow">
            <button className="button secondary" onClick={connectSoftphone} disabled={phoneStatus === "Ready"}><PhoneCall size={15} />Connect</button>
            <button className="button ghost" onClick={disconnectSoftphone}><PhoneOff size={15} />Disconnect</button>
          </div>
          <audio id="phoneRemoteAudio" autoPlay />
          <div className="dialer">
            <input value={dialNumber} onChange={(event) => setDialNumber(event.target.value)} placeholder="+15551234567" />
            <button className="button primary" onClick={makeCall} disabled={phoneStatus !== "Ready" || !dialNumber}><PhoneCall size={15} />Call</button>
          </div>
          <div className="phoneActions">
            <button className="button ghost" onClick={answerCall}>Answer</button>
            <button className="button ghost" onClick={toggleMute}>Mute</button>
            <button className="button ghost" onClick={toggleHold}>Hold</button>
            <button className="button secondary" onClick={hangupCall}><PhoneOff size={15} />Hang up</button>
          </div>
          <div className="formGrid">
            <label className="componentField">
              <span>SIP username</span>
              <input value={sipUsername} onChange={(event) => setSipUsername(event.target.value)} />
            </label>
            <label className="componentField">
              <span>SIP password</span>
              <input type="password" value={sipPassword} onChange={(event) => setSipPassword(event.target.value)} />
            </label>
          </div>
        </Panel>
      </div>
      )}

      {tab === "numbers" && plan && (
        <div className="phonePlan">
          <Panel title="Provisioning plan">
            <div className="tagList">
              {plan.steps.map((step) => <span key={step}>{step}</span>)}
            </div>
            <pre className="resultPreview">{JSON.stringify(plan.resources, null, 2)}</pre>
            {plan.voiceAssistant?.enabled && <pre className="resultPreview">{JSON.stringify(plan.voiceAssistant, null, 2)}</pre>}
          </Panel>
        </div>
      )}
    </section>
  );
}

function readTelnyxEventMessage(event: unknown, fallback: string) {
  if (typeof event === "object" && event && "error" in event) {
    const error = (event as { error?: { message?: string } }).error;
    return error?.message ?? fallback;
  }
  return fallback;
}

function ConnectionsView({
  connectors,
  tools,
  refresh,
  openSettings,
  embedded = false,
}: {
  connectors: ConnectorStatus[];
  tools: ToolMetadata[];
  refresh: () => Promise<void>;
  openSettings: () => void;
  embedded?: boolean;
}) {
  async function connectConnector(id: string) {
    if (id === "agent-control-plane") {
      await linkApi.signInAgentControlPlane();
      await refresh();
      return;
    }
    openSettings();
  }

  const grouped = useMemo(() => {
    return {
      read: tools.filter((tool) => tool.capability === "read"),
      write: tools.filter((tool) => tool.capability !== "read"),
      interactive: tools.filter((tool) => tool.approvalRequired || tool.riskLevel === "high"),
    };
  }, [tools]);

  return (
    <section className={embedded ? "connectionsView embeddedSettingsPanel" : "content connectionsView"}>
      <header className={embedded ? "pageHeader embeddedSettingsHeader" : "pageHeader"}>
        <div>
          <h1>Agent Plugins</h1>
        </div>
      </header>
      <div className="connectorList">
        {connectors.map((connector) => (
          <article className="connectorCard" key={connector.id}>
            <div className="connectorIcon">{connector.name.slice(0, 2).toUpperCase()}</div>
            <div className="connectorBody">
              <div className="connectorTitle">
                <strong>{connector.name}</strong>
                <Badge tone={connector.status === "connected" ? "success" : connector.status === "requested" || connector.status === "signed_in" ? "warning" : "danger"}>
                  {connectorStatusLabel(connector.status)}
                </Badge>
              </div>
              <p>{connector.description}</p>
              <small>{connector.category} - {connectorModeLabel(connector)}</small>
            </div>
            <button className={connector.status === "connected" ? "button ghost" : "button secondary"} disabled={connector.status === "connected" || connector.status === "signed_in"} onClick={() => connectConnector(connector.id)}>
              {connectorButtonLabel(connector)}
            </button>
          </article>
        ))}
      </div>
      <ToolGroup title="Read-only tools" tools={grouped.read} />
      <ToolGroup title="Write/delete tools" tools={grouped.write} />
      <ToolGroup title="Interactive tools" tools={grouped.interactive} />
    </section>
  );
}

function ToolGroup({ title, tools }: { title: string; tools: ToolMetadata[] }) {
  return (
    <div className="permissionGroup">
      <div className="sectionLabel">
        <ChevronDown size={14} />
        {title}
      </div>
      {tools.map((tool) => (
        <div className="permissionRow" key={`${title}-${tool.name}`}>
          <div>
            <strong>{tool.name}</strong>
            <small>{tool.description}</small>
          </div>
          <Segmented selected={tool.approvalRequired ? "Ask" : tool.outputCanBeShownExternally ? "Allow" : "Auto"} />
        </div>
      ))}
    </div>
  );
}

function MemoryView({ banks, openMemory }: { banks: MemoryBank[]; openMemory: () => void }) {
  const [tab, setTab] = useState<"overview" | "documents" | "memories" | "entities" | "prompt" | "settings">("overview");
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id ?? "");
  const [query, setQuery] = useState("What did we decide about Link improvement requests?");
  const [documentText, setDocumentText] = useState("");
  const [entityQuery, setEntityQuery] = useState("");
  const [minMentions, setMinMentions] = useState(1);
  const [recall, setRecall] = useState<MemoryRecallResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [recallError, setRecallError] = useState("");
  const [recallRan, setRecallRan] = useState(false);
  const selectedBank = banks.find((bank) => bank.id === selectedBankId) ?? banks[0];
  const isKeyScopedBank = selectedBank?.id === "hindsight-key-scoped";
  const memoryTabs = [
    { id: "overview", label: "Overview", icon: Grid2X2 },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "memories", label: "Memories", icon: Vault },
    { id: "entities", label: "Entities", icon: Tags },
    { id: "prompt", label: "Prompt", icon: SquareTerminal },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  async function runRecall() {
    setBusy(true);
    setRecallError("");
    setRecallRan(true);
    try {
      setRecall(await linkApi.recallMemory({ query, bankId: isKeyScopedBank ? undefined : selectedBank?.id }));
    } catch (error) {
      setRecall([]);
      setRecallError(error instanceof Error ? error.message : "Hindsight recall failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="content memoryView">
      <header className="pageHeader">
        <div>
          <h1>Memory Bank</h1>
          <p><span className={selectedBank ? "statusDot connected" : "statusDot warning"} />{selectedBank ? selectedBank.mission : "Connect Hindsight or create a bank to start using long-term memory."}</p>
        </div>
        <div className="headerActions">
          <label className="memoryBankPicker">
            <span>Agent bank</span>
            <select value={selectedBank?.id ?? ""} onChange={(event) => setSelectedBankId(event.target.value)} disabled={banks.length === 0}>
              {banks.length === 0 ? <option value="">No banks connected</option> : banks.map((bank) => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
          </label>
          <button className="button primary" onClick={openMemory}>Refresh memory bank</button>
        </div>
      </header>

      <div className="memoryTabs" role="tablist" aria-label="Memory bank sections">
        {memoryTabs.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={tab === item.id ? "selected" : ""} onClick={() => setTab(item.id)} role="tab" aria-selected={tab === item.id}>
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <>
          <Panel title="Hindsight credentials">
            <p>Hindsight access is configured in Settings. Link lets Hindsight infer the active bank from the saved credential.</p>
            <div className="authMeta">
              <span>Memory bank scope: {isKeyScopedBank ? "inferred from API key" : selectedBank?.id ?? "not connected"}</span>
            </div>
          </Panel>
          {banks.length > 0 ? (
            <div className="memoryGrid">
              {banks.map((bank) => (
                <Panel title={bank.name} key={bank.id}>
                  <Badge tone={bank.status === "connected" ? "success" : bank.status === "needs_key" ? "warning" : "default"}>{bank.status}</Badge>
                  <p>{bank.mission}</p>
                  <small>{bank.scope} - {bank.observationCount} observations - {bank.sourceCount} sources</small>
                </Panel>
              ))}
            </div>
          ) : (
            <Panel title="Hindsight not connected">
              <p>Save HINDSIGHT_API_KEY in Settings, then refresh memory. Link will not show mock memory banks when Hindsight is unavailable.</p>
            </Panel>
          )}
        </>
      )}

      {tab === "documents" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Documents</h2>
              <p>Upload files or add text. Hindsight converts and ingests them, then derives memories.</p>
            </div>
            <div className="headerActions">
              <button className="button secondary"><Upload size={15} />Upload files</button>
              <button className="button primary"><FileText size={15} />Add text</button>
            </div>
          </div>
          <div className="memoryTable">
            <div className="memoryTableHead documents"><span>Document</span><span>Memories</span><span>Created</span><span>Tags</span><span>Actions</span></div>
            <div className="memoryEmpty"><FileText size={26} /><span>No documents yet. Upload a file or add text to get started.</span></div>
          </div>
          <label className="componentField memoryTextCapture">
            <span>Quick add text</span>
            <textarea value={documentText} onChange={(event) => setDocumentText(event.target.value)} placeholder="Paste text that this bank should remember..." />
          </label>
        </div>
      )}

      {tab === "memories" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Memories</h2>
              <p>Browse the bank's memory units. Filter by fact type and tags, and open the source document where provenance allows.</p>
            </div>
            <span>{recall.length} shown</span>
          </div>
          <div className="memoryFilters">
            <div className="explorerSearch"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void runRecall()} placeholder="Search memories... (press Enter)" /></div>
            <select><option>All fact types</option></select>
            <select><option>All tags</option></select>
          </div>
          <div className="memoryTable">
            <div className="memoryTableHead memories"><span>Fact</span><span>Type</span><span>Tags</span><span>When</span><span>Source</span></div>
            {recall.length > 0 ? recall.map((item) => (
              <div className="memoryRow" key={item.id}>
                <strong>{item.summary}</strong><span>recall</span><span>{item.evidence.slice(0, 2).join(", ")}</span><span>{Math.round(item.score * 100)}%</span><span>{item.source}</span>
              </div>
            )) : <div className="memoryEmpty"><Vault size={26} /><span>No memories match the current filters.</span></div>}
          </div>
        </div>
      )}

      {tab === "entities" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Entities</h2>
              <p>Browse named entities Hindsight has extracted from this bank's memories. Click a row to see the memories that mention it.</p>
            </div>
            <span>0 shown</span>
          </div>
          <div className="memoryFilters">
            <div className="explorerSearch"><Search size={16} /><input value={entityQuery} onChange={(event) => setEntityQuery(event.target.value)} placeholder="Search entities..." /></div>
            <label className="memoryRange">Min mentions <input type="range" min="1" max="10" value={minMentions} onChange={(event) => setMinMentions(Number(event.target.value))} /> {minMentions}</label>
          </div>
          <div className="memoryTable">
            <div className="memoryTableHead entities"><span>Entity</span><span>Mentions</span><span>Last mentioned</span><span>First seen</span></div>
            <div className="memoryEmpty"><Tags size={26} /><span>No entities yet. Add memories to this bank and entities will appear as they're extracted.</span></div>
          </div>
        </div>
      )}

      {tab === "prompt" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Prompt</h2>
              <p>Interact with the memory bank: retain new memories, recall relevant facts, and reflect for a written answer.</p>
            </div>
          </div>
          <div className="memoryPromptModes"><button className="selected">Retain</button><button>Recall</button><button>Reflect</button></div>
          <div className="explorerSearch">
            <Vault size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void runRecall()} />
            <button className="button primary" onClick={runRecall} disabled={busy}>{busy ? "Recalling" : "Recall"}</button>
          </div>
          <div className="recallList">
            {recall.map((item) => (
              <Panel title={`${item.source} - ${Math.round(item.score * 100)}%`} key={item.id}>
                <p>{item.summary}</p>
                <small>{item.evidence.join(", ")}</small>
              </Panel>
            ))}
          </div>
          {recallError && <Panel title="Hindsight recall failed"><p>{recallError}</p></Panel>}
          {recallRan && !recallError && recall.length === 0 && (
            <Panel title="No Hindsight matches">
              <p>Hindsight responded successfully, but did not return memories for this query.</p>
            </Panel>
          )}
        </div>
      )}

      {tab === "settings" && (
        <Panel title="Bank settings">
          <div className="authMeta">
            <span>Mission: {selectedBank?.mission ?? "Not connected"}</span>
            <span>Scope: {selectedBank?.scope ?? "unknown"}</span>
            <span>Sources: {selectedBank?.sourceCount ?? 0}</span>
            <span>Observations: {selectedBank?.observationCount ?? 0}</span>
          </div>
        </Panel>
      )}
    </section>
  );
}

function DojoView({ dojoState, skills }: { dojoState: DojoState | null; skills: SkillMetadata[] }) {
  const [query, setQuery] = useState("");
  const [selectedSquad, setSelectedSquad] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [result, setResult] = useState("");
  const tones: DojoKit["tone"][] = ["blue", "orange", "teal", "pink", "purple", "green"];
  const squadKits = useMemo(() => {
    const grouped = new Map<string, SkillMetadata[]>();
    for (const skill of skills) {
      const squad = skill.team || "Telnyx";
      grouped.set(squad, [...(grouped.get(squad) ?? []), skill]);
    }
    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([squad, squadSkills], index) => ({
        id: squad,
        name: squad,
        description: `${squadSkills.length} skills from the Telnyx skills registry.`,
        mastered: squadSkills.filter((skill) => !skill.approvalRequired).length,
        total: squadSkills.length,
        tone: tones[index % tones.length],
      }));
  }, [skills]);
  const filteredSkills = skills.filter((skill) => {
    const haystack = `${skill.name} ${skill.description} ${skill.team} ${skill.product ?? ""}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesSquad = selectedSquad === "all" || skill.team === selectedSquad;
    return matchesQuery && matchesSquad;
  });
  const selectedKit = squadKits.find((kit) => kit.id === selectedSquad);

  async function runSelected() {
    const name = selectedSkill || filteredSkills[0]?.name;
    if (!name) return;
    const response = await linkApi.runSkill(name);
    setSelectedSkill(name);
    setResult(JSON.stringify(response, null, 2));
  }

  if (!dojoState) return <EmptyState title="No Experto state" body="Training data will appear when the local Link state loads." />;
  const { profile, kits, sessions } = dojoState;
  const skillsToNextLevel = Math.max(0, profile.nextRankAt - profile.masteredSkills);

  return (
    <section className="content dojoView">
      <header className="pageHeader centered dojoHeader">
        <div className="dojoCard">
          <div className="dojoAvatar"><ChessKnight size={26} /></div>
          <div className="dojoProfileText">
            <h1>Experto</h1>
          </div>
          <div className="dojoStats">
            <Badge tone="skill">Level {profile.rank}</Badge>
            <strong>{profile.masteredSkills} skills mastered</strong>
            <small>{skillsToNextLevel} more to next level</small>
          </div>
          <button className="button primary" onClick={runSelected} disabled={filteredSkills.length === 0}>
            <Play size={15} />
            Start training
          </button>
        </div>
      </header>
      <div className="dojoToolbar">
        <label className="dojoSearchField">
          <Search size={16} />
          <input value={query} placeholder="Search skills..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select className="dojoSquadSelect" value={selectedSquad} onChange={(event) => setSelectedSquad(event.target.value)}>
          <option value="all">All squad kits</option>
          {squadKits.map((kit) => (
            <option key={kit.id} value={kit.id}>{kit.name}</option>
          ))}
        </select>
        <button className="button primary" onClick={runSelected} disabled={filteredSkills.length === 0}>
          <Play size={15} />
          Run selected
        </button>
      </div>
      <div className="sectionLabel centeredLabel">
        <Shirt size={14} />
        Squad kits
      </div>
      <div className="kitGrid squadKitGrid">
        {squadKits.map((kit) => (
          <button
            key={kit.id}
            className={`kitCard dojo-${kit.tone} ${selectedSquad === kit.id ? "selected" : ""}`}
            onClick={() => setSelectedSquad(selectedSquad === kit.id ? "all" : kit.id)}
          >
            <Shirt size={32} />
            <strong>{kit.name}</strong>
            <small>{kit.mastered}/{kit.total}</small>
            <p>{kit.description}</p>
          </button>
        ))}
      </div>
      <div className="sectionLabel centeredLabel">
        <Zap size={14} />
        {selectedKit ? `${selectedKit.name} skills` : "Installed skills"}
      </div>
      <div className="skillCatalog dojoSkillCatalog">
        {filteredSkills.slice(0, 60).map((skill) => (
          <button key={skill.name} className={`skillCard ${selectedSkill === skill.name ? "selected" : ""}`} onClick={() => setSelectedSkill(skill.name)}>
            <div className="connectorTitle">
              <strong>{skill.name}</strong>
              <Badge tone={skill.source === "telnyx" ? "default" : skill.approvalRequired ? "warning" : "success"}>{skill.team}</Badge>
            </div>
            <p>{skill.description}</p>
            <small>{skill.product ?? "workflow"} - {skill.language ?? "skill"} - {skill.approvalRequired ? "approval gated" : "ready"}</small>
          </button>
        ))}
      </div>
      {filteredSkills.length === 0 && <EmptyState title="No skills found" body="Try another search term or squad kit." />}
      {result && <pre className="resultPreview">{result}</pre>}
      <div className="sectionLabel centeredLabel">
        <Store size={14} />
        App marketplace
      </div>
      <MarketplaceView embedded />
      <div className="sectionLabel centeredLabel">
        <Zap size={14} />
        Training sessions
      </div>
      <div className="trainingGrid">
        {sessions.map((session) => (
          <Panel title={session.title} key={session.id}>
            <Badge tone={session.status === "complete" ? "success" : session.status === "running" ? "warning" : "default"}>{session.status}</Badge>
            <p>{session.target.replace("_", " ")} - {session.inputs.join(", ")}</p>
          </Panel>
        ))}
        <Panel title="Legacy kits">
          <p>{kits.map((kit) => `${kit.name} ${kit.mastered}/${kit.total}`).join(", ")}</p>
        </Panel>
      </div>
    </section>
  );
}

function SettingsView({ refresh, connectors, tools }: {
  refresh: () => Promise<void>;
  connectors: ConnectorStatus[];
  tools: ToolMetadata[];
}) {
  const [tab, setTab] = useState<"access" | "my-agents" | "plugins" | "credentials" | "design">("access");
  const [acpAuth, setAcpAuth] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [acpBusy, setAcpBusy] = useState(false);
  const [hostedAgents, setHostedAgents] = useState<HostedAgentSummary[]>([]);
  const [agentError, setAgentError] = useState("");
  const [credentials, setCredentials] = useState<CredentialGroupStatus[]>([]);
  const [credentialDrafts, setCredentialDrafts] = useState<Record<string, string>>({});
  const [savingCredential, setSavingCredential] = useState("");
  const [expandedCredentialId, setExpandedCredentialId] = useState("");
  const isAcpReady = Boolean(acpAuth?.ready);
  const requiredCredentials = useMemo(
    () => credentials.filter(isRequiredCredentialGroup).sort(compareCredentialGroups),
    [credentials],
  );
  const optionalCredentials = useMemo(
    () => credentials.filter((group) => !isRequiredCredentialGroup(group)).sort(compareCredentialGroups),
    [credentials],
  );

  async function refreshAgentControlPlane() {
    const nextAuth = await linkApi.getAgentControlPlaneAuthStatus();
    setAcpAuth(nextAuth);
    if (!nextAuth.ready) {
      setHostedAgents([]);
      return;
    }
    try {
      setAgentError("");
      setHostedAgents(await linkApi.listHostedAgents());
    } catch (err) {
      setHostedAgents([]);
      setAgentError(err instanceof Error ? err.message : "Unable to load Agent Control Plane agents.");
    }
  }

  async function refreshCredentials() {
    setCredentials(await linkApi.listCredentials());
  }

  useEffect(() => {
    void refreshAgentControlPlane();
    void refreshCredentials();
  }, []);

  async function signIn() {
    setAcpBusy(true);
    try {
      setAcpAuth(await linkApi.signInAgentControlPlane());
      await refresh();
      await refreshCredentials();
    } finally {
      setAcpBusy(false);
    }
  }

  async function signOut() {
    setAcpBusy(true);
    try {
      setAcpAuth(await linkApi.signOutAgentControlPlane());
      await refresh();
      await refreshCredentials();
    } finally {
      setAcpBusy(false);
    }
  }

  async function saveCredential(name: string) {
    const value = credentialDrafts[name]?.trim();
    if (!value) return;
    setSavingCredential(name);
    const nextCredentials = await linkApi.saveCredential({ name, value });
    setCredentials(nextCredentials);
    setCredentialDrafts((current) => ({ ...current, [name]: "" }));
    await refresh();
    setSavingCredential("");
  }

  function renderCredentialCard(group: CredentialGroupStatus) {
    const configuredCount = group.fields.filter((field) => field.configured).length;
    const missingCount = group.fields.length - configuredCount;
    const expanded = expandedCredentialId === group.id;

    return (
      <section className={`credentialCard ${expanded ? "expanded" : ""}`} key={group.id}>
        <button
          className="credentialSummary"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpandedCredentialId(expanded ? "" : group.id)}
        >
          <span className="credentialChevron" aria-hidden="true"><ChevronDown size={16} /></span>
          <span className="credentialSummaryText">
            <strong>{group.label}</strong>
            <small>{group.help}</small>
          </span>
          <span className="credentialSummaryStatus">
            <Badge tone={missingCount === 0 ? "success" : configuredCount > 0 ? "warning" : "danger"}>
              {configuredCount}/{group.fields.length} saved
            </Badge>
            {missingCount > 0 && <small>{missingCount} missing</small>}
          </span>
        </button>

        {expanded && (
          <div className="credentialFields">
            {group.fields.map((field) => (
              <div className="credentialRow" key={field.name}>
                <label className="credentialField">
                  <span>{field.name}</span>
                  <input
                    type={isSecretCredentialField(field.name) ? "password" : "text"}
                    value={credentialDrafts[field.name] ?? ""}
                    onChange={(event) => setCredentialDrafts((current) => ({ ...current, [field.name]: event.target.value }))}
                    placeholder={field.configured ? `${field.source === "env" ? "Set by env" : "Saved"} - enter a new value to replace` : "Not configured"}
                  />
                </label>
                <Badge tone={field.configured ? "success" : "warning"}>{field.source}</Badge>
                <button className="button secondary" onClick={() => void saveCredential(field.name)} disabled={savingCredential === field.name || !credentialDrafts[field.name]?.trim()}>
                  {savingCredential === field.name ? "Saving" : field.configured ? "Replace" : "Save"}
                </button>
              </div>
            ))}
            <div className="credentialCardFooter">
              <small>Saved values are write-only and encrypted in Electron secure storage.</small>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="content settingsView">
      <header className="pageHeader">
        <div>
          <h1>Settings</h1>
        </div>
      </header>
      <div className="settingsTabs" role="tablist" aria-label="Settings sections">
        {([
          ["access", "Access"],
          ["my-agents", "My Agents"],
          ["plugins", "Agent Plugins"],
          ["credentials", "Credentials"],
          ["design", "Design System"],
        ] as const).map(([id, label]) => (
          <button key={id} className={tab === id ? "selected" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "access" && (
        <div className="settingsGrid">
          <section className="accessCard acpAccessCard">
            <div className="accessCardHeader">
              <div className="accessCardTitle">
                <span className={isAcpReady ? "accessIcon success" : "accessIcon warning"}>
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h3>Agent Control Plane</h3>
                  <p>{isAcpReady ? "Okta is connected. Internal agent discovery can use this session." : "Connect Okta to unlock hosted agents and internal routing."}</p>
                </div>
              </div>
              <Badge tone={isAcpReady ? "success" : "warning"}>{isAcpReady ? "Connected" : "Needs sign-in"}</Badge>
            </div>

            <div className="accessStatusGrid compact" aria-label="Agent Control Plane status">
              <div>
                <span>Session</span>
                <strong>{acpAuth?.signedIn ? "Present" : "Not connected"}</strong>
              </div>
              <div>
                <span>Auth mode</span>
                <strong>{acpAuth?.authMode === "rev2" ? "Rev2 token" : "Okta SSO"}</strong>
              </div>
              {acpAuth?.actorConfigured && (
                <div>
                  <span>Actor</span>
                  <strong>{acpAuth.actor}</strong>
                </div>
              )}
              {acpAuth?.onBehalfOfConfigured && (
                <div>
                  <span>Squad</span>
                  <strong>{acpAuth.onBehalfOf}</strong>
                </div>
              )}
            </div>

            <div className="accessCardActions">
              <button className="button secondary" onClick={signIn} disabled={acpBusy || isAcpReady}>
                <ShieldCheck size={15} />
                {acpBusy && !isAcpReady ? "Signing in" : isAcpReady ? "Okta connected" : "Sign in with Okta"}
              </button>
              <button className="button ghost" onClick={() => void refreshAgentControlPlane()} disabled={acpBusy}>
                <RefreshCw size={15} />
                Refresh
              </button>
              {isAcpReady && (
                <button className="button ghost dangerText" onClick={() => void signOut()} disabled={acpBusy}>
                  <LogOut size={15} />
                  Sign out
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "my-agents" && (
        <div className="myAgentsPanel">
          <section className="accessCard acpAccessCard">
            <div className="accessCardHeader">
              <div className="accessCardTitle">
                <span className={isAcpReady ? "accessIcon success" : "accessIcon warning"}>
                  <Bot size={18} />
                </span>
                <div>
                  <h3>My Agents</h3>
                  <p>{isAcpReady ? "Agents loaded from Agent Control Plane for your current Okta session." : "Sign in with Okta to load your Agent Control Plane agents."}</p>
                </div>
              </div>
              <button className="button secondary" onClick={() => void (isAcpReady ? refreshAgentControlPlane() : signIn())} disabled={acpBusy}>
                <RefreshCw size={15} />
                {isAcpReady ? "Refresh" : "Sign in"}
              </button>
            </div>

            {agentError && <div className="errorBanner">{agentError}</div>}

            {isAcpReady && hostedAgents.length > 0 && (
              <div className="myAgentsList">
                {hostedAgents.map((agent) => (
                  <article className="myAgentRow" key={agent.id}>
                    <div className="agentAvatar">{agent.displayName.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{agent.displayName}</strong>
                      {agent.description && <p>{agent.description}</p>}
                      <small>{[agent.type, agent.status].filter(Boolean).join(" - ")}</small>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {isAcpReady && hostedAgents.length === 0 && !agentError && (
              <div className="agentEmptyState">
                <Bot size={24} />
                <strong>No Agent Control Plane agents found</strong>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "plugins" && (
        <ConnectionsView
          connectors={connectors}
          tools={tools}
          refresh={refresh}
          openSettings={() => setTab("credentials")}
          embedded
        />
      )}

      {tab === "credentials" && (
        <div className="credentialList">
          <CredentialSection title="Required" groups={requiredCredentials}>
            {requiredCredentials.map(renderCredentialCard)}
          </CredentialSection>
          <CredentialSection title="Optional" groups={optionalCredentials}>
            {optionalCredentials.map(renderCredentialCard)}
          </CredentialSection>
        </div>
      )}

      {tab === "design" && <DesignSystemView embedded />}
    </section>
  );
}

function isSecretCredentialField(name: string) {
  return /TOKEN|KEY|SECRET|PASSWORD/i.test(name);
}

function isRequiredCredentialGroup(group: CredentialGroupStatus) {
  return group.label.toLowerCase().startsWith("telnyx");
}

function compareCredentialGroups(left: CredentialGroupStatus, right: CredentialGroupStatus) {
  return left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
}

function CredentialSection({ title, groups, children }: { title: string; groups: CredentialGroupStatus[]; children: ReactNode }) {
  if (groups.length === 0) return null;
  return (
    <section className="credentialSection">
      <div className="credentialSectionHeader">
        <span>{title}</span>
        <small>{groups.length} {groups.length === 1 ? "entry" : "entries"}</small>
      </div>
      <div className="credentialSectionList">{children}</div>
    </section>
  );
}

function connectorButtonLabel(connector: ConnectorStatus) {
  if (connector.id === "agent-control-plane" && connector.status === "needs_access") return "Sign in with Okta";
  if (connector.id === "agent-control-plane" && connector.status === "requested") return "Sign in with Okta";
  if (connector.status === "connected") return "Connected";
  if (connector.status === "signed_in") return "Signed in";
  return "Configure";
}

function connectorStatusLabel(status: ConnectorStatus["status"]) {
  if (status === "needs_access") return "Needs access";
  if (status === "signed_in") return "Signed in";
  if (status === "requested") return "Needs setup";
  return status;
}

function connectorModeLabel(connector: ConnectorStatus) {
  if (connector.mode === "env") return "environment configured";
  if (connector.mode === "saved") return "saved in Settings";
  if (connector.mode === "okta") return "Okta session present";
  if (connector.mode === "live") return "live adapter";
  return `needs ${connector.requiredAccess.join(", ")}`;
}

function DesignSystemView({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState<"colors" | "typography" | "spacing" | "components" | "chat">("components");
  const colorTokens = [
    ["Background", "--bg"],
    ["Surface", "--surface"],
    ["Soft surface", "--surface-soft"],
    ["Text", "--text"],
    ["Muted", "--text-muted"],
    ["Telnyx Green", "--telnyx-green"],
    ["Telnyx Black", "--telnyx-black"],
    ["Accent", "--accent"],
    ["Success", "--success"],
    ["Warning", "--warning"],
    ["Danger", "--danger"],
    ["Skill", "--skill"],
  ];

  return (
    <section className={embedded ? "designView settingsDesignPanel" : "content designView"}>
      {!embedded && (
        <header className="pageHeader">
          <div>
            <h1>Design System</h1>
          </div>
        </header>
      )}
      <div className="designTabs">
        {(["colors", "typography", "spacing", "components", "chat"] as const).map((item) => (
          <button key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === "colors" && (
        <div className="tokenGrid">
          {colorTokens.map(([label, token]) => (
            <div className="tokenSwatch" key={token}>
              <span style={{ background: `var(${token})` }} />
              <strong>{label}</strong>
              <small>{token}</small>
            </div>
          ))}
        </div>
      )}

      {tab === "typography" && (
        <div className="designSection">
          <Panel title="Type scale">
            <div className="typeScale">
              <h1>Page title 24/1.15</h1>
              <h2>Artifact title 24/1.15</h2>
              <strong>Body emphasis 13/650</strong>
              <p>Body copy uses compact system UI metrics for dense operational scanning.</p>
              <small>Section labels use uppercase 11px with stable spacing.</small>
            </div>
          </Panel>
        </div>
      )}

      {tab === "spacing" && (
        <div className="spacingGrid">
          {["Rail icon", "Titlebar", "Tab strip", "Radius", "Panel padding", "Page gutter"].map((label) => (
            <Panel title={label} key={label}>
              <div className="spacingSample" />
              <p>Defined by shared CSS tokens and component primitives.</p>
            </Panel>
          ))}
        </div>
      )}

      {tab === "components" && (
        <div className="componentGrid">
          <Panel title="Buttons">
            <div className="componentRow">
              <button className="button primary">Primary</button>
              <button className="button secondary">Secondary</button>
              <button className="button ghost">Ghost</button>
              <button className="button primary" disabled>Disabled</button>
            </div>
          </Panel>
          <Panel title="Badges and dots">
            <div className="componentRow">
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <Badge tone="skill">Skill</Badge>
              <StatusDot tone="success" />
              <StatusDot tone="warning" />
              <StatusDot tone="danger" />
              <StatusDot tone="muted" />
            </div>
          </Panel>
          <Panel title="Segmented controls">
            <div className="componentRow">
              <Segmented selected="Auto" />
              <Segmented selected="Ask" />
              <Segmented selected="Active" options={["Active", "Paused"]} />
            </div>
          </Panel>
          <Panel title="Permission row">
            <div className="permissionRow demoRow">
              <div>
                <strong>hindsight.recall</strong>
                <small>Recall long-term agent memory with source attribution.</small>
              </div>
              <Segmented selected="Auto" />
            </div>
          </Panel>
        </div>
      )}

      {tab === "chat" && (
        <div className="chatSpec">
          <div className="message link">
            <strong>Telnyx Link</strong>
            <p>Ask about customers, incidents, products, docs, skills, or shared-channel drafts.</p>
          </div>
          <div className="message you">
            <strong>You</strong>
            <p>Brief me on Acme Messaging and current escalations.</p>
          </div>
          <div className="composer demoComposer">
            <input value="Draft a customer-safe update" readOnly />
            <button className="button primary">Send</button>
          </div>
        </div>
      )}
    </section>
  );
}

function MemoryModal({ onClose, sources }: { onClose: () => void; sources: string[] }) {
  const visibleSources = sources.length > 0 ? sources.slice(0, 6) : ["Slack", "Guru", "Google Drive", "Hindsight"];
  return (
    <div className="modalScrim">
      <div className="memoryModal">
        <header>
          <h2>Refreshing Memory</h2>
          <span className="spinner" />
          <button className="iconButton" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="scanTitle">
          <span className="spinner small" />
          Link scanning connected sources
        </div>
        <div className="sourceTable">
          <div className="sourceHeader"><span>Source</span><span>Status</span></div>
          {visibleSources.map((source, index) => (
            <div className="sourceRow" key={source}>
              <span>{source}</span>
              <span>{index < 2 ? "Scanning" : "Queued"}</span>
            </div>
          ))}
        </div>
        <footer>
          <button className="button ghost" onClick={onClose}>Cancel</button>
        </footer>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="content emptyState">
      <Bot size={36} />
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

function Segmented({ selected, options = ["Auto", "Allow", "Ask"] }: { selected: string; options?: string[] }) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button key={option} className={option === selected ? "selected" : ""}>{option}</button>
      ))}
    </div>
  );
}

function Badge({ tone, children }: { tone: "success" | "warning" | "danger" | "skill" | "default"; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function StatusDot({ tone }: { tone: "success" | "warning" | "danger" | "muted" }) {
  return <span className={`statusDot ${tone}`} aria-hidden="true" />;
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatModelLabel(model: string) {
  if (model === "mock-link-runtime") return "Local fallback";
  return model;
}

function relativeDate(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function sourceInitials(source: string) {
  return source
    .split("_")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function initialsFromIdentity(identity: string) {
  const trimmed = identity.trim();
  if (!trimmed) return "TL";
  const nameParts = trimmed.split(/\s+/).filter(Boolean);
  if (nameParts.length >= 2) return `${nameParts[0]![0]}${nameParts[nameParts.length - 1]![0]}`.toUpperCase();
  const localPart = trimmed.split("@")[0] || "TL";
  const parts = localPart.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return localPart.slice(0, 2).toUpperCase();
}
