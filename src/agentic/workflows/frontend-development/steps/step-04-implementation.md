# Step 4: Implementation

---

## ORCHESTRATOR ACTION

**You MUST delegate implementation using the Task tool. Do NOT implement yourself.**

Design decisions exist. Now implement them exactly.

---

## SEQUENCE

### 4.1 Delegate Implementation

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-frontend-developer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning implementation.'

---

# TASK: Implement Frontend Feature

Implement the frontend feature following design decisions exactly.

Workflow: frontend-development (autonomous)
Session ID: {session_id}
Session path: {session_path}
Design decisions: {session_path}/design-decisions.md
Feature request: {session_path}/feature-request.md

Your task:
1. Read design-decisions.md COMPLETELY
2. Implement visual specs EXACTLY (colors, typography, spacing)
3. Implement all component states
4. Implement interaction patterns
5. Implement responsive behavior
6. Run tests after each component
7. Document design compliance

CRITICAL: Follow design-decisions.md exactly. Do not improvise.

Output to: {session_path}/implementation-log.md

Decision log: {session_path}/decision-log.md
")
```

### 4.2 Validate Output

Read `{session_path}/implementation-log.md`. Verify it contains:

**Required sections:**
- [ ] Summary - what was implemented
- [ ] Design Compliance - colors, typography, spacing verified
- [ ] Components Implemented - with states
- [ ] Files Changed - list with descriptions
- [ ] Commands Run - with actual output
- [ ] Regression Check - tests passing

**If tests failing:**

Do NOT proceed. Re-delegate with:
```
Tests are failing. Fix regressions before proceeding.
{failing test output}
```

### 4.3 Verify Design Compliance

Compare implementation-log.md design compliance table against design-decisions.md:

**Check:**
- Colors match exactly (hex values)
- Typography matches (font, sizes)
- Spacing matches (values)
- All component states implemented
- Responsive breakpoints work

**If mismatches found:**

Re-delegate with specific corrections:
```
Design compliance issues found:
- {element}: specified {X}, implemented {Y}
Fix these before proceeding.
```

### 4.4 Log Implementation Decision

```markdown
### DEC-{N}: Implementation Complete

**Step**: implementation
**Agent**: Frontend Developer
**Timestamp**: {ISO}

**Context**: Implementing frontend following design decisions

**Results**:
- Components: {count} implemented
- Design compliance: {compliant/issues}
- Tests: {pass/fail}
- Files changed: {count}

**Decision**: Implementation complete, proceeding to QA

**Confidence**: {%}

**Reversibility**: Easy (git revert)
```

### 4.5 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 4
    name: "implementation"
    completed_at: {ISO}
    components_count: {count}
    tests_passing: {boolean}
    files_changed: {list}

artifacts:
  implementation_log: "{session_path}/implementation-log.md"

implementation_complete: true

current_step: 5
```

**Output:**
```
Implementation complete

Implementation log: {session_path}/implementation-log.md
Components: {count}
Design compliance: verified
Tests: passing

Proceeding to QA Review...
```

---

## NEXT STEP

Load `step-05-qa-review.md`
