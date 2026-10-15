import {
  Archive,
  Check,
  CircleAlert,
  Clipboard,
  Clock3,
  CloudDownload,
  CodeXml,
  Database,
  ExternalLink,
  FileJson,
  Filter,
  Globe2,
  MessageSquareText,
  MousePointerClick,
  Pencil,
  Play,
  Plus,
  Rss,
  Search,
  Trash2,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatDate, uniqueSorted } from "../lib/signals";
import { downloadText } from "../lib/workspace";
import type { ArchiveBundle, Source } from "../types";
import { SourceEditorModal } from "./SourceEditorModal";
import { Badge, Button } from "./ui";

interface CollectionViewProps {
  archive: ArchiveBundle | null;
  sources: Source[];
  onSourcesChange: (sources: Source[]) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

interface CollectionRequest {
  id: string;
  createdAt: string;
  from: string;
  to: string;
  sourceIds: string[];
  sourceOverrides: Source[];
  topics: string[];
  topicMode: "everything" | "topics";
  archiveCandidates: number;
  status: "prepared";
}

const HISTORY_KEY = "strategic-signal-collection-runs-v1";
const actionsUrl =
  "https://github.com/igordossantos/strategic-signal/actions/workflows/collect.yml";

function loadHistory(): { runs: CollectionRequest[]; error?: string } {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { runs: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Collection history has an invalid shape.");
    }
    return { runs: parsed };
  } catch (error) {
    return {
      runs: [],
      error:
        error instanceof Error ? error.message : "Collection history failed.",
    };
  }
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(): string {
  const now = new Date();
  return isoDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return isoDate(date);
}

function collectionMode(
  source: Source,
): "automatic" | "browser-assisted" | "reference" {
  if (source.collectionMode) return source.collectionMode;
  if (source.kind === "rss") return "automatic";
  if (source.kind === "linkedin") return "browser-assisted";
  return "reference";
}

function canonicalSourceUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

function powerShellQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function CollectionView({
  archive,
  sources,
  onSourcesChange,
  onNotify,
}: CollectionViewProps) {
  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(() => isoDate(new Date()));
  const [topics, setTopics] = useState("");
  const [topicMode, setTopicMode] = useState<"everything" | "topics">(
    "everything",
  );
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [mode, setMode] = useState("");
  const [selection, setSelection] = useState<Set<string> | null>(null);
  const [prepared, setPrepared] = useState<CollectionRequest | null>(null);
  const [initialHistory] = useState(loadHistory);
  const [history, setHistory] = useState<CollectionRequest[]>(
    initialHistory.runs,
  );
  const [formError, setFormError] = useState("");
  const [editorSource, setEditorSource] = useState<
    Source | null | undefined
  >(undefined);

  const collectionSources = useMemo(() => {
    const byUrl = new Map<string, Source>();
    for (const source of sources) {
      const key = canonicalSourceUrl(source.url);
      const existing = byUrl.get(key);
      if (!existing || (!existing.collectionMode && source.collectionMode)) {
        byUrl.set(key, source);
      }
    }
    return [...byUrl.values()];
  }, [sources]);

  useEffect(() => {
    if (!initialHistory.error) return;
    onNotify(
      `Collection history could not be loaded. ${initialHistory.error}`,
      "error",
    );
  }, [initialHistory.error, onNotify]);

  const selectedIds = useMemo(
    () =>
      selection ??
      new Set(
        collectionSources
          .filter(
            (source) =>
              source.enabled && collectionMode(source) === "automatic",
          )
          .map((source) => source.id),
      ),
    [collectionSources, selection],
  );

  const platforms = useMemo(
    () => uniqueSorted(collectionSources.flatMap((source) => source.platforms)),
    [collectionSources],
  );

  const shownSources = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return collectionSources
      .filter(
        (source) => !platform || source.platforms.includes(platform),
      )
      .filter(
        (source) => !mode || collectionMode(source) === mode,
      )
      .filter((source) => {
        if (!normalized) return true;
        return [
          source.name,
          source.url,
          source.kind,
          ...source.platforms,
          ...source.tags,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        const modeOrder = {
          automatic: 0,
          "browser-assisted": 1,
          reference: 2,
        };
        return (
          modeOrder[collectionMode(a)] -
            modeOrder[collectionMode(b)] || a.name.localeCompare(b.name)
        );
      });
  }, [collectionSources, mode, platform, query]);

  const selectedSources = useMemo(
    () =>
      collectionSources.filter((source) => selectedIds.has(source.id)),
    [collectionSources, selectedIds],
  );
  const archiveCandidates = useMemo(() => {
    if (!archive || !from || !to) return [];
    return archive.signals.filter((signal) => {
      const date = signal.publishedAt ?? signal.verifiedAt;
      return date >= from && date <= to;
    });
  }, [archive, from, to]);
  const sourceCounts = {
    automatic: selectedSources.filter(
      (source) => collectionMode(source) === "automatic",
    ).length,
    browser: selectedSources.filter(
      (source) => collectionMode(source) === "browser-assisted",
    ).length,
    reference: selectedSources.filter(
      (source) => collectionMode(source) === "reference",
    ).length,
  };

  function updateSelection(id: string): void {
    setSelection(() => {
      const next = new Set(selectedIds);
      if (selectedIds.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAutomatic(): void {
    setSelection(
      new Set(
        collectionSources
          .filter((source) => collectionMode(source) === "automatic")
          .map((source) => source.id),
      ),
    );
  }

  function selectShown(): void {
    setSelection(
      new Set([...selectedIds, ...shownSources.map((source) => source.id)]),
    );
  }

  function selectAll(): void {
    setSelection(new Set(collectionSources.map((source) => source.id)));
  }

  function clearSelection(): void {
    setSelection(new Set());
  }

  function applyPreset(preset: "7" | "30" | "month" | "since-last"): void {
    setTo(isoDate(new Date()));
    if (preset === "7") setFrom(daysAgo(6));
    if (preset === "30") setFrom(daysAgo(29));
    if (preset === "month") setFrom(startOfMonth());
    if (preset === "since-last") {
      setFrom(archive?.coverage.lastPullDate ?? startOfMonth());
    }
  }

  function prepareRun(event: FormEvent): void {
    event.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      setFormError("Choose a valid start and end date.");
      return;
    }
    if (from > to) {
      setFormError("The start date must be on or before the end date.");
      return;
    }
    if (!selectedIds.size) {
      setFormError("Select at least one source or person.");
      return;
    }
    const request: CollectionRequest = {
      id: `collection-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      from,
      to,
      sourceIds: [...selectedIds],
      sourceOverrides: selectedSources.filter(
        (source) =>
          !archive?.sources.some(
            (archivedSource) => archivedSource.id === source.id,
          ),
      ),
      topics:
        topicMode === "everything"
          ? []
          : topics
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
      topicMode,
      archiveCandidates: archiveCandidates.length,
      status: "prepared",
    };
    const nextHistory = [request, ...history].slice(0, 20);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      setHistory(nextHistory);
      setPrepared(request);
      setFormError("");
      onNotify("Collection run prepared.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Browser storage failed.";
      onNotify(`Collection run could not be saved. ${message}`, "error");
    }
  }

  function commandFor(request: CollectionRequest): string {
    return [
      "gh workflow run collect.yml",
      "--repo igordossantos/strategic-signal",
      `-f from=${powerShellQuote(request.from)}`,
      `-f to=${powerShellQuote(request.to)}`,
      `-f source_ids=${powerShellQuote(request.sourceIds.join(","))}`,
      `-f topics=${powerShellQuote(request.topics.join(","))}`,
      ...(request.sourceOverrides.length
        ? [
            `-f source_overrides=${powerShellQuote(
              JSON.stringify(request.sourceOverrides),
            )}`,
          ]
        : []),
    ].join(" ");
  }

  function saveSource(next: Source): void {
    const exists = sources.some((source) => source.id === next.id);
    onSourcesChange(
      exists
        ? sources.map((source) => (source.id === next.id ? next : source))
        : [...sources, next],
    );
    setEditorSource(undefined);
    if (!exists) {
      setSelection(new Set([...selectedIds, next.id]));
    }
    onNotify(exists ? "Source updated." : "Source added and selected.", "success");
  }

  function removeSource(source: Source): void {
    if (
      !window.confirm(
        `Remove “${source.name}” from this browser workspace and collection selection?`,
      )
    ) {
      return;
    }
    const sourceUrl = canonicalSourceUrl(source.url);
    const removedIds = sources
      .filter((item) => canonicalSourceUrl(item.url) === sourceUrl)
      .map((item) => item.id);
    onSourcesChange(
      sources.filter((item) => canonicalSourceUrl(item.url) !== sourceUrl),
    );
    setSelection(
      new Set(
        [...selectedIds].filter((sourceId) => !removedIds.includes(sourceId)),
      ),
    );
    onNotify("Source removed.", "success");
  }

  async function copyCommand(): Promise<void> {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(commandFor(prepared));
      onNotify("GitHub Actions command copied.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Clipboard access failed.";
      onNotify(`Could not copy the run command. ${message}`, "error");
    }
  }

  function downloadRequest(): void {
    if (!prepared) return;
    downloadText(
      `${prepared.id}.json`,
      `${JSON.stringify(prepared, null, 2)}\n`,
      "application/json;charset=utf-8",
    );
    onNotify("Collection request downloaded.", "success");
  }

  function downloadArchiveWindow(): void {
    if (!archive) return;
    downloadText(
      `strategic-signal-archive-${from}-to-${to}.json`,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          createdAt: new Date().toISOString(),
          window: { from, to },
          datePolicy:
            "Uses publication date when available; otherwise uses the prior research verification date.",
          items: archiveCandidates,
        },
        null,
        2,
      )}\n`,
      "application/json;charset=utf-8",
    );
    onNotify(
      `${archiveCandidates.length} reusable archive candidates downloaded without a new collection run.`,
      "success",
    );
  }

  return (
    <main className="page-shell collection-page" id="main-content">
      <section className="page-heading collection-heading">
        <div>
          <p className="eyebrow">Collection studio</p>
          <h1>Collect only what the archive does not already know.</h1>
          <p>
            Choose who and what Igor wants to review, set an exact date window,
            reuse prior research first, and send only the remaining public-feed
            work to a controlled GitHub Actions run.
          </p>
        </div>
        <a
          className="button button-secondary button-normal"
          href={actionsUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Play size={17} aria-hidden="true" />
          Open collection workflow
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </section>

      <section className="metric-strip" aria-label="Reusable archive summary">
        <div className="metric-card">
          <span>Reusable signals</span>
          <strong>{archive?.counts.normalizedSignals ?? "—"}</strong>
          <small>Normalized from both prior projects</small>
        </div>
        <div className="metric-card">
          <span>FabCon announcements</span>
          <strong>{archive?.counts.fabconAnnouncements ?? "—"}</strong>
          <small>Rich summaries and citations</small>
        </div>
        <div className="metric-card">
          <span>LinkedIn people</span>
          <strong>{archive?.counts.linkedInPeople ?? "—"}</strong>
          <small>Recovered from the curated roster</small>
        </div>
        <div className="metric-card">
          <span>Prior runs</span>
          <strong>{archive?.counts.priorRuns ?? "—"}</strong>
          <small>Including fingerprints and windows</small>
        </div>
      </section>

      <div className="info-banner collection-archive-banner">
        <Archive size={20} aria-hidden="true" />
        <div>
          <strong>Archive-first collection is active</strong>
          <p>
            The imported archive starts {archive?.coverage.archiveStarts ?? "—"},
            contains the FabCon research through{" "}
            {formatDate(archive?.coverage.fabconResearchCutoff)}, and retains the
            previous digest's deduplication fingerprints.
          </p>
        </div>
      </div>

      <form className="collection-layout" onSubmit={prepareRun}>
        <div className="collection-main">
          <section className="collection-panel" aria-labelledby="date-window-title">
            <div className="collection-panel-heading">
              <div className="step-number">01</div>
              <div>
                <p className="eyebrow">When</p>
                <h2 id="date-window-title">Set the collection window</h2>
              </div>
            </div>
            <div className="date-presets">
              <button type="button" onClick={() => applyPreset("7")}>
                Last 7 days
              </button>
              <button type="button" onClick={() => applyPreset("30")}>
                Last 30 days
              </button>
              <button type="button" onClick={() => applyPreset("month")}>
                This month
              </button>
              <button type="button" onClick={() => applyPreset("since-last")}>
                Since last pull
              </button>
            </div>
            <div className="date-range-fields">
              <label className="form-field">
                <span>From date</span>
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  required
                />
              </label>
              <span className="date-range-arrow" aria-hidden="true">
                →
              </span>
              <label className="form-field">
                <span>To date</span>
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  required
                />
              </label>
            </div>
          </section>

          <section className="collection-panel" aria-labelledby="topic-title">
            <div className="collection-panel-heading">
              <div className="step-number">02</div>
              <div>
                <p className="eyebrow">What</p>
                <h2 id="topic-title">Describe what to look for</h2>
              </div>
            </div>
            <div
              className="collection-topic-mode"
              role="radiogroup"
              aria-label="What to collect"
            >
              <label>
                <input
                  type="radio"
                  name="topic-mode"
                  value="everything"
                  checked={topicMode === "everything"}
                  onChange={() => setTopicMode("everything")}
                />
                <span>
                  <strong>Everything</strong>
                  <small>
                    Collect every item from the selected people and sources.
                    Their technology coverage provides the context.
                  </small>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="topic-mode"
                  value="topics"
                  checked={topicMode === "topics"}
                  onChange={() => setTopicMode("topics")}
                />
                <span>
                  <strong>Specific topics</strong>
                  <small>
                    Apply an additional keyword filter inside the selected
                    sources.
                  </small>
                </span>
              </label>
            </div>
            {topicMode === "topics" ? (
              <label className="form-field collection-topic-input">
                <span>Topics or technologies</span>
                <input
                  value={topics}
                  onChange={(event) => setTopics(event.target.value)}
                  placeholder="agents, governance, data products, SQL, security"
                />
                <small>Separate topics with commas.</small>
              </label>
            ) : (
              <div className="everything-mode-note">
                <Check size={17} aria-hidden="true" />
                <p>
                  No content keyword filter will be sent. If a person is tagged
                  for a specific technology, everything captured from that
                  person retains that source context.
                </p>
              </div>
            )}
          </section>

          <section className="collection-panel" aria-labelledby="sources-title">
            <div className="collection-panel-heading">
              <div className="step-number">03</div>
              <div>
                <p className="eyebrow">Who and where</p>
                <h2 id="sources-title">Choose sources and people</h2>
              </div>
            </div>

            <div className="collection-source-toolbar">
              <label className="search-field">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Search collection sources</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search people, sources, platforms, or tags"
                />
              </label>
              <label className="select-field">
                <span>Technology</span>
                <select
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                >
                  <option value="">All technologies</option>
                  {platforms.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="select-field">
                <span>Collection mode</span>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value)}
                >
                  <option value="">All modes</option>
                  <option value="automatic">Automatic feeds</option>
                  <option value="browser-assisted">Browser-assisted</option>
                  <option value="reference">Reference / manual</option>
                </select>
              </label>
            </div>

            <div className="collection-select-actions">
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={() => setEditorSource(null)}
              >
                <Plus size={15} aria-hidden="true" />
                Add source
              </Button>
              <Button type="button" variant="quiet" size="small" onClick={selectAll}>
                <Check size={15} aria-hidden="true" />
                Select all
              </Button>
              <Button type="button" variant="quiet" size="small" onClick={selectAutomatic}>
                <Rss size={15} aria-hidden="true" />
                Automatic feeds
              </Button>
              <Button type="button" variant="quiet" size="small" onClick={selectShown}>
                <Check size={15} aria-hidden="true" />
                Select shown
              </Button>
              <Button type="button" variant="quiet" size="small" onClick={clearSelection}>
                Clear
              </Button>
            </div>

            <div className="collection-source-list">
              {shownSources.map((source) => {
                const sourceMode = collectionMode(source);
                const Icon =
                  source.kind === "rss"
                    ? Rss
                    : source.kind === "linkedin"
                      ? MessageSquareText
                      : source.kind === "documentation"
                        ? CodeXml
                        : Globe2;
                const selectorId = `collect-source-${source.id}`;
                const coverage = uniqueSorted([
                  ...source.platforms,
                  ...source.tags.filter((tag) => tag !== "linkedin"),
                ]).slice(0, 4);
                return (
                  <div className="collection-source-row" key={source.id}>
                    <input
                      id={selectorId}
                      type="checkbox"
                      checked={selectedIds.has(source.id)}
                      onChange={() => updateSelection(source.id)}
                    />
                    <label
                      className="collection-source-main"
                      htmlFor={selectorId}
                    >
                    <span className="source-check" aria-hidden="true">
                      <Check size={13} />
                    </span>
                    <span className="collection-source-icon" aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <span className="collection-source-name">
                      <strong>{source.name}</strong>
                      <small>
                        {coverage.join(" · ") || "General technology"}
                      </small>
                    </span>
                    </label>
                    <Badge
                      tone={
                        sourceMode === "automatic"
                          ? "success"
                          : sourceMode === "browser-assisted"
                            ? "accent"
                            : "neutral"
                      }
                    >
                      {sourceMode === "automatic"
                        ? "Automatic"
                        : sourceMode === "browser-assisted"
                          ? "Browser-assisted"
                          : "Reference"}
                    </Badge>
                    <div className="collection-source-actions">
                      <Button
                        type="button"
                        variant="quiet"
                        size="icon"
                        aria-label={`Edit ${source.name}`}
                        onClick={() => setEditorSource(source)}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="quiet"
                        size="icon"
                        aria-label={`Delete ${source.name}`}
                        onClick={() => removeSource(source)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="collection-summary">
          <div className="collection-summary-card">
            <p className="eyebrow">Run summary</p>
            <h2>
              {formatDate(from)} <span>→</span> {formatDate(to)}
            </h2>
            <dl>
              <div>
                <dt>Selected</dt>
                <dd>{selectedSources.length}</dd>
              </div>
              <div>
                <dt>Automatic feeds</dt>
                <dd>{sourceCounts.automatic}</dd>
              </div>
              <div>
                <dt>Browser-assisted people</dt>
                <dd>{sourceCounts.browser}</dd>
              </div>
              <div>
                <dt>Reference sources</dt>
                <dd>{sourceCounts.reference}</dd>
              </div>
              <div>
                <dt>Content</dt>
                <dd>
                  {topicMode === "everything"
                    ? "Everything"
                    : `${topics
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean).length} topics`}
                </dd>
              </div>
              <div>
                <dt>Archive candidates</dt>
                <dd>{archiveCandidates.length}</dd>
              </div>
            </dl>
            <div className="archive-reuse-callout">
              <Database size={18} aria-hidden="true" />
              <p>
                Existing records are matched by canonical URL and title before
                a result is marked new.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="reuse-archive-button"
              disabled={!archiveCandidates.length}
              onClick={downloadArchiveWindow}
            >
              <Archive size={16} aria-hidden="true" />
              Reuse {archiveCandidates.length} archive candidates
            </Button>
            {formError ? (
              <p className="form-error">{formError}</p>
            ) : null}
            <Button type="submit" variant="primary" className="prepare-run-button">
              <Filter size={17} aria-hidden="true" />
              Prepare collection run
            </Button>
          </div>

          <div className="collection-mode-guide">
            <div>
              <Rss size={17} aria-hidden="true" />
              <p>
                <strong>Automatic</strong>
                RSS and Atom feeds run in GitHub Actions.
              </p>
            </div>
            <div>
              <MousePointerClick size={17} aria-hidden="true" />
              <p>
                <strong>Browser-assisted</strong>
                LinkedIn stays in your signed-in browser.
              </p>
            </div>
            <div>
              <Globe2 size={17} aria-hidden="true" />
              <p>
                <strong>Reference</strong>
                Retained for review until a dedicated collector exists.
              </p>
            </div>
          </div>
        </aside>
      </form>

      {prepared ? (
        <section className="prepared-run" aria-labelledby="prepared-run-title">
          <div className="prepared-run-heading">
            <div className="prepared-run-icon" aria-hidden="true">
              <CloudDownload size={22} />
            </div>
            <div>
              <p className="eyebrow">Ready to run</p>
              <h2 id="prepared-run-title">
                Collection request prepared
              </h2>
              <p>
                GitHub Actions will fetch automatic feeds and return one JSON
                artifact. Browser-assisted and reference sources are preserved
                as an explicit queue in the same result.
              </p>
            </div>
          </div>
          <pre>
            <code>{commandFor(prepared)}</code>
          </pre>
          <div className="prepared-run-actions">
            <Button type="button" variant="secondary" onClick={() => void copyCommand()}>
              <Clipboard size={16} aria-hidden="true" />
              Copy command
            </Button>
            <Button type="button" variant="secondary" onClick={downloadRequest}>
              <FileJson size={16} aria-hidden="true" />
              Download request
            </Button>
            <a
              className="button button-primary button-normal"
              href={actionsUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Play size={16} aria-hidden="true" />
              Open GitHub Actions
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      ) : null}

      {history.length ? (
        <section className="collection-history" aria-labelledby="run-history-title">
          <div className="section-heading">
            <p className="eyebrow">Local history</p>
            <h2 id="run-history-title">Prepared collection runs</h2>
          </div>
          <div className="history-list">
            {history.slice(0, 6).map((run) => (
              <article key={run.id}>
                <div className="history-icon" aria-hidden="true">
                  <Clock3 size={18} />
                </div>
                <div>
                  <strong>
                    {formatDate(run.from)} → {formatDate(run.to)}
                  </strong>
                  <span>
                    {run.sourceIds.length} sources ·{" "}
                    {run.topicMode === "everything" || !run.topics.length
                      ? "everything"
                      : run.topics.join(", ")}
                  </span>
                </div>
                <Badge tone="neutral">{run.status}</Badge>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="method-card collection-safety-note">
        <CircleAlert size={19} aria-hidden="true" />
        <div>
          <strong>Coverage remains explicit</strong>
          <p>
            A date-window run can fully enumerate supported feeds. LinkedIn and
            reference sources are never reported as complete unless their
            capture step actually ran and recorded its limits.
          </p>
        </div>
      </div>

      {editorSource !== undefined ? (
        <SourceEditorModal
          key={editorSource?.id ?? "new-collection-source"}
          source={editorSource}
          sources={sources}
          onSave={saveSource}
          onClose={() => setEditorSource(undefined)}
        />
      ) : null}
    </main>
  );
}
