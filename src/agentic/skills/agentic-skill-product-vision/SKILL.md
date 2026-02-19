---
name: agentic:skill:product-vision
description: Use when defining product direction, decision principles, roadmap. CPO-level strategic planning.
---

# Product Vision

Define product direction and decision principles.

## Output

`{ide-folder}/{outputFolder}/product/vision/{timestamp}-{main-topic}.md`

## Required Structure

```yaml
Topic:
Timestamp: (ISO)
Status: Draft | Active | Superseded
Owner: CPO
```

| Section | Content |
|---------|---------|
| Vision statement | 1 paragraph |
| Market / ICP | Who, why now |
| Core problems | Ranked |
| Product principles | Non-negotiables |
| Differentiation | What makes this win |
| Business model assumptions | Hypotheses, not facts |
| North Star metric + guardrails | |
| Roadmap | Now / Next / Later with rationale |
| Risk register | Top 5 |
| Open questions | Decisions needed from Developer |
| Epic candidates | Title + 1-2 lines each; no implementation |

## Guardrails

- Vision drives everything—be specific
- Assumptions are hypotheses, not facts
- Roadmap rationale required (not just list)
- Run `/sync-issue` after writing
