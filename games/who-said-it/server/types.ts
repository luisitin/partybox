// State and input types for Who Said It (docs/game-pack/who-said-it/SPEC.md §4.8–4.9). Everything
// is JSON-serializable (docs/GAME_CONTRACT.md).
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['prompt', 'write', 'guess', 'reveal', 'scores', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const READERS = ['sky', 'george', 'fable', 'jessica', 'original', 'none'] as const;
export type Reader = (typeof READERS)[number];

/** A prompt as drawn from the pack: only what this game needs (foundation §2.5). */
export interface PromptItem {
  id: string;
  prompt: string;
  botAnswers: string[];
}

/** One answer card: the text as typed (trimmed) and who wrote it — two or more on a merged card. */
export interface Card {
  id: string;
  text: string;
  authors: string[];
}

export interface Cfg {
  /** Prompts this game plays, already resolved from `auto` and clamped (§4.7). */
  prompts: number;
  writeSeconds: number;
  guessSeconds: number;
  ideas: boolean;
  readAnswers: boolean;
  spicy: boolean;
  reader: Reader;
}

/** The reveal's two beats: guesses land, then the author flips up with the points (ADR-033). */
export type RevealStep = 'land' | 'shown';

/** What the reader says at the flip, fixed as the flip begins so a late voice never talks later. */
export interface FlipLine {
  /** Server time of the flip: the name line starts here. */
  at: number;
  key: string | null;
  ms: number;
  /** "Everyone knew!" / "Nobody saw that coming!" after the name — null when neither. */
  after: string | null;
  afterMs: number;
}

export interface PromptRound {
  /** 0-based index into `prompts`. */
  n: number;
  /** Candidates for every card of this prompt (§4.15: fixed when the prompt begins). */
  seated: string[];
  /** SECRET: playerId → answer as typed, trimmed, ≤ 60 characters. */
  answers: Record<string, string>;
  /** playerId → their two dealt idea chips; a phone sees its own once it taps 💡 (a bot always). */
  ideas: Record<string, string[]>;
  /** Players who tapped 💡 this prompt (once per prompt, §4.4). */
  ideaUsed: string[];
  /** Built when `write` ends, in a seeded order (never submission order). Authors are SECRET. */
  cards: Card[];
  idx: number;
  /** SECRET until the reveal: guesserId → targetId for the current card. */
  guesses: Record<string, string>;
  /** SECRET until each flip: guesses saved by card during the all-answers guessing run. */
  guessesByCard: Record<string, string>[];
  step: RevealStep;
  flip: FlipLine | null;
  /** Scores when this prompt began; the scoreboard shows the difference. */
  startScores: Record<string, number>;
  /** The current card's points, set at the flip: playerId → points. */
  points: Record<string, number>;
}

export interface Stats {
  right: number;
  fooled: number;
  readBy: number;
}

export interface State extends GameStateBase {
  cfg: Cfg;
  /** Every player from the start, in seat order. */
  seats: string[];
  /** Players who left for good (the VIP removed them, or they left): not a candidate next prompt. */
  left: string[];
  prompts: PromptItem[];
  p: PromptRound;
  scores: Record<string, number>;
  stats: Record<string, Stats>;
  /** "guesser>author" → [right guesses, that author's cards the guesser guessed on]. */
  pairs: Record<string, [number, number]>;
  /** Speech key → length in ms (-1 = could not be made). */
  speechMs: Record<string, number>;
  /** Every card of the game as it was revealed, for the recap: text, authors, right guessers. */
  log: { n: number; text: string; authors: string[]; right: string[] }[];
}

/** The server keeps the first 60 characters of an answer (§4.8). */
export const ANSWER_KEEP_CHARS = 60;

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('answer'), text: z.string().min(1).max(120) }),
  z.object({ type: z.literal('idea') }),
  z.object({ type: z.literal('guess'), target: z.string().max(64) }),
]);
export type Input = z.infer<typeof inputSchema>;

/** The prompt phase: its reading + 1 s, at most 10 s (§4.3). */
export const PROMPT_MAX_MS = 10_000;
export const PROMPT_AFTER_MS = 1_000;
/** The TV's card lands before the voice starts (the client waits this long to play it). */
export const VOICE_LEAD_MS = 600;
/** Between two lines of the reader ("Who said it?" → the answer; the name → "Everyone knew!"). */
export const LINE_GAP_MS = 250;
/** The reveal's `land` beat: guesses fly (≈ 0.9 s), a 1 s hold, "It was…" — then the flip. */
export const LAND_MS = 3_200;
/** The `shown` beat with no voice: the author, the glows, the points. */
export const SHOWN_MS = 4_200;
/** The board with this question's points: a slow read at 16 players (the VIP can go on sooner). */
export const SCORES_MS = 10_000;
/** "Everyone is done" never cuts a phase instantly: the last ✓ lands and a change still counts. */
export const DONE_GRACE_MS = 900;
/** The most answer cards one game plays (§4.7). */
export const MAX_CARDS = 40;

export const RIGHT_POINTS = 2;
export const FOOLED_POINTS = 1;

/** "Leave the current phase now" — injected into phase reducers by server/flow.ts. */
export type Transition = (state: State, now: number) => State;
