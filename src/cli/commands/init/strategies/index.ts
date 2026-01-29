import type { IdeSetupStrategy, TargetIDE } from '../types';
import { claudeStrategy } from './claude';
import { cursorStrategy } from './cursor';

const strategies: Record<TargetIDE, IdeSetupStrategy> = {
  claude: claudeStrategy,
  cursor: cursorStrategy,
};

export function getIdeStrategy(ide: TargetIDE) {
  return strategies[ide];
}

export { claudeStrategy, cursorStrategy };
