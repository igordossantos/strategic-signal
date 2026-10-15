import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const fabconPath = resolve(
  option(
    "fabcon",
    resolve(root, "..", "fabcon-barcelona-2026", "data", "announcements.json"),
  ),
);
const digestRoot = resolve(
  option("digest", resolve(root, "..", "fabric-digest")),
);
const archivePath = resolve(
  option("archive", resolve(root, "public", "data", "archive.json")),
);
const sourceConfigPath = resolve(
  option(
    "sources",
    resolve(root, "config", "collection-sources.json"),
  ),
);

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const unique = (values) => [...new Set(values.filter(Boolean))];
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

const fabcon = await readJson(fabconPath);
const digestIndex = await readJson(resolve(digestRoot, "index.json"));
const digestSources = await readJson(resolve(digestRoot, "sources.json"));
const roster = await readJson(resolve(digestRoot, "roster.json"));
const digestState = await readJson(resolve(digestRoot, "state.json"));

const sources = [];
const sourceByUrl = new Map();
const aliases = new Map();

function addSource(alias, source) {
  const url = canonicalUrl(source.url);
  const existing = sourceByUrl.get(url);
  if (existing) {
    aliases.set(alias, existing.id);
    return existing.id;
  }
  const next = { ...source, url };
  sources.push(next);
  sourceByUrl.set(url, next);
  aliases.set(alias, next.id);
  return next.id;
}

const builtInSources = [
  {
    id: "foundry-docs",
    name: "Microsoft Foundry documentation",
    url: "https://learn.microsoft.com/en-us/azure/ai-foundry/",
    kind: "documentation",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft Foundry"],
    tags: ["foundry", "agents", "models"],
    notes: "Reference source. Date-window enumeration requires a feed or release-note collector.",
    health: "healthy",
    collectionMode: "reference",
  },
  {
    id: "databricks-release-notes",
    name: "Azure Databricks release notes",
    url: "https://learn.microsoft.com/en-us/azure/databricks/release-notes/",
    kind: "documentation",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Azure Databricks"],
    tags: ["databricks", "release", "lakehouse"],
    notes: "Reference source. A dedicated release-note collector can be added without reworking the run model.",
    health: "healthy",
    collectionMode: "reference",
  },
  {
    id: "azure-sql-blog",
    name: "Azure SQL Blog",
    url: "https://techcommunity.microsoft.com/category/azuresql/blog/azuresqlblog",
    kind: "blog",
    tier: "official",
    method: "Public web",
    enabled: true,
    platforms: ["Microsoft SQL"],
    tags: ["sql", "database", "release"],
    notes: "Reference source until a stable feed endpoint is configured.",
    health: "healthy",
    collectionMode: "reference",
  },
];
for (const source of builtInSources) addSource(`builtin:${source.id}`, source);

for (const source of [...digestSources.official, ...digestSources.analysis]) {
  const kind =
    source.method === "rss"
      ? "rss"
      : source.url.includes("learn.microsoft.com")
        ? "documentation"
        : "blog";
  addSource(`digest:${source.id}`, {
    id: source.id,
    name: source.name,
    url: source.url,
    kind,
    tier: source.tier === "official" ? "official" : "expert",
    method: source.method === "rss" ? "RSS / Atom" : "Public web",
    enabled: true,
    platforms: ["Microsoft Fabric"],
    tags: unique([
      "fabric",
      ...(source.id.includes("pbi") ? ["power bi"] : []),
      ...(source.id.includes("serra") ? ["architecture"] : []),
    ]),
    notes: source.notes ?? "",
    health: kind === "rss" ? "healthy" : "manual",
    collectionMode: kind === "rss" ? "automatic" : "reference",
  });
}

for (const person of roster.people.filter((item) => item.tracked)) {
  addSource(`roster:${person.slug}`, {
    id: `linkedin-${person.slug}`,
    name: `${person.name} on LinkedIn`,
    url: person.url,
    kind: "linkedin",
    tier: "social",
    method: "User-triggered capture",
    enabled: true,
    platforms: ["Microsoft Fabric"],
    tags: unique(["linkedin", ...(person.covers ?? [])]),
    notes: person.notes ?? "",
    health: "manual",
    collectionMode: "browser-assisted",
    person: {
      name: person.name,
      slug: person.slug,
      title: person.title ?? "",
      affiliation: person.affiliation ?? "",
      weight: person.weight ?? "watch",
    },
  });
}

for (const source of fabcon.sources) {
  const kind = /documentation|learn/i.test(source.type)
    ? "documentation"
    : "blog";
  addSource(`fabcon:${source.id}`, {
    id: `archive-fabcon-${source.id.toLocaleLowerCase()}`,
    name: source.title,
    url: source.url,
    kind,
    tier: "official",
    method: "Imported historical source",
    enabled: false,
    platforms: [
      /sql/i.test(source.publisher) ? "Microsoft SQL" : "Microsoft Fabric",
    ],
    tags: ["fabcon 2026", "archive"],
    notes: `${source.short}. Imported from the FabCon Barcelona 2026 briefing; retained for citation rather than recurring collection.`,
    health: "healthy",
    lastChecked: fabcon.meta.lastVerified,
    collectionMode: "reference",
  });
}

const categorySection = {
  "Fabric IQ, Data Agents & Copilot": "AI & Agents",
  "Power BI & Fabric Apps": "Power BI & Apps",
  "OneLake & Interoperability": "Interoperability",
  "Data Factory & Ingestion": "Data Factory",
  "Data Engineering & Data Science": "Data Engineering",
  "Data Warehouse": "Data Warehouse",
  "Real-Time Intelligence": "Real-Time Intelligence",
  "Governance, Security & Admin": "Admin & Governance",
  "Observability, Capacity & Billing": "Admin & Capacity",
  "Git, Deployment & Developer Tooling": "DevOps",
  "Microsoft Databases": "AI & Operational Data",
};
const themeSection = {
  engineering: "Data Engineering",
  ai: "AI & Agents",
  platform: "Platform & OneLake",
  warehouse: "Data Warehouse",
  rti: "Real-Time Intelligence",
  powerbi: "Power BI & Apps",
  factory: "Data Factory",
  admin: "Admin & Governance",
  stories: "Customer Stories",
  community: "Community",
};
const statusMap = {
  GA: "Generally available",
  "Public preview": "Public preview",
  "Private preview": "Private preview",
  "Preview coming soon": "Coming soon",
  "Coming soon": "Coming soon",
  "Not specified": "Not specified",
  "Generally Available": "Generally available",
  Preview: "Public preview",
  Changed: "Changed",
  Retiring: "Retiring",
  Retired: "Retiring",
  Announced: "Not specified",
};

function protectedClasses(item) {
  const text = normalize(
    [
      item.title ?? item.t,
      item.summary,
      item.conflict,
      ...(item.k ?? []),
    ].join(" "),
  );
  return unique([
    ...(item.protected ? ["breaking-change"] : []),
    ...(item.hard_date ? ["hard-date"] : []),
    ...(item.conflict ? ["source-conflict"] : []),
    ...(/\bsecurity|permission|dlp|purview|encryption\b/.test(text)
      ? ["security"]
      : []),
    ...(/\blicen[cs]ing\b/.test(text) ? ["licensing"] : []),
    ...(/\bpricing|billing|cost\b/.test(text) ? ["pricing"] : []),
    ...(/\bbreaking|retir|deprecat|migration required\b/.test(text)
      ? ["breaking-change"]
      : []),
  ]);
}

const signals = [];
const signalByTitle = new Map();

for (const item of fabcon.announcements) {
  const sourceIds = item.src
    .map((id) => aliases.get(`fabcon:${id}`))
    .filter(Boolean);
  const citedSources = item.src
    .map((id) => fabcon.sources.find((source) => source.id === id))
    .filter(Boolean)
    .map((source) => ({ label: source.short, url: source.url }));
  const links = unique(
    [...(item.docs ?? []).map(([label, url]) => `${label}\u0000${url}`), ...citedSources.map((link) => `${link.label}\u0000${link.url}`)],
  ).map((entry) => {
    const [label, url] = entry.split("\u0000");
    return { label, url };
  });
  const platform =
    item.category === "Microsoft Databases"
      ? "Microsoft SQL"
      : "Microsoft Fabric";
  const signal = {
    id: item.id,
    title: item.title,
    platform,
    section: categorySection[item.category] ?? item.category,
    product: item.product,
    summary: item.summary,
    details: unique([
      ...(item.details ?? []),
      ...(item.relevance ? [`Legacy relevance note: ${item.relevance}`] : []),
      ...(item.prereq && item.prereq !== "Not specified in the public source."
        ? [`Prerequisite: ${item.prereq}`]
        : []),
    ]),
    status: statusMap[item.status] ?? "Not specified",
    evidence: ["learn-ga", "learn-preview"].includes(item.ver)
      ? "confirmed"
      : item.ver === "roadmap"
        ? "ahead-of-docs"
        : "commentary",
    ...(item.date ? { publishedAt: item.date } : {}),
    verifiedAt: fabcon.meta.lastVerified,
    author:
      fabcon.sources.find((source) => item.src.includes(source.id))?.author ??
      undefined,
    sourceIds,
    links,
    tags: unique([
      item.product,
      item.category,
      item.theme,
      item.assoc === "event" ? "event announcement" : "monthly update",
      "imported archive",
    ]),
    nextStep: item.next,
    relevance: [],
    protected: protectedClasses(item),
    ...(item.conflict ? { conflict: item.conflict } : {}),
    customerSafe: true,
    archive: {
      origin: "fabcon-barcelona-2026",
      importedAt: new Date().toISOString(),
      legacyId: item.id,
    },
  };
  signals.push(signal);
  signalByTitle.set(normalize(signal.title), signal);
}

for (const item of digestIndex.items) {
  const existing = signalByTitle.get(normalize(item.t));
  if (existing) {
    existing.tags = unique([
      ...existing.tags,
      ...(item.k ?? []),
      `digest first seen ${item.first_seen}`,
    ]);
    existing.protected = unique([
      ...existing.protected,
      ...protectedClasses(item),
    ]);
    continue;
  }
  const authorSources = (item.who ?? [])
    .map((who) => aliases.get(`roster:${who}`))
    .filter(Boolean);
  const confirmedSource = aliases.get("digest:fabric-updates-rss");
  const sourceIds = unique([
    ...(item.grade === "confirmed" && confirmedSource
      ? [confirmedSource]
      : []),
    ...authorSources,
  ]);
  const authorNames = (item.who ?? [])
    .map(
      (who) =>
        roster.people.find((person) => person.slug === who)?.name ?? who,
    )
    .filter(Boolean);
  const signal = {
    id: `digest-${item.id}`,
    title: item.t,
    platform: "Microsoft Fabric",
    section: themeSection[item.theme] ?? "Platform",
    product: "Fabric Digest archive",
    summary: `Archived signal from the prior Fabric Digest research. Indexed concepts: ${(item.k ?? []).slice(0, 6).join(", ")}.`,
    details: unique([
      ...(authorNames.length
        ? [`Observed from: ${authorNames.join(", ")}.`]
        : []),
      `First seen: ${item.first_seen}.`,
      `Included in prior run${item.runs?.length === 1 ? "" : "s"}: ${(item.runs ?? []).join(", ")}.`,
      ...(item.hard_date ? [`Hard date recorded: ${item.hard_date}.`] : []),
    ]),
    status: statusMap[item.state] ?? "Not specified",
    evidence:
      item.grade === "confirmed"
        ? "confirmed"
        : item.grade === "ahead"
          ? "ahead-of-docs"
          : "commentary",
    verifiedAt: digestIndex.generated,
    ...(authorNames.length ? { author: authorNames.join(", ") } : {}),
    sourceIds,
    links: sourceIds
      .map((id) => sources.find((source) => source.id === id))
      .filter(Boolean)
      .map((source) => ({ label: source.name, url: source.url })),
    tags: unique([
      ...(item.k ?? []),
      item.theme,
      `digest first seen ${item.first_seen}`,
      "imported archive",
    ]),
    nextStep:
      item.grade === "confirmed"
        ? "Review the archived digest context and re-verify current status before using externally."
        : "Treat as internal framing until an official source corroborates the claim.",
    relevance: [],
    protected: protectedClasses(item),
    customerSafe: item.grade === "confirmed",
    archive: {
      origin: "fabric-digest",
      importedAt: new Date().toISOString(),
      legacyId: item.id,
      firstSeen: item.first_seen,
      runs: item.runs ?? [],
    },
  };
  signals.push(signal);
  signalByTitle.set(normalize(signal.title), signal);
}

const archive = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  coverage: {
    archiveStarts: digestIndex.archive_starts,
    digestGenerated: digestIndex.generated,
    fabconResearchCutoff: fabcon.meta.researchCutoff,
    lastPullDate: digestState.last_pull_date,
  },
  counts: {
    fabconAnnouncements: fabcon.announcements.length,
    digestIndexItems: digestIndex.items.length,
    normalizedSignals: signals.length,
    sources: sources.length,
    linkedInPeople: roster.people.filter((item) => item.tracked).length,
    priorRuns: digestState.runs.length,
  },
  sources,
  signals,
  priorRuns: digestState.runs,
  fingerprints: digestState.seen,
};

const collectionSources = {
  schemaVersion: 1,
  generatedAt: archive.generatedAt,
  sources: sources.map((source) => ({
    id: source.id,
    name: source.name,
    url: source.url,
    kind: source.kind,
    collectionMode: source.collectionMode,
    enabled: source.enabled,
    platforms: source.platforms,
    tags: source.tags,
  })),
};

await mkdir(dirname(archivePath), { recursive: true });
await mkdir(dirname(sourceConfigPath), { recursive: true });
await writeFile(archivePath, `${JSON.stringify(archive, null, 2)}\n`);
await writeFile(
  sourceConfigPath,
  `${JSON.stringify(collectionSources, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      archivePath,
      sourceConfigPath,
      ...archive.counts,
    },
    null,
    2,
  ),
);
