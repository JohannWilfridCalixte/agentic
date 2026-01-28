import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Result } from '../lib/monads';
import type { IDE } from './constants';

import { Err, Ok } from '../lib/monads';

interface CopyDirError {
  readonly code: 'COPY_DIR_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

const TEMPLATE_VARS: Record<IDE, Record<string, string>> = {
  claude: { 'ide-folder': 'claude', 'ide-invoke-prefix': 'Read .' },
  cursor: { 'ide-folder': 'cursor', 'ide-invoke-prefix': '@.' },
  both: { 'ide-folder': '', 'ide-invoke-prefix': '' },
};

export function processTemplate(content: string, ide: 'claude' | 'cursor'): string {
  const vars = TEMPLATE_VARS[ide];
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

export async function copyAndProcess(
  source: string,
  destination: string,
  ide: 'claude' | 'cursor',
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
        const result = await copyAndProcess(sourcePath, destinationPath, ide);
        if (result._type === 'Err') return result;
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        const content = await Bun.file(sourcePath).text();
        await Bun.write(destinationPath, processTemplate(content, ide));
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
