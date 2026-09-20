# Day 06 — Run the intent check

## Intent
Use `skills/intent-check.md` on the active intent and apply only the smallest fixes.

## Inputs
- `intent/current-feature.md`
- `intent/project-intent.md`
- Current application code
- Relevant files in `context/`
- Evidence from the previous day, if any

## Outputs
- `intent/current-feature.md` with the intent-check fixes applied
- `evidence/day-06.md`, listing each finding under the five intent-check categories
- No application code changes

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session

## Success criteria
- Each of the five intent-check categories has its findings listed, or "none" stated
- Every edit to the intent is quoted before and after in the evidence record
- Any changed success criterion has been re-checked against the running app, or the evidence says it was not
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met and the day's evidence record is complete.

## Before implementation
Run `skills/intent-check.md` against this file.
