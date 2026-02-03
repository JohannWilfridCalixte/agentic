# Step 3: Write Spec

---

## ORCHESTRATOR ACTION

**You MUST delegate design exploration using the Task tool. Then compile the final spec.**

The Designer subagent will use `.{ide-folder}/skills/brainstorming/SKILL.md` for design exploration.

### Step 3.1: Design Exploration (Delegate)

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
You are the Designer agent. {ide-invoke-prefix}{ide-folder}/skills/brainstorming/SKILL.md for your full instructions.

Explore design options for this product feature.

Topic: {topic}
Discovery document: {output_path}/discovery-{topic}.md
Decision log: {output_path}/decision-log.md (if auto mode)

Focus on:
1. Solution approaches - at least 2-3 options
2. Architecture considerations
3. Key design decisions with rationale
4. Trade-offs for each approach

Output your exploration as structured notes. The orchestrator will compile these into the final spec.

{If auto mode: Make decisions autonomously. Log all decisions in decision-log.md.}
{If interactive mode: Present options and ask for user preference.}
")
```

### Step 3.2: Compile Final Spec

After receiving design exploration output, compile the final spec.

Read the discovery document: `{output_path}/discovery-{topic}.md`

Create `{output_path}/spec-{topic}.md` with this format:

```markdown
# Product Spec: {Topic Title}

**Date:** {YYYY-MM-DD}
**Status:** Draft
**Epic:** {if applicable, else remove line}

## Summary

{2-3 sentence overview combining problem and solution}

## Problem Statement

{From discovery document - copy or refine}

## Target Users

{From discovery document}

## Success Metrics

{From discovery document}

## Solution Overview

{From design exploration - chosen approach with brief rationale}

## Scope

### In Scope
{From discovery document}

### Out of Scope
{From discovery document}

### Deferred
{From discovery document}

## Acceptance Criteria

{From discovery document - numbered list}

## Design Decisions

{From design exploration - key decisions with rationale}

| Decision | Choice | Rationale |
|----------|--------|-----------|
| {decision 1} | {choice} | {why} |
| {decision 2} | {choice} | {why} |

## Edge Cases

{From discovery document}

## Open Questions

{Any remaining questions from discovery + design}
```

### Validate Output

Verify `spec-{topic}.md`:
- [ ] Contains all required sections
- [ ] Problem and solution are clearly connected
- [ ] Acceptance criteria are testable
- [ ] Design decisions have rationale

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  discovery: "{output_path}/discovery-{topic}.md"
  spec: "{output_path}/spec-{topic}.md"

steps_completed:
  - step: 3
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
```
Product spec complete!

Discovery: {output_path}/discovery-{topic}.md
Spec: {output_path}/spec-{topic}.md

Review the spec and update status from Draft when approved.
```

**Auto mode:**
```
Product spec complete (Autonomous)

Discovery: {output_path}/discovery-{topic}.md
Spec: {output_path}/spec-{topic}.md
Decision log: {output_path}/decision-log.md

Review the decision log for autonomous choices made.
```

---

## NO NEXT STEP

Workflow is complete.
