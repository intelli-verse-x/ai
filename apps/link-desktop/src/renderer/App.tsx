import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Archive as ArchiveIcon,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Component,
  Download,
  ExternalLink,
  FileText,
  Flag,
  FolderOpen,
  Github as GithubIcon,
  Grid2X2,
  Grid2X2Plus,
  Home,
  Inbox,
  Info,
  Keyboard,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  MessageSquare,
  Mic,
  MonitorPlay,
  Moon,
  MoreHorizontal,
  Pencil,
  Phone,
  PhoneCall,
  Pin,
  Play,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Send,
  Save,
  Settings,
  ShieldCheck,
  Slack,
  SlidersHorizontal,
  Square,
  SquareTerminal,
  SquareCheck,
  Star,
  Store,
  Sun,
  Tags,
  Target,
  Trash2,
  Upload,
  Users,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { TableauEventType } from "@tableau/embedding-api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComponentType, CSSProperties, DragEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveWorkItem,
  AgentControlPlaneAuthStatus,
  AgentSummary,
  AutomationItem,
  ChatAttachment,
  ChatArtifact,
  ChatMessage,
  ChatSession,
  ConnectorStatus,
  CredentialGroupStatus,
  WikiKit,
  WikiState,
  ExplorerResult,
  GoogleCalendarEvent,
  GoogleContact,
  GoogleInboxDraft,
  GoogleInboxThread,
  GoogleInboxThreadSummary,
  HostedAgentSummary,
  KnowledgeAgentAskResponse,
  AiModelRoute,
  LiteLlmRuntimeStatus,
  EdgeSlugAvailability,
  ArtifactDeploymentRecord,
  ArtifactDeploymentTarget,
  LinkLocalEdgeDraftApp,
  LinkLocalEdgeImportScope,
  LinkLocalAppInspection,
  LinkLocalEdgeDeployResult,
  LinkAppPublishInput,
  LinkAppPublishResult,
  LinkAppPublisherReadiness,
  LinkChangeRequest,
  MessageGatewayEventsResult,
  MessageGatewayListResult,
  MessageGatewayMessage,
  MessageGatewayReadiness,
  MessageGatewayTransport,
  LinkPublishedApp,
  LinkPublishedAppRisk,
  LinkPublishedAppStatus,
  LinkPublishedAppType,
  MeetingBotInvitePreflight,
  MeetingBotOption,
  MeetingInvite,
  MemoryBank,
  MemoryRecallResult,
  OkfBundlePreview,
  OkfConceptPreview,
  OnboardingState,
  PhoneAssistantOption,
  PhoneCallHistoryRow,
  PhoneNumberOption,
  SkillMarkdownResult,
  SkillMetadata,
  ScribesArtifactKind,
  ScribesCleanupProfile,
  ScribesModel,
  ScribesSession,
  ScribesStatus,
  ScribesWorkspaceSettings,
  SpeakSettings,
  TelnyxTtsVoice,
  TerminalStatus,
  ToolMetadata,
  ToolArtifactType,
  ToolStudioManifestInput,
  ViewId,
  WebRtcStatus,
  WhisperStatus,
  WidgetCatalogItem,
  WidgetDataResult,
  WikiDocumentationSource,
  WikiDocumentationSourceInput,
  WikiDocumentationSourceType,
  WorkboardCard,
  WorkboardProvider,
  WorkboardSnapshot,
  WorkboardStatus,
  WorkspaceSummary,
} from "./api.js";
import { linkApi } from "./api.js";
import { DialerBuilder } from "./phone/dialer-builder.js";
import { createDefaultDialerConfig, type DialerConfig } from "./phone/dialer-config.js";
import { LinkSoftphone } from "./phone/softphone.js";

type AppIcon = ComponentType<{ size?: number; className?: string }>;
function ScribesWaveformIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 10v4" />
      <path d="M8 7v10" />
      <path d="M12 4v16" />
      <path d="M16 7v10" />
      <path d="M20 10v4" />
    </svg>
  );
}
type SkillMarkdownLoadState =
  | { status: "loading" }
  | { status: "ready"; result: SkillMarkdownResult }
  | { status: "error"; message: string };
type PhoneViewTab = "numbers" | "calls" | "contacts" | "assistants" | "inbox";
type SettingsTab = "auth" | "plugins" | "contacts" | "assistants" | "numbers" | "agents" | "speak" | "dialer" | "design" | "wiki";
type WikiSourceDraft = {
  id: string;
  type: WikiDocumentationSourceType;
  label: string;
  iconName: string;
  target: string;
  description: string;
  branch: string;
  path: string;
  enabled: boolean;
};
type PageSectionTab<T extends string> = readonly [T, string, AppIcon];
type PageSectionTabGroup<T extends string> = {
  title: string;
  tabs: readonly PageSectionTab<T>[];
};

function PageSectionSidebar<T extends string>({
  tabs,
  groups,
  heading,
  headingIcon: HeadingIcon,
  activeTab,
  onSelect,
  label,
}: {
  tabs?: readonly PageSectionTab<T>[];
  groups?: readonly PageSectionTabGroup<T>[];
  heading?: string;
  headingIcon?: AppIcon;
  activeTab: T;
  onSelect: (tab: T) => void;
  label: string;
}) {
  const renderTabButton = ([id, tabLabel, Icon]: PageSectionTab<T>) => (
    <button
      key={id}
      className={activeTab === id ? "selected" : ""}
      onClick={() => onSelect(id)}
      role="tab"
      aria-selected={activeTab === id}
    >
      <Icon size={18} />
      <span>{tabLabel}</span>
    </button>
  );

  return (
    <aside className="pageSectionSidebar" role="tablist" aria-label={label}>
      {heading && (
        <div className="pageSectionSidebarHeading">
          {HeadingIcon && <HeadingIcon size={18} />}
          <span>{heading}</span>
        </div>
      )}
      {groups
        ? groups.map((group) => (
          <div className="pageSectionSidebarGroup" key={group.title}>
            <div className="pageSectionSidebarGroupTitle">{group.title}</div>
            {group.tabs.map(renderTabButton)}
          </div>
        ))
        : tabs?.map(renderTabButton)}
    </aside>
  );
}

function PageSectionHeader({
  parent,
  title,
  action = null,
}: {
  parent: string;
  title: string;
  action?: ReactNode;
}) {
  const showParent = Boolean(parent.trim()) && parent.trim().toLowerCase() !== "link";
  return (
    <header className="pageSectionHeader">
      <h1 className="pageSectionBreadcrumb">
        {showParent && (
          <>
            <span className="pageSectionBreadcrumbParent">{parent}</span>
            <span className="pageSectionBreadcrumbSeparator">/</span>
          </>
        )}
        <span className="pageSectionBreadcrumbCurrent">{title}</span>
      </h1>
      {action && <div className="pageSectionHeaderActions">{action}</div>}
    </header>
  );
}

const defaultPrimaryColor = "#00e3aa";

interface ActiveAgentSelection {
  id: string;
  displayName: string;
}

type TableRowLifecycleAction = "archive" | "delete";

function readStoredIdList(storageKey: string) {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function sortChatSessions(sessions: ChatSession[]) {
  return [...sessions].sort((left, right) => {
    const pinnedCompare = Number(Boolean(right.pinnedAt)) - Number(Boolean(left.pinnedAt));
    if (pinnedCompare !== 0) return pinnedCompare;
    return Date.parse(right.updatedAt || "") - Date.parse(left.updatedAt || "");
  });
}

function TableRowLifecycleActions({
  label,
  onArchive,
  onDelete,
}: {
  label: string;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <span className="tableRowLifecycleActions" role="cell">
      <button className="iconButton" type="button" onClick={(event) => { event.stopPropagation(); onArchive(); }} aria-label={`Archive ${label}`} title="Archive">
        <ArchiveIcon size={14} />
      </button>
      <button className="iconButton danger" type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} aria-label={`Delete ${label}`} title="Delete">
        <Trash2 size={14} />
      </button>
    </span>
  );
}

function BulkEditControls({
  active,
  selectedCount,
  onToggle,
  onArchive,
  onDelete,
}: {
  active: boolean;
  selectedCount: number;
  onToggle: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  if (!active) {
    return (
      <button className="button secondary" type="button" onClick={onToggle}>
        <Check size={15} />
        Bulk Edit
      </button>
    );
  }
  return (
    <div className="bulkEditControls" aria-label="Bulk edit actions">
      <span>{selectedCount} selected</span>
      <button className="button secondary" type="button" onClick={onArchive} disabled={selectedCount === 0}>
        <ArchiveIcon size={14} />
        Archive
      </button>
      <button className="button danger" type="button" onClick={onDelete} disabled={selectedCount === 0}>
        <Trash2 size={14} />
        Delete
      </button>
      <button className="button ghost" type="button" onClick={onToggle}>
        Cancel
      </button>
    </div>
  );
}

function BulkSelectCell({
  active,
  checked,
  label,
  onChange,
}: {
  active: boolean;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <span className="bulkSelectCell" role="cell" aria-hidden={!active}>
      {active && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          onClick={(event) => event.stopPropagation()}
          aria-label={label}
        />
      )}
    </span>
  );
}

function TableRefreshButton({
  onClick,
  disabled = false,
  label = "Refresh table",
}: {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      className="iconButton agentFilterButton tableRefreshButton"
      type="button"
      aria-label={label}
      title={label}
      onClick={() => void onClick()}
      disabled={disabled}
    >
      <RefreshCw size={16} />
    </button>
  );
}

type ChatAgentSource = AgentSummary["source"] | "link" | "voice-assistant";

type NewChatSessionDraft = {
  title?: string;
  agentId?: string;
  agentName?: string;
  agentType?: string;
  agentSource?: ChatAgentSource;
  approvalMode?: "auto" | "review" | "manual";
  modelMode?: string;
};

type ChatAgentOption = {
  id: string;
  displayName: string;
  description: string;
  source: ChatAgentSource;
  type: string;
  status: string;
  squad: string;
};

type ToolStudioDraft = {
  name: string;
  description: string;
  owner: string;
  team: string;
  audience: string;
  artifactType: ToolArtifactType;
  riskLevel: "low" | "medium" | "high";
  toolsRequired: string;
  customerSafe: boolean;
  approvalRequired: boolean;
  whenToUse: string;
  inputsNeeded: string;
  sourceOfTruth: string;
  workflowSteps: string;
  repeatedChecks: string;
  expectedOutput: string;
  humanCheckpoints: string;
  safetyNotes: string;
  reviewers: string;
  testFixture: string;
  visibility: "private" | "squad" | "internal";
  version: string;
};

type AgentAppearance = {
  kind: "emoji" | "image";
  value: string;
};

type SpeechRecognitionResultLike = {
  isFinal?: boolean;
  0?: { transcript?: string };
};

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike | undefined;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const approvedPublishedAppHostSuffixes = [".query.prod.telnyx.io", ".apps.telnyx.io", ".edge.telnyx.io", ".telnyxcompute.com", ".internal.telnyx.com"];

function shouldSubmitComposer(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
  return event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing;
}

function normalizeHexColor(value: string | null | undefined) {
  const normalized = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : "";
}

function readableInkColor(hexColor: string) {
  const color = normalizeHexColor(hexColor) || defaultPrimaryColor;
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 145 ? "#000000" : "#ffffff";
}

const navItems: { id: ViewId; label: string; icon: AppIcon }[] = [
  { id: "chats", label: "Chat", icon: MessageSquare },
  { id: "phone", label: "Calls", icon: Phone },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "workboard", label: "Taskbox", icon: SquareCheck },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "skills", label: "Skills", icon: Zap },
  { id: "apps", label: "Apps", icon: Grid2X2Plus },
  { id: "wiki", label: "Wiki", icon: BookOpen },
];

const linkGettingStartedAgentId = "c4de5f6a-e2e9-4568-9611-80cd35b483f7";
const linkGettingStartedAgentName = "Link";

const viewMeta: Record<ViewId, { label: string; icon: AppIcon }> = {
  workspaces: { label: "Workspaces", icon: Grid2X2 },
  onboarding: { label: "Get Started", icon: Flag },
  widgets: { label: "Widgets", icon: LayoutDashboard },
  explorer: { label: "Library", icon: BookOpen },
  chats: { label: "Chat", icon: MessageSquare },
  gateway: { label: "Gateway", icon: Send },
  apps: { label: "Apps", icon: Grid2X2Plus },
  skills: { label: "Skills", icon: Zap },
  inbox: { label: "Inbox", icon: Inbox },
  agents: { label: "Agents", icon: Bot },
  workboard: { label: "Taskbox", icon: SquareCheck },
  scribes: { label: "Scribes", icon: ScribesWaveformIcon },
  drive: { label: "Drive", icon: FolderOpen },
  phone: { label: "Calls", icon: Phone },
  calendar: { label: "Calendar", icon: CalendarDays },
  memory: { label: "Archive", icon: ArchiveIcon },
  wiki: { label: "Wiki", icon: BookOpen },
  settings: { label: "Settings", icon: Settings },
};

interface PublishAppDraft {
  name: string;
  slug: string;
  description: string;
  ownerSquad: string;
  audience: string;
  appType: LinkPublishedAppType;
  sourceRepo: string;
  sourceRef: string;
  sourceSubdir: string;
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  outputDir: string;
  envSchema: string;
  reviewers: string;
  riskLevel: LinkPublishedAppRisk;
  deploymentTarget: ArtifactDeploymentTarget;
}

interface MarketplaceApp {
  id: string;
  name: string;
  publisher: string;
  bot: string;
  audience: string;
  installMode: "Source handoff" | "VPN access";
  status: "Available" | "Reviewing" | "Installed";
  description: string;
}

const marketplaceApps: MarketplaceApp[] = [];

const initialOnboardingState: OnboardingState = {
  dismissed: false,
  completed: false,
  completedStepIds: [],
  updatedAt: "1970-01-01T00:00:00.000Z",
};

type SessionPreferenceMap = Record<string, boolean>;

const draftSessionPreferenceKey = "__draft__";
const designSystemSessionStorageKey = "telnyx-link-design-system-sessions";

function readDesignSystemSessionPreferences(): SessionPreferenceMap {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(designSystemSessionStorageKey) ?? "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    return Object.fromEntries(
      Object.entries(stored).filter((entry): entry is [string, boolean] => typeof entry[0] === "string" && typeof entry[1] === "boolean"),
    );
  } catch {
    return {};
  }
}

type EdgeDeployStage = "idle" | "needs_url" | "previewing" | "preview_ready" | "selecting_folder" | "deploying" | "deployed" | "failed";
type EdgePreviewSurface = {
  url: string;
  slug: string;
  directory?: string;
};

export function App() {
  const [view, setView] = useState<ViewId>("chats");
  const [skills, setSkills] = useState<SkillMetadata[]>([]);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [work, setWork] = useState<ActiveWorkItem[]>([]);
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ChatArtifact | null>(null);
  const [edgePreviewSurface, setEdgePreviewSurface] = useState<EdgePreviewSurface | null>(null);
  const [changeRequests, setChangeRequests] = useState<LinkChangeRequest[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [memoryBanks, setMemoryBanks] = useState<MemoryBank[]>([]);
  const [wikiState, setWikiState] = useState<WikiState | null>(null);
  const [publishedApps, setPublishedApps] = useState<LinkPublishedApp[]>([]);
  const [publisherReadiness, setPublisherReadiness] = useState<LinkAppPublisherReadiness | null>(null);
  const [gatewayReadiness, setGatewayReadiness] = useState<MessageGatewayReadiness | null>(null);
  const [gatewayMessages, setGatewayMessages] = useState<MessageGatewayMessage[]>([]);
  const [gatewayMode, setGatewayMode] = useState<MessageGatewayListResult["mode"]>("preview");
  const [gatewayWarning, setGatewayWarning] = useState("");
  const [onboarding, setOnboarding] = useState<OnboardingState>(initialOnboardingState);
  const [designSystemSessionPreferences, setDesignSystemSessionPreferences] = useState<SessionPreferenceMap>(() => readDesignSystemSessionPreferences());
  const [accountStatus, setAccountStatus] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [signedOutLocally, setSignedOutLocally] = useState(false);
  const [authGateBusy, setAuthGateBusy] = useState(false);
  const [authGateError, setAuthGateError] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("workspace-acme");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [newSessionDraftOpen, setNewSessionDraftOpen] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [archiveRefreshKey, setArchiveRefreshKey] = useState(0);
  const [railExpanded, setRailExpanded] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"chat" | "phone">("chat");
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [, setPhoneTab] = useState<PhoneViewTab>("calls");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("auth");
  const [widgetLibraryOpen, setWidgetLibraryOpen] = useState(false);
  const [linkedPhoneNumber, setLinkedPhoneNumber] = useState("");
  const [activeDialerConfig, setActiveDialerConfig] = useState<DialerConfig>(() => createDefaultDialerConfig());
  const [telnyxCredentialReady, setTelnyxCredentialReady] = useState(false);
  const [liteLlmCredentialReady, setLiteLlmCredentialReady] = useState(false);
  const [liteLlmRuntime, setLiteLlmRuntime] = useState<LiteLlmRuntimeStatus | null>(null);
  const [chatModelMode, setChatModelMode] = useState(() => {
    if (typeof window === "undefined") return "auto/ask-before-cloud";
    return window.localStorage.getItem("telnyx-link-chat-model-route") ?? "auto/ask-before-cloud";
  });
  const [activeAgent, setActiveAgent] = useState<ActiveAgentSelection | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = JSON.parse(window.localStorage.getItem("telnyx-link-active-agent") ?? "null");
      return stored && typeof stored.id === "string" && typeof stored.displayName === "string" ? stored : null;
    } catch {
      return null;
    }
  });
  const [selectedChatAgentId, setSelectedChatAgentId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("telnyx-link-selected-chat-agent") ?? "";
  });
  const [bookmarkedAgentIds, setBookmarkedAgentIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(window.localStorage.getItem("telnyx-link-bookmarked-agents") ?? "[]");
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [colorMode, setColorMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("telnyx-link-color-mode") === "dark" ? "dark" : "light";
  });
  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window === "undefined") return defaultPrimaryColor;
    return normalizeHexColor(window.localStorage.getItem("telnyx-link-primary-color")) || defaultPrimaryColor;
  });
  const primaryColorStyle = useMemo(() => ({
    "--accent": primaryColor,
    "--accent-soft": `color-mix(in srgb, ${primaryColor} 18%, transparent)`,
    "--accent-ink": readableInkColor(primaryColor),
  }) as CSSProperties, [primaryColor]);

  useEffect(() => {
    readFirstInstallDate();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-color-mode", colorMode);
  }, [colorMode]);

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-primary-color", primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-bookmarked-agents", JSON.stringify(bookmarkedAgentIds));
  }, [bookmarkedAgentIds]);

  useEffect(() => {
    window.localStorage.setItem(designSystemSessionStorageKey, JSON.stringify(designSystemSessionPreferences));
  }, [designSystemSessionPreferences]);

  useEffect(() => {
    if (activeAgent) window.localStorage.setItem("telnyx-link-active-agent", JSON.stringify(activeAgent));
    else window.localStorage.removeItem("telnyx-link-active-agent");
  }, [activeAgent]);

  useEffect(() => {
    if (selectedChatAgentId) window.localStorage.setItem("telnyx-link-selected-chat-agent", selectedChatAgentId);
  }, [selectedChatAgentId]);

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-chat-model-route", chatModelMode);
  }, [chatModelMode]);

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
      wiki,
      publisherStatus,
      gatewayStatus,
      gatewayList,
      appList,
      onboardingState,
      authStatus,
      credentialList,
      runtimeStatus,
      dialerConfig,
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
      linkApi.listWikiState(),
      linkApi.getPublisherReadiness(),
      linkApi.getMessageGatewayReadiness(),
      linkApi.listGatewayMessages(),
      linkApi.listPublishedApps(),
      linkApi.listOnboarding(),
      linkApi.getAgentControlPlaneAuthStatus(),
      linkApi.listCredentials(),
      linkApi.getLiteLlmRuntimeStatus(),
      linkApi.getActiveDialerConfig(),
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
    setWikiState(wiki);
    setPublisherReadiness(publisherStatus);
    setGatewayReadiness(gatewayStatus);
    setGatewayMessages(gatewayList.messages);
    setGatewayMode(gatewayList.mode);
    setGatewayWarning(gatewayList.warning || "");
    setPublishedApps(appList);
    setOnboarding(onboardingState);
    setAccountStatus(authStatus);
    setLiteLlmRuntime(runtimeStatus);
    setActiveDialerConfig(dialerConfig);
    setTelnyxCredentialReady(Boolean(credentialList.find((group) => group.id === "telnyx")?.fields.some((field) => field.name === "TELNYX_API_KEY" && field.configured)));
    setLiteLlmCredentialReady(Boolean(runtimeStatus.installed || runtimeStatus.telnyx.apiKeyConfigured || runtimeStatus.managedGateway.configured || runtimeStatus.frontier.anthropicConfigured));
    setSignedOutLocally(false);
    setSelectedWorkspaceId((current) => current || workspaceList[0]?.id || "");
    setSelectedSessionId((current) => current || chatList[0]?.id || "");
    setSelectedWorkId((current) => current || workList[0]?.id || "");
  }

  async function refreshSessionTablesThenAll() {
    setChatSessions(await linkApi.listChatSessions());
    await refresh();
  }

  useEffect(() => {
    void refresh();
  }, []);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
  const selectedSession = selectedSessionId ? chatSessions.find((session) => session.id === selectedSessionId) : undefined;
  const selectedWork = work.find((item) => item.id === selectedWorkId) ?? work[0];
  const selectedWorkboardChatAgent = useMemo(() => {
    const directoryAgent = agents.find((agent) => agent.id === selectedChatAgentId);
    if (directoryAgent) {
      return {
        id: directoryAgent.id,
        displayName: directoryAgent.displayName,
        source: directoryAgent.source,
        type: directoryAgent.type,
      };
    }
    if (selectedChatAgentId === linkGettingStartedAgentId) {
      return {
        id: linkGettingStartedAgentId,
        displayName: linkGettingStartedAgentName,
        source: "agent-control-plane" as const,
        type: "openclaw",
      };
    }
    return null;
  }, [agents, selectedChatAgentId]);
  const showContextSidebar = false;

  function openChatSession(sessionId: string) {
    setSelectedSessionId(sessionId);
    setAssistantMode("chat");
    setView("chats");
  }

  function resolveNewSessionAgent() {
    const selectedDirectoryAgent = agents.find((agent) => agent.id === selectedChatAgentId);
    if (selectedDirectoryAgent?.source === "agent-control-plane" && (selectedDirectoryAgent.type === "hermes" || selectedDirectoryAgent.type === "openclaw")) {
      return selectedDirectoryAgent;
    }
    const activeDirectoryAgent = activeAgent ? agents.find((agent) => agent.id === activeAgent.id) : undefined;
    if (activeDirectoryAgent?.source === "agent-control-plane" && (activeDirectoryAgent.type === "hermes" || activeDirectoryAgent.type === "openclaw")) {
      return activeDirectoryAgent;
    }
    return {
      id: linkGettingStartedAgentId,
      displayName: linkGettingStartedAgentName,
      source: "agent-control-plane" as const,
      type: "openclaw",
    };
  }

  async function openNewChatSessionDraft() {
    setAssistantMode("chat");
    setSelectedSessionId("");
    setView("chats");
    setNewSessionDraftOpen(true);
    void refresh();
  }

  async function createNewChatSession(draft: NewChatSessionDraft = {}) {
    const agent = draft.agentId
      ? {
          id: draft.agentId,
          displayName: draft.agentName || "Link",
          source: draft.agentSource || ("agent-control-plane" as const),
          type: draft.agentType || "openclaw",
        }
      : resolveNewSessionAgent();
    setAssistantMode("chat");
    if (agent.id) setSelectedChatAgentId(agent.id);
    const session = await linkApi.createChatSession({
      workspaceId: selectedWorkspace?.id ?? "workspace-link",
      agentId: agent.id === "link-default-runtime" ? undefined : agent.id,
      agentName: agent.id === "link-default-runtime" ? undefined : agent.displayName,
      agentSource: agent.id === "link-default-runtime" ? undefined : agent.source,
      agentType: agent.type,
      title: draft.title,
      approvalMode: draft.approvalMode ?? "auto",
      modelMode: draft.modelMode ?? chatModelMode,
      contextScope: "workspace",
    });
    setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
    setSelectedSessionId(session.id);
    setNewSessionDraftOpen(false);
    setView("chats");
    await refresh();
  }

  async function updateChatSession(input: { sessionId: string; title?: string; pinned?: boolean; archived?: boolean }) {
    const session = await linkApi.updateChatSession(input);
    setChatSessions((current) => sortChatSessions([session, ...current.filter((item) => item.id !== session.id)]));
    if (input.archived && selectedSessionId === input.sessionId) {
      setSelectedSessionId("");
      setNewSessionDraftOpen(false);
    }
    return session;
  }

  function openTaskMonitoringSession({
    session,
    agentId,
  }: {
    session: ChatSession;
    agentId?: string;
  }) {
    setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
    if (agentId) setSelectedChatAgentId(agentId);
    setSelectedSessionId(session.id);
    setAssistantMode("chat");
    setAssistantCollapsed(false);
    setNewSessionDraftOpen(false);
  }

  async function startSkillBuilderChat(prompt: string) {
    setAssistantMode("chat");
    setSelectedChatAgentId(activeAgent?.id ?? linkGettingStartedAgentId);
    const session = await linkApi.sendChatMessage({
      workspaceId: selectedWorkspace?.id ?? "workspace-link",
      agentId: activeAgent?.id ?? linkGettingStartedAgentId,
      agentName: activeAgent?.displayName ?? linkGettingStartedAgentName,
      approvalMode: "review",
      modelMode: activeAgent ? "agent-control-plane" : "agent-control-plane",
      contextScope: "workspace",
      content: prompt,
    });
    setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
    setSelectedSessionId(session.id);
  }

  async function startOnboardingPromptChat(prompt: string, title: string) {
    const agent = resolveNewSessionAgent();
    setAssistantMode("chat");
    setAssistantCollapsed(false);
    if (agent.id) setSelectedChatAgentId(agent.id);
    const session = await linkApi.sendChatMessage({
      workspaceId: selectedWorkspace?.id ?? "workspace-link",
      agentId: agent.id === "link-default-runtime" ? undefined : agent.id,
      agentName: agent.id === "link-default-runtime" ? undefined : agent.displayName,
      agentSource: agent.id === "link-default-runtime" ? undefined : agent.source,
      agentType: agent.type,
      approvalMode: "review",
      modelMode: "agent-control-plane",
      contextScope: "workspace",
      content: `${title}\n\n${prompt}`,
    });
    setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
    setSelectedSessionId(session.id);
    setNewSessionDraftOpen(false);
    setView("chats");
    await refresh();
  }

  async function startEmailDraftChat(prompt: string) {
    await startOnboardingPromptChat(
      prompt,
      "Email draft workflow",
    );
  }

  async function startOnboardingSharedDraft() {
    const draft = await linkApi.createSharedChannelDraft({
      title: "Internal testing customer-safe update",
      userPrompt: "Draft a customer-safe update for internal testing of Link's approval workflow.",
      requestedAction: "review a customer-safe shared-channel update before posting",
      threadContext:
        "Internal testing context: verify Link separates customer-safe copy from internal rationale and requires human approval before any external action.",
    });
    setSelectedWorkId(draft.id);
    setView("workspaces");
    await refresh();
  }

  async function shareExplorerResultToAgent(result: ExplorerResult) {
    const agent = resolveNewSessionAgent();
    setAssistantMode("chat");
    if (agent.id) setSelectedChatAgentId(agent.id);
    const session = await linkApi.sendChatMessage({
      sessionId: selectedSession?.id,
      workspaceId: selectedWorkspace?.id ?? "workspace-link",
      agentId: agent.id === "link-default-runtime" ? undefined : agent.id,
      agentName: agent.id === "link-default-runtime" ? undefined : agent.displayName,
      agentSource: agent.id === "link-default-runtime" ? undefined : agent.source,
      approvalMode: "review",
      modelMode: "agent-control-plane",
      contextScope: "workspace",
      content: buildExplorerResultSharePrompt(result),
    });
    setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
    setSelectedSessionId(session.id);
    setView("chats");
    await refresh();
  }

  async function startEdgeAppDeployChat(session?: ChatSession) {
    const agent = resolveNewSessionAgent();
    const recentUserRequest = [...(session?.messages ?? [])].reverse().find((message) => message.role === "user")?.content;
    const useLinkDesignSystem = Boolean(session?.id && designSystemSessionPreferences[session.id]);
    const prompt = [
      "Edge app deployment workflow: help me turn this chat work into a deployable Telnyx Edge Compute app.",
      "Default to OpenClaw for build work unless the selected active agent is Hermes.",
      "Goal: build the app, verify it locally, prepare a Git-backed source folder, then deploy it to apidev.telnyx.com using Link's bundled telnyx-edge setup.",
      "Default Git target: sourceRepo=https://github.com/team-telnyx/link and sourceSubdir=edge-apps/<app-slug> unless the user chooses another controlled team-telnyx repo.",
      "If a source repo or folder is missing, create a concrete build checklist and ask only for the minimum missing input.",
      "For a basic browser game or static app, use a simple static build that emits dist/ and can be hosted by Edge Compute.",
      "When ready, produce the exact publish/deploy payload: name, slug, sourceRepo, sourceRef, sourceSubdir, installCommand, buildCommand, outputDir, and any required env vars.",
      useLinkDesignSystem ? buildLinkDesignSystemInstruction() : "",
      recentUserRequest ? `Current user request/context: ${recentUserRequest}` : "",
    ].filter(Boolean).join("\n");
    setAssistantMode("chat");
    if (agent.id) setSelectedChatAgentId(agent.id);
    const nextSession = await linkApi.sendChatMessage({
      sessionId: session?.id,
      workspaceId: session?.workspaceId ?? selectedWorkspace?.id ?? "workspace-link",
      agentId: agent.id === "link-default-runtime" ? undefined : agent.id,
      agentName: agent.id === "link-default-runtime" ? undefined : agent.displayName,
      agentSource: agent.id === "link-default-runtime" ? undefined : agent.source,
      approvalMode: "review",
      modelMode: "agent-control-plane",
      contextScope: "workspace",
      content: prompt,
    });
    setChatSessions((current) => [nextSession, ...current.filter((item) => item.id !== nextSession.id)]);
    setSelectedSessionId(nextSession.id);
    setView("chats");
    await refresh();
  }

  async function startManagedSkillSetupChat(skill: { label: string; query: string; connectorName: string }) {
    setAssistantMode("chat");
    setSelectedChatAgentId(linkGettingStartedAgentId);
    const session = await linkApi.sendChatMessage({
      workspaceId: selectedWorkspace?.id ?? "workspace-link",
      agentId: linkGettingStartedAgentId,
      agentName: linkGettingStartedAgentName,
      approvalMode: "review",
      modelMode: "agent-control-plane",
      contextScope: "workspace",
      content: [
        `Contact connection workflow: help me connect ${skill.label} for Link contacts.`,
        `Open or use the managed skill/MCP matching "${skill.query}" and walk me through the connection flow.`,
        `Once connected, verify ${skill.connectorName} contacts are available in the Phone contacts view and summarize any required credentials or approvals.`,
        "Ask one concise question at a time.",
      ].join("\n"),
    });
    setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
    setSelectedSessionId(session.id);
    setView("chats");
  }

  function openAgentSetupSettings() {
    setSettingsTab("agents");
    setAssistantCollapsed(true);
    setView("settings");
  }

  const signedIn = Boolean(accountStatus?.signedIn && !signedOutLocally);

  useEffect(() => {
    if (!signedIn) return;

    let cancelled = false;
    async function validateActiveSession() {
      try {
        const next = await linkApi.getAgentControlPlaneAuthStatus();
        if (cancelled) return;
        setAccountStatus(next);
        if (!next.ready) {
          setSignedOutLocally(false);
          setAuthGateError(next.message || "Your Telnyx Okta session expired. Sign in again to use Link.");
        }
      } catch (error) {
        if (!cancelled) {
          setAccountStatus((current) => current ? { ...current, ready: false, signedIn: false, message: error instanceof Error ? error.message : "Unable to verify your Telnyx Okta session." } : current);
          setAuthGateError(error instanceof Error ? error.message : "Unable to verify your Telnyx Okta session.");
        }
      }
    }

    const intervalId = window.setInterval(() => void validateActiveSession(), 60_000);
    window.addEventListener("focus", validateActiveSession);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", validateActiveSession);
    };
  }, [signedIn]);

  async function signInFromGate() {
    setAuthGateBusy(true);
    setAuthGateError("");
    try {
      const next = await linkApi.signInAgentControlPlane();
      setAccountStatus(next);
      setSignedOutLocally(false);
      await refresh();
    } catch (error) {
      setAuthGateError(error instanceof Error ? error.message : "Okta sign-in failed.");
    } finally {
      setAuthGateBusy(false);
    }
  }

  return (
    <div className={`desktop ${terminalOpen ? "terminalOpen" : ""}`} data-theme={colorMode} style={primaryColorStyle}>
      <TitleBar
        signedIn={signedIn}
        railExpanded={railExpanded}
        setRailExpanded={setRailExpanded}
        assistantCollapsed={assistantCollapsed}
        toggleAssistant={() => setAssistantCollapsed((collapsed) => !collapsed)}
        terminalOpen={terminalOpen}
        toggleTerminal={() => setTerminalOpen((open) => !open)}
      />
      {!signedIn ? (
        <AuthGate
          busy={authGateBusy}
          error={authGateError}
          onSignIn={() => void signInFromGate()}
        />
      ) : (
      <div className={`workspace ${showContextSidebar ? "" : "workspaceNoSidebar"} ${railExpanded ? "railExpanded" : "railCollapsed"}`}>
        <Rail
          view={view}
          setView={setView}
          expanded={railExpanded}
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
            wikiState={wikiState}
            selectedWorkspaceId={selectedWorkspace?.id ?? ""}
            selectedSessionId={selectedSession?.id ?? ""}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
            setSelectedSessionId={setSelectedSessionId}
            setSelectedWorkId={setSelectedWorkId}
            setView={setView}
          />
        )}
        <main className="mainPane">
          <div className={`appSurface ${assistantCollapsed ? "assistantCollapsed" : ""}`}>
            <div className="pageSurface">
              {!selectedArtifact && view === "onboarding" && onboarding && (
                <OnboardingView
                  onboarding={onboarding}
                  setOnboarding={setOnboarding}
                  connectors={connectors}
                  memoryBanks={memoryBanks}
                  skills={skills}
                  agents={agents}
                  wikiState={wikiState}
                  publisherReadiness={publisherReadiness}
                  telnyxCredentialReady={telnyxCredentialReady}
                  liteLlmReady={liteLlmCredentialReady}
                  activeDialerConfig={activeDialerConfig}
                  setView={setView}
                  openSettingsTab={(nextTab) => {
                    setSettingsTab(nextTab);
                    setView("settings");
                  }}
                  refresh={refresh}
                  startPromptChat={startOnboardingPromptChat}
                  startSharedDraft={startOnboardingSharedDraft}
                />
              )}
              {selectedArtifact && <ArtifactViewer artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />}
              {!selectedArtifact && view === "widgets" && <WidgetsView libraryOpen={widgetLibraryOpen} setLibraryOpen={setWidgetLibraryOpen} />}
              {!selectedArtifact && view === "chats" && (
                <ChatsView
                  sessions={chatSessions}
                  workspaces={workspaces}
                  memoryBanks={memoryBanks}
                  selectedSession={selectedSession}
	                  selectSession={openChatSession}
		                  newSession={openNewChatSessionDraft}
	                  openArtifact={setSelectedArtifact}
	                  openMemory={() => setMemoryOpen(true)}
	                  activeAgent={activeAgent}
	                  archiveRefreshKey={archiveRefreshKey}
	                  startEdgeAppDeployChat={startEdgeAppDeployChat}
	                  onEdgePreviewReady={setEdgePreviewSurface}
	                  edgePreviewSurface={edgePreviewSurface}
	                  closeEdgePreview={() => setEdgePreviewSurface(null)}
	                  updateChatSession={updateChatSession}
	                  refreshTables={refreshSessionTablesThenAll}
	                />
              )}
              {!selectedArtifact && view === "gateway" && (
                <GatewayView
                  messages={gatewayMessages}
                  readiness={gatewayReadiness}
                  mode={gatewayMode}
                  warning={gatewayWarning}
                  refresh={refresh}
                />
              )}
              {!selectedArtifact && view === "agents" && (
                <AgentsView
                  agents={agents}
                  skills={skills}
                  refresh={refresh}
                  setView={setView}
                  bookmarkedAgentIds={bookmarkedAgentIds}
                  setBookmarkedAgentIds={setBookmarkedAgentIds}
                  activeAgent={activeAgent}
                  setActiveAgent={setActiveAgent}
                  openAgentSetup={openAgentSetupSettings}
                  startSkillBuilderChat={startSkillBuilderChat}
                />
              )}
              {!selectedArtifact && view === "workboard" && (
                <WorkboardView
                  agents={agents}
                  bookmarkedAgentIds={bookmarkedAgentIds}
                  activeAgent={activeAgent}
                  selectedChatAgent={selectedWorkboardChatAgent}
                  accountStatus={accountStatus}
                  selectedSessionId={selectedSessionId}
                  openTaskMonitoringSession={openTaskMonitoringSession}
                />
              )}
              {!selectedArtifact && view === "scribes" && <ScribesView />}
              {!selectedArtifact && view === "drive" && (
                <DriveView
                  sessions={chatSessions}
                  publishedApps={publishedApps}
                  activeAgent={activeAgent}
                  openArtifact={setSelectedArtifact}
                  openSession={openChatSession}
                  openScribes={() => setView("scribes")}
                  refreshTables={refreshSessionTablesThenAll}
                />
              )}
              {!selectedArtifact && view === "calendar" && (
                <CalendarView connectors={connectors} linkedPhoneNumber={linkedPhoneNumber} setView={setView} refresh={refresh} />
              )}
              {!selectedArtifact && view === "inbox" && (
                <PhoneView
                  connectors={connectors}
                  linkedPhoneNumber={linkedPhoneNumber}
                  setLinkedPhoneNumber={setLinkedPhoneNumber}
                  setView={setView}
                  tab="inbox"
                  setTab={(nextTab) => {
                    if (nextTab !== "inbox") {
                      setPhoneTab(nextTab);
                      setView("phone");
                    }
                  }}
                  refresh={refresh}
                  startManagedSkillSetupChat={startManagedSkillSetupChat}
                  startEmailDraftChat={startEmailDraftChat}
                  standaloneInbox
                  hideSectionSidebar
                />
              )}
              {!selectedArtifact && view === "phone" && (
                <PhoneView
                  connectors={connectors}
                  linkedPhoneNumber={linkedPhoneNumber}
                  setLinkedPhoneNumber={setLinkedPhoneNumber}
                  setView={setView}
                  tab="calls"
                  setTab={setPhoneTab}
                  refresh={refresh}
                  startManagedSkillSetupChat={startManagedSkillSetupChat}
                  startEmailDraftChat={startEmailDraftChat}
                  openNewCall={() => {
                    setAssistantMode("phone");
                    setAssistantCollapsed(false);
                  }}
                  hideSectionSidebar
                  headerParent="Link"
                />
              )}
              {!selectedArtifact && view === "memory" && <MemoryView banks={memoryBanks} openMemory={() => setMemoryOpen(true)} />}
              {!selectedArtifact && (view === "apps" || view === "skills" || view === "wiki") && (
                <WikiView
                  initialTab={view === "apps" || view === "skills" ? view : undefined}
                  wikiState={wikiState}
                  skills={skills}
                  selectedWorkspace={selectedWorkspace}
                  activeAgent={activeAgent}
                  agents={agents}
                  bookmarkedAgentIds={bookmarkedAgentIds}
                  publishedApps={publishedApps}
                  publisherReadiness={publisherReadiness}
	                  refreshPublishedApps={async () => {
	                    const [status, apps] = await Promise.all([linkApi.getPublisherReadiness(), linkApi.listPublishedApps()]);
	                    setPublisherReadiness(status);
	                    setPublishedApps(apps);
	                  }}
	                  skillSearchRequest=""
	                  shareExplorerResultToAgent={shareExplorerResultToAgent}
	                  setView={setView}
	                  onEdgePreviewReady={(preview) => {
	                    setEdgePreviewSurface(preview);
	                    setView("chats");
	                  }}
	                />
              )}
              {!selectedArtifact && view === "settings" && (
                <SettingsView
                  connectors={connectors}
                  tools={tools}
                  refresh={refresh}
                  activeDialerConfig={activeDialerConfig}
                  setActiveDialerConfig={setActiveDialerConfig}
                  tab={settingsTab}
                  setTab={setSettingsTab}
                  linkedPhoneNumber={linkedPhoneNumber}
                  setLinkedPhoneNumber={setLinkedPhoneNumber}
                  setView={setView}
                  startManagedSkillSetupChat={startManagedSkillSetupChat}
                />
              )}
            </div>
            <AssistantPanel
              mode={assistantMode}
              setMode={setAssistantMode}
              collapsed={assistantCollapsed}
              setCollapsed={setAssistantCollapsed}
              skills={skills}
              agents={agents}
              bookmarkedAgentIds={bookmarkedAgentIds}
              activeAgent={activeAgent}
              newSessionDraftOpen={newSessionDraftOpen}
              setNewSessionDraftOpen={setNewSessionDraftOpen}
              createNewChatSession={createNewChatSession}
              selectedChatAgentId={selectedChatAgentId}
              setSelectedChatAgentId={setSelectedChatAgentId}
              selectedSession={selectedSession}
              selectedWorkspace={selectedWorkspace}
              setChatSessions={setChatSessions}
              updateChatSession={updateChatSession}
              selectSession={setSelectedSessionId}
              openArtifact={setSelectedArtifact}
              refresh={refresh}
              setView={setView}
              openPhoneContacts={() => {
                setSettingsTab("contacts");
                setView("settings");
              }}
              liteLlmReady={liteLlmCredentialReady}
              liteLlmRuntime={liteLlmRuntime}
              chatModelMode={chatModelMode}
              setChatModelMode={setChatModelMode}
              linkedPhoneNumber={linkedPhoneNumber}
              setLinkedPhoneNumber={setLinkedPhoneNumber}
              telnyxApiReady={telnyxCredentialReady || connectors.some((connector) => connector.id === "telnyx" && (connector.status === "connected" || connector.status === "signed_in"))}
              activeDialerConfig={activeDialerConfig}
              connectors={connectors}
              designSystemSessionPreferences={designSystemSessionPreferences}
              setDesignSystemSessionPreferences={setDesignSystemSessionPreferences}
              onArchiveSaved={() => setArchiveRefreshKey((key) => key + 1)}
	              onEdgePreviewReady={(preview) => {
	                setEdgePreviewSurface(preview);
	                setView("chats");
	              }}
	              edgePreviewSurface={edgePreviewSurface}
	            />
          </div>
        </main>
      </div>
      )}
      {signedIn && terminalOpen && <TerminalDock onClose={() => setTerminalOpen(false)} />}
      {signedIn && memoryOpen && <MemoryModal onClose={() => setMemoryOpen(false)} sources={connectors.map((connector) => connector.name)} />}
    </div>
  );
}

function AuthGate({
  busy,
  error,
  onSignIn,
}: {
  busy: boolean;
  error: string;
  onSignIn: () => void;
}) {
  return (
    <main className="authGate">
      <section className="authGateCard" aria-label="Telnyx Okta sign in">
        <div className="authGateIcon">
          <BookOpen size={34} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <div>
          <h1>Telnyx Link</h1>
          <p>Sign in to bring your agents, tasks, calls, calendar, docs, and internal tools into one secure workspace.</p>
        </div>
        <button className="button primary" onClick={onSignIn} disabled={busy}>
          {busy ? "Signing in" : "Sign in with Okta"}
        </button>
        {error && <div className="errorBanner">{error}</div>}
      </section>
    </main>
  );
}

function GatewayView({
  messages,
  readiness,
  mode,
  warning,
  refresh,
}: {
  messages: MessageGatewayMessage[];
  readiness: MessageGatewayReadiness | null;
  mode: MessageGatewayListResult["mode"];
  warning: string;
  refresh: () => Promise<void>;
}) {
  const [to, setTo] = useState("alice@telnyx.com");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [transport, setTransport] = useState<MessageGatewayTransport>("auto");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [eventsResult, setEventsResult] = useState<MessageGatewayEventsResult | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const selectedMessage = selectedMessageId ? messages.find((message) => message.id === selectedMessageId) : messages[0];
  const latestMessages = messages.slice(0, 25);
  const readinessTone = readiness?.ready ? "success" : readiness?.reachable ? "warning" : "danger";

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await linkApi.sendGatewayMessage({
        to: splitInputList(to),
        subject,
        body,
        transport,
        idempotencyKey: randomIdempotencyKey(),
        metadata: {
          source: "link-desktop",
          surface: "gateway-view",
        },
      });
      setNotice(result.warning || `Message ${result.message.status} through ${result.mode === "live" ? "Link Message Gateway" : result.mode}.`);
      setSelectedMessageId(result.message.id);
      setBody("");
      await refresh();
      await loadEvents(result.message.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message Gateway send failed.");
    } finally {
      setBusy(false);
    }
  }

  async function loadEvents(messageId: string) {
    if (!messageId) return;
    setEventsLoading(true);
    setSelectedMessageId(messageId);
    try {
      setEventsResult(await linkApi.listGatewayMessageEvents({ messageId }));
    } catch (err) {
      setEventsResult({
        mode: "preview",
        serviceUrl: "local",
        warning: err instanceof Error ? err.message : "Unable to load delivery events.",
        events: [],
      });
    } finally {
      setEventsLoading(false);
    }
  }

  return (
    <section className="gatewayView">
      <PageSectionHeader
        parent="Link"
        title="Gateway"
        action={(
          <button className="button secondary" type="button" onClick={() => void refresh()}>
            <RefreshCw size={15} />
            Refresh
          </button>
        )}
      />

      <div className="gatewayStatusStrip">
        <div className="gatewayStatusItem">
          <StatusDot tone={readinessTone} />
          <div>
            <strong>{readiness?.ready ? "Ready" : readiness?.reachable ? "Reachable" : "Unavailable"}</strong>
            <span>{readiness?.message || "Checking Link Message Gateway."}</span>
          </div>
        </div>
        <div className="gatewayStatusItem">
          <ShieldCheck size={17} />
          <div>
            <strong>{readiness?.authConfigured ? "Auth configured" : "Auth needed"}</strong>
            <span>{readiness?.serviceUrl || "No service URL loaded"}</span>
          </div>
        </div>
        <div className="gatewayStatusItem">
          <MessageSquare size={17} />
          <div>
            <strong>{formatGatewayMode(mode)}</strong>
            <span>{messages.length} envelopes in the visible ledger</span>
          </div>
        </div>
      </div>

      {(warning || notice || error) && (
        <div className={`gatewayNotice ${error ? "danger" : warning ? "warning" : "success"}`}>
          {error || notice || warning}
        </div>
      )}

      <div className="gatewayShell">
        <form className="gatewayComposer" onSubmit={sendMessage}>
          <div className="gatewayComposerHeader">
            <div>
              <strong>Send via Link</strong>
              <small>Create a routed delivery envelope.</small>
            </div>
            <Badge tone={readinessTone === "success" ? "success" : readinessTone === "warning" ? "warning" : "danger"}>
              {formatGatewayMode(mode)}
            </Badge>
          </div>
          <label className="workboardCreateField full">
            <span>To</span>
            <textarea
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="alice@telnyx.com, agent:aida, group:messaging-ops"
            />
          </label>
          <label className="workboardCreateField">
            <span>Transport</span>
            <select value={transport} onChange={(event) => setTransport(event.target.value as MessageGatewayTransport)}>
              <option value="auto">Auto</option>
              <option value="slack">Slack</option>
              <option value="google_chat">Google Chat</option>
              <option value="a2a">A2A</option>
            </select>
          </label>
          <label className="workboardCreateField wide">
            <span>Subject</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Optional subject" />
          </label>
          <label className="workboardCreateField full">
            <span>Message</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Message body"
              rows={7}
            />
          </label>
          <div className="gatewayComposerActions">
            <button className="button secondary" type="button" onClick={() => {
              setTo("group:messaging-ops");
              setSubject("Messaging ops update");
              setBody("Quick update from Link.");
              setTransport("auto");
            }}>
              <Users size={15} />
              Group DM
            </button>
            <button className="button secondary" type="button" onClick={() => {
              setTo("agent:aida");
              setSubject("A2A handoff");
              setBody("Please review this handoff and reply with next steps.");
              setTransport("a2a");
            }}>
              <Bot size={15} />
              Bot DM
            </button>
            <button className="button primary" type="submit" disabled={busy || !body.trim() || splitInputList(to).length === 0}>
              <Send size={15} />
              {busy ? "Sending" : "Send"}
            </button>
          </div>
        </form>

        <section className="gatewayLedger">
          <div className="gatewayLedgerHeader">
            <div>
              <strong>Delivery Ledger</strong>
              <small>Provider state and external references</small>
            </div>
            <div className="tagList">
              {readiness?.checks.slice(0, 3).map((check) => (
                <span key={check.name}>{check.ok ? "OK" : "Needs"}: {check.name}</span>
              ))}
            </div>
          </div>
          {latestMessages.length === 0 ? (
            <EmptyState title="No envelopes yet" body="Send a message to create the first delivery ledger row." icon={Send} />
          ) : (
            <div className="gatewayMessageList">
              {latestMessages.map((message) => (
                <article className={`gatewayMessageRow ${selectedMessage?.id === message.id ? "selected" : ""}`} key={message.id}>
                  <div className="gatewayMessageSummary">
                    <div>
                      <div className="connectorTitle">
                        <strong>{message.subject || message.body?.slice(0, 72) || message.id}</strong>
                        <Badge tone={gatewayStatusTone(message.status)}>{formatStatusLabel(message.status)}</Badge>
                      </div>
                      <p>{message.to.join(", ")}</p>
                      <div className="workboardMeta">
                        <span><Clock size={12} />{relativeDate(message.updatedAt)}</span>
                        <span><Send size={12} />{formatTransportLabel(message.transportHint)}</span>
                        <span>{message.id}</span>
                      </div>
                    </div>
                    <button className="button secondary" type="button" onClick={() => void loadEvents(message.id)}>
                      <List size={14} />
                      Events
                    </button>
                  </div>
                  <div className="gatewayDeliveries">
                    {message.deliveries.map((delivery) => (
                      <div className="gatewayDeliveryRow" key={delivery.id}>
                        <div>
                          <strong>{delivery.recipient}</strong>
                          <small>{delivery.routeReason}</small>
                        </div>
                        <Badge tone={gatewayStatusTone(delivery.status)}>{formatStatusLabel(delivery.status)}</Badge>
                        <span>{formatTransportLabel(delivery.transport)}</span>
                        {delivery.providerUrl ? (
                          <a className="textLink" href={delivery.providerUrl} target="_blank" rel="noreferrer">
                            <ExternalLink size={13} />
                            Provider
                          </a>
                        ) : delivery.taskId ? (
                          <span>{delivery.taskId}</span>
                        ) : (
                          <span>{delivery.providerMessageId || "No external ref"}</span>
                        )}
                      </div>
                    ))}
                    {message.deliveries.length === 0 && <div className="gatewayDeliveryEmpty">No deliverable recipients</div>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedMessage && (
        <section className="gatewayEventsPanel">
          <div className="gatewayLedgerHeader">
            <div>
              <strong>Delivery Events</strong>
              <small>{selectedMessage.id}</small>
            </div>
            <button className="button secondary" type="button" onClick={() => void loadEvents(selectedMessage.id)} disabled={eventsLoading}>
              <RefreshCw size={14} />
              {eventsLoading ? "Loading" : "Reload"}
            </button>
          </div>
          {eventsResult?.warning && <div className="gatewayNotice warning">{eventsResult.warning}</div>}
          <div className="gatewayEventList">
            {(eventsResult?.events ?? []).length === 0 ? (
              <div className="gatewayDeliveryEmpty">Select Events to load provider and delivery updates.</div>
            ) : eventsResult!.events.map((event) => (
              <div className="gatewayEventRow" key={event.id}>
                <span><StatusDot tone={event.type.includes("failed") || event.type.includes("rejected") ? "danger" : event.type.includes("retry") ? "warning" : "success"} /></span>
                <div>
                  <strong>{event.type}</strong>
                  <small>{event.detail}</small>
                </div>
                <span>{event.transport ? formatTransportLabel(event.transport) : "Gateway"}</span>
                <span>{relativeDate(event.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function TitleBar({
  signedIn,
  railExpanded,
  setRailExpanded,
  assistantCollapsed,
  toggleAssistant,
  terminalOpen,
  toggleTerminal,
}: {
  signedIn: boolean;
  railExpanded: boolean;
  setRailExpanded: (expanded: boolean) => void;
  assistantCollapsed: boolean;
  toggleAssistant: () => void;
  terminalOpen: boolean;
  toggleTerminal: () => void;
}) {
  return (
    <header className="titleBar">
      {signedIn && (
        <div className="titleBarActions">
          <button
            className="titleBarAction"
            type="button"
            onClick={() => setRailExpanded(!railExpanded)}
            aria-label={railExpanded ? "Collapse left sidebar" : "Expand left sidebar"}
            title={railExpanded ? "Collapse left sidebar" : "Expand left sidebar"}
          >
            <CodexLeftSidebarIcon collapsed={!railExpanded} />
          </button>
          <button
            className="titleBarAction"
            type="button"
            onClick={toggleTerminal}
            aria-label={terminalOpen ? "Close terminal" : "Open terminal"}
            title={terminalOpen ? "Close terminal" : "Terminal"}
          >
            <CodexBottomPanelIcon />
          </button>
          <button
            className="titleBarAction"
            type="button"
            onClick={toggleAssistant}
            aria-label={assistantCollapsed ? "Expand assistant sidebar" : "Collapse assistant sidebar"}
            title={assistantCollapsed ? "Expand assistant sidebar" : "Collapse assistant sidebar"}
          >
            <CodexRightSidebarIcon collapsed={assistantCollapsed} />
          </button>
        </div>
      )}
    </header>
  );
}

function CodexBottomPanelIcon() {
  return (
    <svg className="codexTitleBarIcon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="3" y="2.75" width="14" height="14.5" rx="2.25" />
      <path d="M3.5 13.25h13" />
    </svg>
  );
}

function CodexRightSidebarIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className="codexTitleBarIcon codexRightSidebarIcon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="3" y="2.75" width="14" height="14.5" rx="2.25" />
      <path d="M13.25 3.25v13.5" />
      {collapsed && <path d="m7.5 7 2.25 3-2.25 3" />}
    </svg>
  );
}

function CodexLeftSidebarIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className="codexTitleBarIcon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="3" y="2.75" width="14" height="14.5" rx="2.25" />
      <path d="M6.75 3.25v13.5" />
      {collapsed && <path d="m12.5 7-2.25 3 2.25 3" />}
    </svg>
  );
}

function TerminalDock({ onClose }: { onClose: () => void }) {
  const initialTerminalId = "terminal-1";
  const [tabs, setTabs] = useState([{ id: initialTerminalId, title: "Telnyx Link" }]);
  const [activeTerminalId, setActiveTerminalId] = useState(initialTerminalId);
  const [statuses, setStatuses] = useState<Record<string, TerminalStatus>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [commands, setCommands] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const terminalSequenceRef = useRef(1);
  const outputRef = useRef<HTMLPreElement | null>(null);
  const activeStatus = statuses[activeTerminalId] ?? null;
  const activeOutput = outputs[activeTerminalId] ?? "";
  const activeCommand = commands[activeTerminalId] ?? "";

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = linkApi.onTerminalOutput((event) => {
      if (cancelled) return;
      const terminalId = event.terminalId || event.status.id || activeTerminalId;
      setStatuses((current) => ({ ...current, [terminalId]: event.status }));
      setOutputs((current) => ({
        ...current,
        [terminalId]: `${current[terminalId] ?? ""}${sanitizeTerminalText(event.text)}`.slice(-80_000),
      }));
    });

    async function openTerminal(terminalId: string, title: string) {
      setBusy(true);
      try {
        const current = await linkApi.getTerminalStatus({ terminalId });
        if (cancelled) return;
        setStatuses((items) => ({ ...items, [terminalId]: current }));
        setOutputs((items) => ({ ...items, [terminalId]: sanitizeTerminalText(current.buffer) }));
        if (!current.running) {
          const started = await linkApi.startTerminal({ terminalId, title });
          if (cancelled) return;
          setStatuses((items) => ({ ...items, [terminalId]: started }));
          setOutputs((items) => ({ ...items, [terminalId]: sanitizeTerminalText(started.buffer) }));
        }
      } catch (error) {
        if (!cancelled) {
          setOutputs((items) => ({ ...items, [terminalId]: `Terminal could not start: ${error instanceof Error ? error.message : "Unknown error"}\n` }));
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void openTerminal(initialTerminalId, "Telnyx Link");
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [activeOutput, activeTerminalId]);

  async function addTerminalTab() {
    terminalSequenceRef.current += 1;
    const terminalId = `terminal-${terminalSequenceRef.current}`;
    const title = `Telnyx Link ${terminalSequenceRef.current}`;
    setTabs((current) => [...current, { id: terminalId, title }]);
    setActiveTerminalId(terminalId);
    setBusy(true);
    try {
      const started = await linkApi.startTerminal({ terminalId, title });
      setStatuses((items) => ({ ...items, [terminalId]: started }));
      setOutputs((items) => ({ ...items, [terminalId]: sanitizeTerminalText(started.buffer) }));
    } catch (error) {
      setOutputs((items) => ({ ...items, [terminalId]: `Terminal could not start: ${error instanceof Error ? error.message : "Unknown error"}\n` }));
    } finally {
      setBusy(false);
    }
  }

  async function closeTerminalTab(event: ReactMouseEvent<HTMLButtonElement>, terminalId: string) {
    event.stopPropagation();
    const closingIndex = tabs.findIndex((tab) => tab.id === terminalId);
    const remainingTabs = tabs.filter((tab) => tab.id !== terminalId);
    if (remainingTabs.length === 0) {
      await linkApi.stopTerminal({ terminalId }).catch(() => undefined);
      onClose();
      return;
    }

    if (activeTerminalId === terminalId) {
      const nextIndex = Math.min(closingIndex, remainingTabs.length - 1);
      setActiveTerminalId(remainingTabs[nextIndex]?.id ?? remainingTabs[0].id);
    }
    setTabs(remainingTabs);
    setStatuses((items) => {
      const next = { ...items };
      delete next[terminalId];
      return next;
    });
    setOutputs((items) => {
      const next = { ...items };
      delete next[terminalId];
      return next;
    });
    setCommands((items) => {
      const next = { ...items };
      delete next[terminalId];
      return next;
    });
    await linkApi.stopTerminal({ terminalId }).catch(() => undefined);
  }

  async function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runTerminalCommand();
  }

  async function runTerminalCommand() {
    const nextCommand = activeCommand.trimEnd();
    if (!nextCommand || busy) return;
    setCommands((items) => ({ ...items, [activeTerminalId]: "" }));
    setOutputs((items) => ({
      ...items,
      [activeTerminalId]: `${items[activeTerminalId] ?? ""}${terminalPrompt(activeStatus)}${nextCommand}\n`.slice(-80_000),
    }));
    try {
      const next = await linkApi.writeTerminal({ terminalId: activeTerminalId, text: `${nextCommand}\n` });
      setStatuses((items) => ({ ...items, [activeTerminalId]: next }));
      setOutputs((items) => ({
        ...items,
        [activeTerminalId]: next.buffer && next.buffer.length > (items[activeTerminalId] ?? "").length ? sanitizeTerminalText(next.buffer) : items[activeTerminalId] ?? "",
      }));
    } catch (error) {
      setOutputs((items) => ({
        ...items,
        [activeTerminalId]: `${items[activeTerminalId] ?? ""}Terminal error: ${error instanceof Error ? error.message : "Unknown error"}\n`.slice(-80_000),
      }));
    }
  }

  return (
    <section className="terminalDock" aria-label="Terminal">
      <header className="terminalDockHeader">
        <div className="terminalDockTabs" role="tablist" aria-label="Terminal tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`terminalDockTab ${activeTerminalId === tab.id ? "selected" : ""}`}
              role="tab"
              tabIndex={0}
              aria-selected={activeTerminalId === tab.id}
              onClick={() => setActiveTerminalId(tab.id)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                setActiveTerminalId(tab.id);
              }}
            >
              <SquareTerminal size={15} />
              <span>{tab.title}</span>
              <button
                className="terminalDockTabClose"
                type="button"
                onClick={(event) => void closeTerminalTab(event, tab.id)}
                aria-label={`Close ${tab.title}`}
                title={`Close ${tab.title}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button className="terminalNewTabButton" type="button" onClick={() => void addTerminalTab()} aria-label="Open bottom panel tab" title="Open bottom panel tab">
            <Plus size={14} />
          </button>
        </div>
        <div className="terminalDockMeta">
          <span>{activeStatus?.running ? "Running" : busy ? "Starting" : "Stopped"}</span>
          <button className="iconButton terminalCloseButton" type="button" onClick={onClose} aria-label="Close terminal" title="Close terminal">
            <X size={15} />
          </button>
        </div>
      </header>
      <pre className="terminalOutput" ref={outputRef}>{activeOutput || "Starting terminal...\n"}</pre>
      <form className="terminalCommandRow" onSubmit={submitCommand}>
        <span>{terminalPrompt(activeStatus)}</span>
        <input
          value={activeCommand}
          onChange={(event) => setCommands((items) => ({ ...items, [activeTerminalId]: event.target.value }))}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            void runTerminalCommand();
          }}
          placeholder="Run a command..."
          aria-label="Terminal command"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </form>
    </section>
  );
}

function terminalPrompt(status: TerminalStatus | null) {
  const cwd = status?.cwd?.split("/").filter(Boolean).pop() || "Telnyx Link";
  return `${cwd} % `;
}

function sanitizeTerminalText(value: string) {
  return String(value || "").replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

const internalTestingChecklistStorageKey = "telnyx-link-internal-testing-checklist";

const internalTestingChecklistItems = [
  { id: "chat", label: "Send one chat request", view: "chats" },
  { id: "plugin", label: "Connect or review one plugin", view: "settings" },
  { id: "skill", label: "Run or inspect one skill", view: "wiki" },
  { id: "widget", label: "Add or refresh one widget", view: "widgets" },
  { id: "approval", label: "Review one approval flow", view: "workspaces" },
  { id: "feedback", label: "File one feedback note", view: "chats" },
] satisfies { id: string; label: string; view: ViewId }[];

function readInternalTestingChecklist() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(internalTestingChecklistStorageKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function OnboardingView({
  onboarding,
  setOnboarding,
  connectors,
  memoryBanks,
  skills,
  agents,
  wikiState,
  publisherReadiness,
  telnyxCredentialReady,
  liteLlmReady,
  activeDialerConfig,
  setView,
  openSettingsTab,
  refresh,
  startPromptChat,
  startSharedDraft,
}: {
  onboarding: OnboardingState;
  setOnboarding: (state: OnboardingState) => void;
  connectors: ConnectorStatus[];
  memoryBanks: MemoryBank[];
  skills: SkillMetadata[];
  agents: AgentSummary[];
  wikiState: WikiState | null;
  publisherReadiness: LinkAppPublisherReadiness | null;
  telnyxCredentialReady: boolean;
  liteLlmReady: boolean;
  activeDialerConfig: DialerConfig;
  setView: (view: ViewId) => void;
  openSettingsTab: (tab: SettingsTab) => void;
  refresh: () => Promise<void>;
  startPromptChat: (prompt: string, title: string) => Promise<void>;
	  startSharedDraft: () => Promise<void>;
}) {
  const [acpAuth, setAcpAuth] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [whisperStatus, setWhisperStatus] = useState<WhisperStatus | null>(null);
  const [webRtcStatus, setWebRtcStatus] = useState<WebRtcStatus | null>(null);
  const [testingChecklist, setTestingChecklist] = useState<string[]>(() => readInternalTestingChecklist());
  const [busy, setBusy] = useState("");
  const completed = new Set(onboarding.completedStepIds);
  const connectedConnectors = connectors.filter((connector) => connector.status === "connected" || connector.status === "signed_in");
  const connector = (id: string) => connectors.find((item) => item.id === id);
  const connectorReady = (id: string) => {
    const item = connector(id);
    return item?.status === "connected" || item?.status === "signed_in";
  };
  const oktaComplete = Boolean(acpAuth?.ready || connector("agent-control-plane")?.status === "connected" || connector("agent-control-plane")?.status === "signed_in");
  const accountComplete = connectedConnectors.length >= 3 || completed.has("accounts");
  const squadToolsComplete = completed.has("squad-tools") || (skills.length > 0 && agents.length > 0 && completed.has("squad-review"));
  const hindsightComplete = connector("hindsight")?.status === "connected" && memoryBanks.length > 0;
  const rescueComplete = agents.some((agent) => agent.id === "slack-bot-troubleshooting");
  const requiredComplete = oktaComplete && accountComplete && squadToolsComplete;
  const squadBank = memoryBanks.find((bank) => bank.scope === "squad" || /squad|team|wiki/i.test(`${bank.name} ${bank.mission}`));
  const readinessItems = [
    {
      id: "okta",
      label: "Okta identity",
      ready: oktaComplete,
      detail: acpAuth?.message ?? "Sign in so Link can use employee and squad context.",
      action: "Settings",
      view: "settings" as ViewId,
    },
    {
      id: "litellm",
      label: "Model gateway",
      ready: liteLlmReady || connectorReady("litellm"),
      detail: liteLlmReady || connectorReady("litellm") ? "Local or cloud model routing is available." : "Install LiteLLM for local chat or save optional cloud gateway credentials.",
      action: "Settings",
      view: "settings" as ViewId,
    },
    {
      id: "google-workspace",
      label: "Google Workspace",
      ready: connectorReady("google-drive") || connectorReady("google-calendar"),
      detail: connectorReady("google-drive") || connectorReady("google-calendar") ? "Calendar, contacts, or Drive access is connected." : "Connect Google Workspace for meeting briefs and contacts.",
      action: "Settings",
      view: "settings" as ViewId,
    },
    {
      id: "github",
      label: "GitHub",
      ready: connectorReady("github"),
      detail: connectorReady("github") ? "GitHub device auth is available for source handoffs." : "Connect GitHub before testing app publishing and PR workflows.",
      action: "Settings",
      view: "settings" as ViewId,
    },
    {
      id: "telnyx",
      label: "Telnyx API",
      ready: telnyxCredentialReady || connectorReady("telnyx"),
      detail: telnyxCredentialReady || connectorReady("telnyx") ? "Telnyx API key is available to Link." : "Save a Telnyx API key before testing phone, STT, or Telnyx API actions.",
      action: "Settings",
      view: "settings" as ViewId,
    },
    {
      id: "phone",
      label: "Calls",
      ready: Boolean(webRtcStatus?.ready || activeDialerConfig.id),
      detail: webRtcStatus?.message ?? `Active dialer: ${activeDialerConfig.name || "Standard"}. WebRTC readiness has not loaded yet.`,
      action: "Calls",
      view: "phone" as ViewId,
    },
    {
      id: "whisper",
      label: "Whisper",
      ready: Boolean(whisperStatus?.available && whisperStatus.built && whisperStatus.apiKeyReady),
      detail: whisperStatus?.message ?? "Whisper readiness has not loaded yet.",
      action: "Speech",
      view: "settings" as ViewId,
    },
    {
      id: "publisher",
      label: "Publisher/VPN",
      ready: Boolean(publisherReadiness?.ready),
      detail: publisherReadiness?.message ?? "Publisher readiness has not loaded yet.",
      action: "Wiki",
      view: "wiki" as ViewId,
    },
  ];
  const readyCount = readinessItems.filter((item) => item.ready).length;
  const checklistCompleteCount = testingChecklist.length;
  const testerContext = [
    `Okta: ${oktaComplete ? "ready" : "not ready"}`,
    `Model gateway: ${liteLlmReady || connectorReady("litellm") ? "ready" : "missing"}`,
    `Google Workspace: ${connectorReady("google-drive") || connectorReady("google-calendar") ? "ready" : "missing"}`,
    `GitHub: ${connectorReady("github") ? "ready" : "missing"}`,
    `Telnyx API: ${telnyxCredentialReady || connectorReady("telnyx") ? "ready" : "missing"}`,
    `Phone: ${webRtcStatus?.ready ? "ready" : webRtcStatus?.message ?? "unknown"}`,
    `Whisper: ${whisperStatus?.available && whisperStatus.built ? "built" : whisperStatus?.message ?? "unknown"}`,
    `Publisher: ${publisherReadiness?.message ?? "unknown"}`,
    `Completed tester checks: ${checklistCompleteCount}/${internalTestingChecklistItems.length}`,
  ].join("\n");

  useEffect(() => {
    void linkApi.getAgentControlPlaneAuthStatus().then(setAcpAuth);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReadiness() {
      const [nextWhisper, nextWebRtc] = await Promise.allSettled([linkApi.getWhisperStatus(), linkApi.getWebRtcStatus()]);
      if (cancelled) return;
      if (nextWhisper.status === "fulfilled") setWhisperStatus(nextWhisper.value);
      if (nextWebRtc.status === "fulfilled") setWebRtcStatus(nextWebRtc.value);
    }

    void loadReadiness();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(internalTestingChecklistStorageKey, JSON.stringify(testingChecklist));
  }, [testingChecklist]);

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
    setView("chats");
  }

  async function dismissOnboarding() {
    const next = await linkApi.updateOnboarding({ dismissed: true });
    setOnboarding(next);
    setView("chats");
  }

  function toggleTestingChecklistItem(itemId: string) {
    setTestingChecklist((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  async function startFeedbackReport() {
    await startPromptChat([
      "Internal testing feedback report.",
      "Help me turn this into a concise Link bug report or product feedback note. Ask for the missing reproduction details, expected behavior, actual behavior, and severity.",
      "",
      "Current readiness context:",
      testerContext,
    ].join("\n"), "Internal testing feedback");
    if (!testingChecklist.includes("feedback")) setTestingChecklist((current) => [...current, "feedback"]);
  }

  const firstUseActions = [
    {
      id: "account-briefing",
      title: "Ask about an account",
      body: "Start a review-mode chat for an account or customer briefing.",
      icon: MessageSquare,
      action: () => startPromptChat("Brief me on a Telnyx customer or account. Ask for the account name if I did not provide one, then summarize current context, risks, open questions, and next actions.", "Account briefing"),
    },
    {
      id: "meeting-brief",
      title: "Brief today's meetings",
      body: "Use connected calendar and contacts where available.",
      icon: CalendarDays,
      action: () => startPromptChat("Brief me for today's meetings. Use connected Google Calendar and contacts if available; otherwise explain what connection is missing and give me a manual input checklist.", "Meeting briefing"),
    },
    {
      id: "squad-skill",
      title: "Find a squad skill",
      body: "Jump into Wiki to inspect or install squad-standard skills.",
      icon: Tags,
      action: () => {
        setView("wiki");
        return Promise.resolve();
      },
    },
    {
      id: "shared-draft",
      title: "Draft customer-safe update",
      body: "Create a reviewable approval item for testing the human gate.",
      icon: ShieldCheck,
      action: startSharedDraft,
    },
    {
      id: "phone-dictation",
      title: "Test phone or dictation",
      body: "Open the phone surface with current Telnyx readiness visible.",
      icon: PhoneCall,
      action: () => {
        setView("phone");
        return Promise.resolve();
      },
    },
  ];

  const steps = [
    {
      id: "okta",
      title: "Register with Telnyx Okta",
      body: "Use the native Okta flow so Link can pick up employee identity, internal auth cookies, and future squad context without storing passwords.",
      complete: oktaComplete,
      icon: ShieldCheck,
      meta: acpAuth?.message ?? "Okta session not checked yet.",
      action: <button className="button secondary" onClick={() => void signInOkta()} disabled={busy === "okta" || oktaComplete}>{busy === "okta" ? "Signing in" : oktaComplete ? "Okta connected" : "Sign in with Okta"}</button>,
      required: true,
    },
    {
      id: "accounts",
      title: "Set up Agent Plugins",
      body: "Connect the accounts and plugin permissions Link can use: LiteLLM, Slack, Hindsight, Guru or Drive, GitHub, Linear, Telnyx, and squad-standard tools.",
      complete: accountComplete,
      icon: Plug,
      meta: connectedConnectors.length > 0 ? `Connected: ${connectedConnectors.map((item) => item.name).join(", ")}` : "No accounts connected yet.",
      action: (
        <div className="onboardingActions">
          <button className="button secondary" onClick={() => setView("settings")}>Open Settings</button>
          <button className="button ghost" onClick={() => openSettingsTab("plugins")}>Review Plugins</button>
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
      icon: Tags,
      meta: `${skills.length} skills, ${agents.length} agents, ${rescueComplete ? "bot-troubleshooting available" : "rescue bot unavailable"}.`,
      action: (
        <div className="onboardingActions">
          <button className="button secondary" onClick={() => setView("wiki")}>Open Wiki</button>
          <button className="button ghost" onClick={() => setView("agents")}>Open Agents</button>
          <button className="button ghost" onClick={() => void markStep("squad-tools")}>Mark reviewed</button>
        </div>
      ),
      required: true,
    },
    {
      id: "hindsight-wiki",
      title: "Attach the squad archive",
      body: "If a squad archive exists, Link can use it as the user's starting wiki and long-term context layer.",
      complete: hindsightComplete || completed.has("hindsight-wiki"),
      icon: ArchiveIcon,
      meta: squadBank ? `Found ${squadBank.name}` : hindsightComplete ? `${memoryBanks.length} archives connected.` : "Connect an archive or create a squad archive when ready.",
      action: (
        <div className="onboardingActions">
          <button className="button secondary" onClick={() => setView("memory")}>Open Archive</button>
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
          <h1>Get Started</h1>
        </div>
        <div className="headerActions">
          <button className="button primary" onClick={() => void finishOnboarding()} disabled={!requiredComplete}>Finish setup</button>
        </div>
      </header>
      <div className="onboardingHero">
        <div>
          <strong>Connect the basics and start using Link.</strong>
        </div>
        <div className="onboardingHeroBadges">
          <Badge tone={requiredComplete ? "success" : "warning"}>{steps.filter((step) => step.complete).length}/{steps.length} setup</Badge>
          <Badge tone={readyCount >= 6 ? "success" : "warning"}>{readyCount}/{readinessItems.length} ready</Badge>
        </div>
      </div>
      <section className="startReadinessPanel" aria-label="Setup status">
        <div className="startSectionHeader">
          <div>
            <strong>Setup status</strong>
          </div>
          <button className="button secondary" onClick={() => void refresh()}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
        <div className="startReadinessGrid">
          {readinessItems.map((item) => (
            <button className={`startReadinessItem ${item.ready ? "ready" : "needsSetup"}`} key={item.id} onClick={() => setView(item.view)}>
              <span className="startReadinessIcon">{item.ready ? <Check size={15} /> : <Info size={15} />}</span>
              <span>
                <strong>{item.label}</strong>
              </span>
              <em>{item.action}</em>
            </button>
          ))}
        </div>
      </section>
      <section className="startTestingPanel" aria-label="Checklist">
        <div className="startSectionHeader">
          <div>
            <strong>Checklist</strong>
            <small>{checklistCompleteCount}/{internalTestingChecklistItems.length} done</small>
          </div>
        </div>
        <div className="testerChecklist">
          {internalTestingChecklistItems.map((item) => {
            const checked = testingChecklist.includes(item.id);
            return (
              <label className={`testerChecklistItem ${checked ? "checked" : ""}`} key={item.id}>
                <input type="checkbox" checked={checked} onChange={() => toggleTestingChecklistItem(item.id)} />
                <span>{item.label}</span>
                <button type="button" className="iconButton" title={`Open ${viewMeta[item.view].label}`} aria-label={`Open ${viewMeta[item.view].label}`} onClick={() => setView(item.view)}>
                  <ArrowRight size={14} />
                </button>
              </label>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function Rail({
  view,
  setView,
  expanded,
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
  const signedIn = Boolean(accountStatus?.signedIn && !signedOutLocally);
  const accountIdentity = accountStatus?.userName || accountStatus?.actor || accountStatus?.userId || "";
  const accountLabel = accountIdentity || (signedIn ? "Telnyx Okta" : "Not signed in");
  const accountInitials = accountIdentity ? initialsFromIdentity(accountIdentity) : "TL";
  const accountAvatarUrl = accountStatus?.avatarUrl || "";
  const accountAvatar = accountAvatarUrl ? <img src={accountAvatarUrl} alt="" aria-hidden="true" /> : accountInitials;

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
    if (view === "onboarding") setView("chats");
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
    setView("chats");
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
        <span className="railIconSlot"><Icon size={17} /></span>
        <span className="railLabel">{item.label}</span>
        <span className="railTooltip" role="tooltip">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="rail" aria-label="Primary" data-expanded={expanded}>
      <button className="railButton brandButton" title="Telnyx Link" onClick={() => setView("chats")}>
        <span className="railIconSlot"><img src="./telnyx-link-logo.png" alt="" aria-hidden="true" /></span>
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
      {renderRailButton({ id: "scribes", label: "Scribes", icon: ScribesWaveformIcon })}
      {renderRailButton({ id: "drive", label: "Drive", icon: FolderOpen })}
      {renderRailButton({ id: "settings", label: "Settings", icon: Settings })}
      <div className="accountMenuWrap" ref={accountMenuRef}>
        <button
          className={`avatar ${accountMenuOpen ? "selected" : ""}`}
          title={signedIn ? accountLabel : "User menu"}
          aria-label={signedIn ? `User menu for ${accountLabel}` : "User menu"}
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((open) => !open)}
        >
          {accountAvatar}
        </button>
        {accountMenuOpen && (
          <div className="accountMenu" role="menu">
            <div className="accountMenuHeader">
              <div className="accountAvatar">{accountAvatar}</div>
              <div>
                <strong>{signedIn ? "Signed in as" : "Signed out"}</strong>
                <small>{accountLabel}</small>
              </div>
              <button
                className="accountThemeButton"
                type="button"
                onClick={() => setColorMode(colorMode === "dark" ? "light" : "dark")}
                aria-label={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={colorMode === "dark" ? "Light mode" : "Dark mode"}
              >
                {colorMode === "dark" ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
              </button>
              <button
                className={`accountAuthButton ${signedIn ? "signedIn" : ""}`}
                onClick={() => void (signedIn ? logoutAccount() : signInAccount())}
              >
                {signedIn ? "Sign out" : "Sign in"}
              </button>
            </div>
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
  wikiState,
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
  wikiState: WikiState | null;
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
      <SidebarSection title="Taskbox" count={0} icon={<SquareCheck size={13} />} compact active={view === "workboard"} />
      <SidebarSection title="Scribes" count={0} icon={<ScribesWaveformIcon size={13} />} compact active={view === "scribes"} />
      <SidebarSection title="Drive" count={chatSessions.reduce((count, session) => count + session.messages.reduce((messageCount, message) => messageCount + (message.role === "assistant" ? (message.artifacts?.length ?? 0) : 0), 0), 0)} icon={<FolderOpen size={13} />} compact active={view === "drive"} />
      <SidebarSection title="Phone" count={1} icon={<Phone size={13} />} compact active={view === "phone"} />
      <SidebarSection title="Calendar" count={3} icon={<CalendarDays size={13} />} compact active={view === "calendar"} />
      <SidebarSection title="Agents" count={agents.length} icon={<Bot size={13} />} compact active={view === "agents"} />
      <SidebarSection title="Archive" count={memoryBanks.length} icon={<ArchiveIcon size={13} />} compact active={view === "memory"} />
      <SidebarSection title="Wiki" count={wikiState?.profile.masteredSkills ?? 0} icon={<BookOpen size={13} />} compact active={view === "wiki"} />
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
  const [category, setCategory] = useState<"All" | WidgetCatalogItem["category"]>("All");
  const [layoutEditing, setLayoutEditing] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState("");
  const [widgetDropTargetId, setWidgetDropTargetId] = useState("");
  const [widgetsLoading, setWidgetsLoading] = useState(true);
  const [widgetError, setWidgetError] = useState("");
  const [widgetCatalog, setWidgetCatalog] = useState<WidgetCatalogItem[]>([]);
  const [dashboardWidgetIds, setDashboardWidgetIds] = useState<string[]>([]);
  const [widgetData, setWidgetData] = useState<Record<string, WidgetDataResult>>({});
  const [widgetDataErrors, setWidgetDataErrors] = useState<Record<string, string>>({});
  const [refreshingWidgetId, setRefreshingWidgetId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWidgets() {
      setWidgetsLoading(true);
      setWidgetError("");
      try {
        const [catalog, layout] = await Promise.all([linkApi.listWidgetCatalog(), linkApi.listWidgetLayout()]);
        if (cancelled) return;
        const authorizedIds = new Set(catalog.map((widget) => widget.id));
        const savedIds = layout.widgetIds.filter((id) => authorizedIds.has(id));
        const startingIds = savedIds.length > 0 ? savedIds : catalog.slice(0, 3).map((widget) => widget.id);
        setWidgetCatalog(catalog);
        setDashboardWidgetIds(startingIds);
        void Promise.all(startingIds.map((widgetId) => loadWidgetData(widgetId)));
      } catch {
        if (!cancelled) {
          setWidgetCatalog([]);
          setDashboardWidgetIds([]);
          setWidgetError("Tableau widgets are unavailable. Connect the strict-access widget service from Settings.");
        }
      } finally {
        if (!cancelled) setWidgetsLoading(false);
      }
    }

    void loadWidgets();
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardWidgets = useMemo(() => {
    const byId = new Map(widgetCatalog.map((widget) => [widget.id, widget]));
    return dashboardWidgetIds.map((id) => byId.get(id)).filter((widget): widget is WidgetCatalogItem => Boolean(widget));
  }, [dashboardWidgetIds, widgetCatalog]);

  const filteredLibrary = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return widgetCatalog.filter((widget) => {
      const matchesCategory = category === "All" || widget.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [widget.title, widget.source, widget.category, widget.description, widget.tableau?.viewId ?? "", widget.tableau?.sheetName ?? ""].some((field) => field.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, query, widgetCatalog]);

  async function loadWidgetData(widgetId: string) {
    setWidgetDataErrors((current) => ({ ...current, [widgetId]: "" }));
    try {
      const data = await linkApi.refreshWidgetData({ widgetId });
      setWidgetData((current) => ({ ...current, [widgetId]: data }));
    } catch {
      setWidgetDataErrors((current) => ({ ...current, [widgetId]: "Access unavailable" }));
    }
  }

  function saveDashboardLayout(nextIds: string[]) {
    const deduped = [...new Set(nextIds)];
    setDashboardWidgetIds(deduped);
    void linkApi.saveWidgetLayout({ widgetIds: deduped }).then((layout) => {
      setDashboardWidgetIds(layout.widgetIds);
    }).catch(() => {
      setWidgetError("The widget layout could not be saved.");
    });
  }

  function addWidget(widget: WidgetCatalogItem) {
    if (dashboardWidgetIds.includes(widget.id)) return;
    saveDashboardLayout([...dashboardWidgetIds, widget.id]);
    void loadWidgetData(widget.id);
  }

  function removeWidget(widgetId: string) {
    saveDashboardLayout(dashboardWidgetIds.filter((id) => id !== widgetId));
  }

  function startWidgetDrag(event: DragEvent<HTMLElement>, widgetId: string) {
    if (!layoutEditing) return;
    setDraggedWidgetId(widgetId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-link-widget", widgetId);
    event.dataTransfer.setData("text/plain", widgetId);
  }

  function allowWidgetDrop(event: DragEvent<HTMLElement>, widgetId: string) {
    if (!layoutEditing || draggedWidgetId === widgetId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setWidgetDropTargetId(widgetId);
  }

  function dropWidget(event: DragEvent<HTMLElement>, targetWidgetId: string) {
    event.preventDefault();
    const sourceWidgetId = event.dataTransfer.getData("application/x-link-widget") || event.dataTransfer.getData("text/plain");
    setDraggedWidgetId("");
    setWidgetDropTargetId("");
    if (!sourceWidgetId || sourceWidgetId === targetWidgetId) return;

    const sourceIndex = dashboardWidgetIds.indexOf(sourceWidgetId);
    const targetIndex = dashboardWidgetIds.indexOf(targetWidgetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const next = [...dashboardWidgetIds];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    saveDashboardLayout(next);
  }

  function endWidgetDrag() {
    setDraggedWidgetId("");
    setWidgetDropTargetId("");
  }

  async function refreshDashboardWidget(widgetId: string) {
    setRefreshingWidgetId(widgetId);
    await loadWidgetData(widgetId);
    setRefreshingWidgetId("");
  }

  return (
    <section className="content widgetsView">
      <header className="pageHeader">
        <div>
          <h1>Widgets</h1>
	        </div>
	        <div className="headerActions">
          <button className="button primary" onClick={() => setLibraryOpen(true)}>
	            <Plus size={15} />
	            Add Widget
	          </button>
	        </div>
	      </header>

      <div className="widgetHomeGrid">
        {libraryOpen ? (
          <section className="widgetLibrary widgetLibraryTakeover" aria-label="Widget library">
            <div className="widgetLibraryHeader">
              <div>
                <strong>Widget library</strong>
                <small>Browse Tableau widgets authorized for your user and squad</small>
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
                {([
                  ["All", "All", Grid2X2],
                  ["Revenue", "Revenue", Target],
                  ["Operations", "Operations", Settings],
                  ["Product", "Product", Store],
                ] as const).map(([item, label, Icon]) => (
                  <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="widgetLibraryList">
              {filteredLibrary.map((widget) => {
                const added = dashboardWidgetIds.includes(widget.id);
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
              {filteredLibrary.length === 0 && (
                <EmptyState
                  title={widgetsLoading ? "Loading widgets" : "No authorized widgets"}
                  body={widgetError || "Try another report name or request access from the widget owner squad."}
                  icon={BarChart}
                />
              )}
            </div>
          </section>
	        ) : (
	          <section className="widgetCanvas" aria-label="Home widgets">
	            {dashboardWidgets.length >= 2 && (
	              <div className="widgetCanvasHeader">
	                <button className={`button ${layoutEditing ? "primary" : "secondary"} ${layoutEditing ? "active" : ""}`} onClick={() => setLayoutEditing((editing) => !editing)} aria-pressed={layoutEditing}>
	                  <LayoutDashboard size={15} />
	                  {layoutEditing ? "Done" : "Manage layout"}
	                </button>
	              </div>
	            )}
            <div className={`dashboardWidgetGrid ${layoutEditing ? "layoutEditing" : ""}`}>
              {dashboardWidgets.map((widget) => {
                const embedded = Boolean(widget.tableau?.url);
                return (
                  <article
                    className={`dashboardWidget ${embedded ? "tableauEmbedWidget" : ""} ${draggedWidgetId === widget.id ? "dragging" : ""} ${widgetDropTargetId === widget.id ? "dropTarget" : ""}`}
                    key={widget.id}
                    draggable={layoutEditing}
                    onDragStart={(event) => startWidgetDrag(event, widget.id)}
                    onDragOver={(event) => allowWidgetDrop(event, widget.id)}
                    onDragLeave={() => setWidgetDropTargetId((current) => current === widget.id ? "" : current)}
                    onDrop={(event) => dropWidget(event, widget.id)}
                    onDragEnd={endWidgetDrag}
                  >
                    <div className="widgetCardTop">
                      <div className="connectorIcon">{sourceInitials(widget.source)}</div>
                      <div>
                        <strong>{widget.title}</strong>
                        <small>{widget.source} - {widget.cadence}</small>
                      </div>
                      <button className="iconButton" aria-label={`Refresh ${widget.title}`} onClick={() => void refreshDashboardWidget(widget.id)}>
                        <RefreshCw size={14} className={refreshingWidgetId === widget.id ? "spinning" : ""} />
                      </button>
                      <button className="iconButton" aria-label={`Remove ${widget.title}`} onClick={() => removeWidget(widget.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="widgetMetric">
                      <span>{widgetMetricValue(widget, widgetData[widget.id])}</span>
                      <small>{widgetMetricTrend(widget, widgetData[widget.id])}</small>
                    </div>
                    <WidgetChart widget={widget} data={widgetData[widget.id]} error={widgetDataErrors[widget.id]} />
                  </article>
                );
              })}
              {dashboardWidgets.length === 0 && !widgetsLoading && (
                <EmptyState
                  title={widgetCatalog.length === 0 ? "No authorized widgets" : "No widgets added"}
                  body={widgetError || "Add authorized reports from the widget library to build your home page."}
                  icon={BarChart}
                />
              )}
              {dashboardWidgets.length === 0 && widgetsLoading && <EmptyState title="Loading widgets" body="Checking your widget access." icon={BarChart} />}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function widgetMetricValue(widget: WidgetCatalogItem, data?: WidgetDataResult) {
  if (data?.metric) return data.metric;
  if (widget.tableau?.url) return "Live view";
  return "Loading";
}

function widgetMetricTrend(widget: WidgetCatalogItem, data?: WidgetDataResult) {
  if (data?.trend) return data.trend;
  if (widget.tableau?.url) return "Embedded Tableau report";
  return "Waiting for report data";
}

function TableauEmbeddedWidget({ widget }: { widget: WidgetCatalogItem }) {
  const embedRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Loading embedded report");
  const url = widget.tableau?.url?.trim();

  useEffect(() => {
    const container = embedRef.current;
    if (!container || !url) return undefined;

    container.replaceChildren();
    const viz = document.createElement("tableau-viz");
    viz.setAttribute("src", url);
    viz.setAttribute("toolbar", widget.tableau?.toolbar ?? "hidden");
    viz.setAttribute("device", widget.tableau?.device ?? "desktop");
    if (widget.tableau?.hideTabs !== false) viz.setAttribute("hide-tabs", "");
    viz.style.width = "100%";
    viz.style.height = "100%";

    const firstInteractive = () => setStatus("Interactive");
    const summaryDataChanged = () => setStatus("Data refreshed");
    const filterChanged = () => setStatus("Filter updated");
    const markSelectionChanged = () => setStatus("Selection updated");
    const loadError = () => setStatus("Unable to load report");

    viz.addEventListener(TableauEventType.FirstInteractive, firstInteractive);
    viz.addEventListener(TableauEventType.SummaryDataChanged, summaryDataChanged);
    viz.addEventListener(TableauEventType.FilterChanged, filterChanged);
    viz.addEventListener(TableauEventType.MarkSelectionChanged, markSelectionChanged);
    viz.addEventListener(TableauEventType.VizLoadError, loadError);
    container.appendChild(viz);

    return () => {
      viz.removeEventListener(TableauEventType.FirstInteractive, firstInteractive);
      viz.removeEventListener(TableauEventType.SummaryDataChanged, summaryDataChanged);
      viz.removeEventListener(TableauEventType.FilterChanged, filterChanged);
      viz.removeEventListener(TableauEventType.MarkSelectionChanged, markSelectionChanged);
      viz.removeEventListener(TableauEventType.VizLoadError, loadError);
      container.replaceChildren();
    };
  }, [url, widget.tableau?.toolbar, widget.tableau?.hideTabs, widget.tableau?.device]);

  if (!url) {
    return (
      <div className="widgetChartPreview widgetDataState">
        Add this report URL in Settings to embed the live view.
      </div>
    );
  }

  return (
    <div className="tableauWidgetEmbed">
      <div ref={embedRef} className="tableauWidgetViz" />
      <span className="tableauWidgetStatus" aria-live="polite">{status}</span>
    </div>
  );
}

function WidgetChart({ widget, data, error }: { widget: WidgetCatalogItem; data?: WidgetDataResult; error?: string }) {
  if (widget.renderMode === "tableau" || widget.tableau) return <TableauEmbeddedWidget widget={widget} />;

  return <RechartsWidgetChart widget={widget} data={data} error={error} />;
}

function RechartsWidgetChart({ widget, data, error }: { widget: WidgetCatalogItem; data?: WidgetDataResult; error?: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 320, height: 112 });

  useEffect(() => {
    const element = chartContainerRef.current;
    if (!element) return;
    const updateSize = () => {
      setChartSize({
        width: Math.max(1, element.clientWidth),
        height: Math.max(1, element.clientHeight),
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (error) return <div className="widgetChartPreview widgetDataState">Access unavailable</div>;
  if (!data) return <div className="widgetChartPreview widgetDataState">Loading report data</div>;
  if (data.rows.length === 0) return <div className="widgetChartPreview widgetDataState">No report rows returned</div>;

  const xKey = widget.chart.xField ?? data.columns[0] ?? "label";
  const yKey = widget.chart.yField;
  const chartProps = { data: data.rows, width: chartSize.width, height: chartSize.height, margin: { top: 8, right: 10, bottom: 0, left: -18 } };

  return (
    <div ref={chartContainerRef} className="widgetChartPreview" role="img" aria-label={`${widget.title} chart`}>
      {widget.chart.type === "line" ? (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      ) : widget.chart.type === "area" ? (
        <AreaChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Area type="monotone" dataKey={yKey} stroke="var(--accent)" fill="var(--accent-soft)" strokeWidth={2} />
        </AreaChart>
      ) : (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey={yKey} fill="var(--accent)" radius={[5, 5, 2, 2]} />
        </BarChart>
      )}
    </div>
  );
}

type ExplorerSourceTab = "support" | "developers" | "wiki" | "pylon" | "custom" | "local";
type WikiSourceTab = string;
type WikiTab = "apps" | "skills" | WikiSourceTab;
type WikiPage = "apps" | "skills" | "wiki";

type ExplorerSourceConfig = {
  id: ExplorerSourceTab;
  label: string;
  icon: AppIcon;
  title: string;
  body: string;
  setup: string;
  sources: ExplorerResult["source"][];
};

type WikiSourceConfig = Omit<ExplorerSourceConfig, "id"> & { id: WikiSourceTab; externalSource: ExplorerSourceTab };

const wikiIconOptions = [
  { id: "book", label: "Book", icon: BookOpen },
  { id: "file", label: "File", icon: FileText },
  { id: "plug", label: "Plug", icon: Plug },
  { id: "folder", label: "Folder", icon: FolderOpen },
  { id: "github", label: "GitHub", icon: GithubIcon },
  { id: "bot", label: "Bot", icon: Bot },
  { id: "shield", label: "Shield", icon: ShieldCheck },
  { id: "star", label: "Star", icon: Star },
  { id: "tag", label: "Tag", icon: Tags },
  { id: "zap", label: "Zap", icon: Zap },
] as const satisfies readonly { id: string; label: string; icon: AppIcon }[];

function wikiIconForName(name?: unknown): AppIcon {
  const iconName = typeof name === "string" ? name : "";
  return wikiIconOptions.find((option) => option.id === iconName)?.icon ?? BookOpen;
}

function defaultWikiSourceIconName(type: WikiDocumentationSourceType) {
  if (type === "telnyx_developers" || type === "pylon") return "file";
  if (type === "github") return "github";
  if (type === "mcp") return "plug";
  if (type === "okf") return "folder";
  return "book";
}

function wikiSourceIconName(source: WikiDocumentationSource) {
  const iconName = source.metadata?.icon;
  return typeof iconName === "string" && wikiIconOptions.some((option) => option.id === iconName)
    ? iconName
    : defaultWikiSourceIconName(source.type);
}

function wikiSourceExternalTab(source: WikiDocumentationSource): ExplorerSourceTab {
  if (source.type === "telnyx_support") return "support";
  if (source.type === "telnyx_developers") return "developers";
  if (source.type === "guru") return "wiki";
  if (source.type === "pylon") return "pylon";
  return "custom";
}

function wikiSourceTabId(source: WikiDocumentationSource): WikiSourceTab {
  const tabId = source.metadata?.wikiTab;
  return typeof tabId === "string" && tabId.trim() ? tabId : source.id;
}

function wikiConfigFromDocumentationSource(source: WikiDocumentationSource): WikiSourceConfig {
  const externalSource = wikiSourceExternalTab(source);
  const baseSource = explorerSourceTabs.find((tab) => tab.id === externalSource) ?? explorerSourceTabs[0]!;
  return {
    ...baseSource,
    id: wikiSourceTabId(source),
    label: source.label,
    icon: wikiIconForName(wikiSourceIconName(source)),
    title: source.label,
    body: source.description,
    setup: `No matching ${source.label} results found.`,
    externalSource,
  };
}

const explorerSourceTabs: ExplorerSourceConfig[] = [
  {
    id: "support",
    label: "Help Center",
    icon: BookOpen,
    title: "Help Center",
    body: "Customer-facing support articles from support.telnyx.com.",
    setup: "No matching Help Center articles found. Try a more specific support question or product name.",
    sources: ["telnyx_support"],
  },
  {
    id: "developers",
    label: "Dev Docs",
    icon: FileText,
    title: "Dev Docs",
    body: "Mintlify-powered API guides, SDK references, and implementation docs.",
    setup: "No matching Dev Docs found. Try an API name, product area, SDK, or endpoint path.",
    sources: ["telnyx_developers"],
  },
  {
    id: "wiki",
    label: "Guru",
    icon: BookOpen,
    title: "Company Guru",
    body: "Internal Guru-backed knowledge available through Link skills and central connectors.",
    setup: "No matching Guru cards found. Try a process name, team, policy, launch, or internal tool.",
    sources: ["guru"],
  },
  {
    id: "pylon",
    label: "Pylon",
    icon: FileText,
    title: "Pylon tickets",
    body: "Support issues and account context available through the approved Pylon MCP connector.",
    setup: "No matching Pylon tickets found. Try a Pylon issue link, issue number, customer name, or ticket title.",
    sources: ["pylon"],
  },
  {
    id: "custom",
    label: "Sources",
    icon: Plug,
    title: "Configured sources",
    body: "GitHub, MCP, and OKF sources configured for the internal Wiki.",
    setup: "No configured Wiki sources match this search.",
    sources: ["github", "mcp", "okf"],
  },
  {
    id: "local",
    label: "Local",
    icon: FolderOpen,
    title: "Local bot context",
    body: "Files, skills, agents, and archive entries available on this device.",
    setup: "Local files, skills, agents, and archive entries appear when available on this device.",
    sources: ["google_drive", "link_file", "skill", "agent", "memory"],
  },
];

const wikiSourceTabs: WikiSourceConfig[] = explorerSourceTabs
  .filter((source) => source.id !== "local" && source.id !== "custom")
  .map((source) => ({ ...source, externalSource: source.id }));

function ExplorerView({
  selectedWorkspace,
  embedded = false,
  externalQuery,
  externalSource,
  externalSort = "az",
  hideSearch = false,
  docSourcesOnly = false,
  onShareResult,
}: {
  selectedWorkspace?: WorkspaceSummary;
  embedded?: boolean;
  externalQuery?: string;
  externalSource?: ExplorerSourceTab | "all";
  externalSort?: "az" | "za";
  hideSearch?: boolean;
  docSourcesOnly?: boolean;
  onShareResult?: (result: ExplorerResult) => Promise<void>;
}) {
  const [internalQuery, setInternalQuery] = useState("Messaging delivery escalation");
  const [results, setResults] = useState<ExplorerResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [sourceTab, setSourceTab] = useState<ExplorerSourceTab>("support");
  const [shareStatus, setShareStatus] = useState("");
  const query = externalQuery ?? internalQuery;
  const trimmedQuery = query.trim();
  const availableSourceTabs = useMemo(
    () => docSourcesOnly ? explorerSourceTabs.filter((tab) => tab.id !== "local") : explorerSourceTabs,
    [docSourcesOnly],
  );
  const activeSourceTab = availableSourceTabs.find((tab) => tab.id === sourceTab) ?? availableSourceTabs[0] ?? explorerSourceTabs[0]!;
  const activeExternalTab = externalSource && externalSource !== "all" ? availableSourceTabs.find((tab) => tab.id === externalSource) : undefined;
  const displayedSourceTab = activeExternalTab ?? activeSourceTab;
  const sourceFilteredResults = activeExternalTab
    ? results.filter((result) => activeExternalTab.sources.includes(result.source))
    : results.filter((result) => activeSourceTab.sources.includes(result.source));
  const visibleResults = [...sourceFilteredResults].sort((left, right) => (
    externalSort === "za" ? right.title.localeCompare(left.title) : left.title.localeCompare(right.title)
  ));

  async function search() {
    setBusy(true);
    setResults(await linkApi.searchExplorer({ query, workspaceId: selectedWorkspace?.id }));
    setBusy(false);
  }

  async function shareResult(result: ExplorerResult) {
    if (!onShareResult) return;
    setShareStatus(`Sharing ${result.title} with your agent.`);
    try {
      await onShareResult(result);
      setShareStatus(`Shared ${result.title} with your agent.`);
    } catch (err) {
      setShareStatus(err instanceof Error ? err.message : "Unable to share this source with your agent.");
    }
  }

  useEffect(() => {
    void search();
  }, [selectedWorkspace?.id, externalQuery, externalSource]);

  useEffect(() => {
    if (!availableSourceTabs.some((tab) => tab.id === sourceTab)) {
      setSourceTab(availableSourceTabs[0]?.id ?? "support");
    }
  }, [availableSourceTabs, sourceTab]);

  return (
    <section className={embedded ? "explorerView embeddedExplorerView" : "content explorerView"}>
      {!embedded && (
        <header className="pageHeader">
          <div>
            <h1>Library</h1>
          </div>
        </header>
      )}
      {!hideSearch && (
        <div className="explorerSearch">
          <Search size={16} />
          <input value={query} onChange={(event) => setInternalQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void search()} />
          <button className="button primary" onClick={search} disabled={busy}>{busy ? "Searching" : "Search"}</button>
        </div>
      )}
      {!externalSource && (
        <div className="explorerSourceTabs" role="tablist" aria-label="Documentation sources">
          {availableSourceTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={sourceTab === tab.id ? "selected" : ""} onClick={() => setSourceTab(tab.id)} role="tab" aria-selected={sourceTab === tab.id}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
      <section className="explorerSourceHeader" aria-label={displayedSourceTab.title}>
        {shareStatus && <span>{shareStatus}</span>}
      </section>
      <div className="explorerResults">
        {visibleResults.map((result) => (
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
            <div className="explorerResultActions">
              {onShareResult && (
                <button className="button primary" onClick={() => void shareResult(result)}>
                  <Send size={14} />
                  Share to agent
                </button>
              )}
              {result.url ? (
                <a className="button secondary" href={result.url} target="_blank" rel="noreferrer">Open</a>
              ) : (
                <button className="button secondary">Open</button>
              )}
            </div>
          </article>
        ))}
        {visibleResults.length === 0 && (docSourcesOnly || activeExternalTab) ? (
          <section className="docsSetupState">
            <div className="connectorIcon">{sourceInitials(displayedSourceTab.sources[0] ?? displayedSourceTab.id)}</div>
            <div>
              <h3>{trimmedQuery ? "No results found" : `Search ${displayedSourceTab.title}`}</h3>
              <p>{trimmedQuery ? displayedSourceTab.setup : displayedSourceTab.body}</p>
              <small>{trimmedQuery ? "Try another phrase or use a more specific product, API, team, or card title." : "Results appear here as you type in the Wiki search box."}</small>
            </div>
          </section>
        ) : (
          visibleResults.length === 0 && <EmptyState title="No results found" body="Try another source tab or search term." />
        )}
      </div>
    </section>
  );
}

const helpCenterQuestionExamples = [
  "How do I troubleshoot failed outbound SMS?",
  "What are the requirements for 10DLC registration?",
  "How do I configure inbound call screening?",
  "How do I attach an AI Assistant to a voice call?",
];

function HelpCenterConsole({
  selectedWorkspace,
  question,
  setQuestion,
  sort,
}: {
  selectedWorkspace?: WorkspaceSummary;
  question: string;
  setQuestion: (value: string) => void;
  sort: "az" | "za";
}) {
  const [answer, setAnswer] = useState<KnowledgeAgentAskResponse | null>(null);
  const [relatedSources, setRelatedSources] = useState<ExplorerResult[]>([]);
  const [answerBusy, setAnswerBusy] = useState(false);
  const [sourcesBusy, setSourcesBusy] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const trimmedQuestion = question.trim();
  const sourceUrls = useMemo(() => {
    const urls = [
      ...(answer?.citations ?? []).map((citation) => citation.url),
      ...relatedSources.map((source) => source.url),
    ].filter((url): url is string => Boolean(url));
    return [...new Set(urls)];
  }, [answer?.citations, relatedSources]);
  const sortedRelatedSources = useMemo(
    () => [...relatedSources].sort((left, right) => sort === "za" ? right.title.localeCompare(left.title) : left.title.localeCompare(right.title)),
    [relatedSources, sort],
  );

  useEffect(() => {
    let cancelled = false;
    const term = trimmedQuestion;
    if (!term) {
      setRelatedSources([]);
      setSourcesBusy(false);
      return;
    }
    setSourcesBusy(true);
    const timer = window.setTimeout(() => {
      void linkApi.searchExplorer({ query: term, workspaceId: selectedWorkspace?.id })
        .then((results) => {
          if (cancelled) return;
          setRelatedSources(results.filter((result) => result.source === "telnyx_support" || result.source === "telnyx_developers"));
        })
        .catch(() => {
          if (!cancelled) setRelatedSources([]);
        })
        .finally(() => {
          if (!cancelled) setSourcesBusy(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedWorkspace?.id, trimmedQuestion]);

  async function askQuestion(nextQuestion = question) {
    const prompt = nextQuestion.trim();
    if (!prompt) {
      setAnswerError("Ask a general documentation question first.");
      return;
    }
    setAnswerBusy(true);
    setAnswerError("");
    setCopyStatus("");
    try {
      setAnswer(await linkApi.askKnowledgeAgent({ question: prompt }));
    } catch (error) {
      setAnswer(null);
      setAnswerError(error instanceof Error ? error.message : "Knowledge Agent could not answer right now.");
    } finally {
      setAnswerBusy(false);
    }
  }

  async function copyBotSafeAnswer() {
    if (!answer) return;
    const sourceLines = sourceUrls.length
      ? sourceUrls.map((url) => `- ${url}`).join("\n")
      : "- No citations returned; verify against related docs before customer-visible use.";
    const text = [
      `Question: ${trimmedQuestion}`,
      "",
      answer.answer,
      "",
      "Sources:",
      sourceLines,
      "",
      "Safety: This answer is for general documentation questions only. Do not include secrets, private customer data, call logs, billing records, or account-specific identifiers.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied bot-safe answer.");
    } catch {
      setCopyStatus("Clipboard access is unavailable.");
    }
  }

  function openFirstSource() {
    const [url] = sourceUrls;
    if (url) window.open(url, "_blank", "noreferrer");
  }

  return (
    <div className="helpCenterConsole embeddedExplorerView">
      <section className="helpCenterAskPanel" aria-label="Ask Knowledge Agent">
        <label className="helpCenterQuestionComposer">
          <span>Question</span>
          <textarea
            value={question}
            rows={3}
            placeholder="Ask a general docs or support question..."
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (!shouldSubmitComposer(event)) return;
              event.preventDefault();
              void askQuestion();
            }}
          />
        </label>
        <p className="helpCenterGuardrail">
          <strong>Note:</strong> Ask general support and developer documentation questions only. Do not send secrets, private customer data, call logs, billing details, or account-specific identifiers.
        </p>
        <div className="helpCenterExamples" aria-label="Example questions">
          {helpCenterQuestionExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuestion(example);
                void askQuestion(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>
        <div className="helpCenterActions">
          <button className="button primary" onClick={() => void askQuestion()} disabled={answerBusy || !trimmedQuestion}>
            <Send size={14} />
            {answerBusy ? "Asking" : "Ask Knowledge Agent"}
          </button>
          <button className="button secondary" onClick={() => void askQuestion()} disabled={answerBusy || !trimmedQuestion}>
            <RefreshCw size={14} />
            Retry
          </button>
          <button className="button secondary" onClick={copyBotSafeAnswer} disabled={!answer}>
            <FileText size={14} />
            Copy bot-safe answer
          </button>
          <button className="button ghost" onClick={openFirstSource} disabled={sourceUrls.length === 0}>
            <ExternalLink size={14} />
            Open sources
          </button>
        </div>
        {copyStatus && (
          <div className="helpCenterStatusLine">
            <span>{copyStatus}</span>
          </div>
        )}
      </section>

      <section className="helpCenterAnswerPanel" aria-label="Knowledge Agent answer">
        <div className="helpCenterPanelHeading">
          <h3>Knowledge Agent answer</h3>
          {answer?.latencyMs !== undefined && <small>{Math.round(answer.latencyMs / 100) / 10}s</small>}
        </div>
        {answerBusy && <div className="helpCenterLoading">Waiting for the public Knowledge Agent. Slow responses can take up to 120 seconds.</div>}
        {answerError && (
          <div className="helpCenterError">
            <strong>Unable to answer</strong>
            <p>{answerError}</p>
          </div>
        )}
        {!answerBusy && !answerError && !answer && (
          <div className="helpCenterEmpty">
            Ask a concise natural-language question to get a bot-ready answer from public documentation.
          </div>
        )}
        {answer && (
          <div className="helpCenterAnswerBody">
            <p>{answer.answer}</p>
            <div className="helpCenterCitations">
              <strong>Citations</strong>
              {answer.citations.length > 0 ? (
                answer.citations.map((citation, index) => (
                  citation.url ? (
                    <a key={`${citation.url}-${index}`} href={citation.url} target="_blank" rel="noreferrer">
                      {citation.title || citation.url}
                    </a>
                  ) : (
                    <span key={`${citation.title}-${index}`}>{citation.title || citation.source || "Citation"}</span>
                  )
                ))
              ) : (
                <small>No citations returned. Use related sources before sharing externally.</small>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="helpCenterSourcesPanel" aria-label="Related sources">
        <div className="explorerSourceHeader">
          {sourcesBusy && <span>Searching docs...</span>}
        </div>
        <div className="explorerResults">
          {sortedRelatedSources.map((result) => (
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
              <div className="explorerResultActions">
                {result.url ? (
                  <a className="button secondary" href={result.url} target="_blank" rel="noreferrer">Open</a>
                ) : (
                  <button className="button secondary">Open</button>
                )}
              </div>
            </article>
          ))}
          {!sourcesBusy && sortedRelatedSources.length === 0 && (
            <section className="docsSetupState">
              <div className="connectorIcon">HC</div>
              <div>
                <h3>No related sources yet</h3>
                <p>Enter a Help Center question to search support and developer documentation alongside the Knowledge Agent answer.</p>
                <small>Related sources stay visible because Knowledge Agent citations may be empty.</small>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

function MarketplaceView({ embedded = false, hideHeader = false }: { embedded?: boolean; hideHeader?: boolean } = {}) {
  const [publishMenuOpen, setPublishMenuOpen] = useState(false);
  const publishMenuRef = useRef<HTMLDivElement | null>(null);
  const publishOptions = [
    { label: "App", detail: "Build and deploy an Edge-hosted app with your bot.", icon: Store },
    { label: "Skill", detail: "Build a reusable bot skill for Telnyx teams.", icon: Zap },
    { label: "Doc", detail: "Build a local bot page, runbook, or source bundle.", icon: BookOpen },
    { label: "Automation", detail: "Build a scheduled workflow owned by your bot.", icon: Bot },
  ];

  useEffect(() => {
    function closePublishMenu(event: MouseEvent) {
      if (!publishMenuRef.current?.contains(event.target as Node)) setPublishMenuOpen(false);
    }
    if (publishMenuOpen) document.addEventListener("mousedown", closePublishMenu);
    return () => document.removeEventListener("mousedown", closePublishMenu);
  }, [publishMenuOpen]);

  return (
    <section className={embedded ? "marketplaceView embeddedMarketplace" : "content marketplaceView"}>
      {!hideHeader && (
        <header className={embedded ? "pageHeader marketplaceEmbeddedHeader" : "pageHeader"}>
          <div>
            <h1>App Marketplace</h1>
          </div>
          <div className="headerActions marketplaceHeaderActions">
            <div className="publishMenuWrap" ref={publishMenuRef}>
              <button className="button primary" onClick={() => setPublishMenuOpen((open) => !open)} aria-expanded={publishMenuOpen} aria-haspopup="menu">
                <Plus size={15} />
                Build
              </button>
              {publishMenuOpen && (
                <div className="publishMenu" role="menu" aria-label="Build from local bot">
                  <div className="publishMenuHeader">
                    <strong>Build from local bot</strong>
                    <small>Select what this bot should package for Telnyx employees.</small>
                  </div>
                  {publishOptions.map(({ label, detail, icon: Icon }) => (
                    <button key={label} role="menuitem" onClick={() => setPublishMenuOpen(false)}>
                      <Icon size={16} />
                      <span>
                        <strong>{label}</strong>
                        <small>{detail}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {marketplaceApps.length > 0 && (
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
                  {app.status === "Installed" ? "Installed" : app.installMode === "VPN access" ? "Open via VPN" : "Duplicate"}
                </button>
                <button className="button ghost">Details</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ChatsView({
  sessions,
  workspaces,
  memoryBanks,
  selectedSession,
  selectSession,
  newSession,
  openArtifact,
  openMemory,
  activeAgent,
  archiveRefreshKey,
  startEdgeAppDeployChat,
  onEdgePreviewReady,
  edgePreviewSurface,
  closeEdgePreview,
  updateChatSession,
  refreshTables,
}: {
  sessions: ChatSession[];
  workspaces: WorkspaceSummary[];
  memoryBanks: MemoryBank[];
  selectedSession?: ChatSession;
  selectSession: (id: string) => void;
  newSession: () => void | Promise<void>;
  openArtifact: (artifact: ChatArtifact) => void;
  openMemory: () => void;
  activeAgent: ActiveAgentSelection | null;
  archiveRefreshKey: number;
  startEdgeAppDeployChat: (session: ChatSession) => void | Promise<void>;
  onEdgePreviewReady: (preview: EdgePreviewSurface) => void;
  edgePreviewSurface: EdgePreviewSurface | null;
  closeEdgePreview: () => void;
  updateChatSession: (input: { sessionId: string; title?: string; pinned?: boolean; archived?: boolean }) => Promise<ChatSession>;
  refreshTables: () => Promise<void>;
}) {
  const [reviewTab, setReviewTab] = useState<"chat" | "actions" | "sources" | "archive">("chat");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [agentFilter, setAgentFilter] = useState("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [detailSessionId, setDetailSessionId] = useState("");
  const [edgePreviewFrameLoaded, setEdgePreviewFrameLoaded] = useState(false);
  const [hiddenSessionIds, setHiddenSessionIds] = useState<string[]>(() => readStoredIdList("telnyx-link-hidden-chat-session-ids"));
  const [sessionBulkEdit, setSessionBulkEdit] = useState(false);
  const [selectedSessionRowIds, setSelectedSessionRowIds] = useState<string[]>([]);
  const workspaceById = useMemo(() => new Map(workspaces.map((workspace) => [workspace.id, workspace])), [workspaces]);
  const runtimeFailurePattern = /No agent runtime returned a response|AIDA is selected, but no live agent runtime returned a response|Runtime detail:/i;
  const getSessionMeta = (session: ChatSession, workspace?: WorkspaceSummary) => {
    const messages = session.messages.filter((message) => message.role !== "system");
    const artifacts = messages.flatMap((message) => message.artifacts ?? []);
    const sources = messages.flatMap((message) => message.sources ?? []);
    const actions = messages
      .flatMap((message) => message.content.split("\n"))
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter((line) => !runtimeFailurePattern.test(line))
      .filter((line) => /\b(action|todo|follow up|review|open|create|assign|validate|confirm|update|draft)\b/i.test(line))
      .slice(0, 8);
    const selectedAgentName = sessionSelectedAgentName(session);
    const attachedAgentName = selectedAgentName || activeAgent?.displayName;
    const lastVisibleMessage = [...messages].reverse().find((message) => message.createdAt);
    const agentActions = [
      attachedAgentName
        ? {
            id: "continue-agent",
            title: `Continue with ${attachedAgentName}`,
            body: "Open this session in the right sidebar to keep chatting with the attached agent.",
          }
        : {
            id: "choose-agent",
            title: "Choose an agent in the sidebar",
            body: "Select Link or a hosted Hermes/OpenClaw agent before sending the next message.",
          },
      workspace
        ? {
            id: "workspace-context",
            title: `Use ${workspace.name} context`,
            body: "Keep follow-up work scoped to this workspace's docs, archive, and active tasks.",
          }
        : {
            id: "workspace-context",
            title: "Attach workspace context",
            body: "Move this standalone chat into a workspace when follow-up work needs shared context.",
          },
      {
        id: "deploy-edge-app",
        title: "Deploy to Edge Compute",
        body: "Ask the selected OpenClaw or Hermes agent to package this work as an Edge-hosted app and prepare the deploy payload.",
      },
    ];
    return {
      actions,
      agentActions,
      artifacts,
      messages,
      sources,
      agentName: formatChatAgentName(attachedAgentName ?? "Link"),
      lastMessageAt: lastVisibleMessage?.createdAt ?? session.updatedAt,
      messageCount: messages.length,
    };
  };
  const chatAgentFilterOptions = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((session) => {
      if (hiddenSessionIds.includes(session.id)) return;
      if (session.archivedAt) return;
      const workspace = workspaceById.get(session.workspaceId);
      names.add(getSessionMeta(session, workspace).agentName);
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [hiddenSessionIds, sessions, workspaceById]);
  const chatSessionTypeFilterOptions = useMemo(() => {
    const types = new Map<string, string>();
    sessions.forEach((session) => {
      if (hiddenSessionIds.includes(session.id)) return;
      if (session.archivedAt) return;
      const type = classifyChatSessionType(session);
      types.set(type.id, type.label);
    });
    return [...types.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => chatSessionTypeSortRank(a.id) - chatSessionTypeSortRank(b.id) || a.label.localeCompare(b.label));
  }, [hiddenSessionIds, sessions]);
  const chatFiltersActive = agentFilter !== "all" || sessionTypeFilter !== "all";
  const filteredSessions = useMemo(() => {
    const term = query.trim().toLowerCase();
    const hidden = new Set(hiddenSessionIds);
    return sortChatSessions(sessions).filter((session) => {
      if (hidden.has(session.id)) return false;
      if (session.archivedAt) return false;
      const workspace = workspaceById.get(session.workspaceId);
      const sessionMeta = getSessionMeta(session, workspace);
      const sessionType = classifyChatSessionType(session);
      if (agentFilter !== "all" && sessionMeta.agentName !== agentFilter) return false;
      if (sessionTypeFilter !== "all" && sessionType.id !== sessionTypeFilter) return false;
      if (!term) return true;
      const searchable = [
        session.title,
        sessionMeta.agentName,
        sessionType.label,
        workspace?.name,
        ...session.messages.flatMap((message) => [
          message.content,
          ...(message.sources ?? []).map((source) => `${source.title} ${source.source}`),
          ...(message.artifacts ?? []).map((artifact) => `${artifact.title} ${artifact.filename}`),
        ]),
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(term);
    });
  }, [agentFilter, hiddenSessionIds, query, sessions, sessionTypeFilter, workspaceById]);
  const detailSession = detailSessionId ? filteredSessions.find((session) => session.id === detailSessionId) ?? sessions.find((session) => session.id === detailSessionId) : null;
  const detailWorkspace = detailSession ? workspaceById.get(detailSession.workspaceId) : undefined;
	  const [edgeDeployBusy, setEdgeDeployBusy] = useState(false);
	  const [edgeDeployResult, setEdgeDeployResult] = useState<LinkLocalEdgeDeployResult | null>(null);
	  const [edgePreviewResult, setEdgePreviewResult] = useState<LinkLocalEdgeDeployResult | null>(null);
	  const [edgeDeploySlug, setEdgeDeploySlug] = useState(edgePreviewSurface?.slug ?? "");
		  const [edgeDeployDetailsOpen, setEdgeDeployDetailsOpen] = useState(false);
		  const [edgeSlugAvailability, setEdgeSlugAvailability] = useState<EdgeSlugAvailability | null>(null);
		  const [edgeDeployReplaceExisting, setEdgeDeployReplaceExisting] = useState(false);
		  const [edgeDeployStage, setEdgeDeployStage] = useState<EdgeDeployStage>("idle");
		  const [edgeDeployError, setEdgeDeployError] = useState("");
		  const [edgeDeployStartedAt, setEdgeDeployStartedAt] = useState(0);
	  const [edgeDeployTick, setEdgeDeployTick] = useState(0);
	  const edgeDeploySlugInputRef = useRef<HTMLInputElement | null>(null);
	  const archiveQueryForSession = (session: ChatSession) => {
	    const lastUserMessage = [...session.messages].reverse().find((message) => message.role === "user");
	    return (lastUserMessage?.content || session.title || "What did we decide about Link improvement requests?").slice(0, 220);
	  };

	  async function previewEdgeAppFromSession(session: ChatSession) {
	    const slug = inferEdgePreviewSlugFromSession(session);
	    if (!slug) return;
	    const result = await linkApi.previewLocalEdgeApp({ slug });
	    if (result.canceled || !result.url) return;
	    setEdgePreviewResult(result);
	    setEdgeDeploySlug(slug);
		    setEdgeDeployResult(null);
		    setEdgeDeployStage("preview_ready");
		    setEdgeDeployError("");
		    onEdgePreviewReady({
	      url: result.url,
	      slug,
	      directory: result.directory,
	    });
  }

	  useEffect(() => {
	    setEdgePreviewFrameLoaded(false);
	  }, [edgePreviewSurface?.url]);

	  useEffect(() => {
	    if (!edgePreviewSurface) return;
	    setEdgeDeploySlug(edgePreviewSurface.slug);
	    setEdgeDeployResult(null);
		    setEdgeDeployDetailsOpen(false);
		    setEdgeDeployStage("preview_ready");
		    setEdgeDeployError("");
		    setEdgeSlugAvailability(null);
	    setEdgeDeployReplaceExisting(false);
	  }, [edgePreviewSurface?.url, edgePreviewSurface?.slug]);

	  useEffect(() => {
	    if (!edgePreviewSurface?.directory || !edgeDeployDetailsOpen) {
	      setEdgeSlugAvailability(null);
	      return;
	    }
	    const slug = normalizeEdgeDeploySlug(edgeDeploySlug);
	    if (!slug) {
	      setEdgeSlugAvailability({ slug: "", status: "empty", available: false, canReplace: false, message: "Enter a unique app URL." });
	      setEdgeDeployReplaceExisting(false);
	      return;
	    }
	    let cancelled = false;
	    setEdgeSlugAvailability({ slug, status: "checking", available: false, canReplace: false, message: "Checking URL availability..." });
	    const timer = window.setTimeout(() => {
	      linkApi.checkEdgeSlugAvailability({ slug })
	        .then((result) => {
	          if (cancelled) return;
	          setEdgeSlugAvailability(result);
	          if (!result.canReplace) setEdgeDeployReplaceExisting(false);
	        })
	        .catch((error) => {
	          if (cancelled) return;
	          setEdgeSlugAvailability({
	            slug,
	            status: "error",
	            available: false,
	            canReplace: false,
	            message: error instanceof Error ? error.message : "Unable to check URL availability.",
	          });
	          setEdgeDeployReplaceExisting(false);
	        });
	    }, 350);
	    return () => {
	      cancelled = true;
	      window.clearTimeout(timer);
	    };
	  }, [edgeDeployDetailsOpen, edgeDeploySlug, edgePreviewSurface?.directory]);

	  useEffect(() => {
	    if (!edgeDeployBusy) return undefined;
	    setEdgeDeployTick((tick) => tick + 1);
	    const timer = window.setInterval(() => {
	      setEdgeDeployTick((tick) => tick + 1);
	    }, 1000);
	    return () => window.clearInterval(timer);
	  }, [edgeDeployBusy]);

	  async function deployPreviewEdgeApp() {
	    if (edgeDeployBusy || !edgePreviewSurface) return;
	    const slug = normalizeEdgeDeploySlug(edgeDeploySlug);
		    if (!slug) {
		      setEdgeDeployStage("needs_url");
		      setEdgeDeployError("Choose a deployment URL before deploying.");
		      edgeDeploySlugInputRef.current?.focus();
		      return;
		    }
		    if (edgeSlugAvailability?.slug === slug && edgeSlugAvailability.status === "taken") {
		      setEdgeDeployStage("failed");
		      setEdgeDeployError(edgeSlugAvailability.message);
		      return;
		    }
		    if (edgeSlugAvailability?.slug === slug && edgeSlugAvailability.canReplace && !edgeDeployReplaceExisting) {
		      setEdgeDeployStage("failed");
		      setEdgeDeployError("This URL is already yours. Enable replace existing URL to update it.");
		      return;
		    }
		    setEdgeDeploySlug(slug);
		    setEdgeDeployError("");
		    setEdgeDeployBusy(true);
	    setEdgeDeployStartedAt(Date.now());
	    setEdgeDeployTick(0);
	    setEdgeDeployStage("deploying");
	    try {
	      const result = await linkApi.deployLocalEdgeApp({
	        directory: edgePreviewResult?.directory ?? edgePreviewSurface.directory,
	        slug,
	        replaceExisting: edgeDeployReplaceExisting,
	      });
		      if (result.canceled) {
		        setEdgeDeployStage("preview_ready");
		        setEdgeDeployError("");
		        return;
		      }
		      setEdgeDeployResult(result);
		      setEdgeDeployStage("deployed");
		      setEdgeDeployError("");
		    } catch (error) {
		      setEdgeDeployStage("failed");
		      setEdgeDeployError(error instanceof Error ? error.message : "Local Edge app deploy failed.");
		    } finally {
	      setEdgeDeployBusy(false);
	    }
	  }

	  function openPreviewEdgeDeployUrl() {
	    if (!edgeDeployResult?.url) return;
	    window.open(edgeDeployResult.url, "_blank", "noopener,noreferrer");
	  }

	  const edgeDeployDisabled = edgeDeployBusy ||
	    edgeSlugAvailability?.status === "taken" ||
	    edgeSlugAvailability?.status === "checking" ||
	    (edgeSlugAvailability?.canReplace && !edgeDeployReplaceExisting);

	  if (edgePreviewSurface) {
    return (
      <section className="content chatView canonicalChat edgePreviewView">
	        <header className="pageHeader edgePreviewHeader compactEdgePreviewHeader">
	          <div className="edgePreviewTitleBlock">
	            <h1>{edgePreviewSurface.slug}</h1>
	            <p>{edgePreviewSurface.directory ?? edgePreviewSurface.url}</p>
	          </div>
	          <div className="headerActions">
		            {edgePreviewSurface.directory && !edgeDeployDetailsOpen && (
		              <button className="button primary" type="button" onClick={() => setEdgeDeployDetailsOpen(true)} disabled={edgeDeployBusy}>
		                <Upload size={15} />
		                Deploy
		              </button>
		            )}
		            {edgePreviewSurface.directory && edgeDeployDetailsOpen && (
		              <button className="button primary" type="button" onClick={deployPreviewEdgeApp} disabled={edgeDeployDisabled}>
		                {edgeDeployBusy && edgeDeployStage === "deploying" ? <span className="assistantDeployButtonSpinner" aria-hidden="true" /> : <Upload size={15} />}
		                {edgeDeployBusy && edgeDeployStage === "deploying" ? edgeDeployButtonBusyLabel(edgeDeployStage) : "Deploy"}
		              </button>
		            )}
		            <a className="button secondary" href={edgePreviewSurface.url} target="_blank" rel="noreferrer">
		              <ExternalLink size={15} />
		              Browser
		            </a>
		            {edgeDeployResult?.url && (
		              <button type="button" className="button secondary" onClick={openPreviewEdgeDeployUrl}>
		                <ExternalLink size={15} />
		                Live
		              </button>
		            )}
	            <button className="button ghost" type="button" onClick={closeEdgePreview}>
	              <MessageSquare size={15} />
	              Chat
	            </button>
	          </div>
	        </header>
	        {edgePreviewSurface.directory && edgeDeployDetailsOpen && (
	          <div className="edgePreviewDeployPanel" aria-live="polite">
	            <div className={`assistantDeployStatus ${edgeDeployStage}`}>
	              {edgeDeployBusy && <span className="assistantDeploySpinner" aria-hidden="true" />}
	              <span>{edgeDeployError || edgeDeployStageLabel(edgeDeployStage, normalizeEdgeDeploySlug(edgeDeploySlug))}</span>
	            </div>
	            {edgeDeployBusy && (
	              <div className="assistantDeployProgress" aria-live="polite">
	                <div className="assistantDeployProgressTrack" aria-hidden="true">
	                  <span style={{ width: `${edgeDeployProgressPercent(edgeDeployStartedAt, edgeDeployTick)}%` }} />
	                </div>
	                <div className="assistantDeployProgressMeta">
	                  <span>{edgeDeployProgressStepLabel(edgeDeployStartedAt, edgeDeployTick)}</span>
	                  <span>{edgeDeployElapsedLabel(edgeDeployStartedAt, edgeDeployTick)}</span>
	                </div>
	              </div>
	            )}
	            <label className="assistantDeployField">
	              <span>Deployment URL</span>
	              <div className="assistantDeployUrlInput">
	                <span>https://</span>
	                <input
	                  ref={edgeDeploySlugInputRef}
	                  value={edgeDeploySlug}
	                  onChange={(event) => {
	                    const nextSlug = normalizeEdgeDeploySlug(event.target.value);
	                    setEdgeDeploySlug(nextSlug);
	                    setEdgeDeployResult(null);
	                    if (edgeDeployStage === "needs_url") setEdgeDeployStage("preview_ready");
	                  }}
	                  placeholder="my-work-app"
	                  disabled={edgeDeployBusy}
	                />
	                <span>.apidev.telnyx.com</span>
	              </div>
	            </label>
	            {edgeSlugAvailability && (
	              <div className={`assistantDeployAvailability ${edgeSlugAvailability.status}`}>
	                {edgeSlugAvailability.message}
	              </div>
	            )}
	            {edgeSlugAvailability?.canReplace && (
	              <label className="assistantDeployReplace">
	                <input
	                  type="checkbox"
	                  checked={edgeDeployReplaceExisting}
	                  onChange={(event) => setEdgeDeployReplaceExisting(event.target.checked)}
	                  disabled={edgeDeployBusy}
	                />
	                <span>Replace my existing app using this URL slug</span>
	              </label>
	            )}
	          </div>
	        )}
	        <div className="edgePreviewBrowser">
          <div className="edgePreviewBrowserBar">
            <span>Local preview</span>
            <strong>{edgePreviewSurface.url}</strong>
          </div>
          <div className="edgePreviewFrameWrap">
            {!edgePreviewFrameLoaded && <div className="edgePreviewLoading">Loading local preview...</div>}
            <iframe
              title={`Preview ${edgePreviewSurface.slug}`}
              src={edgePreviewSurface.url}
              sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups allow-same-origin"
              onLoad={() => setEdgePreviewFrameLoaded(true)}
            />
          </div>
        </div>
      </section>
    );
  }

  function renderReviewTabs(session: ChatSession, workspace?: WorkspaceSummary) {
    const sessionMeta = getSessionMeta(session, workspace);
    return (
      <div className="chatResultDetails">
        <div className="chatReviewTabs" role="tablist" aria-label={`${session.title} review`}>
          {([
            ["chat", "Chat", MessageSquare],
            ["actions", "Actions", SquareCheck],
            ["sources", "Sources", ExternalLink],
            ["archive", "Archive", ArchiveIcon],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} className={reviewTab === id ? "selected" : ""} onClick={() => setReviewTab(id)} role="tab" aria-selected={reviewTab === id}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <div className="chatReviewPane phoneContentTable">
          <header className="phoneNumberTableHeader chatReviewPaneHeader">
            {reviewTab === "chat" && (
              <div className="phoneButtonRow">
                {session.messages.some(messageHasEdgePreviewCandidate) && (
                  <button className="button secondary" onClick={() => void previewEdgeAppFromSession(session)}>
                    <MonitorPlay size={14} />
                    Preview app
                  </button>
                )}
                <button className="button secondary" onClick={() => selectSession(session.id)}>
                  <MessageSquare size={14} />
                  Continue in sidebar
                </button>
              </div>
            )}
          </header>
          {reviewTab === "chat" && (
            <div className="chatReviewPaneBody">
              <div className="chatPreviewMessages" aria-label={`${session.title} read-only transcript`}>
                {sessionMeta.messages.slice(-6).map((message) => (
                  <div key={message.id} className={`message ${message.role === "user" ? "you" : "link"}`}>
                    <strong>{message.role === "user" ? "You" : <SenderName name={assistantDisplayName(message.displayName)} />}</strong>
                    <p>{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="messageSources" aria-label="Sources">
                        {message.sources.map((source) => (
                          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                    <MessageArtifacts artifacts={message.artifacts} openArtifact={openArtifact} />
                  </div>
                ))}
                {sessionMeta.messages.length === 0 && <EmptyState title="No messages" body="This session does not have visible messages yet." />}
              </div>
            </div>
          )}
          {reviewTab === "actions" && (
            <div className="chatReviewList chatReviewPaneBody">
              {sessionMeta.agentActions.map((item) => (
                <button
                  key={item.id}
                  className="chatReviewItem"
                  onClick={() => item.id === "deploy-edge-app" ? void startEdgeAppDeployChat(session) : selectSession(session.id)}
                >
                  <SquareCheck size={16} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.body}</small>
                  </span>
                </button>
              ))}
              {sessionMeta.actions.map((item, index) => (
                <div key={`${item}-${index}`} className="chatReviewItem">
                  <List size={16} />
                  <span>
                    <strong>{item}</strong>
                    <small>Detected from the read-only transcript.</small>
                  </span>
                </div>
              ))}
            </div>
          )}
          {reviewTab === "sources" && (
            <div className="chatReviewList chatReviewPaneBody">
              {sessionMeta.sources.map((source) => (
                <a key={source.id} className="chatReviewItem" href={source.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} />
                  <span>
                    <strong>{source.title}</strong>
                    <small>{source.source} · {source.freshness}</small>
                  </span>
                </a>
              ))}
              {sessionMeta.sources.length === 0 && <EmptyState title="No sources yet" body="Cited docs, support articles, and internal references will appear here." />}
            </div>
          )}
          {reviewTab === "archive" && (
            <div className="chatReviewPaneBody">
              <ArchiveTabs
                banks={memoryBanks}
                openMemory={openMemory}
                compact
                initialTab="memories"
                initialQuery={archiveQueryForSession(session)}
                autoRecallKey={archiveRefreshKey}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  async function startNewSession() {
    newSession();
  }

  async function hideSessionRow(session: ChatSession, action: TableRowLifecycleAction) {
    if (action === "archive") {
      await updateChatSession({ sessionId: session.id, archived: true });
      if (detailSessionId === session.id) setDetailSessionId("");
      return;
    }
    setHiddenSessionIds((current) => {
      const next = current.includes(session.id) ? current : [...current, session.id];
      window.localStorage.setItem("telnyx-link-hidden-chat-session-ids", JSON.stringify(next));
      return next;
    });
    if (detailSessionId === session.id) setDetailSessionId("");
    if (action === "delete" && selectedSession?.id === session.id) newSession();
  }

  function setSessionRowSelected(sessionId: string, selected: boolean) {
    setSelectedSessionRowIds((current) => selected ? current.includes(sessionId) ? current : [...current, sessionId] : current.filter((id) => id !== sessionId));
  }

  function toggleSessionBulkEdit() {
    setSessionBulkEdit((active) => !active);
    setSelectedSessionRowIds([]);
  }

  async function hideSelectedSessionRows(action: TableRowLifecycleAction) {
    const selectedIds = new Set(selectedSessionRowIds);
    await Promise.all(filteredSessions.filter((session) => selectedIds.has(session.id)).map((session) => hideSessionRow(session, action)));
    setSelectedSessionRowIds([]);
    setSessionBulkEdit(false);
  }

  function openSessionDetails(sessionId: string) {
    selectSession(sessionId);
    setDetailSessionId(sessionId);
    setReviewTab("chat");
  }

  function renderSessionRow(session: ChatSession) {
    const workspace = workspaceById.get(session.workspaceId);
    const sessionMeta = getSessionMeta(session, workspace);
    return (
      <div
        className="chatResultRow"
        role="row"
        key={session.id}
        tabIndex={0}
        onClick={() => openSessionDetails(session.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openSessionDetails(session.id);
          }
        }}
      >
        <BulkSelectCell
          active={sessionBulkEdit}
          checked={selectedSessionRowIds.includes(session.id)}
          label={`Select ${session.title}`}
          onChange={(checked) => setSessionRowSelected(session.id, checked)}
        />
        <div className="chatSessionNameCell" role="cell">
          <strong title={session.title}>
            {session.pinnedAt && <Pin size={13} aria-label="Pinned chat" />}
            {session.title}
          </strong>
        </div>
        <span role="cell">{sessionMeta.agentName}</span>
        <span role="cell">{compactRelativeTime(sessionMeta.lastMessageAt)}</span>
        <button
          className="chatSessionOpenButton"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openSessionDetails(session.id);
          }}
          aria-label={`Open ${session.title} details`}
          title="Open details"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  if (detailSession) {
    const sessionMeta = getSessionMeta(detailSession, detailWorkspace);
    return (
      <section className="content chatView canonicalChat chatDetailView">
        <header className="pageHeader">
          <div className="chatDetailTitleGroup">
            <button className="iconButton chatDetailBackButton" type="button" onClick={() => setDetailSessionId("")} aria-label="Back to sessions" title="Back to sessions">
              <ArrowLeft size={18} />
            </button>
            <h1>{detailSession.title}</h1>
            <p>{sessionMeta.messageCount} messages · {sessionMeta.agentName}</p>
          </div>
          <div className="headerActions">
            <TableRowLifecycleActions
              label={detailSession.title}
              onArchive={() => void hideSessionRow(detailSession, "archive")}
              onDelete={() => void hideSessionRow(detailSession, "delete")}
            />
          </div>
        </header>
        <div className="chatDetailSurface">
          {renderReviewTabs(detailSession, detailWorkspace)}
        </div>
      </section>
    );
  }

  return (
    <section className="content chatView canonicalChat chatListView">
      <header className="pageHeader">
        <div>
          <h1>Chat</h1>
        </div>
        <div className="headerActions">
          <button className="button primary" onClick={() => void startNewSession()}>
            <Plus size={15} />
            New Session
          </button>
        </div>
      </header>
      <div className="chatSearchRow">
        <button
          className={`iconButton agentFilterButton ${filtersOpen || chatFiltersActive ? "selected" : ""}`}
          aria-label={filtersOpen ? "Hide chat filters" : "Show chat filters"}
          title={filtersOpen ? "Hide chat filters" : "Show chat filters"}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={16} />
        </button>
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats, docs, actions, sources, outputs, or archive" />
        </div>
        <button
          className={`iconButton agentFilterButton ${sessionBulkEdit ? "selected" : ""}`}
          aria-label={sessionBulkEdit ? "Exit bulk edit" : "Edit chats"}
          title={sessionBulkEdit ? "Exit bulk edit" : "Edit chats"}
          onClick={toggleSessionBulkEdit}
        >
          <Pencil size={16} />
        </button>
        <TableRefreshButton onClick={refreshTables} label="Refresh chats" />
      </div>
      {sessionBulkEdit && (
        <BulkEditControls
          active={sessionBulkEdit}
          selectedCount={selectedSessionRowIds.length}
          onToggle={toggleSessionBulkEdit}
          onArchive={() => void hideSelectedSessionRows("archive")}
          onDelete={() => void hideSelectedSessionRows("delete")}
        />
      )}
      {filtersOpen && (
        <div className="chatFilterBar" role="group" aria-label="Chat filters">
          <span className="chatFilterCount">{filteredSessions.length} chats</span>
          <label className="chatFilterField">
            <span>Agent</span>
            <select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)} aria-label="Filter chats by agent">
              <option value="all">All agents</option>
              {chatAgentFilterOptions.map((agentName) => (
                <option key={agentName} value={agentName}>{agentName}</option>
              ))}
            </select>
          </label>
          <label className="chatFilterField">
            <span>Type</span>
            <select value={sessionTypeFilter} onChange={(event) => setSessionTypeFilter(event.target.value)} aria-label="Filter chats by session type">
              <option value="all">All types</option>
              {chatSessionTypeFilterOptions.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className={`chatSessionRows ${sessionBulkEdit ? "bulkEditing" : ""}`} role="table" aria-label="Chat sessions">
        <div className="chatResultRow chatResultRowHead" role="row">
          <span className="bulkSelectCell" role="columnheader" aria-label="Select sessions" />
          <span role="columnheader">Session Name</span>
          <span role="columnheader">Agent</span>
          <span role="columnheader">Last</span>
          <span role="columnheader" aria-label="Open session" />
        </div>
        <div className="chatResultRows" role="rowgroup">
          {filteredSessions.map(renderSessionRow)}
        </div>
        {filteredSessions.length === 0 && <EmptyState title="No chats found" body="Try another search term or filter." />}
      </div>
    </section>
  );
}

type DriveFileRow = {
  id: string;
  kind: "artifact";
  artifact: ChatArtifact;
  sessionId: string;
  sessionTitle: string;
  agentName: string;
  createdAt: string;
};

type DriveArchivedSessionRow = {
  id: string;
  kind: "archived-session";
  sessionId: string;
  sessionTitle: string;
  agentName: string;
  messageCount: number;
  archivedAt: string;
};

type DriveFolderRow = {
  id: string;
  kind: "folder";
  path: string;
  owner: string;
  contents: string;
  updated: string;
};

type DriveScribesSessionRow = {
  id: string;
  kind: "scribes-session";
  session: ScribesSession;
  path: string;
};

type DriveScribesArtifactRow = {
  id: string;
  kind: "scribes-artifact";
  session: ScribesSession;
  artifact: ScribesSession["artifacts"][number];
};

type DriveRow = DriveFileRow | DriveArchivedSessionRow | DriveFolderRow | DriveScribesSessionRow | DriveScribesArtifactRow;

function driveSafeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "untitled";
}

function DriveView({
  sessions,
  publishedApps,
  activeAgent,
  openArtifact,
  openSession,
  openScribes,
  refreshTables,
}: {
  sessions: ChatSession[];
  publishedApps: LinkPublishedApp[];
  activeAgent: ActiveAgentSelection | null;
  openArtifact: (artifact: ChatArtifact) => void;
  openSession: (sessionId: string) => void;
  openScribes: () => void;
  refreshTables: () => Promise<void>;
}) {
  const [hiddenDriveRowIds, setHiddenDriveRowIds] = useState<string[]>(() => readStoredIdList("telnyx-link-hidden-drive-row-ids"));
  const [driveBulkEdit, setDriveBulkEdit] = useState(false);
  const [selectedDriveRowIds, setSelectedDriveRowIds] = useState<string[]>([]);
  const [driveQuery, setDriveQuery] = useState("");
  const [driveFiltersOpen, setDriveFiltersOpen] = useState(false);
  const [scribesSessions, setScribesSessions] = useState<ScribesSession[]>([]);

  async function refreshScribesDriveRows() {
    const nextSessions = await linkApi.listScribesSessions();
    setScribesSessions(nextSessions);
  }

  async function refreshDriveRows() {
    await Promise.all([refreshTables(), refreshScribesDriveRows()]);
  }

  useEffect(() => {
    void refreshScribesDriveRows().catch(() => undefined);
  }, []);

  const folderRows = useMemo<DriveFolderRow[]>(() => {
    const appCount = publishedApps.filter(isEdgeHostedPublishedApp).length;
    const appLabel = `${appCount} ${appCount === 1 ? "app" : "apps"}`;
    const archivedCount = sessions.filter((session) => session.archivedAt).length;
    const archivedLabel = `${archivedCount} archived ${archivedCount === 1 ? "session" : "sessions"}`;
    const scribesLabel = `${scribesSessions.length} ${scribesSessions.length === 1 ? "transcript" : "transcripts"}`;
    return [
      { id: "folder:workspace", kind: "folder", path: "~/Link/", owner: "You", contents: "Per-user Link workspace", updated: "Internal" },
      { id: "folder:apps", kind: "folder", path: "~/Link/apps/", owner: "Link App Publisher", contents: `${appLabel}, manifests, previews, and publish records`, updated: "Managed" },
      { id: "folder:apps-personal", kind: "folder", path: "~/Link/apps/personal/", owner: "You", contents: "Imported personal app drafts", updated: "Local" },
      { id: "folder:apps-team", kind: "folder", path: "~/Link/apps/team/", owner: "Team", contents: "Team app drafts and publisher handoffs", updated: "Shared" },
      { id: "folder:apps-publish-intents", kind: "folder", path: "~/Link/apps/publish-intents/", owner: "Link App Publisher", contents: "Review, version, rollback, and deployment records", updated: "Managed" },
      { id: "folder:agents", kind: "folder", path: "~/Link/agents/", owner: "Agent Control Plane", contents: "Active agents, saved agents, and setup context", updated: "Synced" },
      { id: "folder:chats", kind: "folder", path: "~/Link/chats/", owner: "Link", contents: `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"} and generated outputs`, updated: "Local" },
      { id: "folder:artifacts", kind: "folder", path: "~/Link/drive/artifacts/", owner: "Agents", contents: "Files generated from assistant sessions", updated: "Local" },
      { id: "folder:scribes", kind: "folder", path: "~/Link/scribes/", owner: "Scribes", contents: `${scribesLabel}, models, and generated notes`, updated: "Local" },
      { id: "folder:scribes-transcripts", kind: "folder", path: "~/Link/scribes/transcripts/", owner: "Scribes", contents: "Dictation and meeting transcripts", updated: "Local" },
      { id: "folder:scribes-summaries", kind: "folder", path: "~/Link/scribes/summaries/", owner: "Scribes", contents: "Generated summaries and meeting notes", updated: "Local" },
      { id: "folder:scribes-audio", kind: "folder", path: "~/Link/scribes/audio/", owner: "Scribes", contents: "Retained audio references when enabled", updated: "Local" },
      { id: "folder:archive", kind: "folder", path: "~/Link/archive/", owner: "Link", contents: "Hidden rows, dismissed items, and archived references", updated: "Local" },
      { id: "folder:archive-chats", kind: "folder", path: "~/Link/archive/chats/", owner: "Link", contents: archivedLabel, updated: "Local" },
    ];
  }, [publishedApps, scribesSessions.length, sessions]);
  const archivedSessionRows = useMemo<DriveArchivedSessionRow[]>(() => sessions
    .filter((session) => session.archivedAt)
    .map((session) => ({
      id: `archived-session:${session.id}`,
      kind: "archived-session" as const,
      sessionId: session.id,
      sessionTitle: session.title,
      agentName: formatChatAgentName(sessionSelectedAgentName(session) || activeAgent?.displayName || "Link"),
      messageCount: session.messages.length,
      archivedAt: session.archivedAt || session.updatedAt,
    }))
    .sort((left, right) => String(right.archivedAt).localeCompare(String(left.archivedAt))), [activeAgent?.displayName, sessions]);
  const artifactRows = useMemo<DriveFileRow[]>(() => {
    const hidden = new Set(hiddenDriveRowIds);
    return sessions
      .flatMap((session) => {
        const selectedAgentName = sessionSelectedAgentName(session) || activeAgent?.displayName || "Link";
        return session.messages
          .filter((message) => message.role === "assistant")
          .flatMap((message) => (message.artifacts ?? []).map((artifact) => ({
            id: `${session.id}:${message.id}:${artifact.id}`,
            kind: "artifact" as const,
            artifact,
            sessionId: session.id,
            sessionTitle: session.title,
            agentName: formatChatAgentName(message.displayName || selectedAgentName),
            createdAt: artifact.createdAt || message.createdAt || session.updatedAt,
          })));
      })
      .filter((row) => !hidden.has(row.id))
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }, [activeAgent?.displayName, hiddenDriveRowIds, sessions]);
  const scribesRows = useMemo<Array<DriveScribesSessionRow | DriveScribesArtifactRow>>(() => {
    const sessionRows = scribesSessions.map((session) => ({
      id: `scribes-session:${session.id}`,
      kind: "scribes-session" as const,
      session,
      path: session.artifacts.find((artifact) => artifact.kind === "transcript" || artifact.kind === "meeting-notes")?.path || `~/Link/scribes/transcripts/${driveSafeSlug(session.title)}.md`,
    }));
    const artifactRows = scribesSessions.flatMap((session) =>
      session.artifacts.map((artifact) => ({
        id: `scribes-artifact:${session.id}:${artifact.id}`,
        kind: "scribes-artifact" as const,
        session,
        artifact,
      })),
    );
    return [...sessionRows, ...artifactRows].sort((left, right) => {
      const leftUpdated = left.kind === "scribes-session" ? left.session.updatedAt : left.artifact.updatedAt;
      const rightUpdated = right.kind === "scribes-session" ? right.session.updatedAt : right.artifact.updatedAt;
      return String(rightUpdated).localeCompare(String(leftUpdated));
    });
  }, [scribesSessions]);
  const rows: DriveRow[] = [...folderRows, ...archivedSessionRows, ...artifactRows, ...scribesRows];
  const filteredRows = rows.filter((row) => {
    const term = driveQuery.trim().toLowerCase();
    if (!term) return true;
    if (row.kind === "folder") return `${row.path} ${row.owner} ${row.contents} ${row.updated}`.toLowerCase().includes(term);
    if (row.kind === "archived-session") return `~/Link/archive/chats/ ${row.sessionTitle} ${row.agentName} archived chat session ${row.messageCount} messages`.toLowerCase().includes(term);
    if (row.kind === "scribes-session") return `${row.path} ${row.session.title} ${row.session.transcriptText} ${row.session.provider} Scribes transcript`.toLowerCase().includes(term);
    if (row.kind === "scribes-artifact") return `${row.artifact.path} ${row.artifact.title} ${row.artifact.kind} ${row.session.title} Scribes artifact`.toLowerCase().includes(term);
    return `${row.artifact.filename} ${row.agentName} ${row.sessionTitle}`.toLowerCase().includes(term);
  });

  function openDriveRow(row: DriveRow) {
    if (row.kind === "folder") setDriveQuery(row.path);
    else if (row.kind === "archived-session") openSession(row.sessionId);
    else if (row.kind === "scribes-session" || row.kind === "scribes-artifact") openScribes();
    else openArtifact(row.artifact);
  }

  function driveRowName(row: DriveRow) {
    if (row.kind === "folder") return row.path;
    if (row.kind === "archived-session") return `~/Link/archive/chats/${row.sessionTitle}`;
    if (row.kind === "scribes-session") return row.path;
    if (row.kind === "scribes-artifact") return row.artifact.path;
    return row.artifact.filename;
  }

  function driveRowOwner(row: DriveRow) {
    if (row.kind === "folder") return row.owner;
    if (row.kind === "scribes-session" || row.kind === "scribes-artifact") return "Scribes";
    return row.agentName;
  }

  function driveRowContents(row: DriveRow) {
    if (row.kind === "folder") return row.contents;
    if (row.kind === "archived-session") return `${row.messageCount} ${row.messageCount === 1 ? "message" : "messages"} in archived chat`;
    if (row.kind === "scribes-session") return `${row.session.sessionType} transcript · ${sttProviderLabel(row.session.provider)}`;
    if (row.kind === "scribes-artifact") return `${formatScribesArtifactKind(row.artifact.kind)} · ${row.session.title}`;
    return row.sessionTitle;
  }

  function driveRowUpdated(row: DriveRow) {
    if (row.kind === "folder") return row.updated;
    if (row.kind === "archived-session") return compactRelativeTime(row.archivedAt);
    if (row.kind === "scribes-session") return compactRelativeTime(row.session.updatedAt);
    if (row.kind === "scribes-artifact") return compactRelativeTime(row.artifact.updatedAt);
    return compactRelativeTime(row.createdAt);
  }

  function hideDriveRow(row: DriveFileRow) {
    setHiddenDriveRowIds((current) => {
      const next = current.includes(row.id) ? current : [...current, row.id];
      window.localStorage.setItem("telnyx-link-hidden-drive-row-ids", JSON.stringify(next));
      return next;
    });
  }

  function setDriveRowSelected(rowId: string, selected: boolean) {
    setSelectedDriveRowIds((current) => selected ? current.includes(rowId) ? current : [...current, rowId] : current.filter((id) => id !== rowId));
  }

  function toggleDriveBulkEdit() {
    setDriveBulkEdit((active) => !active);
    setSelectedDriveRowIds([]);
  }

  function hideSelectedDriveRows() {
    const selectedIds = new Set(selectedDriveRowIds);
    filteredRows.filter((row): row is DriveFileRow => row.kind === "artifact" && selectedIds.has(row.id)).forEach(hideDriveRow);
    setSelectedDriveRowIds([]);
    setDriveBulkEdit(false);
  }

  return (
    <section className="content driveView canonicalChat">
      <header className="pageHeader">
        <div>
          <h1>Drive</h1>
        </div>
      </header>
      <div className="chatSearchRow">
        <button
          className={`iconButton agentFilterButton ${driveFiltersOpen ? "selected" : ""}`}
          aria-label={driveFiltersOpen ? "Hide file filters" : "Show file filters"}
          title={driveFiltersOpen ? "Hide file filters" : "Show file filters"}
          onClick={() => setDriveFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={16} />
        </button>
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input value={driveQuery} onChange={(event) => setDriveQuery(event.target.value)} placeholder="Search files, agents, sessions, or archive" />
        </div>
        <button
          className={`iconButton agentFilterButton ${driveBulkEdit ? "selected" : ""}`}
          aria-label={driveBulkEdit ? "Exit bulk edit" : "Edit files"}
          title={driveBulkEdit ? "Exit bulk edit" : "Edit files"}
          onClick={toggleDriveBulkEdit}
        >
          <Pencil size={16} />
        </button>
        <TableRefreshButton onClick={refreshDriveRows} label="Refresh files" />
      </div>
      {driveBulkEdit && (
        <BulkEditControls
          active={driveBulkEdit}
          selectedCount={selectedDriveRowIds.length}
          onToggle={toggleDriveBulkEdit}
          onArchive={hideSelectedDriveRows}
          onDelete={hideSelectedDriveRows}
        />
      )}
      {driveFiltersOpen && (
        <div className="chatFilterBar" role="group" aria-label="File filters">
          <span className="chatFilterCount">{filteredRows.length} items</span>
        </div>
      )}
      <div className={`chatSessionRows driveFileRows ${driveBulkEdit ? "bulkEditing" : ""}`} role="table" aria-label="Link workspace files and folders">
        <div className="chatResultRow driveResultRow chatResultRowHead" role="row">
          <span className="bulkSelectCell" role="columnheader" aria-label="Select files" />
          <span className="driveFileHeaderCell" role="columnheader">Path</span>
          <span className="driveAgentHeaderCell" role="columnheader">Owner</span>
          <span className="driveSessionHeaderCell" role="columnheader">Contents</span>
          <span className="driveCreatedHeaderCell" role="columnheader">Updated</span>
          <span className="driveOpenHeaderCell" role="columnheader" aria-label="Open file" />
        </div>
        <div className="chatResultRows" role="rowgroup">
          {filteredRows.map((row) => (
            <div
              className={`chatResultRow driveResultRow ${row.kind === "folder" ? "driveFolderRow" : ""}`}
              role="row"
              key={row.id}
              tabIndex={0}
              onClick={() => openDriveRow(row)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDriveRow(row);
                }
              }}
            >
              {row.kind === "artifact" ? (
                <BulkSelectCell
                  active={driveBulkEdit}
                  checked={selectedDriveRowIds.includes(row.id)}
                  label={`Select ${row.artifact.filename}`}
                  onChange={(checked) => setDriveRowSelected(row.id, checked)}
                />
              ) : (
                <span className="bulkSelectCell" role="cell" aria-hidden="true" />
              )}
              <button
                className="driveFileNameCell"
                role="cell"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openDriveRow(row);
                }}
                title={driveRowName(row)}
              >
                {row.kind === "folder" ? <FolderOpen size={15} /> : <FileText size={15} />}
                <span>{driveRowName(row)}</span>
              </button>
              <span role="cell">{driveRowOwner(row)}</span>
              {row.kind === "artifact" ? (
                <button
                  className="driveSessionCell"
                  role="cell"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openSession(row.sessionId);
                  }}
                  title={row.sessionTitle}
                >
                  {row.sessionTitle}
                </button>
              ) : (
                <span role="cell">{driveRowContents(row)}</span>
              )}
              <span role="cell">{driveRowUpdated(row)}</span>
              <button
                className="chatSessionOpenButton"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openDriveRow(row);
                }}
                aria-label={row.kind === "folder" ? `Show ${row.path}` : `Open ${driveRowName(row)}`}
                title={row.kind === "folder" ? "Show folder" : row.kind === "archived-session" ? "Open archived session" : "Open file"}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
        {filteredRows.length === 0 && (
          <div className="tableEmptyState" role="row">
            <EmptyState
              title="No Drive items found"
              body="Try another search term or filter."
              icon={FolderOpen}
            />
          </div>
        )}
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

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildExplorerResultSharePrompt(result: ExplorerResult) {
  const sourceLabel = result.source === "guru" ? "Guru card" : result.source === "pylon" ? "Pylon ticket" : result.source.replace("_", " ");
  return [
    `Use this ${sourceLabel} as context in this session.`,
    "",
    `Title: ${result.title}`,
    `Source: ${result.source}`,
    `Type: ${result.type}`,
    `Freshness: ${result.freshness}`,
    result.url ? `URL: ${result.url}` : "",
    "",
    "Excerpt:",
    result.excerpt,
    "",
    "Task: keep this source available for the next answer, verify any customer-visible claims against the linked source, and call out anything that still needs a direct Guru, Pylon, or docs check.",
  ].filter(Boolean).join("\n");
}

function AssistantPanel({
  mode,
  setMode,
  collapsed,
  setCollapsed,
  skills,
  agents,
  bookmarkedAgentIds,
  activeAgent,
  newSessionDraftOpen,
  setNewSessionDraftOpen,
  createNewChatSession,
  selectedChatAgentId,
  setSelectedChatAgentId,
  selectedSession,
  selectedWorkspace,
  setChatSessions,
  updateChatSession,
  selectSession,
  openArtifact,
  refresh,
  setView,
  openPhoneContacts,
  liteLlmReady,
  liteLlmRuntime,
  chatModelMode,
  setChatModelMode,
  linkedPhoneNumber,
  setLinkedPhoneNumber,
  telnyxApiReady,
  activeDialerConfig,
  connectors,
  designSystemSessionPreferences,
  setDesignSystemSessionPreferences,
	  onArchiveSaved,
	  onEdgePreviewReady,
	  edgePreviewSurface,
	}: {
  mode: "chat" | "phone";
  setMode: (mode: "chat" | "phone") => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  skills: SkillMetadata[];
  agents: AgentSummary[];
  bookmarkedAgentIds: string[];
  activeAgent: ActiveAgentSelection | null;
  newSessionDraftOpen: boolean;
  setNewSessionDraftOpen: (open: boolean) => void;
  createNewChatSession: (draft?: NewChatSessionDraft) => Promise<void>;
  selectedChatAgentId: string;
  setSelectedChatAgentId: (id: string) => void;
  selectedSession?: ChatSession;
  selectedWorkspace?: WorkspaceSummary;
  setChatSessions: (updater: (current: ChatSession[]) => ChatSession[]) => void;
  updateChatSession: (input: { sessionId: string; title?: string; pinned?: boolean; archived?: boolean }) => Promise<ChatSession>;
  selectSession: (id: string) => void;
  openArtifact: (artifact: ChatArtifact) => void;
  refresh: () => Promise<void>;
  setView: (view: ViewId) => void;
  openPhoneContacts: () => void;
  liteLlmReady: boolean;
  liteLlmRuntime: LiteLlmRuntimeStatus | null;
  chatModelMode: string;
  setChatModelMode: (mode: string) => void;
  linkedPhoneNumber: string;
  setLinkedPhoneNumber: (phoneNumber: string) => void;
  telnyxApiReady: boolean;
  activeDialerConfig: DialerConfig;
  connectors: ConnectorStatus[];
  designSystemSessionPreferences: SessionPreferenceMap;
  setDesignSystemSessionPreferences: (updater: (current: SessionPreferenceMap) => SessionPreferenceMap) => void;
	  onArchiveSaved: () => void;
	  onEdgePreviewReady: (preview: EdgePreviewSurface) => void;
	  edgePreviewSurface: EdgePreviewSurface | null;
	}) {
  const [prompt, setPrompt] = useState("");
  const [chatAttachments, setChatAttachments] = useState<ChatAttachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [assistantAttachMenuOpen, setAssistantAttachMenuOpen] = useState(false);
  const [assistantRuntimeMenuOpen, setAssistantRuntimeMenuOpen] = useState(false);
  const [assistantSessionMenuOpen, setAssistantSessionMenuOpen] = useState(false);
  const [sessionActionBusy, setSessionActionBusy] = useState("");
  const [assistantSkillPickerOpen, setAssistantSkillPickerOpen] = useState(false);
  const [assistantSkillPickerQuery, setAssistantSkillPickerQuery] = useState("");
  const [newSessionBotPickerOpen, setNewSessionBotPickerOpen] = useState(false);
  const [newSessionBotQuery, setNewSessionBotQuery] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceInputStatus, setVoiceInputStatus] = useState("");
  const [docsSuggestionStatus, setDocsSuggestionStatus] = useState("");
  const [planMode, setPlanMode] = useState(false);
  const [pursueGoal, setPursueGoal] = useState(false);
  const [createSkillMode, setCreateSkillMode] = useState(false);
  const [skillPublishMode, setSkillPublishMode] = useState<"local" | "repo">("local");
  const [deployAppMode, setDeployAppMode] = useState(false);
  const [edgeDeployBusy, setEdgeDeployBusy] = useState(false);
  const [edgeDeployResult, setEdgeDeployResult] = useState<LinkLocalEdgeDeployResult | null>(null);
  const [edgePreviewResult, setEdgePreviewResult] = useState<LinkLocalEdgeDeployResult | null>(null);
  const [edgeDeploySlug, setEdgeDeploySlug] = useState("");
  const [edgeDeployDetailsOpen, setEdgeDeployDetailsOpen] = useState(false);
  const [edgeSlugAvailability, setEdgeSlugAvailability] = useState<EdgeSlugAvailability | null>(null);
  const [edgeDeployReplaceExisting, setEdgeDeployReplaceExisting] = useState(false);
  const [edgeDeployStage, setEdgeDeployStage] = useState<EdgeDeployStage>("idle");
  const [edgeDeployError, setEdgeDeployError] = useState("");
  const [edgeDeployStartedAt, setEdgeDeployStartedAt] = useState(0);
  const [edgeDeployTick, setEdgeDeployTick] = useState(0);
  const [archivingMessageId, setArchivingMessageId] = useState("");
  const [newSessionTitleDraft, setNewSessionTitleDraft] = useState("");
  const [creatingNewSession, setCreatingNewSession] = useState(false);
  const [refreshingNewSessionBots, setRefreshingNewSessionBots] = useState(false);
  const [refreshingModelCatalog, setRefreshingModelCatalog] = useState(false);
  const [phoneAssistants, setPhoneAssistants] = useState<PhoneAssistantOption[]>([]);
  const [phoneDialTarget, setPhoneDialTarget] = useState("");
  const [installedSkillKeys, setInstalledSkillKeys] = useState<string[]>(() => readInstalledAgentSkillKeys());
  const [sessionSkillSelections, setSessionSkillSelections] = useState<Record<string, string>>({});
  const assistantAttachMenuRef = useRef<HTMLDivElement | null>(null);
  const assistantRuntimeMenuRef = useRef<HTMLDivElement | null>(null);
  const assistantSessionMenuRef = useRef<HTMLDivElement | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const edgeDeploySlugInputRef = useRef<HTMLInputElement | null>(null);
  const assistantLogRef = useRef<HTMLDivElement | null>(null);
  const assistantLogEndRef = useRef<HTMLDivElement | null>(null);
  const sendRequestIdRef = useRef(0);
  const newSessionBotPickerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const [acceptMode, setAcceptMode] = useState<"auto" | "review" | "manual">("auto");
  const aiModelRoutes = liteLlmRuntime?.routes?.length ? liteLlmRuntime.routes : fallbackAiModelRoutes();
  const selectedModelRoute = aiModelRoutes.find((route) => route.id === chatModelMode) ?? aiModelRoutes.find((route) => route.default) ?? aiModelRoutes[0];
  const modelMode = selectedModelRoute?.id ?? "auto/ask-before-cloud";
  const bookmarkedAgentIdSet = useMemo(() => new Set(bookmarkedAgentIds), [bookmarkedAgentIds]);
  const chatAgents = useMemo(() => {
    const defaultRuntimeAgent: ChatAgentOption = {
      id: "link-default-runtime",
      displayName: "Link",
      description: selectedModelRoute
        ? `Default runtime route: ${selectedModelRoute.label}. ${selectedModelRoute.description}`
        : "Default local-first runtime route. Install LiteLLM and Ollama locally, or select an explicit cloud route.",
      source: "link",
      type: selectedModelRoute?.provider === "telnyx" ? "telnyx" : selectedModelRoute?.provider === "anthropic" ? "frontier" : "local",
      status: selectedModelRoute?.available === false ? "needs_access" : liteLlmReady ? "connected" : "available",
      squad: "default",
    };
    const gettingStartedAgent: ChatAgentOption = {
      id: linkGettingStartedAgentId,
      displayName: linkGettingStartedAgentName,
      description: "Central OpenClaw agent for Link app help, onboarding, and getting started guidance.",
      source: "agent-control-plane",
      type: "openclaw",
      status: "available",
      squad: "link",
    };
    const toChatAgent = (agent: AgentSummary): ChatAgentOption => ({
      id: agent.id,
      displayName: agent.displayName,
      description: agent.description,
      source: agent.source,
      type: agent.type,
      status: agent.status,
      squad: agent.squad ?? (agent.source === "agent-control-plane" ? "agent-control-plane" : "directory"),
    });
    const availableHostedAgents = agents
      .filter((agent) => agent.source === "agent-control-plane" && (agent.type === "hermes" || agent.type === "openclaw"))
      .map(toChatAgent);
    const availableA2aAgents = agents
      .filter((agent) => agent.source === "a2a-discovery" && agent.available !== false)
      .map(toChatAgent);
	    const voiceAssistantAgents = phoneAssistants
	      .filter((assistant) => assistant.status !== "disabled")
	      .map((assistant): ChatAgentOption => ({
        id: `voice-assistant-${assistant.id}`,
        displayName: assistant.name,
        description: assistant.description || "Telnyx Voice AI assistant. Text chat routes through Link while voice calling uses the phone assistant.",
        source: "voice-assistant",
        type: "voice-assistant",
	        status: assistant.status || "available",
	        squad: "telnyx-voice-ai",
	      }));
	    const availableDirectoryAgents = agents
	      .filter((agent) => agent.available !== false)
	      .filter((agent) => agent.source !== "slack" && agent.type !== "slack")
	      .filter((agent) => agent.id !== "slack-bot-troubleshooting" && agent.name !== "bot-troubleshooting")
	      .map(toChatAgent);
	    const bookmarkedAgents = agents
	      .filter((agent) => bookmarkedAgentIdSet.has(agent.id) && agent.source !== "slack" && agent.type !== "slack")
	      .filter((agent) => agent.id !== "slack-bot-troubleshooting" && agent.name !== "bot-troubleshooting")
	      .map(toChatAgent);

	    const uniqueAgents = (items: ChatAgentOption[]) => [...new Map(items.map((agent) => [agent.id, agent])).values()];
	    if (!activeAgent) return uniqueAgents([defaultRuntimeAgent, ...availableHostedAgents, gettingStartedAgent, ...voiceAssistantAgents, ...availableA2aAgents, ...availableDirectoryAgents, ...bookmarkedAgents]);

    const activeDirectoryAgent = agents.find((agent) => agent.id === activeAgent.id);
    const activeChatAgent = activeDirectoryAgent ? toChatAgent(activeDirectoryAgent) : null;

	    return uniqueAgents([defaultRuntimeAgent, ...availableHostedAgents, gettingStartedAgent, ...voiceAssistantAgents, ...availableA2aAgents, ...availableDirectoryAgents, ...(activeChatAgent ? [activeChatAgent] : []), ...bookmarkedAgents]);
	  }, [activeAgent, agents, bookmarkedAgentIdSet, liteLlmReady, phoneAssistants, selectedModelRoute]);
  const selectedChatAgent = chatAgents.find((agent) => agent.id === selectedChatAgentId) ?? chatAgents[0];
  const newSessionBotSearch = newSessionBotQuery.trim().toLowerCase();
  const newSessionBotMatches = chatAgents.filter((agent) =>
    !newSessionBotSearch || `${agent.displayName} ${agent.description} ${agent.type} ${agent.source} ${agent.squad}`.toLowerCase().includes(newSessionBotSearch),
  );
  const isLinkChatAgent = (agent: ChatAgentOption) =>
    agent.source === "link" ||
    agent.id === linkGettingStartedAgentId ||
    agent.squad === "link" ||
    normalizeSearchText(agent.displayName) === "link";
  const myAgentOptions = newSessionBotMatches.filter((agent) =>
    agent.source !== "a2a-discovery" && agent.source !== "voice-assistant" && agent.source !== "self-hosted" && !isLinkChatAgent(agent),
  );
  const selfHostedAgentOptions = newSessionBotMatches.filter((agent) => agent.source === "self-hosted");
  const telnyxLinkAppOptions = newSessionBotMatches.filter(isLinkChatAgent);
  const voiceAssistantOptions = newSessionBotMatches.filter((agent) => agent.source === "voice-assistant");
  const a2aBotOptions = newSessionBotMatches.filter((agent) => agent.source === "a2a-discovery" && agent.status !== "unavailable");
  const chatAgentOptionLabel = (agent: ChatAgentOption) => {
    if (agent.source === "a2a-discovery") return `${agent.displayName} (A2A)`;
    if (agent.source === "agent-control-plane") return `${agent.displayName} (ACP)`;
    if (agent.source === "self-hosted") return `${agent.displayName} (Local)`;
    if (agent.source === "voice-assistant") return `${agent.displayName} (Voice)`;
    return agent.displayName;
  };
  const newSessionDefaultTitle = `New ${selectedChatAgent?.source === "a2a-discovery" ? "A2A" : selectedChatAgent?.source === "voice-assistant" ? "Voice Assistant" : selectedChatAgent?.source === "self-hosted" ? "Self-hosted" : selectedChatAgent?.type === "hermes" ? "Hermes" : selectedChatAgent?.type === "litellm" ? "Link" : "OpenClaw"} session`;
  const visibleSessionMessages = useMemo(
    () => (selectedSession?.messages ?? []).filter((message) => message.role !== "system"),
    [selectedSession?.messages],
  );
  const visibleMessageCount = visibleSessionMessages.length;
  const lastAssistantMessage = useMemo(
    () => [...(selectedSession?.messages ?? [])].reverse().find((message) => message.role === "assistant" && Boolean(message.content)),
    [selectedSession?.messages],
  );
  const currentSessionSkillKey = selectedSession?.id ?? draftSessionPreferenceKey;
  const selectedSessionSkillName = sessionSkillSelections[currentSessionSkillKey] ?? "";
  const selectedChatSkill = selectedSessionSkillName ? skills.find((skill) => skill.name === selectedSessionSkillName) : undefined;
  const useLinkDesignSystemForSession = Boolean(designSystemSessionPreferences[currentSessionSkillKey]);
  const skillCommandQuery = prompt.trimStart().startsWith("/") ? prompt.trimStart().slice(1).trim().toLowerCase() : "";
  const skillPickerQuery = (assistantSkillPickerQuery || skillCommandQuery).trim().toLowerCase();
  const starredSkillRows = useMemo(() => {
    const uniqueSkillNames = new Set<string>();
    for (const key of installedSkillKeys) {
      const [, ...skillNameParts] = key.split(":");
      const skillName = skillNameParts.join(":").trim();
      if (skillName) uniqueSkillNames.add(skillName);
    }
    return [...uniqueSkillNames].sort((left, right) => left.localeCompare(right)).map((name) => {
      const skill = skills.find((item) => item.name === name);
      return {
        name,
        skill,
        description: skill?.description ?? "Installed skill",
        team: skill?.team ?? "Skill",
      };
    });
  }, [installedSkillKeys, skills]);
  const filteredStarredSkills = useMemo(() => {
    if (!skillPickerQuery) return starredSkillRows;
    return starredSkillRows.filter((row) =>
      `${row.name} ${row.description} ${row.team}`.toLowerCase().includes(skillPickerQuery),
    );
  }, [skillPickerQuery, starredSkillRows]);
  const groupedStarredSkills = useMemo(() => {
    const groups = new Map<string, typeof filteredStarredSkills>();
    for (const row of filteredStarredSkills) {
      const groupName = row.team || "Skills";
      groups.set(groupName, [...(groups.get(groupName) ?? []), row]);
    }
    return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [filteredStarredSkills]);

  useEffect(() => {
    if (chatAgents.length === 0) {
      if (selectedChatAgentId) setSelectedChatAgentId("");
      return;
    }
    if (!chatAgents.some((agent) => agent.id === selectedChatAgentId)) {
      const storedAgentId = typeof window === "undefined" ? "" : window.localStorage.getItem("telnyx-link-selected-chat-agent") ?? "";
      const storedAgent = chatAgents.find((agent) => agent.id === storedAgentId);
      setSelectedChatAgentId(storedAgent?.id ?? chatAgents[0]!.id);
    }
  }, [chatAgents, selectedChatAgentId]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      stopVoiceStream();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadPhoneAssistants() {
      if (!telnyxApiReady) {
        setPhoneAssistants([]);
        return;
      }
      try {
        const assistants = await linkApi.listPhoneAssistants();
        if (!cancelled) setPhoneAssistants(assistants);
      } catch {
        if (!cancelled) setPhoneAssistants([]);
      }
    }
    void loadPhoneAssistants();
    return () => {
      cancelled = true;
    };
  }, [telnyxApiReady]);

  useEffect(() => {
    assistantLogEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [busy, selectedSession?.id, visibleMessageCount]);

  useEffect(() => {
    if (!deployAppMode || !edgePreviewResult?.directory || !edgeDeployDetailsOpen) {
      setEdgeSlugAvailability(null);
      return;
    }
    const slug = normalizeEdgeDeploySlug(edgeDeploySlug);
    if (!slug) {
      setEdgeSlugAvailability({ slug: "", status: "empty", available: false, canReplace: false, message: "Enter a unique app URL." });
      setEdgeDeployReplaceExisting(false);
      return;
    }
    let cancelled = false;
    setEdgeSlugAvailability({ slug, status: "checking", available: false, canReplace: false, message: "Checking URL availability..." });
    const timer = window.setTimeout(() => {
      linkApi.checkEdgeSlugAvailability({ slug })
        .then((result) => {
          if (cancelled) return;
          setEdgeSlugAvailability(result);
          if (!result.canReplace) setEdgeDeployReplaceExisting(false);
        })
        .catch((error) => {
          if (cancelled) return;
          setEdgeSlugAvailability({
            slug,
            status: "error",
            available: false,
            canReplace: false,
            message: error instanceof Error ? error.message : "Unable to check URL availability.",
          });
          setEdgeDeployReplaceExisting(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [deployAppMode, edgeDeployDetailsOpen, edgeDeploySlug, edgePreviewResult?.directory]);

  useEffect(() => {
    if (!edgeDeployBusy) return undefined;
    setEdgeDeployTick((tick) => tick + 1);
    const timer = window.setInterval(() => {
      setEdgeDeployTick((tick) => tick + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [edgeDeployBusy]);

  useEffect(() => {
    if (!assistantAttachMenuOpen && !assistantRuntimeMenuOpen && !newSessionBotPickerOpen && !assistantSessionMenuOpen) return;

    function eventPathContains(event: PointerEvent, element: HTMLElement | null) {
      if (!element) return false;
      const path = event.composedPath?.() ?? [];
      return path.includes(element) || element.contains(event.target as Node);
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      if (assistantAttachMenuOpen && !eventPathContains(event, assistantAttachMenuRef.current)) {
        setAssistantAttachMenuOpen(false);
        setAssistantSkillPickerOpen(false);
        setAssistantSkillPickerQuery("");
      }
      if (assistantRuntimeMenuOpen && !eventPathContains(event, assistantRuntimeMenuRef.current)) {
        setAssistantRuntimeMenuOpen(false);
      }
      if (newSessionBotPickerOpen && !eventPathContains(event, newSessionBotPickerRef.current)) {
        setNewSessionBotPickerOpen(false);
        setNewSessionBotQuery("");
      }
      if (assistantSessionMenuOpen && !eventPathContains(event, assistantSessionMenuRef.current)) {
        setAssistantSessionMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAssistantAttachMenuOpen(false);
      setAssistantRuntimeMenuOpen(false);
      setAssistantSkillPickerOpen(false);
      setAssistantSkillPickerQuery("");
      setNewSessionBotPickerOpen(false);
      setNewSessionBotQuery("");
      setAssistantSessionMenuOpen(false);
    }

    window.addEventListener("pointerdown", handleOutsidePointerDown, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handleOutsidePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [assistantAttachMenuOpen, assistantRuntimeMenuOpen, assistantSessionMenuOpen, newSessionBotPickerOpen]);

  useEffect(() => {
    function refreshInstalledSkillsFromStorage(event: StorageEvent) {
      if (event.key === "telnyx-link-installed-agent-skills") setInstalledSkillKeys(readInstalledAgentSkillKeys());
    }
    window.addEventListener("storage", refreshInstalledSkillsFromStorage);
    return () => window.removeEventListener("storage", refreshInstalledSkillsFromStorage);
  }, []);

  function refreshInstalledSkills() {
    setInstalledSkillKeys(readInstalledAgentSkillKeys());
  }

  function removeLeadingSkillCommand(value: string) {
    const leftTrimmed = value.trimStart();
    if (!leftTrimmed.startsWith("/")) return value;
    const nextLineIndex = leftTrimmed.indexOf("\n");
    return nextLineIndex >= 0 ? leftTrimmed.slice(nextLineIndex + 1).trimStart() : "";
  }

  function selectSessionSkill(skillName: string) {
    setSessionSkillSelections((current) => ({ ...current, [currentSessionSkillKey]: skillName }));
    setAssistantAttachMenuOpen(false);
    setAssistantSkillPickerOpen(false);
    setAssistantSkillPickerQuery("");
    setPrompt((current) => removeLeadingSkillCommand(current));
    setVoiceInputStatus(`Using ${skillName} for this session.`);
  }

  function clearSessionSkill() {
    setSessionSkillSelections((current) => {
      const next = { ...current };
      delete next[currentSessionSkillKey];
      return next;
    });
    setVoiceInputStatus("");
  }

  function setSessionDesignSystemPreference(enabled: boolean) {
    setDesignSystemSessionPreferences((current) => ({ ...current, [currentSessionSkillKey]: enabled }));
    if (deployAppMode) {
      setVoiceInputStatus(enabled
        ? "Build app mode will direct the agent to use the Link design system."
        : "Build app mode will not add Link design-system instructions.");
    }
  }

  function handleComposerPromptChange(value: string) {
    if (busy) return;
    setPrompt(value);
    if (value.trimStart().startsWith("/") && !newSessionDraftOpen) {
      refreshInstalledSkills();
      setAssistantSkillPickerQuery(value.trimStart().slice(1).trim());
      setAssistantSkillPickerOpen(true);
      setAssistantAttachMenuOpen(true);
      return;
    }
  }

  async function send() {
    const trimmed = prompt.trim();
    const attachmentsSnapshot = chatAttachments;
    if ((!trimmed && attachmentsSnapshot.length === 0) || busy) return;
    if (trimmed.startsWith("/")) {
      refreshInstalledSkills();
      setAssistantSkillPickerQuery(trimmed.slice(1).trim());
      setAssistantSkillPickerOpen(true);
      setAssistantAttachMenuOpen(true);
      return;
    }
    const visibleContent = trimmed || "Please review the attached file(s).";
    const visibleAttachmentSummary = attachmentsSnapshot.length
      ? `\n\nAttached: ${attachmentsSnapshot.map((attachment) => attachment.name).join(", ")}`
      : "";
    const messageContent = `${visibleContent}${visibleAttachmentSummary}`;
    const requestId = sendRequestIdRef.current + 1;
    sendRequestIdRef.current = requestId;
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticSessionId = selectedSession?.id ?? `pending-chat-${requestId}-${Date.now()}`;
    const optimisticUserMessage: ChatMessage = {
      id: `pending-message-user-${requestId}-${Date.now()}`,
      role: "user",
      content: messageContent,
      createdAt: optimisticCreatedAt,
    };
    const optimisticSession: ChatSession = selectedSession
      ? {
        ...selectedSession,
        status: "active",
        updatedAt: optimisticCreatedAt,
        messages: [...selectedSession.messages, optimisticUserMessage],
      }
      : {
        id: optimisticSessionId,
        title: visibleContent.slice(0, 54),
        workspaceId: selectedWorkspace?.id ?? "workspace-link",
        model: selectedChatAgent?.displayName ?? "Link",
        status: "active",
        updatedAt: optimisticCreatedAt,
        messages: [optimisticUserMessage],
      };
    setChatSessions((current) => [optimisticSession, ...current.filter((item) => item.id !== optimisticSessionId)]);
    selectSession(optimisticSessionId);
    setPrompt("");
    setChatAttachments([]);
    setBusy(true);
    try {
      const edgeAppSlug = deployAppMode ? normalizeEdgeDeploySlug(edgeDeploySlug) || suggestEdgeDeploySlugFromPrompt(visibleContent) : "";
      if (deployAppMode && edgeAppSlug && edgeAppSlug !== edgeDeploySlug) {
        setEdgeDeploySlug(edgeAppSlug);
        setEdgePreviewResult(null);
        setEdgeDeployResult(null);
      }
      if (deployAppMode) {
        setEdgeDeployError("");
        setEdgeDeployStage(edgeAppSlug ? "idle" : "needs_url");
      }
      const workflowPrefix = createSkillMode
        ? skillPublishMode === "repo"
          ? "Skill publishing workflow: help this Telnyx user turn repeated agent work into a SKILL.md package, capture inputs, source of truth, expected output, repeated checks, human checkpoints, test fixture, owner, reviewers, and approval gates, then prepare a branch and reviewable PR for https://github.com/team-telnyx/telnyx-clawdbot-skills."
          : "Local skill workflow: help this Telnyx user turn repeated agent work into a SKILL.md package that is only installed for their agents and hosted locally in the Electron app. Capture inputs, source of truth, expected output, repeated checks, human checkpoints, test fixture, owner, reviewers, and approval gates. Do not prepare a GitHub PR unless the user switches the skill publish target to the shared skills repository."
          : deployAppMode
            ? buildEdgeAppSystemInstruction(edgeAppSlug, useLinkDesignSystemForSession)
            : "";
      const skillPrefix = selectedChatSkill
        ? [
          `Skill session instruction: use the "${selectedChatSkill.name}" skill while responding in this chat session.`,
          `Skill description: ${selectedChatSkill.description}`,
          `Skill metadata: team=${selectedChatSkill.team}; product=${selectedChatSkill.product ?? "workflow"}; language=${selectedChatSkill.language ?? "skill"}; source=${selectedChatSkill.source ?? "link"}; approval_required=${selectedChatSkill.approvalRequired ? "true" : "false"}.`,
          "Apply this skill's intended workflow, inputs, expected output, and safety constraints to the user's request.",
        ].join("\n")
        : "";
      const attachmentPrefix = buildAttachmentContext(attachmentsSnapshot);
      const instructionPrefix = [workflowPrefix, skillPrefix, attachmentPrefix].filter(Boolean).join("\n\n");
      const session = await linkApi.sendChatMessage({
        sessionId: selectedSession?.id,
        workspaceId: selectedWorkspace?.id,
        content: messageContent,
        systemInstruction: instructionPrefix || undefined,
        agentId: selectedChatAgent?.id === "link-default-runtime" ? undefined : selectedChatAgent?.id,
        agentName: selectedChatAgent?.id === "link-default-runtime" ? undefined : selectedChatAgent?.displayName,
        agentSource: selectedChatAgent?.id === "link-default-runtime" ? undefined : selectedChatAgent?.source,
        approvalMode: acceptMode,
        modelMode,
      });
      if (sendRequestIdRef.current !== requestId) return;
      setChatSessions((current) => [session, ...current.filter((item) => item.id !== session.id && item.id !== optimisticSessionId)]);
      if (!selectedSession?.id && selectedSessionSkillName) {
        setSessionSkillSelections((current) => {
          const next = { ...current, [session.id]: selectedSessionSkillName };
          delete next[draftSessionPreferenceKey];
          return next;
        });
      }
      if (!selectedSession?.id && useLinkDesignSystemForSession) {
        setDesignSystemSessionPreferences((current) => {
          const next = { ...current, [session.id]: true };
          delete next[draftSessionPreferenceKey];
          return next;
        });
      }
      selectSession(session.id);
      await refresh();
    } catch (error) {
      setChatAttachments(attachmentsSnapshot);
      if (sendRequestIdRef.current !== requestId) return;
      const failedAt = new Date().toISOString();
      const failureMessage: ChatMessage = {
        id: `pending-message-error-${requestId}-${Date.now()}`,
        role: "assistant",
        content: error instanceof Error ? `Message failed to send: ${error.message}` : "Message failed to send.",
        createdAt: failedAt,
        displayName: "Link",
      };
      setChatSessions((current) => current.map((item) =>
        item.id === optimisticSessionId
          ? { ...item, status: "idle", updatedAt: failedAt, messages: [...item.messages, failureMessage] }
          : item,
      ));
    } finally {
      if (sendRequestIdRef.current === requestId) setBusy(false);
    }
  }

  function stopSend() {
    sendRequestIdRef.current += 1;
    setBusy(false);
  }

  async function startDraftedSession() {
    if (creatingNewSession || !selectedChatAgent) return;
    setCreatingNewSession(true);
    try {
      await createNewChatSession({
        title: newSessionTitleDraft.trim() || newSessionDefaultTitle,
        agentId: selectedChatAgent.id,
        agentName: selectedChatAgent.displayName,
        agentType: selectedChatAgent.type,
        agentSource: selectedChatAgent.source,
        approvalMode: acceptMode,
        modelMode,
      });
      setNewSessionTitleDraft("");
    } finally {
      setCreatingNewSession(false);
    }
  }

  function selectNewSessionBot(agentId: string) {
    setSelectedChatAgentId(agentId);
    setNewSessionBotPickerOpen(false);
    setNewSessionBotQuery("");
  }

  async function refreshNewSessionBots() {
    setRefreshingNewSessionBots(true);
    try {
      await refresh();
    } finally {
      setRefreshingNewSessionBots(false);
    }
  }

  async function refreshModelCatalog() {
    setRefreshingModelCatalog(true);
    try {
      await linkApi.refreshTelnyxModelCatalog();
      await refresh();
    } finally {
      setRefreshingModelCatalog(false);
    }
  }

  function renderNewSessionBotSection(title: string, options: ChatAgentOption[]) {
    return (
      <div className="newSessionBotSection" key={title}>
        <small>{title}</small>
        {options.map((agent) => (
          <button
            key={agent.id}
            type="button"
            role="option"
            aria-selected={selectedChatAgent?.id === agent.id}
            className={selectedChatAgent?.id === agent.id ? "selected" : ""}
            onPointerDown={(event) => {
              event.preventDefault();
              selectNewSessionBot(agent.id);
            }}
            onClick={() => selectNewSessionBot(agent.id)}
          >
            <span>
              <strong>{chatAgentOptionLabel(agent)}</strong>
              <small>{agent.squad} - {agent.type}</small>
            </span>
          </button>
        ))}
        {options.length === 0 && <em>No agents found</em>}
      </div>
    );
  }

  async function suggestDocsUpdate(message: ChatMessage) {
    const previousUserMessage = [...(selectedSession?.messages ?? [])].reverse().find((item) => item.role === "user");
    setDocsSuggestionStatus("Drafting documentation update");
    try {
      await linkApi.createChangeRequest({
        title: "Suggest Telnyx documentation update",
        summary: "A bot answer may be wrong or incomplete against Telnyx Support Center or Developer Docs.",
        requestedChange: [
          "Documentation sources to verify:",
          "- https://support.telnyx.com/en/",
          "- https://developers.telnyx.com/docs/overview",
          "",
          "User question:",
          previousUserMessage?.content ?? "Not captured",
          "",
          "Bot answer to review:",
          message.content,
          "",
          "Requested outcome:",
          "Update the relevant documentation in team-telnyx/link so future OpenClaw/Hermes/AIDA answers can cite the corrected source.",
        ].join("\n"),
        workspaceId: selectedWorkspace?.id,
        sourceSessionId: selectedSession?.id,
        githubRepo: "team-telnyx/link",
      });
      await refresh();
      setDocsSuggestionStatus("Docs update suggestion queued for review.");
    } catch (err) {
      setDocsSuggestionStatus(err instanceof Error ? err.message : "Unable to draft docs update.");
    }
  }

  async function toggleVoiceInput() {
    if (voiceListening) {
      if (mediaRecorderRef.current?.state === "recording") {
        setVoiceInputStatus("Transcribing...");
        mediaRecorderRef.current.stop();
        return;
      }
      recognitionRef.current?.stop();
      setVoiceListening(false);
      setVoiceInputStatus("");
      return;
    }

    if (typeof navigator.mediaDevices?.getUserMedia === "function" && typeof MediaRecorder !== "undefined") {
      try {
        await startRecordedVoiceInput();
        return;
      } catch (err) {
        setVoiceListening(false);
        stopVoiceStream();
        setVoiceInputStatus(err instanceof Error ? err.message : "Voice input could not start.");
        return;
      }
    }

    startBrowserSpeechRecognition();
  }

  async function startRecordedVoiceInput() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = preferredAudioMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    voiceChunksRef.current = [];
    voiceStreamRef.current = stream;
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) voiceChunksRef.current.push(event.data);
    };
    recorder.onerror = () => {
      setVoiceListening(false);
      setVoiceInputStatus("Voice input stopped.");
      stopVoiceStream();
      mediaRecorderRef.current = null;
    };
    recorder.onstop = () => {
      void transcribeRecordedVoice(recorder.mimeType || mimeType || "audio/webm");
    };

    recorder.start();
    setVoiceListening(true);
    setVoiceInputStatus("Listening...");
  }

  async function transcribeRecordedVoice(mimeType: string) {
    const audioBlob = new Blob(voiceChunksRef.current, { type: mimeType });
    voiceChunksRef.current = [];
    mediaRecorderRef.current = null;
    stopVoiceStream();
    setVoiceListening(false);

    if (audioBlob.size === 0) {
      setVoiceInputStatus("No voice audio was captured.");
      return;
    }

    setVoiceInputStatus("Transcribing...");
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const result = await linkApi.transcribeAudio({ audioBase64, mimeType: audioBlob.type || mimeType });
      appendVoiceTranscript(result.text);
      setVoiceInputStatus("Voice captured.");
    } catch (err) {
      setVoiceInputStatus(err instanceof Error ? err.message : "Voice transcription failed.");
    }
  }

  function appendVoiceTranscript(transcript: string) {
    const trimmed = transcript.trim();
    if (!trimmed) return;
    setPrompt((current) => (current.trim() ? `${current.trimEnd()} ${trimmed}` : trimmed));
  }

  function stopVoiceStream() {
    voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
    voiceStreamRef.current = null;
  }

  function startBrowserSpeechRecognition() {
    const Recognition = speechRecognitionConstructor();
    if (!Recognition) {
      setVoiceInputStatus("Voice input is not available on this device.");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      const transcriptParts: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript?.trim();
        if (transcript) transcriptParts.push(transcript);
      }
      const transcript = transcriptParts.join(" ").trim();
      if (transcript) {
        appendVoiceTranscript(transcript);
        setVoiceInputStatus("Voice captured.");
      }
    };
    recognition.onerror = (event) => {
      setVoiceListening(false);
      setVoiceInputStatus(event.error === "not-allowed" ? "Microphone access was denied." : "Voice input stopped.");
    };
    recognition.onend = () => {
      setVoiceListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setVoiceListening(true);
      setVoiceInputStatus("Listening...");
    } catch {
      setVoiceListening(false);
      setVoiceInputStatus("Voice input could not start.");
    }
  }

  async function attachPhotosAndFiles() {
    setAssistantAttachMenuOpen(false);
    setVoiceInputStatus("Opening file picker...");
    try {
      const selection = await linkApi.selectChatAttachments();
      if (selection.canceled) {
        setVoiceInputStatus("");
        return;
      }
      setChatAttachments((current) => {
        const existingPaths = new Set(current.map((attachment) => attachment.path));
        const next = [...current];
        for (const attachment of selection.attachments) {
          if (!existingPaths.has(attachment.path)) next.push(attachment);
        }
        return next.slice(0, 8);
      });
      const readableCount = selection.attachments.filter((attachment) => attachment.content || attachment.dataUrl).length;
      setVoiceInputStatus(`${selection.attachments.length} file${selection.attachments.length === 1 ? "" : "s"} attached. ${readableCount} ready for local context.`);
    } catch (error) {
      setVoiceInputStatus(error instanceof Error ? `Unable to attach files: ${error.message}` : "Unable to attach files.");
    }
  }

  function startNewSessionFromMenu() {
    setAssistantAttachMenuOpen(false);
    setMode("chat");
    selectSession("");
    setView("chats");
    setNewSessionDraftOpen(true);
    void refresh();
  }

  function toggleCreateSkillMode(enabled: boolean) {
    setCreateSkillMode(enabled);
    if (enabled) {
      setDeployAppMode(false);
      setVoiceInputStatus(skillPublishMode === "repo"
        ? "Skill mode will prepare a reviewable PR for team-telnyx/telnyx-clawdbot-skills."
        : "Skill mode will create a local skill for your agents in this app.");
    } else {
      setVoiceInputStatus("");
    }
  }

  function seedToolFromMessage(message: ChatMessage) {
    setPrompt([
      "Turn this repeated workflow into a reusable Link skill.",
      "Capture the inputs, source of truth, expected output, repeated checks, human checkpoints, test fixture, owner, reviewers, and approval gates.",
      "",
      "Chat context:",
      message.content,
    ].join("\n"));
    toggleCreateSkillMode(true);
  }

  async function saveMessageToArchive(message: ChatMessage) {
    const content = message.content.trim();
    if (!content || archivingMessageId) return;
    setArchivingMessageId(message.id);
    setVoiceInputStatus("Saving message to archive...");
    try {
      const sender = message.role === "user" ? "User" : assistantDisplayName(message.displayName ?? selectedChatAgent?.displayName);
      const sessionTitle = selectedSession?.title ?? "Untitled chat";
      const lastUserPrompt = [...(selectedSession?.messages ?? [])]
        .reverse()
        .find((candidate) => candidate.role === "user")?.content.trim();
      const context = [
        `Session: ${sessionTitle}`,
        `Sender: ${sender}`,
        `Created: ${message.createdAt}`,
        lastUserPrompt ? `Prompt: ${lastUserPrompt}` : "",
      ].filter(Boolean).join("; ");
      const result = await linkApi.retainMemory({
        content,
        context,
        source: "link-chat-message",
      });
      setVoiceInputStatus(`Saved to archive: ${result.summary}`);
      await refresh();
      onArchiveSaved();
    } catch (error) {
      setVoiceInputStatus(error instanceof Error ? error.message : "Archive save failed.");
    } finally {
      setArchivingMessageId("");
    }
  }

	  function toggleDeployAppMode(enabled: boolean) {
	    setDeployAppMode(enabled);
	    if (enabled) {
	      setCreateSkillMode(false);
	      setEdgeDeployStage("idle");
	      setEdgeDeployError("");
	      setEdgeDeployDetailsOpen(false);
	      setVoiceInputStatus(useLinkDesignSystemForSession ? "Build app mode will direct the agent to use the Link design system." : "");
	    } else {
	      setEdgeDeployResult(null);
	      setEdgePreviewResult(null);
	      setEdgeDeployStage("idle");
	      setEdgeDeployError("");
	      setEdgeDeployDetailsOpen(false);
	      setVoiceInputStatus("");
	    }
	  }

	  function buildEdgeAppResumePrompt(slug: string, lastUserRequest: string) {
	    return [
	      `Continue the Build app for Edge workflow for slug "${slug || "<choose-a-slug>"}".`,
	      "",
	      slug ? `Create or update the local folder edge-apps/${slug} with link-app.yml, app source, and a dist build.` : "Create or update the local edge-apps/<app-slug> folder with link-app.yml, app source, and a dist build.",
	      "After the build succeeds, report the local folder path so I can click Preview app.",
	      "",
	      "Original request:",
	      lastUserRequest,
	    ].filter(Boolean).join("\n");
	  }

	  function seedEdgeAppResumePrompt(slug: string, message = "No generated app folder was found. Send the prepared build prompt to create it.") {
	    const lastUserRequest = [...(selectedSession?.messages ?? [])]
	      .reverse()
	      .find((candidate) => candidate.role === "user")?.content.trim() || selectedSession?.title || prompt.trim();
	    setDeployAppMode(true);
	    setEdgeDeploySlug(slug);
	    setEdgeDeployStage("failed");
	    setEdgeDeployError(message);
	    setVoiceInputStatus(message);
	    setPrompt(buildEdgeAppResumePrompt(slug, lastUserRequest));
	    window.setTimeout(() => composerTextareaRef.current?.focus(), 0);
	  }

	  function resumeEdgeAppBuild() {
	    const slug = normalizeEdgeDeploySlug(edgeDeploySlug) || inferEdgePreviewSlugFromSession(selectedSession) || suggestEdgeDeploySlugFromPrompt(selectedSession?.title || "");
	    const lastUserRequest = [...(selectedSession?.messages ?? [])]
	      .reverse()
	      .find((message) => message.role === "user")?.content.trim() || selectedSession?.title || "";
	    setDeployAppMode(true);
	    setEdgeDeployStage("idle");
	    setEdgeDeployError("Build prompt prepared. Press Send to create the local app files, then preview again.");
	    setVoiceInputStatus("Build prompt prepared. Press Send to create the local app files, then preview again.");
	    setPrompt(buildEdgeAppResumePrompt(slug, lastUserRequest));
	    window.setTimeout(() => composerTextareaRef.current?.focus(), 0);
	  }

	  async function previewLocalEdgeApp() {
	    if (edgeDeployBusy) return;
	    const slug = normalizeEdgeDeploySlug(edgeDeploySlug) || suggestEdgeDeploySlugFromPrompt(prompt || selectedSession?.title || "");
	    if (!slug) {
	      setEdgeDeployStage("needs_url");
	      setEdgeDeployError("Send an app request first, then preview the generated app.");
	      setVoiceInputStatus("Send an app request first, then preview the generated app.");
	      window.setTimeout(() => composerTextareaRef.current?.focus(), 0);
	      return;
	    }
	    setEdgeDeploySlug(slug);
	    setAssistantAttachMenuOpen(false);
	    setEdgeDeployBusy(true);
	    setEdgeDeployDetailsOpen(false);
	    setEdgeDeployStartedAt(Date.now());
	    setEdgeDeployTick(0);
	    setEdgeDeployStage("previewing");
	    setEdgeDeployError("");
	    setVoiceInputStatus(`Building a local preview from edge-apps/${slug}.`);
	    try {
	      const result = await linkApi.previewLocalEdgeApp({ slug });
	      if (result.canceled) {
	        setEdgeDeployStage("idle");
	        setVoiceInputStatus("Preview canceled.");
	        return;
	      }
	      setEdgePreviewResult(result);
	      setEdgeDeployResult(null);
	      setEdgeDeployDetailsOpen(false);
	      setEdgeDeployStage("preview_ready");
	      setEdgeDeployError("");
	      setVoiceInputStatus("Preview is ready. Test it here, then deploy when it looks right.");
	      if (result.url) {
	        onEdgePreviewReady({
	          url: result.url,
	          slug,
	          directory: result.directory,
	        });
	      }
	    } catch (error) {
	      const message = error instanceof Error ? error.message : "Local Edge app preview failed.";
	      if (/No generated app folder found/i.test(message)) {
	        seedEdgeAppResumePrompt(slug, `${message} Send the prepared build prompt to create it.`);
	      } else {
	        setEdgeDeployStage("failed");
	        setEdgeDeployError(message);
	        setVoiceInputStatus(message);
	      }
	    } finally {
	      setEdgeDeployBusy(false);
	    }
	  }

  async function previewEdgeAppFromMessage(message: ChatMessage) {
    if (edgeDeployBusy) return;
    const slug = inferEdgePreviewSlugFromText(`${message.content}\n${selectedSession?.title ?? ""}`) || inferEdgePreviewSlugFromSession(selectedSession);
    if (!slug) {
      setVoiceInputStatus("I could not find an app slug in this session. Turn on Build app and preview again.");
      return;
    }
    setDeployAppMode(true);
    setEdgeDeploySlug(slug);
    setEdgeDeployDetailsOpen(false);
    setEdgeDeployBusy(true);
    setEdgeDeployStartedAt(Date.now());
    setEdgeDeployTick(0);
    setEdgeDeployStage("previewing");
    setEdgeDeployError("");
    setVoiceInputStatus(`Reopening local preview for ${slug}.`);
    try {
      const result = await linkApi.previewLocalEdgeApp({ slug });
      if (result.canceled) {
        setEdgeDeployStage("idle");
        setVoiceInputStatus("Preview canceled.");
        return;
      }
      setEdgePreviewResult(result);
      setEdgeDeployResult(null);
      setEdgeDeployStage("preview_ready");
      setEdgeDeployError("");
      setVoiceInputStatus("Preview is ready. Test it here, then deploy when it looks right.");
      if (result.url) {
        onEdgePreviewReady({
          url: result.url,
          slug,
          directory: result.directory,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Local Edge app preview failed.";
      if (/No generated app folder found/i.test(message)) {
        seedEdgeAppResumePrompt(slug, `${message} Send the prepared build prompt to create it.`);
      } else {
        setEdgeDeployStage("failed");
        setEdgeDeployError(message);
        setVoiceInputStatus(message);
      }
    } finally {
      setEdgeDeployBusy(false);
    }
  }

	  async function deployLocalEdgeApp() {
	    if (edgeDeployBusy) return;
	    const slug = normalizeEdgeDeploySlug(edgeDeploySlug);
	    if (!slug) {
	      setEdgeDeployStage("needs_url");
	      setEdgeDeployError("Choose a URL slug before deploying.");
	      setVoiceInputStatus("Choose a URL slug before deploying.");
	      edgeDeploySlugInputRef.current?.focus();
	      return;
	    }
	    if (edgeSlugAvailability?.slug === slug && edgeSlugAvailability.status === "taken") {
	      setEdgeDeployStage("failed");
	      setEdgeDeployError(edgeSlugAvailability.message);
	      setVoiceInputStatus(edgeSlugAvailability.message);
	      return;
	    }
	    if (edgeSlugAvailability?.slug === slug && edgeSlugAvailability.canReplace && !edgeDeployReplaceExisting) {
	      setEdgeDeployStage("failed");
	      setEdgeDeployError("This URL is already yours. Enable replace existing URL to update it.");
	      setVoiceInputStatus("This URL is already yours. Enable replace existing URL to update it.");
	      return;
	    }
	    setEdgeDeploySlug(slug);
	    setAssistantAttachMenuOpen(false);
    setEdgeDeployBusy(true);
    setEdgeDeployStartedAt(Date.now());
    setEdgeDeployTick(0);
	    setEdgeDeployStage("deploying");
	    setEdgeDeployError("");
	    setVoiceInputStatus(`Deploying edge-apps/${slug} to https://${slug}.apidev.telnyx.com. If the generated folder is missing, Link will ask you to choose it.`);
	    try {
	      const result = await linkApi.deployLocalEdgeApp({ directory: edgePreviewResult?.directory ?? edgePreviewSurface?.directory, slug, replaceExisting: edgeDeployReplaceExisting });
	      if (result.canceled) {
	        setEdgeDeployStage("idle");
	        setVoiceInputStatus("Deploy canceled.");
	        return;
	      }
	      setEdgeDeployResult(result);
	      setEdgeDeployStage("deployed");
	      setEdgeDeployError("");
	      setVoiceInputStatus(result.url ? `Deployed to ${result.url}` : "Deploy finished without a URL.");
	      if (result.url) {
	        const createdAt = new Date().toISOString();
	        const deployMessage: ChatMessage = {
	          id: `edge-deploy-message-${Date.now()}`,
	          role: "assistant",
	          displayName: "Link",
	          createdAt,
	          content: `Edge app deployed: ${result.url}`,
	        };
	        const targetSessionId = selectedSession?.id;
	        if (targetSessionId) {
	          setChatSessions((current) => current.map((session) =>
	            session.id === targetSessionId
	              ? { ...session, updatedAt: createdAt, messages: [...session.messages, deployMessage] }
	              : session,
	          ));
	        }
	      }
	      await refresh();
	    } catch (error) {
	      const message = error instanceof Error ? error.message : "Local Edge app deploy failed.";
	      setEdgeDeployStage("failed");
	      setEdgeDeployError(message);
	      setVoiceInputStatus(message);
	    } finally {
	      setEdgeDeployBusy(false);
	    }
	  }

	  function openEdgeDeployUrl() {
	    if (!edgeDeployResult?.url) return;
	    window.open(edgeDeployResult.url, "_blank", "noopener,noreferrer");
	  }

	  const edgeDeployDisabled = edgeDeployBusy ||
	    busy ||
	    edgeSlugAvailability?.status === "taken" ||
	    edgeSlugAvailability?.status === "checking" ||
	    (edgeSlugAvailability?.canReplace && !edgeDeployReplaceExisting);

  function openAssistantMode(nextMode: "chat" | "phone") {
    setMode(nextMode);
    setCollapsed(false);
  }

  function openLiteLlmSettings() {
    setAssistantAttachMenuOpen(false);
    setView("settings");
  }

  async function toggleSelectedSessionPin() {
    if (!selectedSession || sessionActionBusy) return;
    setSessionActionBusy("pin");
    try {
      await updateChatSession({ sessionId: selectedSession.id, pinned: !selectedSession.pinnedAt });
      setAssistantSessionMenuOpen(false);
    } finally {
      setSessionActionBusy("");
    }
  }

  async function renameSelectedSession() {
    if (!selectedSession || sessionActionBusy) return;
    const nextTitle = window.prompt("Rename chat", selectedSession.title)?.trim();
    if (!nextTitle || nextTitle === selectedSession.title) {
      setAssistantSessionMenuOpen(false);
      return;
    }
    setSessionActionBusy("rename");
    try {
      const session = await updateChatSession({ sessionId: selectedSession.id, title: nextTitle });
      selectSession(session.id);
      setAssistantSessionMenuOpen(false);
    } finally {
      setSessionActionBusy("");
    }
  }

  async function archiveSelectedSession() {
    if (!selectedSession || sessionActionBusy) return;
    setSessionActionBusy("archive");
    try {
      await updateChatSession({ sessionId: selectedSession.id, archived: true });
      selectSession("");
      setAssistantSessionMenuOpen(false);
    } finally {
      setSessionActionBusy("");
    }
  }

  function openSelectedSessionInChat() {
    if (!selectedSession) return;
    setAssistantSessionMenuOpen(false);
    setView("chats");
    selectSession(selectedSession.id);
  }

  async function openAgentSelection() {
    setAssistantAttachMenuOpen(false);
    setMode("chat");
    selectSession("");
    setView("chats");
    setNewSessionDraftOpen(true);
    await refresh();
  }

  function runtimeActionForMessage(message: ChatMessage) {
    if (/No Agent Control Plane agent id was selected|Choose a hosted Hermes\/OpenClaw agent/i.test(message.content)) {
      return {
        label: chatAgents.length > 0 ? "Choose agent" : "Open Agents",
        onClick: () => void openAgentSelection(),
      };
    }
    if (/TELNYX_API_KEY|ANTHROPIC_API_KEY|LITELLM_API_KEY|model gateway|LiteLLM API key|Add your (?:Telnyx )?LiteLLM/i.test(message.content)) {
      return {
        label: "Open model settings",
        onClick: openLiteLlmSettings,
      };
    }
    return null;
  }

  if (collapsed) {
    return (
      <aside className="assistantPanel assistantPanelCollapsed" aria-label="Assistant">
        <div className="assistantRailTabs" aria-label="Assistant tabs">
          <button
            className="assistantRailButton"
            type="button"
            onClick={() => openAssistantMode("chat")}
            aria-label="Open Chat assistant"
            title="Chat"
          >
            <MessageSquare size={17} />
          </button>
          <button
            className="assistantRailButton"
            type="button"
            onClick={() => openAssistantMode("phone")}
            aria-label="Open Phone assistant"
            title="Phone"
          >
            <Phone size={17} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`assistantPanel ${mode === "phone" ? "phoneMode" : ""}`} aria-label="Assistant">
      <div className="assistantPanelTop">
        <div className="assistantTabs">
          <button className={mode === "chat" ? "selected" : ""} onClick={() => setMode("chat")}><MessageSquare size={15} />Chat</button>
          <button className={mode === "phone" ? "selected" : ""} onClick={() => setMode("phone")}><Phone size={15} />Phone</button>
        </div>
      </div>
      {mode === "chat" ? (
        <div className="assistantChatFrame">
          <div className="assistantChatBody">
            {newSessionDraftOpen && (
              <div className="assistantNewSessionCard">
                <div className="assistantNewSessionHeader">
                  <small>New session</small>
                  <button
                    className="iconButton"
                    type="button"
                    onClick={() => void refreshNewSessionBots()}
                    disabled={refreshingNewSessionBots}
                    aria-label="Refresh available bots"
                    title="Refresh available bots"
                  >
                    <RefreshCw size={14} className={refreshingNewSessionBots ? "spinning" : ""} />
                  </button>
                </div>
                <div className="assistantNewSessionFields">
                  <label>
                    <span>Name</span>
                    <input
                      value={newSessionTitleDraft}
                      onChange={(event) => setNewSessionTitleDraft(event.target.value)}
                      aria-label="New session name"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void startDraftedSession();
                        if (event.key === "Escape") {
                          setNewSessionDraftOpen(false);
                          setNewSessionTitleDraft("");
                        }
                      }}
                    />
                  </label>
                  <label className="newSessionBotField">
                    <span>Bot</span>
                    <div className="newSessionBotPicker" ref={newSessionBotPickerRef}>
                      <button
                        className="newSessionBotTrigger"
                        type="button"
                        onClick={() => setNewSessionBotPickerOpen((open) => !open)}
                        aria-expanded={newSessionBotPickerOpen}
                        aria-haspopup="listbox"
                        aria-label="New session bot"
                      >
                        <span>{selectedChatAgent ? chatAgentOptionLabel(selectedChatAgent) : "Select bot"}</span>
                        <ChevronDown size={18} aria-hidden="true" />
                      </button>
                      {newSessionBotPickerOpen && (
                        <div className="newSessionBotMenu" role="listbox" aria-label="New session bots">
                          <div className="newSessionBotMenuTools">
                            <label className="newSessionBotSearch">
                              <Search size={14} aria-hidden="true" />
                              <input
                                value={newSessionBotQuery}
                                onChange={(event) => setNewSessionBotQuery(event.target.value)}
                                placeholder="Search agents"
                                aria-label="Search agents"
                                autoFocus
                              />
                            </label>
                            <button
                              className="iconButton newSessionBotRefresh"
                              type="button"
                              onClick={() => void refreshNewSessionBots()}
                              disabled={refreshingNewSessionBots}
                              aria-label="Refresh bots"
                              title="Refresh bots"
                            >
                              <RefreshCw size={14} className={refreshingNewSessionBots ? "spinning" : ""} />
                            </button>
                          </div>
                          {renderNewSessionBotSection("MY AGENTS", myAgentOptions)}
                          {renderNewSessionBotSection("SELF-HOSTED", selfHostedAgentOptions)}
                          {renderNewSessionBotSection("TELNYX LINK APP", telnyxLinkAppOptions)}
                          {renderNewSessionBotSection("VOICE ASSISTANTS", voiceAssistantOptions)}
                          {renderNewSessionBotSection("A2A Bots", a2aBotOptions)}
                        </div>
                      )}
                    </div>
                  </label>
                  <label className="assistantSettingField assistantNewSessionSetting">
                    <span>Approval mode</span>
                    <select value={acceptMode} onChange={(event) => setAcceptMode(event.target.value as typeof acceptMode)}>
                      <option value="auto">Auto Accept</option>
                      <option value="review">Ask before actions</option>
                      <option value="manual">Manual only</option>
                    </select>
                  </label>
                  <div className="assistantSettingField assistantNewSessionSetting">
                    <span>Runtime route</span>
                    <select value={modelMode} onChange={(event) => setChatModelMode(event.target.value)} aria-label="Runtime route">
                      {aiModelRoutes.map((route) => (
                        <option key={route.id} value={route.id} disabled={!route.available}>
                          {route.label}{route.available ? "" : " (setup required)"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="assistantSettingField assistantNewSessionSetting">
                    <span>Data boundary</span>
                    <strong className={`dataBoundaryChip dataBoundaryChip-${selectedModelRoute?.dataBoundary ?? "local"}`}>
                      {dataBoundaryLabel(selectedModelRoute?.dataBoundary)}
                    </strong>
                  </div>
                </div>
                <div className="assistantNewSessionActions">
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => {
                      setNewSessionDraftOpen(false);
                      setNewSessionTitleDraft("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="button primary" type="button" onClick={() => void startDraftedSession()} disabled={creatingNewSession || !selectedChatAgent}>
                    <Plus size={15} />
                    {creatingNewSession ? "Starting" : "Start Session"}
                  </button>
                </div>
              </div>
            )}
            {selectedSession && !newSessionDraftOpen && (
              <div className="assistantSessionBar">
                <button className="assistantSessionBarTitle" type="button" onClick={openSelectedSessionInChat} title={selectedSession.title}>
                  <strong>{selectedSession.title}</strong>
                  <small>{selectedSession.pinnedAt ? "Pinned chat" : "Active chat"}</small>
                </button>
                <div className="assistantSessionMenuRoot" ref={assistantSessionMenuRef}>
                  <button
                    className="iconButton assistantSessionMenuTrigger"
                    type="button"
                    aria-label="Chat actions"
                    aria-haspopup="menu"
                    aria-expanded={assistantSessionMenuOpen}
                    title="Chat actions"
                    onClick={() => setAssistantSessionMenuOpen((open) => !open)}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {assistantSessionMenuOpen && (
                    <div className="assistantSessionMenu" role="menu" aria-label="Chat actions">
                      <button role="menuitem" type="button" onClick={() => void toggleSelectedSessionPin()} disabled={Boolean(sessionActionBusy)}>
                        <Pin size={15} />
                        <span>{selectedSession.pinnedAt ? "Unpin chat" : "Pin chat"}</span>
                      </button>
                      <button role="menuitem" type="button" onClick={() => void renameSelectedSession()} disabled={Boolean(sessionActionBusy)}>
                        <Pencil size={15} />
                        <span>Rename chat</span>
                      </button>
                      <button role="menuitem" type="button" onClick={() => void archiveSelectedSession()} disabled={Boolean(sessionActionBusy)}>
                        <ArchiveIcon size={15} />
                        <span>Archive chat</span>
                      </button>
                      <div className="assistantSessionMenuDivider" />
                      <button role="menuitem" type="button" onClick={openSelectedSessionInChat}>
                        <MessageSquare size={15} />
                        <span>Open in Chat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="assistantLog" ref={assistantLogRef}>
              {visibleSessionMessages.map((message) => (
                <div key={message.id} className={`assistantMessage ${message.role === "user" ? "you" : "link"}`}>
                  <strong>{message.role === "user" ? "You" : <SenderName name={assistantDisplayName(message.displayName ?? selectedChatAgent?.displayName)} />}</strong>
                  <p>{message.content}</p>
                  <MessageArtifacts artifacts={message.artifacts} openArtifact={openArtifact} />
                </div>
              ))}
              {busy && (
                <div className="assistantMessage link thinking" aria-live="polite">
                  <strong><SenderName name={assistantDisplayName(selectedChatAgent?.displayName)} /></strong>
                  <p>Working</p>
                </div>
              )}
              {selectedSession && !newSessionDraftOpen && visibleSessionMessages.length === 0 && !busy && (
                <div className="assistantEmpty assistantSessionEmpty" aria-live="polite">
                  <strong>{selectedSession.task ? "Task session ready" : "Session ready"}</strong>
                  <span>{selectedSession.title}</span>
                  {selectedSession.task && <small>Agent has not started this task yet.</small>}
                </div>
              )}
              {!selectedSession && !newSessionDraftOpen && <div className="assistantEmpty">Start with a prompt. Link stays local unless you choose a cloud route.</div>}
              <div ref={assistantLogEndRef} />
            </div>
            {docsSuggestionStatus && <div className="voiceInputStatus" aria-live="polite">{docsSuggestionStatus}</div>}
          </div>
          <div className="assistantChatDock">
            <div className="assistantComposer">
              <textarea
                ref={composerTextareaRef}
                value={prompt}
                placeholder={newSessionDraftOpen ? "Start the session to ask your agent..." : "Ask your agent..."}
                disabled={newSessionDraftOpen || busy}
                onChange={(event) => handleComposerPromptChange(event.target.value)}
                onKeyDown={(event) => {
                  if (assistantAttachMenuOpen && prompt.trimStart().startsWith("/") && event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    const firstSkill = filteredStarredSkills[0];
                    if (firstSkill) selectSessionSkill(firstSkill.name);
                    return;
                  }
                  if (shouldSubmitComposer(event)) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />
              {chatAttachments.length > 0 && (
                <div className="assistantAttachmentTray" aria-label="Attached files">
                  {chatAttachments.map((attachment) => (
                    <span className="assistantAttachmentChip" key={attachment.id} title={attachment.path}>
                      <FileText size={12} />
                      <span>{attachment.name}</span>
                      <small>{formatAttachmentSize(attachment.size)}</small>
                      <button
                        type="button"
                        aria-label={`Remove ${attachment.name}`}
                        onClick={() => setChatAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="assistantComposerActions">
                <div className="assistantComposerTools">
                  <div className="assistantAttachMenuRoot" ref={assistantAttachMenuRef}>
                    <button
                      className="iconButton assistantAttachTrigger"
                      title="Add context"
                      aria-label="Add context"
                      aria-expanded={assistantAttachMenuOpen}
                      onClick={() => {
                        refreshInstalledSkills();
                        setAssistantAttachMenuOpen((open) => !open);
                      }}
                    >
	                      <Plus size={16} />
	                    </button>
                    {assistantAttachMenuOpen && (
                      <div className="assistantAttachMenu" role="menu" aria-label="Add context">
                        <button role="menuitem" onClick={startNewSessionFromMenu}>
                          <MessageSquare size={16} />
                          <span>Start new session</span>
                        </button>
                        <div className="assistantAttachDivider" />
                        <label className="assistantAttachToggle">
                          <span><FileText size={16} />Make skill</span>
                          <input type="checkbox" checked={createSkillMode} onChange={(event) => toggleCreateSkillMode(event.target.checked)} />
                        </label>
                        {createSkillMode && (
                          <div className="assistantAttachSubOptions" role="radiogroup" aria-label="Skill destination">
                            <button
                              type="button"
                              className={skillPublishMode === "local" ? "selected" : ""}
                              role="radio"
                              aria-checked={skillPublishMode === "local"}
                              onClick={() => {
                                setSkillPublishMode("local");
                                setVoiceInputStatus("Skill mode will create a local skill for your agents in this app.");
                              }}
                            >
                              <span>Only my agents</span>
                              <small>Hosted locally in this Electron app.</small>
                            </button>
                            <button
                              type="button"
                              className={skillPublishMode === "repo" ? "selected" : ""}
                              role="radio"
                              aria-checked={skillPublishMode === "repo"}
                              onClick={() => {
                                setSkillPublishMode("repo");
                                setVoiceInputStatus("Skill mode will prepare a reviewable PR for team-telnyx/telnyx-clawdbot-skills.");
                              }}
                            >
                              <span>Publish to Telnyx</span>
                              <small>Create a PR to team-telnyx/telnyx-clawdbot-skills.</small>
                            </button>
                          </div>
                        )}
                        <label className="assistantAttachToggle">
                          <span><Upload size={16} />Build app</span>
                          <input type="checkbox" checked={deployAppMode} onChange={(event) => toggleDeployAppMode(event.target.checked)} />
                        </label>
                        {deployAppMode && (
                          <label className="assistantAttachToggle assistantAttachSubToggle">
                            <span><Grid2X2 size={16} />Use Link design system</span>
                            <input
                              type="checkbox"
                              checked={useLinkDesignSystemForSession}
                              onChange={(event) => setSessionDesignSystemPreference(event.target.checked)}
                            />
                          </label>
                        )}
                        <div className="assistantAttachDivider" />
                        <label className="assistantAttachToggle">
                          <span><SquareCheck size={16} />Plan mode</span>
                          <input type="checkbox" checked={planMode} onChange={(event) => setPlanMode(event.target.checked)} />
                        </label>
                        <label className="assistantAttachToggle">
                          <span><Target size={16} />Pursue goal</span>
                          <input type="checkbox" checked={pursueGoal} onChange={(event) => setPursueGoal(event.target.checked)} />
                        </label>
                        <div className="assistantAttachDivider" />
                        {lastAssistantMessage && (
                          <>
                            <small className="assistantAttachSectionLabel">Last response</small>
                            {messageHasEdgePreviewCandidate(lastAssistantMessage) && (
                              <button
                                role="menuitem"
                                onClick={() => {
                                  setAssistantAttachMenuOpen(false);
                                  void previewEdgeAppFromMessage(lastAssistantMessage);
                                }}
                              >
                                <MonitorPlay size={16} />
                                <span>Preview app</span>
                              </button>
                            )}
                            <button
                              role="menuitem"
                              onClick={() => {
                                setAssistantAttachMenuOpen(false);
                                seedToolFromMessage(lastAssistantMessage);
                              }}
                            >
                              <Zap size={16} />
                              <span>Make skill from last response</span>
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setAssistantAttachMenuOpen(false);
                                void saveMessageToArchive(lastAssistantMessage);
                              }}
                              disabled={archivingMessageId === lastAssistantMessage.id}
                            >
                              <ArchiveIcon size={16} />
                              <span>{archivingMessageId === lastAssistantMessage.id ? "Saving to archive" : "Save last response to archive"}</span>
                            </button>
                            {(() => {
                              const action = runtimeActionForMessage(lastAssistantMessage);
                              return action ? (
                                <button
                                  role="menuitem"
                                  onClick={() => {
                                    setAssistantAttachMenuOpen(false);
                                    action.onClick();
                                  }}
                                >
                                  <Settings size={16} />
                                  <span>{action.label}</span>
                                </button>
                              ) : null;
                            })()}
                            <div className="assistantAttachDivider" />
                          </>
                        )}
                        <button
                          role="menuitem"
                          className={assistantSkillPickerOpen ? "selected" : ""}
                          onClick={() => {
                            refreshInstalledSkills();
                            setAssistantSkillPickerOpen((open) => !open);
                            setAssistantSkillPickerQuery(skillCommandQuery);
                          }}
                        >
                          <Zap size={16} />
                          <span>Add skill</span>
                        </button>
                        <button role="menuitem" onClick={attachPhotosAndFiles}>
                          <Upload size={16} />
                          <span>Add photos & files</span>
                        </button>
                        {assistantSkillPickerOpen && (
                          <div className="assistantSkillPicker" role="dialog" aria-label="Add skill to session">
                            <label className="assistantSkillSearch">
                              <Search size={14} aria-hidden="true" />
                              <input
                                value={assistantSkillPickerQuery}
                                onChange={(event) => setAssistantSkillPickerQuery(event.target.value)}
                                placeholder="Search skills"
                                autoFocus
                              />
                            </label>
                            <div className="assistantSkillPickerList">
                              {groupedStarredSkills.map(([groupName, rows]) => (
                                <section key={groupName} className="assistantSkillPickerSection">
                                  <small>{groupName}</small>
                                  {rows.map((row) => (
                                    <button
                                      key={row.name}
                                      role="menuitem"
                                      className={selectedSessionSkillName === row.name ? "selected" : ""}
                                      onClick={() => selectSessionSkill(row.name)}
                                      type="button"
                                    >
                                      <Zap size={15} />
                                      <span>
                                        <strong>{row.name}</strong>
                                        <small>{row.description}</small>
                                      </span>
                                    </button>
                                  ))}
                                </section>
                              ))}
                              {filteredStarredSkills.length === 0 && (
                                <div className="assistantSkillEmpty">
                                  {starredSkillRows.length === 0 ? "No starred skills yet." : "No matching skills."}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
	                  </div>
                  <div className="assistantRuntimeMenuRoot" ref={assistantRuntimeMenuRef}>
                    <button
                      className="iconButton assistantRuntimeTrigger"
                      type="button"
                      title="Chat settings"
                      aria-label="Chat settings"
                      aria-expanded={assistantRuntimeMenuOpen}
                      onClick={() => setAssistantRuntimeMenuOpen((open) => !open)}
                    >
                      <Settings size={16} />
                    </button>
                    {assistantRuntimeMenuOpen && (
                      <div className="assistantRuntimeMenu" role="dialog" aria-label="Chat settings">
                        <div className="assistantRuntimeMenuHeader">
                          <strong>Chat settings</strong>
                          <span className={`dataBoundaryChip dataBoundaryChip-${selectedModelRoute?.dataBoundary ?? "local"}`}>
                            {dataBoundaryLabel(selectedModelRoute?.dataBoundary)}
                          </span>
                        </div>
                        <div className="assistantRuntimeBar" aria-label="Active model route">
                          <label>
                            <span><SlidersHorizontal size={14} aria-hidden="true" />Runtime route</span>
                            <select value={modelMode} onChange={(event) => setChatModelMode(event.target.value)} aria-label="Model route">
                              {aiModelRoutes.map((route) => (
                                <option key={route.id} value={route.id} disabled={!route.available}>
                                  {route.label}{route.available ? "" : " (setup required)"}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            className="button secondary assistantRuntimeRefresh"
                            type="button"
                            onClick={() => void refreshModelCatalog()}
                            disabled={refreshingModelCatalog}
                          >
                            <RefreshCw size={14} className={refreshingModelCatalog ? "spinning" : ""} />
                            Refresh models
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
	                </div>
	                <div className="assistantComposerSubmit">
                  <button
                    className={`iconButton voiceInputButton ${voiceListening ? "active" : ""}`}
                    title={voiceListening ? "Stop voice input" : "Start voice input"}
                    aria-label={voiceListening ? "Stop voice input" : "Start voice input"}
                    aria-pressed={voiceListening}
                    onClick={toggleVoiceInput}
                  >
                    <Mic size={17} />
                  </button>
                  <button className={`assistantSendButton ${busy ? "thinking" : ""}`} aria-label={busy ? "Stop response" : "Send"} title={busy ? "Stop response" : "Send"} onClick={busy ? stopSend : send} disabled={!busy && ((!prompt.trim() && chatAttachments.length === 0) || newSessionDraftOpen)}>
                    {busy ? <Square size={15} fill="currentColor" /> : <ArrowUp size={20} />}
                  </button>
                </div>
              </div>
	              {selectedChatSkill && (
	                <div className="assistantActiveSkill" aria-live="polite">
	                  <Zap size={12} />
                  <span>{selectedChatSkill.name}</span>
                  <button type="button" aria-label={`Stop using ${selectedChatSkill.name}`} onClick={clearSessionSkill}>
                    <X size={12} />
	                  </button>
	                </div>
	              )}
	              {deployAppMode && !edgePreviewSurface && (
	                <div className="assistantDeployCard" aria-live="polite">
	                  <div>
	                    <strong>Build app for Edge</strong>
	                    <small>{edgeDeployResult?.url ?? `Send a normal app request. Link adds Edge setup in the background, checks whether the URL is free, lets you test the generated app here, then deploys when you approve it.`}</small>
	                  </div>
	                  <label className="assistantDesignSystemOption">
	                    <span>
	                      <Grid2X2 size={14} />
	                      <strong>Use Link design system</strong>
	                      <small>Session preference for generated apps.</small>
	                    </span>
	                    <input
	                      type="checkbox"
	                      checked={useLinkDesignSystemForSession}
	                      onChange={(event) => setSessionDesignSystemPreference(event.target.checked)}
	                    />
	                  </label>
	                  <div className={`assistantDeployStatus ${edgeDeployStage}`}>
	                    {edgeDeployBusy && <span className="assistantDeploySpinner" aria-hidden="true" />}
	                    <span>{edgeDeployError || edgeDeployStageLabel(edgeDeployStage, normalizeEdgeDeploySlug(edgeDeploySlug))}</span>
	                  </div>
	                  {edgeDeployStage === "failed" && /prepared build prompt|No generated app folder found/i.test(edgeDeployError) && (
	                    <div className="assistantDeployRecovery" aria-live="polite">
	                      The composer has a recovery prompt ready. Press Send to create the local app folder, then preview again.
	                    </div>
	                  )}
	                  {edgeDeployBusy && (
	                    <div className="assistantDeployProgress" aria-live="polite">
	                      <div className="assistantDeployProgressTrack" aria-hidden="true">
	                        <span style={{ width: `${edgeDeployProgressPercent(edgeDeployStartedAt, edgeDeployTick)}%` }} />
	                      </div>
	                      <div className="assistantDeployProgressMeta">
	                        <span>{edgeDeployProgressStepLabel(edgeDeployStartedAt, edgeDeployTick)}</span>
	                        <span>{edgeDeployElapsedLabel(edgeDeployStartedAt, edgeDeployTick)}</span>
	                      </div>
	                    </div>
	                  )}
	                  {edgePreviewResult?.directory && edgeDeployDetailsOpen && (
	                    <>
	                      <label className="assistantDeployField">
	                        <span>Deployment URL</span>
	                        <div className="assistantDeployUrlInput">
	                          <span>https://</span>
	                          <input
	                            ref={edgeDeploySlugInputRef}
	                            value={edgeDeploySlug}
	                            onChange={(event) => {
	                              const nextSlug = normalizeEdgeDeploySlug(event.target.value);
	                              setEdgeDeploySlug(nextSlug);
	                              setEdgeDeployResult(null);
	                              if (edgeDeployStage === "needs_url") setEdgeDeployStage("preview_ready");
	                            }}
	                            placeholder="my-work-app"
	                            disabled={edgeDeployBusy}
	                          />
	                          <span>.apidev.telnyx.com</span>
	                        </div>
	                      </label>
	                      {edgeSlugAvailability && (
	                        <div className={`assistantDeployAvailability ${edgeSlugAvailability.status}`}>
	                          {edgeSlugAvailability.message}
	                        </div>
	                      )}
	                      {edgeSlugAvailability?.canReplace && (
	                        <label className="assistantDeployReplace">
	                          <input
	                            type="checkbox"
	                            checked={edgeDeployReplaceExisting}
	                            onChange={(event) => setEdgeDeployReplaceExisting(event.target.checked)}
	                            disabled={edgeDeployBusy}
	                          />
	                          <span>Replace my existing app using this URL slug</span>
	                        </label>
	                      )}
	                    </>
	                  )}
	                  <div className="assistantDeployActions">
	                    <button
	                      type="button"
	                      className="button secondary"
	                      onClick={previewLocalEdgeApp}
	                      disabled={edgeDeployBusy || busy}
	                    >
	                      {edgeDeployBusy && edgeDeployStage === "previewing" ? <span className="assistantDeployButtonSpinner" aria-hidden="true" /> : <MonitorPlay size={14} />}
	                      {edgeDeployBusy && edgeDeployStage === "previewing" ? "Building preview" : edgePreviewResult?.url ? "Preview again" : "Preview app"}
	                    </button>
	                    {edgePreviewResult?.directory && !edgeDeployDetailsOpen && (
	                      <button
	                        type="button"
	                        className="button primary"
	                        onClick={() => setEdgeDeployDetailsOpen(true)}
	                        disabled={edgeDeployBusy || busy}
	                      >
	                        <Upload size={14} />
	                        Continue to deploy
	                      </button>
	                    )}
	                    {edgeDeployStage === "failed" && /prepared build prompt|No generated app folder found/i.test(edgeDeployError) && (
	                      <button
	                        type="button"
	                        className="button primary"
	                        onClick={resumeEdgeAppBuild}
	                        disabled={edgeDeployBusy || busy}
	                      >
	                        <MessageSquare size={14} />
	                        Prepare build prompt
	                      </button>
	                    )}
	                    {edgePreviewResult?.directory && edgeDeployDetailsOpen && (
	                      <button
	                        type="button"
	                        className="button primary"
	                        onClick={deployLocalEdgeApp}
	                        disabled={edgeDeployDisabled}
	                      >
	                        {edgeDeployBusy ? <span className="assistantDeployButtonSpinner" aria-hidden="true" /> : <Upload size={14} />}
	                        {edgeDeployBusy && edgeDeployStage === "deploying" ? edgeDeployButtonBusyLabel(edgeDeployStage) : "Deploy to dev Edge"}
	                      </button>
	                    )}
	                    {edgeDeployResult?.url && (
	                      <button type="button" className="button secondary" onClick={openEdgeDeployUrl}>
	                        <ExternalLink size={14} />
	                        Open URL
	                      </button>
	                    )}
	                  </div>
		                </div>
	              )}
	              {voiceInputStatus && !deployAppMode && <div className="voiceInputStatus" aria-live="polite">{voiceInputStatus}</div>}
            </div>
          </div>
        </div>
      ) : (
        <LinkSoftphone
          config={activeDialerConfig}
          linkedPhoneNumber={linkedPhoneNumber}
          setLinkedPhoneNumber={setLinkedPhoneNumber}
          telnyxApiReady={telnyxApiReady}
          setView={setView}
          openPhoneContacts={openPhoneContacts}
          initialDialNumber={phoneDialTarget}
          connectors={connectors}
        />
      )}
    </aside>
  );
}

function SkillsView({ skills }: { skills: SkillMetadata[] }) {
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [result, setResult] = useState("");
  const filtered = skills.filter((skill) => `${skill.name} ${skill.description} ${skill.team}`.toLowerCase().includes(query.toLowerCase()));

  async function runSkill(skill: SkillMetadata) {
    setSelectedSkill(skill.name);
    setResult("Running skill...");
    try {
      const response = await linkApi.runSkill(skill.name);
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Skill run failed.");
    }
  }

  return (
    <section className="content skillsView">
      <header className="pageHeader">
        <div>
          <h1>Skills</h1>
        </div>
      </header>
      <div className="explorerSearch compactSearch">
        <Search size={16} />
        <input value={query} placeholder="Search skills..." onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="skillCatalog">
        {filtered.slice(0, 40).map((skill) => (
          <button key={skill.name} className={`skillCard ${selectedSkill === skill.name ? "selected" : ""}`} onClick={() => void runSkill(skill)}>
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

function readInstalledAgentSkillKeys() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem("telnyx-link-installed-agent-skills") ?? "[]");
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

const agentAppearanceStorageKey = "telnyx-link-agent-appearances";
const systemAgentEmojis = ["🤖", "🧠", "⚡", "🛠️", "📡", "🧭", "🧪", "💬", "📊", "🛡️", "🚀", "✨"];

function readAgentAppearances(): Record<string, AgentAppearance> {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(agentAppearanceStorageKey) ?? "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    const appearances: Record<string, AgentAppearance> = {};
    for (const [id, value] of Object.entries(stored)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const candidate = value as Partial<AgentAppearance>;
      if ((candidate.kind === "emoji" || candidate.kind === "image") && typeof candidate.value === "string" && candidate.value) {
        appearances[id] = { kind: candidate.kind, value: candidate.value };
      }
    }
    return appearances;
  } catch {
    return {};
  }
}

function agentInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AI";
}

function AgentAvatar({ name, appearance }: { name: string; appearance?: AgentAppearance }) {
  if (appearance?.kind === "image") {
    return (
      <div className="agentAvatar imageAvatar">
        <img src={appearance.value} alt="" />
      </div>
    );
  }
  if (appearance?.kind === "emoji") {
    return <div className="agentAvatar emojiAvatar" aria-hidden="true">{appearance.value}</div>;
  }
  return <div className="agentAvatar">{agentInitials(name)}</div>;
}

function skillBuilderToolsList(value: string) {
  const tools = value.split(",").map((tool) => tool.trim()).filter(Boolean);
  return tools.length > 0 ? tools.map((tool) => `  - ${tool}`).join("\n") : "  - none";
}

function toolStudioToolList(value: string) {
  return value.split(/[\n,]/).map((tool) => tool.trim()).filter(Boolean);
}

function toolStudioChecklist(draft: ToolStudioDraft) {
  return [
    "Confirm the workflow has repeated at least twice or is expected to recur.",
    "Verify the source of truth and conflict-resolution rule are explicit.",
    "Run the test fixture in sandbox or mocked mode before sharing.",
    draft.approvalRequired ? "Confirm the human approval gate appears before any public, external, write, or destructive action." : "Confirm this remains read-only or internal-only before disabling approval.",
    draft.artifactType === "skill" ? "Install on one active bot before publishing beyond the owner." : "Promote through the managed publisher or MCP review path before production use.",
  ];
}

function buildToolStudioMarkdown(draft: ToolStudioDraft) {
  const skillName = draft.name.trim() || "Untitled Skill";
  const description = draft.description.trim() || "Describe what this skill should help the agent do.";
  const owner = draft.owner.trim() || "TBD";
  const team = draft.team.trim() || "TBD";
  const tools = skillBuilderToolsList(draft.toolsRequired);
  return [
    "---",
    `name: ${skillName}`,
    `description: ${description}`,
    `owner: ${owner}`,
    `team: ${team}`,
    `audience: ${draft.audience.trim() || "Telnyx employees"}`,
    `artifact_type: ${draft.artifactType}`,
    `risk_level: ${draft.riskLevel}`,
    "tools_required:",
    tools,
    `customer_safe: ${draft.customerSafe}`,
    `approval_required: ${draft.approvalRequired}`,
    `visibility: ${draft.visibility}`,
    `version: ${draft.version.trim() || "1.0.0"}`,
    "---",
    "",
    "## When to use it",
    draft.whenToUse.trim() || "TBD",
    "",
    "## Inputs needed",
    draft.inputsNeeded.trim() || "TBD",
    "",
    "## Source of truth",
    draft.sourceOfTruth.trim() || "TBD",
    "",
    "## Workflow steps",
    draft.workflowSteps.trim() || "TBD",
    "",
    "## Repeated checks",
    draft.repeatedChecks.trim() || "TBD",
    "",
    "## Expected output format",
    draft.expectedOutput.trim() || "TBD",
    "",
    "## Human checkpoints",
    draft.humanCheckpoints.trim() || "TBD",
    "",
    "## Test fixture",
    draft.testFixture.trim() || "TBD",
    "",
    "## Safety notes",
    draft.safetyNotes.trim() || "TBD",
  ].join("\n");
}

function buildToolStudioManifest(draft: ToolStudioDraft): ToolStudioManifestInput {
  return {
    name: draft.name.trim() || "Untitled Tool",
    description: draft.description.trim() || "Reusable Link tool created from a repeated bot workflow.",
    owner: draft.owner.trim() || "TBD",
    team: draft.team.trim() || "TBD",
    audience: draft.audience.trim() || "Telnyx employees",
    artifactType: draft.artifactType,
    inputs: draft.inputsNeeded.trim() || "User prompt or selected chat context.",
    outputs: draft.expectedOutput.trim() || "Reviewable bot output.",
    toolsRequired: toolStudioToolList(draft.toolsRequired),
    riskLevel: draft.riskLevel,
    customerSafe: draft.customerSafe,
    approvalRequired: draft.approvalRequired || draft.customerSafe || draft.riskLevel === "high" || draft.artifactType !== "skill",
    sourceOfTruth: draft.sourceOfTruth.trim() || "Git-backed Link tool definition.",
    repeatedChecks: draft.repeatedChecks.trim() || "Run the included test fixture before sharing.",
    humanCheckpoints: draft.humanCheckpoints.trim() || "Human owner reviews public or destructive actions.",
    testFixture: draft.testFixture.trim() || "Use the latest real chat request as the fixture.",
    reviewers: splitInputList(draft.reviewers),
    version: draft.version.trim() || "1.0.0",
    visibility: draft.visibility,
    skillMarkdown: buildToolStudioMarkdown(draft),
    checklist: toolStudioChecklist(draft),
  };
}

function buildToolStudioPrompt(draft: ToolStudioDraft, agentName?: string) {
  const manifest = buildToolStudioManifest(draft);
  return [
    `Tool Studio session: work with ${agentName ?? "my bot"} to refine a review-ready Link tool.`,
    "Ask concise follow-up questions only where the manifest is incomplete, then produce the final tool package, validation checklist, and test fixture.",
    "Default output is a SKILL.md workflow. Only promote to MCP or Link app if the workflow needs executable code, API schemas, or a UI/runtime surface.",
    "",
    "Tool manifest:",
    "```json",
    JSON.stringify({ ...manifest, skillMarkdown: undefined }, null, 2),
    "```",
    "",
    "Generated SKILL.md:",
    "```markdown",
    manifest.skillMarkdown,
    "```",
  ].join("\n");
}

function AgentsView({
  agents,
  skills,
  refresh,
  setView,
  bookmarkedAgentIds,
  setBookmarkedAgentIds,
  activeAgent,
  setActiveAgent,
  openAgentSetup,
  startSkillBuilderChat,
}: {
  agents: AgentSummary[];
  skills: SkillMetadata[];
  refresh: () => Promise<void>;
  setView: (view: ViewId) => void;
  bookmarkedAgentIds: string[];
  setBookmarkedAgentIds: (ids: string[] | ((current: string[]) => string[])) => void;
  activeAgent: ActiveAgentSelection | null;
  setActiveAgent: (agent: ActiveAgentSelection | null) => void;
  openAgentSetup: () => void;
  startSkillBuilderChat: (prompt: string) => Promise<void>;
}) {
  type AgentViewTab = "personal" | "squads" | "telnyx" | "skills";
  const [tab, setTab] = useState<"personal" | "squads" | "telnyx" | "skills">("personal");
  const [sectionFilter, setSectionFilter] = useState<"all" | "you" | "team">("all");
  const [query, setQuery] = useState("");
  const [squadFilter, setSquadFilter] = useState("all");
  const [botSkillTeamFilter, setBotSkillTeamFilter] = useState("all");
  const [skillTeamFilter, setSkillTeamFilter] = useState("all");
  const [hostedAgentFilter, setHostedAgentFilter] = useState("all");
  const [sortMode, setSortMode] = useState<"az" | "za" | "status">("az");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [acpAuth, setAcpAuth] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [acpBusy, setAcpBusy] = useState(false);
  const [hostedAgents, setHostedAgents] = useState<HostedAgentSummary[]>([]);
  const [agentError, setAgentError] = useState("");
  const [agentLoadRecoverable, setAgentLoadRecoverable] = useState(false);
  const [agentDrafts, setAgentDrafts] = useState<Record<string, string>>({});
  const [sendingAgentId, setSendingAgentId] = useState("");
  const [agentMessageStatus, setAgentMessageStatus] = useState("");
  const [expandedAgentIds, setExpandedAgentIds] = useState<string[]>([]);
  const [selectedAgentDetailId, setSelectedAgentDetailId] = useState("");
  const [selectedAgentDetailTab, setSelectedAgentDetailTab] = useState<"overview" | "capabilities" | "settings">("overview");
  const [expandedSquad, setExpandedSquad] = useState("");
  const [expandedSkillNames, setExpandedSkillNames] = useState<string[]>([]);
  const [skillMarkdownByName, setSkillMarkdownByName] = useState<Record<string, SkillMarkdownLoadState>>({});
  const [botSkillResult, setBotSkillResult] = useState("");
  const [agentAppearances, setAgentAppearances] = useState<Record<string, AgentAppearance>>(() => readAgentAppearances());
  const [agentAppearanceOpenId, setAgentAppearanceOpenId] = useState("");
  const [localSkillStatsById, setLocalSkillStatsById] = useState<Record<string, Partial<SkillMetadata>>>({});
  const [createToolOpen, setCreateToolOpen] = useState(false);
  const [toolStudioStatus, setToolStudioStatus] = useState("");
  const [installedSkillKeys, setInstalledSkillKeys] = useState<string[]>(() => readInstalledAgentSkillKeys());
  const [toolDraft, setToolDraft] = useState<ToolStudioDraft>({
    name: "",
    description: "",
    owner: "",
    team: "",
    audience: "Telnyx employees",
    artifactType: "skill",
    riskLevel: "medium",
    toolsRequired: "",
    customerSafe: false,
    approvalRequired: false,
    whenToUse: "",
    inputsNeeded: "",
    sourceOfTruth: "",
    workflowSteps: "",
    repeatedChecks: "",
    expectedOutput: "",
    humanCheckpoints: "",
    safetyNotes: "",
    reviewers: "",
    testFixture: "",
    visibility: "squad",
    version: "1.0.0",
  });
  const isAcpReady = Boolean(acpAuth?.ready);
  const bookmarkedAgentIdSet = useMemo(() => new Set(bookmarkedAgentIds), [bookmarkedAgentIds]);
  const squads = useMemo(() => {
    return [...new Set(agents.map((agent) => agent.squad).filter((squad): squad is string => Boolean(squad)))].sort((left, right) =>
      left.localeCompare(right),
    );
  }, [agents]);
  const tones: WikiKit["tone"][] = ["blue", "orange", "teal", "pink", "purple", "green"];
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
        mastered: squadSkills.filter((skill) => !skill.approvalRequired).length,
        total: squadSkills.length,
        tone: tones[index % tones.length],
        skills: squadSkills.sort((left, right) => left.name.localeCompare(right.name)),
      }));
  }, [skills]);
  const filteredSquadKits = useMemo(() => {
    const term = query.trim().toLowerCase();
    return squadKits.map((kit) => {
      const filteredSkills = term
        ? kit.skills.filter((skill) => `${skill.name} ${skill.description} ${skill.team} ${skill.product ?? ""}`.toLowerCase().includes(term))
        : kit.skills;
      return { ...kit, skills: filteredSkills };
    }).filter((kit) => (botSkillTeamFilter === "all" || kit.name === botSkillTeamFilter) && (kit.skills.length > 0 || kit.name.toLowerCase().includes(term)))
      .sort((left, right) => sortMode === "za" ? right.name.localeCompare(left.name) : left.name.localeCompare(right.name));
  }, [botSkillTeamFilter, query, sortMode, squadKits]);
  const botSkillTeams = useMemo(() => {
    return [...new Set(skills.map((skill) => skill.team).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }, [skills]);
  const userSquads = useMemo(() => {
    const userSquadSet = new Set<string>();
    const activeDirectoryAgent = activeAgent ? agents.find((agent) => agent.id === activeAgent.id) : undefined;
    if (activeDirectoryAgent?.squad) userSquadSet.add(activeDirectoryAgent.squad);
    for (const agent of agents) {
      if (bookmarkedAgentIds.includes(agent.id) && agent.squad) userSquadSet.add(agent.squad);
    }
    if (activeAgent) {
      for (const key of installedSkillKeys) {
        if (!key.startsWith(`${activeAgent.id}:`)) continue;
        const skillName = key.slice(activeAgent.id.length + 1);
        const skill = skills.find((item) => item.name === skillName);
        if (skill?.team) userSquadSet.add(skill.team);
      }
    }
    return [...userSquadSet].sort((left, right) => left.localeCompare(right));
  }, [activeAgent, agents, bookmarkedAgentIds, installedSkillKeys, skills]);
  const filteredAgents = useMemo(() => {
    const term = query.trim().toLowerCase();
    const results = agents.filter((agent) => {
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
    return sortAgents(results, sortMode);
  }, [agents, query, squadFilter, sortMode]);
  const squadAgentGroups = useMemo(() => {
    const grouped = new Map<string, AgentSummary[]>();
    for (const agent of filteredAgents) {
      const squad = agent.squad || formatSourceLabel(agent.source);
      grouped.set(squad, [...(grouped.get(squad) ?? []), agent]);
    }
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [filteredAgents]);
  const hostedAgentStatuses = useMemo(() => {
    return [...new Set([...hostedAgents, ...agents].map((agent) => agent.status).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }, [agents, hostedAgents]);
  const filteredHostedAgents = useMemo(() => {
    const term = query.trim().toLowerCase();
    const results = hostedAgents.filter((agent) => {
      const matchesStatus = hostedAgentFilter === "all" || agent.status === hostedAgentFilter;
      const searchable = [agent.displayName, agent.description, agent.type, agent.status].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!term || searchable.includes(term));
    });
    return sortHostedAgents(results, sortMode);
  }, [hostedAgentFilter, hostedAgents, query, sortMode]);
  const agentDirectorySections = useMemo(() => {
    const grouped = new Map<"you" | "team", Array<{ id: string; section: "you" | "team"; category: string; agent: HostedAgentSummary | AgentSummary }>>([
      ["you", []],
      ["team", []],
    ]);
    if (sectionFilter === "all" || sectionFilter === "you") {
      for (const agent of filteredHostedAgents) {
        grouped.get("you")?.push({ id: `hosted:${agent.id}`, section: "you", category: "Personal", agent });
      }
    }
    if (sectionFilter === "all" || sectionFilter === "team") {
      for (const agent of filteredAgents) {
        grouped.get("team")?.push({ id: `directory:${agent.id}`, section: "team", category: agent.squad || formatSourceLabel(agent.source), agent });
      }
    }
    return [
      { id: "you" as const, title: "You", rows: grouped.get("you") ?? [] },
      { id: "team" as const, title: "Team", rows: grouped.get("team") ?? [] },
    ].filter((section) => sectionFilter === "all" || section.id === sectionFilter);
  }, [filteredAgents, filteredHostedAgents, sectionFilter]);
  const installedSkillRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = installedSkillKeys.map((key) => {
      const [agentId, ...skillNameParts] = key.split(":");
      const skillName = skillNameParts.join(":");
      const skill = skills.find((item) => item.name === skillName);
      const agent = hostedAgents.find((item) => item.id === agentId) ?? agents.find((item) => item.id === agentId);
      return {
        key,
        agentId,
        skillName,
        skill,
        agentName: agent?.displayName ?? activeAgent?.displayName ?? "Agent",
        team: skill?.team ?? "Unassigned",
        description: skill?.description ?? "Installed from Wiki.",
      };
    });
    return rows
      .filter((row) => skillTeamFilter === "all" || row.team === skillTeamFilter)
      .filter((row) => !term || `${row.skillName} ${row.description} ${row.team} ${row.agentName}`.toLowerCase().includes(term))
      .sort((left, right) => left.skillName.localeCompare(right.skillName));
  }, [activeAgent?.displayName, agents, hostedAgents, installedSkillKeys, query, skillTeamFilter, skills]);
  const installedSkillTeams = useMemo(() => {
    return [...new Set(installedSkillRows.map((row) => row.team).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  }, [installedSkillRows]);
  const toolStudioManifest = buildToolStudioManifest(toolDraft);
  const toolStudioPrompt = buildToolStudioPrompt(toolDraft, activeAgent?.displayName);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(agentAppearanceStorageKey, JSON.stringify(agentAppearances));
  }, [agentAppearances]);

  function setAgentEmoji(agentId: string, emoji: string) {
    setAgentAppearances((current) => ({ ...current, [agentId]: { kind: "emoji", value: emoji } }));
  }

  function resetAgentAppearance(agentId: string) {
    setAgentAppearances((current) => {
      const next = { ...current };
      delete next[agentId];
      return next;
    });
  }

  function uploadAgentImage(agentId: string, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAgentMessageStatus("Choose an image file for the agent avatar.");
      return;
    }
    if (file.size > 512 * 1024) {
      setAgentMessageStatus("Agent avatar images must be 512 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setAgentMessageStatus("Unable to read that image.");
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value.startsWith("data:image/")) {
        setAgentMessageStatus("Choose a valid image file for the agent avatar.");
        return;
      }
      setAgentAppearances((current) => ({ ...current, [agentId]: { kind: "image", value } }));
      setAgentMessageStatus("Agent image updated.");
    };
    reader.readAsDataURL(file);
  }

  async function refreshAgentControlPlane() {
    const nextAuth = await linkApi.getAgentControlPlaneAuthStatus();
    setAcpAuth(nextAuth);
    if (!nextAuth.ready) {
      setHostedAgents([]);
      return;
    }
    try {
      setAgentError("");
      setAgentLoadRecoverable(false);
      const hosted = await linkApi.listHostedAgents();
      setHostedAgents(hosted);
      if (!activeAgent && hosted[0]) setActiveAgent({ id: hosted[0].id, displayName: hosted[0].displayName });
    } catch (err) {
      setHostedAgents([]);
      setAgentError(agentControlPlaneLoadMessage(err));
      setAgentLoadRecoverable(true);
    }
  }

  async function refreshAgentsThenAll() {
    await refreshAgentControlPlane();
    await refresh();
  }

  useEffect(() => {
    void refreshAgentControlPlane();
  }, []);

  useEffect(() => {
    setExpandedSquad("");
    setExpandedSkillNames([]);
    setBotSkillResult("");
  }, []);

  async function signInAgentControlPlane() {
    setAcpBusy(true);
    setAgentError("");
    setAgentLoadRecoverable(false);
    try {
      setAcpAuth(await linkApi.signInAgentControlPlane());
      await refresh();
      await refreshAgentControlPlane();
    } finally {
      setAcpBusy(false);
    }
  }

  async function openAddAgentFlow() {
    setAgentError("");
    setAgentLoadRecoverable(false);
    openAgentSetup();
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

  function toggleBookmark(agentId: string) {
    setBookmarkedAgentIds((current) =>
      current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId],
    );
  }

  function toggleAgentDetails(agentId: string) {
    setExpandedAgentIds((current) =>
      current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId],
    );
  }

  function openAgentDetail(rowId: string) {
    setSelectedAgentDetailId(rowId);
    setSelectedAgentDetailTab("overview");
  }

  function toggleSquadKit(kitId: string) {
    const kit = filteredSquadKits.find((item) => item.id === kitId);
    if (expandedSquad !== kitId) {
      for (const skill of kit?.skills ?? []) void loadBotSkillMarkdown(skill.name);
    }
    setExpandedSquad((current) => current === kitId ? "" : kitId);
    setBotSkillResult("");
  }

  function toggleBotSkillDetails(skillName: string) {
    if (!expandedSkillNames.includes(skillName)) void loadBotSkillMarkdown(skillName);
    setExpandedSkillNames((current) =>
      current.includes(skillName) ? current.filter((item) => item !== skillName) : [...current, skillName],
    );
  }

  async function loadBotSkillMarkdown(skillName: string) {
    const current = skillMarkdownByName[skillName];
    if (current?.status === "loading" || current?.status === "ready") return;
    setSkillMarkdownByName((items) => ({ ...items, [skillName]: { status: "loading" } }));
    try {
      const markdown = await linkApi.getSkillMarkdown(skillName);
      setSkillMarkdownByName((items) => ({ ...items, [skillName]: { status: "ready", result: markdown } }));
    } catch (error) {
      setSkillMarkdownByName((items) => ({
        ...items,
        [skillName]: { status: "error", message: error instanceof Error ? error.message : "Unable to load SKILL.md." },
      }));
    }
  }

  function skillWithLocalStats(skill: SkillMetadata): SkillMetadata {
    const skillId = skill.skillId ?? rendererSkillRegistryId(skill);
    return {
      ...skill,
      ...(localSkillStatsById[skillId] ?? {}),
      skillId,
    };
  }

  function updateSkillStats(stats: {
    skillId: string;
    starCount: number;
    installCount: number;
    downloadCount: number;
    runCount: number;
    viewCount: number;
    starredByActor: boolean;
    installedByActor: boolean;
    updatedAt: string;
  }) {
    setLocalSkillStatsById((current) => ({
      ...current,
      [stats.skillId]: {
        skillId: stats.skillId,
        starCount: stats.starCount,
        installCount: stats.installCount,
        downloadCount: stats.downloadCount,
        runCount: stats.runCount,
        viewCount: stats.viewCount,
        starredByActor: stats.starredByActor,
        registryUpdatedAt: stats.updatedAt,
      },
    }));
  }

  async function toggleSkillStar(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    const eventType = trackedSkill.starredByActor ? "unstar" : "star";
    const stats = await linkApi.recordSkillRegistryEvent({
      skillId: trackedSkill.skillId,
      skillName: trackedSkill.name,
      source: trackedSkill.source,
      eventType,
    });
    updateSkillStats(stats);
    setBotSkillResult(eventType === "star" ? `${trackedSkill.name} starred.` : `${trackedSkill.name} unstarred.`);
  }

  async function installSkill(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    if (!activeAgent) {
      setBotSkillResult("Choose an active agent on Agents before installing skills.");
      setSectionFilter("you");
      return;
    }
    const installKey = `${activeAgent.id}:${trackedSkill.name}`;
    setInstalledSkillKeys((current) => current.includes(installKey) ? current : [...current, installKey]);
    const stats = await linkApi.recordSkillRegistryEvent({
      skillId: trackedSkill.skillId,
      skillName: trackedSkill.name,
      source: trackedSkill.source,
      eventType: "install",
    });
    updateSkillStats(stats);
    setBotSkillResult(`${trackedSkill.name} installed on ${activeAgent.displayName}.`);
  }

  function renderBotSkillButton(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    const installed = activeAgent ? installedSkillKeys.includes(`${activeAgent.id}:${trackedSkill.name}`) : false;
    const expanded = expandedSkillNames.includes(trackedSkill.name);
    const skillMarkdown = skillMarkdownByName[trackedSkill.name];
    const downloadCount = trackedSkill.downloadCount ?? trackedSkill.installCount ?? 0;
    return (
      <article key={trackedSkill.name} className={`agentCard skillResultRow ${expanded ? "expanded" : ""}`}>
        <div className="connectorTitle">
          <span className="agentTitleText">
            <strong>{trackedSkill.name}</strong>
          </span>
          <div className="agentCardActions">
            <button
              className={`iconButton bookmarkButton skillInstallIconButton ${trackedSkill.starredByActor ? "selected" : ""}`}
              onClick={() => void toggleSkillStar(trackedSkill)}
              type="button"
              title={trackedSkill.starredByActor ? "Unstar skill" : "Star skill"}
              aria-label={trackedSkill.starredByActor ? `Unstar ${trackedSkill.name}` : `Star ${trackedSkill.name}`}
            >
              <Star size={15} fill={trackedSkill.starredByActor ? "currentColor" : "none"} />
            </button>
            <button
              className={`iconButton bookmarkButton skillInstallIconButton ${installed ? "selected" : ""}`}
              onClick={() => void installSkill(trackedSkill)}
              type="button"
              title={installed ? "Skill installed" : "Install skill"}
              aria-label={installed ? `${trackedSkill.name} installed` : `Install ${trackedSkill.name}`}
            >
              <Plus size={15} />
            </button>
            <button
              className="iconButton agentDetailsButton"
              onClick={() => toggleBotSkillDetails(trackedSkill.name)}
              type="button"
              title={expanded ? "Hide skill details" : "Show skill details"}
              aria-label={expanded ? `Hide ${trackedSkill.name} details` : `Show ${trackedSkill.name} details`}
              aria-expanded={expanded}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        <p>{trackedSkill.description}</p>
        <div className="skillMarketplaceMeta" aria-label={`${trackedSkill.name} marketplace stats`}>
          <button className="skillCategoryLink" type="button" onClick={() => setBotSkillTeamFilter(trackedSkill.team)}>
            {trackedSkill.team}
          </button>
          <span><Star size={14} />{formatCompactCount(trackedSkill.starCount)}</span>
          <span><Download size={14} />{formatCompactCount(downloadCount)}</span>
        </div>
        {expanded && (
          <div className="agentDetailsPanel">
            <div className="tagList">
              <span>{trackedSkill.product ?? "workflow"}</span>
              <span>{trackedSkill.language ?? "skill"}</span>
              {trackedSkill.source && <span>{trackedSkill.source}</span>}
              <span>{trackedSkill.approvalRequired ? "approval gated" : "ready"}</span>
              {installed && <span>installed</span>}
            </div>
            <div className="skillMarkdownPanel">
              <div className="skillMarkdownHeader">
                <span><FileText size={14} />SKILL.md</span>
                {skillMarkdown?.status === "ready" && (
                  <a href={skillMarkdown.result.sourceUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={13} />
                    GitHub
                  </a>
                )}
              </div>
              {skillMarkdown?.status === "loading" && <p className="skillMarkdownStatus">Loading SKILL.md...</p>}
              {skillMarkdown?.status === "error" && <p className="skillMarkdownStatus error">{skillMarkdown.message}</p>}
              {skillMarkdown?.status === "ready" && <pre>{skillMarkdown.result.markdown}</pre>}
            </div>
          </div>
        )}
      </article>
    );
  }

  function updateToolDraft<K extends keyof ToolStudioDraft>(key: K, value: ToolStudioDraft[K]) {
    setToolDraft((current) => ({ ...current, [key]: value }));
  }

  async function publishToolStudioDraft() {
    setToolStudioStatus("Publishing tool to the Link catalog...");
    try {
      const published = await linkApi.publishToolManifest(toolStudioManifest);
      setToolStudioStatus(`${published.name} published to Tool Studio as ${published.artifactType.replace("_", " ")}.`);
      await refresh();
    } catch (err) {
      setToolStudioStatus(err instanceof Error ? err.message : "Unable to publish tool.");
    }
  }

  async function refineToolInChat() {
    setToolStudioStatus("");
    await startSkillBuilderChat(toolStudioPrompt);
    setToolStudioStatus("Opened Tool Studio session in the chat panel.");
  }

  const agentSectionHeading = {
    personal: ["Personal", Users],
    squads: ["Squads", Bot],
    telnyx: ["Telnyx", Store],
    skills: ["Skills", Zap],
  } satisfies Record<AgentViewTab, [string, AppIcon]>;
  const [agentHeadingTitle] = agentSectionHeading[tab];
  const agentHeaderAction = tab === "personal" ? (
    <button className="button primary" onClick={() => void openAddAgentFlow()} disabled={acpBusy}>
      <Plus size={15} />
      Add Agent
    </button>
  ) : tab === "skills" ? (
    <button className="button primary" onClick={() => setCreateToolOpen((open) => !open)}>
      <Plus size={15} />
      Create Skill
    </button>
  ) : null;

  function agentRowMeta(agent: HostedAgentSummary | AgentSummary) {
    return [agent.type, agent.status].filter(Boolean).join(" - ") || "Agent";
  }

  function renderAgentDirectoryRow(row: (typeof agentDirectorySections)[number]["rows"][number]) {
    const agent = row.agent;
    const bookmarked = bookmarkedAgentIdSet.has(agent.id);
    return (
      <div
        className="chatResultRow directoryResultRow agentDirectoryResultRow"
        role="row"
        key={row.id}
        tabIndex={0}
        onClick={() => openAgentDetail(row.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openAgentDetail(row.id);
          }
        }}
      >
        <span className="directoryNameCell" role="cell">
          <strong>{agent.displayName}</strong>
          <small>{agent.description || "No description saved."}</small>
        </span>
        <span role="cell">{row.category}</span>
        <span role="cell">{agentRowMeta(agent)}</span>
        <span className="directoryRowActions" role="cell">
          {row.section === "team" && (
            <button
              className={`iconButton bookmarkButton ${bookmarked ? "selected" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleBookmark(agent.id);
              }}
              title={bookmarked ? "Remove bookmark" : "Bookmark agent"}
              aria-label={bookmarked ? `Remove ${agent.displayName} bookmark` : `Bookmark ${agent.displayName}`}
            >
              <Star size={15} />
            </button>
          )}
        </span>
        <button
          className="chatSessionOpenButton"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAgentDetail(row.id);
          }}
          aria-label={`Open ${agent.displayName}`}
          title="Open agent"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  function renderAgentDirectoryTable(section: (typeof agentDirectorySections)[number]) {
    return (
      <section className="agentDirectorySection" aria-label={`${section.title} agents`} key={section.id}>
        <div className="agentDirectorySectionHeader">
          <h2>{section.title}</h2>
          <span>{section.rows.length} {section.rows.length === 1 ? "agent" : "agents"}</span>
        </div>
        <div className="chatSessionRows directoryTable agentDirectoryTable" role="table" aria-label={`${section.title} agents`}>
          <div className="chatResultRow directoryResultRow agentDirectoryResultRow chatResultRowHead" role="row">
            <span role="columnheader">Agent</span>
            <span role="columnheader">Group</span>
            <span role="columnheader">Runtime</span>
            <span role="columnheader">Saved</span>
            <span role="columnheader" aria-label="Open agent" />
          </div>
          <div className="chatResultRows" role="rowgroup">
            {section.rows.map(renderAgentDirectoryRow)}
            {section.rows.length === 0 && (
              <div className="tableEmptyState" role="row">
                <EmptyState title={`No ${section.title.toLowerCase()} agents found`} body="Try another search term or filter." icon={Bot} />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  const selectedAgentRow = selectedAgentDetailId
    ? agentDirectorySections.flatMap((section) => section.rows).find((row) => row.id === selectedAgentDetailId)
    : undefined;
  const selectedAgentDetail = selectedAgentRow?.agent;
  const selectedAgentCapabilities = selectedAgentDetail && "capabilities" in selectedAgentDetail ? selectedAgentDetail.capabilities : [];
  const selectedAgentSource = selectedAgentDetail && "source" in selectedAgentDetail ? selectedAgentDetail.source : "agent-control-plane";
  const selectedAgentVisibility = selectedAgentDetail && "visibility" in selectedAgentDetail ? selectedAgentDetail.visibility : undefined;
  const selectedAgentRequiresAuth = Boolean(selectedAgentDetail && "requiresAuthentication" in selectedAgentDetail && selectedAgentDetail.requiresAuthentication);

  if (selectedAgentRow && selectedAgentDetail) {
    return (
      <section className="content chatView canonicalChat chatDetailView directoryDetailView agentInfoDetailView">
        <header className="pageHeader">
          <div className="chatDetailTitleGroup">
            <button className="iconButton chatDetailBackButton" type="button" onClick={() => setSelectedAgentDetailId("")} aria-label="Back to agents">
              <ArrowLeft size={17} />
            </button>
            <span>Agents / {selectedAgentRow.section === "you" ? "You" : "Team"}</span>
            <h1>{selectedAgentDetail.displayName}</h1>
            <p>{selectedAgentDetail.description || "No description saved."}</p>
          </div>
        </header>
        <section className="chatDetailSurface">
          <div className="chatReviewTabs directoryDetailTabs" role="tablist" aria-label="Agent details">
            {[
              ["overview", "Overview"],
              ["capabilities", "Capabilities"],
              ["settings", "Settings"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={selectedAgentDetailTab === id ? "selected" : ""}
                type="button"
                onClick={() => setSelectedAgentDetailTab(id as typeof selectedAgentDetailTab)}
                role="tab"
                aria-selected={selectedAgentDetailTab === id}
              >
                {label}
              </button>
            ))}
          </div>
          {selectedAgentDetailTab === "overview" && (
            <div className="chatResultDetails directoryDetailPanel">
              <div><strong>Group</strong><span>{selectedAgentRow.category}</span></div>
              <div><strong>Runtime</strong><span>{selectedAgentDetail.type || "Agent"}</span></div>
              <div><strong>Status</strong><span>{formatStatusLabel(selectedAgentDetail.status || "available")}</span></div>
              <div><strong>Source</strong><span>{formatSourceLabel(selectedAgentSource)}</span></div>
              {selectedAgentVisibility && <div><strong>Visibility</strong><span>{formatVisibilityLabel(selectedAgentVisibility)}</span></div>}
            </div>
          )}
          {selectedAgentDetailTab === "capabilities" && (
            <div className="directoryDetailPanel">
              <div className="tagList">
                {selectedAgentCapabilities.length > 0 ? selectedAgentCapabilities.map((capability) => <span key={capability}>{capability}</span>) : <span>No capabilities reported</span>}
                {selectedAgentRequiresAuth && <span>requires auth</span>}
              </div>
            </div>
          )}
          {selectedAgentDetailTab === "settings" && (
            <div className="directoryDetailPanel">
              {selectedAgentRow.section === "you" ? (
                <div className="agentAppearanceEditor detailAppearanceEditor">
                  <button className="button secondary compactButton" type="button" onClick={() => setAgentAppearanceOpenId((current) => current === selectedAgentDetail.id ? "" : selectedAgentDetail.id)}>
                    <Pencil size={13} />
                    Appearance
                  </button>
                  <label className="button ghost compactButton agentImageUpload">
                    <Upload size={13} />
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        uploadAgentImage(selectedAgentDetail.id, event.currentTarget.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {agentAppearances[selectedAgentDetail.id] && (
                    <button className="button ghost compactButton" type="button" onClick={() => resetAgentAppearance(selectedAgentDetail.id)}>
                      <X size={13} />
                      Reset
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className={`button secondary ${bookmarkedAgentIdSet.has(selectedAgentDetail.id) ? "selected" : ""}`}
                  type="button"
                  onClick={() => toggleBookmark(selectedAgentDetail.id)}
                >
                  <Star size={14} />
                  {bookmarkedAgentIdSet.has(selectedAgentDetail.id) ? "Bookmarked" : "Bookmark"}
                </button>
              )}
              {(selectedAgentSource === "slack" || selectedAgentDetail.type === "slack") && (
                <div className="agentMessageBox detailMessageBox">
                  <textarea
                    value={agentDrafts[selectedAgentDetail.id] ?? ""}
                    onChange={(event) => setAgentDrafts((current) => ({ ...current, [selectedAgentDetail.id]: event.target.value }))}
                    onKeyDown={(event) => {
                      if (shouldSubmitComposer(event)) {
                        event.preventDefault();
                        void sendAgent(selectedAgentDetail as AgentSummary);
                      }
                    }}
                    placeholder={`Message ${selectedAgentDetail.displayName}`}
                  />
                  <button className="button secondary" onClick={() => void sendAgent(selectedAgentDetail as AgentSummary)} disabled={sendingAgentId === selectedAgentDetail.id || !agentDrafts[selectedAgentDetail.id]?.trim()}>
                    {sendingAgentId === selectedAgentDetail.id ? "Sending" : "Send"}
                  </button>
                </div>
              )}
              {agentAppearanceOpenId === selectedAgentDetail.id && (
                <div className="agentEmojiPicker detailEmojiPicker" aria-label={`Choose avatar emoji for ${selectedAgentDetail.displayName}`}>
                  {systemAgentEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={agentAppearances[selectedAgentDetail.id]?.kind === "emoji" && agentAppearances[selectedAgentDetail.id]?.value === emoji ? "selected" : ""}
                      onClick={() => setAgentEmoji(selectedAgentDetail.id, emoji)}
                      aria-label={`Use ${emoji} avatar`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {agentMessageStatus && <div className="infoBanner">{agentMessageStatus}</div>}
            </div>
          )}
        </section>
      </section>
    );
  }

  return (
    <section className="content agentsView">
      <div className="pageSectionShell">
        <PageSectionSidebar
          tabs={[
            ["personal", "Personal", Users],
            ["squads", "Squads", Bot],
            ["telnyx", "Telnyx", Store],
          ] as const}
          activeTab={tab === "skills" ? "personal" : tab}
          onSelect={(nextTab) => {
            setTab(nextTab);
            setCreateToolOpen(false);
          }}
          label="Agent sections"
        />
        <div className="pageSectionMain">
          <header className="pageHeader">
            <h1>Agents</h1>
            <button className="button primary" onClick={() => void openAddAgentFlow()} disabled={acpBusy}>
              <Plus size={15} />
              Add Agent
            </button>
          </header>
      {!(tab === "skills" && createToolOpen) && (
      <div className="agentControls">
        <button
          className={`iconButton agentFilterButton ${filtersOpen ? "selected" : ""}`}
          aria-label={filtersOpen ? "Hide filters" : "Show filters"}
          title={filtersOpen ? "Hide filters" : "Show filters"}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={16} />
        </button>
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents"
          />
        </div>
        <label className="agentFilter agentSortFilter" aria-label="Sort">
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)}>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="status">Status</option>
          </select>
        </label>
        <TableRefreshButton onClick={refreshAgentsThenAll} disabled={acpBusy} label="Refresh agents" />
      </div>
      )}
      {filtersOpen && !(tab === "skills" && createToolOpen) && (
        <div className="agentFilterPanel">
          {tab !== "skills" ? (
            <>
              <label className="agentFilter">
                <span>Section</span>
                <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value as typeof sectionFilter)}>
                  <option value="all">All agents</option>
                  <option value="you">You</option>
                  <option value="team">Team</option>
                </select>
              </label>
              <label className="agentFilter">
                <span>Status</span>
                <select value={hostedAgentFilter} onChange={(event) => setHostedAgentFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  {hostedAgentStatuses.map((status) => (
                    <option key={status} value={status}>{formatStatusLabel(status)}</option>
                  ))}
                </select>
              </label>
              <label className="agentFilter">
                <span>Squad</span>
                <select value={squadFilter} onChange={(event) => setSquadFilter(event.target.value)}>
                  <option value="all">All squads</option>
                  {squads.map((squad) => (
                    <option key={squad} value={squad}>{squad}</option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="agentFilter">
                <span>My skill team</span>
                <select value={skillTeamFilter} onChange={(event) => setSkillTeamFilter(event.target.value)}>
                  <option value="all">All teams</option>
                  {installedSkillTeams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </label>
              <label className="agentFilter">
                <span>Skill team</span>
                <select value={botSkillTeamFilter} onChange={(event) => setBotSkillTeamFilter(event.target.value)}>
                  <option value="all">All teams</option>
                  {botSkillTeams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
      )}
      {tab === "skills" ? (
        <div className="botSkillsPanel">
          {createToolOpen ? (
            <form className="skillBuilderForm" onSubmit={(event) => {
              event.preventDefault();
              void publishToolStudioDraft();
            }}>
              <section className="skillBuilderSurvey" aria-label="Tool Studio survey">
                <label>
                  <span>Skill name</span>
                  <input value={toolDraft.name} onChange={(event) => updateToolDraft("name", event.target.value)} placeholder="Account Briefing" />
                </label>
                <label>
                  <span>Description</span>
                  <input value={toolDraft.description} onChange={(event) => updateToolDraft("description", event.target.value)} placeholder="Create a concise account briefing from internal context." />
                </label>
                <label>
                  <span>Owner</span>
                  <input value={toolDraft.owner} onChange={(event) => updateToolDraft("owner", event.target.value)} placeholder="GTM" />
                </label>
                <label>
                  <span>Team</span>
                  <input value={toolDraft.team} onChange={(event) => updateToolDraft("team", event.target.value)} placeholder="Sales" />
                </label>
                <label>
                  <span>Audience</span>
                  <input value={toolDraft.audience} onChange={(event) => updateToolDraft("audience", event.target.value)} placeholder="Sales, Support, NOC" />
                </label>
                <label>
                  <span>Artifact</span>
                  <select value={toolDraft.artifactType} onChange={(event) => updateToolDraft("artifactType", event.target.value as ToolArtifactType)}>
                    <option value="skill">SKILL.md workflow</option>
                    <option value="mcp_tool">Plugin tool</option>
                    <option value="link_app">Link app</option>
                  </select>
                </label>
                <label>
                  <span>Risk</span>
                  <select value={toolDraft.riskLevel} onChange={(event) => updateToolDraft("riskLevel", event.target.value as ToolStudioDraft["riskLevel"])}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  <span>Tools</span>
                  <input value={toolDraft.toolsRequired} onChange={(event) => updateToolDraft("toolsRequired", event.target.value)} placeholder="salesforce.account_lookup, guru.search" />
                </label>
                <label className="skillBuilderToggle">
                  <input type="checkbox" checked={toolDraft.customerSafe} onChange={(event) => updateToolDraft("customerSafe", event.target.checked)} />
                  <span>Customer safe</span>
                </label>
                <label className="skillBuilderToggle">
                  <input type="checkbox" checked={toolStudioManifest.approvalRequired} onChange={(event) => updateToolDraft("approvalRequired", event.target.checked)} />
                  <span>Approval required</span>
                </label>
                <label>
                  <span>Visibility</span>
                  <select value={toolDraft.visibility} onChange={(event) => updateToolDraft("visibility", event.target.value as ToolStudioDraft["visibility"])}>
                    <option value="private">Private</option>
                    <option value="squad">Squad</option>
                    <option value="internal">Internal</option>
                  </select>
                </label>
                <label>
                  <span>Version</span>
                  <input value={toolDraft.version} onChange={(event) => updateToolDraft("version", event.target.value)} placeholder="1.0.0" />
                </label>
                <label className="wide">
                  <span>When to use it</span>
                  <textarea value={toolDraft.whenToUse} onChange={(event) => updateToolDraft("whenToUse", event.target.value)} placeholder="Use when a rep needs a pre-call account summary." />
                </label>
                <label className="wide">
                  <span>Inputs needed</span>
                  <textarea value={toolDraft.inputsNeeded} onChange={(event) => updateToolDraft("inputsNeeded", event.target.value)} placeholder="Account name, CRM URL, meeting date, target persona." />
                </label>
                <label className="wide">
                  <span>Source of truth</span>
                  <textarea value={toolDraft.sourceOfTruth} onChange={(event) => updateToolDraft("sourceOfTruth", event.target.value)} placeholder="Salesforce wins for account fields; Guru wins for playbooks; Slack is supporting context only." />
                </label>
                <label className="wide">
                  <span>Workflow steps</span>
                  <textarea value={toolDraft.workflowSteps} onChange={(event) => updateToolDraft("workflowSteps", event.target.value)} placeholder="1. Look up account. 2. Pull recent notes. 3. Summarize risks and next steps." />
                </label>
                <label className="wide">
                  <span>Repeated checks</span>
                  <textarea value={toolDraft.repeatedChecks} onChange={(event) => updateToolDraft("repeatedChecks", event.target.value)} placeholder="Confirm stale sources, missing inputs, and approval gates before final output." />
                </label>
                <label className="wide">
                  <span>Expected output</span>
                  <textarea value={toolDraft.expectedOutput} onChange={(event) => updateToolDraft("expectedOutput", event.target.value)} placeholder="A brief with context, current state, risks, talking points, and next actions." />
                </label>
                <label className="wide">
                  <span>Human checkpoints</span>
                  <textarea value={toolDraft.humanCheckpoints} onChange={(event) => updateToolDraft("humanCheckpoints", event.target.value)} placeholder="Ask before customer-facing messages, write actions, pricing claims, or destructive edits." />
                </label>
                <label className="wide">
                  <span>Safety notes</span>
                  <textarea value={toolDraft.safetyNotes} onChange={(event) => updateToolDraft("safetyNotes", event.target.value)} placeholder="Do not expose internal notes externally. Ask before customer-facing use." />
                </label>
                <label className="wide">
                  <span>Reviewers</span>
                  <textarea value={toolDraft.reviewers} onChange={(event) => updateToolDraft("reviewers", event.target.value)} placeholder="sales.squad, support.squad" />
                </label>
                <label className="wide">
                  <span>Test fixture</span>
                  <textarea value={toolDraft.testFixture} onChange={(event) => updateToolDraft("testFixture", event.target.value)} placeholder="Paste the most recent real request or expected input/output example." />
                </label>
              </section>
              <section className="skillBuilderPreview" aria-label="Generated Tool Studio package">
                <div className="skillBuilderPreviewHeader">
                  <strong>Generated package</strong>
                  <button className="button primary" type="submit">
                    <Upload size={15} />
                    Publish Skill
                  </button>
                  <button className="button secondary" type="button" onClick={() => void refineToolInChat()}>
                    <Send size={15} />
                    Refine in Chat
                  </button>
                </div>
                <div className="toolStudioChecklist">
                  {toolStudioManifest.checklist.map((item) => (
                    <span key={item}><SquareCheck size={14} />{item}</span>
                  ))}
                </div>
                <pre>{JSON.stringify({ ...toolStudioManifest, skillMarkdown: "See generated SKILL.md below." }, null, 2)}</pre>
                <pre>{toolStudioManifest.skillMarkdown}</pre>
                {toolStudioStatus && <div className="infoBanner">{toolStudioStatus}</div>}
              </section>
            </form>
          ) : (
            <>
              <section className="wikiSection" aria-label="My Skills">
                <div className="mySkillsList">
                  {installedSkillRows.map((row) => (
                    <article className="mySkillRow" key={row.key}>
                      <div className="skillIcon"><Zap size={16} /></div>
                      <div>
                        <strong>{row.skillName}</strong>
                        <p>{row.description}</p>
                        <small>{row.team} - {row.agentName}</small>
                      </div>
                      <Badge tone="success">Installed</Badge>
                    </article>
                  ))}
                </div>
                {installedSkillRows.length === 0 && <div className="appEmptyPanel">No skills installed yet.</div>}
              </section>
              <section className="wikiSection" aria-label="Active agent teams">
                <div className="userSquadsPanel">
                  <span className="userSquadsSummary">Active agent teams</span>
                  <div className="userSquadChips">
                    {userSquads.length > 0 ? userSquads.map((squad) => <span key={squad}>{squad}</span>) : <em>No teams found for the active agent</em>}
                  </div>
                </div>
              </section>
              <section className="wikiSection" aria-label="Skills">
                <div className="squadKitColumns">
                  {filteredSquadKits.map((kit) => {
                    const expanded = expandedSquad === kit.id;
                    return (
                      <section className={`squadKitColumn wiki-${kit.tone} ${expanded ? "expanded" : ""}`} key={kit.id}>
                        <button className="squadKitHeader" onClick={() => toggleSquadKit(kit.id)} aria-expanded={expanded}>
                          <span>
                            <strong>{kit.name}</strong>
                            <small>{kit.mastered}/{kit.total}</small>
                          </span>
                          <ChevronDown size={16} />
                        </button>
                        {expanded && (
                          <div className="squadKitSkillList">
                            {kit.skills.map(renderBotSkillButton)}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </section>
              {filteredSquadKits.length === 0 && <EmptyState title="No skills found" body="Try another search term." icon={Bot} />}
              {botSkillResult && <pre className="resultPreview">{botSkillResult}</pre>}
            </>
          )}
        </div>
      ) : (
        <>
        {tab === "personal" && (
        <section className="wikiSection agentDirectoryList" aria-label="Agents">
          {agentError && agentLoadRecoverable ? (
            <div className="agentRecoveryBanner" role="status">
              <div>
                <strong>Agent Control Plane is unavailable</strong>
                <p>{agentError}</p>
              </div>
              <div className="agentRecoveryActions">
                <button className="button secondary" type="button" onClick={() => void refreshAgentControlPlane()} disabled={acpBusy}>
                  <RefreshCw size={14} />
                  Retry
                </button>
                <button className="button secondary" type="button" onClick={() => void signInAgentControlPlane()} disabled={acpBusy}>
                  Sign in
                </button>
                <button className="button primary" type="button" onClick={() => void openAddAgentFlow()} disabled={acpBusy}>
                  <Plus size={14} />
                  Add Agent
                </button>
              </div>
            </div>
          ) : agentError ? <div className="errorBanner">{agentError}</div> : null}
          {agentDirectorySections.map(renderAgentDirectoryTable)}
        </section>
        )}
        {tab === "squads" && (
        <section className="wikiSection agentDirectoryList" aria-label="Squad Agents">
          {squadAgentGroups.map(([squad, rows]) => (
            <section className="squadKitColumn expanded" key={squad}>
              <div className="squadKitHeader">
                <span>
                  <strong>{squad}</strong>
                  <small>{rows.length} {rows.length === 1 ? "agent" : "agents"}</small>
                </span>
              </div>
              <div className="agentGrid">
                {rows.map((agent) => {
                  const expanded = expandedAgentIds.includes(agent.id);
                  return (
                    <article className={`agentCard ${expanded ? "expanded" : ""}`} key={agent.id}>
                      <div>
                        <div className="connectorTitle">
                          <span className="agentTitleText">
                            <strong>{agent.displayName}</strong>
                            <span className="agentSquadBadge">{agentSquadLabel(agent)}</span>
                          </span>
                          <div className="agentCardActions">
                            <button
                              className={`iconButton bookmarkButton ${bookmarkedAgentIdSet.has(agent.id) ? "selected" : ""}`}
                              onClick={() => toggleBookmark(agent.id)}
                              title={bookmarkedAgentIdSet.has(agent.id) ? "Remove bookmark" : "Bookmark agent"}
                              aria-label={bookmarkedAgentIdSet.has(agent.id) ? `Remove ${agent.displayName} bookmark` : `Bookmark ${agent.displayName}`}
                            >
                              <Star size={15} />
                            </button>
                            <button
                              className="iconButton agentDetailsButton"
                              onClick={() => toggleAgentDetails(agent.id)}
                              title={expanded ? "Hide agent details" : "Show agent details"}
                              aria-label={expanded ? `Hide ${agent.displayName} details` : `Show ${agent.displayName} details`}
                              aria-expanded={expanded}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </div>
                        <p>{agent.description}</p>
                      </div>
                      {expanded && (
                        <div className="agentDetailsPanel">
                          <div className="tagList">
                            <span>{agentTypeLabel(agent)}</span>
                            <span>{formatVisibilityLabel(agent.visibility)}</span>
                            {agent.source && <span>{formatSourceLabel(agent.source)}</span>}
                            {agent.squad && <span>{agent.squad}</span>}
                            {agent.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
                            {agent.requiresAuthentication && <span>requires auth</span>}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
          {squadAgentGroups.length === 0 && <EmptyState title="No squad agents found" body="Try a different search term or squad filter." icon={Bot} />}
        </section>
        )}
        {tab === "telnyx" && (
      <section className="wikiSection agentDirectoryList" aria-label="Agents">
      <div className="agentGrid">
        {filteredAgents.map((agent) => {
          const expanded = expandedAgentIds.includes(agent.id);
          return (
          <article className={`agentCard ${expanded ? "expanded" : ""}`} key={agent.id}>
            <div>
              <div className="connectorTitle">
                <span className="agentTitleText">
                  <strong>{agent.displayName}</strong>
                  <span className="agentSquadBadge">{agentSquadLabel(agent)}</span>
                </span>
                <div className="agentCardActions">
                  <button
                    className={`iconButton bookmarkButton ${bookmarkedAgentIdSet.has(agent.id) ? "selected" : ""}`}
                    onClick={() => toggleBookmark(agent.id)}
                    title={bookmarkedAgentIdSet.has(agent.id) ? "Remove bookmark" : "Bookmark agent"}
                    aria-label={bookmarkedAgentIdSet.has(agent.id) ? `Remove ${agent.displayName} bookmark` : `Bookmark ${agent.displayName}`}
                  >
                    <Star size={15} />
                  </button>
                  <button
                    className="iconButton agentDetailsButton"
                    onClick={() => toggleAgentDetails(agent.id)}
                    title={expanded ? "Hide agent details" : "Show agent details"}
                    aria-label={expanded ? `Hide ${agent.displayName} details` : `Show ${agent.displayName} details`}
                    aria-expanded={expanded}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <p>{agent.description}</p>
            </div>
            {expanded && (
              <div className="agentDetailsPanel">
                <div className="tagList">
                  <span>{agentTypeLabel(agent)}</span>
                  <span>{formatVisibilityLabel(agent.visibility)}</span>
                  {agent.source && <span>{formatSourceLabel(agent.source)}</span>}
                  {agent.squad && <span>{agent.squad}</span>}
                  {agent.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
                  {agent.requiresAuthentication && <span>requires auth</span>}
                </div>
              </div>
            )}
            {expanded && (agent.source === "slack" || agent.type === "slack") && (
              <div className="agentMessageBox">
                <textarea
                  value={agentDrafts[agent.id] ?? ""}
                  onChange={(event) => setAgentDrafts((current) => ({ ...current, [agent.id]: event.target.value }))}
                  onKeyDown={(event) => {
                    if (shouldSubmitComposer(event)) {
                      event.preventDefault();
                      void sendAgent(agent);
                    }
                  }}
                  placeholder={`Message ${agent.displayName}`}
                />
                <button className="button secondary" onClick={() => void sendAgent(agent)} disabled={sendingAgentId === agent.id || !agentDrafts[agent.id]?.trim()}>
                  {sendingAgentId === agent.id ? "Sending" : "Send"}
                </button>
              </div>
            )}
          </article>
        );
        })}
      </div>
      {agentMessageStatus && <div className="infoBanner">{agentMessageStatus}</div>}
      {filteredAgents.length === 0 && <EmptyState title="No agents found" body="Try a different search term or squad filter." icon={Bot} />}
      </section>
        )}
        </>
      )}
        </div>
      </div>
    </section>
  );
}

type WorkboardTaskAssignee = {
  id: string;
  label: string;
  type: "self" | "hermes" | "openclaw" | "a2a" | string;
  source: ChatAgentSource;
  rank: number;
};

function WorkboardView({
  agents,
  bookmarkedAgentIds,
  activeAgent,
  selectedChatAgent,
  accountStatus,
  selectedSessionId,
  openTaskMonitoringSession,
}: {
  agents: AgentSummary[];
  bookmarkedAgentIds: string[];
  activeAgent: ActiveAgentSelection | null;
  selectedChatAgent?: { id: string; displayName: string; source: ChatAgentSource; type: string } | null;
  accountStatus: AgentControlPlaneAuthStatus | null;
  selectedSessionId: string;
  openTaskMonitoringSession: (input: { session: ChatSession; agentId?: string }) => void;
}) {
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<WorkboardCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [editLabels, setEditLabels] = useState("");
  const [editStatus, setEditStatus] = useState<WorkboardStatus>("todo");
  const [editComment, setEditComment] = useState("");
  const [hostedTaskAgents, setHostedTaskAgents] = useState<HostedAgentSummary[]>([]);
  const [boardLayout, setBoardLayout] = useState<"rows" | "columns">("rows");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dragTargetStatus, setDragTargetStatus] = useState<WorkboardStatus | null>(null);
  const [pointerDraggingCardId, setPointerDraggingCardId] = useState("");
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>(() => [
    ...readStoredIdList("telnyx-link-hidden-task-ids"),
    ...readStoredIdList("telnyx-link-hidden-done-task-ids"),
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pointerDragRef = useRef<{ cardId: string; pointerId: number; startX: number; startY: number; active: boolean } | null>(null);
  const pointerDropStatusRef = useRef<WorkboardStatus | null>(null);
  const suppressNextCardClickRef = useRef(false);

  const activeProvider = snapshot?.provider ?? provider;
  const selectedDirectoryChatAgent = selectedChatAgent ? agents.find((agent) => agent.id === selectedChatAgent.id) : undefined;
  const selectedRuntimeType = selectedDirectoryChatAgent?.type ?? selectedChatAgent?.type;
  const activeDirectoryAgent = activeAgent ? agents.find((agent) => agent.id === activeAgent.id) : undefined;
  const selfAssignee = useMemo(() => {
    const identity = accountStatus?.userName || accountStatus?.actor || accountStatus?.onBehalfOf || "Self";
    const selfId = accountStatus?.userId || accountStatus?.actor || accountStatus?.onBehalfOf || "self";
    return {
      id: `self:${selfId}`,
      label: identity,
      type: "self" as const,
      source: "link" as const,
      rank: -1,
    };
  }, [accountStatus?.actor, accountStatus?.onBehalfOf, accountStatus?.userId, accountStatus?.userName]);
  const preferredAgentType: "hermes" | "openclaw" =
    (selectedChatAgent?.source === "agent-control-plane" && workboardAgentRuntimeType(selectedRuntimeType) === "hermes") ||
    workboardAgentRuntimeType(activeDirectoryAgent?.type) === "hermes"
      ? "hermes"
      : "openclaw";
  const acpAgentAssignees = useMemo(() => {
    const savedAgentIds = new Set(bookmarkedAgentIds);
    const directoryAcpAgents = agents
      .filter((agent) => agent.source === "agent-control-plane")
      .map((agent) => ({
        id: agent.id,
        displayName: agent.displayName,
        type: agent.type,
      }));
    const hostedAcpAgents = hostedTaskAgents.map((agent) => ({
      id: agent.id,
      displayName: agent.displayName,
      type: agent.type,
    }));
    const acpAgents = [...hostedAcpAgents, ...directoryAcpAgents].map((agent) => {
        const rank =
          agent.id === selectedDirectoryChatAgent?.id ? 0 :
          agent.id === activeDirectoryAgent?.id ? 1 :
          savedAgentIds.has(agent.id) ? 2 :
          3;
        return {
          id: agent.id,
          label: agent.displayName,
          type: workboardAgentRuntimeType(agent.type),
          source: "agent-control-plane" as const,
          rank,
        };
      });

    return acpAgents
      .filter((agent, index, list) => list.findIndex((item) => item.id === agent.id) === index)
      .sort((left, right) => left.rank - right.rank || left.label.localeCompare(right.label));
  }, [activeDirectoryAgent, agents, bookmarkedAgentIds, hostedTaskAgents, selectedDirectoryChatAgent]);
  const a2aAgentAssignees = useMemo(() => {
    const savedAgentIds = new Set(bookmarkedAgentIds);
    return agents
      .filter((agent) => agent.source === "a2a-discovery" && agent.available !== false)
      .map((agent) => ({
        id: agent.id,
        label: agent.displayName,
        type: "a2a" as const,
        source: "a2a-discovery" as const,
        rank: agent.id === selectedDirectoryChatAgent?.id ? 0 : savedAgentIds.has(agent.id) ? 2 : 4,
      }))
      .sort((left, right) => left.rank - right.rank || left.label.localeCompare(right.label));
  }, [agents, bookmarkedAgentIds, selectedDirectoryChatAgent?.id]);
  const taskAssignees: WorkboardTaskAssignee[] = useMemo(() => [selfAssignee, ...acpAgentAssignees, ...a2aAgentAssignees], [acpAgentAssignees, a2aAgentAssignees, selfAssignee]);

  const filteredCards = useMemo(() => {
    const term = query.trim().toLowerCase();
    const hidden = new Set(hiddenTaskIds);
    return (snapshot?.cards ?? []).filter((card) => {
      if (hidden.has(`${card.provider}:${card.boardId}:${card.id}`)) return false;
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
  }, [hiddenTaskIds, snapshot?.cards, query, statusFilter]);

  function selectedAssignee(agentId: string) {
    return taskAssignees.find((agent) => agent.id === agentId);
  }

  function isDispatchableAssignee(agent: WorkboardTaskAssignee | undefined): agent is WorkboardTaskAssignee {
    return agent?.type === "hermes" || agent?.type === "openclaw" || agent?.source === "a2a-discovery";
  }

  function cardAssigneeLabel(card: WorkboardCard) {
    return card.assigneeName ?? card.assignee ?? card.assigneeId;
  }

  function taskAssigneeForCard(card: WorkboardCard): WorkboardTaskAssignee | undefined {
    const assigneeValue = card.assigneeId || card.assigneeName || card.assignee;
    return taskAssignees.find((agent) =>
      agent.id === assigneeValue ||
      agent.label === card.assigneeName ||
      agent.label === card.assignee,
    );
  }

  function taskSessionPayload(card: WorkboardCard, assignedAgent?: WorkboardTaskAssignee) {
    const resolvedAgent = assignedAgent ?? taskAssigneeForCard(card);
    const inferredSource: ChatAgentSource =
      resolvedAgent?.source ??
      (String(card.assigneeType ?? "").toLowerCase().includes("a2a") ? "a2a-discovery" : card.assigneeId?.startsWith("self:") ? "link" : "agent-control-plane");
    return {
      provider: card.provider,
      boardId: card.boardId,
      preferredAgentType,
      cardId: card.id,
      workspaceId: card.workspace,
      agentId: resolvedAgent?.id ?? card.assigneeId,
      agentName: resolvedAgent?.label ?? card.assigneeName ?? card.assignee,
      agentSource: inferredSource,
      agentType: resolvedAgent?.type ?? card.assigneeType ?? preferredAgentType,
      approvalMode: "auto",
      modelMode: inferredSource === "a2a-discovery" ? "a2a-discovery" : inferredSource === "agent-control-plane" ? "agent-control-plane" : "auto/ask-before-cloud",
      contextScope: "task",
    };
  }

  function findMutatedCard(snapshotAfterMutation: WorkboardSnapshot, taskTitle: string, assignedAgent?: WorkboardTaskAssignee) {
    const normalizedTitle = taskTitle.trim().toLowerCase();
    const assignedValues = [assignedAgent?.id, assignedAgent?.label].filter(Boolean);
    const candidates = snapshotAfterMutation.cards.filter((card) => card.title.trim().toLowerCase() === normalizedTitle);
    return candidates.find((card) => assignedValues.includes(card.assigneeId) || assignedValues.includes(card.assigneeName) || assignedValues.includes(card.assignee)) ?? candidates[0];
  }

  async function ensureTaskSessionForCard(card: WorkboardCard, assignedAgent?: WorkboardTaskAssignee) {
    const result = await linkApi.ensureWorkboardTaskSession(taskSessionPayload(card, assignedAgent));
    setSnapshot(result.snapshot);
    openTaskMonitoringSession({ session: result.session, agentId: assignedAgent?.source === "link" ? undefined : assignedAgent?.id ?? card.assigneeId });
    return result;
  }

  async function dispatchTaskSessionForCard(card: WorkboardCard, assignedAgent?: WorkboardTaskAssignee) {
    const result = await linkApi.dispatchWorkboardTask(taskSessionPayload(card, assignedAgent));
    setSnapshot(result.snapshot);
    openTaskMonitoringSession({ session: result.session, agentId: assignedAgent?.source === "link" ? undefined : assignedAgent?.id ?? card.assigneeId });
    return result;
  }

  async function finishTaskMutation(snapshotAfterMutation: WorkboardSnapshot, taskTitle: string, assignedAgent: WorkboardTaskAssignee | undefined, sendToAgent: boolean) {
    const card = findMutatedCard(snapshotAfterMutation, taskTitle, assignedAgent);
    if (!card) {
      setSnapshot(snapshotAfterMutation);
      return;
    }
    await ensureTaskSessionForCard(card, assignedAgent);
    if (!sendToAgent) return;
    if (!isDispatchableAssignee(assignedAgent)) {
      setError("Choose an ACP or A2A agent before sending the task.");
      return;
    }
    await dispatchTaskSessionForCard(card, assignedAgent);
  }

  async function openCardTaskSession(card: WorkboardCard) {
    await ensureTaskSessionForCard(card, taskAssigneeForCard(card));
  }

  async function startCardTask(card: WorkboardCard) {
    const assignedAgent = taskAssigneeForCard(card);
    if (!isDispatchableAssignee(assignedAgent)) {
      const nextSnapshot = await linkApi.updateWorkboardCard({
        provider: card.provider,
        boardId: card.boardId,
        preferredAgentType,
        cardId: card.id,
        status: "in_progress",
        autoDispatch: false,
      });
      setSnapshot(nextSnapshot);
      await ensureTaskSessionForCard({ ...card, status: "in_progress" }, assignedAgent);
      return;
    }
    await ensureTaskSessionForCard(card, assignedAgent);
    await dispatchTaskSessionForCard(card, assignedAgent);
  }

  function cardLinkedToSelectedSession(card: WorkboardCard) {
    return Boolean(selectedSessionId && card.linkedSessionId === selectedSessionId);
  }

  function cardSessionStateLabel(card: WorkboardCard) {
    if (card.linkedSessionId) return card.status === "in_progress" ? "Agent running" : "Session ready";
    return "No session";
  }

  function hideTask(card: WorkboardCard) {
    const key = `${card.provider}:${card.boardId}:${card.id}`;
    setHiddenTaskIds((current) => {
      const next = current.includes(key) ? current : [...current, key];
      window.localStorage.setItem("telnyx-link-hidden-task-ids", JSON.stringify(next));
      return next;
    });
  }

  async function load(nextProvider = provider, nextBoardId = boardId, silent = false) {
    if (!silent) setBusy(true);
    setError("");
    try {
      const nextSnapshot = await linkApi.listWorkboard({ provider: nextProvider, boardId: nextBoardId || undefined, preferredAgentType });
      setSnapshot(nextSnapshot);
      setBoardId(nextSnapshot.boardId === "unavailable" ? nextBoardId : nextSnapshot.boardId);
    } catch (loadError) {
      setError(String(loadError instanceof Error ? loadError.message : loadError));
    } finally {
      if (!silent) setBusy(false);
    }
  }

  useEffect(() => {
    void load("auto", "");
  }, [preferredAgentType]);

  useEffect(() => {
    let canceled = false;
    async function loadHostedTaskAgents() {
      try {
        const hosted = await linkApi.listHostedAgents();
        if (!canceled) setHostedTaskAgents(hosted);
      } catch {
        if (!canceled) setHostedTaskAgents([]);
      }
    }

    void loadHostedTaskAgents();
    const intervalId = window.setInterval(() => {
      if (!document.hidden) void loadHostedTaskAgents();
    }, 60000);
    return () => {
      canceled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      void load(provider, boardId, true);
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [provider, boardId, preferredAgentType]);

	  async function selectProvider(nextProvider: WorkboardProvider) {
	    setProvider(nextProvider);
	    await load(nextProvider, nextProvider === provider ? boardId : "");
	  }

	  async function selectBoard(nextBoardId: string) {
	    setBoardId(nextBoardId);
	    await load(provider, nextBoardId);
	  }

	  async function connectGoogleTasks() {
	    setBusy(true);
	    setError("");
	    try {
	      await linkApi.connectGoogleTasksWithGog();
	      setProvider("google_tasks");
	      await load("google_tasks", boardId);
	    } catch (connectError) {
	      setError(String(connectError instanceof Error ? connectError.message : connectError));
	    } finally {
	      setBusy(false);
	    }
	  }

  async function createCard(sendToAgent = false) {
    const trimmed = title.trim();
    if (!trimmed || !snapshot) return;
    const assignedAgent = selectedAssignee(assignee);
    if (sendToAgent && !isDispatchableAssignee(assignedAgent)) {
      setError("Choose an ACP or A2A agent before sending the task.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const nextSnapshot = await linkApi.createWorkboardCard({
        provider: activeProvider,
        boardId: boardId || undefined,
        preferredAgentType,
        title: trimmed,
        body: body.trim() || undefined,
        assignee: assignedAgent?.label,
        assigneeId: assignedAgent?.id,
        assigneeName: assignedAgent?.label,
        assigneeType: assignedAgent?.type,
        priority,
        labels: labels.split(",").map((label) => label.trim()).filter(Boolean),
        status: "todo",
        autoDispatch: false,
      });
      setTitle("");
      setBody("");
      setAssignee("");
      setPriority("normal");
      setLabels("");
      setCreateOpen(false);
      await finishTaskMutation(nextSnapshot, trimmed, assignedAgent, sendToAgent);
    } catch (createError) {
      setError(String(createError instanceof Error ? createError.message : createError));
    } finally {
      setBusy(false);
    }
  }

  async function updateCard(card: WorkboardCard, status: WorkboardStatus) {
    if (card.status === status) return;
    setBusy(true);
    setError("");
    try {
      if (card.status === "todo" && status === "in_progress") {
        await startCardTask(card);
        return;
      }
      setSnapshot(await linkApi.updateWorkboardCard({ provider: card.provider, boardId: card.boardId, preferredAgentType, cardId: card.id, status, autoDispatch: false }));
    } catch (updateError) {
      setError(String(updateError instanceof Error ? updateError.message : updateError));
    } finally {
      setBusy(false);
    }
  }

  function openEditCard(card: WorkboardCard) {
    setEditingCard(card);
    setEditTitle(card.title);
    setEditBody(card.body ?? "");
    setEditAssignee(card.assigneeId ?? "");
    setEditPriority(typeof card.priority === "string" && ["low", "normal", "high", "urgent"].includes(card.priority) ? card.priority : "normal");
    setEditLabels(card.labels.join(", "));
    setEditStatus(card.status);
    setEditComment("");
  }

  async function saveEditCard(sendToAgent = false) {
    if (!editingCard || !editTitle.trim()) return;
    const assignedAgent = selectedAssignee(editAssignee);
    if (sendToAgent && !isDispatchableAssignee(assignedAgent)) {
      setError("Choose an ACP or A2A agent before sending the task.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const nextSnapshot = await linkApi.updateWorkboardCard({
        provider: editingCard.provider,
        boardId: editingCard.boardId,
        preferredAgentType,
        cardId: editingCard.id,
        title: editTitle.trim(),
        body: editBody.trim(),
        assignee: assignedAgent?.label,
        assigneeId: assignedAgent?.id,
        assigneeName: assignedAgent?.label,
        assigneeType: assignedAgent?.type,
        priority: editPriority,
        labels: editLabels.split(",").map((label) => label.trim()).filter(Boolean),
        status: editStatus,
        comment: editComment.trim() || undefined,
        autoDispatch: false,
      });
      setEditingCard(null);
      await finishTaskMutation(nextSnapshot, editTitle.trim(), assignedAgent, sendToAgent);
    } catch (saveError) {
      setError(String(saveError instanceof Error ? saveError.message : saveError));
    } finally {
      setBusy(false);
    }
  }

  function startCardDrag(event: DragEvent<HTMLElement>, card: WorkboardCard) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-link-workboard-card", card.id);
    event.dataTransfer.setData("text/plain", card.id);
  }

  function allowCardDrop(event: DragEvent<HTMLElement>, status: WorkboardStatus) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragTargetStatus(status);
  }

  async function dropCard(event: DragEvent<HTMLElement>, status: WorkboardStatus) {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("application/x-link-workboard-card") || event.dataTransfer.getData("text/plain");
    setDragTargetStatus(null);
    const card = snapshot?.cards.find((item) => item.id === cardId);
    if (card) await updateCard(card, status);
  }

  function statusFromPointerEvent(event: ReactPointerEvent<HTMLElement>) {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const status = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-workboard-status]")?.dataset.workboardStatus : "";
    return columns.includes(status as WorkboardStatus) ? status as WorkboardStatus : null;
  }

  function startCardPointerDrag(event: ReactPointerEvent<HTMLElement>, card: WorkboardCard) {
    if (busy || event.button !== 0 || (event.target as HTMLElement).closest("a,button,input,select,textarea")) return;
    pointerDragRef.current = {
      cardId: card.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    };
    pointerDropStatusRef.current = null;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some test environments do not expose pointer capture; movement still works without it.
    }
  }

  function moveCardPointerDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.active && Math.hypot(deltaX, deltaY) < 6) return;
    drag.active = true;
    suppressNextCardClickRef.current = true;
    setPointerDraggingCardId(drag.cardId);
    const nextStatus = statusFromPointerEvent(event);
    pointerDropStatusRef.current = nextStatus;
    setDragTargetStatus(nextStatus);
  }

  async function finishCardPointerDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    pointerDragRef.current = null;
    setPointerDraggingCardId("");
    const targetStatus = pointerDropStatusRef.current ?? statusFromPointerEvent(event);
    pointerDropStatusRef.current = null;
    setDragTargetStatus(null);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may not have been acquired in all runtimes.
    }
    if (!drag.active || !targetStatus) return;
    const card = snapshot?.cards.find((item) => item.id === drag.cardId);
    if (card) await updateCard(card, targetStatus);
  }

  function cancelCardPointerDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    pointerDragRef.current = null;
    pointerDropStatusRef.current = null;
    setPointerDraggingCardId("");
    setDragTargetStatus(null);
  }

  const columns = snapshot?.columns ?? [];

  return (
    <section className="content workboardView">
      <header className="pageHeader">
        <div>
          <h1>Taskbox</h1>
        </div>
        <div className="headerActions">
          <button className="button primary" onClick={() => setCreateOpen((open) => !open)} aria-expanded={createOpen}>
            <Plus size={15} />
            Create Task
          </button>
        </div>
      </header>

      {error && <div className="errorBanner">{error}</div>}
      {snapshot?.message && <div className="assistantNotice workboardSyncNotice">{snapshot.message}</div>}

      <div className="workboardSearchRow">
        <button
          className={`iconButton agentFilterButton ${filtersOpen ? "selected" : ""}`}
          aria-label={filtersOpen ? "Hide task filters" : "Show task filters"}
          title={filtersOpen ? "Hide task filters" : "Show task filters"}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={16} />
        </button>
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cards, labels, assignees, or diagnostics" />
        </div>
        <button className="iconButton agentFilterButton" onClick={() => load(provider, boardId)} disabled={busy} aria-label="Resync tasks" title="Resync tasks">
          <RefreshCw size={16} />
        </button>
      </div>

      {filtersOpen && <div className="workboardToolbar">
        <label className="agentFilter">
          <span>Source</span>
          <select value={provider} onChange={(event) => void selectProvider(event.target.value as WorkboardProvider)}>
            <option value="auto">Auto</option>
	            {(snapshot?.providers ?? []).map((item) => (
	              <option key={item.id} value={item.id}>
	                {item.label}
	              </option>
	            ))}
          </select>
        </label>
        {(snapshot?.boards?.length ?? 0) > 1 && (
          <label className="agentFilter">
            <span>List</span>
            <select value={boardId || snapshot?.boardId || ""} onChange={(event) => void selectBoard(event.target.value)}>
              {snapshot?.boards.map((board) => (
                <option key={board.id} value={board.id}>{board.name}</option>
              ))}
            </select>
          </label>
        )}
        {provider === "google_tasks" && !snapshot?.providers?.find((item) => item.id === "google_tasks")?.available && (
          <button className="button secondary" type="button" onClick={() => void connectGoogleTasks()} disabled={busy}>
            <Plug size={15} />
            Connect Google Tasks
          </button>
        )}
        <label className="agentFilter">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | WorkboardStatus)}>
            <option value="all">All statuses</option>
            {columns.map((status) => (
              <option key={status} value={status}>{formatStatusLabel(status)}</option>
            ))}
          </select>
        </label>
        <div className="workboardLayoutToggle" role="group" aria-label="Board layout">
          <button
            className={boardLayout === "rows" ? "active" : ""}
            type="button"
            onClick={() => setBoardLayout("rows")}
            aria-pressed={boardLayout === "rows"}
          >
            <SquareCheck size={15} />
            Rows
          </button>
          <button
            className={boardLayout === "columns" ? "active" : ""}
            type="button"
            onClick={() => setBoardLayout("columns")}
            aria-pressed={boardLayout === "columns"}
          >
            <Grid2X2 size={15} />
            Columns
          </button>
        </div>
      </div>}

      {createOpen && (
        <div className="workboardCreate" aria-label="Create task">
          <div className="workboardCreateHeader">
            <div>
              <strong>Create task</strong>
              <small>Add a clear outcome for the selected board.</small>
            </div>
            <button className="iconButton" onClick={() => setCreateOpen(false)} aria-label="Close create task form">
              <X size={16} />
            </button>
          </div>
          <label className="workboardCreateField wide">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New agent-sized task" autoFocus />
          </label>
          <label className="workboardCreateField">
            <span>Assignee</span>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">{taskAssignees.length ? "Choose assignee" : "No assignees"}</option>
              {taskAssignees.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.type === "self" ? "Assign to Self" : `${agent.label} (${agent.source === "a2a-discovery" ? "A2A" : "ACP"})`}</option>
              ))}
            </select>
          </label>
          <label className="workboardCreateField">
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="workboardCreateField">
            <span>Labels</span>
            <input value={labels} onChange={(event) => setLabels(event.target.value)} placeholder="labels, comma-separated" />
          </label>
          <label className="workboardCreateField full">
            <span>Details</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Outcome, constraints, acceptance criteria, artifacts, and handoff notes" />
          </label>
          <div className="workboardCreateActions">
            <button className="button secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="button secondary" onClick={() => void createCard(false)} disabled={busy || !title.trim()}>
              <Plus size={15} />
              Create
            </button>
            <button className="button primary" onClick={() => void createCard(true)} disabled={busy || !title.trim() || !isDispatchableAssignee(selectedAssignee(assignee))}>
              <Send size={15} />
              Send to Agent
            </button>
          </div>
        </div>
      )}

      {editingCard && (
        <div className="workboardCreate workboardEdit" aria-label="Edit task">
          <div className="workboardCreateHeader">
            <div>
              <strong>Edit task</strong>
              <small>Update task details, assignment, status, and handoff notes.</small>
            </div>
            <button className="iconButton" onClick={() => setEditingCard(null)} aria-label="Close edit task form">
              <X size={16} />
            </button>
          </div>
          <label className="workboardCreateField wide">
            <span>Title</span>
            <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} autoFocus />
          </label>
          <label className="workboardCreateField">
            <span>Assignee</span>
            <select value={editAssignee} onChange={(event) => setEditAssignee(event.target.value)}>
              <option value="">{taskAssignees.length ? "Unassigned" : "No assignees"}</option>
              {taskAssignees.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.type === "self" ? "Assign to Self" : `${agent.label} (${agent.source === "a2a-discovery" ? "A2A" : "ACP"})`}</option>
              ))}
            </select>
          </label>
          <label className="workboardCreateField">
            <span>Status</span>
            <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as WorkboardStatus)}>
              {columns.map((status) => (
                <option key={status} value={status}>{formatStatusLabel(status)}</option>
              ))}
            </select>
          </label>
          <label className="workboardCreateField">
            <span>Priority</span>
            <select value={editPriority} onChange={(event) => setEditPriority(event.target.value as typeof editPriority)}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="workboardCreateField">
            <span>Labels</span>
            <input value={editLabels} onChange={(event) => setEditLabels(event.target.value)} placeholder="labels, comma-separated" />
          </label>
          <label className="workboardCreateField full">
            <span>Details</span>
            <textarea value={editBody} onChange={(event) => setEditBody(event.target.value)} />
          </label>
          <label className="workboardCreateField full">
            <span>Comment</span>
            <textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} placeholder="Optional note for the agent or workboard history" />
          </label>
          <div className="workboardCreateActions">
            <button className="button secondary" onClick={() => setEditingCard(null)}>Cancel</button>
            <button className="button secondary" onClick={() => void saveEditCard(false)} disabled={busy || !editTitle.trim()}>
              <Pencil size={15} />
              Save Task
            </button>
            <button className="button primary" onClick={() => void saveEditCard(true)} disabled={busy || !editTitle.trim() || !isDispatchableAssignee(selectedAssignee(editAssignee))}>
              <Send size={15} />
              Send to Agent
            </button>
          </div>
        </div>
      )}

      {boardLayout === "rows" ? (
        <div className="workboardRows">
          {columns.map((status) => {
            const cards = filteredCards.filter((card) => card.status === status);
            return (
              <section
                className={`workboardRowGroup ${dragTargetStatus === status ? "dropTarget" : ""}`}
                data-workboard-status={status}
                key={status}
                onDragOver={(event) => allowCardDrop(event, status)}
                onDragLeave={() => setDragTargetStatus(null)}
                onDrop={(event) => void dropCard(event, status)}
              >
                <div className="workboardRowGroupHeader">
                  <strong>{formatStatusLabel(status)}</strong>
                </div>
                <div className="workboardRowStack">
                  {cards.map((card) => (
                    <article
                      className={`workboardRowCard ${cardLinkedToSelectedSession(card) ? "selected" : ""} ${pointerDraggingCardId === card.id ? "pointerDragging" : ""}`}
                      key={card.id}
                      draggable={!busy}
                      onClick={(event) => {
                        if (suppressNextCardClickRef.current) {
                          suppressNextCardClickRef.current = false;
                          return;
                        }
                        if ((event.target as HTMLElement).closest("a,button")) return;
                        void openCardTaskSession(card);
                      }}
                      onDragStart={(event) => startCardDrag(event, card)}
                      onDragEnd={() => setDragTargetStatus(null)}
                      onPointerDown={(event) => startCardPointerDrag(event, card)}
                      onPointerMove={moveCardPointerDrag}
                      onPointerUp={(event) => void finishCardPointerDrag(event)}
                      onPointerCancel={cancelCardPointerDrag}
                    >
                      <div className="workboardRowIcon"><Users size={17} /></div>
                      <div className="workboardRowBody">
                        <div className="connectorTitle">
                          <strong>{card.title}</strong>
                        </div>
                        {card.body && <p>{card.body}</p>}
                        <div className="workboardMeta">
                          {cardAssigneeLabel(card) && <span><Users size={12} />{cardAssigneeLabel(card)}</span>}
                          <span><Clock size={12} />{relativeDate(card.updatedAt)}</span>
                          <span>{String(card.priority)}</span>
                          <span><MessageSquare size={12} />{cardSessionStateLabel(card)}</span>
                        </div>
                        <div className="tagList">
                          {card.labels.slice(0, 5).map((label) => <span key={label}>{label}</span>)}
                        </div>
                      </div>
                      <div className="workboardRowActions">
                        <button className="iconButton" onClick={() => void openCardTaskSession(card)} aria-label={`Open task session for ${card.title}`} title="Open task session">
                          <MessageSquare size={14} />
                        </button>
                        <button className="iconButton" onClick={() => openEditCard(card)} aria-label={`Edit ${card.title}`} title="Edit task">
                          <Pencil size={14} />
                        </button>
                        <button className="iconButton danger" onClick={() => hideTask(card)} aria-label={`Delete ${card.title}`} title="Delete task">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                  {cards.length === 0 && <div className="workboardRowEmpty">No tasks</div>}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="kanbanScroller">
          <div className="kanbanBoard" style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(300px, 300px))` }}>
            {columns.map((status) => {
              const cards = filteredCards.filter((card) => card.status === status);
              return (
                <section
                  className={`kanbanColumn ${dragTargetStatus === status ? "dropTarget" : ""}`}
                  data-workboard-status={status}
                  key={status}
                  onDragOver={(event) => allowCardDrop(event, status)}
                  onDragLeave={() => setDragTargetStatus(null)}
                  onDrop={(event) => void dropCard(event, status)}
                >
                  <div className="kanbanColumnHeader">
                    <strong>{formatStatusLabel(status)}</strong>
                  </div>
                  <div className="kanbanCardStack">
                    {cards.map((card) => (
                      <article
                        className={`kanbanCard ${cardLinkedToSelectedSession(card) ? "selected" : ""} ${pointerDraggingCardId === card.id ? "pointerDragging" : ""}`}
                        key={card.id}
                        draggable={!busy}
                        onClick={(event) => {
                          if (suppressNextCardClickRef.current) {
                            suppressNextCardClickRef.current = false;
                            return;
                          }
                          if ((event.target as HTMLElement).closest("a,button")) return;
                          void openCardTaskSession(card);
                        }}
                        onDragStart={(event) => startCardDrag(event, card)}
                        onDragEnd={() => setDragTargetStatus(null)}
                        onPointerDown={(event) => startCardPointerDrag(event, card)}
                        onPointerMove={moveCardPointerDrag}
                        onPointerUp={(event) => void finishCardPointerDrag(event)}
                        onPointerCancel={cancelCardPointerDrag}
                      >
                        <div className="connectorTitle">
                          <strong>{card.title}</strong>
                        </div>
                        {card.body && <p>{card.body}</p>}
                        <div className="workboardMeta">
                          {cardAssigneeLabel(card) && <span><Users size={12} />{cardAssigneeLabel(card)}</span>}
                          <span><Clock size={12} />{relativeDate(card.updatedAt)}</span>
                          <span>{String(card.priority)}</span>
                          <span><MessageSquare size={12} />{cardSessionStateLabel(card)}</span>
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
                        {card.sourceUrl && (
                          <a className="textLink" href={card.sourceUrl} target="_blank" rel="noreferrer">
                            <ExternalLink size={13} />
                            Source
                          </a>
                        )}
                        <div className="workboardCardActions">
                          <button className="button secondary" onClick={() => void openCardTaskSession(card)}>
                            <MessageSquare size={14} />
                            Session
                          </button>
                          {card.status === "todo" && (
                            <button className="button secondary" onClick={() => void updateCard(card, "in_progress")}>
                              <Play size={14} />
                              Start
                            </button>
                          )}
                          <button className="button secondary" onClick={() => openEditCard(card)}>
                            <Pencil size={14} />
                            Edit
                          </button>
                          {card.status === "done" && (
                            <>
                              <button className="button secondary" onClick={() => hideTask(card)}>
                                <ArchiveIcon size={14} />
                                Archive
                              </button>
                              <button className="button secondary danger" onClick={() => hideTask(card)}>
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    ))}
                    {cards.length === 0 && <div className="kanbanEmpty">No cards</div>}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

const baseLinkTrainingSessionEvent: GoogleCalendarEvent = {
  id: "link-training-session",
  title: "Schedule Link training session with Pete",
  time: "Tomorrow, Pick a time",
  attendees: "Pete",
  meetUrl: "https://calendar.app.google/ZW9BiqTwGaH4K62y8",
  notes: "Pick a time with Pete to walk through Link setup, Google Workspace access, phone workflows, and assistant configuration.",
  transcript: "",
  status: "upcoming",
};

function readFirstInstallDate() {
  if (typeof window === "undefined") return new Date();
  const key = "telnyx-link-first-installed-at";
  const stored = window.localStorage.getItem(key);
  if (stored) {
    const date = new Date(stored);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const now = new Date();
  window.localStorage.setItem(key, now.toISOString());
  return now;
}

function trainingSessionTimeFromInstall(firstInstallDate: Date) {
  const date = new Date(firstInstallDate);
  date.setDate(date.getDate() + 1);
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
  return `${dateLabel}, Pick a time`;
}

function calendarEventDateLabel(event: GoogleCalendarEvent) {
  const parts = event.time.split(",");
  if (parts.length <= 1) return event.time === "Time not set" ? "Date not set" : event.time;
  return parts.slice(0, -1).join(",").trim() || "Date not set";
}

function calendarEventTimeLabel(event: GoogleCalendarEvent) {
  const parts = event.time.split(",");
  return parts.length > 1 ? parts[parts.length - 1]!.trim() : event.time;
}

function calendarEventMeta(event: GoogleCalendarEvent) {
  return `${calendarEventDateLabel(event)} · ${calendarEventTimeLabel(event)} · ${event.attendees}`;
}

function calendarEventStartMs(event: GoogleCalendarEvent) {
  if (!event.start) return null;
  const value = new Date(event.start).getTime();
  return Number.isFinite(value) ? value : null;
}

function calendarEventEndMs(event: GoogleCalendarEvent) {
  if (!event.end) return calendarEventStartMs(event);
  const end = new Date(event.end).getTime();
  if (Number.isFinite(end)) return end;
  return calendarEventStartMs(event);
}

function isFutureCalendarEvent(event: GoogleCalendarEvent, nowMs = Date.now()) {
  const endMs = calendarEventEndMs(event);
  return event.status !== "past" && (endMs === null || endMs >= nowMs);
}

function calendarEventStatusLabel(event: GoogleCalendarEvent) {
  return event.status === "live" ? "live" : "future";
}

function CalendarView({
  connectors,
  linkedPhoneNumber,
  setView,
  refresh,
}: {
  connectors: ConnectorStatus[];
  linkedPhoneNumber: string;
  setView: (view: ViewId) => void;
  refresh: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [meetingBots, setMeetingBots] = useState<MeetingBotOption[]>([]);
  const [meetingInvites, setMeetingInvites] = useState<MeetingInvite[]>([]);
  const [inviteModalEvent, setInviteModalEvent] = useState<GoogleCalendarEvent | null>(null);
  const [inviteBotId, setInviteBotId] = useState("");
  const [inviteLiveJoin, setInviteLiveJoin] = useState(true);
  const [inviteSendUpdates, setInviteSendUpdates] = useState<"all" | "externalOnly" | "none">("all");
  const [invitePreflight, setInvitePreflight] = useState<MeetingBotInvitePreflight | null>(null);
  const [invitePreflightLoading, setInvitePreflightLoading] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [firstInstallDate] = useState(() => readFirstInstallDate());
  const linkTrainingSessionEvent = useMemo<GoogleCalendarEvent>(() => ({
    ...baseLinkTrainingSessionEvent,
    time: trainingSessionTimeFromInstall(firstInstallDate),
  }), [firstInstallDate]);
  const googleCalendar = connectors.find((connector) => connector.id === "google-calendar") ?? connectors.find((connector) => connector.id === "google-drive");
  const calendarReady = Boolean(googleCalendar && (googleCalendar.status === "connected" || googleCalendar.status === "signed_in"));
  const calendarQuery = query.trim().toLowerCase();
  const matchesCalendarQuery = (event: GoogleCalendarEvent) => `${event.title} ${event.attendees} ${event.notes ?? ""}`.toLowerCase().includes(calendarQuery);
  const realVisibleEvents = calendarReady ? calendarEvents.filter(matchesCalendarQuery) : [];
  const showTrainingSession = !calendarReady || (!loadingEvents && !calendarError && realVisibleEvents.length === 0);
  const trainingSessionEvents = showTrainingSession && matchesCalendarQuery(linkTrainingSessionEvent) ? [linkTrainingSessionEvent] : [];
  const visibleEvents = realVisibleEvents.length > 0 ? realVisibleEvents : trainingSessionEvents;
  const futureVisibleEvents = visibleEvents
    .filter((event) => isFutureCalendarEvent(event))
    .sort((first, second) => (calendarEventStartMs(first) ?? Number.MAX_SAFE_INTEGER) - (calendarEventStartMs(second) ?? Number.MAX_SAFE_INTEGER));
  const selectedEvent = selectedEventId ? visibleEvents.find((event) => event.id === selectedEventId) : undefined;

  async function refreshCalendarEvents() {
    if (!calendarReady) {
      setCalendarEvents([]);
      setCalendarError("");
      return;
    }
    setLoadingEvents(true);
    setCalendarError("");
    try {
      setCalendarEvents(await linkApi.listGoogleCalendarEvents());
    } catch (err) {
      setCalendarEvents([]);
      setCalendarError(err instanceof Error ? err.message : "Unable to load Google Calendar events.");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function refreshCalendarContext() {
    if (!calendarReady) {
      setMeetingBots([]);
      setMeetingInvites([]);
      return;
    }
    try {
      const [bots, invites] = await Promise.all([
        linkApi.listMeetingBots(),
        linkApi.listMeetingBotInvites(),
      ]);
      setMeetingBots(bots);
      setMeetingInvites(invites);
      setInviteBotId((current) => current || bots[0]?.id || "");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Unable to load meeting bot invite context.");
    }
  }

  async function refreshCalendarTableThenAll() {
    await refreshCalendarEvents();
    await refreshCalendarContext();
    await refresh();
  }

  useEffect(() => {
    let cancelled = false;
    async function refreshEvents() {
      if (!calendarReady) {
        setCalendarEvents([]);
        setCalendarError("");
        return;
      }
      setLoadingEvents(true);
      setCalendarError("");
      try {
        const events = await linkApi.listGoogleCalendarEvents();
        if (!cancelled) setCalendarEvents(events);
      } catch (err) {
        if (!cancelled) {
          setCalendarEvents([]);
          setCalendarError(err instanceof Error ? err.message : "Unable to load Google Calendar events.");
        }
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    }
    void refreshEvents();
    return () => {
      cancelled = true;
    };
  }, [calendarReady]);

  useEffect(() => {
    let cancelled = false;
    async function refreshMeetingInviteContext() {
      if (!calendarReady) {
        setMeetingBots([]);
        setMeetingInvites([]);
        return;
      }
      try {
        const [bots, invites] = await Promise.all([
          linkApi.listMeetingBots(),
          linkApi.listMeetingBotInvites(),
        ]);
        if (!cancelled) {
          setMeetingBots(bots);
          setMeetingInvites(invites);
          setInviteBotId((current) => current || bots[0]?.id || "");
        }
      } catch (err) {
        if (!cancelled) setInviteError(err instanceof Error ? err.message : "Unable to load meeting bot invite context.");
      }
    }
    void refreshMeetingInviteContext();
    return () => {
      cancelled = true;
    };
  }, [calendarReady]);

  useEffect(() => {
    let cancelled = false;
    async function runPreflight() {
      if (!inviteModalEvent || !inviteBotId || inviteModalEvent.id === linkTrainingSessionEvent.id) {
        setInvitePreflight(null);
        setInvitePreflightLoading(false);
        return;
      }
      setInvitePreflightLoading(true);
      setInviteError("");
      try {
        const preflight = await linkApi.preflightMeetingBotInvite({
          calendarId: "primary",
          eventId: inviteModalEvent.id,
          botId: inviteBotId,
        });
        if (!cancelled) setInvitePreflight(preflight);
      } catch (err) {
        if (!cancelled) {
          setInvitePreflight(null);
          setInviteError(err instanceof Error ? err.message : "Unable to preflight the meeting bot invite.");
        }
      } finally {
        if (!cancelled) setInvitePreflightLoading(false);
      }
    }
    void runPreflight();
    return () => {
      cancelled = true;
    };
  }, [inviteModalEvent, inviteBotId, linkTrainingSessionEvent.id]);

  function startMeeting(event: GoogleCalendarEvent) {
    setSelectedEventId(event.id);
    setActionStatus(event.id === linkTrainingSessionEvent.id ? "Opening Link training scheduler." : `Opening ${event.title} from Google Calendar.`);
    if (event.meetUrl) window.open(event.meetUrl, "_blank");
  }

  function startCall(event: GoogleCalendarEvent) {
    setSelectedEventId(event.id);
    if (!linkedPhoneNumber) {
      setActionStatus("Choose a Telnyx number on the Phone page before starting calls from Calendar.");
      setView("phone");
      return;
    }
    setActionStatus(`Starting call from ${linkedPhoneNumber} to ${event.phone ?? "the meeting contact"}.`);
  }

  function openInviteBot(event: GoogleCalendarEvent) {
    setSelectedEventId(event.id);
    setInviteModalEvent(event);
    setInviteError("");
    setInvitePreflight(null);
    setInviteBotId((current) => current || meetingBots[0]?.id || "");
    setActionStatus(`Preparing bot invite for ${event.title}.`);
  }

  async function submitMeetingBotInvite() {
    if (!inviteModalEvent || !inviteBotId) return;
    setInviteBusy(true);
    setInviteError("");
    try {
      const invite = await linkApi.inviteBotToCalendarEvent({
        calendarId: "primary",
        eventId: inviteModalEvent.id,
        botId: inviteBotId,
        liveJoin: inviteLiveJoin,
        sendUpdates: inviteSendUpdates,
      });
      const invites = await linkApi.listMeetingBotInvites();
      setMeetingInvites(invites);
      setActionStatus(meetingInviteActionStatus(invite));
      setInviteModalEvent(null);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Unable to invite the bot to this event.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function cancelMeetingInvite(invite: MeetingInvite) {
    setInviteBusy(true);
    setInviteError("");
    try {
      const updated = await linkApi.cancelMeetingBotInvite({ inviteId: invite.id });
      setMeetingInvites((current) => current.map((item) => item.id === updated.id ? updated : item));
      setActionStatus(`Cancelled ${invite.botName}'s live meeting invite.`);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Unable to cancel this meeting bot invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  function toggleEvent(event: GoogleCalendarEvent) {
    setSelectedEventId((current) => current === event.id ? "" : event.id);
    setActionStatus(currentEventActionLabel(event));
  }

  function currentEventActionLabel(event: GoogleCalendarEvent) {
    return event.id === linkTrainingSessionEvent.id ? "Selected Link training scheduler." : `Selected ${event.title}.`;
  }

  function renderCalendarEvent(event: GoogleCalendarEvent) {
    const expanded = selectedEvent?.id === event.id;
    const trainingSession = event.id === linkTrainingSessionEvent.id;
    const eventInvites = meetingInvites.filter((invite) => invite.eventId === event.id);
    const joinLabel = trainingSession ? "Booking" : event.meetUrl ? "Meet" : event.phone ? "Phone" : "None";
    return (
      <Fragment key={event.id}>
        <div
          className={`chatResultRow calendarResultRow ${expanded ? "expanded" : ""} ${trainingSession ? "sample" : ""}`}
          role="row"
          tabIndex={0}
          onClick={() => toggleEvent(event)}
          onKeyDown={(keyboardEvent) => {
            if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
              keyboardEvent.preventDefault();
              toggleEvent(event);
            }
          }}
        >
          <span className="calendarEventNameCell" role="cell">
            <strong>{event.title}</strong>
            <small>{event.notes || "No description saved."}</small>
          </span>
          <span role="cell">
            <strong>{calendarEventDateLabel(event)}</strong>
            <small>{calendarEventTimeLabel(event)}</small>
          </span>
          <span role="cell">{event.attendees || "No attendees"}</span>
          <span className="calendarJoinCell" role="cell">
            <Badge tone={event.status === "live" ? "success" : "warning"}>{calendarEventStatusLabel(event)}</Badge>
            <small>{joinLabel}</small>
          </span>
          <button
            className="chatSessionOpenButton"
            type="button"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              toggleEvent(event);
            }}
            aria-label={expanded ? `Collapse ${event.title}` : `Expand ${event.title}`}
            title={expanded ? "Collapse event" : "Expand event"}
          >
            <ChevronDown size={16} />
          </button>
        </div>
        {expanded && (
          <div className="calendarEventInlineDetails calendarTableDetails" role="row">
            <div className="calendarDetailBlock">
              <strong>Event description</strong>
              <p>{event.notes || "No description saved for this event."}</p>
            </div>
            <div className="phoneButtonRow">
              <button className="button primary" onClick={() => startMeeting(event)} disabled={!event.meetUrl}>
                <Play size={15} />
                {trainingSession ? "Schedule session" : "Start meeting"}
              </button>
              <button className="button secondary" onClick={() => startCall(event)} disabled={!event.phone || trainingSession}>
                <PhoneCall size={15} />
                Start call
              </button>
              <button className="button secondary" onClick={() => openInviteBot(event)} disabled={trainingSession || !calendarReady}>
                <Bot size={15} />
                Invite bot
              </button>
            </div>
            <small>{trainingSession ? "This opens Pete's Google Calendar booking page." : linkedPhoneNumber ? `Calls start from ${linkedPhoneNumber}.` : "Select a Telnyx number on Phone to place calls from Calendar."}</small>
            {eventInvites.length > 0 && (
              <div className="meetingInviteList" aria-label="Meeting bot invites">
                {eventInvites.map((invite) => (
                  <div className="meetingInviteRow" key={invite.id}>
                    <div>
                      <strong>{invite.botName}</strong>
                      <small>{invite.identity?.email || "AgentMail identity pending"}</small>
                      {invite.blockers.length > 0 && <small>{invite.blockers.join(" ")}</small>}
                    </div>
                    <span className={`meetingInviteStatus ${invite.status}`}>{meetingInviteStatusLabel(invite.status)}</span>
                    {invite.status === "scheduled" && (
                      <button className="iconButton" type="button" title="Cancel live join" aria-label={`Cancel ${invite.botName} live join`} onClick={() => void cancelMeetingInvite(invite)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {actionStatus && expanded && <div className="assistantNotice"><p>{actionStatus}</p></div>}
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <section className="content calendarView canonicalChat">
      <header className="pageHeader">
        <div>
          <h1>Calendar</h1>
        </div>
        <button
          className="button primary"
          type="button"
          onClick={() => {
            if (calendarReady) {
              window.open("https://calendar.google.com/calendar/u/0/r/eventedit", "_blank");
            } else {
              setView("settings");
            }
          }}
        >
          <Plus size={15} />
          Add Event
        </button>
      </header>

      {!calendarReady && (
        <section className="phoneSetupAlert calendarSetupAlert">
          <div>
            <strong>Connect Google Workspace to show calendar events.</strong>
            <p>Link verifies Google Calendar and Contacts access, then loads events so you can open meetings or start calls from events with phone numbers.</p>
          </div>
          <button className="runtimeSettingsButton" onClick={() => setView("settings")}>
            Connect Google Workspace
          </button>
        </section>
      )}

      <div className="chatSearchRow calendarControls">
        <button
          className={`iconButton agentFilterButton ${filtersOpen ? "selected" : ""}`}
          aria-label={filtersOpen ? "Hide calendar filters" : "Show calendar filters"}
          title={filtersOpen ? "Hide calendar filters" : "Show calendar filters"}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={16} />
        </button>
        <div className="explorerSearch compactSearch">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search calendar events" disabled={!calendarReady} />
        </div>
        <TableRefreshButton onClick={refreshCalendarTableThenAll} disabled={loadingEvents} label="Refresh calendar" />
      </div>

      {filtersOpen && (
        <div className="calendarFilterPanel">
          <div className="calendarFilterChips">
            <button className="button secondary" disabled={!calendarReady}>Today</button>
            <button className="button secondary" disabled={!calendarReady}>With description</button>
          </div>
          <span className="chatFilterCount">{futureVisibleEvents.length} future events</span>
        </div>
      )}

      <section className="agentDirectorySection calendarDirectorySection" aria-label="Google Calendar events">
        <div className="agentDirectorySectionHeader calendarDirectorySectionHeader">
          <h2>Upcoming</h2>
          <span>{futureVisibleEvents.length} {futureVisibleEvents.length === 1 ? "event" : "events"}</span>
        </div>
        <div className="chatSessionRows directoryTable calendarEventTable" role="table" aria-label="Google Calendar events">
          <div className="chatResultRow directoryResultRow calendarResultRow chatResultRowHead" role="row">
            <span role="columnheader">Event</span>
            <span role="columnheader">When</span>
            <span role="columnheader">People</span>
            <span role="columnheader">Join</span>
            <span role="columnheader" aria-label="Open event" />
          </div>
          <div className="chatResultRows" role="rowgroup">
            {futureVisibleEvents.map(renderCalendarEvent)}
            {calendarReady && loadingEvents && (
              <div className="tableEmptyState" role="row">
                <EmptyState title="Loading events" body="Loading Google Calendar events..." icon={CalendarDays} />
              </div>
            )}
            {calendarReady && calendarError && (
              <div className="tableEmptyState" role="row">
                <EmptyState title="Calendar unavailable" body={calendarError} icon={CalendarDays} />
              </div>
            )}
            {calendarReady && !loadingEvents && !calendarError && futureVisibleEvents.length === 0 && (
              <div className="tableEmptyState" role="row">
                <EmptyState
                  title={calendarQuery ? "No events found" : "No upcoming Google Calendar events found"}
                  body={calendarQuery
                    ? "Try another search term or filter."
                    : calendarEvents.length > 0
                      ? `${calendarEvents.length} calendar events loaded, but none are upcoming after filtering.`
                      : "Google Calendar is connected, but Link did not receive any events from your primary calendar for the next 180 days. Refresh or reconnect Google Workspace from Settings > Pairings if this looks wrong."}
                  icon={CalendarDays}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      {inviteModalEvent && (
        <MeetingBotInviteModal
          event={inviteModalEvent}
          bots={meetingBots}
          selectedBotId={inviteBotId}
          setSelectedBotId={setInviteBotId}
          liveJoin={inviteLiveJoin}
          setLiveJoin={setInviteLiveJoin}
          sendUpdates={inviteSendUpdates}
          setSendUpdates={setInviteSendUpdates}
          preflight={invitePreflight}
          loading={invitePreflightLoading}
          busy={inviteBusy}
          error={inviteError}
          onClose={() => setInviteModalEvent(null)}
          onSubmit={() => void submitMeetingBotInvite()}
        />
      )}
    </section>
  );
}

function MeetingBotInviteModal({
  event,
  bots,
  selectedBotId,
  setSelectedBotId,
  liveJoin,
  setLiveJoin,
  sendUpdates,
  setSendUpdates,
  preflight,
  loading,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  event: GoogleCalendarEvent;
  bots: MeetingBotOption[];
  selectedBotId: string;
  setSelectedBotId: (botId: string) => void;
  liveJoin: boolean;
  setLiveJoin: (value: boolean) => void;
  sendUpdates: "all" | "externalOnly" | "none";
  setSendUpdates: (value: "all" | "externalOnly" | "none") => void;
  preflight: MeetingBotInvitePreflight | null;
  loading: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const selectedBot = bots.find((bot) => bot.id === selectedBotId);
  const blockers = preflight?.blockers ?? [];
  const liveJoinBlockers = liveJoin ? preflight?.liveJoinBlockers ?? [] : [];
  const canSubmit = Boolean(selectedBotId && !busy && !loading && !error && blockers.length === 0 && bots.length > 0);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (canSubmit) onSubmit();
  }

  return (
    <div className="modalScrim meetingInviteScrim" role="presentation" onMouseDown={(mouseEvent) => {
      if (mouseEvent.target === mouseEvent.currentTarget) onClose();
    }}>
      <form className="memoryModal meetingInviteModal" onSubmit={submit} aria-label="Invite bot to Google Meet event">
        <header>
          <Bot size={17} />
          <h2>Invite bot</h2>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Close invite bot dialog">
            <X size={16} />
          </button>
        </header>
        <div className="meetingInviteModalBody">
          <div className="meetingInviteEventSummary">
            <strong>{event.title}</strong>
            <small>{calendarEventMeta(event)}</small>
          </div>
          <label className="field">
            <span>Bot</span>
            <select value={selectedBotId} onChange={(selectEvent) => setSelectedBotId(selectEvent.target.value)} disabled={busy || bots.length === 0}>
              {bots.length === 0 && <option value="">No bots available</option>}
              {bots.map((bot) => (
                <option value={bot.id} key={bot.id}>
                  {bot.displayName} · {meetingBotSourceLabel(bot)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Calendar updates</span>
            <select value={sendUpdates} onChange={(selectEvent) => setSendUpdates(selectEvent.target.value as "all" | "externalOnly" | "none")} disabled={busy}>
              <option value="all">Send to all guests</option>
              <option value="externalOnly">External guests only</option>
              <option value="none">No email update</option>
            </select>
          </label>
          <label className="meetingInviteToggle">
            <input type="checkbox" checked={liveJoin} onChange={(inputEvent) => setLiveJoin(inputEvent.target.checked)} disabled={busy} />
            <span>Live attendance</span>
          </label>
          {selectedBot && (
            <div className="meetingInviteAdapterSummary">
              <span>{selectedBot.adapter.kind === "telnyx_assistant" ? "Telnyx Assistant" : selectedBot.adapter.asyncOnly ? "Async agent" : "Conversation Relay"}</span>
              <small>{selectedBot.description}</small>
            </div>
          )}
          {loading && (
            <div className="assistantNotice">
              <p>Checking Calendar, AgentMail, and Telnyx bridge readiness...</p>
            </div>
          )}
          {!loading && preflight?.joinTarget && (
            <div className="assistantNotice">
              <p>Live join target: {preflight.joinTarget.type.toUpperCase()} · {preflight.joinTarget.label || preflight.joinTarget.dialTarget}</p>
            </div>
          )}
          {blockers.length > 0 && (
            <div className="assistantNotice warning">
              {blockers.map((blocker) => <p key={blocker}>{blocker}</p>)}
            </div>
          )}
          {liveJoinBlockers.length > 0 && (
            <div className="assistantNotice warning">
              {liveJoinBlockers.map((blocker) => <p key={blocker}>{blocker}</p>)}
            </div>
          )}
          {error && (
            <div className="assistantNotice warning">
              <p>{error}</p>
            </div>
          )}
        </div>
        <footer>
          <button className="button secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="button primary" type="submit" disabled={!canSubmit}>
            {busy ? <RefreshCw size={15} className="spinning" /> : <Mail size={15} />}
            Invite bot
          </button>
        </footer>
      </form>
    </div>
  );
}

function meetingBotSourceLabel(bot: MeetingBotOption) {
  if (bot.adapter.kind === "telnyx_assistant") return "Telnyx Assistant";
  if (bot.source === "slack") return "Slack";
  if (bot.source === "agent-control-plane") return "Hosted";
  if (bot.source === "a2a-discovery") return "A2A";
  return bot.source || bot.type;
}

function meetingInviteStatusLabel(status: MeetingInvite["status"]) {
  switch (status) {
    case "invited":
      return "Invited";
    case "scheduled":
      return "Scheduled";
    case "joining":
      return "Joining";
    case "joined":
      return "Joined";
    case "blocked":
      return "Blocked";
    case "ended":
      return "Ended";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function meetingInviteActionStatus(invite: MeetingInvite) {
  if (invite.status === "scheduled") return `${invite.botName} was invited and live join is scheduled.`;
  if (invite.status === "joining") return `${invite.botName} was invited and Telnyx is joining the meeting.`;
  if (invite.status === "blocked") return `${invite.botName} was invited by email, but live join is blocked.`;
  if (invite.status === "failed") return `${invite.botName} was invited by email, but live join failed.`;
  return `${invite.botName} was invited to the Calendar event.`;
}

function PhoneView({
  connectors,
  linkedPhoneNumber,
  setLinkedPhoneNumber,
  setView,
  tab,
  setTab,
  refresh,
  startManagedSkillSetupChat,
  startEmailDraftChat = async () => {},
  openNewCall = () => {},
  standaloneInbox = false,
  hideSectionSidebar = false,
  hideHeader = false,
  headerParent,
  embedded = false,
}: {
  connectors: ConnectorStatus[];
  linkedPhoneNumber: string;
  setLinkedPhoneNumber: (phoneNumber: string) => void;
  setView: (view: ViewId) => void;
  tab: PhoneViewTab;
  setTab: (tab: PhoneViewTab) => void;
  refresh: () => Promise<void>;
  startManagedSkillSetupChat: (skill: { label: string; query: string; connectorName: string }) => Promise<void>;
  startEmailDraftChat?: (prompt: string) => Promise<void>;
  openNewCall?: () => void;
  standaloneInbox?: boolean;
  hideSectionSidebar?: boolean;
  hideHeader?: boolean;
  headerParent?: string;
  embedded?: boolean;
}) {
  const [telnyxCredentialReady, setTelnyxCredentialReady] = useState(false);
  const [phoneAssistants, setPhoneAssistants] = useState<PhoneAssistantOption[]>([]);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantFiltersOpen, setAssistantFiltersOpen] = useState(false);
  const [assistantStatusFilter, setAssistantStatusFilter] = useState("all");
  const [selectedAssistantId, setSelectedAssistantId] = useState("");
  const [selectedAssistantTab, setSelectedAssistantTab] = useState<"overview" | "phone" | "settings">("overview");
  const [numbers, setNumbers] = useState<PhoneNumberOption[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumberOption | null>(null);
  const [dialNumber, setDialNumber] = useState("");
  const [callQuery, setCallQuery] = useState("");
  const [callFiltersOpen, setCallFiltersOpen] = useState(false);
  const [callAgentFilter, setCallAgentFilter] = useState("all");
  const [callDirectionFilter, setCallDirectionFilter] = useState("all");
  const [callStatusFilter, setCallStatusFilter] = useState("all");
  const [callHistoryRows, setCallHistoryRows] = useState<PhoneCallHistoryRow[]>([]);
  const [loadingCallHistory, setLoadingCallHistory] = useState(false);
  const [hiddenCallIds, setHiddenCallIds] = useState<string[]>(() => readStoredIdList("telnyx-link-hidden-call-ids"));
  const [callBulkEdit, setCallBulkEdit] = useState(false);
  const [selectedCallRowIds, setSelectedCallRowIds] = useState<string[]>([]);
  const [contactQuery, setContactQuery] = useState("");
  const [contactSource, setContactSource] = useState("all");
  const [contactFiltersOpen, setContactFiltersOpen] = useState(false);
  const [expandedContactId, setExpandedContactId] = useState("");
  const [googleContacts, setGoogleContacts] = useState<GoogleContact[]>([]);
  const [loadingGoogleContacts, setLoadingGoogleContacts] = useState(false);
  const [googleContactsError, setGoogleContactsError] = useState("");
  const [inboxQuery, setInboxQuery] = useState("");
  const [inboxFiltersOpen, setInboxFiltersOpen] = useState(false);
  const [inboxThreads, setInboxThreads] = useState<GoogleInboxThreadSummary[]>([]);
  const [readInboxThreads, setReadInboxThreads] = useState<GoogleInboxThreadSummary[]>([]);
  const [selectedInboxThreadId, setSelectedInboxThreadId] = useState("");
  const [selectedInboxThread, setSelectedInboxThread] = useState<GoogleInboxThread | null>(null);
  const [inboxConnectedOverride, setInboxConnectedOverride] = useState(false);
  const [hiddenInboxThreadIds] = useState<string[]>(() => readStoredIdList("telnyx-link-hidden-inbox-thread-ids"));
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingInboxThread, setLoadingInboxThread] = useState(false);
  const [inboxError, setInboxError] = useState("");
  const [inboxStatus, setInboxStatus] = useState("");
  const [draftingWithAgent, setDraftingWithAgent] = useState(false);
  const [savingInboxDraft, setSavingInboxDraft] = useState(false);
  const [inboxDraftTo, setInboxDraftTo] = useState("");
  const [inboxDraftSubject, setInboxDraftSubject] = useState("");
  const [inboxDraftBody, setInboxDraftBody] = useState("");
  const [savedInboxDraft, setSavedInboxDraft] = useState<GoogleInboxDraft | null>(null);
  const [dismissedContactSkillIds, setDismissedContactSkillIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(window.localStorage.getItem("telnyx-link-dismissed-contact-skill-prompts") ?? "[]");
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const contactSources = [
    { id: "telnyx", label: "Telnyx", connectorIds: ["telnyx"] },
    { id: "google", label: "Google", connectorIds: ["google", "google-drive", "google-calendar", "google-workspace"] },
    { id: "salesforce", label: "Salesforce", connectorIds: ["salesforce"] },
    { id: "salesloft", label: "Salesloft", connectorIds: ["salesloft"] },
  ];
  const contactManagedSkillLinks = [
    { id: "google", label: "Google Contacts", query: "google-agent", connectorName: "Google", connectorIds: ["google", "google-drive", "google-calendar", "google-workspace"] },
    { id: "salesforce", label: "Salesforce Contacts", query: "Salesforce", connectorName: "Salesforce", connectorIds: ["salesforce"] },
  ];
  const connectedContactSourceIds = new Set(
    connectors
      .filter((connector) => connector.status === "connected" || connector.status === "signed_in")
      .map((connector) => connector.id),
  );
  const telnyxConnectorReady = connectors.some((connector) => connector.id === "telnyx" && (connector.status === "connected" || connector.status === "signed_in"));
  const googleContactsReady = connectors.some((connector) => ["google-drive", "google-calendar"].includes(connector.id) && (connector.status === "connected" || connector.status === "signed_in"));
  const inboxReady = inboxConnectedOverride || connectors.some((connector) => connector.id === "google-inbox" && (connector.status === "connected" || connector.status === "signed_in"));
  const telnyxApiReady = telnyxCredentialReady || telnyxConnectorReady;
  const visibleContactSkillLinks = contactManagedSkillLinks.filter((link) =>
    !dismissedContactSkillIds.includes(link.id) &&
    !link.connectorIds.some((connectorId) => connectedContactSourceIds.has(connectorId)),
  );
  const addContactSkillLink = visibleContactSkillLinks[0] ?? contactManagedSkillLinks[0];
  const selectedContactSource = contactSources.find((source) => source.id === contactSource);
  const contactSourceMatches = (sourceId: string, selectedSourceId: string) => {
    if (selectedSourceId === "all") return true;
    const selectedSource = contactSources.find((source) => source.id === selectedSourceId);
    return sourceId === selectedSourceId || Boolean(selectedSource?.connectorIds.includes(sourceId));
  };
  const linkBotAssistant = phoneAssistants.find((assistant) => /(^|\s)link(\s|$)/i.test(assistant.name)) ?? phoneAssistants[0];
  const callAgentOptions = [
    { id: "link", label: "Link" },
    ...phoneAssistants.map((assistant) => ({ id: assistant.id, label: assistant.name })),
  ];
  const assistantStatusOptions = useMemo(() => {
    const statuses = phoneAssistants
      .map((assistant) => assistant.status || "Available")
      .filter((status, index, all) => all.indexOf(status) === index)
      .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
    return ["all", ...statuses];
  }, [phoneAssistants]);
  const filteredPhoneAssistants = useMemo(() => {
    const query = assistantQuery.trim().toLowerCase();
    return phoneAssistants.filter((assistant) => {
      const status = assistant.status || "Available";
      const matchesStatus = assistantStatusFilter === "all" || status === assistantStatusFilter;
      const matchesQuery = !query || `${assistant.name} ${assistant.id} ${assistant.phoneNumber ?? ""} ${status} ${assistant.description ?? ""}`.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [assistantQuery, assistantStatusFilter, phoneAssistants]);
  const selectedAssistant = phoneAssistants.find((assistant) => assistant.id === selectedAssistantId) ?? null;
  const filteredCallRows = callHistoryRows.filter((call) => {
    if (hiddenCallIds.includes(call.id)) return false;
    const term = callQuery.trim().toLowerCase();
    const matchesQuery = !term || `${call.contact} ${call.number} ${call.agentName} ${call.direction} ${call.status}`.toLowerCase().includes(term);
    const matchesAgent = callAgentFilter === "all" || call.agentId === callAgentFilter;
    const matchesDirection = callDirectionFilter === "all" || call.direction === callDirectionFilter;
    const matchesStatus = callStatusFilter === "all" || call.status === callStatusFilter;
    return matchesQuery && matchesAgent && matchesDirection && matchesStatus;
  });
  const visibleInboxThreads = useMemo(() => {
    const hidden = new Set(hiddenInboxThreadIds);
    return inboxThreads.filter((thread) => !hidden.has(thread.threadId));
  }, [hiddenInboxThreadIds, inboxThreads]);
  const visibleReadInboxThreads = useMemo(() => {
    const hidden = new Set(hiddenInboxThreadIds);
    return readInboxThreads.filter((thread) => !hidden.has(thread.threadId));
  }, [hiddenInboxThreadIds, readInboxThreads]);
  const telnyxBotContacts = [
    {
      id: "telnyx-link-bot",
      name: "Link Bot",
      role: "Telnyx bot",
      phone: linkBotAssistant?.phoneNumber ?? "",
      source: "telnyx",
      detail: linkBotAssistant ? `${linkBotAssistant.name} from Telnyx Voice AI.` : "Default Link bot contact. Connect a Telnyx Voice AI assistant with a phone number to call it.",
      connected: Boolean(telnyxApiReady && linkBotAssistant?.phoneNumber),
    },
    ...phoneAssistants
      .filter((assistant) => assistant.id !== linkBotAssistant?.id)
      .map((assistant) => ({
        id: `telnyx-bot-${assistant.id}`,
        name: assistant.name,
        role: "Telnyx bot",
        phone: assistant.phoneNumber ?? "",
        source: "telnyx",
        detail: assistant.description || "Telnyx Voice AI assistant contact.",
        connected: Boolean(telnyxApiReady && assistant.phoneNumber),
      })),
  ];
  const contactDirectory: {
    id: string;
    name: string;
    role: string;
    phone: string;
    source: string;
    detail: string;
    connected?: boolean;
  }[] = [...telnyxBotContacts, ...googleContacts];
  const filteredContacts = contactDirectory.filter((contact) => {
    const matchesQuery = `${contact.name} ${contact.role} ${contact.phone} ${contact.detail}`.toLowerCase().includes(contactQuery.toLowerCase());
    const matchesSource = contactSourceMatches(contact.source, contactSource);
    return matchesQuery && matchesSource;
  });

  async function refreshCredentialStatus() {
    const groups = await linkApi.listCredentials();
    const telnyx = groups.find((group) => group.id === "telnyx");
    setTelnyxCredentialReady(Boolean(telnyx?.fields.some((field) => field.name === "TELNYX_API_KEY" && field.configured)));
  }

  async function refreshPhoneAssistants() {
    if (!telnyxApiReady) {
      setPhoneAssistants([]);
      return;
    }
    try {
      const assistants = await linkApi.listPhoneAssistants();
      setPhoneAssistants(assistants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Telnyx Voice AI assistants.");
      setPhoneAssistants([]);
    }
  }

  async function refreshPhoneCallHistory() {
    if (!telnyxApiReady) {
      setCallHistoryRows([]);
      return;
    }
    setLoadingCallHistory(true);
    setError("");
    try {
      setCallHistoryRows(await linkApi.listPhoneCallHistory({ maxResults: 50 }));
    } catch (err) {
      setCallHistoryRows([]);
      setError(err instanceof Error ? err.message : "Unable to load Telnyx call detail records.");
    } finally {
      setLoadingCallHistory(false);
    }
  }

  useEffect(() => {
    void refreshCredentialStatus();
    window.addEventListener("focus", refreshCredentialStatus);
    return () => window.removeEventListener("focus", refreshCredentialStatus);
  }, [telnyxConnectorReady]);

  useEffect(() => {
    void refreshPhoneAssistants();
  }, [telnyxApiReady]);

  useEffect(() => {
    if (tab === "calls") void refreshPhoneCallHistory();
  }, [tab, telnyxApiReady]);

  useEffect(() => {
    if (selectedAssistantId && !phoneAssistants.some((assistant) => assistant.id === selectedAssistantId)) {
      setSelectedAssistantId("");
      setSelectedAssistantTab("overview");
    }
  }, [phoneAssistants, selectedAssistantId]);

  useEffect(() => {
    if (tab !== "assistants") return;
    setAssistantQuery("");
    setAssistantFiltersOpen(false);
    setAssistantStatusFilter("all");
    setSelectedAssistantId("");
    setSelectedAssistantTab("overview");
  }, [tab]);

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-dismissed-contact-skill-prompts", JSON.stringify(dismissedContactSkillIds));
  }, [dismissedContactSkillIds]);

  useEffect(() => {
    let cancelled = false;
    async function refreshGoogleContacts() {
      if (tab !== "contacts" || !googleContactsReady) {
        setGoogleContacts([]);
        setGoogleContactsError("");
        return;
      }
      setLoadingGoogleContacts(true);
      setGoogleContactsError("");
      try {
        const contacts = await linkApi.listGoogleContacts();
        if (!cancelled) setGoogleContacts(contacts);
      } catch (err) {
        if (!cancelled) {
          setGoogleContacts([]);
          setGoogleContactsError(err instanceof Error ? err.message : "Unable to load Google contacts.");
        }
      } finally {
        if (!cancelled) setLoadingGoogleContacts(false);
      }
    }
    void refreshGoogleContacts();
    return () => {
      cancelled = true;
    };
  }, [tab, googleContactsReady]);

  useEffect(() => {
    let cancelled = false;
    async function refreshInboxThreads() {
      if (tab !== "inbox" || !inboxReady) {
        setInboxThreads([]);
        setReadInboxThreads([]);
        setSelectedInboxThreadId("");
        setSelectedInboxThread(null);
        setInboxError("");
        return;
      }
      setLoadingInbox(true);
      setInboxError("");
      try {
        const [threads, readThreads] = await Promise.all([
          linkApi.listGoogleInboxThreads({ query: inboxQuery, maxResults: 20 }),
          linkApi.listGoogleInboxThreads({ query: inboxReadQuery(inboxQuery), maxResults: 20 }),
        ]);
        if (!cancelled) {
          setInboxThreads(threads);
          setReadInboxThreads(readThreads);
          const knownThreadIds = new Set([...threads, ...readThreads].map((thread) => thread.threadId));
          setSelectedInboxThreadId((current) => current && knownThreadIds.has(current) ? current : "");
        }
      } catch (err) {
        if (!cancelled) {
          setInboxThreads([]);
          setReadInboxThreads([]);
          setInboxError(err instanceof Error ? err.message : "Unable to load Google Inbox threads.");
        }
      } finally {
        if (!cancelled) setLoadingInbox(false);
      }
    }
    void refreshInboxThreads();
    return () => {
      cancelled = true;
    };
  }, [tab, inboxReady]);

  useEffect(() => {
    let cancelled = false;
    async function loadInboxThread() {
      if (tab !== "inbox" || !inboxReady || !selectedInboxThreadId) {
        setSelectedInboxThread(null);
        return;
      }
      setLoadingInboxThread(true);
      setInboxError("");
      try {
        const thread = await linkApi.getGoogleInboxThread({ threadId: selectedInboxThreadId });
        if (!cancelled) {
          setSelectedInboxThread(thread);
          setInboxDraftTo(thread.replyTo || "");
          setInboxDraftSubject(replySubject(thread.subject));
          setInboxDraftBody("");
          setSavedInboxDraft(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedInboxThread(null);
          setInboxError(err instanceof Error ? err.message : "Unable to load the selected Google Inbox thread.");
        }
      } finally {
        if (!cancelled) setLoadingInboxThread(false);
      }
    }
    void loadInboxThread();
    return () => {
      cancelled = true;
    };
  }, [tab, inboxReady, selectedInboxThreadId]);

  async function connectGoogleInbox() {
    setLoadingInbox(true);
    setInboxError("");
    setInboxStatus("Connecting Gmail through gog...");
    try {
      await linkApi.connectGoogleInboxWithGog();
      setInboxConnectedOverride(true);
      await refresh();
      const [threads, readThreads] = await Promise.all([
        linkApi.listGoogleInboxThreads({ query: inboxQuery, maxResults: 20 }),
        linkApi.listGoogleInboxThreads({ query: inboxReadQuery(inboxQuery), maxResults: 20 }),
      ]);
      setInboxThreads(threads);
      setReadInboxThreads(readThreads);
      setSelectedInboxThreadId("");
      setSelectedInboxThread(null);
      setInboxStatus("Google Inbox connected. Link can read threads and save drafts, but cannot send from Electron.");
    } catch (err) {
      setInboxError(err instanceof Error ? err.message : "Unable to connect Google Inbox.");
      setInboxStatus("");
    } finally {
      setLoadingInbox(false);
    }
  }

  async function searchInboxThreads() {
    if (!inboxReady) {
      setInboxStatus("Connect Google Inbox before searching.");
      return;
    }
    setLoadingInbox(true);
    setInboxError("");
    try {
      const [threads, readThreads] = await Promise.all([
        linkApi.listGoogleInboxThreads({ query: inboxQuery, maxResults: 20 }),
        linkApi.listGoogleInboxThreads({ query: inboxReadQuery(inboxQuery), maxResults: 20 }),
      ]);
      setInboxThreads(threads);
      setReadInboxThreads(readThreads);
      setSelectedInboxThreadId("");
      setSelectedInboxThread(null);
      setInboxStatus(
        threads.length
          ? `Loaded ${threads.length} unread inbox thread${threads.length === 1 ? "" : "s"} and ${readThreads.length} read thread${readThreads.length === 1 ? "" : "s"}.`
          : inboxQuery.trim()
            ? "No unread inbox messages matched this search."
            : "Inbox connected. 0 unread messages.",
      );
    } catch (err) {
      setInboxThreads([]);
      setReadInboxThreads([]);
      setSelectedInboxThreadId("");
      setInboxError(err instanceof Error ? err.message : "Unable to search Google Inbox.");
    } finally {
      setLoadingInbox(false);
    }
  }

  async function refreshPhoneTableThenAll() {
    if (tab === "inbox") {
      await searchInboxThreads();
    } else if (tab === "assistants") {
      await refreshPhoneAssistants();
    } else if (tab === "calls") {
      await refreshPhoneCallHistory();
    } else if (tab === "numbers" && telnyxApiReady) {
      await refreshAccountNumbers();
    }
    await refresh();
  }

  function hideCallRow(call: PhoneCallHistoryRow) {
    setHiddenCallIds((current) => {
      const next = current.includes(call.id) ? current : [...current, call.id];
      window.localStorage.setItem("telnyx-link-hidden-call-ids", JSON.stringify(next));
      return next;
    });
  }

  function setCallRowSelected(callId: string, selected: boolean) {
    setSelectedCallRowIds((current) => selected ? current.includes(callId) ? current : [...current, callId] : current.filter((id) => id !== callId));
  }

  function toggleCallBulkEdit() {
    setCallBulkEdit((active) => !active);
    setSelectedCallRowIds([]);
  }

  function hideSelectedCallRows() {
    const selectedIds = new Set(selectedCallRowIds);
    filteredCallRows.filter((call) => selectedIds.has(call.id)).forEach(hideCallRow);
    setSelectedCallRowIds([]);
    setCallBulkEdit(false);
  }

  async function draftInboxReplyWithAgent() {
    if (!selectedInboxThread) {
      setInboxStatus("Choose an inbox thread before drafting.");
      return;
    }
    setDraftingWithAgent(true);
    setInboxError("");
    setInboxStatus("Asking Link to draft a reply...");
    try {
      const session = await linkApi.sendChatMessage({
        workspaceId: "workspace-link",
        approvalMode: "review",
        modelMode: "auto/ask-before-cloud",
        contextScope: "inbox-draft",
        systemInstruction: "Draft only a concise, customer-safe email reply. Do not say you sent anything. Do not include internal rationale or instructions.",
        content: buildInboxDraftPrompt(selectedInboxThread),
      });
      const assistantMessage = [...session.messages].reverse().find((message) => message.role === "assistant" && message.content.trim());
      const draft = assistantMessage?.content.trim() || "";
      setInboxDraftBody(draft);
      setInboxStatus(draft ? "Draft ready for review. Save it to Gmail Drafts when you are comfortable with it." : "The agent returned no draft text.");
    } catch (err) {
      setInboxError(err instanceof Error ? err.message : "Unable to draft a reply with Link.");
      setInboxStatus("");
    } finally {
      setDraftingWithAgent(false);
    }
  }

  async function saveInboxDraft() {
    if (!selectedInboxThread) {
      setInboxStatus("Choose an inbox thread before saving a draft.");
      return;
    }
    if (!inboxDraftBody.trim()) {
      setInboxStatus("Draft body is empty.");
      return;
    }
    setSavingInboxDraft(true);
    setInboxError("");
    try {
      const draftInput = {
        draftId: savedInboxDraft?.draftId || undefined,
        threadId: selectedInboxThread.threadId,
        replyToMessageId: selectedInboxThread.replyToMessageId,
        to: inboxDraftTo,
        subject: inboxDraftSubject,
        body: inboxDraftBody,
      };
      const draft = savedInboxDraft?.draftId
        ? await linkApi.updateGoogleInboxDraft({ ...draftInput, draftId: savedInboxDraft.draftId })
        : await linkApi.createGoogleInboxDraft(draftInput);
      setSavedInboxDraft(draft);
      setInboxStatus("Saved to Gmail Drafts. Link still cannot send this message from Electron.");
    } catch (err) {
      setInboxError(err instanceof Error ? err.message : "Unable to save Gmail draft.");
    } finally {
      setSavingInboxDraft(false);
    }
  }

  async function startInboxDraftEmailChat() {
    setInboxError("");
    const prompt = selectedInboxThread
      ? buildInboxDraftPrompt(selectedInboxThread)
      : [
          "Help me draft an email in Gmail.",
          "",
          "Ask me for the recipient, subject, audience, context, desired tone, and any constraints before writing.",
          "Do not send the email. Prepare draft copy only and call out anything that needs human review before saving to Gmail Drafts.",
        ].join("\n");
    setInboxStatus(selectedInboxThread ? "Opening a chat to draft a reply for the selected thread..." : "Opening a chat to draft a new email...");
    try {
      await startEmailDraftChat(prompt);
    } catch (err) {
      setInboxError(err instanceof Error ? err.message : "Unable to start an email draft chat.");
      setInboxStatus("");
    }
  }

  function openSelectedThreadInGmail() {
    const url = savedInboxDraft?.url
      || selectedInboxThread?.url
      || (selectedInboxThreadId ? `https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(selectedInboxThreadId)}` : "https://mail.google.com/mail/u/0/#inbox");
    window.open(url, "_blank");
  }

	  function renderInboxThreadRow(thread: GoogleInboxThreadSummary) {
	    const selected = selectedInboxThreadId === thread.threadId;
	    const openThread = () => setSelectedInboxThreadId(thread.threadId);
	    return (
	      <div
	        key={thread.threadId}
	        className={`chatResultRow directoryResultRow phoneInboxThread phoneInboxRow ${selected ? "selected" : ""}`}
	        onClick={openThread}
	        role="row"
	        tabIndex={0}
	        onKeyDown={(event) => {
	          if (event.key === "Enter" || event.key === " ") {
	            event.preventDefault();
	            openThread();
	          }
	        }}
	        aria-label={`Open inbox thread ${thread.subject || "Untitled"}`}
      >
        <span className="phoneInboxFromCell" role="cell">
          {thread.from || "Unknown sender"}
        </span>
        <span className="phoneInboxSubjectCell" role="cell">
          <strong>{thread.subject || "No subject"}</strong>
          <small>{thread.snippet || "No preview available."}</small>
        </span>
        <span role="cell">{thread.date || "No date"}</span>
        <span role="cell">
          <em>{thread.unread ? "Unread" : "Read"}</em>
        </span>
	        <button
	          className="chatSessionOpenButton"
	          type="button"
	          onClick={(event) => {
	            event.stopPropagation();
	            openThread();
	          }}
	          aria-label={`Open inbox thread ${thread.subject || "Untitled"}`}
	          title="Open thread"
	        >
	          <ArrowRight size={16} />
	        </button>
	      </div>
	    );
	  }

  useEffect(() => {
    if (tab === "numbers" && telnyxApiReady) void refreshAccountNumbers();
  }, [tab, telnyxApiReady]);

  async function refreshAccountNumbers() {
    setBusy(true);
    setError("");
    try {
      const results = await linkApi.listAccountPhoneNumbers();
      setNumbers(results);
      setSelectedNumber((current) => {
        const next = current && results.some((number) => number.phoneNumber === current.phoneNumber) ? current : results[0] ?? null;
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Telnyx numbers.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (telnyxApiReady) void refreshAccountNumbers();
  }, [telnyxApiReady]);

  useEffect(() => {
    setLinkedPhoneNumber(selectedNumber?.phoneNumber ?? "");
  }, [selectedNumber, setLinkedPhoneNumber]);

  function dismissContactSkillPrompt(id: string) {
    setDismissedContactSkillIds((current) => current.includes(id) ? current : [...current, id]);
  }

  const phoneSectionHeading = {
    calls: ["Calls", Phone],
    contacts: ["Contacts", Users],
    assistants: ["Assistants", Bot],
    inbox: ["Inbox", Inbox],
    numbers: ["Numbers", PhoneCall],
  } satisfies Record<PhoneViewTab, [string, AppIcon]>;
  const [phoneHeadingTitle] = phoneSectionHeading[tab];
  const showSectionSidebar = !standaloneInbox && !hideSectionSidebar;
  const sectionParent = headerParent ?? (standaloneInbox ? "Link" : "Calls");
  const phoneHeaderAction = tab === "calls" ? (
    <button className="button primary" type="button" onClick={openNewCall}>
      <Plus size={15} />
      New Call
    </button>
  ) : tab === "inbox" ? (
    <button className="button primary" type="button" onClick={() => void startInboxDraftEmailChat()}>
      <Plus size={15} />
      Draft Email
    </button>
  ) : tab === "numbers" ? (
    <button className="button primary" type="button" onClick={() => window.open("https://portal.telnyx.com/#/app/numbers/my-numbers", "_blank")}>
      Open Telnyx Portal
    </button>
  ) : null;

  return (
    <section className={embedded ? "phoneView settingsPhoneView" : `content phoneView ${standaloneInbox ? "standaloneInboxView" : ""}`}>
      <div className={`pageSectionShell ${!showSectionSidebar ? "pageSectionShellSingle" : ""}`}>
        {showSectionSidebar && (
          <PageSectionSidebar
            tabs={[
              ["calls", "Calls", Phone],
              ["contacts", "Contacts", Users],
              ["assistants", "Assistants", Bot],
              ["numbers", "Numbers", PhoneCall],
            ] as const}
            activeTab={tab}
            onSelect={setTab}
            label="Phone sections"
          />
        )}
        <div className="pageSectionMain">
          {!hideHeader && <PageSectionHeader parent={sectionParent} title={phoneHeadingTitle} action={phoneHeaderAction} />}

      {tab === "inbox" && selectedInboxThreadId && (
        <section className="phoneInboxTable phoneContentTable phoneInboxDetailScreen" aria-label="Selected inbox thread">
          <div className="phoneInboxDetail phoneInboxDetailPage">
            {loadingInboxThread && <div className="phoneNumberEmpty">Loading thread...</div>}
            {!loadingInboxThread && selectedInboxThread && (
              <>
                <header className="phoneInboxDetailHeader">
                  <div className="chatDetailTitleGroup">
                    <button
                      className="iconButton chatDetailBackButton"
                      type="button"
                      onClick={() => setSelectedInboxThreadId("")}
                      aria-label="Back to inbox"
                      title="Back to inbox"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h2>{selectedInboxThread.subject || "(No subject)"}</h2>
                      <p>{selectedInboxThread.participants.join(", ") || selectedInboxThread.from || "Unknown sender"}</p>
                    </div>
                  </div>
                  <div className="phoneInboxDetailActions">
                    <Badge tone={selectedInboxThread.unread ? "warning" : "success"}>{selectedInboxThread.unread ? "Unread" : "Read"}</Badge>
                    <button
                      className="iconButton"
                      type="button"
                      aria-label="Open in Gmail"
                      title="Open in Gmail"
                      onClick={openSelectedThreadInGmail}
                    >
                      <ExternalLink size={17} />
                    </button>
                  </div>
                </header>

                <div className="phoneInboxMessages" aria-label="Thread messages">
                  {selectedInboxThread.messages.map((message) => (
                    <article className="phoneInboxMessage" key={message.id}>
                      <header>
                        <strong>{message.from}</strong>
                        <span>{message.date || "No date"}</span>
                      </header>
                      <p>{message.body || message.snippet || "No message body available."}</p>
                    </article>
                  ))}
                </div>

                <section className="phoneInboxDraftComposer" aria-label="Gmail draft composer">
                  <div className="phoneInboxDraftFields">
                    <label className="componentField">
                      <span>To</span>
                      <input value={inboxDraftTo} onChange={(event) => setInboxDraftTo(event.target.value)} placeholder="recipient@example.com" />
                    </label>
                    <label className="componentField">
                      <span>Subject</span>
                      <input value={inboxDraftSubject} onChange={(event) => setInboxDraftSubject(event.target.value)} placeholder="Re: Subject" />
                    </label>
                  </div>
                  <label className="componentField">
                    <span>Draft</span>
                    <textarea value={inboxDraftBody} onChange={(event) => setInboxDraftBody(event.target.value)} placeholder="Ask an agent to draft a reply, or write one here..." />
                  </label>
                  <div className="phoneButtonRow">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => void draftInboxReplyWithAgent()}
                      disabled={draftingWithAgent}
                    >
                      <Bot size={15} />
                      {draftingWithAgent ? "Drafting..." : "Draft with Link"}
                    </button>
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => void saveInboxDraft()}
                      disabled={savingInboxDraft || !inboxDraftBody.trim()}
                    >
                      <Save size={15} />
                      {savingInboxDraft ? "Saving..." : savedInboxDraft ? "Update Gmail draft" : "Save Gmail draft"}
                    </button>
                  </div>
                </section>
              </>
            )}
            {!loadingInboxThread && !selectedInboxThread && (
              <div className="phoneNumberEmpty">
                <button
                  className="iconButton chatDetailBackButton"
                  type="button"
                  onClick={() => setSelectedInboxThreadId("")}
                  aria-label="Back to inbox"
                  title="Back to inbox"
                >
                  <ArrowLeft size={18} />
                </button>
                Choose an inbox thread to read it and prepare a draft.
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "inbox" && !selectedInboxThreadId && (
        <section className="phoneInboxTable phoneContentTable" aria-label="Google Inbox">
          {!inboxReady && (
            <div className="phoneSetupAlert inboxSetupAlert">
              <div>
                <strong>Connect Google Inbox to read threads and save Gmail drafts.</strong>
                <p>Link uses gog with an app-level no-send guard. Drafts are saved to Gmail Drafts, and sending happens only in Gmail outside Electron.</p>
              </div>
              <button
                className="runtimeSettingsButton"
                type="button"
                onClick={() => void connectGoogleInbox()}
                disabled={loadingInbox}
              >
                <Mail size={14} />
                {loadingInbox ? "Connecting..." : "Connect Inbox"}
              </button>
            </div>
          )}

          <header className="phoneInboxToolbar">
            <div className="chatSearchRow phoneInboxSearchRow">
              <button
                className={`iconButton agentFilterButton ${inboxFiltersOpen ? "selected" : ""}`}
                type="button"
                aria-label={inboxFiltersOpen ? "Hide inbox filters" : "Show inbox filters"}
                title={inboxFiltersOpen ? "Hide inbox filters" : "Show inbox filters"}
                onClick={() => setInboxFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal size={16} />
              </button>
              <div className="explorerSearch compactSearch">
                <Search size={16} />
                <input
                  value={inboxQuery}
                  onChange={(event) => setInboxQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void searchInboxThreads();
                  }}
                  placeholder="Search unread messages, senders, subjects, or snippets"
                  disabled={!inboxReady}
                />
              </div>
              <TableRefreshButton onClick={refreshPhoneTableThenAll} disabled={tab === "inbox" && (!inboxReady || loadingInbox)} label="Refresh inbox" />
            </div>
          </header>

          {inboxFiltersOpen && (
            <div className="chatFilterBar phoneInboxFilterBar" role="group" aria-label="Inbox filters">
              <span className="chatFilterCount">{visibleInboxThreads.length} unread threads</span>
              <button
                className="button secondary"
                type="button"
                disabled={!inboxReady || loadingInbox}
                onClick={() => void searchInboxThreads()}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          )}

          {(inboxStatus || inboxError) && (
            <div className={inboxError ? "assistantNotice warning phoneInboxNotice" : "assistantNotice phoneInboxNotice"} aria-live="polite">
              <p>{inboxError || inboxStatus}</p>
            </div>
          )}

          <div className="phoneInboxShell">
            <div className="phoneInboxSectionHeader">
              <span>Unread</span>
              <small>{visibleInboxThreads.length} unread</small>
            </div>
            <div className="chatSessionRows directoryTable phoneInboxThreadList phoneInboxRows" role="table" aria-label="Unread inbox threads">
              <div className="chatResultRow directoryResultRow phoneInboxRow phoneInboxRowHead chatResultRowHead" role="row">
                <span role="columnheader">From</span>
                <span role="columnheader">Subject</span>
                <span role="columnheader">Last</span>
                <span role="columnheader">Status</span>
                <span role="columnheader" aria-label="Open thread" />
              </div>
              <div className="chatResultRows" role="rowgroup">
              {visibleInboxThreads.map(renderInboxThreadRow)}
              {visibleInboxThreads.length === 0 && (
                <div className="chatResultRow directoryResultRow phoneInboxRow phoneInboxConnectedRow" role="row">
                  <span className="phoneInboxFromCell" role="cell">{inboxReady ? "Google Inbox" : "Inbox setup"}</span>
                  <span className="phoneInboxSubjectCell" role="cell">
                    <strong>
                    {loadingInbox
                      ? "Checking unread messages..."
                      : inboxReady
                        ? inboxQuery.trim()
                          ? "No unread messages match this search."
                          : "Inbox connected. 0 unread messages."
                        : "Connect Google Inbox to load unread messages."}
                    </strong>
                    <small>
                    {inboxReady
                      ? "Link can read threads and save Gmail drafts. Sending stays outside Electron."
                      : "Link can read Gmail threads and save drafts after the Inbox connector is connected."}
                    </small>
                  </span>
                  <span role="cell">{inboxReady ? "Now" : "Not connected"}</span>
                  <span role="cell">
                    <em>{inboxReady ? "Connected" : "Setup"}</em>
                  </span>
                  <span className="phoneInboxOpenCell" role="cell" aria-hidden="true" />
                </div>
              )}
              </div>
            </div>

            <div className="phoneInboxSectionHeader">
              <span>Everything else</span>
              <small>{visibleReadInboxThreads.length} read</small>
            </div>
            <div className="chatSessionRows directoryTable phoneInboxThreadList phoneInboxRows phoneInboxReadRows" role="table" aria-label="Read inbox threads">
              <div className="chatResultRow directoryResultRow phoneInboxRow phoneInboxRowHead chatResultRowHead" role="row">
                <span role="columnheader">From</span>
                <span role="columnheader">Subject</span>
                <span role="columnheader">Last</span>
                <span role="columnheader">Status</span>
                <span role="columnheader" aria-label="Open thread" />
              </div>
              <div className="chatResultRows" role="rowgroup">
              {visibleReadInboxThreads.map(renderInboxThreadRow)}
              {visibleReadInboxThreads.length === 0 && (
                <div className="chatResultRow directoryResultRow phoneInboxRow phoneInboxConnectedRow" role="row">
                  <span className="phoneInboxFromCell" role="cell">Google Inbox</span>
                  <span className="phoneInboxSubjectCell" role="cell">
                    <strong>{loadingInbox ? "Checking read messages..." : "No read messages found."}</strong>
                    <small>Read Gmail messages will appear here when Link finds matching threads.</small>
                  </span>
                  <span role="cell">{inboxReady ? "Now" : "Not connected"}</span>
                  <span role="cell">
                    <em>{inboxReady ? "Read" : "Setup"}</em>
                  </span>
                  <span className="phoneInboxOpenCell" role="cell" aria-hidden="true" />
                </div>
              )}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "assistants" && (
        <section className="phoneAssistantTable phoneContentTable" aria-label="Telnyx Voice AI assistants">
          {selectedAssistant ? (
            <div className="settingsDirectoryDetail embeddedDirectoryDetailView phoneAssistantDetailView">
              <header className="directoryEmbeddedDetailHeader">
                <button className="button ghost" type="button" onClick={() => setSelectedAssistantId("")}>
                  <ArrowLeft size={16} />
                  Assistants
                </button>
                <div>
                  <h2>{selectedAssistant.name}</h2>
                  <p>{selectedAssistant.description || "Telnyx Voice AI assistant"}</p>
                </div>
                <Badge tone={selectedAssistant.phoneNumber ? "success" : "warning"}>{selectedAssistant.status || "Available"}</Badge>
              </header>
              <section className="chatDetailSurface">
                <div className="chatDetailTabs directoryDetailTabs" role="tablist" aria-label={`${selectedAssistant.name} assistant details`}>
                  {(["overview", "phone", "settings"] as const).map((detailTab) => (
                    <button
                      key={detailTab}
                      className={selectedAssistantTab === detailTab ? "selected" : ""}
                      type="button"
                      onClick={() => setSelectedAssistantTab(detailTab)}
                    >
                      {detailTab === "overview" ? "Overview" : detailTab === "phone" ? "Phone" : "Settings"}
                    </button>
                  ))}
                </div>
                {selectedAssistantTab === "overview" && (
                  <div className="chatResultDetails directoryDetailPanel">
                    <div>
                      <strong>Status</strong>
                      <span>{selectedAssistant.status || "Available"}</span>
                    </div>
                    <div>
                      <strong>Assistant ID</strong>
                      <span>{selectedAssistant.id}</span>
                    </div>
                    <div>
                      <strong>Description</strong>
                      <span>{selectedAssistant.description || "No description provided"}</span>
                    </div>
                  </div>
                )}
                {selectedAssistantTab === "phone" && (
                  <div className="chatResultDetails directoryDetailPanel">
                    <div>
                      <strong>Phone number</strong>
                      <span>{selectedAssistant.phoneNumber || "No phone number assigned"}</span>
                    </div>
                    <div>
                      <strong>Callable</strong>
                      <span>{selectedAssistant.phoneNumber && telnyxApiReady ? "Ready" : "Needs Telnyx number"}</span>
                    </div>
                  </div>
                )}
                {selectedAssistantTab === "settings" && (
                  <div className="directoryDetailPanel">
                    <div className="assistantNotice">
                      <p>Manage assistant prompts, tools, and phone assignments in the Telnyx Portal.</p>
                    </div>
                    <button className="button primary" type="button" onClick={() => window.open("https://portal.telnyx.com/#/app/voice-ai/assistants", "_blank")}>
                      <ExternalLink size={15} />
                      Open Telnyx Portal
                    </button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <>
              <header className="phoneAssistantToolbar">
                <div className="chatSearchRow phoneAssistantSearchRow">
                  <button
                    className={`iconButton agentFilterButton ${assistantFiltersOpen || assistantStatusFilter !== "all" ? "selected" : ""}`}
                    type="button"
                    aria-label={assistantFiltersOpen ? "Hide assistant filters" : "Show assistant filters"}
                    title={assistantFiltersOpen ? "Hide assistant filters" : "Show assistant filters"}
                    onClick={() => setAssistantFiltersOpen((open) => !open)}
                  >
                    <SlidersHorizontal size={18} />
                  </button>
                  <div className="explorerSearch compactSearch">
                    <Search size={17} />
                    <input
                      value={assistantQuery}
                      onChange={(event) => setAssistantQuery(event.target.value)}
                      placeholder="Search assistants, numbers, statuses, or descriptions"
                      disabled={!telnyxApiReady}
                    />
                  </div>
                  <button
                    className="iconButton agentFilterButton"
                    type="button"
                    onClick={() => void refreshPhoneAssistants()}
                    disabled={!telnyxApiReady || busy}
                    aria-label="Refresh assistants"
                    title="Refresh assistants"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                {assistantFiltersOpen && (
                  <div className="chatFilterBar phoneAssistantFilterBar" role="group" aria-label="Assistant filters">
                    <span className="chatFilterCount">{filteredPhoneAssistants.length} assistants</span>
                    <label className="agentFilter">
                      <span>Status</span>
                      <select value={assistantStatusFilter} onChange={(event) => setAssistantStatusFilter(event.target.value)}>
                        {assistantStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status === "all" ? "All" : status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="button primary" onClick={() => window.open("https://portal.telnyx.com/#/app/voice-ai/assistants", "_blank")}>Open Telnyx Portal</button>
                  </div>
                )}
              </header>
              <div className="chatSessionRows directoryTable phoneAssistantDirectoryTable" role="table" aria-label="Telnyx Voice AI assistants">
                <div className="chatResultRow directoryResultRow phoneAssistantDirectoryResultRow chatResultRowHead" role="row">
                  <span role="columnheader">Assistant</span>
                  <span role="columnheader">Phone</span>
                  <span role="columnheader">Status</span>
                  <span role="columnheader">Description</span>
                  <span role="columnheader" aria-label="Open assistant" />
                </div>
                <div className="chatResultRows">
                  {filteredPhoneAssistants.map((assistant) => (
                    <div className="chatResultRow directoryResultRow phoneAssistantDirectoryResultRow" role="row" key={assistant.id}>
                      <span className="directoryNameCell" role="cell">
                        <strong>{assistant.name}</strong>
                        <small>{assistant.id}</small>
                      </span>
                      <span role="cell">{assistant.phoneNumber || "No phone number"}</span>
                      <span role="cell"><Badge tone={assistant.phoneNumber ? "success" : "warning"}>{assistant.status || "Available"}</Badge></span>
                      <span role="cell">{assistant.description || "Telnyx Voice AI assistant"}</span>
                      <span className="directoryRowActions" role="cell">
                        <button
                          className="chatSessionOpenButton"
                          type="button"
                          aria-label={`Open ${assistant.name}`}
                          onClick={() => {
                            setSelectedAssistantId(assistant.id);
                            setSelectedAssistantTab("overview");
                          }}
                        >
                          <ArrowRight size={18} />
                        </button>
                      </span>
                    </div>
                  ))}
                  {filteredPhoneAssistants.length === 0 && (
                    <div className="phoneNumberEmpty">
                      {telnyxApiReady ? "No Telnyx Voice AI assistants match this search." : "Add a Telnyx API key to load your assistants."}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {tab === "contacts" && (
        <section className="phoneContactTable phoneContentTable" aria-label="Connected contacts">
          <header className="phoneNumberTableHeader">
            <div className="tabPageActionBar">
              <button
                className="button primary contactAddButton"
                type="button"
                onClick={() => void startManagedSkillSetupChat(addContactSkillLink)}
              >
                <Plus size={15} />
                Add Contact
              </button>
            </div>
          </header>
          <div className="phoneContactControls">
            <div className="contactSearchControls">
              <button
                className={`iconButton agentFilterButton ${contactFiltersOpen || contactSource !== "all" ? "selected" : ""}`}
                type="button"
                aria-label="Filter contacts"
                title={selectedContactSource ? `Source: ${selectedContactSource.label}` : "Filter contacts"}
                onClick={() => setContactFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal size={18} />
              </button>
              <label className="componentField">
                <input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Search connected contacts..." />
              </label>
            </div>
            {contactFiltersOpen && (
              <div className="contactFilterPanel" role="group" aria-label="Contact source filters">
                {[{ id: "all", label: "All sources" }, ...contactSources].map((source) => (
                  <button
                    key={source.id}
                    className={contactSource === source.id ? "selected" : ""}
                    type="button"
                    onClick={() => {
                      setContactSource(source.id);
                      setContactFiltersOpen(false);
                    }}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            )}
            {visibleContactSkillLinks.length > 0 && (
              <div className="contactMcpLinks" aria-label="Connect contact MCPs through managed skills">
                {visibleContactSkillLinks.map((link) => (
                  <article className="contactMcpLink" key={link.id}>
                    <button
                      className="contactMcpDismiss"
                      type="button"
                      onClick={() => dismissContactSkillPrompt(link.id)}
                      aria-label={`Dismiss ${link.label}`}
                      title={`Dismiss ${link.label}`}
                    >
                      <X size={14} />
                    </button>
                    <span>
                      <strong>{link.label}</strong>
                      <small>Connect contact sync through Skills.</small>
                    </span>
                    <button
                      className="contactMcpEnable"
                      type="button"
                      onClick={() => void startManagedSkillSetupChat(link)}
                    >
                      <Zap size={14} />
                      Connect
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="contactResults phoneContactRows" role="table" aria-label="Connected contacts">
            <div className="phoneContactRow phoneContactRowHead" role="row">
              <span role="columnheader">Contact</span>
              <span role="columnheader">Number</span>
              <span role="columnheader">Source</span>
              <span role="columnheader">Status</span>
            </div>
            {filteredContacts.map((contact) => {
              const source = contactSources.find((item) => item.id === contact.source || item.connectorIds.includes(contact.source));
              const connected = contact.connected ?? (connectedContactSourceIds.has(contact.source) || Boolean(source?.connectorIds.some((connectorId) => connectedContactSourceIds.has(connectorId))));
              const callable = connected && Boolean(contact.phone);
              const expanded = expandedContactId === contact.id;
              const selected = dialNumber === contact.phone;
              return (
                <div className={`contactResult ${expanded ? "expanded" : ""} ${selected ? "selected" : ""}`} key={contact.id}>
                  <button
                    className="contactResultMain"
                    onClick={() => setExpandedContactId((current) => current === contact.id ? "" : contact.id)}
                    title={connected ? `Show ${contact.name}` : `Connect ${source?.label ?? contact.source} first`}
                  >
                    <span>
                      <strong>{contact.name}</strong>
                      <small>{contact.role}</small>
                    </span>
                    <span>{contact.phone || "No callable number"}</span>
                    <span>{source?.label ?? contact.source}</span>
                    <span className="contactResultActions">
                      <em className={callable ? "contactSourceBadge connected" : "contactSourceBadge"}>{callable ? "Callable" : "setup needed"}</em>
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  {expanded && (
                    <div className="contactResultDetails">
                      <div>
                        <strong>Source detail</strong>
                        <span>{contact.detail}</span>
                      </div>
                      <div>
                        <strong>Phone</strong>
                        <span>{contact.phone || "No callable number is available for this contact."}</span>
                      </div>
                      <button
                        className="button primary"
                        onClick={() => setDialNumber(contact.phone)}
                        disabled={!callable}
                      >
                        {selected ? "Selected for dialer" : "Use number"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredContacts.length === 0 && (
              <div className="contactEmpty">
                {loadingGoogleContacts
                  ? "Loading Google contacts..."
                  : googleContactsError
                    ? googleContactsError
                    : contactQuery.trim()
                      ? "No matching contacts from connected sources."
                      : "No connected contacts yet."}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "calls" && (
        <>
          <div className="chatSearchRow phoneCallSearchRow">
            <button
              className={`iconButton agentFilterButton ${callFiltersOpen || callAgentFilter !== "all" || callDirectionFilter !== "all" || callStatusFilter !== "all" ? "selected" : ""}`}
              type="button"
              aria-label={callFiltersOpen ? "Hide call filters" : "Show call filters"}
              title={callFiltersOpen ? "Hide call filters" : "Show call filters"}
              onClick={() => setCallFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal size={16} />
            </button>
            <div className="explorerSearch compactSearch">
              <Search size={16} />
              <input
                value={callQuery}
                onChange={(event) => setCallQuery(event.target.value)}
                placeholder="Search calls, numbers, contacts, or agents"
              />
            </div>
            <button
              className={`iconButton agentFilterButton ${callBulkEdit ? "selected" : ""}`}
              type="button"
              aria-label={callBulkEdit ? "Exit bulk edit" : "Edit calls"}
              title={callBulkEdit ? "Exit bulk edit" : "Edit calls"}
              onClick={toggleCallBulkEdit}
            >
              <Pencil size={16} />
            </button>
            <TableRefreshButton onClick={refreshPhoneTableThenAll} disabled={loadingCallHistory} label="Refresh calls" />
          </div>
          {callBulkEdit && (
            <BulkEditControls
              active={callBulkEdit}
              selectedCount={selectedCallRowIds.length}
              onToggle={toggleCallBulkEdit}
              onArchive={hideSelectedCallRows}
              onDelete={hideSelectedCallRows}
            />
          )}
          {callFiltersOpen && (
            <div className="chatFilterBar phoneCallFilterBar" role="group" aria-label="Call filters">
              <span className="chatFilterCount">{filteredCallRows.length} calls</span>
              <label className="agentFilter">
                <span>Agent</span>
                <select value={callAgentFilter} onChange={(event) => setCallAgentFilter(event.target.value)}>
                  <option value="all">All agents</option>
                  {callAgentOptions.map((agent) => <option key={agent.id} value={agent.id}>{agent.label}</option>)}
                </select>
              </label>
              <label className="agentFilter">
                <span>Direction</span>
                <select value={callDirectionFilter} onChange={(event) => setCallDirectionFilter(event.target.value)}>
                  <option value="all">All directions</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </label>
              <label className="agentFilter">
                <span>Status</span>
                <select value={callStatusFilter} onChange={(event) => setCallStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="answered">Answered</option>
                  <option value="missed">Missed</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
            </div>
          )}
          <section className={`phoneCallsTable phoneContentTable ${callBulkEdit ? "bulkEditing" : ""}`} aria-label="Recent calls">
            <div className={`phoneCallRows ${filteredCallRows.length === 0 ? "empty" : ""}`} role="table" aria-label="Recent calls">
              <div className="phoneCallRow phoneCallRowHead" role="row">
                <span className="bulkSelectCell" role="columnheader" aria-label="Select calls" />
                <span role="columnheader">Contact</span>
                <span role="columnheader">Number</span>
                <span role="columnheader">Agent</span>
                <span role="columnheader">Time</span>
                <span role="columnheader">Status</span>
              </div>
              {filteredCallRows.map((call) => (
                <div className="phoneCallRow" role="row" key={call.id}>
                  <BulkSelectCell
                    active={callBulkEdit}
                    checked={selectedCallRowIds.includes(call.id)}
                    label={`Select ${call.contact} call`}
                    onChange={(checked) => setCallRowSelected(call.id, checked)}
                  />
                  <strong role="cell">{call.contact}</strong>
                  <span role="cell">{call.number}</span>
                  <span role="cell">{call.agentName}</span>
                  <span role="cell">{call.time}</span>
                  <span role="cell"><em>{call.status}</em></span>
                </div>
              ))}
              {filteredCallRows.length === 0 && (
                <div className="tableEmptyState" role="row">
                  <EmptyState
                    title={loadingCallHistory ? "Loading call history..." : callQuery.trim() || callAgentFilter !== "all" || callDirectionFilter !== "all" || callStatusFilter !== "all" ? "No calls found" : "No call history yet"}
                    body={loadingCallHistory ? "Pulling recent Telnyx call detail records." : callQuery.trim() || callAgentFilter !== "all" || callDirectionFilter !== "all" || callStatusFilter !== "all" ? "Try another search term or filter." : "Recent Telnyx account calls will appear here after call detail records are available."}
                    icon={Phone}
                  />
                </div>
              )}
            </div>
          </section>
        </>
      )}

	      {error && <div className="errorBanner">{error}</div>}

      {tab === "numbers" && (
        <>
        {!telnyxApiReady && (
          <div className="phoneSetupAlert">
            <div>
              <strong>Add your Telnyx API key to show your account numbers.</strong>
              <p>Add your Telnyx API key in Settings. Link uses your key to load active numbers from your Telnyx account so you can choose which number should work inside the app.</p>
            </div>
            <button className="runtimeSettingsButton" type="button" onClick={() => setView("settings")}>
              <Settings size={14} />
              Add Telnyx API key
            </button>
          </div>
        )}

        <section className="phoneNumberTable phoneContentTable" aria-label="Telnyx account numbers">
          <div className="phoneNumberRows" role="table" aria-label="Active Telnyx numbers">
            <div className="phoneNumberRow phoneNumberRowHead" role="row">
              <span role="columnheader">Number</span>
              <span role="columnheader">Location</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">Features</span>
              <span role="columnheader">Status</span>
            </div>
            {numbers.map((number) => {
              const selected = selectedNumber?.phoneNumber === number.phoneNumber;
              return (
                <button
                  className={`phoneNumberRow ${selected ? "selected" : ""}`}
                  key={number.phoneNumber}
                  onClick={() => {
                    setSelectedNumber(number);
                    setLinkedPhoneNumber(number.phoneNumber);
                  }}
                  role="row"
                >
                  <strong role="cell">{number.phoneNumber}</strong>
                  <span role="cell">{[number.locality, number.region, number.countryCode].filter(Boolean).join(", ") || "Telnyx account"}</span>
                  <span role="cell">{number.type || "Number"}</span>
                  <span role="cell">{number.features.length > 0 ? number.features.join(", ") : "Active"}</span>
                  <span role="cell"><em>{selected ? "Linked" : "Available"}</em></span>
                </button>
              );
            })}
            {numbers.length === 0 && (
              <div className="phoneNumberEmpty">
                {telnyxApiReady && !busy ? "No active Telnyx numbers found for this account." : "Add a Telnyx API key to load your numbers."}
              </div>
            )}
          </div>
        </section>
        </>
      )}

        </div>
      </div>
    </section>
  );
}

function replySubject(subject: string) {
  const trimmed = subject.trim();
  if (!trimmed) return "Re:";
  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

function inboxReadQuery(query: string) {
  const trimmed = query.replace(/\bis:(?:read|unread)\b|\blabel:unread\b/gi, "").trim();
  return trimmed ? `${trimmed} is:read` : "is:read";
}

function buildInboxDraftPrompt(thread: GoogleInboxThread) {
  const messages = thread.messages
    .slice(-5)
    .map((message) => [
      `From: ${message.from}`,
      `To: ${message.to}`,
      `Date: ${message.date}`,
      message.body || message.snippet,
    ].filter(Boolean).join("\n"))
    .join("\n\n---\n\n");

  return [
    "Draft a reply for this Gmail thread.",
    "Return only the email body. Do not include a subject line, markdown fences, internal notes, or delivery claims.",
    `Subject: ${thread.subject}`,
    `Recipient: ${thread.replyTo || thread.from}`,
    "Thread:",
    messages,
  ].join("\n\n");
}

function ConnectionsView({
  connectors,
  tools,
  refresh,
  openSettings,
  embedded = false,
  showHeader = true,
}: {
  connectors: ConnectorStatus[];
  tools: ToolMetadata[];
  refresh: () => Promise<void>;
  openSettings: () => void;
  embedded?: boolean;
  showHeader?: boolean;
}) {
  const connectedConnectors = connectors.filter((connector) => connector.status === "connected" || connector.status === "signed_in");
  const availableConnectors = connectors.filter((connector) => connector.status !== "connected" && connector.status !== "signed_in");
  const [expandedConnectorIds, setExpandedConnectorIds] = useState<Set<string>>(() => new Set());

  function connectorTools(connector: ConnectorStatus) {
    const connectorName = connector.name.toLowerCase().replace(/\s+mcp$/i, "");
    if (connector.category === "MCP" && connector.id !== "mcp-proxy") {
      return tools.filter((tool) => {
        const searchable = `${tool.name} ${tool.category}`.toLowerCase();
        return searchable.includes(connectorName.toLowerCase()) || searchable.includes(connector.id.replace("mcp-server-", ""));
      });
    }
    if (connector.id === "mcp-proxy") return tools.filter((tool) => tool.category === "MCP" || /^[a-z0-9_-]+\./i.test(tool.name));
    return tools.filter((tool) => tool.category.toLowerCase().includes(connector.name.toLowerCase()) || tool.name.toLowerCase().startsWith(`${connector.id}.`));
  }

  async function connectConnector(id: string) {
    if (id === "agent-control-plane") {
      await linkApi.signInAgentControlPlane();
      await refresh();
      return;
    }
    openSettings();
  }

  function toggleConnector(connectorId: string) {
    setExpandedConnectorIds((current) => {
      const next = new Set(current);
      if (next.has(connectorId)) next.delete(connectorId);
      else next.add(connectorId);
      return next;
    });
  }

  function renderConnectorRow(connector: ConnectorStatus) {
    const expanded = expandedConnectorIds.has(connector.id);
    const connected = connector.status === "connected" || connector.status === "signed_in";
    const connectorToolList = connectorTools(connector);
    const grouped = {
      read: connectorToolList.filter((tool) => tool.capability === "read"),
      write: connectorToolList.filter((tool) => tool.capability !== "read"),
      interactive: connectorToolList.filter((tool) => tool.approvalRequired || tool.riskLevel === "high"),
    };

    return (
	      <article className={`connectorRow ${expanded ? "expanded" : ""}`} key={connector.id}>
	        <button className="connectorRowSummary" onClick={() => toggleConnector(connector.id)} aria-expanded={expanded}>
	          <span className="connectorLogo">{connectorInitials(connector.name)}</span>
	          <span className="connectorRowText">
	            <strong>{connector.name}</strong>
	            <Badge tone="default">{connectorTypeLabel(connector)}</Badge>
	          </span>
	          <span className="connectorRowMeta">
	            <span className={`connectorSwitch ${connected ? "enabled" : ""}`} aria-hidden="true">
	              <span />
	            </span>
	            <ChevronDown size={24} className="connectorRowChevron" aria-hidden="true" />
	          </span>
	        </button>
	        {expanded && (
	          <div className="connectorRowDetails">
	            <p className="connectorRowDescription">{connector.description}</p>
	            <div className="pluginMeta">
	              <span>{connector.category}</span>
	              <span>{connectorModeLabel(connector)}</span>
              {connector.requiredAccess.map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="pluginDetailActions">
              <button
                className={connected ? "button ghost" : "button secondary"}
                disabled={connected}
                onClick={() => connectConnector(connector.id)}
              >
                {connectorButtonLabel(connector)}
              </button>
            </div>
            <div className="toolPermissionHeader">
              <div>
                <h3>Tool permissions</h3>
                <p>Choose when Link agents are allowed to use these tools.</p>
              </div>
            </div>
            <ToolGroup title="Read-only tools" tools={grouped.read} />
            <ToolGroup title="Write/delete tools" tools={grouped.write} />
            <ToolGroup title="Interactive tools" tools={grouped.interactive} />
          </div>
        )}
      </article>
    );
  }

  function renderConnectorGroup(title: string, groupConnectors: ConnectorStatus[]) {
    if (groupConnectors.length === 0) return null;
    return (
      <section className="connectorRowGroup" key={title}>
        <div className="pluginSidebarLabel">
          <ChevronDown size={13} />
          {title}
        </div>
        <div className="connectorRows">
          {groupConnectors.map(renderConnectorRow)}
        </div>
      </section>
    );
  }

  return (
    <section className={embedded ? "connectionsView embeddedSettingsPanel" : "content connectionsView"}>
      {showHeader && (
        <header className={embedded ? "pageHeader embeddedSettingsHeader" : "pageHeader"}>
          <div>
            <h1>Plugins</h1>
          </div>
        </header>
      )}
      <div className="pluginConsole pluginRowConsole">
        {renderConnectorGroup("Connected", connectedConnectors)}
        {renderConnectorGroup("Available", availableConnectors)}
      </div>
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
      {tools.length > 0 ? (
        tools.map((tool) => (
          <div className="permissionRow" key={`${title}-${tool.name}`}>
            <div>
              <strong>{tool.name}</strong>
              <small>{tool.description}</small>
            </div>
            <Segmented selected={tool.approvalRequired ? "Ask" : tool.outputCanBeShownExternally ? "Allow" : "Auto"} />
          </div>
        ))
      ) : (
        <div className="permissionEmpty">No tools in this group.</div>
      )}
    </div>
  );
}

type ArchiveTabId = "documents" | "memories" | "entities" | "prompt" | "settings";

const defaultArchiveQuery = "What did we decide about Link improvement requests?";

function MemoryView({ banks, openMemory }: { banks: MemoryBank[]; openMemory: () => void }) {
  return (
    <section className="content memoryView">
      <header className="pageHeader">
        <div>
          <h1>Archive</h1>
        </div>
      </header>
      <ArchiveTabs banks={banks} openMemory={openMemory} />
    </section>
  );
}

function ArchiveTabs({
  banks,
  openMemory,
  compact = false,
  initialTab = "documents",
  initialQuery = defaultArchiveQuery,
  autoRecallKey = 0,
}: {
  banks: MemoryBank[];
  openMemory: () => void;
  compact?: boolean;
  initialTab?: ArchiveTabId;
  initialQuery?: string;
  autoRecallKey?: number;
}) {
  const seededQuery = useMemo(() => (initialQuery.trim() || defaultArchiveQuery).slice(0, 220), [initialQuery]);
  const [tab, setTab] = useState<ArchiveTabId>(initialTab);
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id ?? "");
  const [query, setQuery] = useState(seededQuery);
  const [documentText, setDocumentText] = useState("");
  const [textCaptureOpen, setTextCaptureOpen] = useState(false);
  const [entityQuery, setEntityQuery] = useState("");
  const [minMentions, setMinMentions] = useState(1);
  const [recall, setRecall] = useState<MemoryRecallResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [recallError, setRecallError] = useState("");
  const [recallRan, setRecallRan] = useState(false);
  const [promptMode, setPromptMode] = useState<"retain" | "recall" | "reflect">("retain");
  const [retainContent, setRetainContent] = useState("");
  const [retainContext, setRetainContext] = useState("");
  const [retainStatus, setRetainStatus] = useState("");
  const [reflectPrompt, setReflectPrompt] = useState("");
  const [archiveSettingsMode, setArchiveSettingsMode] = useState<"retain" | "reflect">("retain");
  const [retainMission, setRetainMission] = useState("");
  const [customExtractionPrompt, setCustomExtractionPrompt] = useState("");
  const [freeFormEntities, setFreeFormEntities] = useState(true);
  const [observationsEnabled, setObservationsEnabled] = useState(false);
  const [observationsMission, setObservationsMission] = useState("");
  const [okfBundle, setOkfBundle] = useState<OkfBundlePreview | null>(null);
  const [selectedOkfConceptIds, setSelectedOkfConceptIds] = useState<string[]>([]);
  const [okfStatus, setOkfStatus] = useState("");
  const [okfBusy, setOkfBusy] = useState(false);
  const selectedBank = banks.find((bank) => bank.id === selectedBankId) ?? banks[0];
  const isKeyScopedBank = selectedBank?.id === "hindsight-key-scoped";
  const selectedOkfConcepts = okfBundle?.concepts.filter((concept) => selectedOkfConceptIds.includes(concept.id)) ?? [];
  const memoryTabs = [
    { id: "documents", label: "Documents", icon: FileText },
    { id: "memories", label: "Entries", icon: ArchiveIcon },
    { id: "entities", label: "Entities", icon: Tags },
    { id: "prompt", label: "Prompt", icon: SquareTerminal },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  useEffect(() => {
    if (banks.length === 0) {
      if (selectedBankId) setSelectedBankId("");
      return;
    }
    if (!banks.some((bank) => bank.id === selectedBankId)) {
      setSelectedBankId(banks[0]?.id ?? "");
    }
  }, [banks, selectedBankId]);

  useEffect(() => {
    setQuery(seededQuery);
    setRecall([]);
    setRecallError("");
    setRecallRan(false);
  }, [seededQuery]);

  async function runRecallForQuery(searchQuery: string) {
    setBusy(true);
    setRecallError("");
    setRecallRan(true);
    try {
      setRecall(await linkApi.recallMemory({ query: searchQuery, bankId: isKeyScopedBank ? undefined : selectedBank?.id }));
    } catch (error) {
      setRecall([]);
      setRecallError(error instanceof Error ? error.message : "Archive recall failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runRecall() {
    await runRecallForQuery(query);
  }

  useEffect(() => {
    const searchQuery = seededQuery.trim();
    if (tab !== "memories" || !searchQuery) return;
    void runRecallForQuery(searchQuery);
  }, [autoRecallKey, selectedBank?.id, seededQuery, tab]);

  async function runRetain() {
    const content = retainContent.trim();
    if (!content || busy) return;
    setBusy(true);
    setRetainStatus("Saving to archive...");
    try {
      const result = await linkApi.retainMemory({
        content,
        context: retainContext.trim() || "Saved from the Archive prompt.",
        bankId: isKeyScopedBank ? undefined : selectedBank?.id,
        source: "link-archive-prompt",
      });
      setRetainContent("");
      setRetainContext("");
      setRetainStatus(`Saved to archive: ${result.summary}`);
      const retainedQuery = content.slice(0, 220);
      setQuery(retainedQuery);
      await runRecallForQuery(retainedQuery);
    } catch (error) {
      setRetainStatus(error instanceof Error ? error.message : "Archive retain failed.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseOkfBundle() {
    if (okfBusy) return;
    setOkfBusy(true);
    setOkfStatus("Selecting OKF bundle...");
    try {
      const bundle = await linkApi.selectOkfBundle();
      if (!bundle) {
        setOkfStatus("OKF import canceled.");
        return;
      }
      setOkfBundle(bundle);
      setSelectedOkfConceptIds(bundle.concepts.map((concept) => concept.id));
      const status = bundle.errors.length > 0
        ? `Validated with ${bundle.errors.length} error${bundle.errors.length === 1 ? "" : "s"}.`
        : `Validated ${bundle.summary.conceptCount} concept${bundle.summary.conceptCount === 1 ? "" : "s"}.`;
      setOkfStatus(status);
    } catch (error) {
      setOkfBundle(null);
      setSelectedOkfConceptIds([]);
      setOkfStatus(error instanceof Error ? error.message : "OKF bundle validation failed.");
    } finally {
      setOkfBusy(false);
    }
  }

  async function importSelectedOkfConcepts() {
    if (!okfBundle || selectedOkfConcepts.length === 0 || okfBusy) return;
    setOkfBusy(true);
    setOkfStatus("Importing selected OKF concepts...");
    try {
      const result = await linkApi.importOkfConcepts({
        concepts: selectedOkfConcepts,
        bankId: isKeyScopedBank ? undefined : selectedBank?.id,
      });
      const suffix = result.errors.length > 0 ? ` ${result.errors.length} failed.` : "";
      setOkfStatus(`Imported ${result.importedCount} OKF concept${result.importedCount === 1 ? "" : "s"}.${suffix}`);
      const recallSeed = selectedOkfConcepts[0]?.title || selectedOkfConcepts[0]?.id;
      if (recallSeed) await runRecallForQuery(recallSeed);
    } catch (error) {
      setOkfStatus(error instanceof Error ? error.message : "OKF import failed.");
    } finally {
      setOkfBusy(false);
    }
  }

  function toggleOkfConcept(concept: OkfConceptPreview) {
    setSelectedOkfConceptIds((current) =>
      current.includes(concept.id)
        ? current.filter((id) => id !== concept.id)
        : [...current, concept.id],
    );
  }

  return (
    <div className={`archiveTabsSurface ${compact ? "compact" : ""}`}>
      {!compact && (
        <>
          <div className="archiveToolbar">
            <label className="memoryBankPicker">
              <span>Archive</span>
              <select value={selectedBank?.id ?? ""} onChange={(event) => setSelectedBankId(event.target.value)} disabled={banks.length === 0}>
                {banks.length === 0 ? <option value="">No banks connected</option> : banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </label>
            <div className="headerActions">
              <button className="button primary" onClick={openMemory}>Refresh archive</button>
            </div>
          </div>

          <div className="memoryTabs" role="tablist" aria-label="Archive sections">
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
        </>
      )}

      {tab === "documents" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Documents</h2>
              <p>Upload files or add text. Link ingests them into the archive and derives reusable entries.</p>
            </div>
            <div className="headerActions">
              <button className="button secondary"><Upload size={15} />Upload files</button>
              <button className="button secondary" onClick={() => void chooseOkfBundle()} disabled={okfBusy}>
                <FileText size={15} />Import OKF
              </button>
              <button className="button primary" onClick={() => setTextCaptureOpen((open) => !open)} aria-expanded={textCaptureOpen}>
                <FileText size={15} />Add text
              </button>
            </div>
          </div>
          <div className="memoryTable">
            <div className="memoryTableHead documents"><span>Document</span><span>Entries</span><span>Created</span><span>Tags</span><span>Actions</span></div>
            <div className="memoryEmpty"><FileText size={26} /><span>No documents yet. Upload a file or add text to get started.</span></div>
          </div>
          {textCaptureOpen && (
            <label className="componentField memoryTextCapture">
              <span>Quick add text</span>
              <textarea value={documentText} onChange={(event) => setDocumentText(event.target.value)} placeholder="Paste text that this bank should remember..." />
            </label>
          )}
          <section className="okfImportPanel" aria-label="OKF bundle import">
            <div className="okfImportHeader">
              <div>
                <h3>OKF bundle</h3>
                <p>Validate a Markdown knowledge bundle, select concepts, then retain them into the archive.</p>
              </div>
              <div className="okfImportActions">
                <button className="button secondary" onClick={() => void chooseOkfBundle()} disabled={okfBusy}>
                  {okfBusy ? "Validating" : "Choose bundle"}
                </button>
                <button className="button primary" onClick={() => void importSelectedOkfConcepts()} disabled={!okfBundle || selectedOkfConcepts.length === 0 || okfBusy}>
                  Retain selected
                </button>
              </div>
            </div>
            {okfStatus && <div className="voiceInputStatus okfImportStatus" aria-live="polite">{okfStatus}</div>}
            {okfBundle && (
              <>
                <div className="okfImportSummary">
                  <span><strong>{formatCompactCount(okfBundle.summary.conceptCount)}</strong> concepts</span>
                  <span><strong>{Object.keys(okfBundle.summary.typeCounts).length}</strong> types</span>
                  <span><strong>{formatCompactCount(okfBundle.summary.linkedConceptCount)}</strong> linked</span>
                  <span><strong>{formatCompactCount(okfBundle.summary.brokenLinkCount)}</strong> broken links</span>
                </div>
                {(okfBundle.errors.length > 0 || okfBundle.warnings.length > 0) && (
                  <div className="okfImportDiagnostics">
                    {okfBundle.errors.slice(0, 3).map((error) => <Badge key={error} tone="danger">{error}</Badge>)}
                    {okfBundle.warnings.slice(0, 3).map((warning) => <Badge key={warning} tone="warning">{warning}</Badge>)}
                  </div>
                )}
                <div className="okfConceptToolbar">
                  <span>{selectedOkfConcepts.length} selected</span>
                  <button className="button ghost" onClick={() => setSelectedOkfConceptIds(okfBundle.concepts.map((concept) => concept.id))}>Select all</button>
                  <button className="button ghost" onClick={() => setSelectedOkfConceptIds([])}>Clear</button>
                </div>
                <div className="okfConceptList">
                  {okfBundle.concepts.map((concept) => {
                    const selected = selectedOkfConceptIds.includes(concept.id);
                    return (
                      <label className={`okfConceptRow ${selected ? "selected" : ""}`} key={concept.id}>
                        <input type="checkbox" checked={selected} onChange={() => toggleOkfConcept(concept)} />
                        <span>
                          <strong>{concept.title}</strong>
                          <small>{concept.description || concept.path}</small>
                        </span>
                        <Badge tone="default">{concept.type}</Badge>
                        <span className="okfConceptMeta">{concept.tags.slice(0, 3).join(", ") || "No tags"}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {tab === "memories" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Entries</h2>
              <p>Browse archive entries. Filter by fact type and tags, and open the source document where provenance allows.</p>
            </div>
            <span>{recall.length} shown</span>
          </div>
          <div className="memoryFilters">
            <div className="explorerSearch"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void runRecall()} placeholder="Search archive... (press Enter)" /></div>
            <select><option>All fact types</option></select>
            <select><option>All tags</option></select>
          </div>
          <div className="memoryTable">
            <div className="memoryTableHead memories"><span>Fact</span><span>Type</span><span>Tags</span><span>When</span><span>Source</span></div>
            {recall.length > 0 ? recall.map((item) => (
              <div className="memoryRow" key={item.id}>
                <strong>{item.summary}</strong><span>recall</span><span>{item.evidence.slice(0, 2).join(", ")}</span><span>{Math.round(item.score * 100)}%</span><span>{item.source}</span>
              </div>
            )) : <div className="memoryEmpty"><ArchiveIcon size={26} /><span>No archive entries match the current filters.</span></div>}
          </div>
        </div>
      )}

      {tab === "entities" && (
        <div className="memorySection">
          <div className="memorySectionHeader">
            <div>
              <h2>Entities</h2>
              <p>Browse named entities extracted from this archive. Click a row to see the entries that mention it.</p>
            </div>
            <span>0 shown</span>
          </div>
          <div className="memoryFilters">
            <div className="explorerSearch"><Search size={16} /><input value={entityQuery} onChange={(event) => setEntityQuery(event.target.value)} placeholder="Search entities..." /></div>
            <label className="memoryRange">Min mentions <input type="range" min="1" max="10" value={minMentions} onChange={(event) => setMinMentions(Number(event.target.value))} /> {minMentions}</label>
          </div>
          <div className="memoryTable">
            <div className="memoryTableHead entities"><span>Entity</span><span>Mentions</span><span>Last mentioned</span><span>First seen</span></div>
            <div className="memoryEmpty"><Tags size={26} /><span>No entities yet. Add archive entries and entities will appear as they're extracted.</span></div>
          </div>
        </div>
      )}

      {tab === "prompt" && (
        <div className="memorySection">
          <div className="memoryPromptIntro">
            Interact with the memory bank: Retain new memories, Recall relevant facts, and Reflect for a written answer.
          </div>
          <div className="memoryPromptModes">
            <button className={promptMode === "retain" ? "selected" : ""} onClick={() => setPromptMode("retain")}>
              <Plus size={14} />Retain
            </button>
            <button className={promptMode === "recall" ? "selected" : ""} onClick={() => setPromptMode("recall")}>
              <Search size={14} />Recall
            </button>
            <button className={promptMode === "reflect" ? "selected" : ""} onClick={() => setPromptMode("reflect")}>
              <Zap size={14} />Reflect
            </button>
          </div>

          {promptMode === "retain" && (
            <section className="memoryPromptCard">
              <p>Retain stores raw text as memories. Link extracts facts from the content and consolidates them into the archive.</p>
              <label className="memorySettingsField">
                <span>Content</span>
                <textarea
                  value={retainContent}
                  onChange={(event) => setRetainContent(event.target.value)}
                  placeholder="Something to remember..."
                />
              </label>
              <label className="memorySettingsField">
                <span>Context (optional)</span>
                <input
                  value={retainContext}
                  onChange={(event) => setRetainContext(event.target.value)}
                  placeholder="e.g. who said it, when, or why"
                />
              </label>
              <div className="memorySettingsActions">
                <button className="button primary" onClick={() => void runRetain()} disabled={!retainContent.trim() || busy}>
                  {busy ? "Retaining" : "Retain"}
                </button>
              </div>
              {retainStatus && <div className="voiceInputStatus" aria-live="polite">{retainStatus}</div>}
            </section>
          )}

          {promptMode === "recall" && (
            <>
              <div className="explorerSearch">
                <ArchiveIcon size={16} />
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
              {recallError && <Panel title="Archive recall failed"><p>{recallError}</p></Panel>}
              {recallRan && !recallError && recall.length === 0 && (
                <Panel title="No archive matches">
                  <p>The archive responded successfully, but did not return entries for this query.</p>
                </Panel>
              )}
            </>
          )}

          {promptMode === "reflect" && (
            <section className="memoryPromptCard">
              <p>Reflect turns archive context into a written answer.</p>
              <label className="memorySettingsField">
                <span>Prompt</span>
                <textarea
                  value={reflectPrompt}
                  onChange={(event) => setReflectPrompt(event.target.value)}
                  placeholder="What should the archive answer?"
                />
              </label>
              <div className="memorySettingsActions">
                <button className="button primary" disabled={!reflectPrompt.trim()}>Reflect</button>
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="memorySettings">
          <header className="memorySettingsIntro">
            <h2>Settings</h2>
            <p>Bank Configuration - split by pipeline: Retain shapes what gets stored, Reflect shapes how the archive answers.</p>
          </header>

          <div className="memoryPromptModes memorySettingsMode">
            <button className={archiveSettingsMode === "retain" ? "selected" : ""} onClick={() => setArchiveSettingsMode("retain")}>
              Retain & Observations
            </button>
            <button className={archiveSettingsMode === "reflect" ? "selected" : ""} onClick={() => setArchiveSettingsMode("reflect")}>
              Reflect
            </button>
          </div>

          {archiveSettingsMode === "retain" ? (
            <>
              <section className="memorySettingsGroup">
                <div className="memorySettingsGroupHeader">
                  <span>Retain Pipeline</span>
                  <p>What the archive stores from incoming messages, and how durable facts get consolidated into observations.</p>
                </div>

                <div className="memorySettingsCard">
                  <div>
                    <h3>Retain</h3>
                    <p>Shape how the archive extracts memories from new documents.</p>
                  </div>
                  <label className="memorySettingsField">
                    <span>Retain Mission</span>
                    <small>What this archive should pay attention to during extraction. Steers the LLM without replacing the extraction rules.</small>
                    <textarea
                      value={retainMission}
                      onChange={(event) => setRetainMission(event.target.value)}
                      placeholder="e.g. Always include technical decisions, API design choices, and architectural trade-offs."
                    />
                  </label>
                  <label className="memorySettingsField">
                    <span>Custom Extraction Prompt</span>
                    <small>Replaces the built-in extraction rules entirely. Only takes effect when Extraction Mode is set to custom.</small>
                    <textarea value={customExtractionPrompt} onChange={(event) => setCustomExtractionPrompt(event.target.value)} />
                  </label>
                  <div className="memorySettingsToggleRow">
                    <div>
                      <strong>Free-form entities</strong>
                      <small>Extract regular named entities alongside entity labels. Disable to restrict extraction to entity labels only.</small>
                    </div>
                    <label className="miniToggle">
                      <span>{freeFormEntities ? "Enabled" : "Disabled"}</span>
                      <input type="checkbox" checked={freeFormEntities} onChange={(event) => setFreeFormEntities(event.target.checked)} />
                    </label>
                  </div>
                  <div className="memorySettingsActions">
                    <button className="button primary"><SquareCheck size={14} />Save changes</button>
                  </div>
                </div>
              </section>

              <section className="memorySettingsCard">
                <div>
                  <h3>Observations</h3>
                  <p>Control how facts are synthesized into durable observations.</p>
                </div>
                <div className="memorySettingsToggleRow">
                  <div>
                    <strong>Enable observations</strong>
                    <small>Enable automatic consolidation of facts into observations.</small>
                  </div>
                  <label className="miniToggle">
                    <span>{observationsEnabled ? "Enabled" : "Disabled"}</span>
                    <input type="checkbox" checked={observationsEnabled} onChange={(event) => setObservationsEnabled(event.target.checked)} />
                  </label>
                </div>
                <label className="memorySettingsField">
                  <span>Observations Mission</span>
                  <small>What this archive should synthesize into durable observations. Leave blank to use the server default.</small>
                  <textarea
                    value={observationsMission}
                    onChange={(event) => setObservationsMission(event.target.value)}
                    placeholder="e.g. Observations are stable facts about people and projects. Always include preferences, skills, and recurring patterns. Ignore one-off events and ephemeral state."
                  />
                </label>
                <div className="memorySettingsActions">
                  <button className="button primary"><SquareCheck size={14} />Save changes</button>
                </div>
              </section>
            </>
          ) : (
            <section className="memorySettingsCard">
              <div>
                <h3>Reflect</h3>
                <p>Shape how the archive uses retained facts when answering questions.</p>
              </div>
              <label className="memorySettingsField">
                <span>Reflect Mission</span>
                <small>Guidance for answering from archive entries without changing what gets stored.</small>
                <textarea placeholder="e.g. Answer concisely, cite source-backed facts, and separate stable observations from recent notes." />
              </label>
              <div className="memorySettingsActions">
                <button className="button primary"><SquareCheck size={14} />Save changes</button>
              </div>
            </section>
          )}

          <section className="memorySettingsCard dangerZone">
            <div>
              <h3>Danger zone</h3>
              <p>Destructive actions that cannot be undone.</p>
            </div>
            <div className="memorySettingsDangerRow">
              <div>
                <strong>Delete this memory bank</strong>
                <small>Permanently removes this bank and all of its documents, memories, entities, and directives.</small>
              </div>
              <button className="button danger"><Trash2 size={14} />Delete bank</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function rendererSkillRegistryId(skill: Pick<SkillMetadata, "name" | "source">): string {
  return `${rendererSlugify(skill.source || "skill")}:${rendererSlugify(skill.name || "skill")}`;
}

function rendererSlugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "skill";
}

function formatCompactCount(value: number | undefined): string {
  const count = Number.isFinite(value) && value ? Math.max(0, Number(value)) : 0;
  if (count >= 1_000_000) return `${trimCompactNumber(count / 1_000_000)}m`;
  if (count >= 1_000) return `${trimCompactNumber(count / 1_000)}k`;
  return String(count);
}

function trimCompactNumber(value: number): string {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, "");
}

function formatSkillUpdatedAt(value?: string): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime()) || date.getTime() <= 0) return "Updated recently";
  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `Updated ${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `Updated ${days}d ago`;
  if (days < 60) return `Updated ${Math.max(2, Math.round(days / 7))}w ago`;
  const months = Math.max(2, Math.round(days / 30));
  if (months < 12) return `Updated ${months}mo ago`;
  return `Updated ${Math.floor(months / 12)}y ago`;
}

function WikiView({
  initialTab,
  wikiState,
  skills,
  selectedWorkspace,
  activeAgent,
  agents,
  bookmarkedAgentIds,
  publishedApps,
  publisherReadiness,
  refreshPublishedApps,
  skillSearchRequest,
  shareExplorerResultToAgent,
  setView,
  onEdgePreviewReady,
}: {
  initialTab?: WikiTab | undefined;
  wikiState: WikiState | null;
  skills: SkillMetadata[];
  selectedWorkspace?: WorkspaceSummary;
  activeAgent: ActiveAgentSelection | null;
  agents: AgentSummary[];
  bookmarkedAgentIds: string[];
  publishedApps: LinkPublishedApp[];
  publisherReadiness: LinkAppPublisherReadiness | null;
  refreshPublishedApps: () => Promise<void>;
  skillSearchRequest: string;
  shareExplorerResultToAgent: (result: ExplorerResult) => Promise<void>;
  setView: (view: ViewId) => void;
  onEdgePreviewReady: (preview: EdgePreviewSurface) => void;
}) {
  const [tab, setTab] = useState<WikiTab>(initialTab ?? "support");
  const activePage: WikiPage = tab === "apps" ? "apps" : tab === "skills" ? "skills" : "wiki";
  const activeWikiSource = tab === "apps" || tab === "skills" ? "support" : tab;
  const [query, setQuery] = useState(skillSearchRequest);
  const keepQueryForTabReset = useRef(Boolean(skillSearchRequest.trim()));
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"az" | "za">("az");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkillDetailName, setSelectedSkillDetailName] = useState("");
  const [selectedSkillDetailTab, setSelectedSkillDetailTab] = useState<"overview" | "source" | "usage">("overview");
  const [selectedAppDetailId, setSelectedAppDetailId] = useState("");
  const [selectedAppDetailTab, setSelectedAppDetailTab] = useState<"overview" | "source" | "actions">("overview");
  const [expandedSkillNames, setExpandedSkillNames] = useState<string[]>([]);
  const [skillMarkdownByName, setSkillMarkdownByName] = useState<Record<string, SkillMarkdownLoadState>>({});
  const [result, setResult] = useState("");
  const [publishMenuOpen, setPublishMenuOpen] = useState(false);
  const [publishAppOpen, setPublishAppOpen] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [appActionBusyId, setAppActionBusyId] = useState("");
  const [localDraftApps, setLocalDraftApps] = useState<LinkLocalEdgeDraftApp[]>([]);
  const [localDraftBusy, setLocalDraftBusy] = useState(false);
  const [wikiDocumentationSources, setWikiDocumentationSources] = useState<WikiDocumentationSource[]>([]);
  const [publishDraft, setPublishDraft] = useState<PublishAppDraft>({
    name: "",
    slug: "",
    description: "",
    ownerSquad: "",
    audience: "",
    appType: "web",
    sourceRepo: "https://github.com/team-telnyx/link",
    sourceRef: "main",
    sourceSubdir: "edge-apps",
    installCommand: "",
    buildCommand: "npm run build",
    startCommand: "",
    outputDir: "dist",
    envSchema: "",
    reviewers: "",
    riskLevel: "medium",
    deploymentTarget: "local-only",
  });
  const [skillDeploymentTarget, setSkillDeploymentTarget] = useState<ArtifactDeploymentTarget>("local-only");
  const [artifactDeployments, setArtifactDeployments] = useState<ArtifactDeploymentRecord[]>([]);
  const [deploymentBusyId, setDeploymentBusyId] = useState("");
  const publishMenuRef = useRef<HTMLDivElement | null>(null);
  const publishOptions = [
    { label: "App", detail: "Build and deploy an Edge-hosted app with your bot.", icon: Grid2X2Plus, tab: "apps" },
    { label: "Doc", detail: "Build a local bot page, runbook, or source bundle.", icon: BookOpen, tab: "wiki", sourceTab: "support" },
    { label: "Automation", detail: "Build a scheduled workflow owned by your bot.", icon: Bot, tab: "apps" },
  ] as const;
  const [installedSkillKeys, setInstalledSkillKeys] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(window.localStorage.getItem("telnyx-link-installed-agent-skills") ?? "[]");
      return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });
  const [localSkillStatsById, setLocalSkillStatsById] = useState<Record<string, Partial<SkillMetadata>>>({});
  const filteredSkills = useMemo(() => {
    const term = query.trim().toLowerCase();
    const results = term
      ? skills.filter((skill) => `${skill.name} ${skill.description} ${skill.team} ${skill.product ?? ""}`.toLowerCase().includes(term))
      : skills;
    return [...results]
      .filter((skill) => filter === "all" || skill.team === filter)
      .sort((left, right) => sort === "za" ? right.name.localeCompare(left.name) : left.name.localeCompare(right.name));
  }, [filter, query, skills, sort]);
		  const filteredApps = useMemo(() => {
		    const term = query.trim().toLowerCase();
		    return publishedApps
		      .filter(isEdgeHostedPublishedApp)
		      .filter((app) => filter === "all" || app.status === filter || app.appType === filter || app.access === filter || app.riskLevel === filter)
		      .filter((app) => !term || `${app.name} ${app.description} ${app.ownerSquad} ${app.audience} ${app.appType} ${app.status} ${app.sourceRepo ?? ""}`.toLowerCase().includes(term))
		      .sort((left, right) => sort === "za" ? right.name.localeCompare(left.name) : left.name.localeCompare(right.name));
		  }, [filter, publishedApps, query, sort]);
	  const filteredLocalDraftApps = useMemo(() => {
	    const term = query.trim().toLowerCase();
	    return localDraftApps
	      .filter((app) => filter === "all" || filter === "preview" || filter === "web")
	      .filter((app) => !term || `${app.name} ${app.description} ${app.slug} ${app.directory}`.toLowerCase().includes(term))
	      .sort((left, right) => sort === "za" ? right.name.localeCompare(left.name) : left.name.localeCompare(right.name));
	  }, [filter, localDraftApps, query, sort]);
  const publisherReachable = publisherReadiness?.reachable !== false;
  const tabFilterOptions = useMemo(() => {
    if (activePage === "apps") return ["all", "submitted", "preview", "approved", "deployed", "rejected", "web", "mcp_app", "vpn", "low", "medium", "high"];
    if (activePage === "skills") return ["all", ...new Set(skills.map((skill) => skill.team).filter(Boolean))];
    return ["all"];
  }, [activePage, skills]);
  const activeDirectoryAgent = activeAgent ? agents.find((agent) => agent.id === activeAgent.id) : undefined;
  const openClawActiveAgent = String(activeDirectoryAgent?.type ?? "").toLowerCase().includes("openclaw");
  const wikiNavigationTabs = useMemo(() => {
    const configuredTabs = wikiDocumentationSources
      .filter((source) => source.enabled)
      .map(wikiConfigFromDocumentationSource);
    return configuredTabs.length ? configuredTabs : wikiSourceTabs;
  }, [wikiDocumentationSources]);
  const activeWikiSourceTab = wikiNavigationTabs.find((source) => source.id === activeWikiSource) ?? wikiNavigationTabs[0]!;
  const wikiSearchPlaceholder = activeWikiSourceTab.externalSource === "support"
    ? `Search ${activeWikiSourceTab.label}...`
    : activeWikiSourceTab.externalSource === "developers"
      ? `Search ${activeWikiSourceTab.label}...`
      : activeWikiSourceTab.externalSource === "pylon"
        ? `Search ${activeWikiSourceTab.label}...`
        : activeWikiSourceTab.externalSource === "custom"
          ? `Search ${activeWikiSourceTab.label}...`
          : `Search ${activeWikiSourceTab.label}...`;
  const searchPlaceholder = activePage === "apps"
        ? "Search apps..."
        : activePage === "skills"
          ? "Search skills..."
        : wikiSearchPlaceholder;

  useEffect(() => {
    window.localStorage.setItem("telnyx-link-installed-agent-skills", JSON.stringify(installedSkillKeys));
  }, [installedSkillKeys]);

  useEffect(() => {
    setTab(initialTab ?? "support");
  }, [initialTab]);

  useEffect(() => {
    void linkApi.listWikiSources().then(setWikiDocumentationSources).catch(() => setWikiDocumentationSources([]));
  }, []);

  useEffect(() => {
    if (activePage !== "wiki") return;
    if (wikiNavigationTabs.some((source) => source.id === activeWikiSource)) return;
    setTab(wikiNavigationTabs[0]?.id ?? "support");
  }, [activePage, activeWikiSource, wikiNavigationTabs]);

  useEffect(() => {
    if (!skillSearchRequest.trim()) return;
    keepQueryForTabReset.current = true;
    setTab("skills");
    setFilter("all");
    setSort("az");
    setQuery(skillSearchRequest);
  }, [skillSearchRequest]);

  useEffect(() => {
    setFilter("all");
    if (keepQueryForTabReset.current) {
      keepQueryForTabReset.current = false;
    } else {
      setQuery("");
    }
    setSort("az");
    setExpandedSkillNames([]);
    setSelectedSkillDetailName("");
    setSelectedSkillDetailTab("overview");
    setSelectedAppDetailId("");
    setSelectedAppDetailTab("overview");
  }, [tab]);

	  useEffect(() => {
	    function closePublishMenu(event: MouseEvent) {
	      if (!publishMenuRef.current?.contains(event.target as Node)) setPublishMenuOpen(false);
	    }
	    if (publishMenuOpen) document.addEventListener("mousedown", closePublishMenu);
	    return () => document.removeEventListener("mousedown", closePublishMenu);
	  }, [publishMenuOpen]);

	  async function refreshLocalDraftApps() {
	    setLocalDraftBusy(true);
	    try {
	      setLocalDraftApps(await linkApi.listLocalEdgeDraftApps());
	    } catch (error) {
	      setResult(error instanceof Error ? error.message : "Unable to load draft apps.");
	    } finally {
	      setLocalDraftBusy(false);
	    }
	  }

  async function refreshArtifactDeployments() {
    try {
      setArtifactDeployments(await linkApi.listArtifactDeployments());
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Unable to load deployment records.");
    }
  }

	  useEffect(() => {
	    if (activePage === "apps") void refreshLocalDraftApps();
	  }, [activePage]);

  useEffect(() => {
    if (activePage === "apps" || activePage === "skills") void refreshArtifactDeployments();
  }, [activePage]);

	  function toggleSkillDetails(skillName: string) {
    if (!expandedSkillNames.includes(skillName)) void loadSkillMarkdown(skillName);
    setExpandedSkillNames((current) =>
      current.includes(skillName) ? current.filter((item) => item !== skillName) : [...current, skillName],
    );
  }

  async function loadSkillMarkdown(skillName: string) {
    const current = skillMarkdownByName[skillName];
    if (current?.status === "loading" || current?.status === "ready") return;
    setSkillMarkdownByName((items) => ({ ...items, [skillName]: { status: "loading" } }));
    try {
      const markdown = await linkApi.getSkillMarkdown(skillName);
      setSkillMarkdownByName((items) => ({ ...items, [skillName]: { status: "ready", result: markdown } }));
    } catch (error) {
      setSkillMarkdownByName((items) => ({
        ...items,
        [skillName]: { status: "error", message: error instanceof Error ? error.message : "Unable to load SKILL.md." },
      }));
    }
  }

  function startPublishing(option: (typeof publishOptions)[number]) {
    setTab(option.tab === "apps" ? "apps" : option.sourceTab);
    setSelectedSkill(`Publish ${option.label}`);
    setPublishMenuOpen(false);
    if (option.label === "App") {
      setPublishAppOpen(true);
      setResult("");
      return;
    }
    setResult(JSON.stringify({
      status: "draft",
      type: option.label.toLowerCase(),
      source: activeAgent?.displayName ?? "local bot",
      next: "Choose the local bot asset, owner, approval policy, and target audience before publishing to Wiki.",
    }, null, 2));
  }

  function skillWithLocalStats(skill: SkillMetadata): SkillMetadata {
    const skillId = skill.skillId ?? rendererSkillRegistryId(skill);
    return {
      ...skill,
      ...(localSkillStatsById[skillId] ?? {}),
      skillId,
    };
  }

  function deploymentForArtifact(artifactKind: "app" | "skill", artifactId: string) {
    return artifactDeployments.find((deployment) => deployment.artifactKind === artifactKind && deployment.artifactId === artifactId);
  }

  function appArtifactIdFromSlug(slug: string) {
    return `app-${rendererSlugify(slug || "app")}`;
  }

  function deploymentTargetLabel(target: ArtifactDeploymentTarget) {
    if (target === "local-only") return "Keep Local";
    if (target === "local-shared") return "Local Shared";
    if (target === "telnyx-byo-cloud") return "Telnyx BYO Cloud";
    return "Telnyx Managed";
  }

  function deploymentBoundaryLabel(deployment?: Pick<ArtifactDeploymentRecord, "dataBoundary" | "target">) {
    if (!deployment) return "Local";
    if (deployment.target === "telnyx-managed") return "Telnyx Managed";
    return deployment.dataBoundary === "telnyx-cloud" ? "Telnyx Cloud" : "Local";
  }

  function deploymentStatusLabel(status?: ArtifactDeploymentRecord["status"]) {
    if (status === "published") return "Published";
    if (status === "shared_local") return "Local shared";
    if (status === "failed") return "Failed";
    return "Local";
  }

  function renderDeploymentChip(deployment?: ArtifactDeploymentRecord) {
    const boundary = deployment?.dataBoundary ?? "local";
    return (
      <span className={`dataBoundaryChip dataBoundaryChip-${boundary}`}>
        {deployment ? `${deploymentBoundaryLabel(deployment)} / ${deploymentStatusLabel(deployment.status)}` : "Local / Not published"}
      </span>
    );
  }

  function formatArtifactDeploymentResult(deployment: ArtifactDeploymentRecord) {
    return JSON.stringify({
      status: deployment.status,
      target: deploymentTargetLabel(deployment.target),
      dataBoundary: deploymentBoundaryLabel(deployment),
      artifact: deployment.artifactName,
      message: deployment.message,
      url: deployment.url,
      updatedAt: deployment.updatedAt,
    }, null, 2);
  }

  function updateSkillStats(stats: {
    skillId: string;
    starCount: number;
    installCount: number;
    downloadCount: number;
    runCount: number;
    viewCount: number;
    starredByActor: boolean;
    installedByActor: boolean;
    updatedAt: string;
  }) {
    setLocalSkillStatsById((current) => ({
      ...current,
      [stats.skillId]: {
        skillId: stats.skillId,
        starCount: stats.starCount,
        installCount: stats.installCount,
        downloadCount: stats.downloadCount,
        runCount: stats.runCount,
        viewCount: stats.viewCount,
        starredByActor: stats.starredByActor,
        installedByActor: stats.installedByActor,
        registryUpdatedAt: stats.updatedAt,
      },
    }));
  }

  async function toggleSkillStar(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    setSelectedSkill(trackedSkill.name);
    const eventType = trackedSkill.starredByActor ? "unstar" : "star";
    const stats = await linkApi.recordSkillRegistryEvent({
      skillId: trackedSkill.skillId,
      skillName: trackedSkill.name,
      source: trackedSkill.source,
      eventType,
    });
    updateSkillStats(stats);
    setResult(eventType === "star" ? `${trackedSkill.name} starred.` : `${trackedSkill.name} unstarred.`);
  }

  async function installSkill(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    setSelectedSkill(trackedSkill.name);
    if (!activeAgent) {
      setResult("Choose an active agent on Agents > Personal before installing skills.");
      setView("agents");
      return;
    }
    const installKey = `${activeAgent.id}:${trackedSkill.name}`;
    setInstalledSkillKeys((current) => current.includes(installKey) ? current : [...current, installKey]);
    const stats = await linkApi.recordSkillRegistryEvent({
      skillId: trackedSkill.skillId,
      skillName: trackedSkill.name,
      source: trackedSkill.source,
      eventType: "install",
    });
    updateSkillStats(stats);
    setResult(`${trackedSkill.name} installed on ${activeAgent.displayName}.`);
  }

  function skillManifestFromMetadata(skill: SkillMetadata): ToolStudioManifestInput {
    const trackedSkill = skillWithLocalStats(skill);
    const markdownState = skillMarkdownByName[trackedSkill.name];
    return {
      toolId: trackedSkill.skillId ?? rendererSkillRegistryId(trackedSkill),
      name: trackedSkill.name,
      description: trackedSkill.description,
      owner: trackedSkill.owner || "Local user",
      team: trackedSkill.team || "Personal",
      audience: trackedSkill.audience || "Local workspace",
      artifactType: trackedSkill.artifactType ?? "skill",
      inputs: "User prompt or selected chat context.",
      outputs: "Reviewable agent output.",
      toolsRequired: trackedSkill.toolsRequired ?? [],
      riskLevel: trackedSkill.riskLevel ?? "medium",
      customerSafe: Boolean(trackedSkill.customerSafe),
      approvalRequired: Boolean(trackedSkill.approvalRequired),
      sourceOfTruth: trackedSkill.sourceOfTruth || trackedSkill.source || "Local Link skill",
      repeatedChecks: trackedSkill.repeatedChecks || "Run the included local skill fixture before publishing.",
      humanCheckpoints: trackedSkill.humanCheckpoints || "Human owner reviews external or destructive actions.",
      testFixture: trackedSkill.testFixture || "Use the current chat request as a fixture.",
      reviewers: trackedSkill.reviewers ?? [],
      version: trackedSkill.version || "1.0.0",
      visibility: trackedSkill.visibility || "private",
      skillMarkdown: markdownState?.status === "ready"
        ? markdownState.result.markdown
        : "",
      checklist: ["No secrets in SKILL.md", "Data boundary reviewed", "Owner accepted deployment target"],
    };
  }

  async function deploySkill(skill: SkillMetadata, target = skillDeploymentTarget) {
    const trackedSkill = skillWithLocalStats(skill);
    setDeploymentBusyId(`skill:${trackedSkill.skillId}:${target}`);
    setSelectedSkill(trackedSkill.name);
    try {
      const deployment = await linkApi.deployArtifact({
        artifactKind: "skill",
        artifactId: trackedSkill.skillId ?? rendererSkillRegistryId(trackedSkill),
        artifactName: trackedSkill.name,
        target,
        skill: skillManifestFromMetadata(trackedSkill),
        permissions: trackedSkill.toolsRequired ?? [],
        secretsRequired: [],
      });
      await refreshArtifactDeployments();
      setResult(formatArtifactDeploymentResult(deployment));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Unable to deploy skill.");
    } finally {
      setDeploymentBusyId("");
    }
  }

  function openSkillDetail(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    setSelectedSkill(trackedSkill.name);
    setSelectedSkillDetailName(trackedSkill.name);
    setSelectedSkillDetailTab("overview");
    void loadSkillMarkdown(trackedSkill.name);
  }

  function renderSkillButton(skill: SkillMetadata) {
    const trackedSkill = skillWithLocalStats(skill);
    const installed = activeAgent ? installedSkillKeys.includes(`${activeAgent.id}:${trackedSkill.name}`) : false;
    const downloadCount = trackedSkill.downloadCount ?? trackedSkill.installCount ?? 0;
    const deployment = deploymentForArtifact("skill", trackedSkill.skillId ?? rendererSkillRegistryId(trackedSkill));
    return (
      <div
        key={trackedSkill.name}
        className={`chatResultRow directoryResultRow skillDirectoryResultRow ${selectedSkill === trackedSkill.name ? "selected" : ""}`}
        role="row"
        tabIndex={0}
        onClick={() => openSkillDetail(trackedSkill)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openSkillDetail(trackedSkill);
          }
        }}
      >
        <span className="directoryNameCell" role="cell">
          <strong>{trackedSkill.name}</strong>
          <small>{trackedSkill.description}</small>
          {renderDeploymentChip(deployment)}
        </span>
        <span role="cell">{trackedSkill.team}</span>
        <span role="cell">{trackedSkill.product ?? trackedSkill.language ?? "Workflow"}</span>
        <span role="cell">{formatCompactCount(trackedSkill.starCount)} stars / {formatCompactCount(downloadCount)} installs</span>
        <span className="directoryRowActions" role="cell">
          <button
            className={`iconButton bookmarkButton skillInstallIconButton ${trackedSkill.starredByActor ? "selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              void toggleSkillStar(trackedSkill);
            }}
            type="button"
            title={trackedSkill.starredByActor ? "Unstar skill" : "Star skill"}
            aria-label={trackedSkill.starredByActor ? `Unstar ${trackedSkill.name}` : `Star ${trackedSkill.name}`}
          >
            <Star size={15} fill={trackedSkill.starredByActor ? "currentColor" : "none"} />
          </button>
          <button
            className={`iconButton bookmarkButton skillInstallIconButton ${installed ? "selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              void installSkill(trackedSkill);
            }}
            type="button"
            title={installed ? "Skill installed" : "Install skill"}
            aria-label={installed ? `${trackedSkill.name} installed` : `Install ${trackedSkill.name}`}
          >
            <Plus size={15} />
          </button>
        </span>
        <button
          className="chatSessionOpenButton"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openSkillDetail(trackedSkill);
          }}
          aria-label={`Open ${trackedSkill.name}`}
          title="Open skill"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  function updatePublishDraft<K extends keyof PublishAppDraft>(key: K, value: PublishAppDraft[K]) {
    setPublishDraft((current) => ({ ...current, [key]: value }));
  }

  function applyPublishInspection(inspection: LinkLocalAppInspection) {
    if (!inspection.publishInput) return;
    const input = inspection.publishInput;
    setPublishDraft((current) => ({
      ...current,
      name: input.name,
      slug: input.slug ?? current.slug,
      description: input.description ?? current.description,
      ownerSquad: input.ownerSquad,
      audience: input.audience,
      appType: input.appType,
      sourceRepo: input.sourceRepo,
      sourceRef: input.sourceRef ?? "main",
      sourceSubdir: input.sourceSubdir ?? ".",
      installCommand: input.installCommand ?? "",
      buildCommand: input.buildCommand ?? "npm run build",
      startCommand: input.startCommand ?? "",
      outputDir: input.outputDir ?? "",
      envSchema: (input.envSchema ?? []).join("\n"),
      reviewers: (input.reviewers ?? []).join("\n"),
      riskLevel: input.riskLevel,
    }));
  }

  async function loadLocalPublishApp() {
    setPublishBusy(true);
    setResult("Reading local link-app.yml...");
    try {
      const inspection = await linkApi.selectLocalPublishApp();
      if (inspection.canceled) {
        setResult(inspection.warnings?.[0] ?? "Local app selection canceled.");
        return;
      }
      applyPublishInspection(inspection);
      setResult(JSON.stringify({
        status: "manifest_loaded",
        manifest: inspection.manifestPath,
        source: inspection.publishInput
          ? [inspection.publishInput.sourceRepo, inspection.publishInput.sourceRef, inspection.publishInput.sourceSubdir].filter(Boolean).join(" / ")
          : "",
        warnings: inspection.warnings ?? [],
      }, null, 2));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to read local app manifest.");
    } finally {
      setPublishBusy(false);
    }
  }

  function publishInputFromDraft(): LinkAppPublishInput {
    return {
      name: publishDraft.name.trim(),
      slug: publishDraft.slug.trim() || undefined,
      description: publishDraft.description.trim() || undefined,
      ownerSquad: publishDraft.ownerSquad.trim(),
      audience: publishDraft.audience.trim(),
      appType: publishDraft.appType,
      sourceRepo: publishDraft.sourceRepo.trim(),
      sourceRef: publishDraft.sourceRef.trim() || "main",
      sourceSubdir: publishDraft.sourceSubdir.trim() || ".",
      installCommand: publishDraft.installCommand.trim() || undefined,
      buildCommand: publishDraft.buildCommand.trim() || "npm run build",
      startCommand: publishDraft.startCommand.trim() || undefined,
      outputDir: publishDraft.outputDir.trim() || undefined,
      envSchema: splitInputList(publishDraft.envSchema),
      reviewers: splitInputList(publishDraft.reviewers),
      riskLevel: publishDraft.riskLevel,
    };
  }

	  async function submitPublishIntent() {
	    setPublishBusy(true);
	    setResult("Deploying app...");
	    try {
      const appInput = publishInputFromDraft();
      if (publishDraft.deploymentTarget === "telnyx-byo-cloud") {
        setResult("Import the app as a local draft, then use Deploy to Telnyx Cloud from the Personal app row.");
        return;
      }
	      const deployment = await linkApi.deployArtifact({
        artifactKind: "app",
        artifactId: appArtifactIdFromSlug(appInput.slug || appInput.name),
        artifactName: appInput.name,
        target: publishDraft.deploymentTarget,
        app: appInput,
        permissions: appInput.envSchema ?? [],
        secretsRequired: publishDraft.deploymentTarget === "telnyx-managed" ? ["TELNYX_AUTH_REV2 or TELNYX_API_KEY"] : [],
      });
      await refreshPublishedApps();
      await refreshArtifactDeployments();
      if (deployment.status !== "failed") setPublishAppOpen(false);
      setResult(formatArtifactDeploymentResult(deployment));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "App publish request failed.");
    } finally {
	      setPublishBusy(false);
	    }
	  }

	  async function importLocalDraftApp(scope: LinkLocalEdgeImportScope = "personal") {
	    setLocalDraftBusy(true);
	    setResult("Choose an app folder or Zip archive to import.");
	    try {
	      const response = await linkApi.importLocalEdgeApp({ scope });
	      if (response.canceled) {
	        setResult("App import canceled.");
	        return;
	      }
	      await refreshLocalDraftApps();
	      setResult(JSON.stringify({
	        status: "imported",
	        scope: response.importScope ?? scope,
	        directory: response.directory ?? response.targetDirectory,
	        manifest: response.manifestPath,
	        slug: response.publishInput?.slug,
	        warnings: response.warnings ?? [],
	      }, null, 2));
	    } catch (err) {
	      setResult(err instanceof Error ? err.message : "Unable to import local app.");
	    } finally {
	      setLocalDraftBusy(false);
	    }
	  }

	  async function previewLocalDraftApp(app: LinkLocalEdgeDraftApp) {
	    setAppActionBusyId(app.id);
	    try {
	      const response = await linkApi.previewLocalEdgeApp({ directory: app.directory, slug: app.slug });
	      if (response.canceled || !response.url) return;
	      onEdgePreviewReady({
	        url: response.url,
	        slug: app.slug,
	        directory: response.directory ?? app.directory,
	      });
	    } catch (err) {
	      setResult(err instanceof Error ? err.message : "Unable to preview draft app.");
	    } finally {
	      setAppActionBusyId("");
	    }
	  }

  async function deployLocalDraftApp(app: LinkLocalEdgeDraftApp, target: ArtifactDeploymentTarget) {
    setAppActionBusyId(app.id);
    setDeploymentBusyId(`app:${app.id}:${target}`);
    try {
      const deployment = await linkApi.deployArtifact({
        artifactKind: "app",
        artifactId: appArtifactIdFromSlug(app.slug),
        artifactName: app.name,
        target,
        app: {
          name: app.name,
          slug: app.slug,
          description: app.description,
          ownerSquad: "personal.tools",
          audience: "Personal workspace",
          appType: "web",
          sourceRepo: "https://github.com/team-telnyx/link",
          sourceRef: "main",
          sourceSubdir: app.sourceSubdir || app.directory,
          buildCommand: app.buildCommand || "npm run build",
          installCommand: app.installCommand,
          outputDir: app.outputDir || "dist",
          riskLevel: "low",
          directory: app.directory,
          replaceExisting: true,
        },
        secretsRequired: target === "telnyx-byo-cloud" ? ["TELNYX_API_KEY or TELNYX_AUTH_REV2", "telnyx-edge CLI auth"] : [],
      });
      await refreshPublishedApps();
      await refreshArtifactDeployments();
      setResult(formatArtifactDeploymentResult(deployment));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to deploy local app.");
    } finally {
      setAppActionBusyId("");
      setDeploymentBusyId("");
    }
  }

	  async function deleteLocalDraftApp(app: LinkLocalEdgeDraftApp) {
	    setAppActionBusyId(app.id);
	    try {
	      await linkApi.deleteLocalEdgeDraftApp({ directory: app.directory });
	      await refreshLocalDraftApps();
	      setResult(`${app.name} removed.`);
	    } catch (err) {
	      setResult(err instanceof Error ? err.message : "Unable to remove draft app.");
	    } finally {
	      setAppActionBusyId("");
	    }
	  }

	  async function openPublishedApp(app: LinkPublishedApp) {
    setAppActionBusyId(app.id);
    try {
      const response = await linkApi.openPublishedApp(app.id);
      setResult(`Opened ${app.name}: ${response.url}`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to open app.");
    } finally {
      setAppActionBusyId("");
    }
  }

  async function duplicatePublishedApp(app: LinkPublishedApp) {
    setAppActionBusyId(app.id);
    try {
      const response = await linkApi.duplicatePublishedApp(app.id);
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to duplicate app.");
    } finally {
      setAppActionBusyId("");
    }
  }

  async function reviewPublishedApp(app: LinkPublishedApp, decision: "approve" | "reject") {
    setAppActionBusyId(app.id);
    try {
      const response = await linkApi.reviewPublishedApp({ appId: app.id, decision });
      await refreshPublishedApps();
      setResult(formatPublisherResult(response));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to record review.");
    } finally {
      setAppActionBusyId("");
    }
  }

  async function rollbackPublishedApp(app: LinkPublishedApp) {
    const targetVersion = app.versions?.find((version) => version.id !== app.latestVersion?.id);
    if (!targetVersion) {
      setResult("No previous version is available for rollback.");
      return;
    }
    setAppActionBusyId(app.id);
    try {
      const response = await linkApi.rollbackPublishedApp({
        appId: app.id,
        versionId: targetVersion.id,
        notes: `Rollback to ${targetVersion.sourceRef || targetVersion.version}.`,
      });
      await refreshPublishedApps();
      setResult(formatPublisherResult(response));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to roll back app.");
    } finally {
      setAppActionBusyId("");
    }
  }

  async function deprecatePublishedApp(app: LinkPublishedApp) {
    setAppActionBusyId(app.id);
    try {
      const response = await linkApi.deprecatePublishedApp({
        appId: app.id,
        notes: "Deprecated from Link Desktop.",
      });
      await refreshPublishedApps();
      setResult(formatPublisherResult(response));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Unable to deprecate app.");
    } finally {
      setAppActionBusyId("");
    }
  }

  function renderPublishAppPanel() {
    if (!publishAppOpen) return null;
    return (
      <section className="publisherPanel" aria-label="Publish app">
        <div className="publisherPanelHeader">
          <div>
            <h2>Publish App</h2>
            <small>Managed publisher</small>
          </div>
          <button className="iconButton" onClick={() => setPublishAppOpen(false)} aria-label="Close publish app">
            <X size={16} />
          </button>
        </div>
        <div className="publisherForm">
          <label className="publisherWideField">
            <span>Deployment target</span>
            <select value={publishDraft.deploymentTarget} onChange={(event) => updatePublishDraft("deploymentTarget", event.target.value as ArtifactDeploymentTarget)}>
              <option value="local-only">Keep Local</option>
              <option value="local-shared">Local Shared</option>
              <option value="telnyx-managed">Telnyx Managed</option>
              <option value="telnyx-byo-cloud">Telnyx BYO Cloud</option>
            </select>
          </label>
          <label>
            <span>Name</span>
            <input value={publishDraft.name} onChange={(event) => updatePublishDraft("name", event.target.value)} placeholder="Internal app name" />
          </label>
          <label>
            <span>Slug</span>
            <input value={publishDraft.slug} onChange={(event) => updatePublishDraft("slug", event.target.value)} placeholder="carrier-readiness-hub" />
          </label>
          <label className="publisherWideField">
            <span>Description</span>
            <textarea value={publishDraft.description} onChange={(event) => updatePublishDraft("description", event.target.value)} rows={3} />
          </label>
          <label>
            <span>Owner squad</span>
            <input value={publishDraft.ownerSquad} onChange={(event) => updatePublishDraft("ownerSquad", event.target.value)} placeholder="messaging-ops.squad" />
          </label>
          <label>
            <span>Audience</span>
            <input value={publishDraft.audience} onChange={(event) => updatePublishDraft("audience", event.target.value)} placeholder="Messaging, NOC" />
          </label>
          <label>
            <span>Type</span>
            <select value={publishDraft.appType} onChange={(event) => updatePublishDraft("appType", event.target.value as LinkPublishedAppType)}>
              <option value="web">Web app</option>
              <option value="mcp_app">MCP app</option>
            </select>
          </label>
          <label>
            <span>Risk</span>
            <select value={publishDraft.riskLevel} onChange={(event) => updatePublishDraft("riskLevel", event.target.value as LinkPublishedAppRisk)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="publisherWideField">
            <span>Source repo</span>
            <input value={publishDraft.sourceRepo} onChange={(event) => updatePublishDraft("sourceRepo", event.target.value)} />
          </label>
          <label>
            <span>Source ref</span>
            <input value={publishDraft.sourceRef} onChange={(event) => updatePublishDraft("sourceRef", event.target.value)} />
          </label>
          <label>
            <span>Source subdir</span>
            <input value={publishDraft.sourceSubdir} onChange={(event) => updatePublishDraft("sourceSubdir", event.target.value)} />
          </label>
          <label>
            <span>Build command</span>
            <input value={publishDraft.buildCommand} onChange={(event) => updatePublishDraft("buildCommand", event.target.value)} />
          </label>
          <label>
            <span>Install command</span>
            <input value={publishDraft.installCommand} onChange={(event) => updatePublishDraft("installCommand", event.target.value)} placeholder="npm ci" />
          </label>
          <label>
            <span>Output dir</span>
            <input value={publishDraft.outputDir} onChange={(event) => updatePublishDraft("outputDir", event.target.value)} />
          </label>
          <label className="publisherWideField">
            <span>Start command</span>
            <input value={publishDraft.startCommand} onChange={(event) => updatePublishDraft("startCommand", event.target.value)} placeholder="npm start" />
          </label>
          <label>
            <span>Env schema</span>
            <textarea value={publishDraft.envSchema} onChange={(event) => updatePublishDraft("envSchema", event.target.value)} rows={3} />
          </label>
          <label>
            <span>Reviewers</span>
            <textarea value={publishDraft.reviewers} onChange={(event) => updatePublishDraft("reviewers", event.target.value)} rows={3} />
          </label>
        </div>
        <div className="publisherPanelActions">
          <button className="button secondary" onClick={() => void loadLocalPublishApp()} disabled={publishBusy}>
            <FolderOpen size={15} />
            Load link-app.yml
          </button>
          <button className="button primary" onClick={() => void submitPublishIntent()} disabled={publishBusy}>
            <Upload size={15} />
            {publishDraft.deploymentTarget === "local-only" ? "Keep Local" : "Submit"}
          </button>
          <button className="button ghost" onClick={() => setPublishAppOpen(false)} disabled={publishBusy}>Cancel</button>
        </div>
      </section>
    );
  }

	  function renderPublisherReadiness() {
	    if (!publisherReadiness) return null;
	    const ready = publisherReadiness.ready;
    const reachable = publisherReadiness.reachable;
    const failedChecks = publisherReadiness.checks.filter((check) => !check.ok);
    const title = ready ? "Publisher ready" : reachable ? "Publisher not ready" : "Publisher unavailable";
    return (
      <section className={`publisherStatus ${ready ? "ready" : reachable ? "warning" : "danger"}`} aria-label="Publisher status">
        <div className="publisherStatusIcon">
          <ShieldCheck size={16} />
        </div>
        <div className="publisherStatusBody">
          <strong>{title}</strong>
          <span>{publisherReadiness.message}</span>
          {failedChecks.length > 0 && (
            <small>{failedChecks.map((check) => `${check.name}: ${check.detail || "not ready"}`).join(" | ")}</small>
          )}
        </div>
        <button className="button ghost" onClick={() => void refreshPublishedApps()} disabled={publishBusy || Boolean(appActionBusyId)}>
          <RefreshCw size={14} />
          Check again
        </button>
      </section>
	    );
	  }

  function openAppDetail(id: string) {
    setSelectedAppDetailId(id);
    setSelectedAppDetailTab("overview");
  }

  function renderLocalDraftAppRow(app: LinkLocalEdgeDraftApp) {
    const sourceLabel = app.sourceSubdir || app.directory.split("/").slice(-2).join("/");
    const rowId = `local:${app.id}`;
    const deployment = deploymentForArtifact("app", appArtifactIdFromSlug(app.slug));
    return (
      <div
        className="chatResultRow directoryResultRow appDirectoryResultRow"
        role="row"
        key={rowId}
        tabIndex={0}
        onClick={() => openAppDetail(rowId)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openAppDetail(rowId);
          }
        }}
      >
        <span className="directoryNameCell" role="cell">
          <strong>{app.name}</strong>
          <small>{app.description || `${app.slug}.apidev.telnyx.com`}</small>
        </span>
        <span role="cell">{sourceLabel}</span>
        <span role="cell">{renderDeploymentChip(deployment)}</span>
        <span role="cell">{formatSkillUpdatedAt(app.updatedAt)}</span>
        <button
          className="chatSessionOpenButton"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAppDetail(rowId);
          }}
          aria-label={`Open ${app.name}`}
          title="Open app"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  function renderPublishedAppRow(app: LinkPublishedApp) {
    const rowId = `published:${app.id}`;
    const deployment = deploymentForArtifact("app", app.id) ?? deploymentForArtifact("app", appArtifactIdFromSlug(app.slug));
    return (
      <div
        className="chatResultRow directoryResultRow appDirectoryResultRow"
        role="row"
        key={rowId}
        tabIndex={0}
        onClick={() => openAppDetail(rowId)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openAppDetail(rowId);
          }
        }}
      >
        <span className="directoryNameCell" role="cell">
          <strong>{app.name}</strong>
          <small>{app.description || app.audience}</small>
        </span>
        <span role="cell">{app.ownerSquad}</span>
        <span role="cell">{renderDeploymentChip(deployment)}</span>
        <span role="cell">{formatPublishedAppType(app.appType)}</span>
        <button
          className="chatSessionOpenButton"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAppDetail(rowId);
          }}
          aria-label={`Open ${app.name}`}
          title="Open app"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

	  function renderAppsTab() {
    const selectedLocalApp = selectedAppDetailId.startsWith("local:")
      ? localDraftApps.find((app) => `local:${app.id}` === selectedAppDetailId)
      : undefined;
    const selectedPublishedApp = selectedAppDetailId.startsWith("published:")
      ? publishedApps.find((app) => `published:${app.id}` === selectedAppDetailId)
      : undefined;
    const selectedApp = selectedLocalApp ?? selectedPublishedApp;
    if (selectedApp) {
      const isLocal = Boolean(selectedLocalApp);
      const selectedTitle = selectedApp.name;
      const selectedDescription = selectedApp.description || (selectedLocalApp ? `${selectedLocalApp.slug}.apidev.telnyx.com` : selectedPublishedApp?.audience ?? "");
      const selectedArtifactId = selectedLocalApp
        ? appArtifactIdFromSlug(selectedLocalApp.slug)
        : selectedPublishedApp
          ? selectedPublishedApp.id
          : "";
      const selectedDeployment = selectedArtifactId
        ? deploymentForArtifact("app", selectedArtifactId) ?? (selectedPublishedApp ? deploymentForArtifact("app", appArtifactIdFromSlug(selectedPublishedApp.slug)) : undefined)
        : undefined;
      return (
        <div className="marketplaceView embeddedMarketplace directoryDetailView embeddedDirectoryDetailView">
          <header className="directoryEmbeddedDetailHeader">
            <button className="iconButton chatDetailBackButton" type="button" onClick={() => setSelectedAppDetailId("")} aria-label="Back to apps">
              <ArrowLeft size={17} />
            </button>
            <div>
              <span>Apps / {isLocal ? "Personal" : "Team"}</span>
              <h2>{selectedTitle}</h2>
              <p>{selectedDescription || "No description saved."}</p>
            </div>
          </header>
          <section className="chatDetailSurface">
            <div className="chatReviewTabs directoryDetailTabs" role="tablist" aria-label="App details">
              {[
                ["overview", "Overview"],
                ["source", "Source"],
                ["actions", "Actions"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={selectedAppDetailTab === id ? "selected" : ""}
                  type="button"
                  onClick={() => setSelectedAppDetailTab(id as typeof selectedAppDetailTab)}
                  role="tab"
                  aria-selected={selectedAppDetailTab === id}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedAppDetailTab === "overview" && selectedLocalApp && (
              <div className="chatResultDetails directoryDetailPanel">
                <div><strong>Status</strong><span>Draft</span></div>
                <div><strong>Data boundary</strong><span>{renderDeploymentChip(selectedDeployment)}</span></div>
                <div><strong>Slug</strong><span>{selectedLocalApp.slug}.apidev.telnyx.com</span></div>
                <div><strong>Target</strong><span>{selectedDeployment ? deploymentTargetLabel(selectedDeployment.target) : "Keep Local"}</span></div>
                <div><strong>Output</strong><span>{selectedLocalApp.outputDir || "dist"}</span></div>
                <div><strong>Updated</strong><span>{formatSkillUpdatedAt(selectedLocalApp.updatedAt)}</span></div>
              </div>
            )}
            {selectedAppDetailTab === "overview" && selectedPublishedApp && (
              <div className="chatResultDetails directoryDetailPanel">
                <div><strong>Status</strong><span>{formatStatusLabel(selectedPublishedApp.status)}</span></div>
                <div><strong>Data boundary</strong><span>{renderDeploymentChip(selectedDeployment)}</span></div>
                <div><strong>Owner</strong><span>{selectedPublishedApp.ownerSquad}</span></div>
                <div><strong>Audience</strong><span>{selectedPublishedApp.audience}</span></div>
                <div><strong>Target</strong><span>{selectedDeployment ? deploymentTargetLabel(selectedDeployment.target) : "Telnyx Managed"}</span></div>
                <div><strong>Access</strong><span>{selectedPublishedApp.access.toUpperCase()}</span></div>
                <div><strong>Risk</strong><span>{selectedPublishedApp.riskLevel}</span></div>
                <div><strong>Type</strong><span>{formatPublishedAppType(selectedPublishedApp.appType)}</span></div>
              </div>
            )}
            {selectedAppDetailTab === "source" && selectedLocalApp && (
              <div className="chatResultDetails directoryDetailPanel">
                <div><strong>Directory</strong><span>{selectedLocalApp.directory}</span></div>
                <div><strong>Source subdir</strong><span>{selectedLocalApp.sourceSubdir || "Not set"}</span></div>
                <div><strong>Output dir</strong><span>{selectedLocalApp.outputDir || "dist"}</span></div>
              </div>
            )}
            {selectedAppDetailTab === "source" && selectedPublishedApp && (
              <div className="chatResultDetails directoryDetailPanel">
                <div><strong>Repository</strong><span>{selectedPublishedApp.sourceRepo ?? "No source repo"}</span></div>
                <div><strong>Ref</strong><span>{selectedPublishedApp.sourceRef ?? "main"}</span></div>
                <div><strong>Subdir</strong><span>{selectedPublishedApp.sourceSubdir ?? "."}</span></div>
                <div><strong>Version</strong><span>{selectedPublishedApp.latestVersion?.version ?? "Pending"}</span></div>
              </div>
            )}
            {selectedAppDetailTab === "actions" && selectedLocalApp && (
              <div className="directoryDetailPanel directoryActionPanel">
                <button className="button primary" onClick={() => void previewLocalDraftApp(selectedLocalApp)} disabled={appActionBusyId === selectedLocalApp.id}>
                  <MonitorPlay size={14} />
                  Preview
                </button>
                <button className="button secondary" onClick={() => void deployLocalDraftApp(selectedLocalApp, "local-only")} disabled={appActionBusyId === selectedLocalApp.id || deploymentBusyId === `app:${selectedLocalApp.id}:local-only`}>
                  <Save size={14} />
                  Keep Local
                </button>
                <button className="button secondary" onClick={() => void deployLocalDraftApp(selectedLocalApp, "telnyx-byo-cloud")} disabled={appActionBusyId === selectedLocalApp.id || deploymentBusyId === `app:${selectedLocalApp.id}:telnyx-byo-cloud`}>
                  <Upload size={14} />
                  Deploy to Telnyx Cloud
                </button>
                <button className="button ghost" onClick={() => void deleteLocalDraftApp(selectedLocalApp)} disabled={appActionBusyId === selectedLocalApp.id}>
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            )}
            {selectedAppDetailTab === "actions" && selectedPublishedApp && (
              <div className="directoryDetailPanel directoryActionPanel">
                <button className="button secondary" onClick={() => void openPublishedApp(selectedPublishedApp)} disabled={appActionBusyId === selectedPublishedApp.id || !publisherReachable || !isPublishedAppOpenable(selectedPublishedApp)}>
                  <ExternalLink size={14} />
                  {publisherReachable ? "Open VPN" : "Connect VPN"}
                </button>
                <button className="button ghost" onClick={() => void duplicatePublishedApp(selectedPublishedApp)} disabled={appActionBusyId === selectedPublishedApp.id}>
                  <FolderOpen size={14} />
                  Duplicate
                </button>
                {["submitted", "preview", "approved"].includes(selectedPublishedApp.status) && (
                  <button className="button primary" onClick={() => void reviewPublishedApp(selectedPublishedApp, "approve")} disabled={appActionBusyId === selectedPublishedApp.id}>
                    <SquareCheck size={14} />
                    Approve
                  </button>
                )}
                {["submitted", "preview"].includes(selectedPublishedApp.status) && (
                  <button className="button ghost" onClick={() => void reviewPublishedApp(selectedPublishedApp, "reject")} disabled={appActionBusyId === selectedPublishedApp.id}>
                    <X size={14} />
                    Reject
                  </button>
                )}
                {(selectedPublishedApp.versions?.length ?? 0) > 1 && selectedPublishedApp.status !== "deprecated" && (
                  <button className="button ghost" onClick={() => void rollbackPublishedApp(selectedPublishedApp)} disabled={appActionBusyId === selectedPublishedApp.id}>
                    <RefreshCw size={14} />
                    Rollback
                  </button>
                )}
                {selectedPublishedApp.status !== "deprecated" && (
                  <button className="button ghost" onClick={() => void deprecatePublishedApp(selectedPublishedApp)} disabled={appActionBusyId === selectedPublishedApp.id}>
                    <ArchiveIcon size={14} />
                    Deprecate
                  </button>
                )}
              </div>
            )}
          </section>
          {result && <pre className="resultPreview">{result}</pre>}
        </div>
      );
    }

    return (
      <div className="marketplaceView embeddedMarketplace appDirectoryList">
	        {renderPublishAppPanel()}
	        <section className="appDirectorySection" aria-label="Personal apps">
            <div className="appDirectorySectionHeader">
              <h2>Personal</h2>
	              <span className="appDirectorySectionCount">{filteredLocalDraftApps.length} {filteredLocalDraftApps.length === 1 ? "APP" : "APPS"}</span>
            </div>
	          <div className="chatSessionRows directoryTable appDirectoryTable" role="table" aria-label="Personal apps">
              <div className="chatResultRow directoryResultRow appDirectoryResultRow chatResultRowHead" role="row">
                <span role="columnheader">App</span>
                <span role="columnheader">Source</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Updated</span>
                <span role="columnheader" aria-label="Open app" />
              </div>
              <div className="chatResultRows" role="rowgroup">
                {filteredLocalDraftApps.map(renderLocalDraftAppRow)}
                {filteredLocalDraftApps.length === 0 && (
                  <div className="tableEmptyState" role="row">
                    <EmptyState title={localDraftBusy ? "Loading draft apps" : "No draft apps yet"} body="Import a local app to see it here." icon={Grid2X2Plus} />
                  </div>
                )}
              </div>
            </div>
	        </section>
	        <section className="appDirectorySection" aria-label="Team apps">
            <div className="appDirectorySectionHeader">
              <h2>Team</h2>
	              <span className="appDirectorySectionCount">{filteredApps.length} {filteredApps.length === 1 ? "APP" : "APPS"}</span>
            </div>
          <div className="chatSessionRows directoryTable appDirectoryTable" role="table" aria-label="Team apps">
            <div className="chatResultRow directoryResultRow appDirectoryResultRow chatResultRowHead" role="row">
              <span role="columnheader">App</span>
              <span role="columnheader">Owner</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Type</span>
              <span role="columnheader" aria-label="Open app" />
            </div>
            <div className="chatResultRows" role="rowgroup">
              {filteredApps.map(renderPublishedAppRow)}
              {filteredApps.length === 0 && (
                <div className="tableEmptyState" role="row">
                  <EmptyState title="No Team apps found" body="Published apps will appear here." icon={Grid2X2Plus} />
                </div>
              )}
            </div>
          </div>
	        </section>
        {result && <pre className="resultPreview">{result}</pre>}
      </div>
    );
	  }

  function renderSkillsTab() {
    const selectedSkillDetail = selectedSkillDetailName
      ? skills.find((skill) => skill.name === selectedSkillDetailName)
      : undefined;
    if (selectedSkillDetail) {
      const trackedSkill = skillWithLocalStats(selectedSkillDetail);
      const installed = activeAgent ? installedSkillKeys.includes(`${activeAgent.id}:${trackedSkill.name}`) : false;
      const skillMarkdown = skillMarkdownByName[trackedSkill.name];
      const downloadCount = trackedSkill.downloadCount ?? trackedSkill.installCount ?? 0;
      const skillDeployment = deploymentForArtifact("skill", trackedSkill.skillId ?? rendererSkillRegistryId(trackedSkill));
      return (
        <div className="marketplaceView embeddedMarketplace directoryDetailView embeddedDirectoryDetailView">
          <header className="directoryEmbeddedDetailHeader">
            <button className="iconButton chatDetailBackButton" type="button" onClick={() => setSelectedSkillDetailName("")} aria-label="Back to skills">
              <ArrowLeft size={17} />
            </button>
            <div>
              <span>Skills / {trackedSkill.team}</span>
              <h2>{trackedSkill.name}</h2>
              <p>{trackedSkill.description}</p>
            </div>
          </header>
          <section className="chatDetailSurface">
            <div className="chatReviewTabs directoryDetailTabs" role="tablist" aria-label="Skill details">
              {[
                ["overview", "Overview"],
                ["source", "SKILL.md"],
                ["usage", "Usage"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={selectedSkillDetailTab === id ? "selected" : ""}
                  type="button"
                  onClick={() => setSelectedSkillDetailTab(id as typeof selectedSkillDetailTab)}
                  role="tab"
                  aria-selected={selectedSkillDetailTab === id}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedSkillDetailTab === "overview" && (
              <div className="chatResultDetails directoryDetailPanel">
                <div><strong>Team</strong><span>{trackedSkill.team}</span></div>
                <div><strong>Product</strong><span>{trackedSkill.product ?? "Workflow"}</span></div>
                <div><strong>Language</strong><span>{trackedSkill.language ?? "Skill"}</span></div>
                <div><strong>Data boundary</strong><span>{renderDeploymentChip(skillDeployment)}</span></div>
                <div><strong>Target</strong><span>{skillDeployment ? deploymentTargetLabel(skillDeployment.target) : "Keep Local"}</span></div>
                <div><strong>Source</strong><span>{trackedSkill.source || "Local registry"}</span></div>
                <div><strong>Status</strong><span>{trackedSkill.approvalRequired ? "Approval gated" : "Ready"}</span></div>
              </div>
            )}
            {selectedSkillDetailTab === "source" && (
              <div className="directoryDetailPanel skillMarkdownPanel directoryMarkdownPanel">
                <div className="skillMarkdownHeader">
                  <span><FileText size={14} />SKILL.md</span>
                  {skillMarkdown?.status === "ready" && (
                    <a href={skillMarkdown.result.sourceUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={13} />
                      GitHub
                    </a>
                  )}
                </div>
                {skillMarkdown?.status === "loading" && <p className="skillMarkdownStatus">Loading SKILL.md...</p>}
                {skillMarkdown?.status === "error" && <p className="skillMarkdownStatus error">{skillMarkdown.message}</p>}
                {skillMarkdown?.status === "ready" ? <pre>{skillMarkdown.result.markdown}</pre> : null}
                {!skillMarkdown && <p className="skillMarkdownStatus">Open the source tab to load SKILL.md.</p>}
              </div>
            )}
            {selectedSkillDetailTab === "usage" && (
              <div className="directoryDetailPanel directoryActionPanel">
                <div className="chatResultDetails directoryDetailPanel">
                  <div><strong>Stars</strong><span>{formatCompactCount(trackedSkill.starCount)}</span></div>
                  <div><strong>Installs</strong><span>{formatCompactCount(downloadCount)}</span></div>
                  <div><strong>Active agent</strong><span>{activeAgent?.displayName ?? "None selected"}</span></div>
                  <div><strong>Installed</strong><span>{installed ? "Yes" : "No"}</span></div>
                </div>
                <button className={`button secondary ${trackedSkill.starredByActor ? "selected" : ""}`} type="button" onClick={() => void toggleSkillStar(trackedSkill)}>
                  <Star size={14} />
                  {trackedSkill.starredByActor ? "Unstar" : "Star"}
                </button>
                <button className={`button primary ${installed ? "selected" : ""}`} type="button" onClick={() => void installSkill(trackedSkill)}>
                  <Plus size={14} />
                  {installed ? "Installed" : "Install"}
                </button>
                <label className="deploymentTargetField">
                  <span>Deployment target</span>
                  <select value={skillDeploymentTarget} onChange={(event) => setSkillDeploymentTarget(event.target.value as ArtifactDeploymentTarget)}>
                    <option value="local-only">Keep Local</option>
                    <option value="local-shared">Local Shared</option>
                    <option value="telnyx-managed">Telnyx Managed</option>
                    <option value="telnyx-byo-cloud">Telnyx BYO Cloud</option>
                  </select>
                </label>
                <button className="button secondary" type="button" onClick={() => void deploySkill(trackedSkill)} disabled={Boolean(deploymentBusyId)}>
                  <Upload size={14} />
                  {skillDeploymentTarget === "local-only" ? "Keep Local" : "Publish Cloud"}
                </button>
              </div>
            )}
          </section>
          {result && <pre className="resultPreview">{result}</pre>}
        </div>
      );
    }

    return (
      <div className="marketplaceView embeddedMarketplace">
        <div className="chatSessionRows directoryTable skillDirectoryTable" role="table" aria-label="Skills">
          <div className="chatResultRow directoryResultRow skillDirectoryResultRow chatResultRowHead" role="row">
            <span role="columnheader">Skill</span>
            <span role="columnheader">Team</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Stats</span>
            <span role="columnheader">Actions</span>
            <span role="columnheader" aria-label="Open skill" />
          </div>
          <div className="chatResultRows" role="rowgroup">
            {filteredSkills.length > 0 ? (
              filteredSkills.map(renderSkillButton)
            ) : (
              <div className="tableEmptyState" role="row">
                <EmptyState title="No skills found" body="Try another search term or team filter." icon={Zap} />
              </div>
            )}
          </div>
        </div>
        {result && <pre className="resultPreview">{result}</pre>}
      </div>
    );
  }

  function renderDocsSourceTab(source: WikiSourceConfig) {
    const externalSource = source.externalSource;
    if (externalSource === "support") {
      return <HelpCenterConsole selectedWorkspace={selectedWorkspace} question={query} setQuestion={setQuery} sort={sort} />;
    }

    return (
      <ExplorerView
        selectedWorkspace={selectedWorkspace}
        embedded
        externalQuery={query}
        externalSource={externalSource}
        externalSort={sort}
        hideSearch
        docSourcesOnly
        onShareResult={shareExplorerResultToAgent}
      />
    );
  }

  function renderWikiTab() {
    return (
      <div className="wikiView embeddedWikiView">
        {renderDocsSourceTab(activeWikiSourceTab)}
      </div>
    );
  }

  const tabContent = {
    apps: renderAppsTab,
    skills: renderSkillsTab,
    wiki: renderWikiTab,
  }[activePage];
  const wikiSectionMeta = {
    apps: ["Apps", Grid2X2Plus],
    skills: ["Skills", Zap],
    wiki: ["Wiki", BookOpen],
  } satisfies Record<WikiPage, [string, AppIcon]>;
  const [wikiHeadingTitle] = wikiSectionMeta[activePage];
  const wikiHeaderAction = (
    <div className="headerActions wikiHeaderActions" aria-label="Wiki actions">
      {activePage === "apps" && (
        <>
          <button className="button secondary" type="button" onClick={() => void importLocalDraftApp()} disabled={localDraftBusy}>
            <Upload size={15} />
            Import
          </button>
          <TableRefreshButton onClick={refreshLocalDraftApps} disabled={localDraftBusy} label="Refresh apps" />
        </>
      )}
      <div className="publishMenuWrap" ref={publishMenuRef}>
        <button className="button primary" onClick={() => setPublishMenuOpen((open) => !open)} aria-expanded={publishMenuOpen} aria-haspopup="menu">
          <Plus size={15} />
          Create
        </button>
        {publishMenuOpen && (
          <div className="publishMenu" role="menu" aria-label="Build from local bot">
            <div className="publishMenuHeader">
              <strong>Build from local bot</strong>
              <small>Select what this bot should package for Telnyx employees.</small>
            </div>
            {publishOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.label} role="menuitem" onClick={() => startPublishing(option)}>
                  <Icon size={16} />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (!wikiState) return <EmptyState title="No Wiki state" body="Training data will appear when the local Link state loads." />;

  return (
    <section className="content wikiHubView">
      <div className={`pageSectionShell ${activePage === "wiki" ? "" : "pageSectionShellSingle"}`}>
        {activePage === "wiki" && (
          <PageSectionSidebar
            heading="Wiki"
            headingIcon={BookOpen}
            tabs={wikiNavigationTabs.map((source) => [source.id, source.label, source.icon] as const)}
            activeTab={tab}
            onSelect={setTab}
            label="Wiki sections"
          />
        )}
        <div className="pageSectionMain">
          {activePage === "wiki" ? (
            <PageSectionHeader parent="Link" title={activeWikiSourceTab.title} action={wikiHeaderAction} />
          ) : (
            <header className="pageHeader">
              <h1>{wikiHeadingTitle}</h1>
              {wikiHeaderAction}
            </header>
          )}
      <div className="wikiToolbar">
        <button
          className={`iconButton wikiFilterButton ${filter !== "all" || filterOpen ? "selected" : ""}`}
          aria-label={filterOpen ? "Hide filters" : "Show filters"}
          title={filterOpen ? "Hide filters" : "Show filters"}
          onClick={() => setFilterOpen((open) => !open)}
        >
          <SlidersHorizontal size={16} />
        </button>
        <label className="wikiSearchField">
          <Search size={16} />
          <input value={query} placeholder={searchPlaceholder} onChange={(event) => setQuery(event.target.value)} />
        </label>
        {filterOpen && (
          <div className="wikiFilterPanel" role="group" aria-label="Wiki filters">
            {tabFilterOptions.map((option) => (
              <button
                key={option}
                className={filter === option ? "selected" : ""}
                type="button"
                onClick={() => {
                  setFilter(option);
                  setFilterOpen(false);
                }}
              >
                {option === "all" ? "All" : option}
              </button>
            ))}
          </div>
        )}
        <label className="wikiSelectField">
          <select value={sort} onChange={(event) => setSort(event.target.value as "az" | "za")}>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </label>
      </div>
      <div className="wikiHubContent">
        {tabContent()}
      </div>
        </div>
      </div>
    </section>
  );
	}

function emptyWikiSourceDraft(type: WikiSourceDraft["type"] = "github"): WikiSourceDraft {
  return {
    id: "",
    type,
    label: "",
    iconName: "book",
    target: "",
    description: "",
    branch: type === "github" ? "main" : "",
    path: type === "github" ? "docs" : "",
    enabled: true,
  };
}

function wikiSourceDraftFromSource(source: WikiDocumentationSource): WikiSourceDraft {
  return {
    id: source.id,
    type: source.type,
    label: source.label,
    iconName: wikiSourceIconName(source),
    target: source.target,
    description: source.description,
    branch: String(source.metadata?.branch ?? ""),
    path: String(source.metadata?.path ?? ""),
    enabled: source.enabled,
  };
}

function wikiSourceInputFromDraft(draft: WikiSourceDraft): WikiDocumentationSourceInput {
  return {
    ...(draft.id ? { id: draft.id } : {}),
    label: draft.label.trim(),
    type: draft.type,
    target: draft.target.trim(),
    description: draft.description.trim(),
    enabled: draft.enabled,
    metadata: {
      icon: draft.iconName,
      ...(draft.type === "github" && draft.branch.trim() ? { branch: draft.branch.trim() } : {}),
      ...(draft.type === "github" && draft.path.trim() ? { path: draft.path.trim() } : {}),
    },
  };
}

function wikiSourceTypeDisplay(type: WikiDocumentationSourceType) {
  if (type === "github") return "GitHub";
  if (type === "mcp") return "MCP";
  if (type === "okf") return "OKF";
  if (type === "telnyx_support") return "Help";
  if (type === "telnyx_developers") return "Docs";
  if (type === "pylon") return "Pylon";
  return "Guru";
}

function SettingsView({
  connectors,
  tools,
  refresh,
  activeDialerConfig,
  setActiveDialerConfig,
  tab,
  setTab,
  linkedPhoneNumber,
  setLinkedPhoneNumber,
  setView,
  startManagedSkillSetupChat,
}: {
  connectors: ConnectorStatus[];
  tools: ToolMetadata[];
  refresh: () => Promise<void>;
  activeDialerConfig: DialerConfig;
  setActiveDialerConfig: (config: DialerConfig) => void;
  tab: SettingsTab;
  setTab: (tab: SettingsTab) => void;
  linkedPhoneNumber: string;
  setLinkedPhoneNumber: (phoneNumber: string) => void;
  setView: (view: ViewId) => void;
  startManagedSkillSetupChat: (skill: { label: string; query: string; connectorName: string }) => Promise<void>;
}) {
  const [credentials, setCredentials] = useState<CredentialGroupStatus[]>([]);
  const [dialerBuilderActions, setDialerBuilderActions] = useState<ReactNode>(null);
  const [settingsQuery, setSettingsQuery] = useState("");
  const [settingsFiltersOpen, setSettingsFiltersOpen] = useState(false);
  const [settingsStatusFilter, setSettingsStatusFilter] = useState<"all" | "connected" | "needs_setup">("all");
	  const [settingsSortMode, setSettingsSortMode] = useState<"az" | "za" | "status">("az");
	  const [settingsRefreshBusy, setSettingsRefreshBusy] = useState(false);
	  const [selectedSettingsDetailId, setSelectedSettingsDetailId] = useState("");
	  const [selectedSettingsDetailTab, setSelectedSettingsDetailTab] = useState<"overview" | "details" | "actions">("overview");
	  const [wikiSources, setWikiSources] = useState<WikiDocumentationSource[]>([]);
	  const [wikiSourceDraft, setWikiSourceDraft] = useState<WikiSourceDraft>(() => emptyWikiSourceDraft());
	  const [wikiSourceStatus, setWikiSourceStatus] = useState("");
	  const [wikiSourceBusy, setWikiSourceBusy] = useState("");
	  const visibleCredentials = useMemo(
    () => credentials.filter((group) => group.id !== "agent-control-plane" && group.id !== "mcp-proxy"),
    [credentials],
  );
  const requiredCredentials = useMemo(
    () => visibleCredentials.filter(isRequiredCredentialGroup).sort(compareCredentialGroups),
    [visibleCredentials],
  );
  const settingsTabHeading = {
    auth: ["Pairings", ShieldCheck],
    plugins: ["Plugins", Plug],
    contacts: ["Contacts", Users],
    assistants: ["Voice AI", Bot],
    numbers: ["Numbers", PhoneCall],
    agents: ["Agent Setup", Bot],
	    speak: ["Speech", Mic],
	    dialer: ["Dialer Builder", Keyboard],
	    design: ["Tool Design", Grid2X2],
	    wiki: ["Sources", Plug],
	  } satisfies Record<typeof tab, [string, AppIcon]>;
  const [settingsHeadingTitle] = settingsTabHeading[tab];
	  async function refreshCredentials() {
	    setCredentials(await linkApi.listCredentials());
	  }

	  async function refreshWikiSources() {
	    setWikiSources(await linkApi.listWikiSources());
	  }

	  async function refreshSettingsDirectories() {
	    setSettingsRefreshBusy(true);
	    try {
	      await Promise.all([refreshCredentials(), refreshWikiSources()]);
	      await refresh();
	    } finally {
      setSettingsRefreshBusy(false);
    }
  }

	  useEffect(() => {
	    void Promise.all([refreshCredentials(), refreshWikiSources()]);
	  }, []);

  useEffect(() => {
    setSettingsQuery("");
    setSettingsFiltersOpen(false);
    setSettingsStatusFilter("all");
	    setSettingsSortMode("az");
	    setSelectedSettingsDetailId("");
	    setSelectedSettingsDetailTab("overview");
	    setWikiSourceStatus("");
	    setWikiSourceBusy("");
	    setWikiSourceDraft(emptyWikiSourceDraft());
	  }, [tab]);

  const googleWorkspaceConnected = connectors.some((connector) =>
    ["google-drive", "google-calendar"].includes(connector.id) &&
    (connector.status === "connected" || connector.status === "signed_in"),
  );

  function credentialConnected(group: CredentialGroupStatus) {
    return credentialGroupConnected(group, connectors, googleWorkspaceConnected);
  }

  function settingsConnectorTools(connector: ConnectorStatus) {
    const connectorName = connector.name.toLowerCase().replace(/\s+mcp$/i, "");
    if (connector.category === "MCP" && connector.id !== "mcp-proxy") {
      return tools.filter((tool) => {
        const searchable = `${tool.name} ${tool.category}`.toLowerCase();
        return searchable.includes(connectorName.toLowerCase()) || searchable.includes(connector.id.replace("mcp-server-", ""));
      });
    }
    if (connector.id === "mcp-proxy") return tools.filter((tool) => tool.category === "MCP" || /^[a-z0-9_-]+\./i.test(tool.name));
    return tools.filter((tool) => tool.category.toLowerCase().includes(connector.name.toLowerCase()) || tool.name.toLowerCase().startsWith(`${connector.id}.`));
  }

	  async function connectSettingsConnector(id: string) {
	    if (id === "agent-control-plane") {
	      await linkApi.signInAgentControlPlane();
	      await refresh();
	      return;
	    }
	    setTab("auth");
	  }

	  function updateWikiSourceDraft<K extends keyof WikiSourceDraft>(key: K, value: WikiSourceDraft[K]) {
	    setWikiSourceDraft((current) => ({ ...current, [key]: value }));
	  }

	  async function saveWikiSourceDraft() {
	    setWikiSourceBusy("save");
	    setWikiSourceStatus("");
	    try {
	      const sources = await linkApi.saveWikiSource(wikiSourceInputFromDraft(wikiSourceDraft));
	      setWikiSources(sources);
	      setWikiSourceStatus(wikiSourceDraft.id ? "Wiki source updated." : "Wiki source added.");
	      setWikiSourceDraft(emptyWikiSourceDraft(wikiSourceDraft.type));
	    } catch (error) {
	      setWikiSourceStatus(error instanceof Error ? error.message : "Wiki source could not be saved.");
	    } finally {
	      setWikiSourceBusy("");
	    }
	  }

	  async function deleteWikiSource(source: WikiDocumentationSource) {
	    setWikiSourceBusy(source.id);
	    setWikiSourceStatus("");
	    try {
	      setWikiSources(await linkApi.deleteWikiSource(source.id));
	      if (wikiSourceDraft.id === source.id) setWikiSourceDraft(emptyWikiSourceDraft(source.type === "mcp" || source.type === "okf" ? source.type : "github"));
	      setWikiSourceStatus(`${source.label} removed.`);
	    } catch (error) {
	      setWikiSourceStatus(error instanceof Error ? error.message : "Wiki source could not be removed.");
	    } finally {
	      setWikiSourceBusy("");
	    }
	  }

	  async function resetWikiSources() {
	    setWikiSourceBusy("reset");
	    setWikiSourceStatus("");
	    try {
	      setWikiSources(await linkApi.resetWikiSources());
	      setWikiSourceDraft(emptyWikiSourceDraft());
	      setWikiSourceStatus("Wiki sources reset to Telnyx defaults.");
	    } catch (error) {
	      setWikiSourceStatus(error instanceof Error ? error.message : "Wiki sources could not be reset.");
	    } finally {
	      setWikiSourceBusy("");
	    }
	  }

	  async function uploadOkfWikiSource() {
	    setWikiSourceBusy("okf");
	    setWikiSourceStatus("Selecting OKF bundle...");
	    try {
	      const bundle = await linkApi.selectOkfBundle();
	      if (!bundle) {
	        setWikiSourceStatus("OKF selection canceled.");
	        return;
	      }
	      const label = bundle.sourcePath.split(/[\\/]/).filter(Boolean).pop()?.replace(/\.zip$/i, "") || "OKF bundle";
	      const sources = await linkApi.saveWikiSource({
	        label,
	        type: "okf",
	        target: bundle.sourcePath,
	        description: `${bundle.summary.conceptCount} concepts, ${bundle.summary.brokenLinkCount} broken links`,
	        enabled: bundle.errors.length === 0,
	        metadata: {
	          rootPath: bundle.rootPath,
	          conceptCount: bundle.summary.conceptCount,
	          warnings: bundle.warnings.length,
	          errors: bundle.errors.length,
	        },
	      });
	      setWikiSources(sources);
	      setWikiSourceStatus(`${label} added to Wiki sources.`);
	      setWikiSourceDraft(emptyWikiSourceDraft("okf"));
	    } catch (error) {
	      setWikiSourceStatus(error instanceof Error ? error.message : "OKF source could not be added.");
	    } finally {
	      setWikiSourceBusy("");
	    }
	  }

	  async function pairGitHubForWiki() {
	    setWikiSourceBusy("github-auth");
	    setWikiSourceStatus("");
	    try {
	      await linkApi.connectGitHubWithDeviceFlow();
	      await refreshCredentials();
	      setWikiSourceStatus("GitHub paired.");
	    } catch (error) {
	      setWikiSourceStatus(error instanceof Error ? error.message : "GitHub could not be paired.");
	    } finally {
	      setWikiSourceBusy("");
	    }
	  }

	  function renderSettingsDirectoryToolbar(placeholder: string, countLabel: string) {
    return (
      <>
        <div className="chatSearchRow settingsDirectorySearchRow">
          <button
            className={`iconButton agentFilterButton ${settingsFiltersOpen || settingsStatusFilter !== "all" ? "selected" : ""}`}
            type="button"
            aria-label={settingsFiltersOpen ? "Hide filters" : "Show filters"}
            title={settingsFiltersOpen ? "Hide filters" : "Show filters"}
            onClick={() => setSettingsFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal size={18} />
          </button>
          <div className="explorerSearch compactSearch">
            <Search size={17} />
            <input value={settingsQuery} onChange={(event) => setSettingsQuery(event.target.value)} placeholder={placeholder} />
          </div>
          <label className="wikiSelectField settingsDirectorySort">
            <select value={settingsSortMode} onChange={(event) => setSettingsSortMode(event.target.value as "az" | "za" | "status")}>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="status">Status</option>
            </select>
          </label>
          <TableRefreshButton onClick={refreshSettingsDirectories} disabled={settingsRefreshBusy} label="Refresh settings" />
        </div>
        {settingsFiltersOpen && (
          <div className="chatFilterBar settingsDirectoryFilterBar" role="group" aria-label="Settings filters">
            <span className="chatFilterCount">{countLabel}</span>
            <label className="agentFilter">
              <span>Status</span>
              <select value={settingsStatusFilter} onChange={(event) => setSettingsStatusFilter(event.target.value as "all" | "connected" | "needs_setup")}>
                <option value="all">All</option>
                <option value="connected">Connected</option>
                <option value="needs_setup">Needs setup</option>
              </select>
            </label>
          </div>
        )}
      </>
    );
  }

  function renderAuthTab() {
    const query = settingsQuery.trim().toLowerCase();
    const sortedCredentials = [...requiredCredentials].sort((left, right) => {
      if (settingsSortMode === "status") {
        const statusCompare = Number(credentialConnected(right)) - Number(credentialConnected(left));
        if (statusCompare !== 0) return statusCompare;
      }
      const nameCompare = left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
      return settingsSortMode === "za" ? -nameCompare : nameCompare;
    });
    const filteredCredentials = sortedCredentials.filter((group) => {
      const connected = credentialConnected(group);
      const matchesStatus =
        settingsStatusFilter === "all" ||
        (settingsStatusFilter === "connected" && connected) ||
        (settingsStatusFilter === "needs_setup" && !connected);
      const matchesQuery =
        !query ||
        `${group.label} ${group.id} ${group.help} ${group.fields.map((field) => field.name).join(" ")}`.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
    const selectedGroupId = selectedSettingsDetailId.startsWith("auth:") ? selectedSettingsDetailId.slice(5) : "";
    const selectedGroup = requiredCredentials.find((group) => group.id === selectedGroupId);
    if (selectedGroup) {
      const selectedFields = visibleCredentialFields(selectedGroup);
      const connected = credentialConnected(selectedGroup);
      return (
        <div className="settingsDirectoryDetail embeddedDirectoryDetailView">
          <header className="directoryEmbeddedDetailHeader">
            <button className="button ghost" type="button" onClick={() => setSelectedSettingsDetailId("")}>
              <ArrowLeft size={16} />
              Auth
            </button>
            <div>
              <h2>{selectedGroup.label}</h2>
              <p>{credentialHelpCopy(selectedGroup)}</p>
            </div>
            <Badge tone={connected ? "success" : "warning"}>{connected ? "Connected" : "Needs setup"}</Badge>
          </header>
          <section className="chatDetailSurface">
            <div className="chatDetailTabs directoryDetailTabs" role="tablist" aria-label={`${selectedGroup.label} credential details`}>
              {(["overview", "details", "actions"] as const).map((detailTab) => (
                <button
                  key={detailTab}
                  className={selectedSettingsDetailTab === detailTab ? "selected" : ""}
                  type="button"
                  onClick={() => setSelectedSettingsDetailTab(detailTab)}
                >
                  {detailTab === "overview" ? "Overview" : detailTab === "details" ? "Credentials" : "Actions"}
                </button>
              ))}
            </div>
            {selectedSettingsDetailTab === "overview" && (
              <div className="chatResultDetails directoryDetailPanel">
                <div>
                  <strong>Status</strong>
                  <span>{connected ? "Connected" : "Needs setup"}</span>
                </div>
                <div>
                  <strong>Fields</strong>
                  <span>{selectedFields.length ? `${selectedFields.filter((field) => field.configured).length}/${selectedFields.length} configured` : "Managed connection"}</span>
                </div>
                <div>
                  <strong>Source</strong>
                  <span>{selectedGroup.id}</span>
                </div>
              </div>
            )}
            {selectedSettingsDetailTab === "details" && (
              <div className="settingsCredentialDetailPanel">
                <CredentialGroupCards
                  connectors={connectors}
                  groups={[selectedGroup]}
                  setGroups={setCredentials}
                  onSaved={async () => {
                    await refresh();
                    await refreshCredentials();
                  }}
                />
              </div>
            )}
            {selectedSettingsDetailTab === "actions" && (
              <div className="directoryDetailPanel">
                <div className="assistantNotice">
                  <p>{connected ? "This credential is ready for Link workflows." : "Open the Credentials tab to connect or update this credential."}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      );
    }

    return (
      <div className="setupSettingsPanel settingsDirectoryPanel">
        {renderSettingsDirectoryToolbar("Search auth, providers, keys, or setup notes", `${filteredCredentials.length} credentials`)}
        <div className="chatSessionRows directoryTable settingsDirectoryTable" role="table" aria-label="Authentication credentials">
          <div className="chatResultRow directoryResultRow settingsDirectoryResultRow chatResultRowHead" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Fields</span>
            <span role="columnheader" aria-label="Open credential" />
          </div>
          <div className="chatResultRows">
            {filteredCredentials.map((group) => {
              const connected = credentialConnected(group);
              const visibleFields = visibleCredentialFields(group);
              return (
                <div className="chatResultRow directoryResultRow settingsDirectoryResultRow" role="row" key={group.id}>
                  <span className="directoryNameCell" role="cell">
                    <strong>{group.label}</strong>
                    <small>{credentialHelpCopy(group)}</small>
                  </span>
                  <span role="cell">{group.id}</span>
                  <span role="cell">
                    <Badge tone={connected ? "success" : "warning"}>{connected ? "Connected" : "Needs setup"}</Badge>
                  </span>
                  <span role="cell">{visibleFields.length ? `${visibleFields.filter((field) => field.configured).length}/${visibleFields.length}` : "Managed"}</span>
                  <span className="directoryRowActions" role="cell">
                    <button
                      className="chatSessionOpenButton"
                      type="button"
                      aria-label={`Open ${group.label}`}
                      onClick={() => {
                        setSelectedSettingsDetailId(`auth:${group.id}`);
                        setSelectedSettingsDetailTab("overview");
                      }}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </span>
                </div>
              );
            })}
            {filteredCredentials.length === 0 && (
              <div className="phoneNumberEmpty">No authentication settings match this search.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

	  function renderPluginsTab() {
    const query = settingsQuery.trim().toLowerCase();
    const sortedConnectors = sortConnectors(connectors, settingsSortMode);
    const filteredConnectors = sortedConnectors.filter((connector) => {
      const connected = connector.status === "connected" || connector.status === "signed_in";
      const matchesStatus =
        settingsStatusFilter === "all" ||
        (settingsStatusFilter === "connected" && connected) ||
        (settingsStatusFilter === "needs_setup" && !connected);
      const matchesQuery = !query || `${connector.name} ${connector.id} ${connector.category} ${connector.description} ${connector.requiredAccess.join(" ")}`.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
    const selectedConnectorId = selectedSettingsDetailId.startsWith("plugin:") ? selectedSettingsDetailId.slice(7) : "";
    const selectedConnector = connectors.find((connector) => connector.id === selectedConnectorId);
    if (selectedConnector) {
      const connected = selectedConnector.status === "connected" || selectedConnector.status === "signed_in";
      const connectorToolList = settingsConnectorTools(selectedConnector);
      const grouped = {
        read: connectorToolList.filter((tool) => tool.capability === "read"),
        write: connectorToolList.filter((tool) => tool.capability !== "read"),
        interactive: connectorToolList.filter((tool) => tool.approvalRequired || tool.riskLevel === "high"),
      };
      return (
        <div className="settingsDirectoryDetail embeddedDirectoryDetailView">
          <header className="directoryEmbeddedDetailHeader">
            <button className="button ghost" type="button" onClick={() => setSelectedSettingsDetailId("")}>
              <ArrowLeft size={16} />
              Plugins
            </button>
            <div>
              <h2>{selectedConnector.name}</h2>
              <p>{selectedConnector.description}</p>
            </div>
            <Badge tone={connected ? "success" : "warning"}>{connected ? "Connected" : "Needs setup"}</Badge>
          </header>
          <section className="chatDetailSurface">
            <div className="chatDetailTabs directoryDetailTabs" role="tablist" aria-label={`${selectedConnector.name} plugin details`}>
              {(["overview", "details", "actions"] as const).map((detailTab) => (
                <button
                  key={detailTab}
                  className={selectedSettingsDetailTab === detailTab ? "selected" : ""}
                  type="button"
                  onClick={() => setSelectedSettingsDetailTab(detailTab)}
                >
                  {detailTab === "overview" ? "Overview" : detailTab === "details" ? "Tools" : "Actions"}
                </button>
              ))}
            </div>
            {selectedSettingsDetailTab === "overview" && (
              <div className="chatResultDetails directoryDetailPanel">
                <div>
                  <strong>Status</strong>
                  <span>{connected ? "Connected" : "Needs setup"}</span>
                </div>
                <div>
                  <strong>Type</strong>
                  <span>{connectorTypeLabel(selectedConnector)}</span>
                </div>
                <div>
                  <strong>Mode</strong>
                  <span>{connectorModeLabel(selectedConnector)}</span>
                </div>
                <div>
                  <strong>Access</strong>
                  <span>{selectedConnector.requiredAccess.join(", ") || "No access scopes listed"}</span>
                </div>
              </div>
            )}
            {selectedSettingsDetailTab === "details" && (
              <div className="directoryDetailPanel">
                <ToolGroup title="Read-only tools" tools={grouped.read} />
                <ToolGroup title="Write/delete tools" tools={grouped.write} />
                <ToolGroup title="Interactive tools" tools={grouped.interactive} />
              </div>
            )}
            {selectedSettingsDetailTab === "actions" && (
              <div className="directoryDetailPanel">
                <button
                  className={connected ? "button ghost" : "button secondary"}
                  type="button"
                  disabled={connected}
                  onClick={() => void connectSettingsConnector(selectedConnector.id)}
                >
                  {connectorButtonLabel(selectedConnector)}
                </button>
              </div>
            )}
          </section>
        </div>
	    );
	  }

	  return (
      <div className="setupSettingsPanel settingsDirectoryPanel">
        {renderSettingsDirectoryToolbar("Search plugins, tools, sources, or access", `${filteredConnectors.length} plugins`)}
        <div className="chatSessionRows directoryTable settingsDirectoryTable" role="table" aria-label="Plugins">
          <div className="chatResultRow directoryResultRow settingsDirectoryResultRow chatResultRowHead" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Tools</span>
            <span role="columnheader" aria-label="Open plugin" />
          </div>
          <div className="chatResultRows">
            {filteredConnectors.map((connector) => {
              const connected = connector.status === "connected" || connector.status === "signed_in";
              return (
                <div className="chatResultRow directoryResultRow settingsDirectoryResultRow" role="row" key={connector.id}>
                  <span className="directoryNameCell" role="cell">
                    <strong>{connector.name}</strong>
                    <small>{connector.description}</small>
                  </span>
                  <span role="cell">{connectorTypeLabel(connector)}</span>
                  <span role="cell">
                    <Badge tone={connected ? "success" : "warning"}>{connected ? "Connected" : "Needs setup"}</Badge>
                  </span>
                  <span role="cell">{settingsConnectorTools(connector).length}</span>
                  <span className="directoryRowActions" role="cell">
                    <button
                      className="chatSessionOpenButton"
                      type="button"
                      aria-label={`Open ${connector.name}`}
                      onClick={() => {
                        setSelectedSettingsDetailId(`plugin:${connector.id}`);
                        setSelectedSettingsDetailTab("overview");
                      }}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </span>
                </div>
              );
            })}
            {filteredConnectors.length === 0 && (
              <div className="phoneNumberEmpty">No plugins match this search.</div>
            )}
          </div>
        </div>
      </div>
    );
  }


	  function renderWikiSettingsTab() {
	    const sortedSources = [...wikiSources].sort((left, right) => {
	      const telnyxCompare = Number(right.configuredBy === "telnyx") - Number(left.configuredBy === "telnyx");
	      if (telnyxCompare !== 0) return telnyxCompare;
	      return left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
	    });
	    const userSources = wikiSources.filter((source) => source.configuredBy !== "telnyx");
	    const enabledSources = wikiSources.filter((source) => source.enabled);
	    const githubCredential = credentials.find((group) => group.id === "github");
	    const githubReady = githubCredential ? credentialConnected(githubCredential) : false;
	    const targetLabel = wikiSourceDraft.type === "github" ? "Repository" : wikiSourceDraft.type === "mcp" ? "MCP endpoint" : wikiSourceDraft.type === "okf" ? "OKF bundle" : "Target";
	    const targetPlaceholder = wikiSourceDraft.type === "github" ? "team-telnyx/link or https://github.com/team/repo" : wikiSourceDraft.type === "mcp" ? "https://mcp.example.com" : wikiSourceDraft.type === "okf" ? "/path/to/knowledge.zip" : "Source URL or connector target";
	    const canChangeWikiSourceType = !wikiSourceDraft.id || ["github", "mcp", "okf"].includes(wikiSourceDraft.type);

	    return (
	      <div className="wikiSettingsPanel">
	        <section className="accessCard wikiSourceSummary">
	          <div className="accessCardHeader">
	            <div className="accessCardTitle">
	              <span className="accessIcon"><BookOpen size={18} /></span>
	              <div>
	                <h3>Wiki sources</h3>
	                <p>Choose which Wiki sections appear, rename them, and pick icons from the Link icon library.</p>
	              </div>
	            </div>
	            <div className="wikiSourceHeaderActions">
	              <button className="button secondary" type="button" onClick={() => void pairGitHubForWiki()} disabled={wikiSourceBusy === "github-auth" || githubReady}>
	                <GithubIcon />
	                {githubReady ? "GitHub paired" : "Pair GitHub"}
	              </button>
	              <button className="button secondary" type="button" onClick={() => void uploadOkfWikiSource()} disabled={wikiSourceBusy === "okf"}>
	                <Upload size={14} />
	                Upload OKF
	              </button>
	              <button className="button ghost" type="button" onClick={() => void resetWikiSources()} disabled={wikiSourceBusy === "reset"}>
	                <RefreshCw size={14} />
	                Reset
	              </button>
	            </div>
	          </div>
	          <div className="wikiSourceMetrics">
	            <div><span>Total</span><strong>{wikiSources.length}</strong></div>
	            <div><span>Enabled</span><strong>{enabledSources.length}</strong></div>
	            <div><span>User</span><strong>{userSources.length}</strong></div>
	            <div><span>GitHub</span><strong>{githubReady ? "Paired" : "Missing"}</strong></div>
	          </div>
	          {wikiSourceStatus && <p className="wikiSourceStatus">{wikiSourceStatus}</p>}
	        </section>

	        <section className="accessCard wikiSourceEditor" aria-label="Add or repoint Wiki source">
	          <form
	            onSubmit={(event) => {
	              event.preventDefault();
	              void saveWikiSourceDraft();
	            }}
	          >
	            <div className="wikiSourceEditorHeader">
	              <div>
	                <h3>{wikiSourceDraft.id ? "Repoint source" : "Add source"}</h3>
	                <p>{wikiSourceDraft.id ? "Update the target and availability for this source." : "Connect a GitHub repo, MCP endpoint, or OKF bundle."}</p>
	              </div>
	              {wikiSourceDraft.id && (
	                <button className="button ghost" type="button" onClick={() => setWikiSourceDraft(emptyWikiSourceDraft(wikiSourceDraft.type))}>
	                  <X size={14} />
	                  Cancel
	                </button>
	              )}
	            </div>
	            {canChangeWikiSourceType ? (
	              <div className="wikiSourceTypePicker" role="tablist" aria-label="Wiki source type">
	                {(["github", "mcp", "okf"] as const).map((sourceType) => (
	                <button
	                  key={sourceType}
	                  className={wikiSourceDraft.type === sourceType ? "selected" : ""}
	                  type="button"
	                  onClick={() => setWikiSourceDraft((current) => ({ ...emptyWikiSourceDraft(sourceType), id: current.id && current.type === sourceType ? current.id : "" }))}
	                >
	                  {sourceType === "github" ? <GithubIcon /> : sourceType === "mcp" ? <Plug size={14} /> : <FileText size={14} />}
	                  {wikiSourceTypeDisplay(sourceType)}
	                </button>
	                ))}
	              </div>
	            ) : (
	              <div className="wikiSourceFixedType">
	                <Badge tone="default">{wikiSourceTypeDisplay(wikiSourceDraft.type)}</Badge>
	              </div>
	            )}
	            <div className="wikiSourceFormGrid">
	              <label className="wikiSourceField">
	                <span>Name</span>
	                <input value={wikiSourceDraft.label} onChange={(event) => updateWikiSourceDraft("label", event.target.value)} placeholder="Support runbooks" />
	              </label>
	              <div className="wikiSourceField wikiIconPickerField">
	                <span>Icon</span>
	                <div className="wikiIconPicker" role="radiogroup" aria-label="Wiki section icon">
	                  {wikiIconOptions.map((option) => {
	                    const Icon = option.icon;
	                    return (
	                      <button
	                        key={option.id}
	                        className={wikiSourceDraft.iconName === option.id ? "selected" : ""}
	                        type="button"
	                        title={option.label}
	                        aria-label={option.label}
	                        aria-checked={wikiSourceDraft.iconName === option.id}
	                        role="radio"
	                        onClick={() => updateWikiSourceDraft("iconName", option.id)}
	                      >
	                        <Icon size={15} />
	                      </button>
	                    );
	                  })}
	                </div>
	              </div>
	              <label className="wikiSourceField">
	                <span>{targetLabel}</span>
	                <input value={wikiSourceDraft.target} onChange={(event) => updateWikiSourceDraft("target", event.target.value)} placeholder={targetPlaceholder} />
	              </label>
	              {wikiSourceDraft.type === "github" && (
	                <>
	                  <label className="wikiSourceField">
	                    <span>Branch</span>
	                    <input value={wikiSourceDraft.branch} onChange={(event) => updateWikiSourceDraft("branch", event.target.value)} placeholder="main" />
	                  </label>
	                  <label className="wikiSourceField">
	                    <span>Path</span>
	                    <input value={wikiSourceDraft.path} onChange={(event) => updateWikiSourceDraft("path", event.target.value)} placeholder="docs" />
	                  </label>
	                </>
	              )}
	              <label className="wikiSourceField wide">
	                <span>Description</span>
	                <input value={wikiSourceDraft.description} onChange={(event) => updateWikiSourceDraft("description", event.target.value)} placeholder="Internal docs indexed for Wiki search" />
	              </label>
	              <div className="wikiSourceFormActions">
	                <button
	                  className={`settingsToggle ${wikiSourceDraft.enabled ? "selected" : ""}`}
	                  type="button"
	                  aria-label={wikiSourceDraft.enabled ? "Disable source" : "Enable source"}
	                  onClick={() => updateWikiSourceDraft("enabled", !wikiSourceDraft.enabled)}
	                >
	                  <span>{wikiSourceDraft.enabled ? "Enabled" : "Disabled"}</span>
	                  <i />
	                </button>
	                <button className="button primary" type="submit" disabled={wikiSourceBusy === "save" || !wikiSourceDraft.label.trim() || !wikiSourceDraft.target.trim()}>
	                  <Save size={14} />
	                  {wikiSourceDraft.id ? "Save" : "Add"}
	                </button>
	              </div>
	            </div>
	          </form>
	        </section>

	        <section className="wikiSourceTableSection" aria-label="Configured Wiki sources">
	          <div className="chatSessionRows directoryTable wikiSourceTable" role="table" aria-label="Configured Wiki sources">
	            <div className="chatResultRow directoryResultRow wikiSourceRow chatResultRowHead" role="row">
	              <span role="columnheader">Source</span>
	              <span role="columnheader">Type</span>
	              <span role="columnheader">Status</span>
	              <span role="columnheader">Target</span>
	              <span role="columnheader">Actions</span>
	            </div>
	            <div className="chatResultRows" role="rowgroup">
	              {sortedSources.map((source) => (
	                <div className="chatResultRow directoryResultRow wikiSourceRow" role="row" key={source.id}>
	                  <span className="directoryNameCell wikiSourceNameCell" role="cell">
	                    {(() => {
	                      const SourceIcon = wikiIconForName(wikiSourceIconName(source));
	                      return <SourceIcon size={17} />;
	                    })()}
	                    <span>
	                      <strong>{source.label}</strong>
	                      <small>{source.description}</small>
	                    </span>
	                  </span>
	                  <span role="cell">{wikiSourceTypeDisplay(source.type)}</span>
	                  <span role="cell">
	                    <Badge tone={source.enabled ? (source.status === "connected" ? "success" : "warning") : "default"}>{source.enabled ? source.status.replace("_", " ") : "Disabled"}</Badge>
	                  </span>
	                  <span className="wikiSourceTargetCell" role="cell">{source.target}</span>
	                  <span className="directoryRowActions wikiSourceRowActions" role="cell">
	                    <>
	                        <button className="iconButton" type="button" title="Repoint source" aria-label={`Repoint ${source.label}`} onClick={() => setWikiSourceDraft(wikiSourceDraftFromSource(source))}>
	                          <Pencil size={15} />
	                        </button>
	                        <button className="iconButton" type="button" title="Remove source" aria-label={`Remove ${source.label}`} onClick={() => void deleteWikiSource(source)} disabled={wikiSourceBusy === source.id}>
	                          <Trash2 size={15} />
	                        </button>
	                    </>
	                  </span>
	                </div>
	              ))}
	            </div>
	          </div>
	        </section>
	      </div>
	    );
	  }

  return (
    <section className="content settingsView">
      <div className="pageSectionShell">
        <PageSectionSidebar
          heading="Settings"
          headingIcon={Settings}
          groups={[
            {
              title: "ACCOUNT",
              tabs: [
                ["auth", "Pairings", ShieldCheck],
                ["plugins", "Plugins", Plug],
                ["agents", "Agents", Bot],
              ],
            },
            {
              title: "TELEPHONY",
              tabs: [
                ["contacts", "Contacts", Users],
                ["dialer", "Dialer", Keyboard],
                ["numbers", "Numbers", PhoneCall],
                ["assistants", "Voice AI", Bot],
              ],
            },
            {
              title: "LINK APP",
	              tabs: [
	                ["speak", "Speech", Mic],
	                ["design", "Tool Design", Grid2X2],
	                ["wiki", "Sources", Plug],
	              ],
            },
          ] as const}
          activeTab={tab}
          onSelect={setTab}
          label="Settings sections"
        />
        <div className="pageSectionMain">
          <PageSectionHeader parent="Link" title={settingsHeadingTitle} />

          {tab === "auth" && renderAuthTab()}
          {tab === "plugins" && renderPluginsTab()}
          {(tab === "contacts" || tab === "assistants" || tab === "numbers") && (
            <PhoneView
              connectors={connectors}
              linkedPhoneNumber={linkedPhoneNumber}
              setLinkedPhoneNumber={setLinkedPhoneNumber}
              setView={setView}
              tab={tab}
              setTab={(nextTab) => {
                if (nextTab === "contacts" || nextTab === "assistants" || nextTab === "numbers") setTab(nextTab);
              }}
              refresh={refresh}
              startManagedSkillSetupChat={startManagedSkillSetupChat}
              hideSectionSidebar
              hideHeader
              embedded
            />
          )}
	          {tab === "agents" && <AgentControlPlaneSetupPanel connectors={connectors} refresh={refresh} />}
	          {tab === "speak" && <ScribesView embedded />}
          {tab === "dialer" && (
            <>
              <div className="tabPageActionBar">{dialerBuilderActions}</div>
              <DialerBuilder activeConfig={activeDialerConfig} onActiveConfigChange={setActiveDialerConfig} renderActions={setDialerBuilderActions} />
            </>
	          )}
	          {tab === "design" && <DesignSystemView embedded />}
	          {tab === "wiki" && renderWikiSettingsTab()}
	        </div>
      </div>
    </section>
  );
}

function AgentControlPlaneSetupPanel({
  connectors,
  refresh,
}: {
  connectors: ConnectorStatus[];
  refresh: () => Promise<void>;
}) {
  const [authStatus, setAuthStatus] = useState<AgentControlPlaneAuthStatus | null>(null);
  const [runtime, setRuntime] = useState<"openclaw" | "hermes">("openclaw");
  const [draft, setDraft] = useState({
    name: "",
    squad: "",
    audience: "Telnyx employees",
    instructions: "",
  });
  const [toolAccess, setToolAccess] = useState({
    linkTools: true,
    memory: true,
    approval: true,
  });
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const connectedToolNames = connectors
    .filter((connector) => connector.id !== "agent-control-plane")
    .filter((connector) => connector.status === "connected" || connector.status === "signed_in")
    .map((connector) => connector.name);
  const profileReady = Boolean(draft.name.trim() && draft.squad.trim());
  const instructionsReady = draft.instructions.trim().length >= 40;
  const agentSetupDraft = useMemo(() => {
    return {
      name: draft.name.trim(),
      runtime,
      squad: draft.squad.trim(),
      audience: draft.audience.trim() || "Telnyx employees",
      instructions: draft.instructions.trim(),
      access: {
        linkTools: toolAccess.linkTools,
        memory: toolAccess.memory,
        requireApproval: toolAccess.approval,
        connectedSources: connectedToolNames,
      },
    };
  }, [connectedToolNames, draft.audience, draft.instructions, draft.name, draft.squad, runtime, toolAccess.approval, toolAccess.linkTools, toolAccess.memory]);

  async function loadAgentSetupState() {
    setBusyAction("refresh");
    setError("");
    setMessage("");
    try {
      const nextAuthStatus = await linkApi.getAgentControlPlaneAuthStatus();
      setAuthStatus(nextAuthStatus);
      setMessage(nextAuthStatus.ready ? "Agent Control Plane session is ready for creating a new agent." : "");
    } catch (err) {
      setError(agentControlPlaneLoadMessage(err));
    } finally {
      setBusyAction("");
    }
  }

  useEffect(() => {
    void loadAgentSetupState();
  }, []);

  async function signIn() {
    setBusyAction("sign-in");
    setError("");
    setMessage("");
    try {
      const nextAuthStatus = await linkApi.signInAgentControlPlane();
      setAuthStatus(nextAuthStatus);
      await refresh();
      await loadAgentSetupState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okta sign-in failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function signOut() {
    setBusyAction("sign-out");
    setError("");
    setMessage("");
    try {
      const nextAuthStatus = await linkApi.signOutAgentControlPlane();
      setAuthStatus(nextAuthStatus);
      await refresh();
      setMessage("Signed out of Agent Control Plane.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out.");
    } finally {
      setBusyAction("");
    }
  }

  async function openDeploymentForm() {
    setBusyAction("open");
    setError("");
    setMessage("");
    try {
      await linkApi.openAgentControlPlaneSetup({ draft: agentSetupDraft });
      setMessage("Opened Agent Control Plane with the current setup draft.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open Agent Control Plane setup.");
    } finally {
      setBusyAction("");
    }
  }

  function updateDraft(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateToolAccess(key: keyof typeof toolAccess, value: boolean) {
    setToolAccess((current) => ({ ...current, [key]: value }));
  }

  const signedIn = Boolean(authStatus?.ready);

  return (
    <div className="acpSetupPanel">
      <section className="acpSetupHero">
        <div className="acpSetupHeroIcon">
          <Bot size={22} />
        </div>
        <div>
          <h2>Agent Control Plane setup</h2>
          <p>Configure the agent profile, runtime, access expectations, and deployment checklist for a new ACP agent.</p>
        </div>
        <div className="acpSetupHeroActions">
          <button className="button secondary" type="button" onClick={() => void loadAgentSetupState()} disabled={Boolean(busyAction)}>
            <RefreshCw size={14} />
            {busyAction === "refresh" ? "Refreshing" : "Refresh"}
          </button>
          <button className={signedIn ? "button ghost" : "button primary"} type="button" onClick={() => void signIn()} disabled={Boolean(busyAction)}>
            <ShieldCheck size={14} />
            {busyAction === "sign-in" ? "Signing in" : signedIn ? "Re-auth" : "Sign in"}
          </button>
          {signedIn && (
            <button className="button ghost" type="button" onClick={() => void signOut()} disabled={Boolean(busyAction)}>
              <LogOut size={14} />
              Sign out
            </button>
          )}
        </div>
      </section>

      {error && <div className="errorBanner">{error}</div>}
      {message && <div className="infoBanner">{message}</div>}

      <section className="acpSetupGrid">
        <div className="acpSetupCard acpSetupFormCard">
          <div className="acpSetupCardHeader">
            <div>
              <span>Profile</span>
              <h3>New agent</h3>
            </div>
            <Badge tone={profileReady && instructionsReady ? "success" : "warning"}>{profileReady && instructionsReady ? "Ready" : "Draft"}</Badge>
          </div>
          <div className="acpRuntimeSwitch" role="tablist" aria-label="Agent runtime">
            {(["openclaw", "hermes"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={runtime === option ? "selected" : ""}
                onClick={() => setRuntime(option)}
                role="tab"
                aria-selected={runtime === option}
              >
                {option === "openclaw" ? "OpenClaw" : "Hermes"}
              </button>
            ))}
          </div>
          <label className="acpSetupField">
            <span>Agent name</span>
            <input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="Revenue Support Triage" />
          </label>
          <div className="acpSetupFieldGrid">
            <label className="acpSetupField">
              <span>Squad</span>
              <input value={draft.squad} onChange={(event) => updateDraft("squad", event.target.value)} placeholder="support.squad" />
            </label>
            <label className="acpSetupField">
              <span>Audience</span>
              <input value={draft.audience} onChange={(event) => updateDraft("audience", event.target.value)} placeholder="Telnyx employees" />
            </label>
          </div>
          <label className="acpSetupField">
            <span>Instructions</span>
            <textarea
              value={draft.instructions}
              onChange={(event) => updateDraft("instructions", event.target.value)}
              placeholder="Define ownership, preferred sources, escalation rules, approval boundaries, and the exact handoff state the agent should leave work in."
            />
          </label>
        </div>

        <div className="acpSetupCard">
          <div className="acpSetupCardHeader">
            <div>
              <span>Access</span>
              <h3>Tools and safety</h3>
            </div>
          </div>
          <div className="acpAccessToggles">
            <label>
              <input type="checkbox" checked={toolAccess.linkTools} onChange={(event) => updateToolAccess("linkTools", event.target.checked)} />
              <span>
                <strong>Use connected Link tools</strong>
                <small>Expose approved MCPs, inbox, docs, calendar, phone, and internal data sources available to this user.</small>
              </span>
            </label>
            <label>
              <input type="checkbox" checked={toolAccess.memory} onChange={(event) => updateToolAccess("memory", event.target.checked)} />
              <span>
                <strong>Recall Link memory</strong>
                <small>Allow source-attributed memory retrieval for long-running agent work.</small>
              </span>
            </label>
            <label>
              <input type="checkbox" checked={toolAccess.approval} onChange={(event) => updateToolAccess("approval", event.target.checked)} />
              <span>
                <strong>Require approval for risky actions</strong>
                <small>Customer-facing, write, delete, and deployment actions stay human-reviewed.</small>
              </span>
            </label>
          </div>
          <div className="acpConnectedSources">
            {connectedToolNames.length > 0 ? connectedToolNames.map((name) => <span key={name}>{name}</span>) : <em>No connected sources yet</em>}
          </div>
        </div>

        <div className="acpSetupCard">
          <div className="acpSetupCardHeader">
            <div>
              <span>Create</span>
              <h3>New ACP agent</h3>
            </div>
            <Badge tone={signedIn ? "success" : "warning"}>{signedIn ? "Ready" : "Sign in"}</Badge>
          </div>
          <div className="acpCreateSummary">
            <Bot size={22} />
            <div>
              <strong>{draft.name.trim() || "New ACP agent"}</strong>
              <small>{runtime === "openclaw" ? "OpenClaw" : "Hermes"} runtime · {draft.squad.trim() || "Squad not set"}</small>
            </div>
          </div>
          <p className="acpCreateNote">
            Create the agent with the selected runtime, squad, access, and safety settings.
          </p>
          <div className="acpSetupActions">
            <button className="button secondary" type="button" onClick={() => void openDeploymentForm()} disabled={!signedIn || Boolean(busyAction)}>
              <ExternalLink size={14} />
              {busyAction === "open" ? "Opening" : "Continue in ACP"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

type ScribesWorkspaceTab = "dictation" | "models" | "history" | "cloud" | "tts" | "meetings" | "settings";

const scribesWorkspaceTabs: readonly PageSectionTab<ScribesWorkspaceTab>[] = [
  ["dictation", "Dictation", Mic],
  ["models", "Models", Download],
  ["history", "History", ArchiveIcon],
  ["cloud", "Telnyx Cloud", Plug],
  ["tts", "TTS", Volume2],
  ["meetings", "Meeting Notes", Users],
  ["settings", "Settings", Settings],
];

function ScribesView({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState<ScribesWorkspaceTab>(embedded ? "settings" : "dictation");
  const [status, setStatus] = useState<ScribesStatus | null>(null);
  const [message, setMessage] = useState("");

  async function refreshScribesWorkspace() {
    const nextStatus = await linkApi.getScribesStatus();
    setStatus(nextStatus);
  }

  useEffect(() => {
    void refreshScribesWorkspace().catch((err) => {
      setMessage(err instanceof Error ? err.message : "Scribes workspace could not load.");
    });
  }, []);

  const activeLabel = scribesWorkspaceTabs.find(([id]) => id === activeTab)?.[1] || "Scribes";

  function renderActivePanel() {
    if (!status) return <div className="appEmptyPanel">Loading Scribes workspace...</div>;
    if (activeTab === "dictation") return <ScribesDictationPanel status={status} onRefresh={refreshScribesWorkspace} />;
    if (activeTab === "models") return <ScribesModelsPanel />;
    if (activeTab === "history") return <ScribesHistoryPanel sessions={status.sessions} onRefresh={refreshScribesWorkspace} />;
    if (activeTab === "cloud") return <ScribesCloudPanel status={status} onRefresh={refreshScribesWorkspace} />;
    if (activeTab === "tts") return <ScribesTtsPanel status={status} />;
    if (activeTab === "meetings") return <ScribesMeetingNotesPanel status={status} onRefresh={refreshScribesWorkspace} />;
    return <ScribesWorkspaceSettingsPanel workspace={status.workspace} onRefresh={refreshScribesWorkspace} />;
  }

  return (
    <section className={embedded ? "scribesView settingsScribesPanel" : "content scribesView canonicalChat"}>
      {!embedded && (
        <header className="pageHeader">
          <div>
            <h1>Scribes</h1>
          </div>
        </header>
      )}
      <div className={embedded ? "scribesSurface" : "pageSectionShell scribesWorkspaceShell"}>
        {!embedded && (
          <PageSectionSidebar
            tabs={scribesWorkspaceTabs}
            heading="Scribes"
            headingIcon={ScribesWaveformIcon}
            activeTab={activeTab}
            onSelect={setActiveTab}
            label="Scribes workspace sections"
          />
        )}
        <main className="pageSectionMain scribesWorkspaceMain">
          {!embedded && (
            <PageSectionHeader
              parent="Scribes"
              title={activeLabel}
              action={(
                <button className="button secondary" type="button" onClick={() => void refreshScribesWorkspace()}>
                  <RefreshCw size={14} />
                  Refresh
                </button>
              )}
            />
          )}
          {status && <ScribesRouteSummary status={status} />}
          {renderActivePanel()}
          {embedded && <SpeakSettingsPanel />}
          {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
        </main>
      </div>
    </section>
  );
}

function ScribesRouteSummary({ status }: { status: ScribesStatus }) {
  const artifactCount = status.sessions.reduce((count, session) => count + session.artifacts.length, 0);
  return (
    <div className="scribesSummaryGrid" aria-label="Scribes workspace status">
      <div className="scribesRouteCard">
        <span className="accessIcon"><Mic size={18} /></span>
        <div>
          <strong>Local STT</strong>
          <small>{status.route.mode === "local" ? status.route.diagnostics.message : "OpenAI Whisper and NVIDIA Parakeet"}</small>
        </div>
      </div>
      <div className="scribesRouteCard">
        <span className="accessIcon"><Plug size={18} /></span>
        <div>
          <strong>Telnyx Cloud</strong>
          <small>{status.telnyxCloudReady ? "TELNYX_API_KEY connected for cloud STT/TTS" : "TELNYX_API_KEY required for cloud STT/TTS"}</small>
        </div>
      </div>
      <div className="scribesRouteCard">
        <span className="accessIcon"><ArchiveIcon size={18} /></span>
        <div>
          <strong>{status.sessions.length.toLocaleString()} Records</strong>
          <small>{artifactCount.toLocaleString()} generated artifacts in ~/Link/scribes/</small>
        </div>
      </div>
    </div>
  );
}

function ScribesDictationPanel({ status, onRefresh }: { status: ScribesStatus; onRefresh: () => Promise<void> }) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTranscript, setDraftTranscript] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  async function startDictation() {
    setBusyAction("start");
    setMessage("");
    try {
      await linkApi.startWhisper();
      await onRefresh();
      setMessage("Scribes dictation started.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes dictation could not start.");
    } finally {
      setBusyAction("");
    }
  }

  async function stopDictation() {
    setBusyAction("stop");
    setMessage("");
    try {
      await linkApi.stopWhisper();
      await onRefresh();
      setMessage("Scribes dictation stopped.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes dictation could not stop.");
    } finally {
      setBusyAction("");
    }
  }

  async function saveDraft() {
    const transcriptText = draftTranscript.trim();
    if (!transcriptText) return;
    setBusyAction("save");
    setMessage("");
    try {
      await linkApi.createScribesSession({
        title: draftTitle.trim() || undefined,
        transcriptText,
        provider: status.settings.sttProvider,
        model: status.settings.sttModel,
        mode: status.settings.sttMode,
        sessionType: "dictation",
        language: status.settings.sttLanguage,
        retainedAudio: status.workspace.retainAudio,
      });
      setDraftTitle("");
      setDraftTranscript("");
      await onRefresh();
      setMessage("Transcript saved to Scribes.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Transcript could not be saved.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="scribesWorkspacePanel">
      <section className="accessCard speakStatusCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Mic size={18} /></span>
            <div>
              <h3>Dictation</h3>
              <p>{status.route.diagnostics.message}</p>
            </div>
          </div>
          <Badge tone={status.route.ready ? "success" : "warning"}>{status.route.ready ? "Ready" : "Needs setup"}</Badge>
        </div>
        <div className="speakShortcutPanel">
          <span className="accessIcon"><Keyboard size={18} /></span>
          <div>
            <small>Shortcut</small>
            <strong>{status.settings.shortcutLabel}</strong>
          </div>
          <div className={`speakStatusPill ${status.server.ready ? "ready" : ""}`}>{status.server.running ? "Server running" : status.settings.sttMode === "telnyx-cloud" ? "Cloud route" : "Server stopped"}</div>
        </div>
        <div className="speakActionRow">
          <button className="button primary" type="button" onClick={() => void startDictation()} disabled={busyAction !== ""}>
            <Play size={14} />
            {busyAction === "start" ? "Starting" : "Start"}
          </button>
          <button className="button secondary" type="button" onClick={() => void stopDictation()} disabled={busyAction !== ""}>
            <Square size={14} />
            {busyAction === "stop" ? "Stopping" : "Stop"}
          </button>
        </div>
      </section>

      <section className="accessCard scribesDraftCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><FileText size={18} /></span>
            <div>
              <h3>New Transcript</h3>
            </div>
          </div>
          <button className="button primary" type="button" onClick={() => void saveDraft()} disabled={busyAction !== "" || !draftTranscript.trim()}>
            <Save size={14} />
            {busyAction === "save" ? "Saving" : "Save"}
          </button>
        </div>
        <div className="scribesDraftFields">
          <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Title" />
          <textarea value={draftTranscript} onChange={(event) => setDraftTranscript(event.target.value)} placeholder="Transcript text" />
        </div>
      </section>
      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
    </div>
  );
}

function ScribesHistoryPanel({ sessions, onRefresh }: { sessions: ScribesSession[]; onRefresh: () => Promise<void> }) {
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  async function generateArtifact(session: ScribesSession, kind: ScribesArtifactKind) {
    setBusyAction(`${kind}:${session.id}`);
    setMessage("");
    try {
      await linkApi.generateScribesArtifact({ sessionId: session.id, kind });
      await onRefresh();
      setMessage(`${formatScribesArtifactKind(kind)} generated.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes artifact could not be generated.");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteSession(session: ScribesSession) {
    setBusyAction(`delete:${session.id}`);
    setMessage("");
    try {
      await linkApi.deleteScribesSession({ id: session.id });
      await onRefresh();
      setMessage("Scribes record deleted.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes record could not be deleted.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <section className="accessCard scribesHistoryCard">
      <div className="accessCardHeader">
        <div className="accessCardTitle">
          <span className="accessIcon"><ArchiveIcon size={18} /></span>
          <div>
            <h3>Transcript History</h3>
          </div>
        </div>
        <Badge tone="default">{sessions.length.toLocaleString()} records</Badge>
      </div>
      <div className="scribesSessionTable" role="table" aria-label="Scribes transcript history">
        <div className="scribesSessionRow scribesSessionRowHead" role="row">
          <span role="columnheader">Transcript</span>
          <span role="columnheader">Provider</span>
          <span role="columnheader">Duration</span>
          <span role="columnheader">Updated</span>
          <span role="columnheader">Actions</span>
        </div>
        {sessions.map((session) => (
          <div className="scribesSessionRow" role="row" key={session.id}>
            <div role="cell">
              <strong>{session.title}</strong>
              <small>{session.artifacts[0]?.path || "~/Link/scribes/transcripts/"}</small>
            </div>
            <span role="cell">{sttProviderLabel(session.provider)}</span>
            <span role="cell">{formatScribesDuration(session.durationMs)}</span>
            <span role="cell">{compactRelativeTime(session.updatedAt)}</span>
            <div className="scribesModelActions" role="cell">
              <button className="button secondary" type="button" onClick={() => void generateArtifact(session, "summary")} disabled={busyAction !== ""}>
                <FileText size={14} />
                Summary
              </button>
              <button className="button secondary" type="button" onClick={() => void generateArtifact(session, "action-items")} disabled={busyAction !== ""}>
                <SquareCheck size={14} />
                Actions
              </button>
              <button className="button secondary" type="button" onClick={() => void deleteSession(session)} disabled={busyAction !== ""}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {sessions.length === 0 && <EmptyState title="No transcripts yet" body="Scribes records will appear here after dictation, meeting capture, or transcript import." icon={FileText} />}
      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
    </section>
  );
}

function ScribesCloudPanel({ status, onRefresh }: { status: ScribesStatus; onRefresh: () => Promise<void> }) {
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  async function selectCloudRoute(target: "stt" | "tts") {
    setBusyAction(target);
    setMessage("");
    try {
      if (target === "stt") {
        await linkApi.saveSpeakSettings({
          sttMode: "telnyx-cloud",
          sttProvider: "telnyx",
          sttEngine: "Telnyx",
          sttModel: "telnyx/stt",
        });
      } else {
        await linkApi.saveSpeakSettings({
          ttsMode: "telnyx-cloud",
          ttsProvider: "telnyx",
        });
      }
      await onRefresh();
      setMessage("Telnyx Cloud route saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Telnyx Cloud route could not be saved.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="scribesWorkspacePanel">
      <section className="accessCard scribesCloudCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Plug size={18} /></span>
            <div>
              <h3>Telnyx Cloud</h3>
              <p>{status.telnyxCloudReady ? "TELNYX_API_KEY is configured." : "Cloud STT and TTS are blocked until TELNYX_API_KEY is configured."}</p>
            </div>
          </div>
          <Badge tone={status.telnyxCloudReady ? "success" : "warning"}>{status.telnyxCloudReady ? "Connected" : "Key required"}</Badge>
        </div>
        <div className="scribesCloudGrid">
          <div className="scribesCloudRoute">
            <strong>Cloud STT</strong>
            <span>Provider: Telnyx</span>
            <button className="button secondary" type="button" onClick={() => void selectCloudRoute("stt")} disabled={busyAction !== "" || !status.telnyxCloudReady}>
              <Mic size={14} />
              {busyAction === "stt" ? "Saving" : "Use for STT"}
            </button>
          </div>
          <div className="scribesCloudRoute">
            <strong>Cloud TTS</strong>
            <span>Provider: Telnyx</span>
            <button className="button secondary" type="button" onClick={() => void selectCloudRoute("tts")} disabled={busyAction !== "" || !status.telnyxCloudReady}>
              <Volume2 size={14} />
              {busyAction === "tts" ? "Saving" : "Use for TTS"}
            </button>
          </div>
        </div>
      </section>
      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
    </div>
  );
}

function ScribesTtsPanel({ status }: { status: ScribesStatus }) {
  return (
    <div className="scribesWorkspacePanel">
      <section className="accessCard speakSettingsCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Volume2 size={18} /></span>
            <div>
              <h3>Text-to-Speech</h3>
            </div>
          </div>
          <Badge tone={status.settings.ttsMode === "telnyx-cloud" && status.telnyxCloudReady ? "success" : status.settings.ttsMode === "local" ? "default" : "warning"}>
            {status.settings.ttsMode === "local" ? "Local stub" : status.telnyxCloudReady ? "Cloud ready" : "Key required"}
          </Badge>
        </div>
        <div className="scribesModeNotice">
          <strong>{status.settings.ttsMode === "local" ? "Local TTS" : "Telnyx Cloud TTS"}</strong>
          <span>{status.settings.ttsMode === "local" ? "Pluggable local provider slot." : "Hosted voice generation through Telnyx when TELNYX_API_KEY is configured."}</span>
        </div>
      </section>
      <SpeakSettingsPanel />
    </div>
  );
}

function ScribesMeetingNotesPanel({ status, onRefresh }: { status: ScribesStatus; onRefresh: () => Promise<void> }) {
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const meetingSessions = status.sessions.filter((session) => session.sessionType === "meeting");

  async function saveCaptureSettings(patch: Partial<ScribesWorkspaceSettings["meetingCapture"]>) {
    setBusyAction("settings");
    setMessage("");
    try {
      await linkApi.saveScribesSettings({
        meetingCapture: {
          ...status.workspace.meetingCapture,
          ...patch,
        },
      });
      await onRefresh();
      setMessage("Meeting capture settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Meeting capture settings could not be saved.");
    } finally {
      setBusyAction("");
    }
  }

  async function generateMeetingSummary(session: ScribesSession) {
    setBusyAction(`meeting:${session.id}`);
    setMessage("");
    try {
      await linkApi.generateScribesArtifact({ sessionId: session.id, kind: "summary" });
      await onRefresh();
      setMessage("Meeting summary generated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Meeting summary could not be generated.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="scribesWorkspacePanel">
      <section className="accessCard scribesMeetingCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Users size={18} /></span>
            <div>
              <h3>Meeting Capture</h3>
            </div>
          </div>
          <Badge tone={status.workspace.meetingCapture.microphone ? "success" : "warning"}>{status.workspace.meetingCapture.microphone ? "Mic enabled" : "Mic off"}</Badge>
        </div>
        <div className="scribesCaptureGrid">
          <label className="speakToggleRow">
            <span>Microphone</span>
            <button className={`settingsToggle ${status.workspace.meetingCapture.microphone ? "selected" : ""}`} type="button" onClick={() => void saveCaptureSettings({ microphone: !status.workspace.meetingCapture.microphone })} disabled={busyAction !== ""}>
              <span>{status.workspace.meetingCapture.microphone ? "On" : "Off"}</span>
              <i />
            </button>
          </label>
          <label className="speakToggleRow">
            <span>System Audio</span>
            <button className={`settingsToggle ${status.workspace.meetingCapture.systemAudio ? "selected" : ""}`} type="button" onClick={() => void saveCaptureSettings({ systemAudio: !status.workspace.meetingCapture.systemAudio })} disabled={busyAction !== ""}>
              <span>{status.workspace.meetingCapture.systemAudio ? "On" : "Off"}</span>
              <i />
            </button>
          </label>
          <label className="speakToggleRow">
            <span>Speaker Labels</span>
            <button className={`settingsToggle ${status.workspace.meetingCapture.speakerLabels ? "selected" : ""}`} type="button" onClick={() => void saveCaptureSettings({ speakerLabels: !status.workspace.meetingCapture.speakerLabels })} disabled={busyAction !== ""}>
              <span>{status.workspace.meetingCapture.speakerLabels ? "On" : "Off"}</span>
              <i />
            </button>
          </label>
          <label className="speakToggleRow">
            <span>Diarization</span>
            <button className={`settingsToggle ${status.workspace.meetingCapture.diarization ? "selected" : ""}`} type="button" onClick={() => void saveCaptureSettings({ diarization: !status.workspace.meetingCapture.diarization })} disabled={busyAction !== ""}>
              <span>{status.workspace.meetingCapture.diarization ? "On" : "Off"}</span>
              <i />
            </button>
          </label>
        </div>
      </section>
      <section className="accessCard scribesHistoryCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Clock size={18} /></span>
            <div>
              <h3>Meeting Notes</h3>
            </div>
          </div>
          <Badge tone="default">{meetingSessions.length.toLocaleString()} meetings</Badge>
        </div>
        <div className="scribesMeetingList">
          {meetingSessions.map((session) => (
            <div className="scribesMeetingItem" key={session.id}>
              <div>
                <strong>{session.title}</strong>
                <small>{session.meeting.speakerLabels.join(", ") || "No speaker labels"} · {session.meeting.diarizationStatus}</small>
                <p>{session.segments.slice(0, 2).map((segment) => `${segment.speaker}: ${segment.text}`).join(" ")}</p>
              </div>
              <button className="button secondary" type="button" onClick={() => void generateMeetingSummary(session)} disabled={busyAction !== ""}>
                <FileText size={14} />
                Summary
              </button>
            </div>
          ))}
        </div>
        {meetingSessions.length === 0 && <EmptyState title="No meetings yet" body="Meeting transcripts will appear here with segments, speaker labels, and summaries." icon={Users} />}
      </section>
      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
    </div>
  );
}

function ScribesWorkspaceSettingsPanel({ workspace, onRefresh }: { workspace: ScribesWorkspaceSettings; onRefresh: () => Promise<void> }) {
  const [vocabularyDraft, setVocabularyDraft] = useState(workspace.customVocabulary.join("\n"));
  const [selectedProfileId, setSelectedProfileId] = useState(workspace.activeCleanupProfileId);
  const selectedProfile = workspace.cleanupProfiles.find((profile) => profile.id === selectedProfileId) || workspace.cleanupProfiles[0];
  const [profileInstructions, setProfileInstructions] = useState(selectedProfile?.instructions || "");
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setVocabularyDraft(workspace.customVocabulary.join("\n"));
    setSelectedProfileId(workspace.activeCleanupProfileId);
  }, [workspace.activeCleanupProfileId, workspace.customVocabulary]);

  useEffect(() => {
    setProfileInstructions(selectedProfile?.instructions || "");
  }, [selectedProfile?.id, selectedProfile?.instructions]);

  async function saveWorkspaceSettings(patch: Partial<ScribesWorkspaceSettings>) {
    setBusyAction("settings");
    setMessage("");
    try {
      await linkApi.saveScribesSettings(patch);
      await onRefresh();
      setMessage("Scribes settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes settings could not be saved.");
    } finally {
      setBusyAction("");
    }
  }

  async function saveProfile() {
    if (!selectedProfile) return;
    const cleanupProfiles: ScribesCleanupProfile[] = workspace.cleanupProfiles.map((profile) =>
      profile.id === selectedProfile.id
        ? { ...profile, instructions: profileInstructions, updatedAt: new Date().toISOString() }
        : profile,
    );
    await saveWorkspaceSettings({ cleanupProfiles, activeCleanupProfileId: selectedProfile.id });
  }

  return (
    <div className="scribesWorkspacePanel">
      <section className="accessCard speakSettingsCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Settings size={18} /></span>
            <div>
              <h3>Scribes Settings</h3>
            </div>
          </div>
        </div>
        <div className="speakSettingsRows">
          <div className="speakToggleRow">
            <span>Retain Audio</span>
            <button className={`settingsToggle ${workspace.retainAudio ? "selected" : ""}`} type="button" onClick={() => void saveWorkspaceSettings({ retainAudio: !workspace.retainAudio })} disabled={busyAction !== ""}>
              <span>{workspace.retainAudio ? "On" : "Off"}</span>
              <i />
            </button>
          </div>
          <div className="speakToggleRow">
            <span>Edit Mode</span>
            <button className={`settingsToggle ${workspace.editModeEnabled ? "selected" : ""}`} type="button" onClick={() => void saveWorkspaceSettings({ editModeEnabled: !workspace.editModeEnabled })} disabled={busyAction !== ""}>
              <span>{workspace.editModeEnabled ? "On" : "Off"}</span>
              <i />
            </button>
          </div>
          <label className="speakSettingField">
            <span>Audio Days</span>
            <input type="number" min={0} max={365} value={workspace.audioRetentionDays} onChange={(event) => void saveWorkspaceSettings({ audioRetentionDays: Number(event.target.value) })} />
          </label>
        </div>
      </section>

      <section className="accessCard speakSettingsCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Tags size={18} /></span>
            <div>
              <h3>Vocabulary</h3>
            </div>
          </div>
          <button className="button secondary" type="button" onClick={() => void saveWorkspaceSettings({ customVocabulary: vocabularyDraft.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) })} disabled={busyAction !== ""}>
            <Save size={14} />
            Save
          </button>
        </div>
        <textarea className="scribesSettingsTextarea" value={vocabularyDraft} onChange={(event) => setVocabularyDraft(event.target.value)} />
      </section>

      <section className="accessCard speakSettingsCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Pencil size={18} /></span>
            <div>
              <h3>Cleanup Profiles</h3>
            </div>
          </div>
          <button className="button secondary" type="button" onClick={() => void saveProfile()} disabled={busyAction !== "" || !selectedProfile}>
            <Save size={14} />
            Save Profile
          </button>
        </div>
        <div className="speakSettingsRows">
          <label className="speakSettingField">
            <span>Active Profile</span>
            <select value={selectedProfileId} onChange={(event) => setSelectedProfileId(event.target.value)}>
              {workspace.cleanupProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
          </label>
          <textarea className="scribesSettingsTextarea" value={profileInstructions} onChange={(event) => setProfileInstructions(event.target.value)} />
          <div className="scribesModeNotice">
            <strong>Cleanup guard</strong>
            <span>Transcript text is edited as content only; profile text is never treated as transcript instructions.</span>
          </div>
        </div>
      </section>
      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
    </div>
  );
}

function formatScribesDuration(durationMs: number) {
  if (!durationMs) return "0s";
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatScribesArtifactKind(kind: ScribesArtifactKind) {
  if (kind === "action-items") return "Action items";
  if (kind === "meeting-notes") return "Meeting notes";
  if (kind === "tts-script") return "TTS script";
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function sttProviderDefaultModel(provider: SpeakSettings["sttProvider"]) {
  if (provider === "telnyx") return "telnyx/stt";
  if (provider === "nvidia-parakeet") return "parakeet-tdt-0.6b-v3";
  return "whisper.cpp/base";
}

function sttProviderLabel(provider: SpeakSettings["sttProvider"]) {
  if (provider === "telnyx") return "Telnyx Cloud";
  if (provider === "nvidia-parakeet") return "NVIDIA Parakeet";
  return "OpenAI Whisper";
}

function sttProviderEngineLabel(provider: SpeakSettings["sttProvider"]): SpeakSettings["sttEngine"] {
  if (provider === "telnyx") return "Telnyx";
  if (provider === "nvidia-parakeet") return "NVIDIA Parakeet";
  return "Local Whisper";
}

function ScribesModelsPanel() {
  const [status, setStatus] = useState<ScribesStatus | null>(null);
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  async function refreshScribesStatus() {
    const nextStatus = await linkApi.getScribesStatus();
    setStatus(nextStatus);
  }

  useEffect(() => {
    void refreshScribesStatus().catch((err) => {
      setMessage(err instanceof Error ? err.message : "Scribes model status could not load.");
    });
  }, []);

  async function useModel(model: ScribesModel) {
    setBusyAction(`use:${model.id}`);
    setMessage("");
    try {
      await linkApi.saveSpeakSettings({
        sttMode: "local",
        sttProvider: model.provider,
        sttEngine: sttProviderEngineLabel(model.provider),
        sttModel: model.id,
      });
      await refreshScribesStatus();
      setMessage(`${model.label} selected for local STT.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes model could not be selected.");
    } finally {
      setBusyAction("");
    }
  }

  async function downloadModel(model: ScribesModel) {
    setBusyAction(`download:${model.id}`);
    setMessage("");
    try {
      await linkApi.downloadScribesModel({ modelId: model.id, provider: model.provider });
      await refreshScribesStatus();
      setMessage(`${model.label} is available locally.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes model download failed.");
      await refreshScribesStatus().catch(() => undefined);
    } finally {
      setBusyAction("");
    }
  }

  async function deleteModel(model: ScribesModel) {
    setBusyAction(`delete:${model.id}`);
    setMessage("");
    try {
      await linkApi.deleteScribesModel({ modelId: model.id, provider: model.provider });
      await refreshScribesStatus();
      setMessage(`${model.label} removed from local storage.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes model could not be deleted.");
    } finally {
      setBusyAction("");
    }
  }

  async function cancelDownload(model: ScribesModel) {
    setBusyAction(`cancel:${model.id}`);
    setMessage("");
    try {
      await linkApi.cancelScribesModelDownload({ modelId: model.id, provider: model.provider });
      await refreshScribesStatus();
      setMessage(`Cancel requested for ${model.label}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes model download could not be canceled.");
    } finally {
      setBusyAction("");
    }
  }

  async function toggleServer() {
    if (!status) return;
    setBusyAction(status.server.running ? "server:stop" : "server:start");
    setMessage("");
    try {
      if (status.server.running) {
        await linkApi.stopScribesLocalServer();
      } else {
        await linkApi.startScribesLocalServer({ warm: true });
      }
      await refreshScribesStatus();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes local server action failed.");
    } finally {
      setBusyAction("");
    }
  }

  if (!status) {
    return <div className="appEmptyPanel">Loading Scribes models...</div>;
  }

  const selectedModelId = status.settings.sttMode === "local" ? status.settings.sttModel : "";

  return (
    <section className="accessCard scribesModelManager">
      <div className="accessCardHeader">
        <div className="accessCardTitle">
          <span className="accessIcon"><Download size={18} /></span>
          <div>
            <h3>Local STT Models</h3>
            <p>{status.route.diagnostics.message}</p>
          </div>
        </div>
        <button className="button secondary" type="button" onClick={() => void toggleServer()} disabled={busyAction !== ""}>
          {status.server.running ? <Square size={14} /> : <Play size={14} />}
          {busyAction.startsWith("server") ? "Working" : status.server.running ? "Stop Server" : "Start Server"}
        </button>
      </div>
      <div className="scribesServerStrip">
        <span className={`speakStatusPill ${status.server.ready ? "ready" : ""}`}>{status.server.running ? status.server.ready ? "Ready" : "Running" : "Stopped"}</span>
        <span>{status.server.message}</span>
        {status.server.endpoint && <code>{status.server.endpoint}</code>}
      </div>
      <div className="scribesModelTable" role="table" aria-label="Scribes local STT models">
        <div className="scribesModelRow scribesModelRowHead" role="row">
          <span role="columnheader">Model</span>
          <span role="columnheader">Provider</span>
          <span role="columnheader">Size</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Actions</span>
        </div>
        {status.models.map((model) => {
          const selected = selectedModelId === model.id;
          const progress = model.download?.totalBytes ? Math.round(((model.download.receivedBytes || 0) / model.download.totalBytes) * 100) : 0;
          return (
            <div className={`scribesModelRow ${selected ? "selected" : ""}`} role="row" key={model.id}>
              <div role="cell">
                <strong>{model.label}</strong>
                <small>{model.description}</small>
              </div>
              <span role="cell">{sttProviderLabel(model.provider)}</span>
              <span role="cell">{formatScribesBytes(model.sizeBytes)}</span>
              <span role="cell">{model.downloading ? `${progress}%` : model.downloaded ? "Downloaded" : "Not downloaded"}</span>
              <div className="scribesModelActions" role="cell">
                <button className="button secondary" type="button" onClick={() => void useModel(model)} disabled={busyAction !== "" || selected}>
                  <Check size={14} />
                  {selected ? "Selected" : "Use"}
                </button>
                {model.downloading ? (
                  <button className="button secondary" type="button" onClick={() => void cancelDownload(model)} disabled={busyAction !== ""}>
                    <Square size={14} />
                    Cancel
                  </button>
                ) : model.downloaded ? (
                  <button className="button secondary" type="button" onClick={() => void deleteModel(model)} disabled={busyAction !== ""}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                ) : (
                  <button className="button primary" type="button" onClick={() => void downloadModel(model)} disabled={busyAction !== ""}>
                    <Download size={14} />
                    {busyAction === `download:${model.id}` ? "Downloading" : "Download"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
    </section>
  );
}

function formatScribesBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function SpeakSettingsPanel() {
  const [settings, setSettings] = useState<SpeakSettings | null>(null);
  const [status, setStatus] = useState<WhisperStatus | null>(null);
  const [voices, setVoices] = useState<TelnyxTtsVoice[]>([]);
  const [voiceProviderFilter, setVoiceProviderFilter] = useState("telnyx");
  const [voiceLanguageFilter, setVoiceLanguageFilter] = useState("all");
  const [voiceGenderFilter, setVoiceGenderFilter] = useState("all");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [sampleText, setSampleText] = useState("Thanks for calling Telnyx. How can I help you today?");
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  async function refreshSpeakSettings() {
    const [nextSettings, nextStatus] = await Promise.all([
      linkApi.getSpeakSettings(),
      linkApi.getWhisperStatus(),
    ]);
    setSettings(nextSettings);
    setStatus(nextStatus);
  }

  useEffect(() => {
    void refreshSpeakSettings().catch((err) => {
      setMessage(err instanceof Error ? err.message : "Scribes settings could not load.");
    });
  }, []);

  async function saveSpeakSettingsPatch(patch: Partial<SpeakSettings>) {
    if (!settings) return;
    const optimistic = {
      ...settings,
      ...patch,
      shortcutLabel: patch.shortcutMode === "cmd-shift-l" ? "Cmd+Shift+L" : patch.shortcutMode === "hold-fn" ? "Hold fn" : settings.shortcutLabel,
    };
    setSettings(optimistic);
    setMessage("Saving");
    try {
      const saved = await linkApi.saveSpeakSettings(patch);
      setSettings(saved);
      setMessage("Saved");
    } catch (err) {
      setSettings(settings);
      setMessage(err instanceof Error ? err.message : "Scribes settings could not be saved.");
    }
  }

  async function chooseSttMode(nextMode: SpeakSettings["sttMode"]) {
    if (nextMode === "telnyx-cloud") {
      await saveSpeakSettingsPatch({
        sttMode: "telnyx-cloud",
        sttProvider: "telnyx",
        sttEngine: "Telnyx",
        sttModel: sttProviderDefaultModel("telnyx"),
      });
      return;
    }
    await saveSpeakSettingsPatch({
      sttMode: "local",
      sttProvider: "openai-whisper",
      sttEngine: "Local Whisper",
      sttModel: sttProviderDefaultModel("openai-whisper"),
    });
  }

  async function chooseSttProvider(provider: SpeakSettings["sttProvider"]) {
    await saveSpeakSettingsPatch({
      sttMode: provider === "telnyx" ? "telnyx-cloud" : "local",
      sttProvider: provider,
      sttEngine: sttProviderEngineLabel(provider),
      sttModel: sttProviderDefaultModel(provider),
    });
  }

  async function chooseTtsMode(nextMode: SpeakSettings["ttsMode"]) {
    await saveSpeakSettingsPatch({
      ttsMode: nextMode,
      localTtsProvider: "stub",
      ttsProvider: "telnyx",
    });
  }

  async function runWhisperAction(action: "build" | "start" | "stop") {
    setBusyAction(action);
    setMessage("");
    try {
      const nextStatus = action === "build"
        ? await linkApi.buildWhisper()
        : action === "start"
        ? await linkApi.startWhisper()
        : await linkApi.stopWhisper();
      setStatus(nextStatus);
      setMessage(nextStatus.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scribes dictation action failed.");
      await refreshSpeakSettings().catch(() => undefined);
    } finally {
      setBusyAction("");
    }
  }

  useEffect(() => {
    return () => {
      audioPreviewRef.current?.pause();
      audioPreviewRef.current = null;
    };
  }, []);

  async function loadVoices(provider = voiceProviderFilter) {
    if (settings?.ttsMode === "local") {
      setMessage("Local TTS is a pluggable Scribes slot. Use Telnyx Cloud TTS to load hosted voices.");
      return;
    }
    setBusyAction("voices");
    setMessage("");
    try {
      const nextVoices = await linkApi.listTtsVoices({ provider });
      setVoices(nextVoices);
      setVoiceLanguageFilter("all");
      setVoiceGenderFilter("all");
      setMessage(nextVoices.length ? `${nextVoices.length.toLocaleString()} voices loaded` : "No voices returned for this provider.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Telnyx voices could not be loaded.");
    } finally {
      setBusyAction("");
    }
  }

  async function useVoice(voice: TelnyxTtsVoice) {
    await saveSpeakSettingsPatch({
      ttsMode: "telnyx-cloud",
      ttsProvider: voice.provider || settings?.ttsProvider || "telnyx",
      ttsVoice: voice.voiceId,
    });
  }

  async function sampleVoice(voice: TelnyxTtsVoice) {
    setBusyAction(`sample:${voice.voiceId}`);
    setMessage("");
    try {
      audioPreviewRef.current?.pause();
      const sample = await linkApi.generateTtsSample({
        voiceId: voice.voiceId,
        text: sampleText,
        language: voice.language,
        provider: voice.provider,
      });
      if (!sample.audioBase64) {
        setMessage("Sample playback is only available in the Electron app with a saved Telnyx API key.");
        return;
      }
      const nextAudio = new Audio(`data:${sample.mimeType};base64,${sample.audioBase64}`);
      audioPreviewRef.current = nextAudio;
      await nextAudio.play();
      setMessage(`Playing ${voice.name || voice.voiceId}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Telnyx voice sample could not play.");
    } finally {
      setBusyAction("");
    }
  }

  if (!settings || !status) {
    return <div className="appEmptyPanel">Loading Scribes settings...</div>;
  }

  const cloudSttSelected = settings.sttMode === "telnyx-cloud" && settings.sttProvider === "telnyx";
  const localSttSelected = settings.sttMode === "local";
  const cloudTtsSelected = settings.ttsMode === "telnyx-cloud";
  const canStart = status.available && !status.running && (cloudSttSelected ? status.cloudReady : status.localReady);
  const voiceLanguageOptions = Array.from(new Set(voices.map((voice) => voice.language).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const voiceGenderOptions = Array.from(new Set(voices.map((voice) => voice.gender).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const normalizedVoiceSearch = voiceSearch.trim().toLowerCase();
  const filteredVoices = voices.filter((voice) => {
    const matchesLanguage = voiceLanguageFilter === "all" || voice.language === voiceLanguageFilter;
    const matchesGender = voiceGenderFilter === "all" || voice.gender === voiceGenderFilter;
    const haystack = [voice.name, voice.voiceId, voice.provider, voice.language, voice.gender].join(" ").toLowerCase();
    const matchesSearch = !normalizedVoiceSearch || haystack.includes(normalizedVoiceSearch);
    return matchesLanguage && matchesGender && matchesSearch;
  });

  return (
    <div className="speakSettings">
      <section className="accessCard speakStatusCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><Mic size={18} /></span>
            <div>
              <h3>Scribes Dictation</h3>
              <p>{status.message}</p>
            </div>
          </div>
          <button
            className={`settingsToggle ${settings.whisperEnabled ? "selected" : ""}`}
            aria-label={settings.whisperEnabled ? "Disable Scribes dictation" : "Enable Scribes dictation"}
            onClick={() => void saveSpeakSettingsPatch({ whisperEnabled: !settings.whisperEnabled })}
          >
            <span>{settings.whisperEnabled ? "On" : "Off"}</span>
            <i />
          </button>
        </div>
        <div className="speakShortcutPanel">
          <span className="accessIcon"><Keyboard size={18} /></span>
          <div>
            <small>Shortcut</small>
            <strong>{settings.shortcutLabel}</strong>
          </div>
          <div className="speakStatusPill">{status.running ? `Running${status.pid ? ` #${status.pid}` : ""}` : status.built ? "Ready" : "Not built"}</div>
        </div>
        <div className="scribesModeNotice">
          <strong>{cloudSttSelected ? "Telnyx Cloud STT" : "Local STT"}</strong>
          <span>{cloudSttSelected ? "Requires TELNYX_API_KEY. The current macOS helper uses this path." : "OpenAI Whisper and NVIDIA Parakeet route through the Scribes local STT server."}</span>
        </div>
        <div className="speakActionRow">
          <button className="button secondary" onClick={() => void runWhisperAction("build")} disabled={busyAction !== "" || !status.available}>
            <Download size={14} />
            {busyAction === "build" ? "Building" : "Build Helper"}
          </button>
          <button className="button primary" onClick={() => void runWhisperAction("start")} disabled={busyAction !== "" || !canStart || !settings.whisperEnabled}>
            <Play size={14} />
            {busyAction === "start" ? "Starting" : cloudSttSelected ? "Start Cloud" : "Start Local"}
          </button>
          <button className="button secondary" onClick={() => void runWhisperAction("stop")} disabled={busyAction !== "" || !status.running}>
            <Square size={14} />
            {busyAction === "stop" ? "Stopping" : "Stop"}
          </button>
        </div>
      </section>

      <section className="accessCard speakSettingsCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><SlidersHorizontal size={18} /></span>
            <div>
              <h3>Speech-to-Text</h3>
            </div>
          </div>
        </div>
        <div className="speakSettingsRows">
          <label className="speakSettingField">
            <span>STT Mode</span>
            <select value={settings.sttMode} onChange={(event) => void chooseSttMode(event.target.value as SpeakSettings["sttMode"])}>
              <option value="local">Local</option>
              <option value="telnyx-cloud">Telnyx Cloud</option>
            </select>
          </label>
          <label className="speakSettingField">
            <span>Shortcut Mode</span>
            <select value={settings.shortcutMode} onChange={(event) => void saveSpeakSettingsPatch({ shortcutMode: event.target.value as SpeakSettings["shortcutMode"] })}>
              <option value="hold-fn">Hold fn</option>
              <option value="cmd-shift-l">Cmd+Shift+L</option>
            </select>
          </label>
          <label className="speakSettingField">
            <span>Provider</span>
            <select value={settings.sttProvider} onChange={(event) => void chooseSttProvider(event.target.value as SpeakSettings["sttProvider"])}>
              {localSttSelected && <option value="openai-whisper">OpenAI Whisper</option>}
              {localSttSelected && <option value="nvidia-parakeet">NVIDIA Parakeet</option>}
              {cloudSttSelected && <option value="telnyx">Telnyx Cloud</option>}
            </select>
          </label>
          <label className="speakSettingField">
            <span>Model</span>
            <input value={settings.sttModel} onChange={(event) => setSettings({ ...settings, sttModel: event.target.value })} onBlur={() => void saveSpeakSettingsPatch({ sttModel: settings.sttModel })} />
          </label>
          <label className="speakSettingField">
            <span>Language</span>
            <input value={settings.sttLanguage} onChange={(event) => setSettings({ ...settings, sttLanguage: event.target.value })} onBlur={() => void saveSpeakSettingsPatch({ sttLanguage: settings.sttLanguage })} />
          </label>
          <label className="speakRangeField">
            <span>Silence Threshold</span>
            <input type="range" min="0.005" max="0.2" step="0.005" value={settings.silenceThreshold} onChange={(event) => void saveSpeakSettingsPatch({ silenceThreshold: Number(event.target.value) })} />
            <strong>{settings.silenceThreshold.toFixed(3)}</strong>
          </label>
          <div className="speakToggleRow">
            <span>LLM Cleanup</span>
            <button
              className={`settingsToggle ${settings.llmCleanupEnabled ? "selected" : ""}`}
              aria-label={settings.llmCleanupEnabled ? "Disable LLM cleanup" : "Enable LLM cleanup"}
              onClick={() => void saveSpeakSettingsPatch({ llmCleanupEnabled: !settings.llmCleanupEnabled })}
            >
              <span>{settings.llmCleanupEnabled ? "On" : "Off"}</span>
              <i />
            </button>
          </div>
          <div className="scribesRouteNote">
            <span>{settings.sttEngine}</span>
            <strong>{sttProviderLabel(settings.sttProvider)}</strong>
            <small>{localSttSelected ? "Local transcription runs through the selected allowlisted Scribes model." : "Cloud transcription is gated by TELNYX_API_KEY."}</small>
          </div>
        </div>
      </section>

      <section className="accessCard speakSettingsCard">
        <div className="accessCardHeader">
          <div className="accessCardTitle">
            <span className="accessIcon"><PhoneCall size={18} /></span>
            <div>
              <h3>Text-to-Speech</h3>
            </div>
          </div>
          <button className="button secondary" onClick={() => void loadVoices()} disabled={busyAction !== "" || !cloudTtsSelected}>
            <RefreshCw size={14} />
            {busyAction === "voices" ? "Loading" : "Load Voices"}
          </button>
        </div>
        <div className="speakSettingsRows">
          <label className="speakSettingField">
            <span>TTS Mode</span>
            <select value={settings.ttsMode} onChange={(event) => void chooseTtsMode(event.target.value as SpeakSettings["ttsMode"])}>
              <option value="telnyx-cloud">Telnyx Cloud</option>
              <option value="local">Local</option>
            </select>
          </label>
          <label className="speakSettingField">
            <span>Provider</span>
            <select value={cloudTtsSelected ? settings.ttsProvider : settings.localTtsProvider} onChange={(event) => void saveSpeakSettingsPatch({ ttsMode: "telnyx-cloud", ttsProvider: event.target.value })} disabled={!cloudTtsSelected}>
              {cloudTtsSelected ? <option value="telnyx">Telnyx Cloud</option> : <option value="stub">Pluggable local TTS</option>}
            </select>
          </label>
          <label className="speakSettingField">
            <span>Voice</span>
            {voices.length > 0 ? (
              <select value={settings.ttsVoice} onChange={(event) => void saveSpeakSettingsPatch({ ttsVoice: event.target.value })}>
                {voices.map((voice) => (
                  <option key={voice.voiceId} value={voice.voiceId}>
                    {[voice.name, voice.language, voice.gender].filter(Boolean).join(" - ")}
                  </option>
                ))}
              </select>
            ) : (
              <input value={settings.ttsVoice} onChange={(event) => setSettings({ ...settings, ttsVoice: event.target.value })} onBlur={() => void saveSpeakSettingsPatch({ ttsVoice: settings.ttsVoice })} />
            )}
          </label>
        </div>
        {!cloudTtsSelected && (
          <div className="scribesModeNotice">
            <strong>Local TTS placeholder</strong>
            <span>Plan C keeps this as a pluggable slot; Telnyx Cloud TTS remains the working hosted path.</span>
          </div>
        )}
        <div className="ttsLibraryPanel">
          <div className="ttsLibraryHeader">
            <div>
              <h4>Voice Library</h4>
              <p>Browse hosted voices, play a short sample, then save the voice for Scribes.</p>
            </div>
            <button className="button secondary" type="button" onClick={() => window.open("https://ttslibrary.com/voices", "_blank")}>
              <ExternalLink size={14} />
              TTS Library
            </button>
          </div>
          <div className="ttsLibraryControls">
            <label>
              <span>Library Provider</span>
              <select value={voiceProviderFilter} onChange={(event) => setVoiceProviderFilter(event.target.value)}>
                <option value="telnyx">Telnyx</option>
                <option value="all">All hosted</option>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="minimax">MiniMax</option>
                <option value="rime">Rime</option>
                <option value="resemble">Resemble</option>
                <option value="xai">xAI</option>
                <option value="elevenlabs">ElevenLabs</option>
              </select>
            </label>
            <label>
              <span>Language</span>
              <select value={voiceLanguageFilter} onChange={(event) => setVoiceLanguageFilter(event.target.value)} disabled={voices.length === 0}>
                <option value="all">All languages</option>
                {voiceLanguageOptions.map((language) => <option key={language} value={language}>{language}</option>)}
              </select>
            </label>
            <label>
              <span>Gender</span>
              <select value={voiceGenderFilter} onChange={(event) => setVoiceGenderFilter(event.target.value)} disabled={voices.length === 0}>
                <option value="all">All voices</option>
                {voiceGenderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
              </select>
            </label>
            <label className="ttsLibrarySearch">
              <span>Search</span>
              <div>
                <Search size={15} />
                <input value={voiceSearch} onChange={(event) => setVoiceSearch(event.target.value)} placeholder="Name, provider, language" />
              </div>
            </label>
          </div>
          <label className="ttsSampleText">
            <span>Sample Text</span>
            <textarea value={sampleText} onChange={(event) => setSampleText(event.target.value)} maxLength={320} />
          </label>
          {voices.length > 0 ? (
            <div className="ttsVoiceTable" role="table" aria-label="Hosted TTS voices">
              <div className="ttsVoiceTableHeader" role="row">
                <span role="columnheader">Voice</span>
                <span role="columnheader">Provider</span>
                <span role="columnheader">Language</span>
                <span role="columnheader">Gender</span>
                <span role="columnheader">Actions</span>
              </div>
              <div className="ttsVoiceRows">
                {filteredVoices.slice(0, 80).map((voice) => (
                  <div className={`ttsVoiceRow ${settings.ttsVoice === voice.voiceId ? "selected" : ""}`} role="row" key={voice.voiceId}>
                    <div role="cell">
                      <strong>{voice.name || voice.voiceId}</strong>
                      <small>{voice.voiceId}</small>
                    </div>
                    <span role="cell">{voice.provider || "telnyx"}</span>
                    <span role="cell">{voice.language || "Any"}</span>
                    <span role="cell">{voice.gender || "Voice"}</span>
                    <div className="ttsVoiceActions" role="cell">
                      <button className="button secondary" type="button" onClick={() => void sampleVoice(voice)} disabled={busyAction !== ""}>
                        <Volume2 size={14} />
                        {busyAction === `sample:${voice.voiceId}` ? "Playing" : "Sample"}
                      </button>
                      <button className="button primary" type="button" onClick={() => void useVoice(voice)} disabled={busyAction !== "" || settings.ttsVoice === voice.voiceId}>
                        <Check size={14} />
                        {settings.ttsVoice === voice.voiceId ? "Selected" : "Use"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredVoices.length > 80 && <div className="ttsVoiceLimit">Showing 80 of {filteredVoices.length.toLocaleString()} matches. Narrow the filters to see more.</div>}
              {filteredVoices.length === 0 && <div className="ttsVoiceLimit">No voices match those filters.</div>}
            </div>
          ) : (
            <div className="ttsLibraryEmpty">
              <Volume2 size={18} />
              <span>Load voices to browse and sample the hosted library.</span>
            </div>
          )}
        </div>
      </section>

      {message && <div className="voiceInputStatus" aria-live="polite">{message}</div>}
      {status.lastLogLines.length > 0 && (
        <pre className="speakLogPreview">{status.lastLogLines.join("\n")}</pre>
      )}
    </div>
  );
}

function CredentialGroupCards({
  connectors,
  groups,
  setGroups,
  onSaved,
}: {
  connectors: ConnectorStatus[];
  groups: CredentialGroupStatus[];
  setGroups: (groups: CredentialGroupStatus[]) => void;
  onSaved?: () => Promise<void>;
}) {
  const [credentialDrafts, setCredentialDrafts] = useState<Record<string, string>>({});
  const [savingCredential, setSavingCredential] = useState("");
  const [expandedCredentialId, setExpandedCredentialId] = useState("");
  const [credentialErrors, setCredentialErrors] = useState<Record<string, string>>({});
  const googleWorkspaceConnected = connectors.some((connector) =>
    ["google-drive", "google-calendar"].includes(connector.id) &&
    (connector.status === "connected" || connector.status === "signed_in"),
  );
  const githubConnected = groups.some((group) =>
    group.id === "github" &&
    group.fields.some((field) => ["GITHUB_USER_ACCESS_TOKEN", "GH_TOKEN"].includes(field.name) && field.configured),
  );
  const guruConnected = groups.some((group) =>
    group.id === "guru" &&
    group.fields.some((field) => ["GURU_OAUTH_REFRESH_TOKEN", "GURU_OAUTH_ACCESS_TOKEN"].includes(field.name) && field.configured),
  );
  const pylonConnected = groups.some((group) =>
    group.id === "pylon" &&
    group.fields.some((field) => ["PYLON_MCP_REFRESH_TOKEN", "PYLON_MCP_ACCESS_TOKEN"].includes(field.name) && field.configured),
  );

  function clearCredentialError(groupId: string) {
    setCredentialErrors((current) => {
      if (!current[groupId]) return current;
      const next = { ...current };
      delete next[groupId];
      return next;
    });
  }

  function setCredentialError(groupId: string, message: string) {
    setCredentialErrors((current) => ({ ...current, [groupId]: message }));
  }

  async function saveCredential(groupId: string, name: string) {
    const value = credentialDrafts[name]?.trim();
    if (!value) return;
    setSavingCredential(name);
    clearCredentialError(groupId);
    try {
      const nextCredentials = await linkApi.saveCredential({ name, value });
      setGroups(nextCredentials);
      setCredentialDrafts((current) => ({ ...current, [name]: "" }));
      await onSaved?.();
    } catch (err) {
      setCredentialError(groupId, err instanceof Error ? err.message : "Unable to save credential.");
    } finally {
      setSavingCredential("");
    }
  }

  async function connectGoogleWorkspace() {
    setSavingCredential("GOOGLE_WORKSPACE_AGENT_CONNECTION_ID");
    clearCredentialError("google-workspace");
    try {
      const result = await linkApi.connectGoogleWorkspaceWithSkill();
      setGroups(result.credentials);
      await onSaved?.();
    } catch (err) {
      setCredentialError("google-workspace", err instanceof Error ? err.message : "Google Workspace connection could not be verified.");
    } finally {
      setSavingCredential("");
    }
  }

  async function connectGitHub() {
    setSavingCredential("GITHUB_USER_ACCESS_TOKEN");
    clearCredentialError("github");
    try {
      const result = await linkApi.connectGitHubWithDeviceFlow();
      setGroups(result.credentials);
      await onSaved?.();
    } catch (err) {
      setCredentialError("github", err instanceof Error ? err.message : "GitHub connection could not be verified.");
    } finally {
      setSavingCredential("");
    }
  }

  async function connectGuru() {
    setSavingCredential("GURU_OAUTH_ACCESS_TOKEN");
    clearCredentialError("guru");
    try {
      const result = await linkApi.connectGuruWithOAuth();
      setGroups(result.credentials);
      await onSaved?.();
    } catch (err) {
      setCredentialError("guru", err instanceof Error ? err.message : "Guru connection could not be verified.");
    } finally {
      setSavingCredential("");
    }
  }

  async function connectPylon() {
    setSavingCredential("PYLON_MCP_ACCESS_TOKEN");
    clearCredentialError("pylon");
    try {
      const result = await linkApi.connectPylonWithOAuth();
      setGroups(result.credentials);
      await onSaved?.();
    } catch (err) {
      setCredentialError("pylon", err instanceof Error ? err.message : "Pylon connection could not be verified.");
    } finally {
      setSavingCredential("");
    }
  }

  function managedCredentialAction(groupId: string) {
    if (groupId === "google-workspace") {
      return {
        connected: googleWorkspaceConnected,
        description: "Link opens Google sign-in and verifies Calendar and Contacts access.",
        savingKey: "GOOGLE_WORKSPACE_AGENT_CONNECTION_ID",
        onConnect: connectGoogleWorkspace,
      };
    }
    if (groupId === "github") {
      return {
        connected: githubConnected,
        description: "Link pairs GitHub and stores the read-only app token securely.",
        savingKey: "GITHUB_USER_ACCESS_TOKEN",
        onConnect: connectGitHub,
      };
    }
    if (groupId === "guru") {
      return {
        connected: guruConnected,
        description: "Link opens Guru OAuth and stores the refresh token securely.",
        savingKey: "GURU_OAUTH_ACCESS_TOKEN",
        onConnect: connectGuru,
      };
    }
    if (groupId === "pylon") {
      return {
        connected: pylonConnected,
        description: "Link opens Pylon OAuth and stores the MCP refresh token securely.",
        savingKey: "PYLON_MCP_ACCESS_TOKEN",
        onConnect: connectPylon,
      };
    }
    return null;
  }

  return (
    <>
      {groups.map((group) => {
        const expanded = expandedCredentialId === group.id;
        const visibleFields = group.id === "guru" || group.id === "pylon" ? [] : visibleCredentialFields(group);
        const connected = credentialGroupConnected(group, connectors, googleWorkspaceConnected, visibleFields);
        const managedAction = managedCredentialAction(group.id);

        return (
          <section className={`credentialCard ${expanded ? "expanded" : ""}`} key={group.id}>
            <button
              className="credentialSummary"
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpandedCredentialId(expanded ? "" : group.id)}
            >
              <span className={`credentialIcon credentialIcon-${group.id}`} aria-hidden="true">
                <CredentialLogoMark groupId={group.id} />
              </span>
              <span className="credentialSummaryText">
                <strong>{group.label}</strong>
              </span>
              <span className="credentialSummaryStatus">
                <span className={`credentialStatusIcon ${connected ? "connected" : "disconnected"}`} aria-label={connected ? "Connected" : "Not connected"}>
                  {connected ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
                </span>
              </span>
              <span className="credentialChevron" aria-hidden="true"><ChevronDown size={22} /></span>
            </button>

		            {expanded && (
		              <div className="credentialFields">
	                  {credentialErrors[group.id] && <div className="errorBanner">{credentialErrors[group.id]}</div>}
		                {managedAction ? (
		                  <div className="credentialManagedSkillConnect">
		                    <div>
		                      <strong>{group.label}</strong>
		                      <span>{limitWords(managedAction.description)}</span>
		                    </div>
		                    <button className={`button secondary ${managedAction.connected ? "connected" : ""}`} onClick={() => void managedAction.onConnect()} disabled={savingCredential === managedAction.savingKey || managedAction.connected}>
		                      {savingCredential === managedAction.savingKey ? "Connecting" : managedAction.connected ? "Connected" : "Connect"}
		                    </button>
		                  </div>
		                ) : (
		                  <>
		                    {visibleFields.length === 0 && (
		                      <div className="credentialDescription">
		                        <strong>{group.label}</strong>
		                        <span>{limitWords(credentialHelpCopy(group))}</span>
		                      </div>
		                    )}
		                    {visibleFields.map((field) => (
		                      <div className="credentialRow" key={field.name}>
                            <div className="credentialRowInfo">
                              <strong>{credentialFieldLabel(field.name)}</strong>
                              <span>{limitWords(credentialHelpCopy(group))}</span>
                            </div>
                            <input
                              type={isSecretCredentialField(field.name) ? "password" : "text"}
                              value={credentialDrafts[field.name] ?? ""}
                              onChange={(event) => setCredentialDrafts((current) => ({ ...current, [field.name]: event.target.value }))}
                              placeholder={field.configured ? `${field.source === "env" ? "Set by env" : "Connected"} - enter a new value to update` : "Not connected"}
                            />
                            <button className={`button secondary ${field.configured && !credentialDrafts[field.name]?.trim() ? "connected" : ""}`} onClick={() => void saveCredential(group.id, field.name)} disabled={savingCredential === field.name || !credentialDrafts[field.name]?.trim()}>
                              {savingCredential === field.name ? "Connecting" : field.configured && !credentialDrafts[field.name]?.trim() ? "Connected" : "Connect"}
                            </button>
                          </div>
                        ))}
                      </>
		                )}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

function CredentialLogoMark({ groupId }: { groupId: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const credentialLogoSources: Record<string, { src: string; alt: string }> = {
    github: { src: `${import.meta.env.BASE_URL}credential-logos/github-logo.jpeg`, alt: "GitHub" },
    "google-workspace": { src: `${import.meta.env.BASE_URL}credential-logos/google-logo.jpeg`, alt: "Google" },
    litellm: { src: `${import.meta.env.BASE_URL}credential-logos/litellm-logo.png`, alt: "LiteLLM" },
    telnyx: { src: `${import.meta.env.BASE_URL}credential-logos/telnyx-logo.jpeg`, alt: "Telnyx" },
  };
  const logo = credentialLogoSources[groupId];
  if (logo && !imageFailed) {
    return <img className="credentialLogoImage" src={logo.src} alt={logo.alt} onError={() => setImageFailed(true)} />;
  }
  if (groupId === "google-workspace") {
    return <span className="credentialGoogleMark" aria-label="Google">G</span>;
  }
  if (groupId === "github") {
    return <span className="credentialGitHubMark" aria-label="GitHub">GH</span>;
  }
  if (groupId === "litellm") {
    return <span className="credentialLiteLlmMark" aria-label="LiteLLM">LLM</span>;
  }
  if (groupId === "telnyx") {
    return <span className="credentialTelnyxMark" aria-label="Telnyx">T</span>;
  }
  if (groupId === "pylon") {
    return <span className="credentialTelnyxMark" aria-label="Pylon">PY</span>;
  }
  return <Settings size={20} />;
}

function visibleCredentialFields(group: CredentialGroupStatus) {
  return group.fields.filter((field) => {
    if (group.id === "google-workspace") return false;
    if (group.id === "github") return false;
    if (group.id === "guru" && ["GURU_OAUTH_ACCESS_TOKEN", "GURU_OAUTH_REFRESH_TOKEN", "GURU_OAUTH_TOKEN_EXPIRES_AT", "GURU_OAUTH_USER_ID"].includes(field.name)) return false;
    if (group.id === "telnyx" && field.name !== "TELNYX_API_KEY") return false;
    return true;
  });
}

function credentialGroupConnected(group: CredentialGroupStatus, connectors: ConnectorStatus[], googleWorkspaceConnected: boolean, visibleFields = visibleCredentialFields(group)) {
  if (group.id === "google-workspace") return googleWorkspaceConnected;
  if (group.id === "github") return group.fields.some((field) => ["GITHUB_USER_ACCESS_TOKEN", "GH_TOKEN"].includes(field.name) && field.configured);
  if (group.id === "guru") return group.fields.some((field) => ["GURU_OAUTH_REFRESH_TOKEN", "GURU_OAUTH_ACCESS_TOKEN"].includes(field.name) && field.configured);
  const matchingConnector = connectors.find((connector) => connector.id === group.id);
  if (matchingConnector?.status === "connected" || matchingConnector?.status === "signed_in") return true;
  return visibleFields.length > 0 && visibleFields.every((field) => field.configured);
}

function credentialHelpCopy(group: CredentialGroupStatus) {
  if (group.id === "litellm") return "Optional managed gateway and frontier BYO settings. Local Ollama mode does not require a cloud key; Telnyx BYO uses the Telnyx API key group.";
  return group.help;
}

function credentialFieldLabel(name: string) {
  if (name === "LITELLM_API_KEY") return "Managed Gateway API Key";
  if (name === "LITELLM_BASE_URL") return "Managed Gateway URL";
  if (name === "LITELLM_MODEL") return "LiteLLM Model";
  if (name === "TELNYX_INFERENCE_BASE_URL") return "Telnyx Inference Base URL";
  if (name === "ANTHROPIC_API_KEY") return "Anthropic API Key";
  if (name === "GOOGLE_WORKSPACE_AGENT_CONNECTION_ID") return "Google Workspace Agent Connection";
  if (name === "GOG_ACCOUNT") return "GOG Account";
  if (name === "GOG_KEYRING_PASSWORD") return "GOG Keyring Password";
  if (name === "GITHUB_APP_CLIENT_ID") return "GitHub App Client ID";
  if (name === "GITHUB_USER_ACCESS_TOKEN") return "GitHub App User Token";
  if (name === "GH_TOKEN") return "GitHub Token";
  if (name === "INTERCOM_ACCESS_TOKEN") return "Intercom Access Token";
  if (name === "MINTLIFY_API_KEY") return "Mintlify API Key";
  if (name === "MINTLIFY_DOMAIN") return "Mintlify Docs Domain";
  if (name === "GURU_OAUTH_CLIENT_ID") return "Guru OAuth Client ID";
  if (name === "GURU_OAUTH_CLIENT_SECRET") return "Guru OAuth Client Secret";
  if (name === "GURU_OAUTH_SCOPE") return "Guru OAuth Scope";
  if (name === "GURU_OAUTH_REDIRECT_URI") return "Guru OAuth Redirect URI";
  if (name === "GURU_OAUTH_ACCESS_TOKEN") return "Guru OAuth Access Token";
  if (name === "GURU_OAUTH_REFRESH_TOKEN") return "Guru OAuth Refresh Token";
  if (name === "GURU_OAUTH_TOKEN_EXPIRES_AT") return "Guru OAuth Token Expires At";
  if (name === "GURU_OAUTH_USER_ID") return "Guru OAuth User";
  if (name === "PYLON_MCP_URL") return "Pylon MCP URL";
  if (name === "PYLON_MCP_CLIENT_ID") return "Pylon OAuth Client ID";
  if (name === "PYLON_MCP_ACCESS_TOKEN") return "Pylon MCP Access Token";
  if (name === "PYLON_MCP_REFRESH_TOKEN") return "Pylon MCP Refresh Token";
  if (name === "PYLON_MCP_TOKEN_EXPIRES_AT") return "Pylon MCP Token Expires At";
  return name;
}

function isSecretCredentialField(name: string) {
  return name !== "GITHUB_APP_CLIENT_ID" && /TOKEN|KEY|SECRET|PASSWORD/i.test(name);
}

function isRequiredCredentialGroup(group: CredentialGroupStatus) {
  return ["telnyx", "github", "google-workspace", "guru", "pylon", "intercom-help-center", "mintlify-developer-docs"].includes(group.id);
}

function compareCredentialGroups(left: CredentialGroupStatus, right: CredentialGroupStatus) {
  return left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
}

function fallbackAiModelRoutes(): AiModelRoute[] {
  return [
    {
      id: "auto/ask-before-cloud",
      modelName: "auto/ask-before-cloud",
      label: "Auto: ask before cloud",
      provider: "local",
      dataBoundary: "local",
      targetModel: "llama3.2",
      description: "Default local-first route. It does not silently fall back to cloud.",
      available: true,
      default: true,
    },
    {
      id: "auto/local-only",
      modelName: "auto/local-only",
      label: "Auto: local only",
      provider: "local",
      dataBoundary: "local",
      targetModel: "llama3.2",
      description: "Only uses the local Ollama-compatible model.",
      available: true,
    },
  ];
}

function dataBoundaryLabel(boundary?: AiModelRoute["dataBoundary"]) {
  if (boundary === "telnyx-cloud") return "Telnyx Cloud";
  if (boundary === "frontier-byo") return "Frontier BYO";
  if (boundary === "self-hosted") return "Self-hosted";
  return "Local";
}

function sortAgents(agents: AgentSummary[], sortMode: "az" | "za" | "status") {
  return [...agents].sort((left, right) => {
    if (sortMode === "status") {
      const statusCompare = `${left.status} ${left.available}`.localeCompare(`${right.status} ${right.available}`, undefined, { sensitivity: "base" });
      if (statusCompare !== 0) return statusCompare;
    }
    const nameCompare = left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base" });
    return sortMode === "za" ? -nameCompare : nameCompare;
  });
}

function sortConnectors(connectors: ConnectorStatus[], sortMode: "az" | "za" | "status") {
  return [...connectors].sort((left, right) => {
    if (sortMode === "status") {
      const statusCompare = `${left.status} ${left.mode}`.localeCompare(`${right.status} ${right.mode}`, undefined, { sensitivity: "base" });
      if (statusCompare !== 0) return statusCompare;
    }
    const nameCompare = left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
    return sortMode === "za" ? -nameCompare : nameCompare;
  });
}

function sortTools(tools: ToolMetadata[], sortMode: "az" | "za" | "status") {
  return [...tools].sort((left, right) => {
    if (sortMode === "status") {
      const statusCompare = `${left.riskLevel} ${left.approvalRequired}`.localeCompare(`${right.riskLevel} ${right.approvalRequired}`, undefined, { sensitivity: "base" });
      if (statusCompare !== 0) return statusCompare;
    }
    const nameCompare = left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
    return sortMode === "za" ? -nameCompare : nameCompare;
  });
}

function sortHostedAgents(agents: HostedAgentSummary[], sortMode: "az" | "za" | "status") {
  return [...agents].sort((left, right) => {
    if (sortMode === "status") {
      const statusCompare = `${left.status} ${left.type}`.localeCompare(`${right.status} ${right.type}`, undefined, { sensitivity: "base" });
      if (statusCompare !== 0) return statusCompare;
    }
    const nameCompare = left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base" });
    return sortMode === "za" ? -nameCompare : nameCompare;
  });
}

function agentControlPlaneLoadMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "");
  const stripped = raw
    .replace(/^Error invoking remote method 'link:list-hosted-agents':\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .trim();
  if (/fetch failed|network request failed|not reachable|timed out|AbortError/i.test(stripped)) {
    return stripped || "Agent Control Plane is not reachable. Connect to the Telnyx VPN, verify the service URL in Settings, then retry.";
  }
  return stripped || "Unable to load Agent Control Plane agents.";
}

function workboardAgentRuntimeType(type?: string): "hermes" | "openclaw" {
  return String(type ?? "").toLowerCase().includes("hermes") ? "hermes" : "openclaw";
}

function formatVisibilityLabel(visibility: string) {
  if (visibility.toLowerCase() === "internal") return "Internal";
  return formatStatusLabel(visibility);
}

function CredentialSection({ title, groups, children }: { title: string; groups: CredentialGroupStatus[]; children: ReactNode }) {
  if (groups.length === 0) return null;
  return (
    <section className="credentialSection">
      {title && (
        <div className="credentialSectionHeader">
          <span>{title}</span>
        </div>
      )}
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

function limitWords(value: string, maxWords = 12) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function agentTypeLabel(agent: AgentSummary) {
  const searchable = `${agent.source} ${agent.type} ${agent.origin} ${agent.capabilities.join(" ")}`.toLowerCase();
  if (searchable.includes("mcp") || searchable.includes("aida")) return "MCP";
  if (searchable.includes("slack")) return "Slack";
  if (searchable.includes("api") || searchable.includes("control-plane") || searchable.includes("discovery")) return "API";
  return "Agent";
}

function agentSquadLabel(agent: AgentSummary) {
  return agent.squad || agent.audience || formatVisibilityLabel(agent.visibility);
}

function formatSourceLabel(source: AgentSummary["source"]) {
  if (source === "agent-control-plane") return "Agent Control Plane";
  if (source === "a2a-discovery") return "Directory";
  if (source === "aida") return "AIDA";
  if (source === "self-hosted") return "Self-hosted";
  return formatStatusLabel(source);
}

function connectorTypeLabel(connector: ConnectorStatus) {
  const searchable = `${connector.id} ${connector.name} ${connector.category} ${connector.description} ${connector.requiredAccess.join(" ")}`.toLowerCase();
  if (searchable.includes("mcp") || searchable.includes("aida")) return "MCP";
  if (searchable.includes("oauth") || searchable.includes("okta")) return "OAuth";
  if (searchable.includes("docs") || searchable.includes("documentation") || searchable.includes("support center")) return "Docs";
  if (searchable.includes("api") || searchable.includes("token") || searchable.includes("key")) return "API";
  return "Plugin";
}

function connectorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "PL";
}

function connectorModeLabel(connector: ConnectorStatus) {
  if (connector.mode === "env") return "environment configured";
  if (connector.mode === "saved") return "saved in Settings";
  if (connector.mode === "okta") return "Okta session present";
  if (connector.mode === "live") return "live adapter";
  return `needs ${connector.requiredAccess.join(", ")}`;
}

function DesignSystemView({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState<"colors" | "components" | "surfaces" | "typography" | "agents">("components");
  const colorTokens = [
    ["Background", "--bg"],
    ["Surface", "--surface"],
    ["Soft surface", "--surface-soft"],
    ["Raised surface", "--surface-raised"],
    ["Text", "--text"],
    ["Muted", "--text-muted"],
    ["Faint text", "--text-faint"],
    ["Border", "--border"],
    ["Soft border", "--border-soft"],
    ["Accent", "--accent"],
    ["Accent soft", "--accent-soft"],
    ["Accent ink", "--accent-ink"],
    ["Success", "--success"],
    ["Warning", "--warning"],
    ["Danger", "--danger"],
    ["Info", "--info"],
    ["Skill", "--skill"],
    ["Toggle background", "--toggle-off-bg"],
    ["Toggle border", "--toggle-off-border"],
    ["Toggle thumb", "--toggle-off-thumb"],
  ];
  const designTabHeading = {
    colors: ["Colors", Sun],
    components: ["Components", Component],
    surfaces: ["Surfaces", LayoutDashboard],
    typography: ["Typography", FileText],
    agents: ["Agents", Bot],
  } satisfies Record<typeof tab, [string, AppIcon]>;
  void designTabHeading;
  const agentInstructionPreview = buildLinkDesignSystemInstruction()
    .split("\n")
    .filter(Boolean)
    .slice(0, 8);
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
        {([
          ["colors", "Colors", Sun],
          ["components", "Components", Component],
          ["surfaces", "Surfaces", LayoutDashboard],
          ["typography", "Typography", FileText],
          ["agents", "Agents", Bot],
        ] as const).map(([item, label, Icon]) => (
          <button key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>
            <Icon size={15} />
            {label}
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
          <Panel title="Copy rules">
            <div className="designSpecList">
                  <p>Use direct noun labels for tabs and commands: Credentials, Dark Mode, Design System, Chat, Phone.</p>
              <p>Prefer concise operational text over marketing copy. Detail belongs inside rows, panels, and empty states.</p>
              <p>Keep status labels concrete: Connected, Connect, Configure, Needs setup, Approval required.</p>
            </div>
          </Panel>
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
          <Panel title="Toolbar actions">
            <div className="designToolbar">
              <button className="iconButton" aria-label="Search"><Search size={15} /></button>
              <button className="iconButton" aria-label="Refresh"><RefreshCw size={15} /></button>
              <button className="button secondary"><Plus size={15} /> Add</button>
              <button className="button primary"><Upload size={15} /> Build</button>
            </div>
          </Panel>
          <Panel title="Form controls">
            <div className="componentField">
              <label className="field">
                <span>Label</span>
                <input value="Compact input" readOnly />
              </label>
              <label className="assistantDesignSystemOption demoDesignToggle">
                <span>
                  <Grid2X2 size={14} />
                  <strong>Use Link design system</strong>
                  <small>Session scoped app-build setting.</small>
                </span>
                <input type="checkbox" checked readOnly />
              </label>
            </div>
          </Panel>
          <Panel title="Status rows">
            <div className="designSpecRows">
              <div><StatusDot tone="success" /><strong>Google Workspace</strong><small>Connected through managed OAuth skill.</small></div>
              <div><StatusDot tone="warning" /><strong>Telnyx Inference</strong><small>Needs API key before live agents can run.</small></div>
            </div>
          </Panel>
          <Panel title="Tables">
            <div className="designSpecList">
              <p>Middle-section tables use the shared chatSessionRows/chatResultRow pattern: 18px row side padding, 14px column gaps, 58px rows, 48px uppercase headers, and an optional 44px trailing action column.</p>
              <p>Header labels are left-aligned to the body text in the same column. Rows are clickable as a whole, with the trailing arrow turning primary on hover in light and dark mode.</p>
            </div>
          </Panel>
        </div>
      )}

      {tab === "surfaces" && (
        <div className="designSection">
          <Panel title="Current app layout">
            <div className="surfaceAnatomy">
              <div><strong>Titlebar</strong><small>30px draggable app chrome with centered product name.</small></div>
              <div><strong>Rail</strong><small>54px collapsed or 176px expanded icon navigation with 40px controls.</small></div>
              <div><strong>Content</strong><small>Scrollable page surface with a compact header, full-width tab rows, and dense panels.</small></div>
              <div><strong>Assistant</strong><small>Right panel uses the same top inset, tab styling, cards, forms, and fixed composer rules.</small></div>
            </div>
          </Panel>
          <Panel title="Surface rules">
            <div className="designSpecGrid">
              <div><strong>Navigation</strong><p>Use icon plus label in top tab strips. Keep selected tabs white in light mode and raised neutral in dark mode.</p></div>
              <div><strong>Panels</strong><p>Use panels for bounded tools, repeated rows, and demos. Avoid nested cards and decorative section wrappers.</p></div>
              <div><strong>Header actions</strong><p>Primary actions in page headers and section headers use the shared 40px top-control height.</p></div>
              <div><strong>Forms</strong><p>Group credentials and setup flows by backend capability. Keep save actions close to the field they affect.</p></div>
              <div><strong>Phone</strong><p>Keep telephony controls stable in size. Dialer keys, contact actions, and call buttons should not shift on state changes.</p></div>
            </div>
          </Panel>
        </div>
      )}

      {tab === "agents" && (
        <div className="designSection">
          <Panel title="Embedded app contract">
            <div className="designSpecGrid">
              <div><strong>Intent</strong><p>Generated apps should read as Link tools inside the main browser surface, with the workflow visible immediately.</p></div>
              <div><strong>Tokens</strong><p>Use Link CSS variables for surfaces, text, borders, accent, status tones, and the 14px/40px layout rhythm.</p></div>
              <div><strong>Controls</strong><p>Use icon buttons for tools, tabs for views, segmented controls for modes, toggles for binary settings, and compact forms.</p></div>
              <div><strong>Avoid</strong><p>No landing pages, nested cards, oversized panel type, decorative gradients, or standalone product chrome.</p></div>
            </div>
          </Panel>
          <Panel title="Agent instruction preview">
            <div className="agentInstructionPreview">
              {agentInstructionPreview.map((line) => <p key={line}>{line}</p>)}
            </div>
          </Panel>
          <Panel title="Theme bridge">
            <pre className="designCodeBlock">{`const params = new URLSearchParams(location.search);
const applyLinkTheme = ({ theme, accent }) => {
  if (theme) document.documentElement.dataset.theme = theme;
  if (accent) document.documentElement.style.setProperty("--accent", accent);
};
applyLinkTheme({ theme: params.get("theme"), accent: params.get("accent") });
window.addEventListener("message", (event) => {
  if (event.data?.type === "telnyx-link-theme") applyLinkTheme(event.data);
});`}</pre>
          </Panel>
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

function EmptyState({ title, body, icon: Icon = List }: { title: string; body: ReactNode; icon?: AppIcon }) {
  return (
    <section className="content emptyState">
      <Icon size={36} />
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

function randomIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `link-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatGatewayMode(mode: string) {
  if (mode === "local_fallback") return "Local ledger";
  if (mode === "preview") return "Preview ledger";
  return "Hosted gateway";
}

function formatTransportLabel(transport: string) {
  if (transport === "google_chat") return "Google Chat";
  if (transport === "a2a") return "A2A";
  if (transport === "slack") return "Slack";
  return "Auto";
}

function gatewayStatusTone(status: string): "success" | "warning" | "danger" | "default" {
  if (status === "delivered") return "success";
  if (status === "failed" || status === "rejected") return "danger";
  if (status === "partial" || status === "retryable_failure" || status === "queued" || status === "accepted") return "warning";
  return "default";
}

function formatStatusLabel(status: string) {
  if (status === "todo") return "To Do";
  if (status === "in_progress") return "In Progress";
  if (status === "needs_review") return "Needs Review";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitInputList(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeEdgeDeploySlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);
}

function suggestEdgeDeploySlugFromPrompt(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!normalized) return "";
  const specificMatches = ["snake", "tetris", "pong", "chess", "calculator", "dashboard", "crm", "timer", "todo"];
  const matched = specificMatches.find((word) => normalized.split(/\s+/).includes(word));
  if (matched) return matched;
  const stopWords = new Set([
    "a", "an", "and", "app", "basic", "build", "create", "easy", "for", "game", "in", "it", "make", "me", "our", "small", "the", "to", "web", "with",
  ]);
  return normalizeEdgeDeploySlug(
    normalized
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 3)
      .join("-"),
  );
}

function inferEdgePreviewSlugFromText(value: string) {
  const normalized = value.toLowerCase();
  const sourceSubdirMatch = normalized.match(/sourceSubdir=([\w/-]+)/i) || normalized.match(/source_subdir[:=]\s*`?([\w/-]+)/i);
  const sourceSubdir = sourceSubdirMatch?.[1]?.split("/").filter(Boolean).pop();
  if (sourceSubdir) return normalizeEdgeDeploySlug(sourceSubdir);
  const edgeAppsMatch = normalized.match(/edge-apps\/([\w-]+)/);
  if (edgeAppsMatch?.[1]) return normalizeEdgeDeploySlug(edgeAppsMatch[1]);
  const appsMatch = normalized.match(/apps\/([\w-]*snake[\w-]*)/);
  if (appsMatch?.[1]) return "snake";
  if (/\bsnake\b/.test(normalized)) return "snake";
  return suggestEdgeDeploySlugFromPrompt(value);
}

function inferEdgePreviewSlugFromSession(session?: ChatSession) {
  if (!session) return "";
  const messageText = [...session.messages].reverse().map((message) => message.content).join("\n");
  return inferEdgePreviewSlugFromText(`${messageText}\n${session.title}`);
}

function messageHasEdgePreviewCandidate(message: ChatMessage) {
  return /Preview app|Edge Compute|static browser app|link-app\.ya?ml|sourceSubdir|edge-apps\/|deployable Telnyx Edge/i.test(message.content);
}

function buildLinkDesignSystemInstruction() {
  return [
    "Link design system instruction: build this as an embedded Link tool, not a standalone marketing site.",
    "The app will run in Link's main browser surface and should look seamless with the shell.",
    "",
    "Use these CSS custom properties as the public contract:",
    "--bg, --surface, --surface-soft, --surface-raised, --text, --text-muted, --text-faint, --border, --border-soft, --accent, --accent-soft, --accent-ink, --success, --warning, --danger, --info, --skill.",
    "Use --app-top-inset: 14px, --app-bottom-inset: 14px, --top-row-gap: 14px, --top-control-height: 40px, and 8px panel/card radius.",
    "Default light values should match Link: #f7f6f4 background, #ffffff surface, #20201f text, #dedbd7 border, #00e3aa accent.",
    "Support dark mode with [data-theme=\"dark\"] and neutral surfaces: #151515 background, #20201f surface, #f4f1ec text, #3b3936 border.",
    "",
    "Use compact operational layouts: full-width canvas, dense panels, icon-led buttons, tabs for views, segmented controls for modes, toggles for binary settings, and stable 32px controls or 40px header actions.",
    "For middle-section tables, use the standard Link table rhythm: 18px row side padding, 14px column gaps, 58px rows, 48px uppercase headers, left-aligned header/body columns, whole-row click targets, and a 44px trailing action column when an arrow is needed.",
    "Avoid landing-page heroes, nested cards, decorative gradients/orbs, oversized type inside panels, and layouts that depend on a single hue palette.",
    "Keep generated tools first-screen useful: show the actual app workflow in the main surface immediately.",
    "",
    "Add a small runtime theme bridge: read theme and accent from URLSearchParams, apply document.documentElement.dataset.theme, set --accent/--accent-soft/--accent-ink when provided, and listen for postMessage events with type \"telnyx-link-theme\" carrying { theme, accent }.",
  ].join("\n");
}

function buildEdgeAppSystemInstruction(slug: string, useLinkDesignSystem = false) {
  const appSlug = slug || "<choose-a-unique-url-slug>";
  return [
    "Hidden Build app workflow: use the user's visible message as the product requirements. Do not show or restate this implementation checklist unless the user asks for deployment details.",
    "",
    `Build and prepare a static web app for Telnyx Edge Compute using local app slug "${appSlug}".`,
    "",
    "Do not only print files. Create or update the local app source folder and manifest.",
    "",
    "Use this local source layout:",
    `- sourceSubdir=edge-apps/${appSlug}`,
    "- create link-app.yml in that folder",
    "- build output must be dist",
    "- use a static browser app unless the request requires a backend",
    "",
    "Required steps:",
    "1. Create the app files locally.",
    "2. Create link-app.yml with name, slug, sourceRepo, sourceRef, sourceSubdir, installCommand, buildCommand, outputDir, and environment=dev.",
    "3. Run install/build checks locally.",
    "4. Verify dist exists.",
    "5. Report the local folder path and tell me to click Preview app in the Edge card before deploying.",
    "",
    "Default deploy values:",
    "sourceRepo=https://github.com/team-telnyx/link",
    "sourceRef=main",
    `sourceSubdir=edge-apps/${appSlug}`,
    "installCommand=npm install",
    "buildCommand=npm run build",
    "outputDir=dist",
    "environment=dev",
    useLinkDesignSystem ? buildLinkDesignSystemInstruction() : "",
  ].filter(Boolean).join("\n");
}

function edgeDeployStageLabel(stage: EdgeDeployStage, slug: string) {
  if (stage === "needs_url") return "Send an app request first, then preview the generated app.";
  if (stage === "previewing") return `Building a local preview from edge-apps/${slug}.`;
  if (stage === "preview_ready") return "Preview is ready. Test it here, then deploy when it looks right.";
  if (stage === "selecting_folder") return `Looking for edge-apps/${slug}. If it is missing, choose the generated app folder.`;
  if (stage === "deploying") return `Installing, building, and deploying ${slug} to dev edge. This can take a minute.`;
  if (stage === "deployed") return "Deployment complete.";
  if (stage === "failed") return "Deployment failed. Try again or check Edge auth.";
  return slug ? "Ready to preview the generated app." : "Send a normal app request, then preview it here.";
}

function edgeDeployButtonBusyLabel(stage: EdgeDeployStage) {
  if (stage === "previewing") return "Building preview";
  if (stage === "selecting_folder") return "Finding folder";
  if (stage === "deploying") return "Deploying";
  return "Working";
}

function edgeDeployElapsedSeconds(startedAt: number, tick: number) {
  void tick;
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

function edgeDeployProgressPercent(startedAt: number, tick: number) {
  const elapsed = edgeDeployElapsedSeconds(startedAt, tick);
  if (elapsed < 4) return 14;
  if (elapsed < 12) return 30;
  if (elapsed < 30) return 48;
  if (elapsed < 55) return 68;
  if (elapsed < 85) return 84;
  return 92;
}

function edgeDeployProgressStepLabel(startedAt: number, tick: number) {
  const elapsed = edgeDeployElapsedSeconds(startedAt, tick);
  if (elapsed < 4) return "Checking URL and local app folder";
  if (elapsed < 12) return "Preparing the local app folder";
  if (elapsed < 30) return "Installing dependencies if needed";
  if (elapsed < 55) return "Installing dependencies and building the app";
  if (elapsed < 85) return "Publishing to Telnyx Edge Compute if deploying";
  return "Still deploying. Large builds or fresh auth can take a bit longer.";
}

function edgeDeployElapsedLabel(startedAt: number, tick: number) {
  const elapsed = edgeDeployElapsedSeconds(startedAt, tick);
  if (elapsed < 1) return "just started";
  if (elapsed < 60) return `${elapsed}s elapsed`;
  return `${Math.floor(elapsed / 60)}m ${String(elapsed % 60).padStart(2, "0")}s elapsed`;
}

function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function attachmentDisplayLabel(attachment: ChatAttachment) {
  const kind = attachment.type === "image" ? "image" : attachment.type === "text" ? "text" : "file";
  return `${attachment.name} (${kind}, ${formatAttachmentSize(attachment.size)})`;
}

function buildAttachmentContext(attachments: ChatAttachment[]) {
  if (attachments.length === 0) return "";
  return [
    "Attached local files from the user:",
    ...attachments.map((attachment, index) => {
      const lines = [
        `${index + 1}. ${attachmentDisplayLabel(attachment)}`,
        `Path: ${attachment.path}`,
        `MIME type: ${attachment.mimeType}`,
      ];
      if (attachment.content) {
        lines.push(
          attachment.truncated ? "Content preview (truncated):" : "Content:",
          "```",
          attachment.content,
          "```",
        );
      } else if (attachment.dataUrl) {
        lines.push(`Image data URL: ${attachment.dataUrl}`);
      } else if (attachment.skippedReason) {
        lines.push(`Content unavailable: ${attachment.skippedReason}`);
      }
      return lines.join("\n");
    }),
  ].join("\n\n");
}

function formatPublishedAppType(type: LinkPublishedAppType) {
  return type === "mcp_app" ? "MCP app" : "Web app";
}

function publisherBadgeTone(status: LinkPublishedAppStatus): "success" | "warning" | "danger" | "default" {
  if (status === "deployed" || status === "approved") return "success";
  if (status === "rejected" || status === "failed" || status === "deprecated") return "danger";
  if (status === "submitted" || status === "building" || status === "preview") return "warning";
  return "default";
}

function isPublishedAppOpenable(app: LinkPublishedApp): boolean {
  return ["preview", "approved", "deployed"].includes(app.status) && Boolean(app.vpnUrl || app.deployedUrl || app.previewUrl);
}

function isEdgeHostedPublishedApp(app: LinkPublishedApp): boolean {
  return [app.deployedUrl, app.previewUrl, app.vpnUrl]
    .filter((url): url is string => Boolean(url))
    .some((url) => {
      try {
        const hostname = new URL(url).hostname;
        return approvedPublishedAppHostSuffixes.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix));
      } catch {
        return false;
      }
    });
}

function formatPublisherResult(result: LinkAppPublishResult) {
  return JSON.stringify({
    mode: result.mode,
    message: result.message,
    app: result.app.name,
    status: result.app.status,
    source: [result.app.sourceRepo, result.app.sourceRef, result.app.sourceSubdir].filter(Boolean).join(" / "),
  }, null, 2);
}

function formatModelLabel(model: string) {
  if (model === "mock-link-runtime") return "Local fallback";
  return model;
}

function assistantDisplayName(name?: string) {
  if (!name || name === "Telnyx AI Assistant") return "Link";
  return name;
}

function sessionSelectedAgentName(session: ChatSession) {
  const selectedAgentPattern = /Selected Link chat agent:\s*([^.\n]+)/i;
  return [...session.messages]
    .reverse()
    .map((message) => selectedAgentPattern.exec(message.content)?.[1]?.trim())
    .find((name): name is string => Boolean(name));
}

function formatChatAgentName(name: string) {
  return name.split(" / ")[0]?.trim() || name;
}

type ChatSessionType = {
  id: "general" | "task" | "make-skill" | "build-app" | "email-draft";
  label: string;
};

function classifyChatSessionType(session: ChatSession): ChatSessionType {
  const transcript = [
    session.title,
    ...session.messages.flatMap((message) => [
      message.content,
      ...(message.artifacts ?? []).map((artifact) => `${artifact.title} ${artifact.filename}`),
    ]),
  ].join(" ").toLowerCase();

  if (/\b(make|create|write|generate)\s+(a\s+)?skill\b|\bskill\.md\b|\bnew skill\b/.test(transcript)) {
    return { id: "make-skill", label: "Make skill" };
  }
  if (/\bbuild app\b|\bapp builder\b|\bedge app\b|\bedge compute\b|\bpreview app\b|\bdeploy\b|\bapidev\.telnyx\.com\b/.test(transcript)) {
    return { id: "build-app", label: "Build app" };
  }
  if (/\b(draft|compose|write)\s+(an?\s+)?email\b|\bgmail\b|\binbox\b/.test(transcript)) {
    return { id: "email-draft", label: "Email draft" };
  }
  if (session.task || /^task:/i.test(session.title) || /\b(workboard|todo|to-do|in progress|done task)\b/.test(transcript)) {
    return { id: "task", label: "Task" };
  }
  return { id: "general", label: "General" };
}

function chatSessionTypeSortRank(type: string) {
  const rank = ["general", "task", "make-skill", "build-app", "email-draft"].indexOf(type);
  return rank === -1 ? 99 : rank;
}

function compactRelativeTime(value?: string) {
  const timestamp = value ? Date.parse(value) : NaN;
  if (Number.isNaN(timestamp)) return "";
  const diff = Math.max(0, Date.now() - timestamp);
  if (diff < 60_000) return "1m";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

function SenderName({ name }: { name: string }) {
  return (
    <span className="assistantSenderName">
      <span className="assistantSenderIcon" aria-hidden="true">
        <BookOpen size={13} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span>{name}</span>
    </span>
  );
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

function speechRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function preferredAudioMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  ) ?? "";
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Voice audio could not be read."));
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = result.split(",");
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

function sourceInitials(source: string) {
  if (source === "telnyx_support") return "HC";
  if (source === "telnyx_developers") return "DD";
  if (source === "guru") return "W";
  if (source === "pylon") return "PY";
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
