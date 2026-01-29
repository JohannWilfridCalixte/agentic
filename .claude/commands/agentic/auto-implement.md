---
name: auto-implement
description: Auto-implement workflow. Takes a spec/PRD/epic/US/technical plan and implements it autonomously. No user input required - documents decisions and open questions.
argument-hint: "[file.md | #issue | URL | inline text]"
disable-model-invocation: true
---

# /agentic:auto-implement - Autonomous Implementation

**Usage:** `/agentic:auto-implement [<input>]`

Takes a spec, PRD, epic, user story, technical plan, or inline description and implements it autonomously. No user interaction - all decisions are logged.

## Arguments

- `path/to/spec.md`: Use existing spec/plan file
- `#123` or `https://github.com/.../issues/123`: Fetch GitHub issue
- Inline text: Direct description of what to implement
- No args: Error - input is required

## Input Classification

The workflow classifies input to determine which steps to run:

| Input Type | Route |
|------------|-------|
| Product (spec/PRD/epic/US) | Context → Plan → Editor → Review → PR |
| Technical plan (no context) | Context → Editor → Review → PR |
| Technical plan + context | Editor → Review → PR |
| Mixed (product + technical) | Context → Plan → Editor → Review → PR |

## Execution

### Step 1: Classify Input

Read and classify the input:
- **product**: Has user stories, acceptance criteria, problem statements, but no implementation details
- **technical-plan**: Has tasks, file changes, architecture decisions, but no codebase context
- **technical-plan-with-context**: Has tasks AND codebase analysis (touchpoints, constraints, patterns)
- **mixed**: Has both product requirements and some technical direction

Set `input_class` and determine route.

### Step 2: Initialize State

Create working directory and `workflow-state.yaml`. Always create `decision-log.md` (always auto mode).

### Step 3: Route to Steps

**Product / Mixed input:**
```
Architect Context → Architect Plan → Editor → Review Loop → PR
```

**Technical plan (no context):**
```
Architect Context → Editor → Review Loop → PR
```

**Technical plan + context:**
```
Editor → Review Loop → PR
```

### Step 4: Delegate to Subagents

**You MUST use the Task tool for all agent work. NEVER do agent work inline.**

Each subagent reads its own instructions from `.claude/agents/{agent}.md`.

**Architect Context:**
```
Task(subagent_type="general-purpose", prompt="You are the Architect agent. Read .claude/agents/architect.md for your full instructions. Execute Phase 1: Context Gathering. ...")
```
Output: `technical-context.md`

**Architect Plan (product/mixed only):**
```
Task(subagent_type="general-purpose", prompt="You are the Architect agent. Read .claude/agents/architect.md for your full instructions. Execute Phase 2: Technical Planning. ...")
```
Output: `technical-plan.md`

**Editor:**
```
Task(subagent_type="general-purpose", prompt="You are the Editor agent. Read .claude/agents/editor.md for your full instructions. Implement the technical plan. ...")
```
Output: `implementation-log.md` + code changes

### Step 5: Review Loop

Max 3 iterations. Each iteration:

1. **QA Review:**
```
Task(subagent_type="general-purpose", prompt="You are the QA agent. Read .claude/agents/qa.md for your full instructions. Review implementation. Iteration: {n}")
```

2. **Security Review:**
```
Task(subagent_type="general-purpose", prompt="You are the Security QA agent. Read .claude/agents/security-qa.md for your full instructions. Security review. Iteration: {n}")
```

3. **Exit conditions:**
   - No blockers AND no majors → PR
   - Issues found → Editor fixes, loop again
   - Max iterations → Draft PR with issues flagged

### Step 6: Create PR

Push branch and create PR (or draft PR if escalated).

## Decision Logging

All autonomous decisions logged in `decision-log.md`:
- Context, options considered, chosen option
- Confidence score
- Rationale and trade-offs
- Open questions that couldn't be resolved

## State Tracking

Update `workflow-state.yaml` after each step completion.

## Error Handling

- **Step failure**: Log error, set status: failed, halt with error log
- **Max review iterations**: Create draft PR, flag for human review
- **Low confidence**: Proceed but flag in decision log + open questions
