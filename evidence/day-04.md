# Day 04 Evidence — Set boundaries

Structured per `templates/evidence.md`.

## Intent tested
`days/day-04.md` (refined): add explicit non-goals and file/scope boundaries to `intent/current-feature.md`. No application code changes.

## Observed
- The intent check on `days/day-04.md` found: the boundaries had no named location; "a constrained feature intent" had no test for "constrained"; criteria 1 and 2 assumed an app change. I edited the Intent, Outputs, and criteria.
- Before, the Constraints of `intent/current-feature.md` had no file boundary, and its only non-goal wording was: "Tracks intents only. No evidence attachment, readiness check, or capability promotion".
- After, that bullet was replaced by two:
  - "May create or modify only `app/index.html`, `app/app.js`, `app/styles.css`, and the evidence record for the build. All other files are off-limits, including `days/`, `context/`, `skills/`, `templates/`, `starter/`, `reference-final/`, and `book/`"
  - "Non-goals: editing or deleting saved intents, search, export or import, evidence attachment, readiness check, capability promotion, accounts or sync, AI calls, additional pages or routes"
- The non-goals list went from 3 items to 9. The 6 new ones: editing or deleting (previously only named in the Stop-when line), search, export or import, accounts or sync, AI calls, additional pages or routes.
- The Stop-when line of `current-feature.md` still says "Do not add editing, deletion, search, or export until a later intent asks for them". That now duplicates the non-goals bullet. I left it for Day 5, which rewrites that section.
- No files under `app/`, `starter/`, or `reference-final/` changed.

## Inferred
- A reviewer can test the file boundary against a list of changed files, and the non-goals against the app's visible features. This is a reading of the wording; no build has been diffed yet.
- "AI calls" is redundant with the existing constraint "no AI API calls from the browser". I kept it in the non-goals so the list is complete on its own.

## Assumed
- The build will create exactly three app files. A bundled asset, such as a favicon, would break the boundary and need an intent edit first.
- Editing the evidence record is the only allowed change outside `app/`. I did not check whether a build day also needs to touch `intent/current-feature.md`.
- Which non-goals belong is my judgment. Please strike or add any.

## Deterministic checks
- [x] Syntax / build — valid Markdown; no build step.
- [x] Functional behavior — no app code changed; `starter/` still serves unchanged.
- [ ] Validation rules — not applicable.
- [ ] Accessibility spot-check — not applicable; no UI changed.

## What failed
Nothing failed.

## What was not checked
- The boundary against a real diff. There is no build yet, and the repo has no git history to diff against.
- Whether a teammate reads the two bullets the same way I do.

## What changed in the next intent
Day 5 rewrites the Stop-when section of `current-feature.md`. It should also drop the duplicated "Do not add editing, deletion, search, or export" sentence, since the non-goals bullet covers it.
