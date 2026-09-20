# Day 17 — Add deterministic validation

## Intent
Implement an intent readiness score as a pure function `checkIntent` in `app/logic.js`, based on required fields and checkability rules, and show it for the selected intent on the Review view with what to fix.

## Inputs
- `intent/current-feature.md`
- `context/business-rules.md` (rules 1, 2, 3), `context/glossary.md`, `context/example-intent.md`
- `app/logic.js` (`findVague`, `isCheckable`) and `app/app.js`
- Evidence from the previous day

## Outputs
- `checkIntent` in `app/logic.js`: eight checks, a score, and a ready flag
- A Readiness section on the Review view: score, ready or not, each check with its result and source rule, a next step, and a button to edit the intent
- The matching criteria in `intent/current-feature.md`
- `evidence/day-17.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- The score is computed from the intent each time and is never stored
- The eight checks are: outcome, inputs, outputs, constraints, success criteria, and stop condition present; every success criterion checkable; no vague word in the outcome or stop condition
- An intent is ready only if outcome, constraints, success criteria, stop condition, and checkability all pass; inputs, outputs, and clarity are recommended
- Each check names the rule in `context/` it comes from
- No new stored data and no change to the intent form

## Success criteria
- `checkIntent` is deterministic, does not change its input, and never crashes on missing or non-text fields
- The first sample intent and `context/example-intent.md` score 100 and are ready; the draft sample scores 38 and is not ready
- The Review view shows the score, ready or not, each check as Pass or Fix with its source, and a next step; fixing the intent and returning updates it
- The button to edit the intent opens it in the Intents view, ready to edit
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-17.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
