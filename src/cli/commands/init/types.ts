import type { Result } from '../../../lib/monads';
import type { ResolvedDependencies } from '../../dependencies';

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
  readonly workflows?: readonly string[];
  readonly resolvedDeps?: ResolvedDependencies;
}

export interface IdeSetupStrategy {
  readonly ide: TargetIDE;
  readonly setup: (
    projectRoot: string,
    options?: StrategySetupOptions,
  ) => Promise<Result<void, InitError>>;
}
