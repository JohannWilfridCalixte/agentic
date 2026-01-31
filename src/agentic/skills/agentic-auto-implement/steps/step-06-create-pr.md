# Step 6: Create PR

## EXECUTION RULES

- Create feature branch, commit, push, open PR
- Draft PR if review loop was escalated
- Include all relevant context in PR description
- Output: PR URL

---

## SEQUENCE

### 6.1 Gather PR Context

Read artifacts:
- `technical-plan.md` - what was planned
- `implementation-log.md` - what was done
- `decision-log.md` - autonomous decisions made
- `workflow-state.yaml` - review verdict
- `spec.md` (if exists) - acceptance criteria

### 6.2 Ensure Feature Branch

```bash
# Create branch if not already on one
git checkout -b {epic_id}/{story_id}
```

Branch naming: `{epic_id}/{story_id}` (e.g., `EPIC-0042/US-0123`)

### 6.3 Stage and Commit

```bash
git add -A
git commit -m "feat({story_id}): {brief description}

Implemented via auto-implement workflow.
See {story_path}/decision-log.md for autonomous decisions."
```

### 6.4 Push

```bash
git push -u origin {branch_name}
```

### 6.5 Create PR

**If review passed:**
```bash
gh pr create --title "feat({story_id}): {title}" --body "$(cat <<'EOF'
## Summary
{implementation summary from log}

## Changes
{files changed summary}

## Test Plan
{test coverage from implementation log}

## Autonomous Decisions
{count} decisions made autonomously. See `{story_path}/decision-log.md`.

## Open Questions
{list from decision-log.md Open Questions section, or "None"}

## Artifacts
- Technical Plan: `{story_path}/technical-plan.md`
- Implementation Log: `{story_path}/implementation-log.md`
- Decision Log: `{story_path}/decision-log.md`
- QA Reviews: `{story_path}/qa-*.md`
- Security Reviews: `{story_path}/security-*.md`
EOF
)"
```

**If review escalated:**
```bash
gh pr create --draft --title "feat({story_id}): {title} [NEEDS REVIEW]" --body "$(cat <<'EOF'
## Summary
{implementation summary}

## UNRESOLVED ISSUES
{list of unresolved blockers and majors}

## Changes
{files changed}

## Autonomous Decisions
{count} decisions made. See `{story_path}/decision-log.md`.

## Open Questions
{list from decision-log.md}

## Artifacts
- Decision Log: `{story_path}/decision-log.md`
- QA Reviews: `{story_path}/qa-*.md`
- Security Reviews: `{story_path}/security-*.md`
EOF
)"
```

### 6.6 Link to Issue (if applicable)

If input was a GitHub issue:
```bash
gh pr edit {pr_number} --add-label "{epic_id}"
```

---

## STEP COMPLETION

**Update workflow-state.yaml:**
```yaml
pr_url: "{pr_url}"
status: "completed"

steps_completed:
  - step: 6
    name: "create-pr"
    completed_at: {ISO}
    output: "{pr_url}"
```

**Output:**
```
Workflow complete (auto-implement)

PR: {pr_url}
Story: {story_id}
Input class: {input_class}
Steps executed: {route}
Decisions made: {count} (see decision-log.md)
Open questions: {count}
Review verdict: {PASS | ESCALATED}
```

---

## WORKFLOW COMPLETE
