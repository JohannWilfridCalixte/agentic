# Step 4: Security Context

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT create the threat model yourself.**

The Security subagent will read its own instructions from `{ide-folder}/agents/agentic-agent-security.md`.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-security.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning security analysis.'

---

# TASK: Create Security Addendum

Create security addendum with threat model and security requirements.

Workflow mode: {workflow_mode}
Story ID: {story_id}
Story path: {story_path}
Spec: {story_path}/spec.md
Technical Context: {story_path}/technical-context.md
Output to: {story_path}/security-addendum.md
Decision log: {story_path}/decision-log.md

{If auto mode: IMPORTANT: Do NOT ask user questions. Log all decisions in decision-log.md.}
")
```

### Inputs to provide

- `spec.md` - product requirements with security implications
- `technical-context.md` - technical landscape
- `workflow_mode`: interactive or auto

### Validate output

After the subagent completes, verify:
- `{story_path}/security-addendum.md` exists and is non-empty
- Contains SEC-REQ-* requirements
- Contains OWASP assessment

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  security_context: "{story_path}/security-addendum.md"

steps_completed:
  - step: 4
    name: "security-context"
    completed_at: {ISO_timestamp}
    output: "{story_path}/security-addendum.md"

current_step: 5
```

---

## NEXT STEP

Load `step-05-architect-plan.md`
