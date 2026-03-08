---
name: product-vision
description: Use when defining product direction, vision document sections, or roadmap. Triggers on strategic product planning, vision creation, or vision document quality review.
---

# Product Vision

Guide for writing comprehensive product vision documents. Each section has quality criteria, frameworks, and anti-patterns.

## Output

`{ide-folder}/{outputFolder}/product/vision/{timestamp}-{main-topic}.md`

## Front Matter

```yaml
Topic:
Timestamp: (ISO)
Status: Draft | Active | Superseded
Owner: CPO
```

---

## Section Guide

### 1. Executive Summary

**Framework:** Geoffrey Moore's positioning — "For [target user] who [need], [product] is a [category] that [key benefit]. Unlike [alternative], we [differentiator]."

**Quality test:** A stranger reads it in 60 seconds, can repeat back what it does, who it's for, and why it wins.

**Anti-patterns:** Feature lists, jargon, burying the value proposition.

### 2. Vision Statement

**Framework:** "From X to Y" — describe current state → desired future state. One sentence, present tense, customer-centric.

**Quality test:** Is it memorable and repeatable? Would it inspire someone to join the team? Time horizon 3-10 years.

**Anti-patterns:** Too vague ("make the world better"), too narrow (describes today's product), confusing vision with mission.

### 3. Problem Space

**Frameworks:** Five Whys (symptom → root cause), JTBD ("When [situation], I want to [motivation], so I can [outcome]").

**Must include:** Symptoms vs root causes (separated explicitly), quantified impact (cost, time, churn), emotional/social dimensions.

**Quality test:** Reader can feel the pain, see the evidence, understand why solving this is worth investing in.

**Anti-patterns:** Describing problems in terms of your solution ("users need a dashboard"), surface-level symptoms without root causes, no evidence.

### 4. Target Users

**Frameworks:** JTBD + Personas combined (personas = who, JTBD = what they're trying to accomplish), behavioral segmentation over demographics.

**Per persona include:** Role/context, goals, pain points, current workarounds, success criteria.

**Must include:** Anti-personas (who you're NOT building for). Max 3-4 primary personas.

**Quality test:** Each persona has a clear JTBD, measurable pain, and you can point to real users who match.

**Anti-patterns:** "Persona theater" (beautiful docs nobody uses), too many personas, demographics-heavy behavior-light.

### 5. Market Context

**Frameworks:** SWOT (internal strengths/weaknesses vs external opportunities/threats), Porter's Five Forces, Blue Ocean Strategy Canvas.

**Must include:** Competitive feature matrix, market sizing (TAM/SAM/SOM with methodology), macro trends (tailwinds/headwinds), honest about threats.

**Quality test:** Reader understands why now, who the real competition is, where whitespace lives.

**Anti-patterns:** Cherry-picking data, ignoring indirect competitors, stale data, confusing large TAM with real opportunity.

### 6. Value Proposition & Differentiators

**Frameworks:** Value Proposition Canvas (customer pains/gains ↔ pain relievers/gain creators), 10x Test (is solution 10x better on at least one dimension?).

**Must include:** Direct line from each customer pain → specific product capability, defensible moats (network effects, data, switching costs, brand).

**Quality test:** Can explain why competitors can't easily replicate each differentiator.

**Anti-patterns:** Listing features instead of value, differentiators that competitors copy overnight, "we do everything" syndrome.

### 7. Product Principles

**Format:** "Even over" — "Simplicity even over feature completeness". 5-7 principles max.

**Quality test for EACH principle:** Would saying the opposite also be reasonable? If not, it's a platitude, not a principle. Can you find a real past decision it would have changed?

**Anti-patterns:** Generic truisms ("we care about quality"), too many (>7), written once never referenced.

### 8. Strategic Goals

**Framework:** Three Horizons Model — H1 (core, 0-6mo), H2 (emerging, 6-18mo), H3 (future bets, 18mo+). Goals cascade: short feeds medium feeds long.

**Must include:** Both product AND business goals per horizon. Different goal types: short = tactical wins, medium = capability building, long = market position.

**Quality test:** Can trace a line from "what we're building this quarter" to "why we'll win in 5 years."

**Anti-patterns:** Only short-term goals, long-term too vague, no connection between horizons.

### 9. Success Metrics

**Frameworks:** OKRs (Objective = qualitative aspirational, Key Result = quantitative measurable), HEART (Happiness, Engagement, Adoption, Retention, Task success), Pirate Metrics (AARRR).

**Must include:** Baselines, targets, timeframes, measurement method. Mix of leading and lagging indicators. Max 3-5 objectives.

**Quality test:** Every metric connects to a strategic goal. Can explain WHY each metric matters.

**Anti-patterns:** Vanity metrics, too many OKRs, key results that are task lists, no baselines.

### 10. Key Features & Capabilities

**Framework:** MoSCoW (Must/Should/Could/Won't). Must-Haves ~60% of scope.

**Quality test:** Each feature traces to a user need + strategic goal. Described as capabilities (what users can do), not implementation details.

**Anti-patterns:** Everything is "Must-Have", features disconnected from problem/personas, describing solutions instead of capabilities, missing Won't-Have.

### 11. User Journeys

**Framework:** NN/g Journey Mapping — actor, scenario, phases, actions, thoughts, emotions, opportunities.

**Must include:** Full experience (awareness → onboarding → core usage → expansion → advocacy), friction points, "moments of truth", both happy and error paths. 2-3 critical journeys max.

**Quality test:** Each journey reveals at least one actionable improvement opportunity.

**Anti-patterns:** Too granular or too abstract, missing emotional layer, only happy paths, never validated with users.

### 12. Business Model

**Frameworks:** Business Model Canvas (9 blocks), SaaS metrics (ARR, churn, LTV/CAC ratio ≥3:1), value-based pricing.

**Must include:** How product makes money, unit economics, pricing model alignment with value perception, model evolution over time.

**Quality test:** Reader understands economics, whether they work, how model evolves.

**Anti-patterns:** "Figure out monetization later", copying competitor pricing blindly, ignoring unit economics.

### 13. Risks & Assumptions

**Frameworks:** Pre-mortem ("imagine it failed — why?"), Assumption Mapping (importance × uncertainty), Risk Matrix (likelihood × impact).

**Must include:** Separate risks (things that might happen) from assumptions (things believed true but unvalidated). Each risk: likelihood, impact, mitigation, owner. Each assumption: confidence level, validation plan.

**Quality test:** Team has thought deeply about what could go wrong and has a plan.

**Anti-patterns:** Checkbox exercise, only technical risks, assumptions listed but never validated, missing "assumption of demand".

### 14. Phased Roadmap

**Framework:** Now / Next / Later — decreasing specificity over time. Theme-based, not feature-list.

**Must include:** Outcome-oriented themes per phase, entry/exit criteria, what's NOT in each phase, connected to strategic goals.

**Quality test:** Tells a story of value delivery over time, not just a Gantt chart.

**Anti-patterns:** Date-driven feature lists, equal specificity across all phases (false precision), no learning loops, treated as commitment.

### 15. Open Questions

**Must include:** Each question has owner, approach to answer, deadline. Categorized (technical, market, user, business). Prioritized by decision impact.

**Quality test:** Section shrinks over time. No question that should have been resolved before writing the document.

**Anti-patterns:** Empty (false confidence), vague questions, no resolution plan, never updated.

---

## Cross-Cutting Quality Principles

- **Evidence over opinion** — every claim has data, research, or stated assumption
- **Living document** — treat as hypotheses to validate, not stone tablet
- **Concision over completeness** — 10-page doc that gets read beats 50-page doc that gathers dust
- **Accessible language** — new hire understands it in 15 minutes

## Guardrails

- Vision drives everything — be specific, not aspirational fluff
- Assumptions are hypotheses, not facts — label them
- Roadmap rationale required (not just list)
- Principles must be real stances, not platitudes
- Every persona needs a JTBD, not just demographics
- Risks section must include "assumption of demand"
