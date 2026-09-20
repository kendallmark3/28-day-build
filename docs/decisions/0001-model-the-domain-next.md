# Decision Record: Model the domain next

## Decision
The next piece of work is the data model for evidence, reviews, and capabilities (plan Day 11), not run instructions or user testing.

## Context
Day 10 inspected the app against the six success criteria in `intent/project-intent.md` (matrix in `evidence/day-10.md`). Two are met or partly met; three are unmet for the same reason: the app stores only intents.

## Options considered
1. **Model the domain (chosen).** Add records and validation for evidence, reviews, and capabilities. Unblocks three unmet criteria: attach evidence and label claims, a readiness check on saved intents, and promoting a capability.
2. **Write run instructions for `app/`.** README and both run scripts point at `starter/` or `reference-final/`, so a newcomer does not run this app. One criterion (run in under 3 minutes), one small fix.
3. **Test with a first-time user.** The last criterion is untested. It needs a person, and it is more useful once there is more to try.

## Tradeoffs
Option 1 is the largest change and delays option 2, so a newcomer still cannot find the run command until it is written (scheduled for the Day 28 release). Option 2 is cheap but moves one criterion; option 1 moves three.

## Evidence
- Cold start of `app/` served by `python3 -m http.server`: 188, 158, 157, 159, 158 ms (five runs). Running is fast; only the instructions are missing.
- `grep` of `README.md`, `START-HERE.md`, `app/README.md` and the four `run-*` scripts finds no command that serves `app/`.
- No record type other than intents exists in the app or in stored data.

## Consequences
Days 16-24 (evidence labels, readiness, guardrails, capabilities, metrics) can build on one model. Run instructions for `app/` remain a known gap until Day 28.
