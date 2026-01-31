---
name: agentic:debug
description: Use when debugging bug reports, CI failures, test failures, runtime errors, or flaky tests. Takes error logs, stack traces, or issue descriptions and systematically investigates to a verified fix. Evidence-based, no guessing.
argument-hint: "[file.log | #issue | URL | error text]"
---

# /agentic:debug - Systematic Debugging

**Usage:** `/agentic:debug [<input>]`

Systematic debugging from bug report/CI logs/error to verified fix. No user interaction - all decisions logged.

## Arguments

- `path/to/error.log`: CI output, error log, bug report file
- `#123` or `https://github.com/.../issues/123`: GitHub issue
- Inline text: Direct error message or description
- No args: Error - input required

## The Iron Laws

```
1. NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
2. ONE HYPOTHESIS AT A TIME
3. THREE FAILED HYPOTHESES = QUESTION ARCHITECTURE
```

If root cause isn't identified, you cannot propose fixes. Symptom fixes are failure.

## Red Flags - STOP

If you catch yourself thinking:
- "Quick fix for now"
- "Just try changing X"
- "It's probably X"
- "I'll add multiple changes"
- "One more fix attempt" (after 2+)

**STOP. Return to evidence gathering.**

## Input Classification & Routing

| Input Type | Signals | Route |
|------------|---------|-------|
| CI failure | Build logs, pipeline errors, "CI failed" | Full workflow |
| Test failure | Stack traces, assertion errors, test framework output | Full workflow |
| Runtime error | Exceptions, crashes, HTTP 500s | Full workflow |
| Behavior bug | "X should do Y but does Z", no stack trace | Full workflow |
| Performance | "slow", "timeout", "memory", timing issues | Full workflow |

## Agent References

Each subagent reads instructions from `.{ide-folder}/agents/{agent}.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. ...")`

Available agents: `investigator`, `analyst`, `test-engineer`, `editor`, `qa`, `test-qa`

## Mandatory Delegation

**You MUST delegate all agent work using the Task tool. NEVER do agent work inline.**

You are the orchestrator. You classify input, manage state, validate outputs, and delegate.

---

## Workflow Steps

Execute each step by reading its detailed instructions.

### Step 1: Input Classification & Initialization

**Read:** `steps/step-01-input-classification.md`

- Parse input source (file, GitHub issue, inline text)
- Classify by signals (CI failure, test failure, runtime error, behavior bug, performance)
- Generate session ID and create working directory
- Initialize `workflow-state.yaml`, `decision-log.md`, `bug-report.md`

### Step 2: Root Cause Investigation

**Read:** `steps/step-02-root-cause-investigation.md`

- Delegate to Investigator subagent via Task tool
- Evidence gathering, NOT guessing
- Output: `investigation-log.md`
- Validate: error analysis, failure point, data flow, evidence

### Step 3: Pattern Analysis

**Read:** `steps/step-03-pattern-analysis.md`

- Delegate to Analyst subagent via Task tool
- Find working examples to compare
- Output: `evidence.md`
- Validate: working examples, comparison, dependencies, assumptions

### Step 4: Hypothesis Testing (Loop, max 3)

**Read:** `steps/step-04-hypothesis-testing.md`

- Delegate to Analyst subagent via Task tool
- ONE hypothesis at a time
- Output: `hypothesis-log.md`
- If 3 failures: escalate (architectural problem)

### Step 4b: Regression Test (Before Fix)

**Read:** `steps/step-04b-test-engineer-regression.md`

- Delegate to Test Engineer subagent via Task tool
- Write FAILING test that reproduces bug
- Output: `regression-test-log.md`
- Test MUST fail (expected!)

### Step 5: Fix Implementation

**Read:** `steps/step-05-fix-implementation.md`

- Delegate to Editor subagent via Task tool
- ONE fix addressing root cause
- Output: `fix-log.md`
- Verify regression test now passes

### Step 6: QA Loop (max 3 iterations)

**Read:** `steps/step-06-qa-loop.md`

- Delegate to QA + Test QA subagents via Task tool
- Verify original bug fixed, no regressions
- Output: `qa-{n}.md`, `test-qa-{n}.md`
- If unresolved after 3 iterations: escalate

---

## Decision Logging

All autonomous decisions logged in `decision-log.md`:
- Context, evidence, chosen action
- Confidence score
- Open questions

**Format:**
```markdown
### DEC-{N}: {Decision Title}

**Step**: {step-name}
**Agent**: {agent}
**Timestamp**: {ISO}

**Context**: {why this decision was needed}

**Evidence/Findings**: {what was observed}

**Decision**: {what was decided}

**Confidence**: {%}

**Reversibility**: Easy | Medium | Hard
```

---

## Escalation

Workflow escalates (requires human) when:
- 3 hypotheses failed (architectural problem)
- 3 QA iterations without resolution
- Original bug cannot be verified as fixed

Create `{session_path}/escalation.md` or `{session_path}/qa-escalation.md` with:
- Summary of what was tried
- Hypotheses tested and rejected
- Unresolved issues
- Recommendation for human review

---

## Artifacts

All outputs: `documentation/debug/{session_id}/`

| Artifact | Purpose |
|----------|---------|
| `workflow-state.yaml` | Execution state |
| `decision-log.md` | All autonomous decisions |
| `bug-report.md` | Original input preserved |
| `investigation-log.md` | Evidence gathered |
| `evidence.md` | Working vs broken comparison |
| `hypothesis-log.md` | Hypotheses tested |
| `regression-test-log.md` | Failing test before fix |
| `fix-log.md` | Fix implementation details |
| `qa-{n}.md` | QA review findings |
| `test-qa-{n}.md` | Test QA findings |
| `escalation.md` | If escalated |

---

## Supporting Techniques

See skill directory for:
- `root-cause-tracing.md` - Trace backward through call stack
- `defense-in-depth.md` - Validate at multiple layers
- `condition-based-waiting.md` - Replace arbitrary timeouts
