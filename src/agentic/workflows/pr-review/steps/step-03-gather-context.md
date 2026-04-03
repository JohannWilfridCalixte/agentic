# Step 3: Gather Technical Context

---

## ORCHESTRATOR ACTION

**You MUST delegate context gathering using the Task tool. Do NOT gather context yourself.**

---

## SEQUENCE

### 3.1 Delegate to Architect

**Note:** For cross-repo PRs where the codebase is not locally available, instruct the Architect to limit context gathering to the diff and PR metadata only.

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-architect.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning context gathering.'

# TASK: Gather Technical Context for PR Review

You are reviewing PR #{pr_number}: {pr_title}

PR diff: {output_path}/pr-diff.patch
PR metadata: {output_path}/pr-metadata.md

Analyze the PR changes and the surrounding codebase to produce technical context:
- What areas of the codebase are affected?
- What are the architectural patterns in those areas?
- What are the relevant types, interfaces, and contracts?
- What tests exist for the affected code?
- What are the dependencies between affected files?
- What technologies, languages, and frameworks are used in the affected code?

If the codebase is not locally available (cross-repo PR), derive context solely from the diff and metadata.

Output to: {output_path}/technical-context.md

IMPORTANT: Include a `tech_stack` field in the YAML frontmatter listing all detected technologies as lowercase identifiers.
Example frontmatter:
```yaml
---
Document: Technical Context
Status: Ready
tech_stack: [typescript, react, node]
---
```
")
```

Validate: `{output_path}/technical-context.md` exists and is non-empty.

### 3.2 Resolve Language Skills

Follow skill-injection-protocol to resolve language skills for review agents:
{ide-invoke-prefix}{ide-folder}/skills/agentic-skill-skill-injection-protocol/SKILL.md

Use `{output_path}/technical-context.md` for tech stack detection.
If detection fails, fall back to file extensions from `pr-diff.patch`.
Cache result in workflow-state.yaml as `language_skills_prompt`.

### 3.3 Update State

```yaml
artifacts:
  technical_context: "{output_path}/technical-context.md"

steps_completed:
  - step: 3
    name: "gather-context"
    completed_at: {ISO}

current_step: 4
```

---

## NEXT STEP

Load `step-04-dispatch-reviews.md`
