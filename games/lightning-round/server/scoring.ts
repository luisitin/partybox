// Scoring for Lightning Round (README "Scoring"): base + speed + streak per regular question, the
// wager on the final, then awards and results. Pure functions over State; no phase logic here.
import { buildResults, speedPoints } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { questionById } from './content';
import {
  BASE_POINTS,
  SPEED_MAX_POINTS,
  STREAK_CAP_POINTS,
  STREAK_STEP_POINTS,
  WAGER_PERCENTS,
  isFinalIndex,
} from './types';
import type { PlayerStats, State, WagerPercent } from './types';

export const EMPTY_STATS: PlayerStats = { correct: 0, correctMs: 0, bestStreak: 0, wagerWon: 0 };

/** Points for a correct regular answer: 500 + speed (500 → 0 over the window) + streak bonus. */
export function questionPoints(elapsedMs: number, answerSeconds: number, streak: number): number {
  const speed = speedPoints(elapsedMs, answerSeconds * 1000, SPEED_MAX_POINTS, 0);
  const streakBonus = Math.min(STREAK_CAP_POINTS, STREAK_STEP_POINTS * Math.max(0, streak - 1));
  return BASE_POINTS + speed + streakBonus;
}

export { clampWager, wagerAmount } from './wager'; // I-752 A
import { wagerAmount } from './wager';

export interface WagerOption {
  percent: WagerPercent;
  amount: number;
}

/** The five wager buttons, minus duplicates: a 0-score player sees only "0". */
export function wagerOptions(score: number): WagerOption[] {
  const seen = new Set<number>();
  const out: WagerOption[] = [];
  for (const percent of WAGER_PERCENTS) {
    const amount = wagerAmount(score, percent);
    if (seen.has(amount)) continue;
    seen.add(amount);
    out.push({ percent, amount });
  }
  return out;
}

/**
 * Applies the outcome of the current question to scores, streaks, stats and lastDelta. Called once
 * when `reveal` starts. Regular question: correct = points, wrong/none = 0 and streak reset. Final:
 * correct = +wager, wrong/none = −wager (the only place a score can go down).
 */
export function scoreCurrentQuestion(state: State): State {
  const question = questionById(state.questionIds[state.index] ?? '');
  const final = isFinalIndex(state, state.index);
  const scores = { ...state.scores };
  const streaks = { ...state.streaks };
  const stats = { ...state.stats };
  const lastDelta: Record<string, number> = {};
  for (const id of Object.keys(state.players)) {
    const pick = state.picks[id];
    const correct =
      question !== undefined && pick !== undefined && pick.index === question.answerIndex;
    const previous = stats[id] ?? EMPTY_STATS;
    const streak = correct ? (streaks[id] ?? 0) + 1 : 0;
    const wager = state.wagers[id] ?? 0;
    let delta: number;
    // `0 - wager` (not `-wager`) so a lost 0 wager is +0, keeping views JSON-round-trippable.
    if (final) delta = correct ? wager : 0 - wager;
    else
      delta =
        correct && pick ? questionPoints(pick.elapsedMs, state.settings.answerSeconds, streak) : 0;
    scores[id] = (scores[id] ?? 0) + delta;
    streaks[id] = streak;
    lastDelta[id] = delta;
    stats[id] = {
      correct: previous.correct + (correct ? 1 : 0),
      correctMs: previous.correctMs + (correct && pick ? pick.elapsedMs : 0),
      bestStreak: Math.max(previous.bestStreak, streak),
      wagerWon: final && correct ? wager : previous.wagerWon,
    };
  }
  return { ...state, scores, streaks, stats, lastDelta };
}

function best(
  state: State,
  metric: (s: PlayerStats) => number | null,
  better: (a: number, b: number) => boolean,
): { id: string; value: number } | null {
  let top: { id: string; value: number } | null = null;
  // Sorted by id so ties are deterministic regardless of object key order.
  for (const id of Object.keys(state.players).sort()) {
    const value = metric(state.stats[id] ?? EMPTY_STATS);
    if (value === null) continue;
    if (top === null || better(value, top.value)) top = { id, value };
  }
  return top;
}

export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  const fingers = best(
    state,
    (s) => (s.correct >= 1 ? s.correctMs / s.correct : null),
    (a, b) => a < b,
  );
  if (fingers)
    out.push({
      id: 'lightning-fingers',
      title: 'Lightning fingers',
      description: `Fastest correct answers: ${(fingers.value / 1000).toFixed(1)} s on average`,
      playerId: fingers.id,
    });
  const streak = best(
    state,
    (s) => (s.bestStreak >= 2 ? s.bestStreak : null),
    (a, b) => a > b,
  );
  if (streak)
    out.push({
      id: 'hot-streak',
      title: 'Hot streak',
      description: `${streak.value} correct answers in a row`,
      playerId: streak.id,
    });
  const roller = best(
    state,
    (s) => (s.wagerWon >= 1 ? s.wagerWon : null),
    (a, b) => a > b,
  );
  if (roller)
    out.push({
      id: 'high-roller',
      title: 'High roller',
      description: `Won a ${roller.value}-point wager on the final question`,
      playerId: roller.id,
    });
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awards(state));
}
