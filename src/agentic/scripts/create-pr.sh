#!/usr/bin/env bash
set -euo pipefail

# create-pr.sh - Create PR with implementation log as description
# Usage: ./create-pr.sh <implementation-log-file> [--base <branch>]

die() { echo "Error: $1" >&2; exit 1; }

[[ $# -lt 1 ]] && die "Usage: $0 <implementation-log-file> [--base <branch>]"
FILE="$1"
[[ -f "$FILE" ]] || die "File not found: $FILE"

BASE_BRANCH="main"
if [[ "${2:-}" == "--base" ]] && [[ -n "${3:-}" ]]; then
    BASE_BRANCH="$3"
fi

# Extract metadata
extract_field() {
    grep -m1 "^\*\*$1:\*\*" "$FILE" | sed 's/.*\*\*'"$1"':\*\* *//' | sed 's/ *$//' || echo ""
}

TITLE=$(grep -m1 "^# " "$FILE" | sed 's/^# //' | sed 's/Implementation Log: //')
EPIC_ID=$(extract_field "Epic ID")
US_ID=$(extract_field "User Story ID")

# Build PR title
PR_TITLE=""
[[ -n "$EPIC_ID" ]] && PR_TITLE="[$EPIC_ID]"
[[ -n "$US_ID" ]] && PR_TITLE="$PR_TITLE[$US_ID]"
PR_TITLE="$PR_TITLE $TITLE"
PR_TITLE=$(echo "$PR_TITLE" | sed 's/^ *//')

# Look for related issue in sibling technical-plan.md
DIR=$(dirname "$FILE")
RELATED_ISSUE=""
if [[ -f "$DIR/technical-plan.md" ]]; then
    RELATED_ISSUE=$(grep -m1 "^\*\*GitHub Issue:\*\*" "$DIR/technical-plan.md" | sed 's/.*#//' | tr -d ' ' || echo "")
fi

# Build PR body
BODY=$(cat "$FILE")

# Add Closes directive if related issue found
if [[ -n "$RELATED_ISSUE" ]]; then
    BODY="$BODY

---

Closes #$RELATED_ISSUE"
fi

# Check if we're on a feature branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" == "$BASE_BRANCH" ]]; then
    die "Cannot create PR from $BASE_BRANCH. Create a feature branch first."
fi

# Check if branch has commits ahead of base
AHEAD=$(git rev-list --count "$BASE_BRANCH".."$CURRENT_BRANCH" 2>/dev/null || echo "0")
if [[ "$AHEAD" == "0" ]]; then
    die "No commits ahead of $BASE_BRANCH. Nothing to create PR for."
fi

# Push branch if not already pushed
if ! git ls-remote --exit-code origin "$CURRENT_BRANCH" &>/dev/null; then
    echo "Pushing branch to origin..."
    git push -u origin "$CURRENT_BRANCH"
fi

echo "Creating PR..."
echo "  Title: $PR_TITLE"
echo "  Base: $BASE_BRANCH"
[[ -n "$RELATED_ISSUE" ]] && echo "  Closes: #$RELATED_ISSUE"

# Create PR
PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$BODY" \
    --base "$BASE_BRANCH")

echo ""
echo "✓ PR created: $PR_URL"
echo "Done."
