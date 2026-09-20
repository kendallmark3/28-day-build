# Day 04 — Set boundaries

## Intent
Add explicit non-goals and file/scope boundaries to `intent/current-feature.md` to prevent helpful scope creep.

## Inputs
- `intent/project-intent.md`
- Current application code
- Relevant files in `context/`
- Evidence from the previous day, if any

## Outputs
- `intent/current-feature.md` with a list of the files the work may change and a list of non-goals
- `evidence/day-04.md`
- No application code changes

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session

## Success criteria
- `intent/current-feature.md` names every file the work may create or modify and states that all other files are off-limits
- It lists its non-goals explicitly, and each non-goal is something a reviewer could spot in a diff
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met and the day's evidence record is complete.

## Before implementation
Run `skills/intent-check.md` against this file.
