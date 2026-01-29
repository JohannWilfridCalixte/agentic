# Step 1: Input Detection

## EXECUTION RULES

- Detect workflow mode and input source
- Generate topic slug
- Initialize workflow state and decision log
- Do not proceed until state file is created
- Output: `workflow-state.yaml` initialized

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/product-spec` invocation:**

```
Pattern matching:
- /product-spec                      -> mode: interactive, input: user
- /product-spec --auto               -> mode: auto, input: user
- /product-spec path/to/notes.md     -> mode: interactive, input: file
- /product-spec --auto path/to.md    -> mode: auto, input: file
```

**Set variables:**
```yaml
workflow_mode: "interactive" | "auto"
input_type: "user" | "file"
input_source: null | "<path>"
```

### 1.2 Fetch/Validate Input

**If input_type == "file":**
- Read file at `input_source`
- Validate it exists and has content
- Store content as `raw_input`

**If input_type == "user":**
- Prompt user: "Describe your product idea in a few sentences"
- Store response as `raw_input`

### 1.3 Generate Topic Slug

From `raw_input`:
- Extract the core topic/feature name
- Convert to kebab-case

**Examples:**
- "User authentication with SSO" -> `user-authentication-sso`
- "Payment processing flow" -> `payment-processing`
- "Dashboard analytics" -> `dashboard-analytics`

**Set variables:**
```yaml
topic: "kebab-case-topic"
output_path: "documentation/product/specs"
```

### 1.4 Create Output Directory

```bash
mkdir -p documentation/product/specs
```

### 1.5 Initialize Workflow State

**Create `documentation/product/specs/workflow-state.yaml`:**

```yaml
workflow: product-spec
version: "1.0.0"

# Workflow configuration
mode: {workflow_mode}
input_type: {input_type}
input_source: {input_source}

# Topic identification
topic: {topic}
output_path: {output_path}

# Timing
started_at: {ISO_timestamp}
updated_at: {ISO_timestamp}

# Progress tracking
status: "in_progress"
current_step: 1
steps_completed: []

# Artifacts
artifacts:
  discovery: null
  spec: null
  decision_log: null

# Validation
validation:
  discovery_complete: false
  required_sections_present: false
```

### 1.6 Initialize Decision Log (Auto Mode)

**If workflow_mode == "auto", create `documentation/product/specs/decision-log.md`:**

```markdown
# Decision Log - {topic}

> Autonomous decisions made during product-spec workflow.
> Each decision includes context, options, and rationale.

**Workflow Mode:** Autonomous
**Started:** {ISO_timestamp}
**Topic:** {topic}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 0 |
| Discovery Decisions | 0 |
| Design Decisions | 0 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that arose but couldn't be confidently answered._

(none yet)

---

## Decisions

```

**Update workflow-state.yaml:**
```yaml
artifacts:
  decision_log: "documentation/product/specs/decision-log.md"
```

### 1.7 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 1
    name: "input-detection"
    completed_at: {ISO_timestamp}

current_step: 2
updated_at: {ISO_timestamp}
```

**Output to user:**

*Interactive mode:*
```
Workflow initialized

Topic: {topic}
Path: {output_path}
Mode: Interactive

Ready for product discovery. Loading Discovery agent...
```

*Auto mode:*
```
Workflow initialized (Autonomous Mode)

Topic: {topic}
Path: {output_path}
Mode: Autonomous
Decision log: {output_path}/decision-log.md

Proceeding with product discovery...
```

---

## NEXT STEP

Load and execute: `step-02-product-discovery.md`
