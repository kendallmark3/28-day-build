# Day 16 Evidence — Label evidence

Structured per `templates/evidence.md`.

## Intent tested
`days/day-16.md` (refined before building): make evidence and review records classify every claim as observed, inferred, or assumed, and show that status wherever a claim appears, through a Review view.

## Observed
- **First, the Day 15 review's findings were fixed** (separate commit `c8aff9b`): F1 the active intent now lists its superseded archived criteria; F2 the check scripts moved into `evidence/checks/` with a README and runner (`docs/decisions/0003`); F4 the empty-store reset wording; F5 the boundary lists `docs/decisions/` and `evidence/checks/`; F7 the archived-criteria count corrected in `evidence/day-10.md`. F3 (run instructions for `app/`) is for Day 28 and F6 (corrupt data) for Day 19.
- Moving the scripts showed that three regression checks compare the app with the book, which is not in the public repository. They now skip visibly (`SKIP`, not counted) when the book text is unavailable. Verified both ways: 155 of 155 with the book, 152 of 152 with 3 skipped without it.
- Intent check on `days/day-16.md`: "review records" and "important claims" were undefined; nothing said whether a claim could be saved unlabelled or whether a label could change; nothing said where claims are recorded. I decided: evidence records are the claims, each attached to one intent, with no default label; review records carry labelled findings; a label can be changed but claim text cannot.
- Built: a Review view (nav item between Intents and Overview) with an intent selector, that intent's evidence list (each with a badge, a source, and a select to change its label), an add-a-claim form (claim, how do you know, source), a summary line, and that intent's reviews. Review records gained `findings`, each with text and a label; `normalizeState` drops a review whose finding is unlabelled or wrongly labelled and counts it. Pure additions to `app/logic.js`: `labelCounts`, `epistemicSummary`, `nextEvidenceId`. The sample review has three labelled findings.
- Status messages follow the Day 13 rule: "Evidence saved: <claim> (<Label>)." and "Label changed to <label>: <claim>.", in a polite live region. The summary reads, for the sample, "3 claims: 1 observed, 1 inferred, 1 assumed. 1 assumed claim still needs confirming."
- Verified in real Chrome: 23 new checks pass in `day16.js`, and the earlier suites pass (regression 155, Day 9 7, Day 11 18, Day 14 12): 215 of 215. They cover the view's parts; the three badge words; refusing an unlabelled or empty claim; a saved claim shown, stored as a valid record for the right intent, and announced; relabelling; the summary in five states; both empty states; switching intents; persistence; hostile HTML in a claim and source; a keyboard-only flow; exactly one filled button on the view; the end link; no horizontal scroll at 375px, including after saving a 300-character word; review findings validation; unique evidence ids; and the reset wording fix (F4).
- **A crash found by the tests:** the new view's state variable was declared at the bottom of `app/app.js`, but the first `render()` ran near the top, so the script threw "Cannot access before initialization" and stopped, which would have left navigation and buttons dead. Fixed by moving the first render to the end of the file. It existed only between writing the code and the first test run.
- Two test-side notes: headless Chrome does not change a `<select>` with arrow keys, so the keyboard test chooses a label by typing its first letter (type-ahead, which real keyboards also support); and the Day 9 check "the six context files have fewer lines than 97" was a point-in-time acceptance check that stopped being true when Days 11 and 16 legitimately added content (100 lines now), so it was retired.
- Files changed: `app/index.html`, `app/app.js`, `app/logic.js`, `app/styles.css`, `context/glossary.md` (Claim, Evidence record, Review record), `context/architecture.md`, `days/day-16.md`, `intent/current-feature.md`, `evidence/checks/*`, this record.

## Inferred
- Because a label can change but claim text cannot, a wrongly worded claim cannot be corrected, only relabelled. That follows the no-delete non-goal and may need revisiting.
- Requiring a label with no default stops a lazy "observed" being recorded, and the refusal message moves focus to the label field.

## Assumed
- That evidence belongs to one intent (not to a project or a review), which fits the model but is a decision.
- That badge colours (green observed, amber inferred, red assumed) are read correctly alongside their text; the text carries the meaning.
- The review list is read-only until Day 22 adds recording a review.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 23 new checks and 215 in total.
- [x] Validation rules: unlabelled and empty claims refused; invalid findings dropped and counted.
- [ ] Accessibility spot-check: keyboard flow and focus outline checked; screen-reader announcements not tested.

## What failed
- One crash (the initialisation order) found by the first test run and fixed. One retired point-in-time check. Nothing failing at the end.

## What was not checked
- Editing claim text. Removing a claim. Whether the three labels are understood without the option text. Safari and Firefox. Two tabs changing a label at the same instant.

## What changed in the next intent
- Day 17 adds the readiness check on the Review view. The nav now has five items; Days 21 and 25 add two more, so the phone nav needs a second look then.
