# CLAUDE.md

## Commands

```bash
bun run bin/agentic.ts          # Run CLI
bun run bin/agentic.ts init     # Test init command
bun run bin/agentic.ts list     # Test list command
```

Publishing: push a `v*` tag to auto-publish to GitHub Packages.

## Architecture

This is an npm package that distributes agent prompts and scripts for Claude Code + Cursor.

```
bin/agentic.ts              # Entry point - calls src/cli/index.ts
src/
├── cli/                    # CLI implementation
│   ├── index.ts            # run() - parses args, dispatches to commands
│   ├── commands/           # init, list, help commands
│   ├── constants.ts        # AGENTS, SCRIPTS arrays, IDE type
│   ├── paths.ts            # PKG_ROOT, SRC_DIR, *_DIR exports
│   └── utils.ts            # copyDir helper
├── agents/                 # .md agent prompts (copied to user projects)
├── scripts/                # .sh scripts (copied to user projects)
├── templates/              # IDE config templates (claude.md, cursor-rules)
├── skills/                 # Future: Claude Code skills
└── commands/               # Future: workflow orchestration
```

**Flow**: `bin/agentic.ts` → `src/cli/index.ts:run()` → `src/cli/commands/*.ts`

The `init` command copies `src/agents/` and `src/scripts/` to `.agentic/` in the target project, then generates IDE configs from `src/templates/`.


## Testing

When testing `bun run bin/agentic.ts init`, use (create it if needed) `.tmp` folder.