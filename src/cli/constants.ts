import type { TargetIDE } from './commands/init/types';

export type IDE = 'claude' | 'cursor' | 'codex' | 'all' | 'both';

const IDE_DIR_MAP: Record<TargetIDE, string> = {
  claude: '.claude',
  cursor: '.cursor',
  codex: '.agents',
};

export function getIdeDir(ide: TargetIDE) {
  return IDE_DIR_MAP[ide];
}

const ALL_TARGET_IDES: readonly TargetIDE[] = ['claude', 'cursor', 'codex'];

export function resolveIdes(ide: IDE | readonly IDE[]): readonly TargetIDE[] {
  if (Array.isArray(ide)) {
    if (ide.length === 0) return ALL_TARGET_IDES;
    const result = (ide as readonly IDE[]).flatMap((i: IDE) => resolveIdes(i));
    return [...new Set(result)];
  }
  if (typeof ide !== 'string') return ALL_TARGET_IDES;
  if (ide === 'all' || ide === 'both') return ALL_TARGET_IDES;
  return [ide];
}

export type Command = 'init' | 'list' | 'help' | 'update' | 'migrate' | 'version' | 'settings';

export const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]{1,29}$/;

export const AGENTS = ['cto', 'dx', 'team-and-workflow'] as const;

export function getAgents(namespace: string) {
  return [
    `${namespace}-agent-cto`,
    `${namespace}-agent-dx`,
    `${namespace}-agent-team-and-workflow`,
  ] as const;
}

export const COMMANDS = [
  'init',
  'list',
  'help',
  'update',
  'migrate',
  'version',
  'settings',
] as const satisfies readonly Command[];
