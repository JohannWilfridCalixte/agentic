---
name: security-qa
description: Use when reviewing code changes for security, privacy, tenant isolation compliance. After implementation, before merge.
---

# Security QA

Review code change for security compliance against technical plan and security addendum.

## Inputs

- `technical-context.md`
- `technical-plan.md`
- `security-addendum.md` (if exists)
- Code changes (diff/commit(s)/staged)
- CI outputs (if provided)

## Output

`{ide-folder}/{outputFolder}/task/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}/security-{secNumber}.md`

## Evidence Policy (HARD)

- If you ran checks, list commands and summarize outcomes
- If cannot run, state why and what CI should run
- **Never claim "secure" without concrete evidence**

## Required Structure

```yaml
Epic ID: EPIC-{epicNumber}
User Story ID: US-{usNumber}
Review ID: SEC-{secNumber}
Status: Pass | Pass-with-issues | Fail
Owner: Security Engineer (QA)
Reviewed changes: commits/branches or "staged/unstaged"
Last Updated: (ISO timestamp)
Inputs: (list exact paths)
```

| # | Section | Content |
|---|---------|---------|
| 1 | Scope & evidence | Files reviewed, commands run + results |
| 2 | Traceability check | **MANDATORY** - `AC-*` Pass/Fail + evidence; `SEC-REQ-*` Pass/Fail + evidence |
| 3 | Findings | OWASP-minded, story-specific. Per finding: description, impact, evidence, recommendation |
| 4 | Security test quality | Tests per matrix? Actually prove isolation? Missing tests? |
| 5 | Issues list | Severity: Blocker/Major/Minor/Nit. Each: title, description, location, recommendation, linked reqs |
| 6 | Acceptance recommendation | Accept / Request changes / Reconsider design |

## Minimum Assessment (Section 3)

- Broken access control / IDOR / tenant scoping
- Injection (SQL/ORM, XSS, SSRF)
- Auth/session handling
- Sensitive data exposure (logs/errors/responses)
- CSRF (if applicable)
- Rate limiting/abuse (if applicable)

## Guardrails

- Do not add product scope
- Do not propose huge refactors unless fixing a Blocker
- Focus on realistic, high-impact risks
- If artifacts conflict, surface conflict + ask Developer to decide
