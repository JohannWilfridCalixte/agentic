import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import { AGENTS_DIR, SKILLS_DIR, SUBAGENTS_DIR } from '../paths';
import { readSettings, writeSettings } from '../settings';
import type { TemplateOptions } from '../utils';
import { copyAndProcess } from '../utils';
import type { InitError, TargetIDE } from './init';
import { detectIdes } from './update';
import type { IDE } from '../constants';

interface SettingsError {
  readonly code: 'NO_IDE_DETECTED' | 'SETTINGS_UPDATE_FAILED' | 'NO_SUBCOMMAND' | 'UNKNOWN_SUBCOMMAND';
  readonly message: string;
  readonly cause?: unknown;
}

export interface SettingsUpdateOptions {
  ide?: IDE;
  highThinkingModelName?: string;
  codeWritingModelName?: string;
  qaModelName?: string;
  outputFolder?: string;
}

export function parseSettingsArgs(args: readonly string[]): SettingsUpdateOptions {
  const options: SettingsUpdateOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--ide' && next) {
      options.ide = next as IDE;
      i++;
    } else if (arg === '--high-thinking-model' && next) {
      options.highThinkingModelName = next;
      i++;
    } else if (arg === '--code-writing-model' && next) {
      options.codeWritingModelName = next;
      i++;
    } else if (arg === '--qa-model' && next) {
      options.qaModelName = next;
      i++;
    } else if (arg === '--output' && next) {
      options.outputFolder = next;
      i++;
    }
  }

  return options;
}

async function reinstallAgents(
  targetIde: TargetIDE,
  projectRoot: string,
  templateOptions: TemplateOptions,
): Promise<Result<void, InitError>> {
  const ideDir = join(projectRoot, `.${targetIde}`);

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

  return Ok(undefined);
}

export async function settingsUpdate(
  options: SettingsUpdateOptions = {},
): Promise<Result<void, SettingsError | InitError>> {
  const projectRoot = process.cwd();

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

  for (const targetIde of ides) {
    const ideDir = join(projectRoot, `.${targetIde}`);
    const currentSettings = await readSettings(ideDir);

    if (isErr(currentSettings)) {
      return Err({
        code: 'SETTINGS_UPDATE_FAILED' as const,
        message: `No settings found for .${targetIde}/. Run \`agentic init\` first.`,
        cause: currentSettings.data,
      });
    }

    const s = currentSettings.data;
    const outputFolder = options.outputFolder ?? s.outputFolder;
    const highThinkingModelName = options.highThinkingModelName ?? s.highThinkingModelName;
    const codeWritingModelName = options.codeWritingModelName ?? s.codeWritingModelName;
    const qaModelName = options.qaModelName ?? s.qaModelName;

    const templateOptions: TemplateOptions = {
      outputFolder,
      highThinkingModelName,
      codeWritingModelName,
      qaModelName,
    };

    const copyResult = await reinstallAgents(targetIde, projectRoot, templateOptions);
    if (isErr(copyResult)) {
      return Err({
        code: 'SETTINGS_UPDATE_FAILED' as const,
        message: `Failed to reinstall agents for .${targetIde}/`,
        cause: copyResult.data,
      });
    }

    const writeResult = await writeSettings(ideDir, outputFolder, highThinkingModelName, codeWritingModelName, qaModelName);
    if (isErr(writeResult)) {
      return Err({
        code: 'SETTINGS_UPDATE_FAILED' as const,
        message: `Failed to write settings for .${targetIde}/`,
        cause: writeResult.data,
      });
    }

    console.log(`  .${targetIde}/: agents/, skills/ reinstalled`);
  }

  return Ok(undefined);
}

export async function settings(
  subcommand: string | undefined,
  args: readonly string[],
): Promise<Result<void, SettingsError | InitError>> {
  if (!subcommand) {
    return Err({ code: 'NO_SUBCOMMAND' as const, message: 'Usage: agentic settings apply [options]' });
  }

  if (subcommand !== 'apply') {
    return Err({ code: 'UNKNOWN_SUBCOMMAND' as const, message: `Unknown subcommand: ${subcommand}. Available: apply` });
  }

  const options = parseSettingsArgs(args);

  console.log('Applying settings...\n');

  const result = await settingsUpdate(options);
  if (isErr(result)) return result;

  console.log('\nSettings applied.');

  return Ok(undefined);
}
