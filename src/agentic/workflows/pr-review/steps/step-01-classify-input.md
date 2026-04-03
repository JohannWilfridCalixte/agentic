# Step 1: Classify Input

## EXECUTION RULES

- Parse the PR reference from arguments
- Verify the PR exists via `gh pr view`
- Extract PR metadata and diff
- Output: `pr-metadata.md` + `pr-diff.patch` + `workflow-state.yaml` initialized

---

## SEQUENCE

### 1.1 Parse PR Reference(s)

Parse each argument as a PR reference:

```
123            → pr_number = 123
#123           → pr_number = 123
owner/repo#123 → repo = owner/repo, pr_number = 123
https://github.com/owner/repo/pull/123 → repo = owner/repo, pr_number = 123
```

**If no args:** HALT with error:

> **This workflow requires a PR reference.**
>
> Usage:
> - `/agentic:workflow:pr-review 123`
> - `/agentic:workflow:pr-review #123`
> - `/agentic:workflow:pr-review https://github.com/owner/repo/pull/123`
> - `/agentic:workflow:pr-review owner/repo#123`
> - `/agentic:workflow:pr-review 123 456 789` (batch mode)

**Do NOT proceed past this point without a PR reference.**

**If multiple PR refs:** Set `batch_mode = true`. Run steps 1.2–1.8 for each PR (can be parallelized). Then follow the **Batch Mode** section in SKILL.md instead of continuing to step 2.

### 1.2 Verify PR Exists

**For current repo:**
```bash
gh pr view {pr_number} --json number,title,body,author,baseRefName,headRefName,headRefOid,files,additions,deletions,state
```

**For cross-repo:**
```bash
gh pr view {pr_number} --repo {repo} --json number,title,body,author,baseRefName,headRefName,headRefOid,files,additions,deletions,state
```

**If command fails:** HALT with error:

> **PR #{pr_number} not found.**
>
> Verify the PR number and repository are correct.
> Run `gh pr list` to see open PRs.

**If PR is merged or closed:** Warn the user but proceed (reviewing historical PRs is valid).

Store `headRefOid` as `head_commit_sha` for later use in PR comments.

### 1.3 Resolve Repository Owner/Name

**For cross-repo:** Extract `owner` and `repo_name` from the `repo` variable (e.g., `owner/repo` → `owner=owner`, `repo_name=repo`).

**For current repo:**
```bash
gh repo view --json nameWithOwner --jq '.nameWithOwner'
```

Store as `repo_full` (e.g., `owner/repo`).

### 1.4 Generate Workflow Instance ID

```
instance_id = "{YYYYMMDD}-{HHMMSS}-{random4chars}"
pr_identifier = "pr-{pr_number}"
```

**Set output path:**
```yaml
output_path: "{ide-folder}/{outputFolder}/task/pr-review/{pr_identifier}/{instance_id}"
```

### 1.5 Create Output Directory

```bash
mkdir -p {output_path}
```

### 1.6 Extract PR Diff

```bash
gh pr diff {pr_number} > {output_path}/pr-diff.patch
```

**For cross-repo:**
```bash
gh pr diff {pr_number} --repo {repo} > {output_path}/pr-diff.patch
```

### 1.7 Extract PR Metadata

From the `gh pr view` JSON output, create `{output_path}/pr-metadata.md`:

```markdown
# PR #{pr_number}: {title}

**Author:** {author}
**Base:** {baseRefName} <- {headRefName}
**State:** {state}
**Changes:** +{additions} -{deletions}

## Description

{body}

## Files Changed

{list of files from --json files}
```

### 1.8 Initialize Workflow State

**Create `{output_path}/workflow-state.yaml`:**

```yaml
workflow: pr-review
version: "1.0.0"

pr_number: {pr_number}
pr_title: "{title}"
pr_author: "{author}"
pr_repo: "{repo_full}"
pr_state: "{state}"
head_commit_sha: "{headRefOid}"

input_type: {number | url | cross-repo}
input_source: "{raw input}"

instance_id: {instance_id}
output_path: {output_path}

started_at: {ISO}
updated_at: {ISO}

status: "in_progress"
current_step: 1
steps_completed: []

output_mode: null
verbosity_level: null

artifacts:
  pr_metadata: "{output_path}/pr-metadata.md"
  pr_diff: "{output_path}/pr-diff.patch"
  technical_context: null
  qa_review: null
  test_qa_review: null
  security_review: null
  review_summary: null

language_skills_prompt: ""
```

### 1.9 Complete Step

**Append to `steps_completed`:**
```yaml
steps_completed:
  - step: 1
    name: "classify-input"
    completed_at: {ISO}

current_step: 2
```

**Output:**
```
PR #{pr_number}: {title}
Author: {author} | +{additions} -{deletions} | {files_count} files

Proceeding to output mode selection...
```

---

## NEXT STEP

Load `step-02-choose-output-mode.md`
