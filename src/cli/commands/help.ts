export function help() {
  console.log(`
agentic - Agent prompts and scripts for Claude Code + Cursor

Usage:
  agentic init|install [options]    Setup in current project
  agentic update [options]          Update existing setup
  agentic settings apply [options]  Update settings & reinstall agents
  agentic list                      List available agents/scripts
  agentic version                   Show installed version per IDE
  agentic help                      Show this help

Options:
  --namespace, -n <name>      Namespace prefix (default: agentic)
                              Renames files/refs: agentic-* → <name>-*
                              Must be lowercase, start with letter, 2-30 chars
  --workflows, -w <list>      Install only specified workflows + deps
                              Comma-separated: -w product-spec,implement
                              Available: product-spec, technical-planning,
                              auto-implement, implement, debug,
                              quick-spec-and-implement, frontend-development
  --ide <type>                Target IDE: claude, cursor, or both
                              init: defaults to both
                              update/settings: defaults to auto-detect
  --output <folder>           Output folder (default: _<namespace>_output)
  --high-thinking-model <id>  Model for high-thinking agents
  --code-writing-model <id>   Model for code-writing agents
  --qa-model <id>             Model for QA agents
  --version                   Show installed version
`);
}
