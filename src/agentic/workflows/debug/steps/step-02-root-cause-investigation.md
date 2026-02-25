# Step 2: Root Cause Investigation

---

## ORCHESTRATOR ACTION

**You MUST delegate investigation using the Task tool. Do NOT investigate yourself.**

Root cause investigation is evidence gathering, NOT guessing.

---

## THE IRON LAW

```
NO HYPOTHESIS WITHOUT EVIDENCE FIRST
```

If you haven't completed evidence gathering, you cannot form hypotheses.

---

## SEQUENCE

### 2.1 Delegate Investigation

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-investigator.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning investigation.'

---

# TASK: Root Cause Investigation

Perform root cause investigation. DO NOT propose fixes yet.

Workflow: debug (autonomous)
Session ID: {session_id}
Session path: {session_path}
Bug report: {session_path}/bug-report.md
Input class: {input_class}

Your task:
1. Read error messages CAREFULLY - don't skip past them
2. Identify the failing component/layer
3. Trace data flow backward to find origin of bad value
4. Add diagnostic instrumentation if needed
5. Gather evidence about WHERE it breaks

Output to: {session_path}/investigation-log.md

DO NOT:
- Propose fixes
- Guess at causes
- Skip error details

DO:
- Read stack traces completely
- Check recent changes (git diff, commits)
- Map multi-component data flow
- Identify exact point of failure

Decision log: {session_path}/decision-log.md
")
```

### 2.2 Validate Output

Read `{session_path}/investigation-log.md`. Verify it contains:

**Required sections:**
- [ ] Error Analysis - exact error messages quoted
- [ ] Failure Point - specific file:line or component
- [ ] Data Flow - how bad data reached failure point
- [ ] Evidence - what was observed (not assumed)

**If missing sections:**
Re-delegate with specific request for missing content.

### 2.3 Log Investigation Decision

```markdown
### DEC-{N}: Investigation Complete

**Step**: root-cause-investigation
**Agent**: Investigator
**Timestamp**: {ISO}

**Context**: Gathering evidence about bug

**Evidence Found**:
- Failure point: {specific location}
- Data flow traced: {yes/no}
- Diagnostic output: {summary}

**Decision**: Proceed to pattern analysis

**Confidence**: {%}

**Reversibility**: Easy
```

### 2.4 Check for Multi-Component System

If investigation reveals multi-component system (CI → build → deploy, API → service → DB):

**Log additional decision:**
```markdown
### DEC-{N}: Multi-Component Detected

**Step**: root-cause-investigation
**Agent**: Orchestrator

**Context**: Bug spans multiple components

**Components identified**:
{list of components in data flow}

**Boundary verified**: {which boundary fails}

**Decision**: Focus pattern analysis on {failing component}

**Confidence**: {%}
```

### 2.5 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 2
    name: "root-cause-investigation"
    completed_at: {ISO}
    failure_point: {location}
    evidence_gathered: true

artifacts:
  investigation_log: "{session_path}/investigation-log.md"

current_step: 3
```

**Output:**
```
Investigation complete

Failure point: {location}
Evidence: {session_path}/investigation-log.md

Proceeding to Pattern Analysis...
```

---

## INVESTIGATION LOG TEMPLATE

The investigator should produce:

```markdown
# Investigation Log - {session_id}

## Error Analysis

### Exact Error
```
{quoted error message - complete, not summarized}
```

### Stack Trace (if applicable)
```
{full stack trace}
```

### Error Location
- File: {path}
- Line: {number}
- Function: {name}

## Failure Point

### Immediate Cause
{what code directly causes the error}

### Data State at Failure
{what values were present}

## Data Flow Trace

### Call Chain
```
{function A}
  → called by {function B}
  → called by {function C}
  → triggered by {entry point}
```

### Bad Value Origin
- Value: {what value}
- First appears: {where}
- Passed through: {list}

## Recent Changes

### Git Analysis
```bash
git log --oneline -10
git diff HEAD~5
```

### Relevant Changes
{list of changes that could affect this code path}

## Evidence Summary

| Question | Answer |
|----------|--------|
| What fails? | {specific} |
| Where exactly? | {file:line} |
| What data is wrong? | {value} |
| Where does bad data come from? | {origin} |

## Open Questions

{things that couldn't be determined from investigation}
```

---

## NEXT STEP

Load `step-03-pattern-analysis.md`
