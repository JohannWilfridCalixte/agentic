import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import { rewriteNamespace } from './utils';

type WorkflowName = 'product-spec' | 'technical-planning' | 'auto-implement'
  | 'implement' | 'quick-spec-and-implement' | 'debug' | 'frontend-development';

interface WorkflowDependencies {
  readonly agents: readonly string[];
  readonly skills: readonly string[];
}

export interface ResolvedDependencies {
  readonly agents: readonly string[];
  readonly skills: readonly string[];
  readonly workflows: readonly string[];
}

const WORKFLOW_DEPENDENCY_MAP: Record<WorkflowName, WorkflowDependencies> = {
  'product-spec': {
    agents: [],
    skills: ['product-discovery', 'brainstorming'],
  },
  'technical-planning': {
    agents: ['architect'],
    skills: ['gather-technical-context', 'technical-planning', 'code', 'typescript-engineer',
      'typescript-imports', 'clean-architecture', 'observability', 'code-testing',
      'dx', 'ux-patterns', 'context7'],
  },
  'auto-implement': {
    agents: ['architect', 'editor', 'test-engineer', 'qa', 'test-qa', 'security-qa'],
    skills: ['gather-technical-context', 'technical-planning', 'code', 'frontend-design',
      'typescript-engineer', 'typescript-imports', 'clean-architecture', 'observability',
      'code-testing', 'dx', 'ux-patterns', 'context7', 'qa', 'security-qa'],
  },
  'implement': {
    agents: ['editor', 'test-engineer', 'qa', 'test-qa', 'security-qa'],
    skills: ['code', 'frontend-design', 'typescript-engineer', 'typescript-imports',
      'clean-architecture', 'observability', 'code-testing', 'dx', 'ux-patterns',
      'context7', 'qa', 'security-qa'],
  },
  'quick-spec-and-implement': {
    agents: ['pm', 'architect', 'security', 'editor', 'test-engineer', 'qa', 'test-qa', 'security-qa'],
    skills: ['product-manager', 'gather-technical-context', 'technical-planning', 'code',
      'frontend-design', 'typescript-engineer', 'typescript-imports', 'clean-architecture',
      'observability', 'code-testing', 'dx', 'ux-patterns', 'context7', 'qa',
      'security-qa', 'security-context'],
  },
  'debug': {
    agents: ['investigator', 'analyst', 'test-engineer', 'editor', 'qa', 'test-qa'],
    skills: ['code', 'typescript-engineer', 'typescript-imports', 'clean-architecture',
      'observability', 'code-testing', 'dx', 'ux-patterns', 'context7', 'qa',
      'frontend-design'],
  },
  'frontend-development': {
    agents: ['ui-ux-designer', 'frontend-developer', 'qa'],
    skills: ['frontend-design', 'ux-patterns', 'refactoring-ui', 'code', 'typescript-engineer',
      'typescript-imports', 'clean-architecture', 'observability', 'dx', 'context7', 'qa'],
  },
};

export const KNOWN_WORKFLOWS = Object.keys(WORKFLOW_DEPENDENCY_MAP) as readonly WorkflowName[];

export function resolveWorkflowDependencies(workflows: readonly string[]) {
  const agents = new Set<string>();
  const skills = new Set<string>();

  for (const workflow of workflows) {
    const deps = WORKFLOW_DEPENDENCY_MAP[workflow as WorkflowName];
    if (!deps) continue;
    for (const agent of deps.agents) agents.add(agent);
    for (const skill of deps.skills) skills.add(skill);
  }

  return {
    agents: [...agents].map(a => `agentic-agent-${a}.md`),
    skills: [...skills].map(s => `agentic-skill-${s}`),
    workflows: workflows.map(w => `agentic-workflow-${w}`),
  } satisfies ResolvedDependencies;
}

interface WorkflowValidationError {
  readonly code: 'ALL_WORKFLOWS_UNKNOWN';
  readonly message: string;
  readonly unknownWorkflows: readonly string[];
}

export function validateWorkflows(
  workflows: readonly string[],
): Result<readonly string[], WorkflowValidationError> {
  const known: string[] = [];
  const unknown: string[] = [];

  for (const w of workflows) {
    if (w in WORKFLOW_DEPENDENCY_MAP) known.push(w);
    else unknown.push(w);
  }

  if (known.length === 0) {
    return Err({
      code: 'ALL_WORKFLOWS_UNKNOWN' as const,
      message: `Unknown workflows: ${unknown.join(', ')}. Available: ${KNOWN_WORKFLOWS.join(', ')}`,
      unknownWorkflows: unknown,
    });
  }

  if (unknown.length > 0) {
    console.warn(`Warning: unknown workflows skipped: ${unknown.join(', ')}`);
  }

  return Ok(known);
}

export async function cleanupStaleFiles(
  ideDir: string,
  oldDeps: ResolvedDependencies,
  newDeps: ResolvedDependencies,
  namespace: string,
) {
  const agentsDir = join(ideDir, 'agents');
  const skillsDir = join(ideDir, 'skills');

  const oldAgentSet = new Set(oldDeps.agents.map(a => rewriteNamespace(a, namespace)));
  const newAgentSet = new Set(newDeps.agents.map(a => rewriteNamespace(a, namespace)));

  for (const agent of oldAgentSet) {
    if (!newAgentSet.has(agent)) {
      await rm(join(agentsDir, agent), { force: true });
    }
  }

  const oldDirSet = new Set([
    ...oldDeps.skills.map(s => rewriteNamespace(s, namespace)),
    ...oldDeps.workflows.map(w => rewriteNamespace(w, namespace)),
  ]);
  const newDirSet = new Set([
    ...newDeps.skills.map(s => rewriteNamespace(s, namespace)),
    ...newDeps.workflows.map(w => rewriteNamespace(w, namespace)),
  ]);

  for (const dir of oldDirSet) {
    if (!newDirSet.has(dir)) {
      await rm(join(skillsDir, dir), { recursive: true, force: true });
    }
  }
}
