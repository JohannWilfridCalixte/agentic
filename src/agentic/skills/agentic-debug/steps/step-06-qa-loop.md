# Step 6: QA Loop

---

## ORCHESTRATOR ACTION

**You MUST delegate QA and Test QA reviews using the Task tool. Do NOT review or fix yourself.**

Verify the fix actually resolves the original bug. Check test quality. Check for regressions.

---

## LOOP CONFIGURATION

```yaml
max_iterations: 3
severity_handling:
  blocker: must_fix, blocks_completion
  major: should_fix, blocks_completion
  minor: may_fix, does_not_block
  nit: defer, does_not_block
```

---

## SEQUENCE

### 6.1 Initialize Loop

```yaml
qa_loop:
  iteration: 1
  started_at: {ISO}
  rounds: []
```

### 6.2 Delegate QA Review (Fix Quality)

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning QA review.'

---

# TASK: Verify Debug Fix

Verify the debug fix (NOT tests - Test QA handles that).

Workflow: debug (autonomous)
Iteration: {iteration}
Session ID: {session_id}
Session path: {session_path}
Bug report: {session_path}/bug-report.md
Fix log: {session_path}/fix-log.md

Your task:
1. Verify the ORIGINAL BUG is actually fixed
   - Can you still reproduce the original issue?
   - Does the fix address the root cause, not just symptoms?

2. Check for regressions
   - Run full test suite
   - Check related functionality
   - Verify no new issues introduced

3. Review fix quality
   - Is the fix at the source or at the symptom?
   - Code quality acceptable?

Output to: {session_path}/qa-{iteration}.md

Severity levels:
- blocker: Original bug not fixed, or critical regression
- major: Significant regression or inadequate fix
- minor: Minor issues, edge cases
- nit: Style, documentation

Decision log: {session_path}/decision-log.md
")
```

### 6.3 Delegate Test QA Review

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Test QA review.'

---

# TASK: Review Regression Test Quality

Review the regression test quality.

Workflow: debug (autonomous)
Iteration: {iteration}
Session ID: {session_id}
Session path: {session_path}
Bug report: {session_path}/bug-report.md
Regression test log: {session_path}/regression-test-log.md
Fix log: {session_path}/fix-log.md
Output to: {session_path}/test-qa-{iteration}.md

Your task:
1. Verify regression test actually catches the bug
   - Does it test the root cause scenario?
   - Would it have failed before the fix?

2. Check test quality
   - Is it maintainable?
   - Does it test behavior, not implementation?
   - Any anti-patterns?

3. Check coverage
   - Edge cases covered?
   - Related scenarios tested?

Decision log: {session_path}/decision-log.md
")
```

### 6.4 Validate Output

Read both review files. Verify they contain:

**QA review (`qa-{iteration}.md`):**
- [ ] Original Bug Verification - is it fixed?
- [ ] Regression Check - any new issues?
- [ ] Fix Quality Review
- [ ] Verdict: PASS or issues list with severity

**Test QA review (`test-qa-{iteration}.md`):**
- [ ] Regression test catches the bug
- [ ] Test quality assessment
- [ ] Verdict: PASS or issues list with severity

### 6.5 Aggregate Results

```yaml
qa_round:
  iteration: {n}
  original_bug_fixed: {boolean}
  issues:
    blocker: {count}
    major: {count}
    minor: {count}
    nit: {count}
  verdict: "PASS" | "FIX_REQUIRED" | "BLOCKED"
```

### 6.6 Check Exit Conditions

**Clean exit (success):**

```
IF original_bug_fixed AND blocker_count == 0 AND major_count == 0:
  → EXIT → Complete workflow
```

**Max iterations with escalation:**

```
IF iteration >= max_iterations AND (blockers > 0 OR majors > 0 OR !original_bug_fixed):
  → ESCALATION: Document for human review
```

**Continue:**

```
IF (blockers > 0 OR majors > 0 OR !original_bug_fixed) AND iteration < max_iterations:
  → FIX PHASE
```

### 6.7 Delegate Fix Phase

**For code/fix issues (from QA):**

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/editor.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. See 'Fix Phase' section. Complete ALL setup steps before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning fix phase.'

---

# TASK: Address QA Findings

Address QA findings on the fix.

Workflow: debug (autonomous)
Iteration: {iteration}
Session ID: {session_id}
Session path: {session_path}
QA findings: {session_path}/qa-{iteration}.md

Issues to fix:
{blocker and major issues from qa-{iteration}.md}

{If original bug not fixed}:
CRITICAL: The original bug is NOT fixed. Review the root cause and hypothesis.
You may need to return to investigation if the hypothesis was wrong.

Priority:
1. Ensure original bug is fixed
2. Fix blockers
3. Fix majors

Update fix-log.md with changes.
Run tests to verify.

Decision log: {session_path}/decision-log.md
")
```

**For test issues (from Test QA):**

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-engineer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning test fixes.'

---

# TASK: Address Test QA Findings

Address Test QA findings.

Workflow: debug (autonomous)
Iteration: {iteration}
Session ID: {session_id}
Session path: {session_path}
Test QA findings: {session_path}/test-qa-{iteration}.md

Issues to fix:
{blocker and major issues from test-qa-{iteration}.md}

Priority: Blockers first, then Majors.
Update regression-test-log.md.
Run tests to verify.

Decision log: {session_path}/decision-log.md
")
```

### 6.8 Loop

Increment iteration, go to 6.2.

### 6.9 Handle Escalation

If max iterations reached without success:

```markdown
### DEC-{N}: QA Loop Escalation

**Step**: qa-loop
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**: Max iterations ({max}) reached

**Status**:
- Original bug fixed: {yes/no}
- Unresolved blockers: {count}
- Unresolved majors: {count}

**Decision**: Escalate for human review

**Confidence**: 85%

**Rationale**: Automated debugging could not fully resolve the issue.

**Reversibility**: N/A
```

Create `{session_path}/qa-escalation.md`:

```markdown
# QA Escalation - Human Review Needed

## Session: {session_id}

## Status

| Check | Status |
|-------|--------|
| Original bug fixed | {YES/NO} |
| Blockers | {count} |
| Majors | {count} |
| QA iterations | {count} |

## Unresolved Issues

{list of blocker and major issues}

## What Was Tried

{summary of fix attempts across iterations}

## Recommendation

{what the orchestrator recommends as next steps}

## Artifacts

- Bug report: {session_path}/bug-report.md
- Investigation: {session_path}/investigation-log.md
- Evidence: {session_path}/evidence.md
- Hypotheses: {session_path}/hypothesis-log.md
- Fix: {session_path}/fix-log.md
- QA reviews: {session_path}/qa-*.md
```

---

## STEP COMPLETION

### Success Exit

```yaml
qa_loop:
  status: "passed"
  total_iterations: {n}
  final_verdict: "PASS"
  original_bug_fixed: true

fix_verified: true

steps_completed:
  - step: 6
    name: "qa-loop"
    completed_at: {ISO}
    iterations: {n}
    verdict: "PASS"

status: "completed"
```

**Output:**
```
Debug workflow complete

Original bug: FIXED
QA iterations: {n}
Status: VERIFIED

Session: {session_id}
Artifacts: {session_path}/

Summary:
- Root cause: {from hypothesis}
- Fix: {summary}
- Tests: All passing
```

### Escalated Exit

```yaml
qa_loop:
  status: "escalated"
  total_iterations: {max}
  final_verdict: "ESCALATED"
  original_bug_fixed: {boolean}
  unresolved:
    blockers: {list}
    majors: {list}

status: "escalated"
```

**Output:**
```
Debug workflow escalated

Original bug fixed: {YES/NO}
Unresolved issues: {count}
Status: REQUIRES HUMAN REVIEW

Session: {session_id}
Escalation: {session_path}/qa-escalation.md
```

---

## QA REVIEW TEMPLATE

```markdown
# QA Review - {session_id} - Iteration {n}

## Original Bug Verification

### Can the bug be reproduced?

{YES - bug still present / NO - bug is fixed}

### Steps to verify:
1. {step}
2. {step}
3. {expected vs actual}

### Verdict on original bug: {FIXED / NOT FIXED}

## Regression Check

### Test Suite

```
{test output summary}
```

| Status | Count |
|--------|-------|
| Passed | {n} |
| Failed | {n} |
| Skipped | {n} |

### New Failures

{list any tests that fail now but passed before the fix}

### Related Functionality

| Area | Status | Notes |
|------|--------|-------|
| {area1} | OK/ISSUE | {notes} |
| {area2} | OK/ISSUE | {notes} |

## Fix Quality Review

### Root Cause vs Symptom

- [ ] Fix addresses root cause
- [ ] Not just masking the symptom

### Test Coverage

- [ ] Regression test exists
- [ ] Test actually exercises the fix
- [ ] Edge cases covered

### Code Quality

- [ ] Fix is minimal (no bundled changes)
- [ ] No new technical debt

## Issues Found

### Blockers
{list or "None"}

### Majors
{list or "None"}

### Minors
{list or "None"}

### Nits
{list or "None"}

## Verdict

**Status:** PASS | FIX_REQUIRED | BLOCKED

**Summary:** {1-2 sentences}
```

---

## WORKFLOW COMPLETE

No next step. Workflow ends here.
