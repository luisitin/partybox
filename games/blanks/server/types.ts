// State and input types for Blanks. Everything is JSON-serializable (docs/GAME_CONTRACT.md).
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = [
  'intro',
  'pick',
  'answer',
  'reveal',
  'judge',
  'result',
  'final',
  'done',
] as const;
export type PhaseId = (typeof PHASES)[number];

export const DECK_PRESETS = ['mild', 'adults', 'wild', 'wild-only'] as const;
export type DeckPreset = (typeof DECK_PRESETS)[number];
export const JUDGE_MODES = ['vote', 'czar'] as const;
export type JudgeMode = (typeof JUDGE_MODES)[number];

export interface Settings {
  decks: DeckPreset;
  judge: JudgeMode;
  rounds: number;
  /** I-147 B: play a sudden-death round when the top rank is shared (default on). */
  tieBreak: boolean;
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
  /** The night's best-liked card: the most votes any one card took, kept for the final board.
   *  Null until a card takes at least one vote (a judge's pick counts as one). */
  best: BestCard | null;
  /** One player winning round after round — the thing a room starts shouting about. Null the
   *  moment a round is shared, won by Rando or won by nobody (review-loop #236). */
  streak: Streak | null;
  /** The longest run anyone put together all night, for the results screen (review-loop #237). */
  bestRun: Streak | null;
}

export interface Streak {
  playerId: string;
  /** Rounds won in a row, counting the one just played. */
  runs: number;
}

export interface BestCard {
  /** The submitter (a player id, or RANDO). */
  submitterId: string;
  /** The black card it answered and the whites played on it. */
  blackId: string | null;
  cards: string[];
  votes: number;
  round: number;
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
  /** czar mode: the black cards the judge chooses between this round (the first is the default);
   *  empty in vote mode and once the round is under way. */
  blackChoices: string[];
  /** The judge this round (czar mode), else null. */
  czarId: string | null;
  /** Vote mode: the seat asked to read the cards out this round, rotating like the judge's does.
   *  Null in czar mode, where the judge reads (review-loop #248). */
  readerId: string | null;
  /** I-147 A: sudden death — the ids still tied for the top, or null when this is a normal round. */
  tied?: string[] | null;
  /** I-147 A: how many tie-breaks this game has played (capped, so a deadlock still ends). */
  tieBreaks?: number;
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
  /** playerId → new hands taken this game (REDRAWS_PER_GAME at most; the owner, 2026-09-21). */
  redraws: Record<string, number>;
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
  /** The judge picks the round's black card (czar mode, "pick" phase). */
  z.object({ type: z.literal('choose'), index: z.number().int().min(0).max(4) }),
  /** A whole new hand (answer phase, before playing; REDRAWS_PER_GAME per player per game). */
  z.object({ type: z.literal('redraw') }),
]);
export type Input = z.infer<typeof inputSchema>;
export type PlayInput = Extract<Input, { type: 'play' }>;
export type VoteInput = Extract<Input, { type: 'vote' }>;
export type ChooseInput = Extract<Input, { type: 'choose' }>;

export const HAND_SIZE = 10;
/** New hands a player may take in one game (the owner, 2026-09-21: "3x each game"). */
export const REDRAWS_PER_GAME = 3;
export const INTRO_MS = 5_000;
/** czar mode: how many black cards the judge chooses between, and how long they get (timed; a
 *  hidden 60 s fallback untimed — the default is the first card, so an idle judge never stalls). */
export const BLACK_CHOICES = 3;
export const PICK_MS = 20_000;
export const UNTIMED_PICK_MS = 60_000;
/** After the judge chooses, the choice holds the stage for a beat before picking opens. */
export const PICK_HOLD_MS = 1_400;
/** The last card in holds the stage for a beat ("Everyone's in!") before the reading starts. */
export const ALL_IN_MS = 1_500;
/** The last vote lands and the room gets a beat to see "That's everyone" before the result
 *  crossfades in — the vote's own tick is still ringing (review-loop #228). Shorter than the
 *  answer stage's beat: the room has been staring at these cards for half a minute. */
export const VOTES_IN_MS = 900;
/** Extra answer seconds per white card beyond the first. */
export const EXTRA_PICK_S = 15;
/** A reveal card is a 2–3 s presentation (owner, review-loop #151: "they abruptly pop and take
 *  5 seconds"): the sentence lands, its whites pop in over the first 0.9 s, then it holds — 1.9 s
 *  plus 16 ms per character, capped at 4 s. Measured over live games at 2.2 s + 18 ms the median
 *  card held 3.5 s, past the 2–3 s that was asked for, so the floor and the slope came down while
 *  the cap stayed: a 200-character Pick 3 still gets its four seconds (review-loop #216). A big
 *  room (more than BIG_ROOM cards) reads faster: 1.7 s + 12 ms/char, capped at 3.2 s, so twelve
 *  cards stay well under a minute. */
export const REVEAL_MIN_MS = 1_900;
export const REVEAL_PER_CHAR_MS = 16;
export const REVEAL_MAX_MS = 4_000;
export const BIG_ROOM = 8;
export const BIG_REVEAL_MIN_MS = 1_700;
export const BIG_REVEAL_PER_CHAR_MS = 12;
export const BIG_REVEAL_MAX_MS = 3_200;
/** Voting: 30 s, 45 s for a lone judge; a big room gets 45 s to scan its cards. */
export const JUDGE_VOTE_MS = 30_000;
export const JUDGE_CZAR_MS = 45_000;
/** A judge whose phone drops mid-vote (a locked screen, a Wi-Fi blip) gets this long to come back
 *  before the round ends without a winner — instead of at once (review-loop #351). */
export const JUDGE_GRACE_MS = 20_000;
export const BIG_JUDGE_MS = 45_000;
export const RESULT_MS = 8_000;
/** The final board's drumroll ("And the winner is…") before the engine's results screen. */
export const FINAL_MS = 4_000;
/** Untimed rounds: no clock on the screens, but a long hidden fallback so an idle room still ends. */
export const UNTIMED_ANSWER_MS = 180_000;
export const UNTIMED_JUDGE_MS = 120_000;
export const UNTIMED_RESULT_MS = 60_000;
export const WIN_POINTS = 1;
/** The phantom player's submitter id (the "rando" setting). */
export const RANDO = 'rando';
export const RANDO_NAME = 'Rando';
