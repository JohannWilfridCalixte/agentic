# Step 8: Create PR

## EXECUTION RULES

- Generate comprehensive PR from all artifacts
- Link to story, specs, and review results
- Draft PR if escalated from review loop
- Output: PR URL

---

## SEQUENCE

### 8.1 Gather PR Context

**Read from workflow-state.yaml:**
```yaml
epic_id: {value}
story_id: {value}
story_path: {value}
review_loop:
  status: "passed" | "escalated"
  unresolved: {list if escalated}
pr_flags: {if set}
```

**Read artifacts:**
- `spec.md` - for user story and AC summary
- `technical-plan.md` - for implementation approach
- `implementation-log.md` - for changes made
- `qa-{final}.md` - for test results
- `security-{final}.md` - for security verification
- `decision-log.md` - for decisions made (auto mode)

### 8.2 Determine PR Type

**If review_loop.status == "passed":**
```yaml
pr_type: "ready"
is_draft: false
title_prefix: ""
```

**If review_loop.status == "escalated":**
```yaml
pr_type: "needs_review"
is_draft: true
```

### 8.3 Ensure Feature Branch

**Check current branch:**
```bash
git branch --show-current
```

**If on main/master:**
```bash
# Create feature branch
git checkout -b {epic_id}/{story_id}
```

**If already on feature branch:**
- Verify branch name matches story
- Continue

### 8.4 Stage and Commit Changes

**Check for uncommitted changes:**
```bash
git status
```

**If changes exist:**
```bash
# Stage implementation files (not documentation)
git add src/ tests/ ...

# Commit with structured message
git commit -m "$(cat <<'EOF'
{story_id}: {Brief description from spec}

Implements:
- AC-01: {summary}
- AC-02: {summary}

Technical approach:
{Brief summary from technical-plan}
EOF
)"
```

### 8.5 Push Branch

```bash
git push -u origin {branch_name}
```

### 8.6 Generate PR Description

**Template:**

```markdown
## Summary

{2-3 sentence summary from spec.md problem statement and solution}

**Story:** {story_id}
**Epic:** {epic_id}

## User Story

> As a {user type},
> I want {capability},
> So that {benefit}.

## Changes Made

{Summary from implementation-log.md}

### Files Changed
- `{file1}` - {what changed}
- `{file2}` - {what changed}

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC-01 | {description} | Done |
| AC-02 | {description} | Done |

## Testing

### Automated Tests
- {test file}: {what it covers}

### Manual Verification
```bash
{commands to verify}
```

## Security

{Summary from security review}

- [x] No injection vulnerabilities
- [x] Auth/authz verified
- [x] Input validation in place

## Review Notes

{If escalated, list unresolved issues here}

## Related Artifacts

- [Spec]({relative_path}/spec.md)
- [Technical Plan]({relative_path}/technical-plan.md)
- [Implementation Log]({relative_path}/implementation-log.md)
- [QA Review]({relative_path}/qa-{final}.md)
- [Security Review]({relative_path}/security-{final}.md)
{If auto mode:}
- [Decision Log]({relative_path}/decision-log.md)

---

Generated with [Claude Code](https://claude.ai/code) via spec-to-pr workflow
```

### 8.7 Create PR

**If pr_type == "ready":**
```bash
gh pr create \
  --title "{story_id}: {Title from spec}" \
  --body "$(cat <<'EOF'
{Generated PR description}
EOF
)" \
  --base main
```

**If pr_type == "needs_review" (escalated):**
```bash
gh pr create \
  --title "{story_id}: {Title from spec}" \
  --body "$(cat <<'EOF'
{Generated PR description}

---

**This PR requires human review**

The automated review loop reached maximum iterations with unresolved issues:

### Unresolved Blockers
{List of blocker issues}

### Unresolved Majors
{List of major issues}

Please review and address these issues before merging.
EOF
)" \
  --base main \
  --draft
```

**Capture PR URL:**
```bash
gh pr view --json url -q '.url'
```

### 8.8 Link PR to GitHub Issue (If Applicable)

**If input was GitHub issue:**
```bash
# Add PR link to issue
gh issue comment {issue_number} --body "PR created: {pr_url}"

# Optionally link via "Closes" (if PR will close issue)
# This is already in PR description if applicable
```

---

## STEP COMPLETION

### Update Workflow State

**Update workflow-state.yaml:**
```yaml
pr_url: "{pr_url}"
pr_type: "{ready|needs_review}"
pr_number: {number}

status: "completed"

steps_completed:
  - step: 8
    name: "create-pr"
    completed_at: {ISO_timestamp}
    output: "{pr_url}"

completed_at: {ISO_timestamp}
```

### Final Output

**If pr_type == "ready":**
```
Workflow Complete!

Story: {story_id}
PR: {pr_url}
Status: Ready for review

**Summary:**
- Spec created with {ac_count} acceptance criteria
- Implementation passed QA and Security review
- All blockers and majors resolved
- {deferred_count} minor/nit issues deferred

**Next Steps:**
1. Request code review from team
2. Address review feedback
3. Merge when approved

Artifacts: {story_path}/
```

**If pr_type == "needs_review" (escalated):**
```
Workflow Complete (Escalated)

Story: {story_id}
PR: {pr_url} (DRAFT)
Status: Needs human review

**Unresolved Issues:**
- Blockers: {count}
- Majors: {count}

**Required Actions:**
1. Review unresolved issues in PR description
2. Fix remaining blockers/majors manually
3. Convert from draft when ready
4. Request code review

Artifacts: {story_path}/
```

**If auto mode, add:**
```
Autonomous Decisions: {decision_count}
Review decisions: {story_path}/decision-log.md
```

---

## WORKFLOW COMPLETE

The spec-to-pr workflow has finished.

**Artifacts Created:**
```
{story_path}/
  spec.md                 # Product specification
  technical-context.md    # Technical context analysis
  security-addendum.md    # Security requirements
  technical-plan.md       # Implementation plan
  implementation-log.md   # What was implemented
  qa-{n}.md              # QA review(s)
  security-{n}.md        # Security review(s)
  decision-log.md        # Decisions (auto mode only)
  workflow-state.yaml    # Workflow state tracking
```

**PR Created:** {pr_url}
