# Step 4b: Test Engineer - Regression Test

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write tests yourself.**

Write a FAILING test that reproduces the bug BEFORE the fix is implemented.

### Delegate

```
Task(subagent_type="general-purpose", prompt="
You are the Test Engineer agent. {ide-invoke-prefix}{ide-folder}/agents/test-engineer.md for your full instructions.

Write a FAILING test that reproduces the confirmed bug.

Workflow: debug (autonomous)
Session ID: {session_id}
Session path: {session_path}
Bug report: {session_path}/bug-report.md
Investigation log: {session_path}/investigation-log.md
Evidence: {session_path}/evidence.md
Hypothesis log: {session_path}/hypothesis-log.md
Confirmed hypothesis: {from hypothesis-log}
Output to: {session_path}/regression-test-log.md
Decision log: {session_path}/decision-log.md

Your task:
1. Write a test that REPRODUCES the bug
2. The test MUST FAIL (proving it catches the bug)
3. Run the test and show the FAILURE output
4. Document what the test verifies

This test will pass AFTER the fix is implemented.

IMPORTANT: Do NOT ask user questions. Log all decisions in decision-log.md.
")
```

### Inputs to provide

- `bug-report.md` — what the bug is
- `investigation-log.md` — investigation findings
- `evidence.md` — evidence collected
- `hypothesis-log.md` — confirmed root cause

### Validate output

After the subagent completes, verify:
- `{session_path}/regression-test-log.md` exists
- Test was written
- Test FAILS (this is expected and correct!)
- Failure output is captured

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  regression_test_log: "{session_path}/regression-test-log.md"

steps_completed:
  - step: "4b"
    name: "test-engineer-regression"
    completed_at: {ISO}
    output: "{session_path}/regression-test-log.md"
    test_status: "failing" # Expected!

current_step: 5
```

---

## NEXT STEP

Load `step-05-fix-implementation.md`
