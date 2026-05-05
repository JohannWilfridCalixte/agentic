# Step 4: Confirm Understanding

---

## PRE-CONDITION CHECK

Before executing this step, verify:

```yaml
artifacts.functional_understanding: not null
current_step: 4
```

If functional understanding is missing, STOP and return to step 3.

---

## ORCHESTRATOR ACTION

Read `{output_path}/functional-understanding.md` and present a concise confirmation summary.

Your goal is not to dump the whole artifact. Your goal is to ask: **"Did I trace the right behavior?"**

### Present Summary

Summarize:
- The functional area you traced
- The main flow in 2-4 bullets
- The most important edge cases in 1-3 bullets
- Any material ambiguity that still exists

Then ask:

```text
Is this the behavior you wanted explained?

If yes, I will produce a final answer in plain language.
If no, tell me what I should narrow, expand, or correct.
```

---

## DECISION RULES

### If the user confirms

Update `workflow-state.yaml`:

```yaml
question_confirmed: true
material_ambiguities: 0
current_step: 5
updated_at: {ISO_timestamp}

steps_completed:
  - step: 4
    name: "confirm-understanding"
    completed_at: {ISO_timestamp}
```

Proceed to step 5.

### If the user rejects or corrects the understanding

Update `workflow-state.yaml`:

```yaml
question_confirmed: false
understanding_attempts: {previous + 1}
clarifications_asked: {previous + 1}
material_ambiguities: {count_blocking_items}
updated_at: {ISO_timestamp}
```

### If understanding_attempts >= 3

Before looping, ask the user to restate the question in their own words:

```text
I have not been able to match your intent after multiple attempts.

Please restate the question in your own words so I can re-scope the investigation.
```

Capture the exact wording, update `{output_path}/input-question.md` with the new question, and return to step 2.

Then decide the loop target:
- If feedback changes which product area or code path is in scope, return to step 2
- If feedback only changes framing, actor, sequence, or emphasis, return to step 3

When looping, pass the user's feedback verbatim to the subagent.

---

## GATE CHECK

You MUST NOT proceed to step 5 unless both are true:

```yaml
question_confirmed: true
material_ambiguities: 0
```

If either condition fails, stay in the clarification loop.

---

## NEXT STEP

If confirmed, load and execute: `step-05-answer-question.md`
