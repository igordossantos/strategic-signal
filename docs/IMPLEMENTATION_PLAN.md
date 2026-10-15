# Strategic Signal - Implementation Plan

## Product vision

Strategic Signal by Igor is a customer-ready technology intelligence hub for Igor Dos Santos. It turns a curated set of official feeds, expert blogs, and selected LinkedIn voices into fast, evidence-backed briefings that feel personally prepared by Igor for each audience.

The product is intentionally open-ended. Its taxonomy can cover any platform, product, architecture, or emerging idea that matters to a customer conversation.

Working public URL:

`https://igordossantos.github.io/strategic-signal/`

## What the two prototypes contribute

### `fabcon-barcelona-2026`

Reusable strengths:

- Fast static GitHub Pages delivery with no runtime backend dependency.
- Customer-ready cards, evidence links, availability status, search, filters, selection, export, print, and shareable views.
- A strong normalized announcement schema and validation suite.
- Clear safety language that separates suggested relevance from claims about a customer's environment.
- A proven GitHub Actions test-and-deploy workflow.

Conference-specific constraints to remove:

- One event and one date window.
- Fabric-first category model.
- Relevance text embedded directly in every announcement.
- Source and priority data are maintained only by editing JSON.

### `fabric-digest`

Reusable strengths:

- A durable source roster with weights, coverage areas, cadence, and amplifier scoring.
- Official sources as ground truth; LinkedIn as framing and editorial signal.
- Explicit evidence grades: confirmed, commentary, and ahead of docs.
- Protected classes that always surface: breaking changes, hard dates, security, licensing, pricing, and source contradictions.
- User priorities, learned preferences, archive state, deduplication, and state transitions.
- Measured LinkedIn limitations rather than assumed automation capabilities.

Constraints to address:

- The current workflow is agent-driven rather than a standalone application.
- Data is spread across multiple files and digest formats.
- Source and priority management are not yet a unified customer-facing experience.

## Core experience

### 1. Briefing

- Search across title, summary, technologies, tags, authors, audiences, and relevance explanations.
- Filter by audience, technology, section, status, evidence grade, source type, and protected signal type.
- Sort by strategic relevance, newest, or title.
- Group cards into two-level collapsible sections, such as:
  - Microsoft Fabric > Admin & Governance
  - Microsoft Fabric > Development
  - Microsoft Foundry > Agent Development
  - Azure Databricks > Data Engineering
  - Microsoft SQL > AI & Operational Data
- Expand individual cards for evidence, linked reading, recommended next step, and all audience mappings.
- Show automatic topic hashtags and allow Igor to add personal hashtags to any item.
- Filter the catalog by clicking a hashtag or using the hashtag selector.
- Pin items to a discussion list.
- Copy or export a concise customer briefing.

### 1.1 Digest Builder

- Import completed collection results into the private browser workspace.
- Search current, collected, and archived intelligence.
- Select and remove items from a persistent reading queue.
- Build an immediate structured digest without an external model.
- Prepare an optional strong-LLM request with intent, depth, audience, and instructions.
- Run Azure OpenAI through GitHub Actions without exposing credentials in the public site.
- Import the structured AI result into a private browser-local digest library.

### 2. Sources

- Add, edit, enable, disable, search, and remove source definitions.
- Provide the same add, edit, delete, and all-selection controls directly inside collection planning.
- Support RSS/Atom, official blogs, documentation, LinkedIn profiles, and manually captured posts.
- Record trust tier, collection method, coverage tags, and notes.
- Treat source technology and coverage tags as the context when Everything is selected.
- Keep edits in the browser by default.
- Import and export a complete workspace JSON file.
- Repository-backed sync is a later authenticated enhancement; no token is stored in the public site.

### 3. Priority signals

- Add dated customer needs and priorities.
- Assign an audience, priority, effective date, technologies, and matching phrases.
- Give each priority one primary lens hashtag for direct item assignment.
- Use supporting hashtags as the main automatic matching mechanism and phrases only as fallback evidence.
- Surface active lens hashtags in the briefing and item hashtag editor.
- Keep priority signals local to the browser unless Igor explicitly exports them.
- Generate customer, subsidiary, and priority filters dynamically from active priority signals.
- Explain every relevance match: which priority signal matched, why it matters, and the confidence of the mapping.
- Never present priority-derived relevance as a statement of the customer's deployed environment.

### 4. LinkedIn capture

Unattended scraping is not part of the design. It is brittle, risks automation detection, and cannot be performed from GitHub Pages because of browser origin and authentication boundaries.

The supported path is a user-triggered Edge/Chrome helper:

1. Igor opens a LinkedIn post while signed in.
2. The helper reads the visible post text and metadata.
3. It identifies comments visibly marked as authored by the post author.
4. It captures only links from those author comments.
5. It exports a normalized JSON record for import into Strategic Signal.
6. The helper reports incomplete comment coverage when LinkedIn has not rendered the full thread.

This preserves the useful behavior proven by `fabric-digest` without storing credentials or pretending LinkedIn history is enumerable.

## Technical architecture

### Front end

- React 19 + TypeScript + Vite.
- Static assets deployed to GitHub Pages.
- No server rendering and no required runtime API calls.
- Local-first workspace storage using a versioned `localStorage` document.
- Personal per-item hashtags stored in the workspace and included in exports.
- Precomputed lowercase search documents and memoized filtering.
- Accessible keyboard navigation, visible focus, reduced-motion support, and responsive layout.
- Clawpilot light/dark theme tokens with no hardcoded component colors.

### Data model

`Signal`

- Identity: id, canonical URL, title, author, published date.
- Classification: platform, section, tags, status, signal type.
- Evidence: grade, source ids, verification date, discrepancy note.
- Content: executive summary, detail bullets, next step, linked reading.
- Relevance: one or more audience mappings with reason, score, and matching priority-signal id.
- Safety: protected class flags and customer-safe boolean.

`Source`

- Identity: id, name, URL.
- Collection: source type, method, enabled state.
- Trust: official, expert analysis, community, or social.
- Routing: platforms and tags.
- Operations: last checked, health, and notes.

`PrioritySignal`

- Identity: id and title.
- Audience and need statement.
- Priority and effective date.
- Primary lens hashtag, supporting hashtags, fallback match phrases, technologies, and optional expiration.

### Collection pipeline

Phase 1 ships the customer experience and configuration surfaces with a normalized archive imported from both predecessor projects.

Phase 2 adds:

- A scheduled GitHub Action for RSS/Atom and supported public feeds.
- URL canonicalization and content-hash deduplication.
- State-transition detection.
- Optional Azure OpenAI enrichment using repository secrets.
- A guarded customer-safe publishing step that excludes uncorroborated claims.

Phase 3 adds:

- Browser-helper import for LinkedIn post content and author-comment links.
- Source health telemetry.
- A private authenticated configuration service if browser-local priority signals are no longer sufficient.

## Delivery phases

### Milestone 1 - Product foundation

- [x] Analyze both prototypes and the deployed FabCon briefing.
- [x] Select architecture and working product name.
- [x] Implement the responsive application shell and briefing dashboard.
- [x] Implement search, filters, sorting, hierarchy, collapse/expand, and pinning.
- [x] Implement source and priority-signal management.
- [x] Implement import/export and browser persistence.
- [x] Add normalized seed data and customer-safe relevance explanations.
- [x] Add tests and accessibility checks.
- [x] Configure GitHub Pages deployment.

Exit criteria:

- The production build succeeds.
- Core filtering and persistence tests pass.
- The critical flows work at desktop and mobile widths.
- No credentials or customer-confidential priority signals are committed.

### Milestone 2 - Automated public-source ingestion

- [x] Add reusable migration for the FabCon briefing, Fabric Digest index, source registry, roster, prior runs, and fingerprints.
- [x] Add exact date-window RSS/Atom collection.
- [x] Add canonical URL and normalized-title deduplication against the imported archive.
- [x] Add SHA-256 URL, title, content, and external-id fingerprints.
- [x] Persist duplicate fingerprints between GitHub Actions runs.
- [x] Separate new items from archive, prior-run, and same-run duplicates.
- [x] Add live run execution status and local-request correlation.
- [x] Add a dedicated Collection screen for who, what, sources, topics, and dates.
- [x] Add an explicit Everything mode that collects every item from selected people and sources.
- [x] Add Select all plus source add, edit, and persistent delete controls to Who & Where.
- [x] Pass browser-local custom sources safely into GitHub Actions as source overrides.
- [x] Add archive-only reuse and a downloadable collection request.
- [x] Add a manual GitHub Actions workflow with explicit failure artifacts.
- [ ] Add durable source-health history and state transitions to published signals.
- [ ] Add optional LLM summaries and priority matching.
- [ ] Add a scheduled refresh policy after Igor selects the desired cadence.
- [ ] Add a review gate before customer-safe publication.

### Milestone 2.1 - Digest synthesis

- [x] Add validated collection-result import and local centralization.
- [x] Add another URL and normalized-title deduplication pass during import.
- [x] Add persistent digest selection.
- [x] Add an immediate deterministic reading digest.
- [x] Add Azure OpenAI digest generation with JSON-mode output.
- [x] Add structured output validation and selected-item id enforcement.
- [x] Add digest workflow status and request correlation.
- [x] Add private AI digest import and browser-local library.
- [ ] Configure Igor's chosen Azure OpenAI deployment through repository secrets.

Exit criteria:

- A scheduled run produces a deterministic dataset.
- Every published claim has traceable evidence.
- Failures are visible in Actions and in source health.

### Milestone 3 - LinkedIn deep capture

- [ ] Build the Edge/Chrome capture helper.
- [ ] Capture post content and author-comment links.
- [ ] Detect incomplete or collapsed comment threads.
- [ ] Import captured records into the review queue.
- [ ] Document installation and safe operating limits.

Exit criteria:

- No LinkedIn credentials leave the browser.
- Every capture records coverage limits.
- Imported links are attributable to the post author.

### Milestone 4 - Private shared workspace

- [ ] Decide whether cross-device/private persistence is required.
- [ ] If required, add Microsoft Entra ID authentication and a minimal Azure API.
- [ ] Store private priority signals separately from the public GitHub Pages artifact.
- [ ] Add role-based access and an audit trail.

This milestone is intentionally gated. A public static site must not silently become a store for account-sensitive customer priorities.

## Quality and safety gates

- Every external URL uses HTTPS.
- Every signal cites at least one source.
- Customer-facing output includes only confirmed claims or clearly labelled commentary.
- Protected classes cannot be hidden by preference learning.
- Dates from LinkedIn remain approximate when LinkedIn supplies relative timestamps.
- Relevance language uses "could", "may", and "consider"; it does not claim customer adoption.
- CSV exports neutralize spreadsheet formulas.
- Duplicate items remain auditable but are excluded from the importable item list.
- Imported workspace files are schema-checked before replacing local data.
- The application contains no API keys, cookies, access tokens, or LinkedIn credentials.

## Current decision log

| Decision | Rationale |
| --- | --- |
| Product name: Strategic Signal by Igor | Preserves the professional product name while making Igor's personal curation unmistakable. |
| GitHub Pages for the customer experience | Fast, inexpensive, proven by the FabCon project, and easy to share. |
| Local-first source and priority edits | Prevents customer priorities and credentials from being exposed by a public static host. |
| Official sources outrank social sources | Preserves the evidence discipline established by Fabric Digest. |
| LinkedIn capture is user-triggered | Works with the signed-in browser session and avoids brittle unattended scraping. |
| Two-level taxonomy | Supports fast scanning while remaining flexible as the topic set grows. |
