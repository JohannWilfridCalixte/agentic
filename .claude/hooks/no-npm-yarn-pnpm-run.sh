#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: npm run, yarn run, pnpm run — use bun run instead
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(npm|yarn|pnpm)\s+run\s'; then
  echo "Blocked: use 'bun run <script>' instead of npm/yarn/pnpm run." >&2
  exit 2
fi

exit 0
