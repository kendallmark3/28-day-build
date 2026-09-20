# Day 07 Evidence — Ship the first slice

Structured per `templates/evidence.md`.

## Intent tested
`days/day-07.md` (refined): add a dashboard to the top of the Intents view of the tracker in `app/`, showing how many saved intents there are, how many lack a constraint or a stop condition, and the next step, with all existing tracker behavior unchanged and the Save button still on screen at load.

## Observed
- Day 7 as first written asked for "a clean first screen with a dashboard, one intent card, and a clear action to create an intent". Before this day, the tracker (form, list, edit, Jira modal, navigation) had already been built out of sequence (`evidence/build-tracker.md`). I rescoped Day 7 to the dashboard while fixing Day 6 (`evidence/day-06.md`, follow-up). There was no dashboard in the app when this day started (`grep` for it in `app/` found nothing).
- Intent check on `days/day-07.md` found: "dashboard" and "the state of the user's intents" were undefined; the active intent was not a listed input; no rule said the phone-screen Save-button check still applied; "visibly improved" could not be checked; the stop condition was circular. I rewrote the Intent, Inputs, Outputs, Constraints, Success criteria, and Stop when.
- Built: a dashboard section in `app/index.html` (two counts and a next-step line), a pure function `dashboardState(intents)` and a small `renderDashboard` in `app/app.js`, styles in `app/styles.css`. Three criteria were added to `intent/current-feature.md` before the code.
- What it shows:
  - "Intents saved": the number of saved intents.
  - "Missing a constraint or stop condition": the number of saved intents whose constraints or stop condition is empty or only whitespace (business rule 3).
  - A next-step line: with no intents, "save the example below, or start from a Jira story"; with gaps, "edit the N intent(s) missing a constraint or stop condition"; otherwise "write your next intent, or start from a Jira story".
- Verified in real Chrome: 101 checks, 101 passed (15 new, plus all 86 from Days 1–6 and the Jira modal). The new checks:
  - Labels are exactly "Intents saved" and "Missing a constraint or stop condition"; the dashboard is a polite live region named "Dashboard".
  - Empty store: 0 and 0, with the save-the-example message.
  - After saving the complete example: 1 saved, 0 missing.
  - An intent with no constraints and no stop: 2 saved, 1 missing. An intent with only one of the two, and one with whitespace-only constraints, also count as missing (4 saved / 3 missing, then 5 / 4). The wording switches to plural.
  - Editing an intent to add both parts lowered the missing count (5 saved, 3 missing). Numbers and message were identical after a reload.
  - After completing every intent: 0 missing and the next step reads "write your next intent".
  - The dashboard is not shown on the References or About views.
  - `dashboardState` gives the same output for the same input, does not change its input, and handles empty and missing fields.
  - The dashboard is fully inside the window at load, and the Save button is too, at both sizes.
- Layout: the dashboard is 70px tall on desktop and 104px on a phone. On the first attempt Save moved 1px below the fold on desktop (801 of 800) and 128px below on a phone (940 of 812). Fixes, all in `app/styles.css`: a tighter dashboard on desktop; on screens 600px wide or less, smaller header, page, panel, and field padding and smaller dashboard text. Result: Save bottom edge at 791 of 800 (desktop) and 765 of 812 (phone). A first attempt hid the tagline and the "28-DAY BUILD" label on phones. Because that turned out to be more than needed, I removed that, so the phone header is unchanged in content.
- Screenshots at 1280px and 375px were viewed.
- Files changed: `app/index.html`, `app/app.js`, `app/styles.css`, `days/day-07.md`, `intent/current-feature.md`, this record. `starter/` and `reference-final/` are unchanged.

## Inferred
- Counting "missing a constraint or stop condition" is a fair proxy for "not ready" because rule 3 says an intent needs both before it is ready. It is narrower than readiness: an intent can pass this count and still have unchecked criteria. The Day 17 readiness score would replace it.
- Keeping the dashboard in `dashboardState` (pure) and `renderDashboard` (DOM) means Day 17 can change the rule without touching the page markup.

## Assumed
- Two counts and one sentence is enough for "the state of the user's intents" on a first slice. Nothing in the repo defines a dashboard, and `reference-final/` was deliberately not consulted.
- "Missing" should include intents whose constraint or stop is only whitespace.
- The example intent (which has both parts) is the right thing to point a new user at.
- Shrinking padding on phones is acceptable. The fields are still readable in the screenshot, but I did not measure tap-target sizes.

## Deterministic checks
- [x] Syntax / build — no build step; `node --check app/app.js` passes; no console errors in the run.
- [x] Functional behavior — 101 of 101 checks, per Observed.
- [x] Validation rules — whitespace-only constraints and stop counted as missing.
- [ ] Accessibility spot-check — partial. The dashboard has a label and a polite live region; screen-reader announcements were not tested, and phone tap-target sizes were not measured.

## What failed
- First build: Save was off screen by 1px (desktop) and 128px (phone). Fixed with spacing changes; see Observed.
- Nothing is currently failing.

## What was not checked
- Whether a person understands what "Missing a constraint or stop condition" means, or what to do about it. The next-step line says to edit those intents but does not point to which ones.
- Firefox, Safari, a real phone, and screen-reader announcements when the counts change.
- How the dashboard looks with a very large number of intents (the list grows; the dashboard does not).
- The "one intent card" that Day 7 originally listed. It was replaced by the saved-intents list; I did not build a separate card.

## What changed in the next intent
- Day 8 ("Map context") is next. The References view and the dashboard are places where it could "point to context rather than burying it".
- Ideas not built, per the stop rule: marking which intents are missing parts in the list itself; a link from the dashboard's next-step line to the first incomplete intent; a readiness score (Day 17).
