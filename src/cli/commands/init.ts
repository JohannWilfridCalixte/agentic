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
import { copyDir } from '../utils';

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
  const agenticDir = join(projectRoot, '.agentic');

  console.log('Initializing agentic...\n');

  if (!existsSync(agenticDir)) {
    mkdirSync(agenticDir, { recursive: true });
  }

  const destinationAgents = join(agenticDir, 'agents');
  const agentsCopyResult = await copyDir(AGENTS_DIR, destinationAgents);
  if (isErr(agentsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy agents',
      cause: agentsCopyResult.data,
    });
  }
  console.log('  Copied agents to .agentic/agents/');

  const destinationScripts = join(agenticDir, 'scripts');
  const scriptsCopyResult = await copyDir(SCRIPTS_DIR, destinationScripts);
  if (isErr(scriptsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy scripts',
      cause: scriptsCopyResult.data,
    });
  }
  console.log('  Copied scripts to .agentic/scripts/');

  // Copy workflows to .agentic/workflows
  const destinationWorkflows = join(agenticDir, 'workflows');
  const workflowsCopyResult = await copyDir(WORKFLOWS_DIR, destinationWorkflows);
  if (isErr(workflowsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy workflows',
      cause: workflowsCopyResult.data,
    });
  }
  console.log('  Copied workflows to .agentic/workflows/');

  const claudeDir = join(projectRoot, '.claude');
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  // Copy skills to .claude/skills
  const destinationSkills = join(claudeDir, 'skills');
  const skillsCopyResult = await copyDir(SKILLS_DIR, destinationSkills);
  if (isErr(skillsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy skills',
      cause: skillsCopyResult.data,
    });
  }
  console.log('  Copied skills to .claude/skills/');

  // Copy agents + subagents to .claude/agents
  const destinationClaudeAgents = join(claudeDir, 'agents');
  const claudeAgentsCopyResult = await copyDir(AGENTS_DIR, destinationClaudeAgents);
  if (isErr(claudeAgentsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy agents to claude',
      cause: claudeAgentsCopyResult.data,
    });
  }
  const claudeSubagentsCopyResult = await copyDir(SUBAGENTS_DIR, destinationClaudeAgents);
  if (isErr(claudeSubagentsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy subagents to claude',
      cause: claudeSubagentsCopyResult.data,
    });
  }
  console.log('  Copied agents to .claude/agents/');

  // Copy commands to .claude/commands
  const destinationClaudeCommands = join(claudeDir, 'commands');
  const claudeCommandsCopyResult = await copyDir(COMMANDS_DIR, destinationClaudeCommands);
  if (isErr(claudeCommandsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy commands to claude',
      cause: claudeCommandsCopyResult.data,
    });
  }
  console.log('  Copied commands to .claude/commands/');

  const cursorDir = join(projectRoot, '.cursor');
  if (!existsSync(cursorDir)) {
    mkdirSync(cursorDir, { recursive: true });
  }

  // Copy skills to .cursor/skills
  const destinationCursorSkills = join(cursorDir, 'skills');
  const cursorSkillsCopyResult = await copyDir(SKILLS_DIR, destinationCursorSkills);
  if (isErr(cursorSkillsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy skills to cursor',
      cause: cursorSkillsCopyResult.data,
    });
  }
  console.log('  Copied skills to .cursor/skills/');

  // Copy agents + subagents to .cursor/agents
  const destinationCursorAgents = join(cursorDir, 'agents');
  const cursorAgentsCopyResult = await copyDir(AGENTS_DIR, destinationCursorAgents);
  if (isErr(cursorAgentsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy agents to cursor',
      cause: cursorAgentsCopyResult.data,
    });
  }
  const cursorSubagentsCopyResult = await copyDir(SUBAGENTS_DIR, destinationCursorAgents);
  if (isErr(cursorSubagentsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy subagents to cursor',
      cause: cursorSubagentsCopyResult.data,
    });
  }
  console.log('  Copied agents to .cursor/agents/');

  // Copy commands to .cursor/commands (Cursor command format)
  const destinationCommands = join(cursorDir, 'commands');
  const commandsCopyResult = await copyDir(COMMANDS_DIR, destinationCommands);
  if (isErr(commandsCopyResult)) {
    return Err({
      code: 'COPY_FAILED' as const,
      message: 'Failed to copy commands',
      cause: commandsCopyResult.data,
    });
  }
  console.log('  Copied commands to .cursor/commands/');

  makeScriptsExecutable(destinationScripts);

  if (ide === 'claude' || ide === 'both') {
    const claudeResult = await setupClaude(projectRoot);
    if (isErr(claudeResult)) {
      return claudeResult;
    }
  }

  if (ide === 'cursor' || ide === 'both') {
    const cursorResult = await setupCursor(projectRoot);
    if (isErr(cursorResult)) {
      return cursorResult;
    }
  }

  console.log('\nDone!');
  console.log('  Agents: .claude/agents/, .cursor/agents/');
  console.log('  Workflows: .agentic/workflows/');
  console.log('  Skills: .claude/skills/, .cursor/skills/');
  console.log('  Commands: .claude/commands/, .cursor/commands/');
  console.log('\nUsage:');
  console.log('  /agentic:quick-spec-and-implement [--auto] [input]  Spec-to-PR (interactive/auto)');
  console.log('  /agentic:auto-implement [input]                     Autonomous implementation');

  return Ok(undefined);
}
