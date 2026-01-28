---
name: quick-spec-and-implement
description: Spec-to-PR workflow. Transforms a product idea into a pull request through structured agent collaboration.
---

# /quick-spec-and-implement - Spec to PR Workflow

**Usage:** `/quick-spec-and-implement [--auto] [<input>]`

Transform a product idea into a merged PR through structured agent collaboration.

## Arguments

- No args: Interactive mode, prompt for spec
- `--auto`: Autonomous mode with decision logging
- `path/to/spec.md`: Use existing spec file
- `#123` or `https://github.com/.../issues/123`: Fetch GitHub issue

## Workflow Overview

```
1. Input Detection → 2. PM Spec → 3. Architect Context → 4. Security Context
→ 5. Technical Plan → 6. Implementation → 7. Review Loop → 8. Create PR
```

## Agent References

Each subagent reads its own instructions from `.{ide-folder}/agents/{agent}.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. ...")`

Available agents: `pm`, `architect`, `security`, `editor`, `qa`, `security-qa`

## Mandatory Delegation

**You MUST delegate all agent work using the Task tool. NEVER do agent work inline.**

You are the orchestrator. You parse input, manage state, validate outputs, and delegate. You do NOT write specs, gather context, create plans, implement code, or review.

## Execution Protocol

### Step 1: Parse Arguments & Initialize

1. Parse command: detect mode (interactive/auto) and input source
2. Determine epic_id and story_id
3. Create working directory: `documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`
4. Create `workflow-state.yaml` with initial state
5. If auto mode, create `decision-log.md`

### Step 2: PM Spec

Load: `{ide-invoke-prefix}{ide-folder}/agents/pm.md`

Task: Create/refine product specification with:
- Problem statement
- User story
- Acceptance criteria (AC-01, AC-02, ...)
- Scope
- Input format specification
- Reference validation scenarios

Output: `{story_path}/spec.md`

### Step 3: Architect Context

Load: `{ide-invoke-prefix}{ide-folder}/agents/architect.md`

Task: Analyze codebase for:
- Relevant code locations
- Existing patterns
- Technical constraints
- Dependencies

Output: `{story_path}/technical-context.md`

### Step 4: Security Context

Load: `{ide-invoke-prefix}{ide-folder}/agents/security.md`

Task: Create threat model with:
- Assets, threats, mitigations
- Security requirements (SEC-REQ-*)
- OWASP considerations

Output: `{story_path}/security-addendum.md`

### Step 5: Technical Plan

Load: `{ide-invoke-prefix}{ide-folder}/agents/architect.md`

Task: Create implementation plan with:
- Tasks (TASK-01, TASK-02, ...)
- Verification matrix
- File change manifest

Output: `{story_path}/technical-plan.md`

### Step 6: Implementation

Load: `{ide-invoke-prefix}{ide-folder}/agents/editor.md`

Task: Implement code per technical plan:
- Execute tasks in order
- Write tests
- Run test suite
- Document changes

Output: `{story_path}/implementation-log.md` + code changes

### Step 7: Review Loop

Max 3 iterations. Each iteration:

**7a. QA Review**
Load: `{ide-invoke-prefix}{ide-folder}/agents/qa.md`

Review against:
- Acceptance criteria
- Technical plan tasks
- Reference validation scenarios

Output: `{story_path}/qa-{n}.md`

**7b. Security Review**
Load: `{ide-invoke-prefix}{ide-folder}/agents/security-qa.md`

Review for:
- Security requirements
- OWASP vulnerabilities
- Access control

Output: `{story_path}/security-{n}.md`

**7c. Exit Conditions**
- No blockers AND no majors → Proceed to PR
- Has issues → Fix and loop
- Max iterations → Escalate

**7d. Fix Phase**
Load: `{ide-invoke-prefix}{ide-folder}/agents/editor.md`

Fix blocker and major issues, then return to 7a.

### Step 8: Create PR

```bash
gh pr create --title "{story_title}" --body "$(cat <<'EOF'
## Summary
{spec_summary}

## Changes
{implementation_summary}

## Test Plan
{test_checklist}
EOF
)"
```

If escalated: Create as draft PR.

## Mode Behaviors

**Interactive Mode (default):**
- Ask for clarification when unclear
- Present decisions for approval
- Pause for human judgment

**Auto Mode (--auto):**
- Autonomous decisions with 90%+ confidence
- Log ALL decisions in `decision-log.md`
- Continue without human input
- Flag low confidence decisions

## State Tracking

Update `workflow-state.yaml` after each step completion.

## Artifacts

All outputs go to: `documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`
- `workflow-state.yaml`
- `decision-log.md` (auto mode)
- `spec.md`
- `technical-context.md`
- `security-addendum.md`
- `technical-plan.md`
- `implementation-log.md`
- `qa-{n}.md`
- `security-{n}.md`
