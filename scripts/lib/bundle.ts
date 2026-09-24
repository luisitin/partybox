// The pure half of `pnpm check-bundle` (FOUNDATION-AUDIT #7): reads the client build's output
// bundle (chunks with their module ids and static imports, CSS assets). Kept apart from the Vite
// run so tests can feed it a hand-made bundle. Vite's manifest.json cannot do this job: modules
// inlined into the entry never appear in it, so a manifest-based check passes on the exact bug it
// exists to catch.
import { gzipSync } from 'node:zlib';

/** The slice of an output chunk this check reads (structural: `vite` resolves from packages/client). */
export interface BundleChunk {
  type: 'chunk';
  fileName: string;
  isEntry: boolean;
  facadeModuleId: string | null;
  moduleIds: readonly string[];
  /** Static imports: they download with the chunk. */
  imports: readonly string[];
  /** A later download (a lazy surface), never part of this one's closure. */
  dynamicImports?: readonly string[];
  code: string;
  viteMetadata?: { importedCss: ReadonlySet<string> };
}

export interface BundleAsset {
  type: 'asset';
  fileName: string;
  source: string | Uint8Array;
}

export type Bundle = Record<string, BundleChunk | BundleAsset>;

export type Surface = 'phone' | 'tv';

/** A game module that rides in an entry chunk (every phone downloads it at join). */
export interface EntryGameModule {
  game: string;
  /** `games/<id>/…`, forward slashes. */
  path: string;
}

// Module ids are absolute; `relativeIds` makes them repo-relative first so a checkout that itself
// sits under a `games` folder cannot confuse these.
const GAME_MODULE = /(?:^|\/)games\/([^/]+)\/(.+)$/;
/**
 * A game's surface modules: the per-surface entries of the lazy registry (`phone.ts` / `tv.ts`,
 * ruling 10) or, in today's layout, the components the registry imports lazily.
 */
const SURFACE_MODULE =
  /(?:^|\/)games\/([^/]+)\/client\/(phone\.ts|Controller\.tsx|tv\.ts|Tv\.tsx)$/;
/** TV code: the `Tv*` components or the TV entry. Found in a phone closure, it is dead weight. */
const TV_MODULE = /(?:^|\/)games\/[^/]+\/client\/(Tv[^/]*|tv\.ts)$/;

export const normalizeId = (id: string): string => id.replaceAll('\\', '/');

/**
 * A plain copy of an output bundle (field by field: Rolldown's output objects may expose them as
 * getters) keyed by file name, with every module id repo-relative (ids outside `root` are only
 * normalized).
 */
export function relativeIds(items: Iterable<BundleChunk | BundleAsset>, root: string): Bundle {
  const prefix = normalizeId(root).replace(/\/?$/, '/');
  const rel = (id: string): string => {
    const n = normalizeId(id);
    // Windows ids and paths may disagree on the drive letter's case.
    return n.toLowerCase().startsWith(prefix.toLowerCase()) ? n.slice(prefix.length) : n;
  };
  const out: Bundle = {};
  for (const item of items)
    out[item.fileName] =
      item.type === 'chunk'
        ? {
            type: 'chunk',
            fileName: item.fileName,
            isEntry: item.isEntry,
            facadeModuleId: item.facadeModuleId === null ? null : rel(item.facadeModuleId),
            moduleIds: item.moduleIds.map(rel),
            imports: [...item.imports],
            dynamicImports: [...(item.dynamicImports ?? [])],
            code: item.code,
            viteMetadata: { importedCss: new Set(item.viteMetadata?.importedCss ?? []) },
          }
        : { type: 'asset', fileName: item.fileName, source: item.source };
  return out;
}

/** `{ game, path: games/<id>/… }` for a module id, or null when the module is not a game's. */
function gameModule(id: string): EntryGameModule | null {
  const match = GAME_MODULE.exec(normalizeId(id));
  return match ? { game: match[1] ?? '', path: `games/${match[1]}/${match[2]}` } : null;
}

function chunks(bundle: Bundle): BundleChunk[] {
  return Object.values(bundle).filter((item): item is BundleChunk => item.type === 'chunk');
}

export function entryChunks(bundle: Bundle): BundleChunk[] {
  return chunks(bundle).filter((c) => c.isEntry);
}

/** Every module under `games/<id>/` that an entry chunk carries, sorted by path. */
export function entryGameModules(bundle: Bundle): EntryGameModule[] {
  const found = entryChunks(bundle)
    .flatMap((chunk) => chunk.moduleIds.map(gameModule))
    .filter((m): m is EntryGameModule => m !== null);
  return found.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

function surfaceOf(file: string): Surface {
  return file === 'phone.ts' || file === 'Controller.tsx' ? 'phone' : 'tv';
}

/**
 * Each game's surface chunks: the chunk a surface module is the facade of, or, when the bundler
 * merged it into a shared chunk, the non-entry chunk that holds it. A surface inlined into the
 * entry has no chunk of its own (the entry check reports it instead).
 */
export function surfaceChunks(bundle: Bundle): Map<string, Record<Surface, string[]>> {
  const games = new Map<string, Record<Surface, string[]>>();
  for (const chunk of chunks(bundle)) {
    if (chunk.isEntry) continue;
    const facade = chunk.facadeModuleId === null ? [] : [chunk.facadeModuleId];
    for (const id of [...facade, ...chunk.moduleIds]) {
      const match = SURFACE_MODULE.exec(normalizeId(id));
      if (!match) continue;
      const game = games.get(match[1] ?? '') ?? { phone: [], tv: [] };
      const files = game[surfaceOf(match[2] ?? '')];
      if (!files.includes(chunk.fileName)) files.push(chunk.fileName);
      games.set(match[1] ?? '', game);
    }
  }
  return games;
}

/**
 * What a device downloads to show a surface: its chunks, every chunk they reach through static
 * imports (not dynamic ones), minus entry chunks (already loaded at join), plus the CSS each of
 * those chunks imports. File names: the JS in walk order, then the CSS.
 */
export function closure(bundle: Bundle, roots: readonly string[]): string[] {
  const seen = new Set<string>();
  const queue = [...roots];
  while (queue.length > 0) {
    const name = queue.shift() ?? '';
    const chunk = bundle[name];
    if (seen.has(name) || chunk?.type !== 'chunk' || chunk.isEntry) continue;
    seen.add(name);
    queue.push(...chunk.imports);
  }
  const css = new Set<string>();
  for (const name of seen) {
    const chunk = bundle[name];
    if (chunk?.type === 'chunk')
      for (const file of chunk.viteMetadata?.importedCss ?? []) css.add(file);
  }
  return [...seen, ...css];
}

/** The TV modules (`Tv*`, `tv.ts`) inside a set of chunks: in a phone closure, a leak. */
export function tvModulesIn(bundle: Bundle, files: readonly string[]): string[] {
  const found = new Set<string>();
  for (const name of files) {
    const chunk = bundle[name];
    if (chunk?.type !== 'chunk') continue;
    for (const id of chunk.moduleIds)
      if (TV_MODULE.test(normalizeId(id))) found.add(gameModule(id)?.path ?? normalizeId(id));
  }
  return [...found].sort();
}

/** zlib level 9, one file at a time: what the host serves as `.gz`. */
export function gzipBytes(item: BundleChunk | BundleAsset): number {
  const body = item.type === 'chunk' ? item.code : item.source;
  return gzipSync(typeof body === 'string' ? Buffer.from(body) : body, { level: 9 }).length;
}

/** Summed gzip of a list of files (JS and CSS together, ruling 12). Missing files count 0. */
export function gzipTotal(bundle: Bundle, files: readonly string[]): number {
  let total = 0;
  for (const name of files) {
    const item = bundle[name];
    if (item) total += gzipBytes(item);
  }
  return total;
}
