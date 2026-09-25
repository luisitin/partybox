// Drawing a board and dealing its key (SPEC §9.3, §9.20 "Drawing a board"): five themes give three
// members each so every board has clusters to clue, ten more come from the whole pool, and no two
// words on a board share a root. The key is dealt with the same rng.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import type { Word } from '../content/schema';
import { LANG, poolFor } from './content';
import { normalize, sameAnswer } from '@partybox/game-sdk/match';
import type { Card, Kind, Mode, Team } from './types';

export const BOARD_SIZE = 25;
const THEMES_PER_BOARD = 5;
const PER_THEME = 3;

function roots(w: Word): string[] {
  return [w.id, ...w.family].map((r) => normalize(r, LANG).compact);
}

/** SPEC §9.20: sameAnswer, one containing the other (4+ letters), or overlapping family roots. */
export function clashes(a: Word, b: Word): boolean {
  if (sameAnswer(a.id, b.id, LANG)) return true;
  const [x, y] = [a.id, b.id];
  if ((y.length >= 4 && x.includes(y)) || (x.length >= 4 && y.includes(x))) return true;
  const ra = roots(a);
  return roots(b).some((r) => ra.includes(r));
}

export interface Drawn {
  board: Card[];
  themes: string[];
  rng: RngState;
}

export function drawBoard(rng: RngState, spicy: boolean, avoid: readonly string[]): Drawn {
  const pool = poolFor(spicy);
  const chosen: Word[] = [];
  const fits = (w: Word): boolean => !chosen.some((c) => c.id === w.id || clashes(c, w));
  // Fresh themes first (a new round should feel new), then the rest, both in rng order.
  const [fresh, r1] = shuffle(
    rng,
    pool.themes.filter((t) => !avoid.includes(t.id)),
  );
  const [stale, r2] = shuffle(
    r1,
    pool.themes.filter((t) => avoid.includes(t.id)),
  );
  let r = r2;
  const used: string[] = [];
  for (const theme of [...fresh, ...stale]) {
    if (used.length === THEMES_PER_BOARD) break;
    const [members, rn] = shuffle(r, theme.members);
    r = rn;
    const picks: Word[] = [];
    for (const id of members) {
      const w = pool.words.get(id);
      if (w && fits(w) && !picks.some((p) => clashes(p, w))) picks.push(w);
      if (picks.length === PER_THEME) break;
    }
    if (picks.length < PER_THEME) continue;
    chosen.push(...picks);
    used.push(theme.id);
  }
  const [rest, r3] = shuffle(r, [...pool.words.values()]);
  for (const w of rest) {
    if (chosen.length === BOARD_SIZE) break;
    if (fits(w)) chosen.push(w);
  }
  const [order, r4] = shuffle(r3, chosen);
  return { board: order.map((w) => ({ word: w.word, itemId: w.id })), themes: used, rng: r4 };
}

/** The key: starter 9 agents, the other team 8 (co-op: 9 and 15 bystanders), bystanders, assassins. */
export function dealKey(
  rng: RngState,
  mode: Mode,
  starter: Team,
  assassins: 1 | 2,
): [Kind[], RngState] {
  const other: Team = starter === 'sun' ? 'moon' : 'sun';
  const kinds: Kind[] = Array<Kind>(9).fill(starter);
  if (mode === 'teams') kinds.push(...Array<Kind>(8).fill(other));
  kinds.push(...Array<Kind>(assassins).fill('assassin'));
  while (kinds.length < BOARD_SIZE) kinds.push('bystander');
  return shuffle(rng, kinds);
}
