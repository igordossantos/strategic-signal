import { beforeEach, describe, expect, it } from "vitest";
import { seedGuidance, seedSources } from "../data/seed";
import type { Workspace } from "../types";
import { loadWorkspace, parseWorkspace, saveWorkspace } from "./workspace";

const workspace: Workspace = {
  version: 1,
  sources: seedSources,
  deletedSourceIds: [],
  guidance: seedGuidance,
  pinnedSignalIds: ["policies-in-fabric"],
  itemTags: {
    "policies-in-fabric": ["customer-priority"],
  },
};

describe("workspace persistence", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    const localStorage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => [...values.keys()][index] ?? null,
      removeItem: (key: string) => {
        values.delete(key);
      },
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage },
    });
  });

  it("round trips a valid workspace", () => {
    saveWorkspace(workspace);
    const loaded = loadWorkspace({
      version: 1,
      sources: [],
      deletedSourceIds: [],
      guidance: [],
      pinnedSignalIds: [],
      itemTags: {},
    });

    expect(loaded.warning).toBeUndefined();
    expect(loaded.workspace.pinnedSignalIds).toEqual(["policies-in-fabric"]);
    expect(loaded.workspace.sources.length).toBe(seedSources.length);
  });

  it("rejects malformed imports instead of accepting partial data", () => {
    expect(() =>
      parseWorkspace(
        JSON.stringify({
          version: 1,
          sources: [{ id: "broken" }],
          guidance: [],
          pinnedSignalIds: [],
        }),
      ),
    ).toThrow(/invalid source/i);
  });

  it("migrates legacy workspaces without personal hashtags", () => {
    const legacyGuidance = seedGuidance.map(
      ({ lensHashtag: _lensHashtag, ...item }) => item,
    );
    const migrated = parseWorkspace(
      JSON.stringify({
        version: 1,
        sources: seedSources,
        guidance: legacyGuidance,
        pinnedSignalIds: [],
      }),
    );

    expect(migrated.itemTags).toEqual({});
    expect(migrated.deletedSourceIds).toEqual([]);
    expect(migrated.guidance.every((item) => item.lensHashtag)).toBe(true);
  });

  it("surfaces corrupt saved data and uses the supplied fallback", () => {
    window.localStorage.setItem(
      "strategic-signal-workspace-v1",
      "{not-json",
    );
    const loaded = loadWorkspace(workspace);

    expect(loaded.warning).toMatch(/could not be loaded/i);
    expect(loaded.workspace).toBe(workspace);
  });
});
