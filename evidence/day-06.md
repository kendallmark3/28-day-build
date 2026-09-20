# Day 06 Evidence — Run the intent check

Structured per `templates/evidence.md`.

## Intent tested
`days/day-06.md` (refined): run `skills/intent-check.md` on the active intent, `intent/current-feature.md`, and apply only the smallest fixes. No application code changes.

Note: the plan expects this check before any code. The tracker was already built (`evidence/build-tracker.md`), so this check reviewed the intent against the built result.

## Observed
- Day 6's own intent check found its criteria were the generic ones from the other days (app-oriented, no test for "reviewed"). I refined its Inputs, Outputs, and criteria.
- Intent-check findings on `intent/current-feature.md`, by category:
  1. **Ambiguity:** criterion 7 ("visible on the page at load") named no viewport. The build assumed 1280x800.
  2. **Missing pieces:** the evidence record was referred to only as "the evidence record for the build", with no file named. The stored data shape (`{intents: [...]}` under `intent-workbench-v1`) is not in the intent; it is not needed for any criterion, so I left it.
  3. **Contradictions:** none inside the file. Two tensions with other files, left unfixed (see Inferred): `project-intent.md` says users can "create and edit" intents, while this intent lists editing as a non-goal; and `project-intent.md`'s promotion criterion needs a record of successful use that no intent builds.
  4. **Uncheckable criteria:** only criterion 7, as in item 1.
  5. **Stop condition:** present and usable; it now names the evidence file.
- Edits applied, before and after:
  - Criterion 7. Before: "One primary button, labeled with its action (for example "Save intent"), is visible on the page at load". After: "One primary button, labeled with its action (for example "Save intent"), is fully inside the window at load, at both 1280x800 and 375x812, without scrolling".
  - Constraint on files. Before: "...and the evidence record for the build. All other files..." After: "...and `evidence/build-tracker.md`. All other files..."
  - Stop when, first bullet. Before: "...recorded in the evidence record for the build". After: "...recorded in `evidence/build-tracker.md`".
- The changed criterion was re-checked in real Chrome against the running app (served from `app/` on port 8091):
  - 1280x800: button bottom edge at y=719, viewport height 800. In view.
  - 375x812: button bottom edge at y=721, viewport height 812. In view.
- The 375x812 position had not been script-checked in the build; the build evidence marked it as assumed. It is now observed.
- No files under `app/`, `starter/`, or `reference-final/` changed.
- Day 07's file still reads "Build a clean first screen with a dashboard, one intent card, and a clear action to create an intent" with the same generic criteria. I did not edit it, because Day 7's own intent check is its scheduled step.

## Inferred
- The two cross-file tensions could each mislead a later reader. A reader of `project-intent.md` could expect edit and promotion tracking from this feature. Neither was fixed here because both need a decision on scope, not a wording fix.
- The intent is now unambiguous enough that a second builder would reach the same 8 pass/fail results, for the criteria that name their viewports and steps. I did not test this with a second builder.

## Assumed
- "Fully inside the window" (bottom edge at or above the viewport height) is what "visible at load" should mean.
- The "at least 2 successful uses" threshold from Day 3 is still unconfirmed. You had not answered it as of this record.

## Deterministic checks
- [x] Syntax / build — valid Markdown; no build step.
- [x] Functional behavior — button position re-checked at 2 viewports, page loaded from `app/`.
- [ ] Validation rules — not applicable.
- [ ] Accessibility spot-check — not applicable; no UI changed.

## What failed
Nothing failed.

## What was not checked
- The other 7 criteria were not re-run; only the changed one was. They passed in the build run and nothing in `app/` changed since.
- Whether `days/day-07.md` can be run as written against the current app.

## What changed in the next intent
`intent/current-feature.md` now names its evidence file and pins criterion 7 to two viewports. Day 7 asks for a dashboard, one intent card, and a create action, but the tracker built here already covers the create-and-list part. Before Day 7, decide whether to (a) drop Day 7's build scope, (b) rewrite it as "add a dashboard around the existing tracker", or (c) run it as written and replace the tracker screen. Two other open items: the promotion threshold, and where the "create and edit" criterion from `project-intent.md` gets built.

---

## Follow-up: fixes made before Day 7

Requested after this record was first written ("fix before 7"). These went beyond Day 6's stated outputs. In particular, Day 6 said "No application code changes", and this follow-up did change app code. The code change and its verification are recorded in `evidence/build-tracker.md` (Addendum).

### Observed
- Searched `days/day-08.md` to `day-28.md`. No day schedules editing intents. Days 21–24 cover capabilities and their promotion; none tracks "successful use" of intents.
- Edits applied, before and after:
  - `intent/project-intent.md`, promotion criterion. Before: "The app lists any intent recorded as successfully used at least 2 times as eligible for promotion to a capability". After: "A capability can be marked promoted only after at least 2 recorded successful uses; before that, the app refuses and says how many uses are missing".
  - `intent/current-feature.md`: Intent line gained "edit it"; Outputs gained "An Edit button on each listed intent that loads it back into the form"; non-goal "editing or deleting saved intents" became "deleting saved intents"; four success criteria were added (Edit button, update in place, survives reload, Cancel).
  - `days/day-07.md`. Before: "Build a clean first screen with a dashboard, one intent card, and a clear action to create an intent." After: "Add a dashboard to the existing intent tracker in `app/`, so the first screen shows the state of the user's intents and a clear action to create one." Its Outputs line changed from "A usable first product slice." to "The updated `app/` with the dashboard added; the tracker's existing behavior unchanged". Its other sections (including the generic success criteria) were not touched; Day 7's own intent check is the step for those.
- The Edit action was built and verified (27/27 checks; see the build record).

### Inferred
- My Day 3 rewrite of the promotion criterion (see `evidence/day-03.md`) invented a mechanism, "intents used twice", that the plan does not contain. The plan promotes capabilities (Days 21–24). This restatement follows `context/business-rules.md` rule 5 and applies it to capabilities.

### Assumed
- "At least 2" is the smallest reading of "repeated successful use" in rule 5. It has not been confirmed with you, and it will bind on Days 21–24.
- Restating the criterion, not deleting it, is right; the project criterion can't be checked until capabilities exist.

### What was not checked
- Whether Days 21–24 want a "successful use" counter in a different place or shape.
- Day 7's remaining generic criteria, which its own intent check will need to rewrite.
