// Scoring (SPEC §4.6): per card, +2 to every guesser who named an author (either author of a merged
// card); +1 to each author per guesser who named someone else. Idle guessers count for nothing, an
// author's own tap never scores, scores never go down. Awards, standings and results() live here.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { FOOLED_POINTS, RIGHT_POINTS } from './types';
import type { Card, State, Stats } from './types';

export interface CardTally {
  /** Guessers who tapped (authors excluded): guesserId → target. */
  guesses: Record<string, string>;
  right: string[];
  wrong: string[];
  points: Record<string, number>;
}

/** The current card's result from the guesses so far. */
export function tallyCard(state: State, card: Card): CardTally {
  const authors = new Set(card.authors);
  const guesses: Record<string, string> = {};
  for (const id of state.p.seated) {
    const target = state.p.guesses[id];
    if (target !== undefined && !authors.has(id)) guesses[id] = target;
  }
  const right = Object.keys(guesses).filter((id) => authors.has(guesses[id] as string));
  const wrong = Object.keys(guesses).filter((id) => !authors.has(guesses[id] as string));
  const points: Record<string, number> = {};
  for (const id of right) points[id] = RIGHT_POINTS;
  for (const a of card.authors) points[a] = wrong.length * FOOLED_POINTS;
  return { guesses, right, wrong, points };
}

function bump(stats: Record<string, Stats>, id: string, key: keyof Stats, by: number): void {
  const s = stats[id] ?? { right: 0, fooled: 0, readBy: 0 };
  stats[id] = { ...s, [key]: s[key] + by };
}

/** Scores the current card once, at the flip: points, award stats, pairs and the recap log. */
export function scoreCard(state: State): State {
  const card = state.p.cards[state.p.idx];
  if (!card) return state;
  const t = tallyCard(state, card);
  const scores = { ...state.scores };
  for (const [id, pts] of Object.entries(t.points)) scores[id] = (scores[id] ?? 0) + pts;
  const stats = { ...state.stats };
  const pairs = { ...state.pairs };
  for (const id of t.right) bump(stats, id, 'right', 1);
  for (const a of card.authors) {
    bump(stats, a, 'fooled', t.wrong.length);
    bump(stats, a, 'readBy', t.right.length);
  }
  for (const g of Object.keys(t.guesses))
    for (const a of card.authors) {
      const [r, seen] = pairs[`${g}>${a}`] ?? [0, 0];
      pairs[`${g}>${a}`] = [r + (t.right.includes(g) ? 1 : 0), seen + 1];
    }
  const log = [
    ...state.log,
    { n: state.p.n, text: card.text, authors: card.authors, right: t.right },
  ];
  return { ...state, scores, stats, pairs, log, p: { ...state.p, points: t.points } };
}

/** Everyone tied at the top of a stat (> 0): ties share an award (§4.6). */
function leaders(state: State, value: (id: string) => number): string[] {
  const best = Math.max(0, ...state.seats.map(value));
  return best > 0 ? state.seats.filter((id) => value(id) === best) : [];
}

function award(base: string, title: string, description: string, ids: string[]): GameAward[] {
  return ids.map((playerId) => ({ id: `${base}-${playerId}`, title, description, playerId }));
}

export interface KnowsBest {
  guesser: string;
  author: string;
  right: number;
  of: number;
}

/** Guesser → author pairs with the most right guesses (§4.6 Knows You Best). */
export function knowsBest(state: State): KnowsBest[] {
  const rows = Object.entries(state.pairs)
    .map(([k, [right, of]]) => {
      const [guesser = '', author = ''] = k.split('>');
      return { guesser, author, right, of };
    })
    .filter((r) => r.right > 0);
  const best = Math.max(0, ...rows.map((r) => r.right));
  return rows.filter((r) => r.right === best);
}

function nameOf(state: State, id: string): string {
  return state.players[id]?.name ?? '?';
}

export function awardsFor(state: State): GameAward[] {
  const stat = (key: keyof Stats) => (id: string) => state.stats[id]?.[key] ?? 0;
  const out: GameAward[] = [];
  const readers = leaders(state, stat('right'));
  const n = (id: string | undefined, key: keyof Stats): number => (id ? stat(key)(id) : 0);
  out.push(...award('mind-reader', 'Mind Reader', `Right guesses: ${n(readers[0], 'right')}`, readers)); // prettier-ignore
  const mystery = leaders(state, stat('fooled'));
  out.push(...award('mystery-guest', 'Mystery Guest', `Guessers fooled: ${n(mystery[0], 'fooled')}`, mystery)); // prettier-ignore
  const open = leaders(state, stat('readBy'));
  out.push(...award('open-book', 'Open Book', `Right guesses on their answers: ${n(open[0], 'readBy')}`, open)); // prettier-ignore
  const seen = new Set<string>();
  for (const pair of knowsBest(state)) {
    if (seen.has(pair.guesser)) continue;
    seen.add(pair.guesser);
    out.push({
      id: `knows-you-best-${pair.guesser}`,
      title: 'Knows You Best',
      description: `${nameOf(state, pair.guesser)} knows ${nameOf(state, pair.author)} best (${pair.right} of ${pair.of})`,
      playerId: pair.guesser,
    });
  }
  return out;
}

export interface StandingRow {
  playerId: string;
  score: number;
  rank: number;
  /** Points this prompt. */
  delta: number;
}

export function standings(state: State): StandingRow[] {
  const complete: Record<string, number> = {};
  for (const id of state.seats) complete[id] = state.scores[id] ?? 0;
  return rank(complete).map((row) => ({
    ...row,
    delta: row.score - (state.p.startScores[row.playerId] ?? 0),
  }));
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awardsFor(state));
}
