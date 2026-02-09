# Step 5: PR (Optional)

## THIS STEP IS INTERACTIVE

**Ask the developer before doing anything in this step.**

---

## SEQUENCE

### 5.1 Ask Developer

Present the following to the developer:

> **Implementation and review complete.**
>
> Would you like me to create a branch, commit, and open a PR?

**If NO:** Skip to step completion (no PR). Workflow ends.

**If YES:** Continue to 5.2.

### 5.2 Ask Branch Name

> **What should the branch be named?**
>
> Examples: `feat/add-user-auth`, `fix/payment-validation`, `refactor/api-layer`

Wait for the developer's answer. Use their exact branch name.

### 5.3 Create Branch

```bash
git checkout -b {developer_branch_name}
```

### 5.4 Stage and Commit

Stage all changes and create a conventional commit:

```bash
git add -A
```

Analyze the implementation to determine the correct conventional commit type:
- `feat` — new feature
- `fix` — bug fix
- `refactor` — refactoring
- `test` — adding/updating tests only
- `chore` — maintenance
- `docs` — documentation only

Determine a concise scope and description from the technical plan and implementation log.

```bash
git commit -m "{type}({scope}): {description}

Implemented via agentic:implement workflow.
See {output_path}/decision-log.md for decisions."
```

### 5.5 Push

```bash
git push -u origin {developer_branch_name}
```

### 5.6 Ask PR Title

> **What should the PR title be?**

Wait for the developer's answer. Use their exact title.

### 5.7 Create PR

Generate the PR body yourself from the artifacts:

```bash
gh pr create --title "{developer_pr_title}" --body "$(cat <<'EOF'
## Summary
{implementation summary from implementation-log.md}

## Changes
{files changed summary from implementation-log.md}

## Test Plan
{test coverage from test-log.md}

## Decisions
{count} decisions made autonomously. See `{output_path}/decision-log.md`.

## Open Questions
{list from decision-log.md Open Questions section, or "None"}

## Review
- QA verdict: {verdict from last qa review}
- Test QA verdict: {verdict from last test-qa review}
- Security verdict: {verdict from last security review}

## Artifacts
- Technical Plan: `{output_path}/technical-plan.md`
- Implementation Log: `{output_path}/implementation-log.md`
- Decision Log: `{output_path}/decision-log.md`
- QA Reviews: `{output_path}/qa-*.md`
- Security Reviews: `{output_path}/security-*.md`
EOF
)"
```

### 5.8 Link to Issue (if applicable)

If the technical plan references a GitHub issue:
```bash
gh pr edit {pr_number} --add-label "{relevant_label}"
```

---

## STEP COMPLETION

### PR Created

```yaml
pr:
  requested: true
  branch: "{developer_branch_name}"
  url: "{pr_url}"

steps_completed:
  - step: 5
    name: "create-pr"
    completed_at: {ISO}
    output: "{pr_url}"

status: "completed"
```

**Output:**
```
Workflow complete (implement)

PR: {pr_url}
Topic: {topic}
Steps executed: validate-plan → editor → test → review → pr
Decisions made: {count} (see decision-log.md)
Open questions: {count}
Review verdict: {PASS | ESCALATED}
```

### PR Skipped

```yaml
pr:
  requested: false
  branch: null
  url: null

steps_completed:
  - step: 5
    name: "pr-skipped"
    completed_at: {ISO}

status: "completed"
```

**Output:**
```
Workflow complete (implement)

Topic: {topic}
Steps executed: validate-plan → editor → test → review
Decisions made: {count} (see decision-log.md)
Open questions: {count}
Review verdict: {PASS | ESCALATED}
PR: skipped by developer
```

---

## WORKFLOW COMPLETE
