import type { Result } from '../../../lib/monads';

export interface InitError {
  readonly code: 'READ_TEMPLATE_FAILED' | 'WRITE_FILE_FAILED' | 'COPY_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export type TargetIDE = 'claude' | 'cursor';

export interface IdeSetupStrategy {
  readonly ide: TargetIDE;
  readonly setup: (projectRoot: string) => Promise<Result<void, InitError>>;
}
