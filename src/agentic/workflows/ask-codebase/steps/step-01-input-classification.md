# Step 1: Input Classification

---

## EXECUTION RULES

- Detect input source
- Capture the exact question being answered
- Generate topic slug and workflow instance ID
- Initialize workflow state before proceeding
- Output: `workflow-state.yaml` and `input-question.md`

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/ask-codebase` invocation:**

```
Pattern matching:
- /ask-codebase                               -> input: prompt_user
- /ask-codebase path/to/question.md          -> input: file
- /ask-codebase #123                         -> input: github_issue
- /ask-codebase https://github.com/.../123   -> input: github_issue
- /ask-codebase "How does billing retry?"    -> input: inline
```

**Set variables:**
```yaml
input_type: "prompt_user" | "file" | "github_issue" | "inline"
input_source: null | "<path | issue | url | raw question>"
```

### 1.2 Fetch or Capture Input

**If `input_type == "file"`:**
- Read file at `input_source`
- Validate it exists and has content
- Store content as `raw_question`

**If `input_type == "github_issue"`:**
- Fetch the issue body and title
- Store as `raw_question`

**If `input_type == "inline"`:**
- Store the inline string as `raw_question`

**If `input_type == "prompt_user"`:**
- Prompt the user: `What functional behavior or edge case do you want to understand?`
- Store the response as `raw_question`

### 1.3 Normalize the Question

Create a canonical question prompt that can be reused by subagents.

Prepare `input-question.md` with this format:

```markdown
# Codebase Question

## Original Question
{raw_question}

## What The User Wants
{1-3 bullet summary of the requested explanation scope}

## Success Criteria For This Answer
- Explain the behavior in plain language
- Ground the answer in actual code paths and conditions
- Call out meaningful edge cases and exceptions
- Make uncertainty explicit when the code does not fully answer the question
```

### 1.4 Generate Topic Slug

From `raw_question`:
- Extract the functional area or behavior being discussed
- Convert to kebab-case

**Examples:**
- `How does password reset work?` -> `password-reset`
- `What happens when payment capture fails?` -> `payment-capture-failure`
- `How are duplicate invites handled?` -> `duplicate-invites`

### 1.5 Generate Workflow Instance ID

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
```

Set:

```yaml
output_path: "{ide-folder}/{outputFolder}/task/ask-codebase/{topic}/{instance_id}"
```

### 1.6 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.7 Initialize Workflow State

Create `{output_path}/workflow-state.yaml`:

```yaml
workflow: ask-codebase
version: "1.0.0"

input_type: {input_type}
input_source: {input_source}

topic: {topic}
instance_id: {instance_id}
output_path: {output_path}

started_at: {ISO_timestamp}
updated_at: {ISO_timestamp}
completed_at: null

language_skills_prompt: ""

status: "in_progress"
current_step: 1
steps_completed: []

understanding_attempts: 0
question_confirmed: false
clarifications_asked: 0
material_ambiguities: 0

artifacts:
  input_question: "{output_path}/input-question.md"
  technical_context: null
  functional_understanding: null
  answer: null
```

### 1.8 Write Input Question Artifact

Write `{output_path}/input-question.md` using the normalized structure from step 1.3.

### 1.9 Complete Step

Update `workflow-state.yaml`:

```yaml
steps_completed:
  - step: 1
    name: "input-classification"
    completed_at: {ISO_timestamp}
    output: "{output_path}/input-question.md"

current_step: 2
updated_at: {ISO_timestamp}
```

**Output to user:**

```text
Question captured.

Topic: {topic}
Path: {output_path}

Gathering technical context from the codebase...
```

---

## NEXT STEP

Load and execute: `step-02-architect-context.md`
