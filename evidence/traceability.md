# Criteria traceability

Every success criterion maps to at least one automated check in `evidence/checks/`. Generated and verified by `evidence/checks/traceability.js` (run `node traceability.js`; it fails if a criterion has no check or a named check does not exist). A check is written `file:ID`; `regression` is `regression.js`.

## Archived tracker intent (`intent/archive/intent-tracker.md`, 53 criteria)

| # | Criterion | Checks |
|---|---|---|
| 1 | The form has six labeled fields, one for each intent part | `regression:C1` |
| 2 | Saving with the outcome field empty or whitespace-only is refused, with a visible message. The other five f... | `regression:C2a`, `regression:C2b`, `regression:C3` |
| 3 | After saving, the intent appears in the list showing its outcome | `regression:C3`, `regression:S2` |
| 4 | After a page reload, saved intents are still in the list | `regression:C4` |
| 5 | With no saved intents, the list shows a message saying what belongs there and pointing to the form | `regression:C5`, `regression:C5b` |
| 6 | The form can be completed and saved using only the keyboard: pressing Tab moves a visible focus outline to ... | `regression:C6a`, `regression:C6b` |
| 7 | One primary button, labeled with its action (for example "Save intent"), is fully inside the window at load... | `regression:C7a`, `regression:C7b` |
| 8 | At 375px viewport width, nothing requires horizontal scrolling | `regression:C8` |
| 9 | The navigation bar shows "Intents", "References", and "About" at the top of the page in every view, and mar... | `regression:N1a`, `regression:N2a`, `regression:N2b`, `regression:N2c` |
| 10 | On load the Intents view is shown. Activating a nav item shows that view and hides the other two. The track... | `regression:N2a`, `regression:N2b`, `regression:N2c` |
| 11 | The address fragment follows the view (`#intents`, `#references`, `#about`). Opening a URL that ends in `#r... | `regression:N3a`, `regression:N3b`, `regression:N3c`, `regression:N3d` |
| 12 | Switching views does not discard text typed into the form: after leaving Intents and returning, the form ho... | `regression:N4` |
| 13 | The nav items can be reached with Tab and activated with Enter, each with a visible focus outline | `regression:N5`, `regression:C6a` |
| 14 | The About view names each of Learn, Teach, and Master with one or two sentences, and names the book it come... | `regression:N6`, `regression:N6b` |
| 15 | Every reference on the References view is one of: an item in the book's Appendix E, or a file or folder in ... | `regression:N7a`, `regression:N7d`, `regression:G1b` |
| 16 | Every external link on the References view is either one of the six the book states or a link to a file in ... | `regression:N7b`, `regression:N7c`, `regression:N7e` |
| 17 | In create mode (on page load, after a save, after an update, after Cancel) all six fields hold non-empty sa... | `regression:S1`, `regression:S3`, `regression:S4`, `regression:C10d`, `regression:C12c` |
| 18 | Choosing "Save intent" on the untouched sample form saves it: the list gains one item showing the sample ou... | `regression:S2` |
| 19 | At 375px viewport width the sample text is fully visible in all six fields, with no scrolling or clipping i... | `regression:S5` |
| 20 | Each listed intent has an "Edit" button, reachable with Tab and activated with Enter. Activating it fills t... | `regression:C9a`, `regression:C9b`, `regression:C9c`, `regression:C9d` |
| 21 | Saving in edit mode replaces that intent's values in place: the number of listed intents is unchanged and t... | `regression:C10a`, `regression:C10b`, `regression:C10c` |
| 22 | After a reload, an edited intent shows its new values | `regression:C11` |
| 23 | In edit mode a "Cancel" button is shown; activating it restores the sample text in all six fields and the l... | `regression:C12a`, `regression:C12b`, `regression:C12c` |
| 24 | The Intents view has a "Start from a Jira story" button that opens a modal dialog. Focus moves into the dia... | `regression:J1a`, `regression:J1b`, `regression:J1c` |
| 25 | The modal opens with an example Jira story in the paste box, marked as an example. Choosing "Build my inten... | `regression:J2a`, `regression:J2b` |
| 26 | For the example story: the outcome contains "export a monthly usage report as a CSV" and "so that"; the inp... | `regression:J3a`, `regression:J3b`, `regression:J3c`, `regression:J3d`, `regression:J3e` |
| 27 | The same example written with Jira markup (`h2.` headings, `*` bullets) and with Markdown headings (`##`) g... | `regression:J4` |
| 28 | A pasted story with no recognisable sections still produces a result: the outcome is taken from its first l... | `regression:J5a`, `regression:J5b` |
| 29 | The notes have two parts: "What didn't fit" lists the story lines placed in no field, and "What to improve"... | `regression:J6a`, `regression:J6b`, `regression:J6c`, `regression:J6d` |
| 30 | A story containing `password: hunter2` gets a Security note listed first | `regression:J7` |
| 31 | "Download intent file" saves a `.md` file named with the Jira key (for example `intent-proj-142.md`). It ha... | `regression:J8a`, `regression:J8b`, `regression:J8c`, `regression:J8d` |
| 32 | "Use in form" copies the six fields into the main form and closes the modal. Choosing "Save intent" then ad... | `regression:J9a`, `regression:J9b`, `regression:J9c`, `regression:J9d` |
| 33 | The pasted story is not written to `localStorage`, and the app makes no request outside its own origin whil... | `regression:J10a`, `regression:J10b`, `regression:J11` |
| 34 | The whole modal flow works with the keyboard only, with a visible focus outline on every control, and at 37... | `regression:J12`, `regression:J13` |
| 35 | The Intents view starts with a dashboard, visible at load, that shows "Intents saved" (the number of saved ... | `regression:D1a`, `regression:D1b`, `regression:D2`, `regression:D3` |
| 36 | The dashboard's next-step line says: with no saved intents, to save the example or start from a Jira story;... | `regression:D2`, `regression:D4`, `regression:D5a`, `regression:D8` |
| 37 | The dashboard does not appear on the References or About views | `regression:D9` |
| 38 | The References view has a "Project context" section listing all seven context files (`architecture.md`, `bu... | `regression:G1a`, `regression:G1b`, `regression:G1c`, `regression:G2` |
| 39 | Each Jira-story note whose rule is written in `context/` ends with a "Source:" line naming the file and, fo... | `regression:G3a`, `regression:G3b`, `regression:G3c`, `regression:G3d`, `regression:G4` |
| 40 | No text from the context files is copied into the app: only file names, purpose lines, and rule numbers appear | `regression:G6` |
| 41 | The Saved intents panel has a "Reset to sample data" button. Activating it opens a confirmation dialog that... | `regression:R0`, `regression:R1a`, `regression:R1b`, `regression:R1c`, `regression:R1d` |
| 42 | Confirming replaces all saved intents with 3 sample intents. The list shows them, the dashboard shows 3 sav... | `regression:R2a`, `regression:R2b`, `regression:R2c`, `regression:R3` |
| 43 | After a reset, a message "Reset to sample data: 3 intents." is shown in a polite live region and focus move... | `regression:R4`, `regression:R8` |
| 44 | If an intent is being edited when the reset is confirmed, the form returns to create mode with the sample t... | `regression:R5a`, `regression:R5b` |
| 45 | Reset changes only the app's own `localStorage` key; other keys are untouched. Sample intents can be edited... | `regression:R6`, `regression:R7` |
| 46 | The reset flow works with the keyboard only, with a visible focus outline on every control, and at 375px ne... | `regression:R9`, `regression:R10` |
| 47 | After saving, updating, cancelling an edit, and using a story in the form, a status message naming the acti... | `regression:U1`, `regression:U2`, `regression:U3`, `regression:U4` |
| 48 | After "Use in form", both the status message and the Save button are inside the window at 1280x800 | `regression:U4` |
| 49 | The status message disappears when the user starts typing in the form or starts editing an intent | `regression:U5a`, `regression:U5b` |
| 50 | After "Download intent file", the modal shows "Downloaded <file name>." in a polite live region | `regression:U8`, `regression:U9` |
| 51 | The References and About views each end with a link to the Intents view; following it shows Intents | `regression:U10` |
| 52 | `context/ux-standard.md` has no vague word from the app's list, and each of its rules names something that ... | `day09:D9-1`, `day09:D9-2` |
| 53 | `context/example-intent.md` has the six intent parts and a "Why this works" line for each, and its six part... | `day09:D9-3`, `day09:D9-4` |

## Active intent (`intent/current-feature.md`, 89 criteria)

| # | Criterion | Checks |
|---|---|---|
| 1 | After the first save or a reset, the stored data has `version: 2`, arrays `projects`, `intents`, `evidence`... | `day11:M1` |
| 2 | Stored data in the old shape (`{intents: [...]}` only) loads with every intent value intact; the other reco... | `day11:M2a`, `day11:M2b`, `day11:M2c` |
| 3 | `emptyState`, `normalizeState`, `makeIntent`, `makeEvidence`, `makeReview`, and `makeCapability` exist in `... | `day11:M3a`, `day11:M3b`, `day11:M3c` |
| 4 | `normalizeState` keeps valid records and drops invalid ones, returning how many it dropped. Invalid: an evi... | `day11:M4a`, `day11:M4b` |
| 5 | Two built-in capabilities, "Intent check" and "Evidence-first review", always exist. Each has a purpose, pr... | `day11:M5a`, `day11:M5b` |
| 6 | "Reset to sample data" restores at least 3 intents, evidence in each of the three labels, at least 1 review... | `day11:M6a`, `day11:M6b`, `day11:M6c`, `day11:M6d` |
| 7 | An Overview item in the navigation opens a view with a "Data model" panel that shows counts for Projects, I... | `day11:M7`, `day11:M8` |
| 8 | Hostile text (script tags, event-handler attributes, closing tags) in any field is stored and shown as text... | `day14:A1` |
| 9 | Saving several times in the same millisecond gives each intent a distinct id | `day14:A3` |
| 10 | When storage is full, saving says the storage is full (not that it is blocked), and earlier data is kept | `day14:A4` |
| 11 | Opening or leaving a view closes any open dialog | `day14:A5` |
| 12 | A save in another browser tab shows in this tab without a reload | `day14:A7` |
| 13 | Updating an intent that no longer exists saves it as a new intent and says so, instead of reporting a false... | `day14:A12` |
| 14 | A Review item in the navigation opens a view with an intent selector, that intent's evidence list, a form t... | `day16:E1a`, `day16:E1b` |
| 15 | Every evidence record, and every finding in a review, shows one of the words Observed, Inferred, or Assumed... | `day16:E2` |
| 16 | Saving a claim needs a claim and a label. Without a label the message says to choose observed, inferred, or... | `day16:E3a`, `day16:E3b`, `day16:E3c` |
| 17 | Changing a claim's label updates the stored record and its badge, and the status message says so | `day16:E4` |
| 18 | A summary line gives the number of claims per label and, when any are assumed, how many assumed claims stil... | `day16:E6a`, `day16:E6b`, `day16:E6c` |
| 19 | With no intents the Review view says to save an intent first and links to Intents. With an intent but no ev... | `day16:E7a`, `day16:E7b` |
| 20 | Choosing another intent shows only that intent's evidence and reviews. Evidence survives a reload, is shown... | `day16:E8`, `day16:E9a`, `day16:E11` |
| 21 | A review whose finding has a missing or unknown label is dropped and counted by `normalizeState`. The sampl... | `day16:E12` |
| 22 | The Review view ends with a link to the next action | `day16:E10` |
| 23 | With no saved intents, the reset confirmation says that any evidence, reviews, capability uses, and progres... | `day16:E14` |
| 24 | `checkIntent(intent)` in `app/logic.js` returns eight checks (outcome, inputs, outputs, constraints, succes... | `day17:V1a` |
| 25 | `checkIntent` returns the same result for the same intent, does not change its input, does not store anythi... | `day17:V1b`, `day17:V1c` |
| 26 | The example in `context/example-intent.md` and the first sample intent score 100 and are ready; the second ... | `day17:V2a`, `day17:V2b`, `day17:V2c` |
| 27 | The Review view shows, for the selected intent, `Readiness: <score>%.` and `Ready.` or `Not ready yet.`, ea... | `day17:V4a`, `day17:V4b` |
| 28 | A check that fails on success criteria names up to three criterion lines that cannot be marked pass or fail... | `day17:V3` |
| 29 | "Edit this intent" on the Review view opens that intent for editing in the Intents view; after updating it,... | `day17:V5a`, `day17:V5b` |
| 30 | `GUARDRAIL_MINIMUMS` in `app/logic.js` gives low 2 minimums, medium 2 more, and high 2 more; `guardrailStat... | `day18:G1a`, `day18:G1b`, `day18:G1c` |
| 31 | The Review view has a consequence selector (Not set, Low, Medium, High) for the selected intent; choosing a... | `day18:G3a`, `day18:G3b`, `day18:G3c` |
| 32 | Each automatic minimum is Met or Open from the intent's own data: at least one evidence claim; the readines... | `day18:G5a`, `day18:G5b`, `day18:G5c` |
| 33 | For high consequence an approver field and a Record approval button appear; a named approval is stored on t... | `day18:G4a`, `day18:G4b`, `day18:G4c`, `day18:G4d` |
| 34 | A summary line says whether all minimums are met or how many are open; with no level set the section says t... | `day18:G2a`, `day18:G2b`, `day18:G2c` |
| 35 | Consequence and approver are stored on the intent and survive a reload; an invalid stored consequence becom... | `day18:G7`, `day18:G3b` |
| 36 | `describeProblem({corrupt, skipped, blocked, failed})` in `app/logic.js` is pure and returns nothing when t... | `day19:P1a`, `day19:P1b`, `day19:P1c` |
| 37 | When stored data is not valid JSON, or is valid JSON that is not an object, the app loads an empty project,... | `day19:F1a`, `day19:F1b`, `day19:F1c` |
| 38 | "Download a copy of the data" gives a file whose text is exactly the original stored text. "Start with an e... | `day19:F2`, `day19:F3` |
| 39 | Saving while the banner is showing replaces the unreadable data with valid data and hides the banner, and t... | `day19:F4` |
| 40 | When stored data holds invalid records (an empty outcome, a wrong evidence label, a missing intent, a colle... | `day19:F5a`, `day19:F5b`, `day19:F5c` |
| 41 | A record with only an id and an outcome loads, is listed, and can be edited and saved with its other fields... | `day19:F6` |
| 42 | When the browser blocks storage at load, a banner says nothing will be saved; when the app throws an unexpe... | `day19:F7a`, `day19:F8` |
| 43 | "Reset to sample data" from an unreadable or invalid store gives a valid store and hides the banner. The ba... | `day19:F9`, `day19:F10a`, `day19:F11`, `day19:F12a`, `day19:F12b` |
| 44 | The Overview view has a "How it fits together" panel: an ordered list of six stages in the order Intent, Co... | `day20:O1a`, `day20:O2a` |
| 45 | The counts read as sentences: "N saved, M ready" (Intent, by the readiness check); "N files the app follows... | `day20:O2b`, `day20:O4` |
| 46 | Intent links to Intents, Context to References, Evidence and Review to Review, Capability to Capabilities, ... | `day20:O3a`, `day20:O3b` |
| 47 | `flowStages(state, contextCount)` in `app/logic.js` is pure, returns the six stages in order, and gives zer... | `day20:O1a`, `day20:O1b`, `day20:O1c` |
| 48 | The flow reads as a list, its arrows are hidden from assistive technology, its links are reachable by keybo... | `day20:O5a`, `day20:O5b`, `day20:O6a` |
| 49 | A Capabilities item in the navigation opens a view that lists each capability as a card with its name, its ... | `day21:K2a`, `day21:K2b`, `day21:K2c` |
| 50 | The card for "Intent check" has the purpose, procedure lines, output, and checks written in `skills/intent-... | `day21:K1b`, `day21:K2b`, `day21:K3` |
| 51 | `skills/intent-check.md` and `skills/evidence-first-review.md` each have an Owner and a Version section, an... | `day21:K1a` |
| 52 | The Capability stage of the Overview flow links to the Capabilities view. The Capabilities view ends with a... | `day21:K4`, `day21:K5a`, `day21:K5b`, `day21:K5c` |
| 53 | The "Evidence-first review" card has a Sample usage that describes the sample review (the intent, the count... | `day22:W1a`, `day22:W1b`, `day22:W2a`, `day22:W2b` |
| 54 | The Review view has a "Record a review" form for the selected intent with one row per success criterion lin... | `day22:W3a` |
| 55 | Recording without "Not checked" is refused with a message and nothing is stored. A recorded review is store... | `day22:W3b`, `day22:W3c`, `day22:W3d` |
| 56 | An intent with no success criteria shows a message that there is nothing to review yet, and no form | `day22:W4` |
| 57 | Recording a review turns the review minimum of a medium-consequence intent to Met without a reload. Hostile... | `day22:W5`, `day22:W6a`, `day22:W6b`, `day22:W6c` |
| 58 | The Capabilities view opens with a ladder of five rungs in order (Prompt, Skill, Trigger, Workflow, Busines... | `day23:L2a` |
| 59 | Each capability card has a level selector; changing it saves the level, updates the card's badge and the la... | `day23:L3a`, `day23:L3b` |
| 60 | An "Add an item to classify" form takes a name (required), a rung, and a purpose, and creates a stored, val... | `day23:L4a`, `day23:L4b` |
| 61 | Each card shows its successful and unsuccessful use counts and has buttons to record a successful use and a... | `day23:L5a`, `day23:L5b` |
| 62 | "Promote" is refused until a capability has at least 2 recorded successful uses, and the message says how m... | `day23:L5c`, `day23:L5d`, `day23:L5f`, `day23:L1d` |
| 63 | `ladderCounts`, `promotionStatus`, `withUse`, and `tryPromote` in `app/logic.js` are pure, do not change th... | `day23:L1a`, `day23:L1b`, `day23:L1c`, `day23:L1d`, `day23:L1e` |
| 64 | Capability names and purposes are shown as text, the view has no horizontal scroll at 375px, its controls w... | `day23:L6a`, `day23:L6b`, `day23:L6c` |
| 65 | The Overview view has an Outcomes panel with exactly four metrics, in this order: Intents ready, Reviews co... | `day24:M2a`, `day24:M2b`, `day24:M2c` |
| 66 | `metrics(state)` in `app/logic.js` is pure and returns those four metrics; for an empty project they read 0... | `day24:M1a`, `day24:M1b`, `day24:M3a` |
| 67 | The 28-day list has 28 checkboxes labelled "Day N: <title>" (titles from the roadmap), checked from the sto... | `day24:M4a`, `day24:M4b`, `day24:M4c` |
| 68 | The Overview flow's Build stage links to the progress list, and opening `#progress` shows the Overview scro... | `day24:M5a`, `day24:M5b` |
| 69 | No code counts page views, clicks, time spent, or saves; the metrics panel has no filled button, works by k... | `day24:M1c`, `day24:M6a`, `day24:M6b`, `day24:M6c` |
| 70 | A Start item, first in the navigation, opens "Start here": the rule "Prompt to explore. Write intent to rep... | `day25:B2a`, `day25:B3a` |
| 71 | Each of the six steps (write an intent; check it is ready; record evidence and label it; review the result;... | `day25:B3b`, `day25:B4a` |
| 72 | Status comes from the stored data: an intent exists; an intent is ready; an evidence claim exists; a review... | `day25:B1a`, `day25:B1b` |
| 73 | "Load the sample project", the view's only filled button, opens the reset confirmation; once confirmed the ... | `day25:B4a`, `day25:B4b`, `day25:B4c`, `day25:B3c` |
| 74 | The empty dashboard's next step links to Start. The Start view works by keyboard, has no horizontal scroll ... | `day25:B2b`, `day25:B6a`, `day25:B6b`, `day25:B6c` |
| 75 | Starting from an empty project and following only the links and instructions on the Start view, a person ca... | `day25:B5` |
| 76 | On all seven views, both dialogs (each step of the Jira dialog and the reset confirmation), and the error b... | `day26:contrast` |
| 77 | Every view has no horizontal scroll at 320px, 375px, 768px, and 1280px, with sample data loaded | `day26:no horizontal scroll` |
| 78 | The polish audit passes on the finished app, and the recorded before-and-after table shows which rules fail... | `day26:button height` |
| 79 | Every success criterion in the archived and the active intent maps to at least one existing automated check... | `day27:T1` |
| 80 | Full storage during each of the eight write actions (save a claim, relabel a claim, record a review, set a ... | `day27:Q1`, `day27:Q2`, `day27:Q3`, `day27:Q4`, `day27:Q5` |
| 81 | An accidental double-click never records a use twice (a repeat of the same kind within 1.5 seconds is ignor... | `day27:Q6`, `day27:Q7` |
| 82 | `context/architecture.md` lists each view as built and lists as not built only what is not built; nothing i... | `day27:D1` |
| 83 | The repository tells a newcomer how to run the app: `run-app.sh` and `run-app.bat` serve `app/`, `README.md... | `day27:D2`, `day27:D3`, `day27:D4` |
| 84 | `docs/RELEASE-CHECKLIST.md` lists each release item either done, with a pointer to evidence that exists in ... | `day28:R4` |
| 85 | `docs/DEMO-SCRIPT.md` has seven steps whose times total 180 seconds and whose spoken text is at most 2.7 wo... | `day28:R2`, `day28:R3` |
| 86 | `docs/NEXT-INTENT.md` holds one next intent, chosen from the evidence, with the six parts, and the app's ow... | `day28:R5` |
| 87 | `docs/RELEASE-NOTES.md` states what is included, how to run it, what was verified, and the known limitation... | `day28:R6` |
| 88 | `reviews/day-28-release-review.md` gives each of the six project success criteria a status (met, unmet, or ... | `day28:R7`, `day28:R8` |
| 89 | Every internal link in the app opens a view, and every external link opens in a new tab with `rel="noopener... | `day28:R1` |
