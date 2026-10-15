import { describe, expect, it } from "vitest";
import { seedSignals, seedSources } from "../data/seed";
import { importCollectionResult } from "./collectionImport";
import { importDigestDocument } from "./digestImport";

describe("collection result centralization", () => {
  it("imports new items and skips existing titles and reported duplicates", () => {
    const result = importCollectionResult(
      JSON.stringify({
        schemaVersion: 1,
        runId: "collection-test",
        createdAt: "2026-10-15T12:00:00Z",
        summary: { duplicates: 1 },
        items: [
          {
            id: "fabric-updates-rss:new-item",
            sourceId: "fabric-updates-rss",
            sourceName: "Microsoft Fabric Updates",
            title: "A genuinely new collected item",
            url: "https://example.com/new?utm_source=test",
            publishedAt: "2026-10-15T10:00:00Z",
            summary: "A complete summary for a new item.",
            topics: ["agents"],
            duplicateStatus: "new",
          },
          {
            id: "fabric-updates-rss:existing",
            sourceId: "fabric-updates-rss",
            title: seedSignals[0].title,
            url: "https://example.com/existing",
            publishedAt: "2026-10-15T10:00:00Z",
            summary: "Already centralized.",
            duplicateStatus: "new",
          },
        ],
        duplicates: [{ id: "duplicate" }],
      }),
      seedSources,
      seedSignals,
    );

    expect(result.importedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.signals[0]?.tags).toContain("collected-run");
    expect(result.signals[0]?.links[0]?.url).toBe(
      "https://example.com/new",
    );
  });

  it("rejects non-run JSON", () => {
    expect(() =>
      importCollectionResult("{}", seedSources, seedSignals),
    ).toThrow(/not a Strategic Signal run result/i);
  });
});

describe("AI digest import", () => {
  it("validates a structured digest document", () => {
    const digest = importDigestDocument(
      JSON.stringify({
        schemaVersion: 1,
        id: "digest-test",
        title: "Test digest",
        generatedAt: "2026-10-15T12:00:00Z",
        provider: "Azure OpenAI",
        model: "gpt-5",
        request: {
          intent: "brief",
          depth: "standard",
          audience: "",
          instructions: "",
          itemIds: ["item-1"],
        },
        executiveSummary: "Summary",
        keyThemes: [],
        mustKnow: [],
        customerConnections: [],
        questions: [],
        readingOrder: [],
        caveats: [],
      }),
    );

    expect(digest.id).toBe("digest-test");
  });
});
