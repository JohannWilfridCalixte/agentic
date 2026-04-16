# Step 3: Context Confirmation

## EXECUTION RULES

- Compile all confirmed information into a structured workflow design document
- Present the complete design to the user for confirmation
- User must explicitly confirm before proceeding
- If user requests changes, loop back to step 2 for the changed items
- Maximum 3 confirmation attempts — after that, ask user to restate in their own words
- Output: `workflow-design.md`

---

## SEQUENCE

### 3.1 Compile Workflow Design

From the confirmed assumptions and resolved questions, build the complete design:

**Write `{output_path}/workflow-design.md`:**

```markdown
# Workflow Design - {created_workflow.name}

## Overview

**Name:** {created_workflow.name}
**Description:** {created_workflow.description}
**Mode:** {interactive | autonomous | switchable}
**Triggers:** {when to invoke this workflow}

---

## Inputs

| Input Type | Format | Example |
|-----------|--------|---------|
| {type 1} | {format} | {example} |
| {type 2} | {format} | {example} |

---

## Steps

| # | Name | Type | Description |
|---|------|------|-------------|
| 1 | {step name} | {orchestrator/delegate/interactive} | {what it does} |
| 2 | {step name} | {type} | {description} |
| ... | ... | ... | ... |

---

## Subagents

| Agent | Steps Used In | Purpose |
|-------|--------------|---------|
| {agent 1} | {step numbers} | {what it does} |
| ... | ... | ... |

(If no agents: "This workflow is orchestrator-only.")

---

## Skills

| Skill | Purpose |
|-------|---------|
| {skill 1} | {why needed} |
| ... | ... |

---

## Artifacts

| File | Created In | Description |
|------|-----------|-------------|
| `workflow-state.yaml` | Step 1 | Progress tracking |
| {artifact 1} | {step} | {description} |
| ... | ... | ... |

---

## Gates / Decision Points

{list of blocking decisions, or "No gates — linear workflow."}

---

## Error Handling

{how the workflow handles failures at each step}
```

### 3.2 Present Design for Confirmation

Output the full `workflow-design.md` content to the user, then ask:

```
Question: "Does this workflow design look correct?"
Options:
  - "Looks good, proceed" — Confirmed, move to step 4
  - "Needs minor changes" — User provides edits, update design inline
  - "Needs major rework" — Loop back to step 2
```

### 3.3 Handle Response

**If "Looks good, proceed":**
- Mark design as confirmed
- Continue to step 4

**If "Needs minor changes":**
- Ask: "What needs to change?"
- Apply changes to `workflow-design.md`
- Re-present for confirmation (back to 3.2)
- Track confirmation attempts

**If "Needs major rework":**
- Ask: "What's fundamentally wrong?"
- Update assumptions based on feedback
- Return to step 2 with new/modified assumptions
- Track confirmation attempts

### 3.4 Handle Repeated Rejections

If confirmation attempted 3+ times without success:

1. Ask user: "Can you describe the workflow you want in your own words? I'll use your exact description as the new starting point."
2. Store verbatim description as new `raw_input`
3. Reset to step 1 with the new input

### 3.5 Complete Step

**Update workflow-state.yaml:**
```yaml
artifacts:
  workflow_design: "{output_path}/workflow-design.md"

steps_completed:
  - step: 3
    name: "context-confirmation"
    completed_at: {ISO_timestamp}
    output: "{output_path}/workflow-design.md"

current_step: 4
updated_at: {ISO_timestamp}
```

**Output to user:**
```
Design confirmed.

Configuring output location...
```

---

## NEXT STEP

Load and execute: `step-04-output-config.md`
