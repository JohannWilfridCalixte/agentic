# Step 3: Architect Plan

**Skip condition:** `input_class in ["technical-plan", "technical-plan-with-context"]`

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT create the plan yourself.**

The Architect subagent will read its own instructions from `.{ide-folder}/agents/architect.md` (Phase 2: Technical Planning).

### Delegate

```
Task(subagent_type="general-purpose", prompt="
You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md for your full instructions.

Execute Phase 2: Technical Planning.

Workflow: auto-implement (autonomous, no user questions)
Story ID: {story_id}
Story path: {story_path}
Spec: {story_path}/spec.md
Technical Context: {story_path}/technical-context.md
Output to: {story_path}/technical-plan.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.
")
```

### Inputs to provide

- `spec.md` — acceptance criteria to implement
- `technical-context.md` — codebase context from Step 2
- `workflow_mode`: auto

### Validate output

After the subagent completes, verify:
- `{story_path}/technical-plan.md` exists and is non-empty
- Plan contains Task Breakdown and Verification Matrix
- Decision log was updated

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_plan: "{story_path}/technical-plan.md"

steps_completed:
  - step: 3
    name: "architect-plan"
    completed_at: {ISO}
    output: "{story_path}/technical-plan.md"

current_step: 4
```

---

## NEXT STEP

Load `step-04-editor-implement.md`
