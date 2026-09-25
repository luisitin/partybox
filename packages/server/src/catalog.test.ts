// Part 00 §1.2 budgets and rules for the catalog and About, on the real games and on a synthetic
// 20-game host (the picker must stay small at 20+ games).
import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import type { GameManifest } from '@partybox/shared';
import {
  ABOUT_MAX_BYTES,
  CATALOG_ENTRY_MAX_BYTES,
  aboutOf,
  buildCatalog,
  registerCatalogRoutes,
} from './catalog';
import { serverGameText, serverGames } from './games.generated';

const NOW = Date.parse('2026-09-24T12:00:00Z');
const manifests = Object.values(serverGames).map((g) => g.manifest);
const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v));

/** A plausible long-winded game: every field at or near its limit. */
function synthetic(i: number): GameManifest {
  return {
    ...manifests[0]!,
    id: `game-${String(i).padStart(2, '0')}`,
    name: `A Long Game Name Number ${i}`.slice(0, 40),
    tagline: 'x'.repeat(60),
    tags: ['words', 'bluff', 'hidden-roles'],
    addedOn: '2026-09-20',
  };
}

describe('catalog', () => {
  const catalog = buildCatalog(manifests, serverGameText, NOW);

  it('lists every game A–Z with no long text', () => {
    // every registered game, A–Z (the list grows as the pack's games land)
    const ids = manifests.map((m) => m.id).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    expect(catalog.games.map((g) => g.id)).toEqual(ids);
    for (const g of catalog.games) {
      expect(g).not.toHaveProperty('description');
      expect(g).not.toHaveProperty('settings');
    }
  });

  it(`keeps each entry under ${CATALOG_ENTRY_MAX_BYTES} B and 20 games under 8 KB`, () => {
    for (const g of catalog.games)
      expect(bytes(g), g.id).toBeLessThanOrEqual(CATALOG_ENTRY_MAX_BYTES);
    const twenty = buildCatalog(
      [...manifests, ...Array.from({ length: 20 - manifests.length }, (_, i) => synthetic(i))],
      serverGameText,
      NOW,
    );
    expect(twenty.games).toHaveLength(20);
    for (const g of twenty.games) expect(bytes(g)).toBeLessThanOrEqual(CATALOG_ENTRY_MAX_BYTES);
    expect(bytes(twenty)).toBeLessThanOrEqual(8 * 1024);
  });

  it('derives quick from the minutes and NEW from addedOn (30 days, host clock)', () => {
    const lightning = catalog.games.find((g) => g.id === 'lightning-round')!;
    const bingo = catalog.games.find((g) => g.id === 'bingo')!;
    expect(lightning.tags).toContain('quick'); // 8 minutes
    expect(bingo.tags).not.toContain('quick');
    expect(bingo.isNew).toBeUndefined(); // the five existing games predate the window (ruling 5)
    const fresh = buildCatalog([synthetic(1)], {}, NOW).games[0]!;
    expect(fresh.isNew).toBe(true);
    const later = buildCatalog([synthetic(1)], {}, NOW + 40 * 86_400_000).games[0]!;
    expect(later.isNew).toBeUndefined();
  });

  it('carries the pace with the rounds default, the icon and the Spanish tagline', () => {
    const blanks = catalog.games.find((g) => g.id === 'blanks')!;
    expect(blanks.icon).toBe('🃏');
    expect(blanks.pace?.[4]).toEqual(expect.any(Number)); // the rounds default
    expect(blanks.i18n?.['es']?.tagline).toMatch(/\S/);
    expect(catalog.games.find((g) => g.id === 'bingo')?.phoneSettings).toBe(true);
  });

  it('has a rev that follows the list', () => {
    expect(buildCatalog(manifests, serverGameText, NOW).rev).toBe(catalog.rev);
    expect(buildCatalog(manifests.slice(1), serverGameText, NOW).rev).not.toBe(catalog.rev);
  });
});

describe('about', () => {
  it.each(manifests.map((m) => [m.id, m] as const))(
    '%s: under 2 KB in English and Spanish, and translated',
    (_id, m) => {
      const en = aboutOf(m, serverGameText, 'en');
      const es = aboutOf(m, serverGameText, 'es');
      expect(bytes(en)).toBeLessThanOrEqual(ABOUT_MAX_BYTES);
      expect(bytes(es)).toBeLessThanOrEqual(ABOUT_MAX_BYTES);
      expect(en.howToPlay).toEqual(m.howToPlay);
      expect(es.lang).toBe('es');
      expect(es.description).not.toBe(m.description);
      expect(es.howToPlay).not.toEqual(m.howToPlay);
    },
  );

  it('falls back to English for a language the game does not ship', () => {
    const m = manifests[0]!;
    expect(aboutOf(m, serverGameText, 'de')).toMatchObject({ lang: 'en', tagline: m.tagline });
  });
});

describe('routes', () => {
  const app = Fastify();
  const byId = Object.fromEntries(manifests.map((m) => [m.id, m]));
  registerCatalogRoutes(app, buildCatalog(manifests, serverGameText, NOW), byId, serverGameText);

  it('serves about and the text table per language; 404 for an unknown game', async () => {
    const about = await app.inject({ url: '/api/games/wisecrack/about?lang=es' });
    expect(about.statusCode).toBe(200);
    expect(about.json()).toMatchObject({ id: 'wisecrack', lang: 'es' });
    const text = await app.inject({ url: '/api/games/wisecrack/text?lang=es' });
    expect(text.json()).toMatchObject({ Rounds: 'Rondas' });
    expect((await app.inject({ url: '/api/games/wisecrack/text?lang=en' })).json()).toEqual({});
    expect((await app.inject({ url: '/api/games/nope/about' })).statusCode).toBe(404);
    expect((await app.inject({ url: '/api/games/nope/text?lang=es' })).statusCode).toBe(404);
    // An object's own-property names are not games (they were a 500).
    for (const name of ['__proto__', 'constructor', 'toString'])
      expect((await app.inject({ url: `/api/games/${name}/about` })).statusCode, name).toBe(404);
    expect((await app.inject({ url: '/api/catalog' })).headers['cache-control']).toBe('no-cache');
    // A bad language reads as English, never as a path.
    const odd = await app.inject({ url: '/api/games/bingo/about?lang=../x' });
    expect(odd.json()).toMatchObject({ lang: 'en' });
  });
});
