# Step 5: Output Review

---

## ORCHESTRATOR ACTION

Aggregate findings from all review agents and deliver in the chosen output mode.

---

## SEQUENCE

### 5.1 Build Review Summary

Read `verbosity_level` from workflow-state.yaml. Read all review files and compose `{output_path}/review-summary.md`.

Findings are already formatted by QA agents per the requested verbosity level — include them as-is.

```markdown
# PR Review: #{pr_number} — {pr_title}

**Author:** {pr_author}
**Verdict:** {APPROVE | REQUEST_CHANGES | COMMENT}
**Date:** {ISO}

## Summary

| Category | Blockers | Majors | Minors | Nits |
|----------|----------|--------|--------|------|
| Code Quality | {n} | {n} | {n} | {n} |
| Test Quality | {n} | {n} | {n} | {n} |
| Security | {n} | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** |

## Blockers

{list all blocker findings from all reviews, grouped by file}

## Majors

{list all major findings from all reviews, grouped by file}

## Minors

{list all minor findings}

## Nits

{list all nit findings}

---

_Review artifacts: {output_path}_
```

### 5.2 Deliver Based on Output Mode

---

#### Mode: `local`

1. Save `review-summary.md` to `{output_path}/review-summary.md`
2. Display concise summary in chat:

```
## PR #{pr_number} Review: {verdict}

{1-2 sentence overall assessment}

**Findings:** {blocker_count} blockers, {major_count} majors, {minor_count} minors, {nit_count} nits

{top 3 most important findings, one line each}

Full report: {output_path}/review-summary.md
```

---

#### Mode: `pr_comments`

1. Save `review-summary.md` to `{output_path}/review-summary.md` (always keep local copy)

2. Post overall review using `gh pr review`:

```bash
gh pr review {pr_number} --{verdict_flag} --body "$(cat <<'EOF'
## Automated PR Review

**Verdict:** {APPROVE | REQUEST_CHANGES | COMMENT}

| Category | Blockers | Majors | Minors | Nits |
|----------|----------|--------|--------|------|
| Code Quality | {n} | {n} | {n} | {n} |
| Test Quality | {n} | {n} | {n} | {n} |
| Security | {n} | {n} | {n} | {n} |

{top findings summary}

_Full review artifacts available locally at: {output_path}_
EOF
)"
```

Where `{verdict_flag}` maps:
- `APPROVE` → `--approve`
- `REQUEST_CHANGES` → `--request-changes`
- `COMMENT` → `--comment`

3. For each blocker and major finding with a specific file/line reference, post inline comment:

```bash
gh api repos/{pr_repo}/pulls/{pr_number}/comments \
  --method POST \
  -f body="{finding description + suggestion}" \
  -f commit_id="{head_commit_sha}" \
  -f path="{file_path}" \
  -f line={line_number} \
  -f side="RIGHT"
```

Where `{pr_repo}` and `{head_commit_sha}` come from workflow-state.yaml (captured in Step 1).

**Note:** Only post inline comments for findings with precise file:line references from the diff. General findings go in the overall review body.

4. Display confirmation in chat:

```
PR #{pr_number} review posted: {verdict}
{blocker_count} blockers, {major_count} majors, {minor_count} minors, {nit_count} nits
{count} inline comments posted
```

### 5.3 Update State

```yaml
status: "completed"
completed_at: {ISO}

artifacts:
  review_summary: "{output_path}/review-summary.md"

output_delivered:
  mode: "{local | pr_comments}"
  inline_comments_posted: {count or 0}

steps_completed:
  - step: 5
    name: "output"
    completed_at: {ISO}
```

---

## WORKFLOW COMPLETE
