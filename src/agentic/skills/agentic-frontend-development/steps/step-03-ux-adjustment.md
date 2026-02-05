# Step 3: UX Adjustment

---

## ORCHESTRATOR ACTION

**You MUST delegate UX refinement using the Task tool. Do NOT refine UX yourself.**

This step adds interaction patterns to the visual foundation.

---

## SEQUENCE

### 3.1 Delegate UX Adjustment

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/ui-ux-designer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning UX adjustment.'

---

# TASK: Refine UX Patterns

Add interaction patterns and UX refinements to existing design.

Workflow: frontend-development (autonomous)
Session ID: {session_id}
Session path: {session_path}
Design decisions: {session_path}/design-decisions.md

Your task:
1. Read the existing design-decisions.md
2. Define user flow (step-by-step journey)
3. Add interaction patterns (triggers, responses, feedback)
4. Define error handling UX
5. Define loading states
6. Define empty states
7. Define success feedback

AMEND the existing design-decisions.md with UX Refinements section.

Output to: {session_path}/design-decisions.md (append UX Refinements)

Decision log: {session_path}/decision-log.md
")
```

### 3.2 Validate Output

Read `{session_path}/design-decisions.md`. Verify UX section contains:

**Required UX sections:**
- [ ] User Flow - step-by-step journey
- [ ] Interaction Patterns - at least one pattern
- [ ] Error Handling UX - how errors display
- [ ] Loading States - what shows during loading
- [ ] Empty States - no-data scenarios
- [ ] Success Feedback - confirmation patterns

**If missing sections:**

Re-delegate with specific instruction:
```
Your UX Refinements section is missing: {list}
Please add these sections before proceeding.
```

### 3.3 Log UX Decision

```markdown
### DEC-{N}: UX Patterns Complete

**Step**: ux-adjustment
**Agent**: UI/UX Designer
**Timestamp**: {ISO}

**Context**: Adding interaction patterns to visual design

**Patterns defined**:
- User flow: {steps count} steps
- Interactions: {count} patterns
- Error states: {count} types
- Loading states: {types}

**Decision**: UX patterns documented, proceeding to implementation

**Confidence**: {%}

**Reversibility**: Easy (design doc can be updated)
```

### 3.4 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 3
    name: "ux-adjustment"
    completed_at: {ISO}
    patterns_defined: {count}

design_approved: true

current_step: 4
```

**Output:**
```
UX Adjustment complete

Design decisions updated: {session_path}/design-decisions.md
User flow: {steps count} steps
Interaction patterns: {count}
Error handling: defined
Loading states: defined

Design phase complete. Proceeding to Implementation...
```

---

## NEXT STEP

Load `step-04-implementation.md`
