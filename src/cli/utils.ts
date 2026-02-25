import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { IDE } from './constants';

export type ContentType = 'skill' | 'workflow' | 'agent' | 'other';

export function addNamePrefix(name: string, type: ContentType, namespace: string) {
  if (type === 'other') return name;
  return `${namespace}-${type}-${name}`;
}

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

function addFrontmatterPrefixes(content: string, type: ContentType, namespace: string) {
  if (type === 'other') return content;

  let result = content;

  if (type === 'skill' || type === 'workflow') {
    result = result.replace(/^(name:\s*)(\S+)/m, `$1${namespace}:${type}:$2`);
  } else if (type === 'agent') {
    result = result.replace(/^(name:\s*)(\S+)/m, `$1${namespace}:agent:$2`);
    result = result.replace(/^(skills:\s*\[)(.+?)(\])/m, (_, prefix, skills, suffix) => {
      const prefixed = skills
        .split(',')
        .map((s: string) => {
          const trimmed = s.trim();
          return trimmed.includes(':') ? trimmed : `${namespace}:skill:${trimmed}`;
        })
        .join(', ');
      return `${prefix}${prefixed}${suffix}`;
    });
  }

  return result;
}

export function processTemplate(
  content: string,
  ide: TargetIDE,
  options: TemplateOptions,
  contentType: ContentType = 'other',
) {
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

  result = addFrontmatterPrefixes(result, contentType, options.namespace);
  result = applyNamespaceReplacements(result, options.namespace);

  return result;
}

export async function copyAndProcess(
  source: string,
  destination: string,
  ide: TargetIDE,
  options: TemplateOptions,
  contentType: ContentType = 'other',
): Promise<Result<void, CopyDirError>> {
  try {
    await mkdir(destination, { recursive: true });

    const entries = await readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = join(source, entry.name);
      const rewrittenName = entry.name;
      const destinationPath = join(destination, rewrittenName);

      if (entry.isDirectory()) {
        const rewrittenDestination = join(destination, rewrittenName);
        const result = await copyAndProcess(
          sourcePath,
          rewrittenDestination,
          ide,
          options,
          contentType,
        );
        if (result._type === 'Err') return result;
      } else if (isTemplateFile(entry.name)) {
        const content = await Bun.file(sourcePath).text();
        await Bun.write(destinationPath, processTemplate(content, ide, options, contentType));
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

export async function copyFileAndProcess(
  sourcePath: string,
  destinationPath: string,
  ide: TargetIDE,
  options: TemplateOptions,
  contentType: ContentType = 'other',
): Promise<Result<void, CopyDirError>> {
  try {
    const dir = destinationPath.substring(0, destinationPath.lastIndexOf('/'));
    await mkdir(dir, { recursive: true });

    if (isTemplateFile(sourcePath)) {
      const content = await Bun.file(sourcePath).text();
      await Bun.write(destinationPath, processTemplate(content, ide, options, contentType));
    } else {
      const content = await Bun.file(sourcePath).arrayBuffer();
      await Bun.write(destinationPath, content);
    }

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'COPY_DIR_FAILED' as const,
      message: `Failed to copy ${sourcePath} to ${destinationPath}`,
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
