import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isErr, isOk } from '../../../lib/monads';
import { SETTINGS_FILE } from '../../settings';
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

async function readRootSettings(): Promise<Record<string, unknown>> {
  const content = await Bun.file(join(TEST_DIR, SETTINGS_FILE)).text();
  return JSON.parse(content) as Record<string, unknown>;
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
    // Cursor now targets .agents/ (not .cursor/)
    expect(await exists(join(TEST_DIR, '.agents'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'AGENTS.md'))).toBe(true);
  });

  it('initializes codex IDE only', async () => {
    const result = await init({ ide: 'codex' });

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.agents'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(false);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'AGENTS.md'))).toBe(true);
  });

  it('creates expected directory structure for codex', async () => {
    await init({ ide: 'codex' });

    const agentsDir = join(TEST_DIR, '.agents');

    expect(await exists(join(agentsDir, 'agents'))).toBe(true);
    expect(await exists(join(agentsDir, 'skills'))).toBe(true);
  });

  it('initializes all three IDEs with ide=all', async () => {
    const result = await init({ ide: 'all' });

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(true);
    // Cursor + Codex share .agents/
    expect(await exists(join(TEST_DIR, '.agents'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
  });

  it('initializes all three IDEs by default (no ide option)', async () => {
    const result = await init({});

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.agents'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
  });

  it('both still works as alias for all', async () => {
    const result = await init({ ide: 'both' });

    expect(isOk(result)).toBe(true);
    expect(await exists(join(TEST_DIR, '.claude'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.agents'))).toBe(true);
    expect(await exists(join(TEST_DIR, '.cursor'))).toBe(false);
  });

  it('shared AGENTS.md between cursor and codex is not duplicated', async () => {
    const result = await init({ ide: 'all' });

    expect(isOk(result)).toBe(true);

    const agentsMdPath = join(TEST_DIR, 'AGENTS.md');
    expect(await exists(agentsMdPath)).toBe(true);

    const content = await Bun.file(agentsMdPath).text();
    const sectionMarkerCount = content.split('# Agentic Framework').length - 1;
    expect(sectionMarkerCount).toBe(1);
  });

  it('creates expected directory structure for claude', async () => {
    await init({ ide: 'claude' });

    const claudeDir = join(TEST_DIR, '.claude');

    expect(await exists(join(claudeDir, 'agents'))).toBe(true);
    expect(await exists(join(claudeDir, 'skills'))).toBe(true);
  });

  it('creates expected directory structure for cursor', async () => {
    await init({ ide: 'cursor' });

    // Cursor now writes into the shared .agents/ dir
    const cursorDir = join(TEST_DIR, '.agents');

    expect(await exists(join(cursorDir, 'agents'))).toBe(true);
    expect(await exists(join(cursorDir, 'skills'))).toBe(true);
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

  describe('root .agentic.json config', () => {
    it('creates .agentic.json at project root after init', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);
      expect(await exists(join(TEST_DIR, SETTINGS_FILE))).toBe(true);
    });

    it('contains ides.claude block when claude is initialized', async () => {
      await init({ ide: 'claude' });

      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, unknown>;

      expect(ides.claude).toBeDefined();
      expect(ides.cursor).toBeUndefined();
      expect(ides.codex).toBeUndefined();
    });

    it('contains ides.cursor block when cursor is initialized', async () => {
      await init({ ide: 'cursor' });

      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, unknown>;

      expect(ides.cursor).toBeDefined();
      expect(ides.claude).toBeUndefined();
      expect(ides.codex).toBeUndefined();
    });

    it('contains all three ide blocks when ide=all', async () => {
      await init({ ide: 'all' });

      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, unknown>;

      expect(ides.claude).toBeDefined();
      expect(ides.cursor).toBeDefined();
      expect(ides.codex).toBeDefined();
    });

    it('does not create per-IDE .agentic.settings.json files', async () => {
      await init({ ide: 'all' });

      expect(await exists(join(TEST_DIR, '.claude/.agentic.settings.json'))).toBe(false);
      expect(await exists(join(TEST_DIR, '.agents/.agentic.settings.json'))).toBe(false);
      expect(await exists(join(TEST_DIR, '.cursor/.agentic.settings.json'))).toBe(false);
    });

    it('stores namespace at shared root (not inside ide blocks)', async () => {
      await init({ ide: 'claude' });

      const settings = await readRootSettings();

      expect(settings.namespace).toBe('agentic');
      // ide blocks should not carry namespace
      const ides = settings.ides as Record<string, Record<string, unknown>>;
      expect(ides.claude?.namespace).toBeUndefined();
    });

    it('stores outputFolder under ides.{ide} block', async () => {
      await init({ ide: 'claude' });

      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, Record<string, unknown>>;

      expect(ides.claude?.outputFolder).toBe('_agentic_output');
      // Shared root should not carry outputFolder
      expect(settings.outputFolder).toBeUndefined();
    });
  });

  describe('legacy migration', () => {
    it('migrates per-IDE .agentic.settings.json into root .agentic.json and removes legacy files', async () => {
      // Seed legacy per-IDE settings files.
      await mkdir(join(TEST_DIR, '.claude'), { recursive: true });
      await mkdir(join(TEST_DIR, '.cursor'), { recursive: true });
      await writeFile(
        join(TEST_DIR, '.claude/.agentic.settings.json'),
        `${JSON.stringify(
          {
            namespace: 'agentic',
            version: '0.0.0',
            lastUpdate: '2026-01-01T00:00:00Z',
            outputFolder: '_agentic_output',
            highThinkingModelName: 'opus',
            codeWritingModelName: 'opus',
            qaModelName: 'opus',
            workflows: ['implement'],
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(
        join(TEST_DIR, '.cursor/.agentic.settings.json'),
        `${JSON.stringify(
          {
            namespace: 'agentic',
            version: '0.0.0',
            lastUpdate: '2026-01-02T00:00:00Z',
            outputFolder: '_agentic_output',
            highThinkingModelName: 'claude-4.6-opus-high-thinking',
            codeWritingModelName: 'claude-4.6-opus-high-thinking',
            qaModelName: 'claude-4.6-opus-high-thinking',
          },
          null,
          2,
        )}\n`,
      );

      const result = await init({ ide: 'claude' });
      expect(isOk(result)).toBe(true);

      // Root .agentic.json exists and merges both IDE blocks
      expect(await exists(join(TEST_DIR, SETTINGS_FILE))).toBe(true);
      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, Record<string, unknown>>;

      // Claude block is re-written by setupIde after migration; cursor block preserved from migration
      expect(ides.claude).toBeDefined();
      expect(ides.cursor).toBeDefined();
      expect(ides.cursor?.highThinkingModelName).toBe('claude-4.6-opus-high-thinking');

      // Legacy per-IDE settings files are removed
      expect(await exists(join(TEST_DIR, '.claude/.agentic.settings.json'))).toBe(false);
      expect(await exists(join(TEST_DIR, '.cursor/.agentic.settings.json'))).toBe(false);
    });
  });

  describe('legacy cursor managed cleanup', () => {
    it('bare init removes managed .cursor/skills/* content but preserves user-authored .cursor/rules/', async () => {
      // Seed an agentic-prefixed managed skill + a user-authored rules file in legacy .cursor/.
      // Bare init (no --workflows) must still remove managed content via prefix-scan.
      await mkdir(join(TEST_DIR, '.cursor/skills/agentic-skill-foo'), { recursive: true });
      await writeFile(
        join(TEST_DIR, '.cursor/skills/agentic-skill-foo/SKILL.md'),
        '# managed skill',
      );
      await mkdir(join(TEST_DIR, '.cursor/rules'), { recursive: true });
      await writeFile(join(TEST_DIR, '.cursor/rules/bar.mdc'), '# user-authored rule');

      const result = await init({ ide: 'cursor' });
      expect(isOk(result)).toBe(true);

      // Managed skill is gone (prefix-scan matched `agentic-skill-foo`)
      expect(await exists(join(TEST_DIR, '.cursor/skills/agentic-skill-foo'))).toBe(false);
      // User-authored rules file preserved
      expect(await exists(join(TEST_DIR, '.cursor/rules/bar.mdc'))).toBe(true);
      // .cursor/ itself remains because rules/ is user-authored
      expect(await exists(join(TEST_DIR, '.cursor'))).toBe(true);
    });
  });

  describe('with --namespace foo', () => {
    it('renames agent files to foo-agent-*.md', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const agentsDir = join(TEST_DIR, '.claude', 'agents');
      const files = await readdir(agentsDir);

      const agentFiles = files.filter((f) => f.endsWith('.md'));
      for (const file of agentFiles) {
        expect(file).toStartWith('foo-agent-');
        expect(file).not.toStartWith('agentic-');
      }
      expect(agentFiles.length).toBeGreaterThan(0);
    });

    it('renames skill dirs to foo-skill-*', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      const entries = await readdir(skillsDir);

      const skillDirs = entries.filter((e) => e.startsWith('foo-skill-'));
      expect(skillDirs.length).toBeGreaterThan(0);

      const agenticDirs = entries.filter((e) => e.startsWith('agentic-'));
      expect(agenticDirs).toHaveLength(0);
    });

    it('renames workflow dirs to foo-workflow-*', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      const entries = await readdir(skillsDir);

      const workflowDirs = entries.filter((e) => e.startsWith('foo-workflow-'));
      expect(workflowDirs.length).toBeGreaterThan(0);

      const agenticWorkflowDirs = entries.filter((e) => e.startsWith('agentic-workflow-'));
      expect(agenticWorkflowDirs).toHaveLength(0);
    });

    it('replaces agentic: references in content with foo:', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const claudeMdContent = await Bun.file(join(TEST_DIR, 'CLAUDE.md')).text();

      expect(claudeMdContent).toContain('foo:skill:');
      expect(claudeMdContent).toContain('foo:workflow:');
      expect(claudeMdContent).not.toContain('agentic:skill:');
      expect(claudeMdContent).not.toContain('agentic:workflow:');
    });

    it('creates section marker as # Foo Framework', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const claudeMdContent = await Bun.file(join(TEST_DIR, 'CLAUDE.md')).text();

      expect(claudeMdContent).toContain('# Foo Framework');
      expect(claudeMdContent).not.toContain('# Agentic Framework');
    });

    it('uses _foo_output as default output folder', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, Record<string, unknown>>;

      expect(settings.namespace).toBe('foo');
      expect(ides.claude?.outputFolder).toBe('_foo_output');
    });

    it('stores namespace in settings', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const settings = await readRootSettings();

      expect(settings.namespace).toBe('foo');
    });

    it('replaces all agentic references in file content', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      // Check an agent file for content replacements
      const agentsDir = join(TEST_DIR, '.claude', 'agents');
      const files = await readdir(agentsDir);
      const agentFile = files.find((f) => f.includes('foo-agent-cpo'));

      if (agentFile) {
        const content = await Bun.file(join(agentsDir, agentFile)).text();
        expect(content).not.toContain('agentic-agent-');
        expect(content).not.toContain('agentic-skill-');
      }
    });
  });

  describe('backward compatibility: default namespace', () => {
    it('produces agentic-agent-* files when no namespace specified', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const agentsDir = join(TEST_DIR, '.claude', 'agents');
      const files = await readdir(agentsDir);

      const agentFiles = files.filter((f) => f.endsWith('.md'));
      for (const file of agentFiles) {
        expect(file).toStartWith('agentic-agent-');
      }
    });

    it('produces agentic-skill-* dirs when no namespace specified', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      const entries = await readdir(skillsDir);

      const skillDirs = entries.filter((e) => e.startsWith('agentic-skill-'));
      expect(skillDirs.length).toBeGreaterThan(0);
    });

    it('uses _agentic_output as default output folder', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const settings = await readRootSettings();
      const ides = settings.ides as Record<string, Record<string, unknown>>;

      expect(ides.claude?.outputFolder).toBe('_agentic_output');
    });

    it('uses # Agentic Framework section marker', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const claudeMdContent = await Bun.file(join(TEST_DIR, 'CLAUDE.md')).text();

      expect(claudeMdContent).toContain('# Agentic Framework');
    });

    it('preserves agentic: colon identifiers in content', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const claudeMdContent = await Bun.file(join(TEST_DIR, 'CLAUDE.md')).text();

      expect(claudeMdContent).toContain('agentic:');
    });
  });

  describe('with --workflows (selective install)', () => {
    it('installs only product-spec workflow deps', async () => {
      const result = await init({ ide: 'claude', workflows: ['product-spec'] });

      expect(isOk(result)).toBe(true);

      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      const entries = await readdir(skillsDir);

      // product-spec has skills: product-discovery, brainstorming + workflow dir + profile skills
      expect(entries).toContain('agentic-skill-product-discovery');
      expect(entries).toContain('agentic-skill-brainstorming');
      expect(entries).toContain('agentic-workflow-product-spec');
      expect(entries).toContain('agentic-skill-typescript-engineer');
      expect(entries).toContain('agentic-skill-python-engineer');

      // Should NOT have other workflows or skills
      expect(entries).not.toContain('agentic-skill-code');
      expect(entries).not.toContain('agentic-workflow-implement');
      expect(entries).toHaveLength(5);
    });

    it('installs no top-level agents when -w is used', async () => {
      const result = await init({ ide: 'claude', workflows: ['product-spec'] });

      expect(isOk(result)).toBe(true);

      const agentsDir = join(TEST_DIR, '.claude', 'agents');

      // product-spec has no agents, so agents dir may not exist or be empty
      const agentsDirExists = await exists(agentsDir);
      if (agentsDirExists) {
        const files = await readdir(agentsDir);
        // No top-level agents (cpo, cto, dx, team) and no subagents for product-spec
        expect(files).toHaveLength(0);
      }
    });

    it('installs subagents for implement workflow', async () => {
      const result = await init({ ide: 'claude', workflows: ['implement'] });

      expect(isOk(result)).toBe(true);

      const agentsDir = join(TEST_DIR, '.claude', 'agents');
      const files = await readdir(agentsDir);

      // implement: software-engineer, test-engineer, qa, test-qa, security-qa
      expect(files).toContain('agentic-agent-software-engineer.md');
      expect(files).toContain('agentic-agent-test-engineer.md');
      expect(files).toContain('agentic-agent-qa.md');
      expect(files).toContain('agentic-agent-test-qa.md');
      expect(files).toContain('agentic-agent-security-qa.md');
      expect(files).toHaveLength(5);

      // No top-level agents
      expect(files).not.toContain('agentic-agent-cpo.md');
      expect(files).not.toContain('agentic-agent-cto.md');
    });

    it('unions deps from multiple workflows', async () => {
      const result = await init({ ide: 'claude', workflows: ['product-spec', 'implement'] });

      expect(isOk(result)).toBe(true);

      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      const entries = await readdir(skillsDir);

      // From product-spec
      expect(entries).toContain('agentic-skill-product-discovery');
      expect(entries).toContain('agentic-skill-brainstorming');
      expect(entries).toContain('agentic-workflow-product-spec');

      // From implement
      expect(entries).toContain('agentic-skill-code');
      expect(entries).toContain('agentic-workflow-implement');
    });

    it('works with namespace + workflows combined', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo', workflows: ['product-spec'] });

      expect(isOk(result)).toBe(true);

      const skillsDir = join(TEST_DIR, '.claude', 'skills');
      const entries = await readdir(skillsDir);

      // Should use foo- prefix
      expect(entries).toContain('foo-skill-product-discovery');
      expect(entries).toContain('foo-skill-brainstorming');
      expect(entries).toContain('foo-workflow-product-spec');

      // No agentic- prefixed entries
      const agenticEntries = entries.filter((e) => e.startsWith('agentic-'));
      expect(agenticEntries).toHaveLength(0);
    });

    it('persists workflows in settings', async () => {
      const result = await init({ ide: 'claude', workflows: ['product-spec', 'implement'] });

      expect(isOk(result)).toBe(true);

      const settings = await readRootSettings();

      // Workflows live at the shared root (not per-IDE)
      expect(settings.workflows).toEqual(['product-spec', 'implement']);
    });

    it('omits workflows from settings when not specified', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const settings = await readRootSettings();

      expect(settings.workflows).toBeUndefined();
    });

    it('returns error when all workflows are unknown', async () => {
      const result = await init({ ide: 'claude', workflows: ['nonexistent', 'also-fake'] });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.data.message).toContain('nonexistent');
        expect(result.data.message).toContain('Available:');
      }
    });

    it('full install regression: no --workflows installs everything', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const agentsDir = join(TEST_DIR, '.claude', 'agents');
      const files = await readdir(agentsDir);

      // Full install includes top-level agents + subagents
      expect(files.length).toBeGreaterThan(5);

      // Should have top-level agents (cpo, cto, etc.)
      const topLevelAgents = files.filter(
        (f) => f.includes('cpo') || f.includes('cto') || f.includes('dx-engineer'),
      );
      expect(topLevelAgents.length).toBeGreaterThan(0);
    });
  });
});
