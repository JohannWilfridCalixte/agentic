# Step 2: UI/UX Design

---

## ORCHESTRATOR ACTION

**You MUST delegate UI/UX design using the Task tool. Do NOT design yourself.**

This step creates the visual foundation. No code until design is documented.

---

## SEQUENCE

### 2.1 Delegate UI/UX Design

```
Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/ui-ux-designer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning UI/UX design.'

---

# TASK: Create Visual Design Decisions

Create comprehensive visual design for this feature.

Workflow: frontend-development (autonomous)
Session ID: {session_id}
Session path: {session_path}
Feature request: {session_path}/feature-request.md

Your task:
1. Read the feature request
2. Define visual style (colors, typography, spacing)
3. Design component hierarchy and states
4. Document layout and responsive behavior
5. Consider accessibility requirements

Focus on VISUAL DECISIONS only. UX patterns come in next step.

Output to: {session_path}/design-decisions.md

Decision log: {session_path}/decision-log.md
")
```

### 2.2 Validate Output

Read `{session_path}/design-decisions.md`. Verify it contains:

**Required sections:**
- [ ] Context - what's being designed
- [ ] Color Palette - with rationale
- [ ] Typography - complete scale
- [ ] Spacing System - base unit and scale
- [ ] Component Design - at least one component
- [ ] Layout Structure - hierarchy defined
- [ ] Responsive Breakpoints - mobile/tablet/desktop
- [ ] Accessibility - checklist started

**If missing sections:**

Re-delegate with specific instruction:
```
Your design-decisions.md is missing: {list}
Please add these sections before proceeding.
```

### 2.3 Log Design Decision

```markdown
### DEC-{N}: Visual Design Complete

**Step**: ui-ux-design
**Agent**: UI/UX Designer
**Timestamp**: {ISO}

**Context**: Creating visual design foundation

**Decisions made**:
- Color palette: {primary color, palette style}
- Typography: {font family, scale approach}
- Spacing: {base unit}px base
- Components: {count} designed

**Decision**: Visual design documented, proceeding to UX adjustment

**Confidence**: {%}

**Reversibility**: Easy (design doc can be updated)
```

### 2.4 Complete Step

**Update workflow-state.yaml:**
```yaml
steps_completed:
  - step: 2
    name: "ui-ux-design"
    completed_at: {ISO}
    components_designed: {count}

artifacts:
  design_decisions: "{session_path}/design-decisions.md"

current_step: 3
```

**Output:**
```
UI/UX Design complete

Design decisions: {session_path}/design-decisions.md
Components designed: {count}
Color palette: {primary color}
Typography: {font family}

Proceeding to UX Adjustment...
```

---

## NEXT STEP

Load `step-03-ux-adjustment.md`
