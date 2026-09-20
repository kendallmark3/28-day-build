# Day 14 — Challenge the result

## Intent
Attack the app's assumptions with scripted probes (hostile input, timing, storage limits, two tabs, unusual flows), record which ones break it, and fix only the failures the probes demonstrate.

## Inputs
- `intent/current-feature.md` and `intent/archive/intent-tracker.md`
- Application code in `app/`
- `context/security.md` and `context/architecture.md` (the claims to attack)
- Evidence from the previous days

## Outputs
- A probe table in the evidence: each attack, what was expected, what happened before any fix, and after
- Fixes in `app/` for demonstrated failures only, with a test for each
- The matching criteria added to `intent/current-feature.md`
- `evidence/day-14.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Run every probe before changing any code and record the results first
- A behavior that is already correct is reported as holding, not rebuilt
- Failures owned by a later day's intent (for example corrupt-data recovery on Day 19) are recorded and left for that day
- Every earlier check still passes

## Success criteria
- At least 10 distinct attacks are run, covering hostile text, storage limits, duplicate or racing actions, two open tabs, large input, and flows across views and dialogs
- Each failure has a probe result before the fix and a passing check after it
- Each claim in `context/security.md` that a probe can attack has a probe
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-14.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
