import { join } from 'node:path';

import { Err, Ok } from '../../../../lib/monads';
import { TEMPLATES_DIR } from '../../../paths';
import { processTemplate, stripUninstalledRows } from '../../../utils';
import type { IdeSetupStrategy, StrategySetupOptions } from '../types';

function getSectionMarker(namespace: string) {
  const capitalized = namespace.charAt(0).toUpperCase() + namespace.slice(1);
  return `# ${capitalized} Framework`;
}

export const claudeStrategy: IdeSetupStrategy = {
  ide: 'claude',
  setup: async (projectRoot, options?: StrategySetupOptions) => {
    const claudeMdPath = join(projectRoot, 'CLAUDE.md');
    const backupPath = join(projectRoot, 'CLAUDE.backup.md');
    const templatePath = join(TEMPLATES_DIR, 'agents.md.template');
    const mode = options?.mode ?? 'init';
    const namespace = options?.namespace ?? 'agentic';
    const sectionMarker = getSectionMarker(namespace);

    try {
      const template = await Bun.file(templatePath).text();
      let processed = processTemplate(template, 'claude', {
        namespace,
        outputFolder: '',
        highThinkingModelName: '',
        codeWritingModelName: '',
        qaModelName: '',
      });
      if (options?.resolvedDeps) {
        processed = stripUninstalledRows(processed, options.resolvedDeps, namespace);
      }
      const claudeMdFile = Bun.file(claudeMdPath);

      if (!(await claudeMdFile.exists())) {
        await Bun.write(claudeMdPath, processed);
        console.log('  Created CLAUDE.md');
        return Ok(undefined);
      }

      const existing = await claudeMdFile.text();

      if (mode === 'update') {
        await Bun.write(backupPath, existing);
        console.log('  Backed up CLAUDE.md → CLAUDE.backup.md');

        const markerIndex = existing.indexOf(sectionMarker);
        if (markerIndex !== -1) {
          const before = existing.substring(0, markerIndex).trimEnd();
          await Bun.write(claudeMdPath, before ? `${before}\n\n${processed}` : processed);
        } else {
          await Bun.write(claudeMdPath, `${existing}\n\n${processed}`);
        }
        console.log('  Updated CLAUDE.md');
      } else {
        if (existing.includes(sectionMarker)) {
          console.log(`  CLAUDE.md already has ${namespace} section, skipping`);
          return Ok(undefined);
        }
        await Bun.write(claudeMdPath, `${existing}\n\n${processed}`);
        console.log('  Appended to CLAUDE.md');
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
