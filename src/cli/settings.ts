import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import { PKG_ROOT } from './paths';

export interface AgenticSettings {
  readonly version: string;
  readonly outputFolder: string;
  readonly lastUpdate: string;
}

interface WriteSettingsError {
  readonly code: 'WRITE_SETTINGS_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

async function getPackageVersion(): Promise<string> {
  const packageJsonPath = join(PKG_ROOT, 'package.json');
  const packageJson = await Bun.file(packageJsonPath).json();
  return packageJson.version;
}

export async function writeSettings(
  ideDir: string,
  outputFolder: string,
): Promise<Result<void, WriteSettingsError>> {
  try {
    const version = await getPackageVersion();

    const settings: AgenticSettings = {
      version,
      outputFolder,
      lastUpdate: new Date().toISOString(),
    };

    const settingsPath = join(ideDir, '.agentic.settings.json');
    await Bun.write(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'WRITE_SETTINGS_FAILED' as const,
      message: `Failed to write settings to ${ideDir}`,
      cause: error,
    });
  }
}
