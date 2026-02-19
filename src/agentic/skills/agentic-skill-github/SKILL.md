---
name: agentic:skill:github
description: Use when interacting with GitHub - syncing docs to issues, creating PRs, managing issues/PRs, or any gh CLI operation
---

# GitHub Operations

Scripts in `{ide-folder}/skills/github/scripts/`.

## Available Scripts

| Script | Purpose |
|--------|---------|
| `sync-to-github.sh <file>` | Push markdown to GitHub issue |
| `sync-from-github.sh <file>` | Pull issue updates to markdown |
| `sync-all.sh [--dry-run]` | Sync all docs in order |
| `create-pr.sh <log-file> [--base <branch>]` | Create PR from implementation log |
| `resolve-parent.sh <file>` | Find parent issue number |

## Sync to GitHub

```bash
{ide-folder}/skills/github/scripts/sync-to-github.sh <markdown-file>
```

Creates/updates issue with:
- Title from `# heading`
- Full content as body
- Label by file type (Epic, User Story, Technical Plan, Security)
- Native sub-issue parent relationship
- Status sync (Done/Completed → closes)

Adds `**GitHub Issue:** #N` to file after first sync.

## Sync All Docs

```bash
{ide-folder}/skills/github/scripts/sync-all.sh [--dry-run]
```

Syncs in order: Vision → Epics → User Stories → Task Docs.

## Create PR

```bash
{ide-folder}/skills/github/scripts/create-pr.sh <implementation-log.md> [--base main]
```

Creates PR with log as description, auto-closes related issue.

## gh CLI Fallback

If no script matches your need, use `gh` CLI directly:

```bash
# Issues
gh issue list
gh issue view <number>
gh issue create --title "..." --body "..."
gh issue edit <number> --title "..." --body "..."
gh issue close <number>

# PRs
gh pr list
gh pr view <number>
gh pr create --title "..." --body "..."
gh pr merge <number>
gh pr checkout <number>

# API (for advanced ops)
gh api repos/{owner}/{repo}/issues
gh api graphql -f query='...'
```

Run `gh --help` or `gh <command> --help` for full options.
