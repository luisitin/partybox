// State and input types for Bingo (docs/game-ideas/001-bingo.html). Everything is JSON: the deck,
// every card, every daub — nothing here is secret, a card only reaches the TV when its owner claims.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['intro', 'play', 'check', 'bingo', 'scoreboard', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const PATTERNS = ['line', 'corners', 'x', 'blackout'] as const;
export type Pattern = (typeof PATTERNS)[number];

/** The VIP picks a pattern per round in the lobby (`round1` … `round5` settings). */
export const MAX_ROUNDS = 5;
/** Cards per player per round (`cards` setting): one is classic, four is a hall regular's table. */
export const MAX_CARDS = 4;

export interface Settings {
  rounds: number;
  /** One pattern per round, `patterns.length === rounds`. */
  patterns: Pattern[];
  /** Cards dealt to every player each round (1–4). */
  cards: number;
  callSeconds: number;
  spicy: boolean;
  /** TV extras the VIP can switch off at game selection (review-loop #2, owner request). */
  showBoard: boolean;
  showPrevious: boolean;
}

/** What the TV shows while a claim is checked (or celebrated). Computed once, never re-evaluated. */
export interface Claim {
  playerId: string;
  /** Which of the claimant's cards was checked (the closest one to the pattern). */
  cardIndex: number;
  /** The daubs the claim was evaluated with (the card itself is wiped on an invalid claim). */
  daubs: number[];
  /** The best completion of the pattern (most green cells). */
  cells: number[];
  /** Cells of that completion that are daubed AND called. */
  green: number[];
  /** Every daubed cell on the card whose number was never called. */
  red: number[];
  /** Cells of that completion not daubed. */
  missing: number[];
  valid: boolean;
}

export interface RoundState {
  /** 1-based. */
  number: number;
  pattern: Pattern;
  /** 1..75 shuffled at round start. */
  deck: number[];
  /** `deck.slice(0, drawn)` has been called; the current call is `deck[drawn - 1]`. */
  drawn: number;
  /** playerId → their cards; each is 25 numbers row-major, index 12 is 0 (FREE). */
  cards: Record<string, number[][]>;
  /** playerId → per card, sorted daubed indices (never 12; FREE is implicit). */
  daubs: Record<string, number[][]>;
  /** check: the invalid claim on the TV; bingo: the winner's card (null when the deck ran out). */
  claim: Claim | null;
  /** playerId → may claim again once `drawn >= this` (set after a failed claim). */
  waitForCall: Record<string, number>;
  winnerId: string | null;
}

export interface State extends GameStateBase {
  settings: Settings;
  round: RoundState;
  /** Rounds won. */
  wins: Record<string, number>;
  history: { round: number; winnerId: string | null; calls: number }[];
}

export const inputSchema = z.discriminatedUnion('type', [
  /** Toggles the square on card `card` (default the first); index 12 (FREE) is ignored. */
  z.object({
    type: z.literal('daub'),
    card: z
      .number()
      .int()
      .min(0)
      .max(MAX_CARDS - 1)
      .default(0),
    index: z.number().int().min(0).max(24),
  }),
  /** Checks the claimant's closest card to the pattern. */
  z.object({ type: z.literal('bingo') }),
]);
export type Input = z.infer<typeof inputSchema>;

export const INTRO_MS = 5_000;
export const CHECK_MS = 5_000;
export const BINGO_MS = 10_000;
export const SCOREBOARD_MS = 6_000;
export const DECK = 75;
export const FREE = 12;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
