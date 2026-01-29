import { describe, expect, it } from 'bun:test';

import { AGENTS, COMMANDS, SCRIPTS } from './constants';

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

describe('SCRIPTS', () => {
  it('contains expected scripts', () => {
    expect(SCRIPTS).toContain('sync-to-github.sh');
    expect(SCRIPTS).toContain('sync-from-github.sh');
    expect(SCRIPTS).toContain('sync-all.sh');
    expect(SCRIPTS).toContain('create-pr.sh');
    expect(SCRIPTS).toContain('resolve-parent.sh');
  });

  it('has 5 scripts', () => {
    expect(SCRIPTS).toHaveLength(5);
  });
});

describe('COMMANDS', () => {
  it('contains expected commands', () => {
    expect(COMMANDS).toContain('init');
    expect(COMMANDS).toContain('list');
    expect(COMMANDS).toContain('help');
    expect(COMMANDS).toContain('update');
  });

  it('has 4 commands', () => {
    expect(COMMANDS).toHaveLength(4);
  });
});
