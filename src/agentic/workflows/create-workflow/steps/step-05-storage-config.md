# Step 5: Storage Configuration

## EXECUTION RULES

- Ask where the CREATED workflow should store its progress file and artifacts at runtime
- This configures the generated workflow's artifact storage, NOT this workflow's storage
- Default to agentic output directory
- Support alternative backends
- Output: `storage_strategy` set in state

---

## SEQUENCE

### 5.1 Explain the Question

Before asking, briefly clarify what this means:

```
When the workflow you're creating runs, it produces artifacts (state files, intermediate documents, final outputs). Where should those be stored?
```

### 5.2 Ask About Storage Strategy

```
Question: "Where should the created workflow store its progress and artifacts at runtime?"
Options:
  - "Agentic output directory (Recommended)" — Uses {ide-folder}/{outputFolder}/{category}/{topic}/{instance_id}/ pattern. Files stored locally alongside the project.
  - "GitHub Issues" — Progress tracked as comments on a GitHub issue. Good for team visibility.
  - "Notion database" — Artifacts stored in a Notion page. Good for non-technical stakeholders.
  - "Custom" — Specify a different storage backend.
```

### 5.3 Handle Each Strategy

**If "Agentic output directory":**

Ask about the output category:

```
Question: "Under which category should this workflow's artifacts be stored?"
Options:
  - "task/{workflow-name}/" — General task output (most workflows use this)
  - "product/{workflow-name}/" — Product-related outputs (specs, visions)
  - "tech/{workflow-name}/" — Technical outputs (plans, audits)
```

**Set variables:**
```yaml
storage_strategy: "agentic_output"
storage_category: "{selected category}"
storage_path_template: "{ide-folder}/{outputFolder}/{category}/{topic}/{instance_id}/"
```

**If "GitHub Issues":**

```
Question: "Should the workflow create a new issue or comment on an existing one?"
Options:
  - "Create new issue per run" — Each workflow run creates a tracking issue
  - "Comment on existing issue" — Workflow takes an issue number as input
```

**Set variables:**
```yaml
storage_strategy: "github_issues"
github_issue_mode: "create" | "comment"
```

**If "Notion database":**

```
Question: "Do you have a Notion database ID or should the workflow prompt for it at runtime?"
Options:
  - "Prompt at runtime" — Ask for database ID when workflow runs
  - "Hardcode database ID" — Set it now (ask for the ID)
```

**Set variables:**
```yaml
storage_strategy: "notion"
notion_config: "prompt" | "{database_id}"
```

**If "Custom":**
- Ask: "Describe the storage backend (e.g., S3, local folder, database). The workflow will include a placeholder for your custom implementation."

**Set variables:**
```yaml
storage_strategy: "custom"
storage_description: "{user's description}"
```

### 5.4 Complete Step

**Update workflow-state.yaml:**
```yaml
storage_strategy: "{selected strategy}"
# Plus strategy-specific fields from 5.3

steps_completed:
  - step: 5
    name: "storage-config"
    completed_at: {ISO_timestamp}

current_step: 6
updated_at: {ISO_timestamp}
```

**Output to user:**
```
Storage configured: {strategy description}

All configuration complete. Generating workflow files...
```

---

## NEXT STEP

Load and execute: `step-06-workflow-generation.md`
