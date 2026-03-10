import type { IdeSetupStrategy, TargetIDE } from '../types';
import { claudeStrategy } from './claude';
import { codexStrategy } from './codex';
import { cursorStrategy } from './cursor';

const strategies: Record<TargetIDE, IdeSetupStrategy> = {
  claude: claudeStrategy,
  cursor: cursorStrategy,
  codex: codexStrategy,
};

export function getIdeStrategy(ide: TargetIDE) {
  return strategies[ide];
}

export { claudeStrategy, codexStrategy, cursorStrategy };
