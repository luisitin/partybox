// Scoring (SPEC §1.6). A round's deltas are computed from the main vote, the accused and the
// last-chance guesses; they are re-computed if the VIP counts a typed guess. Scores never go down.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import type { State, Stats, Why } from './types';

export const POINTS = { read: 1, caught: 2, escaped: 4, stole: 3 } as const;

/** Round deltas for every seated player (void round: nobody scores). */
export function roundDelta(state: State): State['round']['delta'] {
  const r = state.round;
  const out: State['round']['delta'] = {};
  for (const id of state.seats) out[id] = { pts: 0, why: [] };
  if (r.void) return out;
  const add = (id: string, why: Why, pts: number): void => {
    const d = out[id];
    if (!d) return;
    d.pts += pts;
    d.why.push(why);
  };
  const caught = r.imposters.filter((id) => r.accused.includes(id));
  for (const id of state.seats) {
    if (r.imposters.includes(id)) {
      if (!caught.includes(id)) add(id, 'escaped', POINTS.escaped);
      else if (r.guesses[id]?.ok) add(id, 'stole', POINTS.stole);
      continue;
    }
    const reads = (r.votes[id] ?? []).filter((t) => r.imposters.includes(t)).length;
    for (let i = 0; i < reads; i++) add(id, 'read', POINTS.read);
    for (let i = 0; i < caught.length; i++) add(id, 'caught', POINTS.caught);
  }
  return out;
}

/** The award stats this round adds (applied once, at `scores`). */
export function roundStats(state: State): Record<string, Stats> {
  const r = state.round;
  const out: Record<string, Stats> = {};
  for (const id of state.seats) {
    const prev = state.stats[id] ?? { escapes: 0, reads: 0, steals: 0, suspicion: 0 };
    const s = { ...prev };
    if (!r.void) {
      if (r.imposters.includes(id)) {
        if (!r.accused.includes(id)) s.escapes += 1;
        else if (r.guesses[id]?.ok) s.steals += 1;
      } else {
        s.reads += (r.votes[id] ?? []).filter((t) => r.imposters.includes(t)).length;
        s.suspicion += Object.values(r.votes).filter((ts) => ts.includes(id)).length;
      }
    }
    out[id] = s;
  }
  return out;
}

const AWARDS: { id: string; stat: keyof Stats; title: string; description: string }[] = [
  {
    id: 'disguise',
    stat: 'escapes',
    title: '🕵️ Master of Disguise',
    description: 'Most escapes as the imposter',
  },
  {
    id: 'bloodhound',
    stat: 'reads',
    title: '🐕 Bloodhound',
    description: 'Most votes on the real imposter',
  },
  { id: 'thief', stat: 'steals', title: '🎯 Word Thief', description: 'Most last-chance steals' },
  {
    id: 'innocent',
    stat: 'suspicion',
    title: '😬 Suspiciously Innocent',
    description: 'Most votes received while innocent',
  },
];

/** Skip an award nobody earned; ties share it (one entry per holder). */
export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  for (const a of AWARDS) {
    const best = Math.max(0, ...state.seats.map((id) => state.stats[id]?.[a.stat] ?? 0));
    if (best <= 0) continue;
    const holders = state.seats.filter((id) => (state.stats[id]?.[a.stat] ?? 0) === best);
    // An award most of the table shares singles nobody out (a whole crew reading it right).
    if (holders.length * 2 > state.seats.length) continue;
    for (const id of state.seats)
      if ((state.stats[id]?.[a.stat] ?? 0) === best)
        out.push({ id: a.id, title: a.title, description: a.description, playerId: id });
  }
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awards(state));
}
