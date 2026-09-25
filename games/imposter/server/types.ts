// State, inputs and timings for Imposter (SPEC §1.3, §1.7, §1.8). Everything JSON.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { WordItem } from '../content/schema';

export const PHASES = [
  'deal',
  'clue',
  'clueReveal',
  'talk',
  'vote',
  'voteReveal',
  'runoff',
  'accuse',
  'lastChance',
  'wordReveal',
  'scores',
  'done',
] as const;
export type PhaseId = (typeof PHASES)[number];

export const DEAL_MS = 12_000;
export const RUNOFF_MS = 20_000;
export const LAST_CHANCE_MS = 20_000;
export const SCORES_MS = 8_000;
/** voteReveal: faces fly one voter at a time, then the counts settle. */
export const VOTE_REVEAL_MS = 4_000;
/** accuse: the spotlight holds this long before the card flips (SPEC §1.4 "after 1.5 s"). */
export const ACCUSE_SPOT_MS = 1_500;
/** accuse: the flipped card stays up this long (about 5 s per accused with the spotlight). */
export const ACCUSE_FLIP_MS = 3_500;
/** wordReveal: the word lands first; the guess line and phones' own results follow. */
export const WORD_MS = 3_000;
export const WORD_RESULT_MS = 4_000;
/** clueReveal pacing (SPEC §1.11): reading + 0.3 s, clamped 1.2–3 s; 1.4 s with no reader. */
export const CARD_BEAT_MS = 300;
export const CARD_MIN_MS = 1_200;
export const CARD_MAX_MS = 3_000;
export const CARD_SILENT_MS = 1_400;
/** clueReveal: the last card stays this long before the phase moves on (SPEC "last card + 2 s"). */
export const CARD_LAST_MS = 2_000;
export const CLUE_MAX_CHARS = 20;

export type Presence = { mode: 'together' | 'remote-voice' | 'remote-text'; phoneOnly: boolean };

/** A drawn word without its clue bank (bots read the bank from the pack, like a person's head). */
export type DrawnWord = Omit<WordItem, 'clues'> & { cat: string; label: string };

export interface Cfg {
  rounds: number;
  imposters: 'auto' | '1' | '2';
  clueRounds: number;
  clueSeconds: number;
  talk: boolean;
  talkSeconds: number;
  voteSeconds: number;
  hint: 'category' | 'none';
  lastChance: 'choices' | 'typed' | 'off';
  /** Category ids in play ([] = every category the spicy switch allows). */
  categories: string[];
  spicy: boolean;
  reader: string;
}

export interface Clue {
  by: string;
  text: string;
  /** Clue round, 1-based. */
  r: number;
}

export interface Guess {
  said: string;
  ok: boolean;
  byVip: boolean;
}

export type Why = 'caught' | 'read' | 'escaped' | 'stole';

export interface Round {
  n: number;
  /** SECRET: the word (index into state.words). */
  w: number;
  category: { id: string; label: string };
  /** SECRET until accused / wordReveal. */
  imposters: string[];
  clueRound: number;
  /** SECRET until revealed; one entry per player per clue round (a resend replaces). */
  clues: Clue[];
  /** Seeded shuffle of this clue round's authors; `revealed` of them are on the board. */
  revealOrder: string[];
  revealed: number;
  ready: string[];
  /** SECRET until voteReveal. */
  votes: Record<string, string[]>;
  runoff: { candidates: string[]; slots: number; votes: Record<string, string[]> } | null;
  /** Which tally voteReveal is showing. */
  showing: 'main' | 'runoff';
  accused: string[];
  /** accuse: which accused is in the spotlight, and whether their card has flipped. */
  spot: number;
  flipped: boolean;
  options: string[] | null;
  guesses: Record<string, Guess>;
  delta: Record<string, { pts: number; why: Why[] }>;
  /** Every imposter left the game before the vote (SPEC §1.15). */
  void: boolean;
  /** wordReveal: 0 = the word lands, 1 = the guess line and own results. */
  step: number;
  /** A crew clue the server turned down, per player: why, and a counter so the phone buzzes once. */
  rejects: Record<string, { why: RejectReason; n: number }>;
}

export type RejectReason =
  'empty' | 'too-long' | 'not-one-word' | 'is-secret' | 'contains-secret' | 'repeat';

export interface Stats {
  escapes: number;
  reads: number;
  steals: number;
  suspicion: number;
}

export interface State extends GameStateBase {
  cfg: Cfg;
  presence: Presence;
  seats: string[];
  left: string[];
  imposterBag: string[];
  /** Drawn at init: rounds + 2 (spares). The rest of the pack never enters state. */
  words: DrawnWord[];
  round: Round;
  scores: Record<string, number>;
  /** Every clue each player has put on the board this game (bots never repeat one, SPEC §1.9). */
  said: Record<string, string[]>;
  stats: Record<string, Stats>;
  /** Reading lengths the host reported (ADR-045): key → ms, -1 = could not be made. */
  speechMs: Record<string, number>;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('clue'), text: z.string().min(1).max(40) }),
  z.object({ type: z.literal('vote'), targets: z.array(z.string().max(64)).min(1).max(2) }),
  z.object({
    type: z.literal('guess'),
    option: z.string().max(64).optional(),
    text: z.string().max(40).optional(),
  }),
  z.object({ type: z.literal('countGuess') }),
]);
export type Input = z.infer<typeof inputSchema>;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
