// State and input types for Tune In (spec §5.9–5.10). Everything is JSON (docs/GAME_CONTRACT.md).
import { z } from '@partybox/game-sdk';
import type { GamePresence, GameStateBase } from '@partybox/game-sdk';
import type { SpectrumItem } from '../content/schema';

export const PHASES = ['intro', 'clue', 'dial', 'call', 'reveal', 'scores', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export type Mode = 'solo' | 'teams' | 'coop';
export type TeamId = 'sun' | 'moon';
export type Side = 'left' | 'right';
export type TargetSize = 'narrow' | 'normal' | 'wide';
export type Reader = 'george' | 'fable' | 'jessica' | 'sky' | 'original';
export type { PresenceMode } from '@partybox/game-sdk';

export interface Settings {
  mode: Mode;
  /** Solo and co-op: the number of rounds. Teams: unused (maxTurns ends it). */
  rounds: number;
  targetScore: number;
  maxTurns: number;
  clueSeconds: number;
  dialSeconds: number;
  callSeconds: number;
  targetSize: TargetSize;
  /** Teams and co-op: live markers the room can argue over (forced off in remote-text). */
  huddle: boolean;
  spicy: boolean;
  reader: Reader | 'none';
}

/** A clue the server refused (§5.8): the psychic's phone shows the copy and buzzes once per `n`. */
export interface Rejection {
  reason: 'empty' | 'too-long' | 'number' | 'label-word' | 'position-word';
  n: number;
}

export interface Turn {
  /** 1-based round (solo, co-op) or turn (teams, catch-ups included). */
  n: number;
  psychic: string;
  team: TeamId | null;
  catchUp: boolean;
  /** Index into `state.spectra`. */
  spectrum: number;
  /** SECRET until reveal: the psychic's phone only. */
  target: number;
  clue: string | null;
  /** When the clue arrived (the TV's reading starts then). */
  clueAt: number | null;
  /** The clue phase's own deadline, kept so a psychic who drops and comes back gets it back. */
  clueDeadline: number | null;
  rejected: Rejection | null;
  /** SECRET until reveal (solo); live for the active side in a huddle. */
  dials: Record<string, number>;
  locked: string[];
  needle: number | null;
  /** SECRET: each caller's own phone until reveal. */
  calls: Record<string, Side>;
  /** Filled at the reveal: points per guesser (and the psychic, solo). */
  points: Record<string, number>;
  teamPoints: Record<TeamId, number>;
  /** No clue came: "No signal!" and nobody scores. */
  void: boolean;
  /** Reveal beat: 0 = the shutter opens and faces land, 1 = the points are up. */
  step: 0 | 1;
}

export interface PlayerStats {
  bulls: number;
  dials: number;
  dist: number;
  zeros: number;
  psyTurns: number;
  psyPts: number;
}

export interface State extends GameStateBase {
  cfg: Settings;
  presence: GamePresence;
  /** Seat order at the start (bots included); everyone here is in the results. */
  seats: string[];
  /** Players who left for good: never drawn as psychic again. */
  left: string[];
  mode: Mode;
  teams: Record<TeamId, string[]> | null;
  /** Psychic queues: `all` for solo and co-op, one per team. Drawn from the front. */
  psychicBag: Record<'all' | TeamId, string[]>;
  spectra: SpectrumItem[];
  turn: Turn;
  /** Teams only: whose turn is next (catch-up keeps it). */
  nextTeam: TeamId;
  scores: Record<string, number>;
  /** Scores when the turn started, for the scoreboard's deltas. */
  turnStartScores: Record<string, number>;
  team: Record<TeamId, number>;
  coopTotal: number;
  /** Rounds that ran (void ones included): co-op's maximum is this × 4. */
  played: number;
  /** Void rounds in a row; IDLE_VOIDS of them end the game (spec §5.17 "Everyone idle"). */
  voidStreak: number;
  stats: Record<string, PlayerStats>;
  /** READER-VOICES (ADR-045): reading key → its length in ms, or −1 when it failed. */
  speechMs: Record<string, number>;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('clue'), text: z.string().min(1).max(60) }),
  z.object({ type: z.literal('dial'), pos: z.number().int().min(0).max(100) }),
  z.object({ type: z.literal('lock') }),
  z.object({ type: z.literal('call'), side: z.enum(['left', 'right']) }),
]);
export type Input = z.infer<typeof inputSchema>;

/** "Leave the current phase now" — injected into phase reducers by server/flow.ts. */
export type Transition = (state: State, now: number) => State;

export { TEAMS_CARD_MS } from './timing';
/** Reveal step 0: the shutter swings open, faces land, the needle settles. */
export const REVEAL_OPEN_MS = 3_600;
/** Reveal step 1: the points pop (longer when the reader needs it). Reading time is the owner's
 *  pacing rule [cc45f4] — 1.5 s + 1 s per 3 words, ×1.3 for Spanish: the verdict, the call and
 *  each phone's own line come to ~10 words. */
export const REVEAL_POINTS_MS = 6_500;
/** A void round's card: "No signal! No clue came through. Nobody scores." (~8 words). */
export const VOID_MS = 6_000;
/** The scores wait for the VIP's Next round; this is only the fallback, long enough for a slow
 *  reader of a sixteen-row board in Spanish. */
export const SCORES_MS = 20_000;
/** A psychic who drops mid-clue keeps the clue open this long at most (they may come back). */
export const DROP_GRACE_MS = 10_000;
/** Spec §5.17 "Everyone idle … the game ends quickly": this many void rounds in a row end it
 *  (a whole idle game ran eight rounds of "No signal!", 6.6 minutes, in the sim). */
export const IDLE_VOIDS = 3;
/** A reading that is not made yet holds a voiced beat this long at most. */
export const VOICE_WAIT_MS = 2_500;
export const VOICE_BEAT_MS = 700;
