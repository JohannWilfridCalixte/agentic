import { join } from 'node:path';
import { Err, Ok } from '../../../../lib/monads';
import { TEMPLATES_DIR } from '../../../paths';
import { processTemplate } from '../../../utils';
import type { IdeSetupStrategy, StrategySetupOptions } from '../types';

export const cursorStrategy: IdeSetupStrategy = {
  ide: 'cursor',
  setup: async (projectRoot, options?: StrategySetupOptions) => {
    const agentsMdPath = join(projectRoot, 'AGENTS.md');
    const backupPath = join(projectRoot, 'AGENTS.backup.md');
    const templatePath = join(TEMPLATES_DIR, 'agents.md.template');
    const mode = options?.mode ?? 'init';

    try {
      const template = await Bun.file(templatePath).text();
      const processed = processTemplate(template, 'cursor', { outputFolder: '' });
      const agentsMdFile = Bun.file(agentsMdPath);

      if (!(await agentsMdFile.exists())) {
        await Bun.write(agentsMdPath, processed);
        console.log('  Created AGENTS.md');
        return Ok(undefined);
      }

      const existing = await agentsMdFile.text();

      if (mode === 'update') {
        await Bun.write(backupPath, existing);
        console.log('  Backed up AGENTS.md → AGENTS.backup.md');

        const agenticIndex = existing.indexOf('# Agentic Framework');
        if (agenticIndex !== -1) {
          const before = existing.substring(0, agenticIndex).trimEnd();
          await Bun.write(agentsMdPath, before ? `${before}\n\n${processed}` : processed);
        } else {
          await Bun.write(agentsMdPath, `${existing}\n\n${processed}`);
        }
        console.log('  Updated AGENTS.md');
      } else {
        if (existing.includes('# Agentic Framework')) {
          console.log('  AGENTS.md already has agentic section, skipping');
          return Ok(undefined);
        }
        await Bun.write(agentsMdPath, `${existing}\n\n${processed}`);
        console.log('  Appended to AGENTS.md');
      }

      return Ok(undefined);
    } catch (error) {
      return Err({
        code: 'WRITE_FILE_FAILED' as const,
        message: 'Failed to setup AGENTS.md',
        cause: error,
      });
    }
  },
};
