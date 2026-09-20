# Day 15 Evidence — Fresh-session review

Structured per `templates/evidence.md`.

## Intent tested
`days/day-15.md` (refined): review the app against the active intent using `skills/evidence-first-review.md`, in review mode only.

## Observed
- The review is `reviews/day-15-review.md`. It marks all 13 criteria of the active intent (12 met, 1 unmet in a narrow case) and 53 archived criteria (3 re-run and met, 2 unmet, 48 untested by the reviewer), and lists 7 findings: 3 medium, 3 low, 1 informational.
- **Independence was not achieved.** The review was done in the same session by the same author. A separate session was not available and I did not spawn an agent. To reduce shared assumptions I read the criteria first, wrote a new check script from their text alone (`review15.js`, 18 checks) with different inputs and methods from the builder's tests, and confirmed claims with `git` and `grep`.
- Review script results: 16 of 18 passed. The two failures were real findings: the reset confirmation says "added" (not "replaced") for an empty store (F4), and the archived navigation criterion is stale (F1).
- Findings: F1 the active intent says all archived criteria still hold, but the archived navigation criterion and the non-goal "any view beyond Intents, References, and About" are false now that Overview exists; F2 verification is not reproducible from the repository (no test file is tracked); F3 no instruction serves `app/`, so project criterion 1 is still unmet; F4 the empty-store reset wording; F5 `docs/decisions/` is outside the stated boundary; F6 corrupt-data handling is still open (Day 19); F7 Day 10's evidence overstates the archived criteria count (about 90 versus 53).
- The review changed nothing under review. After writing it, `git status` showed only `days/day-15.md` (modified) and `reviews/day-15-review.md` (new), and `git diff HEAD --stat -- app context intent skills` was empty.
- The fixes for F1, F2, F4, F5 and F7 are scheduled for Day 16 onward; F3 for Day 28; F6 for Day 19.
- Files changed: `days/day-15.md`, `reviews/day-15-review.md`, this record.

## Inferred
- A review by the builder finds documentation-and-process defects (stale criteria, unreproducible evidence, wrong count) more readily than code defects: 5 of 7 findings are about the paperwork, and the code passed 16 of 18 new independent checks.
- Because the builder's own tests passed and independent tests written from the criteria also passed, the model criteria are unlikely to be wrong in ways the builder's tests share, though that cannot be ruled out.

## Assumed
- That 13 criteria in the active intent are the whole of what "active intent" means here; the archive's 53 are treated as background.
- That severity ratings are mine: F1 to F3 are "medium" because they make the repository misdescribe or under-support its own claims.

## Deterministic checks
- [x] Syntax / build: no code changed.
- [x] Functional behavior: 18 independent checks (16 pass, 2 are findings).
- [x] Validation rules: the statuses follow `skills/evidence-first-review.md` (met / unmet / untested).
- [ ] Accessibility spot-check: not covered by this review.

## What failed
- Two independent checks failed; both are recorded as findings, not fixed in review mode.

## What was not checked
- A truly independent session; the 48 archived criteria; other browsers; users; screen readers. The review script is not in the repository (F2).

## What changed in the next intent
- Day 16 should start by fixing the paperwork findings F1, F2, F4, F5, F7 before adding features. Day 28 must fix F3.
