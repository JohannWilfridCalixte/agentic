# Step 5: Architect Plan

## EXECUTION RULES

- 🎯 Invoke Architect agent to create implementation plan
- 📋 Architect decides all technical approach questions
- 🚫 Plan must address ALL acceptance criteria
- ✅ Output: `technical-plan.md` with task breakdown

---

## AGENT HANDOFF

**Load Architect Plan Agent:**
```
@.claude/agents/architect.md
```

**Provide context:**
- `spec.md` - acceptance criteria to implement
- `technical-context.md` - codebase context
- `security-addendum.md` - security requirements to satisfy
- `workflow_mode` - interactive or auto

---

## ARCHITECT PLAN TASK

### Plan Requirements

The technical plan must:
1. Cover ALL acceptance criteria (AC-01, AC-02, ...)
2. Address ALL security requirements (SEC-REQ-01, ...)
3. Include Data Transformation Layer (RETRO-001)
4. Break down into PR-sized tasks (TASK-01, ...)
5. Include Verification Matrix (AC → test)

### Plan Document Sections

**Required output in `technical-plan.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Technical Plan
Status: Draft
Owner: Architect
Created: {ISO_timestamp}
---

# Technical Plan - {story_id}

## Summary
{2-3 sentence summary of implementation approach}

## Scope

### In Scope
- {What this plan covers}

### Out of Scope
- {What's explicitly excluded}

## Proposed Design

### Architecture Overview
{High-level design, can include diagram}

### Component Design
| Component | Responsibility | Interface |
|-----------|----------------|-----------|
| {name} | {what it does} | {how to interact} |

### Data Flow
{Description or diagram of data flow}

## Contracts & Interfaces

### API Contracts
{New or modified APIs}

### Internal Interfaces
{Key internal interfaces}

## Data Transformation Layer (RETRO-001)

> MANDATORY for stories involving calculations or data processing.

### Input Formats
| Field | Raw Format | Source | Transformation |
|-------|------------|--------|----------------|
| {field} | {raw} | {source} | {how to normalize} |

### Transformation Rules
| Rule | Input | Output | Edge Cases |
|------|-------|--------|------------|
| {rule} | {input} | {output} | {edges} |

### Reference Scenarios
| Scenario | Raw Input | Expected Output | Notes |
|----------|-----------|-----------------|-------|
| {name} | {raw} | {expected} | {notes} |

## Data & Multi-Tenancy

### Data Model Changes
{Schema changes, if any}

### Tenant Isolation
{How tenant isolation is maintained}

## Security Implementation

| SEC-REQ | Implementation Approach |
|---------|------------------------|
| SEC-REQ-01 | {how it's implemented} |

## Observability

### Logging
| Event | Log Level | Fields |
|-------|-----------|--------|
| {event} | {level} | {fields} |

### Metrics
| Metric | Type | Labels |
|--------|------|--------|
| {metric} | {counter/gauge/histogram} | {labels} |

### Tracing
| Span | Parent | Attributes |
|------|--------|------------|
| {span} | {parent} | {attributes} |

## Task Breakdown

### TASK-01: {Task title}
**Covers**: AC-01, SEC-REQ-01
**Description**: {What to implement}
**Files**:
- Create: `{path}`
- Modify: `{path}`
**Tests**: {What tests to write}
**Done when**: {Completion criteria}

### TASK-02: {Task title}
...

## Verification Matrix

| AC/SEC-REQ | Task | Test Type | Test Location | Verification Method |
|------------|------|-----------|---------------|---------------------|
| AC-01 | TASK-01 | unit | `src/.../test.ts` | {method} |
| AC-02 | TASK-02 | integration | `tests/...` | {method} |
| SEC-REQ-01 | TASK-01 | unit | `src/.../test.ts` | {method} |

## Editor Brief

> Summary for the Editor agent.

**Key Points:**
1. {Most important thing to know}
2. {Second most important}
3. {Third most important}

**Watch Out For:**
- {Common pitfall 1}
- {Common pitfall 2}

**Suggested Order:**
TASK-01 → TASK-02 → TASK-03 → ...

## Open Questions
{Unresolved questions, if any}

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {impact} | {mitigation} |
```

### Auto Mode Decisions

**Technical planning decisions:**
- Approach selection (multiple valid patterns)
- Task granularity
- Technology choices within constraints

Log with Architect attribution and technical rationale.

---

## QUALITY GATES

Before completing, verify:
- [ ] Every AC-## mapped to at least one TASK
- [ ] Every SEC-REQ-## addressed in implementation approach
- [ ] Data Transformation Layer present (if calculations involved)
- [ ] Verification Matrix complete
- [ ] Editor Brief provides actionable guidance
- [ ] Tasks are PR-sized (not too big)

---

## STEP COMPLETION

**Write to:** `{story_path}/technical-plan.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  technical_plan: "{story_path}/technical-plan.md"

steps_completed:
  - step: 5
    name: "architect-plan"
    completed_at: {ISO_timestamp}
    output: "{story_path}/technical-plan.md"

current_step: 6
```

---

## NEXT STEP

Load `step-06-editor-implement.md`
