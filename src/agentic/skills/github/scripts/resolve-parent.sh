#!/usr/bin/env bash
set -euo pipefail

# resolve-parent.sh - Find parent issue number for a markdown file
# Usage: ./resolve-parent.sh <markdown-file>
# Output: Parent issue number (e.g., "5") or empty string if no parent

[[ $# -lt 1 ]] && exit 0
FILE="$1"
[[ -f "$FILE" ]] || exit 0

FILENAME=$(basename "$FILE")
DIR=$(dirname "$FILE")
ABS_PATH=$(cd "$DIR" && pwd)

# Extract GitHub Issue number from a file
get_issue_num() {
    local f="$1"
    [[ -f "$f" ]] || return
    grep -m1 "^\*\*GitHub Issue:\*\*" "$f" 2>/dev/null | sed 's/.*#//' | tr -d ' ' || true
}

# epic.md has no parent
[[ "$FILENAME" == "epic.md" ]] && exit 0

# US-*.md → parent is epic.md in same folder
if [[ "$FILENAME" == US-*.md ]]; then
    EPIC_FILE="$DIR/epic.md"
    get_issue_num "$EPIC_FILE"
    exit 0
fi

# technical-plan.md or security-*.md → parent is US in PRD folder
if [[ "$FILENAME" == "technical-plan.md" ]] || [[ "$FILENAME" == security-*.md ]]; then
    # Path pattern: documentation/task/{epic-folder}/{us-folder}/file.md
    # Need to find: documentation/product/prd/{epic-folder}/{us-folder}.md

    # Get US folder name (parent directory)
    US_FOLDER=$(basename "$DIR")

    # Get epic folder name (grandparent directory)
    EPIC_FOLDER=$(basename "$(dirname "$DIR")")

    # Find project root (go up until we find documentation/)
    PROJECT_ROOT="$ABS_PATH"
    while [[ ! -d "$PROJECT_ROOT/documentation" ]] && [[ "$PROJECT_ROOT" != "/" ]]; do
        PROJECT_ROOT=$(dirname "$PROJECT_ROOT")
    done

    # Look for US file in PRD folder
    PRD_DIR="$PROJECT_ROOT/documentation/product/prd/$EPIC_FOLDER"

    if [[ -d "$PRD_DIR" ]]; then
        # Try exact match first: US-folder-name.md
        US_FILE="$PRD_DIR/$US_FOLDER.md"
        if [[ -f "$US_FILE" ]]; then
            get_issue_num "$US_FILE"
            exit 0
        fi

        # Try finding by US ID in metadata
        # Extract US ID from folder name (e.g., US-validate-menu-data-0001 → 0001)
        US_ID=$(echo "$US_FOLDER" | grep -oE '[0-9]+$' || true)
        if [[ -n "$US_ID" ]]; then
            # Find file with matching US ID
            for f in "$PRD_DIR"/US-*.md; do
                [[ -f "$f" ]] || continue
                if grep -q "^\*\*User Story ID:\*\* US-$US_ID" "$f" 2>/dev/null; then
                    get_issue_num "$f"
                    exit 0
                fi
            done
        fi
    fi
fi

# No parent found
exit 0
