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
  it('contains exactly 10 workflow names', () => {
    expect(KNOWN_WORKFLOWS).toHaveLength(10);
  });

  it('includes all expected workflow names', () => {
    const expected = [
      'product-spec',
      'product-vision',
      'ask-codebase',
      'technical-planning',
      'implement',
      'debug',
      'frontend-development',
      'auto-implement',
      'pr-review',
      'create-workflow',
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
        'software-engineer.md',
        'test-engineer.md',
        'qa.md',
        'test-qa.md',
        'security-qa.md',
      ]),
    );
    expect(result.agents).toHaveLength(5);
  });

  it('returns correct dependencies for ask-codebase workflow', () => {
    const result = resolveWorkflowDependencies(['ask-codebase']);

    expect(result.agents).toEqual(['architect.md']);
    expect(result.skills).toEqual(
      expect.arrayContaining(['gather-technical-context', 'skill-injection-protocol', 'context7']),
    );
    expect(result.skills).toHaveLength(3);
    expect(result.workflows).toEqual(['ask-codebase']);
  });

  it('deduplicates agents across multiple workflows', () => {
    const result = resolveWorkflowDependencies(['implement', 'debug']);

    // Both have 'software-engineer', 'test-engineer', 'qa', 'test-qa'
    const uniqueAgents = new Set(result.agents);
    expect(uniqueAgents.size).toBe(result.agents.length);
  });

  it('deduplicates skills across multiple workflows', () => {
    const result = resolveWorkflowDependencies(['implement', 'debug']);

    // Both share 'code', 'clean-architecture', etc.
    const uniqueSkills = new Set(result.skills);
    expect(uniqueSkills.size).toBe(result.skills.length);
  });

  it('unions agents from multiple workflows', () => {
    const result = resolveWorkflowDependencies(['implement', 'technical-planning']);

    // implement has software-engineer, test-engineer, qa, test-qa, security-qa
    // technical-planning has architect
    expect(result.agents).toContain('architect.md');
    expect(result.agents).toContain('software-engineer.md');
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

  it('includes profile skills when profiles are provided', () => {
    const profiles = [
      { name: 'typescript', detect: ['ts'], skills: ['typescript-engineer'] },
    ] as const;

    const result = resolveWorkflowDependencies(['product-spec'], profiles);

    expect(result.skills).toContain('typescript-engineer');
    expect(result.skills).toContain('product-discovery');
    expect(result.skills).toContain('brainstorming');
  });

  it('deduplicates profile skills that overlap with workflow skills', () => {
    const profiles = [{ name: 'custom', detect: ['custom'], skills: ['code'] }] as const;

    const result = resolveWorkflowDependencies(['implement'], profiles);

    const codeOccurrences = result.skills.filter((s) => s === 'code');
    expect(codeOccurrences).toHaveLength(1);
  });

  it('returns unchanged results when profiles is undefined', () => {
    const withoutProfiles = resolveWorkflowDependencies(['implement']);
    const withUndefined = resolveWorkflowDependencies(['implement'], undefined);

    expect(withoutProfiles.skills).toEqual(withUndefined.skills);
    expect(withoutProfiles.agents).toEqual(withUndefined.agents);
  });

  it('respects selectedProfiles when filtering profile skills', () => {
    const profiles = [
      { name: 'typescript', detect: ['ts'], skills: ['typescript-engineer'] },
      { name: 'ruby', detect: ['ruby'], skills: ['ruby-engineer'] },
    ] as const;

    const result = resolveWorkflowDependencies(['product-spec'], profiles, ['ruby']);

    expect(result.skills).toContain('ruby-engineer');
    expect(result.skills).not.toContain('typescript-engineer');
  });

  it('includes all profile skills when no selectedProfiles', () => {
    const profiles = [
      { name: 'typescript', detect: ['ts'], skills: ['typescript-engineer'] },
      { name: 'ruby', detect: ['ruby'], skills: ['ruby-engineer'] },
    ] as const;

    const result = resolveWorkflowDependencies(['product-spec'], profiles);

    expect(result.skills).toContain('typescript-engineer');
    expect(result.skills).toContain('ruby-engineer');
  });

  it('no workflow contains hardcoded language profile skills', () => {
    const allWorkflows = [
      'product-spec',
      'product-vision',
      'ask-codebase',
      'technical-planning',
      'implement',
      'debug',
      'frontend-development',
      'pr-review',
      'create-workflow',
    ];

    for (const workflow of allWorkflows) {
      const result = resolveWorkflowDependencies([workflow]);

      expect(result.skills).not.toContain('typescript-engineer');
      expect(result.skills).not.toContain('python-engineer');
    }
  });

  it('skill-injection-protocol is present in all workflows except product-spec and product-vision', () => {
    const workflowsWithProtocol = [
      'ask-codebase',
      'technical-planning',
      'implement',
      'debug',
      'frontend-development',
      'pr-review',
    ];

    for (const workflow of workflowsWithProtocol) {
      const result = resolveWorkflowDependencies([workflow]);
      expect(result.skills).toContain('skill-injection-protocol');
    }

    const productSpec = resolveWorkflowDependencies(['product-spec']);
    expect(productSpec.skills).not.toContain('skill-injection-protocol');

    const productVision = resolveWorkflowDependencies(['product-vision']);
    expect(productVision.skills).not.toContain('skill-injection-protocol');
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
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-qa.md'), 'test');

    const newDeps = {
      agents: ['qa.md'],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'))).toBe(
      false,
    );
    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-qa.md'))).toBe(true);
  });

  it('removes skill directory when no longer needed', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'agentic-skill-brainstorming'), { recursive: true });
    await writeFile(join(TEST_DIR, 'skills', 'agentic-skill-brainstorming', 'SKILL.md'), 'test');
    await mkdir(join(TEST_DIR, 'skills', 'agentic-skill-code'), { recursive: true });
    await writeFile(join(TEST_DIR, 'skills', 'agentic-skill-code', 'SKILL.md'), 'test');

    const newDeps = {
      agents: [],
      skills: ['code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'skills', 'agentic-skill-brainstorming'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'skills', 'agentic-skill-code'))).toBe(true);
  });

  it('removes workflow directory when no longer needed', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'agentic-workflow-product-spec'), { recursive: true });
    await writeFile(join(TEST_DIR, 'skills', 'agentic-workflow-product-spec', 'SKILL.md'), 'test');

    const newDeps = {
      agents: [],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'skills', 'agentic-workflow-product-spec'))).toBe(false);
  });

  it('does nothing when all disk entries are in newDeps', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'), 'test');
    await mkdir(join(TEST_DIR, 'skills', 'agentic-skill-code'), { recursive: true });

    const deps = {
      agents: ['software-engineer.md'],
      skills: ['code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, deps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'))).toBe(true);
    expect(await exists(join(TEST_DIR, 'skills', 'agentic-skill-code'))).toBe(true);
  });

  it('keeps files in newDeps even if more exist on disk', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'), 'test');

    const newDeps = {
      agents: ['software-engineer.md'],
      skills: ['code'],
      workflows: ['implement'],
    };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'))).toBe(true);
  });

  it('applies namespace rewriting during cleanup', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'foo-agent-software-engineer.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'foo-agent-qa.md'), 'test');

    const newDeps = {
      agents: ['qa.md'],
      skills: [],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'foo');

    expect(await exists(join(TEST_DIR, 'agents', 'foo-agent-software-engineer.md'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'agents', 'foo-agent-qa.md'))).toBe(true);
  });

  it('applies namespace rewriting to skill dirs during cleanup', async () => {
    await mkdir(join(TEST_DIR, 'skills', 'foo-skill-brainstorming'), { recursive: true });
    await mkdir(join(TEST_DIR, 'skills', 'foo-skill-code'), { recursive: true });

    const newDeps = {
      agents: [],
      skills: ['code'],
      workflows: [],
    };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'foo');

    expect(await exists(join(TEST_DIR, 'skills', 'foo-skill-brainstorming'))).toBe(false);
    expect(await exists(join(TEST_DIR, 'skills', 'foo-skill-code'))).toBe(true);
  });

  it('leaves non-namespaced files untouched', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'custom-file.md'), 'test');

    const newDeps = { agents: [], skills: [], workflows: [] };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'))).toBe(
      false,
    );
    expect(await exists(join(TEST_DIR, 'agents', 'custom-file.md'))).toBe(true);
  });

  it('leaves other-namespace files untouched', async () => {
    await writeFile(join(TEST_DIR, 'agents', 'bar-agent-software-engineer.md'), 'test');
    await writeFile(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'), 'test');

    const newDeps = { agents: [], skills: [], workflows: [] };

    await cleanupStaleFiles(TEST_DIR, newDeps, 'agentic');

    expect(await exists(join(TEST_DIR, 'agents', 'bar-agent-software-engineer.md'))).toBe(true);
    expect(await exists(join(TEST_DIR, 'agents', 'agentic-agent-software-engineer.md'))).toBe(
      false,
    );
  });

  it('handles missing agents/ or skills/ directories gracefully', async () => {
    await rm(join(TEST_DIR, 'agents'), { recursive: true });
    await rm(join(TEST_DIR, 'skills'), { recursive: true });

    const newDeps = {
      agents: ['software-engineer.md'],
      skills: ['code'],
      workflows: ['implement'],
    };

    await expect(cleanupStaleFiles(TEST_DIR, newDeps, 'agentic')).resolves.toBeUndefined();
  });
});
