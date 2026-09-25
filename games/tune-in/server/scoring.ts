// Scoring (spec §5.7): target bands, the psychic's average, the teams' needle and call, co-op's
// group total and rating, awards and results. Pure, integers only.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { majoritySide } from './teams';
import { callersOf, guessersOf, otherTeam } from './turn';
import type { PlayerStats, Side, State, TargetSize, TeamId } from './types';

/** The band edges per target size: [4 points, 3 points, 2 points]. */
export const BANDS: Record<TargetSize, readonly [number, number, number]> = {
  narrow: [4, 8, 12],
  normal: [5, 10, 15],
  wide: [6, 12, 20],
};

export function bandPoints(distance: number, size: TargetSize): number {
  const [four, three, two] = BANDS[size];
  const d = Math.abs(distance);
  if (d <= four) return 4;
  if (d <= three) return 3;
  if (d <= two) return 2;
  return 0;
}

/** Rounds half up with integers only: floor((2 × sum + n) / (2 × n)); 0 for no values. */
export function roundedAverage(values: readonly number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.floor((2 * sum + n) / (2 * n));
}

/** Solo psychic: the guessers' average points, plus 2 for a perfect tune (2+ dialled, all 4s). */
export function psychicPoints(guesserPoints: readonly number[]): number {
  const base = roundedAverage(guesserPoints);
  const perfect = guesserPoints.length >= 2 && guesserPoints.every((p) => p === 4);
  return base + (perfect ? 2 : 0);
}

export function isPerfectTune(state: State): boolean {
  const { turn } = state;
  if (state.mode !== 'solo' || turn.void) return false;
  const pts = guessersOf(state)
    .filter((id) => Object.hasOwn(turn.dials, id))
    .map((id) => turn.points[id] ?? 0);
  return pts.length >= 2 && pts.every((p) => p === 4);
}

/** The group needle (teams, co-op): the rounded average of the dials, or null when nobody dialled. */
export function needleOf(state: State): number | null {
  const dials = guessersOf(state)
    .filter((id) => Object.hasOwn(state.turn.dials, id))
    .map((id) => state.turn.dials[id] as number);
  return dials.length === 0 ? null : roundedAverage(dials);
}

/** Which side of the needle the target sits on (null when it is right on it). */
export function targetSide(target: number, needle: number): Side | null {
  if (target === needle) return null;
  return target < needle ? 'left' : 'right';
}

/** The calling team's majority tap, or null (tie, no taps). */
export function teamCall(state: State): Side | null {
  return majoritySide(state.turn.calls, callersOf(state));
}

function emptyStats(): PlayerStats {
  return { bulls: 0, dials: 0, dist: 0, zeros: 0, psyTurns: 0, psyPts: 0 };
}

/** Scores the turn at the reveal: points, team or group totals, and the award stats. */
export function scoreTurn(state: State): State {
  const { turn, cfg } = state;
  if (turn.void) return state;
  const stats = { ...state.stats };
  const bump = (id: string, patch: (s: PlayerStats) => PlayerStats): void => {
    stats[id] = patch(stats[id] ?? emptyStats());
  };
  const dialled = guessersOf(state).filter((id) => Object.hasOwn(turn.dials, id));
  const points: Record<string, number> = {};
  for (const id of dialled) {
    const dist = Math.abs((turn.dials[id] as number) - turn.target);
    const pts = bandPoints(dist, cfg.targetSize);
    points[id] = pts;
    bump(id, (s) => ({
      ...s,
      dials: s.dials + 1,
      dist: s.dist + dist,
      bulls: s.bulls + (pts === 4 ? 1 : 0),
      zeros: s.zeros + (pts === 0 ? 1 : 0),
    }));
  }
  const scores = { ...state.scores };
  const team = { ...state.team };
  const teamPoints: Record<TeamId, number> = { sun: 0, moon: 0 };
  let coopTotal = state.coopTotal;
  let psyPts = 0;
  const needle = state.mode === 'solo' ? null : needleOf(state);
  if (state.mode === 'solo') {
    psyPts = dialled.length > 0 ? psychicPoints(dialled.map((id) => points[id] ?? 0)) : 0;
    points[turn.psychic] = psyPts;
    for (const [id, pts] of Object.entries(points)) scores[id] = (scores[id] ?? 0) + pts;
  } else if (state.mode === 'coop') {
    psyPts = needle === null ? 0 : bandPoints(needle - turn.target, cfg.targetSize);
    coopTotal += psyPts;
    for (const id of state.seats) scores[id] = coopTotal;
  } else if (turn.team) {
    psyPts = needle === null ? 0 : bandPoints(needle - turn.target, cfg.targetSize);
    teamPoints[turn.team] = psyPts;
    const call = needle === null ? null : teamCall(state);
    if (call && needle !== null && psyPts < 4 && targetSide(turn.target, needle) === call)
      teamPoints[otherTeam(turn.team)] = 1;
    team.sun += teamPoints.sun;
    team.moon += teamPoints.moon;
    for (const [side, ids] of Object.entries(state.teams ?? {}))
      for (const id of ids) scores[id] = team[side as TeamId];
  }
  if (Object.hasOwn(state.players, turn.psychic))
    bump(turn.psychic, (s) => ({ ...s, psyTurns: s.psyTurns + 1, psyPts: s.psyPts + psyPts }));
  return {
    ...state,
    scores,
    team,
    coopTotal,
    stats,
    turn: { ...turn, needle, points, teamPoints },
  };
}

export type Rating = 'static' | 'tuning' | 'clear' | 'meld';

/** Co-op's verdict against the maximum (rounds × 4): under 35 %, 35–54, 55–74, 75 % or more. */
export function coopRating(total: number, rounds: number): Rating {
  const max = Math.max(1, rounds * 4);
  if (total * 100 >= 75 * max) return 'meld';
  if (total * 100 >= 55 * max) return 'clear';
  if (total * 100 >= 35 * max) return 'tuning';
  return 'static';
}

/** Everyone tied for the best value of `score` (skipping ids `eligible` rejects). */
function leaders(
  state: State,
  eligible: (s: PlayerStats) => boolean,
  better: (a: PlayerStats, b: PlayerStats) => number,
): string[] {
  const ids = state.seats.filter((id) => eligible(state.stats[id] ?? emptyStats()));
  if (ids.length === 0) return [];
  const best = ids.reduce((a, b) =>
    better(state.stats[b] ?? emptyStats(), state.stats[a] ?? emptyStats()) > 0 ? b : a,
  );
  const top = state.stats[best] ?? emptyStats();
  return ids.filter((id) => better(state.stats[id] ?? emptyStats(), top) === 0);
}

/** Ties share an award (spec §5.7), up to this many: a bigger tie is no honour, and the results
 *  listed the same card over and over (p10: six Sharpshooters at 16 players). */
export const MAX_SHARED_AWARD = 3;

function award(ids: string[], id: string, title: string, description: string): GameAward[] {
  if (ids.length > MAX_SHARED_AWARD) return [];
  return ids.map((playerId) => ({ id, title, description, playerId }));
}

/** Spec §5.7 awards: individual in every mode, skipped when nobody earned one, ties share. */
export function awardsFor(state: State): GameAward[] {
  const sharp = leaders(
    state,
    (s) => s.bulls > 0,
    (a, b) => a.bulls - b.bulls,
  );
  const signal = leaders(
    state,
    (s) => s.psyTurns > 0 && s.psyPts > 0,
    (a, b) => a.psyPts * b.psyTurns - b.psyPts * a.psyTurns,
  );
  const steady = leaders(
    state,
    (s) => s.dials >= 3,
    (a, b) => b.dist * a.dials - a.dist * b.dials,
  );
  const fuzz = leaders(
    state,
    (s) => s.zeros >= 2,
    (a, b) => a.zeros - b.zeros,
  );
  const n = (id: string | undefined, key: keyof PlayerStats): number =>
    id ? (state.stats[id]?.[key] ?? 0) : 0;
  return [
    ...award(sharp, 'sharpshooter', '🎯 Sharpshooter', `Bullseyes: ${n(sharp[0], 'bulls')}`),
    ...award(signal, 'clear-signal', '📡 Clear Signal', 'The best psychic in the room'),
    ...award(steady, 'steady-hand', '🧭 Steady Hand', 'The closest dials on average'),
    ...award(fuzz, 'static', '📺 Static', `Dials that scored nothing: ${n(fuzz[0], 'zeros')}`),
  ];
}

/** Co-op crowns everyone either way: the contract suite requires a winner (contract.test.ts
 *  "winnerIds.length > 0"), so the finale board carries the verdict — the spec's own fallback
 *  (§5.7), reported to the owner in NOTES.md. */
export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awardsFor(state));
}
