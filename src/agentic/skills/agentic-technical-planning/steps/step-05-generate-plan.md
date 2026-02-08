# Step 5: Generate Technical Plan

---

## PRE-CONDITION CHECK

**Before executing this step, verify:**

```yaml
context_confirmed: true
structural_open_questions: 0
```

**If either condition fails, STOP. Do not generate the plan. Go back to the failing step.**

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT create the plan yourself.**

The Architect subagent will read its own instructions and use the `technical-planning` skill.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning technical planning.'

---

# TASK: Technical Planning (Phase 2)

Generate a detailed, implementable technical plan based on the confirmed context and all developer decisions.

Input spec: {output_path}/input-spec.md
Technical Context: {output_path}/technical-context.md
Technical Decisions: {output_path}/technical-decisions.md
Output to: {output_path}/technical-plan.md

CRITICAL: Every decision in technical-decisions.md has been explicitly confirmed by the developer. The plan MUST reflect ALL of them. Do not override or reinterpret any decision.

The plan must include:
1. Scope (in/out)
2. Proposed design reflecting developer's architecture decisions
3. Contracts & interfaces
4. Task breakdown (TASK-01, TASK-02, ...) with PR-sized tasks
5. Verification matrix mapping every requirement to tests
6. Editor brief with suggested implementation order

If any minor open questions remain in technical-decisions.md, make reasonable defaults and document them clearly in the plan's Open Questions section.
")
```

### Validate output

After subagent completes, verify:
- `{output_path}/technical-plan.md` exists and is non-empty
- Contains Task Breakdown (TASK-01, TASK-02, ...)
- Contains Verification Matrix
- All decisions from `technical-decisions.md` are reflected

**If validation fails:**
- Re-run subagent with specific guidance about what's missing
- If second attempt fails, present partial plan to developer with gaps listed

---

## PRESENT PLAN TO DEVELOPER

After the plan is generated, present a summary:

```
Technical plan generated.

**Summary:** {plan summary}

**Tasks:**
{numbered list of TASK-* titles}

**Verification:** {count} requirements mapped to tests

**Open Questions (minor):** {count, if any}

The full plan is at: {output_path}/technical-plan.md

Review and let me know if anything needs adjustment.
```

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  technical_plan: "{output_path}/technical-plan.md"

status: "completed"

steps_completed:
  - step: 5
    name: "generate-plan"
    completed_at: {ISO_timestamp}
    output: "{output_path}/technical-plan.md"

completed_at: {ISO_timestamp}
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Technical planning complete.

Artifacts:
- Input: {output_path}/input-spec.md
- Context: {output_path}/technical-context.md
- Decisions: {output_path}/technical-decisions.md
- Plan: {output_path}/technical-plan.md
```

---

## WORKFLOW COMPLETE
