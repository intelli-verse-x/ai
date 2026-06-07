import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("desktop package exposes expected local scripts", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };

  assert.equal(pkg.scripts.dev, "node scripts/dev.mjs");
  assert.equal(pkg.scripts.build, "vite build");
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.equal(pkg.scripts.test, "tsx --test tests/*.test.ts");
});

test("vite builds relative assets for Electron file loading", async () => {
  const viteConfig = await readFile("vite.config.ts", "utf8");

  assert.match(viteConfig, /base:\s*["']\.\/["']/);
});

test("preload exposes the Link desktop IPC contract", async () => {
  const preload = await readFile("src/main/preload.js", "utf8");

  for (const method of [
    "chat",
    "runSkill",
    "listSkills",
    "listTools",
    "createSharedChannelDraft",
    "listActiveWork",
    "decideWork",
    "listAutomations",
    "listConnectors",
    "listCredentials",
    "saveCredential",
    "updateConnectorStatus",
    "listOnboarding",
    "updateOnboarding",
    "signInAgentControlPlane",
    "signOutAgentControlPlane",
    "getAgentControlPlaneAuthStatus",
    "listHostedAgents",
    "listWorkspaces",
    "searchExplorer",
    "listChatSessions",
    "sendChatMessage",
    "createChangeRequest",
    "approveChangeRequest",
    "dismissChangeRequest",
    "listChangeRequests",
    "listAgents",
    "sendAgentMessage",
    "listWorkboard",
    "createWorkboardCard",
    "updateWorkboardCard",
    "dispatchWorkboard",
    "searchPhoneNumbers",
    "previewPhoneSetup",
    "provisionPhoneSystem",
    "listMemoryBanks",
    "recallMemory",
    "listDojoState",
    "auditEvents",
  ]) {
    assert.match(preload, new RegExp(`${method}:`));
  }
});

test("renderer includes canonical Link pages in the primary navigation", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");

  for (const view of ["widgets", "explorer", "chats", "agents", "workboard", "phone", "memory", "dojo"]) {
    assert.match(app, new RegExp(`id: "${view}"`));
  }
  assert.doesNotMatch(app, /id: "connections"/);
  assert.doesNotMatch(app, /id: "marketplace"/);
  assert.doesNotMatch(app, /id: "skills"/);
  assert.doesNotMatch(app, /id: "workspaces"/);
  assert.doesNotMatch(app, /id: "design"/);
  assert.doesNotMatch(app, /view === "design"/);
  assert.match(app, /useState<ViewId>\("widgets"\)/);
  assert.ok(app.indexOf('id: "widgets"') < app.indexOf('id: "workboard"'));
  assert.ok(app.indexOf('id: "workboard"') < app.indexOf('id: "chats"'));
  assert.ok(app.indexOf('id: "chats"') < app.indexOf('id: "phone"'));
  assert.ok(app.indexOf('id: "phone"') < app.indexOf('id: "agents"'));
  assert.ok(app.indexOf('id: "agents"') < app.indexOf('id: "explorer"'));
  assert.match(app, /agents:\s*\{\s*label:\s*"Agents",\s*icon:\s*Bot\s*\}/);
  assert.match(app, /chats:\s*\{\s*label:\s*"Chat",\s*icon:\s*MessageSquare\s*\}/);
  assert.match(app, /phone:\s*\{\s*label:\s*"Phone",\s*icon:\s*Phone\s*\}/);
  assert.match(app, /function BoardIcon/);
  assert.match(app, /stroke="currentColor"/);
  assert.match(app, /workboard:\s*\{\s*label:\s*"Tasks",\s*icon:\s*BoardIcon\s*\}/);
  assert.doesNotMatch(app, /marketplace:\s*\{\s*label:\s*"App Marketplace",\s*icon:\s*Store\s*\}/);
  assert.doesNotMatch(app, /view === "marketplace"/);
  assert.match(app, /explorer:\s*\{\s*label:\s*"Library",\s*icon:\s*BookOpen\s*\}/);
  assert.match(app, /title="Library"/);
  assert.doesNotMatch(app, /connections:\s*\{\s*label:\s*"Agent Plugins",\s*icon:\s*Link2\s*\}/);
  assert.doesNotMatch(app, /Request access/);
  assert.match(app, /memory:\s*\{\s*label:\s*"Memory",\s*icon:\s*Vault\s*\}/);
  assert.match(app, /dojo:\s*\{\s*label:\s*"Experto",\s*icon:\s*ChessKnight\s*\}/);
  assert.match(app, /openWidgetLibrary=\{\(\) => \{/);
  assert.match(app, /view === "chats" \? "New chat"/);
  assert.match(app, /if \(view === "chats"\) selectSession\(""\);/);
  assert.match(app, /else openWidgetLibrary\(\);/);
});

test("Experto owns the skills catalog and squad kits", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(app, /function DojoView/);
  assert.match(app, /Experto/);
  assert.match(app, /ChessKnight/);
  assert.doesNotMatch(app, /label:\s*"Dojo"/);
  assert.doesNotMatch(app, />Dojo</);
  assert.match(app, /squadKits/);
  assert.match(app, /Search skills/);
  assert.match(app, /All squad kits/);
  assert.match(app, /Run selected/);
  assert.match(app, /dojoSkillCatalog/);
  assert.match(app, /<MarketplaceView embedded \/>/);
  assert.match(app, /App marketplace/);
  assert.match(await readFile("../../tools/link/skills/make-html-slides.md", "utf8"), /name: Make HTML Slides/);
  assert.doesNotMatch(app, /view === "skills"/);
  assert.match(styles, /\.squadKitGrid\s*{/);
  assert.match(styles, /\.dojoSkillCatalog\s*{/);
});

test("memory bank page mirrors Hindsight sections without console naming", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(app, /Memory Bank/);
  assert.match(app, /Agent bank/);
  for (const label of ["Overview", "Documents", "Memories", "Entities", "Prompt", "Settings"]) {
    assert.match(app, new RegExp(label));
  }
  assert.doesNotMatch(app, /label:\s*"API Keys"/);
  assert.doesNotMatch(app, />Console</);
  assert.match(app, /role="tablist" aria-label="Memory bank sections"/);
  assert.match(app, /Upload files/);
  assert.match(app, /Quick add text/);
  assert.match(app, /Min mentions/);
  assert.match(app, /Retain/);
  assert.match(app, /Recall/);
  assert.match(app, /Reflect/);
  assert.match(styles, /\.memoryTabs/);
  assert.match(styles, /\.memoryTable/);
});

test("onboarding is persisted, dismissible, and tied to setup steps", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");
  const main = await readFile("src/main/main.js", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(api, /OnboardingState/);
  assert.match(api, /listOnboarding/);
  assert.match(api, /updateOnboarding/);
  assert.match(main, /onboardingState/);
  assert.match(main, /seedOnboardingState/);
  assert.match(main, /link:list-onboarding/);
  assert.match(app, /function OnboardingView/);
  assert.match(app, /initialOnboardingState/);
  assert.match(app, /useState<OnboardingState>\(initialOnboardingState\)/);
  assert.match(app, /Dismiss onboarding/);
  assert.match(app, /Register with Telnyx Okta/);
  assert.match(app, /Set up Agent Plugins/);
  assert.match(app, /Connect the accounts and plugin permissions Link can use/);
  assert.match(app, /Attach the squad wiki from Hindsight/);
  assert.match(app, /Finish onboarding/);
  assert.match(app, /onboarding:\s*\{\s*label:\s*"Onboarding",\s*icon:\s*Flag\s*\}/);
  assert.match(app, /\{renderRailButton\(\{ id: "onboarding", label: "Start", icon: Flag \}\)\}[\s\S]*?\{renderRailButton\(\{ id: "settings", label: "Settings", icon: Settings \}\)\}/);
  assert.match(styles, /\.railOnboardingItem/);
  assert.match(styles, /\.onboardingGrid/);
});

test("widgets page exposes a report library for the home dashboard", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(app, /function WidgetsView/);
  assert.match(app, /libraryOpen:\s*boolean/);
  assert.match(app, /widgetLibrary/);
  for (const source of ["Tableau", "Salesforce", "Salesloft", "Linear"]) {
    assert.match(app, new RegExp(source));
  }
  assert.match(app, /Search reports/);
  assert.match(app, /Add widget/);
  assert.match(app, /Widget library/);
  assert.match(app, /layoutEditing/);
  assert.match(app, /aria-pressed=\{layoutEditing\}/);
  assert.match(app, /layoutEditing \? "Done" : "Manage layout"/);
  assert.match(app, /libraryOpen \? \(/);
  assert.match(styles, /\.widgetLibraryTakeover\s*{/);
  assert.match(styles, /\.widgetLibraryControls\s*{[^}]*grid-template-columns:\s*minmax\(260px,\s*1fr\) minmax\(320px,\s*420px\)/s);
  assert.match(styles, /\.widgetLibraryList\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(220px,\s*1fr\)\)/s);
  assert.match(styles, /\.dashboardWidgetGrid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(220px,\s*1fr\)\)/s);
  assert.match(styles, /@keyframes widgetJiggle/);
  assert.match(styles, /\.dashboardWidgetGrid\.layoutEditing \.dashboardWidget/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test("app marketplace exposes employee apps for local install and VPN access", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.doesNotMatch(app, /id: "marketplace"/);
  assert.match(app, /function MarketplaceView/);
  assert.match(app, /embeddedMarketplace/);
  assert.match(app, /marketplaceApps/);
  assert.match(app, /App Marketplace/);
  assert.match(app, /Publish app/);
  assert.match(app, /Install locally/);
  assert.match(app, /Open via VPN/);
  assert.match(app, /bot-owned workflow/);
  assert.match(styles, /\.marketplaceGrid\s*{/);
  assert.match(styles, /\.marketplaceCard\s*{/);
});

test("renderer uses Telnyx media-kit brand colors", async () => {
  const styles = await readFile("src/renderer/styles.css", "utf8");
  const main = await readFile("src/main/main.js", "utf8");
  const app = await readFile("src/renderer/App.tsx", "utf8");

  assert.match(styles, /--telnyx-green:\s*#00e3aa/i);
  assert.match(styles, /--telnyx-black:\s*#000000/i);
  assert.match(styles, /--accent:\s*var\(--telnyx-green\)/);
  assert.match(main, /--accent:\s*#00E3AA/);
  assert.match(app, /Telnyx Green/);
  assert.match(app, /Telnyx Black/);
});

test("page layouts use full-width app canvas", async () => {
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(styles, /\.content\s*{[^}]*padding:\s*14px/s);
  assert.match(styles, /\.content\s*{[^}]*gap:\s*14px/s);
  assert.match(styles, /\.assistantPanel\s*{[^}]*padding:\s*14px/s);
  assert.match(styles, /\.pageHeader\s*{[^}]*margin-bottom:\s*0/s);
  assert.match(styles, /\.appSurface\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*2fr\) minmax\(340px,\s*1fr\)/s);
  assert.match(styles, /\.pageSurface > \.content\s*{[^}]*height:\s*100%/s);
  assert.doesNotMatch(styles, /max-width:\s*(920|940|980)px/);
  assert.doesNotMatch(styles, /min-width:\s*760px/);
  assert.match(styles, /\.phoneSetupGrid,[\s\S]*?width:\s*100%/);
  assert.match(styles, /\.settingsView \.pageHeader,[\s\S]*?width:\s*100%/);
});

test("settings uses tabs for access credentials and design system", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.doesNotMatch(api, /\|\s*"design"/);
  assert.match(app, /setTab\] = useState<"access" \| "my-agents" \| "plugins" \| "credentials" \| "design">\("access"\)/);
  for (const label of ["Access", "My Agents", "Agent Plugins", "Credentials", "Design System"]) {
    assert.match(app, new RegExp(label));
  }
  assert.match(app, /tab === "plugins"/);
  assert.match(app, /<ConnectionsView[\s\S]*?embedded/);
  assert.match(app, /linkApi\.listHostedAgents/);
  assert.match(app, /tab === "my-agents"/);
  assert.doesNotMatch(app, /<span><Users size=\{14\} \/> Hosted agents<\/span>/);
  assert.doesNotMatch(app, /Okta-backed connector/);
  assert.doesNotMatch(app, /\["appearance", "Appearance"\]/);
  assert.match(app, /colorMode,\s*setColorMode/);
  assert.match(app, /data-theme=\{colorMode\}/);
  assert.match(app, /setColorMode\("light"\)/);
  assert.match(app, /setColorMode\("dark"\)/);
  assert.match(app, /<DesignSystemView embedded \/>/);
  assert.match(app, /function CredentialSection/);
  assert.match(app, /isRequiredCredentialGroup/);
  assert.match(app, /group\.label\.toLowerCase\(\)\.startsWith\("telnyx"\)/);
  assert.match(app, /compareCredentialGroups/);
  assert.match(app, /<CredentialSection title="Required" groups=\{requiredCredentials\}>/);
  assert.match(app, /<CredentialSection title="Optional" groups=\{optionalCredentials\}>/);
  assert.match(styles, /\.settingsTabs\s*{/);
  assert.match(styles, /\.credentialSectionHeader\s*{/);
  assert.match(styles, /\.themeToggle\s*{/);
  assert.match(styles, /\.desktop\[data-theme="dark"\]/);
  assert.match(styles, /\.desktop\[data-theme="dark"\] \.widgetsView/);
  assert.match(styles, /\.desktop\[data-theme="dark"\] \.assistantPanel \.button/);
  assert.match(styles, /\.desktop\[data-theme="dark"\] \.widgetCanvas/);
});

test("user avatar opens an account menu with identity and logout", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");
  const main = await readFile("src/main/main.js", "utf8");
  const preload = await readFile("src/main/preload.js", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(api, /signOutAgentControlPlane/);
  assert.match(preload, /link:agent-control-plane-sign-out/);
  assert.match(main, /function signOutAgentControlPlane/);
  assert.match(main, /session\.defaultSession\.cookies\.remove/);
  assert.match(app, /accountMenuOpen/);
  assert.match(app, /accountMenuRef/);
  assert.match(app, /document\.addEventListener\("mousedown", handleOutsideClick\)/);
  assert.match(app, /accountMenuRef\.current\?\.contains\(event\.target as Node\)/);
  assert.match(app, /accountStatus\?\.userName/);
  assert.match(app, /initialsFromIdentity/);
  assert.match(api, /userName\?: string/);
  assert.match(main, /TELNYX_AUTH_USER_NAME/);
  assert.match(app, /Log out/);
  assert.doesNotMatch(app, /Account settings/);
  assert.doesNotMatch(app, /Open assistant/);
  assert.doesNotMatch(styles, /\.avatar span\s*{/);
  assert.match(app, /Sign in with Okta/);
  assert.match(app, /accountMenuTheme/);
  assert.match(app, /aria-label="Color mode"/);
  assert.doesNotMatch(app, /Okta session active/);
  assert.match(styles, /\.accountMenu\s*{/);
  assert.match(styles, /\.themeToggle\.compact\s*{/);
});

test("chat and phone stay available in the persistent assistant panel", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");
  const main = await readFile("src/main/main.js", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(api, /export interface ChatArtifact/);
  assert.match(main, /function createChatArtifacts/);
  assert.match(app, /selectedArtifact/);
  assert.match(app, /function ArtifactViewer/);
  assert.match(app, /function MessageArtifacts/);
  assert.match(app, /openArtifact=\{setSelectedArtifact\}/);
  assert.match(app, /function AssistantPanel/);
  assert.match(app, /function SwordIcon/);
  assert.match(app, /className="button primary sendSwordButton"/);
  assert.match(app, /aria-label=\{busy \? "Thinking" : "Send"\}/);
  assert.match(app, /mode:\s*"chat" \| "phone"/);
  assert.match(app, /setMode\("chat"\)/);
  assert.match(app, /setMode\("phone"\)/);
  assert.match(app, /Telnyx LiteLLM/);
  assert.match(app, /Configure phone first on Phone page/);
  assert.match(app, /No connected agent/);
  assert.match(app, /Search connected agents/);
  assert.match(app, /agent\.id !== "slack-bot-troubleshooting"/);
  assert.match(app, /No connected agents found/);
  assert.match(app, /selectedChatAgent\?\.description/);
  assert.match(app, /selectedChatAgentId/);
  assert.match(app, /assistantActionsOpen/);
  assert.match(app, /More assistant actions/);
  assert.match(app, /className="assistantActionMenu"/);
  assert.match(app, /Message Slack bot/);
  assert.match(app, /Open Slack credentials/);
  assert.match(app, /Request Link change/);
  assert.match(app, /Open Settings credentials/);
  assert.match(app, /changeStatus/);
  assert.match(app, /assistantSettingsOpen/);
  assert.match(app, /Chat settings/);
  assert.match(app, /className="assistantComposerTools"/);
  assert.match(app, /className="iconButton assistantSettingsTrigger"/);
  assert.match(app, /Approval mode/);
  assert.match(app, /Model route/);
  assert.match(app, /Context scope/);
  assert.match(app, /approvalMode:\s*acceptMode/);
  assert.match(app, /modelMode/);
  assert.match(app, /contextScope/);
  assert.match(app, /agentId:\s*selectedChatAgent\?\.id/);
  assert.match(app, /agentName:\s*selectedChatAgent\?\.displayName/);
  assert.match(app, /panelPhonePlaceholder/);
  assert.match(styles, /\.assistantOverflowButton\s*{/);
  assert.match(styles, /\.assistantActionMenu\s*{/);
  assert.match(styles, /\.assistantComposerTools\s*{/);
  assert.match(styles, /\.messageArtifactLink\s*{/);
  assert.match(styles, /\.artifactViewer\s*{/);
  assert.match(styles, /\.sendSwordButton\s*{/);
  assert.match(styles, /\.assistantSettingsPopover\s*{/);
  assert.doesNotMatch(app, /className="assistantSettingsSummary"/);
  assert.match(styles, /\.assistantNotice\.warning\s*{/);
  assert.match(styles, /\.assistantAgentPicker\s*{/);
  assert.match(styles, /\.agentPickerList\s*{/);
  assert.match(styles, /\.agentPickerEmpty\s*{/);
  assert.match(styles, /\.assistantPanel\s*{[^}]*background:\s*#fbfaf9/s);
  assert.match(styles, /\.desktop\[data-theme="dark"\] \.assistantTabs button\s*{/);
  assert.match(styles, /\.desktop\[data-theme="dark"\] \.assistantMessage strong\s*{/);
  assert.match(styles, /\.desktop\[data-theme="dark"\] \.assistantComposer textarea::placeholder\s*{/);
  assert.match(styles, /\.assistantComposer textarea/);
  assert.match(styles, /\.panelPhonePlaceholder\s*{/);
});

test("chats page uses a project-grouped session table", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(app, /workspaces=\{workspaces\}/);
  assert.match(app, /sessionsByWorkspace/);
  assert.match(app, /aria-label="Chat and projects"/);
  assert.match(app, /<h1>Chat<\/h1>/);
  assert.match(app, /className="projectGroupHeader"/);
  assert.match(app, /Show more/);
  assert.match(app, /Selected chat/);
  assert.match(styles, /\.chatDirectoryLayout\s*{/);
  assert.match(styles, /\.projectChatRow\s*,/);
  assert.match(styles, /\.chatSessionPreview\s*{/);
});

test("chat session tabs are closable and backed by chat session state", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(app, /openChatTabIds/);
  assert.match(app, /function openChatSession/);
  assert.match(app, /function closeChatTab/);
  assert.match(app, /className="tabClose"/);
  assert.match(app, /aria-label=\{`Close \$\{session\.title\}`\}/);
  assert.match(api, /let mockChatSessions/);
  assert.match(api, /if \(!session\) \{/);
  assert.match(styles, /\.tabClose\s*{/);
});

test("main process has v2 state, live-ready adapters, and approval-gated PR flow", async () => {
  const main = await readFile("src/main/main.js", "utf8");

  assert.match(main, /const stateVersion = 3/);
  assert.match(main, /LITELLM_BASE_URL/);
  assert.match(main, /HINDSIGHT_API_KEY/);
  assert.match(main, /GURU_COLLECTION_ID/);
  assert.match(main, /GOOGLE_DRIVE_ACCESS_TOKEN/);
  assert.match(main, /TELNYX_ACTOR/);
  assert.match(main, /available_phone_numbers/);
  assert.match(main, /credential_connections/);
  assert.match(main, /call_control_applications/);
  assert.match(main, /a2a-discovery\.query\.prod\.telnyx\.io:4000/);
  assert.match(main, /\/api\/agents\?page=1&page_size=50/);
  assert.match(main, /Selected Link chat agent/);
  assert.match(main, /listA2aDiscoveryAgents/);
  assert.match(main, /users\.list/);
  assert.match(main, /chat\.postMessage/);
  assert.match(main, /conversations\.open/);
  assert.match(main, /detectWorkboardProviders/);
  assert.match(main, /Hermes Kanban/);
  assert.match(main, /OpenClaw Workboard/);
  assert.match(main, /Link local board/);
  assert.match(main, /safeStorage/);
  assert.match(main, /link-desktop-credentials\.v1\.json/);
  assert.match(main, /LINK_PR_MODE !== "live"/);
  assert.match(main, /Draft PR creation is mocked/);
});

test("workboard page has provider-aware adapters and local fallback UI", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");
  const styles = await readFile("src/renderer/styles.css", "utf8");

  assert.match(app, /WorkboardView/);
  assert.match(app, /<h1>Tasks<\/h1>/);
  assert.match(app, /Dispatch ready/);
  assert.match(app, /Search cards, labels, assignees, or diagnostics/);
  assert.match(styles, /\.kanbanBoard\s*{[^}]*width:\s*100%/s);
  assert.match(styles, /\.kanbanColumn\s*{[^}]*min-width:\s*0/s);
  assert.match(api, /WorkboardProvider = "auto" \| "hermes" \| "openclaw" \| "local"/);
  assert.match(api, /WorkboardSnapshot/);
});

test("phone page uses the Telnyx WebRTC SDK and stages purchases for review", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const main = await readFile("src/main/main.js", "utf8");
  const pkg = JSON.parse(await readFile("package.json", "utf8")) as {
    dependencies: Record<string, string>;
  };

  assert.ok(pkg.dependencies["@telnyx/webrtc"]);
  assert.match(app, /PhoneView/);
  assert.match(app, /@telnyx\/webrtc/);
  assert.match(app, /Generate setup plan/);
  assert.match(app, /Purchase & provision/);
  assert.match(app, /Purchase review/);
  assert.doesNotMatch(app, /Telnyx API key<\/span>/);
  assert.match(app, /Add TELNYX_API_KEY in Settings/);
  assert.match(app, /Voice AI assistant/);
  assert.match(app, /AI Assistants/);
  assert.match(app, /Create assistant/);
  assert.match(app, /Assistant instructions/);
  assert.match(app, /SIP \/ WebRTC/);
  assert.match(app, /Google Calendar availability/);
  assert.match(app, /Contact search/);
  assert.match(app, /Search connected contacts/);
  assert.match(app, /setDialNumber\(contact\.phone\)/);
  assert.match(app, /connectors=\{connectors\}/);
  assert.ok(main.includes("/ai/assistants"));
  assert.match(main, /ai_assistant_start/);
  assert.match(main, /check_calendar_availability/);
});

test("agents page includes search and squad filtering for discovered agents", async () => {
  const app = await readFile("src/renderer/App.tsx", "utf8");
  const main = await readFile("src/main/main.js", "utf8");
  const api = await readFile("src/renderer/api.ts", "utf8");

  assert.match(app, /squadFilter/);
  assert.match(app, /Search agents, skills, tools, or squads/);
  assert.match(app, /All squads/);
  assert.match(app, /sendAgentMessage/);
  assert.match(app, /Message \$\{agent\.displayName\}/);
  assert.match(app, /Agent rescue/);
  assert.match(app, /Draft rescue request/);
  assert.match(app, /requestAgentRescue/);
  assert.match(main, /agentRescueSlackAgent/);
  assert.match(main, /U0AR1M7T6GP/);
  assert.match(main, /D0ASV9TTDJ7/);
  assert.match(api, /slack-bot-troubleshooting/);
});

test("local credentials stay out of source and Okta password storage is not supported", async () => {
  const main = await readFile("src/main/main.js", "utf8");

  assert.doesNotMatch(main, /OKTA_PASSWORD/);
  assert.doesNotMatch(main, /okta password/i);
  assert.match(main, /encryptString/);
  assert.match(main, /decryptString/);
});
