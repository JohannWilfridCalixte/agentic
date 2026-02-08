# Step 3: Developer Confirms Discovery

---

## ORCHESTRATOR ACTION

**You do this step yourself. Do NOT delegate.**

Present the discovery findings to the developer and require explicit confirmation before proceeding.

**Auto mode:** Skip this step entirely. Go to step 5.

---

## SEQUENCE

### 3.1 Present Discovery Summary

Read `{output_path}/discovery-{topic}.md` and present a structured summary:

```text
Here's what the Discovery agent found:

**Problem:** {problem statement}

**Target Users:**
{bullet list of user types}

**Success Metrics:**
{bullet list of metrics}

**Scope:**
- In: {in scope items}
- Out: {out of scope items}
- Deferred: {deferred items}

**Acceptance Criteria:**
{numbered AC list}

**Edge Cases:**
{bullet list}

**Open Questions:**
{any from discovery}

**Assumptions:**
{list assumptions}

---

Is this discovery accurate and complete?
Options:
1. Yes, confirmed - proceed to product questioning
2. No, here's what's wrong/missing: [describe]
```

### 3.2 Process Developer Response

**If CONFIRMED:**

```yaml
# Update workflow-state.yaml
discovery_confirmed: true
validation:
  discovery_confirmed: true
```

Proceed to step 4.

**If REJECTED:**

Capture the developer's feedback verbatim as `developer_feedback`.

```yaml
# Update workflow-state.yaml
discovery_confirmed: false
```

**Loop back to step 2** with the developer's feedback. The Discovery subagent will re-run focusing on the developer's corrections.

### 3.3 Loop Guard

Track `discovery_attempts` in workflow-state.yaml.

**If discovery_attempts >= 3 and still rejected:**

```text
The discovery has been run {discovery_attempts} times and you're still not satisfied.

Can you describe in your own words:
1. What's the most important thing the discovery is getting wrong?
2. Which aspects of the problem/users/scope are missing?
3. What assumptions are incorrect?
```

Feed this verbatim to the Discovery subagent in the next attempt.

**If discovery_attempts >= 5:**

```text
We've attempted discovery 5 times.

Let me proceed with the current findings and we'll address gaps during the product questioning phase.
Remaining concerns will be captured as open questions.
```

Force-confirm and proceed to step 4. Log all unresolved concerns in `product-decisions.md`.

---

## STEP COMPLETION

**Only when discovery_confirmed == true (or force-confirmed):**

Update `workflow-state.yaml`:

```yaml
discovery_confirmed: true

steps_completed:
  - step: 3
    name: "confirm-discovery"
    completed_at: {ISO_timestamp}

current_step: 4
updated_at: {ISO_timestamp}
```

**Output to developer:**

```text
Discovery confirmed.

Now I'll ask you product questions to fill in any remaining gaps before writing the spec.
```

---

## NEXT STEP

Load `step-04-product-questioning.md`
