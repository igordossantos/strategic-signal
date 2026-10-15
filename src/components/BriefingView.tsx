import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Layers3,
  PanelTopClose,
  PanelTopOpen,
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  emptyFilters,
  filterSignals,
  groupSignals,
  maxRelevance,
  signalsToCsv,
  signalsToMarkdown,
  sortSignals,
  uniqueSorted,
} from "../lib/signals";
import { downloadText } from "../lib/workspace";
import { platformOrder } from "../data/seed";
import type {
  Signal,
  SignalFilters,
  SignalSort,
  Source,
} from "../types";
import { SignalCard } from "./SignalCard";
import { Badge, Button, EmptyState, Modal } from "./ui";

interface BriefingViewProps {
  signals: Signal[];
  sources: Source[];
  filters: SignalFilters;
  onFiltersChange: (filters: SignalFilters) => void;
  sort: SignalSort;
  onSortChange: (sort: SignalSort) => void;
  pinnedSignalIds: string[];
  onTogglePinned: (id: string) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

export function BriefingView({
  signals,
  sources,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  pinnedSignalIds,
  onTogglePinned,
  onNotify,
}: BriefingViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [discussionOpen, setDiscussionOpen] = useState(false);

  const audiences = useMemo(
    () =>
      uniqueSorted(
        signals.flatMap((signal) =>
          signal.relevance.map((item) => item.audience),
        ),
      ),
    [signals],
  );
  const platforms = useMemo(
    () => uniqueSorted(signals.map((signal) => signal.platform)),
    [signals],
  );
  const sections = useMemo(
    () =>
      uniqueSorted(
        signals
          .filter(
            (signal) =>
              !filters.platform || signal.platform === filters.platform,
          )
          .map((signal) => signal.section),
      ),
    [filters.platform, signals],
  );
  const statuses = useMemo(
    () => uniqueSorted(signals.map((signal) => signal.status)),
    [signals],
  );

  const visibleSignals = useMemo(
    () =>
      sortSignals(
        filterSignals(signals, filters),
        sort,
        filters.audience,
      ),
    [filters, signals, sort],
  );
  const groups = useMemo(
    () => groupSignals(visibleSignals, platformOrder),
    [visibleSignals],
  );
  const pinnedSignals = useMemo(
    () =>
      sortSignals(
        signals.filter((signal) => pinnedSignalIds.includes(signal.id)),
        "relevance",
        filters.audience,
      ),
    [filters.audience, pinnedSignalIds, signals],
  );
  const highRelevance = visibleSignals.filter(
    (signal) => maxRelevance(signal, filters.audience) >= 90,
  ).length;
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "customerSafeOnly") return value !== true;
    return value !== emptyFilters[key as keyof SignalFilters];
  }).length;

  function setFilter<Key extends keyof SignalFilters>(
    key: Key,
    value: SignalFilters[Key],
  ): void {
    const next = { ...filters, [key]: value };
    if (key === "platform" && value !== filters.platform) next.section = "";
    onFiltersChange(next);
  }

  function resetFilters(): void {
    onFiltersChange({ ...emptyFilters });
  }

  function toggleGroup(key: string): void {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copyDiscussion(): Promise<void> {
    if (!pinnedSignals.length) return;
    try {
      await navigator.clipboard.writeText(
        signalsToMarkdown(pinnedSignals, sources, filters.audience),
      );
      onNotify("Discussion list copied as Markdown.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Clipboard access failed.";
      onNotify(`Could not copy the discussion list. ${message}`, "error");
    }
  }

  function exportDiscussion(format: "md" | "csv"): void {
    if (!pinnedSignals.length) return;
    if (format === "csv") {
      downloadText(
        "strategic-signal-discussion.csv",
        signalsToCsv(pinnedSignals, sources, filters.audience),
        "text/csv;charset=utf-8",
      );
    } else {
      downloadText(
        "strategic-signal-discussion.md",
        signalsToMarkdown(pinnedSignals, sources, filters.audience),
        "text/markdown;charset=utf-8",
      );
    }
    onNotify(
      `Discussion list downloaded as ${format.toUpperCase()}.`,
      "success",
    );
  }

  return (
    <main id="main-content">
      <section className="briefing-hero">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="page-shell hero-content">
          <div className="hero-copy">
            <div className="hero-status">
              <span aria-hidden="true" />
              Research snapshot verified Oct 6, 2026
            </div>
            <p className="eyebrow">Data · Analytics · AI intelligence</p>
            <h1>
              Turn technology noise into{" "}
              <span>customer-ready signal.</span>
            </h1>
            <p className="hero-lede">
              One evidence-backed briefing across Fabric, Foundry, Databricks,
              SQL, and the data platform—ranked against the conversations that
              matter now.
            </p>
            <div className="hero-actions">
              <Button
                type="button"
                variant="primary"
                onClick={() =>
                  document
                    .getElementById("signal-search")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                <Search size={18} aria-hidden="true" />
                Explore the briefing
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDiscussionOpen(true)}
              >
                <Bookmark size={18} aria-hidden="true" />
                Discussion list
                {pinnedSignalIds.length ? (
                  <span className="button-count">{pinnedSignalIds.length}</span>
                ) : null}
              </Button>
            </div>
          </div>

          <div className="hero-intelligence" aria-label="Intelligence snapshot">
            <div className="intelligence-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="intelligence-card intelligence-card-main">
              <div className="intelligence-label">
                <Sparkles size={16} aria-hidden="true" />
                Strategic match
              </div>
              <strong>98</strong>
              <p>Policies in Fabric</p>
              <small>Farmers Insurance · Data product management</small>
            </div>
            <div className="intelligence-card intelligence-card-secondary">
              <span>Protected signal</span>
              <strong>API retirement</strong>
              <small>Hard date · action required</small>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell briefing-shell">
        <section className="metric-strip briefing-metrics" aria-label="Briefing summary">
          <button
            type="button"
            className="metric-card metric-card-button"
            onClick={resetFilters}
          >
            <span>Signals cataloged</span>
            <strong>{signals.length}</strong>
            <small>Across {platforms.length} platforms</small>
          </button>
          <button
            type="button"
            className="metric-card metric-card-button"
            onClick={() => setFilter("protectedOnly", true)}
          >
            <span>Protected signals</span>
            <strong>
              {signals.filter((signal) => signal.protected.length).length}
            </strong>
            <small>Never suppressed by preferences</small>
          </button>
          <button
            type="button"
            className="metric-card metric-card-button"
            onClick={() => setFilter("status", "Generally available")}
          >
            <span>Ready to evaluate</span>
            <strong>
              {
                signals.filter(
                  (signal) => signal.status === "Generally available",
                ).length
              }
            </strong>
            <small>Confirmed generally available</small>
          </button>
          <button
            type="button"
            className="metric-card metric-card-button"
            onClick={() => setDiscussionOpen(true)}
          >
            <span>Discussion list</span>
            <strong>{pinnedSignalIds.length}</strong>
            <small>Selected for the next conversation</small>
          </button>
        </section>

        <section className="audience-strip" aria-label="Audience shortcuts">
          <div>
            <span>Focus the briefing</span>
            <strong>Who are you meeting?</strong>
          </div>
          <div className="audience-chips">
            <button
              type="button"
              className={!filters.audience ? "audience-chip-active" : ""}
              onClick={() => setFilter("audience", "")}
            >
              Every audience
            </button>
            {audiences.map((audience) => (
              <button
                type="button"
                key={audience}
                className={
                  filters.audience === audience ? "audience-chip-active" : ""
                }
                onClick={() => setFilter("audience", audience)}
              >
                {audience}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-panel" aria-labelledby="catalog-heading">
          <div className="filter-panel-heading">
            <div>
              <p className="eyebrow">Signal catalog</p>
              <h2 id="catalog-heading">Find the answer before the meeting</h2>
            </div>
            <div className="filter-heading-actions">
              {activeFilterCount ? (
                <Badge tone="accent">
                  {activeFilterCount} active filter
                  {activeFilterCount === 1 ? "" : "s"}
                </Badge>
              ) : null}
              <Button
                type="button"
                variant="quiet"
                size="small"
                onClick={resetFilters}
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>

          <div className="filter-grid">
            <label className="catalog-search">
              <Search size={20} aria-hidden="true" />
              <span className="sr-only">Search the signal catalog</span>
              <input
                id="signal-search"
                type="search"
                value={filters.query}
                onChange={(event) => setFilter("query", event.target.value)}
                placeholder="Search features, customer needs, products, or authors"
              />
              <kbd>/</kbd>
            </label>
            <label className="select-field">
              <span>Platform</span>
              <select
                value={filters.platform}
                onChange={(event) => setFilter("platform", event.target.value)}
              >
                <option value="">All platforms</option>
                {platforms.map((platform) => (
                  <option value={platform} key={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>Section</span>
              <select
                value={filters.section}
                onChange={(event) => setFilter("section", event.target.value)}
              >
                <option value="">All sections</option>
                {sections.map((section) => (
                  <option value={section} key={section}>
                    {section}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>Availability</span>
              <select
                value={filters.status}
                onChange={(event) => setFilter("status", event.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>Evidence</span>
              <select
                value={filters.evidence}
                onChange={(event) => setFilter("evidence", event.target.value)}
              >
                <option value="">All evidence grades</option>
                <option value="confirmed">Confirmed</option>
                <option value="commentary">Commentary</option>
                <option value="ahead-of-docs">Ahead of docs</option>
              </select>
            </label>
            <label className="select-field">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) =>
                  onSortChange(event.target.value as SignalSort)
                }
              >
                <option value="relevance">Strategic relevance</option>
                <option value="newest">Newest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>

          <div className="filter-toggles">
            <label className="check-control">
              <input
                type="checkbox"
                checked={filters.protectedOnly}
                onChange={(event) =>
                  setFilter("protectedOnly", event.target.checked)
                }
              />
              <span aria-hidden="true" />
              Protected signals only
            </label>
            <label className="check-control">
              <input
                type="checkbox"
                checked={filters.customerSafeOnly}
                onChange={(event) =>
                  setFilter("customerSafeOnly", event.target.checked)
                }
              />
              <span aria-hidden="true" />
              Customer-safe items only
            </label>
          </div>
        </section>

        <section className="catalog-results" aria-live="polite">
          <div className="results-toolbar">
            <div>
              <strong>
                {visibleSignals.length} signal
                {visibleSignals.length === 1 ? "" : "s"}
              </strong>
              <span>
                {highRelevance} scored 90+ for the current audience focus
              </span>
            </div>
            <div>
              <Button
                type="button"
                variant="quiet"
                size="small"
                onClick={() => setCollapsedGroups(new Set())}
              >
                <PanelTopOpen size={16} aria-hidden="true" />
                Expand all
              </Button>
              <Button
                type="button"
                variant="quiet"
                size="small"
                onClick={() =>
                  setCollapsedGroups(new Set(groups.map((group) => group.key)))
                }
              >
                <PanelTopClose size={16} aria-hidden="true" />
                Collapse all
              </Button>
            </div>
          </div>

          {groups.length ? (
            <div className="signal-groups">
              {groups.map((group) => {
                const collapsed = collapsedGroups.has(group.key);
                return (
                  <section className="signal-group" key={group.key}>
                    <button
                      type="button"
                      className="group-heading"
                      aria-expanded={!collapsed}
                      onClick={() => toggleGroup(group.key)}
                    >
                      <div className="group-mark" aria-hidden="true">
                        <Layers3 size={18} />
                      </div>
                      <div>
                        <span>{group.platform}</span>
                        <h2>{group.section}</h2>
                      </div>
                      <Badge tone="neutral">
                        {group.signals.length}{" "}
                        {group.signals.length === 1 ? "signal" : "signals"}
                      </Badge>
                      <ChevronDown
                        size={20}
                        className={collapsed ? "chevron-rotated-up" : ""}
                        aria-hidden="true"
                      />
                    </button>
                    {!collapsed ? (
                      <div className="signal-grid">
                        {group.signals.map((signal) => (
                          <SignalCard
                            key={signal.id}
                            signal={signal}
                            sources={sources}
                            selectedAudience={filters.audience}
                            pinned={pinnedSignalIds.includes(signal.id)}
                            onTogglePinned={onTogglePinned}
                          />
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<SlidersHorizontal size={27} />}
              title="No signals match these filters"
              description="Remove one or more filters, or search with broader language."
              action={
                <Button type="button" variant="primary" onClick={resetFilters}>
                  <RotateCcw size={17} aria-hidden="true" />
                  Reset filters
                </Button>
              }
            />
          )}
        </section>

        <section className="methodology-ribbon">
          <div>
            <CheckCircle2 size={19} aria-hidden="true" />
            <strong>Official sources establish the facts.</strong>
            <span>Expert and social sources explain what may matter.</span>
          </div>
          <div>
            <ShieldAlert size={19} aria-hidden="true" />
            <strong>Protected signals always surface.</strong>
            <span>Breaking changes, hard dates, security, pricing, and conflicts.</span>
          </div>
        </section>
      </div>

      {pinnedSignalIds.length ? (
        <button
          type="button"
          className="floating-discussion"
          onClick={() => setDiscussionOpen(true)}
        >
          <Bookmark size={18} aria-hidden="true" />
          <span>
            <strong>{pinnedSignalIds.length}</strong>
            Discussion list
          </span>
        </button>
      ) : null}

      <Modal
        open={discussionOpen}
        onOpenChange={setDiscussionOpen}
        title="Discussion list"
        description="A focused set of signals for the next customer conversation."
        footer={
          pinnedSignals.length ? (
            <>
              <Button type="button" variant="quiet" onClick={() => void copyDiscussion()}>
                <Copy size={16} aria-hidden="true" />
                Copy Markdown
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => exportDiscussion("csv")}
              >
                <Download size={16} aria-hidden="true" />
                CSV
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => exportDiscussion("md")}
              >
                <Download size={16} aria-hidden="true" />
                Markdown
              </Button>
            </>
          ) : undefined
        }
      >
        {pinnedSignals.length ? (
          <div className="discussion-list">
            {pinnedSignals.map((signal) => {
              const mapping = filters.audience
                ? signal.relevance.find(
                    (item) => item.audience === filters.audience,
                  )
                : signal.relevance[0];
              return (
                <article key={signal.id}>
                  <div>
                    <Badge tone="neutral">
                      {signal.platform} / {signal.section}
                    </Badge>
                    <h3>{signal.title}</h3>
                    {mapping ? (
                      <p>
                        <strong>{mapping.audience}:</strong> {mapping.reason}
                      </p>
                    ) : (
                      <p>{signal.summary}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="quiet"
                    size="icon"
                    aria-label={`Remove ${signal.title} from discussion list`}
                    onClick={() => onTogglePinned(signal.id)}
                  >
                    <X size={17} aria-hidden="true" />
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Bookmark size={26} />}
            title="Nothing pinned yet"
            description="Use the bookmark control on any signal card to build a focused discussion list."
          />
        )}
      </Modal>
    </main>
  );
}
