# Example: an excellent intent

The Jira story from the app's example, turned into an intent and sharpened. Compare your own intents to it. It is also the app's first sample intent, so a test keeps the two identical.

## Intent
Export a monthly usage report as a CSV so that I can share it with customers without asking an engineer

## Inputs
- Usage data from the analytics database
- Design mockup: https://example.com/mockups/142

## Outputs
- A CSV export of the monthly usage report

## Constraints
- Out of scope: PDF export

## Success criteria
- The Reports page has an "Export CSV" button
- The CSV contains one row per user with columns: user, logins, last_seen
- The export finishes in under 5 seconds for 10,000 rows
- Shows an error message if the month has no data

## Stop when
- Stop when every success criterion passes and each result is recorded.

## Why this works
- **Intent:** says what will be true and why it matters, in one sentence.
- **Inputs:** names the data and the design that may be used, and nothing else.
- **Outputs:** names the one thing that will exist.
- **Constraints:** draws a boundary that a reviewer can spot being crossed.
- **Success criteria:** each line can be marked pass or fail; the speed criterion has a number.
- **Stop when:** names the exact criteria whose passing ends the work.
