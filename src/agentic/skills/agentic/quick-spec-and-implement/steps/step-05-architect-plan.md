# Step 5: Architect Plan

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT create the plan yourself.**

The Architect subagent will read its own instructions from `.{ide-folder}/agents/architect.md` (Phase 2: Technical Planning).

### Delegate

```
Task(subagent_type="general-purpose", prompt="
You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md for your full instructions.

Execute Phase 2: Technical Planning.

Workflow mode: {workflow_mode}
Story ID: {story_id}
Story path: {story_path}
Spec: {story_path}/spec.md
Technical Context: {story_path}/technical-context.md
Security Addendum: {story_path}/security-addendum.md
Output to: {story_path}/technical-plan.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Plan must address ALL acceptance criteria (AC-*) and security requirements (SEC-REQ-*).
{If auto mode: Do NOT ask user questions. Log all decisions in decision-log.md.}
")
```

### Inputs to provide

- `spec.md` - acceptance criteria to implement
- `technical-context.md` - codebase context
- `security-addendum.md` - security requirements to satisfy
- `workflow_mode`: interactive or auto

### Validate output

After the subagent completes, verify:
- `{story_path}/technical-plan.md` exists and is non-empty
- Contains Task Breakdown (TASK-01, TASK-02, ...)
- Contains Verification Matrix
- Every AC and SEC-REQ mapped to at least one TASK

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_plan: "{story_path}/technical-plan.md"

steps_completed:
  - step: 5
    name: "architect-plan"
    completed_at: {ISO_timestamp}
    output: "{story_path}/technical-plan.md"

current_step: 6
```

---

## NEXT STEP

Load `step-06-editor-implement.md`
