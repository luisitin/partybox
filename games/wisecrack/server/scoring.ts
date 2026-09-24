// Scoring for Wisecrack: 100 x multiplier per vote, +50 x multiplier for a unanimous win with at
// least two votes cast ("sweep"); the last round doubles. A walkover (the other answer is blank)
// pays one vote's worth without a vote. Awards and results() live here too.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { answerOf, isLastRound, isWalkover } from './round';
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
  /** Won without a vote: the other answer was blank. */
  walkover: boolean;
}

/** The last round of a multi-round game pays double; a one-round game has no "last" round. */
export function multiplierFor(state: State): number {
  return state.settings.rounds > 1 && isLastRound(state) ? 2 : 1;
}

/** Votes, points and sweep per author of one prompt, from the votes cast so far. */
export function tallyPrompt(state: State, prompt: RoundPrompt): AuthorTally[] {
  const multiplier = multiplierFor(state);
  const votes = state.votes[prompt.id] ?? {};
  const cast = Object.keys(votes).length;
  // A single-player pairing (never in a real game) would list the same author twice.
  const authors = [...new Set(prompt.authors)];
  const contest = !isWalkover(state, prompt);
  return authors.map((playerId) => {
    const text = answerOf(state, prompt.id, playerId);
    const voterIds = Object.keys(votes)
      .filter((voterId) => votes[voterId] === playerId)
      .sort();
    const sweep = contest && cast >= 2 && voterIds.length === cast;
    const walkover = !contest && text !== null;
    const points = walkover
      ? VOTE_POINTS * multiplier
      : voterIds.length * VOTE_POINTS * multiplier + (sweep ? SWEEP_BONUS * multiplier : 0);
    return {
      slot: prompt.authors.indexOf(playerId),
      playerId,
      text,
      voterIds,
      votes: voterIds.length,
      points,
      sweep,
      walkover,
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

/** Player with the highest stat (> 0); ties go to one without an award yet, then the higher total score, then the lower id. */
function leader(
  state: State,
  stat: Record<string, number>,
  won: Set<string> = new Set(),
): string | null {
  const ids = Object.keys(state.players).filter((id) => (stat[id] ?? 0) > 0);
  // I-474 A: a tied stat goes to someone without an award yet, before the higher score
  ids.sort(
    (a, b) =>
      (stat[b] ?? 0) - (stat[a] ?? 0) ||
      Number(won.has(a)) - Number(won.has(b)) ||
      (state.scores[b] ?? 0) - (state.scores[a] ?? 0) ||
      a.localeCompare(b),
  );
  const top = ids[0];
  return top === undefined ? null : claim(won, top);
}

/** I-474: an award is taken — remembered so the next award prefers someone else on a tie. */
function claim(won: Set<string>, id: string): string {
  won.add(id);
  return id;
}

export function awardsFor(state: State): GameAward[] {
  const out: GameAward[] = [];
  // I-474: who already holds an award tonight
  const won = new Set<string>();
  const crowd = leader(state, state.stats.votesReceived, won);
  if (crowd)
    out.push({
      id: 'crowd-favourite',
      title: 'Crowd favourite',
      description: `Most votes received: ${state.stats.votesReceived[crowd] ?? 0}`,
      playerId: crowd,
    });
  const sweeper = leader(state, state.stats.sweeps, won);
  if (sweeper)
    out.push({
      id: 'sweep-master',
      title: 'Sweep master',
      description: `Unanimous wins: ${state.stats.sweeps[sweeper] ?? 0}`,
      playerId: sweeper,
    });
  const speedy = leader(state, state.stats.fastAnswers, won);
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
