# Product Spec Workflow

**Trigger:** `/product-spec [--auto] [<input>]`

**Goal:** Transform a raw idea into a precise product specification through rigorous questioning.

---

## WORKFLOW EXECUTION RULES

### Critical Principles
- ONE STEP AT A TIME: Load and complete each step before proceeding
- READ FULLY: Read entire step file before taking any action
- NO SKIPPING: Execute all steps in sequence, no optimization
- TRACK STATE: Update `workflow-state.yaml` after each step
- STAY IN LANE: Orchestrator coordinates, does NOT do discovery work

### Mode-Specific Behavior

**Interactive Mode (default):**
- Discovery subagent asks user questions one at a time
- Present discoveries for review before writing spec
- Pause for approval at key decision points

**Auto Mode (`--auto`):**
- Make autonomous decisions with confidence logging
- Log ALL decisions in `decision-log.md`
- Document assumptions and chosen resolutions
- Continue without human input unless blocked

---

## ORCHESTRATOR RESPONSIBILITIES

You are the **main agent** orchestrating this workflow. You:
1. Detect input mode and workflow mode
2. Initialize state tracking
3. Invoke subagents (Discovery, Designer) in sequence
4. Handle handoffs between agents
5. Validate outputs at each step
6. Produce final spec

**You do NOT:**
- Ask discovery questions yourself (that's Discovery subagent)
- Explore design options yourself (that's Designer subagent)
- Write discovery documents yourself (delegate)
- Write specs yourself (delegate or compile from outputs)

### MANDATORY DELEGATION RULE

**You MUST delegate agent work using the `Task` tool. You MUST NOT perform agent work yourself.**

This is non-negotiable. When a step says "invoke Discovery/Designer agent", you:
1. Use the `Task` tool to spawn a subagent
2. Pass the subagent prompt from the step file
3. Wait for the subagent result
4. Validate the output exists
5. Update workflow state

**You NEVER:**
- Run discovery sessions yourself (delegate to Discovery subagent)
- Brainstorm design options yourself (delegate to Designer subagent)
- Write discovery documents yourself (delegate)

If you catch yourself doing agent work instead of delegating, STOP and use the Task tool.

## SUBAGENT INVOCATION

Subagent skills live in `.claude/skills/`. Each subagent reads its own SKILL.md for detailed instructions.

Always use `general-purpose` subagent type with the Task tool:

```
Task(subagent_type="general-purpose", prompt="You are the Discovery agent. Read .claude/skills/product-discovery/SKILL.md for your full instructions. Run product discovery session. ...")
Task(subagent_type="general-purpose", prompt="You are the Designer agent. Read .claude/skills/brainstorming/SKILL.md for your full instructions. Explore design options. ...")
```

---

## INITIALIZATION SEQUENCE

### 1. Parse Command Arguments

Detect from `/product-spec` invocation:

```
/product-spec                    -> interactive mode, prompt for input
/product-spec --auto             -> auto mode, prompt for input
/product-spec path/to/notes.md   -> interactive mode, use file
/product-spec --auto notes.md    -> auto mode, use file
```

**Set variables:**
- `workflow_mode`: "interactive" | "auto"
- `input_type`: "user" | "file"
- `input_source`: <path or null>

### 2. Generate Topic Slug

From the input (file name or user description):
- Extract core topic
- Convert to kebab-case: `user-authentication`, `payment-flow`, etc.
- Use as `{topic}` variable throughout

**Set variables:**
- `topic`: kebab-case topic slug
- `output_path`: `documentation/product/specs/`

### 3. Initialize State File

Create `workflow-state.yaml` at:
`documentation/product/specs/workflow-state.yaml`

### 4. Initialize Decision Log (Auto Mode Only)

If `workflow_mode == "auto"`, create `decision-log.md`

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

**Decision**: {Chosen option}

**Confidence**: {percentage}%

**Rationale**:
{Why this choice was made}

---
```

---

## WORKFLOW DIAGRAM

```
+-----------------------------------------------------------------+
|                   /product-spec [--auto] [input]                |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|  STEP 1: Input Detection                                        |
|  - Parse arguments                                              |
|  - Detect mode (interactive/auto)                               |
|  - Generate topic slug                                          |
|  - Initialize state                                             |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|  STEP 2: Product Discovery               [Discovery Subagent]   |
|  - Rigorous one-question-at-a-time approach                     |
|  - Problem statement, users, metrics, scope, ACs                |
|  - Output: discovery-{topic}.md                                 |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|  STEP 3: Write Spec                        [Designer Subagent]  |
|  - Design exploration via brainstorming                         |
|  - Compile discovery + design into final spec                   |
|  - Output: spec-{topic}.md                                      |
+-----------------------------------------------------------------+
                                |
                                v
                        WORKFLOW COMPLETE
```

---

## ERROR HANDLING

### Discovery Incomplete
If discovery output missing required sections:
1. Log which sections are missing
2. **Interactive**: Ask user to provide missing info
3. **Auto**: Make reasonable assumptions, log them, proceed

### Step Failure
If any step fails:
1. Log error in workflow-state.yaml
2. Set status: "failed"
3. **Interactive**: Present error, ask how to proceed
4. **Auto**: Attempt recovery once, then halt with detailed error log

---

## BEGIN EXECUTION

Load and execute: `steps/step-01-input-detection.md`
