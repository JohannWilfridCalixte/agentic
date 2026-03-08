# Step 5: Developer Confirms Vision

---

## ORCHESTRATOR ACTION

**You do this step yourself. Do NOT delegate.**

Present the vision discovery findings to the developer and require explicit confirmation before proceeding.

---

## SEQUENCE

### 5.1 Present Vision Summary

Read `{output_path}/discovery-{topic}.md` and present a structured summary:

```text
Here's the vision discovery summary:

**Vision:** {vision statement}

**Problem Space:**
{key pain points}

**Target Users:**
{bullet list of personas}

**Market Context:**
{competitive landscape summary}

**Value Proposition:**
{core value and differentiators}

**Product Principles:**
{numbered principles}

**Strategic Goals:**
- Short-term: {goals}
- Medium-term: {goals}
- Long-term: {goals}

**Key Features:**
- Must-have: {items}
- Should-have: {items}
- Out of scope: {items}

**Risks:**
{top risks}

**Open Questions:**
{any from discovery}

---

Is this vision direction accurate and complete?
Options:
1. Yes, confirmed - proceed to vision deepening
2. No, here's what's wrong/missing: [describe]
```

### 5.2 Process Developer Response

**If CONFIRMED:**

```yaml
# Update workflow-state.yaml
discovery_confirmed: true
validation:
  discovery_confirmed: true
```

Proceed to step 6.

**If REJECTED:**

Capture the developer's feedback verbatim as `developer_feedback`.

```yaml
# Update workflow-state.yaml
discovery_confirmed: false
discovery_attempts: {increment}
```

**Loop back to step 4** with the developer's feedback. The Discovery subagent will re-run focusing on the corrections.

### 5.3 Loop Guard

Track `discovery_attempts` in workflow-state.yaml.

**If discovery_attempts >= 3 and still rejected:**

```text
The vision discovery has been run {discovery_attempts} times and you're still not satisfied.

Can you describe in your own words:
1. What's the most important thing the vision is getting wrong?
2. Which aspects of the problem/users/market are missing?
3. What assumptions are incorrect?
```

Feed this verbatim to the Discovery subagent in the next attempt.

**If discovery_attempts >= 5:**

```text
We've attempted vision discovery 5 times.

Let me proceed with the current findings and we'll address gaps during the vision deepening phase.
Remaining concerns will be captured as open questions.
```

Force-confirm and proceed to step 6. Log all unresolved concerns.

---

## STEP COMPLETION

**Only when discovery_confirmed == true (or force-confirmed):**

Update `workflow-state.yaml`:

```yaml
discovery_confirmed: true

steps_completed:
  - step: 5
    name: "confirm-vision"
    completed_at: {ISO_timestamp}

current_step: 6
updated_at: {ISO_timestamp}
```

**Output to developer:**

```text
Vision direction confirmed.

Now I'll ask detailed questions to fill in gaps before writing the vision document.
```

---

## NEXT STEP

Load `step-06-vision-deepening.md`
