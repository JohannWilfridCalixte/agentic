# Step 5: Fix Implementation

---

## ORCHESTRATOR ACTION

**You MUST delegate fix implementation using the Task tool. Do NOT implement fixes yourself.**

Fix the root cause, not the symptom. Test first.

---

## SEQUENCE

### 5.1 Delegate Fix Implementation

```
Task(subagent_type="general-purpose", prompt="
You are the Editor agent. Read .claude/agents/editor.md for your full instructions.

Implement the fix for the confirmed root cause.

Workflow: debug (autonomous)
Session ID: {session_id}
Session path: {session_path}
Confirmed hypothesis: {from hypothesis-log}
Investigation log: {session_path}/investigation-log.md
Evidence: {session_path}/evidence.md
Hypothesis log: {session_path}/hypothesis-log.md

Your task:
1. Create a FAILING test case that reproduces the bug
2. Implement the fix - ONE change addressing root cause
3. Verify the test now passes
4. Run full test suite to check for regressions

RULES:
- Failing test FIRST, then fix
- ONE fix at a time
- No 'while I'm here' improvements
- No bundled refactoring
- Fix at SOURCE, not at symptom point

If implementing defense-in-depth (multiple validation layers), document each layer.

Output to: {session_path}/fix-log.md

Decision log: {session_path}/decision-log.md
")
```

### 5.2 Validate Output

Read `{session_path}/fix-log.md`. Verify it contains:

**Required sections:**
- [ ] Test Case - failing test that reproduces bug
- [ ] Fix Description - what was changed
- [ ] Verification - test passes, no regressions
- [ ] Files Changed - list of modified files

**If test not written first:**
Re-delegate with emphasis on TDD requirement.

### 5.3 Log Fix Decision

```markdown
### DEC-{N}: Fix Implemented

**Step**: fix-implementation
**Agent**: Editor
**Timestamp**: {ISO}

**Context**: Implementing fix for confirmed root cause

**Root cause**: {from hypothesis}
**Fix approach**: {description}
**Files changed**: {count}

**Test results**:
- Regression test: PASS
- Full suite: {PASS/FAIL with count}

**Decision**: Proceed to QA verification

**Confidence**: {%}

**Reversibility**: Easy (git revert)
```

### 5.4 Handle Test Failures

If full test suite fails after fix:

**If unrelated failures:**
Document in decision log, proceed to QA.

**If related failures (fix broke something):**

```markdown
### DEC-{N}: Fix Caused Regressions

**Step**: fix-implementation
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**: Fix implementation caused test regressions

**New failures**: {count}
**Analysis**: {related to fix or coincidental}

**Decision**: Re-delegate fix with regression constraint

**Confidence**: {%}
```

Re-delegate to editor with additional constraint:
```
Additional constraint: Your previous fix caused these regressions:
{list of failing tests}

Adjust fix to not break these tests.
```

### 5.5 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 5
    name: "fix-implementation"
    completed_at: {ISO}
    files_changed: {list}
    test_created: true
    suite_passing: {boolean}

artifacts:
  fix_log: "{session_path}/fix-log.md"

current_step: 6
```

**Output:**
```
Fix implemented

Files changed: {count}
Test: Created and passing
Suite: {status}

Proceeding to QA Loop...
```

---

## FIX LOG TEMPLATE

```markdown
# Fix Log - {session_id}

## Root Cause Summary

{1-2 sentences from confirmed hypothesis}

## Test Case

### Failing Test (before fix)

```{language}
{test code that reproduces the bug}
```

**Location:** {file:line}

**Failure output:**
```
{test failure output before fix}
```

## Fix Implementation

### Approach

{explain what the fix does and why it addresses root cause}

### Changes

#### {file1}

```diff
{diff showing changes}
```

**Rationale:** {why this change}

#### {file2} (if applicable)

```diff
{diff}
```

### Defense-in-Depth (if applicable)

If multiple validation layers added:

| Layer | Location | Validation |
|-------|----------|------------|
| Entry | {file:line} | {what it checks} |
| Business | {file:line} | {what it checks} |
| Environment | {file:line} | {what it checks} |

## Verification

### Regression Test

```
{test output showing pass}
```

### Full Test Suite

```
{test suite summary - pass/fail counts}
```

### Regressions

- [ ] No new failures
- [ ] All existing tests pass

## Files Changed

| File | Change Type |
|------|-------------|
| {file1} | {added/modified/deleted} |
| {file2} | {type} |
```

---

## NEXT STEP

Load `step-06-qa-loop.md`
