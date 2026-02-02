# Step 2: Architect Context

**Skip condition:** `input_class == "technical-plan-with-context"`

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT gather context yourself.**

The Architect subagent will read its own instructions from `.{ide-folder}/agents/architect.md` (Phase 1: Context Gathering).

### Delegate

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning context gathering.'

---

# TASK: Context Gathering (Phase 1)

Workflow: auto-implement (autonomous, no user questions)
Story ID: {story_id}
Story path: {story_path}
Input class: {input_class}
Input document: {story_path}/{spec.md or technical-plan.md}
Output to: {story_path}/technical-context.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.
")
```

### Inputs to provide

- Input document (`spec.md` or `technical-plan.md` depending on input_class)
- `workflow_mode`: auto
- Codebase access

### Validate output

After the subagent completes, verify:
- `{story_path}/technical-context.md` exists and is non-empty
- Decision log was updated

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_context: "{story_path}/technical-context.md"

steps_completed:
  - step: 2
    name: "architect-context"
    completed_at: {ISO}
    output: "{story_path}/technical-context.md"

current_step: {next step in route}
```

---

## NEXT STEP

Based on route:
- product/mixed → Load `step-03-architect-plan.md`
- technical-plan → Load `step-04-editor-implement.md`
