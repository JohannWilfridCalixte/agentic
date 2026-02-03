import { join } from 'node:path';
import { Err, Ok } from '../../../../lib/monads';
import { TEMPLATES_DIR } from '../../../paths';
import { processTemplate } from '../../../utils';
import type { IdeSetupStrategy } from '../types';

export const claudeStrategy: IdeSetupStrategy = {
  ide: 'claude',
  setup: async (projectRoot) => {
    const claudeMdPath = join(projectRoot, 'CLAUDE.md');
    const templatePath = join(TEMPLATES_DIR, 'agents.md.template');

    try {
      const template = await Bun.file(templatePath).text();
      const processed = processTemplate(template, 'claude', { outputFolder: '' });
      const claudeMdFile = Bun.file(claudeMdPath);

      if (await claudeMdFile.exists()) {
        const existing = await claudeMdFile.text();

        if (existing.includes('# Agentic Framework')) {
          console.log('  CLAUDE.md already has agentic section, skipping');
          return Ok(undefined);
        }

        await Bun.write(claudeMdPath, `${existing}\n\n${processed}`);
        console.log('  Appended to CLAUDE.md');
      } else {
        await Bun.write(claudeMdPath, processed);
        console.log('  Created CLAUDE.md');
      }

      return Ok(undefined);
    } catch (error) {
      return Err({
        code: 'WRITE_FILE_FAILED' as const,
        message: 'Failed to setup CLAUDE.md',
        cause: error,
      });
    }
  },
};
