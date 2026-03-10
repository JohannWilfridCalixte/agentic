# Setup Guide for Developers

Multi-agent framework for Claude Code and Cursor. This guide covers four workflows: `technical-planning`, `implement`, `debug`, and `auto-implement`.

## Prerequisites

A GitHub Personal Access Token (PAT) with `read:packages` scope configured in `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=ghp_YOUR_TOKEN_HERE
@JohannWilfridCalixte:registry=https://npm.pkg.github.com
```

## Installation

```bash
bunx @JohannWilfridCalixte/agentic@alpha init \
  -w technical-planning,implement,debug,auto-implement \
  -n YOUR_TEAM_NAME \
  --ide YOUR_IDE
```

Also works with `npx` and `pnpx`.

| Flag | Description |
|------|-------------|
| `-w` | Comma-separated list of workflows to install |
| `-n` | Namespace prefix (lowercase, starts with letter, 2-30 chars) |
| `--ide` | Target IDE: `claude`, `cursor`, or `both` |

### Namespace and invocation

The namespace (`-n`) prefixes all workflow commands and output paths.

| IDE | Invocation pattern | Example |
|-----|-------------------|---------|
| Claude Code | `/<namespace>:workflow:<name>` | `/myteam:workflow:implement` |
| Cursor | `/<namespace>-workflow-<name>` | `/myteam-workflow-implement` |

Artifacts go to `_<namespace>_output/`.

---

## Workflow: technical-planning

**Purpose:** Transform a product spec, PRD, or story into a detailed technical plan by extracting architecture and design decisions from you.

**Invocation:**
```
/agentic:workflow:technical-planning [<input>]
```

### Input types

- No arguments -- prompts for input interactively
- Path to a `spec.md` file
- GitHub issue (`#123` or full URL)
- Inline text

### Flow

| Step | What happens |
|------|-------------|
| 1. Input Classification | Parses args, classifies input, initializes state |
| 2. Architect Context Gathering | Subagent explores codebase, gathers technical context |
| 3. Developer Confirms Context | You review and confirm or correct (loops if rejected) |
| 4. Technical Questioning | Asks all technical questions one at a time: architecture, patterns, data flow, APIs, libraries |
| 5. Generate Technical Plan | Architect subagent generates the final plan |

### Key rules

- **Interactive only** -- no auto mode. The entire point is extracting decisions from you.
- **Gate rule:** Won't proceed to plan generation if structural open questions remain (architecture, design patterns, data flow, component boundaries, libraries, APIs).
- **"Just decide" handling:** If you say "just decide," it challenges once ("This decision affects X"), then logs as `DEVELOPER_DEFERRED`.

### Artifacts

Output path: `_<namespace>_output/task/technical-planning/{topic}/{instance_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Workflow state machine |
| `technical-context.md` | Codebase context gathered by Architect |
| `technical-decisions.md` | Decisions captured during questioning |
| `technical-plan.md` | Final technical plan with task breakdown |

---

## Workflow: implement

**Purpose:** Takes a technical plan and implements it: code, tests, review, optional PR.

**Invocation:**
```
/agentic:workflow:implement <technical-plan>
```

### Input

- Path to `technical-plan.md`
- Or a technical plan already in conversation context

**Hard gate:** Requires a valid technical plan with task breakdown, file change manifest, and implementation steps. Won't start without one.

### Flow

| Step | Mode | What happens |
|------|------|-------------|
| 1. Validate Plan | -- | Checks input is a valid technical plan |
| 2. Software Engineer Implement | Autonomous | Software Engineer subagent writes code following the plan |
| 3. Test Engineer | Autonomous | Test Engineer subagent writes tests |
| 4. Review Loop | Autonomous (max 3 iterations) | QA + Test QA + Security QA review, Software Engineer fixes |
| 5. PR | Interactive | Asks about branch name, commit, PR creation |

Steps 2-4 are fully autonomous -- AI makes decisions and logs them with context, options considered, confidence percentage, and reversibility.

Step 5 is interactive and asks you about PR details.

### Subagents

`software-engineer`, `test-engineer`, `qa`, `test-qa`, `security-qa`

### Artifacts

Output path: `_<namespace>_output/task/implement/{topic}/{instance_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Workflow state machine |
| `decision-log.md` | All autonomous decisions with confidence scores |
| `technical-plan.md` | Copy of input plan |
| `implementation-log.md` | Software Engineer's implementation details |
| `test-log.md` | Test Engineer's test details |
| `qa-{n}.md` | QA review per iteration |
| `test-qa-{n}.md` | Test QA review per iteration |
| `security-{n}.md` | Security QA review per iteration |

---

## Workflow: debug

**Purpose:** Systematic debugging from bug report, CI logs, or error to verified fix. Evidence-based, no guessing.

**Invocation:**
```
/agentic:workflow:debug [<input>]
```

### Input (required)

- Path to an `error.log` file
- GitHub issue (`#123` or full URL)
- Inline error text

### Iron Laws

1. No fixes without root cause investigation first
2. One hypothesis at a time
3. Three failed hypotheses = question architecture

### Flow

| Step | Subagent | What happens |
|------|----------|-------------|
| 1. Input Classification | -- | Parses input, classifies (CI failure, test failure, runtime error, behavior bug, performance) |
| 2. Root Cause Investigation | Investigator | Evidence gathering, not guessing |
| 3. Pattern Analysis | Analyst | Finds working examples, compares working vs broken |
| 4. Hypothesis Testing | Analyst (max 3 iterations) | Tests one hypothesis at a time |
| 4b. Regression Test | Test Engineer | Writes a failing test that reproduces the bug before fix |
| 5. Fix Implementation | Software Engineer | One fix addressing root cause, verifies regression test passes |
| 6. QA Loop | QA + Test QA (max 3 iterations) | Verifies fix, checks for regressions |

**Fully autonomous** -- no user interaction, all decisions logged.

**Escalation:** If 3 hypotheses fail or 3 QA iterations without resolution, creates `escalation.md` for human review.

### Subagents

`investigator`, `analyst`, `test-engineer`, `software-engineer`, `qa`, `test-qa`

### Artifacts

Output path: `_<namespace>_output/debug/{session_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Workflow state machine |
| `decision-log.md` | All decisions with context |
| `bug-report.md` | Structured bug report |
| `investigation-log.md` | Root cause investigation details |
| `evidence.md` | Collected evidence |
| `hypothesis-log.md` | Hypotheses tested and results |
| `regression-test-log.md` | Regression test details |
| `fix-log.md` | Fix implementation details |
| `qa-{n}.md` | QA review per iteration |
| `test-qa-{n}.md` | Test QA review per iteration |
| `escalation.md` | Created only if resolution fails |

---

## Workflow: auto-implement

**Purpose:** Takes a rough idea and autonomously goes from idea to working code. Gathers codebase context, makes product decisions, creates a technical plan, then implements -- all without manual intervention.

**Invocation:**
```
/agentic:workflow:auto-implement [<input>]
```

### Input

- No arguments -- prompts for idea
- Path to `idea.md` file
- GitHub issue (`#123` or full URL)
- Inline text

### Flow

| Step | Mode | What happens |
|------|------|-------------|
| 1. Input Detection | -- | Parses input, classifies, initializes state |
| 2. Architect Context | Autonomous | Architect gathers technical context + functional understanding |
| 3. PM Decisions | Autonomous | PM makes product decisions (scope, acceptance criteria) |
| 4. Technical Plan | Autonomous | Architect generates technical plan |
| 5. Launch Implement | Autonomous | Launches implement workflow with generated plan |

**Fully autonomous** -- no interactive mode. All decisions logged with confidence scores. Low-confidence decisions (<90%) flagged for post-implementation review.

### Subagents

Direct: `architect`, `pm`
Transitive (via implement): `software-engineer`, `test-engineer`, `qa`, `test-qa`, `security-qa`

### Artifacts

Output path: `_<namespace>_output/task/auto-implement/{topic}/{instance_id}/`

| File | Description |
|------|-------------|
| `workflow-state.yaml` | Workflow state machine |
| `decision-log.md` | All autonomous decisions with confidence scores |
| `input-idea.md` | Original idea/prompt |
| `technical-context.md` | Codebase analysis from Architect |
| `functional-understanding.md` | Plain-language behavior synthesis |
| `product-decisions.md` | Product scope, acceptance criteria from PM |
| `technical-plan.md` | Implementation plan from Architect |

---

## Typical Workflow Chains

### Full feature lifecycle

```
(PM runs product-spec) --> technical-planning --> implement
```

1. A PM produces a product spec using `product-spec` workflow
2. You run `technical-planning` with that spec as input
3. Answer the technical questions
4. Review the generated `technical-plan.md`
5. Run `implement` pointing to that plan

```bash
# Step 1: plan from PM's spec
/agentic:workflow:technical-planning _myteam_output/product/specs/billing/abc123/spec-billing.md

# Step 2: implement (using the generated plan)
/agentic:workflow:implement _myteam_output/task/technical-planning/billing/def456/technical-plan.md
```

### Bug fix

```bash
/agentic:workflow:debug #456
```

Or with a log file:

```bash
/agentic:workflow:debug path/to/error.log
```

### Quick implementation

When you want to skip manual planning and go straight from idea to code:

```bash
/agentic:workflow:auto-implement Add rate limiting per tenant
```

All product and technical decisions are made autonomously. Review `decision-log.md` after completion.

---

## Tips

- **Check artifacts:** All workflow output is in `_<namespace>_output/`. Review `decision-log.md` to understand autonomous choices.
- **Review loop cap:** `implement` and `debug` cap review iterations at 3. If issues persist, review the QA logs manually.
- **Plan quality matters:** `implement` is only as good as the technical plan. Invest time in `technical-planning` to answer questions thoroughly.
- **Escalation files:** If `debug` generates `escalation.md`, the bug needs human attention -- review the hypothesis log to see what was tried.
- **Namespace consistency:** Use the same namespace across your team so artifact paths are predictable.
- **IDE choice:** Use `--ide both` if your team uses a mix of Claude Code and Cursor.
- **Use `auto-implement` for well-understood features.** It skips interactive planning. Best for features where the scope is clear enough that autonomous decisions are acceptable. Review `decision-log.md` for all assumptions made.
