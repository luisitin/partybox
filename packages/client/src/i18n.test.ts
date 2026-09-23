// The shell's `t` answers in the device's language, and the Spanish table is a real translation:
// no sentence left in English by accident (the owner, 2026-09-22).
import { afterEach, describe, expect, it } from 'vitest';
import { setLang } from '@partybox/game-sdk/ui';
import { t, tEn, textsFor } from './i18n';

/** Same in both languages on purpose: names, symbols, units. */
const SAME = new Set(['PartyBox', 'PB', 'VIP', 'Bot', 'OK']);
/** Units read the same in Spanish ("~5 min", "12 s"). */
const SAME_PATHS = new Set(['t.selecting.minutes', 't.connection.seconds']);

type Leaf = { path: string; en: string; es: string };

function leaves(en: unknown, es: unknown, path: string, out: Leaf[]): Leaf[] {
  if (typeof en === 'string') out.push({ path, en, es: String(es) });
  else if (typeof en === 'function') {
    const call = (f: unknown): string =>
      String((f as (...a: unknown[]) => unknown)('Sam', 2, 3) ?? '');
    out.push({ path, en: call(en), es: call(es) });
  } else if (en && typeof en === 'object') {
    for (const key of Object.keys(en)) {
      leaves(
        (en as Record<string, unknown>)[key],
        (es as Record<string, unknown>)[key],
        `${path}.${key}`,
        out,
      );
    }
  }
  return out;
}

describe('t', () => {
  afterEach(() => setLang('en'));

  it('follows the device language at read time', () => {
    expect(t.lobby.title).toBe('Lobby');
    setLang('es');
    expect(t.lobby.title).toBe('Sala');
    expect(t.results.winner('Ana')).toBe('¡Gana Ana!');
    setLang('de');
    expect(t.lobby.title).toBe('Lobby');
    expect(tEn.lobby.title).toBe('Lobby');
  });

  it('has every English sentence translated in Spanish', () => {
    const all = leaves(textsFor('en'), textsFor('es'), 't', []);
    expect(all.length).toBeGreaterThan(100);
    const left = all.filter(
      (l) => l.en === l.es && /[a-z]{3}/i.test(l.en) && !SAME.has(l.en) && !SAME_PATHS.has(l.path),
    );
    expect(left.map((l) => l.path)).toEqual([]);
    expect(all.filter((l) => l.es.trim() === '').map((l) => l.path)).toEqual([]);
  });
});
