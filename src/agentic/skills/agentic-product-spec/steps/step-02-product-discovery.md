# Step 2: Product Discovery

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT run discovery yourself.**

The Discovery subagent will read its own instructions from `{ide-folder}/skills/product-discovery/SKILL.md`.

### Delegate

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
You are the Discovery agent. {ide-invoke-prefix}{ide-folder}/skills/product-discovery/SKILL.md for your full instructions.

Run a product discovery session.

Workflow mode: {workflow_mode}
Topic: {topic}
Output path: {output_path}
Raw input: {raw_input}
Output to: {output_path}/discovery-{topic}.md
Decision log: {output_path}/decision-log.md (if auto mode)

{If auto mode: IMPORTANT: Do NOT ask user questions. Make reasonable assumptions and log all decisions in decision-log.md.}
{If interactive mode: Use rigorous one-question-at-a-time approach. Wait for user response before next question.}
")
```

### Inputs to provide

- `raw_input` (from file or user prompt)
- `workflow_mode`: interactive or auto
- `topic`: kebab-case topic slug
- `output_path`: {ide-folder}/{outputFolder}/product/specs

### Expected Output

The Discovery subagent should produce `discovery-{topic}.md` with:

1. **Problem Statement** - Clear articulation of the problem
2. **Target Users** - Who experiences this problem
3. **Success Metrics** - How we'll measure success
4. **Scope** - In scope, out of scope, deferred
5. **Acceptance Criteria** - Numbered list (AC-01, AC-02, ...)
6. **Edge Cases** - Known edge cases and handling
7. **Open Questions** - Unresolved questions (if any)

### Validate Output

After the subagent completes, verify:
- `{output_path}/discovery-{topic}.md` exists
- Contains required sections:
  - [ ] Problem Statement
  - [ ] Target Users
  - [ ] Success Metrics
  - [ ] Scope (In/Out/Deferred)
  - [ ] Acceptance Criteria (at least 3)

**If validation fails:**
- Interactive: Ask user to provide missing information
- Auto: Log gap, make reasonable assumption, proceed

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
  - step: 2
    name: "product-discovery"
    completed_at: {ISO_timestamp}
    output: "{output_path}/discovery-{topic}.md"

current_step: 3
updated_at: {ISO_timestamp}
```

**Interactive mode:** Present discovery summary, ask if ready to proceed to spec writing.

**Auto mode:** Continue immediately.

---

## NEXT STEP

Load `step-03-write-spec.md`
