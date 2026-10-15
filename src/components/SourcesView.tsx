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
import { type FormEvent, useMemo, useState } from "react";
import { createId } from "../lib/workspace";
import type { Source, SourceKind, TrustTier } from "../types";
import { Badge, Button, EmptyState, Modal } from "./ui";

interface SourcesViewProps {
  sources: Source[];
  onChange: (sources: Source[]) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

interface SourceDraft {
  id?: string;
  name: string;
  url: string;
  kind: SourceKind;
  tier: TrustTier;
  method: string;
  platforms: string;
  tags: string;
  notes: string;
}

const emptyDraft: SourceDraft = {
  name: "",
  url: "",
  kind: "rss",
  tier: "official",
  method: "RSS / Atom",
  platforms: "",
  tags: "",
  notes: "",
};

const sourceIcons = {
  rss: Rss,
  blog: FileText,
  documentation: Link2,
  linkedin: MessageSquareText,
  manual: Pencil,
} as const;

function toDraft(source: Source): SourceDraft {
  return {
    id: source.id,
    name: source.name,
    url: source.url,
    kind: source.kind,
    tier: source.tier,
    method: source.method,
    platforms: source.platforms.join(", "),
    tags: source.tags.join(", "),
    notes: source.notes,
  };
}

function parseList(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function SourcesView({
  sources,
  onChange,
  onNotify,
}: SourcesViewProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<SourceDraft>(emptyDraft);
  const [formError, setFormError] = useState("");

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
    setDraft(emptyDraft);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(source: Source): void {
    setDraft(toDraft(source));
    setFormError("");
    setDialogOpen(true);
  }

  function save(event: FormEvent): void {
    event.preventDefault();
    if (!draft.name.trim() || !draft.url.trim()) {
      setFormError("Name and URL are required.");
      return;
    }
    try {
      const url = new URL(draft.url);
      if (url.protocol !== "https:") {
        setFormError("Sources must use an HTTPS URL.");
        return;
      }
    } catch {
      setFormError("Enter a valid source URL.");
      return;
    }

    const isLinkedIn = draft.kind === "linkedin";
    const next: Source = {
      id: draft.id ?? createId("source", draft.name),
      name: draft.name.trim(),
      url: draft.url.trim(),
      kind: draft.kind,
      tier: draft.tier,
      method: isLinkedIn ? "User-triggered capture" : draft.method.trim(),
      enabled: draft.id
        ? (sources.find((source) => source.id === draft.id)?.enabled ?? true)
        : true,
      platforms: parseList(draft.platforms),
      tags: parseList(draft.tags),
      notes: draft.notes.trim(),
      health: isLinkedIn ? "manual" : "healthy",
      lastChecked: draft.id
        ? sources.find((source) => source.id === draft.id)?.lastChecked
        : undefined,
    };

    const exists = sources.some((source) => source.id === next.id);
    onChange(
      exists
        ? sources.map((source) => (source.id === next.id ? next : source))
        : [...sources, next],
    );
    setDialogOpen(false);
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

      <Modal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={draft.id ? "Edit source" : "Add a source"}
        description="Source edits stay in this browser until you export the workspace."
        footer={
          <>
            <Button type="button" variant="quiet" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" form="source-form">
              {draft.id ? "Save changes" : "Add source"}
            </Button>
          </>
        }
      >
        <form id="source-form" className="editor-form" onSubmit={save}>
          {formError ? <p className="form-error">{formError}</p> : null}
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Source name</span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, name: event.target.value }))
                }
                placeholder="Microsoft Fabric Blog"
                required
              />
            </label>
            <label className="form-field form-field-wide">
              <span>HTTPS URL</span>
              <input
                type="url"
                value={draft.url}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, url: event.target.value }))
                }
                placeholder="https://..."
                required
              />
            </label>
            <label className="form-field">
              <span>Source type</span>
              <select
                value={draft.kind}
                onChange={(event) => {
                  const nextKind = event.target.value as SourceKind;
                  setDraft((value) => ({
                    ...value,
                    kind: nextKind,
                    method:
                      nextKind === "linkedin"
                        ? "User-triggered capture"
                        : value.method,
                    tier:
                      nextKind === "linkedin" && value.tier === "official"
                        ? "social"
                        : value.tier,
                  }));
                }}
              >
                <option value="rss">RSS / Atom</option>
                <option value="blog">Blog</option>
                <option value="documentation">Documentation</option>
                <option value="linkedin">LinkedIn</option>
                <option value="manual">Manual import</option>
              </select>
            </label>
            <label className="form-field">
              <span>Trust tier</span>
              <select
                value={draft.tier}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    tier: event.target.value as TrustTier,
                  }))
                }
              >
                <option value="official">Official</option>
                <option value="expert">Expert analysis</option>
                <option value="community">Community</option>
                <option value="social">Social</option>
              </select>
            </label>
            <label className="form-field">
              <span>Collection method</span>
              <input
                value={
                  draft.kind === "linkedin"
                    ? "User-triggered capture"
                    : draft.method
                }
                disabled={draft.kind === "linkedin"}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    method: event.target.value,
                  }))
                }
              />
            </label>
            <label className="form-field">
              <span>Platforms</span>
              <input
                value={draft.platforms}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    platforms: event.target.value,
                  }))
                }
                placeholder="Microsoft Fabric, Azure AI"
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Tags</span>
              <input
                value={draft.tags}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, tags: event.target.value }))
                }
                placeholder="release, architecture, agents"
              />
              <small>Separate values with commas.</small>
            </label>
            <label className="form-field form-field-wide">
              <span>Operational notes</span>
              <textarea
                rows={3}
                value={draft.notes}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, notes: event.target.value }))
                }
                placeholder="How this source should be interpreted or collected."
              />
            </label>
          </div>
        </form>
      </Modal>
    </main>
  );
}
