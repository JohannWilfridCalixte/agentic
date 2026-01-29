export type IDE = 'claude' | 'cursor' | 'both';

export type Command = 'init' | 'list' | 'help' | 'update';

export const AGENTS = ['cpo', 'cto', 'dx', 'team-and-workflow'] as const;

export const SCRIPTS = [
  'sync-to-github.sh',
  'sync-from-github.sh',
  'sync-all.sh',
  'create-pr.sh',
  'resolve-parent.sh',
] as const;

export const COMMANDS = ['init', 'list', 'help', 'update'] as const satisfies readonly Command[];
