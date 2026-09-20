> Archived on Day 10. This is the accumulated tracker intent (Days 2-13). It is superseded as the active intent by `intent/current-feature.md`, but every criterion below still holds and the regression suite still checks them.

# Intent: Intent tracker (from the prompt "build an intent tracker")

## Intent
A user can record an intent in the six-part structure (outcome, inputs, outputs, constraints, success criteria, stop condition), see it listed, edit it, and find it again after reloading the page, so that work starts from a written boundary instead of a chat prompt.

## Inputs
- `intent/project-intent.md`
- `context/business-rules.md`, `context/architecture.md`, `context/security.md`, `context/ux-standard.md`, `context/non-goals.md`
- The working copy in `app/`, seeded from `starter/`, as the existing application

## Outputs
- A form in the app with one field per intent part
- A list of saved intents, with an empty state that says what belongs there
- An Edit button on each listed intent that loads it back into the form
- Sample text in all six fields whenever the form is in create mode, so a first-time user can save straight away and see what a completed intent looks like
- Intents persisted in the browser's `localStorage`
- A status line under the dashboard that names each action just taken, and a status line in the Jira modal after a download
- A link to Intents at the end of the References and About views
- A "Reset to sample data" button in the Saved intents panel that, after a confirmation, replaces all saved intents with 3 sample intents
- A dashboard at the top of the Intents view showing how many intents are saved, how many lack a constraint or a stop condition, and a next-step line
- A navigation bar at the top with three items, Intents, References, and About, each showing one view of the page
- A References view listing the sources in Appendix E ("Sources and Further Reading") of `book/The-Ultimate-Guide-to-Claude.pdf`, plus the reference files in this repository
- A "Project context" section on the References view listing the seven files in `context/`, each with a purpose line and a link to it in the project's GitHub repository
- A Source line on each Jira-story note that applies a rule from `context/`
- An About view explaining the book's "learn it, teach it, master it" concept
- A "Start from a Jira story" button on the Intents view that opens a modal. In the modal the user pastes a Jira story, and the app fills in the six parts of an intent, shows notes on what did not fit and what to improve, and offers the intent as a downloadable Markdown file

## Constraints
- Browser-only HTML/CSS/JS, no backend, no framework, no build step
- The Jira story analysis is rule-based code that runs in the browser: the same text always gives the same result. It makes no AI call and no network request, and the pasted story is never stored
- All data stays in `localStorage`; the app makes no network calls. External links are plain anchors that only the user's click follows, opened in a new tab with `rel="noopener noreferrer"`
- No API keys or credentials in code; no AI API calls from the browser
- Code changes are limited to `app/index.html`, `app/app.js`, and `app/styles.css`. Each day's work may also edit its own `days/day-XX.md`, this file, its evidence record, and any `context/` file that day's intent names. All other files are off-limits, including `starter/`, `reference-final/`, `book/`, `skills/`, and `templates/`
- Non-goals: deleting saved intents, search, export or import, evidence attachment, readiness check, capability promotion, accounts or sync, AI calls, any view beyond Intents, References, and About, and for the Jira feature: rewriting or fixing the story for the user, comparing or refining against a second story (a later round), importing from Jira by URL or file upload, saving the pasted story text
- Meets `context/ux-standard.md`: next action shown, empty state explained, visible keyboard focus, mobile layout; each is checked by a success criterion below
- The app stays runnable at every step: from `app/`, `python3 -m http.server <any free port>` serves it and the page loads without console errors

## Success criteria
- The form has six labeled fields, one for each intent part
- Saving with the outcome field empty or whitespace-only is refused, with a visible message. The other five fields are optional
- After saving, the intent appears in the list showing its outcome
- After a page reload, saved intents are still in the list
- With no saved intents, the list shows a message saying what belongs there and pointing to the form
- The form can be completed and saved using only the keyboard: pressing Tab moves a visible focus outline to each field and button in turn
- One primary button, labeled with its action (for example "Save intent"), is fully inside the window at load, at both 1280x800 and 375x812, without scrolling
- At 375px viewport width, nothing requires horizontal scrolling
- The navigation bar shows "Intents", "References", and "About" at the top of the page in every view, and marks the current view with `aria-current="page"`
- On load the Intents view is shown. Activating a nav item shows that view and hides the other two. The tracker form and list appear only in Intents
- The address fragment follows the view (`#intents`, `#references`, `#about`). Opening a URL that ends in `#references` shows References, and the browser Back button returns to the previous view
- Switching views does not discard text typed into the form: after leaving Intents and returning, the form holds what was typed
- The nav items can be reached with Tab and activated with Enter, each with a visible focus outline
- The About view names each of Learn, Teach, and Master with one or two sentences, and names the book it comes from
- Every reference on the References view is one of: an item in the book's Appendix E, or a file or folder in this repository (including the "Project context" files). No other references appear
- Every external link on the References view is either one of the six the book states or a link to a file in this project's own repository (`https://github.com/kendallmark3/28-day-build/`). Each opens in a new tab with `rel="noopener noreferrer"` and has link text that says where it goes. No URL is given for an article the book gives only a title for
- In create mode (on page load, after a save, after an update, after Cancel) all six fields hold non-empty sample text, and the outcome sample begins with "Example:"
- Choosing "Save intent" on the untouched sample form saves it: the list gains one item showing the sample outcome
- At 375px viewport width the sample text is fully visible in all six fields, with no scrolling or clipping inside a field
- Each listed intent has an "Edit" button, reachable with Tab and activated with Enter. Activating it fills the form with that intent's six values and changes the primary button label to "Update intent"
- Saving in edit mode replaces that intent's values in place: the number of listed intents is unchanged and the list shows the new outcome. The empty-outcome refusal still applies
- After a reload, an edited intent shows its new values
- In edit mode a "Cancel" button is shown; activating it restores the sample text in all six fields and the label "Save intent", and leaves the saved intent unchanged
- The Intents view has a "Start from a Jira story" button that opens a modal dialog. Focus moves into the dialog, Esc or a Close button closes it, and focus returns to the button
- The modal opens with an example Jira story in the paste box, marked as an example. Choosing "Build my intent" on the untouched example fills six fields, and each field is labelled exactly one of "From your story", "Suggested", or "Not found"
- For the example story: the outcome contains "export a monthly usage report as a CSV" and "so that"; the inputs contain "analytics database" and "https://example.com/mockups/142"; the constraints contain "PDF export"; the success criteria contain all four acceptance criteria lines; the outputs and the stop condition are labelled "Suggested"
- The same example written with Jira markup (`h2.` headings, `*` bullets) and with Markdown headings (`##`) gives the same six field values
- A pasted story with no recognisable sections still produces a result: the outcome is taken from its first line, the other fields are labelled "Not found", and the notes say what is missing. A story that is empty or only whitespace is refused with a visible message
- The notes have two parts: "What didn't fit" lists the story lines placed in no field, and "What to improve" lists recommendations, each starting with one tag from Security, Missing, Uncheckable, Ambiguity, Stop, Scope, Size, Consequence, or Limits. For the example story the notes include an Uncheckable note naming "fast", an Ambiguity note naming "easy", and a Stop note. The last note is always a Limits note saying what the check cannot judge
- A story containing `password: hunter2` gets a Security note listed first
- "Download intent file" saves a `.md` file named with the Jira key (for example `intent-proj-142.md`). It has the six sections of `templates/feature-intent.md` in order, holds whatever the modal fields say at that moment (including edits), shows any empty field as a TODO line, and has a Status line naming the parts still missing
- "Use in form" copies the six fields into the main form and closes the modal. Choosing "Save intent" then adds the intent to the list
- The pasted story is not written to `localStorage`, and the app makes no request outside its own origin while the modal is used. HTML typed into the story is shown as text
- The whole modal flow works with the keyboard only, with a visible focus outline on every control, and at 375px the modal needs no horizontal scrolling
- The Intents view starts with a dashboard, visible at load, that shows "Intents saved" (the number of saved intents) and "Missing a constraint or stop condition" (the number of saved intents whose constraints or stop condition is empty). Both numbers are correct on load, after saving, after an update, and after a reload
- The dashboard's next-step line says: with no saved intents, to save the example or start from a Jira story; with one or more lacking a constraint or stop condition, to edit them; otherwise, to write the next intent or start from a Jira story
- The dashboard does not appear on the References or About views
- The References view has a "Project context" section listing all seven context files (`architecture.md`, `business-rules.md`, `example-intent.md`, `glossary.md`, `non-goals.md`, `security.md`, `ux-standard.md`), each with a purpose line and a link that opens that file in the project's GitHub repository. Every one of those links returns a page
- Each Jira-story note whose rule is written in `context/` ends with a "Source:" line naming the file and, for business rules, the rule number. The cited rule says what the note claims. Notes with no rule in `context/` show no Source line
- No text from the context files is copied into the app: only file names, purpose lines, and rule numbers appear
- The Saved intents panel has a "Reset to sample data" button. Activating it opens a confirmation dialog that says how many saved intents will be replaced, with "Replace with sample data" and "Cancel" buttons. Focus starts on Cancel, and Cancel or Esc closes the dialog and changes nothing
- Confirming replaces all saved intents with 3 sample intents. The list shows them, the dashboard shows 3 saved and 1 missing a constraint or stop condition, the stored data holds exactly those 3 records, and the result is the same after a reload
- After a reset, a message "Reset to sample data: 3 intents." is shown in a polite live region and focus moves to the Saved intents heading. If storage is blocked, the message says so and the list is unchanged
- If an intent is being edited when the reset is confirmed, the form returns to create mode with the sample text, and the stale edit cannot overwrite anything
- Reset changes only the app's own `localStorage` key; other keys are untouched. Sample intents can be edited and saved like any other
- The reset flow works with the keyboard only, with a visible focus outline on every control, and at 375px needs no horizontal scrolling
- After saving, updating, cancelling an edit, and using a story in the form, a status message naming the action is shown under the dashboard in a polite live region ("Saved: <outcome> (N saved).", "Updated: <outcome>.", "Edit cancelled. Nothing was changed.", "Story loaded into the form. Review it, then choose Save intent."). It is inside the window at 1280x800 and at 375x812, even when the page was scrolled to the bottom of a long list, with at least 8px of space above it. Outcomes longer than 60 characters are shortened in the message
- After "Use in form", both the status message and the Save button are inside the window at 1280x800
- The status message disappears when the user starts typing in the form or starts editing an intent
- After "Download intent file", the modal shows "Downloaded <file name>." in a polite live region
- The References and About views each end with a link to the Intents view; following it shows Intents
- `context/ux-standard.md` has no vague word from the app's list, and each of its rules names something that can be checked in the running app
- `context/example-intent.md` has the six intent parts and a "Why this works" line for each, and its six parts equal the app's first sample intent

## Stop when
- Every success criterion above has been checked in the running app, and each pass or fail result is recorded in `evidence/build-tracker.md`
- If a criterion fails, fix only that criterion and re-check it
- When all pass, stop. Do not restyle, refactor, or extend
- Ideas outside these criteria go under "What changed in the next intent" in the evidence record and are not built
