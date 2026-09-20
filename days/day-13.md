# Day 13 — Improve usability

## Intent
Audit every view and user action in the app against three checkable rules (navigation, empty states, next actions), and fix only the failures the audit finds.

## Inputs
- `intent/current-feature.md`
- `intent/project-intent.md`
- Current application code in `app/`
- `context/ux-standard.md` (its rules on the next action and on empty states)
- Evidence from the previous day, if any

## Outputs
- An audit table in `evidence/day-13.md`: each view, state, and action, the rule it is checked against, and the result before and after any fix
- Fixes in `app/index.html`, `app/app.js`, `app/styles.css` for the failures only
- The matching criteria added to `intent/current-feature.md`
- `evidence/day-13.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Run the audit before changing any code, and record the failures first
- Fix only audited failures. A rule that already passes is reported as met, not rebuilt
- Every check in `intent/current-feature.md` that passed before still passes

## Rules the audit checks
- **Navigation:** from every view, the other two views are reachable in one action
- **Empty states:** every place that can be empty says what belongs there and what to do
- **Next actions:** after each action that changes something (save, update, cancel edit, use in form, download, reset), a status message naming what happened is visible in the window without scrolling and is in a polite live region; and each view's content ends with a link to the next action

## Success criteria
- The audit covers all three views, every empty state, and every action listed above, at 1280x800, and the Save and Update actions also at 375x812
- Every failure found is fixed, and the audit re-run afterwards shows no failures
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-13.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
