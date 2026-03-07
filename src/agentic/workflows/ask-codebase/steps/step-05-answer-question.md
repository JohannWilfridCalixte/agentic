# Step 5: Answer the Question

---

## PRE-CONDITION CHECK

Before executing this step, verify:

```yaml
question_confirmed: true
material_ambiguities: 0
artifacts.functional_understanding: not null
```

If any condition fails, STOP and return to step 4.

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write the answer yourself.**

The Architect subagent writes the final user-facing answer, grounded in the code but understandable to non-technical readers.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning ask-codebase final answer.'

{language_skills_prompt}

# TASK: Ask Codebase - Final Answer

Answer the user's question in plain language using the confirmed functional understanding.

Input question: {output_path}/input-question.md
Technical context: {output_path}/technical-context.md
Functional understanding: {output_path}/functional-understanding.md
Output to: {output_path}/answer.md

Requirements:
1. Start with a direct answer in non-technical language
2. Explain how the behavior works in a compact step-by-step format
3. Call out meaningful edge cases and how the system handles them today
4. Mention important conditions, configuration, or role-based differences that change the answer
5. Be explicit about uncertainty, missing evidence, or code paths that were not fully traceable
6. End with code references for follow-up validation

Write the output using this structure:

# Answer - {topic}

## Direct Answer
## How It Works
## Edge Cases
## Conditions And Variations
## Unknowns
## Code References

Keep it suitable for product, support, operations, or leadership audiences.
")
```

### Validate Output

After the subagent completes, verify:
- `{output_path}/answer.md` exists and is non-empty
- Contains `## Direct Answer`
- Contains `## Edge Cases`
- Contains concrete file paths in `## Code References`

If validation fails:
- Re-run the subagent with specific guidance
- If the second attempt fails, present the partial answer and missing pieces explicitly

---

## PRESENT TO USER

After the answer is generated, present a concise summary:

```text
Answer ready.

Highlights:
- {direct answer summary}
- {most important edge case}
- {most important condition or caveat}

Full answer: {output_path}/answer.md
Functional understanding: {output_path}/functional-understanding.md
Technical context: {output_path}/technical-context.md
```

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  answer: "{output_path}/answer.md"

status: "completed"

steps_completed:
  - step: 5
    name: "answer-question"
    completed_at: {ISO_timestamp}
    output: "{output_path}/answer.md"

completed_at: {ISO_timestamp}
updated_at: {ISO_timestamp}
```

**Output to user:**

```text
Ask-codebase workflow complete.

Artifacts:
- Question: {output_path}/input-question.md
- Context: {output_path}/technical-context.md
- Functional understanding: {output_path}/functional-understanding.md
- Answer: {output_path}/answer.md
```

---

## WORKFLOW COMPLETE
