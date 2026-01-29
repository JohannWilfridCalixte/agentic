---
name: debug
description: Systematic debugging workflow. Takes bug reports, CI logs, or error messages and debugs systematically to a verified fix. No guessing - evidence-based.
argument-hint: "[file.log | #issue | URL | error text]"
disable-model-invocation: true
---

# /agentic:debug - Systematic Debugging

**Usage:** `/agentic:debug [<input>]`

Systematic debugging from bug report/CI logs/error to verified fix. Evidence-based, no guessing.

## Arguments

- `path/to/error.log`: CI output, error log, or bug report file
- `#123` or `https://github.com/.../issues/123`: GitHub issue
- Inline text: Direct error message or bug description
- No args: Error - input required

## Input Classification

The workflow classifies input to determine investigation approach:

| Input Type | Signals |
|------------|---------|
| CI failure | Build logs, pipeline errors, workflow failures |
| Test failure | Stack traces, assertion errors, test framework output |
| Runtime error | Exceptions, crashes, HTTP 500s |
| Behavior bug | Expected vs actual, no stack trace |
| Performance | Slow, timeout, memory issues |

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If root cause isn't identified, you cannot propose fixes.

## Execution

### Step 1: Classify Input

Read and classify the bug input:
- **ci_failure**: Build/pipeline logs
- **test_failure**: Test framework output with stack traces
- **runtime_error**: Exceptions, crashes
- **behavior_bug**: Logic issues, no stack trace
- **performance**: Timing/resource issues

Initialize session in `documentation/debug/DEBUG-{timestamp}/`.

### Step 2: Root Cause Investigation

**Delegate via Task tool** → Investigator subagent

- Read error messages CAREFULLY
- Trace data flow backward
- Map component boundaries
- Gather evidence, NOT guesses

Output: `investigation-log.md`

### Step 3: Pattern Analysis

**Delegate via Task tool** → Analyst subagent

- Find working examples
- Compare working vs broken
- List ALL differences
- Understand dependencies

Output: `evidence.md`

### Step 4: Hypothesis Testing (Loop, max 3)

**Delegate via Task tool** → Analyst subagent

- Form ONE hypothesis with evidence
- Design MINIMAL test
- Execute and evaluate

```
Attempt 1 failed → New hypothesis
Attempt 2 failed → New hypothesis
Attempt 3 failed → STOP. Question architecture. Escalate.
```

Output: `hypothesis-log.md`

### Step 5: Fix Implementation

**Delegate via Task tool** → Editor subagent

- Create FAILING test first
- Implement ONE fix
- Verify test passes
- Run full suite

Output: `fix-log.md` + code changes

### Step 6: QA Loop (max 3 iterations)

**Delegate via Task tool** → QA + Editor subagents

1. Verify ORIGINAL BUG is fixed
2. Check for regressions
3. Review fix quality

Exit conditions:
- Original bug fixed AND no blockers/majors → Success
- Max iterations → Escalate for human review

## Agent References

Each subagent reads instructions from `.{ide-folder}/agents/{agent}.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. ...")`

Available agents: `investigator`, `analyst`, `editor`, `qa`

## Mandatory Delegation

**You MUST delegate all work using the Task tool. NEVER do agent work inline.**

You are the orchestrator. You classify input, manage state, validate outputs, and delegate.

## Red Flags - STOP

If you catch yourself thinking:
- "Quick fix for now"
- "Just try changing X"
- "It's probably X"
- "One more fix attempt" (after 2+)

**STOP. Return to evidence gathering.**

## Artifacts

All outputs: `documentation/debug/DEBUG-{session_id}/`
- `workflow-state.yaml`
- `decision-log.md`
- `bug-report.md`
- `investigation-log.md`
- `evidence.md`
- `hypothesis-log.md`
- `fix-log.md`
- `qa-{n}.md`
