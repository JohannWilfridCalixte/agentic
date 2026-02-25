import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  cleanupStaleFiles,
  KNOWN_WORKFLOWS,
  resolveWorkflowDependencies,
  validateWorkflows,
} from './dependencies';

describe('KNOWN_WORKFLOWS', () => {
  it('contains exactly 7 workflow names', () => {
    expect(KNOWN_WORKFLOWS).toHaveLength(7);
  });

  it('includes all expected workflow names', () => {
    const expected = [
      'product-spec',
      'technical-planning',
      'auto-implement',
      'implement',
      'quick-spec-and-implement',
      'debug',
      'frontend-development',
    ] as const;

    for (const name of expected) {
      expect(KNOWN_WORKFLOWS).toContain(name);
    }
  });
});

describe('resolveWorkflowDependencies', () => {
  it('returns correct agents for a single workflow', () => {
    const result = resolveWorkflowDependencies(['product-spec']);

    expect(result.agents).toHaveLength(0);
    expect(result.skills).toEqual(expect.arrayContaining(['product-discovery', 'brainstorming']));
    expect(result.skills).toHaveLength(2);
    expect(result.workflows).toEqual(['product-spec']);
  });

  it('returns correct agents for implement workflow', () => {
    const result = resolveWorkflowDependencies(['implement']);

    expect(result.agents).toEqual(
      expect.arrayContaining([
        'editor.md',
        'test-engineer.md',
        'qa.md',
        'test-qa.md',
        'security-qa.md',
      ]),
    );
    expect(result.agents).toHaveLength(5);
  });

  it('deduplicates agents across multiple workflows', () => {
    const result = resolveWorkflowDependencies(['implement', 'debug']);

    // Both have 'editor', 'test-engineer', 'qa', 'test-qa'
    const uniqueAgents = new Set(result.agents);
    expect(uniqueAgents.size).toBe(result.agents.length);
  });

  it('deduplicates skills across multiple workflows', () => {
    const result = resolveWorkflowDependencies(['implement', 'debug']);

    // Both share 'code', 'typescript-engineer', etc.
    const uniqueSkills = new Set(result.skills);
    expect(uniqueSkills.size).toBe(result.skills.length);
  });

  it('unions agents from multiple workflows', () => {
    const result = resolveWorkflowDependencies(['implement', 'technical-planning']);

    // implement has editor, test-engineer, qa, test-qa, security-qa
    // technical-planning has architect
    expect(result.agents).toContain('architect.md');
    expect(result.agents).toContain('editor.md');
  });

  it('returns bare agent names with .md suffix', () => {
    const result = resolveWorkflowDependencies(['technical-planning']);

    for (const agent of result.agents) {
      expect(agent).toMatch(/^[a-z-]+\.md$/);
    }
  });

  it('returns bare skill names without prefix', () => {
    const result = resolveWorkflowDependencies(['product-spec']);

    for (const skill of result.skills) {
      expect(skill).toMatch(/^[a-z-]+$/);
      expect(skill).not.toMatch(/^agentic-/);
    }
  });

  it('returns bare workflow names without prefix', () => {
    const result = resolveWorkflowDependencies(['product-spec', 'implement']);

    expect(result.workflows).toEqual(['product-spec', 'implement']);
  });

  it('returns workflows in input order', () => {
    const result = resolveWorkflowDependencies(['debug', 'product-spec']);

    expect(result.workflows).toEqual(['debug', 'product-spec']);
  });
});

describe('validateWorkflows', () => {
  let warnSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns Ok for all known workflows', () => {
    const result = validateWorkflows(['product-spec', 'implement']);

    expect(result._type).toBe('Ok');
    if (result._type === 'Ok') {
      expect(result.data).toEqual(['product-spec', 'implement']);
    }
  });

  it('returns Ok for a single known workflow', () => {
    const result = validateWorkflows(['debug']);

    expect(result._type).toBe('Ok');
    if (result._type === 'Ok') {
      expect(result.data).toEqual(['debug']);
    }
  });

  it('returns Err when all workflows are unknown', () => {
    const result = validateWorkflows(['nonexistent', 'also-fake']);

    expect(result._type).toBe('Err');
    if (result._type === 'Err') {
      expect(result.data.code).toBe('ALL_WORKFLOWS_UNKNOWN');
      expect(result.data.message).toContain('nonexistent');
      expect(result.data.message).toContain('also-fake');
      expect(result.data.message).toContain('Available:');
      expect(result.data.unknownWorkflows).toEqual(['nonexistent', 'also-fake']);
    }
  });

  it('returns Ok with warning for partial unknowns', () => {
    const result = validateWorkflows(['product-spec', 'nonexistent']);

    expect(result._type).toBe('Ok');
    if (result._type === 'Ok') {
      expect(result.data).toEqual(['product-spec']);
    }
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));
  });

  it('filters out unknown workflows from result', () => {
    const result = validateWorkflows(['implement', 'fake1', 'debug', 'fake2']);

    expect(result._type).toBe('Ok');
    if (result._type === 'Ok') {
      expect(result.data).toEqual(['implement', 'debug']);
    }
  });

  it('returns Err for empty known list even with unknowns', () => {
    const result = validateWorkflows(['xyz']);

    expect(result._type).toBe('Err');
    if (result._type === 'Err') {
      expect(result.data.code).toBe('ALL_WORKFLOWS_UNKNOWN');
    }
  });

  it('includes available workflows in error message', () => {
    const result = validateWorkflows(['nope']);

    expect(result._type).toBe('Err');
    if (result._type === 'Err') {
      for (const wf of KNOWN_WORKFLOWS) {
        expect(result.data.message).toContain(wf);
      }
    }
  });
});

describe('cleanupStaleFiles', () => {
  const TEST_DIR = join(import.meta.dir, '../../.tmp/test-cleanup');

  async function exists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }

  beforeEach(async () => {
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(join(TEST_DIR, 'agents'), { recursive: true });
    await mkdir(join(TEST_DIR, 'skills'), { recursive: true });
  });

  afterEach(async () => {
    if (await exists(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it('removes agent file when no longer needed', async () => {
    // Create stale agent file
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-qa.md'), 'test');

    const oldDeps = {
      agents: ['editor.md', 'qa.md'],
      skills: [],
      workflows: [],
    };
    const newDeps = {
      agents: ['qa.md'],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-qa.md'))).toBe(true);
  });

  it('removes skill directory when no longer needed', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'agentic-skill-brainstorming'), { recursive: true });
    await writeFile(join(TEST_DIR, 'skills', 'agentic-skill-brainstorming', 'SKILL.md'), 'test');
    await mkdir(join(TEST_DIR, 'skills', 'agentic-skill-code'), { recursive: true });
    await writeFile(join(TEST_DIR, 'skills', 'agentic-skill-code', 'SKILL.md'), 'test');

    const oldDeps = {
      agents: [],
      skills: ['brainstorming', 'code'],
      workflows: [],
    };
    const newDeps = {
      agents: [],
      skills: ['code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'skills', 'agentic-skill-brainstorming'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'skills', 'agentic-skill-code'))).toBe(true);
  });

  it('removes workflow directory when no longer needed', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'agentic-workflow-product-spec'), { recursive: true });
    await writeFile(join(TEST_DIR, 'skills', 'agentic-workflow-product-spec', 'SKILL.md'), 'test');

    const oldDeps = {
      agents: [],
      skills: [],
      workflows: ['product-spec'],
    };
    const newDeps = {
      agents: [],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'skills', 'agentic-workflow-product-spec'))).toBe(false);
  });

  it('does nothing when deps are identical', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'), 'test');
    await mkdir(join(TEST_DIR, 'skills', 'agentic-skill-code'), { recursive: true });

    const deps = {
      agents: ['editor.md'],
      skills: ['code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, deps, deps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'))).toBe(true);
    expect(await exists(join(TEST_DIR, 'skills', 'agentic-skill-code'))).toBe(true);
  });

  it('handles empty old deps (first init)', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'), 'test');

    const oldDeps = { agents: [], skills: [], workflows: [] };
    const newDeps = {
      agents: ['editor.md'],
      skills: ['code'],
      workflows: ['implement'],
    };

    // Should not throw or remove anything
    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'))).toBe(true);
  });

  it('applies namespace rewriting during cleanup', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'foo-agent-editor.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'foo-agent-qa.md'), 'test');

    const oldDeps = {
      agents: ['editor.md', 'qa.md'],
      skills: [],
      workflows: [],
    };
    const newDeps = {
      agents: ['qa.md'],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'foo');

    // foo-agent-editor.md should be removed (bare name + namespace = foo-agent-editor.md)
    expect(await exists(join(TEST_DIR, 'agents', 'foo-agent-editor.md'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'agents', 'foo-agent-qa.md'))).toBe(true);
  });

  it('applies namespace rewriting to skill dirs during cleanup', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'foo-skill-brainstorming'), { recursive: true });
    await mkdir(join(TEST_DIR, 'skills', 'foo-skill-code'), { recursive: true });

    const oldDeps = {
      agents: [],
      skills: ['brainstorming', 'code'],
      workflows: [],
    };
    const newDeps = {
      agents: [],
      skills: ['code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'foo');

    expect(await exists(join(TEST_DIR, 'skills', 'foo-skill-brainstorming'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'skills', 'foo-skill-code'))).toBe(true);
  });
});
