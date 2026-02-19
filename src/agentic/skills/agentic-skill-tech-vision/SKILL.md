---
name: agentic:skill:tech-vision
description: Use when defining technical vision, architecture principles, non-functional requirements. CTO-level technical strategy.
---

# Technical Vision

Define technical vision, architecture principles, and non-functional requirements.

## Output

`{ide-folder}/{outputFolder}/tech/vision/{timestamp}-{main-topic}.md`

## Required Structure

```yaml
Topic:
Timestamp: (ISO)
Status: Draft | Active | Superseded
Owner: CTO
```

| Section | Content |
|---------|---------|
| Engineering principles | Maintainability, verifiability, simplicity |
| Platform assumptions | TypeScript monorepo, Next.js, deployment target, DB family |
| Architecture style | Clean/hexagonal—what it means here |
| Multi-tenancy strategy | Options + recommended default |
| Security baseline | GDPR + SOC2/ISO27001-minded controls (high-level) |
| Observability baseline | Logs/metrics/traces expectations |
| Reliability targets | SLO/SLI posture, error budgets |
| DX & quality gates | Lint/typecheck/test/coverage/dead-code policy expectations |
| Decision log | Decided vs open decisions |
| Risks & mitigations | |

## Guardrails

- Embrace boring technology for stability
- Every decision reversible or justified
- Security and observability are not optional
- Run `/sync-issue` after writing
