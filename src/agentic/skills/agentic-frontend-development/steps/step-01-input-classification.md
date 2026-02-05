# Step 1: Input Classification & Initialization

## EXECUTION RULES

- Classify frontend input to determine design approach
- Initialize state and decision log
- NEVER ask user for input - if missing, halt with error
- Output: `workflow-state.yaml` + `decision-log.md` initialized

---

## SEQUENCE

### 1.1 Parse Input Source

```
/agentic:frontend-development "Build a dashboard"    → use description
/agentic:frontend-development path/to/spec.md       → read spec file
/agentic:frontend-development https://figma.com/... → fetch design reference
/agentic:frontend-development                        → ERROR: input required
```

**If spec file:** Read product spec content.

**If design URL:** Use WebFetch to get design reference (if supported).

**If description:** Use the provided text directly.

Store result as `raw_input`.

### 1.2 Classify Input

Analyze `raw_input` for classification:

**Full feature signals:**
- "Build", "Create", "Implement"
- Multiple components mentioned
- User flows described
- Full page or section

**Component signals:**
- Single component mentioned
- "Button", "Modal", "Form", "Card"
- Specific interaction focus

**Enhancement signals:**
- "Add", "Improve", "Update"
- Existing feature referenced
- Incremental change

**Classification rules:**

```
IF describes full page/feature      → "full_feature"
IF describes single component       → "component"
IF describes change to existing     → "enhancement"
IF unclear                          → "component" (safest default)
```

**Log classification decision:**
```markdown
### DEC-1: Input Classification

**Step**: input-classification
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**: Classifying frontend input to determine design scope

**Signals Found**:
- Full feature: {list or "none"}
- Component: {list or "none"}
- Enhancement: {list or "none"}

**Decision**: input_class = "{class}"

**Confidence**: {%}

**Reversibility**: Easy
```

### 1.3 Generate Session ID

**Generate unique session ID:**

```
session_id = "FE-{YYYYMMDD}-{HHMMSS}-{random4chars}"
# Example: FE-20240115-143052-a7b2
```

### 1.4 Create Session Directory

```bash
mkdir -p {outputFolder}/frontend/{session_id}
```

### 1.5 Initialize Workflow State

**Create `{session_path}/workflow-state.yaml`:**

```yaml
workflow: frontend-development
version: "1.0.0"
mode: auto

input_type: {description | spec_file | design_url}
input_source: {path | url | null}
input_class: {full_feature | component | enhancement}

session_id: {session_id}
session_path: {outputFolder}/frontend/{session_id}

started_at: {ISO}
updated_at: {ISO}

status: "in_progress"
current_step: 1
steps_completed: []

qa_iterations: 0
max_qa_iterations: 3

design_approved: false
implementation_complete: false

artifacts:
  input: "{input_source or 'inline'}"
  design_decisions: null
  implementation_log: null
  qa_review: null
  decision_log: "{session_path}/decision-log.md"
```

### 1.6 Initialize Decision Log

**Create `{session_path}/decision-log.md`:**

```markdown
# Decision Log - {session_id}

> Autonomous decisions made during frontend development workflow.
> Review these decisions and open questions after completion.

**Workflow:** frontend-development
**Mode:** Autonomous
**Started:** {ISO}
**Input Class:** {input_class}
**Feature Summary:** {one-line summary from input}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 1 |
| Design Decisions | 0 |
| Implementation Decisions | 0 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that couldn't be confidently answered. Review post-completion._

(none yet)

---

## Decisions

{DEC-1 from classification above}
```

### 1.7 Store Input as Artifact

Save raw input as `{session_path}/feature-request.md`:

```markdown
# Feature Request

**Source:** {input_type}: {input_source or "inline"}
**Classified as:** {input_class}

## Raw Input

{raw_input content}
```

### 1.8 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "input-classification"
    completed_at: {ISO}
    input_class: {class}

current_step: 2
```

**Output:**
```
Frontend session initialized

Session: {session_id}
Path: {session_path}
Input class: {input_class}
Decision log: {session_path}/decision-log.md

Proceeding to UI/UX Design...
```

---

## NEXT STEP

Load `step-02-ui-ux-design.md`
