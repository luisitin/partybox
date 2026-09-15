// TV and controller views (docs/GAME_CONTRACT.md "Views"). Hidden information is omitted by KEY,
// never nulled: `correctIndex`, `pickIndex` and `wagerAmount` only exist once the stage may show
// them (__tests__/contract.config.ts asserts those key names never leak early).
import { controllerEnvelope, envelope, rank } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { categoryLabel, questionById } from './content';
import { wagerOptions } from './scoring';
import type { WagerOption } from './scoring';
import { isFinalIndex } from './types';
import type { State } from './types';

export interface RoundView {
  /** 1-based number of the current question; the final question is `total + 1`. */
  number: number;
  /** Regular questions in this game. */
  total: number;
  final: boolean;
}

export interface QuestionView {
  id: string;
  categoryLabel: string;
  difficulty: string;
  text: string;
  choices: string[];
}

export interface RevealRow {
  playerId: string;
  name: string;
  avatarId: string;
  connected: boolean;
  pickIndex: number | null;
  correct: boolean;
  /** Score change at this reveal (negative on a lost wager). */
  delta: number;
  streak: number;
  score: number;
  /** Final reveal only. */
  wagerAmount?: number;
}

export interface StandingRow {
  playerId: string;
  name: string;
  avatarId: string;
  connected: boolean;
  score: number;
  rank: number;
}

export interface LightningTvView extends TvView {
  categoryLabel: string;
  round: RoundView | null;
  /** From `question` on; the correct choice is only marked via `correctIndex` in `reveal`. */
  question: QuestionView | null;
  /** Picks (in `question`) or wagers (in `wager`) received from connected players. */
  answeredCount: number;
  totalCount: number;
  correctIndex?: number;
  /** `reveal`: one row per player, correct first, then by score. */
  rows?: RevealRow[];
  /** `reveal`, `wager` and `done`: ranked standings. */
  standings?: StandingRow[];
}

export interface LightningControllerView extends ControllerView {
  round: RoundView | null;
  question: QuestionView | null;
  myPickIndex: number | null;
  myScore: number;
  myStreak: number;
  correctIndex?: number;
  /** `reveal`: how this player did. */
  outcome?: { correct: boolean; delta: number };
  /** `wager`: the buttons for this player (0-score players only see 0). */
  wagerChoices?: WagerOption[];
  /** Own wager once placed (from `wager` through the final reveal). */
  myWagerAmount?: number;
  myRank?: number;
}

export function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (state.phase.id === 'question')
      return Object.hasOwn(state.picks, id) ? 'submitted' : 'active';
    if (state.phase.id === 'wager') return Object.hasOwn(state.wagers, id) ? 'submitted' : 'active';
    return 'waiting';
  };
}

export function roundOf(state: State): RoundView | null {
  if (state.index < 0 || state.questionIds.length === 0) return null;
  return {
    number: state.index + 1,
    total: Math.max(0, state.questionIds.length - 1),
    final: isFinalIndex(state, state.index),
  };
}

export function questionOf(state: State): QuestionView | null {
  if (state.index < 0) return null;
  const q = questionById(state.questionIds[state.index] ?? '');
  if (!q) return null;
  return {
    id: q.id,
    categoryLabel: categoryLabel(q.category),
    difficulty: q.difficulty,
    text: q.question,
    choices: [...q.choices],
  };
}

function connectedCount(state: State): number {
  return Object.values(state.players).filter((p) => p.connected).length;
}

export function standingsOf(state: State): StandingRow[] {
  return rank(state.scores).flatMap((r) => {
    const p = state.players[r.playerId];
    return p
      ? [
          {
            playerId: p.id,
            name: p.name,
            avatarId: p.avatarId,
            connected: p.connected,
            score: r.score,
            rank: r.rank,
          },
        ]
      : [];
  });
}

function revealRows(state: State, correctIndex: number, final: boolean): RevealRow[] {
  const rows = Object.values(state.players).map((p) => {
    const row: RevealRow = {
      playerId: p.id,
      name: p.name,
      avatarId: p.avatarId,
      connected: p.connected,
      pickIndex: state.picks[p.id]?.index ?? null,
      correct: state.picks[p.id]?.index === correctIndex,
      delta: state.lastDelta[p.id] ?? 0,
      streak: state.streaks[p.id] ?? 0,
      score: state.scores[p.id] ?? 0,
    };
    if (final) row.wagerAmount = state.wagers[p.id] ?? 0;
    return row;
  });
  return rows.sort(
    (a, b) =>
      Number(b.correct) - Number(a.correct) ||
      b.score - a.score ||
      a.playerId.localeCompare(b.playerId),
  );
}

export function tvView(state: State, gameId: string): LightningTvView {
  const phase = state.phase.id;
  const view: LightningTvView = {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    categoryLabel: categoryLabel(state.drawnFrom),
    round: roundOf(state),
    question: phase === 'question' || phase === 'reveal' ? questionOf(state) : null,
    answeredCount:
      phase === 'question'
        ? Object.keys(state.picks).length
        : phase === 'wager'
          ? Object.keys(state.wagers).length
          : 0,
    totalCount: connectedCount(state),
  };
  if (phase === 'reveal') {
    const q = questionById(state.questionIds[state.index] ?? '');
    if (q) {
      view.correctIndex = q.answerIndex;
      view.rows = revealRows(state, q.answerIndex, isFinalIndex(state, state.index));
    }
    view.standings = standingsOf(state);
  }
  if (phase === 'wager' || phase === 'done') view.standings = standingsOf(state);
  return view;
}

export function controllerView(
  state: State,
  gameId: string,
  playerId: string,
): LightningControllerView {
  const phase = state.phase.id;
  // Own-property checks: an id like "__proto__" must read as a spectator, not Object.prototype.
  const me = Object.hasOwn(state.players, playerId);
  const score = me ? (state.scores[playerId] ?? 0) : 0;
  const myPick = me && Object.hasOwn(state.picks, playerId) ? state.picks[playerId] : undefined;
  const view: LightningControllerView = {
    ...controllerEnvelope(state, gameId, playerId, {
      statusOf: statusOf(state),
      scores: state.scores,
    }),
    round: roundOf(state),
    question: phase === 'question' || phase === 'reveal' ? questionOf(state) : null,
    myPickIndex: myPick?.index ?? null,
    myScore: score,
    myStreak: me ? (state.streaks[playerId] ?? 0) : 0,
  };
  const final = isFinalIndex(state, state.index);
  if (phase === 'reveal') {
    const q = questionById(state.questionIds[state.index] ?? '');
    if (q) {
      view.correctIndex = q.answerIndex;
      view.outcome = {
        correct: myPick?.index === q.answerIndex,
        delta: me ? (state.lastDelta[playerId] ?? 0) : 0,
      };
    }
  }
  if (phase === 'wager' && me) view.wagerChoices = wagerOptions(score);
  const wagerVisible = phase === 'wager' || ((phase === 'question' || phase === 'reveal') && final);
  if (wagerVisible && me && Object.hasOwn(state.wagers, playerId))
    view.myWagerAmount = state.wagers[playerId];
  if (phase === 'done') view.myRank = standingsOf(state).find((r) => r.playerId === playerId)?.rank;
  return view;
}
