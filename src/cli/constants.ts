export const AGENTS: readonly string[] = [
  'cpo',
  'cto',
  'dx',
  'team-and-workflow',
];

export const SCRIPTS: readonly string[] = [
  'sync-to-github.sh',
  'sync-from-github.sh',
  'sync-all.sh',
  'create-pr.sh',
  'resolve-parent.sh',
];

export type IDE = 'claude' | 'cursor' | 'both';

type Command = 'init' | 'list' | 'help';

export const COMMANDS: readonly Command[] = ['init', 'list', 'help'];
