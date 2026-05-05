import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../../lib/monads';
import { SETTINGS_FILE } from '../settings';
import { version } from './version';

const TEST_DIR = join(import.meta.dir, '../../../.tmp/test-version');

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

describe('version command', () => {
  const originalCwd = process.cwd();
  // biome-ignore lint/suspicious/noExplicitAny: console.log spy argument inference
  let logSpy: ReturnType<typeof spyOn<Console, 'log'>> & any;
  const logs: string[] = [];

  beforeEach(async () => {
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
    logs.length = 0;
    logSpy = spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      logs.push(args.map((a) => String(a)).join(' '));
    });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    logSpy.mockRestore();
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it('prints no-IDE hint when .agentic.json is absent', async () => {
    const result = await version();
    expect(isOk(result)).toBe(true);

    expect(logs.some((line) => line.includes('No IDE setup detected'))).toBe(true);
  });

  it('renders one line per IDE when configs differ', async () => {
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
        cursor: {
          outputFolder: '_agentic_output',
          highThinkingModelName: 'claude-4.6-opus-high-thinking',
          codeWritingModelName: 'claude-4.6-opus-high-thinking',
          qaModelName: 'claude-4.6-opus-high-thinking',
        },
      },
    });

    const result = await version();
    expect(isOk(result)).toBe(true);

    const claudeLines = logs.filter((line) => line.startsWith('Claude Code:'));
    const cursorLines = logs.filter((line) => line.startsWith('Cursor:'));
    expect(claudeLines).toHaveLength(1);
    expect(cursorLines).toHaveLength(1);
  });

  it('groups cursor+codex on one line when outputFolder + model settings are identical', async () => {
    await writeRootSettings({
      namespace: 'agentic',
      version: '0.2.0',
      lastUpdate: '2026-04-15T00:00:00Z',
      ides: {
        cursor: {
          outputFolder: '_agentic_output',
          highThinkingModelName: 'gpt-5.4',
          codeWritingModelName: 'gpt-5.4',
          qaModelName: 'gpt-5.4',
        },
        codex: {
          outputFolder: '_agentic_output',
          highThinkingModelName: 'gpt-5.4',
          codeWritingModelName: 'gpt-5.4',
          qaModelName: 'gpt-5.4',
        },
      },
    });

    const result = await version();
    expect(isOk(result)).toBe(true);

    const groupedLines = logs.filter((line) => line.includes('Cursor') && line.includes('Codex'));
    expect(groupedLines).toHaveLength(1);
    // No separate-per-IDE lines when grouped
    const separateCursor = logs.filter(
      (line) => line.startsWith('Cursor:') && !line.includes('Codex'),
    );
    expect(separateCursor).toHaveLength(0);
  });

  it('renders separate lines when cursor and codex have distinct model settings', async () => {
    await writeRootSettings({
      namespace: 'agentic',
      version: '0.2.0',
      lastUpdate: '2026-04-15T00:00:00Z',
      ides: {
        cursor: {
          outputFolder: '_agentic_output',
          highThinkingModelName: 'claude-4.6-opus-high-thinking',
          codeWritingModelName: 'claude-4.6-opus-high-thinking',
          qaModelName: 'claude-4.6-opus-high-thinking',
        },
        codex: {
          outputFolder: '_agentic_output',
          highThinkingModelName: 'gpt-5.4',
          codeWritingModelName: 'gpt-5.4',
          qaModelName: 'gpt-5.4',
        },
      },
    });

    const result = await version();
    expect(isOk(result)).toBe(true);

    const cursorSoloLines = logs.filter(
      (line) => line.startsWith('Cursor:') && !line.includes('Codex'),
    );
    const codexSoloLines = logs.filter(
      (line) => line.startsWith('Codex:') && !line.includes('Cursor'),
    );
    expect(cursorSoloLines).toHaveLength(1);
    expect(codexSoloLines).toHaveLength(1);
  });
});
