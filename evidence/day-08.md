# Day 08 Evidence — Map context

Structured per `templates/evidence.md`.

## Intent tested
`days/day-08.md` (refined): bring `context/architecture.md`, `glossary.md`, `security.md`, and `non-goals.md` in line with what the app does today, and make the app cite the context files where their rules drive behavior, instead of leaving them unreferenced.

## Observed
- Starting state: the six context files were the starter's originals. `architecture.md` listed six planned modules (Dashboard, Intent Builder, Context Library, Evidence & Review, Capability Library, 28-Day Progress), none matching the app as built. The glossary had 9 terms and none of the labels or tags the app now shows. `security.md` and `non-goals.md` said nothing about pasted stories or Jira. The app mentioned `context/` only as plain text on the References view.
- Intent check on `days/day-08.md` found: "document" was unclear (the files exist; they needed updating); "point to context" and "curated context layer" were undefined; nothing said how to judge "accurate"; the feature intent's file boundary listed `context/` as off-limits, which conflicted with this day's job; "visibly improved" and the stop condition were unchecked. I rewrote the Intent, Inputs, Outputs, Constraints, Success criteria, and Stop when.
- The feature intent's file boundary no longer matched how the days actually work (each day edits its own day file, evidence record, and `intent/current-feature.md`). I rewrote it: code changes are limited to the three `app/` files; each day may also edit its own day file, that file, its evidence record, and any `context/` file its intent names. The link rule was also amended so the References view may link to this project's own repository files, and 3 criteria were added.
- Context files edited: `architecture.md`, `glossary.md`, `security.md`, `non-goals.md` (4 files, 43 lines added, 6 removed). `business-rules.md` and `ux-standard.md` were not touched (Day 9).
- App changes: a "Project context" section at the top of the References view (six files, a purpose line and a GitHub link each, opening in a new tab); a "Source:" line on each Jira note that applies a rule from `context/` (12 places in `app/app.js`, set explicitly per note); the duplicate plain-text `context/` line under "In this repository" was removed.
- Each note's source: Security → `security.md`. Missing criteria, Uncheckable, Ambiguity → business rule 2. Stop, Missing constraints → rule 3. Consequence → rule 6 and `security.md`. Missing outcome reason, inputs, outputs, and the "Suggested" note → the glossary entries. Scope, Size, and Limits have no source because no context file states those rules.
- Verified in real Chrome plus reading the files from disk: 120 checks, 120 passed (19 new; all earlier checks re-run; two checks about link counts rewritten to match the amended intent). Each new statement in the context files, and how it was checked:
  - `architecture.md`: the storage key `intent-workbench-v1` and shape `{intents: [...]}` (matches `app.js`); static files with no framework or build (no `package.json`, exactly one script tag, no `http(s)` resource in the page or stylesheet); no network request of its own (no `fetch`, `XMLHttpRequest`, `WebSocket` in the code, and no request left the app's origin in the full run); the three named functions exist and touch neither the page nor storage (checked by reading each function body); the built views and modal exist (3 nav items, `jiraDialog`); planned modules are absent from the app.
  - `glossary.md`: all 12 labels and tags the app shows have an entry (the test extracts them from `app.js`). The definitions of the labels and tags were compared to the app's text by reading; "Intent check" is from `skills/intent-check.md`; "observed / inferred / assumed" is from `templates/evidence.md`; "Ready" is from business rules 1 and 3.
  - `security.md`: a pasted story is never stored (the story text is not in `localStorage` after a build) and never leaves the origin; it is shown as text (an `<img onerror>` story did not run); a credential story gets a Security note; links carry `rel="noopener noreferrer"`; no third-party script, font, or image.
  - `non-goals.md`: no Jira connection (no network code, no file input); fixed rules, not AI; no second-story feature exists.
- The rules cited by the notes were read from the files on disk and each says what its note claims: rule 2 contains "checkable"; rule 3 names a constraint and a stop condition; rule 6 says "High-consequence work requires explicit human approval"; `security.md` says "secrets, credentials" and "human-approved"; the glossary entries for Intent ("why it matters"), Inputs, Outputs, and Suggested.
- No context-file sentence of 35 or more characters appears in `app.js` or `index.html`, so the files stay the single source.
- All six context links returned HTTP 200 from GitHub. Note this check ran before the push, so it shows the paths exist; the linked files show the Day 8 versions only after the push.
- Screenshots viewed: the new References section at 1280px, and the notes with Source lines at 375px.
- Files changed: four `context/` files; `app/index.html`, `app/app.js`, `app/styles.css`; `days/day-08.md`; `intent/current-feature.md`; this record.

## Inferred
- Linking to GitHub, and not serving the files from inside the app, was the way to point at the context without copying it. The alternative was to serve the repository root, which would change how the app is run. I chose links because the app must stay runnable from `app/` alone.
- Because the Source lines are set one by one, changing a note's wording cannot silently change its citation. The cost is that a new note has no Source line until someone adds one. Nothing in the app checks this.
- The "Progressive intent" definition is a paraphrase of `START-HERE.md` ("Intent → Result → Evidence → Refined Intent → Better Result"), not a quotation.

## Assumed
- The links target `https://github.com/kendallmark3/28-day-build` on the `main` branch, which is the repository the project was pushed to. If the repository is renamed or made private, the six links break.
- One purpose line per file is enough for "point to context". The purpose lines are my wording.
- The ROADMAP says Day 8 covers architecture and domain terms only, while the day file also names security and non-goals. I followed the day file and kept the security and non-goals edits short.
- Someone reading the context files will not be confused that `architecture.md` says "Built (as of Day 8)". The date will go stale as the app changes.

## Deterministic checks
- [x] Syntax / build — no build step; `node --check app/app.js` passes; no console errors in the run.
- [x] Functional behavior — 120 of 120 checks, per Observed.
- [x] Validation rules — each cited rule is read from the file and compared with the note's claim.
- [ ] Accessibility spot-check — partial. The new section uses the same list and link styles as the rest of the page; new links have visible focus by the existing rule; screen readers were not tested.

## What failed
Nothing failed in the final run. My first screenshot of the new section showed a dialog left open by an earlier check. That was a test artifact, since changing only the URL fragment doesn't reload the page, so I took a clean one.

## What was not checked
- The context files were not read by a person who wasn't in this chat, so whether they are understandable to a teammate is untested.
- The definitions in the glossary were compared to the app by reading, not by a test. Only their presence is tested.
- Offline behavior: the six context links need a network connection and GitHub; the rest of the app does not.
- Nothing keeps the context files true as the app changes. The claim checks live in a temporary scratchpad script, not the repo.
- `ux-standard.md` still contains "Clear, quiet, professional interface" and "Mobile layout must remain usable", the vague phrases flagged on Day 3.

## What changed in the next intent
- Day 9 ("Improve context quality: remove irrelevant context and add one example of excellent intent output") is next. It should rewrite the two vague `ux-standard.md` lines, and decide what in `context/` is irrelevant now that it has grown. The example intent could reuse the Jira sample.
- Not built, per the stop rule: a check that every new Jira note has a Source; serving the context files from inside the app so they open offline; moving the verification script into the repo.
