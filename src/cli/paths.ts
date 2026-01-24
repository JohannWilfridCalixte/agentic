import { dirname, join, resolve } from 'node:path';

export const PKG_ROOT = resolve(dirname(import.meta.path), '../..');
export const SRC_DIR = join(PKG_ROOT, 'src');
export const AGENTS_DIR = join(SRC_DIR, 'agents');
export const SUBAGENTS_DIR = join(SRC_DIR, 'subagents');
export const SCRIPTS_DIR = join(SRC_DIR, 'scripts');
export const SKILLS_DIR = join(SRC_DIR, 'skills');
export const COMMANDS_DIR = join(SRC_DIR, 'commands');
export const WORKFLOWS_DIR = join(SRC_DIR, 'workflows');
export const TEMPLATES_DIR = join(SRC_DIR, 'templates');
