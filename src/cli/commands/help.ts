export function help() {
  console.log(`
agentic - Agent prompts and scripts for Claude Code, Cursor & Codex

Usage:
  agentic init|install [options]    Setup in current project
  agentic update [options]          Update existing setup
  agentic migrate [options]         Backup old artifacts & reinstall
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
                              Available: product-spec, product-vision, ask-codebase,
                              technical-planning, implement, debug, frontend-development,
                              auto-implement, pr-review, create-workflow
  --ide <type>                Target IDE: claude, cursor, codex, or all
                              init: defaults to all
                              update/settings: defaults to auto-detect
  --output <folder>           Output folder (default: _<namespace>_output)
  --high-thinking-model <id>  Model for high-thinking agents
  --code-writing-model <id>   Model for code-writing agents
  --qa-model <id>             Model for QA agents
  --version                   Show installed version
`);
}
