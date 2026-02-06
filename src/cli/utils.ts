import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { IDE } from './constants';

export async function appendToGitignore(projectRoot: string, entry: string): Promise<void> {
  const gitignorePath = join(projectRoot, '.gitignore');
  const gitignoreFile = Bun.file(gitignorePath);

  if (await gitignoreFile.exists()) {
    const content = await gitignoreFile.text();
    const lines = content.split('\n').map((line) => line.trim());
    if (lines.includes(entry)) return;

    const needsNewline = content.length > 0 && !content.endsWith('\n');
    await Bun.write(gitignorePath, `${content}${needsNewline ? '\n' : ''}${entry}\n`);
  } else {
    await Bun.write(gitignorePath, `${entry}\n`);
  }
}

interface CopyDirError {
  readonly code: 'COPY_DIR_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

type TargetIDE = Exclude<IDE, 'both'>;

const IDE_TEMPLATE_VARS = {
  claude: {
    'ide-folder': '.claude',
    'ide-invoke-prefix': 'Read ',
    subagentTypeGeneralPurpose: 'general-purpose',
  },
  cursor: {
    'ide-folder': '.cursor',
    'ide-invoke-prefix': '@',
    subagentTypeGeneralPurpose: 'generalPurpose',
  },
} as const satisfies Record<TargetIDE, Record<string, string>>;

const IDE_SETTINGS_DEFAULTS = {
  claude: {
    highThinkingModelName: 'opus',
    codeWritingModelName: 'opus',
    qaModelName: 'opus',
  },
  cursor: {
    highThinkingModelName: 'claude-4.6-opus-high-thinking',
    codeWritingModelName: 'claude-4.6-opus-high-thinking',
    qaModelName: 'claude-4.6-opus-high-thinking',
  },
} as const satisfies Record<TargetIDE, Record<string, string>>;

export function getHighThinkingModelName(ide: TargetIDE) {
  return IDE_SETTINGS_DEFAULTS[ide].highThinkingModelName;
}

export function getCodeWritingModelName(ide: TargetIDE) {
  return IDE_SETTINGS_DEFAULTS[ide].codeWritingModelName;
}

export function getQaModelName(ide: TargetIDE) {
  return IDE_SETTINGS_DEFAULTS[ide].qaModelName;
}

export interface TemplateOptions {
  outputFolder: string;
  highThinkingModelName: string;
  codeWritingModelName: string;
  qaModelName: string;
}

export function processTemplate(content: string, ide: TargetIDE, options: TemplateOptions) {
  const vars = {
    ...IDE_TEMPLATE_VARS[ide],
    'output-folder': options.outputFolder,
    outputFolder: options.outputFolder,
    highThinkingModelName: options.highThinkingModelName,
    codeWritingModelName: options.codeWritingModelName,
    qaModelName: options.qaModelName,
  };
  let result = content;

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }

  return result;
}

export async function copyAndProcess(
  source: string,
  destination: string,
  ide: TargetIDE,
  options: TemplateOptions,
): Promise<Result<void, CopyDirError>> {
  try {
    await mkdir(destination, { recursive: true });

    const entries = await readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = join(source, entry.name);
      const destinationPath = join(destination, entry.name);

      if (entry.isDirectory()) {
        const result = await copyAndProcess(sourcePath, destinationPath, ide, options);
        if (result._type === 'Err') return result;
      } else if (isTemplateFile(entry.name)) {
        const content = await Bun.file(sourcePath).text();
        await Bun.write(destinationPath, processTemplate(content, ide, options));
      } else {
        const content = await Bun.file(sourcePath).arrayBuffer();
        await Bun.write(destinationPath, content);
      }
    }

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'COPY_DIR_FAILED' as const,
      message: `Failed to copy ${source} to ${destination}`,
      cause: error,
    });
  }
}

function isTemplateFile(filename: string) {
  return (
    filename.endsWith('.md') ||
    filename.endsWith('.yaml') ||
    filename.endsWith('.yml') ||
    filename.endsWith('.sh')
  );
}
