# Step 7: Write Vision Document

---

## PRE-CONDITION CHECK

**Before executing this step, verify:**

```yaml
discovery_confirmed: true
critical_open_questions: 0
validation.gate_passed: true
```

**If any condition fails, STOP. Do not write the vision document. Go back to the failing step.**

---

## ORCHESTRATOR ACTION

**You MUST delegate vision document writing to the CPO subagent using the Task tool.**

### 7.1 Delegate to CPO Subagent

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
You are the CPO agent. {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-cpo.md for your full instructions and mandatory setup.

Your task: Write the comprehensive product vision document.

Topic: {topic}
Output path: {output_path}

Read ALL these artifacts before writing:
- Context: {output_path}/context-{topic}.md
- Brainstorming: {output_path}/brainstorming-{topic}.md
- Discovery: {output_path}/discovery-{topic}.md
- Decisions: {output_path}/vision-decisions.md
- Template: {workflow_installed_path}/templates/vision-document.md

Write the vision document to: {output_path}/vision-{topic}.md

Use the template structure. Fill EVERY section from the appropriate artifact sources. The product-vision skill (loaded in your mandatory setup) provides quality criteria for each section — follow them rigorously.

IMPORTANT: Every section must meet the quality tests defined in the product-vision skill. Do not produce placeholder content.
")
```

### 7.2 Validate Output

Verify `vision-{topic}.md`:

- [ ] Contains all 15 required sections
- [ ] Vision statement is clear and inspiring
- [ ] Problem and value proposition are connected
- [ ] Personas are detailed and specific
- [ ] Product principles are real stances (not platitudes)
- [ ] Strategic goals have timeframes
- [ ] Success metrics have baselines and targets
- [ ] Features are prioritized (MoSCoW)
- [ ] User journeys have success criteria
- [ ] Risks have mitigation strategies
- [ ] Roadmap phases have exit criteria
- [ ] All vision-decisions.md entries are reflected
- [ ] Brainstorming insights appendix includes breakthrough concepts
- [ ] No critical open questions remain (only minor)

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  vision: "{output_path}/vision-{topic}.md"

steps_completed:
  - step: 7
    name: "write-vision"
    completed_at: {ISO_timestamp}
    output: "{output_path}/vision-{topic}.md"

status: "completed"
completed_at: {ISO_timestamp}
updated_at: {ISO_timestamp}
```

---

## WORKFLOW COMPLETE

```text
Product vision complete!

Artifacts:
- Context: {output_path}/context-{topic}.md
- Brainstorming: {output_path}/brainstorming-{topic}.md
- Discovery: {output_path}/discovery-{topic}.md
- Decisions: {output_path}/vision-decisions.md
- Vision: {output_path}/vision-{topic}.md

Review the vision document and update status from Draft when approved.
```

---

## NO NEXT STEP

Workflow is complete.
