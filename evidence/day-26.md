# Day 26 Evidence — Polish the product

Structured per `templates/evidence.md`.

## Intent tested
`days/day-26.md` (refined before measuring): audit every view, dialog, and the error banner against the rules in `context/ux-standard.md` and the checkable parts of responsiveness, typography, focus, and labels, run before changing anything, and fix only the failures.

## Observed
- Intent check on `days/day-26.md`: "polish" and "visual consistency" were unmeasurable. I made the audit the ux-standard rules written on Day 9 (one filled button per view, one font family, contrast of at least 4.5:1, a focus outline of at least 2px, buttons at least 40px tall, no horizontal scroll) plus four more that are checkable: every field has an accessible name, heading levels do not skip, no duplicate ids, and (added later, see below) links use one colour.
- The audit is `evidence/checks/day26.js` (also the permanent check). It measures seven views at 375px and 1280px, both Jira dialog steps, the reset confirmation, and the error banner, and horizontal scroll at 320, 375, 768, and 1280px.
- **Baseline before any change: 6 of 9 rules passed and 3 failed.** Focus outlines, field names, heading order, duplicate ids, filled-button count, and horizontal scroll (even at 320px) already held and were left alone. Failures: contrast (the orange "28-DAY BUILD" label and every orange filled button: white on #d9551e is 3.99:1, below the 4.5:1 AA level); button height (the secondary and small buttons were about 30px: Edit, Start from a Jira story, Reset, the capability buttons, and the banner buttons); and one font family (buttons fell back to Arial while everything else is Inter).
- Fixes, all in `app/styles.css`: a rust orange (#b8430f, 5.5:1 with white) for the orange filled buttons and the eyebrow label; `min-height: 40px` and `font-family: inherit` for buttons. No behavior or markup changed.

| Rule | Before | After |
|---|---|---|
| contrast | 20 of 22 places failed | passed (30 places) |
| button height >= 40px | 8 of 22 places failed | passed (30 places) |
| one font family | 8 of 14 places failed | passed (22 places) |
| fields have names | passed (18 places) | passed (26 places) |
| heading levels do not skip | passed (14 places) | passed (14 places) |
| at most one filled button | passed (16 places) | passed (24 places) |
| no duplicate ids | passed (14 places) | passed (14 places) |
| links use the app link colour (#a4400f, navigation excepted) | 2 of 22 places failed (found by looking, then measured after the audit was extended to empty screens) | passed (22 places) |
| focus outline >= 2px | passed (14 places) | passed (14 places) |
| no horizontal scroll | passed (4 places) | passed (4 places) |
- **Fixing one thing broke another, three times, and the audit and measurement caught each:**
  1. Taller buttons pushed the Save intent button below the window: 32px past the fold on a phone (partly because the now-consistent, wider font made the "Start from a Jira story" row wrap onto two lines) and 2px on desktop. That would have broken a rule held since Day 6. Recovered space by keeping that heading row on one line on phones (a smaller heading and button padding there) and trimming the desktop dashboard padding and heading-row margin. Save is now in the window at 375x812 (804 of 812, 8px spare) and 1280x800 (798 of 800, 2px spare).
  2. My colour change targeted the class `.tag`, which the Jira note labels (Uncheckable, Ambiguity, and so on) also use with white-on-dark text; it turned them rust on dark (3.0:1). The audit flagged it and I scoped the change to the eyebrow label only.
  3. Viewing a screenshot showed the "New here? Open Start." link in default browser blue while every other link is rust. Two attempts to add a rule for it passed even without the fix: first because the audit only loaded the sample project (where that link does not appear), then because a rule that links match each other passes when there is only one link. I extended the audit to measure the empty-state screens, and made the rule compare against the app's link colour. It then failed without the fix (2 places) and passed with it.
- Verified in real Chrome: 11 checks in `day26.js` (one per rule, each over many places) pass, and all suites pass: 393 of 393 in total.
- Files changed: `app/styles.css`, `days/day-26.md`, `intent/current-feature.md`, `evidence/checks/day26.js`, this record. `context/ux-standard.md` was not changed.

## Inferred
- An audit only sees the states it visits. Two of the three near-misses above were audit blind spots (which data state, and which comparison), not app defects.
- Meeting the 40px rule and the Save-in-the-first-screen rule together left only 2px of margin on desktop; the next change to that screen will need to re-measure.

## Assumed
- That the WCAG AA contrast ratios and a 40px button height are the right thresholds; they are the ones written into the ux-standard on Day 9.
- That #b8430f is close enough to the original orange to count as the same design.
- That measuring computed styles (colour, size, outline) stands in for how the screens look and feel to a person.

## Deterministic checks
- [x] Syntax / build: no script change; CSS only.
- [x] Functional behavior: 393 of 393 checks.
- [x] Validation rules: contrast, target size, focus, names, headings, ids, links, scroll.
- [x] Accessibility spot-check: measured contrast, focus outlines, field names, heading order (a screen reader was not run).

## What failed
- Three of nine rules failed at baseline, and my fixes then caused two regressions and exposed one audit blind spot; all fixed, with the rule that would have caught the last one shown failing first. Nothing failing at the end.

## What was not checked
- A 320px-wide phone: nothing scrolls sideways, but the Save button is below the first screen there (and has always been; the rule is pinned to 375x812). Contrast of disabled or hover states (none exist). Text over images (none). Firefox and Safari rendering. Any person's judgement of how the screens look.

## What changed in the next intent
- Day 27 is the final adversarial review from a skeptical principal engineer's viewpoint: unsupported claims, confusing flows, broken criteria. The Save-in-the-first-screen margin (2px on desktop) is a known fragile spot.
