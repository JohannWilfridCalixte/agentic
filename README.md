# @JohannWilfridCalixte/agentic

Multi-agent framework for Claude Code + Cursor. Agents, skills, workflows and scripts for spec-driven development.

## Setup

This package is hosted on GitHub Packages. One-time auth setup required:

1. Create a [GitHub PAT](https://github.com/settings/tokens) with `read:packages` scope
2. Add to `~/.npmrc`:

```
@JohannWilfridCalixte:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
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

Auto-detects existing IDE setups and updates them. Supports same `--ide` and `--output` options.

## What It Does

1. Creates `.claude/` and/or `.cursor/` with agents and skills
2. Template-processes files (`.md`, `.yaml`, `.sh`) with IDE paths and output folder
3. Sets up `CLAUDE.md` and/or `.cursor/rules/agentic.mdc`

Workflow artifacts (specs, plans, logs) go to the configured output folder (`_agentic_output` by default).

## Usage

### Workflows

| Workflow | Description |
|----------|-------------|
| `agentic:quick-spec-and-implement` | Spec-to-PR: PM → Architect → Security → Editor → QA → PR |
| `agentic:auto-implement` | Autonomous implementation from spec/plan to PR |
| `agentic:product-spec` | Product discovery → PRD |
| `agentic:debug` | Systematic debugging to verified fix |

**quick-spec-and-implement** runs interactively (asks for clarification, pauses at review).

**auto-implement** classifies input (product/technical-plan/mixed) and routes through agents automatically.

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

### Skills

Reusable skill definitions:

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
| `ux-patterns` | UI/UX patterns |
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
agentic list                    # List agents/scripts
agentic help                    # Show help
```

Options:
- `--ide <claude|cursor|both>` - Target IDE (init: both, update: auto-detect)
- `--output <folder>` - Output folder for workflow artifacts (default: `_agentic_output`)

## Project Structure After Init

```
your-project/
├── .claude/                 # if --ide claude or both
│   ├── agents/              # Strategic agents + subagents
│   └── skills/              # Skill definitions (incl. workflows, scripts)
├── .cursor/                 # if --ide cursor or both
│   ├── agents/              # Strategic agents + subagents
│   ├── skills/              # Skill definitions (incl. workflows, scripts)
│   └── rules/
│       └── agentic.mdc      # Cursor rules
├── _agentic_output/         # Workflow artifacts (configurable via --output)
│   ├── product/             # PRDs, specs, designs
│   ├── task/                # Technical plans, implementation logs
│   └── tech/                # Vision docs, DX docs
├── CLAUDE.md                # Claude Code config (if claude)
```

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run bin/agentic.ts
```

## Publishing

Push a version tag to auto-publish to GitHub Packages:

```bash
git tag v0.1.0
git push --tags
```
