#!/usr/bin/env bash
set -euo pipefail

# sync-all.sh - Sync all documentation files to GitHub issues
# Usage: ./sync-all.sh [--dry-run]
# Syncs in order to ensure parent issues exist before children.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DRY_RUN=false

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

cd "$PROJECT_ROOT"

echo "Scanning for syncable files..."
echo ""

# Collect files by phase
VISION=()
EPICS=()
USER_STORIES=()
TASK_DOCS=()

# Phase 1: Vision docs (no parents)
while IFS= read -r -d '' file; do
    VISION+=("$file")
done < <(find .{ide-folder}/{output-folder}/product/vision -name "*.md" -print0 2>/dev/null)
while IFS= read -r -d '' file; do
    VISION+=("$file")
done < <(find .{ide-folder}/{output-folder}/tech/vision -name "*.md" -print0 2>/dev/null)
while IFS= read -r -d '' file; do
    VISION+=("$file")
done < <(find .{ide-folder}/{output-folder}/tech/dx -name "*.md" -print0 2>/dev/null)

# Phase 2: Epics
while IFS= read -r -d '' file; do
    EPICS+=("$file")
done < <(find .{ide-folder}/{output-folder}/product/prd -name "epic.md" -print0 2>/dev/null)

# Phase 3: User Stories
while IFS= read -r -d '' file; do
    USER_STORIES+=("$file")
done < <(find .{ide-folder}/{output-folder}/product/prd -name "US-*.md" -print0 2>/dev/null)

# Phase 4: Task docs (technical-context, technical-plan, security-addendum)
while IFS= read -r -d '' file; do
    TASK_DOCS+=("$file")
done < <(find .{ide-folder}/{output-folder}/task -name "technical-context.md" -print0 2>/dev/null)
while IFS= read -r -d '' file; do
    TASK_DOCS+=("$file")
done < <(find .{ide-folder}/{output-folder}/task -name "technical-plan.md" -print0 2>/dev/null)
while IFS= read -r -d '' file; do
    TASK_DOCS+=("$file")
done < <(find .{ide-folder}/{output-folder}/task -name "security-addendum.md" -print0 2>/dev/null)

# Display function
display_file() {
    local file="$1"
    local rel_path="${file#$PROJECT_ROOT/}"
    local filename=$(basename "$file")
    local type=""

    case "$filename" in
        epic.md)              type="Epic" ;;
        US-*.md)              type="User Story" ;;
        technical-plan.md)    type="Tech Plan" ;;
        technical-context.md) type="Tech Context" ;;
        security-addendum.md) type="Security" ;;
        *)
            # Check path for vision/dx
            case "$file" in
                */product/vision/*) type="Prod Vision" ;;
                */tech/vision/*)    type="Tech Vision" ;;
                */tech/dx/*)        type="DX" ;;
                *)                  type="Doc" ;;
            esac
            ;;
    esac

    local issue_num=$(grep -m1 "^\*\*GitHub Issue:\*\*" "$file" 2>/dev/null | sed 's/.*#//' | tr -d ' ' || echo "")
    local status="NEW"
    [[ -n "$issue_num" ]] && status="#$issue_num"

    printf "  %-14s %-10s %s\n" "[$type]" "[$status]" "$rel_path"
}

TOTAL=$((${#VISION[@]} + ${#EPICS[@]} + ${#USER_STORIES[@]} + ${#TASK_DOCS[@]}))
echo "Found $TOTAL files to sync (in 4 phases):"
echo ""

echo "Phase 1: Vision & DX (${#VISION[@]})"
for file in "${VISION[@]}"; do display_file "$file"; done
echo ""

echo "Phase 2: Epics (${#EPICS[@]})"
for file in "${EPICS[@]}"; do display_file "$file"; done
echo ""

echo "Phase 3: User Stories (${#USER_STORIES[@]})"
for file in "${USER_STORIES[@]}"; do display_file "$file"; done
echo ""

echo "Phase 4: Task Docs (${#TASK_DOCS[@]})"
for file in "${TASK_DOCS[@]}"; do display_file "$file"; done
echo ""

if $DRY_RUN; then
    echo "Dry run - no changes made."
    exit 0
fi

read -p "Sync all $TOTAL files in order? [y/N] " -n 1 -r
echo

[[ $REPLY =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

SUCCESS=0
FAILED=0

sync_files() {
    local phase="$1"
    shift
    local files=("$@")

    [[ ${#files[@]} -eq 0 ]] && return

    echo ""
    echo "═══ $phase ═══"
    echo ""

    for file in "${files[@]}"; do
        local rel_path="${file#$PROJECT_ROOT/}"
        echo "→ $rel_path"

        if "$SCRIPT_DIR/sync-to-github.sh" "$file"; then
            ((SUCCESS++))
        else
            ((FAILED++))
            echo "  ✗ Failed"
        fi
        echo ""
    done
}

sync_files "Phase 1: Vision & DX" "${VISION[@]}"
sync_files "Phase 2: Epics" "${EPICS[@]}"
sync_files "Phase 3: User Stories" "${USER_STORIES[@]}"
sync_files "Phase 4: Task Docs" "${TASK_DOCS[@]}"

echo "========================================="
echo "Done. Success: $SUCCESS, Failed: $FAILED"
