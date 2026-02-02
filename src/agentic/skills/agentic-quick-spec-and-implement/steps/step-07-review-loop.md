# Step 7: Review Loop

---

## ORCHESTRATOR ACTION

**You MUST delegate all reviews and fixes using the Task tool. Do NOT review or fix code yourself.**

Loop through QA, Test QA, and Security reviews until clean or max iterations (3).

---

## LOOP CONFIGURATION

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

### 7.1 Initialize Loop

```yaml
review_loop:
  iteration: 1
  started_at: {ISO_timestamp}
  rounds: []
```

### 7.2 Delegate QA Review (Code)

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning QA review.'

---

# TASK: Review Implementation Code

Review the implementation code (NOT tests - Test QA handles that).

Workflow mode: {workflow_mode}
Iteration: {iteration}
Story ID: {story_id}
Story path: {story_path}
Spec: {story_path}/spec.md
Technical Plan: {story_path}/technical-plan.md
Implementation Log: {story_path}/implementation-log.md
Output to: {story_path}/qa-{iteration}.md
")
```

Validate: `{story_path}/qa-{iteration}.md` exists with verdict.

### 7.3 Delegate Test QA Review

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Test QA review.'

---

# TASK: Review Test Quality and Coverage

Review the tests for quality and coverage.

Workflow mode: {workflow_mode}
Iteration: {iteration}
Story ID: {story_id}
Story path: {story_path}
Spec: {story_path}/spec.md
Technical Plan: {story_path}/technical-plan.md
Test Log: {story_path}/test-log.md
Implementation Log: {story_path}/implementation-log.md
Output to: {story_path}/test-qa-{iteration}.md
")
```

Validate: `{story_path}/test-qa-{iteration}.md` exists with verdict.

### 7.4 Delegate Security QA Review

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/security-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Security QA review.'

---

# TASK: Security Review of Implementation

Security review of the implementation.

Workflow mode: {workflow_mode}
Iteration: {iteration}
Story ID: {story_id}
Story path: {story_path}
Security Addendum: {story_path}/security-addendum.md
Spec: {story_path}/spec.md
Output to: {story_path}/security-{iteration}.md
")
```

Validate: `{story_path}/security-{iteration}.md` exists with verdict.

### 7.5 Aggregate Results

Read all three review files (qa, test-qa, security). Collect all issues:

```yaml
review_round:
  iteration: {n}
  totals:
    blocker: {sum}
    major: {sum}
    minor: {sum}
    nit: {sum}
  verdict: "PASS" | "FIX_REQUIRED" | "BLOCKED"
```

### 7.6 Check Exit Conditions

**Clean exit:**

```
IF blocker_count == 0 AND major_count == 0:
  -> EXIT -> Proceed to Step 8
```

**Max iterations with escalation:**

```
IF iteration >= max_iterations AND (blockers > 0 OR majors > 0):
  -> ESCALATION
```

**Continue:**

```
IF (blockers > 0 OR majors > 0) AND iteration < max_iterations:
  -> FIX PHASE
```

### 7.7 Delegate Fix Phase

**For code issues (from QA/Security):**

```
Task(subagent_type="general-purpose", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/editor.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. See the 'Fix Phase' section. Complete ALL setup steps before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning fix phase.'

---

# TASK: Fix Code Review Issues

Workflow mode: {workflow_mode}
Iteration: {iteration}
Story ID: {story_id}
Story path: {story_path}
Issues to fix:
{blocker and major code issues from qa-{iteration}.md and security-{iteration}.md}

Priority: Blockers first, then Majors.
Update implementation-log.md.
Run existing tests to verify no regressions.
Decision log: {story_path}/decision-log.md
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

# TASK: Fix Test Review Issues

Workflow mode: {workflow_mode}
Iteration: {iteration}
Story ID: {story_id}
Story path: {story_path}
Issues to fix:
{blocker and major test issues from test-qa-{iteration}.md}

Priority: Blockers first, then Majors.
Update test-log.md.
Run tests to verify.
Decision log: {story_path}/decision-log.md
")
```

Validate: fixes applied, tests pass.

### 7.8 Loop

Update iteration count, go to 7.2.

### 7.9 Handle Escalation

**Interactive mode:** Present unresolved issues, ask user how to proceed.

**Auto mode:** Log escalation decision in `decision-log.md`, set draft PR flags.

```yaml
pr_flags:
  is_draft: true
  unresolved_issues: [{issue_id}: {title}, ...]
```

---

## STEP COMPLETION

### Clean Exit

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

### Escalated Exit

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

---

## NEXT STEP

Load `step-08-create-pr.md`
