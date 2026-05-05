import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { TargetIDE } from './commands/init/types';
import { LEGACY_IDE_SOURCES } from './legacy-paths';
import type { IdeSettings, SharedSettings } from './settings';
import { readSettings, writeSettings } from './settings';

export interface MigrateSettingsError {
  readonly code: 'MIGRATE_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export interface MigrateSettingsResult {
  readonly migrated: boolean;
  readonly sourcesRemoved: readonly string[];
  readonly idesDiscovered: readonly TargetIDE[];
}

interface LegacyPayload {
  readonly namespace?: string;
  readonly outputFolder?: string;
  readonly highThinkingModelName?: string;
  readonly codeWritingModelName?: string;
  readonly qaModelName?: string;
  readonly workflows?: readonly string[];
  readonly profiles?: SharedSettings['profiles'];
  readonly skillOverrides?: Record<string, string>;
  readonly selectedProfiles?: readonly string[];
}

async function readLegacyFile(path: string): Promise<LegacyPayload | undefined> {
  try {
    const file = Bun.file(path);
    if (!(await file.exists())) return undefined;
    const content = await file.text();
    return JSON.parse(content) as LegacyPayload;
  } catch (error) {
    console.warn(`Skipping unreadable legacy settings at ${path}:`, error);
    return undefined;
  }
}

function extractIdeSettings(payload: LegacyPayload): IdeSettings | undefined {
  const { outputFolder, highThinkingModelName, codeWritingModelName, qaModelName } = payload;
  if (!outputFolder || !highThinkingModelName || !codeWritingModelName || !qaModelName) {
    return undefined;
  }
  return {
    outputFolder,
    highThinkingModelName,
    codeWritingModelName,
    qaModelName,
  };
}

export async function migrateLegacySettings(
  projectRoot: string,
): Promise<Result<MigrateSettingsResult, MigrateSettingsError>> {
  try {
    const existing = await readSettings(projectRoot);
    const preExistingIdes: Partial<Record<TargetIDE, IdeSettings>> =
      existing._type === 'Ok' ? existing.data.ides : {};
    const preExistingShared: Omit<SharedSettings, 'version' | 'lastUpdate'> =
      existing._type === 'Ok'
        ? {
            namespace: existing.data.namespace,
            ...(existing.data.workflows !== undefined
              ? { workflows: existing.data.workflows }
              : {}),
            ...(existing.data.profiles !== undefined ? { profiles: existing.data.profiles } : {}),
            ...(existing.data.skillOverrides !== undefined
              ? { skillOverrides: existing.data.skillOverrides }
              : {}),
            ...(existing.data.selectedProfiles !== undefined
              ? { selectedProfiles: existing.data.selectedProfiles }
              : {}),
          }
        : { namespace: 'agentic' };

    const ideEntries: Array<{ ide: TargetIDE; settings: IdeSettings }> = [];
    const sharedAccumulator: {
      -readonly [K in keyof Omit<SharedSettings, 'version' | 'lastUpdate'>]: Omit<
        SharedSettings,
        'version' | 'lastUpdate'
      >[K];
    } = {
      ...preExistingShared,
    };
    let sharedTouched = false;
    const sourcesRemoved: string[] = [];
    const idesDiscovered: TargetIDE[] = [];

    for (const source of LEGACY_IDE_SOURCES) {
      const path = join(projectRoot, source.relativePath);
      const payload = await readLegacyFile(path);
      if (!payload) continue;

      const ideSettings = extractIdeSettings(payload);
      if (ideSettings) {
        ideEntries.push({ ide: source.ide, settings: ideSettings });
        if (!idesDiscovered.includes(source.ide)) {
          idesDiscovered.push(source.ide);
        }
      }

      if (payload.namespace) {
        sharedAccumulator.namespace = payload.namespace;
        sharedTouched = true;
      }
      if (payload.workflows !== undefined) {
        sharedAccumulator.workflows = payload.workflows;
        sharedTouched = true;
      }
      if (payload.profiles !== undefined) {
        sharedAccumulator.profiles = payload.profiles;
        sharedTouched = true;
      }
      if (payload.skillOverrides !== undefined) {
        sharedAccumulator.skillOverrides = payload.skillOverrides;
        sharedTouched = true;
      }
      if (payload.selectedProfiles !== undefined) {
        sharedAccumulator.selectedProfiles = payload.selectedProfiles;
        sharedTouched = true;
      }

      sourcesRemoved.push(source.relativePath);
    }

    if (sourcesRemoved.length === 0) {
      return Ok({ migrated: false, sourcesRemoved: [], idesDiscovered: [] });
    }

    const idesToWrite: Array<{ ide: TargetIDE; settings: IdeSettings }> = [
      ...Object.entries(preExistingIdes)
        .filter(([ide, settings]) => settings && !ideEntries.some((e) => e.ide === ide))
        .map(([ide, settings]) => ({
          ide: ide as TargetIDE,
          settings: settings as IdeSettings,
        })),
      ...ideEntries,
    ];

    if (idesToWrite.length === 0) {
      // No ide data to write; still clean up legacy files.
      for (const rel of sourcesRemoved) {
        await rm(join(projectRoot, rel), { force: true });
        console.log(`Migrated settings from ${rel} → .agentic.json`);
      }
      return Ok({ migrated: true, sourcesRemoved, idesDiscovered });
    }

    const sharedForWrite = sharedTouched ? sharedAccumulator : preExistingShared;

    for (const entry of idesToWrite) {
      const writeResult = await writeSettings(projectRoot, {
        shared: sharedForWrite,
        ide: entry.ide,
        ideSettings: entry.settings,
      });
      if (writeResult._type === 'Err') {
        return Err({
          code: 'MIGRATE_FAILED' as const,
          message: `Failed to write merged settings during migration`,
          cause: writeResult.data,
        });
      }
    }

    for (const rel of sourcesRemoved) {
      await rm(join(projectRoot, rel), { force: true });
      console.log(`Migrated settings from ${rel} → .agentic.json`);
    }

    return Ok({ migrated: true, sourcesRemoved, idesDiscovered });
  } catch (error) {
    return Err({
      code: 'MIGRATE_FAILED' as const,
      message: 'Legacy settings migration failed',
      cause: error,
    });
  }
}
