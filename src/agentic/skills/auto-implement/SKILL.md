---
name: auto-implement
description: Use when autonomously implementing from spec/PRD/plan to PR without user interaction
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

Each subagent reads its own instructions from `.{ide-folder}/agents/{agent}.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. ...")`

Available agents: `architect`, `editor`, `qa`, `security-qa`

## Mandatory Delegation

**You MUST delegate all agent work using the Task tool. NEVER do agent work inline.**

You are the orchestrator. You classify input, manage state, validate outputs, and delegate. You do NOT gather context, write plans, implement code, or review.

## Execution Protocol

### Step 1: Classify Input & Initialize

1. Parse input source (file, GitHub issue, inline)
2. Classify: product / technical-plan / technical-plan-with-context / mixed
3. Determine route from classification
4. Determine epic_id and story_id
5. Create working directory: `documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`
6. Create `workflow-state.yaml` and `decision-log.md`

### Step 2: Architect Context (if route includes it)

**Delegate via Task tool** → Architect subagent (Phase 1: Context Gathering)

Output: `{story_path}/technical-context.md`

### Step 3: Architect Plan (product/mixed only)

**Delegate via Task tool** → Architect subagent (Phase 2: Technical Planning)

Output: `{story_path}/technical-plan.md`

### Step 4: Editor Implement

**Delegate via Task tool** → Editor subagent

Output: `{story_path}/implementation-log.md` + code changes

### Step 5: Review Loop

Max 3 iterations. Each iteration:

**5a.** **Delegate via Task tool** → QA subagent → `{story_path}/qa-{n}.md`

**5b.** **Delegate via Task tool** → Security QA subagent → `{story_path}/security-{n}.md`

**5c. Exit conditions:**
- No blockers AND no majors → PR
- Issues found → Delegate fix to Editor subagent, loop
- Max iterations → Escalate to draft PR

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
