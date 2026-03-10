# Step 4: Technical Planning

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT create the plan yourself.**

The Architect subagent will read its own instructions and use the `technical-planning` skill to generate an implementation plan from the context, functional understanding, and product decisions.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning technical planning.'

{language_skills_prompt}

# TASK: Technical Planning (Autonomous)

This is an AUTONOMOUS workflow. Do NOT ask the user any questions. Log ALL decisions in the decision log.

Generate a detailed, implementable technical plan based on the context, functional understanding, and product decisions.

## Inputs

Read these files in order:
1. {output_path}/input-idea.md — original idea
2. {output_path}/technical-context.md — codebase analysis
3. {output_path}/functional-understanding.md — behavior synthesis
4. {output_path}/product-decisions.md — scope, acceptance criteria, assumptions

## Output

Output to: {output_path}/technical-plan.md

CRITICAL: The plan MUST reflect ALL acceptance criteria from product-decisions.md. Every AC must map to at least one task.

The plan must include:
1. Scope (in/out) — aligned with product-decisions.md
2. Proposed design reflecting architecture decisions
3. Contracts & interfaces
4. Task breakdown (TASK-01, TASK-02, ...) with PR-sized tasks
5. Verification matrix mapping every AC to tests
6. Software Engineer brief with suggested implementation order

For every technical decision you make, make reasonable choices based on existing codebase patterns and document them.

## Decision Logging

For every technical decision, append to: {output_path}/decision-log.md

Use the format:
### DEC-{number}: {Brief Title}
**Step**: technical-planning
**Agent**: Architect
**Timestamp**: {ISO}
**Context**: {what question arose}
**Options Considered**: {list}
**Decision**: {chosen}
**Confidence**: {%}
**Rationale**: {why}
**Trade-offs**: {what was sacrificed}
**Reversibility**: {Easy | Medium | Hard}

IMPORTANT: Number decisions sequentially from where the PM left off. Read decision-log.md first to find the last DEC number.

If confidence < 90%, log as LOW_CONFIDENCE and add to Open Questions.
")
```

### Inputs to provide

- All artifacts from steps 1-3
- `decision-log.md` - append decisions here

### Validate output

After subagent completes, verify:
- `{output_path}/technical-plan.md` exists and is non-empty
- Contains Task Breakdown (TASK-01, TASK-02, ...)
- Contains Verification Matrix
- All ACs from `product-decisions.md` are mapped to tasks

**If validation fails:**
- Re-run subagent with specific guidance about what's missing
- If second attempt fails, HALT — a valid plan is required to proceed

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_plan: "{output_path}/technical-plan.md"

steps_completed:
  - step: 4
    name: "technical-planning"
    completed_at: {ISO_timestamp}
    output: "{output_path}/technical-plan.md"

current_step: 5
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Technical plan generated.

Tasks: {count} tasks defined
Verification: {count} ACs mapped to tests
Decisions logged: {count from decision-log.md}

Launching implement workflow...
```

---

## NEXT STEP

Load `step-05-launch-implement.md`
