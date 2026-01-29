# CLAUDE.md

## Commands

```bash
bun run bin/agentic.ts          # Run CLI
bun run bin/agentic.ts init     # Test init command
bun run bin/agentic.ts list     # Test list command
bun test                         # Run unit tests
```

Publishing: push a `v*` tag to auto-publish to GitHub Packages.

## Architecture

npm package distributing agent prompts/scripts for Claude Code + Cursor.

```
bin/agentic.ts              # Entry - calls src/cli/index.ts
src/
├── cli/                    # CLI implementation
│   ├── index.ts            # run() - parses args, dispatches
│   ├── commands/           # Command implementations
│   │   ├── init/           # Init command (strategy pattern)
│   │   │   ├── index.ts    # Main init + setupIde
│   │   │   ├── types.ts    # InitError, TargetIDE, IdeSetupStrategy
│   │   │   └── strategies/ # Per-IDE setup strategies
│   │   ├── list.ts
│   │   └── help.ts
│   ├── constants.ts        # AGENTS, SCRIPTS, IDE type
│   ├── paths.ts            # Path constants
│   └── utils.ts            # copyAndProcess helper
├── lib/                    # Shared utilities
│   ├── monads/             # Result, Option monads
│   └── logger/             # Pino-based logging
└── agentic/                # Content assets
    ├── agents/             # Agent prompts
    ├── subagents/          # Sub-agent prompts
    ├── skills/             # Skill definitions
    ├── commands/           # Workflow commands
    ├── workflows/          # Multi-step workflows
    ├── scripts/            # Shell scripts
    ├── templates/          # IDE config templates
    └── personas/           # Persona definitions
```

**Flow**: `bin/agentic.ts` → `src/cli/index.ts:run()` → `src/cli/commands/*.ts`

The `init` command copies `src/agentic/*` to `.{claude|cursor}/` and generates IDE configs.

**Adding new IDE**: Create strategy in `src/cli/commands/init/strategies/`, register in `strategies/index.ts`.

## Testing

Run `bun test` for unit tests.

When testing CLI manually, use `.tmp` folder:
```bash
cd .tmp && bun run ../bin/agentic.ts init
```

## Agentic Framework

Agents in `.claude/agents/` - load with `Read .claude/agents/{agent}.md`
Skills in `.claude/skills/` - auto-loaded by Claude Code
Scripts in `.claude/scripts/`

### Skills

- `typescript-engineer` - Types, error handling, code style
- `typescript-imports` - Import ordering and grouping
- `observability` - Logging, tracing, instrumentation

### Agents

- `cpo` - Chief Product Officer
- `cto` - Chief Technology Officer
- `pm` - Product Manager
- `architect-context` - Context analysis
- `architect-plan` - Technical planning
- `editor` - Code implementation
- `qa` - Quality assurance
- `security-context` - Security context analysis
- `security-qa` - Security QA
- `dx` - Developer experience

### Scripts

- `sync-to-github.sh` - Push markdown to GitHub issue
- `sync-from-github.sh` - Pull GitHub issue to markdown
- `sync-all.sh` - Sync all documentation files
- `create-pr.sh` - Create pull request
- `resolve-parent.sh` - Resolve parent issue
