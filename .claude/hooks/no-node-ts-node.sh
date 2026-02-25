#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: node <file> or ts-node <file> — use bun <file> instead
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(node|ts-node)\s+\S+'; then
  echo "Blocked: use 'bun <file>' instead of node/ts-node. Bun is the default runtime." >&2
  exit 2
fi

exit 0
