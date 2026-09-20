# Day 16 — Label evidence

## Intent
Make evidence and review records classify every claim as observed, inferred, or assumed, and show that status wherever a claim appears, through a new Review view where a user records and relabels claims for an intent.

## Inputs
- `intent/current-feature.md`
- `context/business-rules.md` (rule 4: evidence claims are labelled observed, inferred, or assumed) and `context/glossary.md`
- Application code in `app/` and the model in `app/logic.js`
- Evidence from the previous day, including the Day 15 review

## Outputs
- A Review view (navigation item, intent selector, evidence list, add-a-claim form, reviews list)
- Review records that carry labelled findings, in `app/logic.js`
- Labelled sample evidence and a labelled sample review
- Glossary entries for the new terms, and the matching criteria in `intent/current-feature.md`
- `evidence/day-16.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- A claim cannot be saved without a label, and there is no default label
- There is no deleting or editing of claim text; a label can be changed, because a claim's status legitimately changes once it is checked
- The new view must not break the phone layout rule: the first view's main button stays in the window at 375x812
- Ideas beyond the Review view's evidence and review lists (readiness, guardrails, recording a review) belong to later days

## Success criteria
- Every evidence record and review finding shows Observed, Inferred, or Assumed in a badge
- A claim without a label is refused with a message and not saved; a saved claim is stored as a valid record; changing a label updates the record and says so
- A summary states the count per label and how many assumed claims still need confirming
- The view has empty states for no intents and for no evidence, ends with a link to the next action, and works by keyboard and at 375px
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-16.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
