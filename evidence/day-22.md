# Day 22 Evidence — Package review

Structured per `templates/evidence.md`.

## Intent tested
`days/day-22.md` (refined before building): promote evidence-first review to a second reusable capability by adding sample usage to its card and a "Record a review" form on the Review view that follows the skill's procedure.

## Observed
- The review capability's card, packaging, and drift test were already done with the intent check on Day 21, so today's new work was the sample usage and the ability to actually perform the skill in the app.
- Intent check on `days/day-22.md`: "add sample usage" did not say what the sample is or where it comes from, and "promote" could not be tested. I decided: sample usage is a worked example computed from the sample data by pure functions (so it cannot drift from the data), shown on each built-in card; and a capability is only real if it can be used, so the Review view gets a form that follows the skill's own procedure: a status per criterion, findings with labels, and a statement of what was not checked (required, because the skill says to identify what was not checked).
- Built: pure `describeReview`, `sampleUsage`, `nextReviewId`, and `clip` in `app/logic.js`; a Sample usage section on both cards; and on the Review view a Record a review form: one row per success criterion with Untested, Met, or Unmet (Untested by default), three finding boxes (observed, inferred, assumed, one per line), a required Not checked box, a summary, and a secondary Record review button. An intent with no criteria shows "nothing to review yet" and no form. The rows are rebuilt only when the intent or its criteria change, so a reviewer's choices survive other updates.
- Sample usage as shown: for the review skill, the sample review's counts (2 met, 1 unmet, 1 untested), 3 findings (one per label), and its gap; for the intent check, the draft sample's result: "38%, not ready. Fix 4 required items: constraints, success criteria, stop condition, every criterion can be checked." The tests build the expected review sentence independently from the raw sample data and compare.
- Recording a review changes the guardrails: for a medium-consequence intent the review minimum went from Open to Met without a reload.
- Verified in real Chrome: 17 new checks pass in `day22.js` and the earlier suites pass: 327 of 327 in total (one Day 21 check was updated for the new Sample usage heading). They cover the pure functions; both cards' sample usage equal to the data and consistent with the Review view's listed sample review; the form's rows, options, defaults, and secondary button; refusing a review without Not checked (with focus moved to the box); a stored, valid review with the chosen statuses and findings labelled by their box; the listing and the status message; the form reset; no-criteria handling; the guardrail flip; hostile text in a criterion, finding, and gap; a keyboard-only recording; and one filled button on the view.
- **A real bug found by a test:** a 250-character unbroken criterion in a saved review made the page 2,634px wide at 375px, because the review's criteria list items had no word wrapping (I had set it only on the claim text). Fixed by wrapping all text inside a claim card.
- Three test errors of mine, corrected: a miscounted ellipsis expectation, a wrong expectation that a complete intent's readiness minimum would be Open (the app was right), and Day 21's heading check not expecting the new section. I also removed a dead expression (`+(x?'':'')`) that I had left in `describeReview`.
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `context/architecture.md`, `days/day-22.md`, `intent/current-feature.md`, `evidence/checks/day22.js` and `day21.js`, this record.

## Inferred
- Because the form records a review whether or not the reviewer really checked, a review is only as honest as its author. The required Not checked box is the one control that pushes toward honesty.
- Entering findings as one per line under three labelled boxes makes the label impossible to forget, at the cost of not being able to mix labels in one list.

## Assumed
- That the three-box form is a reasonable way to capture labelled findings.
- That defaulting every criterion to Untested (not Met) is the right, honest default.
- That the sample review and sample draft are typical enough to serve as worked examples.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 17 new checks; 327 in total.
- [x] Validation rules: a review without a gap refused.
- [ ] Accessibility spot-check: keyboard flow and outline checked; the grouped form (a fieldset with a legend) was not read with a screen reader.

## What failed
- One real layout bug, three test errors, and one dead expression, all fixed. Nothing failing at the end.

## What was not checked
- Recording several reviews of one intent and how the list looks. Whether users understand Untested versus Unmet. Editing a recorded review (not possible). Firefox and Safari.

## What changed in the next intent
- Day 23 adds the capability ladder, lets users classify an item, and adds recording a use and promotion after two successes. Recording a review deliberately does not record a use of the capability.
