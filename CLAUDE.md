# CLAUDE.md

## **CRITICAL**: Orchestrator

Act as an orchestrator. Delegate every task to subagents.

## Commands

```bash
bun run bin/agentic.ts          # Run CLI
bun run bin/agentic.ts init     # Test init command
bun run bin/agentic.ts update   # Test update command
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
│   │   ├── update.ts
│   │   └── help.ts
│   ├── constants.ts        # AGENTS, IDE type
│   ├── paths.ts            # Path constants
│   └── utils.ts            # copyAndProcess helper
├── lib/                    # Shared utilities
│   ├── monads/             # Result, Option monads
│   └── logger/             # Pino-based logging
└── agentic/                # Content assets
    ├── agents/             # Agent prompts
    ├── subagents/          # Sub-agent prompts
    ├── skills/             # Skill definitions
    ├── templates/          # IDE config templates
    └── personas/           # Persona definitions
```

**Flow**: `bin/agentic.ts` → `src/cli/index.ts:run()` → `src/cli/commands/*.ts`

The `init` command copies `src/agentic/*` to `.{claude|cursor}/` and generates IDE configs.

The `update` command detects existing IDE setups and updates them, preserving user files.

**Adding new IDE**: Create strategy in `src/cli/commands/init/strategies/`, register in `strategies/index.ts`.

## Testing

Run `bun test` for unit tests.

When testing CLI manually, use `.tmp` folder:
```bash
cd .tmp && bun run ../bin/agentic.ts init
```

## Agentic Framework

Agents in `.claude/agents/` - load with `Read .claude/agents/{agent}.md`
Skills in `.claude/skills/` - load with `Read .claude/skills/{name}/SKILL.md`

### Skill Index (always available)

| Skill | Use When |
|-------|----------|
| **typescript-engineer** | Writing TypeScript code - types, error handling, patterns |
| **typescript-imports** | Writing imports - ordering, grouping, type imports |
| **clean-architecture** | Services with business logic needing decoupling |
| **observability** | Adding logging, tracing, instrumentation |
| **code** | Implementing code per technical plan |
| **qa** | Reviewing implementation against plan/ACs |
| **security-qa** | Reviewing code for security/privacy |
| **agentic:debug** | Bug reports, CI failures, runtime errors, flaky tests |
| **agentic:auto-implement** | Autonomous spec/PRD/plan → PR without interaction |
| **agentic:quick-spec-and-implement** | Interactive idea → spec → PR with collaboration |
| **agentic:technical-planning** | Spec/PRD/story → detailed technical plan with all decisions resolved |
| **agentic:product-spec** | Product discovery → PRD |
| **agentic:frontend-development** | Frontend features - design decisions → UX → implementation |
| **code-testing** | Writing tests, test strategy, mocking, flaky test debugging |
| **brainstorming** | Turning ideas into designs |
| **product-discovery** | Exploring new product idea |
| **product-manager** | Producing epics, user stories, ACs |
| **gather-technical-context** | Extracting context before planning |
| **technical-planning** | Producing technical plans |
| **product-vision** | Product direction (CPO-level) |
| **tech-vision** | Technical vision (CTO-level) |
| **security-context** | Security/privacy constraints |
| **dx** | Tooling, linting, CI, repo ergonomics |
| **ux-patterns** | Forms, inputs, modals, loading states |
| **refactoring-ui** | Visual hierarchy, colors, typography, spacing, depth |
| **context7** | Fetching up-to-date library docs |
| **github** | GitHub operations - syncing docs, PRs, issues, gh CLI |

### Agents

- `cpo` - Chief Product Officer
- `cto` - Chief Technology Officer
- `dx` - Developer experience

### Subagents (for workflows)

- `pm` - Product Manager
- `architect` - Technical context + planning
- `editor` - Code implementation (no tests)
- `test-engineer` - Test writing
- `qa` - Code quality assurance (no test review)
- `test-qa` - Test quality assurance
- `security` - Threat modeling
- `security-qa` - Security QA
- `investigator` - Root cause investigation
- `analyst` - Pattern analysis
- `ui-ux-designer` - Visual design + UX patterns
- `frontend-developer` - Frontend implementation
