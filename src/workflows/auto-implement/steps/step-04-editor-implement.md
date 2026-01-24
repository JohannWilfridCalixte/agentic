# Step 4: Editor Implement

## EXECUTION RULES

- Invoke Editor agent to implement the technical plan
- Editor follows TASK order from technical plan
- ALL tests must pass before marking complete
- Log decisions in `decision-log.md`
- Output: code changes + `implementation-log.md`

---

## AGENT HANDOFF

**Claude Code:**
```
Task(subagent_type="editor", prompt="Implement technical plan.
Workflow: auto-implement (autonomous, no user questions)
Story ID: {story_id}
Technical Plan: {story_path}/technical-plan.md
Technical Context: {story_path}/technical-context.md
{If exists: Spec: {story_path}/spec.md}
Output to: {story_path}/implementation-log.md
Decision log: {story_path}/decision-log.md

IMPORTANT: Do NOT ask user questions. Log all decisions and open questions in decision-log.md.")
```

**Cursor:**
```
@.claude/agents/editor.md
```

**Provide context:**
- `technical-plan.md` - implementation guide (follow tasks in order)
- `technical-context.md` - codebase patterns to follow (if exists)
- `spec.md` - acceptance criteria (if exists)
- `workflow_mode`: auto

---

## EDITOR IMPLEMENTATION TASK

### Rules

1. Read technical plan COMPLETELY before starting
2. Execute tasks IN ORDER (TASK-01 → TASK-02 → ...)
3. Write tests for each task before marking done
4. Run full test suite after each task
5. NEVER proceed with failing tests
6. Document everything in implementation-log.md

### Output Format

**Create `{story_path}/implementation-log.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Implementation Log
Status: In Progress
Owner: Editor
Started: {ISO}
---

# Implementation Log - {story_id}

## Summary
{Brief summary of what was implemented}

## Tasks Completed

### TASK-01: {title}
**Status**: Complete
**Started**: {timestamp}
**Completed**: {timestamp}

**What was done**:
- {change 1}
- {change 2}

**Files changed**:
- `{path}` - {what changed}

**Tests written**:
- `{test_path}` - {what it tests}

**Test results**:
```bash
$ {test command}
{actual output}
```

### TASK-02: {title}
...

## Files Changed (Cumulative)

| File | Change Type | Description |
|------|-------------|-------------|
| `{path}` | Created | {description} |
| `{path}` | Modified | {description} |

## Test Coverage

| AC | Test | Status |
|----|------|--------|
| AC-01 | `{test_path}:{test_name}` | Pass |

## Commands Run

```bash
# Lint
$ {lint command}
{output}

# Type check
$ {typecheck command}
{output}

# Tests
$ {test command}
{output}
```

## Decisions Made
{Implementation decisions logged in decision-log.md}

## Issues Encountered
{Issues and resolutions}
```

### Evidence Requirements

For EACH task:
1. What was changed (files, functions)
2. Tests written (file:test_name)
3. Test command + actual output
4. Lint/typecheck results

**NO claiming "tests pass" without actual command output.**

---

## QUALITY GATES

- [ ] All TASKs from technical plan completed
- [ ] Every AC has corresponding test (if spec exists)
- [ ] All tests passing (actual output)
- [ ] Lint clean
- [ ] Type check clean
- [ ] Implementation log complete with evidence

---

## STEP COMPLETION

**Artifacts:**
- Code changes in working tree
- `{story_path}/implementation-log.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  implementation_log: "{story_path}/implementation-log.md"

steps_completed:
  - step: 4
    name: "editor-implement"
    completed_at: {ISO}
    output: "{story_path}/implementation-log.md"

current_step: 5
```

---

## NEXT STEP

Load `step-05-review-loop.md`
