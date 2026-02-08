# Step 3: Developer Confirms Technical Context

---

## ORCHESTRATOR ACTION

**You do this step yourself. Do NOT delegate.**

Present the technical context to the developer and require explicit confirmation before proceeding.

---

## SEQUENCE

### 3.1 Present Technical Context Summary

Read `{output_path}/technical-context.md` and present a structured summary to the developer:

```
Here's what the Architect found in the codebase:

**Summary:** {summary section}

**Key Touchpoints:**
{bullet list of main components/files identified}

**Patterns Detected:**
{architecture patterns, conventions found}

**Constraints & Risks:**
{key constraints and risks}

**Assumptions Made:**
{list assumptions}

**Open Questions from Architect:**
{list open questions if any}

---

Is this technical context accurate and complete?
Options:
1. Yes, confirmed - proceed to technical questioning
2. No, here's what's wrong/missing: [describe]
```

### 3.2 Process Developer Response

**If CONFIRMED:**
```yaml
# Update workflow-state.yaml
context_confirmed: true
```
Proceed to step 4.

**If REJECTED:**

Capture the developer's feedback verbatim as `developer_feedback`.

```yaml
# Update workflow-state.yaml
context_confirmed: false
```

**Loop back to step 2** with the developer's feedback. The Architect subagent will re-gather context focusing on the developer's corrections.

### 3.3 Loop Guard

Track `context_attempts` in workflow-state.yaml.

**If context_attempts >= 3 and still rejected:**

```
The context has been gathered {context_attempts} times and you're still not satisfied.

Can you describe in your own words:
1. What's the most important thing the context is getting wrong?
2. Which parts of the codebase should the Architect focus on?
3. Are there specific files/modules that are relevant but missing?
```

Feed this verbatim to the Architect subagent in the next attempt.

**If context_attempts >= 5:**

```
We've attempted context gathering 5 times.

Let me proceed with the current context and we'll address gaps during the technical questioning phase.
Remaining concerns will be captured as open questions.
```

Force-confirm and proceed to step 4. Log all unresolved concerns in `technical-decisions.md`.

---

## STEP COMPLETION

**Only when context_confirmed == true (or force-confirmed):**

Update `workflow-state.yaml`:

```yaml
context_confirmed: true

steps_completed:
  - step: 3
    name: "confirm-context"
    completed_at: {ISO_timestamp}

current_step: 4
updated_at: {ISO_timestamp}
```

**Output to developer:**
```
Technical context confirmed.

Now I'll ask you technical questions to fill in all design/architecture decisions before generating the plan.
```

---

## NEXT STEP

Load `step-04-technical-questioning.md`
