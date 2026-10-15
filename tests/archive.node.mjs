import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const readJson = (path) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const archive = readJson("public/data/archive.json");
const collectionSources = readJson("config/collection-sources.json");

test("legacy research is normalized into a reusable archive", () => {
  assert.equal(archive.schemaVersion, 1);
  assert.equal(archive.counts.fabconAnnouncements, 208);
  assert.equal(archive.counts.digestIndexItems, 51);
  assert.equal(archive.counts.linkedInPeople, 20);
  assert.equal(archive.counts.priorRuns, 5);
  assert.equal(archive.signals.length, archive.counts.normalizedSignals);
  assert.ok(archive.signals.length >= 250);
});

test("archive signal and source identifiers are unique and connected", () => {
  const signalIds = archive.signals.map((signal) => signal.id);
  const sourceIds = archive.sources.map((source) => source.id);
  const sourceIdSet = new Set(sourceIds);

  assert.equal(new Set(signalIds).size, signalIds.length);
  assert.equal(sourceIdSet.size, sourceIds.length);
  for (const signal of archive.signals) {
    for (const sourceId of signal.sourceIds) {
      assert.ok(
        sourceIdSet.has(sourceId),
        `${signal.id} references missing source ${sourceId}`,
      );
    }
  }
});

test("collection configuration separates automatic and assisted sources", () => {
  const modes = collectionSources.sources.reduce((counts, source) => {
    counts[source.collectionMode] =
      (counts[source.collectionMode] ?? 0) + 1;
    return counts;
  }, {});

  assert.ok(modes.automatic >= 2);
  assert.equal(modes["browser-assisted"], 20);
  assert.ok(modes.reference >= 10);
});

test("collector rejects an inverted date window before network access", () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL("../scripts/collect.mjs", import.meta.url)),
      "--from",
      "2026-10-15",
      "--to",
      "2026-10-01",
      "--sources",
      "fabric-updates-rss",
    ],
    { encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /from date must be/i);
});
