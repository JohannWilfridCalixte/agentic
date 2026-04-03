import { describe, expect, it } from 'bun:test';

import { KNOWN_WORKFLOWS } from './dependencies';
import { LANGUAGE_PROFILES } from './profiles';
import {
  buildIdeChoices,
  buildProfileChoices,
  buildWorkflowChoices,
  getIdeDefaults,
  getNamespaceDefault,
  getProfileDefaults,
  getWorkflowDefaults,
  validateNamespaceInput,
} from './prompt-helpers';

describe('buildIdeChoices', () => {
  it('returns 3 items (claude, cursor, codex)', () => {
    const choices = buildIdeChoices();
    expect(choices).toHaveLength(3);
    expect(choices.map((c) => c.value)).toEqual(['claude', 'cursor', 'codex']);
  });

  it('has labels for all choices', () => {
    const choices = buildIdeChoices();
    for (const choice of choices) {
      expect(choice.label).toBeTruthy();
    }
  });
});

describe('buildWorkflowChoices', () => {
  it('returns all KNOWN_WORKFLOWS', () => {
    const choices = buildWorkflowChoices();
    expect(choices).toHaveLength(KNOWN_WORKFLOWS.length);
    expect(choices.map((c) => c.value)).toEqual([...KNOWN_WORKFLOWS]);
  });

  it('title-cases kebab names', () => {
    const choices = buildWorkflowChoices();
    const productSpec = choices.find((c) => c.value === 'product-spec');
    expect(productSpec?.label).toBe('Product Spec');
  });
});

describe('buildProfileChoices', () => {
  it('returns all LANGUAGE_PROFILES', () => {
    const choices = buildProfileChoices();
    expect(choices).toHaveLength(LANGUAGE_PROFILES.length);
    expect(choices.map((c) => c.value)).toEqual(LANGUAGE_PROFILES.map((p) => p.name));
  });

  it('title-cases profile names', () => {
    const choices = buildProfileChoices();
    const ts = choices.find((c) => c.value === 'typescript');
    expect(ts?.label).toBe('Typescript');
  });
});

describe('getIdeDefaults', () => {
  it('returns empty array when no current', () => {
    expect(getIdeDefaults()).toEqual([]);
    expect(getIdeDefaults(undefined)).toEqual([]);
  });

  it('returns current when provided', () => {
    expect(getIdeDefaults(['claude'])).toEqual(['claude']);
    expect(getIdeDefaults(['claude', 'cursor'])).toEqual(['claude', 'cursor']);
  });
});

describe('getNamespaceDefault', () => {
  it('returns "agentic" when no current', () => {
    expect(getNamespaceDefault()).toBe('agentic');
    expect(getNamespaceDefault(undefined)).toBe('agentic');
  });

  it('returns current when provided', () => {
    expect(getNamespaceDefault('myproject')).toBe('myproject');
  });
});

describe('getWorkflowDefaults', () => {
  it('returns empty array when no current', () => {
    expect(getWorkflowDefaults()).toEqual([]);
    expect(getWorkflowDefaults(undefined)).toEqual([]);
  });

  it('returns current when provided', () => {
    const current = ['implement', 'debug'];
    expect(getWorkflowDefaults(current)).toEqual(current);
  });
});

describe('getProfileDefaults', () => {
  it('returns empty array when no current', () => {
    expect(getProfileDefaults()).toEqual([]);
    expect(getProfileDefaults(undefined)).toEqual([]);
  });

  it('returns current when provided', () => {
    const current = ['typescript'];
    expect(getProfileDefaults(current)).toEqual(current);
  });
});

describe('validateNamespaceInput', () => {
  it('returns undefined for valid namespace', () => {
    expect(validateNamespaceInput('myproject')).toBeUndefined();
    expect(validateNamespaceInput('my-project')).toBeUndefined();
    expect(validateNamespaceInput('ab')).toBeUndefined();
    expect(validateNamespaceInput('agentic')).toBeUndefined();
    expect(validateNamespaceInput('project123')).toBeUndefined();
  });

  it('returns error for uppercase', () => {
    expect(validateNamespaceInput('INVALID')).toBeDefined();
    expect(validateNamespaceInput('MyProject')).toBeDefined();
  });

  it('returns error for starting with digit', () => {
    expect(validateNamespaceInput('1abc')).toBeDefined();
  });

  it('returns error for single char', () => {
    expect(validateNamespaceInput('a')).toBeDefined();
  });

  it('returns error for empty string', () => {
    expect(validateNamespaceInput('')).toBeDefined();
  });

  it('returns error for spaces', () => {
    expect(validateNamespaceInput('my project')).toBeDefined();
  });
});
