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
