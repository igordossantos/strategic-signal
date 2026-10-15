import assert from "node:assert/strict";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";

const readJson = (path) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const archive = readJson("public/data/archive.json");
const collectionSources = readJson("config/collection-sources.json");

function runCollector(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        fileURLToPath(new URL("../scripts/collect.mjs", import.meta.url)),
        ...args,
      ],
      { encoding: "utf8" },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}

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

test("collector accepts browser-local source overrides", () => {
  const output = join(
    tmpdir(),
    `strategic-signal-source-override-${process.pid}.json`,
  );
  const dedupIndex = join(
    tmpdir(),
    `strategic-signal-source-override-dedup-${process.pid}.json`,
  );
  const override = [
    {
      id: "custom-reference",
      name: "Custom reference",
      url: "https://example.com/custom",
      kind: "manual",
      collectionMode: "reference",
      enabled: true,
      platforms: ["Custom Technology"],
      tags: ["custom"],
    },
  ];
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL("../scripts/collect.mjs", import.meta.url)),
      "--from",
      "2026-10-01",
      "--to",
      "2026-10-15",
      "--sources",
      "custom-reference",
      "--source-overrides",
      JSON.stringify(override),
      "--output",
      output,
      "--dedup-index",
      dedupIndex,
    ],
    { encoding: "utf8" },
  );

  try {
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const collected = JSON.parse(readFileSync(output, "utf8"));
    assert.equal(collected.summary.selectedSources, 1);
    assert.equal(collected.summary.queuedSources, 1);
    assert.equal(collected.queues[0].sourceId, "custom-reference");
  } finally {
    if (existsSync(output)) unlinkSync(output);
    if (existsSync(dedupIndex)) unlinkSync(dedupIndex);
  }
});

test("collector detects same-run and prior-run duplicates", async () => {
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0"><channel><title>Fixture</title>
      <item><guid>fixture-1</guid><title>Unique fixture signal</title>
        <link>http://127.0.0.1/item/1?utm_source=test</link>
        <pubDate>Thu, 15 Oct 2026 12:00:00 GMT</pubDate>
        <description>Stable fixture content for duplicate detection.</description>
      </item>
      <item><guid>fixture-1</guid><title>Unique fixture signal</title>
        <link>http://127.0.0.1/item/1</link>
        <pubDate>Thu, 15 Oct 2026 12:00:00 GMT</pubDate>
        <description>Stable fixture content for duplicate detection.</description>
      </item>
    </channel></rss>`;
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/rss+xml" });
    response.end(feed);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseName = `strategic-signal-dedup-${process.pid}`;
  const firstOutput = join(tmpdir(), `${baseName}-first.json`);
  const secondOutput = join(tmpdir(), `${baseName}-second.json`);
  const dedupIndex = join(tmpdir(), `${baseName}-index.json`);
  const override = JSON.stringify([
    {
      id: "fixture-feed",
      name: "Fixture feed",
      url: `http://127.0.0.1:${address.port}/feed.xml`,
      kind: "rss",
      collectionMode: "automatic",
      enabled: true,
      platforms: ["Fixture"],
      tags: [],
    },
  ]);
  const common = [
    "--from",
    "2026-10-15",
    "--to",
    "2026-10-15",
    "--sources",
    "fixture-feed",
    "--source-overrides",
    override,
    "--dedup-index",
    dedupIndex,
  ];

  try {
    const first = await runCollector([
      ...common,
      "--request-id",
      "dedup-first",
      "--output",
      firstOutput,
    ]);
    assert.equal(first.status, 0, `${first.stdout}\n${first.stderr}`);
    const firstResult = JSON.parse(readFileSync(firstOutput, "utf8"));
    assert.equal(firstResult.summary.observedItems, 2);
    assert.equal(firstResult.summary.newItems, 1);
    assert.equal(firstResult.summary.duplicates, 1);
    assert.equal(firstResult.duplicateDetection.sameRunDuplicates, 1);

    const second = await runCollector([
      ...common,
      "--request-id",
      "dedup-second",
      "--output",
      secondOutput,
    ]);
    assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
    const secondResult = JSON.parse(readFileSync(secondOutput, "utf8"));
    assert.equal(secondResult.summary.newItems, 0);
    assert.equal(secondResult.summary.duplicates, 2);
    assert.equal(secondResult.duplicateDetection.priorRunDuplicates, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    for (const path of [firstOutput, secondOutput, dedupIndex]) {
      if (existsSync(path)) unlinkSync(path);
    }
  }
});
