import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import type { IDE } from '../constants';
import { NAMESPACE_PATTERN } from '../constants';
import { cleanupStaleFiles, resolveWorkflowDependencies, validateWorkflows } from '../dependencies';
import { AGENTS_DIR, SKILLS_DIR, SUBAGENTS_DIR, WORKFLOWS_DIR } from '../paths';
import { readSettings, writeSettings } from '../settings';
import type { TemplateOptions } from '../utils';
import { addNamePrefix, copyAndProcess, copyFileAndProcess } from '../utils';
import type { InitError, TargetIDE } from './init';
import { detectIdes } from './update';

interface SettingsError {
  readonly code:
    | 'NO_IDE_DETECTED'
    | 'SETTINGS_UPDATE_FAILED'
    | 'NO_SUBCOMMAND'
    | 'UNKNOWN_SUBCOMMAND';
  readonly message: string;
  readonly cause?: unknown;
}

export interface SettingsUpdateOptions {
  ide?: IDE;
  namespace?: string;
  highThinkingModelName?: string;
  codeWritingModelName?: string;
  qaModelName?: string;
  outputFolder?: string;
  workflows?: readonly string[];
}

export function parseSettingsArgs(args: readonly string[]): SettingsUpdateOptions {
  const options: SettingsUpdateOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--ide' && next) {
      options.ide = next as IDE;
      i++;
    } else if (arg === '--high-thinking-model' && next) {
      options.highThinkingModelName = next;
      i++;
    } else if (arg === '--code-writing-model' && next) {
      options.codeWritingModelName = next;
      i++;
    } else if (arg === '--qa-model' && next) {
      options.qaModelName = next;
      i++;
    } else if (arg === '--output' && next) {
      options.outputFolder = next;
      i++;
    } else if ((arg === '--namespace' || arg === '-n') && next) {
      if (!NAMESPACE_PATTERN.test(next)) {
        console.error(
          `Invalid --namespace value: "${next}". Must be lowercase letters, digits, hyphens; start with letter; 2-30 chars.`,
        );
        process.exit(1);
      }
      options.namespace = next;
      i++;
    } else if ((arg === '--workflows' || arg === '-w') && next) {
      options.workflows = next
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
      i++;
    }
  }

  return options;
}

async function reinstallAgents(
  targetIde: TargetIDE,
  projectRoot: string,
  templateOptions: TemplateOptions,
  workflows?: readonly string[],
): Promise<Result<void, InitError>> {
  const ideDir = join(projectRoot, `.${targetIde}`);

  if (workflows && workflows.length > 0) {
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
          message: `Failed to copy agent ${agentFile}`,
          cause: result.data,
        });
      }
    }

    for (const skillName of deps.skills) {
      const sourcePath = join(SKILLS_DIR, skillName);
      const destName = addNamePrefix(skillName, 'skill', templateOptions.namespace);
      const destPath = join(ideDir, 'skills', destName);
      const result = await copyAndProcess(
        sourcePath,
        destPath,
        targetIde,
        templateOptions,
        'skill',
      );
      if (isErr(result)) {
        return Err({
          code: 'COPY_FAILED' as const,
          message: `Failed to copy ${skillName}`,
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
          message: `Failed to copy ${workflowName}`,
          cause: result.data,
        });
      }
    }
  } else {
    const ns = templateOptions.namespace;

    for (const srcDir of [AGENTS_DIR, SUBAGENTS_DIR]) {
      const entries = await readdir(srcDir);
      for (const entry of entries) {
        const source = join(srcDir, entry);
        const dest = join(ideDir, 'agents', addNamePrefix(entry, 'agent', ns));
        const r = await copyFileAndProcess(source, dest, targetIde, templateOptions, 'agent');
        if (isErr(r)) {
          return Err({
            code: 'COPY_FAILED' as const,
            message: `Failed to copy agent ${entry}`,
            cause: r.data,
          });
        }
      }
    }

    const skillEntries = await readdir(SKILLS_DIR);
    for (const entry of skillEntries) {
      const source = join(SKILLS_DIR, entry);
      const dest = join(ideDir, 'skills', addNamePrefix(entry, 'skill', ns));
      const r = await copyAndProcess(source, dest, targetIde, templateOptions, 'skill');
      if (isErr(r)) {
        return Err({
          code: 'COPY_FAILED' as const,
          message: `Failed to copy skill ${entry}`,
          cause: r.data,
        });
      }
    }

    const workflowEntries = await readdir(WORKFLOWS_DIR);
    for (const entry of workflowEntries) {
      const source = join(WORKFLOWS_DIR, entry);
      const dest = join(ideDir, 'skills', addNamePrefix(entry, 'workflow', ns));
      const r = await copyAndProcess(source, dest, targetIde, templateOptions, 'workflow');
      if (isErr(r)) {
        return Err({
          code: 'COPY_FAILED' as const,
          message: `Failed to copy workflow ${entry}`,
          cause: r.data,
        });
      }
    }
  }

  return Ok(undefined);
}

export async function settingsUpdate(
  options: SettingsUpdateOptions = {},
): Promise<Result<void, SettingsError | InitError>> {
  const projectRoot = process.cwd();

  let validatedWorkflows: readonly string[] | undefined;
  if (options.workflows) {
    const validation = validateWorkflows(options.workflows);
    if (isErr(validation)) {
      return Err({ code: 'SETTINGS_UPDATE_FAILED' as const, message: validation.data.message });
    }
    validatedWorkflows = validation.data;
  }

  const ides: readonly TargetIDE[] = options.ide
    ? options.ide === 'both'
      ? ['claude', 'cursor']
      : [options.ide]
    : await detectIdes(projectRoot);

  if (ides.length === 0) {
    return Err({
      code: 'NO_IDE_DETECTED' as const,
      message: 'No IDE setup detected. Run `agentic init` first or specify --ide.',
    });
  }

  for (const targetIde of ides) {
    const ideDir = join(projectRoot, `.${targetIde}`);
    const currentSettings = await readSettings(ideDir);

    if (isErr(currentSettings)) {
      return Err({
        code: 'SETTINGS_UPDATE_FAILED' as const,
        message: `No settings found for .${targetIde}/. Run \`agentic init\` first.`,
        cause: currentSettings.data,
      });
    }

    const s = currentSettings.data;
    const outputFolder = options.outputFolder ?? s.outputFolder;
    const highThinkingModelName = options.highThinkingModelName ?? s.highThinkingModelName;
    const codeWritingModelName = options.codeWritingModelName ?? s.codeWritingModelName;
    const qaModelName = options.qaModelName ?? s.qaModelName;
    const namespace = options.namespace ?? s.namespace ?? 'agentic';
    const workflows = validatedWorkflows ?? (s.workflows ? [...s.workflows] : undefined);

    const templateOptions: TemplateOptions = {
      namespace,
      outputFolder,
      highThinkingModelName,
      codeWritingModelName,
      qaModelName,
    };

    const copyResult = await reinstallAgents(targetIde, projectRoot, templateOptions, workflows);
    if (isErr(copyResult)) {
      return Err({
        code: 'SETTINGS_UPDATE_FAILED' as const,
        message: `Failed to reinstall agents for .${targetIde}/`,
        cause: copyResult.data,
      });
    }

    if (workflows) {
      const newDeps = resolveWorkflowDependencies(workflows);
      await cleanupStaleFiles(ideDir, newDeps, namespace);
    }

    const writeResult = await writeSettings(
      ideDir,
      namespace,
      outputFolder,
      highThinkingModelName,
      codeWritingModelName,
      qaModelName,
      workflows,
    );
    if (isErr(writeResult)) {
      return Err({
        code: 'SETTINGS_UPDATE_FAILED' as const,
        message: `Failed to write settings for .${targetIde}/`,
        cause: writeResult.data,
      });
    }

    console.log(`  .${targetIde}/: agents/, skills/ reinstalled`);
  }

  return Ok(undefined);
}

export async function settings(
  subcommand: string | undefined,
  args: readonly string[],
): Promise<Result<void, SettingsError | InitError>> {
  if (!subcommand) {
    return Err({
      code: 'NO_SUBCOMMAND' as const,
      message: 'Usage: agentic settings apply [options]',
    });
  }

  if (subcommand !== 'apply') {
    return Err({
      code: 'UNKNOWN_SUBCOMMAND' as const,
      message: `Unknown subcommand: ${subcommand}. Available: apply`,
    });
  }

  const options = parseSettingsArgs(args);

  console.log('Applying settings...\n');

  const result = await settingsUpdate(options);
  if (isErr(result)) return result;

  console.log('\nSettings applied.');

  return Ok(undefined);
}
