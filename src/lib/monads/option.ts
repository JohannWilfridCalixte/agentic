import type { Result } from './result';

import { Err, Ok } from './result';

export interface Some<TData> {
  readonly _type: 'Some';
  readonly data: TData;
  readonly fmap: <TResult>(callback: (data: TData) => TResult) => Option<TResult>;
  readonly toResult: () => Result<TData, never>;
}

export interface None {
  readonly _type: 'None';
  readonly fmap: <TResult>(callback: (data: never) => TResult) => None;
  readonly toResult: () => Result<never, { readonly reason: 'no_data' }>;
}

export type Option<TData> = Some<TData> | None;

export function Some<TData>(data: TData): Some<TData> {
  return {
    _type: 'Some' as const,
    data,
    fmap: (callback) => Option(callback(data)),
    toResult: () => Ok(data),
  };
}

export function None(): None {
  return {
    _type: 'None' as const,
    fmap: () => None(),
    toResult: () => Err({ reason: 'no_data' as const }),
  };
}

export function isSome<TData>(option: Option<TData>): option is Some<TData> {
  return option._type === 'Some';
}

export function isNone<TData>(option: Option<TData>): option is None {
  return option._type === 'None';
}

export function Option(): None;
export function Option(data: null | undefined): None;
export function Option<TData>(data: TData): TData extends null | undefined ? None : Some<TData>;
export function Option<TData>(data?: TData | null): Option<TData> {
  if (data === null || data === undefined) {
    return None();
  }
  return Some(data);
}

Option.match = <TData, TResult>(
  option: Option<TData>,
  callback: {
    readonly Some: (data: TData) => TResult;
    readonly None: () => TResult;
  },
) => {
  if (option._type === 'Some') {
    return callback.Some(option.data);
  }
  return callback.None();
};
