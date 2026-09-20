# Day 28 — Release and teach

## Intent
Release the finished IntentWorkbench: fill in the release checklist with evidence, write release notes, a 3-minute demo script that has been rehearsed in the running app, a next-intent file chosen from the evidence, and a reflection on what became reusable, then run the release review against the project's success criteria.

## Inputs
- `intent/project-intent.md` (the six success criteria and the stop condition)
- `docs/RELEASE-CHECKLIST.md`, `docs/DEMO-SCRIPT.md`, `docs/NEXT-INTENT.md`, and `reviews/release-review.md` (the review procedure)
- All evidence records, `evidence/traceability.md`, and `evidence/checks/`
- The finished app in `app/`

## Outputs
- `docs/RELEASE-CHECKLIST.md` with each item done and pointing at evidence that exists, or marked not done with the reason
- `docs/RELEASE-NOTES.md`, `docs/DEMO-SCRIPT.md` (rehearsed), `docs/NEXT-INTENT.md`, and `docs/REFLECTION.md`
- `reviews/day-28-release-review.md`: every project success criterion marked met, unmet, or untested, with blockers, non-blocking improvements, and a gap statement
- The matching criteria in `intent/current-feature.md`
- `evidence/day-28.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- A release document may not claim what the evidence does not show: anything not checked with a person, in another browser, or by an independent reviewer is said to be untested
- The demo script is rehearsed by running each step in the app and checking its on-screen claims
- The next intent is written in the six-part form and must pass the app's own readiness check
- The release review is review-only: no file under `app/`, `context/`, `intent/`, or `skills/` changes during it
- Where the stop condition of `intent/project-intent.md` is not fully met, the release notes and review say so

## Success criteria
- Every checklist item is either done with existing evidence or marked not done with the reason
- The demo script has seven steps totalling 180 seconds, and every step has been run in the app with its claims verified
- The next intent has six parts and is ready by the app's own check; the reflection and release notes exist
- The release review gives all six project criteria a status with evidence and states what was not checked
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-28.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
