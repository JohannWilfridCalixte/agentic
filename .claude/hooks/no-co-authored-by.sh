#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block: git commit with Co-Authored-By trailer
if echo "$COMMAND" | grep -qiE 'git\s+commit' && echo "$COMMAND" | grep -qi 'co-authored-by'; then
  echo "Blocked: don't include Co-Authored-By in commits." >&2
  exit 2
fi

exit 0
