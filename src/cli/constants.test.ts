import { describe, expect, it } from 'bun:test';

import { AGENTS, COMMANDS, getAgents } from './constants';

describe('AGENTS', () => {
  it('contains expected agents', () => {
    expect(AGENTS).toContain('agentic-agent-cpo');
    expect(AGENTS).toContain('agentic-agent-cto');
    expect(AGENTS).toContain('agentic-agent-dx');
    expect(AGENTS).toContain('agentic-agent-team-and-workflow');
  });

  it('has 4 agents', () => {
    expect(AGENTS).toHaveLength(4);
  });
});

describe('getAgents', () => {
  it('returns agents with custom namespace prefix', () => {
    const agents = getAgents('foo');

    expect(agents).toContain('foo-agent-cpo');
    expect(agents).toContain('foo-agent-cto');
    expect(agents).toContain('foo-agent-dx');
    expect(agents).toContain('foo-agent-team-and-workflow');
  });

  it('returns agents with agentic prefix matching AGENTS constant', () => {
    const agents = getAgents('agentic');

    for (const agent of AGENTS) {
      expect(agents).toContain(agent);
    }
  });

  it('has 4 agents', () => {
    expect(getAgents('foo')).toHaveLength(4);
  });
});

describe('COMMANDS', () => {
  it('contains expected commands', () => {
    expect(COMMANDS).toContain('init');
    expect(COMMANDS).toContain('list');
    expect(COMMANDS).toContain('help');
    expect(COMMANDS).toContain('update');
    expect(COMMANDS).toContain('version');
    expect(COMMANDS).toContain('settings');
  });

  it('has 6 commands', () => {
    expect(COMMANDS).toHaveLength(6);
  });
});
