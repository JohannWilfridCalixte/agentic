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

Or target a specific IDE:

```bash
bunx @JohannWilfridCalixte/agentic@alpha init --ide claude
bunx @JohannWilfridCalixte/agentic@alpha init --ide cursor
```

## What It Does

1. Creates `.agentic/` with agents, scripts and workflows
2. Creates `.claude/` with agents, subagents, skills and commands
3. Creates `.cursor/` with agents, subagents, skills and commands
4. Sets up `CLAUDE.md` and/or `.cursor/rules/agentic.mdc`

## Usage

### Workflows (slash commands)

| Command | Description |
|---------|-------------|
| `/agentic:quick-spec-and-implement [--auto] [input]` | Spec-to-PR: PM → Architect → Security → Editor → QA → PR |
| `/agentic:auto-implement [input]` | Autonomous implementation from spec/plan to PR |

**quick-spec-and-implement** runs interactively by default (asks for clarification, pauses at review). Add `--auto` for fully autonomous mode.

**auto-implement** classifies input (product/technical-plan/mixed) and routes through the appropriate agents automatically.

### Agents

Strategic agents defining team roles (copied to `.agentic/agents/`, `.claude/agents/`, `.cursor/agents/`):

| Agent | Role |
|-------|------|
| `cpo` | Product vision & roadmap |
| `cto` | Technical vision & architecture principles |
| `dx` | Developer experience, tooling, CI |
| `team-and-workflow` | Multi-agent team structure & collaboration rules |

### Subagents

Specialized agents invoked by workflows (copied to `.claude/agents/`, `.cursor/agents/`):

| Subagent | Role |
|----------|------|
| `pm` | Product specs: epics, user stories, acceptance criteria |
| `architect` | Context gathering + technical planning |
| `editor` | Code implementation following technical plan |
| `qa` | Review against acceptance criteria & coding standards |
| `security` | Threat modeling & security requirements |
| `security-qa` | Security vulnerability review |

### Skills

19 reusable skill definitions (copied to `.claude/skills/`, `.cursor/skills/`):

| Skill | Purpose |
|-------|---------|
| `auto-implement` | Autonomous implementation workflow |
| `quick-spec-and-implement` | Spec-to-PR workflow |
| `product-manager` | Product artifacts (epics, stories, ACs) |
| `gather-technical-context` | Codebase analysis & context extraction |
| `technical-planning` | Task breakdown & verification matrix |
| `typescript-engineer` | TypeScript implementation patterns |
| `typescript-imports` | TypeScript import handling |
| `clean-architecture` | Clean architecture patterns |
| `frontend-design` | Frontend interface design |
| `observability` | Logging, metrics, tracing |
| `dx` | Developer experience tooling |
| `ux-patterns` | UI/UX patterns |
| `qa` | Quality assurance & testing |
| `security-context` | Threat modeling |
| `security-qa` | Security compliance review |
| `context7` | Library documentation lookup |
| `code` | Code patterns |
| `github` | GitHub integration |
| `product-vision` | Product vision guidance |
| `tech-vision` | Technical vision guidance |

### Scripts

Shell scripts in `.agentic/scripts/`:

| Script | Purpose |
|--------|---------|
| `sync-to-github.sh` | Push markdown to GitHub issue |
| `sync-from-github.sh` | Pull GitHub issue to markdown |
| `sync-all.sh` | Sync all documentation files |
| `create-pr.sh` | Create pull request |
| `resolve-parent.sh` | Resolve parent issue |

## CLI Commands

```bash
agentic init [--ide <claude|cursor|both>]  # Setup in project
agentic list                                # List agents/scripts
agentic help                                # Show help
```

## Project Structure After Init

```
your-project/
├── .agentic/
│   ├── agents/          # Strategic agents (cpo, cto, dx, team-and-workflow)
│   ├── scripts/         # Shell scripts
│   └── workflows/       # Multi-step workflow definitions
├── .claude/
│   ├── agents/          # All agents + subagents
│   ├── skills/          # Skill definitions
│   └── commands/        # Slash commands (agentic:*)
├── .cursor/
│   ├── agents/          # All agents + subagents
│   ├── skills/          # Skill definitions
│   ├── commands/        # Slash commands
│   └── rules/
│       └── agentic.mdc  # Cursor rules
└── CLAUDE.md            # Claude Code config
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
