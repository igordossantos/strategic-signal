# Strategic Signal

Strategic Signal by Igor turns trusted technology sources into fast, customer-ready intelligence personally curated for the conversation in front of him.

It is designed for Igor Dos Santos, Cloud and AI Solutions Engineer at Microsoft. The taxonomy is deliberately open: the briefing can span any platform, product, architecture, or emerging idea relevant to a customer's priorities.

Public URL: <https://igordossantos.github.io/strategic-signal/>

## Current release

Milestone 1 delivers:

- A polished, responsive briefing experience.
- Search across content, products, tags, audiences, and relevance explanations.
- Audience, platform, section, status, evidence, and protected-signal filters.
- Two-level collapsible sections such as `Microsoft Fabric > Admin & Governance`.
- Evidence status, source links, source discrepancies, protected-signal flags, and suggested next steps.
- Priority-signal-backed explanations for Farmers Insurance, Zurich Insurance Group, and Zurich Brazil.
- A discussion list with Markdown and CSV export.
- Automatic topic hashtags plus personal per-item hashtags.
- Clickable hashtag filtering and a personal hashtag editor on every signal card.
- Hashtags included in Markdown, CSV, and workspace exports.
- Priority-lens hashtags offered directly inside the item hashtag editor.
- Source and priority-signal management screens.
- Dynamic customer, subsidiary, and priority filters generated from active priority signals.
- Hashtag-powered Priority Lenses: one primary direct-assignment hashtag, supporting topic hashtags, and optional phrase fallbacks.
- A reusable archive imported from both predecessor projects.
- A dedicated Collection screen for selecting people, sources, topics, and exact inclusive date windows.
- Select all, add, edit, and delete controls directly inside Who & Where.
- Explicit Everything versus Specific topics collection modes.
- Per-source technology and coverage tags that explain what "everything" from that person represents.
- Browser-local custom sources embedded into generated GitHub Actions commands as validated source overrides.
- Live GitHub Actions execution status with queued, running, succeeded, failed, and cancelled states.
- Correlation between browser-prepared requests and remote runs through a stable request id.
- Persistent SHA-256 duplicate detection across the archive, the current run, and prior workflow runs.
- Archive-only reuse without a new network collection.
- Date-window RSS/Atom collection through GitHub Actions.
- Explicit browser-assisted queues for LinkedIn and manual queues for reference sources.
- Versioned browser-local persistence plus workspace import and export.
- Light and dark themes, keyboard search, reduced-motion support, print styling, and responsive layouts.
- Automated test, build, audit, and GitHub Pages deployment.

The briefing opens with a focused current set for speed and exposes the imported research through its catalog-scope filter. Scheduled collection, optional LLM enrichment, and the LinkedIn capture helper remain in the implementation plan.

The imported archive currently contains:

- 208 FabCon briefing announcements with rich summaries and citations.
- 51 indexed Fabric Digest signals.
- 259 normalized reusable signals after migration.
- 41 normalized source definitions.
- 20 curated LinkedIn people.
- Five prior run records and the existing deduplication fingerprints.

## Project documents

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Current checkpoint](docs/CHECKPOINT.md)

## Design principles

1. **Official sources establish facts.** Expert and social sources provide framing.
2. **Priority signals shape relevance, not truth.** A relevance explanation is a suggested discussion point, never a claim about a customer's environment.
3. **Protected signals always surface.** Breaking changes, hard dates, security, licensing, pricing, and source conflicts cannot be optimized away.
4. **Private inputs remain private by default.** Source edits and priority signals stay in the current browser until explicitly exported.
5. **Personal organization stays portable.** Personal hashtags are saved in the versioned workspace and travel with workspace exports.
5. **LinkedIn remains user-triggered.** The product does not store LinkedIn credentials or pretend a full profile history can be enumerated.

## Local development

Requirements:

- Node.js 24
- npm 11 or later

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Validation

```powershell
npm run lint
npm test
npm run build
npm audit --omit=dev

# Or run the complete gate:
npm run check
```

The production site is generated in `dist/`.

## Collection runs

Open **Collect** in the application to:

1. Choose an inclusive start and end date.
2. Choose **Everything** or **Specific topics**.
3. If needed, enter topics or technologies.
4. Select all sources or choose automatic feeds, LinkedIn people, and reference sources individually.
5. Add, edit, or delete sources directly in Who & Where.
6. Reuse matching archive candidates without collecting again.
7. Prepare a collection request and copy the exact GitHub CLI command.
8. Open the GitHub Actions workflow and download the resulting JSON artifact.

The Execution status panel:

- Reads the public GitHub Actions API without storing a token.
- Refreshes automatically every 90 seconds.
- Shows run ids, attempts, timestamps, durations, conclusions, and active step progress.
- Links directly to each GitHub run and its result artifact.
- Clearly distinguishes a locally prepared request from a workflow that actually started.

## Duplicate detection

Every collected item receives SHA-256 fingerprints for:

- Canonical URL
- Normalized title
- Normalized title plus content
- External source id or feed guid

Each observation is classified as:

- `new`
- `archive`
- `prior-run`
- `same-run`

Only new items are written to the importable `items` collection. Duplicates are
retained separately with their reason and original item reference for auditing.
GitHub Actions restores and saves the duplicate index between workflow runs.

Run the collector locally:

```powershell
npm run collect -- `
  --from 2026-10-01 `
  --to 2026-10-15 `
  --sources fabric-updates-rss,pbi-updates-rss `
  --topics "agents,governance,sql"
```

Regenerate the reusable archive from the two sibling projects:

```powershell
npm run import:legacy
```

Collection modes:

- **Automatic** — RSS and Atom feeds collected in the exact date window.
- **Browser-assisted** — LinkedIn post and author-comment capture from Igor's signed-in browser.
- **Reference** — retained for research and queued until a dedicated collector exists.

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/components/BriefingView.tsx` | Search, filters, hierarchy, cards, and discussion list |
| `src/components/SourcesView.tsx` | Source-management experience |
| `src/components/GuidanceView.tsx` | Customer priority-signal experience |
| `src/components/CollectionView.tsx` | Date-window, source, person, topic, archive-reuse, and run-preparation experience |
| `src/components/AboutView.tsx` | Method, architecture, and delivery roadmap |
| `src/data/seed.ts` | Starter sources, priority signals, and normalized news |
| `src/lib/signals.ts` | Pure filtering, sorting, grouping, and export logic |
| `src/lib/workspace.ts` | Versioned local persistence and validated import |
| `src/lib/archive.ts` | Runtime archive loading and schema validation |
| `scripts/import-legacy.mjs` | Repeatable migration from both predecessor projects |
| `scripts/collect.mjs` | Date-window RSS/Atom collector and assisted-source queue |
| `src/lib/githubRuns.ts` | Public GitHub Actions run and job status client |
| `public/data/archive.json` | Normalized reusable intelligence archive |
| `config/collection-sources.json` | Source capabilities used by collection runs |
| `.github/workflows/collect.yml` | Manual date-window collection workflow |
| `docs/IMPLEMENTATION_PLAN.md` | Product, architecture, safety, and delivery plan |
| `docs/CHECKPOINT.md` | Current execution checkpoint |
| `.github/workflows/pages.yml` | Validation and GitHub Pages deployment |

## Privacy and safety

- Do not commit confidential customer priority signals to this public repository.
- Do not place API keys, GitHub tokens, LinkedIn cookies, or credentials in the application.
- Workspace exports may contain private priority signals. Treat exported JSON as customer-sensitive.
- Verify current availability, licensing, pricing, and regional support before making decisions.
- Strategic Signal is not a contractual roadmap or an official publication of Microsoft or any customer.
