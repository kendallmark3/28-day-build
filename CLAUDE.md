# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is not a conventional software project — it is a 28-day guided exercise (companion to *The Ultimate Guide to Claude*) in which the user progressively builds **IntentWorkbench**, a local-first, single-page web app, by working from written intent rather than ad hoc prompting. There is no package manager, build step, test runner, or linter. Claude's role here is split between two things: acting as the day-by-day build/review assistant *inside* this workflow, and (when asked to just write code) treating `starter/` or the user's working copy as an ordinary static HTML/CSS/JS app.

Read `README.md`, `START-HERE.md`, and `ROADMAP.md` before assuming what "the app" currently is — its shape is expected to change every day of the exercise, and `reference-final/` is a calibration target, not the current state.

## Running the app

No install step. Serve either app directory with a static file server and open it in a browser:

```bash
./run-starter.sh    # serves starter/ on :8080
./run-final.sh      # serves reference-final/ on :8080
```

(Windows equivalents: `run-starter.bat`, `run-final.bat`.) Both are just `python3 -m http.server 8080` from the respective directory. There are no automated tests; verification is manual/browser-based per the evidence workflow described below.

## The operating loop (apply this, don't skip it)

Every day's work follows the same cycle, and Claude should follow it too when asked to "do day N":

1. **Intent** — read `days/day-XX.md` for that day's intent (Intent / Inputs / Outputs / Constraints / Success criteria / Stop when).
2. **Intent check** — before implementing anything, run the procedure in `skills/intent-check.md` against that day's intent: list ambiguity, missing pieces, contradictions, unchecked criteria, and a missing stop condition, then propose only the smallest edit to the intent file. Do not implement during this step.
3. **Refine** — edit the intent file itself if it's weak, not the eventual output.
4. **Build** — implement only what the (refined) intent requires. No unrelated features, no speculative infrastructure.
5. **Challenge** — ask where the result will fail and what was assumed.
6. **Verify** — deterministic checks where possible, human judgment where not.
7. **Evidence** — write `evidence/day-XX.md` using `templates/evidence.md`, labeling every claim `observed`, `inferred`, or `assumed`.
8. **Commit.**

When asked to *review* rather than build, use `skills/evidence-first-review.md` instead: read the intent first, inspect the change, mark each success criterion met/unmet/untested, report only what's directly evidenced, and state what wasn't checked. Review-mode responses must not modify the work under review.

`intent/current-feature.md` is meant to hold exactly one active intent at a time (replaced daily, not appended to) — `intent/project-intent.md` is the durable, rarely-changed project-level intent.

## Governing constraints (from `context/` and `intent/project-intent.md`)

- Local-first: browser-only HTML/CSS/JS, `localStorage` for user data, no backend for the core experience. Add infrastructure only when a demonstrated requirement can't be met locally (see `context/architecture.md`).
- No API keys, secrets, or credentials in client-side code; this app never calls AI APIs from the browser (`context/security.md`, `context/non-goals.md`).
- Evidence claims must always be labeled `observed` / `inferred` / `assumed` (`context/business-rules.md`).
- Every intent needs at least one constraint and one stop condition before it's "ready"; success criteria must be checkable, not vague.
- A capability is promoted to reusable status only after repeated successful use — don't prematurely generalize one-off work.
- High-consequence changes require explicit human approval; guardrails should scale with consequence, not be uniform (see the LOW/MEDIUM/HIGH guardrail model in `reference-final/app.js`'s `evidence()` view).
- UX standard: always show the next useful action, meaningful empty states, progressive disclosure, visible keyboard focus, usable mobile layout (`context/ux-standard.md`).

## Repository map

- `days/day-01.md` … `day-28.md` — the day-by-day intents; the only thing that should change here is refinement per the intent-check procedure.
- `evidence/day-01.md` … `day-28.md` — one evidence record per day, written after that day's work.
- `intent/project-intent.md` — durable project intent. `intent/current-feature.md` — the single active feature intent, replaced (not appended) each day.
- `context/` — durable context the AI should read before building: `architecture.md`, `business-rules.md`, `glossary.md`, `non-goals.md`, `security.md`, `ux-standard.md`.
- `skills/` — reusable review/check procedures (`intent-check.md`, `evidence-first-review.md`) extracted from repeated work; treat these as authoritative procedures, not suggestions.
- `templates/` — the required structure for new intents, evidence records, reviews, and decision records; use these rather than inventing new formats.
- `reviews/` — the fresh-session review intent and the Day-28 release review intent (procedures, not filled-in reports).
- `starter/` — the deliberately minimal starting app (`index.html`, `app.js`, `styles.css`); this is the base the user builds up day by day.
- `reference-final/` — a completed calibration example of IntentWorkbench (single-file vanilla-JS SPA: hash-free client-side router over `dashboard/intents/context/evidence/capabilities/architecture/progress`, state persisted as one JSON blob in `localStorage` under key `intent-workbench-v1`, reset via a bundled `sample` object). Do not copy this into the working app wholesale — it's a target to compare against after attempting each day's intent, not a source to paste from.
- `app/README.md` — notes that the user's actual working copy lives in `app/`, seeded from `starter/`, and reference-final should stay unopened until the corresponding exercise is attempted.
- `docs/RELEASE-CHECKLIST.md`, `docs/DEMO-SCRIPT.md`, `docs/NEXT-INTENT.md` — Day-28 release, demo, and "what's next" artifacts; only fill these in as part of the final days of the exercise.
- `book/` — the companion PDF (reference material, not something to edit).

## Working conventions specific to this repo

- Treat `days/day-XX.md` as the spec for that day — do not add features or implementation details beyond what the day's (refined) intent calls for, even if `reference-final/` does more.
- When editing an intent file, structure the boundary (inputs/outputs/constraints/criteria/stop condition), not the reasoning behind it.
- Keep the app runnable at the end of every session — this is itself a stated constraint in `days/day-01.md` and implicitly applies throughout.
- Don't add a backend, framework, build tooling, or dependency manager unless a day's intent and its evidence explicitly justify it — `context/non-goals.md` and the architectural rule in `context/architecture.md` exist specifically to prevent this.
