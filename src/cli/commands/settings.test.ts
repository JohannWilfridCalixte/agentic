import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../../lib/monads';
import { readSettings, SETTINGS_FILE } from '../settings';
import { settingsUpdate } from './settings';

const TEST_DIR = join(import.meta.dir, '../../../.tmp/test-settings-apply');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function seedRootSettings(payload: Record<string, unknown>): Promise<void> {
  await Bun.write(join(TEST_DIR, SETTINGS_FILE), `${JSON.stringify(payload, null, 2)}\n`);
}

const baseClaudeIde = {
  outputFolder: '_agentic_output',
  highThinkingModelName: 'opus',
  codeWritingModelName: 'opus',
  qaModelName: 'opus',
};

const baseCursorIde = {
  outputFolder: '_agentic_output',
  highThinkingModelName: 'claude-4.6-opus-high-thinking',
  codeWritingModelName: 'claude-4.6-opus-high-thinking',
  qaModelName: 'claude-4.6-opus-high-thinking',
};

const baseCodexIde = {
  outputFolder: '_agentic_output',
  highThinkingModelName: 'gpt-5.4',
  codeWritingModelName: 'gpt-5.4',
  qaModelName: 'gpt-5.4',
};

describe('settingsUpdate (agentic settings apply)', () => {
  const originalCwd = process.cwd();

  beforeEach(async () => {
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  describe('AC-07: preserves non-targeted IDE entries in .agentic.json', () => {
    it('updating --ide cursor preserves ides.claude and ides.codex entries', async () => {
      // Arrange: seed a fully populated root .agentic.json with 3 IDEs.
      await seedRootSettings({
        namespace: 'agentic',
        version: '0.2.0',
        lastUpdate: '2026-04-15T00:00:00Z',
        workflows: ['implement'],
        ides: {
          claude: baseClaudeIde,
          cursor: baseCursorIde,
          codex: baseCodexIde,
        },
      });

      // Act: update only cursor via settingsUpdate public surface.
      const result = await settingsUpdate({
        ide: 'cursor',
        highThinkingModelName: 'new-cursor-model',
      });
      expect(isOk(result)).toBe(true);

      // Assert: cursor block updated, claude + codex untouched.
      const read = await readSettings(TEST_DIR);
      expect(isOk(read)).toBe(true);
      if (!isOk(read)) return;

      expect(read.data.ides.cursor?.highThinkingModelName).toBe('new-cursor-model');
      expect(read.data.ides.claude).toEqual(baseClaudeIde);
      expect(read.data.ides.codex).toEqual(baseCodexIde);
    });

    it('updating --ide claude preserves ides.cursor and ides.codex entries', async () => {
      await seedRootSettings({
        namespace: 'agentic',
        version: '0.2.0',
        lastUpdate: '2026-04-15T00:00:00Z',
        ides: {
          claude: baseClaudeIde,
          cursor: baseCursorIde,
          codex: baseCodexIde,
        },
      });

      const result = await settingsUpdate({
        ide: 'claude',
        outputFolder: '_custom_output',
      });
      expect(isOk(result)).toBe(true);

      const read = await readSettings(TEST_DIR);
      expect(isOk(read)).toBe(true);
      if (!isOk(read)) return;

      expect(read.data.ides.claude?.outputFolder).toBe('_custom_output');
      expect(read.data.ides.cursor).toEqual(baseCursorIde);
      expect(read.data.ides.codex).toEqual(baseCodexIde);
    });

    it('shared root fields (workflows) remain intact when updating one IDE', async () => {
      await seedRootSettings({
        namespace: 'agentic',
        version: '0.2.0',
        lastUpdate: '2026-04-15T00:00:00Z',
        workflows: ['implement', 'debug'],
        selectedProfiles: ['typescript'],
        ides: {
          claude: baseClaudeIde,
          cursor: baseCursorIde,
        },
      });

      const result = await settingsUpdate({
        ide: 'cursor',
        codeWritingModelName: 'another-cursor-model',
      });
      expect(isOk(result)).toBe(true);

      const read = await readSettings(TEST_DIR);
      expect(isOk(read)).toBe(true);
      if (!isOk(read)) return;

      expect(read.data.workflows).toEqual(['implement', 'debug']);
      expect(read.data.selectedProfiles).toEqual(['typescript']);
    });
  });
});
