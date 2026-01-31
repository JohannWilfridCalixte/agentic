import { chmodSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Result } from '../../../lib/monads';
import { Err, isErr, Ok } from '../../../lib/monads';
import type { IDE } from '../../constants';
import {
  AGENTS_DIR,
  SKILLS_DIR,
  SUBAGENTS_DIR,
} from '../../paths';
import { copyAndProcess } from '../../utils';
import { getIdeStrategy } from './strategies';
import type { InitError, TargetIDE } from './types';

function makeScriptsExecutableRecursive(dir: string) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      makeScriptsExecutableRecursive(fullPath);
    } else if (entry.endsWith('.sh')) {
      try {
        chmodSync(fullPath, 0o755);
      } catch {
        // Ignore chmod errors
      }
    }
  }
}

export async function setupIde(
  targetIde: TargetIDE,
  projectRoot: string,
): Promise<Result<void, InitError>> {
  const ideDir = join(projectRoot, `.${targetIde}`);

  if (!existsSync(ideDir)) {
    mkdirSync(ideDir, { recursive: true });
  }

  const copies: readonly [string, string][] = [
    [AGENTS_DIR, join(ideDir, 'agents')],
    [SUBAGENTS_DIR, join(ideDir, 'agents')],
    [SKILLS_DIR, join(ideDir, 'skills')],
  ];

  for (const [source, destination] of copies) {
    const result = await copyAndProcess(source, destination, targetIde);

    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy to .${targetIde}/`,
        cause: result.data,
      });
    }
  }

  console.log(`  Copied to .${targetIde}/agents/, skills/`);

  makeScriptsExecutableRecursive(join(ideDir, 'skills'));

  const strategy = getIdeStrategy(targetIde);
  const result = await strategy.setup(projectRoot);

  if (isErr(result)) return result;

  return Ok(undefined);
}

export async function init(ide: IDE = 'both'): Promise<Result<void, InitError>> {
  const projectRoot = process.cwd();
  const ides: readonly TargetIDE[] = ide === 'both' ? ['claude', 'cursor'] : [ide];

  console.log('Initializing agentic...\n');

  for (const targetIde of ides) {
    const result = await setupIde(targetIde, projectRoot);
    if (isErr(result)) return result;
  }

  console.log('\nDone!');

  for (const targetIde of ides) {
    console.log(`  .${targetIde}/: agents/, skills/`);
  }

  console.log('\nUsage:');
  console.log('  /agentic:product-spec [--auto] [input]');
  console.log('  /agentic:quick-spec-and-implement [--auto] [input]');
  console.log('  /agentic:auto-implement [input]');
  console.log('  /agentic:debug [input]');

  return Ok(undefined);
}

export type { InitError, TargetIDE } from './types';
