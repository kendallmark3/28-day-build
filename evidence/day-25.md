# Day 25 Evidence — Onboard a new user

Structured per `templates/evidence.md`.

## Intent tested
`days/day-25.md` (refined before building): add a guided Start view that teaches the method without external explanation: the loop and rule in plain words, six steps that tick themselves off from the user's own data, and a sample project with a tour computed from the sample data.

## Observed
- Also on this commit: the Day 24 evidence record was corrected (the total is 364 checks, not 365; the Day 24 commit message keeps the wrong number because pushed history is not rewritten).
- Intent check on `days/day-25.md`: "guided", "sample project", and "teaches the method without external explanation" were untestable as written. I decided: the six steps are the loop as the app supports it (write an intent; check it is ready; record labelled evidence; review the result; set the stakes; keep what you repeat); a step is done only when the stored data says so, never from a click on Start; every step states why in one sentence, what to do, and where; the sample tour is computed from the sample data; the test for "without external explanation" is that a person who follows only the Start view's links and instructions can reach 6 of 6.
- Built: pure `onboardingSteps(state)` and `sampleTour()` in `app/logic.js`; a Start view, first in the navigation, with the rule ("Prompt to explore. Write intent to repeat." from `README.md`), the loop (from `START-HERE.md`), a summary ("N of 6 steps done. Next: ..." with a link), the six step cards (title, To do or Done badge, why, what to do, a link), the sample tour, and a Load the sample project button that opens the existing reset confirmation. The empty dashboard's next step now ends with a link, "New here? Open Start.". The default view stays Intents.
- The sample tour reads: "...: ready, 100%. Medium consequence, all minimums met.", "...: ready, 100%. Low consequence, 1 minimum open.", "...: not ready, 38%. No consequence set. 4 required items to fix.". The Review view shows the same numbers for the same intents.
- **A regression found by measuring, not by the suite:** seven navigation items no longer fit on one row beside the title on a 1280px desktop, so the navigation wrapped and pushed the Save button 9px below the window at 1280x800, breaking a rule that had held since Day 6. Tightening the desktop navigation padding put it back on one row (Save at 791 of 800). On a 375x812 phone the navigation takes two rows and Save is at 793 of 812. At 320x568 (a smaller phone than the rule covers) Save is below the fold and has always been.
- Verified in real Chrome: 18 new checks pass in `day25.js`, and all suites pass: 382 of 382. They cover the pure functions (the exact done pattern for each condition alone: empty 000000, an incomplete intent 100000, a ready intent 110000, evidence, a review, a consequence level, a successful use, an unsuccessful use counting for nothing, the sample 111111; the tour's three lines); the navigation order and the default view; the dashboard link; the view's rule, loop, six steps, links, and summary; exactly one filled button; loading the sample project through the confirmation, all six steps Done, and the tour equal to what the Review view shows; keyboard operation of the Load button; Save inside the window with seven navigation items at both sizes; and no horizontal scroll at 375px.
- **The journey test:** starting from an empty project and using only the Start view's links and instructions, the summary went "0 of 6" then "2 of 6" (writing the example intent also made it ready, so two steps completed at once), "3 of 6", "4 of 6", "5 of 6", and "All 6 steps done."
- A screenshot of the Start view at 1280px was viewed.
- Files changed: `app/logic.js`, `app/app.js`, `app/index.html`, `app/styles.css`, `context/architecture.md`, `days/day-25.md`, `intent/current-feature.md`, `evidence/day-24.md` (the correction), `evidence/checks/day25.js` and `regression.js`, this record.

## Inferred
- A scripted walk-through proves the path exists, not that a first-time user finds it. It replaces my guess that the steps are followable with a check that they are, but only a real newcomer can say whether they are understandable.
- Because "ready" is judged from the intent's own text, completing step 1 with the example intent completes step 2 as well, which may make the sequence feel less like separate lessons.

## Assumed
- That six steps are the right onboarding for this loop, and that the order (intent, ready, evidence, review, stakes, capability) is the best teaching order.
- That leaving the default view as Intents (with a link to Start) is better than forcing Start on first visit; I did not test the alternative.
- That the sample project's data is good enough to teach from: it is the data the earlier days created.

## Deterministic checks
- [x] Syntax / build: `node --check` passes for both files.
- [x] Functional behavior: 18 new checks; 382 in total.
- [x] Validation rules: each step's done rule tested alone, including a case that must not count.
- [ ] Accessibility spot-check: keyboard operation of the button and outlines checked; reading order for a screen reader not tested.

## What failed
- One layout regression (desktop navigation wrapping) found by measuring before the tests and fixed. Nothing failing at the end.

## What was not checked
- A real first-time user. The 320px-wide phone. Firefox and Safari. Whether landing on Intents rather than Start loses newcomers.

## What changed in the next intent
- Day 26 polishes: the ux-standard rules across every view (contrast, tap-target sizes of at least 40px, one font family, focus outlines of at least 2px), the 320px phone, and the three-row navigation on very narrow screens.
