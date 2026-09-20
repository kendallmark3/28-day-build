# Day 10 Evidence — Use progressive intent

Structured per `templates/evidence.md`.

## Intent tested
`days/day-10.md` (refined): inspect the app against the project's success criteria, name the single most valuable deficiency from that evidence, and write the next intent from it.

## Observed
- Run out of sequence (after Days 12 and 13) at the user's request to finish the plan.
- Intent check on `days/day-10.md`: "the single most valuable deficiency" had no ranking rule; nothing said what "inspect" covers or where the next intent goes; the criteria were the generic ones. I set the inspection to the six project success criteria, required a decision record with alternatives, and made the day change no application code.
- The inspection (below) marks each of the six criteria met, unmet, or untested, with evidence.

| # | Project success criterion | Status | Evidence |
|---|---|---|---|
| 1 | A new user can run the application locally in under 3 minutes | **Unmet** (documentation) | The app starts in about 160 ms (188, 158, 157, 159, 158 over five cold starts). But no instruction or run script serves `app/`: `README.md` says `cd starter` or `cd reference-final`, and `run-starter.sh` / `run-final.sh` serve those. `app/README.md` still says to copy `starter/` in |
| 2 | The user can create and edit an intent with the six parts | **Met** | 155 automated checks including create, edit in place, Cancel, persistence, validation (`evidence/build-tracker.md`, `evidence/day-12.md`) |
| 3 | The user can attach evidence and distinguish observed, inferred, and assumed claims | **Unmet** | The app has no evidence records. Stored data holds only intents |
| 4 | The user can perform a readiness check before trusting a result | **Unmet** (partly addressed) | The Jira modal checks a *story* before it becomes an intent, and the dashboard counts saved intents missing a constraint or stop condition. There is no check of a saved intent |
| 5 | The user can identify repeated work worth promoting to a reusable capability | **Unmet** | No capability records, no use counts, no promotion rule in the app. The rule ("after at least 2 recorded successful uses") is written in `project-intent.md` only |
| 6 | The product remains understandable to a first-time user (creating an intent without opening source or asking for help) | **Untested** | No person has tried it. Proxies exist: sample text so the first Save works, the audit of next actions (`evidence/day-13.md`) |
- Ranked deficiencies: (1) no model for evidence, reviews, or capabilities, which blocks criteria 3, 4 and 5; (2) no way to run `app/` from the instructions, criterion 1; (3) no first-time-user test, criterion 6. The first moves three criteria, so it is the single deficiency chosen. Recorded in `docs/decisions/0001-model-the-domain-next.md`.
- The accumulated tracker intent (Days 2-13, about 90 criteria) was copied unchanged into `intent/archive/intent-tracker.md` with a note that it is superseded but still holds; the regression suite keeps checking it. `intent/current-feature.md` was replaced with a new intent, "Evidence and capability model", with 7 success criteria, a stop condition, and boundaries that add `app/logic.js`.
- No application code changed. The app's regression suite still passes (155 of 155 checks, run after Day 9).

## Inferred
- The run-instructions gap is easy to fix and matters to a real newcomer, but it moves one criterion; the model moves three. The ranking is judgment, but it is shown.
- Archiving the old intent, not deleting it, keeps the evidence records' references to it meaningful.

## Assumed
- That criteria 3, 4 and 5 are correctly judged "unmet" and not "partly met": criterion 4 is arguably partly met by the Jira modal and the dashboard count, and I marked it unmet because it asks for a check of a saved result.
- The cold-start timing (about 160 ms) says nothing about a real newcomer's first three minutes, which depend on installing Python and finding the command.
- That deferring the run instructions until Day 28 is acceptable.

## Deterministic checks
- [x] Syntax / build: no build step; no code changed.
- [x] Functional behavior: no code changed; regression suite unaffected.
- [ ] Validation rules: not applicable.
- [ ] Accessibility spot-check: not applicable.

## What failed
- Nothing failed.

## What was not checked
- Criterion 6 with a person. Criterion 1 with a real newcomer. Whether other deficiencies exist that this six-criterion inspection cannot see (it inspects against the stated criteria only).

## What changed in the next intent
- The next intent is the data model for evidence, reviews, and capabilities. Day 11 builds it. Day 28's release must include run instructions for `app/`.
