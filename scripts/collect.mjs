import { XMLParser } from "fast-xml-parser";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const requestPath = arg("request");
const request = requestPath
  ? JSON.parse(await readFile(resolve(requestPath), "utf8"))
  : {};
const requestId = arg("request-id") ?? request.id;
const from = arg("from") ?? request.from;
const to = arg("to") ?? request.to;
const topics = String(arg("topics") ?? request.topics?.join(",") ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const requestedSourceIds = String(
  arg("sources") ?? request.sourceIds?.join(",") ?? "",
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const sourceOverridesInput =
  arg("source-overrides") ?? request.sourceOverrides ?? [];
const configPath = resolve(
  arg("config") ?? resolve(root, "config", "collection-sources.json"),
);
const archivePath = resolve(
  arg("archive") ?? resolve(root, "public", "data", "archive.json"),
);
const dedupIndexPath = resolve(
  arg("dedup-index") ?? resolve(root, "data", "dedup-index.json"),
);

function parseDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} is not a valid date.`);
  }
  return date;
}

const fromDate = parseDate(from, "from");
const toDate = parseDate(to, "to");
if (fromDate > toDate) {
  throw new Error("The from date must be on or before the to date.");
}
const toEnd = new Date(`${to}T23:59:59.999Z`);
const executionRunId =
  requestId || `collection-${from}-to-${to}-${Date.now().toString(36)}`;

const config = JSON.parse(await readFile(configPath, "utf8"));
const archive = JSON.parse(await readFile(archivePath, "utf8"));
let dedupIndex;
try {
  dedupIndex = JSON.parse(await readFile(dedupIndexPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  dedupIndex = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entries: {},
  };
}
if (
  dedupIndex.schemaVersion !== 1 ||
  typeof dedupIndex.entries !== "object" ||
  dedupIndex.entries === null
) {
  throw new Error("The duplicate index has an unsupported schema.");
}
const priorRunFingerprints = new Map(
  Object.entries(dedupIndex.entries),
);
let sourceOverrides;
try {
  sourceOverrides =
    typeof sourceOverridesInput === "string"
      ? JSON.parse(sourceOverridesInput || "[]")
      : sourceOverridesInput;
} catch {
  throw new Error("source-overrides must be valid JSON.");
}
if (!Array.isArray(sourceOverrides)) {
  throw new Error("source-overrides must be a JSON array.");
}
for (const source of sourceOverrides) {
  if (
    typeof source?.id !== "string" ||
    typeof source?.name !== "string" ||
    typeof source?.url !== "string"
  ) {
    throw new Error(
      "Every source override requires string id, name, and url values.",
    );
  }
}
const configuredSources = [
  ...(config.sources ?? []).filter(
    (source) =>
      !sourceOverrides.some((override) => override.id === source.id),
  ),
  ...sourceOverrides,
];
const sourceIds = requestedSourceIds.length
  ? requestedSourceIds
  : configuredSources
      .filter(
        (source) =>
          source.enabled && source.collectionMode === "automatic",
      )
      .map((source) => source.id);
if (!sourceIds.length) {
  throw new Error("Select at least one source.");
}

const selectedSources = [];
const issues = [];
for (const sourceId of sourceIds) {
  const source = configuredSources.find((item) => item.id === sourceId);
  if (!source) {
    issues.push({
      sourceId,
      severity: "error",
      message: "The selected source is not present in collection-sources.json.",
    });
    continue;
  }
  selectedSources.push(source);
}

const normalize = (value) =>
  String(value ?? "")
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
const canonicalUrl = (value) => {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|msclkid|fbclid|gclid|ocid|wt\.)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
};
const list = (value) =>
  value == null ? [] : Array.isArray(value) ? value : [value];
const text = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object") {
    return text(value["#text"] ?? value.cdata ?? value.__cdata);
  }
  return "";
};
const stripMarkup = (value) =>
  text(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
const linkValue = (value) => {
  if (typeof value === "string") return value;
  for (const candidate of list(value)) {
    if (typeof candidate === "string") return candidate;
    if (candidate?.["@_rel"] === "alternate" && candidate?.["@_href"]) {
      return candidate["@_href"];
    }
    if (candidate?.["@_href"]) return candidate["@_href"];
    if (candidate?.["#text"]) return candidate["#text"];
  }
  return "";
};
const dateValue = (item) =>
  text(
    item.pubDate ??
      item.published ??
      item.updated ??
      item["dc:date"] ??
      item.date,
  );

function fingerprintKeys({ externalId, url, title, summary }) {
  return [
    ...(externalId
      ? [`external:${sha256(String(externalId).trim())}`]
      : []),
    ...(url ? [`url:${sha256(canonicalUrl(url))}`] : []),
    ...(title ? [`title:${sha256(normalize(title))}`] : []),
    ...(title || summary
      ? [
          `content:${sha256(
            `${normalize(title)}\n${normalize(summary).slice(0, 4000)}`,
          )}`,
        ]
      : []),
  ];
}

const archiveFingerprints = new Map();
for (const signal of archive.signals ?? []) {
  for (const key of fingerprintKeys({
    title: signal.title,
    summary: signal.summary,
  })) {
    archiveFingerprints.set(key, signal.id);
  }
  for (const link of signal.links ?? []) {
    for (const key of fingerprintKeys({ url: link.url })) {
      archiveFingerprints.set(key, signal.id);
    }
  }
}
for (const item of archive.fingerprints?.linkedin ?? []) {
  for (const key of fingerprintKeys({ externalId: item.urn })) {
    archiveFingerprints.set(key, item.what ?? item.urn);
  }
}
for (const item of archive.fingerprints?.blog ?? []) {
  for (const key of fingerprintKeys({ externalId: item.id })) {
    archiveFingerprints.set(key, item.what ?? item.id);
  }
}
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

const collected = [];
const runFingerprints = new Map();
const queues = [];
const sourceResults = [];

for (const source of selectedSources) {
  if (source.collectionMode !== "automatic" || source.kind !== "rss") {
    queues.push({
      sourceId: source.id,
      sourceName: source.name,
      url: source.url,
      mode: source.collectionMode,
      reason:
        source.collectionMode === "browser-assisted"
          ? "Open the source in the signed-in browser and use the LinkedIn capture helper."
          : "This source is retained for reference and needs a dedicated collector or manual review.",
    });
    sourceResults.push({
      sourceId: source.id,
      status: "queued",
      items: 0,
    });
    continue;
  }

  try {
    const response = await fetch(source.url, {
      headers: {
        "user-agent":
          "StrategicSignal/1.2 (+https://github.com/igordossantos/strategic-signal)",
        accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const parsed = parser.parse(await response.text());
    const entries = parsed.rss?.channel?.item ?? parsed.feed?.entry ?? [];
    let sourceItemCount = 0;

    for (const entry of list(entries)) {
      const rawDate = dateValue(entry);
      const published = new Date(rawDate);
      if (Number.isNaN(published.getTime())) {
        issues.push({
          sourceId: source.id,
          severity: "warning",
          message: `Skipped an entry without a usable date: ${stripMarkup(entry.title).slice(0, 100) || "untitled entry"}.`,
        });
        continue;
      }
      if (published < fromDate || published > toEnd) continue;

      const title = stripMarkup(entry.title);
      const summary = stripMarkup(
        entry.description ??
          entry.summary ??
          entry.content ??
          entry["content:encoded"],
      );
      const searchText = normalize(`${title} ${summary}`);
      if (
        topics.length &&
        !topics.some((topic) => searchText.includes(normalize(topic)))
      ) {
        continue;
      }
      const externalId = text(entry.guid);
      const url = canonicalUrl(linkValue(entry.link) || externalId);
      const fingerprints = fingerprintKeys({
        externalId,
        url,
        title,
        summary,
      });
      const archiveMatch = fingerprints.find((key) =>
        archiveFingerprints.has(key),
      );
      const priorRunMatch = fingerprints.find(
        (key) => priorRunFingerprints.has(key),
      );
      const sameRunMatch = fingerprints.find((key) =>
        runFingerprints.has(key),
      );
      const duplicateReason = archiveMatch
        ? "archive"
        : priorRunMatch
          ? "prior-run"
          : sameRunMatch
            ? "same-run"
            : null;
      const duplicateOf = archiveMatch
        ? archiveFingerprints.get(archiveMatch)
        : priorRunMatch
          ? priorRunFingerprints.get(priorRunMatch).itemId
          : sameRunMatch
            ? runFingerprints.get(sameRunMatch)
            : undefined;
      const itemId = `${source.id}:${externalId || url || normalize(title)}`;
      const item = {
        id: itemId,
        sourceId: source.id,
        sourceName: source.name,
        title,
        url,
        publishedAt: published.toISOString(),
        summary,
        topics,
        fingerprints,
        duplicateStatus: duplicateReason ?? "new",
        ...(duplicateOf ? { duplicateOf } : {}),
      };
      collected.push(item);
      for (const fingerprint of fingerprints) {
        if (!runFingerprints.has(fingerprint)) {
          runFingerprints.set(fingerprint, itemId);
        }
        const existing = dedupIndex.entries[fingerprint];
        dedupIndex.entries[fingerprint] = {
          fingerprint,
          itemId: existing?.itemId ?? itemId,
          title,
          url,
          firstSeenAt: existing?.firstSeenAt ?? new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          firstRunId: existing?.firstRunId ?? executionRunId,
          lastRunId: executionRunId,
          occurrenceCount: (existing?.occurrenceCount ?? 0) + 1,
          sourceIds: [
            ...new Set([...(existing?.sourceIds ?? []), source.id]),
          ],
        };
      }
      sourceItemCount += 1;
    }
    sourceResults.push({
      sourceId: source.id,
      status: "completed",
      items: sourceItemCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown collection failure.";
    issues.push({
      sourceId: source.id,
      severity: "error",
      message,
    });
    sourceResults.push({
      sourceId: source.id,
      status: "failed",
      items: 0,
      error: message,
    });
  }
}

const newItems = collected.filter(
  (item) => item.duplicateStatus === "new",
);
const duplicates = collected.filter(
  (item) => item.duplicateStatus !== "new",
);
dedupIndex.updatedAt = new Date().toISOString();

const output = {
  schemaVersion: 1,
  runId: executionRunId,
  createdAt: new Date().toISOString(),
  request: {
    from,
    to,
    sourceIds,
    topics,
    sourceOverrides,
  },
  archive: {
    generatedAt: archive.generatedAt,
    reusableSignals: archive.counts?.normalizedSignals ?? 0,
    matchedItems: duplicates.filter(
      (item) => item.duplicateStatus === "archive",
    ).length,
  },
  duplicateDetection: {
    indexPath: dedupIndexPath,
    fingerprintsTracked: Object.keys(dedupIndex.entries).length,
    archiveDuplicates: duplicates.filter(
      (item) => item.duplicateStatus === "archive",
    ).length,
    priorRunDuplicates: duplicates.filter(
      (item) => item.duplicateStatus === "prior-run",
    ).length,
    sameRunDuplicates: duplicates.filter(
      (item) => item.duplicateStatus === "same-run",
    ).length,
  },
  summary: {
    selectedSources: selectedSources.length,
    completedSources: sourceResults.filter(
      (result) => result.status === "completed",
    ).length,
    queuedSources: queues.length,
    failedSources: sourceResults.filter(
      (result) => result.status === "failed",
    ).length,
    observedItems: collected.length,
    items: newItems.length,
    newItems: newItems.length,
    duplicates: duplicates.length,
  },
  sources: sourceResults,
  items: newItems,
  duplicates,
  queues,
  issues,
};

const defaultOutput = resolve(
  root,
  "data",
  "collection-runs",
  `${from}-to-${to}-${Date.now().toString(36)}.json`,
);
const outputPath = resolve(arg("output") ?? defaultOutput);
await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(dedupIndexPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
await writeFile(
  dedupIndexPath,
  `${JSON.stringify(dedupIndex, null, 2)}\n`,
);

console.log(JSON.stringify({ outputPath, ...output.summary }, null, 2));
if (issues.some((issue) => issue.severity === "error")) {
  process.exitCode = 2;
}
