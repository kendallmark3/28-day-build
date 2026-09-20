# Day 20 — Show architecture

## Intent
Add a "How it fits together" panel to the Overview view that shows the operating model Intent, Context, Build, Evidence, Review, Capability as an ordered flow, with a live count at each stage from the stored data and a link to where the user works on it.

## Inputs
- `intent/current-feature.md`
- `START-HERE.md` (the loop: Intent, Result, Evidence, Refined Intent, Better Result) and `context/architecture.md`
- `app/logic.js` and `app/app.js`
- Evidence from the previous day

## Outputs
- A pure `flowStages(state, contextCount)` in `app/logic.js` returning the six stages with their counts
- A "How it fits together" panel on the Overview view: an ordered list of six stages, each with what it is, a live count, and a link where a view exists
- The matching criteria in `intent/current-feature.md`, and an updated `context/architecture.md`
- `evidence/day-20.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- The flow is HTML and CSS text: no images, no scripts, no external request
- A stage links only to a view that exists; Build and Capability show no link until their views exist (Days 24 and 21)
- Counts are read from the stored data and the page; nothing new is stored
- Arrows are decorative and hidden from assistive technology; the order is carried by an ordered list

## Success criteria
- The panel shows the six stages in the order Intent, Context, Build, Evidence, Review, Capability, each with what it is, a live count, and a detail
- The counts equal the stored data and update after an action without a reload
- Stages with a view link to it, and the link works
- The panel is readable as a list, works by keyboard, and stacks without horizontal scroll at 375px
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-20.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
