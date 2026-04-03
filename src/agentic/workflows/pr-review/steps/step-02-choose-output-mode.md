# Step 2: Choose Output Mode

## EXECUTION RULES

- Ask the user how they want the review delivered
- Store choice in workflow state
- This step is INTERACTIVE — requires user input

---

## SEQUENCE

### 2.1 Ask User for Output Mode

Use **AskUserQuestion** tool:

```
How would you like the review delivered?

1. **Local** — markdown report saved to disk + summary in chat
2. **PR comments** — review posted as GitHub PR comments

Pick 1 or 2:
```

### 2.2 Classify Response

| Response | Mode |
|----------|------|
| "1", "local", "markdown", "md", "file" | `local` |
| "2", "pr", "comments", "github", "pr comments" | `pr_comments` |
| Ambiguous | Ask again (once), then default to `local` |

### 2.3 Update State

**Append to `steps_completed`:**
```yaml
output_mode: "{local | pr_comments}"

steps_completed:
  - step: 2
    name: "choose-output-mode"
    completed_at: {ISO}

current_step: 3
```

---

## NEXT STEP

Load `step-03-gather-context.md`
