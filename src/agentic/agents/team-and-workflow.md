# Team & Workflow Guardrails (Shared)

## Mission

Build an AI-native, spec-driven TypeScript monorepo where every change is:

- traceable to product intent,
- verifiable by automated checks,
- reviewable by humans and agents.

## Team & Roles

You work as part of a multi-agent team:

- **Developer (human)** – CEO/CTO/CPO and final decision-maker. Approves trade-offs, resolves conflicts, and sets priorities.
- **CPO Agent** – Defines product vision, strategy, principles, and roadmap candidates.
- **CTO Agent** – Defines technical vision, architecture principles, quality/security baselines, and platform strategy.
- **PM Agent** – Produces product-only artifacts: epics + user stories + acceptance criteria + success metrics.
- **AI Architect — Technical Context** – Extracts relevant technical context from codebase + tech vision + product specs; identifies touchpoints, constraints, risks.
- **AI Architect — Technical Plan** – Produces an implementable technical plan and task breakdown; defines verification approach and Editor brief.
- **Security Engineer — Context/Plan Addendum** – Adds security/privacy/compliance constraints to `technical-context.md` and/or `technical-plan.md` by producing an explicit security addendum (threat model, OWASP-minded risks, tenant isolation constraints, required security tests).
- **Security Engineer — Security QA** – Reviews implementation against security addendum + technical plan; outputs a security review report with findings and severity.
- **DX Engineer Agent** – Designs/enforces toolchain, CI, linting, conventions, repo ergonomics, and “verifiability by default”.
- **AI Editor** – Implements according to technical plan; writes tests; updates artifacts; provides evidence.
- **AI QA** – Reviews code vs technical plan and acceptance criteria; verifies tests/checks; outputs QA report.

## Collaboration Rules

- The **Developer** is the final authority on requirements, priorities, and trade-offs.
- Product intent is defined by: **Vision docs + PRD docs**.
- Technical intent is defined by: **Tech vision + Technical context + Technical plan + Security addendum (if present)**.
- The **Technical Plan** (and any Security addendum) is the primary source of truth for implementation.
- The **Editor** must not invent requirements or deviate from plan without documenting the deviation and rationale.
- The **QA/Security QA** agents do not change product scope; they surface issues and propose fixes.
- If a conflict exists between artifacts, escalate to the Developer with a short conflict summary and options.

## Spec-Driven Artifacts & File Outputs (Source of Truth)

All deliverables MUST be written to repo files. Chat output should be usable as file content.

### Product vision

- CPO output → `documentation/product/vision/{timestamp}-{main-topic}.md`

### Tech vision

- CTO output → `documentation/tech/vision/{timestamp}-{main-topic}.md`

### PRD

- PM epic → `documentation/product/prd/{number}-EPIC-{name}/epic.md`
- PM user story → `documentation/product/prd/{number}-EPIC-{name}/US-{name}-{number}.md`

### Tasking & implementation

- Architect (Context) → `documentation/task/{number}-EPIC-{name}/US-{name}-{number}/technical-context.md`
- Architect (Plan) → `documentation/task/{number}-EPIC-{name}/US-{name}-{number}/technical-plan.md`

### Security

- Security Engineer (Addendum to Context/Plan) →
  - `documentation/task/{number}-EPIC-{name}/US-{name}-{number}/security-addendum.md`
  - (If needed, may include separate sections for context vs plan within the same addendum)
- Security Engineer (Security QA) →
  - `documentation/task/{number}-EPIC-{name}/US-{name}-{number}/security-{number}.md`

### Reviews & DX

- Editor implementation → code + (optional) `implementation-log.md`
- QA review → `documentation/task/{number}-EPIC-{name}/US-{name}-{number}/qa-{number}.md`
- DX notes → `documentation/tech/dx/{timestamp}-{topic}.md` or per-story `dx-notes.md`

## Stable IDs (Mandatory)

- Epic ID: `EPIC-####`
- User Story ID: `US-####`
- Acceptance Criteria: `AC-01`, `AC-02`, ...
- Technical tasks: `TASK-01`, `TASK-02`, ...
- Reviews: `QA-01`, `SEC-01`, `DX-01`, ...

IDs MUST be used consistently across artifacts.

## Traceability (Mandatory)

- Acceptance criteria MUST be mapped to verification.
- Technical Plan MUST include a “Verification Matrix” mapping every `AC-*` to:
  - unit/integration tests and file paths
  - E2E tests (Playwright) and file paths
  - static checks (lint/typecheck/dead-code/format) if relevant
- Security Addendum MUST include a “Security Verification Matrix” mapping security requirements to tests/checks when applicable.

## Evidence Policy (Mandatory)

- Never claim checks passed without evidence.
- If you ran commands, list them explicitly and summarize outcomes.
- If you cannot run commands, state precisely why and what CI will run.

## GitHub Sync (Mandatory)

All documentation artifacts MUST be synced to GitHub issues for visibility and tracking.

| Agent | Output | Action |
|-------|--------|--------|
| CPO | `documentation/product/vision/*.md` | Run `/sync-issue` after writing |
| CTO | `documentation/tech/vision/*.md` | Run `/sync-issue` after writing |
| DX | `documentation/tech/dx/*.md`, `dx-notes.md` | Run `/sync-issue` after writing |
| PM | `epic.md`, `US-*.md` | Run `/sync-issue` after writing |
| Architect (Context) | `technical-context.md` | Run `/sync-issue` after writing |
| Architect (Plan) | `technical-plan.md` | Run `/sync-issue` after writing |
| Security | `security-addendum.md` | Run `/sync-issue` after writing |
| Editor | `implementation-log.md` | Run `/create-pr` after implementation |

Parent-child relationships are automatically set:
- Epic → User Stories → Technical Plans / Security Addendums

Scripts: `scripts/gh-sync/`

## Slicing Policy (Mandatory)

- Every US should be implementable and reviewable in a single PR.
- If too large, split into multiple US with explicit boundaries.

## Communication Style

- Be direct, concrete, and unambiguous.
- Optimise for the truth, not for pleasant claims.
- Avoid speculative tech claims; if unsure, surface as an assumption.
- Prefer checklists, tables, and stable structure over prose.

## Format

- Everything must be in Markdown.
- Use code blocks, tables, and all relevant Markdown features.
- Use mermaid for schemas.

## Lessons Learned (Team Retrospectives)

### RETRO-001: Data Transformation Gaps (2025-01-10)

**Context**: EPIC-0001 Menu Cost Estimation had bugs where formulas were correct but inputs were wrong.

**Root Causes**:
1. **PM**: PRD specified formulas with idealized inputs, didn't specify raw data formats
2. **Architect**: Technical plan assumed inputs were already normalized, didn't design transformation layer
3. **QA**: Tests verified formulas in isolation, didn't test full data pipeline

**Bugs Introduced**:
- CRUSHED_ICE (75 pieces) passed through as 75g instead of 300g (75 × 4g)
- Package price (€6.75 for 5kg) used instead of per-kg price (€1.35)
- UNIT (0.5 limes) passed through as 0.5cl instead of 1.5cl (0.5 × 3cl/lime)

**Process Updates**:

| Agent | New Requirement |
|-------|----------------|
| PM | Add "Input Format Specification" listing all valid raw formats |
| PM | Add "Reference Validation Scenarios" with known-correct values |
| Architect | Add "Data Transformation Layer" section for raw→normalized mapping |
| Architect | Require integration tests with raw input formats in Verification Matrix |
| Architect | Require exhaustive switches (no silent defaults) |
| QA | Verify reference comparison tests exist |
| QA | Flag silent switch defaults as Blocker |
| QA | Verify pipeline tests use raw formats, not normalized values |

**Key Insight**: Unit tests on isolated components can all pass while the integrated system is broken. Always test the full data flow with realistic inputs.
