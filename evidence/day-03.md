# Day 03 Evidence — Make success checkable

Structured per `templates/evidence.md`.

## Intent tested
`days/day-03.md` (refined): rewrite every vague success phrase in `intent/current-feature.md`, and in the Outputs and Success criteria of `intent/project-intent.md`, into a check someone can perform. No application code changes.

## Observed
- The intent check on `days/day-03.md` found three gaps: "every vague success phrase" named no files; criteria 1 and 2 assumed an app change; nothing said how to tell a phrase was fixed. I edited the Intent, Outputs, criteria, and added one constraint (do not edit `context/`).
- A search for vague quality words found 4 vague phrases in the two intent files. Each was rewritten:

| # | Before | After |
|---|--------|-------|
| 1 | `project-intent.md` Outputs: "A polished browser application" | "A browser application that meets the success criteria below" |
| 2 | `project-intent.md` criterion: "The user can identify repeated work worth promoting to a reusable capability" | "The app lists any intent recorded as successfully used at least 2 times as eligible for promotion to a capability" |
| 3 | `project-intent.md` criterion: "The product remains understandable without reading its source code" | "A first-time user creates an intent in the running app without opening any source file or asking for help" |
| 4 | `current-feature.md` constraint: "...visible keyboard focus, usable mobile layout" | "...visible keyboard focus, mobile layout; each is checked by a success criterion below" |

- Two further criteria in `current-feature.md` were made checkable:
  - Before: "The form can be completed and saved using only the keyboard, and focus is visible on every control". After: "...pressing Tab moves a visible focus outline to each field and button in turn".
  - Added: "One primary button, labeled with its action (for example "Save intent"), is visible on the page at load". Before, the "always show the next useful action" rule from `context/ux-standard.md` had no criterion.
- Re-running the search afterwards matched 2 lines, both false positives: "technical professional" (the persona) and "Reusable" (contains "usable").
- `context/ux-standard.md` still contains "Clear, quiet, professional interface." and "Mobile layout must remain usable." I did not edit it, per the day's new constraint.
- No files under `app/`, `starter/`, or `reference-final/` changed.

## Inferred
- The new criteria can be judged pass/fail by someone who has the running app. They are unbuilt, so this is a reading of the wording only.
- The rewrite of criterion 3 shifts what is measured: from a property of the product to a test with a person. That makes it checkable, but it needs a first-time user to check.

## Assumed
- "At least 2 times" is a threshold I chose. `context/business-rules.md` says only "repeated successful use". Please confirm or change the number.
- Criterion 2 implies the app records successful use of an intent. No intent or day file yet says how that is recorded, so this may need a later intent.
- The seven-word search list stands for "vague". Words outside the list (for example "clear", "quiet") were not searched.

## Deterministic checks
- [x] Syntax / build — valid Markdown; no build step.
- [x] Functional behavior — no app code changed; `starter/` still serves unchanged.
- [x] Validation rules — the day's search criterion was run before and after (see Observed).
- [ ] Accessibility spot-check — not applicable; no UI changed.

## What failed
Nothing failed.

## What was not checked
- Whether a stranger can tell that the rewritten criteria are checkable.
- Any of the criteria against a running app. There is no tracker yet.
- Vague wording in `context/`, or in day files other than Day 3.

## What changed in the next intent
`current-feature.md` now has eight checkable success criteria. Day 4 adds boundaries to the same file. It is refined in place across Days 3–5 rather than replaced (assumed: these days all work on the active intent).
