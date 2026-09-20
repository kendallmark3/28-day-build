# Day 14 Evidence — Challenge the result

Structured per `templates/evidence.md`.

## Intent tested
`days/day-14.md` (refined before probing): attack the app's assumptions with scripted probes, record which break it, and fix only the failures the probes demonstrate.

## Observed
- Intent check on `days/day-14.md`: "adversarial pass" named no attacks or count; "fix only evidenced issues" needed a before-and-after record; failures owned by later days were not addressed. I required at least 10 attacks across six areas, results recorded before any fix, and left corrupt-data recovery to Day 19.
- 12 probes were run in real Chrome before any code changed: **6 held and 6 broke**. After the fixes: 11 hold, and one (A10) is deferred.

| # | Attack | Expected | Before | After |
|---|---|---|---|---|
| A1 | hostile HTML/JS in all six fields, saved, listed, edited | no script runs; nothing is parsed as markup | HOLDS | HOLDS |
| A2 | path traversal / odd characters in the download file name | name has only a-z 0-9 - and ends .md | HOLDS | HOLDS |
| A3 | three Save submits in the same millisecond | 3 intents with 3 distinct ids | BREAKS | HOLDS |
| A4 | fill localStorage with 1.2MB intents until it is full | a clear "storage is full" message; earlier data intact | BREAKS | HOLDS |
| A5 | Back/forward (view change) while the Jira modal is open | the modal closes when the view changes | BREAKS | HOLDS |
| A6 | story text of 100-300 KB that could trigger regex backtracking | each analysis finishes in under 2000 ms | HOLDS | HOLDS |
| A7 | save in a second tab while the first tab is open | the first tab shows the new intent without a reload | BREAKS | HOLDS |
| A8 | 400-character unbroken words in a Jira story, on a phone | no horizontal scroll in the modal or the page | HOLDS | HOLDS |
| A9 | 2000 saved intents, then save one more | under 2000 ms and all listed | HOLDS | HOLDS |
| A10 | stored data is not valid JSON, then the user saves | the app says the data was unreadable and keeps a copy (Day 19) | BREAKS | BREAKS (deferred to Day 19) |
| A11 | odd URL fragments (#__proto__, #constructor, bad encoding, double hash) | exactly one view is shown each time, no error | HOLDS | HOLDS |
| A12 | edit an intent that another tab has since removed, then Update | it is not silently lost or duplicated: the user is told, or it is saved as a new intent | BREAKS | HOLDS |
- Held without change: hostile HTML in all six fields, in the list, in edit mode (no script ran, nothing was parsed as markup); path traversal and non-Latin text in download file names; stories of up to 300 KB (analysis took 1 to 7 ms, so no regex blow-up); 400-character unbroken words on a phone; 2,000 saved intents (a save took about 35 ms); odd URL fragments such as `#__proto__`.
- Failures fixed, each with the cause:
  - A3, duplicate ids: an intent's id was `Date.now()`, so saves in the same millisecond collided (two of three ids were equal). Now `nextIntentId` in `app/logic.js` never returns an existing id. New intents are also built with `makeIntent`, so they carry a project and consequence field.
  - A4, wrong message: any storage failure said "blocking local storage". A full store now says its storage is full and what to do; a blocked store keeps the old message.
  - A5, modal across views: opening another view left the Jira modal open on top of it. Changing view now closes any open dialog.
  - A7, stale second tab: a save in another tab did not appear until an action in this one. The app now listens for the browser's `storage` event and re-renders.
  - A12, silent loss with a false confirmation: editing an intent that another tab had removed reported "Updated: ..." while the edit was not stored anywhere. (This was made worse by the Day 13 status message.) It is now saved as a new intent and the message says the original no longer exists.
- Deferred, not fixed: A10 (stored data that is not valid JSON is replaced on the next save, silently). It belongs to Day 19, "Design failure states", which lists corrupt local data explicitly.
- Claims in `context/security.md` that were attacked: shown as text and never as HTML (A1, holds); pasted story never stored (checked on Day 8, unchanged). "Browser persistence is for local learning/demo data only" was stressed by the storage-full probe.
- Verified in real Chrome: 12 new checks in `day14.js` (the 11 fixed or holding probes and one for console errors) pass, and the earlier suites still pass: 155 regression + 8 (Day 9) + 18 (Day 11) = 193 of 193 in total.
- Six criteria were added to `intent/current-feature.md`. Files changed: `app/app.js`, `app/logic.js`, `days/day-14.md`, `intent/current-feature.md`, this record.

## Inferred
- The Day 13 feedback message turned a silent data loss into a confident false report (A12). A message that says what happened is only as good as the check behind it; "Updated" was printed without confirming that anything was updated.
- Most of the app's other hostile-input handling holds because it always writes text through `textContent`; that single habit is what A1 depends on.

## Assumed
- The 12 attacks are the ones I thought of. The probes prove these fail or hold, not that nothing else fails.
- Chrome's storage quota (about 5 MB) is representative of other browsers; the quota message logic also handles Firefox's error code, but was only exercised in Chrome.
- The `storage` event fires only for changes from other tabs of the same origin, which is what was needed.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 12 probes and 193 checks.
- [x] Validation rules: hostile input and full storage exercised.
- [ ] Accessibility spot-check: not applicable to this change.

## What failed
- At baseline, 6 of 12 probes. After the fixes, none except the deferred A10.

## What was not checked
- Attacks I did not think of. Safari and Firefox. Two tabs saving in the exact same instant (the last write wins; no merge). A failing `storage` event in a browser with storage blocked. Attacks on the Overview view (read-only).

## What changed in the next intent
- Day 15 reviews the app against its intent in review mode only. Day 19 must handle A10. The Overview and Jira modal are the next places a hostile-input probe should go once they gain more fields.
