# Day 12 — Persist locally

## Intent
Keep the user's saved intents in browser `localStorage` so they survive a refresh, and add a "Reset to sample data" action that replaces them with a fixed set of sample intents, after the user confirms.

## Inputs
- `intent/current-feature.md`
- `intent/project-intent.md`
- Current application code in `app/`
- `context/business-rules.md` (rule 6: high-consequence work needs explicit human approval), `context/security.md`, `context/architecture.md`
- Evidence from the previous day, if any

## Outputs
- A "Reset to sample data" button and confirmation in `app/`, and 3 sample intents
- The matching criteria added to `intent/current-feature.md`
- A one-line update to `context/architecture.md` so its list of built features stays true
- `evidence/day-12.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Only intents exist as records today. Projects, evidence records, and capabilities (Day 11) are not modelled and are not added here
- Reset touches only the app's own `localStorage` key. It never runs without confirmation
- Every check in `intent/current-feature.md` that passed before still passes

## Success criteria
- Saved intents, and edits to them, survive a reload (already true; re-checked, not rebuilt)
- Reset to sample data asks for confirmation first, saying how many saved intents will be replaced; Cancel or Esc changes nothing
- Confirming replaces every saved intent with the 3 sample intents, the dashboard shows 3 saved and 1 missing a constraint or stop condition, and the result survives a reload
- A reset while an intent is being edited returns the form to its normal state
- Reset changes nothing else in `localStorage`
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-12.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
