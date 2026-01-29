import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Result } from '../../lib/monads';
import { Err, isErr, Ok } from '../../lib/monads';
import type { IDE } from '../constants';
import { SCRIPTS } from '../constants';
import {
  AGENTS_DIR,
  COMMANDS_DIR,
  SCRIPTS_DIR,
  SKILLS_DIR,
  SUBAGENTS_DIR,
  TEMPLATES_DIR,
  WORKFLOWS_DIR,
} from '../paths';
import { copyAndProcess } from '../utils';

interface InitError {
  readonly code: 'READ_TEMPLATE_FAILED' | 'WRITE_FILE_FAILED' | 'COPY_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

async function setupClaude(projectRoot: string): Promise<Result<void, InitError>> {
  const claudeMdPath = join(projectRoot, 'CLAUDE.md');
  const templatePath = join(TEMPLATES_DIR, 'claude.md.template');

  try {
    const template = await Bun.file(templatePath).text();
    const claudeMdFile = Bun.file(claudeMdPath);

    if (await claudeMdFile.exists()) {
      const existing = await claudeMdFile.text();
      if (existing.includes('## Agentic Framework')) {
        console.log('  CLAUDE.md already has agentic section, skipping');
        return Ok(undefined);
      }
      await Bun.write(claudeMdPath, `${existing}\n\n${template}`);
      console.log('  Appended to CLAUDE.md');
    } else {
      await Bun.write(claudeMdPath, template);
      console.log('  Created CLAUDE.md');
    }

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'WRITE_FILE_FAILED' as const,
      message: 'Failed to setup CLAUDE.md',
      cause: error,
    });
  }
}

async function setupCursor(projectRoot: string): Promise<Result<void, InitError>> {
  const cursorDir = join(projectRoot, '.cursor', 'rules');
  const rulesPath = join(cursorDir, 'agentic.mdc');
  const templatePath = join(TEMPLATES_DIR, 'cursor-rules.template');

  try {
    if (!existsSync(cursorDir)) {
      mkdirSync(cursorDir, { recursive: true });
    }

    const template = await Bun.file(templatePath).text();
    await Bun.write(rulesPath, template);
    console.log('  Created .cursor/rules/agentic.mdc');

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'WRITE_FILE_FAILED' as const,
      message: 'Failed to setup cursor rules',
      cause: error,
    });
  }
}

function makeScriptsExecutable(scriptsDir: string): void {
  for (const script of SCRIPTS) {
    const scriptPath = join(scriptsDir, script);
    if (existsSync(scriptPath)) {
      try {
        chmodSync(scriptPath, 0o755);
      } catch {
        // Ignore chmod errors
      }
    }
  }
}

export async function init(ide: IDE = 'both'): Promise<Result<void, InitError>> {
  const projectRoot = process.cwd();
  const ides: ('claude' | 'cursor')[] =
    ide === 'both' ? ['claude', 'cursor'] : [ide];

  console.log('Initializing agentic...\n');

  for (const targetIde of ides) {
    const ideDir = join(projectRoot, `.${targetIde}`);
    if (!existsSync(ideDir)) mkdirSync(ideDir, { recursive: true });

    const copies: [string, string][] = [
      [AGENTS_DIR, join(ideDir, 'agents')],
      [SUBAGENTS_DIR, join(ideDir, 'agents')],
      [SKILLS_DIR, join(ideDir, 'skills')],
      [COMMANDS_DIR, join(ideDir, 'commands')],
      [WORKFLOWS_DIR, join(ideDir, 'workflows')],
      [SCRIPTS_DIR, join(ideDir, 'scripts')],
    ];

    for (const [src, dest] of copies) {
      const result = await copyAndProcess(src, dest, targetIde);
      if (isErr(result)) {
        return Err({ code: 'COPY_FAILED' as const, message: `Failed to copy to .${targetIde}/`, cause: result.data });
      }
    }

    console.log(`  Copied to .${targetIde}/agents/, skills/, commands/, workflows/, scripts/`);

    makeScriptsExecutable(join(ideDir, 'scripts'));

    if (targetIde === 'claude') {
      const r = await setupClaude(projectRoot);
      if (isErr(r)) return r;
    }
    if (targetIde === 'cursor') {
      const r = await setupCursor(projectRoot);
      if (isErr(r)) return r;
    }
  }

  console.log('\nDone!');
  for (const targetIde of ides) {
    console.log(`  .${targetIde}/: agents/, skills/, commands/, workflows/, scripts/`);
  }
  console.log('\nUsage:');
  console.log('  /agentic:quick-spec-and-implement [--auto] [input]');
  console.log('  /agentic:auto-implement [input]');
  console.log('  /agentic:debug [input]');

  return Ok(undefined);
}
