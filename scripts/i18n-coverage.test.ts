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
import { clientGames } from '../packages/client/src/games.generated';
import { STRINGS as TV_SHELL } from '../packages/client/src/tv/strings';
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

const AREAS: Area[] = [
  ...Object.values(clientGames).map((g) => ({
    dir: `games/${g.id}/client`,
    table: g.strings ?? {},
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
  settings?: { label: string; description?: string; options?: { label: string }[] }[];
}

function manifestLines(path: string): string[] {
  const m = JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as Manifest;
  return [
    m.tagline,
    m.description,
    ...(m.settings ?? []).flatMap((s) => [
      s.label,
      ...(s.description ? [s.description] : []),
      ...(s.options ?? []).map((o) => o.label),
    ]),
  ];
}

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
    `has the Spanish for the manifest's picker lines — add them to ${area.tableFile}`,
    () => {
      const missing = manifestLines(area.manifest!).filter((en) => es[en] === undefined);
      expect(missing).toEqual([]);
    },
  );

  it('keeps each sentence’s placeholders', () => {
    const broken = Object.entries(es)
      .filter(([en, tr]) => holes(en) !== holes(tr))
      .map(([en, tr]) => `${en} → ${tr}`);
    expect(broken).toEqual([]);
  });
});
