import { cancel, intro, isCancel, multiselect, text } from '@clack/prompts';

import type { TargetIDE } from './commands/init/types';
import type { PromptDefaults } from './prompt-helpers';
import {
  buildIdeChoices,
  buildProfileChoices,
  buildWorkflowChoices,
  getIdeDefaults,
  getNamespaceDefault,
  getProfileDefaults,
  getWorkflowDefaults,
  validateNamespaceInput,
} from './prompt-helpers';

export interface InteractiveResult {
  readonly ides: readonly TargetIDE[];
  readonly namespace: string;
  readonly workflows: string[] | undefined;
  readonly profiles: string[] | undefined;
}

export function handleCancel<T>(value: T | symbol): asserts value is T {
  if (isCancel(value)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }
}

export async function collectInteractiveOptions(defaults?: PromptDefaults) {
  intro('agentic setup');

  const ideChoices = buildIdeChoices();
  const ideDefaults = getIdeDefaults(defaults?.ides);
  const ideResult = await multiselect({
    message: 'Select target IDEs (Enter with none selected = all IDEs)',
    options: ideChoices.map((c) => ({ value: c.value, label: c.label })),
    initialValues: [...ideDefaults],
    required: false,
  });
  handleCancel(ideResult);

  const namespaceResult = await text({
    message: 'Enter your namespace',
    placeholder: getNamespaceDefault(defaults?.namespace),
    defaultValue: getNamespaceDefault(defaults?.namespace),
    validate: validateNamespaceInput,
  });
  handleCancel(namespaceResult);

  const workflowChoices = buildWorkflowChoices();
  const workflowDefaults = getWorkflowDefaults(defaults?.workflows);
  const workflowResult = await multiselect({
    message: 'Select workflows (Enter with none selected = install all)',
    options: workflowChoices.map((c) => ({
      value: c.value,
      label: c.label,
      hint: c.hint,
    })),
    initialValues: [...workflowDefaults],
    required: false,
  });
  handleCancel(workflowResult);

  const profileChoices = buildProfileChoices();
  const profileDefaults = getProfileDefaults(defaults?.profiles);
  const profileResult = await multiselect({
    message: 'Select language profiles (Enter with none selected = all profiles)',
    options: profileChoices.map((c) => ({
      value: c.value,
      label: c.label,
    })),
    initialValues: [...profileDefaults],
    required: false,
  });
  handleCancel(profileResult);

  return {
    ides: ideResult,
    namespace: namespaceResult,
    workflows: workflowResult.length > 0 ? workflowResult : undefined,
    profiles: profileResult.length > 0 ? profileResult : undefined,
  } satisfies InteractiveResult;
}
