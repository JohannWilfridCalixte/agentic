# Step 3: Functional Understanding Synthesis

---

## PRE-CONDITION CHECK

Before executing this step, verify:

```yaml
artifacts.technical_context: not null
current_step: 3
```

If technical context is missing, STOP and return to step 2.

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT translate the behavior yourself.**

The Architect subagent now converts code findings into plain-language functional understanding.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning ask-codebase functional synthesis.'

{language_skills_prompt}

# TASK: Ask Codebase - Functional Understanding

Translate code-level findings into a functional explanation for a non-technical audience.

Input question: {output_path}/input-question.md
Technical context: {output_path}/technical-context.md
Output to: {output_path}/functional-understanding.md

Use the output structure below instead of your default Phase 2 functional understanding format.

Requirements:
1. Use plain language first; introduce code terms only when needed
2. Explain the main user-visible flow or system behavior step by step
3. Call out the rules or conditions that change behavior
4. Surface important edge cases in terms a product, support, or operations person can understand
5. Make uncertainty explicit where the code is ambiguous, split across systems, or configuration-dependent

Write the output using this structure:

# Functional Understanding - {topic}

## Plain-Language Summary
## Main Flow
## Rules That Change Behavior
## Edge Cases And Exceptions
## What Is Still Unclear
## Source References

In Source References, keep concrete file paths so the explanation remains grounded in the code.
")
```

### Validate Output

After the subagent completes, verify:
- `{output_path}/functional-understanding.md` exists and is non-empty
- Contains `## Main Flow`
- Contains `## Edge Cases And Exceptions`
- Uses plain language rather than only code structure terms

If validation fails:
- Re-run the subagent with specific guidance about what is too technical or incomplete
- If the second attempt fails, present the partial understanding and ask the user how to narrow the question

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  functional_understanding: "{output_path}/functional-understanding.md"

steps_completed:
  - step: 3
    name: "functional-understanding"
    completed_at: {ISO_timestamp}
    output: "{output_path}/functional-understanding.md"

current_step: 4
updated_at: {ISO_timestamp}
```

**Output to user:**

```text
I have a code-grounded interpretation of the behavior.

Next I will confirm that this is the product area and scenario you actually wanted explained.
```

---

## NEXT STEP

Load and execute: `step-04-confirm-understanding.md`
