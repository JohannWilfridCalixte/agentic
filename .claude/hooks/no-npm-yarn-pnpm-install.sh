#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: npm install, yarn install, pnpm install — use bun install instead
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(npm|yarn|pnpm)\s+install'; then
  echo "Blocked: use 'bun install' instead of npm/yarn/pnpm install." >&2
  exit 2
fi

# Also block: npm i, yarn add, pnpm add (common install variants)
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*npm\s+i(\s|$)'; then
  echo "Blocked: use 'bun install' (or 'bun add <pkg>') instead of npm i." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(yarn|pnpm)\s+add\s'; then
  echo "Blocked: use 'bun add <pkg>' instead of yarn/pnpm add." >&2
  exit 2
fi

exit 0
