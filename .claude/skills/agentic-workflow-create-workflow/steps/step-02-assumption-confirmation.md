# Step 2: Assumption Confirmation

## EXECUTION RULES

- Confirm each assumption from step 1 one at a time
- Resolve each open question one at a time
- Use `AskUserQuestion` tool for all interactions
- Never batch multiple assumptions or questions in a single ask
- Log confirmed/modified answers
- Do not proceed until all assumptions are addressed and all open questions resolved
- Output: updated `qualified-input.md`

---

## SEQUENCE

### 2.1 Load Qualified Input

Read `{output_path}/qualified-input.md` from step 1.
Extract the list of assumptions and open questions.

### 2.2 Confirm Assumptions (One at a Time)

For each assumption (A1, A2, A3...):

**Use `AskUserQuestion` with this pattern:**

```
Question: "I assumed {assumption}. Is this correct?"
Options:
  - "Yes, correct" — confirms as-is
  - "No, change to..." — user provides correction
  - "Remove this assumption" — assumption was wrong
```

**After each answer:**
- If confirmed: mark assumption as CONFIRMED
- If modified: update assumption text, mark as MODIFIED
- If removed: mark as REMOVED

**Update `qualified-input.md`** with the result after each assumption:

```markdown
### A{n}: {Brief Title} [CONFIRMED | MODIFIED | REMOVED]
**Dimension**: {dimension}
**Original**: {original assumption}
**Final**: {confirmed or modified value}
```

**Update workflow-state.yaml:**
```yaml
assumptions_confirmed: {incremented count}
```

### 2.3 Resolve Open Questions (One at a Time)

For each open question (Q1, Q2, Q3...):

**Use `AskUserQuestion` with this pattern:**

```
Question: "{question text}"
Options:
  - {suggested option 1} — {description}
  - {suggested option 2} — {description}
  - {suggested option 3} — {description if applicable}
```

**After each answer:**
- Log the answer
- Convert the answer into a confirmed fact

**Update `qualified-input.md`** with the resolution:

```markdown
### Q{n}: {Question} [RESOLVED]
**Dimension**: {dimension}
**Answer**: {user's answer}
**Decision**: {what this means for the workflow design}
```

**Update workflow-state.yaml:**
```yaml
open_questions_resolved: {incremented count}
```

### 2.4 Ask About Workflow Mode

If mode was not already determined through assumptions/questions:

```
Question: "Should the created workflow be interactive or autonomous?"
Options:
  - "Interactive" — Workflow asks user questions at key decision points via AskUserQuestion
  - "Autonomous" — Workflow makes decisions independently, logs them with confidence scores
  - "Both (switchable)" — Supports --auto flag like product-spec workflow
```

**Update workflow-state.yaml:**
```yaml
created_workflow:
  mode: "{interactive | autonomous | switchable}"
```

### 2.5 Ask About Subagents

Present the available agentic subagents:

```
Question: "Which subagents should this workflow use?"
MultiSelect: true
Options:
  - "architect" — Gathers technical context, architecture decisions
  - "software-engineer" — Code implementation
  - "test-engineer" — Test writing
  - "qa" — Code quality review
  (plus any others relevant based on the workflow purpose)
```

**If user selects "None":** The workflow will be orchestrator-only (no delegation).

**Update workflow-state.yaml:**
```yaml
created_workflow:
  agents: [{selected agents}]
```

### 2.6 Ask About Skills

Based on the workflow purpose and selected agents, suggest relevant skills:

```
Question: "Which skills should be loaded for this workflow?"
MultiSelect: true
Options:
  - {skill 1} — {description}
  - {skill 2} — {description}
  - {skill 3} — {description}
```

**Update workflow-state.yaml:**
```yaml
created_workflow:
  skills: [{selected skills}]
```

### 2.7 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 2
    name: "assumption-confirmation"
    completed_at: {ISO_timestamp}

current_step: 3
updated_at: {ISO_timestamp}
```

**Output to user:**
```
All assumptions confirmed and questions resolved.

Confirmed: {count}
Modified: {count}
Removed: {count}
Questions resolved: {count}

Compiling full context for your review...
```

---

## NEXT STEP

Load and execute: `step-03-context-confirmation.md`
