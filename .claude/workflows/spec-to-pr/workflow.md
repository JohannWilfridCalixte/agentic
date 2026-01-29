# Spec-to-PR Workflow

**Trigger:** `/quick-spec-and-implement [--auto] [<input>]`

**Goal:** Transform a product idea into a merged pull request through structured agent collaboration.

---

## WORKFLOW EXECUTION RULES

### Critical Principles
- 🛑 **ONE STEP AT A TIME**: Load and complete each step before proceeding
- 📖 **READ FULLY**: Read entire step file before taking any action
- 🚫 **NO SKIPPING**: Execute all steps in sequence, no optimization
- 💾 **TRACK STATE**: Update `workflow-state.yaml` after each step
- 🎯 **STAY IN LANE**: Each agent decides only within their authority

### Mode-Specific Behavior

**Interactive Mode (default):**
- Ask user for clarification on unclear points
- Present decisions for approval before proceeding
- Pause at review loop for human judgment

**Auto Mode (`--auto`):**
- Make autonomous decisions with 90%+ confidence
- Log ALL decisions in `decision-log.md`
- Document open questions and chosen resolutions
- Continue without human input unless blocked

---

## ORCHESTRATOR RESPONSIBILITIES

You are the **main agent** orchestrating this workflow. You:
1. Detect input mode and workflow mode
2. Initialize state tracking
3. Invoke subagents (PM, Architect, Security, Editor, QA) in sequence
4. Handle handoffs between agents
5. Manage the review loop
6. Create final PR

**You do NOT:**
- Make product decisions (that's PM)
- Make technical decisions (that's Architect)
- Make security decisions (that's Security)
- Write implementation code (that's Editor)
- Gather codebase context (that's Architect)
- Review code quality (that's QA)

### MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

This is non-negotiable. When a step says "invoke PM/Architect/Security/Editor/QA agent", you:
1. Use the `Task` tool to spawn a subagent
2. Pass the subagent prompt from the step file (which tells the subagent to read its own instructions)
3. Wait for the subagent result
4. Validate the output exists
5. Update workflow state

**You NEVER:**
- Write specs yourself (delegate to PM subagent)
- Explore the codebase yourself (delegate to Architect subagent)
- Create threat models yourself (delegate to Security subagent)
- Write technical plans yourself (delegate to Architect subagent)
- Write or edit code yourself (delegate to Editor subagent)
- Review code yourself (delegate to QA/Security QA subagent)

If you catch yourself doing agent work instead of delegating, STOP and use the Task tool.

## SUBAGENT INVOCATION

Subagent instructions live in `.claude/agents/`. Each subagent reads its own file for detailed instructions, output formats, and quality gates.

Always use `general-purpose` subagent type with the Task tool:

```
Task(subagent_type="general-purpose", prompt="You are the PM agent. Read .claude/agents/pm.md for your full instructions. Create product specification. ...")
Task(subagent_type="general-purpose", prompt="You are the Architect agent. Read .claude/agents/architect.md for your full instructions. Execute Phase 1: Context Gathering. ...")
Task(subagent_type="general-purpose", prompt="You are the Security agent. Read .claude/agents/security.md for your full instructions. Create security addendum. ...")
Task(subagent_type="general-purpose", prompt="You are the Architect agent. Read .claude/agents/architect.md for your full instructions. Execute Phase 2: Technical Planning. ...")
Task(subagent_type="general-purpose", prompt="You are the Editor agent. Read .claude/agents/editor.md for your full instructions. Implement the technical plan. ...")
Task(subagent_type="general-purpose", prompt="You are the QA agent. Read .claude/agents/qa.md for your full instructions. Review implementation. ...")
Task(subagent_type="general-purpose", prompt="You are the Security QA agent. Read .claude/agents/security-qa.md for your full instructions. Security review. ...")
```

---

## INITIALIZATION SEQUENCE

### 1. Parse Command Arguments

Detect from `/quick-spec-and-implement` invocation:

```
/quick-spec-and-implement                     → interactive mode, prompt for input
/quick-spec-and-implement --auto              → auto mode, prompt for input
/quick-spec-and-implement path/to/spec.md     → interactive mode, use file
/quick-spec-and-implement --auto issue#123    → auto mode, fetch GitHub issue
/quick-spec-and-implement --auto https://...  → auto mode, fetch GitHub issue URL
```

**Set variables:**
- `workflow_mode`: "interactive" | "auto"
- `input_type`: "user" | "file" | "github_issue"
- `input_source`: <path or URL or null>

### 2. Determine Epic and Story IDs

**If input is GitHub issue:**
- Extract epic ID from labels or parent issue
- Extract story ID from issue number

**If input is file:**
- Parse frontmatter for Epic ID and Story ID
- If missing, prompt user (interactive) or generate (auto)

**If input is user prompt:**
- Check if part of existing epic or new work
- Interactive: Ask user
- Auto: Analyze context, decide, log decision

**Set variables:**
- `epic_id`: EPIC-#### format
- `epic_name`: kebab-case name
- `story_id`: US-#### format

### 3. Initialize State File

Create `workflow-state.yaml` at:
`documentation/task/{epic_id}-EPIC-{epic_name}/US-{story_id}/workflow-state.yaml`

```yaml
workflow: spec-to-pr
version: "1.0.0"
mode: {workflow_mode}
input_type: {input_type}
input_source: {input_source}

epic_id: {epic_id}
epic_name: {epic_name}
story_id: {story_id}

started_at: {ISO timestamp}
current_step: 1
steps_completed: []

status: "in_progress"
```

### 4. Initialize Decision Log (Auto Mode Only)

If `workflow_mode == "auto"`, create `decision-log.md`:

```markdown
# Decision Log - US-{story_id}

> Autonomous decisions made during spec-to-pr workflow.
> Review these decisions and their rationale.

## Summary
- **Total Decisions**: 0
- **By PM**: 0
- **By Architect**: 0
- **By Security**: 0
- **By Editor**: 0

---

## Decisions

(Decisions will be appended as workflow progresses)
```

---

## STEP EXECUTION

After initialization, load and execute:
`steps/step-01-input-detection.md`

**Step Loading Protocol:**
1. Read entire step file
2. Execute step instructions
3. Update `workflow-state.yaml` with completion
4. Load next step file as directed

---

## STATE UPDATE PROTOCOL

After each step completion:

```yaml
# Append to steps_completed
steps_completed:
  - step: 1
    name: "input-detection"
    completed_at: {ISO timestamp}
    output: {artifact path if any}

# Update current_step
current_step: 2
```

---

## DECISION LOGGING PROTOCOL (Auto Mode)

When making autonomous decisions, append to `decision-log.md`:

```markdown
### DEC-{number}: {Brief Title}

**Step**: {current_step_name}
**Agent**: {deciding_agent}
**Timestamp**: {ISO timestamp}

**Context**:
{What question or ambiguity arose}

**Options Considered**:
1. {Option A} - {pros/cons}
2. {Option B} - {pros/cons}
3. {Option C} - {pros/cons}

**Decision**: {Chosen option}

**Confidence**: {percentage}%

**Rationale**:
{Why this choice was made}

**Trade-offs Accepted**:
- {What was sacrificed or risked}

**Reversibility**: {Easy | Medium | Hard}

---
```

---

## WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                   /quick-spec-and-implement [--auto] [input]                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Input Detection                                             │
│  - Parse arguments                                                   │
│  - Detect mode (interactive/auto)                                    │
│  - Identify input source (user/file/github)                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: PM Spec                                        [PM Agent]   │
│  - Create/refine product spec                                        │
│  - Define acceptance criteria                                        │
│  - Output: spec.md                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Architect Context                        [Architect Agent]  │
│  - Analyze codebase for relevant context                            │
│  - Identify technical constraints                                    │
│  - Output: technical-context.md                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Security Context                         [Security Agent]   │
│  - Threat modeling                                                   │
│  - Security requirements                                             │
│  - Output: security-addendum.md                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Technical Plan                           [Architect Agent]  │
│  - Implementation strategy                                           │
│  - Task breakdown                                                    │
│  - Output: technical-plan.md                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Editor Implement                           [Editor Agent]   │
│  - Write code per technical plan                                     │
│  - Write tests                                                       │
│  - Output: implementation-log.md + code changes                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Review Loop                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  QA Review                                         [QA Agent]   │ │
│  │  Security Review                           [Security QA Agent]  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                          │                                           │
│            ┌─────────────┴─────────────┐                            │
│            │  Issues found?            │                            │
│            └─────────────┬─────────────┘                            │
│                          │                                           │
│         ┌────── YES ─────┴────── NO ──────┐                         │
│         │                                  │                         │
│         ▼                                  │                         │
│  ┌──────────────┐                         │                         │
│  │ Editor: Fix  │◄────────────────────────┤                         │
│  └──────────────┘    (loop until clean    │                         │
│         │             or max iterations)  │                         │
│         └─────────────────────────────────┘                         │
│                          │                                           │
│                          ▼                                           │
│              Exit: No blockers/majors                                │
│                    OR max iterations + escalation                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: Create PR                                                   │
│  - Generate PR description from artifacts                            │
│  - Push branch                                                       │
│  - Open PR                                                           │
│  - Output: PR URL                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            ✅ WORKFLOW COMPLETE
```

---

## ERROR HANDLING

### Confidence Below Threshold (Auto Mode)
If agent confidence < 90% on a decision:
1. Log the uncertainty in decision-log.md
2. Mark decision as "LOW_CONFIDENCE"
3. Add to "Open Questions" section
4. Proceed with best-guess but flag for human review

### Max Review Iterations Reached
If review loop hits 3 iterations with unresolved blockers:
1. Log current state
2. Create PR as draft
3. List unresolved issues in PR description
4. **Interactive**: Halt and ask user
5. **Auto**: Complete with warnings, flag for human review

### Step Failure
If any step fails:
1. Log error in workflow-state.yaml
2. Set status: "failed"
3. **Interactive**: Present error, ask how to proceed
4. **Auto**: Attempt recovery once, then halt with detailed error log

---

## BEGIN EXECUTION

Load and execute: `steps/step-01-input-detection.md`
