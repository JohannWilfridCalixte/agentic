---
name: product-spec
description: Idea to product spec workflow. Extracts precise requirements through rigorous questioning before any design or implementation.
---

# /product-spec - Idea to Product Spec Workflow

**Usage:** `/product-spec [--auto] [<input>]`

Transform a rough idea into a precise product specification through rigorous questioning.

## Arguments

- No args: Interactive mode, prompt for idea
- `--auto`: Autonomous mode with decision logging
- `path/to/notes.md`: Use existing notes/idea file

## Workflow Overview

```
1. Input Detection → 2. Product Discovery → 3. Write Spec
```

## Skill References

Each subagent uses its skill from `.{ide-folder}/skills/{skill}/SKILL.md`.

Invoke: `Task(subagent_type="general-purpose", prompt="You are doing product discovery. {ide-invoke-prefix}{ide-folder}/skills/product-discovery/SKILL.md for your instructions. ...")`

Available skills: `product-discovery`, `brainstorming`

## Mandatory Delegation

**You MUST delegate all discovery/design work using the Task tool. NEVER do it inline.**

You are the orchestrator. You parse input, manage state, validate outputs, and delegate. You do NOT do discovery, ask product questions, or design solutions.

## Execution Protocol

### Step 1: Parse Arguments & Initialize

1. Parse command: detect mode (interactive/auto) and input source
2. Generate topic slug from input
3. Create working directory: `documentation/product/specs/`
4. Create `workflow-state.yaml` with initial state
5. If auto mode, create `decision-log.md`

### Step 2: Product Discovery

Load: `{ide-invoke-prefix}{ide-folder}/skills/product-discovery/SKILL.md`

Task: Extract precise requirements through rigorous questioning:
- Problem validation (who, what, why, impact)
- User context (persona, journey, workarounds)
- Success definition (metrics, acceptance criteria)
- Constraints (time, technical, business)
- Edge cases and failure modes
- Scope boundaries (in/out/deferred)

**One question at a time. Challenge weak/vague answers.**

Output: `documentation/product/specs/discovery-{topic}.md`

### Step 3: Write Spec

Load: `{ide-invoke-prefix}{ide-folder}/skills/brainstorming/SKILL.md`

Task: Using validated discovery, explore design options:
- Propose 2-3 approaches with trade-offs
- Select approach with rationale
- Compile final product spec

Output: `documentation/product/specs/spec-{topic}.md`

## Mode Behaviors

**Interactive Mode (default):**
- Discovery subagent asks user questions one at a time
- Challenges vague answers, pushes for specifics
- User approves discovery before proceeding to spec

**Auto Mode (--auto):**
- Subagent makes assumptions with 90%+ confidence
- Log ALL decisions and assumptions in `decision-log.md`
- Flag low confidence decisions for review

## State Tracking

Update `workflow-state.yaml` after each step completion.

## Artifacts

All outputs go to: `documentation/product/specs/`
- `workflow-state.yaml`
- `decision-log.md` (auto mode)
- `discovery-{topic}.md`
- `spec-{topic}.md`

## Final Spec Format

```markdown
# Product Spec: <Topic>

**Date:** YYYY-MM-DD
**Status:** Draft | Approved

## Summary
<2-3 sentences>

## Problem Statement
<from discovery>

## Target Users
<from discovery>

## Success Metrics
<from discovery>

## Solution Overview
<from design brainstorming>

## Scope
### In Scope
### Out of Scope
### Deferred

## Acceptance Criteria
<from discovery, refined>

## Design Decisions
<key decisions with rationale>

## Edge Cases
<from discovery>

## Open Questions
<any remaining>
```
