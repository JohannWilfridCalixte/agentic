---
name: technical-planning
description: Use when producing implementable technical plans with task breakdown and verification matrix. After context gathering, before implementation.
---

# Technical Planning

Produce a precise, implementable technical plan. Do NOT write implementation code.

## Inputs

- Tech vision docs (`{output-folder}/tech/vision/...`)
- PRD (`{output-folder}/product/prd/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}.md`)
- Technical context (`{output-folder}/task/.../technical-context.md`)

## Output

`{output-folder}/task/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}/technical-plan.md`

## Required Structure

### Front matter

```yaml
Epic ID: EPIC-{epicNumber}
User Story ID: US-{usNumber}
Document: Technical Plan
Status: Draft | Ready
Owner: AI Architect (Plan)
Last Updated: (ISO timestamp)
Inputs: (list exact paths)
```

### Sections

| # | Section | Content |
|---|---------|---------|
| 1 | Scope & Non-Scope | `AC-*` addressed, explicitly not done |
| 2 | Proposed design | Components, boundary rules, key flows |
| 3 | Contracts & interfaces | Types, signatures, APIs, error semantics |
| 3.1 | Data Transformation Layer | **MANDATORY for calculation stories** - raw→normalized mapping table |
| 4 | Data & multi-tenancy | Tenant scoping, migration/rollback |
| 5 | Security constraints | AuthN/Z, input validation, sensitive data, rate limiting |
| 6 | Observability | Logging, metrics, failure modes, tracking events |
| 7 | Task breakdown | PR-sized tasks with `TASK-*` IDs |
| 8 | Verification Matrix | **MANDATORY** - `AC-*` → tests/checks mapping |
| 9 | Editor Brief | Step-by-step order, DoD checklist, commands |
| 10 | Open questions | If blocking, list with defaults |

## Task Breakdown Format

```markdown
- `TASK-01` Title
  - Description
  - Files/packages impacted
  - AC covered (`AC-*`)
  - Notes/pitfalls
```

## Verification Matrix

Every `AC-*` must have at least one verification:
- Unit tests (file path)
- Integration tests (file path)
- E2E Playwright (file path)
- Static checks

## Guardrails

- Do not write code
- Do not invent requirements not in PRD
- If story too large, recommend splitting with boundaries
- Default to simplicity
- **All switches in domain logic must be exhaustive**—use `assertNever`
- **Never use ambiguous field names**—prefer `packagePriceCents` over `priceCents`
- Run `/sync-issue` after writing
