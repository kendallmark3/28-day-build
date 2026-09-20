# Project Intent — IntentWorkbench

## Intent
A technical professional can turn a one-off AI interaction into a reusable, evidence-backed capability — with a written intent, attached evidence, and a passed readiness check — entirely in the browser, without a paid service.

## Inputs
- This repository
- The companion book in `book/`
- The durable context in `context/`
- Daily intents in `days/`

## Outputs
- A browser application that meets the success criteria below
- Reusable intent, review, evidence, and capability assets
- A repository history that shows progressive improvement

## Constraints
- No secrets or API keys in browser code
- The app must work without a paid service
- Prefer plain web technology before adding frameworks or infrastructure
- Keep durable instructions in files, not only chat history
- Human judgment remains responsible for high-stakes decisions

## Success criteria
- A new user can run the application locally in under 3 minutes
- The user can create and edit an intent containing outcome, inputs, outputs, constraints, success criteria, and stop condition
- The user can attach evidence and distinguish observed, inferred, and assumed claims
- The user can perform a readiness check before trusting a result
- A capability can be marked promoted only after at least 2 recorded successful uses; before that, the app refuses and says how many uses are missing
- A first-time user creates an intent in the running app without opening any source file or asking for help

## Stop when
The success criteria are met and the Day-28 release checklist passes. Do not add infrastructure simply because it is available.
