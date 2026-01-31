---
name: agentic:product-spec
description: Use when transforming a raw idea into a precise product specification. Triggers - vague feature request, new product idea, need rigorous requirements before design.
---

# /agentic:product-spec - Idea to Product Spec

**Usage:** `/agentic:product-spec [--auto] [<input>]`

Transform a rough idea into a precise product specification through rigorous questioning.

## Arguments

- No args: Interactive mode, prompt for idea
- `--auto`: Autonomous mode with decision logging
- `path/to/notes.md`: Use existing notes/idea file
- `--auto path/to.md`: Auto mode with file input

## Workflow Overview

```
1. Input Detection → 2. Product Discovery → 3. Write Spec
```

## Step Files

Execute steps in order. Each step file contains detailed instructions.

| Step | File | Description |
|------|------|-------------|
| 1 | `steps/step-01-input-detection.md` | Parse args, init state, generate topic slug |
| 2 | `steps/step-02-product-discovery.md` | Delegate discovery to subagent |
| 3 | `steps/step-03-write-spec.md` | Delegate design, compile final spec |

## Templates

| Template | Description |
|----------|-------------|
| `templates/workflow-state.yaml` | State tracking template |

## Subagent References

Each subagent reads its own instructions from `.{ide-folder}/skills/{skill}/SKILL.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/skills/{skill}/SKILL.md for your full instructions. ...")`

Available skills: `product-discovery`, `brainstorming`

---

## Mandatory Delegation

**You MUST delegate all discovery/design work using the Task tool. NEVER do it inline.**

You are the orchestrator. You:
- Parse input, detect mode
- Initialize state tracking
- Invoke subagents in sequence
- Handle handoffs between agents
- Validate outputs at each step
- Compile final spec

**You NEVER:**
- Ask discovery questions yourself (delegate to Discovery subagent)
- Brainstorm design options yourself (delegate to Designer subagent)
- Write discovery documents yourself (delegate)

If you catch yourself doing agent work instead of delegating, STOP and use the Task tool.

---

## Mode Behaviors

**Interactive Mode (default):**
- Discovery subagent asks user questions one at a time
- Challenges vague answers, pushes for specifics
- Present discoveries for review before proceeding to spec
- Pause for approval at key decision points

**Auto Mode (--auto):**
- Subagents make autonomous decisions with confidence logging
- Log ALL decisions and assumptions in `decision-log.md`
- Flag low confidence (<90%) decisions for review
- Continue without human input unless blocked

---

## Execution

**Start workflow by reading step 1:**

```
Read steps/step-01-input-detection.md
```

Follow each step file's instructions sequentially. Each step ends with a reference to the next step.

---

## Decision Logging Protocol (Auto Mode)

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

## Error Handling

### Discovery Incomplete
If discovery output missing required sections:
1. Log which sections are missing
2. Interactive: Ask user to provide missing info
3. Auto: Make reasonable assumptions, log them, proceed

### Step Failure
If any step fails:
1. Log error in workflow-state.yaml
2. Set status: "failed"
3. Interactive: Present error, ask how to proceed
4. Auto: Attempt recovery once, then halt with detailed error log

---

## Artifacts

All outputs: `{ide-folder}/{output-folder}/product/specs/`
- `workflow-state.yaml`
- `decision-log.md` (auto mode)
- `discovery-{topic}.md`
- `spec-{topic}.md`
