// Scoring for Wisecrack: 100 x multiplier per vote, +50 x multiplier for a unanimous win with at
// least two votes cast ("sweep"); the last round doubles. Awards and results() live here too.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { answerOf, isLastRound } from './round';
import { SWEEP_BONUS, VOTE_POINTS } from './types';
import type { RoundPrompt, State } from './types';

export interface AuthorTally {
  slot: number;
  playerId: string;
  /** null = blank answer. */
  text: string | null;
  voterIds: string[];
  votes: number;
  points: number;
  sweep: boolean;
}

export function multiplierFor(state: State): number {
  return isLastRound(state) ? 2 : 1;
}

/** Votes, points and sweep per author of one prompt, from the votes cast so far. */
export function tallyPrompt(state: State, prompt: RoundPrompt): AuthorTally[] {
  const multiplier = multiplierFor(state);
  const votes = state.votes[prompt.id] ?? {};
  const cast = Object.keys(votes).length;
  // A single-player pairing (never in a real game) would list the same author twice.
  const authors = [...new Set(prompt.authors)];
  return authors.map((playerId) => {
    const voterIds = Object.keys(votes)
      .filter((voterId) => votes[voterId] === playerId)
      .sort();
    const sweep = cast >= 2 && voterIds.length === cast;
    const points =
      voterIds.length * VOTE_POINTS * multiplier + (sweep ? SWEEP_BONUS * multiplier : 0);
    return {
      slot: prompt.authors.indexOf(playerId),
      playerId,
      text: answerOf(state, prompt.id, playerId),
      voterIds,
      votes: voterIds.length,
      points,
      sweep,
    };
  });
}

/** Adds a tally to the scores and the award stats. Called exactly once per prompt (reveal entry). */
export function applyTally(state: State, tallies: AuthorTally[]): State {
  const scores = { ...state.scores };
  const votesReceived = { ...state.stats.votesReceived };
  const sweeps = { ...state.stats.sweeps };
  for (const t of tallies) {
    scores[t.playerId] = (scores[t.playerId] ?? 0) + t.points;
    votesReceived[t.playerId] = (votesReceived[t.playerId] ?? 0) + t.votes;
    if (t.sweep) sweeps[t.playerId] = (sweeps[t.playerId] ?? 0) + 1;
  }
  return { ...state, scores, stats: { ...state.stats, votesReceived, sweeps } };
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
  const sweeper = leader(state, state.stats.sweeps);
  if (sweeper)
    out.push({
      id: 'sweep-master',
      title: 'Sweep master',
      description: `Unanimous wins: ${state.stats.sweeps[sweeper] ?? 0}`,
      playerId: sweeper,
    });
  const speedy = leader(state, state.stats.fastAnswers);
  if (speedy)
    out.push({
      id: 'speed-writer',
      title: 'Speed writer',
      description: `Answers in before half time: ${state.stats.fastAnswers[speedy] ?? 0}`,
      playerId: speedy,
    });
  return out;
}

export interface StandingRow {
  playerId: string;
  score: number;
  rank: number;
  /** Points gained since the round started. */
  delta: number;
}

/** Ranked standings with the round delta, for the scoreboard views. */
export function standings(state: State): StandingRow[] {
  const complete: Record<string, number> = {};
  for (const id of Object.keys(state.players)) complete[id] = state.scores[id] ?? 0;
  return rank(complete).map((row) => ({
    ...row,
    delta: row.score - (state.roundStartScores[row.playerId] ?? 0),
  }));
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awardsFor(state));
}
