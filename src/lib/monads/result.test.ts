import { describe, expect, it } from 'bun:test';

import { Err, isErr, isOk, Ok, Result, tryResult } from './result';

describe('Ok', () => {
  it('creates Ok with correct type and data', () => {
    const result = Ok(42);

    expect(result._type).toBe('Ok');
    expect(result.data).toBe(42);
  });

  it('calls Ok callback on match', async () => {
    const result = Ok('test');
    let matched = '';

    await result.match({
      Ok: (data) => {
        matched = data;
      },
      Err: () => {
        matched = 'error';
      },
    });

    expect(matched).toBe('test');
  });
});

describe('Err', () => {
  it('creates Err with correct type and data', () => {
    const result = Err({ code: 'NOT_FOUND' as const, message: 'Not found' });

    expect(result._type).toBe('Err');
    expect(result.data.code).toBe('NOT_FOUND');
  });

  it('calls Err callback on match', async () => {
    const result = Err('error message');
    let matched = '';

    await result.match({
      Ok: () => {
        matched = 'ok';
      },
      Err: (err) => {
        matched = err;
      },
    });

    expect(matched).toBe('error message');
  });
});

describe('isOk', () => {
  it('returns true for Ok', () => {
    expect(isOk(Ok(1))).toBe(true);
  });

  it('returns false for Err', () => {
    expect(isOk(Err('error'))).toBe(false);
  });
});

describe('isErr', () => {
  it('returns true for Err', () => {
    expect(isErr(Err('error'))).toBe(true);
  });

  it('returns false for Ok', () => {
    expect(isErr(Ok(1))).toBe(false);
  });
});

describe('Result.match', () => {
  it('matches Ok results', async () => {
    const result = Ok(100);
    let value = 0;

    await Result.match(result, {
      Ok: (data) => {
        value = data;
        return undefined;
      },
      Err: () => undefined,
    });

    expect(value).toBe(100);
  });

  it('matches Err results', async () => {
    const result = Err('fail');
    let value = '';

    await Result.match(result, {
      Ok: () => undefined,
      Err: (err) => {
        value = err;
        return undefined;
      },
    });

    expect(value).toBe('fail');
  });
});

describe('tryResult', () => {
  it('wraps successful sync function', () => {
    const result = tryResult(() => 42);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toBe(42);
    }
  });

  it('wraps throwing sync function', () => {
    const result = tryResult(() => {
      throw new Error('sync error');
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect((result.data as Error).message).toBe('sync error');
    }
  });

  it('wraps successful promise', async () => {
    const result = await tryResult(Promise.resolve('async value'));

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toBe('async value');
    }
  });

  it('wraps rejected promise', async () => {
    const result = await tryResult(Promise.reject(new Error('async error')));

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect((result.data as Error).message).toBe('async error');
    }
  });
});
