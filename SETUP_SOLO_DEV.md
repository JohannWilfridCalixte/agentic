# Setup Guide for Solo Developers

All-in-one setup covering product discovery through implementation. You handle both product and engineering -- this guide gives you eight workflows that chain together into a complete development lifecycle.

## Prerequisites

Configure GitHub Packages access in `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
@JohannWilfridCalixte:registry=https://npm.pkg.github.com
```

Your GitHub PAT needs `read:packages` scope.

## Installation

```bash
bunx @JohannWilfridCalixte/agentic@alpha init \
  -w ask-codebase,product-spec,product-vision,technical-planning,implement,debug,frontend-development,auto-implement \
  -n YOUR_TEAM_NAME \
  --ide YOUR_IDE
```

| Flag | Values | Notes |
|------|--------|-------|
| `-w` | Comma-separated workflow names | All eight listed above |
| `-n` | Namespace prefix | Lowercase, starts with letter, 2-30 chars |
| `--ide` | `claude`, `cursor`, `codex`, `all` (`both` still works) | IDE integration target |

Also works with `npx` and `pnpx` instead of `bunx`.

All artifacts go to `_<namespace>_output/`.

---

## Recommended Workflow Chains

### Full Feature Lifecycle

```
product-spec --> technical-planning --> implement
```

1. **product-spec** -- define what to build
2. **technical-planning** -- define how to build it
3. **implement** -- build it with automated review

### Frontend Feature Lifecycle

```
product-spec --> technical-planning --> frontend-development
```

Same discovery flow, but use `frontend-development` instead of `implement` for UI-heavy work. Design decisions are documented before any code is written.

### Vision-First Lifecycle

```
product-vision --> product-spec --> technical-planning --> implement
```

1. **product-vision** -- define the big picture
2. **product-spec** -- define detailed feature specs within the vision
3. **technical-planning** -- define how to build each feature
4. **implement** -- build it with automated review

### Quick Implementation

```
auto-implement
```

Skip all manual steps. Give it an idea and get working code with tests and review -- fully autonomous. Best when scope is clear and you trust autonomous product decisions. Review `decision-log.md` after.

### Standalone Utilities

- **ask-codebase** -- understand existing behavior before changing it
- **debug** -- systematic root-cause analysis for bugs

---

## Workflows

### ask-codebase

**Purpose:** Answer questions about existing behavior by gathering technical context, then translating to functional understanding.

**Invocation:**

```
/agentic:workflow:ask-codebase [<input>]
```

**Inputs:** No args (prompts you), `question.md` file, GitHub issue (`#123` or URL), or inline text.

**Steps:**

1. Input Classification
2. Architect Context Gathering
3. Functional Understanding Synthesis
4. User Confirms Understanding (loop until clear)
5. Answer Question

**Key rules:** Interactive. Blocks if material ambiguity remains.

**Artifacts:** `_<namespace>_output/task/ask-codebase/{topic}/{instance_id}/`

- `workflow-state.yaml`, `input-question.md`, `technical-context.md`, `functional-understanding.md`, `answer.md`

**Example:**

```
/agentic:workflow:ask-codebase How does the authentication middleware handle token refresh?
```

```
/agentic:workflow:ask-codebase #42
```

---

### product-spec

**Purpose:** Transform a rough idea into a precise product spec through rigorous questioning.

**Invocation:**

```
/agentic:workflow:product-spec [--auto] [<input>]
```

**Inputs:**

| Input | Behavior |
|-------|----------|
| No args | Interactive discovery session |
| `--auto` | Autonomous mode, minimal prompts |
| `notes.md` | Uses file as starting context |
| `--auto notes.md` | Fully autonomous from file |

**Steps:**

1. Input Detection
2. Context Gathering
3. Product Discovery
4. Confirm Discovery (loop)
5. Product Questioning
6. Write Spec

**Key rules:** Won't write spec if critical questions remain. Interactive by default.

**Artifacts:** `_<namespace>_output/product/specs/{topic}/{instance_id}/`

- `workflow-state.yaml`, `decision-log.md`, `context-{topic}.md`, `discovery-{topic}.md`, `product-decisions.md`, `spec-{topic}.md`

**Example:**

```
/agentic:workflow:product-spec I want to add a dashboard that shows real-time metrics for API usage
```

```
/agentic:workflow:product-spec --auto ./notes/dashboard-idea.md
```

---

### product-vision

**Purpose:** Transform a rough idea into a comprehensive product vision document through creative brainstorming and rigorous questioning.

**Invocation:**

```
/agentic:workflow:product-vision [<input>]
```

**Inputs:** No args (prompts you) or `notes.md` file path.

**Steps:**

1. Input Detection
2. Context Gathering
3. Creative Exploration (brainstorming, 100+ ideas)
4. Vision Discovery
5. Confirm Vision (loop)
6. Vision Deepening
7. Write Vision Document

**Key rules:** Always interactive. Won't write vision if critical questions remain. Uses 62 brainstorming techniques across 10 categories.

**Artifacts:** `_<namespace>_output/product/vision/{topic}/{instance_id}/`

- `workflow-state.yaml`, `context-{topic}.md`, `brainstorming-{topic}.md`, `discovery-{topic}.md`, `vision-decisions.md`, `vision-{topic}.md`

**Example:**

```
/agentic:workflow:product-vision We need a developer analytics platform for engineering teams
```

---

### technical-planning

**Purpose:** Transform a spec/PRD/story into a detailed technical plan with explicit tasks.

**Invocation:**

```
/agentic:workflow:technical-planning [<input>]
```

**Inputs:** No args, `spec.md` path, GitHub issue, or inline text.

**Steps:**

1. Input Classification
2. Architect Context Gathering
3. Confirm Context (loop)
4. Technical Questioning
5. Generate Plan

**Key rules:** Interactive only. Extracts architecture and design decisions from you. Structural questions block plan generation.

**Artifacts:** `_<namespace>_output/task/technical-planning/{topic}/{instance_id}/`

- `workflow-state.yaml`, `technical-context.md`, `technical-decisions.md`, `technical-plan.md`

**Example:**

```
/agentic:workflow:technical-planning ./_acme_output/product/specs/dashboard/abc123/spec-dashboard.md
```

---

### implement

**Purpose:** Takes a technical plan, implements code + tests + review. Optionally creates a PR.

**Invocation:**

```
/agentic:workflow:implement <technical-plan>
```

**Input:** Path to `technical-plan.md` (hard gate -- must be a valid plan).

**Steps:**

1. Validate Plan
2. Software Engineer Implement (auto)
3. Test Engineer (auto)
4. Review Loop (auto, max 3 iterations)
5. PR Creation (optional, interactive)

**Key rules:** Fully automated implementation. Uses subagents: software-engineer, test-engineer, qa, test-qa, security-qa. Review loops until quality gates pass or 3 iterations hit.

**Artifacts:** `_<namespace>_output/task/implement/{topic}/{instance_id}/`

- `workflow-state.yaml`, `decision-log.md`, `technical-plan.md`, `implementation-log.md`, `test-log.md`, `qa-{n}.md`, `test-qa-{n}.md`, `security-{n}.md`

**Example:**

```
/agentic:workflow:implement ./_acme_output/task/technical-planning/dashboard/abc123/technical-plan.md
```

---

### debug

**Purpose:** Systematic, evidence-based debugging.

**Invocation:**

```
/agentic:workflow:debug [<input>]
```

**Input required:** `error.log` file, GitHub issue, or inline error text.

**Steps:**

1. Input Classification
2. Root Cause Investigation
3. Pattern Analysis
4. Hypothesis Testing (max 3 per cycle)
5. Regression Test (failing test before fix)
6. Fix Implementation
7. QA Loop (max 3)

**Iron Laws:**

- No fixes without confirmed root cause
- One hypothesis tested at a time
- 3 failed hypotheses = question the architecture

**Key rules:** Fully autonomous. Escalates to human if stuck.

**Artifacts:** `_<namespace>_output/debug/{session_id}/`

- `workflow-state.yaml`, `decision-log.md`, `bug-report.md`, `investigation-log.md`, `evidence.md`, `hypothesis-log.md`, `regression-test-log.md`, `fix-log.md`, `qa-{n}.md`, `test-qa-{n}.md`, `escalation.md`

**Example:**

```
/agentic:workflow:debug TypeError: Cannot read properties of undefined (reading 'map') at UserList.tsx:42
```

```
/agentic:workflow:debug ./logs/error.log
```

---

### frontend-development

**Purpose:** Systematic frontend development from idea to implementation. Design first, then code.

**Invocation:**

```
/agentic:workflow:frontend-development [<input>]
```

**Input required:** Feature description, path to `spec.md`, or design URL (e.g. Figma).

**Steps:**

1. Input Classification -- parse input, init state
2. UI/UX Design (UI/UX Designer subagent) -- document visual decisions: colors, typography, spacing, components
3. UX Adjustment (UI/UX Designer) -- refine interaction patterns, error states, loading states
4. Implementation (Frontend Developer subagent) -- implement following `design-decisions.md` exactly
5. QA Review (QA subagent) -- verify implementation matches design, loop if issues (max 3)

**Iron Laws:**

- Design before code
- Visual decisions documented before implementation
- UX patterns defined before interaction code

**Key rules:** Fully autonomous. Escalates if design is ambiguous or 3 QA iterations pass without resolution.

**Artifacts:** `_<namespace>_output/frontend/{session_id}/`

- `workflow-state.yaml`, `decision-log.md`, `design-decisions.md`, `implementation-log.md`, `qa-review.md`, `escalation.md`

**Example:**

```
/agentic:workflow:frontend-development Build a settings page with profile editing, notification preferences, and theme toggle
```

```
/agentic:workflow:frontend-development ./_acme_output/product/specs/settings/abc123/spec-settings.md
```

---

### auto-implement

**Purpose:** Idea to working code, fully autonomous. Gathers codebase context, makes product decisions, creates a technical plan, then implements -- all without manual intervention.

**Invocation:**

```
/agentic:workflow:auto-implement [<input>]
```

**Inputs:** No args (prompts you), `idea.md` file, GitHub issue (`#123` or URL), or inline text.

**Steps:**

1. Input Detection
2. Architect Context Gathering (autonomous)
3. PM Autonomous Decisions
4. Generate Technical Plan (autonomous)
5. Launch Implement Workflow (autonomous)

**Key rules:** Always autonomous. All decisions logged with confidence scores. Low-confidence decisions (<90%) flagged for post-implementation review.

**Artifacts:** `_<namespace>_output/task/auto-implement/{topic}/{instance_id}/`

- `workflow-state.yaml`, `decision-log.md`, `input-idea.md`, `technical-context.md`, `functional-understanding.md`, `product-decisions.md`, `technical-plan.md`

**Example:**

```
/agentic:workflow:auto-implement Add API rate limiting per tenant with configurable thresholds
```

```
/agentic:workflow:auto-implement #42
```

---

## Typical Workflow Chain

The most powerful pattern chains three workflows end-to-end:

```
product-spec --> technical-planning --> implement
```

1. Run `product-spec` to define what to build (use `--auto` if you already know what you want)
2. Run `technical-planning` with the generated spec as input
3. Answer the architecture/design questions
4. Run `implement` with the generated plan

```bash
# Step 1: spec
/agentic:workflow:product-spec I want to add API rate limiting per tenant

# Step 2: plan from spec
/agentic:workflow:technical-planning _acme_output/product/specs/rate-limiting/abc123/spec-rate-limiting.md

# Step 3: implement from plan
/agentic:workflow:implement _acme_output/task/technical-planning/rate-limiting/def456/technical-plan.md
```

Or skip all manual steps with auto-implement:

```bash
/agentic:workflow:auto-implement I want to add API rate limiting per tenant
```

For UI-heavy features, replace `implement` with `frontend-development` in step 3.

---

## Tips for Solo Devs

**Use `--auto` on product-spec when you already know what you want.** Skip the interactive questioning and let it generate the spec from your notes. Review and iterate after.

**Chain `ask-codebase` before `technical-planning`.** When modifying existing code, run `ask-codebase` first to understand current behavior. Feed that understanding into your planning.

**Let `implement` handle the review loop.** The QA and security subagents catch issues you might miss when working alone. Don't skip the review iterations.

**Use `debug` instead of manual investigation.** The systematic hypothesis approach prevents rabbit holes. Feed it the raw error and let it work.

**Use `frontend-development` for UI work.** It forces design-first thinking and produces documented design decisions, which matters when you revisit the code months later.

**Keep `technical-planning` interactive.** Even solo, the questioning phase surfaces edge cases. Answer honestly -- "I don't know" is valid and leads to better plans.

**Use `auto-implement` when scope is clear.** Skips interactive planning entirely. All product and technical decisions are autonomous. Review `decision-log.md` for assumptions. Best for well-understood features where you trust the AI's judgment.
