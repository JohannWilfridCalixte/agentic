# Step 2: Software Engineer Implement

---

## ORCHESTRATOR ACTION

**You MUST delegate this step using the Task tool. Do NOT write code yourself.**

This step parallelizes implementation by analyzing task dependencies and dispatching multiple subagents.

### Phase 1: Extract Tasks

Read `{output_path}/technical-plan.md`. Extract all tasks (TASK-01, TASK-02, etc.).

Build a task list:

```yaml
tasks:
  - id: TASK-01
    summary: "{brief description}"
    files: ["{files this task creates or modifies}"]
    depends_on: []
  - id: TASK-02
    summary: "{brief description}"
    files: ["{files this task creates or modifies}"]
    depends_on: ["TASK-01"]
```

### Phase 2: Detect Dependencies

For each pair of tasks, mark a dependency if ANY of:

- **Explicit**: task states "depends on TASK-XX", "after TASK-XX", "requires TASK-XX", or "blocked by TASK-XX"
- **File overlap**: tasks create or modify the same file(s)
- **Output dependency**: task uses output/artifact produced by another task

Build a dependency graph:

```
TASK-01 → TASK-03 (file overlap: src/auth.ts)
TASK-02 (independent)
TASK-04 → TASK-05 (explicit: "depends on TASK-04")
```

### Phase 3: Group into Parallel Lanes

Group tasks into **lanes** — each lane is a dependency chain assigned to one subagent.

1. Build directed graph from dependencies
2. Find connected components (tasks linked by any dependency path, including transitive)
3. Each connected component = one lane
4. Within each lane, topologically sort tasks (dependencies first)

Example:

```
Lane 1: TASK-01 → TASK-03 (sequential within lane)
Lane 2: TASK-02
Lane 3: TASK-04 → TASK-05
```

**Edge cases:**

- Single task → 1 lane, skip parallelization
- All tasks dependent → 1 lane, single subagent
- All tasks independent → N lanes, max parallelization

Log grouping decision to `{output_path}/decision-log.md`:

```markdown
### DEC-{n}: Task Parallelization Strategy

**Step**: software-engineer-implement
**Agent**: orchestrator
**Timestamp**: {ISO}

**Context**: Analyzed {N} tasks for dependencies

**Dependency Graph**:
{graph}

**Lanes**:
- Lane 1: {task ids} — {dependency reason}
- Lane 2: {task ids} — independent

**Decision**: {N} parallel lanes
**Confidence**: {%}
**Reversibility**: Easy
```

### Phase 4: Dispatch Parallel Subagents

Launch one subagent per lane. **All Task calls MUST be in a single message to run in parallel.**

Each subagent writes to its own output files to avoid conflicts:

- Implementation log: `implementation-log-lane-{lane_number}.md`
- Decision log: `decision-log-lane-{lane_number}.md`

```
# Dispatch ALL lanes simultaneously in one message:

Task(subagent_type="{subagentTypeGeneralPurpose}", prompt="
# MANDATORY FIRST ACTION - DO NOT SKIP

{ide-invoke-prefix}{ide-folder}/agents/agentic-agent-software-engineer.md

This file contains your role, skill loading instructions (you MUST use the Skill tool for each skill listed), and output format. Complete ALL setup steps in that file before proceeding.

After setup, confirm: 'Agent file read. Skills loaded. Beginning implementation.'

{language_skills_prompt}

# TASK: Implement Assigned Tasks from Technical Plan

Workflow: implement (autonomous, no user questions)
Topic: {topic}
Output path: {output_path}
Technical Plan: {output_path}/technical-plan.md
Output to: {output_path}/implementation-log-lane-{lane_number}.md
Decision log: {output_path}/decision-log-lane-{lane_number}.md

## YOUR ASSIGNED TASKS

Implement ONLY these tasks, in this order:
{ordered list of TASK-XX ids and summaries for this lane}

**Do NOT implement tasks not listed above.**
**Follow the order listed — earlier tasks produce artifacts needed by later ones.**

IMPORTANT: Do NOT ask user questions. Log all decisions in your decision log file.
")
```

### Phase 5: Validate & Merge

After ALL subagents complete:

1. **Validate each lane:**
   - `implementation-log-lane-{N}.md` exists and is non-empty
   - Each log contains regression test output (no regressions)
   - Code changes exist in working tree

2. **Merge logs:**
   - Concatenate all `implementation-log-lane-{N}.md` → `{output_path}/implementation-log.md` (lane order)
   - Append all `decision-log-lane-{N}.md` entries → `{output_path}/decision-log.md`

3. **Run full regression tests** to detect cross-lane conflicts

4. **If conflicts detected:**
   - Log conflict in decision-log.md
   - Dispatch single Software Engineer subagent to resolve
   - Re-run regression tests

---

## STEP COMPLETION

Update `workflow-state.yaml`:

```yaml
artifacts:
  implementation_log: "{output_path}/implementation-log.md"
  implementation_log_lanes:
    - "{output_path}/implementation-log-lane-1.md"
    # ...per lane

steps_completed:
  - step: 2
    name: "software-engineer-implement"
    completed_at: {ISO}
    output: "{output_path}/implementation-log.md"
    parallel_lanes: {N}
    tasks_per_lane:
      lane_1: ["TASK-01", "TASK-03"]
      lane_2: ["TASK-02"]

current_step: 3
```

---

## NEXT STEP

Load `step-03-test-engineer.md`
