---
name: agentic:skill:gather-technical-context
description: Use when extracting technical context from codebase + vision docs before planning implementation. Identifies touchpoints, constraints, risks.
---

# Gather Technical Context

Extract actionable technical context from tech vision docs, product PRD, and codebase. Do NOT write implementation code.

## Inputs

- Tech vision docs (`.claude/_agentic_output/tech/vision/...`)
- Product PRD (`.claude/_agentic_output/product/prd/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}.md`)
- Codebase (when available)

## Output

`.claude/_agentic_output/task/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}/technical-context.md`

## Required Structure

### Front matter

```yaml
Epic ID: EPIC-{epicNumber}
User Story ID: US-{usNumber}
Document: Technical Context
Status: Draft | Ready
Owner: AI Architect (Context)
Last Updated: (ISO timestamp)
Inputs: (list exact paths consumed)
```

### Sections

| # | Section | Content |
|---|---------|---------|
| 1 | Summary of product intent | Bullet summary referencing `AC-*` |
| 2 | Relevant tech-vision constraints | List with refs to vision doc path + heading |
| 3 | Codebase touchpoints | Packages/modules/files impacted, patterns to follow, "do not touch" areas |
| 4 | Domain & data implications | Multi-tenancy, PII/secrets, GDPR lifecycle |
| 5 | Non-functional expectations | Observability, performance |
| 6 | Risks & mitigations | Security (OWASP), DX (tests, complexity), Operational (deploy/rollback) |
| 7 | Assumptions | Explicit assumptions plan will rely on |
| 8 | Open questions | Only blockers, keep concise |
| 9 | Notes for Technical Plan | Guidance about pitfalls and focus areas |
| 10 | Sources | External references (if used) |

## Guardrails

- Be conservative: if info missing, list assumptions + open questions
- Do not propose full solutions—just context and constraints
- Keep implementation-adjacent, not pseudo-code
- Run `/sync-issue` after writing
