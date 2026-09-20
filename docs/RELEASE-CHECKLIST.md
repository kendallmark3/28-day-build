# Day-28 Release Checklist

Each item is done with a pointer to evidence that exists in this repository, or is marked not done with the reason. Nothing is ticked on trust.

- [x] App runs with no build step. Evidence: `run-app.sh`, `evidence/day-27.md` (the app is usable 177 ms after starting the script)
- [x] Project intent is current. Evidence: `reviews/day-28-release-review.md` (every project success criterion checked against the finished app)
- [x] All navigation paths work. Evidence: `evidence/day-28.md` (every internal link in every view opened and checked), `evidence/checks/regression.js`
- [x] Intent readiness validation works. Evidence: `evidence/day-17.md`
- [x] Local persistence works. Evidence: `evidence/day-12.md`, `evidence/day-19.md`
- [x] Sample data can be restored. Evidence: `evidence/day-12.md`, `evidence/day-25.md`
- [x] Evidence labels are visible. Evidence: `evidence/day-16.md`
- [x] Guardrail guidance changes by consequence. Evidence: `evidence/day-18.md`
- [x] Capability library works. Evidence: `evidence/day-21.md`, `evidence/day-22.md`, `evidence/day-23.md`
- [x] 28-day progress is visible. Evidence: `evidence/day-24.md`
- [x] Keyboard focus is visible. Evidence: `evidence/day-26.md`
- [x] Mobile layout remains usable at 375px. Evidence: `evidence/day-26.md` (a 320px-wide phone shows no sideways scroll, but the Save button is below the first screen there)
- [ ] Fresh-session review completed. Not done as an independent review: the Day 15 review (`reviews/day-15-review.md`) and the release review (`reviews/day-28-release-review.md`) were both done in the same session, by the same author, as the build. Run `reviews/fresh-session-review.md` in a new session to close this item.
- [x] Demo script rehearsed. Evidence: `evidence/day-28.md` (each of the seven steps was run in the app by a script and its on-screen claims verified). A person has not yet rehearsed it aloud.
- [x] Next intent written. Evidence: `docs/NEXT-INTENT.md` (six parts, ready by the app's own check)
