import {
  BookOpen,
  Brain,
  Check,
  Clipboard,
  Download,
  ExternalLink,
  FileJson,
  Library,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchWorkflowRuns,
  type WorkflowRun,
} from "../lib/githubRuns";
import { importDigestDocument } from "../lib/digestImport";
import {
  formatDate,
  normalize,
  signalSearchText,
  uniqueSorted,
} from "../lib/signals";
import { downloadText } from "../lib/workspace";
import type {
  DigestDepth,
  DigestDocument,
  DigestIntent,
  Guidance,
  Signal,
} from "../types";
import { Badge, Button, EmptyState } from "./ui";

interface DigestViewProps {
  signals: Signal[];
  prioritySignals: Guidance[];
  selectionIds: string[];
  discussionIds: string[];
  digests: DigestDocument[];
  onSelectionChange: (ids: string[]) => void;
  onImportDigest: (digest: DigestDocument) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

interface DigestRequest {
  id: string;
  createdAt: string;
  intent: DigestIntent;
  depth: DigestDepth;
  audience: string;
  instructions: string;
  selection: Array<{
    id: string;
    title: string;
    platform: string;
    section: string;
    summary: string;
    details: string[];
    status: string;
    evidence: string;
    nextStep: string;
    hashtags: string[];
    links: Signal["links"];
    relevance: Signal["relevance"];
  }>;
}

const digestWorkflowUrl =
  "https://github.com/igordossantos/strategic-signal/actions/workflows/digest.yml";

function powerShellQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function runLabel(run: WorkflowRun): string {
  if (run.status !== "completed") {
    return run.status === "in_progress" ? "Running" : "Queued";
  }
  return run.conclusion === "success"
    ? "Succeeded"
    : run.conclusion ?? "Completed";
}

export function DigestView({
  signals,
  prioritySignals,
  selectionIds,
  discussionIds,
  digests,
  onSelectionChange,
  onImportDigest,
  onNotify,
}: DigestViewProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<
    "current" | "collected" | "archive" | "all"
  >("current");
  const [platform, setPlatform] = useState("");
  const [intent, setIntent] = useState<DigestIntent>("brief");
  const [depth, setDepth] = useState<DigestDepth>("standard");
  const [audience, setAudience] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prepared, setPrepared] = useState<DigestRequest | null>(null);
  const [activeDigestId, setActiveDigestId] = useState(digests[0]?.id ?? "");
  const [remoteRuns, setRemoteRuns] = useState<WorkflowRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [runsError, setRunsError] = useState("");
  const digestInput = useRef<HTMLInputElement>(null);

  const platforms = useMemo(
    () => uniqueSorted(signals.map((signal) => signal.platform)),
    [signals],
  );
  const audiences = useMemo(
    () =>
      uniqueSorted(
        prioritySignals
          .filter((priority) => priority.active)
          .map((priority) => priority.audience),
      ),
    [prioritySignals],
  );
  const shown = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return signals
      .filter((signal) => {
        const archived = signal.tags.includes("imported archive");
        const collected = signal.tags.includes("collected-run");
        if (scope === "current" && (archived || collected)) return false;
        if (scope === "collected" && !collected) return false;
        if (scope === "archive" && !archived) return false;
        if (platform && signal.platform !== platform) return false;
        if (!tokens.length) return true;
        const text = signalSearchText(signal);
        return tokens.every((token) => text.includes(token));
      })
      .sort(
        (a, b) =>
          (b.publishedAt ?? b.verifiedAt).localeCompare(
            a.publishedAt ?? a.verifiedAt,
          ) || a.title.localeCompare(b.title),
      );
  }, [platform, query, scope, signals]);
  const selected = useMemo(
    () =>
      selectionIds
        .map((id) => signals.find((signal) => signal.id === id))
        .filter((signal): signal is Signal => Boolean(signal)),
    [selectionIds, signals],
  );
  const localGroups = useMemo(() => {
    const groups = new Map<string, Signal[]>();
    for (const signal of selected) {
      const key = `${signal.platform} · ${signal.section}`;
      groups.set(key, [...(groups.get(key) ?? []), signal]);
    }
    return [...groups];
  }, [selected]);
  const activeDigest =
    digests.find((digest) => digest.id === activeDigestId) ?? digests[0];

  const refreshRuns = useCallback(async (showLoading = false) => {
    if (showLoading) setRunsLoading(true);
    try {
      const result = await fetchWorkflowRuns("digest.yml");
      setRemoteRuns(result.runs);
      setRunsError("");
    } catch (error) {
      setRunsError(
        error instanceof Error
          ? error.message
          : "AI digest status could not be loaded.",
      );
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    // External workflow state is synchronized on mount and at a bounded interval.
    // oxlint-disable-next-line react/set-state-in-effect
    void refreshRuns();
    const timer = window.setInterval(() => {
      void refreshRuns();
    }, 90_000);
    return () => window.clearInterval(timer);
  }, [refreshRuns]);

  function toggleSelection(id: string): void {
    onSelectionChange(
      selectionIds.includes(id)
        ? selectionIds.filter((item) => item !== id)
        : [...selectionIds, id],
    );
  }

  function selectVisible(): void {
    const next = [...new Set([...selectionIds, ...shown.map((item) => item.id)])];
    if (next.length > 30) {
      onNotify(
        "The reading digest is limited to 30 items. Narrow the visible list before selecting all.",
        "error",
      );
      return;
    }
    onSelectionChange(next);
  }

  function addDiscussionList(): void {
    const next = [...new Set([...selectionIds, ...discussionIds])];
    onSelectionChange(next.slice(0, 30));
    onNotify("Discussion-list items added to the digest selection.", "success");
  }

  function prepareAiDigest(): void {
    if (!selected.length) {
      onNotify("Select at least one item before preparing a digest.", "error");
      return;
    }
    if (selected.length > 15) {
      onNotify(
        "AI digests are limited to 15 items to preserve summary quality. The local reading digest supports 30.",
        "error",
      );
      return;
    }
    const request: DigestRequest = {
      id: `digest-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      intent,
      depth,
      audience,
      instructions: instructions.trim(),
      selection: selected.map((signal) => ({
        id: signal.id,
        title: signal.title,
        platform: signal.platform,
        section: signal.section,
        summary: signal.summary,
        details: signal.details.slice(0, 6),
        status: signal.status,
        evidence: signal.evidence,
        nextStep: signal.nextStep,
        hashtags: signal.hashtags ?? [],
        links: signal.links,
        relevance: signal.relevance,
      })),
    };
    const command = commandFor(request);
    if (command.length > 25_000) {
      onNotify(
        "The AI request is too large for workflow dispatch. Select fewer items or use concise source details.",
        "error",
      );
      return;
    }
    setPrepared(request);
    onNotify("AI digest request prepared.", "success");
  }

  function commandFor(request: DigestRequest): string {
    return [
      "gh workflow run digest.yml",
      "--repo igordossantos/strategic-signal",
      `-f request_id=${powerShellQuote(request.id)}`,
      `-f intent=${powerShellQuote(request.intent)}`,
      `-f depth=${powerShellQuote(request.depth)}`,
      `-f audience=${powerShellQuote(request.audience)}`,
      `-f instructions=${powerShellQuote(request.instructions)}`,
      `-f selection_json=${powerShellQuote(JSON.stringify(request.selection))}`,
    ].join(" ");
  }

  async function copyCommand(): Promise<void> {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(commandFor(prepared));
      onNotify("AI digest command copied.", "success");
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "Clipboard access failed.",
        "error",
      );
    }
  }

  function downloadRequest(): void {
    if (!prepared) return;
    downloadText(
      `${prepared.id}.json`,
      `${JSON.stringify(prepared, null, 2)}\n`,
      "application/json;charset=utf-8",
    );
  }

  async function importDigest(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const digest = importDigestDocument(await file.text());
      onImportDigest(digest);
      setActiveDigestId(digest.id);
      onNotify(`Imported AI digest “${digest.title}”.`, "success");
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "Digest import failed.",
        "error",
      );
    }
  }

  return (
    <main className="page-shell digest-page" id="main-content">
      <section className="page-heading digest-heading">
        <div>
          <p className="eyebrow">Digest studio</p>
          <h1>Select the signal. Build the reading.</h1>
          <p>
            Centralize collected items, choose what matters now, read an
            immediate structured digest, and optionally ask a strong Azure
            OpenAI deployment for a deeper synthesis.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={addDiscussionList}
          disabled={!discussionIds.length}
        >
          <Plus size={17} aria-hidden="true" />
          Add discussion list
        </Button>
      </section>

      <section className="metric-strip" aria-label="Digest summary">
        <div className="metric-card">
          <span>Centralized catalog</span>
          <strong>{signals.length}</strong>
          <small>Current, collected, and archive items</small>
        </div>
        <div className="metric-card">
          <span>Selected</span>
          <strong>{selected.length}</strong>
          <small>30 local · 15 AI maximum</small>
        </div>
        <div className="metric-card">
          <span>Collected runs</span>
          <strong>
            {signals.filter((signal) => signal.tags.includes("collected-run")).length}
          </strong>
          <small>Imported into this browser</small>
        </div>
        <div className="metric-card">
          <span>AI digests</span>
          <strong>{digests.length}</strong>
          <small>Imported into the private library</small>
        </div>
      </section>

      <div className="digest-builder-layout">
        <section className="digest-catalog" aria-labelledby="digest-catalog-title">
          <div className="digest-panel-heading">
            <div>
              <p className="eyebrow">Choose</p>
              <h2 id="digest-catalog-title">Centralized intelligence</h2>
            </div>
            <Button type="button" variant="quiet" size="small" onClick={selectVisible}>
              <Check size={15} aria-hidden="true" />
              Select visible
            </Button>
          </div>
          <div className="digest-toolbar">
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search digest items</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, summaries, hashtags, or customers"
              />
            </label>
            <label className="select-field">
              <span>Catalog</span>
              <select
                value={scope}
                onChange={(event) =>
                  setScope(
                    event.target.value as
                      | "current"
                      | "collected"
                      | "archive"
                      | "all",
                  )
                }
              >
                <option value="current">Current briefing</option>
                <option value="collected">Collected runs</option>
                <option value="archive">Imported archive</option>
                <option value="all">Everything</option>
              </select>
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
          </div>
          <div className="digest-item-list">
            {shown.map((signal) => (
              <label className="digest-item-row" key={signal.id}>
                <input
                  type="checkbox"
                  checked={selectionIds.includes(signal.id)}
                  onChange={() => toggleSelection(signal.id)}
                />
                <span className="source-check" aria-hidden="true">
                  <Check size={13} />
                </span>
                <span className="digest-item-content">
                  <span>
                    {signal.platform} / {signal.section}
                  </span>
                  <strong>{signal.title}</strong>
                  <small>{signal.summary}</small>
                </span>
                <Badge tone={signal.evidence === "confirmed" ? "official" : "neutral"}>
                  {signal.status}
                </Badge>
              </label>
            ))}
          </div>
        </section>

        <aside className="digest-selection">
          <div className="digest-selection-heading">
            <div>
              <p className="eyebrow">Selected</p>
              <h2>Your reading queue</h2>
            </div>
            <Button
              type="button"
              variant="quiet"
              size="small"
              disabled={!selectionIds.length}
              onClick={() => onSelectionChange([])}
            >
              Clear
            </Button>
          </div>
          {selected.length ? (
            <ol>
              {selected.map((signal) => (
                <li key={signal.id}>
                  <span>{signal.platform}</span>
                  <strong>{signal.title}</strong>
                  <button
                    type="button"
                    aria-label={`Remove ${signal.title} from digest`}
                    onClick={() => toggleSelection(signal.id)}
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<ListChecks size={24} />}
              title="Nothing selected"
              description="Choose items from the centralized catalog or add your discussion list."
            />
          )}
        </aside>
      </div>

      <section className="local-digest" aria-labelledby="local-digest-title">
        <div className="section-heading">
          <p className="eyebrow">Read now</p>
          <h2 id="local-digest-title">Structured reading digest</h2>
          <p>
            This immediate version uses source summaries and evidence without
            sending content to an external model.
          </p>
        </div>
        {selected.length ? (
          <div className="local-digest-content">
            <div className="digest-executive-note">
              <BookOpen size={20} aria-hidden="true" />
              <p>
                {selected.length} selected items across{" "}
                {new Set(selected.map((signal) => signal.platform)).size}{" "}
                technologies.{" "}
                {
                  selected.filter(
                    (signal) => signal.status === "Generally available",
                  ).length
                }{" "}
                are generally available and{" "}
                {selected.filter((signal) => signal.protected.length).length}{" "}
                are protected signals.
              </p>
            </div>
            {localGroups.map(([group, items]) => (
              <section key={group}>
                <h3>{group}</h3>
                {items.map((signal) => (
                  <article key={signal.id}>
                    <div>
                      <Badge tone="neutral">{signal.status}</Badge>
                      <span>
                        {signal.publishedAt
                          ? formatDate(signal.publishedAt)
                          : `Verified ${formatDate(signal.verifiedAt)}`}
                      </span>
                    </div>
                    <h4>{signal.title}</h4>
                    <p>{signal.summary}</p>
                    <strong>Suggested next step</strong>
                    <p>{signal.nextStep}</p>
                  </article>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={25} />}
            title="Select items to build the digest"
            description="The reading digest updates immediately as you select or remove items."
          />
        )}
      </section>

      <section className="ai-digest-panel" aria-labelledby="ai-digest-title">
        <div className="ai-digest-heading">
          <div className="ai-digest-icon" aria-hidden="true">
            <Brain size={22} />
          </div>
          <div>
            <p className="eyebrow">Optional strong-LLM synthesis</p>
            <h2 id="ai-digest-title">Azure OpenAI digest</h2>
            <p>
              Runs privately in GitHub Actions with repository secrets. No API
              key or model credential is placed in the public application.
            </p>
          </div>
        </div>
        <div className="ai-config-note">
          <strong>Required repository secrets</strong>
          <code>AZURE_OPENAI_ENDPOINT</code>
          <code>AZURE_OPENAI_API_KEY</code>
          <code>AZURE_OPENAI_DEPLOYMENT</code>
          <span>
            Optional variable: <code>AZURE_OPENAI_API_VERSION</code>
          </span>
        </div>
        <div className="ai-digest-settings">
          <label className="select-field">
            <span>Intent</span>
            <select
              value={intent}
              onChange={(event) =>
                setIntent(event.target.value as DigestIntent)
              }
            >
              <option value="brief">Internal briefing</option>
              <option value="customer">Customer-ready</option>
              <option value="learn">Learning digest</option>
              <option value="executive">Executive summary</option>
            </select>
          </label>
          <label className="select-field">
            <span>Depth</span>
            <select
              value={depth}
              onChange={(event) =>
                setDepth(event.target.value as DigestDepth)
              }
            >
              <option value="concise">Concise</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>
          </label>
          <label className="select-field">
            <span>Audience</span>
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              <option value="">No specific audience</option>
              {audiences.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field ai-instructions">
            <span>Additional instructions</span>
            <textarea
              rows={3}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Emphasize operational implications and questions I should be ready to answer."
            />
          </label>
        </div>
        <div className="ai-digest-actions">
          <Button type="button" variant="primary" onClick={prepareAiDigest}>
            <Sparkles size={17} aria-hidden="true" />
            Prepare AI digest
          </Button>
          <input
            ref={digestInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void importDigest(event)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => digestInput.current?.click()}
          >
            <FileJson size={16} aria-hidden="true" />
            Import completed digest
          </Button>
          <Button
            type="button"
            variant="quiet"
            size="small"
            disabled={runsLoading}
            onClick={() => void refreshRuns(true)}
          >
            <RefreshCw
              size={15}
              className={runsLoading ? "status-refreshing" : ""}
              aria-hidden="true"
            />
            Refresh AI status
          </Button>
        </div>
        {runsError ? <p className="form-error">{runsError}</p> : null}
        {remoteRuns.length ? (
          <div className="digest-run-list">
            {remoteRuns.slice(0, 5).map((run) => (
              <a
                href={run.url}
                target="_blank"
                rel="noreferrer noopener"
                key={run.id}
              >
                <span>
                  <strong>{run.displayTitle}</strong>
                  <small>Run #{run.id}</small>
                </span>
                <Badge
                  tone={
                    run.status === "completed" &&
                    run.conclusion === "success"
                      ? "success"
                      : run.status === "completed"
                        ? "danger"
                        : "accent"
                  }
                >
                  {runLabel(run)}
                </Badge>
              </a>
            ))}
          </div>
        ) : null}
      </section>

      {prepared ? (
        <section className="prepared-run digest-prepared-run">
          <div className="prepared-run-heading">
            <div className="prepared-run-icon" aria-hidden="true">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="eyebrow">Ready for Azure OpenAI</p>
              <h2>AI digest request prepared</h2>
              <p>
                Configure the documented repository secrets, run the workflow,
                download <code>digest.json</code>, and import it above.
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
              <Download size={16} aria-hidden="true" />
              Download request
            </Button>
            <a
              className="button button-primary button-normal"
              href={digestWorkflowUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Play size={16} aria-hidden="true" />
              Open AI workflow
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      ) : null}

      {digests.length ? (
        <section className="digest-library" aria-labelledby="digest-library-title">
          <div className="section-heading">
            <p className="eyebrow">Private browser library</p>
            <h2 id="digest-library-title">AI-generated digests</h2>
          </div>
          <div className="digest-library-tabs">
            {digests.map((digest) => (
              <button
                type="button"
                key={digest.id}
                className={digest.id === activeDigest?.id ? "active" : ""}
                onClick={() => setActiveDigestId(digest.id)}
              >
                <Library size={15} aria-hidden="true" />
                {digest.title}
              </button>
            ))}
          </div>
          {activeDigest ? (
            <article className="ai-digest-document">
              <div className="ai-document-heading">
                <div>
                  <Badge tone="accent">
                    {activeDigest.provider} · {activeDigest.model}
                  </Badge>
                  <h2>{activeDigest.title}</h2>
                  <p>
                    Generated {formatDate(activeDigest.generatedAt.slice(0, 10))}
                  </p>
                </div>
              </div>
              <section>
                <h3>Executive summary</h3>
                <p>{activeDigest.executiveSummary}</p>
              </section>
              <section>
                <h3>Key themes</h3>
                {activeDigest.keyThemes.map((theme) => (
                  <div key={theme.title}>
                    <h4>{theme.title}</h4>
                    <p>{theme.summary}</p>
                  </div>
                ))}
              </section>
              <section>
                <h3>Must know</h3>
                {activeDigest.mustKnow.map((item) => (
                  <div key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.why}</p>
                    <Badge tone="neutral">{item.status}</Badge>
                  </div>
                ))}
              </section>
              {activeDigest.customerConnections.length ? (
                <section>
                  <h3>Customer connections</h3>
                  {activeDigest.customerConnections.map((item) => (
                    <div key={`${item.audience}-${item.reason}`}>
                      <h4>{item.audience}</h4>
                      <p>{item.reason}</p>
                    </div>
                  ))}
                </section>
              ) : null}
              <section>
                <h3>Questions to be ready for</h3>
                <ul>
                  {activeDigest.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </section>
              {activeDigest.caveats.length ? (
                <section>
                  <h3>Caveats</h3>
                  <ul>
                    {activeDigest.caveats.map((caveat) => (
                      <li key={caveat}>{caveat}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </article>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
