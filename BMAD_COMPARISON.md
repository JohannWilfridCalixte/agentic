# BMAD Method vs Agentic Framework Comparison

Deep analysis of [BMAD v6](https://github.com/bmad-code-org/BMAD-METHOD) methodology compared to this repository's practices.

---

## Executive Summary

| Aspect | BMAD v6 | Agentic |
|--------|---------|---------|
| **Philosophy** | Facilitation over generation | Spec-driven traceability |
| **Scale** | Small to enterprise (3 tracks) | Single unified workflow |
| **Agents** | 9 named personas | 13 role-based prompts |
| **Workflows** | Phased with step-file architecture | Linear with handoffs |
| **Configuration** | YAML-driven with module system | Static markdown templates |
| **Automation** | Sprint status tracking (YAML) | GitHub issue sync (scripts) |
| **IDE Support** | Claude Code, Cursor, Windsurf | Claude Code, Cursor |

---

## 1. Methodology Philosophy

### BMAD v6: Adaptive Facilitation
- **Core principle**: "Facilitation over generation" — agents guide decisions, don't auto-generate
- **Fresh Chat Protocol**: Each workflow requires new chat session to prevent context pollution
- **Architecture-first stories**: Epics/stories generated AFTER architecture, enabling tech-informed decomposition
- **Conversation-driven**: Heavy emphasis on user interaction at each step

### Agentic: Evidence-Driven Traceability
- **Core principle**: Every code change traceable to product intent, verifiable by automated checks
- **Stable IDs**: EPIC-####, US-####, AC-01, TASK-01, SEC-REQ-01 for full traceability
- **Evidence policy**: "Never claim passes/secure without proof" — must provide command output
- **RETRO-001 lessons**: Embeds real production bugs and prevention strategies directly in prompts

**Verdict**: BMAD focuses on AI-human collaboration quality; Agentic focuses on output auditability.

---

## 2. Project Phases & Workflows

### BMAD v6: Four-Phase Architecture

```
┌─────────────┐   ┌──────────────┐   ┌───────────────┐   ┌─────────────────────┐
│  ANALYSIS   │ → │   PLANNING   │ → │  SOLUTIONING  │ → │   IMPLEMENTATION    │
│  (optional) │   │  (required)  │   │  (selective)  │   │     (iterative)     │
└─────────────┘   └──────────────┘   └───────────────┘   └─────────────────────┘
│ Brainstorm     │ PRD             │ Architecture      │ Sprint Planning
│ Research       │ UX Design       │ Epics & Stories   │ Story Creation
│ Product Brief  │                 │ Impl Readiness    │ Dev Story
└────────────────┴─────────────────┴───────────────────┴─────────────────────────
```

**Three Planning Tracks**:
| Track | Scale | Artifacts |
|-------|-------|-----------|
| Quick Flow | 1-15 stories | Tech-spec only |
| BMad Method | 10-50+ stories | PRD + Architecture + UX |
| Enterprise | 30+ stories | PRD + Architecture + Security + DevOps |

### Agentic: Linear Spec-Driven Flow

```
┌──────────────┐   ┌──────────────┐   ┌────────────────┐   ┌──────────────┐
│   VISION     │ → │    PRODUCT   │ → │   TECHNICAL    │ → │    IMPL      │
│  (CPO/CTO)   │   │    (PM)      │   │ (Architect x2) │   │  (Editor)    │
└──────────────┘   └──────────────┘   └────────────────┘   └──────────────┘
│ Vision docs     │ PRD w/ Epics   │ Technical Context  │ Code + Tests
│ Tech vision     │ User Stories   │ Technical Plan     │ Impl Log
│                 │ Acceptance Crit│ Data Transform     │
└─────────────────┴────────────────┴────────────────────┴────────────────
                                          ↓
                            ┌─────────────────────────────┐
                            │         REVIEW LOOP         │
                            ├─────────────────────────────┤
                            │ QA Agent → Security QA      │
                            │ DX Review (optional)        │
                            └─────────────────────────────┘
```

**Key difference**: BMAD separates architecture from implementation planning; Agentic combines them with explicit handoff artifacts.

---

## 3. Agent Design & Personas

### BMAD v6: Named Persona System

| Agent | Name | Icon | Role |
|-------|------|------|------|
| Analyst | Mary | 📊 | Business analysis, requirements elicitation |
| PM | John | 📋 | PRD creation, stakeholder alignment |
| Architect | Winston | 🏗️ | Technical design, scalability patterns |
| Scrum Master | Bob | 🏃 | Sprint planning, story preparation |
| Developer | Amelia | 💻 | Implementation, test-first coding |
| Test Architect | Murat | 🧪 | Test framework, quality gates |
| Quick Flow | Barry | 🚀 | Solo dev for small projects |
| UX Designer | (varies) | 🎨 | Interface design |
| BMad Master | 🧙 | 🧙 | Meta-orchestrator, task executor |

**Structure** (YAML):
```yaml
agent:
  metadata:
    id: "_bmad/bmm/agents/pm.md"
    name: John
    title: Product Manager
    icon: 📋
  persona:
    role: "Product Manager specializing in..."
    identity: "Product management veteran with 8+ years..."
    communication_style: "Asks 'WHY?' relentlessly like a detective..."
    principles: |
      - Channel expert product manager thinking
      - PRDs emerge from user interviews
  critical_actions:
    - "READ entire story file BEFORE implementation"
  menu:
    - trigger: CP or fuzzy match on create-prd
      exec: "{project-root}/_bmad/bmm/workflows/..."
```

### Agentic: Role-Based Prompts

| Agent | Focus | Output Location |
|-------|-------|-----------------|
| CPO | Product vision, roadmap | `documentation/product/vision/` |
| CTO | Technical vision, NFRs | `documentation/tech/vision/` |
| PM | PRD, epics, user stories | `documentation/product/prd/` |
| Architect-Context | Technical context extraction | `documentation/task/.../technical-context.md` |
| Architect-Plan | Implementation planning | `documentation/task/.../technical-plan.md` |
| Editor | Code implementation | Project codebase + `implementation-log.md` |
| QA | Code review vs specs | `documentation/task/.../qa-{N}.md` |
| Security-Context | Threat modeling | `documentation/task/.../security-addendum.md` |
| Security-QA | Security code review | `documentation/task/.../security-{N}.md` |
| DX | Tooling, CI, repo ergonomics | `documentation/tech/dx/` |

**Structure** (Markdown):
```markdown
# PM Agent

## Role
Product-only artifacts (epics, user stories, acceptance criteria)

## Input Rules
- Must receive: Vision docs or stakeholder input
- May receive: Previous PRD for iteration

## Output Format
- Path: `documentation/product/prd/{epicNumber}-EPIC-{epicName}/`
- Files: `epic.md`, `US-{usNumber}.md`

## Guardrails
- AC format: Gherkin with stable IDs (AC-01, AC-02)
- Include "Input Format Specification" per RETRO-001
```

**Key differences**:
- BMAD uses named personas with distinct communication styles ("Asks WHY relentlessly")
- Agentic uses role-based prompts with explicit output paths and format specifications
- BMAD agents have menus with fuzzy-match triggers; Agentic agents are standalone prompts
- BMAD embeds critical_actions in YAML; Agentic embeds guardrails in prose

---

## 4. Workflow Execution Architecture

### BMAD: Step-File Architecture

```
workflow/
├── workflow.md          # Entry point with mode detection
├── workflow.yaml        # Configuration & variables
├── instructions.xml     # Detailed execution instructions
├── checklist.md         # Validation checklist
├── steps-c/             # Create mode steps
│   ├── step-01-init.md
│   ├── step-02-discovery.md
│   └── ...
├── steps-v/             # Validate mode steps
├── steps-e/             # Edit mode steps
└── templates/           # Output templates
```

**Execution rules** (explicit in workflows):
1. 🛑 NEVER load multiple step files simultaneously
2. 📖 ALWAYS read entire step file before execution
3. 🚫 NEVER skip steps or optimize sequence
4. ⏸️ ALWAYS halt at menus and wait for user input
5. 💾 ALWAYS update frontmatter when completing step

**Workflow types**:
- `.md` files: Direct execution with embedded logic
- `.yaml` files: Configuration with external instructions (XML)
- Supports tri-modal workflows (Create/Validate/Edit)

### Agentic: Direct Prompt Execution

Each agent is a self-contained markdown prompt. Workflow orchestration via:
1. Human invokes agent with `@.agentic/agents/{agent}.md`
2. Agent produces output to specified path
3. Next agent manually invoked with previous output as input
4. Scripts (`sync-to-github.sh`, `create-pr.sh`) automate transitions

**No step-file architecture** — entire agent guidance in single file.

**Key differences**:
- BMAD has runtime workflow engine with state tracking
- Agentic relies on human orchestration between agents
- BMAD supports mode switching within workflows; Agentic has separate agents

---

## 5. Configuration & Module System

### BMAD: YAML-Based Module System

```yaml
# module.yaml
code: bmm
name: "BMad Method Agile-AI Driven-Development"

project_name:
  prompt: "What is your project called?"
  default: "{directory_name}"

user_skill_level:
  prompt: "What is your development experience level?"
  single-select:
    - value: "beginner"
      label: "Beginner - Explain things clearly"
    - value: "expert"
      label: "Expert - Be direct and technical"

planning_artifacts:
  prompt: "Where should planning artifacts be stored?"
  default: "{output_folder}/planning-artifacts"
```

**Features**:
- Interactive prompts during install
- Skill-level-aware communication
- Multi-language support (`communication_language`, `document_output_language`)
- Module composition (core + bmm + sub-modules)

### Agentic: Static Template System

```typescript
// paths.ts
export const AGENTS_DIR = path.join(SRC_DIR, 'agents');
export const SCRIPTS_DIR = path.join(SRC_DIR, 'scripts');
export const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
```

```markdown
<!-- claude.md.template -->
## Agentic Framework

Agents in `.agentic/agents/` - load with `@.agentic/agents/{agent}.md`
Skills in `.claude/skills/` - auto-loaded
```

**Features**:
- CLI installs to fixed paths (`.agentic/`, `.claude/skills/`)
- Templates appended to existing CLAUDE.md
- No interactive configuration

**Key differences**:
- BMAD has rich install-time configuration; Agentic is zero-config
- BMAD supports skill-level-aware output; Agentic produces uniform output
- BMAD separates planning vs implementation artifact locations

---

## 6. Status Tracking & Automation

### BMAD: YAML-Based Sprint Tracking

```yaml
# sprint-status.yaml
sprint_name: "Sprint 1 - MVP Foundation"
sprint_goal: "Establish core auth and database infrastructure"
started_at: "2024-01-15T10:00:00Z"
sprint_stories_total: 8

development_status:
  epic-1: "in-progress"
  1-1-project-setup: "done"
  1-2-database-schema: "in-progress"
  1-3-auth-endpoints: "ready-for-dev"
  epic-1-retrospective: "backlog"
```

**Workflow integrations**:
- `dev-story` workflow auto-discovers next `ready-for-dev` story
- Auto-updates status to `in-progress` when starting
- Sprint planning creates tracking file from epics document

### Agentic: GitHub-Centric Automation

```bash
# sync-to-github.sh
# Extracts YAML frontmatter, creates/updates GitHub issues
# Tracks sync state in .gh-sync-state.json
# Sets labels (User Story, Technical Plan, Epic)
# Creates parent-child relationships via GraphQL

# sync-all.sh
# Multi-phase sync:
# Phase 1: Vision docs (no parents)
# Phase 2: Epics
# Phase 3: User Stories
# Phase 4: Technical artifacts
```

**Key differences**:
- BMAD tracks status locally in YAML files
- Agentic syncs everything to GitHub issues for visibility
- BMAD has automated story discovery; Agentic requires manual invocation
- Both support status tracking, different implementations

---

## 7. Skills vs Shared Knowledge

### BMAD: Knowledge Base System

```
testarch/
├── tea-index.csv        # Index of knowledge fragments
└── knowledge/           # Domain-specific knowledge files
    ├── playwright.md
    ├── api-testing.md
    └── ...
```

Agents consult index, load relevant fragments on demand:
```yaml
critical_actions:
  - "Consult {project-root}/_bmad/bmm/testarch/tea-index.csv"
  - "Load fragments from knowledge/ before giving recommendations"
```

### Agentic: Skills as Reusable Prompts

```
skills/
├── typescript-engineer/SKILL.md
├── clean-architecture/SKILL.md
├── technical-planning/SKILL.md
└── ...
```

Each skill is YAML frontmatter + markdown, auto-loaded by Claude Code:
```markdown
---
name: typescript-engineer
description: Types, error handling, patterns
---

## interface vs type
- Objects → interface
- Unions → type

## Red Flags
- ❌ `any` or `as` casts
- ❌ Mutable state
```

**Key differences**:
- BMAD knowledge is agent-specific (TEA has test knowledge)
- Agentic skills are cross-cutting (all agents share TypeScript patterns)
- BMAD loads knowledge on-demand; Agentic auto-loads all skills

---

## 8. Testing & Quality Philosophy

### BMAD: Test Architect (TEA) Agent

Dedicated agent with workflows:
| Workflow | Purpose |
|----------|---------|
| `test-framework` | Initialize production-ready test architecture |
| `atdd` | Generate tests BEFORE implementation |
| `test-automate` | Comprehensive automation framework |
| `test-design` | Create test scenarios ahead of dev |
| `test-trace` | Map requirements → tests → quality gate |
| `nfr-assess` | Validate non-functional requirements |

**Principles**:
- Risk-based testing (depth scales with impact)
- Lower test levels preferred (unit > integration > E2E)
- API tests are first-class citizens
- Flakiness is critical technical debt

### Agentic: QA Agent + Editor Evidence

QA Agent reviews against:
- Technical plan compliance
- Acceptance criteria traceability (AC-01 → test location)
- Reference comparison tests (RETRO-001 requirement)
- Switch statement exhaustiveness checks

Editor Agent evidence policy:
```markdown
## Evidence Policy
- Must provide lint/typecheck/test commands + results
- If cannot run, state why + what CI will run
- For calculations: end-to-end scenarios vs reference values
```

**Key differences**:
- BMAD has dedicated test architecture workflow separate from dev
- Agentic integrates testing expectations into Editor and QA agents
- BMAD emphasizes test-first; Agentic emphasizes verification evidence

---

## 9. Security Integration

### BMAD: Enterprise Track Only

Security considerations in Enterprise planning track, no dedicated security agent in base module.

### Agentic: First-Class Security Agents

Two dedicated agents:
| Agent | Focus |
|-------|-------|
| Security-Context | Threat modeling, SEC-REQ-## requirements, OWASP mapping |
| Security-QA | IDOR, injection, auth/session, CSRF, rate limiting review |

Security addendum required for all stories in multi-tenant contexts:
```markdown
## Security Objectives
## Assets/Actors/Trust Boundaries
## Multi-Tenancy Isolation (mandatory)
## Security Verification Matrix
```

**Key difference**: Agentic treats security as mandatory workflow step; BMAD defers to enterprise track.

---

## 10. Lessons Learned Integration

### BMAD: N/A

No visible mechanism for embedding lessons learned into prompts.

### Agentic: RETRO-001 Pattern

Explicit lessons embedded across agents:

**Problem**: Formulas correct, inputs wrong. PRD specified idealized inputs, real data had different formats.

**Integration**:
| Agent | New Requirement |
|-------|-----------------|
| PM | Add "Input Format Specification" + "Reference Validation Scenarios" |
| Architect | Add "Data Transformation Layer", require integration tests with raw formats |
| QA | Verify reference comparison tests, flag silent switch defaults as Blocker |
| Team Workflow | Shared guardrails document references RETRO lessons |

**Key difference**: Agentic embeds production incident learnings directly into prompt DNA; BMAD relies on workflow structure to prevent issues.

---

## 11. Strengths & Weaknesses

### BMAD v6

**Strengths**:
- Adaptive to project scale (3 tracks)
- Rich workflow engine with state tracking
- Named personas enhance user experience
- Dedicated test architecture agent
- Interactive configuration system
- Fresh chat protocol prevents context pollution

**Weaknesses**:
- Complex setup (module installation, YAML configs)
- No embedded lessons-learned mechanism
- Security considerations limited to enterprise track
- Heavy reliance on workflow discipline ("never skip steps")
- May overwhelm small projects

### Agentic

**Strengths**:
- Zero-config installation
- Strong traceability (stable IDs, evidence policy)
- Security as first-class concern
- RETRO-001 lessons embedded in prompts
- GitHub-native automation
- Clean architecture patterns built into skills

**Weaknesses**:
- Single workflow path (no scale adaptation)
- Manual agent orchestration required
- No runtime status tracking
- Less interactive (no skill-level adaptation)
- No dedicated test architecture workflow

---

## 12. Recommendations for Agentic

Based on BMAD analysis, consider adopting:

### High Value
1. **Sprint status tracking** — Local YAML file for automated story discovery
2. **Step-file architecture** — Break complex workflows into sequential steps with explicit state
3. **Skill-level adaptation** — Adjust output verbosity based on user experience
4. **Fresh chat guidance** — Recommend session boundaries in prompts

### Medium Value
5. **Named personas** — Add names/icons for agent memorability
6. **Tri-modal workflows** — Support Create/Validate/Edit modes for key artifacts
7. **Test Architecture agent** — Dedicated agent for test framework decisions

### Low Value (complexity vs benefit)
8. **Module system** — Over-engineered for current scope
9. **Multiple planning tracks** — Adds decision overhead

---

## Unresolved Questions

1. **BMAD's "party mode"**: Referenced but not explored — what is multi-agent coordination?
2. **BMAD teams**: How do `team-fullstack.yaml` and `default-party.csv` compose agents?
3. **Agentic workflow gaps**: No automated story discovery — intentional or missing feature?
4. **Evidence verification**: How to enforce evidence policy when AI can fabricate command output?
