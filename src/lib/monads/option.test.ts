import { describe, expect, it } from 'bun:test';

import { isNone, isSome, None, Option, Some } from './option';

describe('Some', () => {
  it('creates Some with correct type and data', () => {
    const option = Some(42);

    expect(option._type).toBe('Some');
    expect(option.data).toBe(42);
  });

  it('fmap transforms the value', () => {
    const option = Some(10);
    const mapped = option.fmap((x) => x * 2);

    expect(isSome(mapped)).toBe(true);
    if (isSome(mapped)) {
      expect(mapped.data).toBe(20);
    }
  });

  it('toResult returns Ok', () => {
    const option = Some('value');
    const result = option.toResult();

    expect(result._type).toBe('Ok');
    expect(result.data).toBe('value');
  });
});

describe('None', () => {
  it('creates None with correct type', () => {
    const option = None();

    expect(option._type).toBe('None');
  });

  it('fmap returns None', () => {
    const option = None();
    const mapped = option.fmap((x) => x);

    expect(isNone(mapped)).toBe(true);
  });

  it('toResult returns Err', () => {
    const option = None();
    const result = option.toResult();

    expect(result._type).toBe('Err');
    expect(result.data).toEqual({ reason: 'no_data' });
  });
});

describe('isSome', () => {
  it('returns true for Some', () => {
    expect(isSome(Some(1))).toBe(true);
  });

  it('returns false for None', () => {
    expect(isSome(None())).toBe(false);
  });
});

describe('isNone', () => {
  it('returns true for None', () => {
    expect(isNone(None())).toBe(true);
  });

  it('returns false for Some', () => {
    expect(isNone(Some(1))).toBe(false);
  });
});

describe('Option constructor', () => {
  it('returns Some for truthy values', () => {
    const option = Option('hello');

    expect(isSome(option)).toBe(true);
    if (isSome(option)) {
      expect(option.data).toBe('hello');
    }
  });

  it('returns None for null', () => {
    const option = Option(null);

    expect(isNone(option)).toBe(true);
  });

  it('returns None for undefined', () => {
    const option = Option(undefined);

    expect(isNone(option)).toBe(true);
  });

  it('returns None when called with no arguments', () => {
    const option = Option();

    expect(isNone(option)).toBe(true);
  });

  it('returns Some for 0', () => {
    const option = Option(0);

    expect(isSome(option)).toBe(true);
  });

  it('returns Some for empty string', () => {
    const option = Option('');

    expect(isSome(option)).toBe(true);
  });
});

describe('Option.match', () => {
  it('matches Some with Some callback', () => {
    const result = Option.match(Some(42), {
      Some: (x) => x * 2,
      None: () => 0,
    });

    expect(result).toBe(84);
  });

  it('matches None with None callback', () => {
    const result = Option.match(None(), {
      Some: () => 'found',
      None: () => 'not found',
    });

    expect(result).toBe('not found');
  });
});
