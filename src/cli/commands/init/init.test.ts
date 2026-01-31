import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { isOk } from '../../../lib/monads';
import { init } from './index';

const TEST_DIR = join(import.meta.dir, '../../../../.tmp/test-init');

describe('init', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it('initializes claude IDE only', async () => {
    const result = await init({ ide: 'claude' });

    expect(isOk(result)).toBe(true);
    expect(existsSync(join(TEST_DIR, '.claude'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor'))).toBe(false);
    expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
  });

  it('initializes cursor IDE only', async () => {
    const result = await init({ ide: 'cursor' });

    expect(isOk(result)).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.claude'))).toBe(false);
    expect(existsSync(join(TEST_DIR, '.cursor', 'rules', 'agentic.mdc'))).toBe(true);
  });

  it('initializes both IDEs by default', async () => {
    const result = await init({ ide: 'both' });

    expect(isOk(result)).toBe(true);
    expect(existsSync(join(TEST_DIR, '.claude'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor'))).toBe(true);
  });

  it('creates expected directory structure for claude', async () => {
    await init({ ide: 'claude' });

    const claudeDir = join(TEST_DIR, '.claude');

    expect(existsSync(join(claudeDir, 'agents'))).toBe(true);
    expect(existsSync(join(claudeDir, 'skills'))).toBe(true);
    expect(existsSync(join(claudeDir, 'skills', 'github', 'scripts'))).toBe(true);
  });

  it('creates expected directory structure for cursor', async () => {
    await init({ ide: 'cursor' });

    const cursorDir = join(TEST_DIR, '.cursor');

    expect(existsSync(join(cursorDir, 'agents'))).toBe(true);
    expect(existsSync(join(cursorDir, 'skills'))).toBe(true);
    expect(existsSync(join(cursorDir, 'skills', 'github', 'scripts'))).toBe(true);
  });

  it('uses custom output folder', async () => {
    const result = await init({ ide: 'claude', outputFolder: 'custom_output' });

    expect(isOk(result)).toBe(true);

    // Verify output-folder was replaced in template files
    const claudeDir = join(TEST_DIR, '.claude');
    const skillFile = Bun.file(join(claudeDir, 'skills', 'qa', 'SKILL.md'));
    const content = await skillFile.text();

    expect(content).toContain('custom_output/');
    expect(content).not.toContain('{output-folder}');
  });
});
