# Day 23 — Build the capability ladder

## Intent
Show the maturity path Prompt, Skill, Trigger, Workflow, Business capability as a ladder on the Capabilities view, let the user classify an item by rung, and enforce the promotion rule: a capability can be promoted only after at least 2 recorded successful uses.

## Inputs
- `intent/current-feature.md` and `intent/project-intent.md` (the promotion criterion)
- `context/business-rules.md` (rule 5) and `context/glossary.md` (Capability)
- `app/logic.js` (`LEVELS`, `LEVEL_NAMES`, `PROMOTE_AFTER`, `makeCapability`) and `app/app.js`
- Evidence from the previous day

## Outputs
- A ladder of five rungs with a one-line meaning and a live count each, at the top of the Capabilities view
- A level selector on each capability card, and an "Add an item to classify" form that creates a capability of any level
- Recording a successful or an unsuccessful use on each card, and a Promote button that enforces the rule
- Pure `ladderCounts`, `promotionStatus`, `withUse`, `tryPromote`, and `nextCapabilityId` in `app/logic.js`, and the matching criteria in `intent/current-feature.md`
- `evidence/day-23.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- A rung's meaning is one line and mine; the repository defines only the five names
- Only successful uses count toward promotion; an unsuccessful use is recorded but does not count
- The promotion rule cites `context/business-rules.md`, rule 5, and its refusal says how many uses are missing
- Classification and promotion are separate: a capability's rung says how mature its form is; promotion says it has been reused successfully
- Recording a review (Day 22) does not record a use; uses are recorded on purpose, on the card

## Success criteria
- The ladder shows the five rungs in order with meanings and counts that match the stored capabilities and update after classifying
- Each card can be classified; a new item can be added at any rung; both change the badge, the ladder, and the stored data
- Promote is refused until 2 successful uses are recorded, says how many more are needed, and then succeeds; unsuccessful uses do not count
- The two built-in capabilities in the sample data show the rule at work: one promoted, one needing one more use
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-23.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
