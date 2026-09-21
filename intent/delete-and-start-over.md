# Intent: Delete an intent, and start with an empty project

> Post-release intent (after Day 28). `intent/current-feature.md` is left as it is because `evidence/checks/traceability.js` maps its criteria to checks.

## Intent
A user can delete one intent, or clear everything, so that after the 28-day challenge they can reuse IntentWorkbench on real work, starting from an empty project and taking one new intent through every view.

## Inputs
- `app/app.js` (the Saved intents list and the reset dialog), `app/logic.js` (`emptyState`, `normalizeState`)
- The connected records: evidence and reviews carry an `intentId`

## Outputs
- A Delete button on every saved intent, with a confirmation naming the intent and the evidence and reviews that go with it
- A "Start with an empty project" control on the Intents view, with a confirmation that says what will be deleted
- Pure functions `removeIntent` and `clearSummary` in `app/logic.js`

## Constraints
- Browser only, no new dependency; the app stays runnable
- Nothing changes until the user confirms; Cancel is the default focus
- No record may point at an intent that no longer exists
- At most one filled button per view (the new controls are outlined; the dialogs' confirm buttons are the danger style, as the reset dialog's is)
- Not included: undo, restore from a copy (see `docs/NEXT-INTENT.md`), deleting a single evidence record

## Success criteria
- Cancel on either dialog leaves the stored data equal to what it was
- Confirming Delete removes that intent and every evidence record and review whose `intentId` matches, and no other record
- Deleting the intent being edited returns the form to "New intent"
- Confirming "Start with an empty project" stores no intents, evidence, reviews, capability uses, or progress days, and shows the empty state
- After clearing, a new intent saves and appears in the Review view's selector
- Both controls work by keyboard, the status line announces the result, and there is no horizontal scroll at 375px

## Stop when
The criteria above pass in Chrome and the full check suite still passes; do not add undo or import in this round.
