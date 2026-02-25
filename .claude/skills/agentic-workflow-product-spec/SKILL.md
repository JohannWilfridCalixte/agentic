---
name: agentic:workflow:product-spec
description: Use when transforming a raw idea into a precise product specification. Triggers - vague feature request, new product idea, need rigorous requirements before design.
---

# /agentic:workflow:product-spec - Idea to Product Spec

**Usage:** `/agentic:workflow:product-spec [--auto] [<input>]`

Transform a rough idea into a precise product specification through rigorous questioning. No critical product question left unanswered.

## Arguments

- No args: Interactive mode, prompt for idea
- `--auto`: Autonomous mode with decision logging
- `path/to/notes.md`: Use existing notes/idea file
- `--auto path/to.md`: Auto mode with file input

## Workflow Overview

```text
1. Input Detection -> 2. Context Gathering (subagent) -> 3. Product Discovery (subagent) -> 4. Developer Confirms Discovery [loop if rejected] -> 5. Product Questioning -> 6. Write Spec
```

```dot
digraph workflow {
    rankdir=TB;
    input [label="Input Detection" shape=box];
    context [label="Context Gathering\n(subagent)" shape=box];
    discovery [label="Product Discovery\n(subagent)" shape=box];
    confirm [label="Developer Confirms\nDiscovery?" shape=diamond];
    refine [label="Re-run Discovery\nwith Feedback\n(subagent)" shape=box];
    questions [label="Product Questioning\n(one at a time)" shape=box];
    gate [label="Critical Open\nQuestions Remain?" shape=diamond];
    spec [label="Write Spec\n(subagent + compile)" shape=box];
    done [label="DONE" shape=doublecircle];

    input -> context;
    context -> discovery;
    discovery -> confirm;
    confirm -> questions [label="confirmed"];
    confirm -> refine [label="rejected / corrections"];
    refine -> confirm;
    questions -> gate;
    gate -> questions [label="yes - keep asking"];
    gate -> spec [label="no - ready"];
    spec -> done;
}
```

---

## Step Files

Execute steps in order. Each step file contains detailed instructions.

| Step | File | Description |
|------|------|-------------|
| 1 | `steps/step-01-input-detection.md` | Parse args, init state, generate topic slug |
| 2 | `steps/step-02-context-gathering.md` | Gather product & technical context from codebase |
| 3 | `steps/step-03-product-discovery.md` | Delegate discovery to subagent (with codebase context) |
| 4 | `steps/step-04-confirm-discovery.md` | Developer confirms discovery; loop if rejected |
| 5 | `steps/step-05-product-questioning.md` | Ask remaining product questions one at a time |
| 6 | `steps/step-06-write-spec.md` | Delegate design, compile final spec |

**Start by reading `steps/step-01-input-detection.md` and follow NEXT STEP at end of each file.**

---

## Templates

| Template | Description |
|----------|-------------|
| `templates/workflow-state.yaml` | State tracking template |

## Subagent References

Each subagent reads its own instructions from `.claude/skills/agentic-skill-{skill}/SKILL.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are the {Agent} agent. Read .claude/skills/agentic-skill-{skill}/SKILL.md for your full instructions. ...")`

Available skills: `agentic:skill:product-discovery`, `agentic:skill:brainstorming`

---

## Mandatory Delegation

**You MUST delegate all discovery/design/context-gathering work using the Task tool. NEVER do it inline.**

You are the orchestrator. You:

- Parse input, detect mode
- Initialize state tracking
- Invoke subagents in sequence
- Handle handoffs between agents
- Validate outputs at each step
- Run the questioning loop yourself (step 5)
- Compile final spec

**You NEVER:**

- Gather codebase context yourself in step 2 (delegate to Explore subagent)
- Ask discovery questions yourself in step 3 (delegate to Discovery subagent)
- Brainstorm design options yourself (delegate to Designer subagent)
- Write discovery documents yourself (delegate)

If you catch yourself doing agent work instead of delegating, STOP and use the Task tool.

---

## THE GATE RULE

**You MUST NOT proceed to step 6 (spec writing) if critical open questions remain.**

Critical open questions = questions about problem definition, target users, success metrics, scope boundaries, acceptance criteria, or any decision that would change the shape of the spec.

Minor open questions = visual preferences, nice-to-have details, future iteration ideas. These can remain.

```dot
digraph gate {
    check [label="Any critical\nopen question?" shape=diamond];
    block [label="BLOCKED\nKeep asking in step 5" shape=box style=filled fillcolor="#ffcccc"];
    proceed [label="Proceed to step 6\nWrite spec" shape=box style=filled fillcolor="#ccffcc"];

    check -> block [label="yes"];
    check -> proceed [label="no"];
}
```

**If the developer says "just decide" or "I don't care" (interactive mode):**

- Challenge once: "This shapes the spec. Are you sure you want me to choose?"
- If they insist: log as DEVELOPER_DEFERRED, make best-guess, proceed

---

## Mode Behaviors

**Interactive Mode (default):**

- Context gathering subagent explores codebase
- Discovery subagent asks user questions one at a time (informed by context)
- Challenges vague answers, pushes for specifics
- Present discoveries for review before proceeding
- Orchestrator runs questioning loop in step 5
- Gate blocks spec if critical questions remain

**Auto Mode (--auto):**

- Context gathering runs automatically
- Subagents make autonomous decisions with confidence logging
- Log ALL decisions and assumptions in `decision-log.md`
- Flag low confidence (<90%) decisions for review
- Skip step 4 (confirmation) and step 5 (questioning)
- Continue without human input unless blocked

---

## Execution

**Start workflow by reading step 1:**

```text
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

### Discovery Rejected Multiple Times

If developer rejects discovery 3+ times:

1. Log specific complaints
2. Ask developer to describe what's wrong in their own words
3. Feed verbatim description to Discovery subagent

### Developer Refuses to Answer Questions

If developer says "skip" or "later" on a critical question:

1. Explain why this question is critical for the spec
2. If they insist: mark as UNRESOLVED_CRITICAL
3. **UNRESOLVED_CRITICAL questions block spec generation**

### Step Failure

If any step fails:

1. Log error in workflow-state.yaml
2. Set status: "failed"
3. Interactive: Present error, ask how to proceed
4. Auto: Attempt recovery once, then halt with detailed error log

---

## Artifacts

All outputs: `.claude/_agentic_output/product/specs/{topic}/{instance_id}/`

- `workflow-state.yaml`
- `decision-log.md` (auto mode)
- `context-{topic}.md`
- `discovery-{topic}.md`
- `product-decisions.md`
- `spec-{topic}.md`
