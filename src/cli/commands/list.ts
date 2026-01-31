import { AGENTS } from '../constants';

export function list() {
  console.log('\nAgents:');
  for (const agent of AGENTS) {
    console.log(`  - ${agent}`);
  }

  console.log('\nSkills with scripts:');
  console.log('  - github (sync-to-github.sh, sync-from-github.sh, sync-all.sh, create-pr.sh, resolve-parent.sh)');
}
