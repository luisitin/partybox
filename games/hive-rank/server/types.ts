// State and input types for Hive Rank (README.md is the spec). Everything is JSON.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { Question } from '../content/schema';

export const PHASES = ['intro', 'rank', 'hive', 'score', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const READERS = ['george', 'fable', 'jessica', 'sky', 'original', 'none'] as const;
export type Reader = (typeof READERS)[number];

export interface Settings {
  rounds: number;
  rankSeconds: number;
  spicy: boolean;
  reader: Reader;
}

/** One player's round: 2 per exact spot, 1 per spot one off, +2 when all five are exact. */
export interface Delta {
  pts: number;
  exact: number;
  near: number;
  perfect: boolean;
}

export interface Round {
  /** 1-based; the question is `questions[n - 1]`. */
  n: number;
  /** playerId → a permutation of the five item ids, best first. SECRET until `hive`. */
  orders: Record<string, string[]>;
  /** The hive's order, built when `rank` ends (null before, and on a "Not enough bees!" round). */
  hive: string[] | null;
  /** item id → the sum of the spots it was given (1–5). */
  totals: Record<string, number>;
  /** `hive` reveal step: 0 = "The hive has decided…", 1 = 5th place lands … 5 = 1st place. */
  step: number;
  /** Steps that landed with their reading ready (the TV plays those, and only those). */
  voiced: number[];
  /** The next spot is waiting for its reading (at most until `VOICE_WAIT_MS` into `hive`). */
  hold: boolean;
  delta: Record<string, Delta>;
  /** The round's top scorers (ties share), and its lowest (for Odd Bug). */
  queens: string[];
  lows: string[];
  /** Fewer than two orders: "Not enough bees!", nothing scores. */
  short: boolean;
  /** The question's reading was ready while `rank` was fresh (else the TV says "Rank them!"). */
  sayOk: boolean;
  /** The round's points are in `scores` (set on entering `score`). */
  applied: boolean;
}

export interface Stat {
  exact: number;
  queens: number;
  lows: number;
  perfects: number;
}

export interface State extends GameStateBase {
  settings: Settings;
  /** Drawn at init, one per round: the rest of the packs never enter state. */
  questions: Question[];
  q: Round;
  scores: Record<string, number>;
  stats: Record<string, Stat>;
  /** "a|b" (ids sorted) → things the two placed in the same spot, over the whole game. */
  pairs: Record<string, number>;
  /** Reading key → its length in ms (-1: could not be made). */
  speechMs: Record<string, number>;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('order'), items: z.array(z.string().max(32)).length(5) }),
]);
export type Input = z.infer<typeof inputSchema>;

/** `intro`: the title and the three steps. */
export const INTRO_MS = 8_000;
/** `hive` step 0: "The hive has decided…" (at least this long; its clip is ~1.5 s). */
export const DECIDED_MS = 1_800;
/** The TV starts "The hive has decided." this far in, after its `reveal` sting (client timing.ts). */
export const DECIDED_BEAT_MS = 400;
/** Each of the 5th–2nd spots is held about this long, or its reading plus a beat. */
export const SPOT_MS = 2_000;
export const SPOT_BEAT_MS = 600;
/** The number one spot holds longer: it is the moment. */
export const TOP_SPOT_MS = 3_000;
/** From `hive`'s start, how long a spot waits for its reading at most (a stuck voice never
 *  holds the room). */
export const VOICE_WAIT_MS = 8_000;
/** A "Not enough bees!" round. */
export const SHORT_MS = 3_500;
/** `score`. */
export const SCORE_MS = 6_000;
/** A question reading arriving later than this into `rank` is not played (it would talk over
 *  people who are already ranking). */
export const SAY_LATE_MS = 3_000;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
