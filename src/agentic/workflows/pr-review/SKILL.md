---
name: pr-review
description: Use when reviewing a pull request for code quality, test coverage, and security. Triggers - "review PR", "review pull request", PR number or link provided, code review request.
argument-hint: "<PR number | PR URL>"
---

# PR Review

Reviews a pull request using QA, Test QA, and Security QA agents. Outputs either a local markdown report or GitHub PR comments.

## Usage

```
/agentic:workflow:pr-review <input> [<input2> ...]
```

Arguments (one or more):
- `123` or `#123` — PR number (current repo)
- `https://github.com/owner/repo/pull/123` — full PR URL
- `owner/repo#123` — cross-repo PR reference
- No args — **ERROR: PR reference required**

**Batch mode:** Multiple PR refs launch parallel reviews:
```
/agentic:workflow:pr-review 123 456 789
/agentic:workflow:pr-review #42 owner/repo#99 https://github.com/acme/app/pull/7
```

## Orchestrator Role

You are the **main agent** orchestrating this workflow. You:
1. Classify and verify the PR input
2. Ask user for output mode + verbosity level
3. Delegate technical context gathering (incl. tech stack detection for skill injection)
4. Delegate reviews to QA agents (with language skills + verbosity level)
5. Aggregate findings and produce output

**You do NOT:**
- Review code yourself (that's QA / Test QA / Security QA)
- Gather technical context yourself (that's the Architect)

## MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

When a step says "invoke subagent", you:
1. Use Task tool to spawn subagent
2. Pass prompt (which tells subagent to read its own instructions)
3. Wait for result
4. Validate output exists
5. Update workflow state

If you catch yourself doing agent work, STOP and use Task tool.

## Subagent Invocation

Always use `{subagentTypeGeneralPurpose}` subagent type:

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md for your full instructions. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the QA agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-qa.md for your full instructions. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Test QA agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-test-qa.md for your full instructions. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Security QA agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-security-qa.md for your full instructions. ...")
```

Available agents: `agentic:agent:architect`, `agentic:agent:qa`, `agentic:agent:test-qa`, `agentic:agent:security-qa`

---

## Route

Classify by argument count:

```
1 PR ref  → Single: Classify → Choose Mode → Context → Reviews → Output
N PR refs → Batch:  Classify All → Choose Mode (once) → Dispatch N parallel subagents
```

---

## Workflow Steps

Execute steps in order. Read step file before executing each step.

| Step | File | Description |
|------|------|-------------|
| 1 | `steps/step-01-classify-input.md` | Parse PR reference, verify it exists, extract metadata |
| 2 | `steps/step-02-choose-output-mode.md` | Ask user: output mode + verbosity level |
| 3 | `steps/step-03-gather-context.md` | Architect gathers technical context from PR diff |
| 4 | `steps/step-04-dispatch-reviews.md` | QA + Test QA + Security QA review the PR |
| 5 | `steps/step-05-output.md` | Aggregate findings, produce output in chosen mode |

**Execution pattern:**
1. Read current step file
2. Execute step instructions
3. Validate outputs
4. Update workflow-state.yaml
5. Read next step file

---

## Behavior

### Critical Principles
- ONE STEP AT A TIME: complete each step before proceeding
- NO SKIPPING: execute all steps in order
- TRACK STATE: update `workflow-state.yaml` after each step
- INTERACTIVE for steps 1-2: parse input, ask user (output mode + verbosity)
- AUTONOMOUS for steps 3-4: delegate without asking user
- DEPENDS ON MODE for step 5: local = write file + summarize in chat, PR = post comments

---

## Error Handling

### No PR Reference
1. HALT immediately
2. Display usage instructions
3. Do NOT proceed

### PR Not Found
1. `gh pr view` returned error
2. Display error with PR reference used
3. Do NOT proceed

### Review Agent Failure
1. Log error in workflow-state.yaml
2. Retry once
3. If still fails, proceed with available reviews and note the gap

---

## Artifacts

All outputs: `{ide-folder}/{outputFolder}/task/pr-review/{pr-identifier}/{instance_id}/`

| Artifact | Description |
|----------|-------------|
| `workflow-state.yaml` | Current workflow state |
| `pr-metadata.md` | PR title, description, author, files changed |
| `pr-diff.patch` | Full PR diff |
| `technical-context.md` | Codebase context for affected areas |
| `qa-review.md` | Code quality review |
| `test-qa-review.md` | Test quality review |
| `security-review.md` | Security review |
| `review-summary.md` | Aggregated review (always saved locally) |

---

## Workflow Diagram

### Single PR

```
                    /agentic:workflow:pr-review <PR ref>
                                |
                                v
                +-------------------------------+
                |  STEP 1: Classify Input       |
                |  Parse PR ref, verify exists  |
                +-------------------------------+
                       |                |
                    FOUND            NOT FOUND
                       |                |
                       v                v
                  Continue         HALT: PR not found
                       |
                       v
                +-------------------------------+
                |  STEP 2: Output Mode &        |
                |  Verbosity Level              |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 3: Gather Context       |
                |  Architect reads PR diff      |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 4: Dispatch Reviews     |
                |  QA + Test QA + Security QA   |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 5: Output               |
                |  Local: md + chat summary     |
                |  PR: gh pr review comments    |
                +-------------------------------+
                                |
                                v
                        WORKFLOW COMPLETE
```

### Batch (Multiple PRs)

```
              /agentic:workflow:pr-review <PR1> <PR2> ... <PRn>
                                |
                                v
                +-------------------------------+
                |  STEP 1: Classify All         |
                |  Parse + verify each PR       |
                |  (parallel)                   |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 2: Output Mode &        |
                |  Verbosity Level (ask ONCE)   |
                +-------------------------------+
                                |
                                v
              +----------+----------+----------+
              |          |          |          |
              v          v          v          v
          +------+  +------+  +------+  +------+
          | PR 1 |  | PR 2 |  | PR 3 |  | PR N |
          | S3-5 |  | S3-5 |  | S3-5 |  | S3-5 |
          +------+  +------+  +------+  +------+
              |          |          |          |
              v          v          v          v
              +----------+----------+----------+
                                |
                                v
                +-------------------------------+
                |  Collect + Summarize          |
                |  Batch summary table in chat  |
                +-------------------------------+
                                |
                                v
                        WORKFLOW COMPLETE
```

---

## Batch Mode (Multiple PRs)

When multiple PR refs are provided, the orchestrator parallelizes entire reviews:

### Batch Sequence

1. **Classify all inputs (Step 1 for each PR):** Run `step-01-classify-input.md` for each PR ref. These are independent — run in parallel. If any PR fails validation, report the error and continue with the valid ones.

2. **Choose output mode + verbosity once (Step 2):** Run `step-02-choose-output-mode.md` once. The chosen mode and verbosity apply to all PRs.

3. **Dispatch parallel review subagents:** For each validated PR, launch one subagent that runs steps 3–5 autonomously:

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
You are reviewing PR #{pr_number}: {pr_title}

Output mode: {output_mode}
Verbosity level: {verbosity_level}
Output path: {output_path}
PR diff: {output_path}/pr-diff.patch
PR metadata: {output_path}/pr-metadata.md
Workflow state: {output_path}/workflow-state.yaml

Execute these steps in order:

1. Read and execute {ide-invoke-prefix}{path_to_this_workflow}/steps/step-03-gather-context.md
2. Read and execute {ide-invoke-prefix}{path_to_this_workflow}/steps/step-04-dispatch-reviews.md
3. Read and execute {ide-invoke-prefix}{path_to_this_workflow}/steps/step-05-output.md

You are autonomous. Do not ask the user for input. The output mode is already decided.
")
```

Launch ALL subagents in parallel (single message with multiple Task calls).

4. **Collect results:** Wait for all subagents. Summarize in chat:

```
## Batch PR Review Complete

| PR | Verdict | Blockers | Majors | Minors | Nits |
|----|---------|----------|--------|--------|------|
| #123 — {title} | APPROVE | 0 | 0 | 2 | 1 |
| #456 — {title} | REQUEST_CHANGES | 1 | 3 | 0 | 0 |
| #789 — {title} | COMMENT | 0 | 1 | 4 | 2 |

Reports: {output_path_base}/
```

### Batch Artifacts

Each PR gets its own output directory:
```
{ide-folder}/{outputFolder}/task/pr-review/pr-{N}/{instance_id}/
```

No shared state file — each PR has its own `workflow-state.yaml`.

---

## Start Workflow

Read `steps/step-01-classify-input.md` and begin execution.
