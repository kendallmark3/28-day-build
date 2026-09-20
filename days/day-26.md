# Day 26 — Polish the product

## Intent
Audit every view, dialog, and the error banner against the rules in `context/ux-standard.md` and the checkable parts of responsiveness, typography, focus, and labels, run the audit before changing anything, and fix only the failures it finds.

## Inputs
- `context/ux-standard.md` (the six rules written on Day 9)
- `intent/current-feature.md`
- `app/styles.css`, `app/index.html`, `app/app.js`
- Evidence from the previous day, including the note that a 320px phone and very narrow navigation were unchecked

## Outputs
- An audit script, kept in `evidence/checks/`, that measures the rules on every view, both dialogs, and the banner
- An audit table in the evidence: each rule, what was measured, the result before and after
- Fixes in `app/styles.css` (and markup only where a label or heading is missing) for the failures only
- The matching criteria in `intent/current-feature.md`
- `evidence/day-26.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Run the audit before changing any code and record the failures first
- The rules are those in `ux-standard.md` plus: every field has an accessible name; heading levels do not skip; text contrast meets WCAG AA (4.5:1, or 3:1 for large text); no horizontal scroll at 320, 375, 768, and 1280px
- A rule already met is reported as met, not changed
- No new feature and no change to behavior; visual changes only where the audit fails

## Success criteria
- The audit covers seven views, two dialogs, and the banner, at phone and desktop widths, and every rule has a measured result
- Every failure is fixed and the audit re-run shows none, or the reason a failure stays is recorded
- All earlier checks still pass
- The fixes keep the design recognisably the same
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-26.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
