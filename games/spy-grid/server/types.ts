// State and input types for Spy Grid (README.md, docs/game-pack/spy-grid/SPEC.md §9.13–9.14).
// Everything is JSON. The key (`key`) is the one secret: only a spymaster's controllerView carries
// it; every other view learns a card's identity from `flipped` alone.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = ['teams', 'clue', 'guess', 'flip', 'turn-end', 'win', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export type Team = 'sun' | 'moon';
export type Kind = 'sun' | 'moon' | 'bystander' | 'assassin';
export type Mode = 'teams' | 'coop';
export type Reason = 'agents' | 'assassin' | 'cap' | 'idle' | 'forfeit' | 'clues';
export const TEAMS: readonly Team[] = ['sun', 'moon'];
export const EMOJIS = ['👍', '👎', '🤔'] as const;

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('join'), team: z.enum(['sun', 'moon']) }),
  z.object({ type: z.literal('volunteer'), on: z.boolean() }),
  z.object({ type: z.literal('shuffle') }),
  z.object({
    type: z.literal('clue'),
    word: z.string().min(1).max(40),
    number: z.number().int().min(1).max(9),
  }),
  z.object({
    type: z.literal('point'),
    target: z.union([z.number().int().min(0).max(24), z.literal('end')]),
  }),
  z.object({ type: z.literal('unpoint') }),
  z.object({
    type: z.literal('react'),
    card: z.number().int().min(0).max(24),
    emoji: z.enum(EMOJIS),
  }),
]);
export type Input = z.infer<typeof inputSchema>;

export interface Settings {
  mode: Mode;
  teamPick: 'choose' | 'random';
  rounds: number;
  clueSeconds: number;
  guessSeconds: number;
  maxTurns: number;
  coopTurns: number;
  assassins: 1 | 2;
  reactions: boolean;
  spicy: boolean;
  reader: string;
}

export interface Card {
  word: string;
  itemId: string;
}

export type Pointer = number | 'end';
export type ClueReason = 'one-word' | 'too-long' | 'digits' | 'board';

export interface Flip {
  card: number;
  kind: Kind;
  /** The first guesser who pointed at the card this step (awards, recap). */
  first: string | null;
}

export interface Turn {
  team: Team;
  /** Turns started this round, both teams (the cap counts them). */
  n: number;
  spymaster: string | null;
  clue: { word: string; number: number } | null;
  /** The last clue this spymaster tried that broke a rule (their phone shows why). */
  clueError: { word: string; reason: ClueReason } | null;
  left: number;
  made: number;
  pointers: Record<string, Pointer>;
  /** Who pointed first at each target this step: card index (or 'end') → player id. */
  firsts: Record<string, string>;
  reactions: Record<string, { card: number; emoji: string; until: number }>;
  flip: Flip | null;
  /** Why the turn ended, for the turnEnd card. */
  ended: 'flip' | 'stop' | 'noClue' | 'outOfGuesses' | 'timeout' | null;
  /** A spymaster chosen by rule because the last one left (the TV names them). */
  newSpymaster: string | null;
}

export interface HistoryEntry {
  round: number;
  team: Team;
  spymaster: string;
  word: string;
  number: number;
  flips: Flip[];
}

export interface Stats {
  clues: number;
  agentsFromClues: number;
  bestClue: number;
  sharp: number;
  trap: number;
}

export interface State extends GameStateBase {
  settings: Settings;
  seats: string[];
  left: string[];
  mode: Mode;
  teams: Record<Team, string[]>;
  spymaster: Record<Team, string | null>;
  volunteers: string[];
  round: number;
  roundWins: Record<Team, number>;
  board: Card[];
  key: Kind[];
  /** 0 hidden · 1 flipping (TV only) · 2 shown everywhere. */
  flipped: (0 | 1 | 2)[];
  starter: Team;
  turn: Turn;
  idleTurns: number;
  winner: Team | 'draw' | null;
  reason: Reason | null;
  coop: { cluesLeft: number } | null;
  history: HistoryEntry[];
  stats: Record<string, Stats>;
  speechMs: Record<string, number>;
  /** Themes drawn this game (a new round avoids them while it can). */
  usedThemes: string[];
  /** Someone has tapped in the teams phase (join / volunteer / shuffle): its net re-arms. */
  teamsTouched?: boolean;
}

/** The teams phase has no visible clock: the VIP starts when the teams are set. A hidden net per
 *  the group standard [e67ec9]: nobody tapped → start at the net; someone tapped → re-arm, up to
 *  TEAMS_GIVE_UP_MS from the phase start (so an idle room can never hang). */
export const TEAMS_MS = 60_000;
export const TEAMS_GIVE_UP_MS = 600_000;
/** Stage 0 → stage 1 of a flip: the TV turns the card before any phone learns what it is. */
export const FLIP_STAGE_MS = 800;
/** Stage 1 → the result: the identity on every screen, the voice saying it. */
export const FLIP_SHOW_MS = 1_400;
/** Between clues: time to look over the board before the next team's clue (owner, 2026-09-25). */
export const TURN_END_MS = 5_000;
export const WIN_MS = 10_000;
export const REACTION_MS = 5_000;
export const IDLE_DRAW_TURNS = 4;
/** A reading that is not made yet holds its moment this long at most. */
export const VOICE_WAIT_MS = 6_000;
/** After a reading, a beat before the next moment. */
export const VOICE_BEAT_MS = 400;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts. */
export type Transition = (state: State, now: number) => State;
