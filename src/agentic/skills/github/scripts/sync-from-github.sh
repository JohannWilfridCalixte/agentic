#!/usr/bin/env bash
set -euo pipefail

# sync-from-github.sh - Pull GitHub issue updates to markdown file
# Usage: ./sync-from-github.sh <markdown-file>

STATE_FILE=".gh-sync-state.json"

die() { echo "Error: $1" >&2; exit 1; }

[[ $# -lt 1 ]] && die "Usage: $0 <markdown-file>"
FILE="$1"
[[ -f "$FILE" ]] || die "File not found: $FILE"

# Extract GitHub Issue number from markdown
ISSUE_NUM=$(grep -m1 "^\*\*GitHub Issue:\*\*" "$FILE" | sed 's/.*#//' | tr -d ' ' || echo "")
[[ -z "$ISSUE_NUM" ]] && die "No **GitHub Issue:** field found. Run sync-to-github.sh first."

echo "Fetching issue #$ISSUE_NUM..."

# Get issue data
ISSUE_JSON=$(gh issue view "$ISSUE_NUM" --json title,body,state,updatedAt)
ISSUE_BODY=$(echo "$ISSUE_JSON" | jq -r '.body')
ISSUE_STATE=$(echo "$ISSUE_JSON" | jq -r '.state')
ISSUE_UPDATED=$(echo "$ISSUE_JSON" | jq -r '.updatedAt')

# Load sync state
init_state() {
    [[ -f "$STATE_FILE" ]] || echo '{}' > "$STATE_FILE"
}

get_last_sync() {
    init_state
    jq -r --arg f "$FILE" '.[$f].lastSync // ""' "$STATE_FILE"
}

set_last_sync() {
    init_state
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local tmp=$(mktemp)
    jq --arg f "$FILE" --arg t "$now" --arg n "$ISSUE_NUM" \
        '.[$f] = {lastSync: $t, issueNumber: $n}' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# Conflict detection
check_conflict() {
    local last_sync=$(get_last_sync)
    [[ -z "$last_sync" ]] && return 0

    local file_mtime=$(date -r "$FILE" -u +"%Y-%m-%dT%H:%M:%SZ")

    if [[ "$ISSUE_UPDATED" > "$last_sync" ]] && [[ "$file_mtime" > "$last_sync" ]]; then
        echo "⚠️  Conflict detected!"
        echo "   Issue updated: $ISSUE_UPDATED"
        echo "   File modified: $file_mtime"
        echo "   Last sync:     $last_sync"
        echo ""
        read -p "Overwrite local file with GitHub issue? [y/N] " -n 1 -r
        echo
        [[ $REPLY =~ ^[Yy]$ ]] || die "Sync aborted. Resolve conflict manually."
    fi
}

check_conflict

# Update Status field based on issue state
NEW_STATUS=""
case "$ISSUE_STATE" in
    OPEN)   NEW_STATUS="In Progress" ;;
    CLOSED) NEW_STATUS="Done" ;;
esac

# Write issue body to file (preserving GitHub Issue line if not in body)
echo "$ISSUE_BODY" > "$FILE"

# Ensure GitHub Issue field exists
if ! grep -q "^\*\*GitHub Issue:\*\*" "$FILE"; then
    if grep -q "^\*\*Status:\*\*" "$FILE"; then
        sed -i '' "/^\*\*Status:\*\*/a\\
**GitHub Issue:** #$ISSUE_NUM" "$FILE"
    else
        # Add at end of metadata block (after first ---)
        sed -i '' "0,/^---$/!{/^---$/a\\
**GitHub Issue:** #$ISSUE_NUM
}" "$FILE"
    fi
fi

# Update Status if changed
if [[ -n "$NEW_STATUS" ]]; then
    if grep -q "^\*\*Status:\*\*" "$FILE"; then
        sed -i '' "s/^\*\*Status:\*\*.*/\*\*Status:\*\* $NEW_STATUS/" "$FILE"
    fi
fi

# Update Last Updated timestamp
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
if grep -q "^\*\*Last Updated:\*\*" "$FILE"; then
    sed -i '' "s/^\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $NOW/" "$FILE"
fi

set_last_sync

echo "✓ Updated $FILE from issue #$ISSUE_NUM"
echo "  State: $ISSUE_STATE → Status: $NEW_STATUS"
echo "Done."
