// The final board's two halves: the standings rows (names and avatars on the engine's ranking) and
// the card of the night — the single card that took the most votes all game (README "Scoring").
import { blackCard, whiteText } from './content';
import { standings } from './scoring';
import { RANDO, RANDO_NAME } from './types';
import type { State } from './types';

/** Somebody is on a run: the round card says so from two rounds on (review-loop #236). */
export interface StreakView {
  name: string;
  avatarId: string;
  runs: number;
}

export interface StandingsRow {
  playerId: string;
  name: string;
  avatarId: string;
  connected: boolean;
  score: number;
  rank: number;
}

/** The night's best-liked card, filled in and credited (final board). */
export interface BestCardView {
  black: string;
  whites: string[];
  name: string;
  avatarId: string;
  rando: boolean;
  votes: number;
  round: number;
}

/** The streak, only once it is worth saying out loud (two rounds) and only for a player still
 *  in the room. */
export function streakView(state: State): StreakView | null {
  const streak = state.stats.streak;
  if (!streak || streak.runs < 2) return null;
  const p = state.players[streak.playerId];
  return p ? { name: p.name, avatarId: p.avatarId, runs: streak.runs } : null;
}

export function standingsRows(state: State): StandingsRow[] {
  return standings(state).map((row) => {
    const p = state.players[row.playerId];
    return {
      ...row,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      connected: !!p?.connected,
    };
  });
}

export function bestCardView(state: State): BestCardView | null {
  const best = state.stats.best;
  if (!best) return null;
  const p = state.players[best.submitterId];
  const rando = best.submitterId === RANDO;
  return {
    black: blackCard(best.blackId).text,
    whites: best.cards.map(whiteText),
    name: rando ? RANDO_NAME : (p?.name ?? '?'),
    avatarId: rando ? 'robot' : (p?.avatarId ?? 'ghost'),
    rando,
    votes: best.votes,
    round: best.round,
  };
}
