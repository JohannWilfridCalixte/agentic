import { describe, expect, it } from 'bun:test';

import { processTemplate } from './utils';

const defaultOptions = { outputFolder: '_agentic_output' };

describe('processTemplate', () => {
  it('replaces {ide-folder} for claude', () => {
    const content = 'path/.{ide-folder}/agents';
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toBe('path/.claude/agents');
  });

  it('replaces {ide-folder} for cursor', () => {
    const content = 'path/.{ide-folder}/agents';
    const result = processTemplate(content, 'cursor', defaultOptions);

    expect(result).toBe('path/.cursor/agents');
  });

  it('replaces {ide-invoke-prefix} for claude', () => {
    const content = 'Use {ide-invoke-prefix}agents/cpo.md';
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toBe('Use Read .agents/cpo.md');
  });

  it('replaces {ide-invoke-prefix} for cursor', () => {
    const content = 'Use {ide-invoke-prefix}agents/cpo.md';
    const result = processTemplate(content, 'cursor', defaultOptions);

    expect(result).toBe('Use @.agents/cpo.md');
  });

  it('replaces {output-folder} variable', () => {
    const content = 'Output: .{ide-folder}/{output-folder}/task/epic';
    const result = processTemplate(content, 'claude', { outputFolder: 'my-output' });

    expect(result).toBe('Output: claude/my-output/task/epic');
  });

  it('replaces multiple variables in content', () => {
    const content = `
# Agent: {ide-folder}
Load with: {ide-invoke-prefix}{ide-folder}/agents/cpo.md
Output: .{ide-folder}/{output-folder}/task
`;
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toContain('# Agent: claude');
    expect(result).toContain('Load with: Read .claude/agents/cpo.md');
    expect(result).toContain('Output: claude/_agentic_output/task');
  });

  it('leaves content unchanged when no variables', () => {
    const content = 'Plain text without variables';
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toBe('Plain text without variables');
  });

  it('handles empty content', () => {
    const result = processTemplate('', 'cursor', defaultOptions);

    expect(result).toBe('');
  });
});
