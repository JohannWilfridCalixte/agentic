# Step 2: Architect Context Gathering

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT gather context yourself.**

The Architect subagent will read its own instructions and use the `gather-technical-context` skill to analyze the codebase.

### Delegate

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

Read .claude/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning context gathering.'

---

# TASK: Context Gathering (Phase 1)

Analyze the codebase to identify all relevant code, patterns, constraints, and dependencies for implementing the feature described below.

Input spec: {output_path}/input-spec.md
Output to: {output_path}/technical-context.md

{If context_attempts > 0: IMPORTANT: Previous context was rejected by the developer. Here is their feedback: {developer_feedback}. Focus on addressing these specific concerns.}

Read the input spec first, then explore the codebase systematically.

IMPORTANT: This is an interactive workflow. If you have questions, include them in the Open Questions section of technical-context.md. Do NOT ask the user directly.
")
```

### Inputs to provide

- `input-spec.md` - the product specification to contextualize
- Previous developer feedback (if context was rejected before)
- Codebase access

### Validate output

After subagent completes, verify:
- `{output_path}/technical-context.md` exists and is non-empty
- Contains required sections: Summary, Codebase Touchpoints, Risks

**If validation fails:**
- Re-run subagent with more specific guidance
- If second attempt fails, present partial context to developer anyway

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_context: "{output_path}/technical-context.md"

context_attempts: {context_attempts + 1}

steps_completed:
  - step: 2
    name: "architect-context"
    completed_at: {ISO_timestamp}
    output: "{output_path}/technical-context.md"

current_step: 3
updated_at: {ISO_timestamp}
```

---

## NEXT STEP

Load `step-03-confirm-context.md`
