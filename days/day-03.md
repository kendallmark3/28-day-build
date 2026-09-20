# Day 03 — Make success checkable

## Intent
Rewrite every vague success phrase in `intent/current-feature.md`, and in the Outputs and Success criteria of `intent/project-intent.md`, into a check someone can perform.

## Inputs
- `intent/project-intent.md`
- Current application code
- Relevant files in `context/`
- Evidence from the previous day, if any

## Outputs
- Edited `intent/current-feature.md` and `intent/project-intent.md`
- `evidence/day-03.md`, quoting each rewritten phrase before and after
- No application code changes

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Do not edit files in `context/`; report vague phrases found there instead

## Success criteria
- A search of the two intent files for easy, good, professional, polished, usable, understandable, and worth finds no success criterion that lacks a stated check
- Each rewritten phrase is quoted before and after in the evidence record
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met and the day's evidence record is complete.

## Before implementation
Run `skills/intent-check.md` against this file.
