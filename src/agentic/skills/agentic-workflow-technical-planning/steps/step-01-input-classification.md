# Step 1: Input Classification

## EXECUTION RULES

- Detect input source and type
- Generate topic slug
- Initialize workflow state
- Do not proceed until state file is created
- Output: `workflow-state.yaml` initialized

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/agentic:technical-planning` invocation:**

```
Pattern matching:
- /agentic:technical-planning                      -> input: prompt_user
- /agentic:technical-planning path/to/spec.md      -> input: file
- /agentic:technical-planning #123                  -> input: github_issue
- /agentic:technical-planning https://github...    -> input: github_issue
- /agentic:technical-planning <inline text>        -> input: inline
```

**Set variables:**
```yaml
input_type: "prompt_user" | "file" | "github_issue" | "inline"
input_source: null | "<path>" | "<url>" | "<issue_number>" | "<text>"
```

### 1.2 Fetch/Validate Input

**If input_type == "github_issue":**
```bash
gh issue view {input_source} --json title,body,labels,milestone
```
- Extract issue title, body, labels
- Store as `raw_input`

**If input_type == "file":**
- Read file at `input_source`
- Validate it exists and has content
- Store content as `raw_input`

**If input_type == "inline":**
- Store the inline text as `raw_input`

**If input_type == "prompt_user":**
- Ask: "What do you want to plan? Paste your spec, describe the feature, or point me to a file/issue."
- Store response as `raw_input`

### 1.3 Classify Input Content

Analyze `raw_input` to determine what kind of specification it is:

| Classification | Indicators |
|----------------|-----------|
| `prd` | Has acceptance criteria, user stories, formal structure |
| `epic` | High-level feature description, multiple stories |
| `user_story` | "As a ... I want ... so that ..." format |
| `informal` | Rough description, chat-style, bullet points |

**Set variable:**
```yaml
input_classification: "prd" | "epic" | "user_story" | "informal"
```

### 1.4 Generate Topic Slug

From `raw_input`:
- Extract core topic/feature name
- Convert to kebab-case

**Examples:**
- "User authentication with SSO" -> `user-authentication-sso`
- "Payment processing flow" -> `payment-processing`

**Set variable:**
```yaml
topic: "kebab-case-topic"
```

### 1.5 Generate Workflow Instance ID

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
```

**Set output_path:**
```yaml
output_path: "{ide-folder}/{outputFolder}/task/technical-planning/{topic}/{instance_id}"
```

### 1.6 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.7 Initialize Workflow State

**Create `{output_path}/workflow-state.yaml`:**

```yaml
workflow: technical-planning
version: "1.0.0"

# Input
input_type: {input_type}
input_source: {input_source}
input_classification: {input_classification}

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

# Context confirmation loop
context_attempts: 0
context_confirmed: false

# Technical questioning
questions_asked: 0
structural_open_questions: 0
decisions_logged: 0

# Artifacts
artifacts:
  technical_context: null
  technical_decisions: null
  technical_plan: null
```

### 1.8 Store Raw Input

**Write `{output_path}/input-spec.md`:**

```markdown
# Input Specification

**Classification:** {input_classification}
**Source:** {input_type} ({input_source})

---

{raw_input}
```

### 1.9 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "input-classification"
    completed_at: {ISO_timestamp}

current_step: 2
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Workflow initialized

Topic: {topic}
Classification: {input_classification}
Path: {output_path}

Gathering technical context from the codebase...
```

---

## NEXT STEP

Load and execute: `step-02-architect-context.md`
