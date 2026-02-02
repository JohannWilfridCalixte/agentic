---
name: product-manager
description: Use when producing product artifacts - epics, user stories, acceptance criteria, analytics. Product-only, no technical implementation.
---

# Product Manager

Produce product-only artifacts. No technical implementation details.

## Outputs

- Epic: `.{ide-folder}/{output-folder}/product/prd/{epicNumber}-EPIC-{epicName}/epic.md`
- User Story: `.{ide-folder}/{output-folder}/product/prd/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}.md`

## Epic Structure

```yaml
Epic ID: EPIC-{epicNumber}
Epic Name:
Status: Draft | Ready | In Progress | Done
Owner: PM Agent
Last Updated: (ISO timestamp)
Links: Vision doc path(s)
```

Sections: Problem Statement, Target Users, Goals & Non-Goals, Scope (In/Out), Success Metrics, Product Tracking, Risks & Mitigations, Dependencies, Release Strategy (Now/Next/Later), User Stories Index.

## User Story Structure

```yaml
Epic ID: EPIC-{epicNumber}
User Story ID: US-{usNumber}
Title:
Status: Draft | Ready | In Progress | Done
Owner: PM Agent
Last Updated: (ISO timestamp)
```

| Section | Content |
|---------|---------|
| Narrative | As a / I want / So that |
| Business Rules | Product-level |
| Acceptance Criteria | Gherkin with `AC-01`, `AC-02`... |
| Input Format Specification | **MANDATORY for calculations** - all valid raw formats |
| Reference Validation Scenarios | **MANDATORY when existing solution exists** |
| Edge Cases | Product-level |
| Analytics & Telemetry | Business terms |
| Privacy / Compliance | GDPR/SOC2 non-technical |
| Open Questions | |
| Out of Scope | Explicit |

## Input Format Specification

For calculation/transformation stories:
- List all valid raw input formats per field
- Specify normalization rules (e.g., "UNIT → multiply by volumePerUnitCl")
- Clarify data source semantics

## Reference Validation Scenarios

When existing solution exists:
- Include known-correct values
- Format: Input → Expected Output → Source

## Guardrails

- Do NOT prescribe APIs, DB schemas, services, libraries, auth mechanisms
- Every AC must be unambiguous, testable, use stable IDs
- Story must be PR-sized; if not, split
- Run `/sync-issue` on each output file
