# Day 02 — Convert prompt to intent

## Intent
Convert the prompt “build an intent tracker” into a written six-part intent, saved as the active feature intent.

## Inputs
- `intent/project-intent.md`
- Current application code
- Relevant files in `context/`
- Evidence from the previous day, if any

## Outputs
- `intent/current-feature.md`, replaced (not appended), containing outcome, inputs, outputs, constraints, success criteria, and stop condition.
- `evidence/day-02.md`
- No application code changes.

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session

## Success criteria
- `intent/current-feature.md` contains all six sections, each non-empty
- It has at least one constraint and one stop condition
- Every success criterion in it can be judged pass/fail without asking the author
- The evidence record quotes the original prompt and the resulting intent
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met and the day's evidence record is complete.

## Before implementation
Run `skills/intent-check.md` against this file.
