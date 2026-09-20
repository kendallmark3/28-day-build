# Next Intent After Day 28

Do not add infrastructure automatically. Observe real use first. Choose one next step only when use shows the need.

## Why this one, and not the others
The evidence points at one dead end that the app itself creates:
- The unreadable-data banner (Day 19) offers "Download a copy of the data". Nothing in the app can read that copy back. `evidence/day-19.md` and `reviews/day-28-release-review.md` record it as a way out that does not lead back in.
- Reset to sample data replaces everything. The only safety net is a backup kept in the browser's storage, which a user cannot restore without developer tools.

Candidates from the last version of this file, and why they wait: export of all data (no user has yet needed to move data); team sync through a backend, repository integration, and AI-assisted critique through a server (all need infrastructure, and nothing shows the need yet); audit history (no one has asked what changed). Import is the smallest step that closes a demonstrated gap, and it needs no backend.

# Intent: Import a saved copy of a project

## Intent
A user can restore a project from a data copy they downloaded, by pasting its text, so that the "Download a copy of the data" recovery action leads back to a working project instead of a dead end.

## Inputs
- `app/logic.js` (`normalizeState` and its count of skipped records)
- `app/app.js` (the problem banner and its download action, and the reset confirmation)
- `context/architecture.md`, `context/security.md`, and `context/non-goals.md`

## Outputs
- An "Import a data copy" control with a box to paste the copy's text, shown on the problem banner and on the Overview view
- A summary of what would be restored (counts of intents, evidence, reviews, capabilities, and skipped records) before anything is replaced
- The matching criteria added to the active intent, and a check for each

## Constraints
- Browser only: no server, no network request, and no file input; the user pastes text, as they do for a Jira story
- The pasted text is checked with `normalizeState` before anything changes, and never replaces data without a shown summary and a confirmation
- Before replacing, the current data is copied to the existing backup key
- Pasted text is shown as text and never run
- Non-goals for this round: an export button for all data, sync, accounts, merging two projects, and importing from a Jira export

## Success criteria
- Pasting the exact text of a copy downloaded from the banner shows a summary whose counts equal the copy's, and after confirming, the app holds the same intents, evidence, reviews, capabilities, and progress
- Text that is not valid JSON, or not an object, is refused with a message that says what is wrong, and nothing changes
- Invalid records inside valid data are counted, and the summary shows the skipped count before the user confirms
- Choosing Cancel leaves the stored data equal to what it was; confirming first saves the current data under the backup key, then replaces it with the pasted data
- The control works by keyboard, has no horizontal scroll at 375px, shows hostile pasted text as text, and adds at most one filled button to a view

## Stop when
- Every success criterion above has been checked in the running app and each result is recorded in the day's evidence record
- If a criterion fails, fix only that criterion and re-check it
- When all pass, stop. Do not add export, sync, or file upload in this round
- Ideas outside these criteria go under "What changed in the next intent" and are not built
