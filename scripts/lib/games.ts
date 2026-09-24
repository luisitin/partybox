// Game-folder discovery shared by gen-registry, check-drift and new-game.
// The REQUIRED_GAME_FILES list is the single source of truth for "what makes a game folder".
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const GAMES_DIR = join(REPO_ROOT, 'games');

/** Relative paths every game folder must contain (docs/ADDING_A_GAME.md lists the same set). */
export const REQUIRED_GAME_FILES = [
  'manifest.json',
  'manifest.es.json',
  'README.md',
  'CLAUDE.md',
  'server/index.ts',
  'server/scoring.ts',
  'server/content.ts',
  'server/phases',
  'client/index.ts',
  'client/Tv.tsx',
  'client/Controller.tsx',
  'content',
  'content/schema.ts',
  'fixtures',
  '__tests__',
] as const;

/** Headings every game README must carry, in this order (docs/ADDING_A_GAME.md). */
export const REQUIRED_README_HEADINGS = [
  'Overview',
  'Players',
  'Phases',
  'Inputs',
  'Scoring',
  'Edge cases',
  'Settings',
  'Content',
] as const;

export interface GameFolder {
  id: string;
  dir: string;
  /** Folders starting with `_` (the template) are tested but never registered. */
  registered: boolean;
}

/** Lists game folders alphabetically. A game folder is any directory in games/ holding manifest.json. */
export function listGameFolders(): GameFolder[] {
  if (!existsSync(GAMES_DIR)) return [];
  return readdirSync(GAMES_DIR)
    .filter((name) => statSync(join(GAMES_DIR, name)).isDirectory())
    .filter((name) => existsSync(join(GAMES_DIR, name, 'manifest.json')))
    .sort()
    .map((id) => ({ id, dir: join(GAMES_DIR, id), registered: !id.startsWith('_') }));
}

/** Returns the required files missing from a game folder (empty array = complete). */
export function missingGameFiles(dir: string): string[] {
  return REQUIRED_GAME_FILES.filter((rel) => !existsSync(join(dir, rel)));
}

export function readManifest(dir: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as Record<string, unknown>;
}

/** `wisecrack` -> `wisecrack`, `lightning-round` -> `lightningRound` (a valid identifier). */
export function toIdentifier(id: string): string {
  const camel = id.replace(/[-_]+(\w)/g, (_m, c: string) => c.toUpperCase());
  return /^[A-Za-z_$]/.test(camel) ? camel : `g_${camel}`;
}
