# Intent: Evidence and capability model

## Intent
A user's work is stored as connected records (projects, intents, evidence, reviews, and capabilities) so that later features (evidence labels, readiness checks, guardrails, capabilities, metrics) build on one tested model instead of each inventing its own data.

## Inputs
- `intent/archive/intent-tracker.md` (the earlier intent; all of its criteria still hold)
- `intent/project-intent.md`
- `context/architecture.md`, `context/glossary.md`, `context/business-rules.md`
- The current code in `app/`

## Outputs
- `app/logic.js`: the pure functions for the model (state, records, validation)
- `app/app.js` reading and writing the model, and an Overview view showing what is stored
- Sample data covering every record type, restored by "Reset to sample data"

## Constraints
- Browser-only HTML/CSS/JS, no framework, no build step, no backend, no AI call, no network request
- All data stays in `localStorage` under the existing key; old stored data must still load
- Code changes are limited to `app/index.html`, `app/app.js`, `app/styles.css`, and `app/logic.js`. Each day's work may also edit its own `days/day-XX.md`, this file, its evidence record, and any `context/` file that day's intent names. All other files are off-limits, including `starter/`, `reference-final/`, `book/`, `skills/`, and `templates/`
- Non-goals: deleting records, a project switcher, import or export, sync, accounts
- Every criterion in `intent/archive/intent-tracker.md` that passed before still passes

## Success criteria
- After the first save or a reset, the stored data has `version: 2`, arrays `projects`, `intents`, `evidence`, `reviews`, `capabilities`, and an object `progress`
- Stored data in the old shape (`{intents: [...]}` only) loads with every intent value intact; the other record types are created (one project, two built-in capabilities, no evidence or reviews)
- `emptyState`, `normalizeState`, `makeIntent`, `makeEvidence`, `makeReview`, and `makeCapability` exist in `app/logic.js`, return the same output for the same input, do not change their input, and do not touch the page or storage
- `normalizeState` keeps valid records and drops invalid ones, returning how many it dropped. Invalid: an evidence record whose label is not observed, inferred, or assumed or whose intent does not exist; a review with a status other than met, unmet, or untested; a capability with a level outside prompt, skill, trigger, workflow, and business; an intent with no outcome
- Two built-in capabilities, "Intent check" and "Evidence-first review", always exist. Each has a purpose, procedure, output, checks, owner, version, level "skill", an empty list of uses, and is not promoted; they are added back if stored data lacks them
- "Reset to sample data" restores at least 3 intents, evidence in each of the three labels, at least 1 review, uses on both built-in capabilities (one promoted, one not), and ticked progress days. The confirmation says that evidence, reviews, and capability records are replaced too
- An Overview item in the navigation opens a view with a "Data model" panel that shows counts for Projects, Intents, Evidence records, Reviews, and Capabilities, matching the stored data

## Stop when
- Every success criterion above has been checked in the running app and each result is recorded in the day's evidence record
- If a criterion fails, fix only that criterion and re-check it
- When all pass, stop. Do not restyle, refactor, or extend
- Ideas outside these criteria go under "What changed in the next intent" and are not built
