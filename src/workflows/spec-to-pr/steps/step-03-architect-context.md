# Step 3: Architect Context

## EXECUTION RULES

- 🎯 Invoke Architect agent to gather technical context
- 📋 Architect decides all technical context questions
- 🚫 Orchestrator does NOT make technical decisions
- ✅ Output: `technical-context.md`

---

## AGENT HANDOFF

**Load Architect Context Agent:**
```
@.claude/agents/architect.md
```

**Provide context:**
- `spec.md` - product requirements to contextualize
- `workflow_mode` - interactive or auto
- Codebase access for exploration

---

## ARCHITECT CONTEXT TASK

### Codebase Analysis

Explore codebase to identify:
1. **Relevant existing code** - modules, services, utilities to reuse or extend
2. **Patterns in use** - architecture style, error handling, naming conventions
3. **Dependencies** - libraries, frameworks, external services
4. **Constraints** - technical debt, limitations, performance requirements

### Context Document Sections

**Required output in `technical-context.md`:**

```markdown
---
Epic ID: {epic_id}
Story ID: {story_id}
Document: Technical Context
Status: Draft
Owner: Architect
Created: {ISO_timestamp}
---

# Technical Context - {story_id}

## Summary
{2-3 sentence summary of technical landscape for this story}

## Tech Vision Constraints
{Relevant constraints from tech vision docs, if any}

## Codebase Touchpoints

### Existing Code to Leverage
| Component | Path | Purpose | Integration Notes |
|-----------|------|---------|-------------------|
| {name} | `{path}` | {what it does} | {how to use it} |

### Code to Modify
| Component | Path | Change Needed |
|-----------|------|---------------|
| {name} | `{path}` | {what changes} |

### New Code Required
| Component | Suggested Path | Purpose |
|-----------|----------------|---------|
| {name} | `{path}` | {what it does} |

## Domain Implications
{Business logic considerations, domain rules to respect}

## Non-Functional Expectations
- **Performance**: {expectations}
- **Scalability**: {expectations}
- **Reliability**: {expectations}

## Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {impact} | {mitigation} |

## Assumptions
{Technical assumptions being made}

## Open Questions
{Unresolved technical questions}
```

### Auto Mode Decisions

**When technical context requires decisions:**

```markdown
### DEC-{N}: {Technical context decision}

**Step**: architect-context
**Agent**: Architect
**Timestamp**: {ISO}

**Context**:
{What technical question arose during context gathering}

**Options Considered**:
1. {Option A with technical trade-offs}
2. {Option B with technical trade-offs}

**Decision**: {Chosen approach}

**Confidence**: {X}%

**Rationale**:
{Technical reasoning}

**Trade-offs Accepted**:
- {Technical trade-off}

**Reversibility**: {Easy | Medium | Hard}
```

---

## STEP COMPLETION

**Write to:** `{story_path}/technical-context.md`

**Update workflow-state.yaml:**
```yaml
artifacts:
  technical_context: "{story_path}/technical-context.md"

steps_completed:
  - step: 3
    name: "architect-context"
    completed_at: {ISO_timestamp}
    output: "{story_path}/technical-context.md"

current_step: 4
```

**Output:**
```
✅ Technical context gathered

📄 Context: {story_path}/technical-context.md
🔍 Touchpoints identified: {count}
⚠️ Risks identified: {count}
❓ Open questions: {count}
```

---

## NEXT STEP

**Interactive:** Wait for [C] selection
**Auto:** Immediately load `step-04-security-context.md`
