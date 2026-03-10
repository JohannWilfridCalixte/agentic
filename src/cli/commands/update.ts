import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import type { IDE } from '../constants';
import { getIdeDir, resolveIdes } from '../constants';
import { cleanupStaleFiles, resolveWorkflowDependencies, validateWorkflows } from '../dependencies';
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
  readonly ide?: IDE;
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

export async function detectIdes(projectRoot: string) {
  const detected: TargetIDE[] = [];

  if (await directoryExists(join(projectRoot, '.claude'))) detected.push('claude');
  if (await directoryExists(join(projectRoot, '.cursor'))) detected.push('cursor');
  if (await directoryExists(join(projectRoot, '.agents'))) detected.push('codex');

  return detected;
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
  for (const ide of ides) {
    const ideDir = join(projectRoot, getIdeDir(ide));
    const result = await readSettings(ideDir);
    if (result._type === 'Ok') {
      return {
        namespace: result.data.namespace,
        outputFolder: result.data.outputFolder,
        workflows: result.data.workflows,
        selectedProfiles: result.data.selectedProfiles,
        skillOverrides: result.data.skillOverrides,
      };
    }
  }
  return { namespace: 'agentic', outputFolder: getDefaultOutputFolder('agentic') };
}

export async function update(
  options: UpdateOptions = {},
): Promise<Result<void, UpdateError | InitError>> {
  const projectRoot = process.cwd();

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
