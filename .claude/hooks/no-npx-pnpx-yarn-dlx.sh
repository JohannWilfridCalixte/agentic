#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: npx, pnpx, yarn dlx — use bunx instead
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(npx|pnpx)\s'; then
  echo "Blocked: use 'bunx' instead of npx/pnpx." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*yarn\s+dlx\s'; then
  echo "Blocked: use 'bunx' instead of yarn dlx." >&2
  exit 2
fi

exit 0
