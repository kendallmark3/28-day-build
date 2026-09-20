# Day 24 Evidence — Add useful metrics

> Correction (Day 25): this record and its commit message first said 365 checks; the correct total is 364.

Structured per `templates/evidence.md`.

## Intent tested
`days/day-24.md` (refined before building): show four outcome metrics on the Overview view (intents ready, reviews completed, capabilities promoted, 28-day progress) from the stored data, with a 28-day progress list the user can tick, and state what is deliberately not measured.

## Observed
- Intent check on `days/day-24.md`: "useful" and "vanity usage metrics" were undefined, and "28-day progress" had no source. I decided: exactly the four named metrics; each is an outcome that changes what the user does next (ready means it can be built, a review is a result checked against its intent, promoted means reused successfully, progress is finished days); nothing counts page views, clicks, time spent, or saves, and the panel says so; progress is the user's own journal of ticked days (the app never ticks one).
- Built: a pure `metrics(state)` in `app/logic.js`; an Outcomes panel at the top of the Overview (a number, a label, and a why line each, plus the not-measured note); a 28-day list of 28 labelled checkboxes with the titles from `ROADMAP.md`, each change saved and announced; and `#progress` support in the router, so the flow's Build stage now links to the list and opening that address shows the Overview scrolled to it.
- Values for the sample data: 2 of 3 ready, 1 review, 1 of 2 promoted, 8 of 28 days. They equal the Overview flow and the stored records, and change without a reload after a save (3 of 4 ready), a recorded review (2 reviews), a promotion (2 of 2 promoted), and a ticked day (9 of 28).
- Verified in real Chrome: 16 new checks pass in `day24.js`, the Day 20 checks were updated for the Build link, and all suites pass: 364 of 364. They cover the pure function (order, an empty project, the sample data, frozen input); the panel's order, numbers, why lines, and not-measured note; agreement with the flow and the stored data; the live updates; 28 checkboxes labelled with titles equal to the ROADMAP.md focus column (parsed from the file, as a drift guard), days 1 to 8 ticked; ticking and unticking with their messages, storage, and reload; both routes to `#progress`; a keyboard tick with a visible outline; no filled button; no horizontal scroll at 375px with each day row at least 40px tall; and a source scan that finds no page-view, analytics, timer, or click-counter code.
- Three failures on the first run were all test mistakes and are fixed: a pattern that matched the word "analytics" in the sample intent's own text ("analytics database"); a checkbox focused by script right after a mouse click, which browsers do not show a focus ring for (fixed by pressing a key first, as a keyboard user would); and a click on a button hidden by the current view.
- A screenshot of the Overview at 1280px was viewed.
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `days/day-24.md`, `intent/current-feature.md`, `evidence/checks/day24.js` and `day20.js`, this record.

## Inferred
- A count of ticked days is the one metric here that the user, not the data, decides; it can be ticked without doing the day. It is a journal, not a measurement.
- "Intents ready" inherits the readiness check's limits: it says an intent is well-formed, not that it is a good idea.

## Assumed
- That these four are the useful ones. They are the four the day names, defended by a why line each.
- That stating what is not measured is a sufficient guard against vanity metrics.
- That a sample of days 1 to 8 ticked is a reasonable starting picture for someone exploring the sample project.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 16 new checks; 364 in total.
- [x] Validation rules: the roadmap titles compared with the app's; a source scan for activity counters.
- [ ] Accessibility spot-check: checkbox labels, keyboard toggling, and outlines checked; screen-reader announcement of the progress message not tested.

## What failed
- Three test mistakes on the first run, all corrected. Nothing failing at the end.

## What was not checked
- A very large number of intents (the ready count re-runs the readiness check on every render, which was not timed at scale beyond Day 14's 2,000-intent probe). Browsers where a checkbox's focus ring differs.

## What changed in the next intent
- Day 25 adds the guided Start view. Day 26 polishes: the ux-standard rules (contrast, tap targets, focus, one font family) still need to be checked across every view, and the phone nav now wraps to three rows.
