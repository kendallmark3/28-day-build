# Day 27 Evidence — Final adversarial review

Structured per `templates/evidence.md`.

## Intent tested
`days/day-27.md`: review the finished product as if about to demo it to a skeptical principal engineer: find unsupported claims, confusing flows, and broken criteria, and fix only what the evidence supports.

## Observed
- **Process note:** the four fixes below were applied as the findings were made, and the day file and criteria were written into `days/day-27.md` and `intent/current-feature.md` before the final check run but after the fixes. The findings and the before-and-after results below were recorded at the time they were found.
- Intent check on `days/day-27.md`: "unsupported claims", "confusing flows", and "broken criteria" had no method. I chose four passes, each with a check: documentation against reality; whether a newcomer can run the app; whether every criterion is still backed by a check; and a second round of attacks on what was added since Day 14.
- **Pass 1, documentation against reality: two findings, both fixed.**
  - `context/architecture.md` was false: it said "Built (as of Day 8)" and its "Planned, not built" list named Context Library, Evidence & Review, Capability Library, 28-Day Progress, and readiness and guardrails, all of which now exist. It now lists every view as built and lists as not built only what is (export and import, sync, integration, an audit history, deleting or editing claim text, a project switcher, servers and AI). A check confirms every navigation view is listed as built and no old "planned" module remains.
  - **Nobody could run the app from the documentation** (Day 15 finding F3, open since Day 10). `README.md` said `cd starter` or `cd reference-final`, and `app/README.md` still said to copy `starter/`. I added `run-app.sh` and `run-app.bat` (default port 8080, optional argument), and rewrote `app/README.md` and the README's run section. Measured: `./run-app.sh` answers in 118 ms and the app is usable and saving 177 ms after starting the script. The boundary in `intent/current-feature.md` now lists these files.
  - A scan of everything the app displays (all seven views and the Jira dialog) finds no overclaiming word (guarantee, foolproof, bulletproof, AI-powered, intelligent, seamless).
- **Pass 2, criteria traceability: no gap.** `evidence/checks/traceability.js` maps every success criterion (53 archived, 83 active including the new ones) to at least one existing automated check, fails if a criterion has none or a named check does not exist, and generates `evidence/traceability.md`. I proved it is not vacuous by breaking a mapping deliberately: it reported all three faults (a missing mapping, an extra one, a nonexistent check). This closes the Day 15 gap of 48 archived criteria that the reviewer had not independently re-run.
- **Pass 3, attacks on the newer features: 14 attacks, 12 held, 2 broke, both fixed.**

| # | Attack | Expected | Before | After |
|---|---|---|---|---|
| Q1.1 | storage full while you save a claim | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.2 | storage full while you relabel a claim | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.3 | storage full while you record a review | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.4 | storage full while you set a consequence | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.5 | storage full while you record an approval | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.6 | storage full while you add a capability | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.7 | storage full while you record a use | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q1.8 | storage full while you tick a day | a "storage is full" message, data unchanged, no error | HOLDS | HOLDS |
| Q2 | a large store: 3,000 intents, 6,000 evidence records, 500 reviews | load, Review, Overview, and a save each under 3 seconds | HOLDS | HOLDS |
| Q3 | two open tabs each add a different claim | both claims are kept (no lost update) | HOLDS | HOLDS |
| Q4 | storage blocks reads as well as writes (getItem, setItem, and removeItem all throw) | the app loads, shows the blocked-storage banner, and throws nothing | HOLDS | HOLDS |
| Q5 | a name containing quotes and an <img onerror> is used in button aria-labels | shown as literal text, nothing runs, no element or attribute injected | HOLDS | HOLDS |
| Q6 | an accidental double-click on "Record a successful use" | one use is recorded (one gesture must not satisfy "2 successful uses") | BREAKS | HOLDS |
| Q7 | an accidental double-click on "Save intent" (the form resets to the example after the first save) | one intent is saved, not two | BREAKS | HOLDS |

  - Q6, the important one: one accidental double-click on "Record a successful use" recorded two uses, which is exactly the number the promotion rule requires, so a single slip could satisfy "repeated successful use". Q7: a double-click on "Save intent" saved the example twice, because the form resets to the example text after the first save. Fixes: a use identical to the one just recorded (same kind, within 1.5 seconds) is ignored with a message, in a pure `isDuplicateUse` in `app/logic.js`; a save with identical content within one second is ignored with a message.
  - Everything else held: all eight new write actions showed a "storage is full" message and changed nothing; a store of 9,500 records loaded in about 110 ms, opened Review and Overview in about 125 ms each, and saved in about 260 ms; two tabs adding different claims kept both; storage that blocks reads as well as writes showed the blocked-storage banner with no error; a name with quotes and markup in button labels was inert.
- Verified in real Chrome plus reading files: 21 new checks pass in `day27.js`; the Day 14 probe A3 (which saved three identical intents in one tick to test ids) was changed to save three different ones, because identical content within a second is now a double-click; a Day 24 check now waits a natural 1.7 seconds before recording a use on the sample, because the sample's own use is timestamped at reset. All suites pass: 414 of 414 in total.
- Test-side errors of mine during this day, all corrected: a generated file with a misplaced bracket; a regex literal that contained a slash; a variable name reused in the same scope; a click on a button hidden by the current view; and a background tab that never produced the animation frame a click waits for.
- Files changed: `context/architecture.md`, `README.md`, `app/README.md`, `run-app.sh`, `run-app.bat`, `app/app.js`, `app/logic.js`, `intent/current-feature.md`, `days/day-27.md`, `evidence/traceability.md`, `evidence/checks/*` (day27, probe27, traceability, day14, probe14, day24), this record.

## Inferred
- The most important finding was not a code defect but a rule the code did not enforce: "promoted only after repeated successful use" was satisfiable in one gesture. A promotion rule that counts clicks is only as strong as the click.
- Three of the four fixes were to documents and instructions, not features. A skeptical reviewer's first minute is the README.

## Assumed
- That the 1.5-second and 1-second windows are the right size for "accidental": long enough to catch a double-click, short enough that a real second action is never blocked.
- That mapping criteria to checks by name means the criteria are really tested; it shows a check exists and is named for it, not that the check is strong enough. I reviewed the pairings, but I am the author of both.
- That a machine-timed 177 ms is representative of a newcomer's experience (it excludes installing Python and opening a terminal).

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both app files and the check scripts.
- [x] Functional behavior: 21 new checks; 414 in total.
- [x] Validation rules: every criterion mapped to a check, and the mapping proven to fail on faults.
- [ ] Accessibility spot-check: covered by Day 26; not repeated.

## What failed
- Two attacks broke (Q6, Q7) and two documents were wrong; all fixed. Several test-script mistakes of mine were fixed along the way. Nothing failing at the end.

## What was not checked
- A real principal engineer or any first-time user. Firefox and Safari. The `.bat` script (Windows was not available; the file was checked for its contents only). Whether two accidental clicks more than 1.5 seconds apart should count as separate uses (they do). Attacks I did not think of.

## What changed in the next intent
- Day 28 is the release: notes, a rehearsed 3-minute demo script, the next-intent file, and a reflection, plus a release review of the project's success criteria.
