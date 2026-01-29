import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import type { IDE } from '../constants';
import type { InitError, TargetIDE } from './init';
import { setupIde } from './init';

interface UpdateError {
  readonly code: 'NO_IDE_DETECTED' | 'UPDATE_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

function detectIdes(projectRoot: string) {
  const detected = [] satisfies TargetIDE[];

  if (existsSync(join(projectRoot, '.claude'))) detected.push('claude');
  if (existsSync(join(projectRoot, '.cursor'))) detected.push('cursor');

  return detected;
}

export async function update(ide?: IDE): Promise<Result<void, UpdateError | InitError>> {
  const projectRoot = process.cwd();

  const ides: readonly TargetIDE[] = ide
    ? ide === 'both'
      ? ['claude', 'cursor']
      : [ide]
    : detectIdes(projectRoot);

  if (ides.length === 0) {
    return Err({
      code: 'NO_IDE_DETECTED' as const,
      message: 'No IDE setup detected. Run `agentic init` first or specify --ide.',
    });
  }

  console.log('Updating agentic...\n');

  for (const targetIde of ides) {
    const result = await setupIde(targetIde, projectRoot);
    if (isErr(result)) {
      return Err({
        code: 'UPDATE_FAILED' as const,
        message: `Failed to update .${targetIde}/`,
        cause: result.data,
      });
    }
  }

  console.log('\nUpdated:');
  for (const targetIde of ides) {
    console.log(`  .${targetIde}/: agents/, skills/, commands/, workflows/, scripts/`);
  }

  return Ok(undefined);
}
