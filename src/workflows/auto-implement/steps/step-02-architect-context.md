# Step 2: Architect Context

## EXECUTION RULES

- Invoke Architect agent to gather codebase context
- Architect decides all technical context questions autonomously
- Log decisions in `decision-log.md`
- Output: `technical-context.md`

**Skip condition:** `input_class == "technical-plan-with-context"`

---

## AGENT HANDOFF

**Claude Code:**
```
Task(subagent_type="architect", prompt="Gather technical context for implementation.
Workflow: auto-implement (autonomous, no user questions)
Story ID: {story_id}
Input class: {input_class}
Input document: {story_path}/{spec.md or technical-plan.md}
Output to: {story_path}/technical-context.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.")
```

**Cursor:**
```
@.claude/agents/architect.md
```

**Provide context:**
- Input document (spec.md or technical-plan.md depending on input_class)
- `workflow_mode`: auto
- Codebase access

---

## ARCHITECT CONTEXT TASK

### Codebase Analysis

Explore codebase to identify:
1. **Relevant existing code** - modules, services, utilities to reuse or extend
2. **Patterns in use** - architecture style, error handling, naming conventions
3. **Dependencies** - libraries, frameworks, external services
4. **Constraints** - technical debt, limitations, performance requirements

### Output Format

**Write to `{story_path}/technical-context.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Technical Context
Status: Draft
Owner: Architect
Created: {ISO}
---

# Technical Context - {story_id}

## Summary
{2-3 sentence summary of technical landscape}

## Tech Vision Constraints
{Relevant constraints from tech vision docs, if any}

## Codebase Touchpoints

### Existing Code to Leverage
| Component | Path | Purpose | Integration Notes |
|-----------|------|---------|-------------------|
| {name} | `{path}` | {what it does} | {how to use it} |

### Code to Modify
| Component | Path | Change Needed |
|-----------|------|---------------|
| {name} | `{path}` | {what changes} |

### New Code Required
| Component | Suggested Path | Purpose |
|-----------|----------------|---------|
| {name} | `{path}` | {what it does} |

## Domain Implications
{Business logic considerations, domain rules}

## Non-Functional Expectations
- **Performance**: {expectations}
- **Scalability**: {expectations}
- **Reliability**: {expectations}

## Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {impact} | {mitigation} |

## Assumptions
{Technical assumptions - each one is a logged decision}

## Open Questions
{Unresolved questions - added to decision-log.md Open Questions section}
```

### Decision Logging

Log all technical decisions with Architect attribution. Add unresolved questions to the Open Questions section of `decision-log.md`.

---

## STEP COMPLETION

**Write to:** `{story_path}/technical-context.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  technical_context: "{story_path}/technical-context.md"

steps_completed:
  - step: 2
    name: "architect-context"
    completed_at: {ISO}
    output: "{story_path}/technical-context.md"

current_step: {next step in route}
```

---

## NEXT STEP

Based on route:
- product/mixed → Load `step-03-architect-plan.md`
- technical-plan → Load `step-04-editor-implement.md`
