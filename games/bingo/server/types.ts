// State and input types for Bingo (docs/game-ideas/001-bingo.html). Everything is JSON: the deck,
// every card, every daub — nothing here is secret, a card only reaches the TV when its owner claims.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['intro', 'play', 'check', 'bingo', 'scoreboard', 'final', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const PATTERNS = ['line', 'corners', 'x', 'blackout', 'frame', 'stamp', 'tee'] as const; // I-093
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
  /** R2-01, the owner's note: the room is told who is one away (off by default). */
  showClose: boolean;
}

/** What the TV shows while a claim is checked (or celebrated). Computed once, never re-evaluated. */
/** How the room moves on after a bingo: keep going (same pattern / blackout) or next. */
/** A room choice after a bingo, and whose phone it came from (the TV names them — loop 261). */
export type Decision = ({ type: 'continue'; pattern: 'same' | 'blackout' } | { type: 'next' }) & {
  by: string;
};

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
  /** Bingos under the current pattern (reset when the round switches to blackout): "2nd bingo". */
  patternBingos: number;
  /**
   * bingo: a choice that arrived while the TV was still revealing the card — held until the
   * celebration is done (the phase deadline), then applied. Never two: the first one counts.
   */
  decision: Decision | null;
  /** I-105 A: the vote after a bingo — each phone's current choice (the VIP's flagged). */
  votes?: Record<string, { choice: Decision; at: number; vip: boolean }>;
  /** I-105 A: when the vote closes (6 s after the first choice, never before the read ends). */
  voteEndsAt?: number | null;
  /**
   * check / bingo: the TV's verdict has landed (the phase's first tick, at the end of the reveal —
   * ADR-033). A win is scored as it flips; the phones show nothing conclusive before it.
   */
  judged: boolean;
  /** When the verdict landed (the tick's `now`): the read and the choice are timed from it, not
   * from `phase.startedAt` — a VIP pause shifts deadlines, never the start (loop 294). */
  judgedAt: number | null;
  /** When the current number was called (a real call, not a countdown): the TV speaks and the
   * phones buzz on this stamp, so a menu hold or a countdown never re-calls it (loop 294). */
  calledAt: number | null;
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
  /**
   * play, during a resume countdown after "keep going" (loop 276): when the 3 · 2 · 1 ends the
   * number that was up is called again (`enterPlay(…, true)`), not the next one.
   */
  resumeAgain: boolean;
  /** play, during that countdown: who chose to keep going (their id), for the TV's line. */
  resumeBy: string | null;
  /** playerId → card indices already swapped at the intro (one "deal me another" per card). */
  swapped: Record<string, number[]>;
  /**
   * intro: who has tapped Ready (loop 344 — the owner: a real card-pick step). Once every
   * connected person with cards has (bots and the disconnected count as ready), the first
   * number is INTRO_READY_MS away — never before the deal plus the 3 · 2 · 1 (`introMinMs`).
   */
  ready: string[];
}

export interface State extends GameStateBase {
  settings: Settings;
  round: RoundState;
  /** Bingos won. */
  wins: Record<string, number>;
  history: { round: number; winnerId: string | null; calls: number }[];
  /** Points at the start of the current round: the scoreboard shows each row's gain as a delta. */
  winsAtRoundStart: Record<string, number>;
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
  /** intro: my cards are picked — start when everyone is. */
  z.object({ type: z.literal('ready') }),
]);
export type Input = z.infer<typeof inputSchema>;

/** The card-pick step's longest wait (loop 344); everyone ready ends it sooner. */
export const INTRO_MS = 15_000;
/**
 * The deal (loop 345 — the owner: "slow it down, about a second a card"): the first card lands
 * DEAL_START_MS in, each next one DEAL_STEP_MS later, the pluck DEAL_BOUNCE_MS after each landing.
 * Mirrored by the phones' and the TV's animations (Controller.module.css, TvCountdown.tsx).
 */
export const DEAL_START_MS = 400;
export const DEAL_STEP_MS = 1_000;
export const DEAL_BOUNCE_MS = 250;
/** When the last card is down, for `cards` per player. */
export function dealDoneMs(cards: number): number {
  return DEAL_START_MS + Math.max(0, cards - 1) * DEAL_STEP_MS + DEAL_BOUNCE_MS + 300;
}
/** The first number is never sooner than the deal plus the 3 · 2 · 1, whoever is ready. */
export function introMinMs(cards: number): number {
  return dealDoneMs(cards) + INTRO_BREATH_MS + INTRO_READY_MS + 600;
}
/** Everyone ready: the first number is this far away (the 3 · 2 · 1)… */
export const INTRO_READY_MS = 3_000;
/**
 * …after a breath: the last Ready's lock tick and the ring's first tick were 30 ms apart (loop
 * 349); "everyone is ready" holds this long before the 3 · 2 · 1 starts.
 */
export const INTRO_BREATH_MS = 400;
/** The dibs window after the first BINGO! tap. */
export const ARM_MS = 3_000;
/** The 3 · 2 · 1 after the last card-style menu closes. */
export const RESUME_MS = 3_000;
/** No winner (the deck ran out): the TV says so for this long. */
export const BINGO_MS = 10_000;
/**
 * With a winner the celebration is not paced: it waits for a phone. This is only a safety valve
 * so an abandoned room (a bots-only game) does not sit on the verdict forever.
 */
export const BINGO_ABANDONED_MS = 5 * 60_000;
/** I-105 A: the vote after a bingo runs this long from its first choice (the note's six seconds). */
export const VOTE_MS = 6_000;
export const SCOREBOARD_MS = 6_000;
export const DECK = 75;
export const FREE = 12;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
/** The final board with the crown withheld ("and the winner is…") before the results fanfare. */
export const FINAL_MS = 4_000;
