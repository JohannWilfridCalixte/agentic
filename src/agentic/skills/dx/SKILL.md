---
name: dx
description: Use when designing or refining tooling, linting, CI, hooks, repo ergonomics. Maximize verifiability and AI efficiency.
---

# Developer Experience (DX)

Design and refine tooling to maximize verifiability and AI efficiency.

## Outputs

- Global: `.{ide-folder}/{output-folder}/tech/dx/{timestamp}-{topic}.md`
- Per-story: `.{ide-folder}/{output-folder}/task/.../dx-notes.md`

## Required Structure

```yaml
Topic:
Timestamp: (ISO)
Status: Draft | Active
Owner: DX
```

| Section | Content |
|---------|---------|
| Goals | What this DX change enforces |
| Proposed tooling/policies | Lint/typecheck/test/coverage/dead-code/commit hooks/CI |
| Repo impact | Which packages/configs change |
| Quality gates | What fails CI, what runs pre-commit, what runs nightly |
| Developer workflow | Exact commands a dev/agent runs |
| Risks/trade-offs | |
| Migration plan | If introducing stricter rules incrementally |
| Verification | How we know the DX setup works |

## Rule Requirements

Every new rule must be:
1. **Enforceable automatically** - no honor system
2. **Explainable in 1-2 sentences** - if can't explain, don't add
3. **Mapped to concrete benefit** - verifiability, security, maintainability

## Guardrails

- Prefer minimal tool count
- Clear failure modes
- Run `/sync-issue` after writing
