# Step 6b: Test Engineer

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write tests yourself.**

The Test Engineer subagent will read its own instructions from `.{ide-folder}/agents/test-engineer.md`.

### Delegate

```
Task(subagent_type="general-purpose", prompt="
You are the Test Engineer agent. {ide-invoke-prefix}{ide-folder}/agents/test-engineer.md for your full instructions.

Write tests for the implementation.

Workflow mode: {workflow_mode}
Story ID: {story_id}
Story path: {story_path}
Technical Plan: {story_path}/technical-plan.md
Spec: {story_path}/spec.md
Implementation Log: {story_path}/implementation-log.md
Output to: {story_path}/test-log.md
Decision log: {story_path}/decision-log.md

{If auto mode: IMPORTANT: Do NOT ask user questions. Log all decisions in decision-log.md.}
")
```

### Inputs to provide

- `implementation-log.md` - what was implemented (files changed)
- `technical-plan.md` - tasks and expected behavior
- `spec.md` - acceptance criteria to cover
- `workflow_mode`: interactive or auto

### Validate output

After the subagent completes, verify:
- `{story_path}/test-log.md` exists and is non-empty
- Test log contains actual test command output (tests pass)
- AC coverage matrix is complete

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  test_log: "{story_path}/test-log.md"

steps_completed:
  - step: "6b"
    name: "test-engineer"
    completed_at: {ISO_timestamp}
    output: "{story_path}/test-log.md"

current_step: 7
```

---

## NEXT STEP

Load `step-07-review-loop.md`
