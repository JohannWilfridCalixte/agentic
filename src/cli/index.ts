import { assertNever, isErr } from '../lib/monads';
import { help, init, list } from './commands';
import type { IDE } from './constants';

type Command = 'help' | 'init' | 'list';

function parseCommand(arg: string | undefined): Command {
  if (!arg || arg === 'help' || arg === '--help' || arg === '-h') return 'help';
  if (arg === 'init') return 'init';
  if (arg === 'list') return 'list';
  return 'help';
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

export async function run(args: readonly string[]): Promise<void> {
  const command = parseCommand(args[0]);

  switch (command) {
    case 'help': {
      help();
      process.exit(0);
      break;
    }

    case 'list': {
      list();
      process.exit(0);
      break;
    }

    case 'init': {
      const ide = parseIdeOption(args);
      const result = await init(ide);

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      process.exit(0);
      break;
    }

    default:
      assertNever(command);
  }
}
