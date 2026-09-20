# Architecture

IntentWorkbench is intentionally local-first.

## Runtime
- Browser-only HTML/CSS/JavaScript, served as static files from `app/`. No framework and no build step.
- `localStorage` for user-created records, under the single key `intent-workbench-v1` (`{intents: [...]}`).
- No backend. The app makes no network request of its own; the only outbound traffic is the user following a link.
- Decision logic lives in `app/logic.js`, as functions that take data in and return data (`analyzeStory`, `intentMarkdown`, `dashboardState`, `normalizeState`, `sampleState`). `app/app.js` holds the code that touches the page and storage. `logic.js` never reads either.
- Failures are shown, not hidden: unreadable data, invalid records, blocked storage, and unexpected errors each show a banner that says what to do. Before invalid or unreadable data can be dropped, a copy of the original text is kept under `intent-workbench-v1-backup`.
- Stored data is one object with a version and five record types: projects, intents, evidence, reviews, and capabilities, plus a progress record. Old stored data (intents only) is upgraded on load.

## Views and modules
Built:
- Intents view: a dashboard (intents saved, intents missing a constraint or stop condition, next step), the intent form with sample text, and the saved-intents list with edit and a confirmed reset to sample data.
- Jira story modal: paste a story, get the six parts filled in, notes on what to improve, and a Markdown download. Rule-based; runs in the browser.
- Review view: pick an intent, see its evidence and reviews, add a claim with a label, and change a claim's label.
- Recording a review on the Review view: a status for each success criterion, findings labelled observed, inferred, or assumed, and a required statement of what was not checked.
- Readiness and guardrails on the Review view: a readiness score for the selected intent, and the minimum checks for its consequence level.
- Capabilities view: the ladder (Prompt, Skill, Trigger, Workflow, Business capability), a card for each capability with its rung, its recorded uses and a Promote button that refuses until 2 successful uses (business rule 5), and a form to add and classify an item. Each capability is shown as a card (purpose, procedure, output, checks, owner, version, source file). The two built-in ones are the repository's skills; a test keeps the app's text equal to `skills/`.
- Start view: the loop and six steps that tick themselves off from the stored data, and a sample project with a tour computed from the sample data.
- Overview view: how the stages fit together (Intent, Context, Build, Evidence, Review, Capability) with a live count at each, and a count of each stored record type.
- References view (including the project context files) and About view.

Not built:
- Export and import of a project's data, team sync, repository integration, and an audit history. These are the candidates in `docs/NEXT-INTENT.md`, to be chosen only when real use shows the need.
- Deleting or renaming records and editing a claim's text. These are non-goals for now, so a mistyped claim can be relabelled but not corrected.
- A project switcher. One default project exists; the model supports more.
- Any server, account, or AI call. These are non-goals (`context/non-goals.md`).

Context is shown as a list of links on the References view, not as a separate library view.

## Architectural rule
Add infrastructure only when a demonstrated requirement cannot be met locally.
