# Day 27 — Final adversarial review

## Intent
Assume you are about to demo to a skeptical principal engineer. Find unsupported claims, confusing flows, and broken criteria. Fix only what evidence supports.

## Inputs
- `intent/project-intent.md`
- Current application code
- Relevant files in `context/`
- Evidence from the previous day, if any

## Outputs
- A release candidate with review evidence.
- `evidence/day-27.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session

## Success criteria
- The stated product outcome is visibly improved
- The change can be demonstrated in the running application or repository
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met and the day's evidence record is complete.

## Before implementation
Run `skills/intent-check.md` against this file.
