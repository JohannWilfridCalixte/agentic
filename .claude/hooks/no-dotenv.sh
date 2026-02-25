#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: dotenv usage — bun loads .env automatically
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(dotenv|--require\s+dotenv|-r\s+dotenv)'; then
  echo "Blocked: don't use dotenv. Bun loads .env automatically." >&2
  exit 2
fi

exit 0
