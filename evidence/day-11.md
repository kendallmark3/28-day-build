# Day 11 Evidence — Model the domain

Structured per `templates/evidence.md`.

## Intent tested
`days/day-11.md`: add data structures for projects, intents, evidence, reviews, and capabilities as pure functions in `app/logic.js`, store them as one versioned state, and make the model visible.

## Observed
- Run out of sequence (after Days 12 and 13) at the user's request. The feature intent for this day was written first, on Day 10, from the deficiency chosen there; the day file was refined after the build (a process slip, noted here).
- Intent check on `days/day-11.md`: "data structures" and "visible in the UI" were undefined; "projects, intents, evidence records, and capabilities" left out reviews, which Day 22's review skill needs; nothing said how old stored data would be handled; the criteria were generic. The Day 10 intent set out the record types, an upgrade rule for old data, and 7 criteria.
- Built `app/logic.js` (the model: `emptyState`, `makeIntent`, `makeEvidence`, `makeReview`, `makeCapability`, four `problems...` validators, `normalizeState`, `sampleState`, and the constants for labels, statuses, levels, consequence levels, and the 28 day titles). The existing pure functions (Jira analyser, export, dashboard, sample intents) were moved into it by line range, unchanged. `app/app.js` shrank from about 500 to about 270 lines. Decision recorded in `docs/decisions/0002-split-logic-from-ui.md`.
- Stored data is now one object: `version: 2`, `projects`, `intents`, `evidence`, `reviews`, `capabilities`, `progress`. Data in the old shape (`{intents: [...]}`) is upgraded on load. Nothing is written back until the user saves, so old data stays as it was until then.
- The two built-in capabilities, "Intent check" and "Evidence-first review", are defined in code, with purpose, procedure, output, checks, owner, version, level, and source file taken from `skills/intent-check.md` and `skills/evidence-first-review.md`.
- The Overview view (new nav item) shows a "Data model" panel: counts of projects, intents, evidence records, reviews, and capabilities. Reset to sample data now restores every record type (3 intents, 3 evidence records (one per label), 1 review, capability uses with one promoted, and 8 ticked days), and the confirmation says so.
- Verified in real Chrome: 18 new checks pass (stored shape; old data intact; six functions deterministic; input unchanged; nine invalid records dropped and counted while valid ones stay; built-ins re-added with their uses kept; sample state valid; Overview counts match storage; no horizontal scroll at 375px) and the regression suite passes 155 of 155. Two older nav checks were made to depend on the nav list rather than a fixed count of three.
- Files changed: `app/logic.js` (new), `app/app.js`, `app/index.html`, `app/styles.css`, `context/architecture.md`, `docs/decisions/0002-split-logic-from-ui.md`, `days/day-11.md`, this record.

## Inferred
- Reading `logic.js` is now easier than reading the old 500-line file, but `analyzeStory` is still one 111-line function.
- Because nothing is written back on load, opening old data and closing the app loses nothing, and invalid records are dropped only on the next save. That drop is silent until Day 19.

## Assumed
- Reviews belong in the model now because a later day needs them; nothing in the Day 11 text asked for them.
- Progress is stored as ticked days (`progress.days`); the sample marks days 1-8. That shape was chosen for the Day 24 metric and may change.
- The one default project ("My project") is enough for now: there is no way to add or switch projects, and no day asks for one.
- The built-in capability text matches the skills files today. Nothing stops them drifting until Day 21's check.

## Deterministic checks
- [x] Syntax / build: no build step; `node --check` passes for both files.
- [x] Functional behavior: 18 new checks and 155 regression checks.
- [x] Validation rules: nine invalid records dropped and counted; valid ones kept.
- [ ] Accessibility spot-check: only the Overview counts were added; not tested with a screen reader.

## What failed
- Nothing failed in the final run. The first regression run had two failures (keyboard order and one nav check) caused by the new fourth nav item; the tests were changed to use the nav list. One run crashed on a Chrome connection error and was re-run.

## What was not checked
- A store damaged in ways other than the nine cases tested. Two open tabs writing at once. Whether `normalizeState` is fast on very large stores. The Overview on a real phone.

## What changed in the next intent
- Days 16-25 can now build evidence, readiness, guardrail, capability, and metric features on one model. The nav wraps to two rows on a phone with only four items; the layout needs attention before more items are added. Corrupt-data handling is Day 19.
