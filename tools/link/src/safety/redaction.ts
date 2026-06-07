interface RedactionRule {
  name: string;
  pattern: RegExp;
  replacement: string;
}

const INTERNAL_PATTERNS: RedactionRule[] = [
  {
    name: "internal_url",
    pattern: /https?:\/\/(?:[\w.-]*\.)?(?:internal|corp|admin|logs|datadog|snowflake)[\w.-]*\/[^\s)]+/gi,
    replacement: "[redacted internal link]",
  },
  {
    name: "internal_slack_channel",
    pattern: /#[a-z0-9_-]*(?:internal|incident|escalation|war-room|revops|eng)[a-z0-9_-]*/gi,
    replacement: "[redacted internal Slack channel]",
  },
  {
    name: "raw_log",
    pattern: /\b(?:raw log|trace id|sip trace|carrier route id|snowflake query id|datadog monitor)\b[^.\n]*/gi,
    replacement: "[redacted internal diagnostic]",
  },
  {
    name: "private_record",
    pattern: /\b(?:salesforce note|internal note|private account note|billing risk)\b[:=]?\s*[^.\n]+/gi,
    replacement: "[redacted private record]",
  },
];

export function redactInternalOnlyData(text: string): string {
  return INTERNAL_PATTERNS.reduce((current, rule) => current.replace(rule.pattern, rule.replacement), text);
}

export function findInternalOnlyLeaks(text: string): { rule: string; match: string }[] {
  return INTERNAL_PATTERNS.flatMap((rule) => {
    const matches = text.match(rule.pattern) ?? [];
    return matches.map((match) => ({ rule: rule.name, match }));
  });
}

export function assertCustomerSafeText(text: string): {
  customerSafe: boolean;
  leaks: { rule: string; match: string }[];
} {
  const leaks = findInternalOnlyLeaks(text);
  return {
    customerSafe: leaks.length === 0,
    leaks,
  };
}
