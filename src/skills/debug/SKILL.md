---
name: debug
description: Systematic debugging workflow. Takes bug reports, CI logs, or errors and debugs to verified fix. Evidence-based, no guessing.
---

# /agentic:debug - Systematic Debugging

**Usage:** `/agentic:debug [<input>]`

Systematic debugging from bug report/CI logs/error to verified fix. No user interaction - all decisions logged.

## Arguments

- `path/to/error.log`: CI output, error log, bug report file
- `#123` or `https://github.com/.../issues/123`: GitHub issue
- Inline text: Direct error message or description
- No args: Error - input required

## Input Classification & Routing

| Input Type | Route |
|------------|-------|
| CI failure | Investigation → Pattern → Hypothesis → Fix → QA |
| Test failure | Investigation → Pattern → Hypothesis → Fix → QA |
| Runtime error | Investigation → Pattern → Hypothesis → Fix → QA |
| Behavior bug | Investigation → Pattern → Hypothesis → Fix → QA |
| Performance | Investigation → Pattern → Hypothesis → Fix → QA |

## The Iron Laws

```
1. NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
2. ONE HYPOTHESIS AT A TIME
3. THREE FAILED HYPOTHESES = QUESTION ARCHITECTURE
```

## Agent References

Each subagent reads instructions from `.{ide-folder}/agents/{agent}.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. ...")`

Available agents: `investigator`, `analyst`, `editor`, `qa`

## Mandatory Delegation

**You MUST delegate all agent work using the Task tool. NEVER do agent work inline.**

You are the orchestrator. You classify input, manage state, validate outputs, and delegate.

## Execution Protocol

### Step 1: Classify Input & Initialize

1. Parse input source (file, GitHub issue, inline)
2. Classify: ci_failure / test_failure / runtime_error / behavior_bug / performance
3. Generate session ID: `DEBUG-{YYYYMMDD}-{HHMMSS}`
4. Create working directory: `documentation/debug/{session_id}/`
5. Create `workflow-state.yaml` and `decision-log.md`

### Step 2: Root Cause Investigation

**Delegate via Task tool** → Investigator subagent

- Read error messages CAREFULLY
- Trace data flow backward to origin
- Map multi-component boundaries
- Gather evidence, NOT guesses

Output: `{session_path}/investigation-log.md`

### Step 3: Pattern Analysis

**Delegate via Task tool** → Analyst subagent

- Find working examples in codebase
- Compare working vs broken
- List EVERY difference
- Understand dependencies and assumptions

Output: `{session_path}/evidence.md`

### Step 4: Hypothesis Testing (Loop, max 3)

**Delegate via Task tool** → Analyst subagent

- Form ONE clear hypothesis with evidence
- Design SMALLEST possible test
- Execute and evaluate result
- If rejected, form NEW hypothesis

**3 failures = Escalate (architectural problem)**

Output: `{session_path}/hypothesis-log.md`

### Step 5: Fix Implementation

**Delegate via Task tool** → Editor subagent

- Create FAILING test case first
- Implement ONE fix at root cause
- Verify test passes
- Run full suite

Output: `{session_path}/fix-log.md` + code changes

### Step 6: QA Loop (max 3 iterations)

**Delegate via Task tool** → QA + Editor subagents

1. Verify ORIGINAL BUG is fixed
2. Check for regressions
3. Review fix quality

Exit conditions:
- Original bug fixed AND no blockers/majors → Complete
- Max iterations → Escalate

Output: `{session_path}/qa-{n}.md`

## Decision Logging

All autonomous decisions logged in `decision-log.md`:
- Context, evidence, chosen action
- Confidence score
- Open questions

## Escalation

Workflow escalates (requires human) when:
- 3 hypotheses failed (architectural problem)
- 3 QA iterations without resolution
- Original bug cannot be verified as fixed

## Artifacts

All outputs: `documentation/debug/{session_id}/`
- `workflow-state.yaml`
- `decision-log.md`
- `bug-report.md`
- `investigation-log.md`
- `evidence.md`
- `hypothesis-log.md`
- `fix-log.md`
- `qa-{n}.md`
- `escalation.md` (if escalated)

## Supporting Techniques

See skill directory for:
- `root-cause-tracing.md` - Trace backward through call stack
- `defense-in-depth.md` - Validate at multiple layers
- `condition-based-waiting.md` - Replace arbitrary timeouts
