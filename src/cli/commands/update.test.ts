import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../../lib/monads';
import { readSettings, SETTINGS_FILE } from '../settings';
import { detectIdes, update } from './update';

const TEST_DIR = join(import.meta.dir, '../../../.tmp/test-update-detect');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function writeRootSettings(payload: Record<string, unknown>): Promise<void> {
  await Bun.write(join(TEST_DIR, SETTINGS_FILE), `${JSON.stringify(payload, null, 2)}\n`);
}

async function writeLegacySettings(relativeDir: string): Promise<void> {
  await mkdir(join(TEST_DIR, relativeDir), { recursive: true });
  await Bun.write(
    join(TEST_DIR, relativeDir, '.agentic.settings.json'),
    `${JSON.stringify(
      {
        namespace: 'agentic',
        version: '0.0.0',
        lastUpdate: '2026-01-01T00:00:00Z',
        outputFolder: '_agentic_output',
        highThinkingModelName: 'opus',
        codeWritingModelName: 'opus',
        qaModelName: 'opus',
      },
      null,
      2,
    )}\n`,
  );
}

describe('detectIdes', () => {
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

  describe('with .agentic.json present', () => {
    it('returns Object.keys(ides) from root config', async () => {
      await writeRootSettings({
        namespace: 'agentic',
        version: '0.2.0',
        lastUpdate: '2026-04-15T00:00:00Z',
        ides: {
          claude: {
            outputFolder: '_agentic_output',
            highThinkingModelName: 'opus',
            codeWritingModelName: 'opus',
            qaModelName: 'opus',
          },
          codex: {
            outputFolder: '_agentic_output',
            highThinkingModelName: 'gpt-5.4',
            codeWritingModelName: 'gpt-5.4',
            qaModelName: 'gpt-5.4',
          },
        },
      });

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual(expect.arrayContaining(['claude', 'codex']));
      expect(result).toHaveLength(2);
    });

    it('returns empty array when ides is empty', async () => {
      await writeRootSettings({
        namespace: 'agentic',
        version: '0.2.0',
        lastUpdate: '2026-04-15T00:00:00Z',
        ides: {},
      });

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual([]);
    });

    it('ignores legacy per-IDE settings when .agentic.json exists', async () => {
      await writeRootSettings({
        namespace: 'agentic',
        version: '0.2.0',
        lastUpdate: '2026-04-15T00:00:00Z',
        ides: {
          claude: {
            outputFolder: '_agentic_output',
            highThinkingModelName: 'opus',
            codeWritingModelName: 'opus',
            qaModelName: 'opus',
          },
        },
      });

      // Legacy file present but should be ignored since root .agentic.json exists.
      await writeLegacySettings('.cursor');

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual(['claude']);
      expect(result).not.toContain('cursor');
    });
  });

  describe('with .agentic.json absent (legacy fallback)', () => {
    it('returns empty array when no legacy files exist', async () => {
      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual([]);
    });

    it('detects claude from legacy .claude/.agentic.settings.json', async () => {
      await writeLegacySettings('.claude');

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual(['claude']);
    });

    it('detects cursor from legacy .cursor/.agentic.settings.json', async () => {
      await writeLegacySettings('.cursor');

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual(['cursor']);
    });

    it('detects codex from legacy .agents/.agentic.settings.json', async () => {
      await writeLegacySettings('.agents');

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual(['codex']);
    });

    it('detects all three IDEs from legacy files', async () => {
      await writeLegacySettings('.claude');
      await writeLegacySettings('.cursor');
      await writeLegacySettings('.agents');

      const result = await detectIdes(TEST_DIR);
      expect(result).toEqual(expect.arrayContaining(['claude', 'cursor', 'codex']));
      expect(result).toHaveLength(3);
    });
  });
});

describe('update() end-to-end (AC-08)', () => {
  const originalCwd = process.cwd();
  const LEGACY_TEST_DIR = join(import.meta.dir, '../../../.tmp/test-update-e2e');

  async function e2eExists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }

  beforeEach(async () => {
    if (await e2eExists(LEGACY_TEST_DIR)) {
      await rm(LEGACY_TEST_DIR, { recursive: true });
    }
    await mkdir(LEGACY_TEST_DIR, { recursive: true });
    process.chdir(LEGACY_TEST_DIR);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (await e2eExists(LEGACY_TEST_DIR)) {
      await rm(LEGACY_TEST_DIR, { recursive: true });
    }
  });

  it('migrates legacy per-IDE settings, cleans .cursor/, writes root .agentic.json', async () => {
    // Arrange: legacy-cursor fixture — a legacy per-IDE settings file and
    // legacy-managed .cursor/skills content + user-authored .cursor/rules/.
    await mkdir(join(LEGACY_TEST_DIR, '.claude'), { recursive: true });
    await writeFile(
      join(LEGACY_TEST_DIR, '.claude/.agentic.settings.json'),
      `${JSON.stringify(
        {
          namespace: 'agentic',
          version: '0.0.0',
          lastUpdate: '2026-01-01T00:00:00Z',
          outputFolder: '_agentic_output',
          highThinkingModelName: 'opus',
          codeWritingModelName: 'opus',
          qaModelName: 'opus',
        },
        null,
        2,
      )}\n`,
    );

    await mkdir(join(LEGACY_TEST_DIR, '.cursor/skills/agentic-skill-foo'), { recursive: true });
    await writeFile(
      join(LEGACY_TEST_DIR, '.cursor/skills/agentic-skill-foo/SKILL.md'),
      '# managed',
    );
    await mkdir(join(LEGACY_TEST_DIR, '.cursor/rules'), { recursive: true });
    await writeFile(join(LEGACY_TEST_DIR, '.cursor/rules/bar.mdc'), '# user-authored');

    // Act: run update (--ide claude limits the reinstall surface to claude).
    const result = await update({ ide: 'claude' });
    expect(isOk(result)).toBe(true);

    // Assert (migration): legacy per-IDE file migrated + removed.
    expect(await e2eExists(join(LEGACY_TEST_DIR, '.claude/.agentic.settings.json'))).toBe(false);
    expect(await e2eExists(join(LEGACY_TEST_DIR, SETTINGS_FILE))).toBe(true);

    // Assert (root config): shape + ides.claude block present.
    const read = await readSettings(LEGACY_TEST_DIR);
    expect(isOk(read)).toBe(true);
    if (!isOk(read)) return;
    expect(read.data.namespace).toBe('agentic');
    expect(read.data.ides.claude).toBeDefined();

    // Assert (legacy cursor cleanup): managed content removed; user-authored preserved.
    expect(await e2eExists(join(LEGACY_TEST_DIR, '.cursor/skills/agentic-skill-foo'))).toBe(false);
    expect(await e2eExists(join(LEGACY_TEST_DIR, '.cursor/rules/bar.mdc'))).toBe(true);
  });
});
