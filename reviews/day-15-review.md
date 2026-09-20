# Review: Evidence and capability model (Days 9-14)

## Intent reviewed
`intent/current-feature.md` at commit `3d6bb13`, read before inspecting anything: 13 success criteria (Days 11 and 14). It states that the 53 criteria of `intent/archive/intent-tracker.md` still hold, so the review also checks the archive where it could contradict the app.

## Method, and how independent this is
- **Not independent.** This was done in the same session, by the same author, as the work under review. I have not been able to start a separate session, and I did not spawn a separate agent. What I did to reduce the builder's assumptions: read the criteria first; wrote a new check script from the criteria text alone (`review15.js`, 18 checks) using different inputs and methods from the builder's tests (a frozen clock, an injected quota error, direct edits to storage from a second tab, five hostile payloads not used before, deep-frozen inputs); and confirmed claims with `git` and `grep` rather than from the evidence records.
- The check script lives in a temporary folder, not the repository (see finding F2).
- Review mode: nothing under review was changed (proof at the end).

## Success criteria: met, unmet, untested

| # | Criterion (shortened) | Status | Evidence |
|---|---|---|---|
| 1 | Stored data has `version: 2`, five arrays, and `progress` after first save or reset | **Met** | R-1: both paths produce the shape |
| 2 | Old-shape data loads intact; other record types created | **Met** | R-2: every value of two intents intact after a save; Overview shows 1 project, 2 capabilities, 0 evidence, 0 reviews |
| 3 | Six model functions exist, are deterministic, do not change input, and do not touch page or storage | **Met** | R-3: all six present; same output twice with deep-frozen inputs; no `document`, `window`, storage, network, `Math.random`, or clock token in `logic.js` |
| 4 | `normalizeState` keeps valid records, drops invalid ones, returns the count | **Met** | R-4: new data (a capitalised label, a whitespace-only outcome, a review with no criteria, a capability whose uses are not a list) gave exactly 4 dropped and the valid ones kept |
| 5 | Two built-in capabilities always exist with all fields | **Met** | R-5: fields, level, empty uses, not promoted; both restored from a store with `capabilities: []` |
| 6 | Reset restores every record type, and the confirmation says evidence, reviews, and capabilities are replaced too | **Unmet (narrow)** | R-6: everything is restored (3 intents, three labels, 1 review, uses, one promoted, progress). With a store that has no intents, the confirmation says "3 sample intents will be added, with sample evidence, reviews, and capability records", not that they are replaced. With saved intents it does say "replaced too" |
| 7 | Overview view with a "Data model" panel and five matching counts | **Met** | R-7 |
| 8 | Hostile text is stored and shown as text; nothing runs | **Met** | R-8: iframe with `srcdoc`, `<details ontoggle>`, a `javascript:` link, a `<style>` block, and a meta refresh; none created an element or ran |
| 9 | Same-millisecond saves get distinct ids | **Met** | R-9: clock frozen, four saves, four distinct ids |
| 10 | Full storage says so and keeps earlier data | **Met** | R-10: an injected `QuotaExceededError` gave the "storage is full" message and unchanged stored data. A real full store was exercised on Day 14, not repeated here |
| 11 | Changing view closes open dialogs | **Met** | R-11: both the Jira modal and the reset confirmation |
| 12 | A save in another tab shows without a reload | **Met** | R-12: a second tab wrote storage directly |
| 13 | Updating a vanished intent saves as new and says so | **Met** | R-13 |

**Archived criteria (from `intent/archive/intent-tracker.md`):** 53 criteria. Independently re-run by the reviewer: 3 (Save button in the window at load at both sizes; no horizontal scroll at 375px on all four views), all **met**. **Unmet: 2** (see F1). The other 48 were **not re-run by the reviewer**; they rest on the builder's regression suite (155 checks), so their status here is **untested** by this review.

## Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| F1 | Medium | The active intent says all archived criteria still hold, and two are false. The archive says "The navigation bar shows "Intents", "References", and "About"" and lists "any view beyond Intents, References, and About" as a non-goal; the app's nav has four items and an Overview view exists. The archived non-goals also list "evidence attachment, readiness check, capability promotion", which are the next planned features | `intent/current-feature.md` lines 7 and 22; `intent/archive/intent-tracker.md` lines 36 and 49; nav read from the running app: Intents, Overview, References, About (R-A1) |
| F2 | Medium | The verification cannot be reproduced from the repository. No test or check script is tracked; every "verified in real Chrome" claim in the evidence records depends on scripts in a temporary folder | `git ls-files` finds no test, spec, or check file; each evidence record's "What was not checked" says so |
| F3 | Medium | The first project success criterion (run locally in under 3 minutes) is unmet: no instruction or script serves `app/`. Known since Day 10 and still open | `grep` of `README.md`, `START-HERE.md`, `app/README.md` for `app/` or `run-app` returns nothing; `run-starter.sh` and `run-final.sh` serve `starter/` and `reference-final/` |
| F4 | Low | Criterion 6's wording is not met when the store has no intents: the confirmation says "added", not "replaced". No user-visible harm today, because there is no way yet to create evidence, reviews, or capability uses without an intent | R-6 |
| F5 | Low | Decision records under `docs/decisions/` are outside the file boundary the intent states | `git diff --name-only 5c32b54 HEAD` includes `docs/decisions/0002-split-logic-from-ui.md`; the boundary (`intent/current-feature.md` line 20) does not list `docs/` |
| F7 | Low | `evidence/day-10.md` says the archived tracker intent has "about 90 criteria". The file has 53 success criteria | Count of `- ` lines under "Success criteria" in `intent/archive/intent-tracker.md`: 53 |
| F6 | Information | Corrupt stored data is still replaced silently on the next save. Recorded on Day 14 as probe A10 and deferred to Day 19 | `evidence/day-14.md` |

## Not checked
- Independence: no separate session, so the reviewer shares the builder's blind spots.
- Safari and Firefox; a real phone; screen readers; any first-time user.
- The 48 other archived criteria (untested here).
- Two tabs writing in the same instant; stores far above 2,000 intents; very large single intents.
- Whether the context files and evidence records are accurate beyond the claims touched above.
- The content quality of the Jira analysis (whether its advice is good, as opposed to whether it runs).

## Review did not modify the work
See the closing check recorded in `evidence/day-15.md`: `git diff HEAD --stat` for `app/`, `context/`, `intent/`, and `skills/` was empty after the review artifact was written.
