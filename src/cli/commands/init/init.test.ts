import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../../../lib/monads';
import { init } from './index';

const TEST_DIR = join(import.meta.dir, '../../../../.tmp/test-init');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('init', () => {
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

  it('initializes claude IDE only', async () => {
    const result = await init({ ide: 'claude' });

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
  });

  it('initializes cursor IDE only', async () => {
    const result = await init({ ide: 'cursor' });

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'AGENTS.md'))).toBe(true);
  });

  it('initializes both IDEs by default', async () => {
    const result = await init({ ide: 'both' });

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(true);
  });

  it('creates expected directory structure for claude', async () => {
    await init({ ide: 'claude' });

    const claudeDir = join(TEST_DIR, '.claude');

    expect(await exists(join(claudeDir, 'agents'))).toBe(true);
    expect(await exists(join(claudeDir, 'skills'))).toBe(true);
    expect(await exists(join(claudeDir, 'skills', 'agentic-skill-github', 'scripts'))).toBe(true);
  });

  it('creates expected directory structure for cursor', async () => {
    await init({ ide: 'cursor' });

    const cursorDir = join(TEST_DIR, '.cursor');

    expect(await exists(join(cursorDir, 'agents'))).toBe(true);
    expect(await exists(join(cursorDir, 'skills'))).toBe(true);
    expect(await exists(join(cursorDir, 'skills', 'agentic-skill-github', 'scripts'))).toBe(true);
  });

  it('uses custom output folder', async () => {
    const result = await init({ ide: 'claude', outputFolder: 'custom_output' });

    expect(isOk(result)).toBe(true);

    // Verify output-folder was replaced in template files
    const claudeDir = join(TEST_DIR, '.claude');
    const skillFile = Bun.file(join(claudeDir, 'skills', 'agentic-skill-qa', 'SKILL.md'));
    const content = await skillFile.text();

    expect(content).toContain('custom_output/');
    expect(content).not.toContain('{output-folder}');
    expect(content).not.toContain('{outputFolder}');
  });
});
