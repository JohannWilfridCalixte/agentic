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
    ├── agents/             # Agent prompts (agentic-agent-{name}.md)
    ├── subagents/          # Sub-agent prompts (agentic-agent-{name}.md)
    ├── skills/             # Skill definitions (agentic-skill-{name}/, agentic-workflow-{name}/)
    └── templates/          # IDE config templates
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

Agents in `.claude/agents/` - load with `Read .claude/agents/agentic-agent-{name}.md`
Skills in `.claude/skills/` - load with `Read .claude/skills/agentic-skill-{name}/SKILL.md`

### Skill Index (always available)

| Skill | Use When |
|-------|----------|
| **agentic:skill:typescript-engineer** | Writing TypeScript code - types, error handling, patterns |
| **agentic:skill:typescript-imports** | Writing imports - ordering, grouping, type imports |
| **agentic:skill:clean-architecture** | Services with business logic needing decoupling |
| **agentic:skill:observability** | Adding logging, tracing, instrumentation |
| **agentic:skill:code** | Implementing code per technical plan |
| **agentic:skill:qa** | Reviewing implementation against plan/ACs |
| **agentic:skill:security-qa** | Reviewing code for security/privacy |
| **agentic:skill:frontend-design** | Frontend design - distinctive, production-grade interfaces |
| **agentic:workflow:debug** | Bug reports, CI failures, runtime errors, flaky tests |
| **agentic:workflow:auto-implement** | Autonomous spec/PRD/plan → PR without interaction |
| **agentic:workflow:implement** | Technical plan → implementation + tests + review, optional PR |
| **agentic:workflow:quick-spec-and-implement** | Interactive idea → spec → PR with collaboration |
| **agentic:workflow:technical-planning** | Spec/PRD/story → detailed technical plan with all decisions resolved |
| **agentic:workflow:product-spec** | Product discovery → PRD |
| **agentic:workflow:frontend-development** | Frontend features - design decisions → UX → implementation |
| **agentic:skill:code-testing** | Writing tests, test strategy, mocking, flaky test debugging |
| **agentic:skill:brainstorming** | Turning ideas into designs |
| **agentic:skill:product-discovery** | Exploring new product idea |
| **agentic:skill:product-manager** | Producing epics, user stories, ACs |
| **agentic:skill:gather-technical-context** | Extracting context before planning |
| **agentic:skill:technical-planning** | Producing technical plans |
| **agentic:skill:product-vision** | Product direction (CPO-level) |
| **agentic:skill:tech-vision** | Technical vision (CTO-level) |
| **agentic:skill:security-context** | Security/privacy constraints |
| **agentic:skill:dx** | Tooling, linting, CI, repo ergonomics |
| **agentic:skill:ux-patterns** | Forms, inputs, modals, loading states |
| **agentic:skill:refactoring-ui** | Visual hierarchy, colors, typography, spacing, depth |
| **agentic:skill:context7** | Fetching up-to-date library docs |
| **agentic:skill:github** | GitHub operations - syncing docs, PRs, issues, gh CLI |

### Agents

- `agentic:agent:cpo` - Chief Product Officer
- `agentic:agent:cto` - Chief Technology Officer
- `agentic:agent:dx` - Developer experience

### Subagents (for workflows)

- `agentic:agent:pm` - Product Manager
- `agentic:agent:architect` - Technical context + planning
- `agentic:agent:editor` - Code implementation (no tests)
- `agentic:agent:test-engineer` - Test writing
- `agentic:agent:qa` - Code quality assurance (no test review)
- `agentic:agent:test-qa` - Test quality assurance
- `agentic:agent:security` - Threat modeling
- `agentic:agent:security-qa` - Security QA
- `agentic:agent:investigator` - Root cause investigation
- `agentic:agent:analyst` - Pattern analysis
- `agentic:agent:ui-ux-designer` - Visual design + UX patterns
- `agentic:agent:frontend-developer` - Frontend implementation
