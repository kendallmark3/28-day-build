# Day 18 — Add guardrails

## Intent
Let the user set a low, medium, or high consequence for an intent on the Review view, and show the minimum verification and approval expected at that level, with each minimum marked Met or Open from the recorded data.

## Inputs
- `intent/current-feature.md`
- `context/business-rules.md` (rule 6: high-consequence work requires explicit human approval) and `context/glossary.md` (Guardrail: a control sized to the consequence of failure)
- `app/logic.js` (`checkIntent`, `labelCounts`) and `app/app.js`
- Evidence from the previous day

## Outputs
- A guardrail table and a pure `guardrailStatus` function in `app/logic.js`
- A Guardrails section on the Review view: a consequence selector, the minimums for the chosen level with Met, Open, or Check yourself, an approver field for high, and a summary
- Consequence and approver stored on the intent, with sample intents that show different levels
- The matching criteria in `intent/current-feature.md`
- `evidence/day-18.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Guardrails are guidance and a visible status, not a lock: nothing is blocked, because the app cannot know what a mistake would cost
- Each higher level includes every minimum of the lower ones and adds more: low 2, medium 4, high 6
- Minimums the recorded data can answer are marked automatically; the rest say Check yourself
- Approval is a name typed by the user; the app cannot verify who they are, and says so

## Success criteria
- The three levels each list their minimums, and each higher level contains all of the lower level's and more
- Each automatic minimum is Met or Open according to the intent's evidence, reviews, readiness, and assumed claims, and changes when that data changes
- A high level asks for a named approver, which is stored and shown
- Choosing a level, its minimums, and the approver are saved on the intent and survive a reload
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-18.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
