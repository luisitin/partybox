// Scoring for Blanks: one point per round won (shared on a tie; Rando's wins pay nobody), locked
// in when the result phase starts. Awards and results() live here too.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { fillText } from './cards';
import { blackCard, whiteText } from './content';
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
  // I-149 A: a called shot is worth half. The winning SLOT is what was called, not the author.
  for (const [id, slot] of Object.entries(state.guesses ?? {}))
    if (Object.hasOwn(state.players, id) && winners.includes(state.slots[slot] ?? ''))
      scores[id] = (scores[id] ?? 0) + 0.5;
  for (const row of tally(state))
    if (row.submitterId !== RANDO && Object.hasOwn(state.players, row.submitterId))
      votesReceived[row.submitterId] = (votesReceived[row.submitterId] ?? 0) + row.votes;
  // A streak is one human winning outright, round after round: a shared point, a Rando win or a
  // round nobody won ends it (review-loop #236).
  const sole = winners.length === 1 && winners[0] !== RANDO ? winners[0] : null;
  const streak =
    sole === undefined || sole === null
      ? null
      : {
          playerId: sole,
          runs: state.stats.streak?.playerId === sole ? state.stats.streak.runs + 1 : 1,
        };
  // The longest run of the night is kept for the results screen, even after the run itself ends.
  const bestRun =
    streak && streak.runs > (state.stats.bestRun?.runs ?? 0) ? streak : state.stats.bestRun;
  return {
    ...state,
    winners,
    scores,
    stats: { ...state.stats, votesReceived, best, streak, bestRun },
  };
}

/** "1 card", "3 cards": a three-round night can hand out an award for a single one (review-loop #345). */
const count = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? '' : 's'}`;

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

/** An award line is one or two lines on the results screen: a long Pick 3 sentence is cut on a
 *  word boundary rather than wrapping the card off the stage. */
function shorten(text: string, max = 96): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max - 24 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export function awardsFor(state: State): GameAward[] {
  const out: GameAward[] = [];
  // The card of the night leads: it rides the results screen so the funniest thing anyone played
  // is still on the TV while the room talks about it, and on a phone the first award is the one
  // above the sticky button (review-loop #215). Rando's wins pay nobody, and a player who has left
  // keeps no award. Curly quotes around the sentence: plenty of cards carry straight quotes of
  // their own, and "a chapter called "this."" reads as a typo.
  // A judge's pick is one "vote" every round: "· 1 vote" reads as a poor turnout (review-loop
  // #116) and the crowd favourite would only restate the score, so czar mode names the round
  // instead and hands out no crowd award (review-loop #346).
  const czar = state.settings.judge === 'czar';
  const best = state.stats.best;
  if (best && Object.hasOwn(state.players, best.submitterId))
    out.push({
      id: 'card-of-the-night',
      title: 'Card of the night',
      description: `“${shorten(fillText(blackCard(best.blackId).text, best.cards.map(whiteText)))}” · ${czar ? `round ${best.round}` : count(best.votes, 'vote')}`,
      playerId: best.submitterId,
    });
  const crowd = czar ? null : leader(state, state.stats.votesReceived);
  if (crowd)
    out.push({
      id: 'crowd-favourite',
      title: 'Crowd favourite',
      description: `${count(state.stats.votesReceived[crowd] ?? 0, 'vote')} across the night`,
      playerId: crowd,
    });
  // "On a roll" only exists if somebody actually strung rounds together (review-loop #237).
  const run = state.stats.bestRun;
  if (run && run.runs >= 2 && Object.hasOwn(state.players, run.playerId))
    out.push({
      id: 'on-a-roll',
      title: 'On a roll',
      description: `${run.runs} rounds in a row`,
      playerId: run.playerId,
    });
  const quick = leader(state, state.stats.fastPlays);
  if (quick)
    out.push({
      id: 'quick-draw',
      title: 'Quick draw',
      description: `${count(state.stats.fastPlays[quick] ?? 0, 'card')} in before half time`,
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
