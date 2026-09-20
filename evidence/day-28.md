# Day 28 Evidence — Release and teach

Structured per `templates/evidence.md`.

## Intent tested
`days/day-28.md` (refined before writing the documents): release the finished IntentWorkbench with a filled release checklist, release notes, a rehearsed 3-minute demo script, a next intent chosen from the evidence, a reflection, and a release review against the project's success criteria.

## Observed
- Intent check on `days/day-28.md`: "release notes", "a personal reflection", and "a next-intent file" had no test, and "personal" was ambiguous because the run was carried out by Claude and not the project owner. I made each document checkable: the checklist items point at evidence that exists; the demo script must total 180 seconds with a speaking rate a person can keep, and every step is run in the app; the next intent must be ready by the app's own check; the reflection says who wrote it and leaves a place for the owner's; the review must give every project criterion a status.
- **The demo script was rehearsed in the real app.** A script performed all seven steps and verified 17 on-screen claims, including that low guardrails ask for two checks and high for six, that promoting early is refused and says how many uses are missing, and that the draft scores 38%. The spoken script is 219 words for 180 seconds (1.2 words per second, well under the 2.7 limit, which leaves room to click). The machine took 0.1 to 0.5 seconds per step, except step 6 at 2.3 seconds, which includes a deliberate 1.7-second wait (the app ignores a repeat use within 1.5 seconds). No person has rehearsed it aloud.
- **Every link works.** Eight distinct internal links each opened exactly the view they name, and all 15 external links are https, open in a new tab, and carry noopener noreferrer.
- **The app's own check caught a weakness in my next intent.** The first draft of `docs/NEXT-INTENT.md` scored 88% and Not ready: two of its criteria had no wording a checker could mark pass or fail ("…the skipped count is shown…" and "Choosing Cancel changes nothing…"). I reworded them to say what is shown or saved, and it scores 100% and Ready. The chosen next intent is "Import a saved copy of a project" by pasting its text: it closes a dead end the app itself creates (the recovery banner's download cannot be read back), needs no server, and uses no file input.
- **Release checklist: 14 of 15 done, 1 not done, each with its reason or evidence.** Every done item points at files that exist (checked by a script). Not done: the independent fresh-session review, because both reviews were done by the author in the same session.
- **Release review** (`reviews/day-28-release-review.md`): criteria 1 to 5 of the project intent are **Met** on evidence, criterion 6 (a first-time user creating an intent unaided) is **Untested** because it needs a person. Decision: ready for a public demonstration; not yet entitled to claim the stop condition is met. Two blockers to that claim (B1 criterion 6 untested, B2 no independent review), six non-blocking improvements, and a gap statement. The review changed nothing under review: a fingerprint of `app/`, `context/`, `skills/`, and `intent/project-intent.md` is identical before and after (`c337cee5370d4155`), and a check compares it with the files as they are now. Fresh checks written for the review (`evidence/checks/review28.js`, 8 checks, all pass) exercised each criterion with new inputs.
- **Corrections found while writing the release documents:** the release notes first said the attack rounds found "11 defects" (the count is 8: 6 on Day 14 and 2 on Day 27); the reflection and the Day 26 record said a fix broke another rule "three times" (it was two regressions and one audit blind spot); both were corrected, with a note in `evidence/day-26.md`.
- **Final totals:** 423 automated checks pass in real Chrome across 17 files (`evidence/checks/run-all.sh`), and all 53 archived and 89 active success criteria (142) map to at least one existing check, verified by a script that fails on a missing or nonexistent one (`evidence/traceability.md`).
- Files changed: `docs/RELEASE-CHECKLIST.md`, `docs/RELEASE-NOTES.md`, `docs/DEMO-SCRIPT.md`, `docs/NEXT-INTENT.md`, `docs/REFLECTION.md`, `reviews/day-28-release-review.md`, `README.md` (a status paragraph), `evidence/day-26.md` (a correction), `intent/current-feature.md`, `days/day-28.md`, `evidence/traceability.md`, `evidence/checks/*` (day28, review28, traceability), this record. No file under `app/`, `context/`, or `skills/` changed on this day.

## Inferred
- The release documents are only as strong as what stands behind them, and two claims in them were wrong on the first draft. Writing a claim and checking it against a record are different steps.
- The most useful single thing in the release is the mapping from criteria to checks with a verifier that fails on faults. It makes "done" checkable by someone else.

## Assumed
- That the reflection, written by Claude, is a useful substitute for the owner's until they add theirs.
- That marking criterion 1 Met on a 140 ms machine measurement, with the Python assumption stated, is fair; a stricter reader could mark it Untested.
- That "Import a saved copy" is the right next step. It is the smallest response to a gap the app demonstrably has, chosen from a short list; no user has asked for it.

## Deterministic checks
- [x] Syntax / build: no build step; `node --check` passes for both app files and every check script.
- [x] Functional behavior: 423 of 423 automated checks; 8 further review checks.
- [x] Validation rules: the next intent scored by the app's own check; the checklist paths verified to exist.
- [ ] Accessibility spot-check: covered by Day 26; a screen reader was never used.

## What failed
- Three defects in my own drafts of release documents (an 11-versus-8 count, a "three times" that was two, and a next intent that scored 88%), all found by a check or by re-reading the record and fixed. Nothing failing at the end.

## What was not checked
- Any person using the app; an independent reviewer; other browsers; a screen reader; the Windows run script; real Jira exports; whether the demo can be delivered in three minutes by a human.

## What changed in the next intent
- Import a saved copy of a project (`docs/NEXT-INTENT.md`). To close the two blockers: a first-time user's unaided try, and `reviews/fresh-session-review.md` run in a new session.

## Addendum: clean-clone test (after the release commit)
- I cloned the public repository fresh, started it with `./run-app.sh 8401`, and ran the full suite against the clone. The app worked; 417 of 420 checks passed and the 3 book checks skipped as designed. The 3 failures were of two kinds:
  - **A real defect in the app, missed by the release review:** the References view listed the book PDF under "In this repository", but the book is not in the public repository. Fixed by removing that entry (the page already names the book in its introduction). The check for it (N7d) had only ever passed because the book existed in my working folder.
  - **Two check scripts compared network requests against a hard-coded port** (8092), so on any other port the app's own files looked like external requests. Fixed to use the configured address. Anyone re-running the suite on another port would have hit this.
- The release review has a post-review addendum recording this and the new fingerprint of the reviewed files (`90c8bbb2488c118d`).
- A mistake of mine while recording this: I used an unquoted shell heredoc for text containing backticks, so the shell ran the backtick text as commands and stripped it from the first version of this addendum. I noticed it from the "command not found" output and rewrote both addenda from a script.
- Lesson: my own working folder had files the public repository does not, and only a fresh clone could show which claims depended on them.
