// Discovers every game folder (including `_template`) and loads its definition, manifest.json,
// fixtures, content packs and optional contract config. Filesystem access lives only here.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { AnyGameDefinition, GameStateBase, Settings } from '@partybox/shared';
import type { z } from '@partybox/shared';

export const REPO_ROOT = resolve(fileURLToPath(new URL('../../../..', import.meta.url)));
export const GAMES_DIR = join(REPO_ROOT, 'games');

/** Optional per-game hints for the contract suite: `games/<id>/__tests__/contract.config.ts`. */
export interface ContractConfig {
  /** Strings that must NOT appear in `controllerView(state, playerId)` (other players' secrets). */
  hiddenFromController?: (state: GameStateBase, playerId: string) => string[];
  /** Strings that must NOT appear in `tvView(state)` (e.g. answers before reveal). */
  hiddenFromTv?: (state: GameStateBase) => string[];
  /** Extra settings combinations to play through (defaults are always played). */
  settingsVariants?: Settings[];
}

export interface LoadedGame {
  id: string;
  dir: string;
  game: AnyGameDefinition;
  manifestJson: unknown;
  fixtures: Record<string, GameStateBase>;
  /** content pack name → parsed JSON */
  content: Record<string, unknown>;
  /** content pack name → zod schema, from content/schema.ts `packs` */
  packs: Record<string, z.ZodType>;
  config: ContractConfig;
  serverSources: { file: string; text: string }[];
}

function readJsonDir(dir: string): Record<string, unknown> {
  if (!existsSync(dir)) return {};
  const out: Record<string, unknown> = {};
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    out[name.slice(0, -5)] = JSON.parse(readFileSync(join(dir, name), 'utf8'));
  }
  return out;
}

function walkTs(
  dir: string,
  out: { file: string; text: string }[] = [],
): { file: string; text: string }[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkTs(full, out);
    else if (name.endsWith('.ts')) out.push({ file: full, text: readFileSync(full, 'utf8') });
  }
  return out;
}

export function listGameIds(): string[] {
  if (!existsSync(GAMES_DIR)) return [];
  return readdirSync(GAMES_DIR)
    .filter((name) => existsSync(join(GAMES_DIR, name, 'manifest.json')))
    .sort();
}

export async function loadGame(id: string): Promise<LoadedGame> {
  const dir = join(GAMES_DIR, id);
  const mod = (await import(pathToFileURL(join(dir, 'server', 'index.ts')).href)) as {
    game: AnyGameDefinition;
  };
  const schemaMod = (await import(pathToFileURL(join(dir, 'content', 'schema.ts')).href)) as {
    packs?: Record<string, z.ZodType>;
  };
  const configPath = join(dir, '__tests__', 'contract.config.ts');
  const config = existsSync(configPath)
    ? (((await import(pathToFileURL(configPath).href)) as { contractConfig?: ContractConfig })
        .contractConfig ?? {})
    : {};
  return {
    id,
    dir,
    game: mod.game,
    manifestJson: JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')),
    fixtures: readJsonDir(join(dir, 'fixtures')) as Record<string, GameStateBase>,
    content: readJsonDir(join(dir, 'content')),
    packs: schemaMod.packs ?? {},
    config,
    serverSources: walkTs(join(dir, 'server')),
  };
}

export async function loadAllGames(): Promise<LoadedGame[]> {
  return Promise.all(listGameIds().map(loadGame));
}
