// Every sentence a screen translates has its Spanish (the owner, 2026-09-22: "all text should be at
// least translatable to Spanish when the language is changed"). Screens write `L('English…')` from
// `useT(STRINGS)`; this reads each area's source for those calls and checks the area's table, plus
// each game's manifest lines (the picker shows them), and that a translation keeps the sentence's
// `{placeholders}`. A failure names the file to add the Spanish to.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { Strings } from '@partybox/game-sdk/ui';
import { listGameFolders } from './lib/games';
import { STRINGS as TV_SHELL } from '../packages/client/src/tv/strings';
import { STRINGS as SURFACE } from '../packages/client/src/surface/strings';
import { STRINGS as SDK_PHONE } from '../packages/game-sdk/src/controller/strings';
import { STRINGS as SDK_TV } from '../packages/game-sdk/src/tv/strings';
import { STRINGS as TEMPLATE_GAME } from '../games/_template/client/strings';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

interface Area {
  dir: string;
  table: Strings;
  tableFile: string;
  manifest?: string;
}

/** Each registered game's table, from the part both of its entries share (ADR-050). */
const GAMES = await Promise.all(
  listGameFolders()
    .filter((f) => f.registered)
    .map(async (f) => {
      const { shared } = (await import(`../games/${f.id}/client/shared.ts`)) as {
        shared: { strings?: Strings };
      };
      return { id: f.id, table: shared.strings ?? {} };
    }),
);

const AREAS: Area[] = [
  ...GAMES.map((g) => ({
    dir: `games/${g.id}/client`,
    table: g.table,
    tableFile: `games/${g.id}/client/strings.ts`,
    manifest: `games/${g.id}/manifest.json`,
  })),
  // The template every new game is copied from starts translated.
  {
    dir: 'games/_template/client',
    table: TEMPLATE_GAME,
    tableFile: 'games/_template/client/strings.ts',
    manifest: 'games/_template/manifest.json',
  },
  {
    dir: 'packages/game-sdk/src/controller',
    table: SDK_PHONE,
    tableFile: 'packages/game-sdk/src/controller/strings.ts',
  },
  {
    dir: 'packages/game-sdk/src/tv',
    table: SDK_TV,
    tableFile: 'packages/game-sdk/src/tv/strings.ts',
  },
  {
    dir: 'packages/client/src/tv',
    table: TV_SHELL,
    tableFile: 'packages/client/src/tv/strings.ts',
  },
  // I-677: the wrong-screen hint (join page and TV page)
  {
    dir: 'packages/client/src/surface',
    table: SURFACE,
    tableFile: 'packages/client/src/surface/strings.ts',
  },
];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const QUOTED = /\bL\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
const TEMPLATE = /\bL\(\s*`([^`]*)`/g;

/** The English sentences an area's source passes to `L(…)`, and any it builds at runtime. */
function calls(dir: string): { keys: Map<string, string>; dynamic: string[] } {
  const keys = new Map<string, string>();
  const dynamic: string[] = [];
  for (const file of sources(join(ROOT, dir))) {
    // Comments may quote the convention (`L('…')`); only code counts.
    const text = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const where = relative(ROOT, file).replaceAll('\\', '/');
    for (const m of text.matchAll(QUOTED)) {
      keys.set(m[2]!.replace(/\\(.)/g, '$1'), where);
    }
    for (const m of text.matchAll(TEMPLATE)) {
      if (m[1]!.includes('${')) dynamic.push(`${where}: L(\`${m[1]}\`)`);
      else keys.set(m[1]!, where);
    }
  }
  return { keys, dynamic };
}

interface Manifest {
  tagline: string;
  description: string;
  howToPlay?: string[];
  presence?: { note?: string };
  settings?: {
    label: string;
    description?: string;
    impliedBy?: { note: string };
    options?: { label: string }[];
  }[];
}

/** Every sentence of a manifest the shell shows (the picker, About, the settings form). */
function manifestLines(path: string): string[] {
  const m = JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as Manifest;
  return [
    m.tagline,
    m.description,
    ...(m.howToPlay ?? []),
    ...(m.presence?.note ? [m.presence.note] : []),
    ...(m.settings ?? []).flatMap((s) => [
      s.label,
      ...(s.description ? [s.description] : []),
      ...(s.impliedBy ? [s.impliedBy.note] : []),
      ...(s.options ?? []).map((o) => o.label),
    ]),
  ];
}

/** ADR-049: a game's manifest Spanish lives next to the manifest, served by the host. */
const esTable = (manifest: string): Record<string, string> =>
  JSON.parse(readFileSync(join(ROOT, manifest.replace(/\.json$/, '.es.json')), 'utf8')) as Record<
    string,
    string
  >;

const holes = (text: string): string =>
  [...text.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

describe.each(AREAS)('$dir', (area) => {
  const es = area.table.es ?? {};

  it('builds no sentence at runtime (a key must be the literal English, with {placeholders})', () => {
    expect(calls(area.dir).dynamic).toEqual([]);
  });

  it(`has the Spanish for every L('…') sentence — add them to ${area.tableFile}`, () => {
    const { keys } = calls(area.dir);
    const missing = [...keys]
      .filter(([en]) => es[en] === undefined)
      .map(([en, f]) => `${f}: ${en}`);
    expect(missing).toEqual([]);
  });

  it.runIf(area.manifest !== undefined)(
    `has the Spanish for every manifest sentence — add them to ${area.manifest?.replace('.json', '.es.json')}`,
    () => {
      const table = esTable(area.manifest!);
      const lines = manifestLines(area.manifest!);
      expect(lines.filter((en) => table[en] === undefined)).toEqual([]);
      // …and nothing stale: every key is a sentence the manifest still has (or an option's
      // short name — the label without its "(…)", which the key-setting chip shows: I-187).
      const shorts = lines.map((l) => l.replace(/\s*\(.*\)\s*$/, ''));
      expect(
        Object.keys(table).filter((en) => !lines.includes(en) && !shorts.includes(en)),
      ).toEqual([]);
      expect(Object.entries(table).filter(([en, tr]) => holes(en) !== holes(tr))).toEqual([]);
    },
  );

  it('keeps each sentence’s placeholders', () => {
    const broken = Object.entries(es)
      .filter(([en, tr]) => holes(en) !== holes(tr))
      .map(([en, tr]) => `${en} → ${tr}`);
    expect(broken).toEqual([]);
  });
});
