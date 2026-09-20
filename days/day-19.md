# Day 19 — Design failure states

## Intent
Make the app's failures explicit: when stored data is corrupt, has invalid records or missing fields, when storage is blocked, or when the app itself hits an unexpected error, say what happened and what the user can do, keep a copy of anything that would be lost, and always offer a way back to a working state.

## Inputs
- `intent/current-feature.md`
- `evidence/day-14.md` (deferred probe A10: corrupt stored data is replaced silently) and `reviews/day-15-review.md` (finding F6)
- `context/security.md` and `context/architecture.md`
- `app/logic.js` (`normalizeState`) and `app/app.js`

## Outputs
- A pure `describeProblem` in `app/logic.js` and a problem banner in the app that names the failure and the ways out
- A backup copy of stored data, kept before anything could be dropped
- Recovery actions: download a copy, start with an empty project, and the existing reset to sample data
- The matching criteria in `intent/current-feature.md`, and a note in `context/architecture.md`
- `evidence/day-19.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Nothing is destroyed silently: before invalid or unreadable stored data can be dropped, a copy is kept under its own storage key
- Every failure message says what happened and offers a next action
- The banner uses secondary buttons and is shown only when a problem exists, so the phone layout at load is unchanged
- Data that cannot be read is never guessed at or repaired; it is kept, offered for download, and set aside

## Success criteria
- Stored data that is not valid JSON, or not an object, loads as an empty project with a banner, keeps a copy, and is not overwritten until the user acts
- Invalid records are counted and named in a banner, a copy of the original is kept, and the valid records still load
- A record with missing fields still loads, can be edited, and saved
- Blocked storage at load and an unexpected app error each show a banner with what to do
- From every failure there is a route back to a working app, and it is tested
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-19.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
