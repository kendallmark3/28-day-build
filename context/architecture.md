# Architecture

IntentWorkbench is intentionally local-first.

## Runtime
- Browser-only HTML/CSS/JavaScript, served as static files from `app/`. No framework and no build step.
- `localStorage` for user-created records, under the single key `intent-workbench-v1` (`{intents: [...]}`).
- No backend. The app makes no network request of its own; the only outbound traffic is the user following a link.
- Decision logic is kept in functions that take data in and return data (`analyzeStory`, `intentMarkdown`, `dashboardState`), separate from the functions that update the page.

## Views and modules
Built (as of Day 8):
- Intents view: a dashboard (intents saved, intents missing a constraint or stop condition, next step), the intent form with sample text, and the saved-intents list with edit.
- Jira story modal: paste a story, get the six parts filled in, notes on what to improve, and a Markdown download. Rule-based; runs in the browser.
- References view (including the project context files) and About view.

Planned, not built:
- Context Library
- Evidence & Review
- Capability Library
- 28-Day Progress
- Readiness score and guardrails

## Architectural rule
Add infrastructure only when a demonstrated requirement cannot be met locally.
