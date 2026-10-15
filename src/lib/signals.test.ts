import { describe, expect, it } from "vitest";
import { platformOrder, seedSignals, seedSources } from "../data/seed";
import {
  applyPrioritySignals,
  emptyFilters,
  filterSignals,
  groupSignals,
  signalsToCsv,
  signalsToMarkdown,
  sortSignals,
} from "./signals";
import type { Guidance } from "../types";

describe("signal filtering", () => {
  it("matches every search token across normalized signal text", () => {
    const result = filterSignals(seedSignals, {
      ...emptyFilters,
      query: "governed semantic",
    });

    expect(result.map((signal) => signal.id)).toContain("fabric-iq-mcp-ga");
    expect(
      result.every((signal) =>
        JSON.stringify(signal).toLocaleLowerCase().includes("govern"),
      ),
    ).toBe(true);
  });

  it("filters by audience and protected status together", () => {
    const result = filterSignals(seedSignals, {
      ...emptyFilters,
      audience: "Zurich Insurance Group",
      protectedOnly: true,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (signal) =>
          signal.protected.length > 0 &&
          signal.relevance.some(
            (mapping) => mapping.audience === "Zurich Insurance Group",
          ),
      ),
    ).toBe(true);
  });

  it("sorts by the selected audience's relevance score", () => {
    const sorted = sortSignals(
      seedSignals.filter((signal) =>
        signal.relevance.some(
          (mapping) => mapping.audience === "Farmers Insurance",
        ),
      ),
      "relevance",
      "Farmers Insurance",
    );

    expect(sorted[0]?.id).toBe("policies-in-fabric");
  });

  it("turns an active customer priority into a dynamic filter and mapping", () => {
    const priority: Guidance = {
      id: "subsidiary-vector-priority",
      title: "Ground operational AI in governed data",
      audience: "Zurich Validation Subsidiary",
      need: "Evaluate grounded retrieval over operational data.",
      priority: "high",
      effectiveDate: "2026-10-15",
      tags: ["operational data"],
      matchTerms: ["vector search", "rag"],
      active: true,
    };
    const personalized = applyPrioritySignals(seedSignals, [priority]);
    const result = filterSignals(personalized, {
      ...emptyFilters,
      audience: priority.audience,
      prioritySignal: priority.id,
    });

    expect(result.map((signal) => signal.id)).toContain(
      "diskann-vector-indexes-ga",
    );
    expect(
      result[0]?.relevance.some(
        (mapping) => mapping.guidanceId === priority.id,
      ),
    ).toBe(true);
  });
});

describe("signal grouping and export", () => {
  it("creates stable platform and section groups", () => {
    const groups = groupSignals(seedSignals, platformOrder);

    expect(groups[0]?.platform).toBe("Microsoft Fabric");
    expect(
      groups.some(
        (group) =>
          group.platform === "Microsoft Foundry" &&
          group.section === "Agent Development",
      ),
    ).toBe(true);
  });

  it("exports customer-safe Markdown with the selected audience", () => {
    const markdown = signalsToMarkdown(
      [seedSignals[0]],
      seedSources,
      "Zurich Brazil",
    );

    expect(markdown).toContain("for Zurich Brazil");
    expect(markdown).toContain("Why it matters to Zurich Brazil");
    expect(markdown).toContain("not claims about a customer's environment");
  });

  it("neutralizes spreadsheet formulas in CSV output", () => {
    const risky = {
      ...seedSignals[0],
      title: "=HYPERLINK(\"https://example.com\")",
    };
    const csv = signalsToCsv([risky], seedSources);

    expect(csv).toContain("'=HYPERLINK");
  });
});
