import { describe, expect, it } from 'bun:test';

import { AGENTS, COMMANDS } from './constants';

describe('AGENTS', () => {
  it('contains expected agents', () => {
    expect(AGENTS).toContain('cpo');
    expect(AGENTS).toContain('cto');
    expect(AGENTS).toContain('dx');
    expect(AGENTS).toContain('team-and-workflow');
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
  });

  it('has 5 commands', () => {
    expect(COMMANDS).toHaveLength(5);
  });
});
