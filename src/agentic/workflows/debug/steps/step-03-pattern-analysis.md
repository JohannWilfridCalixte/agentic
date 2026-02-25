# Step 3: Pattern Analysis

---

## ORCHESTRATOR ACTION

**You MUST delegate analysis using the Task tool. Do NOT analyze yourself.**

Find the pattern before fixing. Compare working vs broken.

---

## SEQUENCE

### 3.1 Delegate Pattern Analysis

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-analyst.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning pattern analysis.'

---

# TASK: Pattern Analysis

Perform pattern analysis. Find working examples to compare.

Workflow: debug (autonomous)
Session ID: {session_id}
Session path: {session_path}
Investigation log: {session_path}/investigation-log.md

Your task:
1. Find working examples of similar code in the codebase
2. If implementing a pattern, read the reference COMPLETELY
3. List EVERY difference between working and broken
4. Understand dependencies and assumptions

Output to: {session_path}/evidence.md

Questions to answer:
- What works that's similar to what's broken?
- What's different between working and broken?
- What dependencies/config does this code need?
- What assumptions does it make?

Decision log: {session_path}/decision-log.md
")
```

### 3.2 Validate Output

Read `{session_path}/evidence.md`. Verify it contains:

**Required sections:**
- [ ] Working Examples - similar code that works
- [ ] Comparison - differences between working/broken
- [ ] Dependencies - what the code needs
- [ ] Assumptions - what the code expects

**If missing sections:**
Re-delegate with specific request for missing content.

### 3.3 Log Analysis Decision

```markdown
### DEC-{N}: Pattern Analysis Complete

**Step**: pattern-analysis
**Agent**: Analyst
**Timestamp**: {ISO}

**Context**: Comparing working vs broken code

**Findings**:
- Working example found: {yes/no}
- Key differences: {count} identified
- Dependencies verified: {yes/no}

**Decision**: Proceed to hypothesis formation

**Confidence**: {%}

**Reversibility**: Easy
```

### 3.4 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 3
    name: "pattern-analysis"
    completed_at: {ISO}
    working_example_found: {boolean}
    differences_identified: {count}

artifacts:
  evidence: "{session_path}/evidence.md"

current_step: 4
```

**Output:**
```
Pattern analysis complete

Evidence: {session_path}/evidence.md
Working examples: {count}
Differences: {count}

Proceeding to Hypothesis Testing...
```

---

## EVIDENCE TEMPLATE

The analyst should produce:

```markdown
# Evidence - {session_id}

## Working Examples

### Example 1: {description}
```{language}
{working code snippet}
```
- Location: {file:line}
- Why it works: {explanation}

### Example 2: {description}
{if applicable}

## Comparison

### Differences Found

| Aspect | Working | Broken |
|--------|---------|--------|
| {aspect1} | {working value} | {broken value} |
| {aspect2} | {working value} | {broken value} |

### Analysis

**Critical differences:**
1. {difference and why it matters}
2. {difference and why it matters}

**Non-critical differences:**
1. {difference and why it doesn't matter}

## Dependencies

### Required
- {dependency 1}: {status - present/missing/wrong}
- {dependency 2}: {status}

### Configuration
- {config 1}: {expected vs actual}
- {config 2}: {expected vs actual}

## Assumptions

### Code Assumes
1. {assumption 1} - {validated/violated}
2. {assumption 2} - {validated/violated}

### Environment Assumes
1. {env assumption} - {validated/violated}

## Summary

**Most likely cause based on evidence:**
{1-2 sentence summary of what the evidence points to}

**Confidence:** {%}
```

---

## NEXT STEP

Load `step-04-hypothesis-testing.md`
