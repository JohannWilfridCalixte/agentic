import { describe, expect, it } from 'bun:test';

import { serializeError } from './serialize-error';

describe('serializeError', () => {
  it('serializes Error with message, name, and stack', () => {
    const error = new Error('test error');
    const result = serializeError(error);

    expect(result).toEqual({
      message: 'test error',
      name: 'Error',
      stack: error.stack,
    });
  });

  it('serializes TypeError correctly', () => {
    const error = new TypeError('type error');
    const result = serializeError(error);

    expect(result).toEqual({
      message: 'type error',
      name: 'TypeError',
      stack: error.stack,
    });
  });

  it('returns non-Error values unchanged', () => {
    expect(serializeError('string error')).toBe('string error');
    expect(serializeError(123)).toBe(123);
    expect(serializeError({ custom: 'error' })).toEqual({ custom: 'error' });
    expect(serializeError(null)).toBe(null);
    expect(serializeError(undefined)).toBe(undefined);
  });
});
