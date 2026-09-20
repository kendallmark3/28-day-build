# Your Working Application

This folder is the IntentWorkbench app you built over the 28 days: plain HTML, CSS, and JavaScript, with no install and no build step.

## Run it
From the repository root:

```bash
./run-app.sh          # then open http://localhost:8080
./run-app.sh 9000     # if port 8080 is already taken
```

On Windows, run `run-app.bat` (or `run-app.bat 9000`). You need Python 3. The scripts only serve this folder; nothing else is installed.

Your data stays in your browser's local storage. Use "Reset to sample data" on the Intents view to start from a worked example.

## Files
- `index.html`: the page and its views
- `app.js`: the code that touches the page and storage
- `logic.js`: the pure functions (the model, checks, and rules); it never reads the page or storage
- `styles.css`: the styles

Do not copy `reference-final/` into this folder until you have completed the exercise you are trying to learn from.
