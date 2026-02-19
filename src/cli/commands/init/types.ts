import type { Result } from '../../../lib/monads';

export interface InitError {
  readonly code: 'READ_TEMPLATE_FAILED' | 'WRITE_FILE_FAILED' | 'COPY_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export type TargetIDE = 'claude' | 'cursor';

export type SetupMode = 'init' | 'update';

export interface StrategySetupOptions {
  readonly mode?: SetupMode;
  readonly namespace?: string;
}

export interface IdeSetupStrategy {
  readonly ide: TargetIDE;
  readonly setup: (projectRoot: string, options?: StrategySetupOptions) => Promise<Result<void, InitError>>;
}
