# Day 21 Evidence — Package intent check

Structured per `templates/evidence.md`.

## Intent tested
`days/day-21.md` (refined before building): package the intent check as a named, reusable capability, shown in a Capabilities view with its purpose, procedure, output, checks, owner, and version, in the app and in `skills/intent-check.md`, with the app's text equal to the repository file.

## Observed
- Intent check on `days/day-21.md`: "a reusable skill with purpose, procedure, output, checks, owner/version" did not say where the truth lives or how the app and repository stay in step. The skill file already had purpose, procedure, output, and a check, but no owner or version, and on Day 11 I had paraphrased the app's copy. I decided: the skills files stay the source of truth; the app's built-in text becomes word for word equal to them; a test parses the files and fails on any difference.
- Repository: added `## Owner` (Project owner) and `## Version` (1.0) sections to `skills/intent-check.md` and `skills/evidence-first-review.md`. Those were the only edits to the skills files. The current-feature boundary gained a matching line.
- Built: the built-in capability text in `app/logic.js` now equals the files (for the intent check: the purpose, the seven procedure lines, the output, the check; for the review skill: the purpose, six procedure lines, the output, and the guardrail as its check). A Capabilities item in the navigation opens a view with one card per capability: name, a Skill badge, purpose, an ordered Procedure, Output, Checks, owner and version, a link to the file in the project's GitHub repository, and a link to where it is used (Review). The Overview flow's Capability stage now links to the view.
- The drift guard: `day21.js` parses both skills files and compares every field with both the model records and what the cards actually render, and confirms that an old stored copy of a built-in (a stale purpose, owner "nobody", version 0.0) is shown with the file text. It found no drift.
- Verified in real Chrome: 13 new checks pass in `day21.js`; two Day 20 tests were changed for the new link, and the regression suite was told about the sixth nav item. In total 310 of 310. They cover Owner and Version in the files; the records equal to the files word for word; two cards in order labelled Skill; every displayed field equal to the file (7 and 6 procedure steps); repository links (new tab, noopener noreferrer) and use links; the use link opening Review; stale stored text refreshed; the flow link; the end link; keyboard reach in order with outlines; no horizontal scroll at 375px; no filled button.
- A screenshot of the view at 375px was viewed.
- Files changed: `skills/intent-check.md`, `skills/evidence-first-review.md`, `app/logic.js`, `app/app.js`, `app/index.html`, `context/architecture.md`, `days/day-21.md`, `intent/current-feature.md`, `evidence/checks/*` (day21, day20, regression), this record.

## Inferred
- Because the app text is verbatim, the intent check's first "step" is the whole sentence ending "List, in order of importance:" and the categories then number as steps 2 to 6. That is faithful to the file but reads slightly oddly.
- The "where it is used" link only points at the Review view; the intent check is also used in the Jira modal, which is not linked from the card.

## Assumed
- That "packaged" means this set of six parts and a visible, tested link to the repository file.
- That the version "1.0" and owner "Project owner" are acceptable placeholders; nothing in the repo names a person or a versioning scheme.
- That the GitHub links are stable (they point at the `main` branch of the project's repository).

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 13 new checks; 310 in total.
- [x] Validation rules: the app and files compared word for word.
- [ ] Accessibility spot-check: ordered lists, keyboard, and outlines checked; screen-reader reading not tested.

## What failed
- Nothing failed. Two earlier tests had to change because a link and a nav item were added on purpose.

## What was not checked
- Editing a skills file and confirming the test fails (the test was written to, and passes on unchanged files, but a deliberate edit was not made). Firefox and Safari. Whether users understand "packaged capability".

## What changed in the next intent
- Day 22 packages the review skill the same way and adds sample usage and a way to record a review. Day 23 adds the ladder, classification, uses, and promotion.
