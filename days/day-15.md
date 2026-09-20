# Day 15 — Fresh-session review

## Intent
Review the app against the active intent using `skills/evidence-first-review.md`, in review mode only: mark every success criterion met, unmet, or untested, report findings with evidence and severity, and state what was not checked.

## Inputs
- `intent/current-feature.md` (read first) and `intent/archive/intent-tracker.md`
- The changed files since the intent was written (`git diff 5c32b54 HEAD`)
- `context/` files
- `skills/evidence-first-review.md` and `templates/review.md`

## Outputs
- `reviews/day-15-review.md`: findings only, each with evidence and severity, and a met/unmet/untested status for every criterion
- A statement of how independent the review was, and proof that no file under review was modified
- `evidence/day-15.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Review only: no file under `app/`, `context/`, `intent/`, or `skills/` may change during the review; fixes wait for a later day
- Checks are written from the criteria text, not copied from the builder's tests
- No praise without evidence; no invented defects
- Where an independent session is not available, say so

## Success criteria
- Every criterion in the active intent has a status and evidence
- Every finding has direct evidence and a severity
- The review names what was not checked and how independent it was
- `git diff` shows no change to `app/`, `context/`, `intent/`, or `skills/` from the review
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-15.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
