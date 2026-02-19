# Step 5: QA Review

---

## ORCHESTRATOR ACTION

**You MUST delegate QA review using the Task tool. Do NOT review yourself.**

Verify implementation matches design decisions and quality standards.

---

## SEQUENCE

### 5.1 Delegate QA Review

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-qa.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning QA review.'

---

# TASK: Review Frontend Implementation

Review implementation against design decisions and quality standards.

Workflow: frontend-development (autonomous)
Session ID: {session_id}
Session path: {session_path}
QA iteration: {qa_iterations + 1}

Documents to review:
- Design decisions: {session_path}/design-decisions.md
- Implementation log: {session_path}/implementation-log.md
- Feature request: {session_path}/feature-request.md

Your task:
1. Verify design compliance (colors, typography, spacing)
2. Check all component states implemented
3. Verify interaction patterns work as specified
4. Check responsive behavior
5. Verify accessibility requirements
6. Check code quality

Output to: {session_path}/qa-review-{iteration}.md

Decision log: {session_path}/decision-log.md
")
```

### 5.2 Validate QA Output

Read `{session_path}/qa-review-{iteration}.md`. Verify it contains:

**Required sections:**
- [ ] Summary - severity counts, verdict
- [ ] Design Compliance Matrix - each spec checked
- [ ] Issues - by severity (Blocker/Major/Minor/Nit)
- [ ] Verdict - PASS or CHANGES_REQUESTED

### 5.3 Process QA Verdict

**If PASS:**
```markdown
### DEC-{N}: QA Passed

**Step**: qa-review
**Agent**: QA
**Timestamp**: {ISO}

**Context**: QA review of frontend implementation

**Result**: PASS
**Issues found**: {count by severity}

**Decision**: Workflow complete

**Confidence**: 100%
```

Proceed to completion.

**If CHANGES_REQUESTED:**

```markdown
### DEC-{N}: QA Changes Requested

**Step**: qa-review
**Agent**: QA
**Timestamp**: {ISO}

**Context**: QA review found issues

**Issues**:
- Blockers: {count}
- Majors: {count}
- Minors: {count}

**Decision**: Re-delegate to frontend developer for fixes

**Confidence**: 100%
```

### 5.4 Fix Loop (if needed)

If `qa_iterations < max_qa_iterations`:

Increment `qa_iterations` and delegate fix:

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-frontend-developer.md

...setup instructions...

---

# TASK: Fix QA Issues

Fix the issues identified in QA review.

Session path: {session_path}
QA review: {session_path}/qa-review-{iteration}.md
Design decisions: {session_path}/design-decisions.md

Fix blockers first, then majors. Minors and nits are optional.

Append fixes to: {session_path}/implementation-log.md
")
```

Then re-run QA (step 5.1).

**If 3 iterations without resolution:**

Escalate:
```markdown
# QA Escalation - {session_id}

## Summary
3 QA iterations completed without full resolution.

## Persistent Issues
{issues that keep recurring}

## Recommendation
Human review needed for: {specific issues}
```

Write to `{session_path}/qa-escalation.md`.

### 5.5 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 5
    name: "qa-review"
    completed_at: {ISO}
    verdict: {PASS | ESCALATED}
    iterations: {count}

artifacts:
  qa_review: "{session_path}/qa-review-{final_iteration}.md"

status: "completed"
```

**Output:**
```
Frontend Development Complete

Session: {session_id}
Artifacts: {session_path}

Design decisions: {session_path}/design-decisions.md
Implementation: {session_path}/implementation-log.md
QA review: {session_path}/qa-review-{iteration}.md

Status: {COMPLETED | ESCALATED}
```

---

## WORKFLOW COMPLETE

All artifacts in `{ide-folder}/{outputFolder}/frontend/{session_id}/`
