# Step 5: Review Loop

## EXECUTION RULES

- Loop through QA and Security reviews until clean or max iterations
- Editor fixes issues between review rounds
- Track severity: Blocker > Major > Minor > Nit
- Exit when: (no blockers AND no majors) OR (max iterations + escalation)
- NEVER ask user - escalate via draft PR if max iterations reached
- Output: clean code OR flagged PR with unresolved issues

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

### 5.1 Initialize Loop

```yaml
review_loop:
  iteration: 1
  started_at: {ISO}
  rounds: []
```

### 5.2 Invoke QA Agent

**Claude Code:**
```
Task(subagent_type="qa", prompt="Review implementation.
Workflow: auto-implement (autonomous)
Iteration: {iteration}
Story ID: {story_id}
Technical Plan: {story_path}/technical-plan.md
{If exists: Spec: {story_path}/spec.md}
Implementation Log: {story_path}/implementation-log.md
Output to: {story_path}/qa-{iteration}.md")
```

**Cursor:** `@.claude/agents/qa.md`

**QA Output:** `{story_path}/qa-{iteration}.md`

Format: Summary (severity counts, verdict), Traceability Matrix, Issues by severity.

### 5.3 Invoke Security QA Agent

**Claude Code:**
```
Task(subagent_type="security-qa", prompt="Security review.
Workflow: auto-implement (autonomous)
Iteration: {iteration}
Story ID: {story_id}
{If exists: Spec: {story_path}/spec.md}
Output to: {story_path}/security-{iteration}.md")
```

**Cursor:** `@.claude/agents/security-qa.md`

**Security QA Output:** `{story_path}/security-{iteration}.md`

### 5.4 Aggregate Results

Collect all issues from both reviews:
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

### 5.5 Check Exit Conditions

**Clean exit:**
```
IF blocker_count == 0 AND major_count == 0:
  → EXIT → Proceed to Step 6
```

**Max iterations with escalation:**
```
IF iteration >= max_iterations AND (blockers > 0 OR majors > 0):
  → ESCALATION: draft PR with issues flagged
```

**Continue:**
```
IF (blockers > 0 OR majors > 0) AND iteration < max_iterations:
  → FIX PHASE
```

### 5.6 Fix Phase

**Claude Code:**
```
Task(subagent_type="editor", prompt="Fix review issues.
Workflow: auto-implement (autonomous)
Iteration: {iteration}
Issues to fix:
{blocker and major issues list}

Priority: Blockers first, then Majors.
Update implementation-log.md.
Run tests to verify.
Decision log: {story_path}/decision-log.md")
```

**Cursor:** `@.claude/agents/editor.md`

Append fix details to `implementation-log.md`.

### 5.7 Loop

Update iteration count, go to 5.2.

### 5.8 Handle Escalation

Log escalation decision in `decision-log.md`:

```markdown
### DEC-{N}: Review Loop Escalation

**Step**: review-loop
**Agent**: Orchestrator

**Context**: Max iterations ({max}) reached with {blocker_count} blockers, {major_count} majors unresolved.

**Decision**: Create draft PR with issues flagged

**Confidence**: 85%

**Rationale**: Human review needed. Progress captured in PR.

**Trade-offs**: PR needs human intervention before merge.
**Reversibility**: Easy
```

Set flags:
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
  - step: 5
    name: "review-loop"
    completed_at: {ISO}
    iterations: {n}
    verdict: "PASS"

current_step: 6
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
  - step: 5
    name: "review-loop"
    completed_at: {ISO}
    iterations: {max}
    verdict: "ESCALATED"

current_step: 6
```

---

## NEXT STEP

Load `step-06-create-pr.md`
