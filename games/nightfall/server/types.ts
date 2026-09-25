// State and input types for Nightfall. Keep everything JSON-serializable (docs/GAME_CONTRACT.md).
// The state holds only what the game drew or what happened: roles, who is alive, tonight's picks,
// the day's votes and board, and the log the recap reads back.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { FlavourId, Role } from '../content/schema';

export type { FlavourId, Role } from '../content/schema';

export const PHASES = [
  'roles',
  'night',
  'dawn',
  'hunter',
  'day',
  'vote',
  'runoff',
  'verdict',
  'last-words',
  'end',
  'done',
] as const;
export type PhaseId = (typeof PHASES)[number];

export type Side = 'wolves' | 'village' | 'jester';
export type PresenceMode = 'together' | 'remote-voice' | 'remote-text';
export interface Presence {
  mode: PresenceMode;
  phoneOnly: boolean;
}

/** The settings, resolved once at `init` (SPEC §10.16). */
export interface Cfg {
  flavour: FlavourId;
  /** 0 = auto (SPEC §10.3). */
  wolves: number;
  seer: boolean;
  doctor: boolean;
  hunter: boolean;
  jester: boolean;
  revealRoles: boolean;
  ghostsSeeAll: boolean;
  hunches: boolean;
  /** `townBoard` resolved against presence: auto = on only in remote-text. */
  townBoard: boolean;
  nightSeconds: number;
  daySeconds: number;
  voteSeconds: number;
  maxDays: number;
  /** A voice id, or 'none'. */
  reader: string;
}

export type DeathHow = 'night' | 'vote' | 'hunter' | 'left';
export interface Death {
  id: string;
  day: number;
  how: DeathHow;
  /** The death has been announced (the TV told the room). Views show only told deaths. */
  told: boolean;
}

export type Vote = string; // a player id, or 'none'
export interface Ballot {
  by: string;
  target: Vote;
}

/** The result of a vote, kept for the verdict's reveal steps. */
export interface Verdict {
  ballots: Ballot[];
  /** Eliminated player, or null. */
  out: string | null;
  /** Why nobody went out. */
  reason: 'tie' | 'noone' | null;
  /** The runoff's candidates when the verdict follows a runoff. */
  runoff: boolean;
}

export interface NightLog {
  night: number;
  /** Final picks of the night: every living player's (wolves, seer, doctor, hunches). */
  picks: Record<string, string>;
  victim: string | null;
  saved: boolean;
}

export interface DayLog {
  day: number;
  ballots: Ballot[];
  out: string | null;
  board: { by: string; text: string }[];
}

/** A bot's scheduled action in the day (NOTES decision 3). */
export interface Beat {
  at: number;
  bot: string;
  kind: 'post' | 'ready';
}

export interface Stats {
  votesOnWolves: number;
  votesReceived: number;
  /** Vote phases held while this player was alive (Best Liar needs 2+). */
  daysAlive: number;
  saves: number;
  wolvesFound: number;
}

export interface State extends GameStateBase {
  cfg: Cfg;
  presence: Presence;
  /** Seat order: the ring on the TV. */
  seats: string[];
  roles: Record<string, Role>; // SECRET
  alive: string[];
  dead: Death[];
  /** Gone for good; they die at the next dawn or verdict announcement (SPEC §10.19). */
  leaving: string[];
  /** Night N comes before day N. */
  day: number;
  /** roles: "Got it" · day: "Ready to vote". */
  ready: string[];
  /** Tonight's picks, player → target (SECRET). */
  picks: Record<string, string>;
  /** The doctor's protection last night. */
  lastProtected: string | null;
  /** Tonight's result, set at dawn (SECRET: `saved` is never shown). */
  victim: string | null;
  saved: boolean;
  /** The anonymous hunch tally from the last dawn (public from dawn's news on). */
  tally: { id: string; n: number }[];
  seerLog: { night: number; target: string; wolf: boolean }[]; // SECRET: the seer's own
  board: { day: number; by: string; text: string }[];
  votes: Record<string, Vote>; // SECRET until verdict
  runoff: string[] | null;
  verdict: Verdict | null;
  lastWords: string | null;
  hunterPending: string | null;
  /** Where the hunter's shot came from, so the order resumes there. */
  hunterFrom: 'dawn' | 'verdict' | null;
  shot: string | null;
  /** Reveal step inside dawn / verdict / hunter / lastWords (ADR-033 beats). */
  step: number;
  /** When the current step began (its reading re-times from here). */
  stepAt: number;
  /** Day: the real end of the discussion (the phase deadline also wakes bot beats). */
  dayEndsAt: number | null;
  beats: Beat[];
  winner: Side | null;
  reason: 'jester' | 'wolvesGone' | 'wolvesEqual' | 'maxDays' | null;
  nights: NightLog[];
  days: DayLog[];
  stats: Record<string, Stats>;
  /** Reading lengths by key (ADR-045); -1 = could not be made. */
  speechMs: Record<string, number>;
  /** Readings that came too late for their step: never played (reset each night). */
  lateKeys: string[];
  /** The day the narrator says "Ghosts, stay silent" (the first day after the first death). */
  ghostsDay: number | null;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('night'), target: z.string().max(64) }),
  z.object({ type: z.literal('post'), text: z.string().min(1).max(160) }),
  z.object({ type: z.literal('vote'), target: z.string().max(64) }),
  z.object({ type: z.literal('shoot'), target: z.string().max(64) }),
  z.object({ type: z.literal('lastWords'), text: z.string().min(1).max(160) }),
]);
export type Input = z.infer<typeof inputSchema>;

/** What the server keeps of a post or last words. */
export const TEXT_MAX = 80;
export const POSTS_PER_DAY = 3;

/** A room where no human taps Got it at all (everyone walked off) still starts, after 3 minutes;
 *  while anyone is reading it re-arms. */
export const READY_FALLBACK_MS = 180_000;
export const HUNTER_MS = 20_000;
export const RUNOFF_MS = 20_000;
export const LAST_WORDS_MS = 20_000;
export const END_MS = 12_000;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts (`advance`). */
export type Transition = (state: State, now: number) => State;
