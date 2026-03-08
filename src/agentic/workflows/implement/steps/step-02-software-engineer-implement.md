# Step 2: Software Engineer Implement

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write code yourself.**

The Software Engineer subagent will read its own instructions from `{ide-folder}/agents/agentic-agent-software-engineer.md`.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-software-engineer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning implementation.'

{language_skills_prompt}

# TASK: Implement Technical Plan

Workflow: implement (autonomous, no user questions)
Topic: {topic}
Output path: {output_path}
Technical Plan: {output_path}/technical-plan.md
Output to: {output_path}/implementation-log.md
Decision log: {output_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.
")
```

### Inputs to provide

- `technical-plan.md` — implementation guide (follow tasks in order)
- `workflow_mode`: auto

### Validate output

After the subagent completes, verify:
- `{output_path}/implementation-log.md` exists and is non-empty
- Implementation log contains regression test output (no regressions)
- Code changes exist in working tree

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  implementation_log: "{output_path}/implementation-log.md"

steps_completed:
  - step: 2
    name: "software-engineer-implement"
    completed_at: {ISO}
    output: "{output_path}/implementation-log.md"

current_step: 3
```

---

## NEXT STEP

Load `step-03-test-engineer.md`
