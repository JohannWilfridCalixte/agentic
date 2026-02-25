import { chmod, mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../../lib/monads';
import { Err, isErr, Ok } from '../../../lib/monads';
import type { IDE } from '../../constants';
import { resolveWorkflowDependencies, validateWorkflows } from '../../dependencies';
import { AGENTS_DIR, SKILLS_DIR, SUBAGENTS_DIR, WORKFLOWS_DIR } from '../../paths';
import { writeSettings } from '../../settings';
import type { TemplateOptions } from '../../utils';
import {
  addNamePrefix,
  appendToGitignore,
  copyAndProcess,
  copyFileAndProcess,
  getCodeWritingModelName,
  getHighThinkingModelName,
  getQaModelName,
} from '../../utils';
import { getIdeStrategy } from './strategies';
import type { InitError, SetupMode, TargetIDE } from './types';

export function getDefaultOutputFolder(namespace: string) {
  return `_${namespace}_output`;
}

async function makeScriptsExecutableRecursive(dir: string) {
  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        await makeScriptsExecutableRecursive(fullPath);
      } else if (entry.endsWith('.sh')) {
        try {
          await chmod(fullPath, 0o755);
        } catch {
          // Ignore chmod errors
        }
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }
}

async function copyAllWithPrefixes(
  ideDir: string,
  targetIde: TargetIDE,
  templateOptions: TemplateOptions,
): Promise<Result<void, InitError>> {
  const ns = templateOptions.namespace;

  // Copy agents + subagents → agents/ with {ns}-agent- prefix
  for (const srcDir of [AGENTS_DIR, SUBAGENTS_DIR]) {
    const entries = await readdir(srcDir);
    for (const entry of entries) {
      const source = join(srcDir, entry);
      const dest = join(ideDir, 'agents', addNamePrefix(entry, 'agent', ns));
      const result = await copyFileAndProcess(source, dest, targetIde, templateOptions, 'agent');
      if (isErr(result)) {
        return Err({
          code: 'COPY_FAILED' as const,
          message: `Failed to copy agent ${entry}`,
          cause: result.data,
        });
      }
    }
  }

  // Copy skills → skills/ with {ns}-skill- prefix
  const skillEntries = await readdir(SKILLS_DIR);
  for (const entry of skillEntries) {
    const source = join(SKILLS_DIR, entry);
    const dest = join(ideDir, 'skills', addNamePrefix(entry, 'skill', ns));
    const result = await copyAndProcess(source, dest, targetIde, templateOptions, 'skill');
    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy skill ${entry}`,
        cause: result.data,
      });
    }
  }

  // Copy workflows → skills/ with {ns}-workflow- prefix
  const workflowEntries = await readdir(WORKFLOWS_DIR);
  for (const entry of workflowEntries) {
    const source = join(WORKFLOWS_DIR, entry);
    const dest = join(ideDir, 'skills', addNamePrefix(entry, 'workflow', ns));
    const result = await copyAndProcess(source, dest, targetIde, templateOptions, 'workflow');
    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy workflow ${entry}`,
        cause: result.data,
      });
    }
  }

  return Ok(undefined);
}

async function selectiveCopy(
  workflows: readonly string[],
  ideDir: string,
  targetIde: TargetIDE,
  templateOptions: TemplateOptions,
): Promise<Result<void, InitError>> {
  const deps = resolveWorkflowDependencies(workflows);

  for (const agentFile of deps.agents) {
    const sourcePath = join(SUBAGENTS_DIR, agentFile);
    const destName = addNamePrefix(agentFile, 'agent', templateOptions.namespace);
    const destPath = join(ideDir, 'agents', destName);
    const result = await copyFileAndProcess(
      sourcePath,
      destPath,
      targetIde,
      templateOptions,
      'agent',
    );

    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy agent ${agentFile} to .${targetIde}/`,
        cause: result.data,
      });
    }
  }

  for (const skillName of deps.skills) {
    const sourcePath = join(SKILLS_DIR, skillName);
    const destName = addNamePrefix(skillName, 'skill', templateOptions.namespace);
    const destPath = join(ideDir, 'skills', destName);
    const result = await copyAndProcess(sourcePath, destPath, targetIde, templateOptions, 'skill');

    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy ${skillName} to .${targetIde}/`,
        cause: result.data,
      });
    }
  }

  for (const workflowName of deps.workflows) {
    const sourcePath = join(WORKFLOWS_DIR, workflowName);
    const destName = addNamePrefix(workflowName, 'workflow', templateOptions.namespace);
    const destPath = join(ideDir, 'skills', destName);
    const result = await copyAndProcess(
      sourcePath,
      destPath,
      targetIde,
      templateOptions,
      'workflow',
    );

    if (isErr(result)) {
      return Err({
        code: 'COPY_FAILED' as const,
        message: `Failed to copy ${workflowName} to .${targetIde}/`,
        cause: result.data,
      });
    }
  }

  return Ok(undefined);
}

export interface SetupOptions {
  readonly namespace?: string;
  readonly outputFolder?: string;
  readonly mode?: SetupMode;
  readonly workflows?: readonly string[];
}

export async function setupIde(
  targetIde: TargetIDE,
  projectRoot: string,
  options: SetupOptions = {},
): Promise<Result<void, InitError>> {
  const ideDir = join(projectRoot, `.${targetIde}`);
  const namespace = options.namespace ?? 'agentic';
  const outputFolder = options.outputFolder ?? getDefaultOutputFolder(namespace);

  await mkdir(ideDir, { recursive: true });

  const templateOptions: TemplateOptions = {
    namespace,
    outputFolder,
    highThinkingModelName: getHighThinkingModelName(targetIde),
    codeWritingModelName: getCodeWritingModelName(targetIde),
    qaModelName: getQaModelName(targetIde),
  };

  if (options.workflows && options.workflows.length > 0) {
    const copyResult = await selectiveCopy(options.workflows, ideDir, targetIde, templateOptions);
    if (isErr(copyResult)) return copyResult;
  } else {
    const copyResult = await copyAllWithPrefixes(ideDir, targetIde, templateOptions);
    if (isErr(copyResult)) return copyResult;
  }

  console.log(`  Copied to .${targetIde}/agents/, skills/`);

  await makeScriptsExecutableRecursive(join(ideDir, 'skills'));

  const strategy = getIdeStrategy(targetIde);
  const result = await strategy.setup(projectRoot, { mode: options.mode ?? 'init', namespace });

  if (isErr(result)) return result;

  await appendToGitignore(projectRoot, `.${targetIde}/${outputFolder}`);

  const settingsResult = await writeSettings(
    ideDir,
    namespace,
    outputFolder,
    getHighThinkingModelName(targetIde),
    getCodeWritingModelName(targetIde),
    getQaModelName(targetIde),
    options.workflows,
  );
  if (isErr(settingsResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: `Failed to write settings to .${targetIde}/`,
      cause: settingsResult.data,
    });
  }

  return Ok(undefined);
}

export interface InitOptions {
  readonly ide?: IDE;
  readonly namespace?: string;
  readonly outputFolder?: string;
  readonly workflows?: readonly string[];
}

export async function init(options: InitOptions = {}): Promise<Result<void, InitError>> {
  const projectRoot = process.cwd();
  const ide = options.ide ?? 'both';
  const namespace = options.namespace ?? 'agentic';
  const outputFolder = options.outputFolder ?? getDefaultOutputFolder(namespace);
  const ides: readonly TargetIDE[] = ide === 'both' ? ['claude', 'cursor'] : [ide];

  let validatedWorkflows: readonly string[] | undefined;
  if (options.workflows) {
    const validation = validateWorkflows(options.workflows);
    if (isErr(validation)) {
      return Err({ code: 'COPY_FAILED' as const, message: validation.data.message });
    }
    validatedWorkflows = validation.data;
  }

  console.log(`Initializing ${namespace}...\n`);
  console.log(`  Output folder: ${outputFolder}`);

  for (const targetIde of ides) {
    const result = await setupIde(targetIde, projectRoot, {
      namespace,
      outputFolder,
      workflows: validatedWorkflows,
    });
    if (isErr(result)) return result;
  }

  console.log('\nDone!');

  for (const targetIde of ides) {
    console.log(`  .${targetIde}/: agents/, skills/`);
  }

  console.log('\nUsage:');
  console.log(`  /${namespace}:workflow:product-spec [--auto] [input]`);
  console.log(`  /${namespace}:workflow:technical-planning [input]`);
  console.log(`  /${namespace}:workflow:quick-spec-and-implement [--auto] [input]`);
  console.log(`  /${namespace}:workflow:auto-implement [input]`);
  console.log(`  /${namespace}:workflow:debug [input]`);
  console.log(`  /${namespace}:workflow:frontend-development [input]`);

  return Ok(undefined);
}

export type { InitError, TargetIDE } from './types';
