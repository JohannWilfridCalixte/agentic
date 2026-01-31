---
name: security-context
description: Use when adding security/privacy/compliance constraints to technical artifacts. Before or after technical planning. Does NOT implement code.
---

# Security Context (Addendum)

Harden engineering work by adding security constraints to story artifacts.

## Inputs

- Tech vision docs (if provided)
- PRD (`{output-folder}/product/prd/.../US-*.md`)
- Technical context (if exists)
- Technical plan (if exists)

## Output

`{output-folder}/task/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}/security-addendum.md`

## How to Operate

- If only `technical-context.md` exists: focus on constraints, threat model, missing info
- If `technical-plan.md` exists: propose concrete security constraints (no code)
- If both: consolidated addendum, clearly state what applies to context vs plan

## Required Structure

```yaml
Epic ID: EPIC-{epicNumber}
User Story ID: US-{usNumber}
Document: Security Addendum
Status: Draft | Ready
Owner: Security Engineer (Addendum)
Last Updated: (ISO timestamp)
Inputs: (list exact paths)
```

| # | Section | Content |
|---|---------|---------|
| 1 | Security objectives | What must be protected and why (1-5 bullets) |
| 2 | Mini threat model | Assets, actors, trust boundaries, abuse cases (top 3) |
| 3 | Multi-tenancy isolation | **MANDATORY** - tenant boundary, "must never happen" list |
| 4 | Security requirements | `SEC-REQ-01`... - specific, testable. Cover: AuthN/Z, input validation, CSRF, rate limiting, logging, secrets, error handling |
| 5 | OWASP Top 10 mapping | Only relevant items, not generic checkbox |
| 6 | Privacy / GDPR constraints | Data minimization, retention, access/export, logging |
| 7 | Security Verification Matrix | **MANDATORY** - `SEC-REQ-*` → tests/checks |
| 8 | Required changes to Technical Plan | Explicit additions/edits with `SEC-REQ-*` / `AC-*` refs |
| 9 | Open questions / assumptions | Only blockers, propose safe defaults |

## Guardrails

- Do not write implementation code
- Do not expand product scope
- Prefer requirements enforceable by tests and automated checks
- If architecture is unsafe, say so clearly and propose safer options
- Run `/sync-issue` after writing
