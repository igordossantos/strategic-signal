import type {
  Signal,
  SignalFilters,
  SignalSort,
  Source,
} from "../types";

export const emptyFilters: SignalFilters = {
  query: "",
  platform: "",
  section: "",
  audience: "",
  status: "",
  evidence: "",
  protectedOnly: false,
  customerSafeOnly: true,
};

export function normalize(value: unknown): string {
  return String(value ?? "")
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"');
}

export function signalSearchText(signal: Signal): string {
  return normalize(
    [
      signal.title,
      signal.platform,
      signal.section,
      signal.product,
      signal.summary,
      ...signal.details,
      ...signal.tags,
      signal.author,
      signal.status,
      signal.evidence,
      signal.nextStep,
      signal.conflict,
      ...signal.relevance.flatMap((item) => [item.audience, item.reason]),
    ].join(" "),
  );
}

export function maxRelevance(signal: Signal, audience = ""): number {
  const mappings = audience
    ? signal.relevance.filter((item) => item.audience === audience)
    : signal.relevance;
  return Math.max(0, ...mappings.map((item) => item.score));
}

export function filterSignals(
  signals: Signal[],
  filters: SignalFilters,
): Signal[] {
  const tokens = normalize(filters.query).split(/\s+/).filter(Boolean);

  return signals.filter((signal) => {
    if (filters.platform && signal.platform !== filters.platform) return false;
    if (filters.section && signal.section !== filters.section) return false;
    if (
      filters.audience &&
      !signal.relevance.some((item) => item.audience === filters.audience)
    ) {
      return false;
    }
    if (filters.status && signal.status !== filters.status) return false;
    if (filters.evidence && signal.evidence !== filters.evidence) return false;
    if (filters.protectedOnly && signal.protected.length === 0) return false;
    if (filters.customerSafeOnly && !signal.customerSafe) return false;
    if (tokens.length) {
      const haystack = signalSearchText(signal);
      if (!tokens.every((token) => haystack.includes(token))) return false;
    }
    return true;
  });
}

export function sortSignals(
  signals: Signal[],
  sort: SignalSort,
  audience = "",
): Signal[] {
  return [...signals].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "newest") {
      const byDate = (b.publishedAt ?? b.verifiedAt).localeCompare(
        a.publishedAt ?? a.verifiedAt,
      );
      return byDate || a.title.localeCompare(b.title);
    }
    const byRelevance = maxRelevance(b, audience) - maxRelevance(a, audience);
    const protectedDifference = b.protected.length - a.protected.length;
    return (
      byRelevance ||
      protectedDifference ||
      (b.publishedAt ?? b.verifiedAt).localeCompare(
        a.publishedAt ?? a.verifiedAt,
      ) ||
      a.title.localeCompare(b.title)
    );
  });
}

export interface SignalGroup {
  key: string;
  platform: string;
  section: string;
  signals: Signal[];
}

export function groupSignals(
  signals: Signal[],
  platformOrder: string[],
): SignalGroup[] {
  const groups = new Map<string, SignalGroup>();
  for (const signal of signals) {
    const key = `${signal.platform}::${signal.section}`;
    const current = groups.get(key) ?? {
      key,
      platform: signal.platform,
      section: signal.section,
      signals: [],
    };
    current.signals.push(signal);
    groups.set(key, current);
  }

  return [...groups.values()].sort((a, b) => {
    const aIndex = platformOrder.indexOf(a.platform);
    const bIndex = platformOrder.indexOf(b.platform);
    const platformDifference =
      (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
    return (
      platformDifference ||
      a.platform.localeCompare(b.platform) ||
      a.section.localeCompare(b.section)
    );
  });
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function formatDate(value?: string): string {
  if (!value) return "Date not stated";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function sourceNames(signal: Signal, sources: Source[]): string[] {
  const byId = new Map(sources.map((source) => [source.id, source.name]));
  return signal.sourceIds
    .map((sourceId) => byId.get(sourceId))
    .filter((name): name is string => Boolean(name));
}

function csvCell(value: unknown): string {
  let output = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@\t]/.test(output)) output = `'${output}`;
  return /[",]/.test(output)
    ? `"${output.replace(/"/g, '""')}"`
    : output;
}

export function signalsToCsv(
  signals: Signal[],
  sources: Source[],
  audience = "",
): string {
  const rows = signals.map((signal) => {
    const relevance = audience
      ? signal.relevance.find((item) => item.audience === audience)
      : signal.relevance[0];
    return [
      signal.title,
      signal.platform,
      signal.section,
      signal.status,
      signal.evidence,
      relevance?.audience ?? "",
      relevance?.reason ?? "",
      signal.nextStep,
      sourceNames(signal, sources).join(" | "),
      signal.links.map((link) => link.url).join(" | "),
    ];
  });
  const header = [
    "Title",
    "Platform",
    "Section",
    "Status",
    "Evidence",
    "Audience",
    "Why it matters",
    "Next step",
    "Sources",
    "Links",
  ];
  return [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n")
    .concat("\r\n");
}

export function signalsToMarkdown(
  signals: Signal[],
  sources: Source[],
  audience = "",
): string {
  const audienceLabel = audience ? ` for ${audience}` : "";
  const lines = [
    `# Strategic Signal briefing${audienceLabel}`,
    "",
    `Generated ${formatDate(new Date().toISOString().slice(0, 10))}`,
    "",
  ];

  for (const signal of signals) {
    const mappings = audience
      ? signal.relevance.filter((item) => item.audience === audience)
      : signal.relevance;
    lines.push(
      `## ${signal.title}`,
      `- Area: ${signal.platform} > ${signal.section}`,
      `- Status: ${signal.status}`,
      `- Evidence: ${signal.evidence}`,
      `- Summary: ${signal.summary}`,
    );
    for (const relevance of mappings) {
      lines.push(
        `- Why it matters to ${relevance.audience}: ${relevance.reason}`,
      );
    }
    lines.push(`- Suggested next step: ${signal.nextStep}`);
    const sourceList = sourceNames(signal, sources);
    if (sourceList.length) lines.push(`- Sources: ${sourceList.join(", ")}`);
    for (const link of signal.links) {
      lines.push(`- [${link.label}](${link.url})`);
    }
    lines.push("");
  }

  lines.push(
    "_Curated from public sources. Relevance statements are suggested discussion points, not claims about a customer's environment. Verify current availability, licensing, and regional support before making decisions._",
    "",
  );
  return lines.join("\n");
}
