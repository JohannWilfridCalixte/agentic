export type IDE = 'claude' | 'cursor' | 'both';

export type Command = 'init' | 'list' | 'help' | 'update' | 'version';

export const AGENTS = ['cpo', 'cto', 'dx', 'team-and-workflow'] as const;

export const COMMANDS = [
  'init',
  'list',
  'help',
  'update',
  'version',
] as const satisfies readonly Command[];
