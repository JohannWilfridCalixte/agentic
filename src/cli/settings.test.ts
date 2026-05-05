import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isErr, isOk } from '../lib/monads';
import {
  type IdeSettings,
  readEffectiveSettings,
  readSettings,
  SETTINGS_FILE,
  type SharedSettings,
  writeSettings,
} from './settings';

const TEST_DIR = join(import.meta.dir, '../../.tmp/test-settings');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const claudeIde: IdeSettings = {
  outputFolder: '_agentic_output',
  highThinkingModelName: 'opus',
  codeWritingModelName: 'opus',
  qaModelName: 'opus',
};

const cursorIde: IdeSettings = {
  outputFolder: '_agentic_output',
  highThinkingModelName: 'claude-4.6-opus-high-thinking',
  codeWritingModelName: 'claude-4.6-opus-high-thinking',
  qaModelName: 'claude-4.6-opus-high-thinking',
};

const codexIde: IdeSettings = {
  outputFolder: '_agentic_output',
  highThinkingModelName: 'gpt-5.4',
  codeWritingModelName: 'gpt-5.4',
  qaModelName: 'gpt-5.4',
};

const baseShared: Omit<SharedSettings, 'version' | 'lastUpdate'> = {
  namespace: 'agentic',
  workflows: ['implement'],
  selectedProfiles: ['typescript'],
};

describe('settings', () => {
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

  describe('writeSettings + readSettings round-trip', () => {
    it('creates .agentic.json at project root with shared + ide fields', async () => {
      const write = await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'claude',
        ideSettings: claudeIde,
      });
      expect(isOk(write)).toBe(true);

      expect(await exists(join(TEST_DIR, SETTINGS_FILE))).toBe(true);

      const read = await readSettings(TEST_DIR);
      expect(isOk(read)).toBe(true);
      if (!isOk(read)) return;

      expect(read.data.namespace).toBe('agentic');
      expect(read.data.workflows).toEqual(['implement']);
      expect(read.data.selectedProfiles).toEqual(['typescript']);
      expect(read.data.version).toBeTypeOf('string');
      expect(read.data.lastUpdate).toBeTypeOf('string');
      expect(read.data.ides.claude).toEqual(claudeIde);
    });

    it('writes pretty JSON with trailing newline', async () => {
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'claude',
        ideSettings: claudeIde,
      });

      const content = await Bun.file(join(TEST_DIR, SETTINGS_FILE)).text();
      expect(content.endsWith('\n')).toBe(true);
      expect(content).toContain('\n  "namespace"');
    });
  });

  describe('writeSettings preserve-merge across IDEs', () => {
    it('preserves previously-written ide entries when writing a new ide', async () => {
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'claude',
        ideSettings: claudeIde,
      });
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'cursor',
        ideSettings: cursorIde,
      });
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'codex',
        ideSettings: codexIde,
      });

      const read = await readSettings(TEST_DIR);
      expect(isOk(read)).toBe(true);
      if (!isOk(read)) return;

      expect(read.data.ides.claude).toEqual(claudeIde);
      expect(read.data.ides.cursor).toEqual(cursorIde);
      expect(read.data.ides.codex).toEqual(codexIde);
    });

    it('overwrites only the targeted ide entry, not the others', async () => {
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'claude',
        ideSettings: claudeIde,
      });
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'cursor',
        ideSettings: cursorIde,
      });

      const updatedCursor: IdeSettings = { ...cursorIde, highThinkingModelName: 'changed' };
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'cursor',
        ideSettings: updatedCursor,
      });

      const read = await readSettings(TEST_DIR);
      expect(isOk(read)).toBe(true);
      if (!isOk(read)) return;

      expect(read.data.ides.claude).toEqual(claudeIde);
      expect(read.data.ides.cursor).toEqual(updatedCursor);
    });
  });

  describe('readEffectiveSettings', () => {
    it('merges shared fields with the requested ide block', async () => {
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'cursor',
        ideSettings: cursorIde,
      });

      const effective = await readEffectiveSettings(TEST_DIR, 'cursor');
      expect(isOk(effective)).toBe(true);
      if (!isOk(effective)) return;

      expect(effective.data.namespace).toBe('agentic');
      expect(effective.data.workflows).toEqual(['implement']);
      expect(effective.data.outputFolder).toBe(cursorIde.outputFolder);
      expect(effective.data.highThinkingModelName).toBe(cursorIde.highThinkingModelName);
      expect(effective.data.codeWritingModelName).toBe(cursorIde.codeWritingModelName);
      expect(effective.data.qaModelName).toBe(cursorIde.qaModelName);
    });

    it('returns IDE_NOT_CONFIGURED when the requested ide is absent', async () => {
      await writeSettings(TEST_DIR, {
        shared: baseShared,
        ide: 'claude',
        ideSettings: claudeIde,
      });

      const effective = await readEffectiveSettings(TEST_DIR, 'cursor');
      expect(isErr(effective)).toBe(true);
      if (!isErr(effective)) return;
      expect(effective.data.code).toBe('IDE_NOT_CONFIGURED');
    });
  });

  describe('error paths', () => {
    it('readSettings returns READ_SETTINGS_FAILED when file missing', async () => {
      const result = await readSettings(TEST_DIR);
      expect(isErr(result)).toBe(true);
      if (!isErr(result)) return;
      expect(result.data.code).toBe('READ_SETTINGS_FAILED');
    });

    it('readSettings returns PARSE_FAILED on invalid JSON', async () => {
      await Bun.write(join(TEST_DIR, SETTINGS_FILE), '{ invalid json');
      const result = await readSettings(TEST_DIR);
      expect(isErr(result)).toBe(true);
      if (!isErr(result)) return;
      expect(result.data.code).toBe('PARSE_FAILED');
    });
  });

  describe('path traversal / validation (security)', () => {
    it('readSettings rejects invalid namespace (path separator) with VALIDATION_FAILED', async () => {
      await Bun.write(
        join(TEST_DIR, SETTINGS_FILE),
        `${JSON.stringify(
          {
            namespace: '../../../../etc',
            version: '0.2.0',
            lastUpdate: '2026-04-16T00:00:00Z',
            ides: {},
          },
          null,
          2,
        )}\n`,
      );

      const result = await readSettings(TEST_DIR);
      expect(isErr(result)).toBe(true);
      if (!isErr(result)) return;
      expect(result.data.code).toBe('VALIDATION_FAILED');
    });

    it('readSettings rejects namespace with slash with VALIDATION_FAILED', async () => {
      await Bun.write(
        join(TEST_DIR, SETTINGS_FILE),
        `${JSON.stringify(
          {
            namespace: 'foo/bar',
            version: '0.2.0',
            lastUpdate: '2026-04-16T00:00:00Z',
            ides: {},
          },
          null,
          2,
        )}\n`,
      );

      const result = await readSettings(TEST_DIR);
      expect(isErr(result)).toBe(true);
      if (!isErr(result)) return;
      expect(result.data.code).toBe('VALIDATION_FAILED');
    });

    it('readSettings drops poisoned skillOverrides entries containing traversal payloads', async () => {
      await Bun.write(
        join(TEST_DIR, SETTINGS_FILE),
        `${JSON.stringify(
          {
            namespace: 'agentic',
            version: '0.2.0',
            lastUpdate: '2026-04-16T00:00:00Z',
            skillOverrides: {
              code: '../../../../etc/passwd',
              safe: 'typescript-engineer',
            },
            ides: {},
          },
          null,
          2,
        )}\n`,
      );

      const result = await readSettings(TEST_DIR);
      expect(isOk(result)).toBe(true);
      if (!isOk(result)) return;

      // Poisoned entry dropped; safe entry retained.
      expect(result.data.skillOverrides?.code).toBeUndefined();
      expect(result.data.skillOverrides?.safe).toBe('typescript-engineer');
    });

    it('readSettings drops poisoned workflows entries with path separators', async () => {
      await Bun.write(
        join(TEST_DIR, SETTINGS_FILE),
        `${JSON.stringify(
          {
            namespace: 'agentic',
            version: '0.2.0',
            lastUpdate: '2026-04-16T00:00:00Z',
            workflows: ['implement', '../evil', 'foo/bar'],
            ides: {},
          },
          null,
          2,
        )}\n`,
      );

      const result = await readSettings(TEST_DIR);
      expect(isOk(result)).toBe(true);
      if (!isOk(result)) return;

      expect(result.data.workflows).toEqual(['implement']);
    });

    it('readSettings drops poisoned selectedProfiles entries with traversal', async () => {
      await Bun.write(
        join(TEST_DIR, SETTINGS_FILE),
        `${JSON.stringify(
          {
            namespace: 'agentic',
            version: '0.2.0',
            lastUpdate: '2026-04-16T00:00:00Z',
            selectedProfiles: ['typescript', '../../etc/passwd'],
            ides: {},
          },
          null,
          2,
        )}\n`,
      );

      const result = await readSettings(TEST_DIR);
      expect(isOk(result)).toBe(true);
      if (!isOk(result)) return;

      expect(result.data.selectedProfiles).toEqual(['typescript']);
    });

    it('readSettings drops poisoned profile names with path separators', async () => {
      await Bun.write(
        join(TEST_DIR, SETTINGS_FILE),
        `${JSON.stringify(
          {
            namespace: 'agentic',
            version: '0.2.0',
            lastUpdate: '2026-04-16T00:00:00Z',
            profiles: [
              { name: 'typescript', detect: ['ts'], skills: ['typescript-engineer'] },
              { name: '../evil', detect: [], skills: ['code'] },
            ],
            ides: {},
          },
          null,
          2,
        )}\n`,
      );

      const result = await readSettings(TEST_DIR);
      expect(isOk(result)).toBe(true);
      if (!isOk(result)) return;

      expect(result.data.profiles?.map((p) => p.name)).toEqual(['typescript']);
    });
  });
});
