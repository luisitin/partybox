// State and input types for Broken Pencil (docs/game-ideas/002-broken-pencil.html). Books are
// arrays of pages that grow one page per step; every page is JSON (drawings are base64 strokes).
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import { COLORS, INK_CHARS, MAX_STROKES, WIDTHS } from './encoding';

/**
 * pick → draw (your own word) → pass × (P − 1) (guess the drawing you got, then draw your guess) →
 * guess (the last player only guesses) → show (each owner presents their book) → summary → done.
 */
export const PHASES = ['pick', 'draw', 'pass', 'guess', 'show', 'summary', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export interface Settings {
  /** Other players per book (after the N − 1 cap). 15 = "everyone". */
  passes: number;
  drawSeconds: number;
  guessSeconds: number;
  customWords: boolean;
  spicy: boolean;
}

/** One pen stroke: colour 0..7, width 0..2, points as base64 bytes on a 256×256 canvas. */
export interface Stroke {
  c: number;
  w: number;
  p: string;
}
export interface Drawing {
  strokes: Stroke[];
}

export type Page =
  | { kind: 'word'; authorId: string; text: string }
  /** `drawing: null` = the artist never sent one (empty canvas). */
  | { kind: 'draw'; authorId: string; drawing: Drawing | null }
  /** `text: null` = no guess by the deadline ("???"). */
  | { kind: 'guess'; authorId: string; text: string | null };

export interface Book {
  ownerId: string;
  pages: Page[];
}

export interface Showing {
  book: number;
  page: number;
  verdict: 'intact' | 'broken' | null;
  line: string | null;
}

export interface State extends GameStateBase {
  settings: Settings;
  /** Seat index → playerId, shuffled at init. `books[b].ownerId === seats[b]`. */
  seats: string[];
  /** P after the cap: how many other players touch each book. */
  passes: number;
  /** L = 2P + 1: word, the owner's drawing, then (guess, drawing) × (P − 1), then the last guess. */
  pageCount: number;
  /**
   * 1..P+1 while playing (0 during pick). Step 1: everyone draws their own word. Steps 2..P: the
   * book moves one seat; its holder guesses the last drawing, then draws that guess. Step P+1: the
   * last holder only guesses. At step k seat s holds book (s − k + 1) mod N.
   */
  step: number;
  books: Book[];
  /** playerId → the three offered words. */
  offers: Record<string, string[]>;
  showing: Showing | null;
  intactBooks: number;
  /** I-202 B: laughs per page — "book:page" → who laughed (once each, never the page's author). */
  laughs?: Record<string, string[]>;
  /** Books the VIP called "close enough" (the owner, 2026-09-21): intact by veto. Absent in
   *  older states and fixtures. */
  vetoed?: number[];
  /**
   * What each artist has drawn so far this step (`draft` inputs), keyed by player id. When the
   * deadline closes the step, a missing drawing takes its author's draft instead of an empty
   * sheet, so a slow artist's page stops where it is. Cleared when the step closes; absent in
   * older states and fixtures.
   */
  drafts?: Record<string, Drawing>;
}

const strokeSchema = z.object({
  c: z
    .number()
    .int()
    .min(0)
    .max(COLORS - 1),
  w: z
    .number()
    .int()
    .min(0)
    .max(WIDTHS - 1),
  // One point (a dot) is 2 bytes → 4 chars with padding; never require 4 data characters.
  p: z
    .string()
    .regex(/^[A-Za-z0-9+/]+={0,2}$/)
    .refine((s) => s.length % 4 === 0 && s.length >= 4, { message: 'base64 length' }),
});

const strokesSchema = z
  .array(strokeSchema)
  .max(MAX_STROKES)
  .refine((a) => a.reduce((n, s) => n + s.p.length, 0) <= INK_CHARS, { message: 'out of ink' });

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pick'), option: z.number().int().min(0).max(2) }),
  /** show: the book's owner turns the page from their phone. */
  z.object({ type: z.literal('turn') }),
  z.object({ type: z.literal('laugh') }), // I-202 B: a laugh at the page on stage
  z.object({ type: z.literal('pickCustom'), text: z.string().trim().min(1).max(30) }),
  z.object({ type: z.literal('draw'), strokes: strokesSchema }),
  /** The sheet so far, while still drawing: what the deadline keeps if "Done" never comes. */
  z.object({ type: z.literal('draft'), strokes: strokesSchema }),
  z.object({ type: z.literal('guess'), text: z.string().trim().min(1).max(40) }),
  /** The VIP's "close enough": a broken book counts as intact (show's last page, or the summary). */
  z.object({ type: z.literal('veto'), book: z.number().int().min(0).max(15) }),
]);
export type Input = z.infer<typeof inputSchema>;

export const PICK_MS = 20_000;
/** Fallback auto-turn while a presenter dawdles (their phone's Next is the real control). */
export const SHOW_MS = { word: 12_000, draw: 20_000, guess: 12_000 } as const;
/**
 * A bot's book turns itself at a presenter's pace (loop 410: the server asks a bot only once per
 * page, so a bot that "sometimes" sent Next left its pages on the 12–20 s fallbacks).
 */
export const BOT_SHOW_MS = { word: 5_000, draw: 8_000, guess: 5_000 } as const;
/** I-512 B: a book's last page can't be turned in its first this-many ms — the verdict's beat. */
export const VERDICT_BEAT_MS = 2_500;
/** I-512 B: an UNBROKEN verdict (the rarer reveal) lands a second later on the TV (Tv.tsx `Beat`),
 *  so its page holds Next that long — a turn never skips a verdict the room has not seen. */
export const VERDICT_BEAT_INTACT_MS = 3_500;
/** The closing screen (every word → last guess) before the engine's results take over. */
export const SUMMARY_MS = 15_000;
/** `passes` at this value (the manifest max) means "everyone" — always capped to N − 1. */
export const EVERYONE = 15;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
