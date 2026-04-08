import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { LanguageProfile } from './profiles';
import { collectAllProfileSkills } from './profiles';
import { addNamePrefix } from './utils';

type WorkflowName =
  | 'product-spec'
  | 'product-vision'
  | 'ask-codebase'
  | 'technical-planning'
  | 'implement'
  | 'debug'
  | 'frontend-development'
  | 'auto-implement'
  | 'pr-review'
  | 'create-workflow';

interface WorkflowDependencies {
  readonly agents: readonly string[];
  readonly skills: readonly string[];
  readonly argumentHint?: string;
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
    argumentHint: '[--auto] [input]',
  },
  'product-vision': {
    agents: ['cpo'],
    skills: ['product-vision', 'product-discovery', 'brainstorming'],
    argumentHint: '[input]',
  },
  'ask-codebase': {
    agents: ['architect'],
    skills: ['gather-technical-context', 'skill-injection-protocol', 'context7'],
    argumentHint: '[input]',
  },
  'technical-planning': {
    agents: ['architect'],
    skills: [
      'gather-technical-context',
      'technical-planning',
      'skill-injection-protocol',
      'code',
      'clean-architecture',
      'observability',
      'code-testing',
      'dx',
      'ux-patterns',
      'context7',
    ],
    argumentHint: '[input]',
  },
  implement: {
    agents: ['software-engineer', 'test-engineer', 'qa', 'test-qa', 'security-qa'],
    skills: [
      'skill-injection-protocol',
      'code',
      'frontend-design',
      'clean-architecture',
      'observability',
      'code-testing',
      'dx',
      'ux-patterns',
      'context7',
      'qa',
      'security-qa',
    ],
    argumentHint: '<technical-plan>',
  },
  debug: {
    agents: ['investigator', 'analyst', 'test-engineer', 'software-engineer', 'qa', 'test-qa'],
    skills: [
      'skill-injection-protocol',
      'code',
      'clean-architecture',
      'observability',
      'code-testing',
      'dx',
      'ux-patterns',
      'context7',
      'qa',
      'frontend-design',
    ],
    argumentHint: '[input]',
  },
  'frontend-development': {
    agents: ['ui-ux-designer', 'frontend-developer', 'qa'],
    skills: [
      'skill-injection-protocol',
      'frontend-design',
      'ux-patterns',
      'refactoring-ui',
      'code',
      'clean-architecture',
      'observability',
      'dx',
      'context7',
      'qa',
    ],
    argumentHint: '[input]',
  },
  'auto-implement': {
    agents: [
      'architect',
      'pm',
      'software-engineer',
      'test-engineer',
      'qa',
      'test-qa',
      'security-qa',
    ],
    skills: [
      'gather-technical-context',
      'skill-injection-protocol',
      'context7',
      'product-manager',
      'technical-planning',
      'code',
      'frontend-design',
      'clean-architecture',
      'observability',
      'code-testing',
      'dx',
      'ux-patterns',
      'qa',
      'security-qa',
    ],
    argumentHint: '[input]',
  },
  'pr-review': {
    agents: ['architect', 'qa', 'test-qa', 'security-qa'],
    skills: [
      'gather-technical-context',
      'skill-injection-protocol',
      'context7',
      'code',
      'clean-architecture',
      'observability',
      'code-testing',
      'dx',
      'ux-patterns',
      'qa',
      'security-qa',
    ],
    argumentHint: '<PR number | PR URL>',
  },
  'create-workflow': {
    agents: [],
    skills: [],
    argumentHint: '<workflow description or idea>',
  },
};

export const KNOWN_WORKFLOWS = Object.keys(WORKFLOW_DEPENDENCY_MAP) as readonly WorkflowName[];

export function getWorkflowUsageLines(
  namespace: string,
  workflows?: readonly string[],
): readonly string[] {
  const names = workflows ?? KNOWN_WORKFLOWS;
  return names.map((name) => {
    const deps = WORKFLOW_DEPENDENCY_MAP[name as WorkflowName];
    const hint = deps?.argumentHint ?? '[input]';
    return `  /${namespace}:workflow:${name} ${hint}`;
  });
}

export function resolveWorkflowDependencies(
  workflows: readonly string[],
  profiles?: readonly LanguageProfile[],
  selectedProfiles?: readonly string[],
) {
  const agents = new Set<string>();
  const skills = new Set<string>();

  for (const workflow of workflows) {
    const deps = WORKFLOW_DEPENDENCY_MAP[workflow as WorkflowName];
    if (!deps) continue;
    for (const agent of deps.agents) agents.add(agent);
    for (const skill of deps.skills) skills.add(skill);
  }

  if (profiles) {
    const profileSkills = collectAllProfileSkills(profiles, selectedProfiles);
    for (const skill of profileSkills) skills.add(skill);
  }

  return {
    agents: [...agents].map((a) => `${a}.md`),
    skills: [...skills],
    workflows: [...workflows],
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
  newDeps: ResolvedDependencies,
  namespace: string,
) {
  const agentsDir = join(ideDir, 'agents');
  const skillsDir = join(ideDir, 'skills');

  const agentPrefix = `${namespace}-agent-`;
  const skillPrefix = `${namespace}-skill-`;
  const workflowPrefix = `${namespace}-workflow-`;

  const newAgentSet = new Set(newDeps.agents.map((a) => addNamePrefix(a, 'agent', namespace)));
  const newSkillSet = new Set(newDeps.skills.map((s) => addNamePrefix(s, 'skill', namespace)));
  const newWorkflowSet = new Set(
    newDeps.workflows.map((w) => addNamePrefix(w, 'workflow', namespace)),
  );

  const agentEntries = await readdir(agentsDir).catch(() => [] as string[]);
  for (const entry of agentEntries) {
    if (entry.startsWith(agentPrefix) && !newAgentSet.has(entry)) {
      await rm(join(agentsDir, entry), { force: true });
    }
  }

  const skillEntries = await readdir(skillsDir).catch(() => [] as string[]);
  for (const entry of skillEntries) {
    if (entry.startsWith(skillPrefix) && !newSkillSet.has(entry)) {
      await rm(join(skillsDir, entry), { recursive: true, force: true });
    } else if (entry.startsWith(workflowPrefix) && !newWorkflowSet.has(entry)) {
      await rm(join(skillsDir, entry), { recursive: true, force: true });
    }
  }
}
