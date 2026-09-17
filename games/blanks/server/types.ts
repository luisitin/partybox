// State and input types for Blanks. Everything is JSON-serializable (docs/GAME_CONTRACT.md).
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['intro', 'answer', 'reveal', 'judge', 'result', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const DECK_PRESETS = ['mild', 'adults', 'wild', 'wild-only'] as const;
export type DeckPreset = (typeof DECK_PRESETS)[number];
export const JUDGE_MODES = ['vote', 'czar'] as const;
export type JudgeMode = (typeof JUDGE_MODES)[number];

export interface Settings {
  decks: DeckPreset;
  judge: JudgeMode;
  rounds: number;
  answerSeconds: number;
  rando: boolean;
  /** Clocks on picking, voting and the result; off = the room moves itself along with Next. */
  timed: boolean;
}

export interface Stats {
  /** playerId → votes received over the game (Crowd favourite). */
  votesReceived: Record<string, number>;
  /** playerId → cards played before half the answer time (Quick draw). */
  fastPlays: Record<string, number>;
}

export interface State extends GameStateBase {
  settings: Settings;
  /** Seat order (ids sorted): the judge rotates through it. */
  order: string[];
  /** Shuffled card ids not yet drawn; `discard` is reshuffled in when a deck runs dry. */
  blackDeck: string[];
  whiteDeck: string[];
  discard: string[];
  /** playerId → white card ids in hand (HAND_SIZE, fewer only when the decks run out). */
  hands: Record<string, string[]>;
  /** 1-based; 0 before the first intro. */
  round: number;
  /** The black card on stage (id into the content); null before round 1. */
  blackId: string | null;
  /** The judge this round (czar mode), else null. */
  czarId: string | null;
  /** submitterId (a player or RANDO) → white card ids in blank order. */
  submissions: Record<string, string[]>;
  /** Submitter ids in reveal / vote order (shuffled when the answer phase closes); the index is
   *  the anonymous slot the views and the vote input use. Empty until then. */
  slots: string[];
  /** reveal: which slot is being read. */
  revealIndex: number;
  /** voterId → slot voted for. */
  votes: Record<string, number>;
  /** result: the submitter ids that won the round (may be RANDO; empty = no winner). */
  winners: string[];
  scores: Record<string, number>;
  stats: Stats;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('play'),
    /** White card ids from the hand, in blank order; exactly the black card's pick. */
    cards: z.array(z.string().min(1).max(8)).min(1).max(3),
  }),
  z.object({
    type: z.literal('vote'),
    /** Anonymous slot (index into `slots`). */
    slot: z.number().int().min(0).max(15),
  }),
  /** Anyone moves an untimed phase along (answer, judge, result); ignored in timed rounds. */
  z.object({ type: z.literal('next') }),
]);
export type Input = z.infer<typeof inputSchema>;
export type PlayInput = Extract<Input, { type: 'play' }>;
export type VoteInput = Extract<Input, { type: 'vote' }>;
export type NextInput = Extract<Input, { type: 'next' }>;

export const HAND_SIZE = 10;
export const INTRO_MS = 5_000;
/** Extra answer seconds per white card beyond the first. */
export const EXTRA_PICK_S = 15;
/** A reveal card stays up 3.5 s plus 35 ms per character, capped at 8 s — a big room (more than
 *  BIG_ROOM cards) reads faster: 3 s + 25 ms/char, capped at 5.5 s, so twelve cards stay under a
 *  minute (review-loop #89). */
export const REVEAL_MIN_MS = 3_500;
export const REVEAL_PER_CHAR_MS = 35;
export const REVEAL_MAX_MS = 8_000;
export const BIG_ROOM = 8;
export const BIG_REVEAL_MIN_MS = 3_000;
export const BIG_REVEAL_PER_CHAR_MS = 25;
export const BIG_REVEAL_MAX_MS = 5_500;
/** Voting: 30 s, 45 s for a lone judge; a big room gets 45 s to scan its cards. */
export const JUDGE_VOTE_MS = 30_000;
export const JUDGE_CZAR_MS = 45_000;
export const BIG_JUDGE_MS = 45_000;
export const RESULT_MS = 8_000;
/** Untimed rounds: no clock on the screens, but a long hidden fallback so an idle room still ends. */
export const UNTIMED_ANSWER_MS = 180_000;
export const UNTIMED_JUDGE_MS = 120_000;
export const UNTIMED_RESULT_MS = 60_000;
export const WIN_POINTS = 1;
/** The phantom player's submitter id (the "rando" setting). */
export const RANDO = 'rando';
export const RANDO_NAME = 'Rando';
