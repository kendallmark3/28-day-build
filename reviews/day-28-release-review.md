# Release Review: IntentWorkbench 1.0

Follows `reviews/release-review.md`. Review only: no file under review was changed (see the fingerprint at the end).

## Decision
**Ready for a public demonstration. Not yet entitled to claim that the project intent's stop condition is met.** Five of the six success criteria are met on evidence. The sixth (a first-time user creating an intent without help) is untested, because it needs a person, and one checklist item (an independent fresh-session review) is not done. Neither is a defect in the app; both are things no one has yet checked.

## Independence
**Not independent.** This review was done in the same session, by the same author, as the build (as was the Day 15 review). I wrote new checks from the six criteria's wording (`evidence/checks/review28.js`) with inputs and flows that no day test uses, and confirmed documents against the repository. That reduces shared assumptions; it does not remove them. `reviews/fresh-session-review.md` should be run in a new session to close this.

## Success criteria of `intent/project-intent.md`

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | A new user can run the application locally in under 3 minutes | **Met** (machine-measured; assumes Python 3 is installed) | One documented command (`./run-app.sh`). The server answered in 97 ms and the page was usable 43 ms later (P1). The README names Python 3 as the only requirement. A real person's time, including installing Python, was not measured |
| 2 | The user can create and edit an intent containing outcome, inputs, outputs, constraints, success criteria, and stop condition | **Met** | P2: a new intent typed into all six parts was saved with every part intact; an edit replaced it in place with no duplicate |
| 3 | The user can attach evidence and distinguish observed, inferred, and assumed claims | **Met** | P3: three claims showed the badges Observed, Inferred, Assumed, and the summary counted them and said one assumption still needs confirming |
| 4 | The user can perform a readiness check before trusting a result | **Met** | P4: a half-written intent read "Readiness: 38%. Not ready yet." with what to fix; after fixing it the same check read "Readiness: 100%. Ready." Whether users run it before trusting a result is behavior, and untested |
| 5 | A capability can be marked promoted only after at least 2 recorded successful uses; before that, the app refuses and says how many uses are missing | **Met** | P5: refused with 0 uses ("2 more uses are needed") and with 1 ("1 more use is needed"), promoted only after the second success. Day 27 found and fixed a double-click that satisfied this in one gesture (`evidence/day-27.md`, Q6) |
| 6 | A first-time user creates an intent in the running app without opening any source file or asking for help | **Untested** | Needs a person. Proxies only: a scripted journey that follows only the Start view's links and instructions reaches 6 of 6 steps (`evidence/day-25.md`), and P6 saves an intent from the Start link. Neither shows that a person can do it unaided |

**Stop condition** ("The success criteria are met and the Day-28 release checklist passes"): **not fully met.** Criterion 6 is untested, and the checklist item "Fresh-session review completed" is not done (`docs/RELEASE-CHECKLIST.md`).

## Blockers
To a public demonstration: **none found.** Evidence: every internal and external link works (`day28.js` R1); the seven-step demo script was run in the app and its 17 claims verified (R2); all 414 earlier checks and the audits pass (`evidence/day-26.md`, `evidence/day-27.md`).

To declaring the project intent's stop condition met:
- **B1: criterion 6 is untested.** Evidence: the only checks are proxies (above). Resolution: have a person who has not seen the app try it, unaided, and time and record what they do.
- **B2: no independent review.** Evidence: `docs/RELEASE-CHECKLIST.md` (item not done); `reviews/day-15-review.md` and this review are by the author. Resolution: run `reviews/fresh-session-review.md` in a new session.

## Non-blocking improvements
- **Import a data copy.** The unreadable-data banner offers a download that nothing can read back. Evidence: `evidence/day-19.md`. This is the next intent (`docs/NEXT-INTENT.md`).
- **A claim's text cannot be edited or removed**, only relabelled, so a typo stays. Evidence: `context/architecture.md` (Not built), `evidence/day-16.md`.
- **The Save button has 2 px of room at 1280x800**, and is below the first screen on a 320px-wide phone. Evidence: `evidence/day-26.md`. Any change to the top of the Intents view needs re-measuring.
- **Writing the example intent completes two Start steps at once** (it is also ready), which may blur the lesson. Evidence: `evidence/day-25.md`.
- **The low-consequence guardrail reads "1 of 1 minimums open"** when only one minimum is countable. Evidence: `evidence/day-18.md`.
- **Reset replaces everything after one confirmation.** A backup copy is kept, but there is no way to restore it in the app (see the first item). Evidence: `evidence/day-12.md`, `evidence/day-19.md`.

## Not checked
- Any person using the app, and the time a person needs to run it (criteria 1 and 6).
- An independent reviewer.
- Firefox and Safari; a real phone; a screen reader. Only Chrome (headless) was used.
- The Windows script `run-app.bat` (its contents were checked; it was not run).
- Real Jira exports and stories from a team. Only the example and short constructed stories were used.
- Whether the readiness checks and guardrail minimums match what real teams consider ready or risky.
- Concurrency beyond two tabs; stores much larger than 9,500 records.
- The accuracy of every number in the 28 evidence records. Three errors were found and corrected during Days 15 to 28 (the archived-criteria count on Day 10, a check total on Day 24, and a phrase on Day 26); others may remain.
- The order the days were run in differs from the plan: Days 9 to 11 ran after Days 12 and 13, and Days 14 to 28 followed, at the owner's instruction. Some day files were written after the code they describe (noted in the Day 11 and Day 27 records).

## Fingerprint
Fingerprint of app/, context/, skills/, and intent/project-intent.md: before `c337cee5370d4155`, after `c337cee5370d4155`. Equal fingerprints show that this review did not modify the files it reviewed.

## Post-review addendum
After this review, a clean-clone test (clone the public repository, start it with `./run-app.sh`, run the checks) found one defect that this review missed. The References view listed `book/The-Ultimate-Guide-to-Claude.pdf` under "In this repository", but the book is deliberately not in the public repository (it is supplied separately), so the page told cloners a file was there that was not. I removed that one line from `app/index.html`. The same test also found two check scripts with a hard-coded port, fixed in `evidence/checks/regression.js`. This is a change to a file under review, made after the review, and it is recorded here so the fingerprint above is not misread. Fingerprint after the post-review fix: `90c8bbb2488c118d`.

The review's statuses and decision are unchanged. The miss is an example of what the untested and non-independent items above could still be hiding.

## Post-release addendum (2026-09-21)
The project owner asked to delete intents and start over with an empty project so the app can be reused on real work. This added a Delete button per intent, a "Start with an empty project" control, and two pure functions (`removeIntent`, `clearSummary`) to `app/`. It is a new feature after this review, not a fix to it, and none of the review's findings or criteria statuses were re-assessed. Its intent is `intent/delete-and-start-over.md` and its checks are `evidence/checks/day28-delete.js`. Fingerprint after the post-release change: `589f64205346944b`.
