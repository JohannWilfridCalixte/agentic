#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: jest, vitest — use bun test instead
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(jest|vitest)(\s|$)'; then
  echo "Blocked: use 'bun test' instead of jest/vitest." >&2
  exit 2
fi

exit 0
