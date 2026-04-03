# Step 2: Choose Output Mode & Verbosity

## EXECUTION RULES

- Ask the user how they want the review delivered
- Ask the user for the desired verbosity level
- Store both choices in workflow state
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

### 2.2 Classify Output Mode Response

| Response | Mode |
|----------|------|
| "1", "local", "markdown", "md", "file" | `local` |
| "2", "pr", "comments", "github", "pr comments" | `pr_comments` |
| Ambiguous | Ask again (once), then default to `local` |

### 2.3 Ask User for Verbosity Level

Use **AskUserQuestion** tool:

```
What verbosity level for findings?

1. **Concise** — short description per issue
2. **Detailed** — issue title + detailed description
3. **Comprehensive** — issue title + detailed description + file:line pointers + how to fix

Pick 1, 2, or 3:
```

### 2.4 Classify Verbosity Response

| Response | Level |
|----------|-------|
| "1", "concise", "short", "brief" | `1` |
| "2", "detailed", "normal", "default" | `2` |
| "3", "comprehensive", "full", "verbose", "all" | `3` |
| Ambiguous | Ask again (once), then default to `2` |

### 2.5 Update State

**Append to `steps_completed`:**
```yaml
output_mode: "{local | pr_comments}"
verbosity_level: {1 | 2 | 3}

steps_completed:
  - step: 2
    name: "choose-preferences"
    completed_at: {ISO}

current_step: 3
```

---

## NEXT STEP

Load `step-03-gather-context.md`
