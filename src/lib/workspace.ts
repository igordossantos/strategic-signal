import type { Guidance, Source, Workspace } from "../types";

const STORAGE_KEY = "strategic-signal-workspace-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function storedHashtag(value: string): string {
  return value
    .trim()
    .replace(/^#+/, "")
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function isSource(value: unknown): value is Source {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.url === "string" &&
    ["rss", "blog", "documentation", "linkedin", "manual"].includes(
      String(value.kind),
    ) &&
    ["official", "expert", "community", "social"].includes(String(value.tier)) &&
    typeof value.method === "string" &&
    typeof value.enabled === "boolean" &&
    isStringArray(value.platforms) &&
    isStringArray(value.tags) &&
    typeof value.notes === "string" &&
    ["healthy", "manual", "attention"].includes(String(value.health))
  );
}

function isGuidance(value: unknown): value is Guidance {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.audience === "string" &&
    typeof value.need === "string" &&
    ["critical", "high", "normal", "watch"].includes(String(value.priority)) &&
    typeof value.effectiveDate === "string" &&
    isStringArray(value.tags) &&
    isStringArray(value.matchTerms) &&
    typeof value.active === "boolean"
  );
}

function isStoredSignal(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.platform === "string" &&
    typeof value.section === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.details) &&
    Array.isArray(value.sourceIds) &&
    Array.isArray(value.links) &&
    Array.isArray(value.tags) &&
    Array.isArray(value.relevance) &&
    Array.isArray(value.protected) &&
    typeof value.customerSafe === "boolean"
  );
}

function isDigestDocument(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === 1 &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.generatedAt === "string" &&
    typeof value.executiveSummary === "string" &&
    Array.isArray(value.keyThemes) &&
    Array.isArray(value.mustKnow) &&
    Array.isArray(value.customerConnections) &&
    Array.isArray(value.questions) &&
    Array.isArray(value.readingOrder) &&
    Array.isArray(value.caveats)
  );
}

export function validateWorkspace(value: unknown): Workspace {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("The workspace file has an unsupported or missing version.");
  }
  if (!Array.isArray(value.sources) || !value.sources.every(isSource)) {
    throw new Error("The workspace contains an invalid source definition.");
  }
  if (!Array.isArray(value.guidance) || !value.guidance.every(isGuidance)) {
    throw new Error("The workspace contains an invalid guidance definition.");
  }
  const deletedSourceIds = value.deletedSourceIds ?? [];
  if (!isStringArray(deletedSourceIds)) {
    throw new Error("The workspace contains an invalid deleted-source list.");
  }
  if (!isStringArray(value.pinnedSignalIds)) {
    throw new Error("The workspace contains an invalid discussion list.");
  }
  const itemTags = value.itemTags ?? {};
  if (
    !isRecord(itemTags) ||
    !Object.values(itemTags).every(isStringArray)
  ) {
    throw new Error("The workspace contains invalid personal hashtags.");
  }
  const collectedSignals = value.collectedSignals ?? [];
  if (
    !Array.isArray(collectedSignals) ||
    !collectedSignals.every(isStoredSignal)
  ) {
    throw new Error("The workspace contains invalid collected signals.");
  }
  const digestSelectionIds = value.digestSelectionIds ?? [];
  if (!isStringArray(digestSelectionIds)) {
    throw new Error("The workspace contains an invalid digest selection.");
  }
  const digests = value.digests ?? [];
  if (!Array.isArray(digests) || !digests.every(isDigestDocument)) {
    throw new Error("The workspace contains an invalid digest library.");
  }
  const guidance = (value.guidance as Guidance[]).map((item) => ({
    ...item,
    lensHashtag:
      typeof item.lensHashtag === "string" && storedHashtag(item.lensHashtag)
        ? storedHashtag(item.lensHashtag)
        : storedHashtag(item.id || item.title),
    tags: item.tags.map(storedHashtag).filter(Boolean),
  }));
  return {
    ...value,
    deletedSourceIds,
    guidance,
    itemTags,
    collectedSignals,
    digestSelectionIds,
    digests,
  } as unknown as Workspace;
}

export interface WorkspaceLoadResult {
  workspace: Workspace;
  warning?: string;
}

export function loadWorkspace(fallback: Workspace): WorkspaceLoadResult {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { workspace: fallback };
    return { workspace: validateWorkspace(JSON.parse(raw)) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown workspace error.";
    return {
      workspace: fallback,
      warning: `Saved workspace could not be loaded. The starter workspace is active instead. ${message}`,
    };
  }
}

export function saveWorkspace(workspace: Workspace): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function parseWorkspace(text: string): Workspace {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  return validateWorkspace(parsed);
}

export function downloadText(
  filename: string,
  content: string,
  type: string,
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function createId(prefix: string, label: string): string {
  const slug = label
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
  return `${prefix}-${slug || "item"}-${Date.now().toString(36)}`;
}
