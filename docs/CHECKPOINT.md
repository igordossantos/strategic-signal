# Strategic Signal - Checkpoint

## Checkpoint 01 - Foundation

Date: 2026-10-15

### Completed

- Inspected the local `fabcon-barcelona-2026` application, dataset, tests, deployment workflow, and live GitHub Pages site.
- Inspected the `fabric-digest` roster, source model, preference model, archive, and measured LinkedIn constraints.
- Confirmed GitHub CLI authentication for `igordossantos`.
- Confirmed the working repository name `strategic-signal` is available.
- Selected a static React + TypeScript + Vite architecture.
- Defined the two-level information architecture, normalized schemas, evidence policy, local-first configuration model, and LinkedIn capture strategy.
- Created the detailed implementation plan in `docs/IMPLEMENTATION_PLAN.md`.
- Scaffolded the new application.
- Built the responsive briefing dashboard, two-level collapsible hierarchy, search, filters, sorting, protected-signal treatment, and discussion list.
- Built source and priority-signal management with validated browser-local persistence and workspace import/export.
- Added a normalized research snapshot with evidence grades, source links, source discrepancies, next steps, and audience-specific relevance explanations.
- Added responsive light and dark themes, keyboard search, reduced-motion support, print styling, and customer-safe disclaimers.
- Added GitHub Actions validation and GitHub Pages deployment.
- Removed unused dependencies; the full npm audit now reports zero vulnerabilities.
- Published the public repository at `https://github.com/igordossantos/strategic-signal`.
- Published and smoke-tested the application at `https://igordossantos.github.io/strategic-signal/`.

### Validation completed

1. `npm run lint` passes.
2. Nine Vitest unit tests pass.
3. Four Node repository and safety tests pass.
4. TypeScript compilation and the Vite production build pass.
5. `npm audit` reports zero vulnerabilities.
6. Desktop and mobile browser checks show no horizontal overflow.
7. Audience filtering, section hierarchy, pinning, and the discussion dialog work.
8. Source creation persists after reload and can be removed.
9. Priority signal creation persists after reload.
10. Mobile navigation works at a 390-pixel viewport.

### Deployment record

- Repository: `igordossantos/strategic-signal`
- GitHub Pages: `https://igordossantos.github.io/strategic-signal/`
- Initial release commit: `62a39de40989b45f34b5c4cd7e25fecd60335f57`
- GitHub Actions run: `38764085574`
- Deployment result: successful
- Production smoke test: 11 signal cards rendered, light theme initialized, no horizontal overflow at a 1280-pixel viewport

## Checkpoint 02 - Igor brand and dynamic priority lens

Date: 2026-10-15

### Completed

- Reframed the product as **Strategic Signal by Igor** and made Igor's personal curation visible in the header, hero, metadata, About page, and footer.
- Replaced the radar-style mark with an original monogram: a central `I`, signal arcs, and a signal point.
- Opened the product language beyond a fixed Fabric, Foundry, Databricks, or SQL list.
- Replaced the user-facing term **Guidance** with **Priority signals**.
- Made customer and subsidiary filters derive dynamically from active priority signals.
- Added deterministic dynamic matching so a new priority signal immediately creates traceable relevance mappings against matching technology news.
- Added a specific priority-signal filter in addition to the customer/subsidiary filter.
- Shifted the experience to graphite surfaces with restrained blue interaction and brand accents.
- Moved **Expand all**, **Collapse all**, and each section's disclosure control to the left.
- Added automated coverage for dynamic priority matching.

### Validation completed

- Ten Vitest tests pass, including dynamic priority-signal matching.
- Four Node repository and safety tests pass.
- Lint, TypeScript, production build, and full dependency audit pass.
- Desktop browser verification confirms the expand/collapse controls are left of the results summary.
- Section disclosure controls render before the section mark and title.
- Mobile verification at 390 pixels shows no horizontal overflow.

### Known boundaries

- GitHub Pages cannot directly read authenticated LinkedIn content.
- LinkedIn post history is not completely enumerable through the tested browser surface.
- Source edits and priority signals are browser-local in Milestone 1.
- Automated LLM enrichment requires a separately configured secret and is planned for Milestone 2.

### Resume point

After the GitHub Pages deployment is verified, begin Milestone 2 with scheduled RSS/Atom ingestion, deduplication, source health, and optional LLM enrichment.
