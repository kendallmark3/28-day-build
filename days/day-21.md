# Day 21 — Package intent check

## Intent
Package the intent check as a named, reusable capability: add a Capabilities view that shows it with its purpose, procedure, output, checks, owner, and version, in the app and in `skills/intent-check.md`, with the app's text equal to the repository file.

## Inputs
- `intent/current-feature.md`
- `skills/intent-check.md` and `skills/evidence-first-review.md`
- The built-in capability records in `app/logic.js`
- `context/glossary.md` (Capability) and `context/business-rules.md` (rule 5)
- Evidence from the previous day

## Outputs
- A Capabilities view (navigation item) listing the built-in capabilities as cards, with a link to each one's file in the repository and to where it is used
- `## Owner` and `## Version` sections added to `skills/intent-check.md` and `skills/evidence-first-review.md`
- The built-in capability text in `app/logic.js` made equal to the skills files, with a test that fails if they drift
- The Capability stage of the Overview flow linking to the new view, and the matching criteria in `intent/current-feature.md`
- `evidence/day-21.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- A packaged capability has exactly these parts: purpose, procedure, output, checks, owner, version
- The skill files stay the source of truth; the app's copy is checked against them by a test, not trusted
- The two skill files are edited only to add Owner and Version sections
- Recording uses, promotion, and the ladder come on Day 23; recording a review on Day 22

## Success criteria
- The Capabilities view shows the intent check with its purpose, procedure steps, output, checks, owner, and version, and a link to its file in the repository
- The app's purpose, procedure, output, and checks equal the text in `skills/intent-check.md` (and the same for the review skill), and a test fails if they differ
- `skills/intent-check.md` has Owner and Version sections that equal the app's owner and version
- The Capability stage of the Overview links to the view; the view works by keyboard and at 375px
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-21.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
