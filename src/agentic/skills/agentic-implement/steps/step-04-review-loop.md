# Step 4: Review Loop

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

### 4.1 Initialize Loop

```yaml
review_loop:
  iteration: 1
  started_at: {ISO}
  rounds: []
```

### 4.2 Delegate QA Review (Code)

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning QA review.'

---

# TASK: Review Implementation Code

Review the implementation code (NOT tests - Test QA handles that).

Workflow: implement (autonomous)
Iteration: {iteration}
Topic: {topic}
Output path: {output_path}
Technical Plan: {output_path}/technical-plan.md
Implementation Log: {output_path}/implementation-log.md
Output to: {output_path}/qa-{iteration}.md
")
```

Validate: `{output_path}/qa-{iteration}.md` exists with verdict.

### 4.3 Delegate Test QA Review

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Test QA review.'

---

# TASK: Review Test Quality and Coverage

Review the tests for quality and coverage.

Workflow: implement (autonomous)
Iteration: {iteration}
Topic: {topic}
Output path: {output_path}
Technical Plan: {output_path}/technical-plan.md
Test Log: {output_path}/test-log.md
Implementation Log: {output_path}/implementation-log.md
Output to: {output_path}/test-qa-{iteration}.md
")
```

Validate: `{output_path}/test-qa-{iteration}.md` exists with verdict.

### 4.4 Delegate Security QA Review

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/security-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning Security QA review.'

---

# TASK: Security Review of Implementation

Security review of the implementation.

Workflow: implement (autonomous)
Iteration: {iteration}
Topic: {topic}
Output path: {output_path}
Output to: {output_path}/security-{iteration}.md
")
```

Validate: `{output_path}/security-{iteration}.md` exists with verdict.

### 4.5 Aggregate Results

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

### 4.6 Check Exit Conditions

**Clean exit:**

```
IF blocker_count == 0 AND major_count == 0:
  → EXIT → Proceed to Step 5
```

**Max iterations reached:**

```
IF iteration >= max_iterations AND (blockers > 0 OR majors > 0):
  → ASK DEVELOPER how to proceed (this workflow is NOT fully autonomous)
  → Options: create draft PR, keep fixing, or stop
```

**Continue:**

```
IF (blockers > 0 OR majors > 0) AND iteration < max_iterations:
  → FIX PHASE
```

### 4.7 Delegate Fix Phase

**For code issues (from QA/Security):**

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/editor.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. See the 'Fix Phase' section for fix-specific instructions. Complete ALL setup steps before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning fix phase.'

---

# TASK: Fix Code Review Issues

Workflow: implement (autonomous)
Iteration: {iteration}
Topic: {topic}
Output path: {output_path}
Issues to fix:
{blocker and major code issues from qa-{iteration}.md and security-{iteration}.md}

Priority: Blockers first, then Majors.
Update implementation-log.md.
Run existing tests to verify no regressions.
Decision log: {output_path}/decision-log.md
")
```

**For test issues (from Test QA):**

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/test-engineer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning test fixes.'

---

# TASK: Fix Test Review Issues

Workflow: implement (autonomous)
Iteration: {iteration}
Topic: {topic}
Output path: {output_path}
Issues to fix:
{blocker and major test issues from test-qa-{iteration}.md}

Priority: Blockers first, then Majors.
Update test-log.md.
Run tests to verify.
Decision log: {output_path}/decision-log.md
")
```

Validate: fixes applied, tests pass.

### 4.8 Loop

Update iteration count, go to 4.2.

---

## STEP COMPLETION

### Clean Exit

```yaml
review_loop:
  status: "passed"
  total_iterations: {n}
  final_verdict: "PASS"

steps_completed:
  - step: 4
    name: "review-loop"
    completed_at: {ISO}
    iterations: {n}
    verdict: "PASS"

current_step: 5
```

### Max Iterations Reached

Ask developer before proceeding. Do NOT auto-create a draft PR.

---

## NEXT STEP

Load `step-05-pr.md`
