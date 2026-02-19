import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';

import { parseNamespaceOption } from './index';

describe('parseNamespaceOption', () => {
  let exitSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('returns undefined when no --namespace flag', () => {
    expect(parseNamespaceOption(['init', '--ide', 'claude'])).toBeUndefined();
  });

  it('returns undefined when -n flag missing', () => {
    expect(parseNamespaceOption(['init'])).toBeUndefined();
  });

  it('parses --namespace flag', () => {
    expect(parseNamespaceOption(['init', '--namespace', 'foo'])).toBe('foo');
  });

  it('parses -n shorthand', () => {
    expect(parseNamespaceOption(['init', '-n', 'bar'])).toBe('bar');
  });

  it('returns undefined when --namespace has no value', () => {
    expect(parseNamespaceOption(['init', '--namespace'])).toBeUndefined();
  });

  it('accepts lowercase letters', () => {
    expect(parseNamespaceOption(['--namespace', 'mytools'])).toBe('mytools');
  });

  it('accepts letters with digits', () => {
    expect(parseNamespaceOption(['--namespace', 'tool2'])).toBe('tool2');
  });

  it('accepts letters with hyphens', () => {
    expect(parseNamespaceOption(['--namespace', 'my-tools'])).toBe('my-tools');
  });

  it('accepts minimum 2 chars', () => {
    expect(parseNamespaceOption(['--namespace', 'ab'])).toBe('ab');
  });

  it('rejects single character', () => {
    expect(() => parseNamespaceOption(['--namespace', 'a'])).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('rejects namespace starting with digit', () => {
    expect(() => parseNamespaceOption(['--namespace', '1bad'])).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('rejects namespace starting with hyphen', () => {
    expect(() => parseNamespaceOption(['--namespace', '-bad'])).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('rejects uppercase letters', () => {
    expect(() => parseNamespaceOption(['--namespace', 'Foo'])).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('rejects special characters', () => {
    expect(() => parseNamespaceOption(['--namespace', 'foo_bar'])).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('prints error message for invalid namespace', () => {
    try {
      parseNamespaceOption(['--namespace', '1bad']);
    } catch {
      // expected
    }
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid --namespace value'),
    );
  });
});
