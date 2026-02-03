import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { isOk } from '../../../../lib/monads';
import { claudeStrategy } from './claude';
import { cursorStrategy } from './cursor';
import { getIdeStrategy } from './index';

const TEST_DIR = join(import.meta.dir, '../../../../../.tmp/test-strategies');

describe('IDE strategies', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
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
      expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
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
      expect(existsSync(join(TEST_DIR, 'AGENTS.md'))).toBe(true);
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
