import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, isOk, Ok } from '../../lib/monads';
import { cleanupLegacyCursorDir } from '../cleanup-legacy-cursor';
import type { IDE } from '../constants';
import { getIdeDir, resolveIdes } from '../constants';
import { cleanupStaleFiles, resolveWorkflowDependencies, validateWorkflows } from '../dependencies';
import { LEGACY_IDE_SOURCES } from '../legacy-paths';
import { migrateLegacySettings } from '../migrate-settings';
import { LANGUAGE_PROFILES, mergeProfiles } from '../profiles';
import { readSettings } from '../settings';
import type { InitError, TargetIDE } from './init';
import { getDefaultOutputFolder, setupIde } from './init';

interface UpdateError {
  readonly code: 'NO_IDE_DETECTED' | 'UPDATE_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export interface UpdateOptions {
  readonly ide?: IDE | readonly IDE[];
  readonly namespace?: string;
  readonly outputFolder?: string;
  readonly workflows?: readonly string[];
  readonly profiles?: readonly string[];
  readonly skillOverrides?: Record<string, string>;
}

export async function directoryExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

// Order mirrors `LEGACY_IDE_SOURCES` (migration precedence). Order is
// irrelevant for detection (set-based) but the shared constant ensures the
// two probe paths cannot drift.
async function detectIdesFromLegacySettings(projectRoot: string): Promise<TargetIDE[]> {
  const detected: TargetIDE[] = [];
  for (const source of LEGACY_IDE_SOURCES) {
    if (await fileExists(join(projectRoot, source.relativePath))) {
      detected.push(source.ide);
    }
  }
  return detected;
}

export async function detectIdes(projectRoot: string): Promise<TargetIDE[]> {
  const result = await readSettings(projectRoot);
  if (isOk(result)) {
    return Object.keys(result.data.ides) as TargetIDE[];
  }
  return detectIdesFromLegacySettings(projectRoot);
}

interface SettingsDefaults {
  readonly namespace: string;
  readonly outputFolder: string;
  readonly workflows?: readonly string[];
  readonly selectedProfiles?: readonly string[];
  readonly skillOverrides?: Record<string, string>;
}

async function readDefaultsFromSettings(
  projectRoot: string,
  ides: readonly TargetIDE[],
): Promise<SettingsDefaults> {
  const result = await readSettings(projectRoot);
  if (isOk(result)) {
    const firstIdeWithBlock = ides.find((ide) => result.data.ides[ide]);
    const outputFolder =
      (firstIdeWithBlock && result.data.ides[firstIdeWithBlock]?.outputFolder) ??
      getDefaultOutputFolder(result.data.namespace);
    return {
      namespace: result.data.namespace,
      outputFolder,
      workflows: result.data.workflows,
      selectedProfiles: result.data.selectedProfiles,
      skillOverrides: result.data.skillOverrides,
    };
  }
  return { namespace: 'agentic', outputFolder: getDefaultOutputFolder('agentic') };
}

export async function update(
  options: UpdateOptions = {},
): Promise<Result<void, UpdateError | InitError>> {
  const projectRoot = process.cwd();

  const migration = await migrateLegacySettings(projectRoot);
  if (isErr(migration)) {
    console.warn(`Warning: ${migration.data.message}`);
  }

  const ides: readonly TargetIDE[] = options.ide
    ? resolveIdes(options.ide)
    : await detectIdes(projectRoot);

  if (ides.length === 0) {
    return Err({
      code: 'NO_IDE_DETECTED' as const,
      message: 'No IDE setup detected. Run `agentic init` first or specify --ide.',
    });
  }

  const defaults = await readDefaultsFromSettings(projectRoot, ides);
  const namespace = options.namespace ?? defaults.namespace;
  const outputFolder = options.outputFolder ?? defaults.outputFolder;

  let workflows: readonly string[] | undefined;
  if (options.workflows) {
    const validation = validateWorkflows(options.workflows);
    if (isErr(validation)) {
      return Err({ code: 'UPDATE_FAILED' as const, message: validation.data.message });
    }
    workflows = validation.data;
  } else {
    workflows = defaults.workflows ? [...defaults.workflows] : undefined;
  }

  const selectedProfiles =
    options.profiles ?? (defaults.selectedProfiles ? [...defaults.selectedProfiles] : undefined);
  const skillOverrides = options.skillOverrides ?? defaults.skillOverrides ?? {};
  const mergedProfiles = mergeProfiles(LANGUAGE_PROFILES, [], skillOverrides);

  const managedDeps = resolveWorkflowDependencies(
    workflows ?? [],
    mergedProfiles,
    selectedProfiles,
  );
  const cleanup = await cleanupLegacyCursorDir(projectRoot, managedDeps, namespace);
  if (isErr(cleanup)) {
    console.warn(`Warning: ${cleanup.data.message}`);
  }

  if (selectedProfiles) {
    console.log(`  Profiles: ${selectedProfiles.join(', ')}`);
  }

  console.log(`Updating ${namespace}...\n`);
  console.log(`  Output folder: ${outputFolder}`);

  for (const targetIde of ides) {
    const result = await setupIde(targetIde, projectRoot, {
      namespace,
      outputFolder,
      mode: 'update',
      workflows,
      profiles: mergedProfiles,
      skillOverrides,
      selectedProfiles,
    });
    if (isErr(result)) {
      return Err({
        code: 'UPDATE_FAILED' as const,
        message: `Failed to update ${getIdeDir(targetIde)}/`,
        cause: result.data,
      });
    }

    if (workflows) {
      const newDeps = resolveWorkflowDependencies(workflows, mergedProfiles, selectedProfiles);
      const ideDir = join(projectRoot, getIdeDir(targetIde));
      await cleanupStaleFiles(ideDir, newDeps, namespace);
    }
  }

  console.log('\nUpdated:');
  for (const targetIde of ides) {
    console.log(`  ${getIdeDir(targetIde)}/: agents/, skills/`);
  }

  const backupHints: string[] = [];
  if (ides.includes('claude')) backupHints.push('  diff CLAUDE.backup.md CLAUDE.md');
  if (ides.includes('cursor') || ides.includes('codex'))
    backupHints.push('  diff AGENTS.backup.md AGENTS.md');

  if (backupHints.length > 0) {
    console.log('\nBackups created. Check for changes:');
    for (const hint of backupHints) {
      console.log(hint);
    }
  }

  return Ok(undefined);
}
