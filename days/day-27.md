# Day 27 — Final adversarial review

## Intent
Review the finished product as if about to demo it to a skeptical principal engineer: find unsupported claims, confusing flows, and broken criteria (documentation against reality, a way for a newcomer to run it, every criterion backed by a check, and a second round of attacks on the features added since Day 14), and fix only what the evidence supports.

## Inputs
- `intent/current-feature.md` and `intent/archive/intent-tracker.md`
- `README.md`, `START-HERE.md`, `app/README.md`, `context/architecture.md`, and the other context files
- `reviews/day-15-review.md` (finding F3, still open) and `evidence/day-14.md`
- The check scripts in `evidence/checks/`

## Outputs
- A traceability table, `evidence/traceability.md`, generated from a verified mapping of every success criterion to an automated check
- Round-2 attack results before and after any fix, and fixes for demonstrated failures only
- Corrected `context/architecture.md`, and run instructions (`run-app.sh`, `run-app.bat`, `README.md`, `app/README.md`)
- The matching criteria in `intent/current-feature.md`
- `evidence/day-27.md`

## Constraints
- Structure the boundary, not the reasoning
- Do not add unrelated features
- Prefer the smallest useful change
- Keep the app runnable at the end of the session
- Run every attack and every documentation check before changing anything, and record the failures first
- A statement counts as unsupported if something in the repository contradicts it or nothing shows it is true
- Fix only what a check or attack demonstrates; record everything else
- The boundary gains only the run-instruction files and `evidence/traceability.md`, because finding F3 requires them

## Success criteria
- Every success criterion in the archived and active intents maps to an existing automated check, and the mapping fails if one is added without a check
- The attacks on the newer features all hold after fixes, and each fix has a check
- No document claims something the repository contradicts, and a newcomer can run the app from the documentation in under three minutes
- All earlier checks still pass
- Evidence distinguishes what was observed from what was inferred
- The day's output is understandable by a teammate who was not in the chat

## Stop when
The success criteria are met, each result is recorded in `evidence/day-27.md`, and `intent/current-feature.md` has the matching criteria. Ideas beyond these go under "What changed in the next intent" and are not built.

## Before implementation
Run `skills/intent-check.md` against this file.
