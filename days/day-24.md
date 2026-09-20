# Day 24 — Add useful metrics

## Intent
Show four outcome metrics on the Overview view (intents ready, reviews completed, capabilities promoted, and 28-day progress) from the stored data, with a 28-day progress list the user can tick, and state what is deliberately not measured.

## Inputs
- `intent/current-feature.md`
- `context/business-rules.md` and `START-HERE.md` (the 28-day journal)
- `app/logic.js` (`checkIntent`, `promotionStatus`, `DAY_TITLES`) and `app/app.js`
- Evidence from the previous day

## Outputs
- An Outcomes panel on the Overview view with four metrics, each with a number and one line on why it matters
- A 28-day progress list of checkboxes on the Overview view, stored in the project data
- A pure `metrics(state)` in `app/logic.js`, and the Build stage of the flow linking to the progress list
- The matching criteria in `intent/current-feature.md`
- `evidence/day-24.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Exactly these four metrics and no others; nothing counts page views, clicks, time spent, or saves
- Every value is computed from the stored records; nothing new is stored except the ticked days
- The progress list is the user's own journal: the app never ticks a day itself
- The panel states what is not measured and why

## Success criteria
- The four metrics, in order, equal the stored data and match the same numbers elsewhere in the app, and update without a reload
- The 28-day list has 28 labelled checkboxes, saves each change, and updates the metric and the flow's Build stage
- The Build stage links to the progress list, and the address `#progress` opens it
- The panel says what is deliberately not measured, and no activity counter exists in the code
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-24.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
