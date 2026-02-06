# Step 1: Input Classification

## EXECUTION RULES

- Classify input to determine workflow route
- Initialize state and decision log
- NEVER ask user for input - if missing, halt with error
- Output: `workflow-state.yaml` + `decision-log.md` initialized

---

## SEQUENCE

### 1.1 Parse Input Source

```
/agentic:auto-implement path/to/file.md    → read file
/agentic:auto-implement #123               → gh issue view 123
/agentic:auto-implement https://github...  → gh issue view <url>
/agentic:auto-implement <text>             → use as-is
/agentic:auto-implement                    → ERROR: input required
```

**If GitHub issue:**
```bash
gh issue view {source} --json title,body,labels,milestone
```

**If file:** Read and validate it's a markdown document.

**If inline text:** Use the provided text directly.

Store result as `raw_input`.

### 1.2 Classify Input

Analyze `raw_input` for classification signals:

**Product signals:**
- User stories ("As a... I want... So that")
- Acceptance criteria (AC-01, AC-02)
- Problem statements, PRD structure
- Scope sections (in/out of scope)
- No task breakdowns or file paths

**Technical plan signals:**
- Task breakdown (TASK-01, TASK-02)
- File change manifest
- Architecture decisions, component design
- Implementation steps with file paths

**Technical context signals (in addition to plan):**
- Codebase touchpoints (existing code to leverage/modify)
- Pattern analysis ("existing patterns: ...")
- Dependency mapping
- Technical constraints from codebase analysis

**Classification rules:**

```
IF has product signals AND NOT has plan signals → "product"
IF has plan signals AND NOT has context signals → "technical-plan"
IF has plan signals AND has context signals     → "technical-plan-with-context"
IF has product signals AND has plan signals     → "mixed"
IF unclear                                     → "mixed" (safest default)
```

**Log classification decision:**
```markdown
### DEC-1: Input Classification

**Step**: input-classification
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**: Classifying input to determine workflow route

**Signals Found**:
- Product: {list of product signals found, or "none"}
- Technical plan: {list of plan signals found, or "none"}
- Technical context: {list of context signals found, or "none"}

**Decision**: input_class = "{class}"

**Confidence**: {%}

**Route**: {list of steps to execute}

**Reversibility**: Easy
```

### 1.3 Determine Route

```yaml
product:                    [2, 3, 4, 5, 6]  # context → plan → editor → review → PR
technical-plan:             [2, 4, 5, 6]      # context → editor → review → PR
technical-plan-with-context: [4, 5, 6]        # editor → review → PR
mixed:                      [2, 3, 4, 5, 6]  # context → plan → editor → review → PR
```

### 1.4 Determine Epic and Story IDs

**Check input for existing IDs:**
- Frontmatter: `Epic ID:`, `Story ID:`
- GitHub issue labels: `epic:EPIC-####`
- Inline references: `EPIC-####`, `US-####`

**If missing:**
- Check existing epics in `{ide-folder}/{outputFolder}/product/prd/` or `{ide-folder}/{outputFolder}/task/`
- Assign IDs based on context
- Log decision

```yaml
epic_id: "EPIC-####"
epic_name: "kebab-case-name"
story_id: "US-####"
```

### 1.5 Generate Workflow Instance ID

**Generate unique instance ID to prevent parallel workflow collisions:**

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
# Example: 20240115-143052-a7b2
```

**Set story_path with instance ID:**
```yaml
story_path: "{ide-folder}/{outputFolder}/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/{instance_id}"
```

This ensures parallel workflows don't overwrite each other's files.

### 1.6 Create Story Directory

```bash
mkdir -p {story_path}
```

### 1.7 Initialize Workflow State

**Create `{story_path}/workflow-state.yaml`:**

```yaml
workflow: auto-implement
version: "1.0.0"
mode: auto

input_type: {file | github_issue | inline}
input_source: {path | url | null}
input_class: {product | technical-plan | technical-plan-with-context | mixed}
route: {list of step IDs}

epic_id: {epic_id}
epic_name: {epic_name}
story_id: {story_id}
instance_id: {instance_id}
story_path: {story_path}

started_at: {ISO}
updated_at: {ISO}

status: "in_progress"
current_step: 1
steps_completed: []

review_iterations: 0
max_review_iterations: 3

artifacts:
  input: "{input_source or 'inline'}"
  technical_context: null
  technical_plan: null
  implementation_log: null
  qa_reviews: []
  security_reviews: []
  decision_log: "{story_path}/decision-log.md"

pr_url: null
```

### 1.8 Initialize Decision Log

**Create `{story_path}/decision-log.md`:**

```markdown
# Decision Log - {story_id}

> Autonomous decisions made during auto-implement workflow.
> Review these decisions and open questions after completion.

**Workflow:** auto-implement
**Mode:** Autonomous
**Started:** {ISO}
**Epic:** {epic_id} - {epic_name}
**Input Class:** {input_class}
**Route:** {route description}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 1 |
| Architect Decisions | 0 |
| Editor Decisions | 0 |
| Orchestrator Decisions | 1 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that couldn't be confidently answered. Review post-completion._

(none yet)

---

## Decisions

{DEC-1 from classification above}
```

### 1.9 Store Input as Artifact

**If input is product/mixed:** Save as `{story_path}/spec.md` (treat as spec)
**If input is technical-plan or technical-plan-with-context:** Save as `{story_path}/technical-plan.md`

This ensures downstream agents have the input in the expected location.

### 1.10 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "input-classification"
    completed_at: {ISO}
    input_class: {class}
    route: {route}

current_step: {first step in route}
```

**Output:**
```
Workflow initialized (auto-implement)

Story: {story_id}
Path: {story_path}
Input class: {input_class}
Route: {step names in route}
Decision log: {story_path}/decision-log.md

Proceeding to {next step name}...
```

---

## NEXT STEP

Based on route:
- product/mixed/technical-plan → Load `step-02-architect-context.md`
- technical-plan-with-context → Load `step-04-editor-implement.md`
