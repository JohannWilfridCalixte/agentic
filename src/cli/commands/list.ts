import { AGENTS, SCRIPTS } from '../constants';

export function list() {
  console.log('\nAgents:');
  for (const agent of AGENTS) {
    console.log(`  - ${agent}`);
  }

  console.log('\nScripts:');
  for (const script of SCRIPTS) {
    console.log(`  - ${script}`);
  }
}
