# Step 1: Input Qualification

## EXECUTION RULES

- Parse and analyze the user's workflow description
- Extract purpose, triggers, expected behavior, inputs, outputs
- Log assumptions (things you inferred but user didn't explicitly state)
- Log open questions (things you can't infer)
- Initialize workflow state
- Do not proceed until state file is created
- Output: `workflow-state.yaml` + `qualified-input.md`

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/create-workflow` invocation:**

```
Pattern matching:
- /create-workflow                          -> input: prompt_user
- /create-workflow path/to/description.md   -> input: file
- /create-workflow <inline text>            -> input: inline
```

**Set variables:**
```yaml
input_type: "prompt_user" | "file" | "inline"
input_source: null | "<path>" | "<text>"
```

### 1.2 Fetch/Validate Input

**If input_type == "file":**
- Read file at `input_source`
- Validate it exists and has content
- Store content as `raw_input`

**If input_type == "prompt_user":**
- Ask: "Describe the workflow you want to create. What does it do, when should it be triggered, and what does it produce?"
- Store response as `raw_input`

**If input_type == "inline":**
- Store the inline text as `raw_input`

### 1.3 Analyze Input

From `raw_input`, extract and document:

| Dimension | What to Look For |
|-----------|-----------------|
| **Purpose** | What problem does this workflow solve? What's the end goal? |
| **Triggers** | When should someone invoke this workflow? What symptoms/situations? |
| **Mode** | Interactive (needs user input) or autonomous (makes its own decisions)? |
| **Inputs** | What does the workflow accept? (files, descriptions, URLs, issues) |
| **Steps** | What sequential actions does the workflow perform? |
| **Agents** | Which subagents might this workflow delegate to? |
| **Skills** | Which skills should be loaded? |
| **Outputs** | What artifacts does the workflow produce? |
| **Gates** | Are there decision points that block progression? |
| **User interaction** | Where does the workflow need user input? |

### 1.4 Log Assumptions

For each dimension above, if the user didn't explicitly specify it, log an assumption:

```markdown
## Assumptions

### A1: {Brief Title}
**Dimension**: {which dimension}
**Assumed**: {what you assumed}
**Basis**: {why you assumed this — what in the input suggests it}

### A2: {Brief Title}
...
```

**Minimum 3 assumptions required.** If fewer than 3 can be formed, the input is too vague — ask clarifying questions before proceeding.

### 1.5 Log Open Questions

For dimensions where you can't make a reasonable assumption:

```markdown
## Open Questions

### Q1: {Question}
**Dimension**: {which dimension}
**Why it matters**: {what decisions depend on this answer}
**Suggested options**: {2-3 options if applicable}

### Q2: {Question}
...
```

### 1.6 Generate Topic Slug

From `raw_input`:
- Extract the core workflow name
- Convert to kebab-case

**Examples:**
- "A workflow to review database migrations" -> `review-db-migrations`
- "Code review pipeline" -> `code-review`
- "Onboarding new team members" -> `team-onboarding`

**Set variable:**
```yaml
topic: "kebab-case-topic"
```

### 1.7 Generate Workflow Instance ID

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
```

**Set output_path:**
```yaml
output_path: "{ide-folder}/{outputFolder}/task/create-workflow/{topic}/{instance_id}"
```

### 1.8 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.9 Initialize Workflow State

**Create `{output_path}/workflow-state.yaml`:**

```yaml
workflow: create-workflow
version: "1.0.0"

# Input
input_type: {input_type}
input_source: {input_source}

# Topic
topic: {topic}
instance_id: {instance_id}
output_path: {output_path}

# Timing
started_at: {ISO_timestamp}
updated_at: {ISO_timestamp}

# Progress
status: "in_progress"
current_step: 1
steps_completed: []

# Qualification
assumptions_count: {number}
assumptions_confirmed: 0
open_questions_count: {number}
open_questions_resolved: 0

# Configuration (set in steps 4-5)
output_folder: null
storage_strategy: null
in_agentic_source_tree: false

# Created workflow metadata (set in steps 2-3)
created_workflow:
  name: null
  description: null
  mode: null
  steps: []
  agents: []
  skills: []

# Artifacts
artifacts:
  qualified_input: null
  workflow_design: null
  generated_workflow_path: null
```

### 1.10 Write Qualified Input Document

**Write `{output_path}/qualified-input.md`:**

```markdown
# Qualified Input - {topic}

**Raw Input:**
{raw_input}

---

## Analysis

### Purpose
{extracted purpose}

### Triggers
{when to invoke}

### Expected Mode
{interactive / autonomous / unknown}

### Expected Inputs
{what the workflow accepts}

### Expected Steps
{numbered list of identified steps}

### Expected Agents
{which subagents, if identifiable}

### Expected Skills
{which skills, if identifiable}

### Expected Outputs
{what artifacts it produces}

### Gates / Decision Points
{any blocking decisions identified}

---

## Assumptions

{assumptions from 1.4}

---

## Open Questions

{open questions from 1.5}
```

**Update workflow-state.yaml:**
```yaml
artifacts:
  qualified_input: "{output_path}/qualified-input.md"
```

### 1.11 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "input-qualification"
    completed_at: {ISO_timestamp}
    output: "{output_path}/qualified-input.md"

current_step: 2
updated_at: {ISO_timestamp}
```

**Output to user:**
```
Workflow idea analyzed.

Topic: {topic}
Path: {output_path}
Assumptions: {count}
Open questions: {count}

Starting assumption confirmation...
```

---

## NEXT STEP

Load and execute: `step-02-assumption-confirmation.md`
