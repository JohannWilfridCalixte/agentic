import { join } from 'node:path';
import { Err, Ok } from '../../../../lib/monads';
import { TEMPLATES_DIR } from '../../../paths';
import { processTemplate } from '../../../utils';
import type { IdeSetupStrategy } from '../types';

export const cursorStrategy: IdeSetupStrategy = {
  ide: 'cursor',
  setup: async (projectRoot) => {
    const agentsMdPath = join(projectRoot, 'AGENTS.md');
    const templatePath = join(TEMPLATES_DIR, 'agents.md.template');

    try {
      const template = await Bun.file(templatePath).text();
      const processed = processTemplate(template, 'cursor', { outputFolder: '' });
      const agentsMdFile = Bun.file(agentsMdPath);

      if (await agentsMdFile.exists()) {
        const existing = await agentsMdFile.text();

        if (existing.includes('# Agentic Framework')) {
          console.log('  AGENTS.md already has agentic section, skipping');
          return Ok(undefined);
        }

        await Bun.write(agentsMdPath, `${existing}\n\n${processed}`);
        console.log('  Appended to AGENTS.md');
      } else {
        await Bun.write(agentsMdPath, processed);
        console.log('  Created AGENTS.md');
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
