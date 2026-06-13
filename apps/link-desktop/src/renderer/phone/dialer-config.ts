export type DialerTheme = "dark" | "light";
export type DialerShape = "rounded" | "square";
export type DialerAccentColor = "green" | "blue" | "purple" | "orange";
export type DialerFontSize = "small" | "medium" | "large";
export type DialerFeaturePhase = "pre-call" | "in-call" | "post-call";

export interface DialerFeatureSetting {
  id: string;
  label: string;
  type: "select" | "text" | "toggle";
  options?: string[];
  default?: string | boolean;
}

export interface DialerFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  phase: DialerFeaturePhase;
  settings?: DialerFeatureSetting[];
}

export interface DialerAction {
  id: string;
  label: string;
  icon: string;
  style: "default" | "end";
}

export interface DialerConfig {
  id: string;
  name: string;
  template: string | null;
  theme: DialerTheme;
  shape: DialerShape;
  accentColor: DialerAccentColor;
  fontSize: DialerFontSize;
  showNumpad: boolean;
  showCountryPrefix: boolean;
  callerIdName: string;
  outboundNumber: string;
  enabledFeatures: string[];
  actions: string[];
  featureSettings: Record<string, Record<string, string | boolean>>;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface DialerTemplate extends DialerConfig {
  description: string;
  badge: string;
  icon: string;
  tone: "green" | "orange" | "blue";
}

export interface DialerState {
  configs: DialerConfig[];
  activeConfig: DialerConfig;
  updatedAt: string;
}

export const dialpadKeys = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
] as const;

export const dialerFeatures: DialerFeature[] = [
  {
    id: "notes",
    name: "Call Notes",
    description: "Add notes during or after calls with auto-save",
    icon: "StickyNote",
    phase: "post-call",
    settings: [
      { id: "notes-autosave", label: "Auto-save interval", type: "select", options: ["5s", "10s", "30s", "Manual"], default: "10s" },
      { id: "notes-template", label: "Note template", type: "select", options: ["None", "Basic", "BANT", "MEDDIC"], default: "None" },
    ],
  },
  {
    id: "salesforce-notes-sync",
    name: "Salesforce Notes Sync",
    description: "Sync post-call notes into Salesforce when MCP is connected",
    icon: "Database",
    phase: "post-call",
    settings: [
      { id: "sf-notes-sync", label: "Sync to Salesforce", type: "toggle", default: true },
      { id: "sf-notes-target", label: "Sync target", type: "select", options: ["Contact notes", "Account notes", "Opportunity notes"], default: "Contact notes" },
    ],
  },
  {
    id: "crm",
    name: "Contact Preview",
    description: "Preview Salesforce contact data for the number entered",
    icon: "Database",
    phase: "pre-call",
    settings: [
      { id: "crm-provider", label: "Data source", type: "select", options: ["Salesforce MCP"], default: "Salesforce MCP" },
      { id: "crm-show-history", label: "Show call history", type: "toggle", default: true },
      { id: "crm-show-deals", label: "Show open deals", type: "toggle", default: true },
    ],
  },
  {
    id: "recording",
    name: "Call Recording",
    description: "Record calls with compliance announcements",
    icon: "CircleDot",
    phase: "in-call",
    settings: [
      { id: "recording-auto", label: "Auto-record", type: "toggle", default: false },
      { id: "recording-announce", label: "Announcement", type: "select", options: ["None", "Beep", "Voice prompt"], default: "Beep" },
      { id: "recording-storage", label: "Storage", type: "select", options: ["Telnyx Cloud", "S3 Bucket", "Local"], default: "Telnyx Cloud" },
    ],
  },
  {
    id: "transcription",
    name: "Live Transcription",
    description: "Real-time speech-to-text powered by Telnyx AI",
    icon: "AudioWaveform",
    phase: "in-call",
    settings: [
      { id: "transcription-lang", label: "Language", type: "select", options: ["English", "Spanish", "French", "German", "Auto-detect"], default: "English" },
      { id: "transcription-display", label: "Display", type: "select", options: ["Sidebar", "Overlay", "Below dialer"], default: "Sidebar" },
    ],
  },
  {
    id: "dispositions",
    name: "Dispositions",
    description: "Wrap-up codes and call outcome tracking",
    icon: "ClipboardList",
    phase: "post-call",
    settings: [
      { id: "dispo-required", label: "Required after call", type: "toggle", default: true },
      { id: "dispo-codes", label: "Code set", type: "select", options: ["Basic (5 codes)", "Sales (12 codes)", "Support (8 codes)", "Custom"], default: "Basic (5 codes)" },
    ],
  },
  {
    id: "call-timer",
    name: "Call Timer",
    description: "Visible timer with configurable alerts",
    icon: "Timer",
    phase: "in-call",
    settings: [
      { id: "timer-alert", label: "Alert at", type: "select", options: ["None", "2 min", "5 min", "10 min", "Custom"], default: "5 min" },
      { id: "timer-position", label: "Position", type: "select", options: ["Top", "Center", "Bottom"], default: "Center" },
    ],
  },
  {
    id: "analytics",
    name: "Call Analytics",
    description: "Real-time call metrics and performance stats",
    icon: "BarChart3",
    phase: "post-call",
    settings: [
      { id: "analytics-display", label: "Display", type: "select", options: ["Minimal", "Detailed", "Dashboard"], default: "Minimal" },
    ],
  },
];

export const dialerActions: DialerAction[] = [
  { id: "mute", label: "Mute", icon: "MicOff", style: "default" },
  { id: "hold", label: "Hold", icon: "Pause", style: "default" },
  { id: "transfer", label: "Transfer", icon: "ArrowRightLeft", style: "default" },
  { id: "end", label: "End", icon: "PhoneOff", style: "end" },
  { id: "speaker", label: "Speaker", icon: "Volume2", style: "default" },
  { id: "dial", label: "Keypad", icon: "Hash", style: "default" },
  { id: "record", label: "Record", icon: "CircleDot", style: "default" },
];

export const defaultActionIds = ["mute", "hold", "transfer", "end"];

const templateTimestamp = "1970-01-01T00:00:00.000Z";

export const dialerTemplates: DialerTemplate[] = [
  {
    id: "standard",
    name: "Standard Dialer",
    description: "A clean everyday dialer for direct outbound calling.",
    badge: "Simple",
    icon: "Smartphone",
    tone: "green",
    template: "standard",
    theme: "dark",
    shape: "rounded",
    accentColor: "green",
    fontSize: "large",
    showNumpad: true,
    showCountryPrefix: true,
    callerIdName: "My Company",
    outboundNumber: "+1 (415) 555-0100",
    enabledFeatures: ["call-timer"],
    actions: ["mute", "hold", "speaker", "end"],
    featureSettings: {
      "call-timer": { "timer-alert": "None", "timer-position": "Center" },
    },
    createdAt: templateTimestamp,
    updatedAt: templateTimestamp,
    active: false,
  },
  {
    id: "sales",
    name: "Sales Dialer",
    description: "Outbound sales workflow with CRM, notes, recording, dispositions, and analytics.",
    badge: "Popular",
    icon: "TrendingUp",
    tone: "orange",
    template: "sales",
    theme: "dark",
    shape: "rounded",
    accentColor: "green",
    fontSize: "medium",
    showNumpad: true,
    showCountryPrefix: true,
    callerIdName: "Sales Team",
    outboundNumber: "+1 (415) 555-0100",
    enabledFeatures: ["crm", "notes", "salesforce-notes-sync", "dispositions", "recording", "call-timer", "analytics"],
    actions: ["mute", "hold", "transfer", "end", "record"],
    featureSettings: {
      notes: { "notes-autosave": "10s", "notes-template": "BANT" },
      crm: { "crm-provider": "Salesforce MCP", "crm-show-history": true, "crm-show-deals": true },
      dispositions: { "dispo-required": true, "dispo-codes": "Sales (12 codes)" },
      recording: { "recording-auto": true, "recording-announce": "Beep", "recording-storage": "Telnyx Cloud" },
      "call-timer": { "timer-alert": "5 min", "timer-position": "Center" },
      analytics: { "analytics-display": "Detailed" },
      "salesforce-notes-sync": { "sf-notes-sync": true, "sf-notes-target": "Contact notes" },
    },
    createdAt: templateTimestamp,
    updatedAt: templateTimestamp,
    active: false,
  },
  {
    id: "support",
    name: "Support Dialer",
    description: "Inbound support workspace with transcription, notes, and Salesforce MCP context.",
    badge: "Recommended",
    icon: "Headphones",
    tone: "blue",
    template: "support",
    theme: "dark",
    shape: "rounded",
    accentColor: "green",
    fontSize: "medium",
    showNumpad: false,
    showCountryPrefix: true,
    callerIdName: "Support Center",
    outboundNumber: "+1 (415) 555-0100",
    enabledFeatures: ["transcription", "recording", "notes", "salesforce-notes-sync", "dispositions", "call-timer", "crm"],
    actions: ["mute", "hold", "end"],
    featureSettings: {
      transcription: { "transcription-lang": "Auto-detect", "transcription-display": "Sidebar" },
      recording: { "recording-auto": true, "recording-announce": "Voice prompt", "recording-storage": "Telnyx Cloud" },
      notes: { "notes-autosave": "5s", "notes-template": "Basic" },
      "salesforce-notes-sync": { "sf-notes-sync": true, "sf-notes-target": "Contact notes" },
      dispositions: { "dispo-required": true, "dispo-codes": "Support (8 codes)" },
      "call-timer": { "timer-alert": "10 min", "timer-position": "Top" },
      crm: { "crm-provider": "Salesforce MCP", "crm-show-history": true, "crm-show-deals": false },
    },
    createdAt: templateTimestamp,
    updatedAt: templateTimestamp,
    active: false,
  },
];

export function createDefaultDialerConfig(): DialerConfig {
  return normalizeDialerConfig(dialerTemplates[0], true);
}

export function cloneDialerConfig(config: DialerConfig): DialerConfig {
  return {
    ...config,
    enabledFeatures: [...config.enabledFeatures],
    actions: [...config.actions],
    featureSettings: Object.fromEntries(
      Object.entries(config.featureSettings).map(([featureId, settings]) => [featureId, { ...settings }]),
    ),
  };
}

export function normalizeDialerConfig(input: Partial<DialerConfig> | null | undefined, active = false): DialerConfig {
  const fallback = dialerTemplates[0];
  const validFeatureIds = new Set(dialerFeatures.map((feature) => feature.id));
  const validActionIds = new Set(dialerActions.map((action) => action.id));
  const accentValues: DialerAccentColor[] = ["green", "blue", "purple", "orange"];
  const fontValues: DialerFontSize[] = ["small", "medium", "large"];
  const now = new Date().toISOString();
  const source = input ?? {};
  const actions = Array.isArray(source.actions) ? source.actions.filter((action) => validActionIds.has(action)) : fallback.actions;
  const features = Array.isArray(source.enabledFeatures) ? source.enabledFeatures.filter((feature) => validFeatureIds.has(feature)) : fallback.enabledFeatures;

  return {
    id: source.id && typeof source.id === "string" ? source.id : fallback.id,
    name: source.name && typeof source.name === "string" ? source.name : fallback.name,
    template: typeof source.template === "string" ? source.template : null,
    theme: source.theme === "light" ? "light" : "dark",
    shape: source.shape === "square" ? "square" : "rounded",
    accentColor: source.accentColor && accentValues.includes(source.accentColor) ? source.accentColor : fallback.accentColor,
    fontSize: source.fontSize && fontValues.includes(source.fontSize) ? source.fontSize : fallback.fontSize,
    showNumpad: typeof source.showNumpad === "boolean" ? source.showNumpad : fallback.showNumpad,
    showCountryPrefix: typeof source.showCountryPrefix === "boolean" ? source.showCountryPrefix : fallback.showCountryPrefix,
    callerIdName: source.callerIdName && typeof source.callerIdName === "string" ? source.callerIdName : fallback.callerIdName,
    outboundNumber: source.outboundNumber && typeof source.outboundNumber === "string" ? source.outboundNumber : fallback.outboundNumber,
    enabledFeatures: [...new Set(features)],
    actions: [...new Set(actions)].slice(0, 5),
    featureSettings: source.featureSettings && typeof source.featureSettings === "object" ? source.featureSettings : fallback.featureSettings,
    createdAt: source.createdAt && typeof source.createdAt === "string" ? source.createdAt : now,
    updatedAt: source.updatedAt && typeof source.updatedAt === "string" ? source.updatedAt : now,
    active,
  };
}
