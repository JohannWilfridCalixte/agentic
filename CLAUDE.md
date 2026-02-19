# CLAUDE.md

## **CRITICAL**: Bun

Default to using Bun instead of Node.js.
Default to use bunx instead of npx.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

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

#

# Agentic Framework

## **CRITICAL**: Orchestrator

It is **MANDATORY** that you act as an orchestrator and delegate every task to subagents.
It is **MANDATORY** that you read skills if you cannot invoke them via tools.

## **CRITICAL**: Code comments

**ONLY** comment complex or non-obvious business logic. Focus on writing code that is self-explanatory.

## Always

- In all interactions, documents and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## When writing documents

- Default to markdown documents unless specified otherwise.
- For schemas, default to mermaid.

## When writing code

- Always write code that is simple to read and maintain. Complexity is ok if necessary, but everything must be organized for simplicity to maintain. Over-engineering is not ok.
- Write self-explanatory code that doesn't need to be commented. Exception tolerated: complex business code / business rules implementation.

## When planning

- At the end of each plan, give me the list of unresolved questions to answer, if any.

## Skill Index (always available)

Load skill: `Read .claude/skills/{name}/SKILL.md`

| Skill | Use When |
|-------|----------|
| **agentic:skill:typescript-engineer** | Writing TypeScript code - types, error handling, patterns |
| **agentic:skill:typescript-imports** | Writing imports - ordering, grouping, type imports |
| **agentic:skill:clean-architecture** | Services with business logic needing decoupling from frameworks/DB |
| **agentic:skill:observability** | Adding logging, tracing, instrumentation |
| **agentic:skill:code** | Implementing code per technical plan |
| **agentic:skill:qa** | Reviewing implementation against plan/ACs |
| **agentic:skill:security-qa** | Reviewing code for security/privacy/tenant isolation |
| **agentic:skill:code-testing** | Writing tests, test strategy, mocking, flaky test debugging |
| **agentic:skill:brainstorming** | Turning ideas into designs through dialogue |
| **agentic:skill:product-discovery** | Exploring new product idea before design/technical work |
| **agentic:skill:product-manager** | Producing epics, user stories, acceptance criteria |
| **agentic:skill:gather-technical-context** | Extracting context from codebase before planning |
| **agentic:skill:technical-planning** | Producing technical plans with task breakdown |
| **agentic:skill:product-vision** | Defining product direction, roadmap (CPO-level) |
| **agentic:skill:tech-vision** | Defining technical vision, architecture (CTO-level) |
| **agentic:skill:security-context** | Adding security/privacy constraints to artifacts |
| **agentic:skill:dx** | Tooling, linting, CI, repo ergonomics |
| **agentic:skill:ux-patterns** | Forms, inputs, modals, loading states |
| **agentic:skill:context7** | Fetching up-to-date library docs before coding |
| **agentic:skill:github** | GitHub operations - syncing docs, PRs, issues, gh CLI |

## Agentic Skills (workflow orchestration)

| Skill | Use When |
|-------|----------|
| **agentic:workflow:auto-implement** | Autonomous spec/PRD/plan → PR without interaction |
| **agentic:workflow:implement** | Technical plan → implementation + tests + review, optional PR |
| **agentic:workflow:quick-spec-and-implement** | Interactive idea → spec → PR with collaboration |
| **agentic:workflow:technical-planning** | Spec/PRD/story → detailed technical plan with all decisions resolved |
| **agentic:workflow:debug** | Systematic debugging to verified fix |
| **agentic:workflow:product-spec** | Product discovery → PRD |
| **agentic:workflow:frontend-development** | Frontend features - design decisions → UX → implementation |

## Agents / Subagents

Load agent: `Read .claude/agents/agentic-agent-{name}.md`

| Agent | Role |
|-------|------|
| **agentic:agent:cpo** | Product vision, roadmap (Chief Product Officer) |
| **agentic:agent:cto** | Technical vision, architecture (Chief Technology Officer) |
| **agentic:agent:dx** | Developer experience, tooling |
| **agentic:agent:team-and-workflow** | Team structure, workflow orchestration |
| **agentic:agent:pm** | Product specs, stories, ACs |
| **agentic:agent:architect** | Technical context + planning |
| **agentic:agent:editor** | Code implementation (no tests) |
| **agentic:agent:test-engineer** | Test writing |
| **agentic:agent:qa** | Code quality review (no test review) |
| **agentic:agent:test-qa** | Test quality review |
| **agentic:agent:security** | Threat modeling |
| **agentic:agent:security-qa** | Security compliance review |
| **agentic:agent:investigator** | Root cause investigation (debug) |
| **agentic:agent:analyst** | Pattern analysis (debug) |
| **agentic:agent:ui-ux-designer** | Visual design + UX patterns |
| **agentic:agent:frontend-developer** | Frontend implementation |
