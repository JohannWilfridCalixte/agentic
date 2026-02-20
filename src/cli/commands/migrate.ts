import { mkdir, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import type { IDE } from '../constants';
import type { InitError, TargetIDE } from './init';
import { init } from './init';
import { detectIdes } from './update';

interface MigrateError {
  readonly code: 'BACKUP_FAILED' | 'INIT_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export interface MigrateOptions {
  readonly ide?: IDE;
  readonly namespace?: string;
  readonly outputFolder?: string;
  readonly workflows?: readonly string[];
}

const OLD_AGENT_FILES = [
  'cpo.md',
  'cto.md',
  'dx.md',
  'team-and-workflow.md',
  'analyst.md',
  'architect.md',
  'editor.md',
  'frontend-developer.md',
  'investigator.md',
  'pm.md',
  'qa.md',
  'security-qa.md',
  'security.md',
  'test-engineer.md',
  'test-qa.md',
  'ui-ux-designer.md',
] as const;

const OLD_SKILL_DIRS = [
  'brainstorming',
  'clean-architecture',
  'code',
  'code-testing',
  'context7',
  'dx',
  'frontend-design',
  'gather-technical-context',
  'github',
  'observability',
  'product-discovery',
  'product-manager',
  'product-vision',
  'qa',
  'refactoring-ui',
  'security-context',
  'security-qa',
  'tech-vision',
  'technical-planning',
  'typescript-engineer',
  'typescript-imports',
  'ux-patterns',
] as const;

const OLD_WORKFLOW_DIRS = [
  'agentic-auto-implement',
  'agentic-debug',
  'agentic-frontend-development',
  'agentic-implement',
  'agentic-product-spec',
  'agentic-quick-spec-and-implement',
  'agentic-technical-planning',
] as const;

const OLD_SKILL_AGGREGATED_DIRS = ['agentic'] as const;

const OLD_CURSOR_RULES = ['agentic.mdc'] as const;

async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function backupOldArtifacts(projectRoot: string, targetIde: TargetIDE, timestamp: string) {
  const ideDir = join(projectRoot, `.${targetIde}`);
  const backupDir = join(projectRoot, `.${targetIde}_backup_${timestamp}`);
  const moved: string[] = [];

  for (const file of OLD_AGENT_FILES) {
    const source = join(ideDir, 'agents', file);
    if (await exists(source)) {
      const dest = join(backupDir, 'agents', file);
      await mkdir(join(backupDir, 'agents'), { recursive: true });
      await rename(source, dest);
      moved.push(`.${targetIde}/agents/${file}`);
    }
  }

  for (const dir of [...OLD_SKILL_DIRS, ...OLD_WORKFLOW_DIRS, ...OLD_SKILL_AGGREGATED_DIRS]) {
    const source = join(ideDir, 'skills', dir);
    if (await exists(source)) {
      const dest = join(backupDir, 'skills', dir);
      await mkdir(join(backupDir, 'skills'), { recursive: true });
      await rename(source, dest);
      moved.push(`.${targetIde}/skills/${dir}/`);
    }
  }

  if (targetIde === 'cursor') {
    for (const file of OLD_CURSOR_RULES) {
      const source = join(ideDir, 'rules', file);
      if (await exists(source)) {
        const dest = join(backupDir, 'rules', file);
        await mkdir(join(backupDir, 'rules'), { recursive: true });
        await rename(source, dest);
        moved.push(`.${targetIde}/rules/${file}`);
      }
    }
  }

  return { moved, backupDir: `.${targetIde}_backup_${timestamp}` };
}

function generateTimestamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export async function migrate(
  options: MigrateOptions = {},
): Promise<Result<void, MigrateError | InitError>> {
  const projectRoot = process.cwd();
  const timestamp = generateTimestamp();
  const backupDirs: string[] = [];

  const ides: readonly TargetIDE[] = options.ide
    ? options.ide === 'both'
      ? ['claude', 'cursor']
      : [options.ide]
    : await detectIdes(projectRoot);

  if (ides.length === 0) {
    console.log('Warning: No IDE setup detected. Running init...\n');
  } else {
    console.log('Migrating...\n');

    for (const targetIde of ides) {
      try {
        const { moved, backupDir } = await backupOldArtifacts(projectRoot, targetIde, timestamp);

        if (moved.length === 0) {
          console.log(`  No old artifacts found in .${targetIde}/`);
        } else {
          backupDirs.push(backupDir);
          for (const path of moved) {
            console.log(
              `  Backed up: ${path} -> ${backupDir}/${path.split('/').slice(1).join('/')}`,
            );
          }
        }
      } catch (error) {
        return Err({
          code: 'BACKUP_FAILED' as const,
          message: `Failed to backup old artifacts in .${targetIde}/`,
          cause: error,
        });
      }
    }

    console.log('');
  }

  const initResult = await init({
    ide: options.ide,
    namespace: options.namespace,
    outputFolder: options.outputFolder,
    workflows: options.workflows,
  });

  if (isErr(initResult)) {
    return Err({
      code: 'INIT_FAILED' as const,
      message: `Init failed during migrate: ${initResult.data.message}`,
      cause: initResult.data,
    });
  }

  if (backupDirs.length > 0) {
    console.log('\nReview backup dirs and delete when satisfied:');
    for (const dir of backupDirs) {
      console.log(`  rm -rf ${dir}`);
    }
  }

  return Ok(undefined);
}
