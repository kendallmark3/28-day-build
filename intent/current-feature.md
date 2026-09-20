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
- A Guardrails section on the Review view: consequence selector, minimums for the chosen level marked Met, Open, or Check yourself, an approver field for high, and a summary
- A problem banner on every view for four failures (unreadable data, invalid records, blocked storage, unexpected error), a kept copy of stored data, and recovery actions
- A "How it fits together" panel on the Overview view showing the six-stage operating model with live counts
- A Capabilities view listing packaged capabilities as cards (purpose, procedure, output, checks, owner, version, source file, and where to use it)
- A Sample usage section on each built-in capability card, and a "Record a review" form on the Review view
- A capability ladder, classification by rung, an "Add an item to classify" form, and recorded uses with a promotion rule, on the Capabilities view
- An Outcomes panel on the Overview view with four outcome metrics, and a 28-day progress list
- A Start view: the loop, six self-checking steps, and a sample project with a computed tour

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
- The `skills/` files may be edited only to add Owner and Version sections (Day 21)

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
- `GUARDRAIL_MINIMUMS` in `app/logic.js` gives low 2 minimums, medium 2 more, and high 2 more; `guardrailStatus(intent, state)` is pure and returns the level, each minimum (with its level, kind, and Met, Open, or not applicable), the number open, and whether all are met. Each higher level includes every minimum of the lower ones
- The Review view has a consequence selector (Not set, Low, Medium, High) for the selected intent; choosing a level saves it on the intent, shows the minimums for that level (2, 4, or 6), and says so in a polite status region
- Each automatic minimum is Met or Open from the intent's own data: at least one evidence claim; the readiness check passes; a review is recorded; no claim is left assumed. Adding evidence, recording an approval, or fixing the intent changes the status without a reload
- For high consequence an approver field and a Record approval button appear; a named approval is stored on the intent, shown, and marks the minimum Met; an empty name is refused with a message; the app states that it cannot verify who approved
- A summary line says whether all minimums are met or how many are open; with no level set the section says to choose one and shows no minimums
- Consequence and approver are stored on the intent and survive a reload; an invalid stored consequence becomes not set; the sample intents show a medium intent with all minimums met, a low intent with one open, and one not set
- `describeProblem({corrupt, skipped, blocked, failed})` in `app/logic.js` is pure and returns nothing when there is no problem; otherwise a kind, a message that says what happened and what to do, and the actions offered (unreadable: download, start empty, dismiss; invalid records: download, dismiss; blocked: dismiss; unexpected error: download, dismiss). An unexpected error outranks blocked storage, which outranks unreadable data, which outranks invalid records
- When stored data is not valid JSON, or is valid JSON that is not an object, the app loads an empty project, shows a banner that says the data could not be read, keeps a copy of the original text under `intent-workbench-v1-backup`, and leaves the stored data untouched until the user acts
- "Download a copy of the data" gives a file whose text is exactly the original stored text. "Start with an empty project" clears the stored data, hides the banner, keeps the backup, and says so
- Saving while the banner is showing replaces the unreadable data with valid data and hides the banner, and the backup still holds the original text
- When stored data holds invalid records (an empty outcome, a wrong evidence label, a missing intent, a collection that is not a list), the banner gives the number left out (matching `normalizeState`), a copy of the original is kept, and the valid records still load. It offers download and dismiss, but not start empty
- A record with only an id and an outcome loads, is listed, and can be edited and saved with its other fields empty
- When the browser blocks storage at load, a banner says nothing will be saved; when the app throws an unexpected error, a banner says something went wrong and to reload. Both are announced as alerts
- "Reset to sample data" from an unreadable or invalid store gives a valid store and hides the banner. The banner is on every view, its buttons work by keyboard, it has no horizontal scroll at 375px, and it is absent (and the Save button position unchanged) when nothing is wrong
- The Overview view has a "How it fits together" panel: an ordered list of six stages in the order Intent, Context, Build, Evidence, Review, Capability, each with a one-line description, a count, and a detail line, and a caption explaining that what is learned at Review sharpens the next intent
- The counts read as sentences: "N saved, M ready" (Intent, by the readiness check); "N files the app follows" (Context, the files in the References view's Project context); "N of 28 days done" (Build, ticked days); "N claims, M assumed" (Evidence); "N reviews recorded" (Review); "N of M promoted" (Capability). They match the stored data and change without a reload after a save
- Intent links to Intents, Context to References, Evidence and Review to Review, Capability to Capabilities, and Build to the 28-day progress list, and each link opens that view
- `flowStages(state, contextCount)` in `app/logic.js` is pure, returns the six stages in order, and gives zero counts for an empty project
- The flow reads as a list, its arrows are hidden from assistive technology, its links are reachable by keyboard with a visible outline, and the stages stack in order, each wide enough to read without breaking words, with no horizontal scroll at 1280px or 375px. It uses no image, script, or external request
- A Capabilities item in the navigation opens a view that lists each capability as a card with its name, its purpose, its procedure as an ordered list, its output, its checks, its owner and version, a link to its file in the project's repository, and a link to where it is used
- The card for "Intent check" has the purpose, procedure lines, output, and checks written in `skills/intent-check.md`, word for word; the card for "Evidence-first review" likewise matches `skills/evidence-first-review.md`; a check fails if the app and the files differ
- `skills/intent-check.md` and `skills/evidence-first-review.md` each have an Owner and a Version section, and the app shows the same owner and version
- The Capability stage of the Overview flow links to the Capabilities view. The Capabilities view ends with a link to the next action, works by keyboard, and has no horizontal scroll at 375px
- The "Evidence-first review" card has a Sample usage that describes the sample review (the intent, the count met, unmet, and untested, the number of findings by label, and what was not checked) and the "Intent check" card has one for the draft sample intent (its readiness score, ready or not, and what to fix). Both are computed from the sample data by `sampleUsage` and equal what the sample data contains
- The Review view has a "Record a review" form for the selected intent with one row per success criterion line and a status choice (Untested, Met, Unmet; Untested by default), three finding boxes (observed, inferred, assumed; one finding per line), a required "Not checked" box, and a summary box; its button is secondary
- Recording without "Not checked" is refused with a message and nothing is stored. A recorded review is stored as a valid review for that intent with the chosen statuses and findings labelled by the box they were entered in, is listed under Reviews, and the status message reads "Review saved: N met, M unmet, K untested."
- An intent with no success criteria shows a message that there is nothing to review yet, and no form
- Recording a review turns the review minimum of a medium-consequence intent to Met without a reload. Hostile text is shown as text, long text wraps at 375px with no horizontal scroll, and the form works by keyboard
- The Capabilities view opens with a ladder of five rungs in order (Prompt, Skill, Trigger, Workflow, Business capability), each with a one-line meaning and the number of items at that rung. The counts match the stored capabilities and change when an item is classified or added
- Each capability card has a level selector; changing it saves the level, updates the card's badge and the ladder, and says so in a polite status region
- An "Add an item to classify" form takes a name (required), a rung, and a purpose, and creates a stored, valid capability that is not built in, has no uses, and is not promoted; it appears in the list and the ladder. An empty name is refused with a message
- Each card shows its successful and unsuccessful use counts and has buttons to record a successful use and an unsuccessful use; each stores a use with a date and updates the counts
- "Promote" is refused until a capability has at least 2 recorded successful uses, and the message says how many more are needed and cites business rule 5. Unsuccessful uses do not count. With 2 successful uses it promotes, the card shows Promoted, and the Overview counts it
- `ladderCounts`, `promotionStatus`, `withUse`, and `tryPromote` in `app/logic.js` are pure, do not change their input, and agree with each other. The sample data shows the rule: the intent check promoted with 2 uses, the review skill needing 1 more
- Capability names and purposes are shown as text, the view has no horizontal scroll at 375px, its controls work by keyboard, and it has exactly one filled button
- The Overview view has an Outcomes panel with exactly four metrics, in this order: Intents ready, Reviews completed, Capabilities promoted, 28-day progress. Each shows a number (and "of N" where it applies) and one line on why it matters. A note says that page views, clicks, time spent, and number of saves are deliberately not measured, because they measure activity, not outcomes
- `metrics(state)` in `app/logic.js` is pure and returns those four metrics; for an empty project they read 0 of 0, 0, 0 of 2, and 0 of 28. The values equal the stored data and the Overview flow (ready intents, reviews, promoted capabilities, ticked days), and change without a reload after a review is recorded, a capability promoted, a day ticked, or an intent saved
- The 28-day list has 28 checkboxes labelled "Day N: <title>" (titles from the roadmap), checked from the stored progress; ticking or unticking one saves it, updates the metric and the flow's Build stage, and says so in a polite status region; it survives a reload; the sample data has days 1 to 8 ticked
- The Overview flow's Build stage links to the progress list, and opening `#progress` shows the Overview scrolled to it
- No code counts page views, clicks, time spent, or saves; the metrics panel has no filled button, works by keyboard, and has no horizontal scroll at 375px
- A Start item, first in the navigation, opens "Start here": the rule "Prompt to explore. Write intent to repeat.", the loop Intent, Result, Evidence, Refined Intent, Better Result in plain words, six steps, and a sample project section. The default view remains Intents
- Each of the six steps (write an intent; check it is ready; record evidence and label it; review the result; set the stakes; keep what you repeat) shows a title, one sentence saying why, what to do, a Done or To do status, and a link to the view where it is done. A summary says "N of 6 steps done." and names the next step, or says all six are done
- Status comes from the stored data: an intent exists; an intent is ready; an evidence claim exists; a review exists; an intent has a consequence level; a capability has a recorded successful use. `onboardingSteps(state)` in `app/logic.js` is pure: an empty project gives 0 of 6 with writing an intent next, and the sample project gives 6 of 6
- "Load the sample project", the view's only filled button, opens the reset confirmation; once confirmed the view says the sample was loaded and all steps show Done. The sample tour lists the three sample intents with their readiness and consequence status computed from the sample data by `sampleTour()`, and it equals what the Review view shows
- The empty dashboard's next step links to Start. The Start view works by keyboard, has no horizontal scroll at 375px, and with seven navigation items the Save intent button is still inside the window at 375x812
- Starting from an empty project and following only the links and instructions on the Start view, a person can reach 6 of 6 steps done

## Stop when
- Every success criterion above has been checked in the running app and each result is recorded in the day's evidence record
- If a criterion fails, fix only that criterion and re-check it
- When all pass, stop. Do not restyle, refactor, or extend
- Ideas outside these criteria go under "What changed in the next intent" and are not built
