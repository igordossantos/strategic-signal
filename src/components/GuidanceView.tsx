import {
  CalendarDays,
  Check,
  CircleAlert,
  Crosshair,
  Lightbulb,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { formatDate } from "../lib/signals";
import { createId } from "../lib/workspace";
import type { Guidance, GuidancePriority } from "../types";
import { Badge, Button, EmptyState, Modal } from "./ui";

interface GuidanceViewProps {
  guidance: Guidance[];
  onChange: (guidance: Guidance[]) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

interface GuidanceDraft {
  id?: string;
  title: string;
  audience: string;
  need: string;
  priority: GuidancePriority;
  effectiveDate: string;
  tags: string;
  matchTerms: string;
}

const emptyDraft: GuidanceDraft = {
  title: "",
  audience: "",
  need: "",
  priority: "high",
  effectiveDate: new Date().toISOString().slice(0, 10),
  tags: "",
  matchTerms: "",
};

const priorityLabels = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  watch: "Watch",
} as const;

function toDraft(item: Guidance): GuidanceDraft {
  return {
    id: item.id,
    title: item.title,
    audience: item.audience,
    need: item.need,
    priority: item.priority,
    effectiveDate: item.effectiveDate,
    tags: item.tags.join(", "),
    matchTerms: item.matchTerms.join(", "),
  };
}

function parseList(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function GuidanceView({
  guidance,
  onChange,
  onNotify,
}: GuidanceViewProps) {
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<GuidanceDraft>(emptyDraft);
  const [formError, setFormError] = useState("");

  const audiences = useMemo(
    () =>
      [...new Set(guidance.map((item) => item.audience))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [guidance],
  );

  const shown = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return guidance
      .filter((item) => !audience || item.audience === audience)
      .filter((item) => {
        if (!normalized) return true;
        return [
          item.title,
          item.audience,
          item.need,
          item.priority,
          ...item.tags,
          ...item.matchTerms,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, watch: 3 };
        return (
          priorityOrder[a.priority] - priorityOrder[b.priority] ||
          a.audience.localeCompare(b.audience)
        );
      });
  }, [audience, guidance, query]);

  function openCreate(): void {
    setDraft({
      ...emptyDraft,
      effectiveDate: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(item: Guidance): void {
    setDraft(toDraft(item));
    setFormError("");
    setDialogOpen(true);
  }

  function save(event: FormEvent): void {
    event.preventDefault();
    if (
      !draft.title.trim() ||
      !draft.audience.trim() ||
      !draft.need.trim() ||
      !draft.effectiveDate
    ) {
      setFormError("Title, audience, need, and effective date are required.");
      return;
    }
    const next: Guidance = {
      id: draft.id ?? createId("guidance", draft.title),
      title: draft.title.trim(),
      audience: draft.audience.trim(),
      need: draft.need.trim(),
      priority: draft.priority,
      effectiveDate: draft.effectiveDate,
      tags: parseList(draft.tags),
      matchTerms: parseList(draft.matchTerms),
      active: draft.id
        ? (guidance.find((item) => item.id === draft.id)?.active ?? true)
        : true,
    };
    const exists = guidance.some((item) => item.id === next.id);
    onChange(
      exists
        ? guidance.map((item) => (item.id === next.id ? next : item))
        : [...guidance, next],
    );
    setDialogOpen(false);
    onNotify(exists ? "Guidance updated." : "Guidance added.", "success");
  }

  function remove(item: Guidance): void {
    if (!window.confirm(`Remove "${item.title}" from this browser workspace?`)) {
      return;
    }
    onChange(guidance.filter((current) => current.id !== item.id));
    onNotify("Guidance removed.", "success");
  }

  function toggle(item: Guidance): void {
    onChange(
      guidance.map((current) =>
        current.id === item.id
          ? { ...current, active: !current.active }
          : current,
      ),
    );
    onNotify(
      item.active ? "Guidance paused." : "Guidance activated.",
      "success",
    );
  }

  return (
    <main className="page-shell" id="main-content">
      <section className="page-heading guidance-heading">
        <div>
          <p className="eyebrow">Intelligence studio</p>
          <h1>Guidance</h1>
          <p>
            Record what matters to each audience. Strategic Signal uses these
            dated needs to explain why a new capability deserves attention.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Add guidance
        </Button>
      </section>

      <section className="metric-strip" aria-label="Guidance summary">
        <div className="metric-card">
          <span>Guidance items</span>
          <strong>{guidance.length}</strong>
          <small>In this browser workspace</small>
        </div>
        <div className="metric-card">
          <span>Active</span>
          <strong>{guidance.filter((item) => item.active).length}</strong>
          <small>Used for matching</small>
        </div>
        <div className="metric-card">
          <span>Audiences</span>
          <strong>{audiences.length}</strong>
          <small>Available as briefing filters</small>
        </div>
        <div className="metric-card">
          <span>Critical / high</span>
          <strong>
            {
              guidance.filter(
                (item) =>
                  item.priority === "critical" || item.priority === "high",
              ).length
            }
          </strong>
          <small>Lead matching priorities</small>
        </div>
      </section>

      <div className="info-banner info-banner-private">
        <Shield size={19} aria-hidden="true" />
        <div>
          <strong>Local by default</strong>
          <p>
            Guidance is stored only in this browser. Export deliberately when
            you want a backup. Do not place confidential customer information
            in a public repository.
          </p>
        </div>
      </div>

      <section className="manager-toolbar" aria-label="Filter guidance">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search guidance</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer needs, tags, or matching phrases"
          />
        </label>
        <label className="select-field">
          <span>Audience</span>
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          >
            <option value="">All audiences</option>
            {audiences.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      {shown.length ? (
        <section className="guidance-grid" aria-label="Customer guidance">
          {shown.map((item) => (
            <article
              key={item.id}
              className={`guidance-card${item.active ? "" : " guidance-card-disabled"}`}
            >
              <div className="guidance-card-header">
                <div className="guidance-icon" aria-hidden="true">
                  <Crosshair size={20} />
                </div>
                <div>
                  <p>{item.audience}</p>
                  <h2>{item.title}</h2>
                </div>
                <button
                  type="button"
                  className={`status-toggle${item.active ? " status-toggle-on" : ""}`}
                  aria-label={`${item.active ? "Pause" : "Activate"} ${item.title}`}
                  aria-pressed={item.active}
                  onClick={() => toggle(item)}
                >
                  <span aria-hidden="true">
                    {item.active ? <Check size={13} /> : null}
                  </span>
                </button>
              </div>

              <div className="badge-row">
                <Badge
                  tone={
                    item.priority === "critical"
                      ? "danger"
                      : item.priority === "high"
                        ? "accent"
                        : "neutral"
                  }
                >
                  {priorityLabels[item.priority]} priority
                </Badge>
                <Badge tone="neutral">
                  <CalendarDays size={13} aria-hidden="true" />
                  Since {formatDate(item.effectiveDate)}
                </Badge>
              </div>

              <p className="guidance-need">{item.need}</p>

              <div className="guidance-match">
                <div>
                  <Lightbulb size={16} aria-hidden="true" />
                  <strong>Match language</strong>
                </div>
                <p>
                  {item.matchTerms.length
                    ? item.matchTerms.join(" · ")
                    : "No matching phrases configured yet."}
                </p>
              </div>

              <div className="tag-list" aria-label="Guidance tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="guidance-card-footer">
                <span>
                  <Users size={15} aria-hidden="true" />
                  {item.audience}
                </span>
                <div className="row-actions">
                  <Button
                    type="button"
                    variant="quiet"
                    size="icon"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => openEdit(item)}
                  >
                    <Pencil size={17} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="quiet"
                    size="icon"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => remove(item)}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={<Crosshair size={26} />}
          title="No guidance matches"
          description="Try another audience or add a dated customer priority."
          action={
            <Button type="button" variant="primary" onClick={openCreate}>
              <Plus size={17} aria-hidden="true" />
              Add guidance
            </Button>
          }
        />
      )}

      <div className="method-card">
        <CircleAlert size={19} aria-hidden="true" />
        <div>
          <strong>How relevance is written</strong>
          <p>
            Guidance influences ranking and the "why this may matter"
            explanation. It never turns a suggested use case into a statement
            about the customer's current environment.
          </p>
        </div>
      </div>

      <Modal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={draft.id ? "Edit guidance" : "Add guidance"}
        description="Use one clear need per item so relevance explanations remain traceable."
        footer={
          <>
            <Button type="button" variant="quiet" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" form="guidance-form">
              {draft.id ? "Save changes" : "Add guidance"}
            </Button>
          </>
        }
      >
        <form id="guidance-form" className="editor-form" onSubmit={save}>
          {formError ? <p className="form-error">{formError}</p> : null}
          <div className="form-grid">
            <label className="form-field">
              <span>Audience</span>
              <input
                value={draft.audience}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    audience: event.target.value,
                  }))
                }
                placeholder="Farmers Insurance"
                required
              />
            </label>
            <label className="form-field">
              <span>Priority</span>
              <select
                value={draft.priority}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    priority: event.target.value as GuidancePriority,
                  }))
                }
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="watch">Watch</option>
              </select>
            </label>
            <label className="form-field form-field-wide">
              <span>Guidance title</span>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, title: event.target.value }))
                }
                placeholder="Governed data product management"
                required
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Customer need</span>
              <textarea
                rows={4}
                value={draft.need}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, need: event.target.value }))
                }
                placeholder="Describe the outcome or decision this audience needs help with."
                required
              />
            </label>
            <label className="form-field">
              <span>Effective date</span>
              <input
                type="date"
                value={draft.effectiveDate}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    effectiveDate: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="form-field">
              <span>Tags</span>
              <input
                value={draft.tags}
                onChange={(event) =>
                  setDraft((value) => ({ ...value, tags: event.target.value }))
                }
                placeholder="governance, data products"
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Matching phrases</span>
              <input
                value={draft.matchTerms}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    matchTerms: event.target.value,
                  }))
                }
                placeholder="catalog, policy, ownership, lifecycle"
              />
              <small>Separate phrases with commas.</small>
            </label>
          </div>
        </form>
      </Modal>
    </main>
  );
}
