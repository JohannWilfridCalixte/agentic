import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Err, Ok } from '../../../../lib/monads';
import { TEMPLATES_DIR } from '../../../paths';
import type { IdeSetupStrategy } from '../types';

export const cursorStrategy: IdeSetupStrategy = {
  ide: 'cursor',
  setup: async (projectRoot) => {
    const cursorDir = join(projectRoot, '.cursor', 'rules');
    const rulesPath = join(cursorDir, 'agentic.mdc');
    const templatePath = join(TEMPLATES_DIR, 'cursor-rules.template');

    try {
      if (!existsSync(cursorDir)) {
        mkdirSync(cursorDir, { recursive: true });
      }

      const template = await Bun.file(templatePath).text();
      await Bun.write(rulesPath, template);
      console.log('  Created .cursor/rules/agentic.mdc');

      return Ok(undefined);
    } catch (error) {
      return Err({
        code: 'WRITE_FILE_FAILED' as const,
        message: 'Failed to setup cursor rules',
        cause: error,
      });
    }
  },
};
