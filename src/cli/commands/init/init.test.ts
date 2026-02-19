import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isErr, isOk } from '../../../lib/monads';
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

      const settingsContent = await Bun.file(
        join(TEST_DIR, '.claude', '.agentic.settings.json'),
      ).text();
      const settings = JSON.parse(settingsContent);

      expect(settings.namespace).toBe('foo');
      expect(settings.outputFolder).toBe('_foo_output');
    });

    it('stores namespace in settings', async () => {
      const result = await init({ ide: 'claude', namespace: 'foo' });

      expect(isOk(result)).toBe(true);

      const settingsContent = await Bun.file(
        join(TEST_DIR, '.claude', '.agentic.settings.json'),
      ).text();
      const settings = JSON.parse(settingsContent);

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

      const settingsContent = await Bun.file(
        join(TEST_DIR, '.claude', '.agentic.settings.json'),
      ).text();
      const settings = JSON.parse(settingsContent);

      expect(settings.outputFolder).toBe('_agentic_output');
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

      // product-spec has skills: product-discovery, brainstorming + workflow dir
      expect(entries).toContain('agentic-skill-product-discovery');
      expect(entries).toContain('agentic-skill-brainstorming');
      expect(entries).toContain('agentic-workflow-product-spec');

      // Should NOT have other workflows or skills
      expect(entries).not.toContain('agentic-skill-code');
      expect(entries).not.toContain('agentic-workflow-implement');
      expect(entries).toHaveLength(3);
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

      // implement: editor, test-engineer, qa, test-qa, security-qa
      expect(files).toContain('agentic-agent-editor.md');
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
      const agenticEntries = entries.filter(e => e.startsWith('agentic-'));
      expect(agenticEntries).toHaveLength(0);
    });

    it('persists workflows in settings', async () => {
      const result = await init({ ide: 'claude', workflows: ['product-spec', 'implement'] });

      expect(isOk(result)).toBe(true);

      const settingsContent = await Bun.file(
        join(TEST_DIR, '.claude', '.agentic.settings.json'),
      ).text();
      const settings = JSON.parse(settingsContent);

      expect(settings.workflows).toEqual(['product-spec', 'implement']);
    });

    it('omits workflows from settings when not specified', async () => {
      const result = await init({ ide: 'claude' });

      expect(isOk(result)).toBe(true);

      const settingsContent = await Bun.file(
        join(TEST_DIR, '.claude', '.agentic.settings.json'),
      ).text();
      const settings = JSON.parse(settingsContent);

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
      const topLevelAgents = files.filter(f =>
        f.includes('cpo') || f.includes('cto') || f.includes('dx-engineer'),
      );
      expect(topLevelAgents.length).toBeGreaterThan(0);
    });
  });
});
