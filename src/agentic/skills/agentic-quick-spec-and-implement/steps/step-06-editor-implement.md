# Step 6: Editor Implement

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write code yourself.**

The Editor subagent will read its own instructions from `.{ide-folder}/agents/editor.md`.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/editor.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning implementation.'

---

# TASK: Implement Technical Plan

Workflow mode: {workflow_mode}
Story ID: {story_id}
Story path: {story_path}
Technical Plan: {story_path}/technical-plan.md
Technical Context: {story_path}/technical-context.md
Spec: {story_path}/spec.md
Security Addendum: {story_path}/security-addendum.md
Output to: {story_path}/implementation-log.md
Decision log: {story_path}/decision-log.md

{If auto mode: IMPORTANT: Do NOT ask user questions. Log all decisions in decision-log.md.}
")
```

### Inputs to provide

- `technical-plan.md` - implementation guide (follow tasks in order)
- `technical-context.md` - codebase patterns to follow
- `spec.md` - acceptance criteria
- `security-addendum.md` - security requirements
- `workflow_mode`: interactive or auto

### Validate output

After the subagent completes, verify:
- `{story_path}/implementation-log.md` exists and is non-empty
- Implementation log contains regression test output (no regressions)
- Code changes exist in working tree

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  implementation_log: "{story_path}/implementation-log.md"

steps_completed:
  - step: 6
    name: "editor-implement"
    completed_at: {ISO_timestamp}
    output: "{story_path}/implementation-log.md"

current_step: "6b"
```

---

## NEXT STEP

Load `step-06b-test-engineer.md`
