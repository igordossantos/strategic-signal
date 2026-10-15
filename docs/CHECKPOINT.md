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

## Checkpoint 07 - Run status and persistent duplicates

Date: 2026-10-15

### Run execution status

- Added a live status panel backed by the public GitHub Actions API.
- Added queued, running, completed, succeeded, failed, and cancelled states.
- Added run id, attempt, start time, duration, result-artifact availability, and direct run links.
- Added active job and step progress.
- Added bounded 90-second automatic refresh plus manual refresh.
- Added explicit GitHub API errors and remaining-rate-limit visibility.
- Added a stable request id to generated commands and workflow run names.
- Added correlation between locally prepared requests and remote workflow runs.
- Added an explicit warning when a request is prepared locally but no matching GitHub run exists.
- Confirmed that the repository currently has one completed successful remote collection run; a newly prepared browser request remains local until Run workflow is completed.

### Duplicate detection

- Added canonical URL fingerprints.
- Added normalized-title fingerprints.
- Added normalized title-and-content fingerprints.
- Added external feed-guid and LinkedIn/blog-id fingerprints.
- Added archive duplicate classification.
- Added prior-run duplicate classification.
- Added same-run duplicate classification.
- Added duplicate reasons and original item references.
- Excluded duplicates from the importable `items` list while preserving them in `duplicates`.
- Added a persisted deduplication index restored and saved through GitHub Actions cache.
- Added the deduplication index to downloadable run artifacts.

### Validation completed

- A two-entry fixture with the same content produced one new item and one same-run duplicate.
- Repeating the fixture with the persisted index produced zero new items and two prior-run duplicates.
- The local status panel loaded the successful remote run and showed its duration and artifact availability.
- A new prepared request displayed the not-yet-dispatched warning and included its request id in the generated command.
- Twenty-four automated tests pass.
- Lint, TypeScript, production build, dependency audit, API status loading, and duplicate persistence pass.

### Deployment and proof record

- Release: `1.6.0`
- Feature commit: `d7d48abaa1876e93d3218cf6a9b0c74151f03a50`
- GitHub Pages run: `38783065831`
- First dedup proof run: `38783172429` — one observation, one new item, zero duplicates
- Second identical proof run: `38783322285` — one observation, zero new items, one `prior-run` duplicate
- Third cache-v5 proof run: `38783794867` — zero new items, one `prior-run` duplicate, no deprecated cache-action warning
- The second duplicate references the exact original Fabric Updates item id.
- Production status panel displayed the successful remote runs, durations, artifact availability, API check time, and remaining rate limit with no horizontal overflow.

## Checkpoint 08 - Digest Builder and Azure OpenAI

Date: 2026-10-15

### Centralization

- Added validated import for completed collection `run.json` files.
- Added local duplicate checks against centralized ids, canonical URLs, and normalized titles.
- Added normalized Signal creation for new collected items.
- Added collected items to the main briefing and Digest Builder catalogs.
- Added browser-local persistence and workspace export for centralized items.

### Digest Builder

- Added a dedicated Digest navigation item and screen.
- Added Current, Collected runs, Imported archive, and Everything catalog scopes.
- Added search and technology filtering.
- Added a persistent reading queue with discussion-list import.
- Added 30-item local and 15-item AI selection limits.
- Added an immediate structured reading digest grouped by technology and section.
- Added generally-available and protected-signal counts.

### Strong-LLM option

- Confirmed GitHub Models inference is retired as of July 2026.
- Added Azure OpenAI / Microsoft Foundry chat-completions integration.
- Added internal, customer, learning, and executive intents.
- Added concise, standard, and deep output.
- Added named audience and additional-instruction controls.
- Added JSON-mode generation, required-field validation, and selected-item id enforcement.
- Added explicit missing-secret and API failure messages.
- Added a dry-run workflow option for request validation without model usage.
- Added GitHub Actions status, artifact import, and a private browser-local AI digest library.

### Validation completed

- Imported one new item from a real collection proof artifact and confirmed persistence after reload.
- The centralized item appeared under Collected runs and built an immediate reading digest.
- An AI digest request was prepared with a stable request id and selected evidence JSON.
- A structured Azure OpenAI fixture imported and rendered executive summary, themes, must-know items, customer connections, questions, and caveats.
- Azure OpenAI dry-run request construction passes.
- Missing Azure OpenAI configuration fails explicitly.
- Twenty-nine automated tests pass.
- Lint, TypeScript, production build, dependency audit, centralization, digest selection, request construction, and digest import pass.

### Deployment record

- Release: `1.7.0`
- Release commit: `d783f8d7cb4ad46619894931d4ef22fa693b0ec8`
- GitHub Pages run: `38786510680`
- Azure digest dry-run workflow: `38786697205` — succeeded and uploaded its request artifact
- Production smoke test: 11 selectable current items, one-item reading digest generation, Azure secret guidance, AI workflow status refresh from Running to Succeeded, and no horizontal overflow
- Repository secret inspection found no Azure OpenAI secrets yet; real model execution remains intentionally blocked until Igor configures the endpoint, API key, and deployment.

## Checkpoint 09 - Consolidated handoff

Date: 2026-10-15
Checkpoint time: 3:24 PM Eastern

### Live resources

- Application: `https://igordossantos.github.io/strategic-signal/`
- Repository: `https://github.com/igordossantos/strategic-signal`
- Collection screen: `https://igordossantos.github.io/strategic-signal/#collect`
- Digest Builder: `https://igordossantos.github.io/strategic-signal/#digest`
- Current release: `1.7.0`
- Current checkpoint commit before this handoff: `ed0af93339d97ee4377b39414407047f6a49de80`
- Feature commit for Digest Builder: `d783f8d7cb4ad46619894931d4ef22fa693b0ec8`

### Product state

Strategic Signal by Igor is a public static GitHub Pages application with a
private, versioned browser workspace. The public repository contains public
source definitions, the normalized historical archive, application code, and
GitHub Actions workflows. Customer priorities, personal hashtags, imported run
results, selections, and imported AI digests remain in the browser unless Igor
explicitly exports the workspace.

The application currently provides:

- Personalized Strategic Signal by Igor brand and custom `I + signal` monogram.
- Fast current briefing with search, filters, hashtags, priority lenses,
  collapsible hierarchy, discussion selection, and exports.
- Source management and in-place source CRUD from Collection.
- Priority Signals powered by direct and supporting hashtags.
- Exact date-window collection planning with Everything or Specific topics.
- Archive-first reuse and run-result import.
- Live GitHub Actions execution status.
- Persistent duplicate detection across archive, same run, and prior runs.
- Digest selection, immediate local reading digest, Azure OpenAI workflow
  preparation, AI run status, and private digest import.

### Reusable data

- FabCon announcements imported: `208`
- Fabric Digest indexed signals imported: `51`
- Normalized archive signals: `259`
- Effective combined catalog before browser-local imports: `261`
- Fast default current cards: `11`
- Normalized source definitions: `41`
- Curated LinkedIn people: `20`
- Prior Fabric Digest run records: `5`
- Existing legacy fingerprints retained: yes

### Collection workflow

Workflow: `.github/workflows/collect.yml`

Inputs:

- `request_id`
- Inclusive `from` and `to` dates
- Comma-separated source ids
- Optional topics
- Optional browser-local source override JSON

Collection modes:

- Automatic RSS/Atom
- Browser-assisted LinkedIn
- Reference/manual

Output artifact:

```text
collection-runs/
  run.json
dedup-index.json
```

To centralize a run:

1. Open Collect.
2. Find the completed run under Execution status.
3. Select View run.
4. Download the `strategic-signal-<from>-to-<to>` artifact.
5. Extract the ZIP.
6. Select Import result in Collect.
7. Choose `collection-runs/run.json`.

Only new items are imported. Archive matches, prior-run duplicates, same-run
duplicates, invalid records, and already-centralized titles or URLs are skipped.

### Duplicate detection

Each observation receives SHA-256 fingerprints for:

- Canonical URL
- Normalized title
- Normalized title plus normalized content
- External feed guid, LinkedIn urn, or blog id

Classification values:

- `new`
- `archive`
- `prior-run`
- `same-run`

The importable `items` array contains only new items. The separate `duplicates`
array preserves the reason and original reference for auditability.

Persistent proof:

- Run `38783172429`: one observed, one new, zero duplicates.
- Run `38783322285`: one observed, zero new, one prior-run duplicate.
- Run `38783794867`: cache-v5 proof; zero new, one prior-run duplicate.

### Execution status

The Collect screen reads the public GitHub Actions API without storing a token.
It displays queued, running, succeeded, failed, and cancelled states, plus run
id, attempt, timestamps, duration, result artifact availability, and active job
progress. It refreshes every 90 seconds and supports manual refresh.

Prepared browser requests now carry a stable request id. A request is shown as
prepared but not dispatched until a matching GitHub workflow run appears.

### Digest Builder

Digest sources:

- Current briefing
- Browser-centralized collection results
- Imported archive
- Entire catalog

Selection limits:

- Local reading digest: `30` items
- Azure OpenAI digest: `15` items
- Workflow command safety limit: `25,000` characters

Immediate local digest:

- Requires no external model.
- Groups selected items by technology and section.
- Shows status, dates, summaries, generally-available count, protected-signal
  count, and suggested next steps.

AI digest:

- Internal briefing, customer-ready, learning, or executive intent.
- Concise, standard, or deep output.
- Optional named audience and additional instructions.
- JSON-mode generation.
- Required-field validation.
- Rejects references to unselected item ids.
- Result remains a workflow artifact until imported into the browser.

AI result structure:

- Executive summary
- Key themes
- Must-know items
- Customer connections
- Questions to prepare for
- Reading order
- Caveats

### Azure OpenAI configuration

GitHub Models inference was retired in July 2026. The implemented strong-LLM
path therefore uses Azure OpenAI / Microsoft Foundry.

Required repository secrets are not configured yet:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`

Optional repository variable:

- `AZURE_OPENAI_API_VERSION`
- Default used by the workflow: `2024-10-21`

The digest dry-run workflow `38786697205` succeeded. It validated workflow
inputs, prompt construction, JSON-mode request generation, artifact upload, and
status reporting without calling a model.

Real model execution must remain blocked until the three required secrets are
configured. Missing configuration fails explicitly and uploads
`execution.log`; it does not return a success-shaped fallback.

### Browser-local workspace

Workspace schema version remains `1` with backward-compatible migration.

Persisted browser data includes:

- Sources
- Deleted-source tombstones
- Priority Signals
- Discussion-list selection
- Personal item hashtags
- Centralized collection signals
- Digest selection
- Imported AI digests

Workspace import and export remain available in the application header.

### LinkedIn boundary

LinkedIn remains browser-assisted:

- No LinkedIn credentials are stored.
- The activity history is not claimed to be fully enumerable.
- Visible post content and author-labelled comment links require the signed-in
  browser helper planned in the implementation plan.
- Coverage limits must remain explicit in every run.

### Validation baseline

- Vitest tests: `17`
- Node repository/workflow tests: `12`
- Total automated tests: `29`
- Lint: passing
- TypeScript: passing
- Production build: passing
- Dependency audit: zero known vulnerabilities
- Desktop smoke tests: passing
- Mobile smoke tests: passing
- Horizontal overflow: none in verified production views

Validated user journeys:

- Add, edit, select, delete, and persist sources.
- Select all sources and run Everything mode.
- Prepare exact date-window collection commands.
- Observe live run status.
- Import collection artifacts.
- Exclude duplicate observations.
- Add personal hashtags and direct-assign Priority Lenses.
- Select digest items.
- Build immediate local reading digest.
- Prepare Azure OpenAI digest request.
- Import and render structured AI digest.

### Known operational boundaries

- Collection artifacts require authenticated GitHub download.
- Collection result import is deliberate and browser-local; it is not silently
  published to the public site.
- Azure OpenAI secrets are not configured.
- A real model-generated digest has not yet run.
- LinkedIn capture helper is not yet implemented.
- Browser-local data is device/browser specific unless the workspace is
  exported.
- Cross-device private persistence remains a gated future milestone.

### Exact resume priorities

1. Configure the three Azure OpenAI repository secrets without placing their
   values in source code or chat.
2. Run one real Azure OpenAI digest against a small, non-sensitive selection.
3. Validate model output against the selected evidence and customer-safe
   wording rules.
4. Download and import `digest.json`; verify the reading experience in
   production.
5. Build the user-triggered Edge/Chrome LinkedIn capture helper.
6. Decide whether automatic collection results should remain deliberate local
   imports or move to an authenticated private shared workspace.
7. Decide collection schedule only after Igor chooses cadence and source scope.

### Key implementation files

- `src/App.tsx`
- `src/components/BriefingView.tsx`
- `src/components/CollectionView.tsx`
- `src/components/DigestView.tsx`
- `src/components/GuidanceView.tsx`
- `src/components/SourceEditorModal.tsx`
- `src/lib/archive.ts`
- `src/lib/collectionImport.ts`
- `src/lib/digestImport.ts`
- `src/lib/githubRuns.ts`
- `src/lib/signals.ts`
- `src/lib/workspace.ts`
- `scripts/import-legacy.mjs`
- `scripts/collect.mjs`
- `scripts/build-digest.mjs`
- `.github/workflows/pages.yml`
- `.github/workflows/collect.yml`
- `.github/workflows/digest.yml`
- `public/data/archive.json`
- `config/collection-sources.json`

### Known boundaries

- GitHub Pages cannot directly read authenticated LinkedIn content.
- LinkedIn post history is not completely enumerable through the tested browser surface.
- Source edits and priority signals are browser-local in Milestone 1.
- Automated LLM enrichment requires a separately configured secret and is planned for Milestone 2.

### Resume point

After the GitHub Pages deployment is verified, begin Milestone 2 with scheduled RSS/Atom ingestion, deduplication, source health, and optional LLM enrichment.
