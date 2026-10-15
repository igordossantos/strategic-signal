import { type FormEvent, useState } from "react";
import { createId } from "../lib/workspace";
import type { Source, SourceKind, TrustTier } from "../types";
import { Button, Modal } from "./ui";

interface SourceEditorModalProps {
  source: Source | null;
  sources: Source[];
  onSave: (source: Source) => void;
  onClose: () => void;
}

interface SourceDraft {
  name: string;
  url: string;
  kind: SourceKind;
  tier: TrustTier;
  method: string;
  platforms: string;
  tags: string;
  notes: string;
}

function draftFor(source: Source | null): SourceDraft {
  return source
    ? {
        name: source.name,
        url: source.url,
        kind: source.kind,
        tier: source.tier,
        method: source.method,
        platforms: source.platforms.join(", "),
        tags: source.tags.join(", "),
        notes: source.notes,
      }
    : {
        name: "",
        url: "",
        kind: "rss",
        tier: "official",
        method: "RSS / Atom",
        platforms: "",
        tags: "",
        notes: "",
      };
}

function parseList(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function SourceEditorModal({
  source,
  sources,
  onSave,
  onClose,
}: SourceEditorModalProps) {
  const [draft, setDraft] = useState<SourceDraft>(() => draftFor(source));
  const [formError, setFormError] = useState("");

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
    const duplicate = sources.find(
      (item) =>
        item.id !== source?.id &&
        item.url.replace(/\/$/, "") === draft.url.trim().replace(/\/$/, ""),
    );
    if (duplicate) {
      setFormError(`This URL is already configured as “${duplicate.name}”.`);
      return;
    }

    const isLinkedIn = draft.kind === "linkedin";
    onSave({
      id: source?.id ?? createId("source", draft.name),
      name: draft.name.trim(),
      url: draft.url.trim(),
      kind: draft.kind,
      tier: draft.tier,
      method: isLinkedIn ? "User-triggered capture" : draft.method.trim(),
      enabled: source?.enabled ?? true,
      platforms: parseList(draft.platforms),
      tags: parseList(draft.tags),
      notes: draft.notes.trim(),
      health: isLinkedIn ? "manual" : (source?.health ?? "healthy"),
      ...(source?.lastChecked ? { lastChecked: source.lastChecked } : {}),
      collectionMode: isLinkedIn
        ? "browser-assisted"
        : draft.kind === "rss"
          ? "automatic"
          : "reference",
    });
  }

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={source ? "Edit source" : "Add a source"}
      description="Source edits stay in this browser until you export the workspace."
      footer={
        <>
          <Button type="button" variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" form="source-editor-form">
            {source ? "Save changes" : "Add source"}
          </Button>
        </>
      }
    >
      <form id="source-editor-form" className="editor-form" onSubmit={save}>
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
                      : nextKind === "rss"
                        ? "RSS / Atom"
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
            <span>Technologies</span>
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
            <span>Coverage tags</span>
            <input
              value={draft.tags}
              onChange={(event) =>
                setDraft((value) => ({ ...value, tags: event.target.value }))
              }
              placeholder="agents, governance, architecture"
            />
            <small>
              Separate values with commas. These explain what content from this
              source usually represents.
            </small>
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
  );
}
