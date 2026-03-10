# Step 2: Architect Context Gathering

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT gather context yourself.**

The Architect subagent will read its own instructions and use the `gather-technical-context` skill to analyze the codebase. It will produce both technical context AND functional understanding in a single pass.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning context gathering.'

{language_skills_prompt}

# TASK: Context Gathering + Functional Understanding

This is an AUTONOMOUS workflow. Do NOT ask the user any questions. Log ALL decisions and assumptions in the decision log.

## Phase 1: Technical Context

Analyze the codebase to identify all relevant code, patterns, constraints, and dependencies for implementing the feature described below.

Input idea: {output_path}/input-idea.md
Output to: {output_path}/technical-context.md

Read the input idea first, then explore the codebase systematically.

## Phase 2: Functional Understanding

After gathering context, translate your findings into a plain-language functional understanding document.

Output to: {output_path}/functional-understanding.md

The functional understanding should cover:
- Plain-language summary of how the existing codebase handles related functionality
- Main flows relevant to the idea
- Rules and conditions that change behavior
- Edge cases
- What is unclear or ambiguous

## Decision Logging

For every assumption or decision you make, append to: {output_path}/decision-log.md

Use the format:
### DEC-{number}: {Brief Title}
**Step**: architect-context
**Agent**: Architect
**Timestamp**: {ISO}
**Context**: {what ambiguity arose}
**Options Considered**: {list}
**Decision**: {chosen}
**Confidence**: {%}
**Rationale**: {why}
**Trade-offs**: {what was sacrificed}
**Reversibility**: {Easy | Medium | Hard}

If confidence < 90%, log as LOW_CONFIDENCE and add to Open Questions section.
")
```

### Inputs to provide

- `input-idea.md` - the developer's rough idea
- `decision-log.md` - append decisions here
- Codebase access

### Validate output

After subagent completes, verify:
- `{output_path}/technical-context.md` exists and is non-empty
- `{output_path}/functional-understanding.md` exists and is non-empty
- Contains required sections: Summary, Codebase Touchpoints, Risks

**If validation fails:**
- Re-run subagent with more specific guidance
- If second attempt fails, proceed with partial context (log gap in decision-log.md)

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_context: "{output_path}/technical-context.md"
  functional_understanding: "{output_path}/functional-understanding.md"

steps_completed:
  - step: 2
    name: "architect-context"
    completed_at: {ISO_timestamp}
    output: "{output_path}/technical-context.md"

current_step: 3
updated_at: {ISO_timestamp}
```

### Resolve Language Skills

Follow skill-injection-protocol to resolve language skills for subsequent steps:
{ide-invoke-prefix}{ide-folder}/skills/agentic-skill-skill-injection-protocol/SKILL.md

Use `{output_path}/technical-context.md` for tech_stack.
Cache result in workflow-state.yaml as `language_skills_prompt`.

---

## NEXT STEP

Load `step-03-pm-decisions.md`
