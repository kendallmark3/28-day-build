# Day 07 — Ship the first slice

## Intent
Add a dashboard to the top of the Intents view of the intent tracker in `app/`, so the first screen shows the state of the user's saved intents and the next action to take.

## Inputs
- `intent/current-feature.md`
- `intent/project-intent.md`
- Current application code in `app/`
- `context/business-rules.md` (rule 3: an intent needs at least one constraint and a stop condition before it is ready)
- `context/ux-standard.md`
- Evidence from the previous day, if any

## Outputs
- The dashboard in `app/index.html`, `app/app.js`, `app/styles.css`; all existing tracker behavior unchanged
- The dashboard's criteria added to `intent/current-feature.md`
- `evidence/day-07.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- The dashboard shows counts and one next-step line only. No charts, scoring, or new stored data
- Every check in `intent/current-feature.md` that passed before still passes

## Success criteria
- The dashboard shows how many intents are saved, and how many of them lack a constraint or a stop condition, and both numbers are correct after loading, saving, editing, and reloading
- A next-step line states the action for the current state: no intents, some intents lacking a constraint or stop condition, or all complete
- The dashboard is shown on the Intents view only, and is visible at load
- The Save button is still fully inside the window at load at 1280x800 and 375x812
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-07.md`, and `intent/current-feature.md` has the dashboard's criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
