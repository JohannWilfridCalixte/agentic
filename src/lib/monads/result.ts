type MatchCallback<TData, TReason> = {
  readonly Ok: (data: TData) => void | Promise<void>;
  readonly Err: (err: TReason) => void | Promise<void>;
};

export interface Ok<TData = unknown> {
  readonly _type: 'Ok';
  readonly data: TData;
  readonly match: (callback: MatchCallback<TData, never>) => void | Promise<void>;
}

export interface Err<TReason = 'unknown'> {
  readonly _type: 'Err';
  readonly data: TReason;
  readonly match: (callback: MatchCallback<never, TReason>) => void | Promise<void>;
}

export type Result<TSuccessData = unknown, TErrorReason = 'unknown'> =
  | Ok<TSuccessData>
  | Err<TErrorReason>;

export function Ok<TData = unknown>(data: TData): Ok<TData> {
  return {
    _type: 'Ok' as const,
    data,
    match: async (callback: MatchCallback<TData, never>) => {
      const result = callback.Ok(data);
      if (result instanceof Promise) {
        await result;
      }
    },
  };
}

export function Err<TReason = 'unknown'>(data: TReason): Err<TReason> {
  return {
    _type: 'Err' as const,
    data,
    match: async (callback: MatchCallback<never, TReason>) => {
      const result = callback.Err(data);
      if (result instanceof Promise) {
        await result;
      }
    },
  };
}

export function Result(): never {
  throw new Error('Not implemented');
}

Result.match = async <TData, TReason, TResult>(
  result: Result<TData, TReason>,
  callback: {
    readonly Ok: (data: TData) => undefined | Promise<TResult>;
    readonly Err: (err: TReason) => undefined | Promise<TResult>;
  },
) => {
  if (isOk(result)) {
    const callbackResult = callback.Ok(result.data);
    if (callbackResult instanceof Promise) {
      await callbackResult;
    }
    return callbackResult;
  }

  const callbackResult = callback.Err(result.data);
  if (callbackResult instanceof Promise) {
    await callbackResult;
  }
  return callbackResult;
};

export function isOk<R extends Result<unknown, unknown>>(
  result: R,
): result is Extract<R, Ok<unknown>> {
  return result._type === 'Ok';
}

export function isErr<R extends Result<unknown, unknown>>(
  result: R,
): result is Extract<R, Err<unknown>> {
  return result._type === 'Err';
}

const isThenable = (value: unknown): value is Promise<unknown> =>
  value !== null &&
  typeof value === 'object' &&
  'then' in value &&
  typeof (value as { readonly then: unknown }).then === 'function';

export function tryResult<TData, TError = Error>(callback: () => TData): Result<TData, TError>;
export function tryResult<TData, TError = Error>(
  callback: Promise<TData>,
): Promise<Result<TData, TError>>;
export function tryResult<TData, TError = Error>(
  callback: Promise<TData> | (() => TData),
): Result<TData, TError> | Promise<Result<TData, TError>> {
  if (isThenable(callback)) {
    return Promise.resolve(callback)
      .then((data) => Ok(data))
      .catch((error) => Err(error as TError));
  }

  if (callback instanceof Promise) {
    return callback.then((data) => Ok(data)).catch((error) => Err(error as TError));
  }

  try {
    return Ok(callback());
  } catch (error) {
    return Err(error as TError);
  }
}
