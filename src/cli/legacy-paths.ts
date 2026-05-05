import type { TargetIDE } from './commands/init/types';

interface LegacyIdeSource {
  readonly ide: TargetIDE;
  readonly relativePath: string;
}

/**
 * Canonical probe order for legacy per-IDE `.agentic.settings.json` files.
 *
 * Ordering is [cursor, codex, claude] — iterating forward yields
 * last-write-wins = claude wins when shared fields diverge across legacy
 * files (plan §9 gotcha #4: "claude > codex > cursor"). Both the migration
 * module and the legacy detection fallback share this constant to avoid
 * drift.
 */
export const LEGACY_IDE_SOURCES: readonly LegacyIdeSource[] = [
  { ide: 'cursor', relativePath: '.cursor/.agentic.settings.json' },
  { ide: 'codex', relativePath: '.agents/.agentic.settings.json' },
  { ide: 'claude', relativePath: '.claude/.agentic.settings.json' },
] as const;
