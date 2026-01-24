import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Result } from '../lib/monads';

import { Err, Ok } from '../lib/monads';

interface CopyDirError {
  readonly code: 'COPY_DIR_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

export async function copyDir(
  source: string,
  destination: string,
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
        const result = await copyDir(sourcePath, destinationPath);
        if (result._type === 'Err') {
          return result;
        }
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
