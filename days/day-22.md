# Day 22 — Package review

## Intent
Promote evidence-first review to a second reusable capability by adding sample usage to its card and a "Record a review" form on the Review view that follows the skill's procedure, so a review can actually be recorded and feeds the guardrails.

## Inputs
- `intent/current-feature.md`
- `skills/evidence-first-review.md` and `reviews/day-15-review.md` (a real review to model the form on)
- `app/logic.js` (`makeReview`, `guardrailStatus`) and `app/app.js`
- Evidence from the previous day

## Outputs
- A "Sample usage" section on each built-in capability card, computed from the sample data by pure functions
- A "Record a review" form on the Review view: a status for each success criterion, findings entered under Observed, Inferred, and Assumed, a required "Not checked" box, and a summary
- Pure `describeReview`, `sampleUsage`, and `nextReviewId` in `app/logic.js`
- The matching criteria in `intent/current-feature.md`
- `evidence/day-22.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- The form mirrors the skill's procedure: a status per criterion, findings with labels, and a statement of what was not checked, which is required
- There is no default status better than Untested: a criterion is Untested until the reviewer marks it
- Recording a review does not record a use of the capability; that is explicit, and comes on Day 23
- The Review view keeps at most one filled button (Save claim); Record review is a secondary button

## Success criteria
- Each built-in capability card shows a Sample usage that is computed from the sample data and equals what the sample review and sample draft intent actually contain
- A review can be recorded for an intent: statuses, labelled findings, a required Not checked, and a summary; it is stored as a valid review and listed under Reviews
- Recording a review flips the medium guardrail's review minimum to Met without a reload
- An intent with no criteria says so instead of showing an empty form
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-22.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
