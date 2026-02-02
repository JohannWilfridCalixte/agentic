# Step 4b: Test Engineer

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write tests yourself.**

The Test Engineer subagent will read its own instructions from `.{ide-folder}/agents/test-engineer.md`.

### Delegate

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-engineer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning test writing.'

---

# TASK: Write Tests for Implementation

Workflow: auto-implement (autonomous, no user questions)
Story ID: {story_id}
Story path: {story_path}
Technical Plan: {story_path}/technical-plan.md
{If exists: Spec: {story_path}/spec.md}
Implementation Log: {story_path}/implementation-log.md
Output to: {story_path}/test-log.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.
")
```

### Inputs to provide

- `implementation-log.md` — what was implemented (files changed)
- `technical-plan.md` — tasks and expected behavior
- `spec.md` — acceptance criteria to cover (if exists)
- `workflow_mode`: auto

### Validate output

After the subagent completes, verify:
- `{story_path}/test-log.md` exists and is non-empty
- Test log contains actual test command output (tests pass)
- AC coverage matrix is complete (if spec exists)

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  test_log: "{story_path}/test-log.md"

steps_completed:
  - step: "4b"
    name: "test-engineer"
    completed_at: {ISO}
    output: "{story_path}/test-log.md"

current_step: 5
```

---

## NEXT STEP

Load `step-05-review-loop.md`
