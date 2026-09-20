# Build Evidence — Intent tracker

Structured per `templates/evidence.md`. This is the "evidence record for the build" named in `intent/current-feature.md`. It is not tied to a numbered day: the build was done after Day 5, ahead of the plan's Day 7. See "What changed in the next intent".

## Intent tested
`intent/current-feature.md` (as refined through Day 5): a six-field intent form, a saved-intents list with an empty state, and `localStorage` persistence, in `app/`.

## Observed
Verified in real Chrome (headless, driven by a script). 15 checks were run; the first run passed 12, and after the fixes below the final run passed 15.

| # | Success criterion | Result | What was seen |
|---|---|---|---|
| 1 | Six labeled fields | pass | Labels: Outcome, Inputs, Outputs, Constraints, Success criteria, Stop condition, each tied to its control |
| 2 | Empty or whitespace-only outcome refused, with a visible message; other five fields optional | pass | Empty and `"   "` both left the list at 0 items and nothing in `localStorage`; message "Outcome is required. Describe what you want to accomplish." A save with only an outcome succeeded |
| 3 | Saved intent appears in the list showing its outcome | pass | List showed "Keyboard intent", then "Outcome only". All six values were present in the stored record |
| 4 | Saved intents survive a reload | pass | Both items still listed after `reload` |
| 5 | Empty state says what belongs there and points to the form | pass | On a cleared store: "No intents yet. An intent is a written outcome plus its inputs, ... Fill in the form above and choose "Save intent"." It hid once an item existed |
| 6 | Keyboard-only completion, visible focus on each control | pass | Tab reached outcome, inputs, outputs, constraints, criteria, stop, and the button in order, each with a solid 3px outline. A form filled by typing and Tab, then saved with Enter, produced a list item |
| 7 | One primary button labeled with its action, visible at load | pass | One `<button>` "Save intent". At 1280x800 its bottom edge is at y=719 (viewport 800) |
| 8 | No horizontal scroll at 375px | pass | `scrollWidth` 375 = `clientWidth` 375 |

- Also observed: an outcome of `<img src=x onerror=...>` was listed as text; no image element was created and the handler did not run. There were no console errors in the final run.
- Screenshots of the final state at 1280px and 375px were viewed. They match the table.
- Defects found by the checks and fixed, each within the boundary:
  - Criterion 7: the first build placed the button at y=1015, below the fold at 1280x800. I compacted the header and made the fields one row tall (`app/styles.css`, `app/index.html`). This changes the look of the page from the starter.
  - Console: `GET /favicon.ico` returned 404. I added an inline empty icon, `<link rel="icon" href="data:,">`.
  - Test flaw, not an app defect: the first Tab-order check started from the wrong field because the browser remembers focus position. I reloaded before the run.
- Files changed: `app/index.html`, `app/app.js`, `app/styles.css` (seeded from `starter/`, then modified), this record, and one line in `intent/current-feature.md` (below). `starter/` is unchanged (sizes match the original).
- The intent's runnable constraint named port 8080, but another program (a "Story Analyzer" node server) already owns 8080 on this machine, so the app was served on 8091. I changed the constraint to "any free port".
- Stop condition: all eight criteria have a recorded pass. Per the stop rule, nothing beyond fixing the two failures was done.

## Inferred
- Because the checks ran in one Chromium engine, the app very likely also works in Safari and Firefox, given plain DOM and `localStorage` APIs. That is not tested.
- Data written by `JSON.stringify` and read back by `JSON.parse` under one key gives the persistence seen. Corrupt stored data would fall back to an empty list, from the code path in `load()`; I did not test it.

## Assumed
- "Visible at load" (criterion 7) means inside the first screen at 1280x800. The criterion does not name a viewport. At 375x812 the button is also in view in the screenshot, but that was not checked by the script.
- "Visible focus outline" was checked by computed style (outline not `none`, width above 0), not by looking at each state. It passing does not prove contrast is sufficient.
- The stored key `intent-workbench-v1` and the `{intents: [...]}` shape are my choice. Nothing in the repo specifies them.

## Deterministic checks
- [x] Syntax / build — no build step; the page loads with no console errors.
- [x] Functional behavior — criteria 1–8, per the table.
- [x] Validation rules — empty and whitespace-only outcome refused.
- [ ] Accessibility spot-check — partial. Labels, focus outlines, and keyboard operation were checked. Screen-reader behavior and color contrast were not.

## What failed
- First run: criterion 7 (button below the fold), a console 404 for the favicon, and a flawed Tab-order test. All resolved. See Observed.
- Nothing is currently failing.

## What was not checked
- Any browser other than Chrome, and any real touch device.
- Screen readers and color contrast.
- Behavior when `localStorage` is blocked. The code shows a save error, but that path was not run.
- A stranger's ability to use the app (the Day 3 criterion "a first-time user creates an intent ... without asking for help" belongs to `project-intent.md` and is untested).
- The verification script lives in a temporary scratchpad, not the repo, so this run cannot be repeated from the repo alone.

## What changed in the next intent
- The plan puts the first build on Day 7, scoped as "a dashboard, one intent card, and a clear action to create an intent". This build came earlier and is broader. Day 6 (intent check) and Day 7 should start from this state, and Day 7's scope needs updating or dropping.
- Not built, per the stop rule (editing was added later; see the Addendum): editing and deleting intents, and any way to record that an intent was "successfully used", which `project-intent.md` now requires for capability promotion.
- The starter's dashboard, progress card, and hero were removed from `app/`. Whether later days expect them back is unchecked.

---

# Addendum — Edit action (added before Day 7)

The active intent was extended after the first build: `intent/current-feature.md` gained an Edit action and 4 criteria (9–12 below), and "editing" was removed from its non-goals. Reason: `project-intent.md` requires users to "create and edit" intents, and no later day (8–28) schedules editing. Deleting stays a non-goal.

## Observed
Verified in real Chrome after the change, re-running all original checks plus the new ones. 27 checks, 27 passed. The first run of the button-position check read 547 instead of 719 because the reloaded page was scrolled; the test was fixed to measure from the top of the page and re-run. The app was not changed for that.

| # | Criterion | Result | What was seen |
|---|---|---|---|
| 1–8 | Original eight criteria | pass | Re-run unchanged in substance. The button is fully in the window at 1280x800 (bottom y=719 of 800) and 375x812 (y=721 of 812). No horizontal scroll at 375px, including with Edit buttons and a 200-character outcome |
| 9 | Each listed intent has an Edit button, Tab-reachable, Enter fills the form, label becomes "Update intent" | pass | Two intents, two "Edit" buttons. Tabbing reached one with a visible outline. Enter filled all six fields with the stored values. Label read "Update intent" |
| 10 | Saving in edit mode replaces in place; empty outcome still refused | pass | List went from `["Keyboard intent","Outcome only"]` to `["Edited intent","Outcome only"]` (same count, same position). `id` and `created` kept; the stop field updated; other fields kept. A blank outcome in edit mode was refused and stored data unchanged |
| 11 | Edited values survive reload | pass | After reload, the list and the stored stop field showed the new values |
| 12 | Cancel shown in edit mode; empties form, restores "Save intent", leaves data unchanged | pass | Cancel hidden at load, shown in edit mode. After typing extra text and cancelling, all six fields were empty, the label was "Save intent", and the stored data matched a snapshot taken before |

- Screenshots at 1280px (edit mode), and 375px, were viewed. The layout is intact; Edit buttons sit at the right of each row.
- Files changed for this addendum: `app/index.html`, `app/app.js`, `app/styles.css`, `intent/current-feature.md`, `intent/project-intent.md`, `days/day-07.md` (see `evidence/day-06.md`, follow-up).
- Stop condition: all 12 criteria have a recorded pass. Nothing beyond the criteria was built.

## Inferred
- Because an edit keeps the same record `id`, any later feature that links to an intent by `id` (evidence, capabilities) will keep working after an edit. This is from the code, not tested.

## Assumed
- Edit-in-place through the top form is acceptable behavior. Nothing in the repo specifies inline editing versus a form.
- After a successful Update, the form returns to create mode with focus in Outcome. This was my choice.

## What was not checked
- Everything listed under "What was not checked" in the first record still applies (other browsers, screen readers, contrast, blocked storage, a first-time user).
- Editing while another browser tab has the same data open. The last write wins; that was not tested.
- Focus after Update. It lands on the Outcome field; whether that suits a keyboard user was not checked with a person.

## What changed in the next intent
- Not built, per the stop rule: deleting intents; any way to record "successful use".
- Day 7 (dashboard) now builds on this state; see `days/day-07.md`.

---

# Addendum 2 — Sample text in the form (added before Day 7)

Requested: "fill in some [inputs, outputs, constraints, success criteria] ... so they can see it run the first time when they save it ... every time you pull up that form, when it's brand new, put the ..." The message was cut off at that point. I read it as "put the sample text back", so a new form always starts with sample text. Please correct me if the ending meant something else.

`intent/current-feature.md` gained 3 criteria and 1 output (sample text in create mode; Save on the untouched sample works; sample fully visible at 375px), and its Cancel criterion changed from "empties the form" to "restores the sample text".

## Observed
- Change: sample text is set as each field's default value in `app/index.html`, so the existing `form.reset()` (used after Save, Update, and Cancel) restores it. No JavaScript changed. The empty-state message now reads: "...The form above starts with an example. Change it or save it as is with "Save intent"."
- Sample text:
  - Outcome: "Example: Weekly ticket report"
  - Inputs: "Last week's ticket export (CSV)"
  - Outputs: "One-page summary (summary.md)"
  - Constraints: "No customer names; <300 words"
  - Success criteria: "Top 3 issues; counts match CSV"
  - Stop condition: "Stop when top 3 issues verified"
- Verified in real Chrome: 32 checks, 32 passed after fixes (31/31 before the clipping criterion was added). The new checks:
  - S1: on load all six fields are non-empty and the outcome starts "Example:".
  - S2: Save on the untouched form adds one list item with the sample outcome, and all six stored values equal the samples.
  - S3, S4: the form returns to the samples after Save and after a reload.
  - C10d, C12c: after Update and after Cancel the form returns to the samples, not to empty.
  - S5: at 375px none of the six fields clips its text.
- All earlier criteria (empty outcome refused, outcome-only save, keyboard, edit, Cancel, layout, no console errors) were re-run and pass under the new behavior. The tests that assumed an empty form were rewritten to clear the outcome first.
- **A defect was found by looking, not by the checks.** My first samples were longer, and at 375px the one-row fields cut the text off. Making the fields taller would have pushed Save below the fold at 375x812 (criterion 7). I shortened the samples to fit one line and added S5 so this is now checked.
- Files changed: `app/index.html`, `intent/current-feature.md`, this record. `app/app.js` and `app/styles.css` are unchanged.

## Inferred
- Sample text in the HTML rather than in JavaScript means the samples cannot drift from what Cancel/reset restores.
- Sample text this short gives a reader the shape of an intent but not a full worked example. Day 9 ("add one example of excellent intent output") may want a richer one.

## Assumed
- Sample text should also appear in the Outcome field, so a first Save works without typing. The alternative, an empty Outcome with placeholder text, would show the "Outcome is required" message on the first Save, which is the confusion the request was meant to avoid.
- "Every time you pull up that form" means every create-mode view: page load, after Save, after Update, after Cancel.
- Anyone who saves the sample unchanged will have an item beginning "Example:" in their list. There is no delete (a non-goal), so they can only edit it.
- The sample (a support-ticket summary) is a good generic example. I chose it; it comes from nothing in the repo.

## What was not checked
- Whether a first-time user finds the sample text clearer. That needs a person.
- Fields on widths between 375px and 1280px, and long text in browsers that render inputs with different padding. The clipping check ran only at 375px, in Chrome.
- Users with screen readers: sample text is read as if the user had typed it. Not tested.

## What changed in the next intent
- Deleting intents is still a non-goal. With sample text now easy to save, a stray "Example:" item is more likely, which may justify a delete action. Not built, per the stop rule.

---

# Addendum 3 — Navigation, References, About (added before Day 7)

Requested: two navigation links at the top of the page, so a user can toggle between the intent page, a References page ("learn teach master and all the references that you have"), and an About page (the learn-teach-master concept). The request was spoken and partly garbled ("two links ... plus the reference page plus the about page"). I read it as one nav with three items: Intents, References, About.

`intent/current-feature.md` changed before any code:
- Outputs gained the nav bar, the References view, and the About view.
- The non-goal "additional pages or routes" became "any view beyond Intents, References, and About".
- The constraint "no network calls" was clarified: the app makes no network calls; external links are plain anchors opened by the user's click, in a new tab with `rel="noopener noreferrer"`.
- 9 success criteria were added (nav, view switching, URL fragment and Back, kept form text, keyboard, About content, source of every reference, external link rules).

## Observed
- Source material: no "learn, teach, master" framework exists in the repo's text files. It is in the book (`book/The-Ultimate-Guide-to-Claude.pdf`): the closing chapter "Monday Morning" ("Learn it, teach it, master it") and the front matter, which names LearnTeachMaster.org. The book's Appendix E "Sources and Further Reading" is the reference list. I extracted the PDF text with `pdftotext` and used only that.
- Build: `app/index.html` (nav in the header; three views, two hidden at a time), `app/app.js` (about 20 lines: a hash router; focus moves to the view's heading on a user-initiated switch), `app/styles.css` (nav, link, and list styles). The starter-derived form and list are untouched and live in the Intents view.
- References page content: 2 sites, 10 article titles, 3 GitHub repos, the product docs link, and 7 repository entries (book, `START-HERE.md`, `ROADMAP.md`, `context/`, `skills/`, `templates/`, `reference-final/`). About page: the book's arc quoted, one short paragraph each for Learn, Teach, Master, and a short "About IntentWorkbench" paragraph with the not-affiliated notice from the repo's README.
- Verified in real Chrome: 55 checks, 55 passed, in three consecutive runs. New checks and what they showed:
  - Nav shows Intents, References, About near the top (y=75) and stays there on every view; the current item has `aria-current="page"`.
  - On load only Intents shows. Clicking a nav item shows that view alone; the form is hidden on References and About.
  - The URL fragment follows the view; opening `#references` directly shows References; an unknown fragment falls back to Intents; Back returns to the previous view.
  - Text typed into the form was still there after visiting References and coming back.
  - Tab reaches the nav links first (with a visible outline) and Enter switches view.
  - The 10 article titles equal the book's Appendix E titles, in order, exactly. The check parsed them from the extracted book text, not from a copy of mine.
  - Exactly 6 links, all addresses that appear in the book text; none of the article titles is a link; every link has `target="_blank"`, `rel` with `noopener` and `noreferrer`, and link text. All 7 repository entries exist on disk.
  - The two quoted passages on About match the book verbatim.
  - The app made no request outside its own origin during the run. Only its own files loaded.
  - No horizontal scroll on References or About at 1280px or 375px. No console errors.
- All earlier criteria were re-run and pass. The keyboard-order test was updated to expect the three nav links before the form.
- Layout effect: at 375x812 the Save button's bottom edge moved from y=721 to y=781 (viewport 812) because the nav wraps under the title on a phone. Still inside the window, with 31px to spare. At 1280x800 it is unchanged at 719.
- Before the build I checked that all 6 reference URLs return HTTP 200 with `curl` (one-off, not part of the app). `docs.claude.com` redirects to `platform.claude.com/docs/en/home`; the page links the address the book gives.
- First two runs of the new checks had failures (2, then 1) in the view-switch checks. They moved between runs and disappeared when the script waited for the browser's fragment-change event. I judged them a test timing race, not an app defect, and ran the full suite three times afterward. All passed.
- Files changed: `app/index.html`, `app/app.js`, `app/styles.css`, `intent/current-feature.md`, this record.

## Inferred
- "Learn / Teach / Master" text is grounded in the book: Learn and Teach paraphrase the book's week 1 and week 4 rows; Master uses the book's own sentence. The book gives no separate "master" week, so that paragraph is thinner than the other two.
- The book gives article titles without addresses, so I have not linked them. A reader must search LearnTeachMaster.org, which the page says.

## Assumed
- The About page should explain the concept and credit the book, not tell the author's story. Mark Kendall appears only as the book's author. Change it if you want it to speak in the first person.
- "All the references that you have" means the book's Appendix E plus the repository's own reference files. Nothing from the web beyond what the book lists was added.
- Whether the GitHub repositories and article titles are still current is not something I can vouch for; I checked only that the six addresses respond.

## What was not checked
- Whether the external sites show the content the book describes; I checked the status code, not the pages.
- The three views in Safari or Firefox, on a real phone, or with a screen reader. Focus moving to the view heading on a switch was not tested with assistive technology.
- Whether a first-time user finds the nav clear.
- Reading the About and References text with a person, for tone or length.

## What changed in the next intent
- Day 13 ("Add navigation, useful empty states, and obvious next actions") is now partly done. Its own intent check should start from the current state.
- Day 8 ("Document architecture, domain terms, security, and non-goals. Make the app point to context rather than burying it") may reuse the References view; the "In this repository" list is plain text because `app/` cannot serve files from outside itself.
- Day 25 ("Start here experience") may want an on-ramp to the About page's content.

---

# Addendum 4 — Start from a Jira story (added before Day 7)

Requested: a modal where the user pastes a Jira story; the app works out what goes in the six boxes and fills them in; at the bottom, notes on what did not fit and what to improve, "using the principles that we know"; and a download of the first intent file. A second round ("paste a new Jira story", fixing the story for them, progressive intent) was explicitly left for later.

## Design decision
The project forbids AI calls from the browser (`context/non-goals.md`, `context/security.md`), so the "intelligence" is rule-based code in `app/app.js`: same text in, same result out, no network. It reads the story's structure and applies the intent-check questions the project already uses (ambiguity, missing pieces, uncheckable criteria, missing stop condition), plus scope, size, consequence, and secrets. Each filled field is labelled "From your story", "Suggested", or "Not found", which mirrors the project's observed / inferred / assumed labelling.

`intent/current-feature.md` was changed first: 1 output, 1 constraint (rule-based, no network, story never stored), the non-goals (rewriting the story, a second story, Jira import, saving the story), and 12 criteria written against the example story.

## Observed
- Built in `app/index.html` (a small "Start from a Jira story" button in the form's heading row, and a `<dialog>`), `app/app.js` (about 250 lines: `analyzeStory`, `intentMarkdown`, modal wiring), `app/styles.css`. The native `<dialog>` gives the focus trap and Esc handling.
- What the analysis does: finds the Jira key and title; reads sections (Description, Acceptance Criteria, Definition of Done, Constraints, Out of scope, Dependencies/Inputs, Deliverables) in plain, Markdown, Jira-markup (`h2.`, `*bold*`, `*` bullets), and "Heading:" styles; parses "As a … I want … so that …"; treats Given/When/Then lines as criteria; picks out constraint wording ("must not", "only", "without", limits) and links, files, and other ticket keys as inputs.
- The example story (opens in the paste box, marked as an example) produces: outcome "Export a monthly usage report as a CSV so that I can share it with customers without asking an engineer"; inputs (analytics database, the mockup URL); constraint "Out of scope: PDF export"; the four acceptance criteria; outputs and stop condition labelled Suggested. Its notes: Uncheckable ("fast"), Ambiguity ("easy"), Stop, Missing (confirm the Suggested parts), Limits. "What didn't fit" holds the one description line.
- The downloaded file was captured from a real browser download, `intent-proj-142.md`. It has the template's six sections in order, a "Source: Jira story PROJ-142" line, a "Status: DRAFT" line, and the user's edit from the modal. A story with no sections produced `intent-make-the-login-page-nicer.md` with five TODO lines and "Status: DRAFT. Still missing: constraints, success criteria, stop condition."
- Verified in real Chrome: 86 checks, 86 passed, in two consecutive runs and a third after the last code change. New checks (31): open/close/Esc/focus return; example prefilled and labelled; Build fills six labelled fields; content of each field for the example; the same story in Jira markup, Markdown, bold headings, and "Heading:" style gives identical fields; whitespace-only story refused; a story with no sections still works; note tags and ordering (Limits last); a `password: hunter2` story gets Security first; the download (name, section order, edited text, TODO lines, status); Use in form copies the fields, closes the modal, and Save adds an intent with 4 criteria lines intact; the story is not in `localStorage`; HTML in the story is shown as text; keyboard-only flow with visible outlines; the open modal at 375px has no horizontal scroll; no request left the app's own origin during the entire run.
- Defects found and fixed while building:
  - The new button made the heading row taller, so on a phone Save moved to y=813 in an 812px window, one pixel off screen (criterion 7). Fixed by tightening the phone header gap. Save is now at y=799 of 812: 13px to spare.
  - The example story opened scrolled to its end, hiding the title and user story on a phone. Fixed by putting the cursor at the start when the modal opens or returns to the story.
  - Two errors in my test script (a reused variable name; an earlier timing race already noted in Addendum 3). Not app defects.
- Screenshots of the story step, the results step, the notes, and the phone layout were viewed.
- Files changed: `app/index.html`, `app/app.js`, `app/styles.css`, `intent/current-feature.md`, this record.

## Inferred
- Section-based reading should work on text copied from Jira's rendered page, because headings copied as plain lines ("Acceptance Criteria") match, and bullet markers are optional. This is from how the code works, not from a test.
- The multi-line results in the main form (criteria as separate lines) need the fields to grow; I made them grow on "Use in form" and on Edit, and shrink back after Save, Update, and Cancel.

## Assumed
- Jira stories are English, with headings in the wording the app knows ("Acceptance Criteria", "Out of scope", "Dependencies", etc.). Headings worded differently (for example "What done looks like") will not be recognized, and those lines will show up under "What didn't fit".
- One story per paste. Two stories are detected and flagged as a Size note, but not split.
- The example story is realistic. I wrote it, and deliberately gave it a vague word, a missing definition of done, and no constraints other than out-of-scope, so the notes have something to say. It is not from any real ticket.
- The list of vague words (about 35) and consequence words (production, payment, billing, PII, delete, security, credentials, and similar) is my choice. Nothing in the repo specifies it.
- "Use in form" replaces whatever is in the main form, including an intent being edited, without asking.

## What was not checked
- Any real Jira story from your organization. All testing used the example and a few short synthetic stories.
- Text pasted from Jira's rich editor, Jira Cloud's exported formats (tables, Atlassian Document Format), or stories with nested bullets, tables, or attachments.
- Whether the recommendations are good advice for a real story. They come from fixed rules, and I judged them only on the example.
- Firefox and Safari; the modal in a screen reader.
- The note tag for "Suggested parts, please confirm" is "Missing", which reads oddly. I kept the nine tags the criteria name.
- Very long stories. The Size note triggers at over 8 criteria or 400 words; that limit is a guess.

## What changed in the next intent
- Deferred by request, not built: pasting a second story, fixing the story for the user after they respond, and using a second story to refine the first (progressive intent).
- Ideas that would improve this round, not built: recognizing more heading names; a way for the user to tell the app which line belongs where; showing which story line each field came from.
- Day 13 ("Add navigation, useful empty states, obvious next actions") and Day 17 ("readiness score based on required fields and checkability rules") now overlap with this work. Day 17 could reuse the checkability rules written here.
