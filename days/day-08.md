# Day 08 — Map context

## Intent
Bring the four context files named for this day (`architecture.md`, `glossary.md`, `security.md`, `non-goals.md`) in line with what the app does today, and make the app cite them where their rules drive behavior, instead of leaving them unreferenced.

## Inputs
- `intent/current-feature.md`
- `intent/project-intent.md`
- Current application code in `app/`
- All six files in `context/`
- Evidence from the previous day, if any

## Outputs
- Edited `context/architecture.md`, `context/glossary.md`, `context/security.md`, `context/non-goals.md`
- In the app: a "Project context" section on the References view, listing all six context files with a one-line purpose each and a link to each file in the project's GitHub repository; and a "Source" line on each Jira-story note that applies a context rule
- The matching criteria added to `intent/current-feature.md`
- `evidence/day-08.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Every statement added to a context file must be true of the app as it stands, and the evidence must say how each was checked
- Do not edit `context/business-rules.md` or `context/ux-standard.md` (Day 9)
- The app links to or cites context files; it does not copy their text, so the files stay the single source

## Success criteria
- Each new statement in the four edited context files is listed in the evidence with how it was verified against the app
- `architecture.md` separates the views and modules that exist from those still planned, and names the storage key and the fact that the app makes no network request
- Every label and note tag the app shows for a Jira story (From your story, Suggested, Not found, and the nine note tags) has a glossary entry
- `security.md` states how the app handles a pasted story and external links; `non-goals.md` lists the Jira-related non-goals from `intent/current-feature.md`
- The References view has a "Project context" section with all six context files, each with a purpose line and a link that opens the file on GitHub
- Each Jira note whose rule appears in `context/` shows a Source line naming the file and, for business rules, the rule number, and the cited rule says what the note claims
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-08.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
