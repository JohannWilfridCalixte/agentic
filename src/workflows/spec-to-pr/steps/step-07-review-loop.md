# Step 7: Review Loop

## EXECUTION RULES

- 🔄 Loop through QA and Security reviews until clean or max iterations
- 🎯 Editor fixes issues between review rounds
- 📊 Track severity: Blocker > Major > Minor > Nit
- 🛑 Exit when: (no blockers AND no majors) OR (max iterations + escalation)
- ✅ Output: Clean code OR flagged PR with unresolved issues

---

## LOOP CONFIGURATION

From `workflow.yaml`:
```yaml
max_iterations: 3

severity_handling:
  blocker: must_fix, blocks_pr
  major: should_fix, blocks_pr
  minor: may_fix, does_not_block
  nit: defer, does_not_block
```

---

## REVIEW LOOP SEQUENCE

### 7.1 Initialize Loop State

**Read current state from workflow-state.yaml:**
```yaml
review_iterations: {current_count}
```

**If first iteration:**
```yaml
review_loop:
  iteration: 1
  started_at: {ISO_timestamp}
  rounds: []
```

### 7.2 Invoke QA Agent

**Claude Code (Subagent):**
```
Task(subagent_type="qa", prompt="Review implementation against acceptance criteria.
Iteration: {iteration}
Story ID: {story_id}
Spec: {story_path}/spec.md
Technical Plan: {story_path}/technical-plan.md
Implementation Log: {story_path}/implementation-log.md
Output to: {story_path}/qa-{iteration}.md")
```

**Cursor (Inline Agent):**
```
@.claude/agents/qa.md
```

**Provide context:**
- `spec.md` - acceptance criteria to verify
- `technical-plan.md` - implementation expectations
- `implementation-log.md` - what was done
- Code changes from editor

**QA Agent Task:**
Review implementation against:
1. All acceptance criteria (AC-01, AC-02, ...)
2. Technical plan tasks (TASK-01, TASK-02, ...)
3. Coding standards from skills
4. RETRO-001 reference validation scenarios

**QA Output Format:**
```markdown
---
Review: QA-{iteration_number}
Reviewer: QA Agent
Timestamp: {ISO}
Story: {story_id}
---

# QA Review - Round {iteration}

## Summary

| Severity | Count |
|----------|-------|
| Blocker | {n} |
| Major | {n} |
| Minor | {n} |
| Nit | {n} |

**Verdict:** {PASS | CHANGES_REQUESTED | BLOCKED}

## Traceability Matrix

| AC | Status | Test Location | Notes |
|----|--------|---------------|-------|
| AC-01 | ✅ Pass | `src/...test.ts:42` | |
| AC-02 | ❌ Fail | - | Missing test coverage |

## Issues

### BLOCKER

#### QA-{iter}-B01: {Issue title}
**Location:** `{file}:{line}`
**Description:** {What's wrong}
**Expected:** {What should happen}
**Actual:** {What happens}
**Fix Required:** {Specific fix needed}

### MAJOR

#### QA-{iter}-M01: {Issue title}
...

### MINOR

#### QA-{iter}-m01: {Issue title}
...

### NIT

#### QA-{iter}-n01: {Issue title}
...

## Reference Validation Results

| Scenario | Expected | Actual | Status |
|----------|----------|--------|--------|
| {name} | {expected} | {actual} | ✅/❌ |
```

**Save to:** `{story_path}/qa-{iteration}.md`

### 7.3 Invoke Security QA Agent

**Claude Code (Subagent):**
```
Task(subagent_type="security-qa", prompt="Security review of implementation.
Iteration: {iteration}
Story ID: {story_id}
Security Addendum: {story_path}/security-addendum.md
Spec: {story_path}/spec.md
Output to: {story_path}/security-{iteration}.md")
```

**Cursor (Inline Agent):**
```
@.claude/agents/security-qa.md
```

**Provide context:**
- `security-addendum.md` - security requirements
- Code changes from editor
- Previous security reviews if any

**Security QA Output Format:**
```markdown
---
Review: SEC-{iteration_number}
Reviewer: Security QA Agent
Timestamp: {ISO}
Story: {story_id}
---

# Security Review - Round {iteration}

## Summary

| Severity | Count |
|----------|-------|
| Blocker | {n} |
| Major | {n} |
| Minor | {n} |
| Nit | {n} |

**Verdict:** {PASS | CHANGES_REQUESTED | BLOCKED}

## Security Requirements Verification

| SEC-REQ | Status | Evidence |
|---------|--------|----------|
| SEC-REQ-01 | ✅ | {evidence} |
| SEC-REQ-02 | ❌ | {what's missing} |

## OWASP Coverage

| Category | Status | Notes |
|----------|--------|-------|
| Injection | ✅ | Input sanitization in place |
| Broken Auth | ⚠️ | See M01 |
| ...

## Issues

### BLOCKER

#### SEC-{iter}-B01: {Issue title}
**Category:** {OWASP category}
**Location:** `{file}:{line}`
**Vulnerability:** {Description}
**Impact:** {What could happen}
**Fix Required:** {Specific remediation}

...
```

**Save to:** `{story_path}/security-{iteration}.md`

### 7.4 Aggregate Review Results

**Collect all issues:**
```yaml
review_round:
  iteration: {n}
  qa_review: "{story_path}/qa-{n}.md"
  security_review: "{story_path}/security-{n}.md"

  totals:
    blocker: {sum}
    major: {sum}
    minor: {sum}
    nit: {sum}

  issues_to_fix:
    - id: "QA-{n}-B01"
      severity: blocker
      source: qa
      title: "{title}"
    - id: "SEC-{n}-M01"
      severity: major
      source: security
      title: "{title}"
    ...

  verdict: "PASS" | "FIX_REQUIRED" | "BLOCKED"
```

### 7.5 Check Exit Conditions

**Exit Condition 1: Clean**
```
IF blocker_count == 0 AND major_count == 0:
  → EXIT LOOP → Proceed to Step 8 (Create PR)
```

**Exit Condition 2: Max Iterations with Escalation**
```
IF iteration >= max_iterations AND (blocker_count > 0 OR major_count > 0):
  → ESCALATION REQUIRED
```

**Continue Condition:**
```
IF (blocker_count > 0 OR major_count > 0) AND iteration < max_iterations:
  → CONTINUE TO FIX PHASE
```

### 7.6 Fix Phase (If Issues Found)

**Filter issues to fix:**
- ALL blockers (must fix)
- ALL majors (should fix)
- Minors: fix if time permits
- Nits: defer to future

**Claude Code (Subagent):**
```
Task(subagent_type="editor", prompt="Fix review issues.
Iteration: {iteration}
Issues to fix:
{issue_list}

Priority: Blockers first, then Majors.
Update implementation-log.md with fixes.
Run tests to verify.")
```

**Cursor (Inline Agent):**
```
@.claude/agents/editor.md
```

**Editor Fix Task:**
```markdown
## Issues to Address

Priority order: Blockers first, then Majors.

### Blockers (MUST FIX)
{List of blocker issues with full context}

### Majors (SHOULD FIX)
{List of major issues with full context}

### Minors (MAY FIX - if time permits)
{List of minor issues}

## Instructions

1. Fix each blocker issue
2. Fix each major issue
3. Run tests to verify fixes don4. Update implementation-log.md with fixes made
5. Do NOT introduce new issues while fixing

## Evidence Required

For each fix, document:
- Issue ID addressed
- What was changed
- Test command and result
```

**Editor Output:**
Append to `implementation-log.md`:
```markdown
## Review Fix Round {iteration}

### Issues Addressed

| Issue ID | Status | Change Made |
|----------|--------|-------------|
| QA-1-B01 | ✅ Fixed | Added null check at line 42 |
| SEC-1-M01 | ✅ Fixed | Parameterized SQL query |

### Tests Run
\`\`\`
$ npm test
...
All tests passed
\`\`\`

### Files Changed
- `src/api/handler.ts` - null check, SQL fix
- `src/api/handler.test.ts` - added test case
```

### 7.7 Loop Continuation

**Update workflow-state.yaml:**
```yaml
review_iterations: {iteration + 1}

review_loop:
  rounds:
    - iteration: 1
      qa_issues: {count}
      security_issues: {count}
      fixed: {count}
    - iteration: 2
      ...
```

**Go to 7.2** (next QA review)

### 7.8 Handle Escalation (Max Iterations Reached)

**If max iterations reached with unresolved issues:**

*Interactive mode:*
```
⚠️ Review Loop: Max iterations ({max}) reached

**Unresolved Issues:**
- Blockers: {count}
- Majors: {count}

**Options:**
[1] Continue fixing (add {n} more iterations)
[2] Create draft PR with issues flagged
[3] Abort workflow

What would you like to do?
```
Wait for user decision.

*Auto mode:*
**Log escalation decision:**
```markdown
### DEC-{N}: Review Loop Escalation

**Step**: review-loop
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**:
Max review iterations ({max}) reached with {blocker_count} blockers and {major_count} majors unresolved.

**Options Considered**:
1. Continue fixing indefinitely (risk: infinite loop)
2. Create draft PR with issues flagged (chosen)
3. Abort workflow (too aggressive)

**Decision**: Create draft PR with issues flagged

**Confidence**: 85%

**Rationale**:
- Human review needed for complex issues
- Progress captured in PR for visibility
- Not losing work done so far

**Trade-offs Accepted**:
- PR will need human intervention before merge
- Unresolved issues remain in codebase temporarily

**Reversibility**: Easy (PR can be updated or closed)
```

**Set flags for Step 8:**
```yaml
pr_flags:
  is_draft: true
  unresolved_issues:
    - {issue_id}: {title}
    ...
```

---

## STEP COMPLETION

### On Clean Exit

**Update workflow-state.yaml:**
```yaml
review_loop:
  status: "passed"
  total_iterations: {n}
  final_verdict: "PASS"

steps_completed:
  - step: 7
    name: "review-loop"
    completed_at: {ISO_timestamp}
    iterations: {n}
    verdict: "PASS"

current_step: 8
```

**Output:**
```
✅ Review loop complete

🔄 Iterations: {n}
✅ QA: Passed
✅ Security: Passed
📝 Deferred: {minor_count} minor, {nit_count} nits

Proceeding to create PR...
```

### On Escalated Exit

**Update workflow-state.yaml:**
```yaml
review_loop:
  status: "escalated"
  total_iterations: {max}
  final_verdict: "ESCALATED"
  unresolved:
    blockers: {list}
    majors: {list}

steps_completed:
  - step: 7
    name: "review-loop"
    completed_at: {ISO_timestamp}
    iterations: {max}
    verdict: "ESCALATED"

current_step: 8
```

**Output:**
```
⚠️ Review loop escalated

🔄 Iterations: {max} (maximum reached)
❌ Unresolved: {blocker_count} blockers, {major_count} majors
📝 Deferred: {minor_count} minor, {nit_count} nits

Creating draft PR for human review...
```

---

## NEXT STEP

Load and execute: `step-08-create-pr.md`
