# Step 5: Launch Implement Workflow

---

## ORCHESTRATOR ACTION

**Invoke the implement workflow with the generated technical plan.**

### Pre-Condition Check

Verify all required artifacts exist:

```yaml
artifacts:
  technical_plan: "{output_path}/technical-plan.md"  # MUST exist
  product_decisions: "{output_path}/product-decisions.md"  # MUST exist
  decision_log: "{output_path}/decision-log.md"  # MUST exist
```

**If technical-plan.md is missing or empty:** HALT. Go back to step 4.

### Launch Implement

Invoke the implement workflow by reading its SKILL.md and passing the technical plan:

```
{ide-invoke-prefix}{ide-folder}/skills/agentic-workflow-implement/SKILL.md
```

**Pass as input:** `{output_path}/technical-plan.md`

The implement workflow will:
1. Validate the plan
2. Run Software Engineer to implement code
3. Run Test Engineer to write tests
4. Run QA review loop
5. Optionally create PR (asks developer)

**IMPORTANT:** The implement workflow handles its own state tracking. The auto-implement workflow state remains at step 5 until implement completes.

---

## STEP COMPLETION

After the implement workflow finishes, update `workflow-state.yaml`:

```yaml
status: "completed"

steps_completed:
  - step: 5
    name: "launch-implement"
    completed_at: {ISO_timestamp}

completed_at: {ISO_timestamp}
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Auto-implement workflow complete.

## Artifacts

### Decisions & Planning
- Input idea: {output_path}/input-idea.md
- Technical context: {output_path}/technical-context.md
- Functional understanding: {output_path}/functional-understanding.md
- Product decisions: {output_path}/product-decisions.md
- Technical plan: {output_path}/technical-plan.md

### Decision Log
- All decisions: {output_path}/decision-log.md
- Review LOW_CONFIDENCE decisions and Open Questions

### Implementation
See implement workflow artifacts in its output directory.
```

---

## WORKFLOW COMPLETE
