import {
  Activity,
  ArrowUpRight,
  Check,
  CircleAlert,
  FileText,
  Link2,
  MessageSquareText,
  Pencil,
  Plus,
  Rss,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Source } from "../types";
import { SourceEditorModal } from "./SourceEditorModal";
import { Badge, Button, EmptyState } from "./ui";

interface SourcesViewProps {
  sources: Source[];
  onChange: (sources: Source[]) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

const sourceIcons = {
  rss: Rss,
  blog: FileText,
  documentation: Link2,
  linkedin: MessageSquareText,
  manual: Pencil,
} as const;

export function SourcesView({
  sources,
  onChange,
  onNotify,
}: SourcesViewProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [editorSource, setEditorSource] = useState<
    Source | null | undefined
  >(undefined);

  const shown = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return sources
      .filter((source) => !kind || source.kind === kind)
      .filter((source) => {
        if (!normalized) return true;
        return [
          source.name,
          source.url,
          source.kind,
          source.tier,
          source.method,
          source.notes,
          ...source.platforms,
          ...source.tags,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized);
      })
      .sort(
        (a, b) =>
          Number(b.enabled) - Number(a.enabled) || a.name.localeCompare(b.name),
      );
  }, [kind, query, sources]);

  const enabledCount = sources.filter((source) => source.enabled).length;
  const manualCount = sources.filter((source) => source.health === "manual").length;

  function openCreate(): void {
    setEditorSource(null);
  }

  function openEdit(source: Source): void {
    setEditorSource(source);
  }

  function saveSource(next: Source): void {
    const exists = sources.some((source) => source.id === next.id);
    onChange(
      exists
        ? sources.map((source) => (source.id === next.id ? next : source))
        : [...sources, next],
    );
    setEditorSource(undefined);
    onNotify(exists ? "Source updated." : "Source added.", "success");
  }

  function remove(source: Source): void {
    if (!window.confirm(`Remove "${source.name}" from this browser workspace?`)) {
      return;
    }
    onChange(sources.filter((item) => item.id !== source.id));
    onNotify("Source removed.", "success");
  }

  function toggle(source: Source): void {
    onChange(
      sources.map((item) =>
        item.id === source.id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
    onNotify(
      source.enabled ? "Source paused." : "Source enabled.",
      "success",
    );
  }

  return (
    <main className="page-shell" id="main-content">
      <section className="page-heading source-heading">
        <div>
          <p className="eyebrow">Intelligence studio</p>
          <h1>Sources</h1>
          <p>
            Define the official feeds, expert blogs, documentation, and
            LinkedIn voices that Strategic Signal should watch.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Add source
        </Button>
      </section>

      <section className="metric-strip" aria-label="Source summary">
        <div className="metric-card">
          <span>Configured</span>
          <strong>{sources.length}</strong>
          <small>Across all source types</small>
        </div>
        <div className="metric-card">
          <span>Enabled</span>
          <strong>{enabledCount}</strong>
          <small>Included in collection</small>
        </div>
        <div className="metric-card">
          <span>Official</span>
          <strong>
            {sources.filter((source) => source.tier === "official").length}
          </strong>
          <small>Ground-truth sources</small>
        </div>
        <div className="metric-card">
          <span>Manual capture</span>
          <strong>{manualCount}</strong>
          <small>Signed-in browser required</small>
        </div>
      </section>

      <div className="info-banner">
        <CircleAlert size={19} aria-hidden="true" />
        <div>
          <strong>LinkedIn stays user-triggered</strong>
          <p>
            GitHub Pages cannot read authenticated LinkedIn content. LinkedIn
            entries are captured from your signed-in browser, including visible
            links in comments marked as written by the post author.
          </p>
        </div>
      </div>

      <section className="manager-toolbar" aria-label="Filter sources">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search sources</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sources, platforms, or tags"
          />
        </label>
        <label className="select-field">
          <span>Source type</span>
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="">All types</option>
            <option value="rss">RSS / Atom</option>
            <option value="blog">Blog</option>
            <option value="documentation">Documentation</option>
            <option value="linkedin">LinkedIn</option>
            <option value="manual">Manual</option>
          </select>
        </label>
      </section>

      {shown.length ? (
        <section className="source-grid" aria-label="Configured sources">
          {shown.map((source) => {
            const Icon = sourceIcons[source.kind];
            return (
              <article
                key={source.id}
                className={`source-card${source.enabled ? "" : " source-card-disabled"}`}
              >
                <div className="source-card-header">
                  <div className="source-icon" aria-hidden="true">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2>{source.name}</h2>
                    <p>
                      {source.kind === "linkedin"
                        ? "LinkedIn profile"
                        : source.method}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`status-toggle${source.enabled ? " status-toggle-on" : ""}`}
                    aria-label={`${source.enabled ? "Disable" : "Enable"} ${source.name}`}
                    aria-pressed={source.enabled}
                    onClick={() => toggle(source)}
                  >
                    <span aria-hidden="true">
                      {source.enabled ? <Check size={13} /> : null}
                    </span>
                  </button>
                </div>

                <div className="badge-row">
                  <Badge tone={source.tier === "official" ? "official" : "neutral"}>
                    {source.tier}
                  </Badge>
                  <Badge
                    tone={
                      source.health === "healthy"
                        ? "success"
                        : source.health === "manual"
                          ? "accent"
                          : "warning"
                    }
                  >
                    <Activity size={13} aria-hidden="true" />
                    {source.health === "manual"
                      ? "Manual capture"
                      : source.health}
                  </Badge>
                </div>

                <p className="source-notes">
                  {source.notes || "No operational notes yet."}
                </p>

                <div className="tag-list" aria-label="Source tags">
                  {[...source.platforms, ...source.tags].slice(0, 5).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="source-card-footer">
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    Open source
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                  <div className="row-actions">
                    <Button
                      type="button"
                      variant="quiet"
                      size="icon"
                      aria-label={`Edit ${source.name}`}
                      onClick={() => openEdit(source)}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="quiet"
                      size="icon"
                      aria-label={`Remove ${source.name}`}
                      onClick={() => remove(source)}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          icon={<Rss size={26} />}
          title="No sources match"
          description="Try another search or add a new source to this browser workspace."
          action={
            <Button type="button" variant="primary" onClick={openCreate}>
              <Plus size={17} aria-hidden="true" />
              Add source
            </Button>
          }
        />
      )}

      {editorSource !== undefined ? (
        <SourceEditorModal
          key={editorSource?.id ?? "new-source"}
          source={editorSource}
          sources={sources}
          onSave={saveSource}
          onClose={() => setEditorSource(undefined)}
        />
      ) : null}
    </main>
  );
}
