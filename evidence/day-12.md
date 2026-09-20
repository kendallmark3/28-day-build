# Day 12 Evidence — Persist locally

Structured per `templates/evidence.md`.

## Intent tested
`days/day-12.md` (refined): keep saved intents in browser `localStorage` so they survive a refresh, and add a "Reset to sample data" action that replaces them with a fixed set of sample intents, after the user confirms.

## Observed
- **Days 9, 10, and 11 were skipped at the user's request.** Their evidence records are still stubs. What that leaves undone:
  - Day 9 (curated context): `context/ux-standard.md` still says "Clear, quiet, professional interface" and "Mobile layout must remain usable"; no excellent-example intent was added; nothing was removed from `context/`.
  - Day 10 (progressive intent): no inspection of "the single most valuable deficiency" was done, so the choice of this day's work came from Day 12's own text, not from evidence.
  - Day 11 (domain model): no data structures for projects, evidence records, or capabilities exist. Only intents are records.
- Persistence was already built and tested before this day: saved intents and edits survive a reload (checks C4 and C11 in earlier days). Nothing was rebuilt for that. What was new: the reset action and its sample data.
- Intent check on `days/day-12.md` found: "user-created records" meant only intents; "reset to sample data" didn't say what data, what happens to the user's intents or to an open edit, or whether the user confirms; "work survives refresh" was already true; "visibly improved" was unchecked; the stop condition was circular. I rewrote the Intent, Inputs, Outputs, Constraints, Success criteria, and Stop when, and added 6 criteria to `intent/current-feature.md` before the code.
- Built in `app/index.html`, `app/app.js` (about 45 lines), `app/styles.css`: a "Reset to sample data" button in the Saved intents panel; a confirmation dialog stating how many saved intents will be replaced (with a red "Replace with sample data" and a "Cancel" that has initial focus); a pure function `sampleIntents(now)` that returns 3 records; a status line "Reset to sample data: 3 intents."; and handling for blocked storage.
- The 3 sample intents: (1) the Jira example as a complete intent, with its vague "should be fast" criterion replaced by "The export finishes in under 5 seconds for 10,000 rows"; (2) "Example: Weekly ticket report" (the form's default text); (3) "Draft: onboarding checklist for new engineers", which has only an outcome and inputs, so the dashboard shows 3 saved and 1 missing.
- `context/architecture.md` got a one-line update so its list of built features includes the reset.
- Verified in real Chrome: 141 checks, 141 passed (21 new; all 120 earlier checks re-run). The new checks:
  - The button sits in the Saved intents panel. Activating it opens a modal that says "Your 2 saved intents will be replaced by 3 sample intents. This cannot be undone." (singular and "no saved intents" wordings also checked); focus starts on Cancel.
  - Esc and Cancel each close it and leave the stored data byte-for-byte unchanged; focus returns to the Reset button.
  - Confirming leaves exactly the 3 sample outcomes in the list; the dashboard reads 3 saved, 1 missing, with "edit the 1 intent"; the stored data has 3 records with distinct ids, a created date, and the six parts; it is the same after a reload, and the old intents are gone.
  - The status message is in a polite `role="status"` region and focus moves to the Saved intents heading.
  - A reset while editing returns the form to create mode with the sample text; saving afterwards adds a new intent and overwrites nothing (the stale edit is gone); the "Reset" message clears when the user next saves.
  - Another `localStorage` key set beforehand was untouched.
  - A sample intent can be edited and saved (the missing count fell to 0).
  - With `Storage.setItem` forced to throw, the message says "Could not reset: this browser is blocking local storage." and the list and stored data were unchanged.
  - Keyboard only: Tab reached the button with a visible outline, Enter opened the dialog on Cancel, Shift+Tab reached "Replace with sample data" with a visible outline, Enter reset.
  - At 375px the dialog fits the screen with no horizontal scroll. The Save button is still fully in the window at load (791 of 800 on desktop, 765 of 812 on a phone), unchanged from Day 7.
  - `sampleIntents` is pure: same input gives the same output, results are independent copies, ids are distinct, and exactly one sample lacks a constraint or stop.
- Screenshots viewed: the page after a reset at 1280px, and the confirmation at 375px.
- Files changed: `app/index.html`, `app/app.js`, `app/styles.css`, `context/architecture.md`, `days/day-12.md`, `intent/current-feature.md`, this record.

## Inferred
- Reset would also recover the app from a corrupt store, because it writes valid data over the app's key regardless of what was there. From reading `save()`; not tested.
- An edit in progress is the main way a reset could leave stale state, since the form remembers an intent id that no longer exists. Handling that in the reset itself (return to create mode) was the smallest fix.
- A confirmation that names the number of intents about to be lost is proportionate for local demo data. Business rule 6 (high-consequence work needs approval) applies to consequences greater than this.

## Assumed
- "Sample data" means a small fixed set of intents. Nothing in the repo defines it. The three samples, including the "under 5 seconds for 10,000 rows" criterion and the onboarding-checklist draft, are my invention, not taken from any real ticket.
- Replacing the user's intents (not adding to them) is what "reset" means. There is no undo, no backup download, and the dialog says so.
- A custom dialog is better than the browser's built-in `confirm()`, because the app's other prompts are dialogs, and it lets the message name the count and puts focus on the safe button.
- The button belongs in the Saved intents panel, below the form, so it doesn't move the Save button.

## Deterministic checks
- [x] Syntax / build — no build step; `node --check app/app.js` passes; no console errors in the run.
- [x] Functional behavior — 141 of 141 checks, per Observed.
- [x] Validation rules — blocked storage and a reset during an edit were both exercised.
- [ ] Accessibility spot-check — partial. Focus order, visible outlines, a live region, and initial focus on the safe button were checked; screen-reader announcements were not tested.

## What failed
Nothing failed in the final run. Earlier in the session, two errors were in my own test script (variable-name collisions), not the app.

## What was not checked
- A store that already holds corrupt data (the app treats it as empty, and a later save would silently overwrite it; that is Day 19's territory).
- Another browser tab holding the same data open while a reset happens. The last write wins.
- Firefox, Safari, a real phone, and screen-reader behavior.
- Whether a first-time user understands what "sample data" will replace.
- Whether the "Reset" button should be more or less prominent. It is a small secondary button, and I did not test whether users find it.

## What changed in the next intent
- Days 9–11 are still open. Day 11 matters most: once projects, evidence records, and capabilities exist, "reset to sample data" should cover them too, and the sample set will need to grow.
- Not built, per the stop rule: deleting a single intent; downloading a backup before a reset; import and export of all intents; an undo.
