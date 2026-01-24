export function help(): void {
  console.log(`
agentic - Agent prompts and scripts for Claude Code + Cursor

Usage:
  agentic init [--ide <claude|cursor|both>]  Setup in current project
  agentic list                                List available agents/scripts
  agentic help                                Show this help

Options:
  --ide <type>  Target IDE: claude, cursor, or both (default: both)
`);
}
