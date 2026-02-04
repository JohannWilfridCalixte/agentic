import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isOk } from '../../../../lib/monads';
import { claudeStrategy } from './claude';
import { cursorStrategy } from './cursor';
import { getIdeStrategy } from './index';

const TEST_DIR = join(import.meta.dir, '../../../../../.tmp/test-strategies');

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('IDE strategies', () => {
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

  describe('getIdeStrategy', () => {
    it('returns claude strategy for claude', () => {
      const strategy = getIdeStrategy('claude');
      expect(strategy.ide).toBe('claude');
    });

    it('returns cursor strategy for cursor', () => {
      const strategy = getIdeStrategy('cursor');
      expect(strategy.ide).toBe('cursor');
    });
  });

  describe('claudeStrategy', () => {
    it('has correct ide property', () => {
      expect(claudeStrategy.ide).toBe('claude');
    });

    it('creates CLAUDE.md when not exists', async () => {
      const result = await claudeStrategy.setup(TEST_DIR);

      expect(isOk(result)).toBe(true);
      expect(await exists(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
    });

    it('appends to existing CLAUDE.md without agentic section', async () => {
      const existingPath = join(TEST_DIR, 'CLAUDE.md');
      await Bun.write(existingPath, '# Existing Content\n');

      const result = await claudeStrategy.setup(TEST_DIR);

      expect(isOk(result)).toBe(true);

      const content = await Bun.file(existingPath).text();

      expect(content).toContain('# Existing Content');
      expect(content).toContain('# Agentic Framework');
    });

    it('skips when CLAUDE.md already has agentic section', async () => {
      const existingPath = join(TEST_DIR, 'CLAUDE.md');
      await Bun.write(existingPath, '# Content\n\n# Agentic Framework\nExisting.');

      const result = await claudeStrategy.setup(TEST_DIR);

      expect(isOk(result)).toBe(true);

      const content = await Bun.file(existingPath).text();

      expect(content).toBe('# Content\n\n# Agentic Framework\nExisting.');
    });
  });

  describe('cursorStrategy', () => {
    it('has correct ide property', () => {
      expect(cursorStrategy.ide).toBe('cursor');
    });

    it('creates AGENTS.md when not exists', async () => {
      const result = await cursorStrategy.setup(TEST_DIR);

      expect(isOk(result)).toBe(true);
      expect(await exists(join(TEST_DIR, 'AGENTS.md'))).toBe(true);
    });

    it('appends to existing AGENTS.md without agentic section', async () => {
      const existingPath = join(TEST_DIR, 'AGENTS.md');
      await Bun.write(existingPath, '# Existing Content\n');

      const result = await cursorStrategy.setup(TEST_DIR);

      expect(isOk(result)).toBe(true);

      const content = await Bun.file(existingPath).text();

      expect(content).toContain('# Existing Content');
      expect(content).toContain('# Agentic Framework');
    });

    it('skips when AGENTS.md already has agentic section', async () => {
      const existingPath = join(TEST_DIR, 'AGENTS.md');
      await Bun.write(existingPath, '# Content\n\n# Agentic Framework\nExisting.');

      const result = await cursorStrategy.setup(TEST_DIR);

      expect(isOk(result)).toBe(true);

      const content = await Bun.file(existingPath).text();

      expect(content).toBe('# Content\n\n# Agentic Framework\nExisting.');
    });
  });
});
