import { describe, expect, it } from "vitest";
import { platformOrder, seedSignals, seedSources } from "../data/seed";
import {
  emptyFilters,
  filterSignals,
  groupSignals,
  signalsToCsv,
  signalsToMarkdown,
  sortSignals,
} from "./signals";

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
