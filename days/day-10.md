# Day 10 — Use progressive intent

## Intent
Inspect the app against the success criteria in `intent/project-intent.md`, name the single most valuable deficiency from that evidence, and write the next intent from it.

## Inputs
- `intent/project-intent.md`
- `intent/current-feature.md`
- Application code in `app/` and its tests
- Evidence records for Days 1-9, 12 and 13

## Outputs
- A matrix in the evidence: each project success criterion marked met, unmet, or untested, with its evidence
- A decision record in `docs/decisions/` for the deficiency chosen, listing the alternatives considered
- The current feature intent archived to `intent/archive/`, and a new `intent/current-feature.md` written from the chosen deficiency
- `evidence/day-10.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Exactly one deficiency is chosen; the others are recorded, not built
- No application code changes
- The archived intent's criteria still hold, and the regression suite keeps checking them

## Success criteria
- Every one of the six project success criteria has a status and evidence
- The decision record names one deficiency, at least two alternatives, and the evidence that ranks them
- The old intent is preserved unchanged in `intent/archive/` and the new `intent/current-feature.md` has all six parts with a stop condition
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-10.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
