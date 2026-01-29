import type { Option } from './option';

import { Option as OptionFn } from './option';

export type Maybe<TData> = Option<TData>;
export const Maybe = OptionFn;
