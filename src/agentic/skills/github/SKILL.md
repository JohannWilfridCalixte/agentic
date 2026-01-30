---
name: github
description: Use when syncing product artifacts to GitHub issues or pulling issues into markdown docs
---

# GitHub Sync

## Sync Single Issue

Run the sync script on the provided file:

```bash
./scripts/sync-to-github.sh $ARGUMENTS
```

Creates/updates a GitHub issue with:
- Title from markdown `# heading`
- Full content as issue body
- Label based on file type (Epic, User Story, Technical Plan, Security)
- Native sub-issue parent relationship (Epic → US → Tech Plan)
- Status sync (Done/Completed → closes issue)

The script adds `**GitHub Issue:** #N` to the markdown file after first sync.

## Sync All

Run the bash sync script:

```bash
./scripts/sync-all.sh $ARGUMENTS
```

Syncs all documentation in correct order:
1. **Phase 1**: Epics (`epic.md`)
2. **Phase 2**: User Stories (`US-*.md`)
3. **Phase 3**: Technical Plans + Security (`technical-plan.md`, `security-*.md`)

This order ensures parent issues exist before children reference them.

Use `--dry-run` to preview without making changes.
