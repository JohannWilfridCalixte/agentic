import { chmod, mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../../lib/monads';
import { Err, isErr, Ok } from '../../../lib/monads';
import type { IDE } from '../../constants';
import { AGENTS_DIR, SKILLS_DIR, SUBAGENTS_DIR } from '../../paths';
import { writeSettings } from '../../settings';
import type { TemplateOptions } from '../../utils';
import { appendToGitignore, copyAndProcess, getHighThinkingModelName, getCodeWritingModelName, getQaModelName } from '../../utils';
import { getIdeStrategy } from './strategies';
import type { InitError, SetupMode, TargetIDE } from './types';

export const DEFAULT_OUTPUT_FOLDER = '_agentic_output';

async function makeScriptsExecutableRecursive(dir: string) {
  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        await makeScriptsExecutableRecursive(fullPath);
      } else if (entry.endsWith('.sh')) {
        try {
          await chmod(fullPath, 0o755);
        } catch {
          // Ignore chmod errors
        }
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }
}

export interface SetupOptions {
  outputFolder?: string;
  mode?: SetupMode;
}

export async function setupIde(
  targetIde: TargetIDE,
  projectRoot: string,
  options: SetupOptions = {},
): Promise<Result<void, InitError>> {
  const ideDir = join(projectRoot, `.${targetIde}`);
  const outputFolder = options.outputFolder ?? DEFAULT_OUTPUT_FOLDER;

  await mkdir(ideDir, { recursive: true });

  const templateOptions: TemplateOptions = {
    outputFolder,
    highThinkingModelName: getHighThinkingModelName(targetIde),
    codeWritingModelName: getCodeWritingModelName(targetIde),
    qaModelName: getQaModelName(targetIde),
  };

  const copies: readonly [string, string][] = [
    [AGENTS_DIR, join(ideDir, 'agents')],
    [SUBAGENTS_DIR, join(ideDir, 'agents')],
    [SKILLS_DIR, join(ideDir, 'skills')],
  ];

  for (const [source, destination] of copies) {
    const result = await copyAndProcess(source, destination, targetIde, templateOptions);

    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy to .${targetIde}/`,
        cause: result.data,
      });
    }
  }

  console.log(`  Copied to .${targetIde}/agents/, skills/`);

  await makeScriptsExecutableRecursive(join(ideDir, 'skills'));

  const strategy = getIdeStrategy(targetIde);
  const result = await strategy.setup(projectRoot, { mode: options.mode ?? 'init' });

  if (isErr(result)) return result;

  await appendToGitignore(projectRoot, `.${targetIde}/${outputFolder}`);

  const settingsResult = await writeSettings(ideDir, outputFolder, getHighThinkingModelName(targetIde), getCodeWritingModelName(targetIde), getQaModelName(targetIde));
  if (isErr(settingsResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: `Failed to write settings to .${targetIde}/`,
      cause: settingsResult.data,
    });
  }

  return Ok(undefined);
}

export interface InitOptions {
  ide?: IDE;
  outputFolder?: string;
}

export async function init(options: InitOptions = {}): Promise<Result<void, InitError>> {
  const projectRoot = process.cwd();
  const ide = options.ide ?? 'both';
  const outputFolder = options.outputFolder ?? DEFAULT_OUTPUT_FOLDER;
  const ides: readonly TargetIDE[] = ide === 'both' ? ['claude', 'cursor'] : [ide];

  console.log('Initializing agentic...\n');
  console.log(`  Output folder: ${outputFolder}`);

  for (const targetIde of ides) {
    const result = await setupIde(targetIde, projectRoot, { outputFolder });
    if (isErr(result)) return result;
  }

  console.log('\nDone!');

  for (const targetIde of ides) {
    console.log(`  .${targetIde}/: agents/, skills/`);
  }

  console.log('\nUsage:');
  console.log('  /agentic:workflow:product-spec [--auto] [input]');
  console.log('  /agentic:workflow:technical-planning [input]');
  console.log('  /agentic:workflow:quick-spec-and-implement [--auto] [input]');
  console.log('  /agentic:workflow:auto-implement [input]');
  console.log('  /agentic:workflow:debug [input]');
  console.log('  /agentic:workflow:frontend-development [input]');

  return Ok(undefined);
}

export type { InitError, TargetIDE } from './types';
