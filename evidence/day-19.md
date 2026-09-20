# Day 19 Evidence — Design failure states

Structured per `templates/evidence.md`.

## Intent tested
`days/day-19.md` (refined before building): make the app's failures explicit (unreadable data, invalid records, missing fields, blocked storage, unexpected errors), keep a copy of anything that would be lost, and always offer a way back to a working state.

## Observed
- This closes Day 14's deferred probe A10 and the Day 15 review's finding F6: stored data that was not valid JSON used to be replaced silently by the next save.
- Intent check on `days/day-19.md`: "gracefully" and "explicit failure behavior" named no failures, no messages, and no test for recovery. I listed four failures (unreadable data, invalid records, blocked storage, an unexpected error), required each message to say what happened and what to do, and required a tested route back to a working app from each. Missing fields were already tolerated by `normalizeState`, so that was checked rather than rebuilt.
- Built: a pure `describeProblem` in `app/logic.js` (kind, message, and the actions offered; priority error, then blocked, then unreadable, then invalid records); a problem banner on every view (`role="alert"`, secondary buttons); a `readState` that reads without changing anything and keeps a copy of the original text under `intent-workbench-v1-backup` before invalid or unreadable data could be dropped; and recovery actions: download a copy, start with an empty project, and the existing reset to sample data. `normalizeState` now also counts a collection that is present but not a list.
- What each failure does: unreadable data (invalid JSON, or valid JSON that is not an object such as `[1,2,3]` or `5`): empty project, banner, backup, stored data untouched, all three actions. Invalid records: the valid ones load, the banner gives the count that `normalizeState` reports, backup made, download and dismiss (not start-empty, which would discard valid data). Blocked storage at load: banner that nothing will be saved. Unexpected error (window error or unhandled promise rejection): banner to reload, download a copy.
- Verified in real Chrome: 24 new checks pass in `day19.js` and the earlier suites pass: 282 of 282 in total. They cover the pure function (kinds, actions, singular and plural wording, priority, no problem); unreadable data (an alert banner, an empty project, the backup equal to the original, the stored data untouched, four non-object JSON values treated as unreadable, and the text `null` treated as an empty store); a real file download whose text equals the original; start-empty; saving while the banner shows (Day 14's probe A10); invalid records (a count of 4 covering an empty outcome, a wrong label, and two non-list collections; download and dismiss only; the valid record still listed; the singular wording); a record with only an id and outcome loading, editing, and saving with empty text fields; storage blocked by making `setItem` throw before load; a deliberately thrown error; reset from an unreadable store; the banner on all five views, dismissed for now and returning after a reload; keyboard order with outlines; no horizontal scroll at 375px; and the Save button unmoved when nothing is wrong.
- A screenshot of the unreadable-data banner at 375px was viewed: the message and the three actions are all visible above the dashboard.
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `context/architecture.md`, `days/day-19.md`, `intent/current-feature.md`, `evidence/checks/day19.js`, this record.

## Inferred
- The "unexpected error" banner fires on any uncaught error, so a harmless error still shows the banner; it cannot tell a harmless one from a serious one.
- Keeping a backup means unreadable data is retained in the user's storage indefinitely (one copy, replaced if a different unreadable text appears). That is deliberate: it is the only way to avoid silent loss.

## Assumed
- That one backup copy is enough. A second, different unreadable text replaces the first backup.
- That the wording is understandable to a non-technical user ("could not be read", "invalid and left out").
- That blocked-storage detection by test-writing a key at load is representative of real browser blocking; it was simulated by making `setItem` throw.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 24 new checks; 282 in total.
- [x] Validation rules: four kinds of non-object JSON, four kinds of invalid record.
- [ ] Accessibility spot-check: alert role, keyboard order, and outlines checked; screen-reader announcement not tested.

## What failed
- Nothing failed. The new tests passed on the first run, so I checked they were not vacuous by looking at the individual assertions (the per-value loop for non-object JSON prints only failures) and by running the whole set of suites, which also passed.

## What was not checked
- A store slightly over the browser's size limit at load. Two tabs, one of which has corrupted the data. Firefox and Safari behavior when storage is blocked (they may throw at `localStorage` access, not only at `setItem`). Whether users understand "start with an empty project" as safe.

## What changed in the next intent
- Day 20 adds the architecture view. The nav now wraps to two rows on a phone with five items and will carry seven, so the phone header needs attention before the release.
