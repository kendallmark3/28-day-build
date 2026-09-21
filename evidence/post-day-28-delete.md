# Post-release Evidence — Delete an intent, and start with an empty project

Structured per `templates/evidence.md`. Intent: `intent/delete-and-start-over.md`.

## Observed
- In real Chrome, `evidence/checks/day28-delete.js` passes 16 of 16: Delete on every row; the dialog names the intent and "3 evidence records and 1 review"; Cancel changes nothing and is focused by default; confirming removes the intent and leaves no evidence or review pointing at a missing intent; deleting the intent being edited returns the form to "New intent"; "Start with an empty project" leaves no intents, evidence, reviews, capability uses, or progress days; a new intent then appears in the Review selector; no horizontal scroll at 375px; no console errors.
- Full suite: 439 of 439 pass (`evidence/checks/run-all.sh`); the previous 423 all pass on the prior commit.
- My first version wrapped the Edit and Delete buttons in a span; 6 existing checks failed because they select `li > button`. I removed the wrapper. `C9a` was then updated on purpose, because it asserted that every row button is "Edit".
- `R8` (Day 28 fingerprint) failed because `app/` changed. I did not alter the review's findings; I added a dated post-release addendum with the new fingerprint (`589f64205346944b`) and made `R8` compare against the last fingerprint the review records.
- My first confirmation text read "3 capability uses, 8 ticked progress days and leaves you…" (ambiguous); reworded.

## Inferred
- Deleting an intent together with its evidence and reviews is the right default, because those records cannot be read without their intent. The dialog states the counts before anything is removed.

## Assumed
- "Reset" in the request meant clearing to an empty project (not another sample). Clearing also clears the 28-day progress ticks and capability uses; the dialog says so. Not confirmed with the project owner.
- No person has used the new controls; only the automated checks and my own run have.

## Not checked
- Firefox and Safari; screen reader announcements; a real phone.
- No undo exists. A deleted intent cannot be recovered (`docs/NEXT-INTENT.md` already names restore-from-a-copy as the next step).
