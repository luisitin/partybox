// State and input types for Echo (docs/game-pack/echo/SPEC.md §7.9–7.10). JSON only.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { WordItem } from '../content/schema';
import type { ClueReason } from './match/index';

export const PHASES = ['intro', 'clue', 'check', 'guess', 'result', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const READERS = ['none', 'george', 'fable', 'jessica', 'sky', 'original'] as const;
export type Reader = (typeof READERS)[number];

export interface Cfg {
  words: number;
  clueSeconds: number;
  guessSeconds: number;
  check: boolean;
  categories: string[];
  spicy: boolean;
  reader: Reader;
}

export type Outcome = 'right' | 'wrong' | 'pass';

/** One clue in the check list: `by` wrote their clue number `i`. */
export interface ClueRef {
  by: string;
  i: number;
}

/** Clues the matcher (or a clue-giver) calls the same. `echo` groups vanish before the guess. */
export interface Group {
  id: string;
  refs: ClueRef[];
  echo: boolean;
}

/** Why the server refused a clue — only its author ever sees it. */
export type ClueReject = ClueReason | 'twin' | 'count';

/** The word being played right now. */
export interface Word {
  /** Position in `deck`. */
  idx: number;
  /** SECRET from the guesser, the TV and spectators until `result`. */
  word: WordItem;
  guesser: string;
  /** SECRET until `guess` (survivors) / `result` (all, with authors). */
  clues: Record<string, string[]>;
  rejects: Record<string, ClueReject>;
  /** Never shown to the guesser. */
  dontKnow: string[];
  swaps: number;
  groups: Group[] | null;
  checkOk: string[];
  guess: { text: string; result: Outcome; byVip: boolean } | null;
  /** A guess (or pass) that came in while the TV was still turning the clues over: it lands
   *  when the reveal ends, so the room sees every clue before the answer. */
  early: { outcome: 'pass' | 'judge'; text: string } | null;
}

/** A finished word, compact: enough to rebuild the deck piles, the awards and the recap. */
export interface Turn {
  word: string;
  guesser: string;
  result: Outcome;
  byVip: boolean;
  /** The word after this one, burned by a wrong guess. */
  burned: string | null;
  /** A won word lost to a wrong guess on the last word. */
  unwon: string | null;
  /** One entry per surviving clue (its author) and per vanished clue. */
  kept: string[];
  echoed: string[];
}

export interface State extends GameStateBase {
  cfg: Cfg;
  /** Fixed at start: a 3-player game gives two clues each. */
  twoClues: boolean;
  seats: string[];
  left: string[];
  deck: WordItem[];
  spares: WordItem[];
  /** Guesser order: seat order from a seeded start. */
  rotation: string[];
  w: Word;
  turns: Turn[];
  /** ADR-045: reading lengths by key (-1 = no voice). */
  speechMs: Record<string, number>;
}

const clueText = z.string().min(1).max(40);
const id16 = z.string().max(16);

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('clue'), texts: z.array(clueText).min(1).max(2) }),
  z.object({ type: z.literal('dontKnow') }),
  z.object({ type: z.literal('split'), group: id16 }),
  z.object({ type: z.literal('join'), a: id16, b: id16 }),
  z.object({ type: z.literal('ok') }),
  z.object({ type: z.literal('guess'), text: z.string().min(1).max(60) }),
  z.object({ type: z.literal('pass') }),
  z.object({ type: z.literal('countGuess') }),
]);
export type Input = z.infer<typeof inputSchema>;

/** The TV's guess reveal (client/timing.ts reads these): echoes go blank, then one survivor
 *  turns over per step while the reader says them. */
export const GUESS_BEATS = {
  deal: 0,
  dealStep: 90,
  echoFlip: 700,
  firstSurvivor: 1300,
  survivorStep: 420,
};
/** After the last card turns: time for the reading to finish before an early guess lands. */
export const GUESS_TAIL_MS = 1_400;

/** One survivor turns over per step; with a reading, the steps follow the voice (its length
 *  shared across the cards, 420–900 ms each) so each card lands as the reader says it. */
export function survivorStepMs(survivors: number, readingMs: number | null | undefined): number {
  if (!readingMs || readingMs <= 0 || survivors <= 0) return GUESS_BEATS.survivorStep;
  return Math.round(Math.min(900, Math.max(GUESS_BEATS.survivorStep, readingMs / survivors)));
}

/** How long the TV needs to show `survivors` clues before a guess may end the phase. */
export function guessShowMs(survivors: number, readingMs?: number | null): number {
  const last =
    survivors > 0
      ? GUESS_BEATS.firstSurvivor + (survivors - 1) * survivorStepMs(survivors, readingMs)
      : GUESS_BEATS.echoFlip;
  return last + GUESS_TAIL_MS;
}

export const INTRO_MS = 8_000;
export const CHECK_MS = 12_000;
/** The result beat: the word, the guess, the uncovered echoes. A burn adds its slide. */
export const RESULT_MS = 6_500;
export const BURN_EXTRA_MS = 1_800;
/** A word nobody wrote a clue for: the word and the mark, nothing to turn over. */
export const EMPTY_RESULT_MS = 4_500;
/** "Don't know it" counts only this early in `clue` (§7.6). */
export const DONT_KNOW_WINDOW_MS = 15_000;
export const MAX_SWAPS = 2;
export const SPARES = 6;
export const CLUE_MAX_CHARS = 20;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
