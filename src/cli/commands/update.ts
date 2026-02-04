import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import type { IDE } from '../constants';
import type { InitError, TargetIDE } from './init';
import { DEFAULT_OUTPUT_FOLDER, setupIde } from './init';

interface UpdateError {
  readonly code: 'NO_IDE_DETECTED' | 'UPDATE_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export interface UpdateOptions {
  ide?: IDE;
  outputFolder?: string;
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function detectIdes(projectRoot: string) {
  const detected: TargetIDE[] = [];

  if (await directoryExists(join(projectRoot, '.claude'))) detected.push('claude');
  if (await directoryExists(join(projectRoot, '.cursor'))) detected.push('cursor');

  return detected;
}

export async function update(options: UpdateOptions = {}): Promise<Result<void, UpdateError | InitError>> {
  const projectRoot = process.cwd();
  const outputFolder = options.outputFolder ?? DEFAULT_OUTPUT_FOLDER;

  const ides: readonly TargetIDE[] = options.ide
    ? options.ide === 'both'
      ? ['claude', 'cursor']
      : [options.ide]
    : await detectIdes(projectRoot);

  if (ides.length === 0) {
    return Err({
      code: 'NO_IDE_DETECTED' as const,
      message: 'No IDE setup detected. Run `agentic init` first or specify --ide.',
    });
  }

  console.log('Updating agentic...\n');
  console.log(`  Output folder: ${outputFolder}`);

  for (const targetIde of ides) {
    const result = await setupIde(targetIde, projectRoot, { outputFolder });
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
    console.log(`  .${targetIde}/: agents/, skills/`);
  }

  return Ok(undefined);
}
