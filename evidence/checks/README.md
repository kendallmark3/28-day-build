# Check scripts

These are the automated checks behind the "verified in real Chrome" statements in the evidence records. They are evidence artifacts, not part of the app: the app itself has no build step, no dependencies, and no test runner.

## Run them
1. From the repository root, serve the app: `python3 -m http.server 8092 --directory app`
2. Install the browser driver once, anywhere Node can find it: `npm install puppeteer-core` (in this folder is fine)
3. From this folder: `./run-all.sh`

Set `APP_URL` if the app is served elsewhere, and `CHROME_PATH` if Chrome is not at the macOS default.

## What is here
- `regression.js`: the checks for Days 1-13 (the archived tracker intent) plus the context, navigation, dashboard, reset, and Jira features.
- `dayNN.js`: the checks added on that day. `h.js` is their shared helper.
- `probe14.js`, `review15.js`, `audit13.js`: the Day 14 attacks, the Day 15 review script, and the Day 13 usability audit. They record findings and are not part of `run-all.sh`.

Some checks read files in the repository (context files, the sample data, `logic.js`), so they must run from a full checkout. The three checks that compare the References and About text with the book (N6b, N7a, N7e) need the book text: put the PDF at `book/` (the repository does not include it) with `pdftotext` installed, or set `BOOK_TEXT_FILE`. Without it they print SKIP and are not counted.
