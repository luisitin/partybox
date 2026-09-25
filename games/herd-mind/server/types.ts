// State and input types for Herd Mind (docs/game-pack/herd-mind/SPEC.md §2.7, §2.9). Everything
// is JSON; the questions are drawn at init and nothing else from the packs enters the state.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { QuestionItem } from '../content/schema';

export type { QuestionItem };

export const PHASES = ['answer', 'herd', 'score', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const READERS = ['george', 'fable', 'jessica', 'sky', 'original', 'none'] as const;
export type Reader = (typeof READERS)[number];
export type Mode = 'tiles' | 'typed';
export type Pace = 'relaxed' | 'normal' | 'fast';

export interface Settings {
  mode: Mode;
  target: number;
  maxQuestions: number;
  pace: Pace;
  spicy: boolean;
  reader: Reader;
}

export interface Tile {
  id: string;
  label: string;
}

/** One answer group after `answer`: answers on the question's list key as `a:<answerId>`, typed
 *  answers that match nothing on it as `t:<first member's id>`. */
export interface Group {
  key: string;
  label: string;
  members: string[];
  /** Typed mode: each member's own words, shown under the label ("peperoni"). */
  raw: Record<string, string>;
  /** Base group keys the VIP merged into this one (typed mode), in merge order. */
  merged: string[];
}

/** How a question came out: a herd, a tie for biggest, all different, or nobody answered. */
export type Outcome = 'herd' | 'tie' | 'scattered' | 'empty';

export interface Question {
  n: number;
  tiles: Tile[] | null;
  answers: Record<string, { tile?: string; text?: string }>;
  merges: [string, string][];
  groups: Group[] | null;
  outcome: Outcome | null;
  herd: string | null;
  lone: string | null;
  /** Filled at `score`: who scored, and who held the sheep before this question. */
  scored: string[];
  sheepFrom: string | null;
}

export interface Stats {
  herd: number;
  alone: number;
  sheepHeld: number;
}

export interface State extends GameStateBase {
  cfg: Settings;
  /** Everyone from init, in seat (join) order: grouping and ties iterate this. */
  seats: string[];
  /** Players gone for good; their answers stop counting and they cannot win. */
  left: string[];
  questions: QuestionItem[];
  q: Question;
  scores: Record<string, number>;
  sheep: string | null;
  winners: string[];
  stats: Record<string, Stats>;
  /** "a|b" with ids sorted → times the pair landed in the same group. */
  pairs: Record<string, number>;
  /** Reading key → its length in ms (-1: could not be made). */
  speechMs: Record<string, number>;
  /** Players with their settings menu open: the room holds while any is. */
  menus: string[];
  /** The hold: the phase's clock is stopped with this much left (null: it had no deadline). */
  hold: { remaining: number | null } | null;
  /** The last menu closed: a 3 · 2 · 1 on every screen until this time, then the phase goes on. */
  resumeAt: number | null;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pick'), tile: z.string().max(64) }),
  z.object({ type: z.literal('type'), text: z.string().min(1).max(60) }),
  z.object({ type: z.literal('merge'), a: z.string().max(64), b: z.string().max(64) }),
  z.object({ type: z.literal('unmerge'), a: z.string().max(64), b: z.string().max(64) }),
  /** My settings menu opened or closed: the room holds while any is open. */
  z.object({ type: z.literal('menu'), open: z.boolean() }),
]);
export type Input = z.infer<typeof inputSchema>;

export { TYPED_MAX_CHARS } from './limits';
/** The 3 · 2 · 1 after the last settings menu closes. */
export const COUNTDOWN_MS = 3_000;
/** Answer time by pace (§2.13), seconds. */
export const ANSWER_SECONDS: Record<Pace, Record<Mode, number>> = {
  relaxed: { tiles: 25, typed: 35 },
  normal: { tiles: 15, typed: 25 },
  fast: { tiles: 10, typed: 20 },
};
/** When the last connected player locks in: a beat for their ✓ before the reveal. */
export const ALL_IN_MS = 1_200;
/** Typed mode: the VIP's merge window before the groups are scored as they stand. */
export const TYPED_HERD_MS = 20_000;
export const SCORE_MS = 6_000;
/** A win holds the score screen a little longer for the banner. */
export const WIN_MS = 6_500;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
