import { isErr } from '../lib/monads';
import { help, init, list, settings, update, version } from './commands';
import type { IDE } from './constants';
import { NAMESPACE_PATTERN } from './constants';

function parseCommand(arg: string | undefined, args: readonly string[]) {
  if (arg === '--version' || arg === '-V' || args.includes('--version')) return 'version' as const;
  if (!arg || arg === 'help' || arg === '--help' || arg === '-h') return 'help' as const;
  if (arg === 'init' || arg === 'install') return 'init' as const;
  if (arg === 'list') return 'list' as const;
  if (arg === 'update') return 'update' as const;
  if (arg === 'settings') return 'settings' as const;
  if (arg === 'version') return 'version' as const;

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

export function parseWorkflowsOption(args: readonly string[]): string[] | undefined {
  let index = args.indexOf('--workflows');
  if (index === -1) index = args.indexOf('-w');
  if (index === -1 || !args[index + 1]) return undefined;

  return args[index + 1]
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);
}

export function parseNamespaceOption(args: readonly string[]): string | undefined {
  let index = args.indexOf('--namespace');
  if (index === -1) index = args.indexOf('-n');
  if (index === -1 || !args[index + 1]) return undefined;

  const value = args[index + 1];

  if (!NAMESPACE_PATTERN.test(value)) {
    console.error(
      `Invalid --namespace value: "${value}". Must be lowercase letters, digits, hyphens; start with letter; 2-30 chars.`,
    );
    process.exit(1);
  }

  return value;
}

export async function run(args: readonly string[]) {
  const command = parseCommand(args[0], args);

  switch (command) {
    case 'help':
      help();
      return process.exit(0);

    case 'list':
      list();
      return process.exit(0);

    case 'init': {
      const ide = parseIdeOption(args);
      const outputFolder = parseOutputOption(args);
      const namespace = parseNamespaceOption(args);
      const workflows = parseWorkflowsOption(args);
      const result = await init({ ide, outputFolder, namespace, workflows });

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      return process.exit(0);
    }

    case 'update': {
      const ide = parseIdeOptionOptional(args);
      const outputFolder = parseOutputOption(args);
      const namespace = parseNamespaceOption(args);
      const workflows = parseWorkflowsOption(args);
      const result = await update({ ide, outputFolder, namespace, workflows });

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      return process.exit(0);
    }

    case 'settings': {
      const subcommand = args[1];
      const result = await settings(subcommand, args.slice(2));

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      return process.exit(0);
    }

    case 'version': {
      const result = await version();

      if (isErr(result)) {
        console.error(`Error: ${result.data.message}`);
        process.exit(1);
      }

      return process.exit(0);
    }

    default:
      throw new Error(`Unexpected command: ${command satisfies never}`);
  }
}
