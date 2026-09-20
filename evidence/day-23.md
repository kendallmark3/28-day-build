# Day 23 Evidence — Build the capability ladder

Structured per `templates/evidence.md`.

## Intent tested
`days/day-23.md` (refined before building): show the maturity path Prompt, Skill, Trigger, Workflow, Business capability as a ladder on the Capabilities view, let the user classify an item by rung, and enforce the promotion rule: promoted only after at least 2 recorded successful uses.

## Observed
- This day also delivers the promotion rule that `intent/project-intent.md` has carried since Day 3 ("a capability can be marked promoted only after at least 2 recorded successful uses; before that, the app refuses and says how many uses are missing") and business rule 5.
- Intent check on `days/day-23.md`: "represent" and "classify an item" did not say what an item is, what each rung means, or how the ladder relates to promotion. I decided: an item is a capability record; the five rungs are the repository's names with one-line meanings that are mine; classification (how mature its form is) is separate from promotion (it has been reused successfully); uses are recorded on purpose on the card; an unsuccessful use is recorded but does not count.
- Built: pure `LADDER`, `ladderCounts`, `promotionStatus`, `withUse`, `tryPromote`, and `nextCapabilityId` in `app/logic.js`; on the Capabilities view a ladder of five rungs with meanings and live counts, a Rung selector on every card, buttons to record a successful or an unsuccessful use, a Promote button, use counts and a promotion line on each card, a Promoted badge, and an "Add an item to classify" form (name required, rung, purpose).
- The refusal reads: "Promotion needs 2 successful uses. 1 more use is needed. Source: context/business-rules.md, rule 5." The sample data shows the rule: the intent check has 2 uses and the Promoted badge; the review skill shows "Promotion needs 1 more successful use."
- Verified in real Chrome: 21 new checks pass in `day23.js`, one Day 21 check was made to count only links, and all suites pass: 348 of 348. They cover the pure rules (the exact status table for 0, 1, 2 uses, five failures, and 2 successes with 3 failures; a dated use added without changing frozen input; the refusal wording for 0, 1, and four failures; promotion at 2; already promoted; unique ids); the ladder's order, meanings, and counts; the sample cards; classifying and its persistence; refusing an item without a name; a stored valid new item; the whole user path (1 success, 1 failure, refused with "1 more", a second success, promoted, counted on the Overview as "2 of 3 promoted"); failures never counting; hostile and 250-character text with no horizontal scroll; a keyboard-only add; and one filled button.
- A screenshot at 375px showed the status message repeating a 250-character name in full, while every other message in the app shortens names to 60 characters. I applied the same shortening (in `app.js` and in the `tryPromote` message in `logic.js`) and added the check to the test.
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `context/architecture.md`, `days/day-23.md`, `intent/current-feature.md`, `evidence/checks/day23.js` and `day21.js`, this record.

## Inferred
- Uses are recorded by clicking, with no evidence attached, so promotion can be satisfied by clicking twice. The rule enforces repetition of a recorded claim, not repetition of real work.
- Keeping classification and promotion separate lets a Prompt be promoted after two successful uses, which may surprise someone who reads the ladder as the promotion path.

## Assumed
- That the one-line meanings of the rungs are acceptable; the repository names the rungs but defines none.
- That there is no way to delete or edit an item (a non-goal) is acceptable for a demo, even though a typo in a name cannot be fixed.
- That "2 successful uses" (chosen on Day 3 as my reading of "repeated") is still the right threshold; it was never confirmed.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 21 new checks; 348 in total.
- [x] Validation rules: a nameless item refused; failures never counting.
- [ ] Accessibility spot-check: keyboard and outlines checked; the button labels carry the item name for screen readers, which was not tried with one.

## What failed
- Nothing failed. One polish problem (long names repeated in a message) was found from a screenshot and fixed.

## What was not checked
- Many capabilities (the list has no pagination). Renaming or deleting an item. Whether users understand the difference between a rung and being promoted. Firefox and Safari.

## What changed in the next intent
- Day 24 adds outcome metrics on the Overview view, including capabilities promoted and 28-day progress, and the progress list that the Build stage should link to.
