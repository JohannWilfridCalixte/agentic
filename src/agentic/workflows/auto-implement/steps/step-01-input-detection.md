# Step 1: Input Detection

## EXECUTION RULES

- Detect input source and type
- Generate topic slug
- Initialize workflow state and decision log
- Do not proceed until state file is created
- Output: `workflow-state.yaml` + `decision-log.md` initialized

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/agentic:auto-implement` invocation:**

```
Pattern matching:
- /agentic:auto-implement                      -> input: prompt_user
- /agentic:auto-implement path/to/idea.md      -> input: file
- /agentic:auto-implement #123                  -> input: github_issue
- /agentic:auto-implement https://github...    -> input: github_issue
- /agentic:auto-implement <inline text>        -> input: inline
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
- Ask: "What do you want to build? Describe the feature, paste notes, or point me to a file/issue."
- Store response as `raw_input`

### 1.3 Classify Input Content

Analyze `raw_input` to determine what kind of idea it is:

| Classification | Indicators |
|----------------|-----------|
| `feature_request` | New capability, "add", "create", "build" |
| `enhancement` | Improve existing feature, "improve", "refactor", "optimize" |
| `bug_fix` | Fix broken behavior, "fix", "broken", "doesn't work" |
| `rough_idea` | Vague or exploratory, no clear action |

**Set variable:**
```yaml
input_classification: "feature_request" | "enhancement" | "bug_fix" | "rough_idea"
```

### 1.5 Generate Topic Slug

From `raw_input`:
- Extract core topic/feature name
- Convert to kebab-case

**Examples:**
- "Add user authentication with SSO" -> `user-authentication-sso`
- "Fix the payment flow" -> `payment-flow`

**Set variable:**
```yaml
topic: "kebab-case-topic"
```

### 1.6 Generate Workflow Instance ID

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
```

**Set output_path:**
```yaml
output_path: "{ide-folder}/{outputFolder}/task/auto-implement/{topic}/{instance_id}"
```

### 1.7 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.8 Initialize Workflow State

**Create `{output_path}/workflow-state.yaml`:**

```yaml
workflow: auto-implement
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
completed_at: null

language_skills_prompt: ""

# Progress
status: "in_progress"
current_step: 1
steps_completed: []

# Artifacts
artifacts:
  input_idea: null
  technical_context: null
  functional_understanding: null
  product_decisions: null
  technical_plan: null
  decision_log: null
```

### 1.9 Initialize Decision Log

**Create `{output_path}/decision-log.md`:**

```markdown
# Decision Log - {topic}

> Autonomous decisions made during auto-implement workflow.
> Review these decisions after completion.

**Workflow:** auto-implement
**Started:** {ISO_timestamp}
**Topic:** {topic}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 0 |
| Architect Decisions | 0 |
| PM Decisions | 0 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that couldn't be confidently answered. Review post-completion._

(none yet)

---

## Decisions

(none yet)
```

### 1.10 Store Raw Input

**Write `{output_path}/input-idea.md`:**

```markdown
# Input Idea

**Source:** {input_type} ({input_source})
**Classification:** {input_classification}

---

{raw_input}
```

### 1.11 Complete Step

**Update workflow-state.yaml:**
```yaml
artifacts:
  input_idea: "{output_path}/input-idea.md"
  decision_log: "{output_path}/decision-log.md"

steps_completed:
  - step: 1
    name: "input-detection"
    completed_at: {ISO_timestamp}

current_step: 2
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Workflow initialized (auto-implement)

Topic: {topic}
Path: {output_path}

All decisions will be logged in decision-log.md for review.

Gathering technical context from the codebase...
```

---

## NEXT STEP

Load and execute: `step-02-architect-context.md`
