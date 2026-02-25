export type IDE = 'claude' | 'cursor' | 'both';

export type Command = 'init' | 'list' | 'help' | 'update' | 'migrate' | 'version' | 'settings';

export const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]{1,29}$/;

export const AGENTS = ['cpo', 'cto', 'dx', 'team-and-workflow'] as const;

export function getAgents(namespace: string) {
  return [
    `${namespace}-agent-cpo`,
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
