import { describe, expect, it } from 'bun:test';

import { processTemplate } from './utils';

describe('processTemplate', () => {
  it('replaces {ide-folder} for claude', () => {
    const content = 'path/.{ide-folder}/agents';
    const result = processTemplate(content, 'claude');

    expect(result).toBe('path/.claude/agents');
  });

  it('replaces {ide-folder} for cursor', () => {
    const content = 'path/.{ide-folder}/agents';
    const result = processTemplate(content, 'cursor');

    expect(result).toBe('path/.cursor/agents');
  });

  it('replaces {ide-invoke-prefix} for claude', () => {
    const content = 'Use {ide-invoke-prefix}agents/cpo.md';
    const result = processTemplate(content, 'claude');

    expect(result).toBe('Use Read .agents/cpo.md');
  });

  it('replaces {ide-invoke-prefix} for cursor', () => {
    const content = 'Use {ide-invoke-prefix}agents/cpo.md';
    const result = processTemplate(content, 'cursor');

    expect(result).toBe('Use @.agents/cpo.md');
  });

  it('replaces multiple variables in content', () => {
    const content = `
# Agent: {ide-folder}
Load with: {ide-invoke-prefix}{ide-folder}/agents/cpo.md
`;
    const result = processTemplate(content, 'claude');

    expect(result).toContain('# Agent: claude');
    expect(result).toContain('Load with: Read .claude/agents/cpo.md');
  });

  it('leaves content unchanged when no variables', () => {
    const content = 'Plain text without variables';
    const result = processTemplate(content, 'claude');

    expect(result).toBe('Plain text without variables');
  });

  it('handles empty content', () => {
    const result = processTemplate('', 'cursor');

    expect(result).toBe('');
  });
});
