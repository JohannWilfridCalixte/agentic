# Step 4: Hypothesis Testing

---

## ORCHESTRATOR ACTION

**You MUST delegate hypothesis work using the Task tool. Do NOT form/test hypotheses yourself.**

Scientific method: one hypothesis at a time, minimal tests.

---

## THE IRON LAW

```
IF hypothesis_attempts >= 3:
  STOP. Question architecture. Escalate.
```

3+ failed hypotheses = architectural problem, not hypothesis problem.

---

## LOOP CONFIGURATION

```yaml
max_attempts: 3
current_attempt: {from workflow-state}
```

---

## SEQUENCE

### 4.1 Delegate Hypothesis Formation

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-analyst.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning hypothesis testing.'

---

# TASK: Form and Test Hypothesis

Form a single testable hypothesis.

Workflow: debug (autonomous)
Session ID: {session_id}
Session path: {session_path}
Attempt: {attempt_number} of 3
Investigation log: {session_path}/investigation-log.md
Evidence: {session_path}/evidence.md
{If attempt > 1: Previous hypotheses: {session_path}/hypothesis-log.md}

Your task:
1. Form ONE clear hypothesis: 'I think X is the root cause because Y'
2. Design the SMALLEST test to validate/invalidate
3. Execute the test
4. Report result

Hypothesis format:
- Statement: 'The bug is caused by {X} because {evidence}'
- Test: '{minimal change or diagnostic to verify}'
- Prediction: 'If true, we expect {outcome}'

Output to: {session_path}/hypothesis-log.md (append if exists)

RULES:
- ONE variable at a time
- SMALLEST possible change
- Don't fix multiple things at once
- If you don't know, say 'I don't understand X'

Decision log: {session_path}/decision-log.md
")
```

### 4.2 Validate Output

Read `{session_path}/hypothesis-log.md`. Verify latest entry contains:

**Required:**
- [ ] Hypothesis statement with evidence
- [ ] Minimal test description
- [ ] Test result: CONFIRMED or REJECTED
- [ ] Next action: proceed to fix OR new hypothesis

### 4.3 Evaluate Result

**If hypothesis CONFIRMED:**

```markdown
### DEC-{N}: Hypothesis Confirmed

**Step**: hypothesis-testing
**Agent**: Analyst
**Timestamp**: {ISO}

**Context**: Testing hypothesis #{attempt_number}

**Hypothesis**: {statement}
**Test**: {what was tested}
**Result**: CONFIRMED

**Decision**: Root cause identified. Proceed to fix.

**Confidence**: {%}

**Reversibility**: N/A
```

Set `root_cause_identified: true` and proceed to Step 4b (Test Engineer - Regression Test).

**If hypothesis REJECTED and attempts < 3:**

```markdown
### DEC-{N}: Hypothesis Rejected

**Step**: hypothesis-testing
**Agent**: Analyst
**Timestamp**: {ISO}

**Context**: Testing hypothesis #{attempt_number}

**Hypothesis**: {statement}
**Test**: {what was tested}
**Result**: REJECTED - {why}

**Decision**: Form new hypothesis with updated evidence

**Confidence**: {%}
**Learning**: {what this tells us}

**Reversibility**: Easy
```

Increment `hypothesis_attempts` and loop back to 4.1.

**If hypothesis REJECTED and attempts >= 3:**

```markdown
### DEC-{N}: Hypothesis Limit Reached - Architecture Question

**Step**: hypothesis-testing
**Agent**: Orchestrator
**Timestamp**: {ISO}

**Context**: 3 hypotheses tested, none confirmed

**Hypotheses tested**:
1. {hypothesis 1} - REJECTED
2. {hypothesis 2} - REJECTED
3. {hypothesis 3} - REJECTED

**Pattern observed**: {each fix revealed new problem / fixes require massive refactoring / etc}

**Decision**: ESCALATE - architectural review needed

**Confidence**: 85%

**Recommendation**: This may be an architectural problem, not a bug. Human review required.

**Reversibility**: N/A
```

Create escalation artifact and halt workflow.

### 4.4 Handle Escalation

If 3 hypotheses failed, create `{session_path}/escalation.md`:

```markdown
# Escalation - Architectural Review Needed

## Session: {session_id}

## Summary

3 debugging hypotheses tested and rejected. This suggests the issue may be architectural rather than a simple bug.

## Hypotheses Tested

### Hypothesis 1
- Statement: {statement}
- Result: REJECTED
- Learning: {what we learned}

### Hypothesis 2
- Statement: {statement}
- Result: REJECTED
- Learning: {what we learned}

### Hypothesis 3
- Statement: {statement}
- Result: REJECTED
- Learning: {what we learned}

## Pattern Observed

{describe the pattern - each fix reveals new problem, fixes require massive refactoring, etc}

## Evidence

See:
- {session_path}/investigation-log.md
- {session_path}/evidence.md
- {session_path}/hypothesis-log.md

## Questions for Human Review

1. Is this pattern fundamentally sound?
2. Are we stuck through inertia?
3. Should we refactor architecture vs continue fixing symptoms?

## Recommendation

{orchestrator's recommendation based on evidence}
```

Set workflow status to "escalated" and halt.

### 4.5 Complete Step (Success Path)

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 4
    name: "hypothesis-testing"
    completed_at: {ISO}
    attempts: {count}
    confirmed_hypothesis: {statement}

root_cause_identified: true

artifacts:
  hypothesis_log: "{session_path}/hypothesis-log.md"

current_step: "4b"
```

**Output:**
```
Root cause identified

Hypothesis: {confirmed hypothesis}
Attempts: {count}
Evidence: {session_path}/hypothesis-log.md

Proceeding to Test Engineer (regression test)...
```

---

## HYPOTHESIS LOG TEMPLATE

```markdown
# Hypothesis Log - {session_id}

## Attempt 1

**Timestamp:** {ISO}

### Hypothesis
> I think {X} is the root cause because {evidence from investigation/pattern analysis}

### Test Design
- **Change:** {minimal change to test}
- **Prediction:** If hypothesis is correct, {expected outcome}
- **Verification:** {how to verify}

### Execution
```
{commands or changes made}
```

### Result
**Status:** CONFIRMED | REJECTED

**Observation:** {what actually happened}

**Learning:** {what this tells us about the bug}

---

## Attempt 2 (if needed)

{same structure}
```

---

## NEXT STEP

If confirmed: Load `step-04b-test-engineer-regression.md`
If escalated: Halt workflow
