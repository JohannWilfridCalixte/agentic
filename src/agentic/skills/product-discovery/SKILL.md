---
name: product-discovery
description: Use when exploring a new product idea or feature before any design/technical work. Extracts precise requirements through rigorous one-question-at-a-time questioning.
---

# Product Discovery

Extract maximum precision about product requirements before design or implementation.

## Approach

**One question at a time.** Never ask multiple questions in a single message.

**Push hard.** Weak/vague answers get challenged immediately.

**Prefer multiple choice** when options are enumerable.

## Question Categories

Work through these in order, but adapt based on gaps:

### 1. Problem Validation
- Who exactly is the user? (role, context, frequency of problem)
- What specific problem? (concrete scenarios, not abstractions)
- Why now? Why hasn't this been solved?
- Impact of not solving? (quantify if possible)

### 2. User Context
- Current workarounds? (how do they cope today)
- What triggers the need? (when does this problem surface)
- User journey touchpoints?

### 3. Success Definition
- What does "done" look like?
- How will we measure success? (specific metrics)
- What's the minimum viable outcome?

### 4. Constraints
- Timeline? (hard deadline vs flexible)
- Technical constraints? (platform, integrations, data)
- Business constraints? (compliance, budget, resources)

### 5. Edge Cases & Failure Modes
- What can go wrong?
- Edge cases to handle?
- What happens on failure?

### 6. Scope Boundaries
- What's explicitly IN scope?
- What's explicitly OUT?
- What's deferred to later?

## Challenge Patterns

Use these to push back on weak answers:

- "Can you give me a concrete example?"
- "What if that assumption is wrong?"
- "How often does this happen? Quantify."
- "Who specifically? Not 'users' - which user type?"
- "What's the cost of not doing this?"
- "How do they solve this today without this feature?"

## Output

After discovery is complete, produce: `{output-folder}/product/discovery/YYYY-MM-DD-<topic>.md`

```markdown
# Discovery: <Topic>

**Date:** YYYY-MM-DD
**Status:** Draft | Validated | Blocked

## Problem Statement

<2-3 sentences max>

## Target Users

| User Type | Context | Frequency |
|-----------|---------|-----------|
| | | |

## Current State

How users solve this today (workarounds).

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| | | |

## Scope

### In Scope
-

### Out of Scope
-

### Deferred
-

## Acceptance Criteria

- [ ] AC-01:
- [ ] AC-02:

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| | |

## Constraints

- **Timeline:**
- **Technical:**
- **Business:**

## Open Questions

- [ ]

## Key Assumptions

| Assumption | Risk if Wrong |
|------------|---------------|
| | |
```

## Guardrails

- No design solutions (UI, UX, architecture)
- No technical implementation details
- Challenge every vague answer
- Don't proceed until fundamentals are clear
- Summarize understanding before moving to next category
