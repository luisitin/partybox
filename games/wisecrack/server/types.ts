// State and input types for Wisecrack. Everything is JSON-serializable (docs/GAME_CONTRACT.md).
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import { ANSWER_MAX_CHARS } from '../content/schema';

export const PHASES = ['intro', 'answer', 'vote', 'reveal', 'scores', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

/** One prompt of the current round. `authors` is already in display order (slot 0 / slot 1). */
export interface RoundPrompt {
  id: string;
  text: string;
  authors: [string, string];
}

export interface Settings {
  rounds: number;
  answerSeconds: number;
  spicy: boolean;
}

export interface Stats {
  /** playerId → votes received over the whole game (Crowd favourite). */
  votesReceived: Record<string, number>;
  /** playerId → unanimous wins with ≥ 2 votes cast (Sweep master). */
  sweeps: Record<string, number>;
  /** playerId → answers submitted in the first half of the answer time (Speed writer). */
  fastAnswers: Record<string, number>;
}

export interface State extends GameStateBase {
  settings: Settings;
  /** Shuffled prompt ids not yet drawn; rounds take from the front (no repeats across the game). */
  deck: string[];
  /** 1-based; 0 before the first intro. */
  round: number;
  /** The current round's prompts, in vote order. */
  prompts: RoundPrompt[];
  /** Index into `prompts` of the prompt being voted on / revealed. */
  promptIndex: number;
  /** promptId → authorId → trimmed answer. Missing = blank ("(no answer)"). */
  answers: Record<string, Record<string, string>>;
  /** promptId → voterId → authorId voted for. */
  votes: Record<string, Record<string, string>>;
  scores: Record<string, number>;
  /** Scores when the round started; the round scoreboard shows the difference. */
  roundStartScores: Record<string, number>;
  stats: Stats;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('answer'),
    promptId: z.string().min(1).max(40),
    text: z.string().min(1).max(ANSWER_MAX_CHARS),
  }),
  z.object({
    type: z.literal('vote'),
    promptId: z.string().min(1).max(40),
    /** Which of the two anonymous answers (index into `RoundPrompt.authors`). */
    slot: z.number().int().min(0).max(1),
  }),
]);
export type Input = z.infer<typeof inputSchema>;
export type AnswerInput = Extract<Input, { type: 'answer' }>;
export type VoteInput = Extract<Input, { type: 'vote' }>;

/** Owner's pacing rule (Agent Hub #decisions cc45f4, 2026-09-25): "Enough time to read" — a
 *  screen of words stays up 1.5 s + 1/3 s a word, x1.3 because a Spanish phone or 200 % text
 *  reads longer (the server cannot see the phones' languages, so the margin is always on). */
export function readMs(words: number): number {
  return Math.round((1_500 + words * 333) * 1.3);
}
export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}
/** The round card: "Round r of R" and its line (~10 words): readMs(10) ≈ 6.3 s (was 5 s). */
export const INTRO_MS = 7_000;
/** ADR-053: round 1's card follows the shell's start stage (rules, READY, 3 · 2 · 1), so it is a
 *  short title beat — "Round 1 of R" and its kicker — not a second read. Later rounds keep INTRO_MS. */
export const FIRST_INTRO_MS = 2_000;
export const VOTE_MS = 20_000;
/** A reveal: the TV's four beats land over 1.8 s, then the time to read what they brought — both
 *  answers again, two authors, every voter's name, the counts and points (~4 words) — at least
 *  REVEAL_MIN_MS. Was a flat 6 s (see server/phases/reveal.ts revealMs). */
export const REVEAL_BEATS_MS = 1_800;
export const REVEAL_MIN_MS = 8_000;
/** Scores between rounds: the VIP's Next, or this fallback (was a fixed 8 s). */
export const SCORES_MS = 45_000;
/** The final round's board is the drumroll into the results: no tap — time to read every row
 *  (~3 words a player + ~8), at least SCORES_FINAL_MIN_MS. */
export const SCORES_FINAL_MIN_MS = 10_000;
export const PROMPTS_PER_PLAYER = 2;
export const VOTE_POINTS = 100;
export const SWEEP_BONUS = 50;
/** What a blank answer reads as on the TV and the phones. */
export const NO_ANSWER = '(no answer)';
