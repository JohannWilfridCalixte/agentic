---
name: agentic:skill:skill-injection-protocol
description: Orchestrator protocol for resolving language-specific skills. Produces a `language_skills_prompt` value cached in workflow-state.yaml.
---

# Skill Injection Protocol (Orchestrator)

Resolve language-specific skills based on project tech stack and profile configuration. The orchestrator executes this protocol ONCE per workflow and caches the result as `language_skills_prompt` in `workflow-state.yaml`.

## Output

A `language_skills_prompt` string value:
- **Skills found:** formatted prompt fragment (see Output Format)
- **No skills:** empty string `""`

## Steps

### 1. Read Profile Configuration

Read `.agentic.settings.json` from the IDE directory. Extract the `profiles` array.

```json
{
  "profiles": [
    { "name": "typescript", "detect": ["typescript", "ts", "node", "bun", "deno"], "skills": ["typescript-engineer", "typescript-imports"] }
  ]
}
```

If `profiles` is missing or empty → `language_skills_prompt: ""`, stop.

### 2. Read Tech Stack

Read `technical-context.md` from the workflow output path. Extract `tech_stack` from YAML frontmatter.

```yaml
---
tech_stack: [typescript, react, node]
---
```

If `technical-context.md` doesn't exist or `tech_stack` is missing → `language_skills_prompt: ""`, stop.

### 3. Match & Deduplicate

For each `tech_stack` entry, search all profiles' `detect` arrays (case-insensitive). Collect matched profiles' `skills`. Deduplicate.

**Example:** tech_stack `[typescript, react, node]` → all match `typescript` profile → skills: `["typescript-engineer", "typescript-imports"]`

### 4. Apply Overrides

Check `skillOverrides` in settings:

| Override | Example | Effect |
|----------|---------|--------|
| Replace | `{"typescript-imports": "custom-imports"}` | Load custom-imports instead |
| Remove | `{"typescript-imports": "_remove_"}` | Don't load that skill |

### 5. Handle Unmatched

If `tech_stack` entries have no matching profile:
- **Auto mode**: Log in `decision-log.md` as LOW_CONFIDENCE
- **Interactive mode**: Ask user

If no skills matched → `language_skills_prompt: ""`, stop.

### 6. Build Output

Set `language_skills_prompt` to:

```
---

# Language Skills

Load these language-specific skills before proceeding:
- Skill(skill="{skill-1}")
- Skill(skill="{skill-2}")

Confirm: "Language skills loaded: {skill-1}, {skill-2}"

---
```

Cache in `workflow-state.yaml`:

```yaml
language_skills_prompt: |
  ---

  # Language Skills

  Load these language-specific skills before proceeding:
  - Skill(skill="{skill-1}")
  - Skill(skill="{skill-2}")

  Confirm: "Language skills loaded: {skill-1}, {skill-2}"

  ---
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Agent tries to execute this protocol | Only orchestrator executes this. Agents receive `{language_skills_prompt}` in their Task() prompt. |
| Resolving per-step instead of once | Resolve once at the workflow resolution point, cache in workflow-state.yaml. |
| Wrong skill name prefix | Use short names: `typescript-engineer`, not `agentic-skill-typescript-engineer` |
