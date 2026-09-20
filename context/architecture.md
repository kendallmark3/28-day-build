# Architecture

IntentWorkbench is intentionally local-first.

## Runtime
- Browser-only HTML/CSS/JavaScript, served as static files from `app/`. No framework and no build step.
- `localStorage` for user-created records, under the single key `intent-workbench-v1` (`{intents: [...]}`).
- No backend. The app makes no network request of its own; the only outbound traffic is the user following a link.
- Decision logic lives in `app/logic.js`, as functions that take data in and return data (`analyzeStory`, `intentMarkdown`, `dashboardState`, `normalizeState`, `sampleState`). `app/app.js` holds the code that touches the page and storage. `logic.js` never reads either.
- Stored data is one object with a version and five record types: projects, intents, evidence, reviews, and capabilities, plus a progress record. Old stored data (intents only) is upgraded on load.

## Views and modules
Built (as of Day 8):
- Intents view: a dashboard (intents saved, intents missing a constraint or stop condition, next step), the intent form with sample text, and the saved-intents list with edit and a confirmed reset to sample data.
- Jira story modal: paste a story, get the six parts filled in, notes on what to improve, and a Markdown download. Rule-based; runs in the browser.
- Review view: pick an intent, see its evidence and reviews, add a claim with a label, and change a claim's label.
- Readiness and guardrails on the Review view: a readiness score for the selected intent, and the minimum checks for its consequence level.
- Overview view: a count of each stored record type.
- References view (including the project context files) and About view.

Planned, not built:
- Context Library
- Evidence & Review
- Capability Library
- 28-Day Progress
- Readiness score and guardrails

## Architectural rule
Add infrastructure only when a demonstrated requirement cannot be met locally.
