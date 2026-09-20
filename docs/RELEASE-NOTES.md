# IntentWorkbench 1.0: release notes

An independent companion project to *The Ultimate Guide to Claude*. Claude is a trademark of Anthropic, PBC. This project is not affiliated with or endorsed by Anthropic.

## What it is
A local-first web app that turns one-off AI work into a written intent, checked evidence, and reusable capabilities, in the browser, with no server, no build step, and no paid service. Everything stays in your browser's local storage.

## What is included
- **Start:** the rule and the loop, six self-checking steps, and a sample project with a tour
- **Intents:** a six-part intent form (with an example so the first save works), a dashboard, edit, a confirmed reset to sample data, and "Start from a Jira story" (fixed rules that fill the six parts and say what to improve; no AI, nothing sent anywhere)
- **Review:** a readiness score for each intent (eight checks), guardrails by consequence (low, medium, high) with the minimum checks marked Met or Open, labelled evidence (observed, inferred, assumed), and recorded reviews
- **Capabilities:** the ladder (prompt, skill, trigger, workflow, business capability), the two packaged skills, uses, and promotion that is refused until two successful uses
- **Overview:** four outcome metrics (not activity counts), how the stages fit together, the data model, and a 28-day progress list
- **References and About:** the project's sources and rules, linked
- **Failure states:** unreadable data, invalid records, blocked storage, and unexpected errors each say what happened and what to do, and a backup copy is kept before anything can be dropped

## How to run it
From the repository root: `./run-app.sh` (or `run-app.bat`), then open http://localhost:8080. Use `./run-app.sh 9000` if the port is taken. You need Python 3.

## What was verified
- **423 automated checks pass** in real Chrome (`evidence/checks/`), and every one of the 142 success criteria in the archived and active intents maps to at least one check (`evidence/traceability.md`).
- Audits against `context/ux-standard.md` (contrast, tap-target size, focus, one font family, labels, headings, sideways scroll) pass on every view.
- Two rounds of attacks (Days 14 and 27) found 8 defects (6 and 2), all fixed.
- The project's success criteria are judged one by one in `reviews/day-28-release-review.md`.

## Known limitations
- **No person has used it.** The criterion that a first-time user can create an intent without help has only a scripted proxy.
- **No independent review.** Every review, including the release review, was done by its author.
- **Chrome only.** Firefox and Safari were not tested; nor was a screen reader.
- **The Windows script** (`run-app.bat`) has not been run.
- **Records cannot be deleted, and a claim's text cannot be edited** (a label can be changed). These are deliberate non-goals for now.
- **The Save button is 2 px inside the first screen at 1280x800** and below it on a 320px-wide phone; changes to the top of the Intents view need re-measuring.
- **Data lives in one browser.** There is no export, import, or sync; the next intent (`docs/NEXT-INTENT.md`) is a first step.

## Not included
A server, accounts, AI calls, deleting records, a project switcher, and any activity analytics. Also not included: the book itself (*The Ultimate Guide to Claude*), which is supplied separately; three checks that compare the app's text with the book skip when it is absent.
