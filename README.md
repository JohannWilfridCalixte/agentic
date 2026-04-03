# @JohannWilfridCalixte/agentic

Multi-agent framework for **Claude Code** + **Cursor** + **Codex**. Distributes agent prompts, skills, and orchestrated workflows for spec-driven development.

> ⚠️ **Experimental** — personal project to explore AI-driven development. No guarantees, no support. Use at your own risk.

## Table of Contents

- [Quick Start](#quick-start)
- [Setup Guides](#setup-guides)
- [What It Does](#what-it-does)
- [CLI Commands](#cli-commands)
- [Migrating from Older Versions](#migrate)
- [Options](#options)
- [Selective Install (`--workflows`)](#selective-install---workflows)
- [Namespace (`--namespace`)](#namespace---namespace)
- [Workflows](#workflows)
- [Agents](#agents)
- [Subagents](#subagents)
- [Skills](#skills)
- [Project Structure After Init](#project-structure-after-init)
- [Settings](#settings)
- [Development](#development-1)
- [Publishing](#publishing)

## Quick Start

Pick the setup that matches your role. Detailed guides explain each workflow, how to use them, and provide examples.

**Product Manager** — ask questions about the codebase, write product specs ([detailed guide](SETUP_PM.md)):

```bash
bunx @johannwilfridcalixte/agentic@beta init -w ask-codebase,product-spec -n YOUR_TEAM_NAME --ide YOUR_IDE
```

**Developer** — technical planning, implementation, debugging, PR review ([detailed guide](SETUP_DEV.md)):

```bash
bunx @johannwilfridcalixte/agentic@beta init -w technical-planning,implement,debug,pr-review -n YOUR_TEAM_NAME --ide YOUR_IDE
```

**Solo Developer** — full product-to-code pipeline + frontend ([detailed guide](SETUP_SOLO_DEV.md)):

```bash
bunx @johannwilfridcalixte/agentic@beta init -w ask-codebase,product-spec,product-vision,technical-planning,implement,debug,frontend-development,auto-implement,pr-review -n YOUR_TEAM_NAME --ide YOUR_IDE
```

> Replace `YOUR_TEAM_NAME` with a lowercase namespace (e.g. `myteam`) and `YOUR_IDE` with `claude`, `cursor`, `codex`, or `all` (`both` still works as alias).
> Also works with `npx` or `pnpx` instead of `bunx`.

Full install (all workflows, all IDEs):

```bash
bunx @johannwilfridcalixte/agentic@beta init
```

### Use workflows

In **Claude Code**, invoke workflows with colon syntax:

```
/agentic:workflow:ask-codebase            # question → code-informed answer
/agentic:workflow:product-spec            # idea → PRD
/agentic:workflow:product-vision           # idea → comprehensive product vision
/agentic:workflow:technical-planning      # spec → detailed technical plan
/agentic:workflow:implement               # plan → code → tests → review
/agentic:workflow:debug                   # systematic debugging
/agentic:workflow:frontend-development    # idea → design → frontend code
/agentic:workflow:auto-implement              # idea → autonomous code
/agentic:workflow:pr-review                   # PR → QA + security review
```

In **Cursor**, invoke workflows with dash syntax:

```
/agentic-workflow-ask-codebase
/agentic-workflow-product-spec
/agentic-workflow-product-vision
/agentic-workflow-technical-planning
/agentic-workflow-implement
/agentic-workflow-debug
/agentic-workflow-frontend-development
/agentic-workflow-auto-implement
/agentic-workflow-pr-review
```

In **Codex**, invoke workflows with dash syntax (same as Cursor):

```
/agentic-workflow-ask-codebase
/agentic-workflow-product-spec
/agentic-workflow-product-vision
/agentic-workflow-technical-planning
/agentic-workflow-implement
/agentic-workflow-debug
/agentic-workflow-frontend-development
/agentic-workflow-auto-implement
/agentic-workflow-pr-review
```

> With a custom namespace (e.g., `-n myteam`), replace `agentic` with your namespace: `/myteam:workflow:implement` (Claude Code) or `/myteam-workflow-implement` (Cursor/Codex).

## Setup Guides

Detailed guides with workflow explanations, step-by-step usage, and examples:

| Role | Guide | Workflows |
|------|-------|-----------|
| Product Manager | [SETUP_PM.md](SETUP_PM.md) | ask-codebase, product-spec, product-vision |
| Developer | [SETUP_DEV.md](SETUP_DEV.md) | technical-planning, implement, debug, pr-review |
| Solo Developer | [SETUP_SOLO_DEV.md](SETUP_SOLO_DEV.md) | All workflows |

## What It Does

1. Copies agents, subagents, skills, and workflows to `.claude/`, `.cursor/`, and/or `.agents/` (Codex)
2. Template-processes all files with IDE-specific paths, model names, and output folder
3. Sets up `CLAUDE.md` (Claude Code) and/or `AGENTS.md` (Cursor/Codex)
4. Adds the output folder to `.gitignore`
5. Persists configuration in `.agentic.settings.json` for updates

Workflow artifacts (specs, plans, implementation logs, QA reports) go to the configured output folder (`_agentic_output/` by default).

## CLI Commands

```bash
agentic init|install [options]    # Setup in current project
agentic update [options]          # Update existing setup
agentic migrate [options]         # Migrate from old unprefixed format
agentic settings apply [options]  # Update settings & reinstall agents
agentic list                      # List available agents/skills
agentic version                   # Show installed version per IDE
agentic help                      # Show help
```

### `init`

Sets up agentic in the current project. Creates IDE directories, copies all content, generates `CLAUDE.md`/`AGENTS.md`.

```bash
bunx @johannwilfridcalixte/agentic@beta init
bunx @johannwilfridcalixte/agentic@beta init --ide claude
bunx @johannwilfridcalixte/agentic@beta init --namespace myteam
bunx @johannwilfridcalixte/agentic@beta init --workflows implement,debug
bunx @johannwilfridcalixte/agentic@beta init --output docs
```

### `migrate`

Migrates from older versions that used unprefixed artifact names (e.g., `agents/software-engineer.md` instead of `agentic-agent-software-engineer.md`, `skills/code/` instead of `agentic-skill-code/`). Backs up old artifacts to timestamped directories, then runs `init`.

```bash
bunx @johannwilfridcalixte/agentic@beta migrate
bunx @johannwilfridcalixte/agentic@beta migrate --ide cursor
bunx @johannwilfridcalixte/agentic@beta migrate --namespace myteam --workflows implement,debug
```

**What it does:**

1. Auto-detects IDE setups (or uses `--ide`)
2. Moves old artifacts to `.{ide}_backup_{timestamp}/` preserving directory structure
3. Runs `init` with forwarded options
4. Prints backup dirs for manual review/deletion

**What gets backed up:**

- Old unprefixed agent files (`agents/software-engineer.md`, `agents/qa.md`, ...)
- Old unprefixed skill dirs (`skills/code/`, `skills/brainstorming/`, ...)
- Old workflow dirs (`skills/agentic-auto-implement/`, ...)
- Old aggregated skill dir (`skills/agentic/`)
- Cursor rule file (`rules/agentic.mdc`)

Accepts all `init` flags (`--ide`, `--namespace`, `--output`, `--workflows`).

### `update`

Auto-detects existing IDE setups and updates them. Backs up `CLAUDE.md` → `CLAUDE.backup.md` (and `AGENTS.md` → `AGENTS.backup.md`) before overwriting. Restores namespace, output folder, and workflow selection from saved settings unless overridden by CLI flags.

```bash
bunx @johannwilfridcalixte/agentic@beta update
bunx @johannwilfridcalixte/agentic@beta update --workflows implement    # change workflow set
bunx @johannwilfridcalixte/agentic@beta update --namespace newname      # change namespace
```

When `--workflows` changes on update, stale files from the previous workflow set are automatically cleaned up.

### `settings apply`

Updates settings (model names, namespace, workflows) and reinstalls agents without re-running full init. Useful for changing configuration after initial setup.

```bash
bunx @johannwilfridcalixte/agentic@beta settings apply --high-thinking-model sonnet
bunx @johannwilfridcalixte/agentic@beta settings apply --workflows debug,implement
bunx @johannwilfridcalixte/agentic@beta settings apply --namespace myteam
```

### `list`

Lists all available agents, subagents, skills, and workflows.

### `version`

Shows installed agentic version per IDE, read from `.agentic.settings.json`.

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--ide <type>` | | Target IDE: `claude`, `cursor`, `codex`, or `all` | `all` (init), auto-detect (update) |
| `--namespace <name>` | `-n` | Namespace prefix for all files and references | `agentic` |
| `--workflows <list>` | `-w` | Comma-separated workflows to install selectively | all (full install) |
| `--output <folder>` | | Output folder for workflow artifacts | `_<namespace>_output` |
| `--high-thinking-model <id>` | | Model for high-thinking agents | `opus` (Claude), `claude-4.6-opus-high-thinking` (Cursor) |
| `--code-writing-model <id>` | | Model for code-writing agents | same |
| `--qa-model <id>` | | Model for QA agents | same |
| `--version` | | Show installed version | |

## Selective Install (`--workflows`)

Instead of installing everything, install only the workflows you need and their dependencies (agents + skills) are automatically resolved.

```bash
# Install only debug and implement workflows
bunx @johannwilfridcalixte/agentic@beta init --workflows implement,debug

# Change workflow set later (stale files auto-cleaned)
bunx @johannwilfridcalixte/agentic@beta update --workflows debug
```

### Available workflows

| Workflow | Agents installed | Key skills |
|----------|-----------------|------------|
| `ask-codebase` | architect | gather-technical-context, context7 |
| `product-spec` | (none) | product-discovery, brainstorming |
| `product-vision` | cpo | product-vision, product-discovery, brainstorming |
| `technical-planning` | architect | gather-technical-context, technical-planning, code, language profile skills |
| `implement` | software-engineer, test-engineer, qa, test-qa, security-qa | all code skills |
| `debug` | investigator, analyst, test-engineer, software-engineer, qa, test-qa | code + diagnostic skills |
| `frontend-development` | ui-ux-designer, frontend-developer, qa | frontend-design, ux-patterns, refactoring-ui |
| `auto-implement` | architect, pm, software-engineer, test-engineer, qa, test-qa, security-qa | all code skills + product-manager |
| `pr-review` | architect, qa, test-qa, security-qa | gather-technical-context, code, qa, security-qa |

### Behavior

- Omitting `-w` installs everything (default)
- Multiple workflows: dependencies are unioned and deduplicated
- Unknown workflow names: warned and skipped (error if all are unknown)
- Workflow selection is persisted in settings and restored on `update`
- Changing workflows on `update` or `settings apply` removes stale files automatically

## Namespace (`--namespace`)

Rename all files and internal references from `agentic` to your custom prefix.

```bash
bunx @johannwilfridcalixte/agentic@beta init --namespace myteam
```

**What changes:**

| Before | After (`--namespace myteam`) |
|--------|------------------------------|
| `agentic-agent-software-engineer.md` | `myteam-agent-software-engineer.md` |
| `agentic-skill-code/` | `myteam-skill-code/` |
| `agentic-workflow-implement/` | `myteam-workflow-implement/` |
| `/agentic:workflow:implement` | `/myteam:workflow:implement` |
| `_agentic_output/` | `_myteam_output/` |
| `# Agentic Framework` | `# Myteam Framework` |

**Rules:** lowercase, starts with a letter, 2-30 characters, alphanumeric + hyphens (`^[a-z][a-z0-9-]{1,29}$`).

Namespace is persisted in settings and restored on `update`.

## Workflows

Workflows are orchestrated multi-step processes that coordinate agents to complete complex tasks.

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ask-codebase` | question about behavior | Architect context gathering → functional understanding → code-informed answer |
| `product-spec` | vague idea | Product discovery dialogue → precise PRD |
| `product-vision` | new product idea | Creative brainstorming → vision discovery → comprehensive vision document |
| `technical-planning` | spec/PRD/story | Gathers context → resolves decisions → produces detailed technical plan |
| `implement` | technical plan | Plan → Software Engineer code → Test Engineer tests → QA + Security review → optional PR |
| `debug` | bug/error/failure | Investigator evidence → Analyst hypothesis → Software Engineer fix → QA verify |
| `frontend-development` | UI feature | UI/UX design → visual decisions → frontend implementation |
| `auto-implement` | rough idea | Input detection → Architect context → PM decisions → Technical plan → Launch implement workflow |
| `pr-review` | PR number or URL | Classify PR → Choose output mode → Architect context → QA + Test QA + Security review → local report or PR comments |

## Agents

Strategic agents defining team-level roles and guidelines:

| Agent | Role |
|-------|------|
| `cto` | Technical vision, architecture principles |
| `dx` | Developer experience, tooling, CI, repo ergonomics |
| `team-and-workflow` | Multi-agent team structure and collaboration rules |

## Subagents

Specialized agents invoked by workflows to perform focused tasks:

| Subagent | Role |
|----------|------|
| `cpo` | Product vision, roadmap, decision principles |
| `pm` | Product specs: epics, user stories, acceptance criteria |
| `architect` | Codebase context gathering + technical planning |
| `software-engineer` | Code implementation following technical plan |
| `test-engineer` | Test writing following implementation |
| `qa` | Code quality review (not tests) |
| `test-qa` | Test quality and coverage review |
| `security` | Threat modeling and security requirements |
| `security-qa` | Security vulnerability and compliance review |
| `investigator` | Root cause investigation for debugging |
| `analyst` | Pattern analysis and hypothesis testing |
| `ui-ux-designer` | Visual design decisions and UX patterns |
| `frontend-developer` | Frontend implementation |

## Skills

Skills are focused instruction sets that agents load for domain-specific expertise.

### Development

| Skill | Purpose |
|-------|---------|
| `typescript-engineer` | TypeScript patterns, types, error handling, style |
| `typescript-imports` | Import ordering, grouping, type imports |
| `python-engineer` | Python typing, error handling, style, imports, patterns |
| `code` | Code implementation patterns per technical plan |
| `code-testing` | Test strategy, pyramid, mocking, flaky test debugging |
| `clean-architecture` | Decoupling business logic from frameworks/DB |
| `observability` | Logging, tracing, instrumentation |
| `context7` | Fetches up-to-date library documentation before coding |

### Quality

| Skill | Purpose |
|-------|---------|
| `qa` | Code quality review against plan and acceptance criteria |
| `security-qa` | Security, privacy, tenant isolation review |
| `security-context` | Threat modeling constraints for technical artifacts |

### Product & Planning

| Skill | Purpose |
|-------|---------|
| `product-manager` | Epics, user stories, acceptance criteria, analytics |
| `product-discovery` | New feature exploration before design/technical work |
| `product-vision` | CPO-level product direction and roadmap |
| `gather-technical-context` | Codebase analysis before implementation planning |
| `technical-planning` | Task breakdown, verification matrix, decision resolution |
| `brainstorming` | Dialogue-based design exploration |

### Design & Frontend

| Skill | Purpose |
|-------|---------|
| `frontend-design` | Distinctive, production-grade frontend interfaces |
| `ux-patterns` | Forms, inputs, modals, loading states, user feedback |
| `refactoring-ui` | Visual hierarchy, colors, typography, spacing |

### Cross-Cutting

| Skill | Purpose |
|-------|---------|
| `tech-vision` | CTO-level technical vision and architecture |
| `dx` | Developer experience tooling, CI, repo ergonomics |
| `github` | GitHub integration (issues, PRs, sync scripts) |

### GitHub Scripts

Located in the `github` skill directory:

| Script | Purpose |
|--------|---------|
| `sync-to-github.sh` | Push markdown to GitHub issue |
| `sync-from-github.sh` | Pull GitHub issue to markdown |
| `sync-all.sh` | Sync all documentation files |
| `create-pr.sh` | Create pull request |
| `resolve-parent.sh` | Resolve parent issue |

## Project Structure After Init

```
your-project/
├── .claude/                      # Claude Code (if --ide claude or all)
│   ├── agents/                   # Agent + subagent prompts (.md)
│   ├── skills/                   # Skill dirs + workflow dirs
│   └── .agentic.settings.json   # Persisted configuration
├── .cursor/                      # Cursor (if --ide cursor or all)
│   ├── agents/                   # Agent + subagent prompts (.md)
│   ├── skills/                   # Skill dirs + workflow dirs
│   └── .agentic.settings.json   # Persisted configuration
├── .agents/                      # Codex (if --ide codex or all)
│   ├── agents/                   # Agent + subagent prompts (.md)
│   ├── skills/                   # Skill dirs + workflow dirs
│   └── .agentic.settings.json   # Persisted configuration
├── _agentic_output/              # Workflow artifacts (configurable)
│   ├── product/                  # PRDs, specs, designs
│   ├── task/                     # Technical plans, impl logs, QA reports
│   └── tech/                     # Vision docs, DX docs
├── CLAUDE.md                     # Claude Code instructions (if claude)
└── AGENTS.md                     # Cursor/Codex instructions (if cursor or codex)
```

With `--workflows`, only the agents, skills, and workflow directories needed by the selected workflows are installed.

With `--namespace myteam`, all `agentic-*` prefixes become `myteam-*`.

## Settings

Configuration is persisted in `.agentic.settings.json` (inside each IDE directory):

```json
{
  "namespace": "agentic",
  "version": "0.1.1-alpha.29",
  "outputFolder": "_agentic_output",
  "highThinkingModelName": "opus",
  "codeWritingModelName": "opus",
  "qaModelName": "opus",
  "lastUpdate": "2026-02-20T00:00:00.000Z",
  "workflows": ["implement", "debug"]
}
```

- Created on `init`, read on `update` and `settings apply`
- CLI flags override saved settings
- `workflows` is omitted when doing a full install (no `-w`)
- Model defaults differ by IDE: Claude Code uses `opus`, Cursor uses `claude-4.6-opus-high-thinking`, Codex uses `gpt-5.4`

## Development

Requires [Bun](https://bun.sh).

```bash
bun install                                    # install deps
bun test                                       # run unit tests
bun run bin/agentic.ts help                    # run CLI
cd .tmp && bun run ../bin/agentic.ts init      # manual testing in temp dir
```

### Architecture

```
bin/agentic.ts              # Entry point
src/
├── cli/                    # CLI implementation
│   ├── index.ts            # run() — parses args, dispatches commands
│   ├── commands/
│   │   ├── init/           # Init command (strategy pattern per IDE)
│   │   ├── update.ts       # Update command
│   │   ├── settings.ts     # Settings apply command
│   │   ├── list.ts         # List command
│   │   └── help.ts         # Help command
│   ├── dependencies.ts     # Workflow dependency map + resolver
│   ├── settings.ts         # Settings read/write
│   ├── constants.ts        # Agent/IDE constants
│   ├── paths.ts            # Path constants
│   └── utils.ts            # Template processing, namespace rewriting
├── lib/                    # Shared utilities
│   ├── monads/             # Result, Option monads
│   └── logger/             # Pino-based logging
└── agentic/                # Content assets (source of truth)
    ├── agents/             # Strategic agents
    ├── subagents/          # Specialized agents
    ├── skills/             # Skills + workflows
    └── templates/          # IDE config templates
```

**Adding a new IDE:** Create a strategy in `src/cli/commands/init/strategies/`, register in `strategies/index.ts`.

## Publishing

Published to npm. Push a `v*` tag to auto-publish:

```bash
bun run bump <version>     # bumps version, commits, tags, pushes
```

The tag name determines the dist-tag: `v0.1.0-beta.1` publishes as `@beta`.
