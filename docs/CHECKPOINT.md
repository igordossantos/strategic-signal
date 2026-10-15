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

### Deployment record

- Release: `1.1.0`
- Release commit: `ac1ff36f2b4ee49249ac833c6ae5d2ce0f296cca`
- GitHub Actions run: `38768101330`
- Deployment result: successful
- Production smoke test: personalized title and hero rendered, Priority signals navigation and dynamic customer selector loaded, both collapse controls verified on the left, no horizontal overflow

## Checkpoint 03 - Archive reuse and collection runs

Date: 2026-10-15

### Reused without re-scraping

- Imported 208 rich announcements and 13 cited sources from the FabCon briefing.
- Imported 51 indexed signals, five prior runs, source configuration, and deduplication fingerprints from Fabric Digest.
- Imported all 20 tracked LinkedIn people and their coverage tags.
- Produced 259 normalized reusable signals and 41 normalized source definitions.
- Added a repeatable `scripts/import-legacy.mjs` migration so the archive can be regenerated.

### Collection runner

- Added inclusive `from` and `to` date validation.
- Added source and person selection by stable source id.
- Added optional topic filtering.
- Added RSS and Atom parsing for automatic public feeds.
- Added canonical URL and normalized-title matching against the archive.
- Added explicit browser-assisted queues for LinkedIn.
- Added explicit manual queues for reference sources.
- Added structured per-source errors and result summaries.
- Added a GitHub Actions workflow that returns the run JSON as a downloadable artifact.
- Tested the exact October 1–15, 2026 window against both official feeds: two sources completed, 18 items returned, zero source failures.

### Collection screen

- Added a dedicated **Collect** navigation item.
- Added date presets and custom inclusive dates.
- Added source, person, technology, collection-mode, and topic controls.
- Added an archive-only download that performs no new collection.
- Added prepared-run history in browser-local storage.
- Added generated GitHub CLI commands and direct access to the workflow.
- Added automatic, browser-assisted, and reference coverage labels.

### Performance and validation

- The briefing defaults to 11 current cards for speed.
- Imported archive content is available through Current + archive or Archive-only catalog scopes.
- Nineteen automated tests pass.
- Lint, TypeScript, production build, dependency audit, archive integrity, source-reference integrity, and invalid-date handling pass.
- Mobile Collection view at 390 pixels has no horizontal overflow.

### Deployment record

- Release: `1.2.0`
- Release commit: `aa0bfd2f53f49d8463dd9ef8adaa51c4f8331a4d`
- GitHub Pages run: `38770890655`
- Collection workflow run: `38771020992`
- Collection workflow result: two feeds completed, zero failed, seven topic-matched items returned for October 1–15, 2026
- Production smoke test: 259 archive signals, 208 FabCon announcements, 20 LinkedIn people, 41 selectable sources, two automatic feeds selected, exact requested date window loaded, no horizontal overflow

## Checkpoint 04 - Item hashtags

Date: 2026-10-15

### Completed

- Added normalized automatic hashtags from each signal's platform, section, and taxonomy.
- Added up to eight personal hashtags per item.
- Added a hashtag editor to every signal card.
- Added clickable hashtags that immediately filter the briefing.
- Added a global hashtag selector that follows the active catalog scope and other filters.
- Prioritized personal hashtags in the selector.
- Added hashtag search indexing.
- Included hashtags in Markdown and CSV discussion exports.
- Added backward-compatible workspace migration for saved workspaces that predate hashtags.
- Added hashtag persistence to workspace import and export.

### Validation completed

- Personal hashtag `#customer-follow-up` was added to a signal, filtered the catalog to one matching item, and remained after reload.
- Automatic and personal hashtags render together, with personal hashtags visually distinguished.
- Existing version 1 workspaces without `itemTags` migrate to an empty hashtag map.
- Twenty-one automated tests pass.
- Lint, TypeScript, production build, dependency audit, hashtag normalization, hashtag filtering, and workspace migration pass.

### Deployment record

- Release: `1.3.0`
- Feature commit: `b8c6b0e11c94cf7a0a827a5fd6da3ec4292ac139`
- Responsive correction: `92d5c7efbbfeb52a7aaef0298973452d7a5774da`
- GitHub Pages run: `38774287957`
- Production smoke test: 11 fast-default cards, 55 visible automatic hashtags, 11 personal-tag editors, 52 scoped filter options, and no horizontal overflow at 1280 pixels

## Checkpoint 05 - Hashtag-powered Priority Lenses

Date: 2026-10-15

### Completed

- Added one primary direct-assignment hashtag to every Priority Signal.
- Converted Priority Signal topic tags into normalized supporting hashtags.
- Made exact item-hashtag intersections the primary generated relevance mechanism.
- Retained additional matching phrases as a fallback for concepts not represented by a hashtag.
- Added active lens hashtags beneath the customer and priority selectors.
- Added every active primary lens hashtag to the item hashtag editor.
- Added backward-compatible workspace migration that derives a lens hashtag for existing Priority Signals.
- Added direct-tag evidence to generated relevance explanations.

### Verified behavior

- Added `#farmers-data-products` to Workspace-level surge protection.
- Selected Farmers Insurance and Governed data product management.
- The newly tagged item appeared immediately in that Priority Lens.
- The explanation explicitly cited `direct tag #farmers-data-products`.
- The lens assignment persisted after reload.
- Twenty-two automated tests pass.
- Lint, TypeScript, production build, dependency audit, direct hashtag assignment, and workspace migration pass.

### Deployment record

- Release: `1.4.0`
- Release commit: `282bfd07789f768f2b6a4bf2865eb40fda22c3ad`
- GitHub Pages run: `38776888825`
- Production smoke test: normalized lens badges and supporting hashtags rendered, the Farmers lens exposed six powered-by hashtags and six matched current items, and no horizontal overflow was present

## Checkpoint 06 - Who, Where, and Everything

Date: 2026-10-15

### Completed

- Added **Select all** to Who & Where while retaining Select shown, Automatic feeds, and Clear.
- Added source creation directly inside the collection screen.
- Added per-row edit and delete controls.
- Extracted one shared source editor used by both Sources and Collection.
- Added technology and coverage-tag editing so a person's domain explains the meaning of their content.
- Added persistent deletion tombstones so imported archive sources do not reappear after reload.
- Added URL-level duplicate protection and deletion across duplicate source aliases.
- Added **Everything** and **Specific topics** as explicit What modes.
- Made Everything the default.
- Hid the topic input in Everything mode and sent an intentionally empty topic filter.
- Added browser-local custom source overrides to generated GitHub Actions commands.
- Added collector validation for custom source overrides.

### Verified behavior

- Select all selected all 41 configured sources.
- A custom RSS source was created, assigned to Custom AI and Agent Platform, and automatically selected.
- The source name and technology coverage were edited in place.
- Everything mode generated `topics=''`.
- The generated command contained the complete custom source override.
- The custom source was deleted and remained deleted after reload.
- An imported source was deleted and remained suppressed through its workspace tombstone.
- Twenty-three automated tests pass.
- Lint, TypeScript, production build, source override validation, workspace migration, and responsive layout pass.

### Deployment record

- Release: `1.5.0`
- Release commit: `eb3a8e0cf1b373c51b5eb41262c6e1f30ef8b934`
- GitHub Pages run: `38778620677`
- Production smoke test: 41 source rows, Select all selected all 41, Everything was the default with no topic input, 41 edit controls and 41 delete controls rendered, and no horizontal overflow was present

### Known boundaries

- GitHub Pages cannot directly read authenticated LinkedIn content.
- LinkedIn post history is not completely enumerable through the tested browser surface.
- Source edits and priority signals are browser-local in Milestone 1.
- Automated LLM enrichment requires a separately configured secret and is planned for Milestone 2.

### Resume point

After the GitHub Pages deployment is verified, begin Milestone 2 with scheduled RSS/Atom ingestion, deduplication, source health, and optional LLM enrichment.
