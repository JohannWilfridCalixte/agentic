import { describe, expect, it } from 'bun:test';

import { AGENTS, COMMANDS, getAgents, getIdeDir, resolveIdes } from './constants';

describe('AGENTS', () => {
  it('contains expected agents', () => {
    expect(AGENTS).toContain('cto');
    expect(AGENTS).toContain('dx');
    expect(AGENTS).toContain('team-and-workflow');
  });

  it('has 3 agents', () => {
    expect(AGENTS).toHaveLength(3);
  });
});

describe('getAgents', () => {
  it('returns agents with custom namespace prefix', () => {
    const agents = getAgents('foo');

    expect(agents).toContain('foo-agent-cto');
    expect(agents).toContain('foo-agent-dx');
    expect(agents).toContain('foo-agent-team-and-workflow');
  });

  it('returns agents with agentic prefix matching AGENTS constant', () => {
    const agents = getAgents('agentic');

    for (const agent of AGENTS) {
      expect(agents).toContain(`agentic-agent-${agent}`);
    }
  });

  it('has 3 agents', () => {
    expect(getAgents('foo')).toHaveLength(3);
  });
});

describe('COMMANDS', () => {
  it('contains expected commands', () => {
    expect(COMMANDS).toContain('init');
    expect(COMMANDS).toContain('list');
    expect(COMMANDS).toContain('help');
    expect(COMMANDS).toContain('update');
    expect(COMMANDS).toContain('migrate');
    expect(COMMANDS).toContain('version');
    expect(COMMANDS).toContain('settings');
  });

  it('has 7 commands', () => {
    expect(COMMANDS).toHaveLength(7);
  });
});

describe('getIdeDir', () => {
  it('returns .claude for claude', () => {
    expect(getIdeDir('claude')).toBe('.claude');
  });

  it('returns .cursor for cursor', () => {
    expect(getIdeDir('cursor')).toBe('.cursor');
  });

  it('returns .agents for codex', () => {
    expect(getIdeDir('codex')).toBe('.agents');
  });
});

describe('resolveIdes', () => {
  it('returns all three IDEs for all', () => {
    const result = resolveIdes('all');

    expect(result).toContain('claude');
    expect(result).toContain('cursor');
    expect(result).toContain('codex');
    expect(result).toHaveLength(3);
  });

  it('returns all three IDEs for deprecated both alias', () => {
    const result = resolveIdes('both');

    expect(result).toContain('claude');
    expect(result).toContain('cursor');
    expect(result).toContain('codex');
    expect(result).toHaveLength(3);
  });

  it('returns single IDE for claude', () => {
    expect(resolveIdes('claude')).toEqual(['claude']);
  });

  it('returns single IDE for cursor', () => {
    expect(resolveIdes('cursor')).toEqual(['cursor']);
  });

  it('returns single IDE for codex', () => {
    expect(resolveIdes('codex')).toEqual(['codex']);
  });
});
