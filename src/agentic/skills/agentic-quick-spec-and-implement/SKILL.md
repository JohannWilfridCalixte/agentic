---
name: agentic:quick-spec-and-implement
description: Use when starting new feature work from idea/requirements. Transforms product idea into PR via PM spec, architect context/plan, security threat model, editor implementation, and review loop.
argument-hint: "[--auto] [file.md | #issue | URL]"
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
1. Input Detection -> 2. PM Spec -> 3. Architect Context -> 4. Security Context
-> 5. Technical Plan -> 6. Editor Implement -> 6b. Test Engineer -> 7. Review Loop -> 8. Create PR
```

---

## MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

This is non-negotiable. When a step says "delegate to PM/Architect/Security/Editor/QA agent", you:
1. Use the `Task` tool to spawn a subagent
2. Pass the subagent prompt (which tells the subagent to read its own instructions)
3. Wait for the subagent result
4. Validate the output exists
5. Update workflow state

**You NEVER:**
- Write specs yourself (delegate to PM subagent)
- Explore the codebase yourself (delegate to Architect subagent)
- Create threat models yourself (delegate to Security subagent)
- Write technical plans yourself (delegate to Architect subagent)
- Write or edit code yourself (delegate to Editor subagent)
- Write tests yourself (delegate to Test Engineer subagent)
- Review code yourself (delegate to QA/Test QA/Security QA subagent)

If you catch yourself doing agent work instead of delegating, STOP and use the Task tool.

## Subagent Invocation Pattern

Subagent instructions live in `.{ide-folder}/agents/`. Each subagent reads its own file.

Always use `general-purpose` subagent type:

```
Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. {task-specific context}")
```

Available agents: `pm`, `architect`, `security`, `editor`, `test-engineer`, `qa`, `test-qa`, `security-qa`

---

## MODE-SPECIFIC BEHAVIOR

### Interactive Mode (default)

- Ask user for clarification on unclear points
- Present decisions for approval before proceeding
- Pause at review loop for human judgment

### Auto Mode (`--auto`)

- Make autonomous decisions with 90%+ confidence
- Log ALL decisions in `decision-log.md`
- Document open questions and chosen resolutions
- Continue without human input unless blocked
- If confidence < 90%, log as LOW_CONFIDENCE and proceed

---

## EXECUTION STEPS

Execute each step in order by reading the corresponding step file.

| Step | File | Description |
|------|------|-------------|
| 1 | `steps/step-01-input-detection.md` | Parse args, initialize workflow state |
| 2 | `steps/step-02-pm-spec.md` | Delegate spec creation to PM |
| 3 | `steps/step-03-architect-context.md` | Delegate context gathering to Architect |
| 4 | `steps/step-04-security-context.md` | Delegate threat model to Security |
| 5 | `steps/step-05-architect-plan.md` | Delegate technical plan to Architect |
| 6 | `steps/step-06-editor-implement.md` | Delegate implementation to Editor |
| 6b | `steps/step-06b-test-engineer.md` | Delegate test writing to Test Engineer |
| 7 | `steps/step-07-review-loop.md` | QA/Test QA/Security review loop |
| 8 | `steps/step-08-create-pr.md` | Create PR from artifacts |

**Start by reading `steps/step-01-input-detection.md` and follow the NEXT STEP instructions at the end of each file.**

---

## TEMPLATES

| Template | Purpose |
|----------|---------|
| `templates/workflow-state.yaml` | Workflow state tracking schema |
| `templates/decision-log.md` | Decision logging template (auto mode) |

---

## ARTIFACTS

All outputs go to: `{ide-folder}/{output-folder}/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`

| Artifact | Description |
|----------|-------------|
| `workflow-state.yaml` | Workflow state tracking |
| `decision-log.md` | Decisions (auto mode only) |
| `spec.md` | Product specification |
| `technical-context.md` | Technical context analysis |
| `security-addendum.md` | Security requirements |
| `technical-plan.md` | Implementation plan |
| `implementation-log.md` | What was implemented |
| `test-log.md` | Test implementation log |
| `qa-{n}.md` | QA code review(s) |
| `test-qa-{n}.md` | Test QA review(s) |
| `security-{n}.md` | Security review(s) |

---

## ERROR HANDLING

### Confidence Below Threshold (Auto Mode)

If agent confidence < 90% on a decision:
1. Log the uncertainty in `decision-log.md`
2. Mark decision as "LOW_CONFIDENCE"
3. Add to "Open Questions" section
4. Proceed with best-guess but flag for human review

### Max Review Iterations Reached

If review loop hits 3 iterations with unresolved blockers:
1. Log current state
2. Create PR as draft
3. List unresolved issues in PR description
4. *Interactive*: Halt and ask user
5. *Auto*: Complete with warnings, flag for human review

### Step Failure

If any step fails:
1. Log error in `workflow-state.yaml`
2. Set `status: "failed"`
3. *Interactive*: Present error, ask how to proceed
4. *Auto*: Attempt recovery once, then halt with detailed error log

---

## DECISION LOGGING PROTOCOL (Auto Mode)

When making autonomous decisions, append to `decision-log.md`:

```markdown
### DEC-{number}: {Brief Title}

**Step**: {current_step_name}
**Agent**: {deciding_agent}
**Timestamp**: {ISO timestamp}

**Context**:
{What question or ambiguity arose}

**Options Considered**:
1. {Option A} - {pros/cons}
2. {Option B} - {pros/cons}

**Decision**: {Chosen option}

**Confidence**: {percentage}%

**Rationale**:
{Why this choice was made}

**Trade-offs Accepted**:
- {What was sacrificed or risked}

**Reversibility**: {Easy | Medium | Hard}

---
```

### Confidence Levels Guide

| Confidence | Meaning | Action |
|------------|---------|--------|
| 95-100% | High certainty | Proceed confidently |
| 90-94% | Reasonable certainty | Proceed, note for review |
| 80-89% | Moderate confidence | Add to Open Questions |
| <80% | Low confidence | Escalate to human |

---

## STATE UPDATE PROTOCOL

After each step completion, update `workflow-state.yaml`:

```yaml
steps_completed:
  - step: {n}
    name: "{step-name}"
    completed_at: {ISO timestamp}
    output: {artifact path if any}

current_step: {n+1}
updated_at: {ISO timestamp}
```
