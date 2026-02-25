#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: git push and gpush alias — always confirm with user first
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(git\s+push|gpush)(\s|$)'; then
  echo "Blocked: git push is not allowed. Ask the user to push manually." >&2
  exit 2
fi

exit 0
