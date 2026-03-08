# Step 4: Vision Discovery

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT run discovery yourself.**

The CPO subagent will handle vision discovery, loading its own skills via mandatory setup.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
You are the CPO agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-cpo.md for your full instructions and mandatory setup.

Your task: Run a product vision discovery session.

Topic: {topic}
Output path: {output_path}
Raw input: {raw_input}
Context document: {output_path}/context-{topic}.md
Brainstorming output: {output_path}/brainstorming-{topic}.md
Output to: {output_path}/discovery-{topic}.md

IMPORTANT: Read BOTH the context document AND brainstorming output before starting. The brainstorming document contains 100+ creative ideas, theme clusters, and breakthrough concepts. Use these to inform your questioning — reference specific ideas, challenge the user to prioritize, and surface tensions.

Use rigorous one-question-at-a-time approach. Wait for user response before next question.

## Discovery Focus Areas

Explore and document these vision elements through questioning:

1. **Vision Statement** — What future state does this product create? One inspiring sentence.
2. **Problem Space** — Pain points, root causes, impact. Who suffers? How much?
3. **Target Users** — Primary and secondary personas with goals, pain points, current workarounds
4. **Market Context** — Competitors, alternatives, trends, opportunities, threats
5. **Value Proposition** — Core value, differentiators, unfair advantages
6. **Product Principles** — 5-7 guiding principles (real stances, not platitudes)
7. **Strategic Goals** — Short-term (0-6mo), medium-term (6-18mo), long-term (18mo+)
8. **Success Metrics** — OKRs or similar, with baselines and targets
9. **Key Features** — Must-have, should-have, nice-to-have, out of scope
10. **User Journeys** — Key user flows described step by step
11. **Business Model** — Revenue, pricing, unit economics considerations
12. **Risks & Assumptions** — Critical assumptions to validate, key risks to mitigate
13. **Phased Roadmap** — High-level phases with goals and exit criteria

## Questioning Approach

- Reference brainstorming ideas: 'During brainstorming, the idea of X emerged. How central is that to your vision?'
- Surface tensions: 'The brainstorming surfaced a tension between A and B. Which direction?'
- Use breakthrough concepts as prompts: 'One breakthrough idea was X. Should this be a core feature or nice-to-have?'
- Challenge vague answers — push for specifics
- One question at a time, prefer multiple choice when possible
")
```

### Expected Output

The Discovery subagent should produce `discovery-{topic}.md` with:

1. **Vision Statement** — Clear, inspiring one-liner
2. **Problem Space** — Detailed pain points, root causes, impact
3. **Target Users** — Personas with detail
4. **Market Context** — Landscape, trends, positioning
5. **Value Proposition** — Core value, differentiators
6. **Product Principles** — 5-7 guiding principles
7. **Strategic Goals** — Short/medium/long-term
8. **Success Metrics** — With targets
9. **Key Features** — Prioritized (MoSCoW)
10. **User Journeys** — Key flows
11. **Business Model** — Revenue considerations
12. **Risks & Assumptions** — With confidence levels
13. **Phased Roadmap** — High-level phases
14. **Open Questions** — Unresolved items

### Validate Output

After the subagent completes, verify:
- `{output_path}/discovery-{topic}.md` exists
- Contains required sections:
  - [ ] Vision Statement
  - [ ] Problem Space
  - [ ] Target Users
  - [ ] Value Proposition
  - [ ] Product Principles (at least 3)
  - [ ] Strategic Goals
  - [ ] Key Features (at least in/out of scope)

**If validation fails:**
- Ask user to provide missing information

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  discovery: "{output_path}/discovery-{topic}.md"

validation:
  discovery_complete: true
  required_sections_present: true

steps_completed:
  - step: 4
    name: "vision-discovery"
    completed_at: {ISO_timestamp}
    output: "{output_path}/discovery-{topic}.md"

current_step: 5
updated_at: {ISO_timestamp}
```

Proceed to confirmation step.

---

## NEXT STEP

Load `step-05-confirm-vision.md`
