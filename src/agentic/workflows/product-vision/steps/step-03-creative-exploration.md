# Step 3: Creative Exploration

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT run brainstorming yourself.**

The Brainstorming subagent will facilitate a creative exploration session using structured brainstorming techniques. This divergent thinking phase generates the raw creative material that feeds into vision discovery.

**Critical Mindset (instruct the subagent):**
- Keep the user in generative exploration mode as long as possible
- The best sessions feel slightly uncomfortable — pushed past obvious ideas into novel territory
- Resist the urge to organize or conclude prematurely
- First 20 ideas are obvious — magic happens at 50-100
- Aim for 100+ ideas before any organization

---

## SEQUENCE

### 3.1 Prepare Brainstorming Context

From `raw_input`, `topic`, and `context-{topic}.md`, formulate what the subagent should explore:

- What problem space should be explored?
- What user needs and personas to investigate?
- What market angles to consider?
- What existing system context to account for?

### 3.2 Delegate to Brainstorming Subagent

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
You are the CPO agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-cpo.md for your full instructions and mandatory setup.

Your task: Facilitate a product vision brainstorming session.

Topic: {topic}
Raw idea: {raw_input}
Context document: {output_path}/context-{topic}.md
Output to: {output_path}/brainstorming-{topic}.md
Brain techniques file: {workflow_installed_path}/brain-methods.csv

IMPORTANT: Read the context document first. It contains existing codebase analysis.
IMPORTANT: Read brain-methods.csv for available brainstorming techniques.

## Session Setup

1. Briefly present the topic and context summary to the user
2. Ask the user to choose a technique selection approach:
   - **Browse & Pick** — Browse 62 techniques across 10 categories and choose
   - **AI-Recommended** — I analyze your topic and recommend a 3-technique journey
   - **Random Discovery** — Random selection from different categories for serendipity
   - **Progressive Flow** — Systematic 4-phase journey: Exploration → Pattern Recognition → Development → Action

## Technique Categories (from brain-methods.csv)

Load and present from brain-methods.csv. Categories include:
- Structured (SCAMPER, Six Thinking Hats, Mind Mapping...)
- Creative (What If, Analogical Thinking, Reversal...)
- Collaborative (Yes And, Brain Writing, Role Playing...)
- Deep (Five Whys, Morphological Analysis, Question Storming...)
- Theatrical (Time Travel Talk Show, Alien Anthropologist, Dream Fusion...)
- Wild (Chaos Engineering, Pirate Code, Anti-Solution...)
- Introspective (Inner Child, Shadow Work, Values Archaeology...)
- Biomimetic (Nature's Solutions, Ecosystem Thinking...)
- Quantum (Observer Effect, Entanglement, Superposition...)
- Cultural (Indigenous Wisdom, Fusion Cuisine, Mythic Frameworks...)

## Anti-Bias Protocol

LLMs drift toward semantic clustering. FORCE domain pivoting every 10 ideas:
- If focusing on technical aspects → pivot to user experience
- If on user experience → pivot to business viability
- If on business → pivot to edge cases or 'black swan' events
- Maintain true divergence across orthogonal categories

## Brainstorming Focus Areas (for product vision)

Explore ideas across ALL these dimensions:
1. **Problem space** — pain points, root causes, impact, urgency
2. **Users & personas** — who benefits, segments, needs, behaviors
3. **Market & competition** — landscape, trends, gaps, positioning
4. **Value proposition** — core value, differentiators, advantages
5. **Product principles** — design philosophy, trade-offs, stances
6. **Features & capabilities** — what it does, how it works
7. **Business model** — revenue, pricing, unit economics
8. **Risks & opportunities** — what could go wrong, what could go very right
9. **Vision & aspiration** — the future state, the world it creates

## Execution Rules

- Execute ONE technique element at a time
- After each user response, acknowledge and build on their ideas
- Offer energy checkpoints every 4-5 exchanges
- Track ideas with brief labels
- Do NOT organize until 100+ ideas or user requests it
- When organizing: cluster into themes, highlight breakthrough concepts, identify top ideas

## Output Format

Write {output_path}/brainstorming-{topic}.md with:

### Session Metadata
- Techniques used
- Duration / exchanges
- Technique selection mode
- Total ideas generated

### Raw Ideas by Domain
Group all ideas by the 9 focus areas above

### Theme Clusters
Emergent themes from cross-domain analysis

### Breakthrough Concepts
Top 5-10 most innovative/impactful ideas with brief rationale

### Key Tensions & Trade-offs
Contradictions or tensions surfaced during brainstorming

### Insights for Vision
Synthesized insights ready for the vision discovery phase
")
```

### 3.3 Validate Output

After the subagent completes, verify `{output_path}/brainstorming-{topic}.md` contains:

- [ ] Raw ideas across multiple domains (not clustered in one area)
- [ ] At least 50+ distinct ideas (ideally 100+)
- [ ] Theme clusters identified
- [ ] Breakthrough concepts highlighted
- [ ] Insights synthesized for next phase

**If validation fails:**
- Ask user if they want to continue brainstorming or proceed with current output

### 3.4 Update Session Metadata

Extract from brainstorming output:
- Techniques used
- Number of ideas generated
- Technique selection mode

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  brainstorming: "{output_path}/brainstorming-{topic}.md"

brainstorming_techniques_used: [{list from output}]
ideas_generated: {count}
technique_selection_mode: {mode}

validation:
  brainstorming_complete: true

steps_completed:
  - step: 3
    name: "creative-exploration"
    completed_at: {ISO_timestamp}
    output: "{output_path}/brainstorming-{topic}.md"

current_step: 4
updated_at: {ISO_timestamp}
```

**Output to user:**

```
Brainstorming complete!

{ideas_generated} ideas generated using {techniques used}
{number} theme clusters identified
{number} breakthrough concepts highlighted

Loading Vision Discovery agent to synthesize findings...
```

---

## NEXT STEP

Load `step-04-vision-discovery.md`
