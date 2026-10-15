import type { Signal, Source } from "../types";
import { normalize } from "./signals";

interface CollectionImportResult {
  runId: string;
  signals: Signal[];
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalUrl(value: string): string {
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
}

function signalId(value: string): string {
  return `collected-${normalize(value).replace(/\s+/g, "-").slice(0, 100)}`;
}

export function importCollectionResult(
  text: string,
  sources: Source[],
  existingSignals: Signal[],
): CollectionImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected collection result is not valid JSON.");
  }
  if (
    !isRecord(parsed) ||
    parsed.schemaVersion !== 1 ||
    typeof parsed.runId !== "string" ||
    !Array.isArray(parsed.items)
  ) {
    throw new Error("The selected file is not a Strategic Signal run result.");
  }

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const existingIds = new Set(existingSignals.map((signal) => signal.id));
  const existingTitles = new Set(
    existingSignals.map((signal) => normalize(signal.title)),
  );
  const existingUrls = new Set(
    existingSignals
      .flatMap((signal) => signal.links)
      .map((link) => canonicalUrl(link.url)),
  );
  const signals: Signal[] = [];
  let skippedCount = 0;

  for (const value of parsed.items) {
    if (!isRecord(value)) {
      skippedCount += 1;
      continue;
    }
    if (
      value.duplicateStatus != null &&
      value.duplicateStatus !== "new"
    ) {
      skippedCount += 1;
      continue;
    }
    const title = String(value.title ?? "").trim();
    const rawSummary = String(value.summary ?? "").trim();
    const summary =
      rawSummary.length > 2_000
        ? `${rawSummary.slice(0, 1_997).trimEnd()}...`
        : rawSummary;
    const sourceId = String(value.sourceId ?? "").trim();
    const rawId = String(value.id ?? title).trim();
    const url = canonicalUrl(String(value.url ?? "").trim());
    if (!title || !summary || !sourceId) {
      skippedCount += 1;
      continue;
    }
    const id = signalId(rawId);
    if (
      existingIds.has(id) ||
      existingTitles.has(normalize(title)) ||
      (url && existingUrls.has(url))
    ) {
      skippedCount += 1;
      continue;
    }
    const source = sourceById.get(sourceId);
    const publishedAt = String(value.publishedAt ?? "").slice(0, 10);
    const topics = Array.isArray(value.topics)
      ? value.topics.map(String)
      : [];
    const platforms = source?.platforms.length
      ? source.platforms
      : ["Technology"];
    signals.push({
      id,
      title,
      platform: platforms[0],
      section: source?.tags[0] ?? "Collected",
      product: source?.name ?? String(value.sourceName ?? "Collected source"),
      summary,
      details: [],
      status: "Not specified",
      evidence: source?.tier === "official" ? "confirmed" : "commentary",
      ...(publishedAt ? { publishedAt } : {}),
      verifiedAt: String(parsed.createdAt ?? new Date().toISOString()).slice(
        0,
        10,
      ),
      sourceIds: [sourceId],
      links: url ? [{ label: "Original source", url }] : [],
      tags: [
        ...(source?.tags ?? []),
        ...platforms,
        ...topics,
        "collected-run",
      ],
      nextStep: "Read the original source and decide whether to include it in a digest.",
      relevance: [],
      protected: [],
      customerSafe: source?.tier === "official",
    });
    existingIds.add(id);
    existingTitles.add(normalize(title));
    if (url) existingUrls.add(url);
  }

  return {
    runId: parsed.runId,
    signals,
    importedCount: signals.length,
    skippedCount,
    duplicateCount: Array.isArray(parsed.duplicates)
      ? parsed.duplicates.length
      : Number(
          isRecord(parsed.summary) ? parsed.summary.duplicates ?? 0 : 0,
        ),
  };
}
