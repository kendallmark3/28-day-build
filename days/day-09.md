# Day 09 — Improve context quality

## Intent
Make the `context/` layer smaller and more useful: remove or merge lines that duplicate another line or constrain no decision the app or an intent makes, rewrite the vague lines in `ux-standard.md` into checks, and add one worked example of an excellent intent.

## Inputs
- `intent/current-feature.md`
- `intent/project-intent.md`
- Application code in `app/`
- All six files in `context/`
- Evidence from the previous day, if any

## Outputs
- Edited `context/non-goals.md` and `context/ux-standard.md`
- A new `context/example-intent.md`
- The References view lists the example with the other context files
- The matching criteria in `intent/current-feature.md`
- `evidence/day-09.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- A line is removed only if it duplicates another line or constrains no decision the app or an intent makes; every removal is listed in the evidence with its reason
- Do not edit `context/business-rules.md`: the app cites its rule numbers
- The example's six parts must equal the app's first sample intent, and a test must catch drift between them

## Success criteria
- The existing context files together have fewer lines than before (97 lines, 951 words; words may rise because vague lines become checks)
- `context/ux-standard.md` contains none of the app's vague words, and each rule names something that can be checked in the running app
- `context/example-intent.md` has the six intent parts, a "Why this works" line for each part, and its six parts equal the app's first sample intent
- The References view lists all seven context files
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-09.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
