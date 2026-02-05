import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import { readSettings } from '../settings';
import type { TargetIDE } from './init';
import { detectIdes } from './update';

interface VersionError {
  readonly code: 'DETECT_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

const IDE_DISPLAY_NAMES: Record<TargetIDE, string> = {
  claude: 'Claude Code',
  cursor: 'Cursor',
};

function formatDate(isoString: string) {
  return isoString.split('T')[0];
}

export async function version(): Promise<Result<void, VersionError>> {
  const projectRoot = process.cwd();

  let detectedIdes: readonly TargetIDE[];

  try {
    detectedIdes = await detectIdes(projectRoot);
  } catch (error) {
    return Err({
      code: 'DETECT_FAILED' as const,
      message: 'Failed to detect IDE setups',
      cause: error,
    });
  }

  if (detectedIdes.length === 0) {
    console.log('No IDE setup detected. Run `agentic init` to get started.');
    return Ok(undefined);
  }

  for (const ide of detectedIdes) {
    const ideDir = join(projectRoot, `.${ide}`);
    const result = await readSettings(ideDir);

    if (isErr(result)) {
      console.log(`${IDE_DISPLAY_NAMES[ide]}: settings not found`);
      continue;
    }

    const settings = result.data;
    const displayName = IDE_DISPLAY_NAMES[ide];
    const installedDate = formatDate(settings.lastUpdate);

    console.log(`${displayName}: ${settings.version} (installed ${installedDate})`);
  }

  return Ok(undefined);
}
