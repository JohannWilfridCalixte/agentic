import { dirname, join, resolve } from 'node:path';

export const PKG_ROOT = resolve(dirname(import.meta.path), '../..');
export const SRC_DIR = join(PKG_ROOT, 'src');
export const AGENTIC_DIR = join(SRC_DIR, 'agentic');

export const AGENTS_DIR = join(AGENTIC_DIR, 'agents');
export const SKILLS_DIR = join(AGENTIC_DIR, 'skills');
export const SUBAGENTS_DIR = join(AGENTIC_DIR, 'subagents');
export const TEMPLATES_DIR = join(AGENTIC_DIR, 'templates');
