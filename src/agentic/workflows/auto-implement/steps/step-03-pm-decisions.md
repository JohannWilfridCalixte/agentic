# Step 3: PM Autonomous Decisions

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT make product decisions yourself.**

The PM subagent will analyze the input idea, technical context, and functional understanding to make all product decisions autonomously. It fills gaps in the rough idea, defines scope, and produces acceptance criteria.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-pm.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning product decisions.'

# TASK: Autonomous Product Decisions

This is an AUTONOMOUS workflow. Do NOT ask the user any questions. You must make all product decisions yourself and document every assumption.

## Inputs

Read these files in order:
1. {output_path}/input-idea.md — the developer's rough idea
2. {output_path}/technical-context.md — what the codebase looks like
3. {output_path}/functional-understanding.md — how existing features work

## Your Job

The developer gave a rough, imperfect prompt. Your job is to:

1. **Fill every gap** — identify what's missing from the idea and make decisions
2. **Define scope** — what's in, what's out
3. **Write acceptance criteria** — testable AC in Gherkin format (AC-01, AC-02, ...)
4. **Document assumptions** — every gap you fill is an assumption to log
5. **Flag risks** — product risks the developer should review

## Output

Write to: {output_path}/product-decisions.md

```markdown
# Product Decisions - {topic}

## Interpreted Intent

{2-3 sentences: what you believe the developer wants to achieve}

## Assumptions Made

| # | Assumption | Confidence | Rationale |
|---|-----------|------------|-----------|
| 1 | {assumption} | {%} | {why} |

## Scope

### In Scope
- {feature 1}
- {feature 2}

### Out of Scope
- {explicitly excluded 1}
- {explicitly excluded 2}

## User Story

As a {user type},
I want {capability},
So that {benefit}.

## Acceptance Criteria

### AC-01: {title}
**Given** {precondition}
**When** {action}
**Then** {expected result}

### AC-02: {title}
...

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| {edge case} | {behavior} |

## Product Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {impact} | {suggestion} |

## Open Questions
{Questions that couldn't be answered — flagged for developer review}
```

## Decision Logging

For every assumption or product decision, append to: {output_path}/decision-log.md

Use the format:
### DEC-{number}: {Brief Title}
**Step**: pm-decisions
**Agent**: PM
**Timestamp**: {ISO}
**Context**: {what question or gap arose}
**Options Considered**: {list}
**Decision**: {chosen}
**Confidence**: {%}
**Rationale**: {why}
**Trade-offs**: {what was sacrificed}
**Reversibility**: {Easy | Medium | Hard}

IMPORTANT: Number decisions sequentially from where the Architect left off. Read decision-log.md first to find the last DEC number.

If confidence < 90%, log as LOW_CONFIDENCE and add to Open Questions.

## Quality Gates

Before finishing, verify:
- [ ] At least 2 acceptance criteria with stable IDs (AC-01, AC-02, ...)
- [ ] Each AC is testable (Given/When/Then)
- [ ] Scope boundaries are explicit (in/out)
- [ ] Every assumption is logged with confidence
- [ ] All decisions appended to decision-log.md
")
```

### Inputs to provide

- `input-idea.md` - original idea
- `technical-context.md` - codebase analysis
- `functional-understanding.md` - behavior synthesis
- `decision-log.md` - append decisions here

### Validate output

After subagent completes, verify:
- `{output_path}/product-decisions.md` exists and is non-empty
- Contains Acceptance Criteria section with at least AC-01
- Contains Scope section with In/Out boundaries
- Decision log has new entries from PM

**If validation fails:**
- Re-run subagent with specific guidance about what's missing
- If second attempt fails, create minimal product-decisions.md from the input idea with conservative scope

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  product_decisions: "{output_path}/product-decisions.md"

steps_completed:
  - step: 3
    name: "pm-decisions"
    completed_at: {ISO_timestamp}
    output: "{output_path}/product-decisions.md"

current_step: 4
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Product decisions complete.

Scope: {brief in-scope summary}
Acceptance criteria: {count} ACs defined
Assumptions: {count} logged

Generating technical plan...
```

---

## NEXT STEP

Load `step-04-technical-planning.md`
