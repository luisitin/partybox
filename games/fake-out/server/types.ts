// State and input types for Fake-Out (SPEC §3.9, §3.10). Everything is JSON (docs/GAME_CONTRACT.md).
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { FactItem } from '../content/schema';

export type { FactItem } from '../content/schema';

export const PHASES = ['intro', 'question', 'lie', 'pick', 'reveal', 'scores', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const READERS = ['george', 'fable', 'jessica', 'sky', 'original'] as const;
export type Reader = (typeof READERS)[number];

export interface Settings {
  questions: number;
  lieSeconds: number;
  pickSeconds: number;
  finalDouble: boolean;
  suggestions: boolean;
  likes: boolean;
  /** Picked category slugs; empty = every category. */
  categories: string[];
  spicy: boolean;
  reader: Reader | 'none';
}

/** One option of the pick grid (SPEC §3.8). `authors`, `house` and `truth` stay on the server
 *  until that option's reveal step. */
export interface OptionEntry {
  id: string;
  display: string;
  authors: string[];
  house: boolean;
  truth: boolean;
}

/** Why a lie was refused (SPEC §3.7); the phone shows the matching sentence. */
export type LieRejection = 'empty' | 'too-long' | 'truth';

/** One reason chip on the scoreboard: "+1000 truth", "+1000 fooled 2", "×2 final". */
export type Why =
  { k: 'truth'; pts: number } | { k: 'fooled'; n: number; pts: number } | { k: 'final' };

export interface Question {
  /** 1-based question number. */
  n: number;
  final: boolean;
  /** SECRET: the truth, until the truth step. */
  item: FactItem;
  /** When the fact's reading starts on the question card (server time): after the lead-in, or
   *  when a late reading arrives — every TV starts the voice and the read-along from here. */
  readAt: number;
  /** SECRET (authorship): player → the lie they locked in, as typed (trimmed). */
  lies: Record<string, string>;
  /** Players who typed the truth at least once this question (Lucky Guess). */
  truthTyped: string[];
  /** Player → the last refused attempt, with a counter so a phone can buzz each refusal once. */
  rejected: Record<string, { why: LieRejection; n: number }>;
  /** Player → the two fakes Suggest offered (at most once per question). */
  suggestions: Record<string, string[]>;
  /** House lies (and fillers) handed out by Suggest; never used as padding. */
  claimed: string[];
  /** Built at the start of `pick`; null before. */
  options: OptionEntry[] | null;
  /** SECRET until each step: player → option id. */
  picks: Record<string, string>;
  /** Player → option ids they liked (at most two). */
  likes: Record<string, string[]>;
  /** Option ids in reveal order: picked lies by fewest pickers (ties: option order), then the truth. */
  revealOrder: string[];
  /** Reveal step on stage (0-based); steps past `revealOrder` are the completed fact and the
   *  "nobody fell for" strip. */
  step: number;
  /** When the step on stage began (server time), so every TV runs its beats from one clock. */
  stepAt: number;
  /** Points this question, computed as the reveal begins; added to `scores` as it ends. */
  delta: Record<string, { pts: number; why: Why[] }>;
}

export interface PlayerStats {
  fooled: number;
  truths: number;
  likes: number;
  truthTyped: number;
  house: number;
}

export interface State extends GameStateBase {
  cfg: Settings;
  /** Seat order from init (union-find merges lies in this order). */
  seats: string[];
  /** Players gone for good (left or removed). */
  left: string[];
  /** Drawn at init: the questions plus two spares. The rest of the pack never enters state. */
  questions: FactItem[];
  q: Question;
  scores: Record<string, number>;
  stats: Record<string, PlayerStats>;
  /** Every fake Suggest ever offered a player, so nobody (bots included) gets one twice. */
  offered: Record<string, string[]>;
  /** Speech key → length in ms (−1 = could not be made). */
  speechMs: Record<string, number>;
  /** Intro ready-up (owner, [cc45f4]): who has tapped I'm ready (bots from the start). */
  ready: string[];
  /** The 3 · 2 · 1 is running: it ends on the intro's deadline, which a pause shifts. */
  counting: boolean;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('lie'), text: z.string().min(1).max(80) }),
  z.object({ type: z.literal('suggest') }),
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('pick'), option: z.string().max(16) }),
  z.object({ type: z.literal('like'), option: z.string().max(16), on: z.boolean() }),
]);
export type Input = z.infer<typeof inputSchema>;
export type LieInput = Extract<Input, { type: 'lie' }>;

/** "Leave the current phase now": injected into phase reducers by server/flow.ts. */
export type Transition = (state: State, now: number) => State;

/** The rules wait for everyone's I'm ready; this only stops a room of idle phones hanging. */
export const INTRO_MS = 90_000;
/** A breath after the last Ready, then the 3 · 2 · 1. */
export const READY_BREATH_MS = 700;
export const COUNTDOWN_MS = 3_000;
/** Long enough for a slow reader to take in the board and the reason chips (owner, [cc45f4]). */
export const SCORES_MS = 10_000;
/** The question card holds for its reading plus this beat, at most QUESTION_MAX_MS. */
export const QUESTION_BEAT_MS = 1_500;
export const QUESTION_MAX_MS = 12_000;
/** A reveal step: its reading + the stamp beat + the points beat, clamped (SPEC §3.12). */
export const STAMP_MS = 800;
export const POINTS_MS = 1_800;
export const STEP_MIN_MS = 3_000;
export const STEP_MAX_MS = 5_500;
/** The completed fact holds its reading plus this. */
export const FACT_HOLD_MS = 3_000;
export const UNPICKED_MS = 3_000;
/** A reading that is not made yet holds its moment this long at most; a stuck voice never
 *  holds the room. */
export const VOICE_WAIT_MS = 6_000;

export const TRUTH_POINTS = 1_000;
export const FOOL_POINTS = 500;
export const MIN_OPTIONS = 5;
export const MAX_LIKES = 2;
