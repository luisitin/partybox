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
  /** The latest bingo's owner (the celebration); null when the deck ran out. */
  winnerId: string | null;
  /**
   * playerId → card indices that already won the current pattern this round. The round may keep
   * going after a bingo (same cards, same deck, calling resumes): a card that won sits that
   * pattern out while the player's other cards play on. Cleared when the pattern changes
   * (continue for blackout). A one-card player who won is done until the next round.
   */
  won: Record<string, number[]>;
  /** Bingos this round so far (a continued round celebrates more than one). */
  bingos: number;
  /**
   * A claim takes two taps. The first arms one card for ARM_MS: the player has dibs, and a second
   * tap on that card claims it. Other players' first taps queue behind; a lapsed window passes to
   * the next in line (`queue`, in order). Cleared by a claim or the end of the phase.
   */
  arm: { playerId: string; card: number; until: number } | null;
  queue: { playerId: string; card: number }[];
  /** Players with the card-style menu open: the caller holds while any phone has it open. */
  menus: string[];
  /** After the last menu closes: calling resumes at this time (a 3 · 2 · 1 on every screen). */
  resumeAt: number | null;
  /** playerId → card indices already swapped at the intro (one "deal me another" per card). */
  swapped: Record<string, number[]>;
}

export interface State extends GameStateBase {
  settings: Settings;
  round: RoundState;
  /** Bingos won. */
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
  /**
   * BINGO! on one card: the first tap arms it (dibs for ARM_MS), the second tap on the same card
   * claims it. A tap on another of your cards re-arms there. Never "your best card".
   */
  z.object({
    type: z.literal('bingo'),
    card: z
      .number()
      .int()
      .min(0)
      .max(MAX_CARDS - 1)
      .default(0),
  }),
  /** The armed phone's own countdown ran out: pass dibs on (the next call tick would too). */
  z.object({ type: z.literal('lapse') }),
  /** The card-style menu opened or closed on this phone; the caller holds while any is open. */
  z.object({ type: z.literal('menu'), open: z.boolean() }),
  /** Intro only: one fresh deal per card ("deal me another"); the old card is gone for good. */
  z.object({
    type: z.literal('swap'),
    card: z
      .number()
      .int()
      .min(0)
      .max(MAX_CARDS - 1)
      .default(0),
  }),
  /**
   * After a bingo (phase `bingo`): keep the round going on the same cards and deck — for the same
   * pattern (the card that won sits it out) or for a blackout on the same cards. Or move on.
   * Every phone with a card offers it — first tap wins, the way a table would — and nothing
   * moves on by itself: the celebration waits.
   */
  z.object({ type: z.literal('continue'), pattern: z.enum(['same', 'blackout']) }),
  z.object({ type: z.literal('next') }),
]);
export type Input = z.infer<typeof inputSchema>;

export const INTRO_MS = 5_000;
/** The dibs window after the first BINGO! tap. */
export const ARM_MS = 3_000;
/** The 3 · 2 · 1 after the last card-style menu closes. */
export const RESUME_MS = 3_000;
/** Long enough for the cell-by-cell reveal of a full card (≈ 0.9 + 24 × 0.22 + 0.7 s) plus reading. */
export const CHECK_MS = 11_000; // the reveal takes ~6.4 s; the verdict stays up a few seconds
/** No winner (the deck ran out): the TV says so for this long. */
export const BINGO_MS = 10_000;
/**
 * With a winner the celebration is not paced: it waits for a phone. This is only a safety valve
 * so an abandoned room (a bots-only game) does not sit on the verdict forever.
 */
export const BINGO_ABANDONED_MS = 5 * 60_000;
export const SCOREBOARD_MS = 6_000;
export const DECK = 75;
export const FREE = 12;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
