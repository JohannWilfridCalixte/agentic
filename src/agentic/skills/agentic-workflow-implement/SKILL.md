---
name: agentic:workflow:implement
description: Use when implementing from a technical plan (from agentic:technical-planning or planning mode). Requires valid technical plan as input. Interactive PR step. Triggers - "implement this plan", "implement technical plan", technical plan file provided.
argument-hint: "<path/to/technical-plan.md | technical plan in context>"
---

# Implement from Technical Plan

Takes a **technical plan** and implements it: code, tests, review, optional PR. The plan must already exist — this workflow does NOT create plans.

## Usage

```
/agentic:workflow:implement <input>
```

Arguments:
- `path/to/technical-plan.md` — existing technical plan file
- Technical plan in conversation context (from planning mode)
- No args or non-plan input — **ERROR: technical plan required**

## HARD GATE: Technical Plan Required

**This workflow MUST NOT start without a valid technical plan.**

If the input is not a technical plan (no task breakdown, no file change manifest, no implementation steps):

> **STOP.** This workflow requires a technical plan as input.
>
> Create one first via:
> - `/agentic:workflow:technical-planning` — interactive technical planning workflow
> - Cursor planning mode or Claude Code planning mode
>
> Then re-invoke `/agentic:workflow:implement` with the resulting plan.

**Do NOT proceed. Do NOT offer to create the plan yourself. Halt.**

---

## Orchestrator Role

You are the **main agent** orchestrating this workflow. You:
1. Validate the input is a technical plan
2. Initialize state
3. Invoke subagents via Task tool
4. Handle handoffs between agents
5. Manage review loop
6. Ask developer about optional PR creation

**You do NOT:**
- Write implementation code (that's Editor)
- Write tests (that's Test Engineer)
- Review code quality (that's QA)
- Review test quality (that's Test QA)

## MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

When a step says "invoke subagent", you:
1. Use Task tool to spawn subagent
2. Pass prompt (which tells subagent to read its own instructions)
3. Wait for result
4. Validate output exists
5. Update workflow state

**You NEVER:**
- Write or edit code (delegate to Editor)
- Write tests (delegate to Test Engineer)
- Review code (delegate to QA/Security QA)
- Review tests (delegate to Test QA)

If you catch yourself doing agent work, STOP and use Task tool.

## Subagent Invocation

Always use `{subagentTypeGeneralPurpose}` subagent type:

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Editor agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-editor.md for your full instructions. Implement the technical plan. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Test Engineer agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-test-engineer.md for your full instructions. Write tests. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the QA agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-qa.md for your full instructions. Review implementation. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Test QA agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-test-qa.md for your full instructions. Review tests. ...")
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the Security QA agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-security-qa.md for your full instructions. Security review. ...")
```

Available agents: `editor`, `test-engineer`, `qa`, `test-qa`, `security-qa`

---

## Route

Single route — no classification needed:

```
Validate Plan → Editor → Test → Review → (optional) PR
```

---

## Workflow Steps

Execute steps in order. Read step file before executing each step.

| Step | File | Description |
|------|------|-------------|
| 1 | `steps/step-01-validate-plan.md` | Validate technical plan input, initialize state |
| 2 | `steps/step-02-editor-implement.md` | Implement code changes (Editor) |
| 3 | `steps/step-03-test-engineer.md` | Write tests (Test Engineer) |
| 4 | `steps/step-04-review-loop.md` | QA + Test QA + Security review loop |
| 5 | `steps/step-05-pr.md` | **Optional** — ask developer, create branch/commit/PR |

**Execution pattern:**
1. Read current step file
2. Execute step instructions
3. Validate outputs
4. Update workflow-state.yaml
5. Read next step file

---

## Behavior

### Critical Principles
- ONE STEP AT A TIME: complete each step before proceeding
- NO SKIPPING: execute all steps in order (except step 5 which is optional)
- TRACK STATE: update `workflow-state.yaml` after each step
- AUTONOMOUS for steps 2-4: log decisions, don't ask user
- INTERACTIVE for step 5: ask developer about PR creation

### Decision Making (steps 2-4)
- Make autonomous decisions with 90%+ confidence
- Log ALL decisions in `decision-log.md`
- Document open questions with best-guess resolutions
- Continue without human input unless completely blocked
- If confidence < 90%, log as LOW_CONFIDENCE, add to Open Questions, proceed

### Decision Log Format

Append to `decision-log.md` for every autonomous decision:

```markdown
### DEC-{number}: {Brief Title}

**Step**: {step_name}
**Agent**: {agent}
**Timestamp**: {ISO}

**Context**: {what question/ambiguity arose}

**Options Considered**:
1. {Option A} - {pros/cons}
2. {Option B} - {pros/cons}

**Decision**: {chosen option}
**Confidence**: {%}

**Rationale**: {why}

**Trade-offs**: {what was sacrificed}
**Reversibility**: {Easy | Medium | Hard}

---
```

---

## Error Handling

### No Technical Plan
1. HALT immediately
2. Direct developer to `/agentic:workflow:technical-planning` or planning mode
3. Do NOT proceed

### Confidence Below 90%
1. Log in decision-log.md as LOW_CONFIDENCE
2. Add to Open Questions section
3. Proceed with best-guess

### Max Review Iterations
1. Log state
2. Ask developer how to proceed (this is NOT autonomous)
3. Options: create draft PR, keep fixing, or stop

### Step Failure
1. Log error in workflow-state.yaml
2. Set status: "failed"
3. Attempt recovery once, then halt

---

## Artifacts

All outputs: `{ide-folder}/{outputFolder}/task/implement/{topic}/{instance_id}/`

| Artifact | Description |
|----------|-------------|
| `workflow-state.yaml` | Current workflow state |
| `decision-log.md` | All autonomous decisions |
| `technical-plan.md` | Input plan (copied) |
| `implementation-log.md` | What was implemented |
| `test-log.md` | Test writing log |
| `qa-{n}.md` | Code QA reviews |
| `test-qa-{n}.md` | Test QA reviews |
| `security-{n}.md` | Security reviews |

---

## Workflow Diagram

```
                    /agentic:workflow:implement <technical-plan>
                                |
                                v
                +-------------------------------+
                |  STEP 1: Validate Plan        |
                |  Is it a technical plan?       |
                +-------------------------------+
                       |                |
                    YES                NO
                       |                |
                       v                v
                  Continue         HALT: Require
                       |           technical plan
                       v
                +-------------------------------+
                |  STEP 2: Editor Implement     |
                |  Code changes (autonomous)    |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 3: Test Engineer         |
                |  Write tests (autonomous)     |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 4: Review Loop          |
                |  QA + Test QA + Security QA   |
                |  -> Fix loop (max 3)          |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 5: PR (optional)        |
                |  Ask developer:               |
                |  - Create branch? (name?)     |
                |  - Commit (conventional)       |
                |  - Create PR? (title?)        |
                +-------------------------------+
                                |
                                v
                        WORKFLOW COMPLETE
```

---

## Start Workflow

Read `steps/step-01-validate-plan.md` and begin execution.
