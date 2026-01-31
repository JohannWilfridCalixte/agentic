---
name: agentic:auto-implement
description: Use when autonomously implementing from spec/PRD/plan to PR without user interaction. Triggers - "implement this spec", "implement this user story", "auto-implement", feature requests with acceptance criteria. Documents all decisions instead of asking.
---

# Autonomous Implementation

Takes spec, PRD, epic, user story, or technical plan and implements it autonomously. Zero user interaction - all decisions documented.

## Usage

```
/agentic:auto-implement [<input>]
```

Arguments:
- `path/to/spec.md` - existing spec/plan file
- `#123` or `https://github.com/.../issues/123` - GitHub issue
- Inline text - direct description
- No args - ERROR: input required

## Orchestrator Role

You are the **main agent** orchestrating this workflow. You:
1. Classify input type
2. Determine route (which steps to execute)
3. Initialize state and decision log
4. Invoke subagents via Task tool
5. Handle handoffs between agents
6. Manage review loop
7. Create final PR

**You do NOT:**
- Make technical decisions (that's Architect)
- Write implementation code (that's Editor)
- Gather codebase context (that's Architect)
- Write tests (that's Test Engineer)
- Review code quality (that's QA)
- Review test quality (that's Test QA)
- Ask user questions (log decisions instead)

## MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

When a step says "invoke subagent", you:
1. Use Task tool to spawn subagent
2. Pass prompt (which tells subagent to read its own instructions)
3. Wait for result
4. Validate output exists
5. Update workflow state

**You NEVER:**
- Explore codebase yourself (delegate to Architect)
- Write technical-context.md (delegate to Architect)
- Write technical-plan.md (delegate to Architect)
- Write or edit code (delegate to Editor)
- Write tests (delegate to Test Engineer)
- Review code (delegate to QA/Security QA)
- Review tests (delegate to Test QA)

If you catch yourself doing agent work, STOP and use Task tool.

## Subagent Invocation

Always use `general-purpose` subagent type:

```
Task(subagent_type="general-purpose", prompt="You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md for your full instructions. Execute Phase 1: Context Gathering. ...")
Task(subagent_type="general-purpose", prompt="You are the Architect agent. {ide-invoke-prefix}{ide-folder}/agents/architect.md for your full instructions. Execute Phase 2: Technical Planning. ...")
Task(subagent_type="general-purpose", prompt="You are the Editor agent. {ide-invoke-prefix}{ide-folder}/agents/editor.md for your full instructions. Implement the technical plan. ...")
Task(subagent_type="general-purpose", prompt="You are the Test Engineer agent. {ide-invoke-prefix}{ide-folder}/agents/test-engineer.md for your full instructions. Write tests. ...")
Task(subagent_type="general-purpose", prompt="You are the QA agent. {ide-invoke-prefix}{ide-folder}/agents/qa.md for your full instructions. Review implementation. ...")
Task(subagent_type="general-purpose", prompt="You are the Test QA agent. {ide-invoke-prefix}{ide-folder}/agents/test-qa.md for your full instructions. Review tests. ...")
Task(subagent_type="general-purpose", prompt="You are the Security QA agent. {ide-invoke-prefix}{ide-folder}/agents/security-qa.md for your full instructions. Security review. ...")
```

Available agents: `architect`, `editor`, `test-engineer`, `qa`, `test-qa`, `security-qa`

---

## Routes by Input Classification

| Input Type | Route |
|------------|-------|
| product | Context -> Plan -> Editor -> Test -> Review -> PR |
| technical-plan | Context -> Editor -> Test -> Review -> PR |
| technical-plan-with-context | Editor -> Test -> Review -> PR |
| mixed | Context -> Plan -> Editor -> Test -> Review -> PR |

---

## Workflow Steps

Execute steps in order based on route. Read step file before executing each step.

| Step | File | Description |
|------|------|-------------|
| 1 | `steps/step-01-input-classification.md` | Classify input, determine route, initialize state |
| 2 | `steps/step-02-architect-context.md` | Gather codebase context (Architect) |
| 3 | `steps/step-03-architect-plan.md` | Create technical plan (Architect) |
| 4 | `steps/step-04-editor-implement.md` | Implement code changes (Editor) |
| 4b | `steps/step-04b-test-engineer.md` | Write tests (Test Engineer) |
| 5 | `steps/step-05-review-loop.md` | QA + Test QA + Security review loop |
| 6 | `steps/step-06-create-pr.md` | Create branch, commit, push, open PR |

**Execution pattern:**
1. Read current step file
2. Execute step instructions
3. Validate outputs
4. Update workflow-state.yaml
5. Read next step file

---

## Autonomous Behavior

### Critical Principles
- ONE STEP AT A TIME: complete each step before proceeding
- NO SKIPPING: execute all steps in determined route
- TRACK STATE: update `workflow-state.yaml` after each step
- NEVER ASK USER: log decisions and open questions instead
- STAY IN LANE: each agent decides within their authority

### Decision Making
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

### Confidence Below 90%
1. Log in decision-log.md as LOW_CONFIDENCE
2. Add to Open Questions section
3. Proceed with best-guess

### Max Review Iterations
1. Log state
2. Create draft PR
3. List unresolved issues in PR description

### Step Failure
1. Log error in workflow-state.yaml
2. Set status: "failed"
3. Attempt recovery once, then halt

---

## Artifacts

All outputs: `documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/`

| Artifact | Description |
|----------|-------------|
| `workflow-state.yaml` | Current workflow state |
| `decision-log.md` | All autonomous decisions |
| `spec.md` | Input spec (if product/mixed) |
| `technical-context.md` | Codebase analysis (if route includes) |
| `technical-plan.md` | Task breakdown and verification matrix |
| `implementation-log.md` | What was implemented |
| `test-log.md` | Test writing log |
| `qa-{n}.md` | Code QA reviews |
| `test-qa-{n}.md` | Test QA reviews |
| `security-{n}.md` | Security reviews |

---

## Workflow Diagram

```
                    /agentic:auto-implement [input]
                                |
                                v
                +-------------------------------+
                |  STEP 1: Input Classification |
                |  Classify -> Determine Route  |
                +-------------------------------+
                                |
                 +--------------+--------------+
                 |              |              |
            product/mixed   tech-plan    tech-plan+ctx
                 |              |              |
                 v              v              |
        +----------------------------+         |
        |  STEP 2: Architect Context |         |
        |  Analyze codebase          |         |
        +----------------------------+         |
                 |              |              |
            product/mixed       |              |
                 |              |              |
                 v              |              |
        +------------------+    |              |
        |  STEP 3: Plan    |    |              |
        |  Task breakdown  |    |              |
        +------------------+    |              |
                 |              |              |
                 +--------------+--------------+
                                |
                                v
                +-------------------------------+
                |  STEP 4: Editor Implement     |
                |  Code changes                 |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 4b: Test Engineer       |
                |  Write tests                  |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 5: Review Loop          |
                |  QA + Test QA + Security QA   |
                |  -> Fix loop (max 3)          |
                +-------------------------------+
                                |
                                v
                +-------------------------------+
                |  STEP 6: Create PR            |
                +-------------------------------+
                                |
                                v
                        WORKFLOW COMPLETE
```

---

## Start Workflow

Read `steps/step-01-input-classification.md` and begin execution.
