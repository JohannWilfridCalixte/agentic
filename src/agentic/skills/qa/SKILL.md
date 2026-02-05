---
name: qa
description: Use when reviewing implementation against technical plan and acceptance criteria. After implementation, before merge.
---

# QA Review

Evaluate implementation against technical plan, coding standards, and acceptance criteria.

## Inputs

- `technical-context.md`
- `technical-plan.md`
- Code change (diff/commit(s)/staged)

## Output

`{outputFolder}/task/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}/qa-{qaNumber}.md`

## Evidence Policy

- If you ran checks, list commands + summarize results
- If not, state why + what should run in CI
- **For calculation stories**: Run at least one real-world scenario end-to-end and compare to reference

## Required Structure

```yaml
Epic ID: EPIC-{epicNumber}
User Story ID: US-{usNumber}
Review ID: QA-{qaNumber}
Status: Pass | Pass-with-issues | Fail
Owner: QA
Reviewed commit(s)/diff: (describe)
Last Updated: (ISO timestamp)
```

| Section | Content |
|---------|---------|
| Scope of review | What you looked at |
| Traceability Check | **MANDATORY** - For each `AC-*`: Pass/Fail + pointer to tests/code |
| Verification Matrix adherence | Required tests present? Missing? |
| Reference Comparison | **MANDATORY when ref exists** - Scenario / Expected / Actual / Match |
| Switch Statement Exhaustiveness | **MANDATORY for calculation code** - List all switches, verify exhaustive |
| Pipeline Test Coverage | **MANDATORY for data transformation** - Tests use raw inputs? |
| Findings | Functional, code quality, architecture, test quality |
| Issues list | Blocker/Major/Minor/Nit with description, impact, location, recommendation |
| Acceptance recommendation | Accept / Request changes / Reconsider design |
| Follow-ups | Non-blocking suggestions |

## Red Flags for Calculation Code

- Tests only use pre-normalized inputs (not raw formats like CRUSHED_ICE, UNIT)
- Switch statements with `default: return value` (silent passthrough)
- No reference comparison against known-correct values
