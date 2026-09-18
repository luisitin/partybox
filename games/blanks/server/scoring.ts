// Scoring for Blanks: one point per round won (shared on a tie; Rando's wins pay nobody), locked
// in when the result phase starts. Awards and results() live here too.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { roundWinners, tally } from './round';
import { RANDO, WIN_POINTS } from './types';
import type { State } from './types';

/** Applies the round: winners, points and the vote stats. Called once per round (result entry). */
export function applyRound(state: State): State {
  const winners = roundWinners(state);
  const scores = { ...state.scores };
  const votesReceived = { ...state.stats.votesReceived };
  // The night's best-liked card: the most votes any single card has taken (ties keep the first).
  let best = state.stats.best;
  for (const row of tally(state))
    if (row.votes > 0 && row.votes > (best?.votes ?? 0))
      best = {
        submitterId: row.submitterId,
        blackId: state.blackId,
        cards: [...row.cards],
        votes: row.votes,
        round: state.round,
      };
  for (const id of winners)
    if (id !== RANDO && Object.hasOwn(state.players, id))
      scores[id] = (scores[id] ?? 0) + WIN_POINTS;
  for (const row of tally(state))
    if (row.submitterId !== RANDO && Object.hasOwn(state.players, row.submitterId))
      votesReceived[row.submitterId] = (votesReceived[row.submitterId] ?? 0) + row.votes;
  return { ...state, winners, scores, stats: { ...state.stats, votesReceived, best } };
}

/** Player with the highest stat (> 0); ties go to the higher total score, then the lower id. */
function leader(state: State, stat: Record<string, number>): string | null {
  const ids = Object.keys(state.players).filter((id) => (stat[id] ?? 0) > 0);
  ids.sort(
    (a, b) =>
      (stat[b] ?? 0) - (stat[a] ?? 0) ||
      (state.scores[b] ?? 0) - (state.scores[a] ?? 0) ||
      a.localeCompare(b),
  );
  return ids[0] ?? null;
}

export function awardsFor(state: State): GameAward[] {
  const out: GameAward[] = [];
  const crowd = leader(state, state.stats.votesReceived);
  if (crowd)
    out.push({
      id: 'crowd-favourite',
      title: 'Crowd favourite',
      description: `Most votes received: ${state.stats.votesReceived[crowd] ?? 0}`,
      playerId: crowd,
    });
  const quick = leader(state, state.stats.fastPlays);
  if (quick)
    out.push({
      id: 'quick-draw',
      title: 'Quick draw',
      description: `Cards played before half time: ${state.stats.fastPlays[quick] ?? 0}`,
      playerId: quick,
    });
  return out;
}

export interface StandingRow {
  playerId: string;
  score: number;
  rank: number;
}

export function standings(state: State): StandingRow[] {
  const complete: Record<string, number> = {};
  for (const id of Object.keys(state.players)) complete[id] = state.scores[id] ?? 0;
  return rank(complete);
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awardsFor(state));
}
