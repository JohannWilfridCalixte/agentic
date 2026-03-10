import { describe, expect, it } from 'bun:test';

import { normalizeIde, parseProfileOption, parseSkillOverrideOption } from './index';

describe('parseProfileOption', () => {
  it('parses single profile with --profile flag', () => {
    const result = parseProfileOption(['--profile', 'typescript']);

    expect(result).toEqual(['typescript']);
  });

  it('parses multiple comma-separated profiles', () => {
    const result = parseProfileOption(['--profile', 'ruby,react,typescript']);

    expect(result).toEqual(['ruby', 'react', 'typescript']);
  });

  it('parses short -p flag', () => {
    const result = parseProfileOption(['-p', 'ruby']);

    expect(result).toEqual(['ruby']);
  });

  it('returns undefined when flag not present', () => {
    const result = parseProfileOption(['--ide', 'claude']);

    expect(result).toBeUndefined();
  });

  it('returns undefined when flag has no value', () => {
    const result = parseProfileOption(['--profile']);

    expect(result).toBeUndefined();
  });

  it('trims whitespace from profile names', () => {
    const result = parseProfileOption(['--profile', ' ruby , react ']);

    expect(result).toEqual(['ruby', 'react']);
  });

  it('filters out empty strings from split', () => {
    const result = parseProfileOption(['--profile', 'ruby,,react']);

    expect(result).toEqual(['ruby', 'react']);
  });
});

describe('normalizeIde', () => {
  it('returns claude for claude', () => {
    expect(normalizeIde('claude')).toBe('claude');
  });

  it('returns cursor for cursor', () => {
    expect(normalizeIde('cursor')).toBe('cursor');
  });

  it('returns codex for codex', () => {
    expect(normalizeIde('codex')).toBe('codex');
  });

  it('returns all for all', () => {
    expect(normalizeIde('all')).toBe('all');
  });

  it('maps deprecated both to all', () => {
    expect(normalizeIde('both')).toBe('all');
  });

  it('returns undefined for unknown IDE value', () => {
    expect(normalizeIde('vscode')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(normalizeIde('')).toBeUndefined();
  });
});

describe('parseSkillOverrideOption', () => {
  it('parses single override', () => {
    const result = parseSkillOverrideOption([
      '--skill-override',
      'typescript-imports=ts-imports-v2',
    ]);

    expect(result).toEqual({ 'typescript-imports': 'ts-imports-v2' });
  });

  it('parses _remove_ sentinel value', () => {
    const result = parseSkillOverrideOption(['--skill-override', 'typescript-imports=_remove_']);

    expect(result).toEqual({ 'typescript-imports': '_remove_' });
  });

  it('parses multiple overrides from repeated flags', () => {
    const result = parseSkillOverrideOption(['--skill-override', 'a=b', '--skill-override', 'c=d']);

    expect(result).toEqual({ a: 'b', c: 'd' });
  });

  it('returns undefined when flag not present', () => {
    const result = parseSkillOverrideOption(['--profile', 'typescript']);

    expect(result).toBeUndefined();
  });

  it('returns undefined when flag has no value', () => {
    const result = parseSkillOverrideOption(['--skill-override']);

    expect(result).toBeUndefined();
  });

  it('ignores entries without = separator', () => {
    const result = parseSkillOverrideOption([
      '--skill-override',
      'invalid-no-equals',
      '--skill-override',
      'valid=value',
    ]);

    expect(result).toEqual({ valid: 'value' });
  });

  it('handles value containing = sign', () => {
    const result = parseSkillOverrideOption(['--skill-override', 'key=value=with=equals']);

    expect(result).toEqual({ key: 'value=with=equals' });
  });
});
