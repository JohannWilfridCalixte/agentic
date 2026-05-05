import type { Result } from '../../lib/monads';
import { Err, isErr, isOk, Ok } from '../../lib/monads';
import { readEffectiveSettings } from '../settings';
import type { TargetIDE } from './init';
import { detectIdes } from './update';

interface VersionError {
  readonly code: 'DETECT_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

const IDE_DISPLAY_NAMES: Record<TargetIDE, string> = {
  claude: 'Claude Code',
  cursor: 'Cursor',
  codex: 'Codex',
};

interface IdeEntry {
  readonly ide: TargetIDE;
  readonly version: string;
  readonly installedDate: string;
  readonly outputFolder: string;
  readonly highThinkingModelName: string;
  readonly codeWritingModelName: string;
  readonly qaModelName: string;
}

function formatDate(isoString: string) {
  return isoString.split('T')[0];
}

function dedupKey(entry: IdeEntry) {
  return JSON.stringify({
    outputFolder: entry.outputFolder,
    highThinkingModelName: entry.highThinkingModelName,
    codeWritingModelName: entry.codeWritingModelName,
    qaModelName: entry.qaModelName,
  });
}

export async function version(): Promise<Result<void, VersionError>> {
  const projectRoot = process.cwd();

  let detectedIdes: readonly TargetIDE[];

  try {
    detectedIdes = await detectIdes(projectRoot);
  } catch (error) {
    return Err({
      code: 'DETECT_FAILED' as const,
      message: 'Failed to detect IDE setups',
      cause: error,
    });
  }

  if (detectedIdes.length === 0) {
    console.log('No IDE setup detected. Run `agentic init` to get started.');
    return Ok(undefined);
  }

  const entries: IdeEntry[] = [];
  const missing: TargetIDE[] = [];

  for (const ide of detectedIdes) {
    const result = await readEffectiveSettings(projectRoot, ide);
    if (isErr(result)) {
      missing.push(ide);
      continue;
    }
    if (isOk(result)) {
      entries.push({
        ide,
        version: result.data.version,
        installedDate: formatDate(result.data.lastUpdate),
        outputFolder: result.data.outputFolder,
        highThinkingModelName: result.data.highThinkingModelName,
        codeWritingModelName: result.data.codeWritingModelName,
        qaModelName: result.data.qaModelName,
      });
    }
  }

  const groups = new Map<string, IdeEntry[]>();
  for (const entry of entries) {
    const key = dedupKey(entry);
    const existing = groups.get(key) ?? [];
    existing.push(entry);
    groups.set(key, existing);
  }

  for (const group of groups.values()) {
    if (group.length === 1) {
      const [entry] = group;
      if (!entry) continue;
      console.log(
        `${IDE_DISPLAY_NAMES[entry.ide]}: ${entry.version} (installed ${entry.installedDate})`,
      );
      continue;
    }
    const head = group[0];
    if (!head) continue;
    const names = group.map((entry) => IDE_DISPLAY_NAMES[entry.ide]).join(', ');
    console.log(
      `${names}: ${head.version} (installed ${head.installedDate}) → ${head.outputFolder}/`,
    );
  }

  for (const ide of missing) {
    console.log(`${IDE_DISPLAY_NAMES[ide]}: settings not found`);
  }

  return Ok(undefined);
}
