# 3-Minute Demo Script

Seven steps, 180 seconds. Each step was run in the app by a script and every claim below was checked against what the screen shows (see `evidence/day-28.md`). Load the sample project first: on the Start view choose "Load the sample project".

1. **Problem (20 sec):** Good AI work disappears into chat history. IntentWorkbench turns it into something your team keeps: a written intent, checked evidence, and reusable capabilities. It all runs in this browser.
   On screen: the Start view. Point at the rule, "Prompt to explore. Write intent to repeat."
2. **Intent (35 sec):** An intent has six parts: outcome, inputs, outputs, constraints, success criteria, and a stop condition. The form starts with an example, so the first save works. Or paste a Jira story and it fills the six parts in, with notes on what is vague.
   On screen: the Intents view, then "Start from a Jira story" and "Build my intent".
3. **Context (25 sec):** The rules this app follows live in files, not buried in code. The References page links each one, and the notes on a story cite the exact rule they come from.
   On screen: the References view, "Project context" list.
4. **Evidence (35 sec):** Every claim is observed, inferred, or assumed. Here one assumption is still unconfirmed, and the app says so. The readiness check scores this intent one hundred percent. The draft scores thirty-eight and lists what to fix.
   On screen: the Review view for the first intent, then the draft intent.
5. **Guardrails (25 sec):** Set the consequence of a mistake. Low asks for two checks. High asks for six, including a named approver. The app reports what is met and what is open. It never blocks you.
   On screen: the consequence selector on the Review view.
6. **Capability (25 sec):** Work that succeeds twice can be promoted. Try too early and the app refuses and says how many uses are missing. Record the second success and it promotes.
   On screen: the Capabilities view, the review skill card.
7. **Close (15 sec):** The Overview shows four outcomes, not activity counts, and the loop: intent, result, evidence, refined intent, better result.
   On screen: the Overview view, Outcomes and "How it fits together".
