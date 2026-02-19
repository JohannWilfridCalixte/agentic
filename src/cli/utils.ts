import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { IDE } from './constants';

export async function appendToGitignore(projectRoot: string, entry: string): Promise<void> {
  const gitignorePath = join(projectRoot, '.gitignore');
  const gitignoreFile = Bun.file(gitignorePath);

  if (await gitignoreFile.exists()) {
    const content = await gitignoreFile.text();
    const lines = content.split('\n').map((line) => line.trim());
    if (lines.includes(entry)) return;

    const needsNewline = content.length > 0 && !content.endsWith('\n');
    await Bun.write(gitignorePath, `${content}${needsNewline ? '\n' : ''}${entry}\n`);
  } else {
    await Bun.write(gitignorePath, `${entry}\n`);
  }
}

interface CopyDirError {
  readonly code: 'COPY_DIR_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

type TargetIDE = Exclude<IDE, 'both'>;

const IDE_TEMPLATE_VARS = {
  claude: {
    'ide-folder': '.claude',
    'ide-invoke-prefix': 'Read ',
    subagentTypeGeneralPurpose: 'general-purpose',
  },
  cursor: {
    'ide-folder': '.cursor',
    'ide-invoke-prefix': '@',
    subagentTypeGeneralPurpose: 'generalPurpose',
  },
} as const satisfies Record<TargetIDE, Record<string, string>>;

const IDE_SETTINGS_DEFAULTS = {
  claude: {
    highThinkingModelName: 'opus',
    codeWritingModelName: 'opus',
    qaModelName: 'opus',
  },
  cursor: {
    highThinkingModelName: 'claude-4.6-opus-high-thinking',
    codeWritingModelName: 'claude-4.6-opus-high-thinking',
    qaModelName: 'claude-4.6-opus-high-thinking',
  },
} as const satisfies Record<TargetIDE, Record<string, string>>;

export function getHighThinkingModelName(ide: TargetIDE) {
  return IDE_SETTINGS_DEFAULTS[ide].highThinkingModelName;
}

export function getCodeWritingModelName(ide: TargetIDE) {
  return IDE_SETTINGS_DEFAULTS[ide].codeWritingModelName;
}

export function getQaModelName(ide: TargetIDE) {
  return IDE_SETTINGS_DEFAULTS[ide].qaModelName;
}

export interface TemplateOptions {
  readonly namespace: string;
  readonly outputFolder: string;
  readonly highThinkingModelName: string;
  readonly codeWritingModelName: string;
  readonly qaModelName: string;
}

function capitalizeFirst(s: string) {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function applyNamespaceReplacements(content: string, namespace: string) {
  if (namespace === 'agentic') return content;

  let result = content;
  const ns = namespace;
  const capitalized = capitalizeFirst(ns);

  // Colon identifiers: agentic:skill:, agentic:workflow:, agentic:agent:
  result = result.replaceAll('agentic:skill:', `${ns}:skill:`);
  result = result.replaceAll('agentic:workflow:', `${ns}:workflow:`);
  result = result.replaceAll('agentic:agent:', `${ns}:agent:`);

  // Slash command references: /agentic:
  result = result.replaceAll('/agentic:', `/${ns}:`);

  // File name references: agentic-agent-, agentic-skill-, agentic-workflow-
  result = result.replaceAll('agentic-agent-', `${ns}-agent-`);
  result = result.replaceAll('agentic-skill-', `${ns}-skill-`);
  result = result.replaceAll('agentic-workflow-', `${ns}-workflow-`);

  // Section marker
  result = result.replaceAll('# Agentic Framework', `# ${capitalized} Framework`);

  // Output folder
  result = result.replaceAll('_agentic_output', `_${ns}_output`);

  return result;
}

export function processTemplate(content: string, ide: TargetIDE, options: TemplateOptions) {
  const vars = {
    ...IDE_TEMPLATE_VARS[ide],
    'output-folder': options.outputFolder,
    outputFolder: options.outputFolder,
    highThinkingModelName: options.highThinkingModelName,
    codeWritingModelName: options.codeWritingModelName,
    qaModelName: options.qaModelName,
  };
  let result = content;

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }

  result = applyNamespaceReplacements(result, options.namespace);

  return result;
}

export function rewriteNamespace(name: string, namespace: string) {
  if (namespace === 'agentic') return name;
  return name.replace(/^agentic-/, `${namespace}-`);
}

export async function copyAndProcess(
  source: string,
  destination: string,
  ide: TargetIDE,
  options: TemplateOptions,
): Promise<Result<void, CopyDirError>> {
  try {
    await mkdir(destination, { recursive: true });

    const entries = await readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = join(source, entry.name);
      const rewrittenName = rewriteNamespace(entry.name, options.namespace);
      const destinationPath = join(destination, rewrittenName);

      if (entry.isDirectory()) {
        const rewrittenDestination = join(destination, rewrittenName);
        const result = await copyAndProcess(sourcePath, rewrittenDestination, ide, options);
        if (result._type === 'Err') return result;
      } else if (isTemplateFile(entry.name)) {
        const content = await Bun.file(sourcePath).text();
        await Bun.write(destinationPath, processTemplate(content, ide, options));
      } else {
        const content = await Bun.file(sourcePath).arrayBuffer();
        await Bun.write(destinationPath, content);
      }
    }

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'COPY_DIR_FAILED' as const,
      message: `Failed to copy ${source} to ${destination}`,
      cause: error,
    });
  }
}

function isTemplateFile(filename: string) {
  return (
    filename.endsWith('.md') ||
    filename.endsWith('.yaml') ||
    filename.endsWith('.yml') ||
    filename.endsWith('.sh')
  );
}
