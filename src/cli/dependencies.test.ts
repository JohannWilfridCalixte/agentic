import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
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
    ];

    for (const name of expected) {
      expect(KNOWN_WORKFLOWS).toContain(name);
    }
  });
});

describe('resolveWorkflowDependencies', () => {
  it('returns correct agents for a single workflow', () => {
    const result = resolveWorkflowDependencies(['product-spec']);

    expect(result.agents).toHaveLength(0);
    expect(result.skills).toEqual(
      expect.arrayContaining([
        'agentic-skill-product-discovery',
        'agentic-skill-brainstorming',
      ]),
    );
    expect(result.skills).toHaveLength(2);
    expect(result.workflows).toEqual(['agentic-workflow-product-spec']);
  });

  it('returns correct agents for implement workflow', () => {
    const result = resolveWorkflowDependencies(['implement']);

    expect(result.agents).toEqual(
      expect.arrayContaining([
        'agentic-agent-editor.md',
        'agentic-agent-test-engineer.md',
        'agentic-agent-qa.md',
        'agentic-agent-test-qa.md',
        'agentic-agent-security-qa.md',
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
    expect(result.agents).toContain('agentic-agent-architect.md');
    expect(result.agents).toContain('agentic-agent-editor.md');
  });

  it('prefixes agent names with agentic-agent- and .md suffix', () => {
    const result = resolveWorkflowDependencies(['technical-planning']);

    for (const agent of result.agents) {
      expect(agent).toMatch(/^agentic-agent-.+\.md$/);
    }
  });

  it('prefixes skill names with agentic-skill-', () => {
    const result = resolveWorkflowDependencies(['product-spec']);

    for (const skill of result.skills) {
      expect(skill).toMatch(/^agentic-skill-.+$/);
    }
  });

  it('prefixes workflow names with agentic-workflow-', () => {
    const result = resolveWorkflowDependencies(['product-spec', 'implement']);

    expect(result.workflows).toEqual([
      'agentic-workflow-product-spec',
      'agentic-workflow-implement',
    ]);
  });

  it('returns workflows in input order', () => {
    const result = resolveWorkflowDependencies(['debug', 'product-spec']);

    expect(result.workflows).toEqual([
      'agentic-workflow-debug',
      'agentic-workflow-product-spec',
    ]);
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
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('nonexistent'),
    );
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
      agents: ['agentic-agent-editor.md', 'agentic-agent-qa.md'],
      skills: [],
      workflows: [],
    };
    const newDeps = {
      agents: ['agentic-agent-qa.md'],
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
      skills: ['agentic-skill-brainstorming', 'agentic-skill-code'],
      workflows: [],
    };
    const newDeps = {
      agents: [],
      skills: ['agentic-skill-code'],
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
      workflows: ['agentic-workflow-product-spec'],
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
      agents: ['agentic-agent-editor.md'],
      skills: ['agentic-skill-code'],
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
      agents: ['agentic-agent-editor.md'],
      skills: ['agentic-skill-code'],
      workflows: ['agentic-workflow-implement'],
    };

    // Should not throw or remove anything
    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-editor.md'))).toBe(true);
  });

  it('applies namespace rewriting during cleanup', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'foo-agent-editor.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'foo-agent-qa.md'), 'test');

    const oldDeps = {
      agents: ['agentic-agent-editor.md', 'agentic-agent-qa.md'],
      skills: [],
      workflows: [],
    };
    const newDeps = {
      agents: ['agentic-agent-qa.md'],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'foo');

    // foo-agent-editor.md should be removed (rewritten from agentic-agent-editor.md)
    expect(await exists(join(TEST_DIR, 'agents', 'foo-agent-editor.md'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'agents', 'foo-agent-qa.md'))).toBe(true);
  });

  it('applies namespace rewriting to skill dirs during cleanup', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'foo-skill-brainstorming'), { recursive: true });
    await mkdir(join(TEST_DIR, 'skills', 'foo-skill-code'), { recursive: true });

    const oldDeps = {
      agents: [],
      skills: ['agentic-skill-brainstorming', 'agentic-skill-code'],
      workflows: [],
    };
    const newDeps = {
      agents: [],
      skills: ['agentic-skill-code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, oldDeps, newDeps, 'foo');

    expect(await exists(join(TEST_DIR, 'skills', 'foo-skill-brainstorming'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'skills', 'foo-skill-code'))).toBe(true);
  });
});
