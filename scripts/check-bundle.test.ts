// The pure half of `pnpm check-bundle` on a hand-made bundle shaped like Rolldown's output: which
// game modules ride in the entry, which chunks a surface pulls in, and a TV chunk on a phone.
import { describe, expect, it } from 'vitest';
import {
  atJoin,
  closure,
  contentModules,
  entryGameModules,
  gzipTotal,
  relativeIds,
  surfaceChunks,
  tvModulesIn,
} from './lib/bundle';
import type { Bundle, BundleChunk } from './lib/bundle';

const ROOT = 'C:\\dev\\partybox';

function chunk(fileName: string, over: Partial<BundleChunk> = {}): BundleChunk {
  return {
    type: 'chunk',
    fileName,
    isEntry: false,
    facadeModuleId: null,
    moduleIds: [],
    imports: [],
    code: `/* ${fileName} */`,
    ...over,
  };
}

/** Today's layout in miniature: blanks' phone imports its TV result; bingo shares a chunk. */
function fakeBundle(): Bundle {
  const items: Bundle = {};
  const put = (c: BundleChunk): void => {
    items[c.fileName] = c;
  };
  put(
    chunk('assets/index-1.js', {
      isEntry: true,
      facadeModuleId: `${ROOT}\\packages\\client\\index.html`,
      moduleIds: [
        `${ROOT}\\packages\\client\\src\\main.tsx`,
        `${ROOT}\\games\\bingo\\client\\strings.ts`,
        `${ROOT}\\games\\bingo\\client\\index.ts`,
        `${ROOT}\\games\\blanks\\client\\index.ts`,
      ],
      viteMetadata: { importedCss: new Set(['assets/index-1.css']) },
    }),
  );
  put(
    chunk('assets/Controller-b.js', {
      facadeModuleId: `${ROOT}\\games\\blanks\\client\\Controller.tsx`,
      moduleIds: [`${ROOT}\\games\\blanks\\client\\Controller.tsx`],
      imports: ['assets/index-1.js', 'assets/TvResult-b.js'],
    }),
  );
  put(
    chunk('assets/Tv-b.js', {
      facadeModuleId: `${ROOT}\\games\\blanks\\client\\Tv.tsx`,
      moduleIds: [`${ROOT}\\games\\blanks\\client\\Tv.tsx`],
      imports: ['assets/index-1.js', 'assets/TvResult-b.js'],
    }),
  );
  put(
    chunk('assets/TvResult-b.js', {
      moduleIds: [`${ROOT}\\games\\blanks\\client\\TvResult.tsx`],
      imports: ['assets/index-1.js', 'assets/src-x.js'],
      viteMetadata: { importedCss: new Set(['assets/TvResult-b.css']) },
    }),
  );
  put(chunk('assets/src-x.js', { moduleIds: [`${ROOT}\\packages\\game-sdk\\src\\x.ts`] }));
  put(
    chunk('assets/Controller-g.js', {
      facadeModuleId: `${ROOT}\\games\\bingo\\client\\Controller.tsx`,
      moduleIds: [`${ROOT}\\games\\bingo\\client\\Controller.tsx`],
      imports: ['assets/index-1.js', 'assets/copy-g.js'],
      // A dynamic import is a later download: never part of the closure.
      dynamicImports: ['assets/PhoneStage-g.js'],
      viteMetadata: { importedCss: new Set(['assets/Controller-g.css']) },
    }),
  );
  put(
    chunk('assets/PhoneStage-g.js', {
      facadeModuleId: `${ROOT}\\games\\bingo\\client\\PhoneStage.tsx`,
      moduleIds: [`${ROOT}\\games\\bingo\\client\\PhoneStage.tsx`],
      imports: ['assets/copy-g.js'],
    }),
  );
  put(
    chunk('assets/copy-g.js', {
      moduleIds: [`${ROOT}\\games\\bingo\\client\\copy.ts`],
      viteMetadata: { importedCss: new Set(['assets/copy-g.css']) },
    }),
  );
  // The new layout: a per-surface entry is the facade.
  put(
    chunk('assets/phone-w.js', {
      facadeModuleId: `${ROOT}/games/wisecrack/client/phone-entry.ts`,
      moduleIds: [
        `${ROOT}/games/wisecrack/client/phone-entry.ts`,
        `${ROOT}/games/wisecrack/client/Controller.tsx`,
      ],
    }),
  );
  put(
    chunk('assets/tv-w.js', {
      facadeModuleId: `${ROOT}/games/wisecrack/client/tv-entry.ts`,
      moduleIds: [
        `${ROOT}/games/wisecrack/client/tv-entry.ts`,
        `${ROOT}/games/wisecrack/client/Tv.tsx`,
      ],
    }),
  );
  for (const css of [
    'assets/index-1.css',
    'assets/TvResult-b.css',
    'assets/Controller-g.css',
    'assets/copy-g.css',
  ])
    items[css] = { type: 'asset', fileName: css, source: `.x{color:red} /* ${css} */` };
  return relativeIds(Object.values(items), ROOT);
}

describe('check-bundle', () => {
  const bundle = fakeBundle();

  it('finds every game module inside an entry chunk, repo-relative and sorted', () => {
    expect(entryGameModules(bundle)).toEqual([
      { game: 'bingo', path: 'games/bingo/client/index.ts' },
      { game: 'bingo', path: 'games/bingo/client/strings.ts' },
      { game: 'blanks', path: 'games/blanks/client/index.ts' },
    ]);
  });

  it('a checkout under a folder named games is not a game', () => {
    const odd = relativeIds(
      [
        chunk('assets/index.js', {
          isEntry: true,
          moduleIds: ['D:/games/partybox/packages/client/src/main.tsx'],
        }),
      ],
      'd:\\games\\partybox',
    );
    expect(entryGameModules(odd)).toEqual([]);
  });

  it('maps both layouts to phone and TV surfaces', () => {
    const surfaces = surfaceChunks(bundle);
    expect(surfaces.get('blanks')).toEqual({
      phone: ['assets/Controller-b.js'],
      tv: ['assets/Tv-b.js'],
    });
    expect(surfaces.get('bingo')).toEqual({ phone: ['assets/Controller-g.js'], tv: [] });
    expect(surfaces.get('wisecrack')).toEqual({
      phone: ['assets/phone-w.js'],
      tv: ['assets/tv-w.js'],
    });
  });

  it('walks static imports only, skips the entry, and adds each chunk’s CSS', () => {
    expect(closure(bundle, ['assets/Controller-b.js'])).toEqual([
      'assets/Controller-b.js',
      'assets/TvResult-b.js',
      'assets/src-x.js',
      'assets/TvResult-b.css',
    ]);
    expect(closure(bundle, ['assets/Controller-g.js'])).toEqual([
      'assets/Controller-g.js',
      'assets/copy-g.js',
      'assets/Controller-g.css',
      'assets/copy-g.css',
    ]);
  });

  it('names a TV module riding on a phone, and only there', () => {
    const blanksPhone = closure(bundle, ['assets/Controller-b.js']);
    expect(tvModulesIn(bundle, blanksPhone)).toEqual(['games/blanks/client/TvResult.tsx']);
    expect(tvModulesIn(bundle, closure(bundle, ['assets/Controller-g.js']))).toEqual([]);
    expect(tvModulesIn(bundle, closure(bundle, ['assets/phone-w.js']))).toEqual([]);
  });

  it('sums the gzip of JS and CSS together', () => {
    const files = closure(bundle, ['assets/Controller-g.js']);
    const js = gzipTotal(bundle, files.slice(0, 2));
    const css = gzipTotal(bundle, files.slice(2));
    expect(js).toBeGreaterThan(0);
    expect(css).toBeGreaterThan(0);
    expect(gzipTotal(bundle, files)).toBe(js + css);
  });

  it('counts nothing the page already loaded at join', () => {
    const shared = chunk('assets/lang-s.js', {
      moduleIds: [`${ROOT}/packages/game-sdk/src/ui/lang.ts`],
    });
    const withShared: Bundle = {
      ...bundle,
      [shared.fileName]: shared,
      'assets/index-1.js': {
        ...(bundle['assets/index-1.js'] as BundleChunk),
        imports: [shared.fileName],
      },
      'assets/Controller-g.js': {
        ...(bundle['assets/Controller-g.js'] as BundleChunk),
        imports: ['assets/copy-g.js', shared.fileName],
      },
    };
    expect(atJoin(withShared).has(shared.fileName)).toBe(true);
    expect(closure(withShared, ['assets/Controller-g.js'])).not.toContain(shared.fileName);
  });

  it('finds a content pack or a content loader in any chunk', () => {
    expect(contentModules(bundle)).toEqual([]);
    const leak = relativeIds(
      [
        chunk('assets/leak.js', {
          moduleIds: [
            `${ROOT}/games/blanks/content/wild.json`,
            `${ROOT}/games/blanks/server/content.ts`,
          ],
        }),
      ],
      ROOT,
    );
    expect(contentModules({ ...bundle, ...leak })).toEqual([
      'games/blanks/content/wild.json',
      'games/blanks/server/content.ts',
    ]);
  });
});
