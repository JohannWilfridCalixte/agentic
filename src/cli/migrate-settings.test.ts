import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../lib/monads';
import { migrateLegacySettings } from './migrate-settings';
import { readSettings, SETTINGS_FILE } from './settings';

const TEST_DIR = join(import.meta.dir, '../../.tmp/test-migrate-settings');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function writeLegacy(relativeDir: string, payload: Record<string, unknown>): Promise<void> {
  await mkdir(join(TEST_DIR, relativeDir), { recursive: true });
  await Bun.write(
    join(TEST_DIR, relativeDir, '.agentic.settings.json'),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

const claudePayload = {
  namespace: 'agentic',
  version: '0.0.0',
  lastUpdate: '2026-04-01T00:00:00Z',
  outputFolder: '_agentic_output',
  highThinkingModelName: 'opus',
  codeWritingModelName: 'opus',
  qaModelName: 'opus',
  workflows: ['implement'],
  selectedProfiles: ['typescript'],
};

const cursorPayload = {
  namespace: 'agentic',
  version: '0.0.0',
  lastUpdate: '2026-04-02T00:00:00Z',
  outputFolder: '_agentic_output',
  highThinkingModelName: 'claude-4.6-opus-high-thinking',
  codeWritingModelName: 'claude-4.6-opus-high-thinking',
  qaModelName: 'claude-4.6-opus-high-thinking',
  workflows: ['debug'],
  selectedProfiles: ['python'],
};

const codexPayload = {
  namespace: 'agentic',
  version: '0.0.0',
  lastUpdate: '2026-04-03T00:00:00Z',
  outputFolder: '_agentic_output',
  highThinkingModelName: 'gpt-5.4',
  codeWritingModelName: 'gpt-5.4',
  qaModelName: 'gpt-5.4',
};

describe('migrateLegacySettings', () => {
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

  it('no-op when no legacy files exist', async () => {
    const result = await migrateLegacySettings(TEST_DIR);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    expect(result.data.migrated).toBe(false);
    expect(result.data.sourcesRemoved).toEqual([]);
    expect(await exists(join(TEST_DIR, SETTINGS_FILE))).toBe(false);
  });

  it('migrates claude-only legacy file and removes source', async () => {
    await writeLegacy('.claude', claudePayload);

    const result = await migrateLegacySettings(TEST_DIR);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    expect(result.data.migrated).toBe(true);
    expect(result.data.sourcesRemoved).toEqual(['.claude/.agentic.settings.json']);
    expect(result.data.idesDiscovered).toEqual(['claude']);

    expect(await exists(join(TEST_DIR, '.claude/.agentic.settings.json'))).toBe(false);
    expect(await exists(join(TEST_DIR, SETTINGS_FILE))).toBe(true);

    const read = await readSettings(TEST_DIR);
    expect(isOk(read)).toBe(true);
    if (!isOk(read)) return;
    expect(read.data.ides.claude?.highThinkingModelName).toBe('opus');
    expect(read.data.workflows).toEqual(['implement']);
  });

  it('migrates cursor-only legacy file', async () => {
    await writeLegacy('.cursor', cursorPayload);

    const result = await migrateLegacySettings(TEST_DIR);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    expect(result.data.idesDiscovered).toEqual(['cursor']);
    expect(await exists(join(TEST_DIR, '.cursor/.agentic.settings.json'))).toBe(false);

    const read = await readSettings(TEST_DIR);
    if (!isOk(read)) return;
    expect(read.data.ides.cursor?.highThinkingModelName).toBe('claude-4.6-opus-high-thinking');
    expect(read.data.workflows).toEqual(['debug']);
  });

  it('merges all three legacy files with claude winning on shared fields', async () => {
    await writeLegacy('.claude', { ...claudePayload, workflows: ['implement'] });
    await writeLegacy('.agents', { ...codexPayload, workflows: ['debug'] });
    await writeLegacy('.cursor', { ...cursorPayload, workflows: ['pr-review'] });

    const result = await migrateLegacySettings(TEST_DIR);
    expect(isOk(result)).toBe(true);
    if (!isOk(result)) return;
    expect(result.data.idesDiscovered).toEqual(
      expect.arrayContaining(['cursor', 'codex', 'claude']),
    );

    const read = await readSettings(TEST_DIR);
    if (!isOk(read)) return;

    // All three IDE blocks present
    expect(read.data.ides.claude?.highThinkingModelName).toBe('opus');
    expect(read.data.ides.cursor?.highThinkingModelName).toBe('claude-4.6-opus-high-thinking');
    expect(read.data.ides.codex?.highThinkingModelName).toBe('gpt-5.4');

    // Shared fields: claude wins (iterated last → last-write-wins)
    expect(read.data.workflows).toEqual(['implement']);

    // Legacy files all removed
    expect(await exists(join(TEST_DIR, '.claude/.agentic.settings.json'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.cursor/.agentic.settings.json'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.agents/.agentic.settings.json'))).toBe(false);
  });

  it('preserves pre-existing .agentic.json ide entries not covered by legacy files', async () => {
    // Seed a pre-existing .agentic.json with codex entry only.
    await Bun.write(
      join(TEST_DIR, SETTINGS_FILE),
      `${JSON.stringify(
        {
          namespace: 'agentic',
          version: '0.0.0',
          lastUpdate: '2026-04-10T00:00:00Z',
          ides: {
            codex: {
              outputFolder: '_agentic_output',
              highThinkingModelName: 'gpt-5.4',
              codeWritingModelName: 'gpt-5.4',
              qaModelName: 'gpt-5.4',
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    // Seed only a claude legacy file.
    await writeLegacy('.claude', claudePayload);

    const result = await migrateLegacySettings(TEST_DIR);
    expect(isOk(result)).toBe(true);

    const read = await readSettings(TEST_DIR);
    if (!isOk(read)) return;

    // Both codex (pre-existing) and claude (migrated) are present.
    expect(read.data.ides.codex?.highThinkingModelName).toBe('gpt-5.4');
    expect(read.data.ides.claude?.highThinkingModelName).toBe('opus');
  });

  it('is idempotent — second run is a no-op', async () => {
    await writeLegacy('.claude', claudePayload);

    const first = await migrateLegacySettings(TEST_DIR);
    expect(isOk(first)).toBe(true);

    const second = await migrateLegacySettings(TEST_DIR);
    expect(isOk(second)).toBe(true);
    if (!isOk(second)) return;
    expect(second.data.migrated).toBe(false);
  });
});
