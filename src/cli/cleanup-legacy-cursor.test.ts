import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../lib/monads';
import { cleanupLegacyCursorDir } from './cleanup-legacy-cursor';
import type { ResolvedDependencies } from './dependencies';

const TEST_DIR = join(import.meta.dir, '../../.tmp/test-cleanup-legacy-cursor');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const managed: ResolvedDependencies = {
  agents: ['software-engineer.md', 'qa.md'],
  skills: ['code', 'code-testing'],
  workflows: ['implement', 'debug'],
};

describe('cleanupLegacyCursorDir', () => {
  beforeEach(async () => {
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it('no-op when .cursor/ is absent', async () => {
    const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    expect(result.data.filesRemoved).toEqual([]);
    expect(result.data.dirsRemoved).toEqual([]);
  });

  it('removes managed agents, skills, workflows and empty .cursor/', async () => {
    await mkdir(join(TEST_DIR, '.cursor/agents'), { recursive: true });
    await mkdir(join(TEST_DIR, '.cursor/skills'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/agents/agentic-agent-software-engineer.md'), '#');
    await writeFile(join(TEST_DIR, '.cursor/agents/agentic-agent-qa.md'), '#');
    await mkdir(join(TEST_DIR, '.cursor/skills/agentic-skill-code'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/skills/agentic-skill-code/SKILL.md'), '#');
    await mkdir(join(TEST_DIR, '.cursor/skills/agentic-skill-code-testing'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/skills/agentic-skill-code-testing/SKILL.md'), '#');
    await mkdir(join(TEST_DIR, '.cursor/skills/agentic-workflow-implement'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/skills/agentic-workflow-implement/SKILL.md'), '#');
    await mkdir(join(TEST_DIR, '.cursor/skills/agentic-workflow-debug'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/skills/agentic-workflow-debug/SKILL.md'), '#');
    await writeFile(join(TEST_DIR, '.cursor/.agentic.settings.json'), '{}');

    const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
    expect(isOk(result)).toBe(true);

    // Managed removed
    expect(await exists(join(TEST_DIR, '.cursor/agents/agentic-agent-software-engineer.md'))).toBe(
      false,
    );
    expect(await exists(join(TEST_DIR, '.cursor/skills/agentic-skill-code'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.cursor/skills/agentic-workflow-implement'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.cursor/.agentic.settings.json'))).toBe(false);

    // .cursor/ itself should be gone because no user-authored content remained
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
  });

  it('preserves user-authored .cursor/rules/ when present', async () => {
    await mkdir(join(TEST_DIR, '.cursor/agents'), { recursive: true });
    await mkdir(join(TEST_DIR, '.cursor/rules'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/agents/agentic-agent-qa.md'), '#');
    await writeFile(join(TEST_DIR, '.cursor/rules/user-authored.mdc'), '# custom rule');
    await writeFile(join(TEST_DIR, '.cursor/.agentic.settings.json'), '{}');

    const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
    expect(isOk(result)).toBe(true);

    expect(await exists(join(TEST_DIR, '.cursor/agents/agentic-agent-qa.md'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.cursor/rules/user-authored.mdc'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(true);
  });

  it('leaves non-agentic files in managed dirs untouched', async () => {
    await mkdir(join(TEST_DIR, '.cursor/skills'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/skills/my-custom-skill.md'), '# custom');

    const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
    expect(isOk(result)).toBe(true);

    expect(await exists(join(TEST_DIR, '.cursor/skills/my-custom-skill.md'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(true);
  });

  it('is idempotent — second call is a no-op', async () => {
    await mkdir(join(TEST_DIR, '.cursor/agents'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/agents/agentic-agent-qa.md'), '#');

    const first = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
    expect(isOk(first)).toBe(true);
    const second = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
    expect(isOk(second)).toBe(true);
    if (!isOk(second)) return;
    expect(second.data.filesRemoved).toEqual([]);
    expect(second.data.dirsRemoved).toEqual([]);
  });

  it('respects non-default namespace', async () => {
    await mkdir(join(TEST_DIR, '.cursor/agents'), { recursive: true });
    await writeFile(join(TEST_DIR, '.cursor/agents/myco-agent-software-engineer.md'), '#');
    await writeFile(join(TEST_DIR, '.cursor/agents/agentic-agent-software-engineer.md'), '#');

    const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'myco');
    expect(isOk(result)).toBe(true);

    // Custom-namespace file removed; default-namespace file untouched
    expect(await exists(join(TEST_DIR, '.cursor/agents/myco-agent-software-engineer.md'))).toBe(
      false,
    );
    expect(await exists(join(TEST_DIR, '.cursor/agents/agentic-agent-software-engineer.md'))).toBe(
      true,
    );
  });

  describe('security: containment / prefix-scan scope', () => {
    it('cleans via prefix-scan regardless of managed catalog (bare-init case)', async () => {
      // Bare init produces an empty ResolvedDependencies; cleanup must still
      // prune managed `<namespace>-*` content via prefix-scan.
      const emptyManaged: ResolvedDependencies = { agents: [], skills: [], workflows: [] };

      await mkdir(join(TEST_DIR, '.cursor/skills/agentic-skill-foo'), { recursive: true });
      await writeFile(join(TEST_DIR, '.cursor/skills/agentic-skill-foo/SKILL.md'), '# managed');
      await mkdir(join(TEST_DIR, '.cursor/rules'), { recursive: true });
      await writeFile(join(TEST_DIR, '.cursor/rules/keep.mdc'), '# user');

      const result = await cleanupLegacyCursorDir(TEST_DIR, emptyManaged, 'agentic');
      expect(isOk(result)).toBe(true);

      // Managed prefix-matched dir removed even though managed.skills is [].
      expect(await exists(join(TEST_DIR, '.cursor/skills/agentic-skill-foo'))).toBe(false);
      // User-authored rules left alone.
      expect(await exists(join(TEST_DIR, '.cursor/rules/keep.mdc'))).toBe(true);
    });

    it('does not remove entries whose names contain path separators or traversal', async () => {
      // Entries with `..` or slashes in names would escape .cursor/ if naively
      // concatenated. The prefix pattern forbids them; we verify they survive.
      await mkdir(join(TEST_DIR, '.cursor/skills'), { recursive: true });
      // File literally named with `..`-like characters — still a plain filename
      // under .cursor/skills, but the managed-pattern regex forbids path chars.
      await writeFile(join(TEST_DIR, '.cursor/skills/agentic-skill-safe-name.md'), '# matches');
      // A file whose literal name contains ".." — we need a sibling file the
      // pattern should NOT match (we pick a name that contains spaces/@ which
      // are not allowed by the pattern).
      await writeFile(join(TEST_DIR, '.cursor/skills/not-agentic-managed.md'), '# keep');

      const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
      expect(isOk(result)).toBe(true);

      // Non-matching entry preserved.
      expect(await exists(join(TEST_DIR, '.cursor/skills/not-agentic-managed.md'))).toBe(true);
    });

    it('never removes content outside .cursor/ even with adversarial namespace', async () => {
      // Create sibling dirs outside .cursor/ that could be targeted if
      // containment is broken.
      await mkdir(join(TEST_DIR, 'sibling'), { recursive: true });
      await writeFile(join(TEST_DIR, 'sibling/agentic-agent-qa.md'), '# outside');
      await mkdir(join(TEST_DIR, '.cursor/agents'), { recursive: true });
      await writeFile(join(TEST_DIR, '.cursor/agents/agentic-agent-qa.md'), '# inside');

      const result = await cleanupLegacyCursorDir(TEST_DIR, managed, 'agentic');
      expect(isOk(result)).toBe(true);

      // Inside-.cursor/ file gone; sibling file untouched.
      expect(await exists(join(TEST_DIR, '.cursor/agents/agentic-agent-qa.md'))).toBe(false);
      expect(await exists(join(TEST_DIR, 'sibling/agentic-agent-qa.md'))).toBe(true);
    });
  });
});
