# Step 6: Editor Implement

## EXECUTION RULES

- 🎯 Invoke Editor agent to implement the technical plan
- 📋 Editor follows TASK order from technical plan
- 🚫 ALL tests must pass before marking complete
- ✅ Output: Code changes + `implementation-log.md`

---

## AGENT HANDOFF

**Load Editor Agent:**
```
@.claude/agents/editor.md
```

**Provide context:**
- `spec.md` - acceptance criteria (source of truth)
- `technical-context.md` - codebase patterns to follow
- `security-addendum.md` - security requirements
- `technical-plan.md` - implementation guide (follow tasks in order)
- `workflow_mode` - interactive or auto

---

## EDITOR IMPLEMENTATION TASK

### Implementation Rules

From existing editor agent, plus workflow-specific:

1. **Read technical plan COMPLETELY** before starting
2. **Execute tasks IN ORDER** (TASK-01 → TASK-02 → ...)
3. **Write tests for each task** before marking done
4. **Run full test suite** after each task
5. **NEVER proceed with failing tests**
6. **Document everything** in implementation-log.md

### Implementation Log Format

**Create/update `implementation-log.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Implementation Log
Status: In Progress
Owner: Editor
Started: {ISO_timestamp}
---

# Implementation Log - {story_id}

## Summary
{Brief summary of what was implemented}

## Tasks Completed

### TASK-01: {Title}
**Status**: ✅ Complete
**Started**: {timestamp}
**Completed**: {timestamp}

**What was done**:
- {Change 1}
- {Change 2}

**Files changed**:
- `{path}` - {what changed}

**Tests written**:
- `{test_path}` - {what it tests}

**Test results**:
```bash
$ npm test
...
✓ {test name} (Xms)
✓ {test name} (Xms)
...
All tests passed
```

### TASK-02: {Title}
...

## Files Changed (Cumulative)

| File | Change Type | Description |
|------|-------------|-------------|
| `{path}` | Created | {description} |
| `{path}` | Modified | {description} |

## Test Coverage

| AC/SEC-REQ | Test | Status |
|------------|------|--------|
| AC-01 | `{test_path}:{test_name}` | ✅ |
| SEC-REQ-01 | `{test_path}:{test_name}` | ✅ |

## Commands Run

```bash
# Lint
$ npm run lint
✓ No issues

# Type check
$ npm run typecheck
✓ No errors

# Tests
$ npm test
✓ X passed, 0 failed
```

## Decisions Made

{Any implementation decisions, especially in auto mode}

## Issues Encountered

{Any issues and how they were resolved}
```

### Evidence Requirements

For EACH task, Editor must provide:
1. What was changed (files, functions)
2. Tests written (file:test_name)
3. Test command + actual output
4. Lint/typecheck results

**NO claiming "tests pass" without actual command output.**

### Auto Mode Implementation

**When implementation choices arise:**
- Log decision with Editor attribution
- Note alternatives considered
- Explain technical rationale

```markdown
### DEC-{N}: {Implementation choice}

**Step**: editor-implement
**Agent**: Editor
**Task**: TASK-{X}
**Timestamp**: {ISO}

**Context**:
{What choice arose during implementation}

**Options Considered**:
1. {Approach A}
2. {Approach B}

**Decision**: {Chosen approach}

**Confidence**: {X}%

**Rationale**:
{Why this implementation approach}

**Reversibility**: Easy (code change)
```

---

## QUALITY GATES

Before marking implementation complete:
- [ ] All TASKs from technical plan completed
- [ ] Every AC has corresponding test
- [ ] Every SEC-REQ addressed
- [ ] All tests passing (actual output, not claimed)
- [ ] Lint clean
- [ ] Type check clean
- [ ] Implementation log complete with evidence

---

## STEP COMPLETION

**Artifacts created:**
- Code changes in working tree
- `{story_path}/implementation-log.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  implementation_log: "{story_path}/implementation-log.md"

steps_completed:
  - step: 6
    name: "editor-implement"
    completed_at: {ISO_timestamp}
    output: "{story_path}/implementation-log.md"

current_step: 7
```

**Output:**
```
✅ Implementation complete

📝 Log: {story_path}/implementation-log.md
📁 Files changed: {count}
🧪 Tests written: {count}
✓ All tests passing

Proceeding to review loop...
```

---

## NEXT STEP

Load `step-07-review-loop.md`
