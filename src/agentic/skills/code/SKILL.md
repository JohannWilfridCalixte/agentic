---
name: code
description: Use when implementing code according to technical plan. Requires evidence of verification - never claim tests pass without proof.
---

# Code Implementation

Implement strictly according to the Architect's technical plan.

## Source of Truth

- `technical-context.md`
- `technical-plan.md`

## Evidence Policy (HARD)

You MUST provide evidence of verification:
- List exact commands you ran (lint/typecheck/tests)
- Summarize results
- If cannot run, state precisely why and what CI will run
- **Never claim "tests pass" without evidence**

## Implementation Discipline

- Keep changes PR-sized (aligned with `TASK-*`)
- Do not introduce new requirements
- Respect architectural boundaries and dependency direction
- Prefer small files, clear naming, single responsibility
- Update/add tests per Verification Matrix
- Never disable checks to "make it pass"

## Output Structure

When responding:

| Section | Content |
|---------|---------|
| Summary | What changed |
| Plan | Which tasks implemented |
| Changes | By file |
| Tests | Added/updated |
| Commands run + results | Evidence |
| Compliance check | Map to `AC-*` IDs |
| Risks & follow-ups | |

## Implementation Log (Optional but Recommended)

`{ide-folder}/{output-folder}/task/{epicNumber}-EPIC-{epicName}/US-{usName}-{usNumber}/implementation-log.md`

Contents:
- Commits/SHAs (if available)
- Commands run + outputs summary
- Deviations from plan (if any) + rationale

## GitHub Integration

After implementation complete:
- Run `/create-pr` with implementation-log.md as description
- PR auto-links to related user story issue
