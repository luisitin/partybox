// The lobby's game list (game pack Part 00 §1.2, ADR-049). The host sends the catalog once per
// connection (`catalog`, net/controller.ts and net/tv.ts); every screen reads it here instead of
// from the room pushes. A game's long words come on demand and are kept for the session:
// `about` (the About sheet) and `text` (its manifest sentences in the device's language, for the
// settings form, the tuned line and the key chip) — neither ever downloads game code.
import { useSyncExternalStore } from 'react';
import type { Catalog, CatalogEntry, GameAbout } from '@partybox/shared';

let current: Catalog = { rev: '', games: [] };
const listeners = new Set<() => void>();
const notify = (): void => {
  for (const l of listeners) l();
};
const subscribe = (l: () => void): (() => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Words fetched per `${gameId}:${lang}`: the table, or 'loading' while the request runs. */
const tables = new Map<string, Readonly<Record<string, string>> | 'loading'>();
const abouts = new Map<string, GameAbout | 'loading'>();
const EMPTY: Readonly<Record<string, string>> = {};

export function setCatalog(next: Catalog): void {
  if (next.rev !== current.rev) {
    // A host with a different game list (a restart after a pull): its words may differ too.
    tables.clear();
    abouts.clear();
  }
  current = next;
  notify();
}

export function getCatalog(): Catalog {
  return current;
}

export function useCatalog(): Catalog {
  return useSyncExternalStore(subscribe, getCatalog, getCatalog);
}

export function gameEntry(id: string | null | undefined): CatalogEntry | undefined {
  return id ? current.games.find((g) => g.id === id) : undefined;
}

/** A game's name for a line of text; the id while the catalog has not arrived. */
export function gameName(id: string | null | undefined): string {
  return gameEntry(id)?.name ?? id ?? '';
}

/** The tagline in `lang` (the catalog carries each language's tagline). */
export function taglineOf(g: CatalogEntry, lang: string): string {
  return g.i18n?.[lang]?.tagline ?? g.tagline;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/**
 * The game's manifest sentences in `lang`, keyed by the English — synchronously, from what has
 * arrived; the first read starts the fetch and the page re-renders once it lands (`useGameText`).
 * English needs none. A failed fetch leaves the English showing and is retried on the next read.
 */
export function textTable(
  gameId: string | null | undefined,
  lang: string,
): Readonly<Record<string, string>> {
  if (!gameId || lang === 'en') return EMPTY;
  const key = `${gameId}:${lang}`;
  const have = tables.get(key);
  if (have && have !== 'loading') return have;
  if (!have) {
    tables.set(key, 'loading');
    void getJson<Record<string, string>>(
      `/api/games/${encodeURIComponent(gameId)}/text?lang=${lang}`,
    ).then((t) => {
      if (t) tables.set(key, t);
      else tables.delete(key);
      notify();
    });
  }
  return EMPTY;
}

/** Re-renders the caller when a game's words in `lang` arrive; returns the table (maybe empty). */
export function useGameText(
  gameId: string | null | undefined,
  lang: string,
): Readonly<Record<string, string>> {
  useSyncExternalStore(subscribe, () => tables.get(`${gameId ?? ''}:${lang}`) ?? null);
  return textTable(gameId, lang);
}

/** The About sheet's words for a game in `lang`, fetched once per session; null until they land. */
export function useAbout(gameId: string | null | undefined, lang: string): GameAbout | null {
  const key = `${gameId ?? ''}:${lang}`;
  const have = useSyncExternalStore(subscribe, () => abouts.get(key) ?? null);
  if (!gameId) return null;
  if (have === null) {
    abouts.set(key, 'loading');
    void getJson<GameAbout>(`/api/games/${encodeURIComponent(gameId)}/about?lang=${lang}`).then(
      (a) => {
        if (a) abouts.set(key, a);
        else abouts.delete(key);
        notify();
      },
    );
    return null;
  }
  return have === 'loading' ? null : have;
}
