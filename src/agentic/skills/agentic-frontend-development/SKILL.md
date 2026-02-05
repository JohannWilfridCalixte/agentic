---
name: agentic:frontend-development
description: Use when building frontend features from idea to implementation. Systematic workflow through UI/UX design, visual decisions, then implementation. For new UI components, pages, or features.
argument-hint: "[feature description | design spec | URL]"
---

# /agentic:frontend-development - Frontend Development Workflow

**Usage:** `/agentic:frontend-development [<input>]`

Systematic frontend development from idea to implementation. No user interaction - all decisions logged.

## Arguments

- `description`: Feature or component to build
- `path/to/spec.md`: Existing product spec
- `https://figma.com/...` or similar: Design reference URL
- No args: Error - input required

## The Iron Laws

```
1. DESIGN BEFORE CODE - NO EXCEPTIONS
2. VISUAL DECISIONS DOCUMENTED BEFORE IMPLEMENTATION
3. UX PATTERNS DEFINED BEFORE INTERACTION CODE
```

If design decisions aren't documented, you cannot write code. Guessing designs is failure.

## Red Flags - STOP

If you catch yourself thinking:
- "I'll figure out the styling later"
- "Let me just get it working first"
- "The design can be adjusted after"
- "I'll pick colors as I go"

**STOP. Return to design phase.**

## Agent References

Each subagent reads instructions from `.{ide-folder}/agents/{agent}.md`.

Invoke: `Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="You are the {Agent} agent. {ide-invoke-prefix}{ide-folder}/agents/{agent}.md for your full instructions. ...")`

Available agents: `ui-ux-designer`, `frontend-developer`, `qa`

## Mandatory Delegation

**You MUST delegate all agent work using the Task tool. NEVER do agent work inline.**

You are the orchestrator. You classify input, manage state, validate outputs, and delegate.

---

## Workflow Steps

Execute each step by reading its detailed instructions.

### Step 1: Input Classification & Initialization

**Read:** `steps/step-01-input-classification.md`

- Parse input source (description, spec file, design URL)
- Generate session ID and create working directory
- Initialize `workflow-state.yaml`, `decision-log.md`

### Step 2: UI/UX Design

**Read:** `steps/step-02-ui-ux-design.md`

- Delegate to UI/UX Designer subagent via Task tool
- Document visual decisions: colors, typography, spacing, components
- Output: `design-decisions.md`
- Validate: all visual specs documented

### Step 3: UX Adjustment

**Read:** `steps/step-03-ux-adjustment.md`

- Delegate to UI/UX Designer subagent via Task tool
- Refine interaction patterns, error states, loading states
- Output: amended `design-decisions.md`
- Validate: all UX patterns documented

### Step 4: Implementation

**Read:** `steps/step-04-implementation.md`

- Delegate to Frontend Developer subagent via Task tool
- Implement following design-decisions.md exactly
- Output: `implementation-log.md`
- Verify design compliance

### Step 5: QA Review

**Read:** `steps/step-05-qa-review.md`

- Delegate to QA subagent via Task tool
- Verify implementation matches design decisions
- Output: `qa-review.md`
- Loop if issues found (max 3 iterations)

---

## Decision Logging

All autonomous decisions logged in `decision-log.md`:
- Context, evidence, chosen action
- Confidence score
- Open questions

**Format:**
```markdown
### DEC-{N}: {Decision Title}

**Step**: {step-name}
**Agent**: {agent}
**Timestamp**: {ISO}

**Context**: {why this decision was needed}

**Options Considered**:
- {option 1}: {pros/cons}
- {option 2}: {pros/cons}

**Decision**: {what was decided}

**Confidence**: {%}

**Reversibility**: Easy | Medium | Hard
```

---

## Escalation

Workflow escalates (requires human) when:
- Design reference is ambiguous
- 3 QA iterations without resolution
- Conflicting requirements

Create `{session_path}/escalation.md` with:
- Summary of what was tried
- Design decisions made
- Unresolved issues
- Recommendation for human review

---

## Artifacts

All outputs: `.{ide-folder}/{output-folder}/frontend/{session_id}/`

| Artifact | Purpose |
|----------|---------|
| `workflow-state.yaml` | Execution state |
| `decision-log.md` | All autonomous decisions |
| `design-decisions.md` | Visual specs + UX patterns |
| `implementation-log.md` | Code changes |
| `qa-review.md` | QA findings |
| `escalation.md` | If escalated |
