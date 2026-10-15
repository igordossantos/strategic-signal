import { XMLParser } from "fast-xml-parser";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const configPath = resolve(
  arg("config") ?? resolve(root, "config", "collection-sources.json"),
);
const archivePath = resolve(
  arg("archive") ?? resolve(root, "public", "data", "archive.json"),
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

const config = JSON.parse(await readFile(configPath, "utf8"));
const archive = JSON.parse(await readFile(archivePath, "utf8"));
const configuredSources = config.sources ?? [];
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

const knownUrls = new Set(
  (archive.signals ?? [])
    .flatMap((signal) => signal.links ?? [])
    .map((link) => canonicalUrl(link.url)),
);
const knownTitles = new Map(
  (archive.signals ?? []).map((signal) => [normalize(signal.title), signal.id]),
);
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

const collected = [];
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
      const url = canonicalUrl(linkValue(entry.link) || text(entry.guid));
      const archivedId =
        (url && knownUrls.has(url)
          ? (archive.signals ?? []).find((signal) =>
              (signal.links ?? []).some(
                (link) => canonicalUrl(link.url) === url,
              ),
            )?.id
          : undefined) ?? knownTitles.get(normalize(title));

      collected.push({
        id: `${source.id}:${text(entry.guid) || url || normalize(title)}`,
        sourceId: source.id,
        sourceName: source.name,
        title,
        url,
        publishedAt: published.toISOString(),
        summary,
        topics,
        archiveStatus: archivedId ? "already-archived" : "new",
        ...(archivedId ? { archiveId: archivedId } : {}),
      });
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

const deduplicated = [];
const seen = new Set();
for (const item of collected) {
  const key = item.url || normalize(item.title);
  if (seen.has(key)) continue;
  seen.add(key);
  deduplicated.push(item);
}

const output = {
  schemaVersion: 1,
  runId: `collection-${from}-to-${to}-${Date.now().toString(36)}`,
  createdAt: new Date().toISOString(),
  request: {
    from,
    to,
    sourceIds,
    topics,
  },
  archive: {
    generatedAt: archive.generatedAt,
    reusableSignals: archive.counts?.normalizedSignals ?? 0,
    matchedItems: deduplicated.filter(
      (item) => item.archiveStatus === "already-archived",
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
    items: deduplicated.length,
    newItems: deduplicated.filter((item) => item.archiveStatus === "new")
      .length,
  },
  sources: sourceResults,
  items: deduplicated,
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
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);

console.log(JSON.stringify({ outputPath, ...output.summary }, null, 2));
if (issues.some((issue) => issue.severity === "error")) {
  process.exitCode = 2;
}
