# Day 18 Evidence — Add guardrails

Structured per `templates/evidence.md`.

## Intent tested
`days/day-18.md` (refined before building): let the user set a low, medium, or high consequence for an intent, and show the minimum verification and approval expected at that level, marked Met or Open from the recorded data.

## Observed
- Intent check on `days/day-18.md`: "minimum verification/approval expectations" were not listed; nothing said whether guardrails block anything, how a minimum is judged met, or how approval is recorded. I decided: guardrails are guidance with a visible status, never a lock (the app cannot know what a mistake would cost); minimums build up (low 2, medium 4, high 6); the ones the recorded data can answer are marked automatically and the rest say "Check yourself"; approval is a name the user types and the app states that it cannot verify who approved. The source is business rule 6 and the glossary's Guardrail.
- The minimums: low: check the result yourself (manual); record at least one evidence claim. Medium adds: the readiness check passes; a review is recorded. High adds: no claim left assumed; a named person approves.
- Built: `GUARDRAIL_MINIMUMS`, `GUARDRAIL_SOURCE`, and a pure `guardrailStatus(intent, state)` in `app/logic.js`; consequence and approver stored on the intent (`makeIntent`, `normalizeState`, sample intents); and a Guardrails section on the Review view: a consequence selector, the minimums with Met, Open, or Check yourself badges, an approver field with a Record approval button for high, and a summary line with its source.
- The sample shows the range: a medium intent with all minimums met, a low intent with its evidence minimum open, and one with no level.
- Verified in real Chrome: 25 new checks pass in `day18.js`, and the earlier suites pass: 258 of 258 in total. They cover the table (2, 2, 2) and the built-up lists (2, 4, 6, each containing the level below); determinism, frozen input, and odd input; the three sample intents in the view; choosing and clearing a level with its message and storage and reload; high with the approver flow (an empty name refused, a name stored and announced, the "1 of 5 open" summary); relabelling an assumed claim flipping its minimum without a reload; adding evidence flipping the low intent to all met; fixing a draft flipping the readiness minimum; the level surviving an edit; a hostile approver name shown as text; an invalid stored level becoming not set; nothing blocked (Save intent still works for a high intent with open minimums); a keyboard-only flow; one filled button; no horizontal scroll at 375px.
- Two defects found by the tests and fixed: the constant `GUARDRAIL_SOURCE` was used by the view but not defined, which would have thrown when the Review view rendered; and one of my checks expected all four medium minimums to read "Met" when the first is correctly "Check yourself" (the test was wrong, not the app).
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `context/glossary.md`, `context/architecture.md`, `days/day-18.md`, `intent/current-feature.md`, `evidence/checks/day18.js`, this record.

## Inferred
- Because the checks are computed from the same data the user records, a user can satisfy a minimum without doing the underlying work (for example by recording a claim). The guardrail reports what was recorded, not what is true.
- The "1 of 1 open" wording for the low intent reads oddly when only one minimum is countable.

## Assumed
- That "a review is recorded" is the right stand-in for "second person or fresh-session review" until Day 22 adds recording a review.
- That the six minimums are a fair floor. They are mine; the repo defines only the three level names and rule 6.
- That an unverifiable typed name is acceptable as an approval record for a local demo app.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 25 new checks; 258 in total.
- [x] Validation rules: an empty approver refused; an invalid stored level cleared.
- [ ] Accessibility spot-check: keyboard flow and outline checked; screen-reader reading not tested.

## What failed
- A missing constant and one wrong test expectation, both fixed. Nothing failing at the end.

## What was not checked
- Whether users read Open as a to-do or a failure. Real approval workflows. Whether the level names are understood without their descriptions. Safari and Firefox.

## What changed in the next intent
- Day 19 designs failure states, including the deferred corrupt-data case from Day 14. Day 22 will let a user record a review, which feeds the medium and high minimums.
