# Decision Record: Split the pure logic from the page code

## Decision
Move every function that only computes (the Jira analyser, the intent export, the dashboard and sample data, and the new domain model) into `app/logic.js`. Keep `app/app.js` for code that touches the page or storage. Load both with plain script tags.

## Context
`app/app.js` had grown to about 500 lines, with one 111-line function and 18 lines over 160 characters, and the user had flagged readability of long pure functions. Days 11-24 add a model, checks, and metrics, all of which are pure computation. The feature intent's file boundary allowed only three app files.

## Options considered
1. Keep everything in `app/app.js`.
2. Split into `app/logic.js` (pure) and `app/app.js` (page). **Chosen.**
3. Use ES modules and a bundler.

## Tradeoffs
Option 1 needs no boundary change but the file would double in size. Option 3 adds a build or module loading rules, which the architecture forbids. Option 2 adds a second script tag, and the two files share one global scope (both declare top-level names), so a naming clash is a load-time error.

## Evidence
`logic.js` has no reference to `document`, `window`, `localStorage`, or `Date.now()` (a test reads the file). All 155 earlier regression checks still pass after the move.

## Consequences
The boundary in `intent/current-feature.md` now lists `app/logic.js`. Tests can check pure functions directly in the browser. The 111-line `analyzeStory` was moved unchanged, not split.
