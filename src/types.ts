export type SourceKind = "rss" | "blog" | "documentation" | "linkedin" | "manual";
export type TrustTier = "official" | "expert" | "community" | "social";
export type SourceHealth = "healthy" | "manual" | "attention";

export interface Source {
  id: string;
  name: string;
  url: string;
  kind: SourceKind;
  tier: TrustTier;
  method: string;
  enabled: boolean;
  platforms: string[];
  tags: string[];
  notes: string;
  health: SourceHealth;
  lastChecked?: string;
}

export type GuidancePriority = "critical" | "high" | "normal" | "watch";

export interface Guidance {
  id: string;
  title: string;
  audience: string;
  need: string;
  priority: GuidancePriority;
  effectiveDate: string;
  tags: string[];
  matchTerms: string[];
  active: boolean;
}

export type EvidenceGrade = "confirmed" | "commentary" | "ahead-of-docs";
export type SignalStatus =
  | "Generally available"
  | "Public preview"
  | "Private preview"
  | "Coming soon"
  | "Changed"
  | "Retiring"
  | "Not specified";

export type ProtectedClass =
  | "breaking-change"
  | "hard-date"
  | "security"
  | "licensing"
  | "pricing"
  | "source-conflict";

export interface RelevanceMapping {
  audience: string;
  reason: string;
  score: number;
  guidanceId?: string;
}

export interface SignalLink {
  label: string;
  url: string;
}

export interface Signal {
  id: string;
  title: string;
  platform: string;
  section: string;
  product: string;
  summary: string;
  details: string[];
  status: SignalStatus;
  evidence: EvidenceGrade;
  publishedAt?: string;
  verifiedAt: string;
  author?: string;
  sourceIds: string[];
  links: SignalLink[];
  tags: string[];
  nextStep: string;
  relevance: RelevanceMapping[];
  protected: ProtectedClass[];
  conflict?: string;
  customerSafe: boolean;
}

export interface Workspace {
  version: 1;
  sources: Source[];
  guidance: Guidance[];
  pinnedSignalIds: string[];
}

export interface SignalFilters {
  query: string;
  platform: string;
  section: string;
  audience: string;
  prioritySignal: string;
  status: string;
  evidence: string;
  protectedOnly: boolean;
  customerSafeOnly: boolean;
}

export type SignalSort = "relevance" | "newest" | "title";

export type AppView = "briefing" | "sources" | "priorities" | "about";
