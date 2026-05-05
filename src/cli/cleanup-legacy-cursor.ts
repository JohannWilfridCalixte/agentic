import { readdir, rm, rmdir, stat } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

import type { Result } from '../lib/monads';
import { Err, Ok } from '../lib/monads';
import type { ResolvedDependencies } from './dependencies';

const LEGACY_CURSOR_DIR = '.cursor';
const LEGACY_SETTINGS_FILE = '.agentic.settings.json';
const MANAGED_SUBDIRS = ['agents', 'skills', 'workflows'] as const;

export interface CleanupLegacyCursorError {
  readonly code: 'CLEANUP_FAILED';
  readonly message: string;
  readonly cause?: unknown;
}

export interface CleanupResult {
  readonly filesRemoved: readonly string[];
  readonly dirsRemoved: readonly string[];
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function isDirEmpty(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    return entries.length === 0;
  } catch {
    return false;
  }
}

// Containment check: the resolved absolute path must be strictly inside `rootDir`.
// Rejects traversal payloads (`..`, absolute paths) that would escape the root.
function isContained(absolutePath: string, rootDir: string): boolean {
  const resolvedPath = resolve(absolutePath);
  const resolvedRoot = resolve(rootDir);
  return resolvedPath.startsWith(`${resolvedRoot}${sep}`);
}

// Strict pattern for managed-entity segments under `.cursor/{agents,skills,workflows}`.
// Matches: `<namespace>-(agent|skill|workflow)-<name>[.ext]` where name is
// lowercase alnum + `.`, `_`, `-` (no `/`, no `..`, no leading `.`).
function makeManagedPattern(namespace: string): RegExp {
  const escapedNs = namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedNs}-(?:agent|skill|workflow)-[a-z0-9][a-z0-9._-]*$`);
}

async function removeEntry(
  absolutePath: string,
  dir: boolean,
  filesRemoved: string[],
  dirsRemoved: string[],
  relativeLabel: string,
): Promise<void> {
  if (dir) {
    await rm(absolutePath, { recursive: true, force: true });
    dirsRemoved.push(relativeLabel);
  } else {
    await rm(absolutePath, { force: true });
    filesRemoved.push(relativeLabel);
  }
  console.log(`Removed legacy ${relativeLabel}`);
}

/**
 * Surgically prunes managed agentic content from legacy `.cursor/`.
 *
 * Strategy: prefix-scan. For each subdir `.cursor/{agents,skills,workflows}`,
 * enumerate children and remove entries matching
 * `<namespace>-(agent|skill|workflow)-<name>`. Decouples cleanup from the
 * caller's `ResolvedDependencies` catalog (which only covers the workflow
 * slice of managed content in `-w` mode).
 *
 * `managed` is accepted for signature stability but ignored; the legacy
 * prefix-scan is authoritative.
 *
 * Defense-in-depth: every path fed to `rm` is validated to resolve inside
 * `.cursor/` before removal. Traversal payloads are rejected with a warning.
 */
export async function cleanupLegacyCursorDir(
  projectRoot: string,
  _managed: ResolvedDependencies,
  namespace: string,
): Promise<Result<CleanupResult, CleanupLegacyCursorError>> {
  try {
    const cursorDir = join(projectRoot, LEGACY_CURSOR_DIR);
    if (!(await pathExists(cursorDir))) {
      return Ok({ filesRemoved: [], dirsRemoved: [] });
    }

    const filesRemoved: string[] = [];
    const dirsRemoved: string[] = [];
    const managedPattern = makeManagedPattern(namespace);

    for (const subdir of MANAGED_SUBDIRS) {
      const absoluteSubdir = join(cursorDir, subdir);
      if (!(await isDirectory(absoluteSubdir))) continue;

      let entries: string[];
      try {
        entries = await readdir(absoluteSubdir);
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (!managedPattern.test(entry)) continue;

        const absolutePath = join(absoluteSubdir, entry);
        if (!isContained(absolutePath, cursorDir)) {
          console.warn(`Skipping unsafe legacy path outside ${LEGACY_CURSOR_DIR}/: ${entry}`);
          continue;
        }

        await removeEntry(
          absolutePath,
          await isDirectory(absolutePath),
          filesRemoved,
          dirsRemoved,
          `${LEGACY_CURSOR_DIR}/${subdir}/${entry}`,
        );
      }
    }

    const legacySettingsPath = join(cursorDir, LEGACY_SETTINGS_FILE);
    if ((await pathExists(legacySettingsPath)) && isContained(legacySettingsPath, cursorDir)) {
      await rm(legacySettingsPath, { force: true });
      filesRemoved.push(`${LEGACY_CURSOR_DIR}/${LEGACY_SETTINGS_FILE}`);
      console.log(`Removed legacy ${LEGACY_CURSOR_DIR}/${LEGACY_SETTINGS_FILE}`);
    }

    for (const subdir of MANAGED_SUBDIRS) {
      const absoluteSubdir = join(cursorDir, subdir);
      if ((await isDirectory(absoluteSubdir)) && (await isDirEmpty(absoluteSubdir))) {
        try {
          await rmdir(absoluteSubdir);
          dirsRemoved.push(`${LEGACY_CURSOR_DIR}/${subdir}`);
          console.log(`Removed empty ${LEGACY_CURSOR_DIR}/${subdir}`);
        } catch {
          // Tolerant: ENOTEMPTY/ENOENT handled silently.
        }
      }
    }

    if ((await isDirectory(cursorDir)) && (await isDirEmpty(cursorDir))) {
      try {
        await rmdir(cursorDir);
        dirsRemoved.push(LEGACY_CURSOR_DIR);
        console.log(`Removed empty ${LEGACY_CURSOR_DIR}/`);
      } catch {
        // Tolerant
      }
    }

    return Ok({ filesRemoved, dirsRemoved });
  } catch (error) {
    return Err({
      code: 'CLEANUP_FAILED' as const,
      message: `Failed to cleanup legacy ${LEGACY_CURSOR_DIR}/ in ${projectRoot}`,
      cause: error,
    });
  }
}
