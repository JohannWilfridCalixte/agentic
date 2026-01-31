---
name: brainstorming
description: Use when turning ideas into designs and specs through collaborative dialogue. Triggers on design exploration, architecture planning, feature scoping, or when user has a rough idea needing refinement.
---

# Brainstorming Ideas Into Designs

Turn ideas into fully formed designs through natural collaborative dialogue.

## Process

**1. Understand context**
- Check project state (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice when possible
- Focus on: purpose, constraints, success criteria

**2. Explore approaches**
- Propose 2-3 approaches with trade-offs
- Lead with your recommendation and reasoning

**3. Present design**
- Break into sections of 200-300 words
- Ask after each section if it looks right
- Cover: architecture, components, data flow, error handling, testing
- Go back and clarify when something doesn't make sense

## After Design

Write validated design to `{output-folder}/product/YYYY-MM-DD-<topic>-design.md` and commit.

## Principles

- **One question at a time** - Don't overwhelm
- **Multiple choice preferred** - Easier to answer
- **YAGNI ruthlessly** - Remove unnecessary features
- **Explore alternatives** - Always 2-3 approaches before settling
- **Incremental validation** - Present in sections, validate each
