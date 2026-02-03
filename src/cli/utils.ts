import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { IDE } from './constants';

interface CopyDirError {
  readonly code: 'COPY_DIR_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

type TargetIDE = Exclude<IDE, 'both'>;

const IDE_TEMPLATE_VARS = {
  claude: { 'ide-folder': 'claude', 'ide-invoke-prefix': 'Read .', 'subagentTypeGeneralPurpose': 'general-purpose' },
  cursor: { 'ide-folder': 'cursor', 'ide-invoke-prefix': '@.', 'subagentTypeGeneralPurpose': 'generalPurpose' },
} as const satisfies Record<TargetIDE, Record<string, string>>;

export interface TemplateOptions {
  outputFolder: string;
}

export function processTemplate(content: string, ide: TargetIDE, options: TemplateOptions) {
  const vars = {
    ...IDE_TEMPLATE_VARS[ide],
    'output-folder': options.outputFolder,
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
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }

    const entries = readdirSync(source, { withFileTypes: true });

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
