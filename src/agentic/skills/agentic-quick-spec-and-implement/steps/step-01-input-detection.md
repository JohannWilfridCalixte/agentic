# Step 1: Input Detection

## EXECUTION RULES

- Detect workflow mode and input source
- Initialize workflow state and decision log
- Do not proceed until state file is created
- Output: `workflow-state.yaml` initialized

---

## SEQUENCE

### 1.1 Parse Command Arguments

**Analyze the `/quick-spec-and-implement` invocation:**

```
Pattern matching:
- /quick-spec-and-implement                      -> mode: interactive, input: user
- /quick-spec-and-implement --auto               -> mode: auto, input: user
- /quick-spec-and-implement path/to/file.md      -> mode: interactive, input: file
- /quick-spec-and-implement --auto path/to.md    -> mode: auto, input: file
- /quick-spec-and-implement #123                  -> mode: interactive, input: github_issue
- /quick-spec-and-implement --auto #123          -> mode: auto, input: github_issue
- /quick-spec-and-implement https://github...    -> mode: interactive, input: github_issue
- /quick-spec-and-implement --auto https://...   -> mode: auto, input: github_issue
```

**Set variables:**
```yaml
workflow_mode: "interactive" | "auto"
input_type: "user" | "file" | "github_issue"
input_source: null | "<path>" | "<url>" | "<issue_number>"
```

### 1.2 Fetch/Validate Input

**If input_type == "github_issue":**
```bash
# Fetch issue content
gh issue view {input_source} --json title,body,labels,milestone
```
- Extract issue title, body, labels
- Check for epic label or parent issue link
- Store as `raw_input`

**If input_type == "file":**
- Read file at `input_source`
- Validate it's markdown with expected structure
- Parse frontmatter for Epic ID, Story ID if present
- Store content as `raw_input`

**If input_type == "user":**
- `raw_input` will be gathered in Step 2 (PM Spec)

### 1.3 Determine Epic and Story IDs

**Check if IDs are already known:**

From GitHub issue labels:
- Look for label matching `epic:EPIC-####` or similar
- Look for parent issue link

From file frontmatter:
```yaml
Epic ID: EPIC-####
Story ID: US-####
```

**If IDs are missing:**

*Interactive mode:*
```
I need to know where this work belongs:

1. Is this part of an existing epic?
   - If yes, which one? (EPIC-####)
   - If no, should I create a new epic?

2. What story ID should this be?
   - Suggest: US-{next_available}
```
Wait for user response.

*Auto mode:*
- Analyze `raw_input` for epic context clues
- Check existing epics in `{ide-folder}/{outputFolder}/product/prd/` for fit
- **DECISION POINT**: Log decision about epic assignment
- Generate next available story ID

**Set variables:**
```yaml
epic_id: "EPIC-####"
epic_name: "kebab-case-name"
story_id: "US-####"
```

### 1.4 Generate Workflow Instance ID

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

### 1.5 Create Story Directory

```bash
mkdir -p {story_path}
```

### 1.6 Initialize Workflow State

**Create `{story_path}/workflow-state.yaml`:**

```yaml
workflow: spec-to-pr
version: "1.0.0"

# Workflow configuration
mode: {workflow_mode}
input_type: {input_type}
input_source: {input_source}

# Story identification
epic_id: {epic_id}
epic_name: {epic_name}
story_id: {story_id}
instance_id: {instance_id}
story_path: {story_path}

# Timing
started_at: {ISO_timestamp}
updated_at: {ISO_timestamp}

# Progress tracking
status: "in_progress"
current_step: 1
steps_completed: []

# Review loop tracking
review_iterations: 0
max_review_iterations: 3

# Artifacts created
artifacts:
  spec: null
  technical_context: null
  security_context: null
  technical_plan: null
  implementation_log: null
  qa_reviews: []
  security_reviews: []
  decision_log: null

# Final output
pr_url: null
```

### 1.7 Initialize Decision Log (Auto Mode)

**If workflow_mode == "auto", create `{story_path}/decision-log.md`:**

```markdown
# Decision Log - {story_id}

> Autonomous decisions made during spec-to-pr workflow.
> Each decision includes context, options, rationale, and trade-offs.

**Workflow Mode:** Autonomous
**Started:** {ISO_timestamp}
**Epic:** {epic_id} - {epic_name}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 0 |
| PM Decisions | 0 |
| Architect Decisions | 0 |
| Security Decisions | 0 |
| Editor Decisions | 0 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that arose but couldn't be confidently answered. Review these._

(none yet)

---

## Decisions

```

**Update workflow-state.yaml:**
```yaml
artifacts:
  decision_log: "{story_path}/decision-log.md"
```

### 1.8 Complete Step

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

Story: {story_id}
Path: {story_path}
Mode: Interactive

Ready to create product spec. Loading PM agent...
```

*Auto mode:*
```
Workflow initialized (Autonomous Mode)

Story: {story_id}
Path: {story_path}
Mode: Autonomous (90% confidence threshold)
Decision log: {story_path}/decision-log.md

Proceeding to create product spec...
```

---

## NEXT STEP

Load and execute: `step-02-pm-spec.md`
