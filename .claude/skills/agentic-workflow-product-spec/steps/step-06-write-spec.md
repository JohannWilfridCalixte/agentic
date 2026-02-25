# Step 6: Write Spec

---

## PRE-CONDITION CHECK

**Before executing this step, verify:**

```yaml
# Interactive mode:
discovery_confirmed: true
critical_open_questions: 0
validation.gate_passed: true

# Auto mode:
validation.discovery_complete: true
```

**If any condition fails (interactive mode), STOP. Do not write the spec. Go back to the failing step.**

---

## ORCHESTRATOR ACTION

**You MUST delegate design exploration using the Task tool. Then compile the final spec.**

The Designer subagent will use `.claude/skills/agentic-skill-brainstorming/SKILL.md` for design exploration.

### Step 6.1: Design Exploration (Delegate)

```text
Task(subagent_type="general-purpose", prompt="
You are the Designer agent. Read .claude/skills/agentic-skill-brainstorming/SKILL.md for your full instructions.

Explore design options for this product feature.

Topic: {topic}
Context document: {output_path}/context-{topic}.md
Discovery document: {output_path}/discovery-{topic}.md
Product decisions: {output_path}/product-decisions.md
Decision log: {output_path}/decision-log.md (if auto mode)

Focus on:
1. Solution approaches - at least 2-3 options
2. Architecture considerations (informed by codebase context)
3. Key design decisions with rationale
4. Trade-offs for each approach
5. Integration approach with existing system

IMPORTANT: All product decisions in product-decisions.md have been confirmed by the developer. Respect them.
IMPORTANT: The context document describes the existing codebase. Solutions must account for integration with what exists.

Output your exploration as structured notes. The orchestrator will compile these into the final spec.

{If auto mode: Make decisions autonomously. Log all decisions in decision-log.md.}
{If interactive mode: Present options and ask for user preference.}
")
```

### Step 6.2: Compile Final Spec

After receiving design exploration output, compile the final spec.

Read:

- `{output_path}/context-{topic}.md`
- `{output_path}/discovery-{topic}.md`
- `{output_path}/product-decisions.md` (if interactive mode)

Create `{output_path}/spec-{topic}.md` with this format:

```markdown
# Product Spec: {Topic Title}

**Date:** {YYYY-MM-DD}
**Status:** Draft
**Epic:** {if applicable, else remove line}

## Summary

{2-3 sentence overview combining problem and solution}

## Problem Statement

{From discovery - refined with product decisions}

## Target Users

{From discovery - refined with product decisions}

## Success Metrics

{From discovery - refined with product decisions}

## Solution Overview

{From design exploration - chosen approach with brief rationale}

## Scope

### In Scope

{From discovery - refined with product decisions}

### Out of Scope

{From discovery - refined with product decisions}

### Deferred

{From discovery - refined with product decisions}

## Acceptance Criteria

{From discovery - refined and completed via product questioning}

## Design Decisions

{From design exploration + product decisions}

| Decision | Choice | Rationale |
|----------|--------|-----------|
| {decision 1} | {choice} | {why} |
| {decision 2} | {choice} | {why} |

## Integration with Existing System

{From context document - how this feature connects to existing code, what patterns to follow, what constraints apply}

## Edge Cases

{From discovery - refined with product decisions, including integration edge cases from context}

## Constraints

{From discovery + context - business, technical, architectural, timeline}

## Open Questions (minor only)

{Only minor/non-critical questions should remain here}
```

### Validate Output

Verify `spec-{topic}.md`:

- [ ] Contains all required sections
- [ ] Problem and solution are clearly connected
- [ ] Acceptance criteria are testable and unambiguous
- [ ] Design decisions have rationale
- [ ] All product-decisions.md entries are reflected
- [ ] Integration section references actual codebase findings
- [ ] No critical open questions remain (only minor)

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  spec: "{output_path}/spec-{topic}.md"

steps_completed:
  - step: 6
    name: "write-spec"
    completed_at: {ISO_timestamp}
    output: "{output_path}/spec-{topic}.md"

status: "completed"
completed_at: {ISO_timestamp}
updated_at: {ISO_timestamp}
```

---

## WORKFLOW COMPLETE

**Interactive mode:**

```text
Product spec complete!

Artifacts:
- Context: {output_path}/context-{topic}.md
- Discovery: {output_path}/discovery-{topic}.md
- Decisions: {output_path}/product-decisions.md
- Spec: {output_path}/spec-{topic}.md

Review the spec and update status from Draft when approved.
```

**Auto mode:**

```text
Product spec complete (Autonomous)

Artifacts:
- Context: {output_path}/context-{topic}.md
- Discovery: {output_path}/discovery-{topic}.md
- Spec: {output_path}/spec-{topic}.md
- Decision log: {output_path}/decision-log.md

Review the decision log for autonomous choices made.
```

---

## NO NEXT STEP

Workflow is complete.
