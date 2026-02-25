import { describe, expect, it } from 'bun:test';

import { addNamePrefix, processTemplate } from './utils';

const defaultOptions = {
  namespace: 'agentic',
  outputFolder: '_agentic_output',
  highThinkingModelName: 'opus',
  codeWritingModelName: 'opus',
  qaModelName: 'opus',
};

describe('processTemplate', () => {
  it('replaces {ide-folder} for claude', () => {
    const content = 'path/{ide-folder}/agents';
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toBe('path/.claude/agents');
  });

  it('replaces {ide-folder} for cursor', () => {
    const content = 'path/{ide-folder}/agents';
    const result = processTemplate(content, 'cursor', defaultOptions);

    expect(result).toBe('path/.cursor/agents');
  });

  it('replaces {ide-invoke-prefix} for claude', () => {
    const content = 'Use {ide-invoke-prefix}agents/agentic-agent-cpo.md';
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toBe('Use Read agents/agentic-agent-cpo.md');
  });

  it('replaces {ide-invoke-prefix} for cursor', () => {
    const content = 'Use {ide-invoke-prefix}agents/agentic-agent-cpo.md';
    const result = processTemplate(content, 'cursor', defaultOptions);

    expect(result).toBe('Use @agents/agentic-agent-cpo.md');
  });

  it('replaces {output-folder} variable', () => {
    const content = 'Output: {ide-folder}/{output-folder}/task/epic';
    const result = processTemplate(content, 'claude', {
      namespace: 'agentic',
      outputFolder: 'my-output',
      highThinkingModelName: 'opus',
      codeWritingModelName: 'opus',
      qaModelName: 'opus',
    });

    expect(result).toBe('Output: .claude/my-output/task/epic');
  });

  it('replaces multiple variables in content', () => {
    const content = `
# Agent: {ide-folder}
Load with: {ide-invoke-prefix}{ide-folder}/agents/agentic-agent-cpo.md
Output: {ide-folder}/{output-folder}/task
`;
    const result = processTemplate(content, 'claude', defaultOptions);

    expect(result).toContain('# Agent: .claude');
    expect(result).toContain('Load with: Read .claude/agents/agentic-agent-cpo.md');
    expect(result).toContain('Output: .claude/_agentic_output/task');
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

  describe('with custom namespace', () => {
    const fooOptions = {
      namespace: 'foo',
      outputFolder: '_foo_output',
      highThinkingModelName: 'opus',
      codeWritingModelName: 'opus',
      qaModelName: 'opus',
    };

    it('replaces colon identifiers: agentic:skill: -> foo:skill:', () => {
      const content = 'Load agentic:skill:code and agentic:workflow:debug';
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toBe('Load foo:skill:code and foo:workflow:debug');
    });

    it('replaces agent colon identifiers: agentic:agent: -> foo:agent:', () => {
      const content = 'Use agentic:agent:cpo for product';
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toBe('Use foo:agent:cpo for product');
    });

    it('replaces slash command references: /agentic: -> /foo:', () => {
      const content = 'Run /agentic:workflow:debug and /agentic:skill:code';
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toBe('Run /foo:workflow:debug and /foo:skill:code');
    });

    it('replaces file name references in content', () => {
      const content =
        'Load agentic-agent-cpo.md and agentic-skill-code/ and agentic-workflow-debug/';
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toBe('Load foo-agent-cpo.md and foo-skill-code/ and foo-workflow-debug/');
    });

    it('replaces section marker with capitalized namespace', () => {
      const content = '# Agentic Framework\nSome content';
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toBe('# Foo Framework\nSome content');
    });

    it('replaces output folder reference in content', () => {
      const content = 'Output: .claude/_agentic_output/task';
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toBe('Output: .claude/_foo_output/task');
    });

    it('applies all replacements together', () => {
      const content = [
        '# Agentic Framework',
        'Load agentic-agent-cpo.md',
        'Use agentic:skill:code',
        'Run /agentic:workflow:debug',
        'Output: _agentic_output/task',
      ].join('\n');
      const result = processTemplate(content, 'claude', fooOptions);

      expect(result).toContain('# Foo Framework');
      expect(result).toContain('foo-agent-cpo.md');
      expect(result).toContain('foo:skill:code');
      expect(result).toContain('/foo:workflow:debug');
      expect(result).toContain('_foo_output/task');
      expect(result).not.toContain('agentic');
    });

    it('skips namespace replacements when namespace is agentic', () => {
      const content = 'Load agentic-agent-cpo.md and agentic:skill:code';
      const result = processTemplate(content, 'claude', defaultOptions);

      expect(result).toBe('Load agentic-agent-cpo.md and agentic:skill:code');
    });

    it('handles hyphenated namespace in section marker', () => {
      const content = '# Agentic Framework';
      const result = processTemplate(content, 'claude', {
        ...fooOptions,
        namespace: 'my-tools',
      });

      expect(result).toBe('# My-tools Framework');
    });
  });
});

describe('addNamePrefix', () => {
  it('prefixes agent name with namespace', () => {
    expect(addNamePrefix('cpo.md', 'agent', 'foo')).toBe('foo-agent-cpo.md');
  });

  it('prefixes skill name with namespace', () => {
    expect(addNamePrefix('code', 'skill', 'foo')).toBe('foo-skill-code');
  });

  it('prefixes workflow name with namespace', () => {
    expect(addNamePrefix('debug', 'workflow', 'foo')).toBe('foo-workflow-debug');
  });

  it('returns name unchanged for other type', () => {
    expect(addNamePrefix('README.md', 'other', 'foo')).toBe('README.md');
  });
});
