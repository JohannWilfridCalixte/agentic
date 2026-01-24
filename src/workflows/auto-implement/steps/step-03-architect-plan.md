# Step 3: Architect Plan

## EXECUTION RULES

- Invoke Architect agent to create implementation plan from product input
- Plan must cover ALL acceptance criteria from the input
- Log decisions in `decision-log.md`
- Output: `technical-plan.md`

**Skip condition:** `input_class in ["technical-plan", "technical-plan-with-context"]`

---

## AGENT HANDOFF

**Claude Code:**
```
Task(subagent_type="architect", prompt="Create implementation plan.
Workflow: auto-implement (autonomous, no user questions)
Story ID: {story_id}
Spec: {story_path}/spec.md
Technical Context: {story_path}/technical-context.md
Output to: {story_path}/technical-plan.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.")
```

**Cursor:**
```
@.claude/agents/architect.md
```

**Provide context:**
- `spec.md` - acceptance criteria to implement
- `technical-context.md` - codebase context
- `workflow_mode`: auto

---

## ARCHITECT PLAN TASK

### Plan Requirements

1. Cover ALL acceptance criteria (AC-*)
2. Break down into PR-sized tasks (TASK-01, ...)
3. Include Verification Matrix (AC → test)
4. Reference codebase touchpoints from context

### Output Format

**Write to `{story_path}/technical-plan.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Technical Plan
Status: Draft
Owner: Architect
Created: {ISO}
---

# Technical Plan - {story_id}

## Summary
{2-3 sentence summary of implementation approach}

## Scope

### In Scope
- {what this plan covers}

### Out of Scope
- {explicitly excluded}

## Proposed Design

### Architecture Overview
{High-level design}

### Component Design
| Component | Responsibility | Interface |
|-----------|----------------|-----------|
| {name} | {what it does} | {how to interact} |

### Data Flow
{Data flow description}

## Contracts & Interfaces
{New or modified APIs and internal interfaces}

## Data Transformation Layer
{If calculations/data processing involved - per RETRO-001}

## Security Implementation
{Security considerations for this implementation}

## Observability
{Logging, metrics, tracing requirements}

## Task Breakdown

### TASK-01: {title}
**Covers**: AC-01
**Description**: {what to implement}
**Files**:
- Create: `{path}`
- Modify: `{path}`
**Tests**: {what tests to write}
**Done when**: {completion criteria}

### TASK-02: {title}
...

## Verification Matrix

| AC | Task | Test Type | Test Location | Verification |
|----|------|-----------|---------------|--------------|
| AC-01 | TASK-01 | unit | `src/...test.ts` | {method} |

## Editor Brief

> Summary for the Editor agent.

**Key Points:**
1. {most important}
2. {second most important}

**Watch Out For:**
- {pitfall 1}

**Suggested Order:**
TASK-01 → TASK-02 → ...

## Open Questions
{Unresolved - added to decision-log.md}

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {impact} | {mitigation} |
```

### Quality Gates

- [ ] Every AC mapped to at least one TASK
- [ ] Every TASK has test approach
- [ ] Verification Matrix complete
- [ ] Editor Brief provides actionable guidance
- [ ] Tasks are PR-sized

---

## STEP COMPLETION

**Write to:** `{story_path}/technical-plan.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  technical_plan: "{story_path}/technical-plan.md"

steps_completed:
  - step: 3
    name: "architect-plan"
    completed_at: {ISO}
    output: "{story_path}/technical-plan.md"

current_step: 4
```

---

## NEXT STEP

Load `step-04-editor-implement.md`
