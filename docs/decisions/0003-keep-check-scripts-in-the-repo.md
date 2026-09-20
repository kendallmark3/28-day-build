# Decision Record: Keep the check scripts in the repository

## Decision
Store the browser check scripts under `evidence/checks/`, with a README and a runner, and add that folder to the file boundary.

## Context
The Day 15 review (finding F2) found that no test file was tracked. Every "verified in real Chrome" claim in the evidence records depended on scripts in a temporary folder, so nobody else could reproduce them.

## Options considered
1. Leave the scripts outside the repository and keep saying so in each evidence record.
2. Add them to the repository as evidence artifacts, run with `puppeteer-core`, installed by the user. **Chosen.**
3. Add a `package.json` and a test framework.

## Tradeoffs
Option 2 makes the evidence reproducible but needs Node and a browser driver from anyone who wants to re-run it. Option 3 would add a dependency manager, which the project's architecture avoids for the app. The scripts are not part of the app, so the app still has no build step or dependency.

## Evidence
`git ls-files` showed no test, spec, or check file before this change. After it, `evidence/checks/run-all.sh` passes against the running app (recorded in `evidence/day-16.md`).

## Consequences
The scripts must be maintained as the app changes, in `evidence/checks/`. The scratch copies are no longer the source of truth.
