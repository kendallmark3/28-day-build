# Day 17 Evidence — Add deterministic validation

Structured per `templates/evidence.md`.

## Intent tested
`days/day-17.md` (refined before building): implement an intent readiness score as a pure function in `app/logic.js` and show it for the selected intent on the Review view with what to fix.

## Observed
- Intent check on `days/day-17.md`: "required fields and checkability rules" did not say which fields, which rules, how they combine into a score, or what "ready" means; nothing said whether the score is stored. I decided: eight checks (outcome, inputs, outputs, constraints, success criteria, stop condition present; every criterion checkable; no vague word in the outcome or stop condition), a score of checks passed over eight, rounded, and "ready" only when the five required checks pass (outcome, constraints, success criteria, stop condition, checkability). The score is computed each time and never stored. Each check names the rule in `context/` it comes from.
- Built `checkIntent` in `app/logic.js`, reusing the existing `isCheckable` and `findVague`, and a Readiness section at the top of the Review view: `Readiness: N%.` and `Ready.` or `Not ready yet.`, eight Pass or Fix rows with their source rule, a next step ("Fix 4 required items: constraints, ..."), and an "Edit this intent" button that opens the intent for editing.
- Results: the three sample intents score 100, 100, and 38 (ready, ready, not ready). The example in `context/example-intent.md`, parsed from the file, scores 100 and is ready, so the app's own check accepts its own example. Exact scores in five constructed cases: missing constraints and stop 75; an uncheckable criterion 88; a vague outcome 88 (still ready, because clarity is recommended); only an outcome 25; missing criteria 75 (criteria and checkability both fail).
- Verified in real Chrome: 18 new checks pass in `day17.js`, and the earlier suites pass: 233 of 233 in total. They cover the eight checks and their fields; determinism with a deep-frozen input; no crash on undefined, null, numbers, text, arrays, missing or non-text fields; the messages (up to three uncheckable lines with "and 1 more", the vague words named); the view for a ready and a not-ready intent; the edit button and the update round-trip (draft 38% to 100%); hostile text shown as text; nothing stored; no change after reload; one filled button; no horizontal scroll at 375px; keyboard reach with a visible outline.
- Two bugs found by the tests, both fixed: (1) "Edit this intent" did nothing when the intent had been chosen from the dropdown, because the dropdown gives an id as text and stored ids are numbers, so a strict comparison found no intent; the button now looks the intent up by text-equal id and passes the real one on. (2) One of my own new checks (V2c) ended in `&&false||true` and could never fail, so I deleted it and kept the exact-score check that follows it.
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `days/day-17.md`, `intent/current-feature.md`, `evidence/checks/day17.js`, this record.

## Inferred
- Equal weights mean the score treats "has inputs" the same as "has a stop condition". The ready flag, not the score, carries the important distinction.
- The clarity check only looks at the outcome and stop condition; vague words in other fields are not scored, and the Jira notes already flag them elsewhere.

## Assumed
- That eight equal checks are a reasonable first score. Nothing in the repo defines a score.
- That 100% should be reachable only with inputs and outputs as well as the required parts, so a ready intent can score under 100.
- That the rounding (38 for 3 of 8) is acceptable.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 18 new checks; 233 in total.
- [x] Validation rules: nine kinds of odd input; the exact scores.
- [ ] Accessibility spot-check: keyboard reach and outline checked; screen-reader reading order not tested.

## What failed
- Two app bugs and one test that could not fail, all found and fixed the same day. Nothing failing at the end.

## What was not checked
- Whether the eight checks match what users consider ready. Intents with very long text or thousands of criteria lines. Safari and Firefox.

## What changed in the next intent
- Day 18 adds consequence levels and the verification expected at each. Day 24 will count ready intents using this function.
