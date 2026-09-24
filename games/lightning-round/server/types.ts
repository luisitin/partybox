// State and input types for Lightning Round. Everything is JSON-serializable (docs/GAME_CONTRACT.md);
// questions are referenced by id so the state stays small and the content pack stays the truth.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['intro', 'question', 'reveal', 'wager', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const INTRO_MS = 4_000;
/** A regular reveal: the race (2 s), then the standings — the owner's note on I-589 asked for "a bit
 *  more time at the standings page" (5 s → 8 s: the standings hold 6 s, not 3), plus a Next button. */
export const REVEAL_MS = 8_000;
/** The final reveal keeps its 5 s: it has its own beats and no standings page (the results follow). */
export const FINAL_REVEAL_MS = 5_000;
export const WAGER_MS = 15_000;

/** Scoring constants (README "Scoring"). */
export const BASE_POINTS = 500;
export const SPEED_MAX_POINTS = 500;
export const STREAK_STEP_POINTS = 100;
export const STREAK_CAP_POINTS = 300;
export const WAGER_PERCENTS = [0, 25, 50, 75, 100] as const;
export type WagerPercent = (typeof WAGER_PERCENTS)[number];

export interface Settings {
  questions: number;
  answerSeconds: number;
  category: string;
  /** Ticked topics of `category` (empty = the whole category). */
  subcategories: string[];
}

export interface Pick {
  /** Chosen choice index 0–3. */
  index: number;
  /** How far into the answer window the pick arrived (pause-corrected, clamped to the window). */
  elapsedMs: number;
}

export interface PlayerStats {
  /** Correct answers over the whole game (regular + final). */
  correct: number;
  /** Sum of `elapsedMs` over correct answers; `correctMs / correct` is the "Lightning fingers" metric. */
  correctMs: number;
  bestStreak: number;
  /** Wager won on the final question (0 when lost or not wagered). */
  wagerWon: number;
}

export interface State extends GameStateBase {
  settings: Settings;
  /** Category the questions were actually drawn from: the setting, or `all` after a fallback. */
  drawnFrom: string;
  /** Topics actually drawn from (empty = the whole category; absent in older states). */
  drawnSubs?: string[];
  /** Drawn question ids: `settings.questions` regular ones followed by the final question. */
  questionIds: string[];
  /** Index into `questionIds` of the question being asked or just revealed; -1 during `intro`. */
  index: number;
  /** Picks for the current question; cleared when the next question starts. */
  picks: Record<string, Pick>;
  scores: Record<string, number>;
  /** Consecutive correct answers including the last one revealed. */
  streaks: Record<string, number>;
  /** Final-question wager amounts (points). Missing = 0. */
  wagers: Record<string, number>;
  /** Score change per player at the last reveal (negative on a lost wager). */
  lastDelta: Record<string, number>;
  stats: Record<string, PlayerStats>;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pick'), index: z.number().int().min(0).max(3) }),
  // A preset share, or (I-026, the owner) a custom stake in points — the server clamps it
  // (0…score, rounded down to tens); `amount` wins when both are sent.
  z.object({
    type: z.literal('wager'),
    percent: z
      .union([z.literal(0), z.literal(25), z.literal(50), z.literal(75), z.literal(100)])
      .optional(),
    amount: z.number().int().min(0).max(1_000_000).optional(),
  }),
]);
export type Input = z.infer<typeof inputSchema>;

/** True when `id` is a playing player (own property — `__proto__` and friends are not players). */
export function isPlayer(state: GameStateBase, id: string): boolean {
  return Object.hasOwn(state.players, id);
}

/** The final question is the last drawn id. */
export function isFinalIndex(state: State, index: number): boolean {
  return index === state.questionIds.length - 1;
}
