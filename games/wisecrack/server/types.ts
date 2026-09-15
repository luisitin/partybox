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

export const INTRO_MS = 5_000;
export const VOTE_MS = 20_000;
export const REVEAL_MS = 6_000;
export const SCORES_MS = 8_000;
export const PROMPTS_PER_PLAYER = 2;
export const VOTE_POINTS = 100;
export const SWEEP_BONUS = 50;
/** What a blank answer reads as on the TV and the phones. */
export const NO_ANSWER = '(no answer)';
