# Step 3: Test Engineer

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write tests yourself.**

The Test Engineer subagent will read its own instructions from `{ide-folder}/agents/test-engineer.md`.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-engineer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning test writing.'

---

# TASK: Write Tests for Implementation

Workflow: implement (autonomous, no user questions)
Topic: {topic}
Output path: {output_path}
Technical Plan: {output_path}/technical-plan.md
Implementation Log: {output_path}/implementation-log.md
Output to: {output_path}/test-log.md
Decision log: {output_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.
")
```

### Inputs to provide

- `implementation-log.md` — what was implemented (files changed)
- `technical-plan.md` — tasks and expected behavior
- `workflow_mode`: auto

### Validate output

After the subagent completes, verify:
- `{output_path}/test-log.md` exists and is non-empty
- Test log contains actual test command output (tests pass)

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  test_log: "{output_path}/test-log.md"

steps_completed:
  - step: 3
    name: "test-engineer"
    completed_at: {ISO}
    output: "{output_path}/test-log.md"

current_step: 4
```

---

## NEXT STEP

Load `step-04-review-loop.md`
