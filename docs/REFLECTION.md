# Reflection: what became reusable

**Who wrote this:** Claude, at the end of running Days 9 to 28 of this project on the owner's instruction, using the evidence records as the source. It is a reflection on the work and the method, not the project owner's own. There is a place at the end for the owner's.

## What became reusable
- **The loop itself.** Intent, intent check, refine, build, challenge, verify, evidence, commit. It held up across 28 days and every day file follows it. Its most useful step was refining the intent before building: the original day files had generic, unmeasurable criteria on almost every day.
- **Two skills, packaged.** `skills/intent-check.md` and `skills/evidence-first-review.md`, now with an owner and a version, shown in the app, and kept equal to the app's copy by a test.
- **The audit pattern.** Run a measured audit before changing anything, record the failures, fix only those, run it again (Days 13, 26, and the attack rounds on Days 14 and 27). It found real problems on every use, and its own blind spots twice.
- **Evidence you can re-run.** `evidence/checks/` (Node and Chrome), `evidence/traceability.md`, and a verifier proven to fail when a criterion has no check.
- **Pure logic apart from the page.** `app/logic.js` never touches the page or storage, so the rules (readiness, guardrails, promotion, metrics, onboarding) are testable without a browser being clicked.
- **Decision records and a labelled evidence template.** Every claim in an evidence record is observed, inferred, or assumed. The Day 15 review and the Day 24 count correction show why.

## What I would repeat
- Write the checkable criteria first, then the code.
- Look at screenshots as well as test results. Layout bugs (a cramped row, a wrong-coloured link, an unreadable message) passed the tests three times.
- Keep the boundary and superseded criteria written down; two of the Day 15 findings were documents that had gone stale.

## What I would change
- Write each day file before touching code. On Days 11 and 27 I built first and wrote the day file after, and said so in the record.
- Get an independent reviewer. Every review here, including the release review, was done by the author.
- Test with a person. The first-time-user criterion has only proxies.

## What surprised me
- Tests were wrong about as often as code, and the errors were of the same kinds: a wrong expectation, a shared variable name, a state the test never visited.
- Fixing one rule broke another twice on Day 26 (bigger buttons pushed the Save button off screen; a colour change made the Jira note labels unreadable), and the audit itself missed a wrongly coloured link until it was extended to the empty screens.
- A rule that counts clicks (two uses to promote) was satisfied by one double-click until an attack found it.

## Limits of this reflection
It is written from the evidence records, not from having used the app as a newcomer would. It has no view on whether the method transfers to someone else's project; that is the next thing to try.

## Your notes
(For the project owner: what became reusable for you, and what did not.)
