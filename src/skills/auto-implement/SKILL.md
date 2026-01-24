---
name: auto-implement
description: Auto-implement workflow. Autonomously implements from spec/PRD/plan to PR. Classifies input and routes through architect/editor/review as needed.
---

# /agentic:auto-implement - Autonomous Implementation

**Usage:** `/agentic:auto-implement [<input>]`

Autonomously implement from spec/PRD/plan to PR. No user interaction - decisions and open questions are documented.

## Arguments

- `path/to/spec.md`: Use existing spec/plan file
- `#123` or `https://github.com/.../issues/123`: GitHub issue
- Inline text: Direct description
- No args: Error - input required

## Input Classification & Routing

| Input Type | Route |
|------------|-------|
| Product (spec/PRD/epic/US) | Context → Plan → Editor → Review → PR |
| Technical plan (no context) | Context → Editor → Review → PR |
| Technical plan + context | Editor → Review → PR |
| Mixed (product + technical) | Context → Plan → Editor → Review → PR |

## Agent References

Load agents inline using:
- `@.claude/agents/architect.md` - Context gathering + planning
- `@.claude/agents/editor.md` - Implementation
- `@.claude/agents/qa.md` - QA review
- `@.claude/agents/security-qa.md` - Security review

## Execution Protocol

### Step 1: Classify Input & Initialize

1. Parse input source (file, GitHub issue, inline)
2. Classify: product / technical-plan / technical-plan-with-context / mixed
3. Determine route from classification
4. Determine epic_id and story_id
5. Create working directory: `documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`
6. Create `workflow-state.yaml` and `decision-log.md`

### Step 2: Architect Context (if route includes it)

Load: `@.claude/agents/architect.md`

Task: Analyze codebase for relevant code, patterns, constraints, dependencies.

Output: `{story_path}/technical-context.md`

### Step 3: Architect Plan (product/mixed only)

Load: `@.claude/agents/architect.md`

Task: Create implementation plan with tasks, verification matrix, editor brief.

Output: `{story_path}/technical-plan.md`

### Step 4: Editor Implement

Load: `@.claude/agents/editor.md`

Task: Implement code per technical plan. Execute tasks in order, write tests, run suite.

Output: `{story_path}/implementation-log.md` + code changes

### Step 5: Review Loop

Max 3 iterations. Each iteration:

**5a. QA Review** - `@.claude/agents/qa.md`
Output: `{story_path}/qa-{n}.md`

**5b. Security Review** - `@.claude/agents/security-qa.md`
Output: `{story_path}/security-{n}.md`

**5c. Exit conditions:**
- No blockers AND no majors → PR
- Issues found → Editor fixes, loop
- Max iterations → Escalate to draft PR

**5d. Fix Phase** - `@.claude/agents/editor.md`

### Step 6: Create PR

Push branch, create PR (or draft if escalated). Include decision summary and open questions.

## Autonomous Behavior

- ALL decisions logged in `decision-log.md`
- Open questions documented (not asked to user)
- Confidence < 90% flagged as LOW_CONFIDENCE
- Never blocks on user input

## Artifacts

All outputs: `documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`
- `workflow-state.yaml`
- `decision-log.md`
- `technical-context.md` (if route includes context)
- `technical-plan.md`
- `implementation-log.md`
- `qa-{n}.md`
- `security-{n}.md`
