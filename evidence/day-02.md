# Day 02 Evidence — Convert prompt to intent

Structured per `templates/evidence.md`.

## Intent tested
`days/day-02.md` (refined): convert the prompt "build an intent tracker" into a written six-part intent, saved as `intent/current-feature.md`. No application code changes.

## Observed
- Original prompt: "build an intent tracker".
- Resulting intent (from `intent/current-feature.md`), Intent line: "A user can record an intent in the six-part structure (outcome, inputs, outputs, constraints, success criteria, stop condition), see it listed, and find it again after reloading the page, so that work starts from a written boundary instead of a chat prompt."
- `intent/current-feature.md` was replaced, not appended. It previously held the Day 01 intent.
- The file has all six sections, each non-empty: Intent, Inputs, Outputs, Constraints, Success criteria, Stop when. It has six constraints and one stop condition.
- The intent check on `days/day-02.md` found the original had no output path, and its two app-oriented criteria contradicted its document-only title. I edited `days/day-02.md` before writing the feature intent: the Intent line, the Outputs, and the first two success criteria.
- No files under `starter/`, `app/`, or `reference-final/` were modified.

## Inferred
- "Tracker" was ambiguous. I read it as create, list, and persist intents, and put edit, delete, search, export, evidence attachment, readiness check, and capability promotion out of scope. The scope is narrower than `intent/project-intent.md`'s success criteria, which say users can "create and edit" intents; edit is deferred to a later day.
- The seven success criteria are pass/fail from the running app or the browser, so each can be judged without asking the author. This is my reading of the wording, not a tested claim.
- The constraints follow `context/` (local-first storage, no API keys, UX standard) without adding new rules.

## Assumed
- A form with six fields is the right first shape for "tracker". Nothing in the repo confirms this. A single free-text box is an alternative.
- Later days will cover editing and the other deferred items. I did not check `days/day-03.md` onward.
- A teammate can understand the intent without the chat. This was not tested with a person.

## Deterministic checks
- [x] Syntax / build — valid Markdown; this repo has no build step.
- [x] Functional behavior — no app code changed; `starter/` still serves unchanged.
- [ ] Validation rules — not applicable; the intent describes validation but nothing is built.
- [ ] Accessibility spot-check — not applicable; no UI changed.

## What failed
Nothing failed. None of the intent's success criteria have been exercised, because no feature was built on this day.

## What was not checked
- Whether the seven success criteria hold in a running app. That belongs to the day that builds the tracker.
- Whether a stranger can follow `intent/current-feature.md` without the chat.
- Whether `days/day-03.md` onward already assumes a different scope for the tracker.

## Follow-up after the record was first written
- Observed: I read `days/day-03.md` to `day-09.md`. Days 3–6 refine the intent (checkable criteria, boundaries, stop condition, intent check). Day 7 is the first build, scoped as "a dashboard, one intent card, and a clear action to create an intent". That is smaller than the tracker intent here, so Day 7 will need to reconcile the two.
- Observed: I ran `skills/intent-check.md` on `intent/current-feature.md` and applied three edits: the app is named as `app/` (seeded from `starter/`); a whitespace-only outcome counts as empty and the other five fields are optional; the empty-state message must say what belongs there and point to the form.
- Inferred: my earlier "Assumed" item about later days is partly resolved. Later days do not cover editing in the range I read (days 3–9), so edit may not be scheduled until later or at all.

## What changed in the next intent
`intent/current-feature.md` holds the tracker intent with the intent-check edits applied. The build is not scheduled until Day 7, and Days 3–6 will refine this file before then.
