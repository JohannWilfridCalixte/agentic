import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { TargetIDE } from './commands/init/types';
import { NAMESPACE_PATTERN } from './constants';
import { PKG_ROOT } from './paths';
import type { LanguageProfile } from './profiles';

export const SETTINGS_FILE = '.agentic.json';

// Strict pattern for names that flow into filesystem paths (skill/workflow/
// agent identifiers, profile names, workflow slugs). Forbids path separators,
// `..`, leading `.`, null bytes, control characters.
const SAFE_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;

function isSafeName(value: unknown): value is string {
  return typeof value === 'string' && SAFE_NAME_PATTERN.test(value);
}

function isValidNamespace(value: unknown): value is string {
  return typeof value === 'string' && NAMESPACE_PATTERN.test(value);
}

function sanitizeSkillOverrides(raw: unknown, context: string): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isSafeName(key) || !isSafeName(value)) {
      console.warn(
        `Ignoring unsafe skillOverrides entry in ${context}: ${JSON.stringify({ [key]: value })}`,
      );
      continue;
    }
    sanitized[key] = value;
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeStringList(
  raw: unknown,
  fieldName: string,
  context: string,
): readonly string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const entry of raw) {
    if (!isSafeName(entry)) {
      console.warn(`Ignoring unsafe ${fieldName} entry in ${context}: ${JSON.stringify(entry)}`);
      continue;
    }
    out.push(entry);
  }
  return out.length > 0 ? out : undefined;
}

function sanitizeProfiles(raw: unknown, context: string): readonly LanguageProfile[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: LanguageProfile[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const name = record.name;
    if (!isSafeName(name)) {
      console.warn(`Ignoring profile with unsafe name in ${context}: ${JSON.stringify(name)}`);
      continue;
    }
    const skills = sanitizeStringList(record.skills, `profile.${name}.skills`, context) ?? [];
    const detect = Array.isArray(record.detect)
      ? record.detect.filter((d): d is string => typeof d === 'string')
      : [];
    const extendsField = typeof record.extends === 'string' ? record.extends : undefined;
    out.push({
      name,
      detect,
      skills: [...skills],
      ...(extendsField !== undefined ? { extends: extendsField } : {}),
    } satisfies LanguageProfile);
  }
  return out.length > 0 ? out : undefined;
}

export interface IdeSettings {
  readonly outputFolder: string;
  readonly highThinkingModelName: string;
  readonly codeWritingModelName: string;
  readonly qaModelName: string;
}

export interface SharedSettings {
  readonly namespace: string;
  readonly version: string;
  readonly lastUpdate: string;
  readonly workflows?: readonly string[];
  readonly profiles?: readonly LanguageProfile[];
  readonly skillOverrides?: Record<string, string>;
  readonly selectedProfiles?: readonly string[];
}

export interface AgenticSettings extends SharedSettings {
  readonly ides: Partial<Record<TargetIDE, IdeSettings>>;
}

export interface EffectiveSettings extends SharedSettings, IdeSettings {}

export interface WriteSettingsInput {
  readonly shared: Omit<SharedSettings, 'version' | 'lastUpdate'>;
  readonly ide: TargetIDE;
  readonly ideSettings: IdeSettings;
}

export interface ReadSettingsError {
  readonly code:
    | 'READ_SETTINGS_FAILED'
    | 'PARSE_FAILED'
    | 'IDE_NOT_CONFIGURED'
    | 'VALIDATION_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export interface WriteSettingsError {
  readonly code: 'WRITE_SETTINGS_FAILED';
  readonly message: string;
  readonly cause: unknown;
}

async function getPackageVersion(): Promise<string> {
  const packageJsonPath = join(PKG_ROOT, 'package.json');
  const packageJson = await Bun.file(packageJsonPath).json();
  return packageJson.version;
}

function settingsPathFor(projectRoot: string) {
  return join(projectRoot, SETTINGS_FILE);
}

export async function readSettings(
  projectRoot: string,
): Promise<Result<AgenticSettings, ReadSettingsError>> {
  const path = settingsPathFor(projectRoot);

  try {
    const file = Bun.file(path);
    const exists = await file.exists();

    if (!exists) {
      return Err({
        code: 'READ_SETTINGS_FAILED' as const,
        message: `Settings file not found at ${path}`,
      });
    }

    const content = await file.text();

    let parsed: Partial<AgenticSettings>;
    try {
      parsed = JSON.parse(content) as Partial<AgenticSettings>;
    } catch (parseError) {
      return Err({
        code: 'PARSE_FAILED' as const,
        message: `Failed to parse settings at ${path}`,
        cause: parseError,
      });
    }

    const rawNamespace = parsed.namespace;
    if (rawNamespace !== undefined && !isValidNamespace(rawNamespace)) {
      return Err({
        code: 'VALIDATION_FAILED' as const,
        message: `Invalid namespace in ${path}: ${JSON.stringify(rawNamespace)}. Must match ${NAMESPACE_PATTERN.source}.`,
      });
    }

    const skillOverrides = sanitizeSkillOverrides(parsed.skillOverrides, path);
    const selectedProfiles = sanitizeStringList(parsed.selectedProfiles, 'selectedProfiles', path);
    const workflows = sanitizeStringList(parsed.workflows, 'workflows', path);
    const profiles = sanitizeProfiles(parsed.profiles, path);

    const settings: AgenticSettings = {
      namespace: rawNamespace ?? 'agentic',
      version: parsed.version ?? '',
      lastUpdate: parsed.lastUpdate ?? '',
      ...(workflows !== undefined ? { workflows } : {}),
      ...(profiles !== undefined ? { profiles } : {}),
      ...(skillOverrides !== undefined ? { skillOverrides } : {}),
      ...(selectedProfiles !== undefined ? { selectedProfiles } : {}),
      ides: parsed.ides ?? {},
    };
    return Ok(settings);
  } catch (error) {
    return Err({
      code: 'READ_SETTINGS_FAILED' as const,
      message: `Failed to read settings from ${path}`,
      cause: error,
    });
  }
}

export async function readEffectiveSettings(
  projectRoot: string,
  ide: TargetIDE,
): Promise<Result<EffectiveSettings, ReadSettingsError>> {
  const result = await readSettings(projectRoot);
  if (result._type === 'Err') return result;

  const ideSettings = result.data.ides[ide];
  if (!ideSettings) {
    return Err({
      code: 'IDE_NOT_CONFIGURED' as const,
      message: `No settings for IDE "${ide}" in ${settingsPathFor(projectRoot)}`,
    });
  }

  const { ides: _ides, ...shared } = result.data;
  return Ok({ ...shared, ...ideSettings });
}

export async function writeSettings(
  projectRoot: string,
  input: WriteSettingsInput,
): Promise<Result<void, WriteSettingsError>> {
  try {
    const existing = await readSettings(projectRoot);
    const existingIdes =
      existing._type === 'Ok' ? existing.data.ides : ({} as AgenticSettings['ides']);

    const version = await getPackageVersion();
    const lastUpdate = new Date().toISOString();
    const { shared, ide, ideSettings } = input;

    const merged: AgenticSettings = {
      namespace: shared.namespace,
      version,
      lastUpdate,
      ...(shared.workflows !== undefined ? { workflows: shared.workflows } : {}),
      ...(shared.profiles !== undefined ? { profiles: shared.profiles } : {}),
      ...(shared.skillOverrides !== undefined && Object.keys(shared.skillOverrides).length > 0
        ? { skillOverrides: shared.skillOverrides }
        : {}),
      ...(shared.selectedProfiles !== undefined && shared.selectedProfiles.length > 0
        ? { selectedProfiles: shared.selectedProfiles }
        : {}),
      ides: {
        ...existingIdes,
        [ide]: ideSettings,
      },
    };

    await Bun.write(settingsPathFor(projectRoot), `${JSON.stringify(merged, null, 2)}\n`);

    return Ok(undefined);
  } catch (error) {
    return Err({
      code: 'WRITE_SETTINGS_FAILED' as const,
      message: `Failed to write settings to ${settingsPathFor(projectRoot)}`,
      cause: error,
    });
  }
}
