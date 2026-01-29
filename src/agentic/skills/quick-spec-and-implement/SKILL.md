---
name: quick-spec-and-implement
description: Spec-to-PR workflow. Transforms a product idea into a pull request through structured agent collaboration. Use when starting new feature work from requirements.
argument-hint: "[--auto] [file.md | #issue | URL]"
disable-model-invocation: true
---

# /quick-spec-and-implement - Spec to PR Workflow

**Usage:** `/quick-spec-and-implement [--auto] [<input>]`

Transform a product idea into a merged PR through structured agent collaboration.

## Arguments

- No args: Interactive mode, prompt for spec
- `--auto`: Autonomous mode with decision logging
- `path/to/spec.md`: Use existing spec file
- `#123` or `https://github.com/.../issues/123`: Fetch GitHub issue

## Workflow Steps

```
1. Input Detection → 2. PM Spec → 3. Architect Context → 4. Security Context
→ 5. Technical Plan → 6. Implementation → 7. Review Loop → 8. Create PR
```

## Execution

### Step 1: Parse Arguments

Detect from command invocation:
- `workflow_mode`: "interactive" (default) or "auto" (if --auto)
- `input_type`: "user" | "file" | "github_issue"
- `input_source`: path, URL, or null

### Step 2: Initialize State

Create working directory:
```
documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/
```

Create `workflow-state.yaml`:
```yaml
workflow: spec-to-pr
mode: {workflow_mode}
input_type: {input_type}
started_at: {ISO timestamp}
current_step: 1
steps_completed: []
status: in_progress
```

If auto mode, create `decision-log.md`.

### Step 3: Delegate to Subagents

**You MUST use the Task tool for all agent work. NEVER do agent work inline.**

Each subagent reads its own instructions from `.{ide-folder}/agents/{agent}.md`.

**PM Spec (Step 2):**
```
Task(subagent_type="general-purpose", prompt="You are the PM agent. {ide-invoke-prefix}{ide-folder}/agents/pm.md. Create product specification. ...")
```
Output: `spec.md`

**Architect Context (Step 3):**
```
Task(subagent_type="general-purpose", prompt="You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md. Execute Phase 1: Context Gathering. ...")
```
Output: `technical-context.md`

**Security Context (Step 4):**
```
Task(subagent_type="general-purpose", prompt="You are the Security agent. {ide-invoke-prefix}{ide-folder}/agents/security.md. Create security addendum. ...")
```
Output: `security-addendum.md`

**Technical Plan (Step 5):**
```
Task(subagent_type="general-purpose", prompt="You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md. Execute Phase 2: Technical Planning. ...")
```
Output: `technical-plan.md`

**Implementation (Step 6):**
```
Task(subagent_type="general-purpose", prompt="You are the Editor agent. {ide-invoke-prefix}{ide-folder}/agents/editor.md. Implement the technical plan. ...")
```
Output: `implementation-log.md` + code changes

### Step 4: Review Loop

Max 3 iterations. Each iteration:

1. **QA Review:**
```
Task(subagent_type="general-purpose", prompt="You are the QA agent. {ide-invoke-prefix}{ide-folder}/agents/qa.md. Review implementation. Iteration: {n}")
```
Output: `qa-{n}.md`

2. **Security Review:**
```
Task(subagent_type="general-purpose", prompt="You are the Security QA agent. {ide-invoke-prefix}{ide-folder}/agents/security-qa.md. Security review. Iteration: {n}")
```
Output: `security-{n}.md`

3. **Check Exit Conditions:**
   - No blockers AND no majors → Exit loop, proceed to PR
   - Issues found → Delegate fixes to editor, loop again
   - Max iterations reached → Escalate (create draft PR)

4. **Fix Phase (if needed):**
```
Task(subagent_type="general-purpose", prompt="You are the Editor agent. {ide-invoke-prefix}{ide-folder}/agents/editor.md. Fix review issues: {issue_list}")
```

### Step 5: Create PR

```bash
gh pr create --title "{story_title}" --body "$(cat <<'EOF'
## Summary
{spec_summary}

## Changes
{implementation_summary}

## Test Plan
{test_checklist}

## Review Notes
{review_summary}
EOF
)"
```

If escalated: Create as draft PR.

## Mode Behaviors

**Interactive Mode:**
- Ask user for clarification when unclear
- Present decisions for approval
- Pause at review loop for human judgment

**Auto Mode (--auto):**
- Make autonomous decisions with 90%+ confidence
- Log ALL decisions in `decision-log.md`
- Continue without human input unless blocked
- If confidence < 90%, log as LOW_CONFIDENCE and proceed

## State Tracking

Update `workflow-state.yaml` after each step:
```yaml
steps_completed:
  - step: 2
    name: pm-spec
    completed_at: {timestamp}
    output: spec.md
current_step: 3
```

## Error Handling

- **Step failure**: Log error, set status: failed
- **Max iterations**: Create draft PR, flag for human review
- **Low confidence**: Proceed but flag in decision log
