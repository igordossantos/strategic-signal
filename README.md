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
- Source and priority-signal management screens.
- Dynamic customer, subsidiary, and priority filters generated from active priority signals.
- Versioned browser-local persistence plus workspace import and export.
- Light and dark themes, keyboard search, reduced-motion support, print styling, and responsive layouts.
- Automated test, build, audit, and GitHub Pages deployment.

The initial catalog is a representative normalized research snapshot. Scheduled collection, optional LLM enrichment, and the LinkedIn capture helper are defined in the implementation plan and follow in the next milestones.

## Project documents

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Current checkpoint](docs/CHECKPOINT.md)

## Design principles

1. **Official sources establish facts.** Expert and social sources provide framing.
2. **Priority signals shape relevance, not truth.** A relevance explanation is a suggested discussion point, never a claim about a customer's environment.
3. **Protected signals always surface.** Breaking changes, hard dates, security, licensing, pricing, and source conflicts cannot be optimized away.
4. **Private inputs remain private by default.** Source edits and priority signals stay in the current browser until explicitly exported.
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

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/components/BriefingView.tsx` | Search, filters, hierarchy, cards, and discussion list |
| `src/components/SourcesView.tsx` | Source-management experience |
| `src/components/GuidanceView.tsx` | Customer priority-signal experience |
| `src/components/AboutView.tsx` | Method, architecture, and delivery roadmap |
| `src/data/seed.ts` | Starter sources, priority signals, and normalized news |
| `src/lib/signals.ts` | Pure filtering, sorting, grouping, and export logic |
| `src/lib/workspace.ts` | Versioned local persistence and validated import |
| `docs/IMPLEMENTATION_PLAN.md` | Product, architecture, safety, and delivery plan |
| `docs/CHECKPOINT.md` | Current execution checkpoint |
| `.github/workflows/pages.yml` | Validation and GitHub Pages deployment |

## Privacy and safety

- Do not commit confidential customer priority signals to this public repository.
- Do not place API keys, GitHub tokens, LinkedIn cookies, or credentials in the application.
- Workspace exports may contain private priority signals. Treat exported JSON as customer-sensitive.
- Verify current availability, licensing, pricing, and regional support before making decisions.
- Strategic Signal is not a contractual roadmap or an official publication of Microsoft or any customer.
