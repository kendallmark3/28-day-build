# Day 25 — Onboard a new user

## Intent
Add a guided Start view that teaches the method without external explanation: the loop and rule in plain words, six steps that tick themselves off from the user's own data, each with why, what to do, and a link, and a sample project with a tour computed from the sample data.

## Inputs
- `intent/current-feature.md`
- `README.md` and `START-HERE.md` (the rule "Prompt to explore. Write intent to repeat." and the loop Intent, Result, Evidence, Refined Intent, Better Result)
- `app/logic.js` (`checkIntent`, `guardrailStatus`, `sampleState`) and `app/app.js`
- Evidence from the previous day

## Outputs
- A Start view, first in the navigation, with the loop, six steps, and a sample project section
- Pure `onboardingSteps(state)` and `sampleTour()` in `app/logic.js`
- A link to Start from the empty-state next step on the dashboard
- The matching criteria in `intent/current-feature.md`
- `evidence/day-25.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Every step is judged done from the stored data, never from a click on the Start view itself
- The default view stays Intents; Start is one click away and linked from the empty dashboard
- The sample tour is computed from the sample data, so it cannot disagree with it
- Text on the Start view uses only words the app itself uses elsewhere
- The Start view has exactly one filled button (Load the sample project)

## Success criteria
- The six steps show title, why, what to do, a Done or To do status from the data, and a link; a summary says how many are done and names the next one
- With no data, 0 of 6 are done and the next step is to write an intent; with the sample project, all 6 are done
- The sample project's tour lists the three sample intents with readiness and guardrail status equal to the data
- A person who follows only the Start view can complete all six steps
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-25.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
