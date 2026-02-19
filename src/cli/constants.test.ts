import { describe, expect, it } from 'bun:test';

import { AGENTS, COMMANDS } from './constants';

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
