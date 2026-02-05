import { AGENTS } from '../constants';

export function list() {
  console.log('\nAgents:');
  for (const agent of AGENTS) {
    console.log(`  - ${agent}`);
  }

  console.log('\nSkills with scripts:');
}
