import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { formatDate, sourceNames } from "../lib/signals";
import type { Signal, Source } from "../types";
import { Badge, Button } from "./ui";

interface SignalCardProps {
  signal: Signal;
  sources: Source[];
  selectedAudience: string;
  pinned: boolean;
  onTogglePinned: (id: string) => void;
}

const evidenceLabels = {
  confirmed: "Confirmed",
  commentary: "Commentary",
  "ahead-of-docs": "Ahead of docs",
} as const;

function statusTone(status: Signal["status"]): string {
  if (status === "Generally available") return "success";
  if (status === "Public preview" || status === "Private preview")
    return "accent";
  if (status === "Retiring" || status === "Changed") return "danger";
  return "warning";
}

export function SignalCard({
  signal,
  sources,
  selectedAudience,
  pinned,
  onTogglePinned,
}: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const relevance = selectedAudience
    ? signal.relevance.filter((item) => item.audience === selectedAudience)
    : signal.relevance;
  const sourceLabel = sourceNames(signal, sources).join(" · ");
  const leadRelevance = relevance[0];

  return (
    <article
      className={`signal-card${signal.protected.length ? " signal-card-protected" : ""}`}
      data-signal-id={signal.id}
    >
      <div className="signal-card-topline">
        <div className="badge-row" aria-label="Signal classification">
          <Badge tone={statusTone(signal.status)}>{signal.status}</Badge>
          <Badge tone={signal.evidence === "confirmed" ? "official" : "neutral"}>
            <ShieldCheck size={13} aria-hidden="true" />
            {evidenceLabels[signal.evidence]}
          </Badge>
          {signal.protected.length ? (
            <Badge tone="protected">
              <CircleAlert size={13} aria-hidden="true" />
              Protected signal
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="quiet"
          size="icon"
          className={pinned ? "pin-button-active" : ""}
          aria-label={
            pinned ? `Remove ${signal.title} from discussion list` : `Pin ${signal.title} to discussion list`
          }
          aria-pressed={pinned}
          onClick={() => onTogglePinned(signal.id)}
        >
          {pinned ? (
            <BookmarkCheck size={19} aria-hidden="true" />
          ) : (
            <Bookmark size={19} aria-hidden="true" />
          )}
        </Button>
      </div>

      <p className="signal-kicker">
        {signal.platform} <span aria-hidden="true">/</span> {signal.section}
      </p>
      <h3>{signal.title}</h3>
      <p className="signal-product">{signal.product}</p>
      <p className="signal-summary">{signal.summary}</p>

      {leadRelevance ? (
        <div className="relevance-panel">
          <div className="relevance-heading">
            <span className="relevance-icon" aria-hidden="true">
              <Sparkles size={16} />
            </span>
            <div>
              <span className="relevance-eyebrow">Why this may matter</span>
              <strong>{leadRelevance.audience}</strong>
            </div>
            <span className="relevance-score" aria-label={`Relevance score ${leadRelevance.score} out of 100`}>
              {leadRelevance.score}
            </span>
          </div>
          <p>{leadRelevance.reason}</p>
          {!selectedAudience && relevance.length > 1 ? (
            <p className="more-audiences">
              +{relevance.length - 1} additional audience mapping
              {relevance.length > 2 ? "s" : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="signal-meta">
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          {signal.publishedAt
            ? `Published ${formatDate(signal.publishedAt)}`
            : `Verified ${formatDate(signal.verifiedAt)}`}
        </span>
        <span className="signal-source-line">{sourceLabel}</span>
      </div>

      <button
        className="card-expand"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Hide evidence and action" : "Evidence and suggested action"}
        <ChevronDown
          size={17}
          className={expanded ? "chevron-rotated" : ""}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div className="card-details">
          {signal.conflict ? (
            <div className="conflict-note">
              <CircleAlert size={17} aria-hidden="true" />
              <div>
                <strong>Source discrepancy</strong>
                <p>{signal.conflict}</p>
              </div>
            </div>
          ) : null}
          {signal.details.length ? (
            <ul>
              {signal.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
          <div className="next-step">
            <span>Suggested next step</span>
            <p>{signal.nextStep}</p>
          </div>
          {relevance.length > 1 ? (
            <div className="all-relevance">
              <span>Audience mappings</span>
              {relevance.slice(1).map((item) => (
                <div key={item.audience} className="relevance-secondary">
                  <strong>{item.audience}</strong>
                  <p>{item.reason}</p>
                </div>
              ))}
            </div>
          ) : null}
          {signal.links.length ? (
            <div className="source-actions">
              {signal.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {link.label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
