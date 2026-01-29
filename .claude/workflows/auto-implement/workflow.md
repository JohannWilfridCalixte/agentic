# Auto-Implement Workflow

**Trigger:** `/agentic:auto-implement [<input>]`

**Goal:** Autonomously implement from spec/PRD/plan to PR. Zero user interaction - decisions and open questions are documented.

---

## WORKFLOW EXECUTION RULES

### Critical Principles
- ONE STEP AT A TIME: load and complete each step before proceeding
- READ FULLY: read entire step file before acting
- NO SKIPPING: execute all steps in determined route
- TRACK STATE: update `workflow-state.yaml` after each step
- NEVER ASK USER: log decisions and open questions instead
- STAY IN LANE: each agent decides within their authority

### Autonomous Behavior
- Make autonomous decisions with 90%+ confidence
- Log ALL decisions in `decision-log.md`
- Document open questions with best-guess resolutions
- Continue without human input unless completely blocked
- If confidence < 90%, log as LOW_CONFIDENCE, add to Open Questions, proceed

---

## ORCHESTRATOR RESPONSIBILITIES

You are the **main agent** orchestrating this workflow. You:
1. Classify input type (product / technical-plan / technical-plan-with-context / mixed)
2. Determine route (which steps to execute)
3. Initialize state and decision log
4. Invoke subagents (Architect, Editor, QA, Security QA) per route
5. Handle handoffs between agents
6. Manage review loop
7. Create final PR

**You do NOT:**
- Make technical decisions (that's Architect)
- Write implementation code (that's Editor)
- Gather codebase context (that's Architect)
- Review code quality (that's QA)
- Ask user any questions (log decisions instead)

### MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

This is non-negotiable. When a step says "invoke Architect/Editor/QA agent", you:
1. Use the `Task` tool to spawn a subagent
2. Pass the subagent prompt from the step file (which tells the subagent to read its own instructions)
3. Wait for the subagent result
4. Validate the output exists
5. Update workflow state

**You NEVER:**
- Explore the codebase yourself (delegate to Architect subagent)
- Write technical-context.md yourself (delegate to Architect subagent)
- Write technical-plan.md yourself (delegate to Architect subagent)
- Write or edit code yourself (delegate to Editor subagent)
- Write implementation-log.md yourself (delegate to Editor subagent)
- Review code yourself (delegate to QA/Security QA subagent)

If you catch yourself doing agent work instead of delegating, STOP and use the Task tool.

## SUBAGENT INVOCATION

Subagent instructions live in `.claude/agents/`. Each subagent reads its own file for detailed instructions, output formats, and quality gates.

Always use `general-purpose` subagent type with the Task tool:

```
Task(subagent_type="general-purpose", prompt="You are the Architect agent. Read .claude/agents/architect.md for your full instructions. Execute Phase 1: Context Gathering. ...")
Task(subagent_type="general-purpose", prompt="You are the Architect agent. Read .claude/agents/architect.md for your full instructions. Execute Phase 2: Technical Planning. ...")
Task(subagent_type="general-purpose", prompt="You are the Editor agent. Read .claude/agents/editor.md for your full instructions. Implement the technical plan. ...")
Task(subagent_type="general-purpose", prompt="You are the QA agent. Read .claude/agents/qa.md for your full instructions. Review implementation. ...")
Task(subagent_type="general-purpose", prompt="You are the Security QA agent. Read .claude/agents/security-qa.md for your full instructions. Security review. ...")
```

---

## INPUT CLASSIFICATION

Classify input into one of four categories:

### Product Input
**Signals:** user stories, acceptance criteria (AC-*), problem statements, "as a... I want... so that", PRD structure, scope sections
**No:** task breakdowns, file paths, code references
**Route:** Context → Plan → Editor → Review → PR

### Technical Plan
**Signals:** task breakdown (TASK-*), file change manifest, architecture decisions, implementation steps
**No:** codebase touchpoints, existing pattern analysis, dependency mapping
**Route:** Context → Editor → Review → PR

### Technical Plan with Context
**Signals:** task breakdown AND codebase analysis (touchpoints, constraints, patterns, existing code references)
**Route:** Editor → Review → PR

### Mixed
**Signals:** product requirements (AC-*, user stories) AND some technical direction (suggested approach, tech constraints)
**Route:** Context → Plan → Editor → Review → PR

---

## INITIALIZATION SEQUENCE

### 1. Parse Input

```
/agentic:auto-implement path/to/file.md    → input from file
/agentic:auto-implement #123               → fetch GitHub issue
/agentic:auto-implement https://...        → fetch GitHub issue URL
/agentic:auto-implement <inline text>      → use text directly
/agentic:auto-implement                    → ERROR: input required
```

### 2. Classify Input

Read input content and classify per rules above. Log classification decision.

### 3. Determine IDs

- Check input for epic/story IDs
- If missing: analyze context, assign IDs, log decision

### 4. Initialize State

Create `workflow-state.yaml` and `decision-log.md`.

---

## STEP EXECUTION

After initialization, load and execute: `steps/step-01-input-classification.md`

**Step Loading Protocol:**
1. Read entire step file
2. Check if step is in the determined route (skip if not)
3. Execute step instructions
4. Update `workflow-state.yaml`
5. Load next step as directed

---

## STATE UPDATE PROTOCOL

After each step:
```yaml
steps_completed:
  - step: {n}
    name: "{step-name}"
    completed_at: {ISO timestamp}
    output: {artifact path if any}
    skipped: false

current_step: {next}
```

For skipped steps:
```yaml
steps_completed:
  - step: {n}
    name: "{step-name}"
    skipped: true
    reason: "Not in route for input_class: {class}"
```

---

## DECISION LOGGING PROTOCOL

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

## WORKFLOW DIAGRAM

```
                    /agentic:auto-implement [input]
                                │
                                ▼
                ┌───────────────────────────────┐
                │  STEP 1: Input Classification │
                │  Classify → Determine Route   │
                └───────────────────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
            product/mixed   tech-plan    tech-plan+ctx
                 │              │              │
                 ▼              ▼              │
        ┌────────────────────────────┐        │
        │  STEP 2: Architect Context │        │
        │  Analyze codebase          │        │
        └────────────────────────────┘        │
                 │              │              │
            product/mixed       │              │
                 │              │              │
                 ▼              │              │
        ┌──────────────────┐    │              │
        │  STEP 3: Plan    │    │              │
        │  Task breakdown  │    │              │
        └──────────────────┘    │              │
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │  STEP 4: Editor Implement     │
                │  Code + tests                 │
                └───────────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │  STEP 5: Review Loop          │
                │  QA + Security QA → Fix loop  │
                └───────────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │  STEP 6: Create PR            │
                └───────────────────────────────┘
                                │
                                ▼
                        WORKFLOW COMPLETE
```

---

## ERROR HANDLING

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

## BEGIN EXECUTION

Load and execute: `steps/step-01-input-classification.md`
