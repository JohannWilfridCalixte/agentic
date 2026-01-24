# Step 2: PM Spec

## EXECUTION RULES

- 🎯 Invoke PM agent to create/refine product specification
- 📋 PM decides all product-related questions
- 🚫 Orchestrator does NOT make product decisions
- ✅ Output: `spec.md` with acceptance criteria

---

## AGENT HANDOFF

**Claude Code (Subagent):**
```
Task(subagent_type="pm", prompt="Create product specification.
Workflow mode: {workflow_mode}
Epic ID: {epic_id}
Story ID: {story_id}
Raw input: {raw_input}
Output to: {story_path}/spec.md")
```

**Cursor (Inline Agent):**
```
@.claude/agents/pm.md
```

**Context to provide:**
- `workflow_mode`: {from state}
- `raw_input`: {from step 1, if available}
- `epic_id`: {from state}
- `story_id`: {from state}

---

## PM AGENT INSTRUCTIONS

### Input Processing

**If raw_input exists (from file or GitHub issue):**
- Analyze the provided input
- Identify: problem statement, user needs, constraints
- Determine if input is complete spec or needs refinement

**If no raw_input (user mode):**
- Prompt user for product idea/requirement
- Use discovery questions to understand scope

### Spec Creation

**Interactive Mode:**
```
I'll help you create a complete product specification.

Let's start with the core problem:
1. What problem are we solving?
2. Who experiences this problem?
3. What does success look like?

(Continue with discovery questions until spec is complete)
```

**Auto Mode:**
- Analyze `raw_input` for completeness
- Fill gaps with reasonable assumptions
- **LOG EACH ASSUMPTION** as a decision:

```markdown
### DEC-{N}: {Gap being filled}

**Step**: pm-spec
**Agent**: PM
**Timestamp**: {ISO}

**Context**:
{What information was missing from input}

**Options Considered**:
1. {Assumption A}
2. {Assumption B}
3. Ask user for clarification (not available in auto mode)

**Decision**: {Chosen assumption}

**Confidence**: {X}%

**Rationale**:
{Why this assumption is reasonable}

**Trade-offs Accepted**:
- May not match user's actual intent
- {Other trade-offs}

**Reversibility**: Easy (spec can be updated)
```

### Required Spec Sections

The output `spec.md` MUST contain:

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Product Specification
Status: Draft
Owner: PM
Created: {ISO_timestamp}
---

# {Story Title}

## Problem Statement
{Clear description of the problem being solved}

## User Story
As a {user type},
I want {capability},
So that {benefit}.

## Acceptance Criteria

### AC-01: {Criterion title}
**Given** {precondition}
**When** {action}
**Then** {expected result}

### AC-02: {Criterion title}
...

## Scope

### In Scope
- {Feature/capability 1}
- {Feature/capability 2}

### Out of Scope
- {Explicitly excluded item 1}
- {Explicitly excluded item 2}

## Input Format Specification

> Per RETRO-001: Specify exact input formats to prevent data transformation bugs.

| Field | Source | Raw Format | Expected Normalized Format |
|-------|--------|------------|---------------------------|
| {field} | {source} | {raw} | {normalized} |

## Reference Validation Scenarios

> Per RETRO-001: Provide known-correct input/output pairs for validation.

| Scenario | Input | Expected Output | Notes |
|----------|-------|-----------------|-------|
| {name} | {input} | {output} | {notes} |

## Open Questions

{Any unresolved questions - empty if none}

## Dependencies

- {Dependency 1}
- {Dependency 2}
```

### Quality Gates

Before completing, verify:
- [ ] Problem statement is clear and specific
- [ ] User story follows standard format
- [ ] At least 2 acceptance criteria defined
- [ ] Each AC has unique stable ID (AC-01, AC-02, ...)
- [ ] Scope boundaries are explicit
- [ ] Input formats specified (RETRO-001)
- [ ] At least 1 reference validation scenario

---

## STEP COMPLETION

### Update Artifacts

**Write `spec.md` to:** `{story_path}/spec.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  spec: "{story_path}/spec.md"

steps_completed:
  - step: 1
    name: "input-detection"
    completed_at: {previous}
  - step: 2
    name: "pm-spec"
    completed_at: {ISO_timestamp}
    output: "{story_path}/spec.md"

current_step: 3
updated_at: {ISO_timestamp}
```

### Output to User

*Interactive mode:*
```
✅ Product spec created

📄 Spec: {story_path}/spec.md
📝 Acceptance Criteria: {count} defined
❓ Open Questions: {count}

Please review the spec. When ready, I'll proceed to technical context analysis.

[C] Continue to Architect Context
[E] Edit spec
[Q] Show open questions
```
Wait for user selection.

*Auto mode:*
```
✅ Product spec created

📄 Spec: {story_path}/spec.md
📝 Acceptance Criteria: {count} defined
🤖 Decisions made: {count} (see decision-log.md)

Proceeding to technical context analysis...
```
Continue automatically.

---

## NEXT STEP

**Interactive:** Wait for [C] selection, then load `step-03-architect-context.md`
**Auto:** Immediately load `step-03-architect-context.md`
