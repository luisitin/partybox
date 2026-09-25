// The lobby's catalog and each game's About (game pack Part 00 §1.2, ADR-049). Built once at boot
// from the manifests and each game's `manifest.es.json` (its manifest sentences in Spanish, keyed by
// the English), with the host's clock for NEW — the engine stays pure. Phones get the catalog once
// per connection (sockets.ts); the long text only when someone opens About or the settings form.
import { createHash } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { Catalog, CatalogEntry, GameAbout, GameManifest, GamePace } from '@partybox/shared';
import { QUICK_MINUTES } from '@partybox/shared';

/** A game is NEW for this long after its `addedOn`. */
export const NEW_DAYS = 30;
/** Part 00 §1.2 budgets. */
export const CATALOG_ENTRY_MAX_BYTES = 400;
export const ABOUT_MAX_BYTES = 2048;

/** Per game, per language: the manifest's English sentences → that language. */
export type GameTexts = Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, string>>>>>>; // prettier-ignore

/** The manifest's estimate as the catalog's compact tuple, with the rounds setting's default. */
function paceOf(e: NonNullable<GameManifest['estimate']>, rounds: unknown): GamePace {
  const head = [e.fixedSeconds, e.perRoundSeconds, e.perPlayerPerRoundSeconds] as const;
  return typeof rounds === 'number'
    ? [...head, e.roundsSetting, rounds]
    : [...head, e.roundsSetting];
}

function entryOf(m: GameManifest, texts: GameTexts, now: number): CatalogEntry {
  const added = Date.parse(`${m.addedOn}T00:00:00Z`);
  const e = m.estimate;
  const rounds = e ? m.settings.find((s) => s.key === e.roundsSetting)?.default : undefined;
  const isNew = Number.isFinite(added) && now >= added && now - added < NEW_DAYS * 86_400_000;
  const i18n: Record<string, { tagline: string }> = {};
  for (const [lang, table] of Object.entries(texts[m.id] ?? {})) {
    const tagline = table[m.tagline];
    if (tagline) i18n[lang] = { tagline };
  }
  return {
    id: m.id,
    name: m.name,
    icon: m.icon,
    tagline: m.tagline,
    minPlayers: m.minPlayers,
    maxPlayers: m.maxPlayers,
    estimatedMinutes: m.estimatedMinutes,
    ...(e ? { pace: paceOf(e, rounds) } : {}),
    tags: [...m.tags, ...(m.estimatedMinutes <= QUICK_MINUTES ? ['quick'] : [])],
    presence: m.presence.needs,
    supportsBots: m.supportsBots === true,
    ...(isNew ? { isNew: true as const } : {}),
    ...(m.phoneSettings ? { phoneSettings: true as const } : {}),
    ...(Object.keys(i18n).length > 0 ? { i18n } : {}),
  };
}

/** Every game, A–Z by name (a plain code-unit compare: the same order on every host). */
export function buildCatalog(manifests: GameManifest[], texts: GameTexts, now: number): Catalog {
  const games = manifests
    .map((m) => entryOf(m, texts, now))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const rev = createHash('sha1').update(JSON.stringify(games)).digest('hex').slice(0, 10);
  return { rev, games };
}

/** The About sheet's words for one game, in `lang` (English where a sentence has no translation). */
export function aboutOf(m: GameManifest, texts: GameTexts, lang: string): GameAbout {
  const table = texts[m.id]?.[lang];
  const tr = (en: string): string => table?.[en] ?? en;
  return {
    id: m.id,
    lang: table ? lang : 'en',
    tagline: tr(m.tagline),
    description: tr(m.description),
    howToPlay: [tr(m.howToPlay[0]), tr(m.howToPlay[1]), tr(m.howToPlay[2])],
    settings: m.settings.map((s) => ({
      key: s.key,
      label: tr(s.label),
      ...(s.description ? { line: tr(s.description) } : {}),
    })),
    ...(m.presence.note ? { presenceNote: tr(m.presence.note) } : {}),
  };
}

/** Builds the catalog from the registered games and serves its routes; the sockets send it. */
export function serveCatalog(
  fastify: FastifyInstance,
  games: readonly { manifest: GameManifest }[],
  texts: GameTexts,
  now: number,
  /** Captures only (catalog-demo.ts): entries shown in the picker that no game backs. */
  demo: readonly GameManifest[] = [],
): Catalog {
  const manifests = Object.fromEntries(
    // a real game wins over a demo entry with its id (the pack's games land one by one)
    [...demo, ...games.map((g) => g.manifest)].map((m) => [m.id, m]),
  );
  const catalog = buildCatalog(Object.values(manifests), texts, now);
  registerCatalogRoutes(fastify, catalog, manifests, texts);
  return catalog;
}

/**
 * `GET /api/catalog` (tools, tests), `GET /api/games/:id/about?lang=` (the About sheet) and
 * `GET /api/games/:id/text?lang=` (the settings form's words: the game's manifest sentences in
 * `lang`, keyed by the English — `{}` for English). About and text change only with a new build:
 * phones may keep them for the session; the catalog `rev` tells them when to drop them.
 */
export function registerCatalogRoutes(
  fastify: FastifyInstance,
  catalog: Catalog,
  manifests: Readonly<Record<string, GameManifest>>,
  texts: GameTexts,
): void {
  // no-cache (Part 00 §2.4): a restart with a new game changes both.
  fastify.get('/api/catalog', async (_req, reply) => {
    void reply.header('cache-control', 'no-cache');
    return catalog;
  });
  // Public: the registered games, for tools and tests (the picker reads the catalog).
  fastify.get('/api/games', async (_req, reply) => {
    void reply.header('cache-control', 'no-cache');
    return catalog.games;
  });
  const langOf = (q: unknown): string => {
    const raw = (q as { lang?: unknown } | undefined)?.lang;
    return typeof raw === 'string' && /^[a-z]{2}$/.test(raw) ? raw : 'en';
  };
  fastify.get('/api/games/:id/about', async (req, reply) => {
    // Own keys only: '__proto__' or 'constructor' is not a game (it was a 500).
    const id = (req.params as { id: string }).id;
    const m = Object.hasOwn(manifests, id) ? manifests[id] : undefined;
    if (!m) return reply.code(404).send({ error: 'unknown game' });
    void reply.header('cache-control', 'no-cache');
    return aboutOf(m, texts, langOf(req.query));
  });
  fastify.get('/api/games/:id/text', async (req, reply) => {
    const id = (req.params as { id: string }).id;
    if (!Object.hasOwn(manifests, id)) return reply.code(404).send({ error: 'unknown game' });
    void reply.header('cache-control', 'no-cache');
    return texts[id]?.[langOf(req.query)] ?? {};
  });
}
