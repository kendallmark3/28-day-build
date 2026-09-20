# Day 11 — Model the domain

## Intent
Add data structures for projects, intents, evidence records, reviews, and reusable capabilities as pure functions in `app/logic.js`, store them as one versioned state, and make the model visible in the app.

## Inputs
- `intent/current-feature.md` (written on Day 10 from the deficiency chosen there)
- `intent/archive/intent-tracker.md`
- Application code in `app/`
- `context/architecture.md`, `context/glossary.md`, `context/business-rules.md`
- Evidence from the previous day

## Outputs
- `app/logic.js` with the model functions; the existing pure functions moved into it from `app/app.js`
- `app/app.js` and `app/index.html` reading and writing the versioned state, with an Overview view
- Sample data for every record type
- The matching criteria (already in `intent/current-feature.md`)
- `evidence/day-11.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- `logic.js` never touches the page, storage, or the clock; the caller passes in ids and times
- Old stored data (intents only) must still load with every value intact
- Adding `logic.js` is the one boundary change; it is recorded in `docs/decisions/0002-split-logic-from-ui.md`
- No feature beyond storing and showing the model: no evidence form, readiness check, or capability screen yet

## Success criteria
- The stored data has a version and all record arrays; old-shape data loads intact
- The six model functions and the normalizer are deterministic and do not change their input
- Invalid records are dropped and counted; the two built-in capabilities always exist
- Reset restores every record type; the Overview counts match the stored data
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-11.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
