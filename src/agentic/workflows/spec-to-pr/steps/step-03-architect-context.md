# Step 3: Architect Context

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT gather context yourself.**

The Architect subagent will read its own instructions from `.{ide-folder}/agents/architect.md` (Phase 1: Context Gathering).

### Delegate

```
Task(subagent_type="general-purpose", prompt="
You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md for your full instructions.

Execute Phase 1: Context Gathering.

Workflow mode: {workflow_mode}
Story ID: {story_id}
Story path: {story_path}
Spec: {story_path}/spec.md
Output to: {story_path}/technical-context.md
Decision log: {story_path}/decision-log.md

{If auto mode: IMPORTANT: Do NOT ask user questions. Log all decisions in decision-log.md.}
")
```

### Inputs to provide

- `spec.md` — product requirements to contextualize
- `workflow_mode`: interactive or auto
- Codebase access

### Validate output

After the subagent completes, verify:
- `{story_path}/technical-context.md` exists and is non-empty
- Contains codebase touchpoints section
- Decision log updated (if auto mode)

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_context: "{story_path}/technical-context.md"

steps_completed:
  - step: 3
    name: "architect-context"
    completed_at: {ISO_timestamp}
    output: "{story_path}/technical-context.md"

current_step: 4
```

---

## NEXT STEP

Load `step-04-security-context.md`
