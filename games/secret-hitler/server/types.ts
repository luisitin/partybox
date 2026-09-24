// State and input types for Secret Hitler (M1: the Classic rules of record). Keep everything JSON
// (docs/GAME_CONTRACT.md). Rule ids (R1…, D1…) point at docs/game-pack/secret-hitler/SPEC.md.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = [
  'seating',
  'nominate',
  'vote',
  'voteReveal',
  'hitlerCheck',
  'presDraw',
  'chanEnact',
  'vetoAsk',
  'enactReveal',
  'claims',
  'power',
  'powerReveal',
  'chaos',
  'gameOver',
  'done',
] as const;
export type PhaseId = (typeof PHASES)[number];

/** A policy card, and a player's party (R1). */
export type Party = 'L' | 'F';
export type Role = 'liberal' | 'fascist' | 'hitler';
export type PowerKind = 'investigate' | 'special' | 'peek' | 'execute';
export type Pace = 'relaxed' | 'normal' | 'fast';
export type Winner = 'liberals' | 'fascists';
export type WinReason =
  | 'liberalPolicies'
  | 'fascistPolicies'
  | 'hitlerElected'
  | 'hitlerExecuted'
  | 'hitlerFled'
  | 'tooFew';

/** A private note in a player's dossier (§9.2 "Intel"), stamped with the round it came from. */
export type Intel =
  | { n: number; k: 'investigate'; who: string; party: Party }
  | { n: number; k: 'peek'; cards: Party[] };

/** One government attempt: the public Parliament Record row (§10.3; M2 draws it). */
export interface HistoryRow {
  n: number;
  president: string;
  chancellor: string;
  ja: number;
  nein: number;
  elected: boolean;
  /** The policy this government enacted (null: rejected, vetoed, or the game ended first). */
  enacted: Party | null;
  veto: boolean;
  /** The policy chaos enacted right after this attempt, if it did (R10). */
  chaos: Party | null;
}

export interface Round {
  /** Government attempt number, from 1 (the Record's `#n`). */
  n: number;
  president: string;
  nominee: string | null;
  /** SECRET until voteReveal. */
  votes: Record<string, boolean>;
  elected: boolean | null;
  /** SECRET: the President's three cards (R11). */
  draw: Party[] | null;
  /** SECRET: the two cards the Chancellor holds. */
  passed: Party[] | null;
  vetoRequested: boolean;
  vetoAgreed: boolean | null;
  /** What this government enacted (public from enactReveal). */
  enacted: Party | null;
  /** The card chaos enacted this round (public from chaos). */
  chaosCard: Party | null;
  /** Why chaos ran: a failed vote or an agreed veto (SPEC §4, transition 12). */
  chaosAfter: 'fail' | 'veto' | null;
  power: {
    kind: PowerKind;
    target: string | null;
    /** investigate: the file has been read (the second beat of powerReveal). */
    shown: boolean;
  } | null;
  /** D4: the VIP called "Last call" in this phase. */
  lastCall: boolean;
}

export interface State extends GameStateBase {
  cfg: { pace: Pace };
  /** Seat order (R5), fixed at init. */
  seats: string[];
  /** SECRET (R1). */
  role: Record<string, Role>;
  /** Living and not exiled, in seat order. */
  alive: string[];
  executed: string[];
  exiled: string[];
  /** D7: when a seat dropped (the game exiles it after EXILE_MS). */
  droppedAt: Record<string, number>;
  ready: string[];
  /** SECRET order (R3). */
  deck: Party[];
  /** SECRET contents; the count is public. */
  discards: Party[];
  board: { L: number; F: number };
  tracker: number;
  chaosCount: number;
  vetoUnlocked: boolean;
  /** Seat index of the last President in normal rotation (R5, R16). */
  presPointer: number;
  /** R16: the next President, chosen by a special election. */
  special: string | null;
  lastElected: { president: string | null; chancellor: string | null };
  investigated: string[];
  notHitler: string[];
  /** SECRET, per player. */
  intel: Record<string, Intel[]>;
  round: Round;
  history: HistoryRow[];
  /**
   * D3: a timeout chose at random; `who` is named only for nominations and power targets. Set
   * with `fresh: true` by the timeout; the next phase shows it, the one after clears it.
   */
  announce: { who: string | null; fresh: boolean } | null;
  winner: Winner | null;
  winReason: WinReason | null;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('nominate'), target: z.string().max(64) }),
  z.object({ type: z.literal('vote'), ja: z.boolean() }),
  z.object({ type: z.literal('discard'), index: z.number().int().min(0).max(2) }),
  z.object({ type: z.literal('enact'), index: z.number().int().min(0).max(1) }),
  z.object({ type: z.literal('vetoRequest') }),
  z.object({ type: z.literal('vetoAnswer'), agree: z.boolean() }),
  z.object({ type: z.literal('target'), target: z.string().max(64) }),
  z.object({ type: z.literal('peekDone') }),
]);
export type Input = z.infer<typeof inputSchema>;

/** D1: seconds at `normal` pace; `pace` scales them (rounded to 5 s). */
export const BASE_SECONDS = {
  seating: 30,
  nominate: 90,
  vote: 45,
  presDraw: 45,
  chanEnact: 45,
  vetoAsk: 20,
  claims: 60,
  power: 45,
  peek: 15,
} as const;
export type TimedStep = keyof typeof BASE_SECONDS;

/** Paced reveals (§4): pace never changes them (D1). */
export const REVEAL_MS = {
  voteReveal: 6_000,
  hitlerCheck: 5_000,
  chaos: 8_000,
  enactReveal: 6_000,
  gameOver: 15_000,
  /** An investigation: the uniform 3 s "Checking the files…" pause (V4 off), then the file. */
  investigatePause: 3_000,
  investigateShow: 4_000,
  special: 4_000,
  peek: 3_000,
  execute: 6_000,
  /** A power with no valid target ("No one left to investigate."). */
  none: 3_000,
} as const;

/** D4 "Last call". */
export const LAST_CALL_MS = 10_000;
/** D7: a dropped seat is exiled after the brief's hold (game-side, the owner's call 2026-09-24). */
export const EXILE_MS = 120_000;

/** "Leave the current phase now": injected into phase reducers by server/index.ts (`advance`). */
export type Transition = (state: State, now: number) => State;
