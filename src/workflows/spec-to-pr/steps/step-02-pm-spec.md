# Step 2: PM Spec

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT create the spec yourself.**

The PM subagent will read its own instructions from `.{ide-folder}/agents/pm.md`.

### Delegate

```
Task(subagent_type="general-purpose", prompt="
You are the PM agent. {ide-invoke-prefix}{ide-folder}/agents/pm.md for your full instructions.

Create a product specification.

Workflow mode: {workflow_mode}
Epic ID: {epic_id}
Story ID: {story_id}
Story path: {story_path}
Raw input: {raw_input}
Output to: {story_path}/spec.md
Decision log: {story_path}/decision-log.md

{If auto mode: IMPORTANT: Do NOT ask user questions. Log all decisions in decision-log.md.}
")
```

### Inputs to provide

- `raw_input` (from file, GitHub issue, or user prompt)
- `workflow_mode`: interactive or auto
- `epic_id`, `story_id`

### Validate output

After the subagent completes, verify:
- `{story_path}/spec.md` exists and is non-empty
- Contains acceptance criteria (AC-01, AC-02, ...)
- Has user story and scope sections

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  spec: "{story_path}/spec.md"

steps_completed:
  - step: 2
    name: "pm-spec"
    completed_at: {ISO_timestamp}
    output: "{story_path}/spec.md"

current_step: 3
```

**Interactive mode:** Present spec summary, wait for user approval before continuing.

**Auto mode:** Continue immediately.

---

## NEXT STEP

Load `step-03-architect-context.md`
