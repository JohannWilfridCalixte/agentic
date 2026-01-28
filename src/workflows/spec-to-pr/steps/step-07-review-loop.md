# Step 7: Review Loop

---

## ORCHESTRATOR ACTION

**You MUST delegate all reviews and fixes using the Task tool. Do NOT review or fix code yourself.**

Loop through QA and Security reviews until clean or max iterations (3).

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

### 7.2 Delegate QA Review

```
Task(subagent_type="general-purpose", prompt="
You are the QA agent. {ide-invoke-prefix}{ide-folder}/agents/qa.md for your full instructions.

Review the implementation.

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

### 7.3 Delegate Security QA Review

```
Task(subagent_type="general-purpose", prompt="
You are the Security QA agent. {ide-invoke-prefix}{ide-folder}/agents/security-qa.md for your full instructions.

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

### 7.4 Aggregate Results

Read both review files. Collect all issues:

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

### 7.5 Check Exit Conditions

**Clean exit:**

```
IF blocker_count == 0 AND major_count == 0:
  → EXIT → Proceed to Step 8
```

**Max iterations with escalation:**

```
IF iteration >= max_iterations AND (blockers > 0 OR majors > 0):
  → ESCALATION
```

**Continue:**

```
IF (blockers > 0 OR majors > 0) AND iteration < max_iterations:
  → FIX PHASE
```

### 7.6 Delegate Fix Phase

```
Task(subagent_type="general-purpose", prompt="
You are the Editor agent. {ide-invoke-prefix}{ide-folder}/agents/editor.md for your full instructions (Fix Phase section).

Fix review issues.

Workflow mode: {workflow_mode}
Iteration: {iteration}
Story ID: {story_id}
Story path: {story_path}
Issues to fix:
{blocker and major issues list}

Priority: Blockers first, then Majors.
Update implementation-log.md.
Run tests to verify.
Decision log: {story_path}/decision-log.md
")
```

Validate: fixes applied, tests pass.

### 7.7 Loop

Update iteration count, go to 7.2.

### 7.8 Handle Escalation

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
