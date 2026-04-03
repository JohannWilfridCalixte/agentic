import type { TargetIDE } from './commands/init/types';
import { NAMESPACE_PATTERN } from './constants';
import { KNOWN_WORKFLOWS } from './dependencies';
import { LANGUAGE_PROFILES } from './profiles';

export interface PromptDefaults {
  readonly ides?: readonly TargetIDE[];
  readonly namespace?: string;
  readonly workflows?: readonly string[];
  readonly profiles?: readonly string[];
}

interface IdeChoice {
  readonly value: TargetIDE;
  readonly label: string;
}

interface WorkflowChoice {
  readonly value: string;
  readonly label: string;
  readonly hint?: string;
}

interface ProfileChoice {
  readonly value: string;
  readonly label: string;
}

function toTitleCase(kebab: string) {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function buildIdeChoices(): readonly IdeChoice[] {
  return [
    { value: 'claude', label: 'Claude Code' },
    { value: 'cursor', label: 'Cursor' },
    { value: 'codex', label: 'Codex' },
  ] as const;
}

export function buildWorkflowChoices(): readonly WorkflowChoice[] {
  return KNOWN_WORKFLOWS.map((name) => ({
    value: name,
    label: toTitleCase(name),
  }));
}

export function buildProfileChoices(): readonly ProfileChoice[] {
  return LANGUAGE_PROFILES.map((profile) => ({
    value: profile.name,
    label: toTitleCase(profile.name),
  }));
}

export function getIdeDefaults(current?: readonly TargetIDE[]): readonly TargetIDE[] {
  return current ?? [];
}

export function getNamespaceDefault(current?: string) {
  return current ?? 'agentic';
}

export function getWorkflowDefaults(current?: readonly string[]) {
  return current ?? [];
}

export function getProfileDefaults(current?: readonly string[]) {
  return current ?? [];
}

export function validateNamespaceInput(value: string | undefined): string | undefined {
  if (!value || value.trim().length === 0) return 'Namespace cannot be empty.';
  if (!NAMESPACE_PATTERN.test(value)) {
    return 'Must be lowercase letters, digits, hyphens; start with letter; 2-30 chars.';
  }
  return undefined;
}
