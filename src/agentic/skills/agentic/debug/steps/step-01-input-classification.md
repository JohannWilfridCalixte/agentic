# Step 1: Input Classification

## EXECUTION RULES

- Classify bug input to determine investigation approach
- Initialize state and decision log
- NEVER ask user for input - if missing, halt with error
- Output: `workflow-state.yaml` + `decision-log.md` initialized

---

## SEQUENCE

### 1.1 Parse Input Source

```
/agentic:debug path/to/file.log    → read file
/agentic:debug #123                → gh issue view 123
/agentic:debug https://github...   → gh issue view <url>
/agentic:debug <text>              → use as-is
/agentic:debug                     → ERROR: input required
```

**If GitHub issue:**
```bash
gh issue view {source} --json title,body,labels,comments
```

**If file:** Read log/markdown content.

**If inline text:** Use the provided text directly.

Store result as `raw_input`.

### 1.2 Classify Input

Analyze `raw_input` for classification signals:

**CI failure signals:**
- Build/pipeline logs
- "CI failed", "build error", "workflow failed"
- GitHub Actions / Jenkins / CircleCI output
- Exit codes, command failures

**Test failure signals:**
- Stack traces with test file references
- Assertion errors ("expected X, got Y")
- Test framework output (jest, pytest, vitest)
- "FAIL", "FAILED", test counts

**Runtime error signals:**
- Exception traces
- "Error:", "Exception:", crash reports
- Production logs, application errors
- HTTP status codes (500, etc)

**Behavior bug signals:**
- "X should do Y but does Z"
- Expected vs actual behavior
- No stack trace, logic issue
- User-reported issue

**Performance signals:**
- "slow", "timeout", "memory"
- Metrics, timing data
- Resource exhaustion
- Query analysis

**Classification rules:**

```
IF has CI/pipeline signals                → "ci_failure"
IF has test framework + assertion signals → "test_failure"
IF has exception/crash signals            → "runtime_error"
IF has expected vs actual (no trace)      → "behavior_bug"
IF has timing/resource signals            → "performance"
IF unclear                                → "runtime_error" (safest default)
```

**Log classification decision:**
```markdown
### DEC-1: Input Classification

**Step**: input-classification
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**: Classifying bug input to determine investigation approach

**Signals Found**:
- CI failure: {list or "none"}
- Test failure: {list or "none"}
- Runtime error: {list or "none"}
- Behavior bug: {list or "none"}
- Performance: {list or "none"}

**Decision**: input_class = "{class}"

**Confidence**: {%}

**Reversibility**: Easy
```

### 1.3 Generate Session ID

**Generate unique session ID to prevent parallel workflow collisions:**

```
session_id = "DEBUG-{YYYYMMDD}-{HHMMSS}-{random4chars}"
# Example: DEBUG-20240115-143052-a7b2
```

This ensures parallel debug sessions don't overwrite each other's files.

### 1.4 Create Session Directory

```bash
mkdir -p {output-folder}/debug/{session_id}
```

### 1.5 Initialize Workflow State

**Create `{session_path}/workflow-state.yaml`:**

```yaml
workflow: debug
version: "1.0.0"
mode: auto

input_type: {file | github_issue | inline}
input_source: {path | url | null}
input_class: {ci_failure | test_failure | runtime_error | behavior_bug | performance}

session_id: {session_id}
session_path: {output-folder}/debug/{session_id}

started_at: {ISO}
updated_at: {ISO}

status: "in_progress"
current_step: 1
steps_completed: []

hypothesis_attempts: 0
max_hypothesis_attempts: 3

qa_iterations: 0
max_qa_iterations: 3

root_cause_identified: false
fix_verified: false

artifacts:
  input: "{input_source or 'inline'}"
  investigation_log: null
  evidence: null
  hypothesis_log: null
  fix_log: null
  qa_reviews: []
  decision_log: "{session_path}/decision-log.md"
```

### 1.6 Initialize Decision Log

**Create `{session_path}/decision-log.md`:**

```markdown
# Decision Log - {session_id}

> Autonomous decisions made during debug workflow.
> Review these decisions and open questions after completion.

**Workflow:** debug
**Mode:** Autonomous
**Started:** {ISO}
**Input Class:** {input_class}
**Bug Summary:** {one-line summary from input}

## Summary

| Metric | Count |
|--------|-------|
| Total Decisions | 1 |
| Investigation Decisions | 0 |
| Hypothesis Attempts | 0 |
| Fix Decisions | 0 |
| Low Confidence (<90%) | 0 |

## Open Questions

_Questions that couldn't be confidently answered. Review post-completion._

(none yet)

---

## Decisions

{DEC-1 from classification above}
```

### 1.7 Store Input as Artifact

Save raw input as `{session_path}/bug-report.md`:

```markdown
# Bug Report

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
Debug session initialized

Session: {session_id}
Path: {session_path}
Input class: {input_class}
Decision log: {session_path}/decision-log.md

Proceeding to Root Cause Investigation...
```

---

## NEXT STEP

Load `step-02-root-cause-investigation.md`
