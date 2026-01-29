# Debug Workflow

Systematic debugging from bug report/CI logs/error to verified fix. Evidence-based, no guessing.

## Core Principle

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

If root cause isn't identified, you cannot propose fixes. Symptom fixes are failure.

## Input Types

| Input | Example |
|-------|---------|
| CI failure | Build logs, pipeline errors, test output |
| Test failure | Stack traces, assertion errors |
| Runtime error | Exceptions, crashes, error messages |
| Behavior bug | "X should do Y but does Z" |
| Performance | Slow queries, memory issues |

## Workflow Steps

```
1. Input Classification → Classify bug type, initialize state
2. Root Cause Investigation → Evidence gathering, NOT guessing
3. Pattern Analysis → Compare working vs broken
4. Hypothesis Testing → Form and test single hypothesis (max 3 attempts)
5. Fix Implementation → Create failing test, implement fix
6. QA Loop → Verify fix, check regressions (max 3 iterations)
```

## The Iron Law

```
Hypothesis attempt #1 failed → New hypothesis, re-analyze evidence
Hypothesis attempt #2 failed → New hypothesis, deeper investigation
Hypothesis attempt #3 failed → STOP. Question architecture. Escalate.
```

3+ failed fixes = architectural problem, not hypothesis problem.

## Agent Delegation

**Orchestrator MUST delegate all work via Task tool:**

| Step | Agent | Output |
|------|-------|--------|
| Root Cause | investigator | investigation-log.md |
| Pattern Analysis | analyst | evidence.md |
| Hypothesis | analyst | hypothesis-log.md |
| Fix | editor | fix-log.md + code |
| QA | qa | qa-{n}.md |

## Artifacts

All outputs: `documentation/debug/DEBUG-{session_id}/`

- `workflow-state.yaml` - execution state
- `decision-log.md` - all autonomous decisions
- `investigation-log.md` - evidence gathered
- `evidence.md` - working vs broken comparison
- `hypothesis-log.md` - hypotheses tested
- `fix-log.md` - fix implementation details
- `qa-{n}.md` - QA review findings

## Red Flags - STOP

If you catch yourself thinking:
- "Quick fix for now"
- "Just try changing X"
- "I'll add multiple changes"
- "It's probably X"

**STOP. Return to evidence gathering.**
