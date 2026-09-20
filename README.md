# The Ultimate Guide to Claude — 28-Day Build Project

A hands-on companion repository for **The Ultimate Guide to Claude**.

The goal is not to spend 28 days reading prompts. The goal is to spend 28 days **building a real piece of software by working from intent**.

You will progressively build **IntentWorkbench** — a local-first engineering workbench for creating intent files, organizing context, reviewing evidence, packaging reusable capabilities, and applying guardrails.

By Day 28 you will have:

- a polished working web application
- a project-level intent and reusable feature intents
- curated context files
- evidence-driven review records
- reusable skills/capabilities
- a guardrail and verification model
- a repeatable workflow you can take to your own projects

## The rule

**Prompt to explore. Write intent to repeat.**

For each day:
1. Read the day's intent in `days/`.
2. Give that file plus the repository to Claude (or another capable coding assistant).
3. Ask the model to critique the intent before implementing it.
4. Apply only the smallest edits needed to make the intent checkable.
5. Run the intent.
6. Verify the result.
7. Record evidence in `evidence/`.
8. Commit the change.

## Start here

- `START-HERE.md` — the 28-day operating instructions
- `ROADMAP.md` — all 28 days at a glance
- `starter/` — the deliberately small starting application
- `reference-final/` — a completed reference version of IntentWorkbench
- `intent/` — project and current feature intent
- `context/` — durable context the AI should use
- `templates/` — reusable intent, review, evidence, and decision templates
- `skills/` — reusable procedures extracted from repeated work
- `reviews/` — fresh-session review briefs
- `evidence/` — results, test notes, and observations from each cycle

## Run the app you built

```bash
./run-app.sh            # serves app/ at http://localhost:8080
./run-app.sh 9000       # use another port if 8080 is taken
```

On Windows: `run-app.bat`. Python 3 is the only requirement. That is the working app; `app/README.md` says what is in it.

## Run the starter or final app

No package installation is required.

```bash
cd starter
python -m http.server 8080
```

or:

```bash
cd reference-final
python -m http.server 8080
```

Open `http://localhost:8080`.

## Book alignment

This project follows the book's operating discipline:

- Intent, Inputs, Outputs, Success Criteria
- explicit Constraints and Stop Conditions
- Progressive Intent
- Context as a controlled engineering asset
- fresh-session review
- evidence before trust
- prompt → skill → capability
- guardrails proportional to consequences
- human judgment remains accountable

---

Independent companion project. Claude is a trademark of Anthropic, PBC. This repository is not affiliated with or endorsed by Anthropic.
