// Round-level rules shared by the phases (SPEC §9.9): agents left, who has won, a fresh turn, the
// history entry for the clue in play. Pure helpers; phase order lives in flow.ts.
import type { Flip, Kind, State, Stats, Team, Turn } from './types';

export function freshTurn(team: Team, n: number, spymaster: string | null): Turn {
  return {
    team,
    n,
    spymaster,
    clue: null,
    clueError: null,
    left: 0,
    made: 0,
    pointers: {},
    firsts: {},
    reactions: {},
    flip: null,
    ended: null,
    newSpymaster: null,
  };
}

/** Agents of `kind` still face down (a card turning counts as found: the TV already shows it). */
export function agentsLeft(state: State, kind: Kind): number {
  let n = 0;
  state.key.forEach((k, i) => {
    if (k === kind && state.flipped[i] === 0) n++;
  });
  return n;
}

export function totalAgents(state: State, team: Team): number {
  return state.key.filter((k) => k === team).length;
}

/** After a flip: the round's outcome, or null to play on. */
export function outcome(
  state: State,
  flipped: Kind,
): { winner: Team | null; reason: 'agents' | 'assassin' } | null {
  const team = state.turn.team;
  if (flipped === 'assassin')
    return {
      winner: state.mode === 'coop' ? null : team === 'sun' ? 'moon' : 'sun',
      reason: 'assassin',
    };
  // Whoever flipped them, a team whose agents are all face up wins — the flipping team first.
  const order: Team[] = team === 'sun' ? ['sun', 'moon'] : ['moon', 'sun'];
  for (const t of order)
    if (totalAgents(state, t) > 0 && agentsLeft(state, t) === 0)
      return { winner: t, reason: 'agents' };
  return null;
}

/** The turn cap (§9.9): fewer agents left wins; equal is a draw. */
export function capWinner(state: State): Team | 'draw' {
  const sun = agentsLeft(state, 'sun');
  const moon = agentsLeft(state, 'moon');
  return sun === moon ? 'draw' : sun < moon ? 'sun' : 'moon';
}

export function emptyStats(): Stats {
  return { clues: 0, agentsFromClues: 0, bestClue: 0, sharp: 0, trap: 0 };
}

export function bumpStats(state: State, id: string, change: Partial<Stats>): State {
  if (!Object.hasOwn(state.stats, id)) return state;
  const s = state.stats[id] ?? emptyStats();
  const next: Stats = { ...s };
  for (const k of Object.keys(change) as (keyof Stats)[]) next[k] = change[k] ?? s[k];
  return { ...state, stats: { ...state.stats, [id]: next } };
}

/** Records a flip on the clue in play (the last history entry of this round and team). */
export function logFlip(state: State, flip: Flip): State {
  const last = state.history[state.history.length - 1];
  if (!last || last.round !== state.round || last.team !== state.turn.team) return state;
  const entry = { ...last, flips: [...last.flips, flip] };
  return { ...state, history: [...state.history.slice(0, -1), entry] };
}

/** Own agents found by the clue in play so far. */
export function foundThisClue(state: State): number {
  const last = state.history[state.history.length - 1];
  if (!last || last.round !== state.round) return 0;
  return last.flips.filter((f) => f.kind === last.team).length;
}
