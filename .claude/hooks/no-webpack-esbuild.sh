#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: webpack, esbuild — use bun build instead
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)\s*(webpack|esbuild)(\s|$)'; then
  echo "Blocked: use 'bun build' instead of webpack/esbuild." >&2
  exit 2
fi

exit 0
