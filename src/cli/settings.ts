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

interface ReadSettingsError {
  readonly code: 'READ_SETTINGS_FAILED' | 'PARSE_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

async function getPackageVersion(): Promise<string> {
  const packageJsonPath = join(PKG_ROOT, 'package.json');
  const packageJson = await Bun.file(packageJsonPath).json();
  return packageJson.version;
}

export async function readSettings(
  ideDir: string,
): Promise<Result<AgenticSettings, ReadSettingsError>> {
  const settingsPath = join(ideDir, '.agentic.settings.json');

  try {
    const file = Bun.file(settingsPath);
    const exists = await file.exists();

    if (!exists) {
      return Err({
        code: 'READ_SETTINGS_FAILED' as const,
        message: `Settings file not found at ${settingsPath}`,
      });
    }

    const content = await file.text();

    try {
      const settings = JSON.parse(content) as AgenticSettings;
      return Ok(settings);
    } catch (parseError) {
      return Err({
        code: 'PARSE_FAILED' as const,
        message: `Failed to parse settings at ${settingsPath}`,
        cause: parseError,
      });
    }
  } catch (error) {
    return Err({
      code: 'READ_SETTINGS_FAILED' as const,
      message: `Failed to read settings from ${settingsPath}`,
      cause: error,
    });
  }
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
