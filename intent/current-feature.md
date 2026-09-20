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
- A Review view with an intent selector, that intent's evidence and reviews, and a form to add a labelled claim
- Review records whose findings are each labelled observed, inferred, or assumed
- A readiness check (`checkIntent`) and a Readiness section on the Review view

## Constraints
- Browser-only HTML/CSS/JS, no framework, no build step, no backend, no AI call, no network request
- All data stays in `localStorage` under the existing key; old stored data must still load
- Code changes are limited to `app/index.html`, `app/app.js`, `app/styles.css`, and `app/logic.js`. Each day's work may also edit its own `days/day-XX.md`, this file, its evidence record, `docs/decisions/`, `evidence/checks/`, and any `context/` file that day's intent names. All other files are off-limits, including `starter/`, `reference-final/`, `book/`, `skills/`, and `templates/`
- Non-goals: deleting records, a project switcher, import or export, sync, accounts
- Every criterion in `intent/archive/intent-tracker.md` that passed before still passes, except those superseded below

## Superseded criteria
These archived criteria no longer hold, on purpose, because this intent adds to the product (Day 15 review, finding F1):
- "The navigation bar shows Intents, References, and About": the navigation now also shows the views added by this intent (Overview, and later Review, Capabilities, and Start)
- The non-goal "any view beyond Intents, References, and About": views are added by this intent
- The non-goals "evidence attachment, readiness check, capability promotion": these are now in scope (evidence labels, readiness, guardrails, capabilities)

## Success criteria
- After the first save or a reset, the stored data has `version: 2`, arrays `projects`, `intents`, `evidence`, `reviews`, `capabilities`, and an object `progress`
- Stored data in the old shape (`{intents: [...]}` only) loads with every intent value intact; the other record types are created (one project, two built-in capabilities, no evidence or reviews)
- `emptyState`, `normalizeState`, `makeIntent`, `makeEvidence`, `makeReview`, and `makeCapability` exist in `app/logic.js`, return the same output for the same input, do not change their input, and do not touch the page or storage
- `normalizeState` keeps valid records and drops invalid ones, returning how many it dropped. Invalid: an evidence record whose label is not observed, inferred, or assumed or whose intent does not exist; a review with a status other than met, unmet, or untested; a capability with a level outside prompt, skill, trigger, workflow, and business; an intent with no outcome
- Two built-in capabilities, "Intent check" and "Evidence-first review", always exist. Each has a purpose, procedure, output, checks, owner, version, level "skill", an empty list of uses, and is not promoted; they are added back if stored data lacks them
- "Reset to sample data" restores at least 3 intents, evidence in each of the three labels, at least 1 review, uses on both built-in capabilities (one promoted, one not), and ticked progress days. The confirmation says that evidence, reviews, and capability records are replaced too
- An Overview item in the navigation opens a view with a "Data model" panel that shows counts for Projects, Intents, Evidence records, Reviews, and Capabilities, matching the stored data
- Hostile text (script tags, event-handler attributes, closing tags) in any field is stored and shown as text, and nothing runs
- Saving several times in the same millisecond gives each intent a distinct id
- When storage is full, saving says the storage is full (not that it is blocked), and earlier data is kept
- Opening or leaving a view closes any open dialog
- A save in another browser tab shows in this tab without a reload
- Updating an intent that no longer exists saves it as a new intent and says so, instead of reporting a false update
- A Review item in the navigation opens a view with an intent selector, that intent's evidence list, a form to add a claim (claim, label, source), and that intent's reviews
- Every evidence record, and every finding in a review, shows one of the words Observed, Inferred, or Assumed in a badge
- Saving a claim needs a claim and a label. Without a label the message says to choose observed, inferred, or assumed, and nothing is saved. A saved claim appears with its label, is stored as a valid evidence record for that intent, and the status message reads "Evidence saved: <claim> (<Label>)."
- Changing a claim's label updates the stored record and its badge, and the status message says so
- A summary line gives the number of claims per label and, when any are assumed, how many assumed claims still need confirming
- With no intents the Review view says to save an intent first and links to Intents. With an intent but no evidence it says what to add and to label each claim
- Choosing another intent shows only that intent's evidence and reviews. Evidence survives a reload, is shown as text, and the view has no horizontal scroll at 375px
- A review whose finding has a missing or unknown label is dropped and counted by `normalizeState`. The sample review has findings labelled observed, inferred, and assumed
- The Review view ends with a link to the next action
- With no saved intents, the reset confirmation says that any evidence, reviews, capability uses, and progress are replaced
- `checkIntent(intent)` in `app/logic.js` returns eight checks (outcome, inputs, outputs, constraints, success criteria, stop condition present; every criterion checkable; no vague word in the outcome or stop condition), each with a pass flag, a message, and its source rule; a score of passed checks over eight, rounded; and a ready flag that is true only when outcome, constraints, success criteria, stop condition, and checkability pass
- `checkIntent` returns the same result for the same intent, does not change its input, does not store anything, and does not crash on missing, null, or non-text fields
- The example in `context/example-intent.md` and the first sample intent score 100 and are ready; the second sample scores 100; the draft sample scores 38 and is not ready
- The Review view shows, for the selected intent, `Readiness: <score>%.` and `Ready.` or `Not ready yet.`, each check as Pass or Fix with its source rule, and a next step that says how many required items to fix and names them
- A check that fails on success criteria names up to three criterion lines that cannot be marked pass or fail; a clarity failure names the vague words; text from the intent is shown as text
- "Edit this intent" on the Review view opens that intent for editing in the Intents view; after updating it, the Review view shows the new score

## Stop when
- Every success criterion above has been checked in the running app and each result is recorded in the day's evidence record
- If a criterion fails, fix only that criterion and re-check it
- When all pass, stop. Do not restyle, refactor, or extend
- Ideas outside these criteria go under "What changed in the next intent" and are not built
