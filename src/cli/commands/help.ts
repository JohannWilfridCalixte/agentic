export function help() {
  console.log(`
agentic - Agent prompts and scripts for Claude Code + Cursor

Usage:
  agentic init|install [options]  Setup in current project
  agentic update [options]        Update existing setup
  agentic list                    List available agents/scripts
  agentic help                    Show this help

Options:
  --ide <type>      Target IDE: claude, cursor, or both
                    init: defaults to both
                    update: defaults to auto-detect
  --output <folder> Output folder for workflow artifacts
                    defaults to _agentic_output
`);
}
