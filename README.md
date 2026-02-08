# @JohannWilfridCalixte/agentic

Multi-agent framework for Claude Code + Cursor. Agents, skills, workflows and scripts for spec-driven development.

## ⚠️ Experimental

This is an experimental project for me to understand how to use AI agents to build software.

There's no strong guarantees that no breaking changes will be introduced.

If you decide to use it, you do so at your own risk.

## Setup
1. Add to `~/.npmrc`:

```
@JohannWilfridCalixte:registry=https://npm.pkg.github.com
```

## Install

```bash
bunx @JohannWilfridCalixte/agentic@alpha init
```

Options:

```bash
bunx @JohannWilfridCalixte/agentic@alpha init --ide claude    # claude only
bunx @JohannWilfridCalixte/agentic@alpha init --ide cursor    # cursor only
bunx @JohannWilfridCalixte/agentic@alpha init --output docs   # custom output folder
```

## Update

```bash
bunx @JohannWilfridCalixte/agentic@alpha update
```

Auto-detects existing IDE setups and updates them. Backs up `CLAUDE.md`/`AGENTS.md` before overwriting. Supports same `--ide` and `--output` options.

## What It Does

1. Creates `.claude/` and/or `.cursor/` with agents, subagents, and skills
2. Template-processes files (`.md`, `.yaml`, `.sh`) with IDE-specific paths, models, and output folder
3. Sets up `CLAUDE.md` and/or `.cursor/rules/agentic.mdc`
4. Adds output folder to `.gitignore`

Workflow artifacts (specs, plans, logs) go to the configured output folder (`_agentic_output/` by default).

## Usage

### Workflows

| Workflow | Description |
|----------|-------------|
| `agentic:quick-spec-and-implement` | Interactive spec-to-PR: PM → Architect → Security → Editor → QA → PR |
| `agentic:auto-implement` | Autonomous implementation from spec/plan to PR |
| `agentic:technical-planning` | Spec/PRD/story → detailed technical plan with all decisions resolved |
| `agentic:product-spec` | Product discovery → PRD |
| `agentic:debug` | Systematic debugging to verified fix |
| `agentic:frontend-development` | UI/UX design → visual decisions → frontend implementation |

### Agents

Strategic agents defining team roles:

| Agent | Role |
|-------|------|
| `cpo` | Product vision & roadmap |
| `cto` | Technical vision & architecture principles |
| `dx` | Developer experience, tooling, CI |
| `team-and-workflow` | Multi-agent team structure & collaboration rules |

### Subagents

Specialized agents invoked by workflows:

| Subagent | Role |
|----------|------|
| `pm` | Product specs: epics, user stories, acceptance criteria |
| `architect` | Context gathering + technical planning |
| `editor` | Code implementation following technical plan |
| `test-engineer` | Test writing |
| `qa` | Code quality review |
| `test-qa` | Test quality review |
| `security` | Threat modeling & security requirements |
| `security-qa` | Security vulnerability review |
| `investigator` | Root cause debugging |
| `analyst` | Pattern analysis |
| `ui-ux-designer` | Visual design & UX patterns |
| `frontend-developer` | Frontend implementation |

### Skills

**Development:**

| Skill | Purpose |
|-------|---------|
| `typescript-engineer` | TypeScript patterns, types, error handling |
| `typescript-imports` | Import ordering, grouping, type imports |
| `code` | Code implementation patterns |
| `code-testing` | Test strategy, mocking, flaky test debugging |
| `clean-architecture` | Decoupling, services, domain-driven design |
| `observability` | Logging, tracing, instrumentation |
| `qa` | Quality assurance review |
| `security-qa` | Security & privacy code review |
| `context7` | Up-to-date library documentation lookup |

**Product & Planning:**

| Skill | Purpose |
|-------|---------|
| `product-manager` | Epics, user stories, acceptance criteria |
| `product-discovery` | New feature exploration |
| `product-vision` | CPO-level direction |
| `gather-technical-context` | Codebase analysis before planning |
| `technical-planning` | Task breakdown, verification matrix |
| `brainstorming` | Dialogue-based design |

**Cross-Cutting:**

| Skill | Purpose |
|-------|---------|
| `security-context` | Threat modeling constraints |
| `tech-vision` | CTO-level technical direction |
| `dx` | Developer experience tooling |
| `ux-patterns` | UI/UX patterns (forms, modals, loading states) |
| `refactoring-ui` | Visual hierarchy, colors, typography, spacing |
| `github` | GitHub integration (with shell scripts) |

### GitHub Scripts

Located in `skills/github/scripts/`:

| Script | Purpose |
|--------|---------|
| `sync-to-github.sh` | Push markdown to GitHub issue |
| `sync-from-github.sh` | Pull GitHub issue to markdown |
| `sync-all.sh` | Sync all documentation files |
| `create-pr.sh` | Create pull request |
| `resolve-parent.sh` | Resolve parent issue |

## CLI Commands

```bash
agentic init|install [options]  # Setup in project
agentic update [options]        # Update existing setup
agentic list                    # List agents/skills
agentic version                 # Show installed version per IDE
agentic help                    # Show help
```

Options:
- `--ide <claude|cursor|both>` — target IDE (init: both, update: auto-detect)
- `--output <folder>` — output folder for workflow artifacts (default: `_agentic_output`)

## Project Structure After Init

```
your-project/
├── .claude/                 # if --ide claude or both
│   ├── agents/              # Strategic agents + subagents
│   ├── skills/              # Skill definitions (incl. workflows, scripts)
│   └── .agentic.settings.json
├── .cursor/                 # if --ide cursor or both
│   ├── agents/              # Strategic agents + subagents
│   ├── skills/              # Skill definitions (incl. workflows, scripts)
│   ├── rules/
│   │   └── agentic.mdc      # Cursor rules
│   └── .agentic.settings.json
├── _agentic_output/         # Workflow artifacts (configurable)
│   ├── product/             # PRDs, specs, designs
│   ├── task/                # Technical plans, implementation logs, QA reports
│   └── tech/                # Vision docs, DX docs
├── CLAUDE.md                # Claude Code config (if claude)
└── AGENTS.md                # Cursor agents config (if cursor)
```

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun test
bun run bin/agentic.ts          # run CLI
cd .tmp && bun run ../bin/agentic.ts init   # manual testing
```

## Publishing

Push a `v*` tag to auto-publish to GitHub Packages:

```bash
bun run bump <version>          # bumps, commits, tags, pushes
```
