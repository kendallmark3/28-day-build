# Day 05 — Define done

## Intent
Give `intent/current-feature.md` a stop condition that can be verified as reached, and remove any wording that permits open-ended improvement.

## Inputs
- `intent/project-intent.md`
- Current application code
- Relevant files in `context/`
- Evidence from the previous day, if any

## Outputs
- `intent/current-feature.md` with a revised Stop when section
- `evidence/day-05.md`
- No application code changes

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session

## Success criteria
- The stop condition names the exact criteria whose passing ends the work
- It says what to do when a criterion fails and where out-of-scope ideas go
- A search of `intent/current-feature.md` for improve, polish, enhance, and "as needed" finds nothing
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met and the day's evidence record is complete.

## Before implementation
Run `skills/intent-check.md` against this file.
