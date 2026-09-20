# Day 05 Evidence — Define done

Structured per `templates/evidence.md`.

## Intent tested
`days/day-05.md` (refined): give `intent/current-feature.md` a stop condition that can be verified as reached, and remove wording that permits open-ended improvement. No application code changes.

## Observed
- The intent check on `days/day-05.md` found: "a task that can finish decisively" was itself unmeasured; "keep improving" wording had no search to find it; criteria 1 and 2 assumed an app change. I edited the Intent, Outputs, and criteria.
- Before, the Stop when of `current-feature.md` was one sentence: "All success criteria are observed in the running app and the evidence record for the day that builds this records them. Do not add editing, deletion, search, or export until a later intent asks for them."
- After, it is four bullets:
  - "Every success criterion above has been checked in the running app, and each pass or fail result is recorded in the evidence record for the build"
  - "If a criterion fails, fix only that criterion and re-check it"
  - "When all pass, stop. Do not restyle, refactor, or extend"
  - "Ideas outside these criteria go under "What changed in the next intent" in the evidence record and are not built"
- The "Do not add editing, deletion, search, or export" sentence was removed, as Day 4 planned. The Day 4 non-goals bullet already covers it.
- The Day 5 search (improve, polish, enhance, "as needed") ran on `current-feature.md` and found no matches.
- **A defect was found while running the searches.** The constraint "The app stays runnable via `run-starter.sh` at every step" contradicts the file boundary. `run-starter.sh` serves `starter/`, and `starter/` is off-limits. The work happens in `app/`. I replaced it with: "The app stays runnable at every step: from `app/`, `python3 -m http.server 8080` serves it and the page loads without console errors". This was in the Day 2 draft. My Day 2 and Day 4 checks did not catch it.
- Final state of `current-feature.md`: 6 sections, 25 bullets, 8 success criteria, 4 stop conditions.
- No files under `app/`, `starter/`, or `reference-final/` changed.

## Inferred
- The stop condition can now be judged: a reader can tell whether work is finished by counting recorded results against eight named criteria.
- "Without console errors" is checkable, but only by opening browser dev tools. I inferred that is acceptable for this project.

## Assumed
- `app/` will be seeded from `starter/` before the build. `app/` currently holds only its README, so the constraint above cannot be satisfied until then.
- The Day 7 build will accept this intent as its scope. Day 7's own wording ("a dashboard, one intent card, and a clear action to create an intent") is smaller and still needs reconciling.

## Deterministic checks
- [x] Syntax / build — valid Markdown; no build step.
- [x] Functional behavior — no app code changed; `starter/` still serves unchanged.
- [x] Validation rules — the Day 5 search was run on `current-feature.md` and returned nothing.
- [ ] Accessibility spot-check — not applicable; no UI changed.

## What failed
Nothing failed on Day 5. The run-script contradiction above is a defect from earlier days, now fixed in the intent.

## What was not checked
- That the new stop condition works in practice. It needs a real build session.
- That `python3 -m http.server 8080` in `app/` works. `app/` has no `index.html` yet.

## What changed in the next intent
Day 6 runs the intent check on the whole active intent. Two items for it: reconcile the tracker intent with Day 7's smaller scope, and confirm the "at least 2 times" threshold from Day 3.
