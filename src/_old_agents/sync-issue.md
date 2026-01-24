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
