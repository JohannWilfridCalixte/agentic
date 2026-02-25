# Step 2: Context Gathering

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT gather context yourself.**

Before product discovery, explore the existing codebase and project docs to understand what exists. This prevents discovery from starting with zero knowledge and surfaces integration concerns, edge cases, and constraints early.

---

## SEQUENCE

### 2.1 Prepare Context Query

From `raw_input` and `topic`, formulate what the subagent should investigate:

- What does the project do today?
- What architecture/stack is used?
- What existing features/modules relate to the topic?
- What patterns and conventions are established?

### 2.2 Delegate to Context Gathering Subagent

```
Task(subagent_type="Explore", prompt="
You are gathering product and technical context for a product discovery session about: {topic}

Raw idea: {raw_input}

Your goal: understand the existing system so that product discovery can account for integration, edge cases, and constraints.

## What to Investigate

1. **Project overview** - Read CLAUDE.md, AGENTS.md, README, or equivalent. What does this project do?
2. **Architecture & stack** - Key technologies, frameworks, project structure
3. **Relevant existing features** - Modules/features related to '{topic}'. Search the codebase.
4. **Integration surface** - Where would this feature connect to existing code? What APIs, services, data models exist?
5. **Established patterns** - Conventions the project follows (naming, file structure, error handling, etc.)
6. **Constraints** - Technical or architectural constraints found in code/docs
7. **Potential edge cases** - What complications arise from integrating with what exists?
8. **Key files & modules** - Specific files/paths that would be impacted

## Output Format

Return a structured markdown document with the sections above. Be concise but specific - reference actual file paths, function names, and patterns found.

Do NOT propose solutions. Only describe what exists and what must be accounted for.
")
```

### 2.3 Validate Output

After the subagent completes, verify the response contains:

- [ ] Project overview (what it does, stack)
- [ ] Relevant existing features identified
- [ ] Integration surface described
- [ ] At least one constraint or pattern noted

**If validation fails:**
- Interactive: Ask user to fill gaps ("What existing features relate to {topic}?")
- Auto: Log gap, proceed with partial context

### 2.4 Write Context Document

Save subagent output to `{output_path}/context-{topic}.md`.

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  context: "{output_path}/context-{topic}.md"

validation:
  context_gathering_complete: true

steps_completed:
  - step: 2
    name: "context-gathering"
    completed_at: {ISO_timestamp}
    output: "{output_path}/context-{topic}.md"

current_step: 3
updated_at: {ISO_timestamp}
```

**Output to user:**

*Interactive mode:*
```
Context gathered from codebase.

Key findings:
- {1-3 bullet summary of most relevant findings}

Loading Discovery agent with this context...
```

*Auto mode:*
```
Context gathered. Proceeding to product discovery...
```

---

## NEXT STEP

Load `step-03-product-discovery.md`
