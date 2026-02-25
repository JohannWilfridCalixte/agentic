#!/usr/bin/env bash
set -euo pipefail

# sync-to-github.sh - Push markdown file to GitHub issue
# Usage: ./sync-to-github.sh <markdown-file>

STATE_FILE=".gh-sync-state.json"

die() { echo "Error: $1" >&2; exit 1; }

[[ $# -lt 1 ]] && die "Usage: $0 <markdown-file>"
FILE="$1"
[[ -f "$FILE" ]] || die "File not found: $FILE"

# Extract metadata from markdown
extract_field() {
    grep -m1 "^\*\*$1:\*\*" "$FILE" | sed 's/.*\*\*'"$1"':\*\* *//' | sed 's/ *$//' || echo ""
}

TITLE=$(grep -m1 "^# " "$FILE" | sed 's/^# //')
EPIC_ID=$(extract_field "Epic ID")
US_ID=$(extract_field "User Story ID")
STATUS=$(extract_field "Status")
ISSUE_NUM=$(extract_field "GitHub Issue" | sed 's/#//')

# Build issue title with prefix
ISSUE_TITLE=""
[[ -n "$EPIC_ID" ]] && ISSUE_TITLE="[$EPIC_ID]"
[[ -n "$US_ID" ]] && ISSUE_TITLE="$ISSUE_TITLE[$US_ID]"
ISSUE_TITLE="$ISSUE_TITLE $TITLE"
ISSUE_TITLE=$(echo "$ISSUE_TITLE" | sed 's/^ *//')

# Determine label from filename and path
FILENAME=$(basename "$FILE")
FILEPATH="$FILE"
LABEL=""

# Check filename patterns first
case "$FILENAME" in
    US-*.md)              LABEL="User Story" ;;
    technical-plan.md)    LABEL="Technical Plan" ;;
    technical-context.md) LABEL="PRD" ;;
    security-addendum.md) LABEL="Security" ;;
    epic.md)              LABEL="Epic" ;;
esac

# Check path for vision/dx docs (if label not set)
if [[ -z "$LABEL" ]]; then
    case "$FILEPATH" in
        */product/vision/*) LABEL="Product Vision" ;;
        */tech/vision/*)    LABEL="Tech Vision" ;;
        */tech/dx/*)        LABEL="DX" ;;
    esac
fi

# Determine state from status
STATE="open"
case "$STATUS" in
    Done|Completed) STATE="closed" ;;
esac

# Get file content for issue body
BODY=$(cat "$FILE")

# Resolve parent issue number
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_ISSUE=$("$SCRIPT_DIR/resolve-parent.sh" "$FILE" || true)

# Function to set parent via GitHub sub-issues API
set_parent_relationship() {
    local child_num="$1"
    local parent_num="$2"

    [[ -z "$parent_num" ]] && return 0

    # Get node IDs
    local parent_id=$(gh issue view "$parent_num" --json id -q '.id')
    local child_id=$(gh issue view "$child_num" --json id -q '.id')

    [[ -z "$parent_id" ]] || [[ -z "$child_id" ]] && return 0

    # Set parent relationship via GraphQL
    gh api graphql -f query="
    mutation {
      addSubIssue(input: {
        issueId: \"$parent_id\",
        subIssueId: \"$child_id\",
        replaceParent: true
      }) {
        issue { number }
        subIssue { number }
      }
    }" > /dev/null 2>&1 && echo "  ↳ Parent: #$parent_num (native sub-issue)" || true
}

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
    jq --arg f "$FILE" --arg t "$now" --arg n "$1" \
        '.[$f] = {lastSync: $t, issueNumber: $n}' "$STATE_FILE" > "$tmp"
    mv "$tmp" "$STATE_FILE"
}

get_stored_issue() {
    init_state
    jq -r --arg f "$FILE" '.[$f].issueNumber // ""' "$STATE_FILE"
}

# Conflict detection
check_conflict() {
    local issue_num="$1"
    local last_sync=$(get_last_sync)

    [[ -z "$last_sync" ]] && return 0  # First sync, no conflict

    # Get issue updated_at
    local issue_updated=$(gh issue view "$issue_num" --json updatedAt -q '.updatedAt')

    # Get file mtime
    local file_mtime=$(date -r "$FILE" -u +"%Y-%m-%dT%H:%M:%SZ")

    # Check if both changed since last sync
    if [[ "$issue_updated" > "$last_sync" ]] && [[ "$file_mtime" > "$last_sync" ]]; then
        echo "⚠️  Conflict detected!"
        echo "   Issue updated: $issue_updated"
        echo "   File modified: $file_mtime"
        echo "   Last sync:     $last_sync"
        echo ""
        read -p "Overwrite GitHub issue with local file? [y/N] " -n 1 -r
        echo
        [[ $REPLY =~ ^[Yy]$ ]] || die "Sync aborted. Resolve conflict manually."
    fi
}

# Create or update issue
if [[ -n "$ISSUE_NUM" ]]; then
    echo "Updating issue #$ISSUE_NUM..."
    check_conflict "$ISSUE_NUM"

    gh issue edit "$ISSUE_NUM" \
        --title "$ISSUE_TITLE" \
        --body "$BODY"

    # Update state
    [[ "$STATE" == "closed" ]] && gh issue close "$ISSUE_NUM" --comment "Closed via sync"
    [[ "$STATE" == "open" ]] && gh issue reopen "$ISSUE_NUM" 2>/dev/null || true

    # Set parent relationship if applicable
    set_parent_relationship "$ISSUE_NUM" "$PARENT_ISSUE"

    set_last_sync "$ISSUE_NUM"
    echo "✓ Issue #$ISSUE_NUM updated"
else
    echo "Creating new issue..."

    # Build gh create command
    CREATE_ARGS=(issue create --title "$ISSUE_TITLE" --body "$BODY")
    [[ -n "$LABEL" ]] && CREATE_ARGS+=(--label "$LABEL")

    # Create issue and capture number
    RESULT=$(gh "${CREATE_ARGS[@]}")
    NEW_ISSUE_NUM=$(echo "$RESULT" | grep -oE '[0-9]+$')

    echo "✓ Created issue #$NEW_ISSUE_NUM"

    # Update markdown with issue number
    if grep -q "^\*\*GitHub Issue:\*\*" "$FILE"; then
        sed -i '' "s/^\*\*GitHub Issue:\*\*.*/\*\*GitHub Issue:\*\* #$NEW_ISSUE_NUM/" "$FILE"
    else
        # Insert after Status line (use temp file for cleaner insertion)
        awk -v issue="$NEW_ISSUE_NUM" '
            /^\*\*Status:\*\*/ { print; print "**GitHub Issue:** #" issue; next }
            { print }
        ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
    fi

    # Close if needed
    [[ "$STATE" == "closed" ]] && gh issue close "$NEW_ISSUE_NUM" --comment "Created as closed via sync"

    # Set parent relationship if applicable
    set_parent_relationship "$NEW_ISSUE_NUM" "$PARENT_ISSUE"

    set_last_sync "$NEW_ISSUE_NUM"
    echo "✓ Updated $FILE with issue number"
fi

echo "Done."
