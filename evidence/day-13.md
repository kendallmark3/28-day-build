# Day 13 Evidence — Improve usability

Structured per `templates/evidence.md`.

## Intent tested
`days/day-13.md` (refined): audit every view and user action in the app against three checkable rules (navigation, empty states, next actions) and fix only the failures the audit finds.

## Observed
- Days 9, 10, and 11 are still skipped (see `evidence/day-12.md`). This day did not depend on them; the vague lines in `context/ux-standard.md` were not used, only its rules that can be checked.
- Intent check on `days/day-13.md` found: navigation and empty states already existed, so "add" was wrong for most of the day; "obvious" and "without explanation" were unmeasurable; there was no list of views or states; "visibly improved" and the stop condition were unchecked. I rewrote the day as an audit with three rules and added 5 criteria to `intent/current-feature.md`.
- **The audit was run before any code changed.** It drives the app in real Chrome through every view, empty state, and action and records pass or fail: 21 rows, **11 passed and 10 failed**.
  - Navigation (6 of 6) and empty states (4 of 4) already passed. They were reported as met and not rebuilt.
  - All 10 failures were under "next actions": neither the References nor the About view ended with a link to Intents; Save, Update (at both sizes), Cancel edit, Use in form, and Download gave no message naming what happened. Reset already passed.
  - Two failures were worse than a missing message. After "Use in form" the Save button was at y=863 in an 800px window, below the fold, so the next action was off screen. After an Update on a phone (page scrolled deep in the list) no live region was in the window at all.
- Fixes, in `app/index.html`, `app/app.js` (about 25 lines), `app/styles.css`:
  - A status line under the dashboard (`role="status"`, polite) that reads "Saved: <outcome> (N saved).", "Updated: <outcome>.", "Edit cancelled. Nothing was changed.", or "Story loaded into the form. Review it, then choose Save intent.". Long outcomes are shortened to 60 characters.
  - It is scrolled into view when set, with a 12px margin, so it is visible even when the page was scrolled. After "Use in form" the Save button is also scrolled into view.
  - It clears when the user types in the form or starts an edit.
  - A polite status line in the Jira modal after a download: "Downloaded <file>. To keep it in this app too, choose "Use in form".".
  - A link to Intents at the end of the References view ("Done reading? Go back to Intents.") and the About view ("Ready to try it? Write your first intent.").
- The audit was re-run three times after the fixes. The first re-run had 2 failures (Update at 375px, Cancel edit): the message was in the window but flush against the top edge, and by fractional pixels not inside it. I added a 12px scroll margin instead of loosening the check. The next run and a final run on the finished code both gave **21 of 21**.

| Rule | View, state, or action | Before | After |
|---|---|---|---|
| Navigation | from intents to references | PASS | PASS |
| Navigation | from intents to about | PASS | PASS |
| Navigation | from references to intents | PASS | PASS |
| Navigation | from references to about | PASS | PASS |
| Navigation | from about to intents | PASS | PASS |
| Navigation | from about to references | PASS | PASS |
| Empty states | Saved intents, no intents | PASS | PASS |
| Empty states | Dashboard, no intents | PASS | PASS |
| Empty states | Jira "What didn't fit", nothing left over | PASS | PASS |
| Empty states | Jira modal, nothing pasted | PASS | PASS |
| Next actions | references view content links to Intents | FAIL | PASS |
| Next actions | about view content links to Intents | FAIL | PASS |
| Next actions | Save (create) (1280x800) | FAIL | PASS |
| Next actions | Update (edit) (1280x800) | FAIL | PASS |
| Next actions | Save (create) (375x812) | FAIL | PASS |
| Next actions | Update (edit) (375x812) | FAIL | PASS |
| Next actions | Cancel edit (1280x800) | FAIL | PASS |
| Next actions | Use in form (1280x800) | FAIL | PASS |
| Next actions | After "Use in form", the Save button is in the window | FAIL | PASS |
| Next actions | Download (in the modal) | FAIL | PASS |
| Next actions | Reset to sample data (1280x800) | PASS | PASS |

- Verified in real Chrome: 155 checks, 155 passed (14 new; all 141 earlier checks re-run). The new checks cover each message's exact wording, that it is in a polite status region and inside the window with 8px or more above it at both sizes (also when the page was scrolled to the bottom), that Save and the message are both in the window after "Use in form", that typing or starting an edit clears it, that a 200-character outcome is shortened, the download message and that it clears when the modal changes step, and that both links to Intents work.
- **The tests found a real bug in my own fix.** At 375px a long unbroken outcome made the status line overflow and the page scroll sideways (545px in a 375px window). Fixed with `overflow-wrap:anywhere`. Two older link checks also failed because they counted every link on the References view; I narrowed them to external links, since the new link is internal.
- A screenshot of the page after "Use in form" was viewed: the green message, the filled form, and the Save button are all in the window.
- Files changed: `app/index.html`, `app/app.js`, `app/styles.css`, `days/day-13.md`, `intent/current-feature.md`, this record.

## Inferred
- Putting the message under the dashboard, not beside the Save button, is what keeps it visible after "Use in form", because that action makes the form taller and pushes Save down. The 12px scroll margin exists for the same reason.
- The dashboard's numbers changing was not feedback in the sense of the rule: they are a summary, not a statement of what just happened. That is why every Save and Update row failed at baseline even though a live region was in the window.

## Assumed
- "Visible in the window without scrolling" is the right test for "obvious". It is a proxy: a message can be visible and still be missed.
- One line of text ("Saved: ... (N saved).") is enough confirmation. There is no undo.
- Links at the end of the References and About views are a sufficient "next action" for those views. The nav is always visible, but it names places, not an action.
- The audit's regular expression for a message naming an action ("Saved", "Updated", "Downloaded", "Reset", "Cancelled", "loaded into") is complete for the actions that exist today.

## Deterministic checks
- [x] Syntax / build — no build step; `node --check app/app.js` passes; no console errors in the run.
- [x] Functional behavior — 155 of 155 checks, and 21 of 21 audit rows.
- [x] Validation rules — long outcomes, a scrolled page, and both viewport sizes were exercised.
- [ ] Accessibility spot-check — partial. Polite status regions and visible focus were checked; whether screen readers announce the messages was not tested.

## What failed
- At baseline: 10 of 21 audit rows (see the table).
- After the first fix: 2 rows, because of a flush-to-the-edge message; fixed.
- A horizontal-scroll bug in the new status line at 375px; fixed.
- Nothing is currently failing.

## What was not checked
- Whether a first-time user understands the app "without explanation". The audit measures proxies (messages and links present, in the window), not comprehension.
- Screen-reader announcements; Firefox and Safari; a real phone.
- The window sizes between 375px and 1280px, and shorter windows than 800px, where the Save button could still fall below the fold.
- Whether the message is noticed if the user is looking at the list, not the form.

## What changed in the next intent
- Observed, not fixed (outside the three rules): after "Use in form" or when starting an edit, the Outcome field shows the end of a long outcome and hides its start, because the browser puts the cursor at the end. Putting the cursor at the start would help review.
- Not built, per the stop rule: an undo for Save; a "Saved" highlight on the new list item; scrolling the list to the new item.
- Days 9–11 remain open.
