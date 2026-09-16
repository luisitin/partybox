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

export interface Settings {
  rounds: number;
  /** One pattern per round, `patterns.length === rounds`. */
  patterns: Pattern[];
  callSeconds: number;
  spicy: boolean;
}

/** What the TV shows while a claim is checked (or celebrated). Computed once, never re-evaluated. */
export interface Claim {
  playerId: string;
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
  /** playerId → 25 numbers row-major; index 12 is 0 (FREE). */
  cards: Record<string, number[]>;
  /** playerId → sorted daubed indices (never 12; FREE is implicit). */
  daubs: Record<string, number[]>;
  /** check: the invalid claim on the TV; bingo: the winner's card (null when the deck ran out). */
  claim: Claim | null;
  /** playerId → may claim again once `drawn >= this` (set after a failed claim). */
  waitForCall: Record<string, number>;
  winnerId: string | null;
  /**
   * Players who already won this round with the current pattern: the round may continue after a
   * bingo (same cards, same deck, calling resumes) and they keep playing, but their finished
   * pattern cannot win twice. Cleared when the pattern changes (continue for blackout).
   */
  settled: string[];
}

export interface State extends GameStateBase {
  settings: Settings;
  round: RoundState;
  /** Rounds won. */
  wins: Record<string, number>;
  history: { round: number; winnerId: string | null; calls: number }[];
}

export const inputSchema = z.discriminatedUnion('type', [
  /** Toggles the square; index 12 (FREE) is ignored. */
  z.object({ type: z.literal('daub'), index: z.number().int().min(0).max(24) }),
  z.object({ type: z.literal('bingo') }),
  /**
   * After a bingo (phase `bingo`): keep the round going on the same cards and deck — for the same
   * pattern (the winner sits that pattern out) or for a blackout on the same cards. Or move on.
   * The phones offer this to the VIP only (the view carries `vip`); the reducer accepts it from
   * any player with a card, the way a table would.
   */
  z.object({ type: z.literal('continue'), pattern: z.enum(['same', 'blackout']) }),
  z.object({ type: z.literal('next') }),
]);
export type Input = z.infer<typeof inputSchema>;

export const INTRO_MS = 5_000;
/** Long enough for the cell-by-cell reveal of a full card (≈ 0.9 + 24 × 0.22 + 0.7 s) plus reading. */
export const CHECK_MS = 9_000;
export const BINGO_MS = 10_000;
/** With a winner the celebration waits for the VIP's decision (keep going / next round). */
export const BINGO_DECIDE_MS = 90_000;
export const SCOREBOARD_MS = 6_000;
export const DECK = 75;
export const FREE = 12;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
