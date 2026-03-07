# Step 2: Architect Context Gathering

---

## PRE-CONDITION CHECK

Before executing this step, verify:

```yaml
artifacts.input_question: not null
current_step: 2
```

If the input question artifact is missing, STOP and return to step 1.

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT explore the codebase yourself.**

The Architect subagent gathers code-grounded evidence about the behavior behind the question.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning ask-codebase context gathering.'

{language_skills_prompt}

# TASK: Ask Codebase - Technical Context

Investigate the existing codebase to answer the user's question.

Input question: {output_path}/input-question.md
Output to: {output_path}/technical-context.md

Use the output structure below instead of your default Phase 1 context format.

Focus on:
1. Which modules, services, components, jobs, or handlers control this behavior
2. The key decision points, branches, guards, feature flags, or configuration switches
3. Data or state transitions that affect the behavior
4. Meaningful edge cases already handled in code
5. Any ambiguity or gaps where the code does not fully answer the question

Do NOT propose implementation changes.

Write the output using this structure:

# Technical Context - {topic}

## User Question
## Functional Surface Area
## Relevant Code Paths
## Decision Points And Conditions
## State And Data Dependencies
## Edge Cases Already In Code
## Constraints And Unknowns
## Source References

In Source References, include concrete file paths that support the analysis.
")
```

### Validate Output

After the subagent completes, verify:
- `{output_path}/technical-context.md` exists and is non-empty
- Contains `## Relevant Code Paths`
- Contains `## Edge Cases Already In Code`
- Contains at least one concrete file path in `## Source References`

If validation fails:
- Re-run the subagent with specific guidance about what is missing
- If the second attempt fails, present the partial context and block step 3

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_context: "{output_path}/technical-context.md"

steps_completed:
  - step: 2
    name: "architect-context"
    completed_at: {ISO_timestamp}
    output: "{output_path}/technical-context.md"

current_step: 3
updated_at: {ISO_timestamp}
```

**Output to user:**

```text
Technical context gathered.

Next I will translate those code-level findings into a plain-language explanation of the behavior.
```

---

## NEXT STEP

Load and execute: `step-03-functional-understanding.md`
