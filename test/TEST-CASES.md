# IntentWorkbench: manual test cases

**Written for:** the project owner, testing by hand (clicking).
**Why this exists:** 423 automated checks pass, but they were written by the same author as the app, in one browser (Chrome), with no person using it. Your clicking covers what they can't: whether it makes sense, feels right, and works in your browser and on your phone.

Tick a box when a step behaves as described. If something differs, write what you saw in **Notes** and mark the case **Fail**. Priority: **P1** = a project success criterion or a demo path, **P2** = important, **P3** = nice to know.

---

## 1. What you should have after the 28 days

| What | Where | What to check by hand |
|---|---|---|
| **A working app** (no install, no build) | `app/`, started by `./run-app.sh` | Sections 3 to 12 below |
| **Seven screens**: Start, Intents, Review, Capabilities, Overview, References, About | the app's navigation bar | Every screen opens and makes sense |
| **The method as a loop**: intent, readiness check, labelled evidence, review, guardrails, reusable capability | Start, Intents, Review, Capabilities | Section 3 (the whole loop, once) |
| **28 evidence records**, one per day | `evidence/day-01.md` to `day-28.md` | Read any two: do they say what was seen versus assumed? |
| **The rules behind the app, as files** | `context/` (7 files), `skills/` (2 files) | Open two; do they match what the app does? |
| **Release documents** | `docs/RELEASE-NOTES.md`, `DEMO-SCRIPT.md`, `NEXT-INTENT.md`, `REFLECTION.md`, `RELEASE-CHECKLIST.md` | Section 13 |
| **A release review** that says what is not yet proven | `reviews/day-28-release-review.md` | Section 14 |
| **Automated checks you can re-run** | `evidence/checks/` (needs Node and Chrome) | Optional: `evidence/checks/README.md` |

**What we built, in one paragraph:** a local-first web app where you write what you want as a six-part *intent* (outcome, inputs, outputs, constraints, success criteria, stop condition), get it scored for readiness, attach evidence where each claim is labelled *observed*, *inferred*, or *assumed*, record a review of the result, set how costly a mistake would be (which changes the checks expected), and turn work that succeeds twice into a reusable *capability*. It also turns a pasted Jira story into a draft intent. Everything stays in your browser; nothing is sent anywhere.

**What matters most** (the project's six success criteria, tested first, in section 2):
1. A new user can run it in under 3 minutes.
2. You can create and edit an intent with all six parts.
3. You can attach evidence and tell observed, inferred, and assumed apart.
4. You can run a readiness check before trusting a result.
5. A capability can be promoted only after 2 successful uses, and the app refuses (and says how many are missing) before that.
6. A first-time user can create an intent with no help. **See the note in TC-06.**

---

## 2. Setup

1. Open a terminal in the repository folder.
2. Run `./run-app.sh` (use `./run-app.sh 9000` if port 8080 is taken). You need Python 3.
3. Open the address it prints (default http://localhost:8080) in a fresh browser window.
4. To start clean at any point: open developer tools, Application (Chrome) or Storage (Firefox), Local Storage, and delete the key `intent-workbench-v1`, then reload.

Your results: use the table in section 15 as you go.

---

## 3. The six project success criteria (P1: do these first)

### TC-01 (P1): run it in under 3 minutes
Time yourself from opening the README to seeing the app.
- [ ] The README tells you what to type (`./run-app.sh`) and what you need (Python 3)
- [ ] The app opens without any install step
- [ ] Total time: ______ (target: under 3 minutes)

### TC-02 (P1): create and edit an intent
Start clean (setup step 4). Open **Intents**.
- [ ] The form has six labelled boxes: Outcome, Inputs, Outputs, Constraints, Success criteria, Stop condition
- [ ] They start filled with an example, so pressing **Save intent** works straight away
- [ ] After saving, the message reads "Saved: Example: Weekly ticket report (1 saved)." and the intent appears in **Saved intents**
- [ ] Type your own six parts and save. Reload the page: it is still there
- [ ] Press **Edit** on it, change the outcome, press **Update intent**: the list shows the new outcome and there is no duplicate
- [ ] Clear the Outcome box and press Save: it refuses with "Outcome is required. Describe what you want to accomplish."

### TC-03 (P1): evidence with labels
Open **Review**, pick your intent.
- [ ] Under **Add a claim**, type a claim but leave "How do you know?" on *Choose one* and press **Save claim**: it refuses ("Choose whether this claim is observed, inferred, or assumed.")
- [ ] Add three claims, one of each label. Each shows a badge: Observed, Inferred, Assumed
- [ ] A summary line reads "3 claims: 1 observed, 1 inferred, 1 assumed. 1 assumed claim still needs confirming."
- [ ] Change the assumed claim's label to Observed using its dropdown: the badge and the summary update

### TC-04 (P1): readiness check
On **Review**, look at **Readiness** for a complete intent, then for a half-written one.
- [ ] A complete intent reads "Readiness: 100%. Ready." with eight Pass rows
- [ ] Make a new intent with only an outcome (clear the other five boxes): it reads a low percentage and "Not ready yet.", with Fix rows and "Fix N required items: ..."
- [ ] Press **Edit this intent**, fill the missing parts, update, return to Review: it now reads Ready
- [ ] Put a vague word ("fast", "easy") in a success criterion: the check says that criterion "cannot be marked pass or fail as written"

### TC-05 (P1): promotion needs 2 successful uses
Open **Capabilities**.
- [ ] Add an item (name required, pick a rung). It appears in the list
- [ ] Press **Promote** straight away: refused with "Promotion needs 2 successful uses. 2 more uses are needed."
- [ ] Press **Record a successful use** once, then Promote: refused, "1 more use is needed"
- [ ] Record an *unsuccessful* use: it does not count toward promotion
- [ ] Wait 2 seconds, record a second successful use, press Promote: it promotes and the card shows **Promoted**
- [ ] Double-click **Record a successful use** quickly: only **one** use is recorded, with a message that it was just recorded

### TC-06 (P1): a first-time user creates an intent with no help
**Please read first.** You know the app better than anyone, so you cannot be the "first-time user" here; nothing you do can show whether a newcomer would manage. Give this to **one person who has never seen it**. Say only: "Open this and create an intent." Do not help. Watch, and write down where they hesitate.
- [ ] They found where to start without being told
- [ ] They saved an intent
- [ ] Time to first saved intent: ______
- [ ] Where they hesitated or guessed: ______________________________________

---

## 4. The Start view and the whole loop

### TC-07 (P1): Start view teaches the loop
Start clean, open **Start**.
- [ ] It shows the rule "Prompt to explore. Write intent to repeat." and the loop "Intent, Result, Evidence, Refined Intent, Better Result"
- [ ] It shows six steps, all **To do**, and "0 of 6 steps done. Next: write an intent."
- [ ] Following only the links on this page, complete all six steps (write an intent; check it is ready; record labelled evidence; record a review; set a consequence level; record a successful use of a capability). The summary counts up and finishes with "All 6 steps done."
- [ ] At any point, did you have to guess what to do next? ______

### TC-08 (P2): sample project
- [ ] On Start, press **Load the sample project**. A confirmation appears saying what will be replaced; press Cancel: nothing changes
- [ ] Press it again and confirm: "Sample project loaded", all six steps Done, and a tour of three intents (ready 100%, ready 100% with 1 open minimum, not ready 38%)

### TC-09 (P2): the dashboard
On **Intents** with no saved intents:
- [ ] The next-step line says to save the example or start from a Jira story, with a "New here? Open Start." link
- [ ] With saved intents missing a constraint or stop condition, it says how many and to edit them

---

## 5. Jira story helper

### TC-10 (P1): Jira story to intent
On **Intents**, press **Start from a Jira story**.
- [ ] A dialog opens with an example story, marked as an example. Escape closes it and returns focus to the button
- [ ] Press **Build my intent**: six parts appear, each labelled **From your story**, **Suggested**, or **Not found**
- [ ] Notes list "What didn't fit" and "What to improve"; you can find one about "fast" and one about "easy"; some end in a "Source:" line
- [ ] **Download intent file** saves `intent-proj-142.md`; open it: it has the six sections and a Status line
- [ ] **Use in form** copies the six parts into the main form and says to review and press Save; the Save button is still on screen
- [ ] Paste one of **your own real Jira stories**: is the result useful? Which parts did it get wrong? ______________________________________
- [ ] Paste a story containing `password: hunter2`: a Security note appears first

---

## 6. Guardrails and reviews

### TC-11 (P1): guardrails change with the stakes
On **Review**, pick an intent, use **Consequence if this goes wrong**.
- [ ] Low shows 2 minimums, Medium 4, High 6; each higher level includes the lower ones
- [ ] Each is marked Met, Open, or Check yourself, and the summary says how many are open
- [ ] High shows an approver box and says the app cannot verify who approved. Try an empty name (refused), then a name (recorded)
- [ ] Nothing is blocked: you can still save and edit intents while minimums are open

### TC-12 (P2): record a review
On **Review**, under **Record a review**.
- [ ] One row per success criterion, each defaulting to **Untested**
- [ ] Press **Record review** with "Not checked" empty: refused ("Say what was not checked. A review always names its gaps.")
- [ ] Fill it in (mark some Met/Unmet, type findings in the Observed/Inferred/Assumed boxes, fill Not checked) and record: "Review saved: N met, M unmet, K untested." and it appears under **Reviews** with labelled findings
- [ ] For a Medium consequence intent, the "record a review" minimum becomes Met without reloading

---

## 7. Capabilities and the ladder

### TC-13 (P2)
- [ ] The ladder shows five rungs in order: Prompt, Skill, Trigger, Workflow, Business capability, each with a meaning and an item count
- [ ] Two built-in cards ("Intent check", "Evidence-first review") show purpose, procedure, output, checks, owner, version, a source link, and a **Sample usage**
- [ ] Change a card's **Rung**: its badge and the ladder counts update
- [ ] The "Source file" links open the right file on GitHub in a new tab

---

## 8. Overview and progress

### TC-14 (P2)
Load the sample project first.
- [ ] **Outcomes** shows exactly four counts: Intents ready, Reviews completed, Capabilities promoted, 28-day progress; and says what is deliberately not measured
- [ ] **How it fits together** shows six stages with counts (Intent, Context, Build, Evidence, Review, Capability) and links that work
- [ ] **28-day progress**: 28 tickable days with titles; tick one, reload, it stays ticked; the Outcomes count changes
- [ ] Do the four outcome counts mean something to you? Would you add or remove any? ______

---

## 9. Reset, persistence, and failure

### TC-15 (P1): data survives and can be reset
- [ ] Save an intent, close the tab, reopen the address: your data is there
- [ ] **Reset to sample data** (Intents, Saved intents) names how many intents will be replaced; Cancel changes nothing; confirm gives 3 intents
- [ ] Start editing an intent, then reset: the form returns to normal and does not overwrite anything

### TC-15b (P1): delete one intent, or start over
- [ ] Every saved intent has a **Delete** button; it opens a dialog naming the intent and how many evidence records and reviews will go with it; Cancel changes nothing
- [ ] Confirm: the intent, its evidence, and its reviews are gone, the other intents are untouched, and the status line says "Deleted: …"
- [ ] Start editing an intent, then delete it: the form returns to "New intent"
- [ ] **Start with an empty project** (below the list) says what it will delete; Cancel changes nothing; confirm leaves no intents, evidence, reviews, capability uses, or ticked progress days
- [ ] After clearing, write a new intent and take it through Review (readiness, evidence, review record)

### TC-16 (P1): unreadable data is not silently lost
In developer tools, set the Local Storage key `intent-workbench-v1` to `{not json`, then reload.
- [ ] A red banner says your saved data could not be read, and offers **Download a copy of the data**, **Start with an empty project**, **Dismiss**
- [ ] Download a copy: the file contains exactly `{not json`
- [ ] Press Save intent: it works, the banner goes away
- [ ] Look at the key `intent-workbench-v1-backup`: it still holds the original text

### TC-17 (P3): other failures
- [ ] Set `intent-workbench-v1` to `{"intents":[{"id":1,"outcome":"ok"},{"id":2,"outcome":""}]}` and reload: a banner says 1 saved record was invalid and left out, and the valid one still shows
- [ ] Open the app in a private window with site data blocked (if your browser allows): a banner says nothing will be saved

---

## 10. Look and feel

### TC-18 (P1): phone
Use developer tools' device mode at **375 x 812**, or open http://YOUR-COMPUTER-IP:8080 on your phone (same Wi-Fi).
- [ ] Nothing scrolls sideways on any of the seven screens
- [ ] On Intents, **Save intent** is visible without scrolling
- [ ] Buttons are easy to tap; text is readable; the navigation wraps sensibly
- [ ] Anything cut off, overlapping, or awkward? ______________________________________

### TC-19 (P2): keyboard only
Unplug the mouse mentally: use Tab, Shift+Tab, Enter, Space, Escape.
- [ ] A visible outline shows where you are on every button, link, field, and dropdown
- [ ] You can complete the loop (save an intent, add a claim, record a review) without the mouse
- [ ] Escape closes the Jira dialog and the reset confirmation, and you land back where you were

### TC-20 (P3): looks
- [ ] Buttons, links, and text look consistent across screens (orange buttons, rust-coloured links)
- [ ] Anything you would change first, if you were demoing this? ______________________________________

---

## 11. Other browsers and machines (P2)

Repeat TC-02, TC-10, TC-16, and TC-18 in each:
- [ ] Safari: ______
- [ ] Firefox: ______
- [ ] Edge or another: ______
- [ ] Windows: run `run-app.bat` and open the app (this script has never been run): ______

---

## 12. Things it should NOT do

- [ ] It never makes a network request on its own (developer tools, Network tab, while clicking through: only the app's own files)
- [ ] It never asks for a login, key, or payment
- [ ] Pasting HTML or script into any box shows it as plain text (try `<b>x</b>` and `<img src=x onerror=alert(1)>` as an outcome, a claim, and a capability name)
- [ ] You cannot delete an intent, edit a claim's text, or switch projects. These are deliberate for now. Note whether you missed any: ______

---

## 13. The release documents

- [ ] `docs/RELEASE-NOTES.md`: is what it says included true, and are the known limitations fair?
- [ ] `docs/DEMO-SCRIPT.md`: read it aloud while doing each step in the app. Time: ______ (target: about 3 minutes). Did anything not match the screen? ______
- [ ] `docs/NEXT-INTENT.md`: is "import a saved copy" the right next step, or does your testing point elsewhere? ______
- [ ] `docs/REFLECTION.md`: written by Claude. Add your own notes at the bottom
- [ ] `docs/RELEASE-CHECKLIST.md`: one item is unticked (independent review). Do you agree with the other 14?

## 14. The release review

- [ ] Read `reviews/day-28-release-review.md`. It says: ready for a demonstration, not yet proven for unaided first use, and no independent review. Does your testing agree?

---

## 15. Your results

| Case | Pass / Fail / Skipped | Notes (what you saw; browser and screen size if it matters) |
|---|---|---|
| TC-01 run in 3 minutes | | |
| TC-02 create and edit | | |
| TC-03 evidence labels | | |
| TC-04 readiness | | |
| TC-05 promotion | | |
| TC-06 first-time user (someone else) | | |
| TC-07 Start view and the loop | | |
| TC-08 sample project | | |
| TC-09 dashboard | | |
| TC-10 Jira helper | | |
| TC-11 guardrails | | |
| TC-12 record a review | | |
| TC-13 capabilities | | |
| TC-14 overview and progress | | |
| TC-15 persistence and reset | | |
| TC-16 unreadable data | | |
| TC-17 other failures | | |
| TC-18 phone | | |
| TC-19 keyboard | | |
| TC-20 looks | | |
| Section 11 other browsers | | |
| Section 12 should NOT do | | |
| Section 13 documents | | |

**Overall:** would you show this to a customer today? Yes / No / With these fixes: ______________________________________

**Top three things to fix first:**
1. ______
2. ______
3. ______

When you're done, send me the table and notes. I'll treat each Fail as a failed criterion: fix only that, re-check it, and add a check so it can't come back.
