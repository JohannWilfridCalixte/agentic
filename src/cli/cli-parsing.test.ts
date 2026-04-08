import { describe, expect, it } from 'bun:test';

import {
  hasOptionFlags,
  normalizeIde,
  parseProfileOption,
  parseSkillOverrideOption,
} from './index';

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

describe('hasOptionFlags', () => {
  it('returns false when no option flags present', () => {
    expect(hasOptionFlags(['init'])).toBe(false);
    expect(hasOptionFlags([])).toBe(false);
    expect(hasOptionFlags(['update'])).toBe(false);
  });

  it('detects --ide flag', () => {
    expect(hasOptionFlags(['init', '--ide', 'claude'])).toBe(true);
  });

  it('detects --namespace flag', () => {
    expect(hasOptionFlags(['init', '--namespace', 'myproj'])).toBe(true);
  });

  it('detects -n short flag', () => {
    expect(hasOptionFlags(['init', '-n', 'myproj'])).toBe(true);
  });

  it('detects --workflows flag', () => {
    expect(hasOptionFlags(['init', '--workflows', 'implement'])).toBe(true);
  });

  it('detects -w short flag', () => {
    expect(hasOptionFlags(['init', '-w', 'debug'])).toBe(true);
  });

  it('detects --profile flag', () => {
    expect(hasOptionFlags(['init', '--profile', 'typescript'])).toBe(true);
  });

  it('detects -p short flag', () => {
    expect(hasOptionFlags(['init', '-p', 'python'])).toBe(true);
  });

  it('detects --output flag', () => {
    expect(hasOptionFlags(['init', '--output', 'out'])).toBe(true);
  });

  it('detects --skill-override flag', () => {
    expect(hasOptionFlags(['init', '--skill-override', 'a=b'])).toBe(true);
  });

  it('returns false for unrelated flags like --help', () => {
    expect(hasOptionFlags(['init', '--help'])).toBe(false);
    expect(hasOptionFlags(['--version'])).toBe(false);
  });
});

describe('parseSkillOverrideOption', () => {
  it('parses single override', () => {
    const result = parseSkillOverrideOption(['--skill-override', 'typescript-engineer=custom-ts']);

    expect(result).toEqual({ 'typescript-engineer': 'custom-ts' });
  });

  it('parses _remove_ sentinel value', () => {
    const result = parseSkillOverrideOption(['--skill-override', 'typescript-engineer=_remove_']);

    expect(result).toEqual({ 'typescript-engineer': '_remove_' });
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
