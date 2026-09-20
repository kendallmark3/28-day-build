# Day 09 Evidence — Improve context quality

Structured per `templates/evidence.md`.

## Intent tested
`days/day-09.md` (refined): make `context/` smaller and more useful by removing or merging lines that duplicate another line or constrain no decision, turn the vague `ux-standard.md` lines into checks, and add one worked example of an excellent intent.

## Observed
- This day was run out of sequence, after Days 12 and 13, at the user's request to finish the plan. Day 10 and 11 follow.
- Intent check on `days/day-09.md`: "irrelevant" and "excellent" were undefined; "smaller" had no measure; the example was not tied to anything checkable; `ux-standard.md` still held the vague lines flagged on Day 3 ("Clear, quiet, professional interface", "Mobile layout must remain usable"). I set the rule for removal (a line goes only if it duplicates another line or constrains no decision the app or an intent makes), measured "smaller" in lines, and required the example to equal the app's first sample intent.
- Before: 6 context files, 97 lines, 951 words. After: the same 6 files have 94 lines and 1,022 words, plus one new file (`example-intent.md`, 33 lines).
- Removed or merged in `non-goals.md` (11 lines to 8): three separate "not a chat clone / agent platform / workflow engine" lines merged into one (they constrained no decision the app or an intent makes, and none was referenced anywhere in `app/` or the intent); "does not store credentials" dropped because `security.md` already says it; "should demonstrate the method before adding platform complexity" dropped because `architecture.md` states the same rule.
- Rewritten in `ux-standard.md`: six rules, each naming something checkable (one filled button per view, contrast of at least 4.5:1, a status message after each change, a link to the next action, a 2px focus outline, no horizontal scroll at 375px, buttons of at least 40px). It rose from 46 to 137 words, which is why words went up overall.
- Added `context/example-intent.md`: the app's Jira example as a complete intent, with a "Why this works" line per part. The References view now lists it (seven context files).
- Verified in real Chrome plus the files on disk: 8 new checks pass (no vague words in `ux-standard.md`; six checkable rules; the example's six parts equal the app's first sample intent, as a drift guard; a "Why this works" line for each part; fewer lines than before; removed lines are gone; the References view lists the example) and the earlier suite passes (154 of 155 before the push; the one failure was the new file's GitHub link returning 404, because the file was not yet pushed. It is re-checked after the push).
- Files changed: `context/non-goals.md`, `context/ux-standard.md`, `context/example-intent.md` (new), `app/index.html`, `days/day-09.md`, `intent/current-feature.md`, this record. `business-rules.md` was not touched.

## Inferred
- The `ux-standard.md` rules describe checks that the app does not yet all pass (for example buttons at least 40px tall). Day 26 is where they are enforced.
- Duplicating the example in the app's sample data and in `context/` is acceptable because a test fails if they drift.

## Assumed
- "Smaller" is best measured in lines: words rose. Someone else could reasonably measure it differently.
- The removed non-goals were not needed by any later day; I did not read Days 14-28 for references to them before removing them.
- The 40px button size and 4.5:1 contrast are chosen thresholds (the contrast one is the WCAG AA level); nothing in the repo specifies them.

## Deterministic checks
- [x] Syntax / build: no build step.
- [x] Functional behavior: 8 new checks, per Observed.
- [x] Validation rules: the example equals the sample intent.
- [ ] Accessibility spot-check: not applicable to this change.

## What failed
- Nothing failed in the final run. The one pre-push failure (a link to an unpushed file) is expected and re-checked after the push.

## What was not checked
- Whether a person finds the example helpful. Whether the three merged non-goals were referenced from outside this repository.

## What changed in the next intent
- Day 10 inspects the app and picks the single most valuable deficiency; Day 11 is expected to follow from it. The `ux-standard.md` rules will be enforced on Day 26.
