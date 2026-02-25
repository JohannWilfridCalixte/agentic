# Step 1: Validate Technical Plan

## EXECUTION RULES

- Validate that the input IS a technical plan
- If not a technical plan → HALT immediately
- Initialize state and decision log
- Output: `workflow-state.yaml` + `decision-log.md` initialized

---

## SEQUENCE

### 1.1 Parse Input Source

```
/agentic:workflow:implement path/to/plan.md         → read file
/agentic:workflow:implement <text with plan>        → use as-is
/agentic:workflow:implement                         → check conversation context for plan
```

**If file path:** Read and validate it's a markdown document.

**If inline text:** Use the provided text directly.

**If no args:** Check if a technical plan exists in the conversation context (e.g., from Cursor planning mode or Claude Code planning mode). If found, use it.

**If nothing found:** HALT with error (see 1.2).

Store result as `raw_input`.

### 1.2 Validate: Is It a Technical Plan?

Analyze `raw_input` for **required** technical plan signals:

**Must have AT LEAST TWO of:**
- Task breakdown (TASK-01, TASK-02, numbered tasks, or equivalent structure)
- File change manifest or file paths to create/modify
- Implementation steps with concrete actions
- Architecture/design decisions already made
- Verification matrix or acceptance criteria mapped to tasks

**Must NOT be just:**
- A vague feature description with no tasks
- A user story without implementation details
- A PRD/spec without technical breakdown
- A bug report

**If valid technical plan:**
```
input_valid = true
→ Proceed to 1.3
```

**If NOT a valid technical plan:**
```
input_valid = false
→ HALT
```

**HALT message (display to developer):**

> **This workflow requires a technical plan as input.**
>
> What you provided does not contain a technical plan (no task breakdown, no file change manifest, no implementation steps).
>
> Create a technical plan first:
> - **`/agentic:workflow:technical-planning`** — interactive workflow that produces a plan from any spec/idea
> - **Cursor planning mode** — use Plan mode to create a technical plan
> - **Claude Code planning mode** — use `/plan` to create a technical plan
>
> Then re-run `/agentic:workflow:implement` with the plan.

**Do NOT proceed past this point if input is invalid.**

### 1.3 Extract Plan Metadata

From the validated plan, extract:

```yaml
topic: "{brief kebab-case topic from plan title/subject}"
task_count: {number of tasks in plan}
files_affected: {list of files mentioned}
has_context: {true if plan includes codebase context/touchpoints}
```

### 1.4 Generate Workflow Instance ID

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
# Example: 20240115-143052-a7b2
```

**Set output path:**
```yaml
output_path: ".claude/_agentic_output/task/implement/{topic}/{instance_id}"
```

### 1.5 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.6 Store Plan as Artifact

Save input plan as `{output_path}/technical-plan.md`.

### 1.7 Initialize Workflow State

**Create `{output_path}/workflow-state.yaml`:**

```yaml
workflow: implement
version: "1.0.0"

input_type: {file | inline | context}
input_source: {path | null}
input_valid: true

topic: {topic}
instance_id: {instance_id}
output_path: {output_path}

started_at: {ISO}
updated_at: {ISO}

status: "in_progress"
current_step: 1
steps_completed: []

review_iterations: 0
max_review_iterations: 3

artifacts:
  technical_plan: "{output_path}/technical-plan.md"
  implementation_log: null
  test_log: null
  qa_reviews: []
  security_reviews: []
  decision_log: "{output_path}/decision-log.md"

pr:
  requested: null
  branch: null
  url: null
```

### 1.8 Initialize Decision Log

**Create `{output_path}/decision-log.md`:**

```markdown
# Decision Log - {topic}

> Autonomous decisions made during implement workflow.
> Review these decisions after completion.

**Workflow:** implement
**Started:** {ISO}
**Topic:** {topic}
**Tasks in plan:** {task_count}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 0 |
| Editor Decisions | 0 |
| Orchestrator Decisions | 0 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that couldn't be confidently answered. Review post-completion._

(none yet)

---

## Decisions

(none yet)
```

### 1.9 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "validate-plan"
    completed_at: {ISO}

current_step: 2
```

**Output:**
```
Workflow initialized (implement)

Topic: {topic}
Path: {output_path}
Tasks: {task_count}
Decision log: {output_path}/decision-log.md

Proceeding to Editor implementation...
```

---

## NEXT STEP

Load `step-02-editor-implement.md`
