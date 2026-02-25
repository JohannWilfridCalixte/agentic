---
name: agentic:skill:context7
description: Use when about to write code that uses external libraries - fetches up-to-date docs via Context7 MCP before implementation
---

# Context7

**ALWAYS** fetch docs from Context7 for external libraries before coding.

## Workflow

1. `resolve-library-id` — find the Context7 library ID for the package
2. `query-docs` — fetch relevant docs/examples using that ID

## Rules

- Fetch docs **before** writing code, not after
- Keep smallest relevant snippets
- Cite sources when pasting
- Ask if library name is ambiguous
- Max 3 calls per tool per question

## Query Tips

| Goal | query-docs `query` example |
|------|---------------------------|
| Setup | "How to set up authentication with JWT in Express.js" |
| API usage | "React useEffect cleanup function examples" |
| Config | "Drizzle ORM PostgreSQL connection configuration" |

Be specific — `"auth"` or `"hooks"` alone returns poor results.

## Output

Code + ≤150 word explanation + references + tests (when applicable).
