export interface LanguageProfile {
  readonly name: string;
  readonly detect: readonly string[];
  readonly extends?: string;
  readonly skills: readonly string[];
}

export const LANGUAGE_PROFILES: readonly LanguageProfile[] = [
  {
    name: 'typescript',
    detect: ['typescript', 'ts', 'node', 'bun', 'deno'],
    skills: ['typescript-engineer', 'typescript-imports'],
  },
  {
    name: 'python',
    detect: ['python', 'py', 'pip', 'uv', 'poetry', 'conda'],
    skills: ['python-engineer'],
  },
] as const satisfies readonly LanguageProfile[];

const REMOVE_SENTINEL = '_remove_';

export function mergeProfiles(
  bundled: readonly LanguageProfile[],
  userProfiles: readonly LanguageProfile[],
  skillOverrides: Record<string, string>,
) {
  const merged = new Map<string, LanguageProfile>();

  for (const profile of bundled) {
    merged.set(profile.name, profile);
  }

  for (const profile of userProfiles) {
    merged.set(profile.name, profile);
  }

  if (Object.keys(skillOverrides).length === 0) {
    return [...merged.values()];
  }

  const result: LanguageProfile[] = [];

  for (const profile of merged.values()) {
    const skills = [...profile.skills];

    for (const [originalSkill, replacement] of Object.entries(skillOverrides)) {
      const index = skills.indexOf(originalSkill);
      if (index === -1) continue;

      if (replacement === REMOVE_SENTINEL) {
        skills.splice(index, 1);
      } else {
        skills[index] = replacement;
      }
    }

    result.push({ ...profile, skills });
  }

  return result;
}

export function collectAllProfileSkills(
  profiles: readonly LanguageProfile[],
  selectedProfiles?: readonly string[],
) {
  const profileMap = new Map<string, LanguageProfile>();

  for (const profile of profiles) {
    profileMap.set(profile.name, profile);
  }

  const relevant = selectedProfiles
    ? profiles.filter((p) => selectedProfiles.includes(p.name))
    : profiles;

  const skills = new Set<string>();

  for (const profile of relevant) {
    if (profile.extends) {
      const parent = profileMap.get(profile.extends);
      if (parent) {
        for (const skill of parent.skills) skills.add(skill);
      }
    }

    for (const skill of profile.skills) skills.add(skill);
  }

  return [...skills];
}
