# Glossary

- **Intent**: written statement of the outcome and why it matters.
- **Inputs**: what may be used.
- **Outputs**: what should be produced.
- **Success criteria**: checks that indicate completion/correctness.
- **Constraint**: boundary that must hold.
- **Stop condition**: explicit definition of when work is finished.
- **Evidence**: information used to support a conclusion.
- **Capability**: reusable, governed way of performing useful work.
- **Guardrail**: a control sized to the consequence of failure. In the app, the minimum checks shown for a low, medium, or high consequence intent; they guide and report, and never block.
- **Intent check**: reading an intent before building it, to find ambiguity, missing pieces, contradictions, uncheckable criteria, and a missing stop condition. See `skills/intent-check.md`.
- **Progressive intent**: working in rounds, where the evidence from one result decides the next, sharper intent.
- **Observed / inferred / assumed**: the three labels for an evidence claim. Observed was directly seen, inferred was reasoned from observations, assumed is not yet verified.
- **Claim**: one statement about an intent's result that someone may rely on. Every claim is labelled observed, inferred, or assumed.
- **Evidence record**: a claim attached to one intent, with its label and where it came from.
- **Review record**: a review of one intent: each success criterion marked met, unmet, or untested, findings each labelled observed, inferred, or assumed, and what was not checked.
- **Ready**: an intent with an outcome, at least one constraint, and a stop condition (business rules 1 and 3).
- **Dashboard**: the summary at the top of the Intents view: intents saved, intents missing a constraint or stop condition, and the next step.
- **Jira story**: the ticket text a user pastes into the app to start an intent.

## Labels on a filled-in intent part
- **From your story**: the text was found in the pasted story.
- **Suggested**: the app filled the part in from other parts of the story, and the user should confirm it.
- **Not found**: nothing in the story could be placed in this part.

## Tags on Jira story notes
- **Security**: the story appears to contain a secret or credential.
- **Missing**: a part of the intent is absent, or was suggested by the app and needs confirming.
- **Uncheckable**: a success criterion cannot be judged pass or fail as written.
- **Ambiguity**: a vague word that different people would read differently.
- **Stop**: there is no stop condition, or one was suggested.
- **Scope**: nothing says what is out of scope.
- **Size**: the story looks too large, or like several stories in one.
- **Consequence**: the story touches something where a mistake is costly, so approval should be named.
- **Limits**: what the rule-based check cannot judge.
