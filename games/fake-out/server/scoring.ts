// Scoring (SPEC §3.6): +1000 for picking the truth, +500 per player your lie fools (every author
// of a merged lie gets the full amount), a padding lie scores nobody, the Final Fake-Out doubles
// it all. Computed once as the reveal begins; scores never go down. Awards and results live here.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { pickersOf } from './options';
import { FOOL_POINTS, TRUTH_POINTS } from './types';
import type { PlayerStats, Question, State, Why } from './types';

export const ZERO_STATS: PlayerStats = { fooled: 0, truths: 0, likes: 0, truthTyped: 0, house: 0 };

export function multiplier(state: State): number {
  return state.q.final ? 2 : 1;
}

/** Everyone's points and reason chips for the question on stage, from its final picks. */
export function questionDelta(state: State): Question['delta'] {
  const mult = multiplier(state);
  const delta: Question['delta'] = {};
  const add = (p: string, pts: number, why: Why): void => {
    const row = delta[p] ?? { pts: 0, why: [] };
    delta[p] = { pts: row.pts + pts, why: [...row.why, why] };
  };
  for (const o of state.q.options ?? []) {
    const pickers = pickersOf(state, o.id);
    if (pickers.length === 0) continue;
    if (o.truth)
      for (const p of pickers)
        add(p, TRUTH_POINTS * mult, { k: 'truth', pts: TRUTH_POINTS * mult });
    else if (!o.house)
      for (const a of o.authors) {
        const pts = FOOL_POINTS * pickers.length * mult;
        add(a, pts, { k: 'fooled', n: pickers.length, pts });
      }
  }
  const order = { truth: 0, fooled: 1, final: 2 } as const;
  for (const row of Object.values(delta)) {
    if (mult > 1 && row.pts > 0) row.why.push({ k: 'final' });
    row.why.sort((a, b) => order[a.k] - order[b.k]); // the chips read truth, fooled, final
  }
  return delta;
}

/** The award stats this question adds: fooled, truths found, likes received, truths typed,
 *  padding lies picked. */
export function questionStats(state: State): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {};
  const bump = (p: string, key: keyof PlayerStats, by = 1): void => {
    const row = stats[p] ?? state.stats[p] ?? ZERO_STATS;
    stats[p] = { ...row, [key]: row[key] + by };
  };
  const options = state.q.options ?? [];
  for (const o of options) {
    const pickers = pickersOf(state, o.id);
    if (o.truth) for (const p of pickers) bump(p, 'truths');
    else if (o.house) for (const p of pickers) bump(p, 'house');
    else if (pickers.length > 0) for (const a of o.authors) bump(a, 'fooled', pickers.length);
  }
  for (const [liker, liked] of Object.entries(state.q.likes))
    for (const id of liked) {
      const o = options.find((x) => x.id === id);
      for (const a of o?.authors ?? []) if (a !== liker) bump(a, 'likes');
    }
  for (const p of state.q.truthTyped) bump(p, 'truthTyped');
  return { ...state.stats, ...stats };
}

/** Scores as the room should see them: during the reveal, this question's points are not in yet
 *  (the TV hands them out step by step). */
export function shownScores(state: State): Record<string, number> {
  if (state.phase.id !== 'reveal') return state.scores;
  const out: Record<string, number> = {};
  for (const [p, s] of Object.entries(state.scores)) out[p] = s - (state.q.delta[p]?.pts ?? 0) || 0;
  return out;
}

export interface StandingRow {
  playerId: string;
  score: number;
  rank: number;
  delta: number;
  why: Why[];
}

export function standings(state: State): StandingRow[] {
  const complete: Record<string, number> = {};
  for (const id of Object.keys(state.players)) complete[id] = state.scores[id] ?? 0;
  return rank(complete).map((row) => ({
    ...row,
    delta: state.q.delta[row.playerId]?.pts ?? 0,
    why: state.q.delta[row.playerId]?.why ?? [],
  }));
}

const AWARDS: readonly { id: string; key: keyof PlayerStats; title: string; what: string }[] = [
  { id: 'master-liar', key: 'fooled', title: '🎭 Master Liar', what: 'Players fooled' },
  { id: 'truth-detector', key: 'truths', title: '🔍 Truth Detector', what: 'Truths found' },
  { id: 'crowd-favourite', key: 'likes', title: '👍 Crowd Favourite', what: 'Likes received' },
  { id: 'lucky-guess', key: 'truthTyped', title: '🍀 Lucky Guess', what: 'Truths typed as lies' },
  {
    id: 'fooled-by-the-house',
    key: 'house',
    title: '🤖 Fooled by the House',
    what: 'PartyBox lies picked',
  },
];

/** 3–5 awards (SPEC §3.6): skipped when nobody earned one; ties share it (one award per winner). */
export function awardsFor(state: State): GameAward[] {
  const out: GameAward[] = [];
  const ids = state.seats.filter((p) => Object.hasOwn(state.players, p));
  for (const a of AWARDS) {
    const best = Math.max(0, ...ids.map((p) => state.stats[p]?.[a.key] ?? 0));
    if (best <= 0) continue;
    // The results screens key awards by id: a shared award gets one id per winner.
    ids
      .filter((p) => (state.stats[p]?.[a.key] ?? 0) === best)
      .forEach((p, i) =>
        out.push({
          id: i === 0 ? a.id : `${a.id}-${i + 1}`,
          title: a.title,
          description: `${a.what}: ${best}`,
          playerId: p,
        }),
      );
  }
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awardsFor(state));
}
