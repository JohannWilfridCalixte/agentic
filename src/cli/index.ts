import { isErr } from '../lib/monads';
import { help, init, list, update } from './commands';
import type { IDE } from './constants';

function parseCommand(arg: string | undefined) {
  if (!arg || arg === 'help' || arg === '--help' || arg === '-h') return 'help' as const;
  if (arg === 'init' || arg === 'install') return 'init' as const;
  if (arg === 'list') return 'list' as const;
  if (arg === 'update') return 'update' as const;

  return 'help' as const;
}

function parseIdeOption(args: readonly string[]): IDE {
  const ideIndex = args.indexOf('--ide');
  if (ideIndex === -1 || !args[ideIndex + 1]) return 'both';

  const ideArg = args[ideIndex + 1];

  if (ideArg === 'claude' || ideArg === 'cursor' || ideArg === 'both') {
    return ideArg;
  }

  console.error(`Invalid --ide value: ${ideArg}. Use claude, cursor, or both.`);
  process.exit(1);
}

function parseIdeOptionOptional(args: readonly string[]): IDE | undefined {
  const ideIndex = args.indexOf('--ide');
  if (ideIndex === -1 || !args[ideIndex + 1]) return undefined;

  const ideArg = args[ideIndex + 1];

  if (ideArg === 'claude' || ideArg === 'cursor' || ideArg === 'both') {
    return ideArg;
  }

  console.error(`Invalid --ide value: ${ideArg}. Use claude, cursor, or both.`);
  process.exit(1);
}

function parseOutputOption(args: readonly string[]): string | undefined {
  const outputIndex = args.indexOf('--output');
  if (outputIndex === -1 || !args[outputIndex + 1]) return undefined;

  return args[outputIndex + 1];
}

export async function run(args: readonly string[]) {
  const command = parseCommand(args[0]);

  switch (command) {
    case 'help':
      help();
      process.exit(0);

    case 'list':
      list();
      process.exit(0);

    case 'init': {
      const ide = parseIdeOption(args);
      const outputFolder = parseOutputOption(args);
      const result = await init({ ide, outputFolder });

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      process.exit(0);
    }

    case 'update': {
      const ide = parseIdeOptionOptional(args);
      const outputFolder = parseOutputOption(args);
      const result = await update({ ide, outputFolder });

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      process.exit(0);
    }

    default:
      throw new Error(`Unexpected command: ${command satisfies never}`);
  }
}
