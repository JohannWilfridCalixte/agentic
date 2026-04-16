# Step 4: Output Folder Configuration

## EXECUTION RULES

- Auto-detect IDE directories in the current project
- Ask user where to place the generated workflow files
- Detect if we're inside the agentic source tree (for dependencies.ts registration)
- Do not assume — always ask
- Output: `output_folder` and `in_agentic_source_tree` set in state

---

## SEQUENCE

### 4.1 Detect IDE Directories

Scan the current working directory for IDE-specific skill directories:

```bash
# Check for each IDE directory
ls -d .claude/skills 2>/dev/null && echo "claude"
ls -d .cursor/skills 2>/dev/null && echo "cursor"
ls -d .codex/skills 2>/dev/null && echo "codex"
ls -d .agents/skills 2>/dev/null && echo "agents"
```

**Also check if we're in the agentic source tree:**

```bash
# Check for agentic source structure
ls src/agentic/workflows 2>/dev/null && echo "agentic_source"
```

**Set variables:**
```yaml
detected_ides: ["claude", "cursor", ...] # whichever were found
in_agentic_source_tree: true | false
```

### 4.2 Build Options

Construct AskUserQuestion options based on what was detected:

**Priority order for default:**
1. If in agentic source tree: `src/agentic/workflows/` (Recommended)
2. If `.claude/skills` exists: `.claude/skills/`
3. If `.cursor/skills` exists: `.cursor/skills/`
4. If `.codex/skills` exists: `.codex/skills/`
5. If `.agents/skills` exists: `.agents/skills/`

### 4.3 Ask User

```
Question: "Where should the workflow files be placed?"
Options (dynamically built):
  - "{recommended path} (Recommended)" — {reason}
  - "{other detected path}" — {description}
  - "Custom path" — Specify a different location
```

**If no IDE directories detected and not in agentic source:**
```
Question: "No IDE skill directories detected. Where should the workflow files be placed?"
Options:
  - ".claude/skills/" — Create for Claude Code
  - ".cursor/skills/" — Create for Cursor
  - "Custom path" — Specify a different location
```

### 4.4 Handle Custom Path

If user selects "Custom path":
- Ask: "Enter the full path where workflow files should be placed:"
- Validate the path exists (or confirm creation)

### 4.5 Set Output Folder

**Set variable:**
```yaml
output_folder: "{selected path}"
generated_workflow_path: "{output_folder}/{created_workflow.name}/"
```

### 4.6 Complete Step

**Update workflow-state.yaml:**
```yaml
output_folder: "{output_folder}"
in_agentic_source_tree: {true | false}

artifacts:
  generated_workflow_path: "{generated_workflow_path}"

steps_completed:
  - step: 4
    name: "output-config"
    completed_at: {ISO_timestamp}

current_step: 5
updated_at: {ISO_timestamp}
```

**Output to user:**
```
Output folder: {output_folder}
Workflow path: {generated_workflow_path}
{if in_agentic_source_tree: "Will register in dependencies.ts"}

Configuring artifact storage...
```

---

## NEXT STEP

Load and execute: `step-05-storage-config.md`
