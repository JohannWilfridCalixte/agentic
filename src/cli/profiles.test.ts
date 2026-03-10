import { describe, expect, it } from 'bun:test';
import type { LanguageProfile } from './profiles';
import { collectAllProfileSkills, LANGUAGE_PROFILES, mergeProfiles } from './profiles';

describe('LANGUAGE_PROFILES', () => {
  it('contains exactly 2 bundled profiles', () => {
    expect(LANGUAGE_PROFILES).toHaveLength(2);
  });

  it('typescript profile has correct detect keywords', () => {
    const ts = LANGUAGE_PROFILES.find((p) => p.name === 'typescript');

    expect(ts?.detect).toEqual(['typescript', 'ts', 'node', 'bun', 'deno']);
  });

  it('typescript profile has correct skills', () => {
    const ts = LANGUAGE_PROFILES.find((p) => p.name === 'typescript');

    expect(ts?.skills).toEqual(['typescript-engineer', 'typescript-imports']);
  });

  it('python profile has correct detect keywords', () => {
    const py = LANGUAGE_PROFILES.find((p) => p.name === 'python');

    expect(py?.detect).toEqual(['python', 'py', 'pip', 'uv', 'poetry', 'conda']);
  });

  it('python profile has correct skills', () => {
    const py = LANGUAGE_PROFILES.find((p) => p.name === 'python');

    expect(py?.skills).toEqual(['python-engineer']);
  });
});

describe('mergeProfiles', () => {
  const bundled: readonly LanguageProfile[] = [
    {
      name: 'typescript',
      detect: ['typescript', 'ts'],
      skills: ['typescript-engineer', 'typescript-imports'],
    },
  ];

  it('returns bundled profiles when no user profiles or overrides', () => {
    const result = mergeProfiles(bundled, [], {});

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('typescript');
    expect(result[0].skills).toEqual(['typescript-engineer', 'typescript-imports']);
  });

  it('user profile with same name overrides bundled entirely', () => {
    const userProfiles: LanguageProfile[] = [
      {
        name: 'typescript',
        detect: ['ts', 'tsx'],
        skills: ['custom-ts-skill'],
      },
    ];

    const result = mergeProfiles(bundled, userProfiles, {});

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('typescript');
    expect(result[0].detect).toEqual(['ts', 'tsx']);
    expect(result[0].skills).toEqual(['custom-ts-skill']);
  });

  it('user profile with new name is added alongside bundled', () => {
    const userProfiles: LanguageProfile[] = [
      { name: 'ruby', detect: ['ruby', 'rails'], skills: ['ruby-engineer'] },
    ];

    const result = mergeProfiles(bundled, userProfiles, {});

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(['typescript', 'ruby']);
  });

  it('skillOverrides replaces a skill across profiles', () => {
    const result = mergeProfiles(bundled, [], {
      'typescript-imports': 'ts-imports-v2',
    });

    expect(result).toHaveLength(1);
    expect(result[0].skills).toEqual(['typescript-engineer', 'ts-imports-v2']);
  });

  it('skillOverrides with _remove_ removes a skill', () => {
    const result = mergeProfiles(bundled, [], {
      'typescript-imports': '_remove_',
    });

    expect(result).toHaveLength(1);
    expect(result[0].skills).toEqual(['typescript-engineer']);
  });

  it('skillOverrides ignores skills not present in profiles', () => {
    const result = mergeProfiles(bundled, [], {
      'nonexistent-skill': '_remove_',
    });

    expect(result).toHaveLength(1);
    expect(result[0].skills).toEqual(['typescript-engineer', 'typescript-imports']);
  });

  it('applies overrides across multiple profiles', () => {
    const multi: readonly LanguageProfile[] = [
      { name: 'a', detect: ['a'], skills: ['shared-skill', 'a-only'] },
      { name: 'b', detect: ['b'], skills: ['shared-skill', 'b-only'] },
    ];

    const result = mergeProfiles(multi, [], { 'shared-skill': 'replaced' });

    expect(result[0].skills).toContain('replaced');
    expect(result[1].skills).toContain('replaced');
    expect(result[0].skills).not.toContain('shared-skill');
    expect(result[1].skills).not.toContain('shared-skill');
  });

  it('preserves other profile fields when applying skill overrides', () => {
    const result = mergeProfiles(bundled, [], {
      'typescript-imports': '_remove_',
    });

    expect(result[0].name).toBe('typescript');
    expect(result[0].detect).toEqual(['typescript', 'ts']);
  });
});

describe('collectAllProfileSkills', () => {
  const profiles: readonly LanguageProfile[] = [
    { name: 'typescript', detect: ['ts'], skills: ['typescript-engineer', 'typescript-imports'] },
    { name: 'ruby', detect: ['ruby'], skills: ['ruby-engineer'] },
  ];

  it('returns all skills from all profiles when no selection', () => {
    const result = collectAllProfileSkills(profiles);

    expect(result).toEqual(
      expect.arrayContaining(['typescript-engineer', 'typescript-imports', 'ruby-engineer']),
    );
    expect(result).toHaveLength(3);
  });

  it('returns only selected profile skills when selection provided', () => {
    const result = collectAllProfileSkills(profiles, ['ruby']);

    expect(result).toEqual(['ruby-engineer']);
  });

  it('returns empty array when selected profile does not exist', () => {
    const result = collectAllProfileSkills(profiles, ['python']);

    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty profiles', () => {
    const result = collectAllProfileSkills([]);

    expect(result).toHaveLength(0);
  });

  it('resolves single-level extends inheritance', () => {
    const withExtends: readonly LanguageProfile[] = [
      { name: 'typescript', detect: ['ts'], skills: ['typescript-engineer'] },
      { name: 'react', detect: ['react'], extends: 'typescript', skills: ['react-patterns'] },
    ];

    const result = collectAllProfileSkills(withExtends, ['react']);

    expect(result).toContain('typescript-engineer');
    expect(result).toContain('react-patterns');
    expect(result).toHaveLength(2);
  });

  it('deduplicates skills across parent and child profiles', () => {
    const withOverlap: readonly LanguageProfile[] = [
      { name: 'base', detect: ['base'], skills: ['shared-skill', 'base-only'] },
      { name: 'child', detect: ['child'], extends: 'base', skills: ['shared-skill', 'child-only'] },
    ];

    const result = collectAllProfileSkills(withOverlap, ['child']);
    const uniqueSkills = new Set(result);

    expect(uniqueSkills.size).toBe(result.length);
    expect(result).toContain('shared-skill');
    expect(result).toContain('base-only');
    expect(result).toContain('child-only');
  });

  it('ignores extends when parent profile not found', () => {
    const orphan: readonly LanguageProfile[] = [
      { name: 'child', detect: ['child'], extends: 'nonexistent', skills: ['child-skill'] },
    ];

    const result = collectAllProfileSkills(orphan, ['child']);

    expect(result).toEqual(['child-skill']);
  });
});
