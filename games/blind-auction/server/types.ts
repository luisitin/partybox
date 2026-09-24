// State and input types for Blind Auction (SPEC §8.9, §8.10). Everything JSON-serializable.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';
import type { Chaos, Outcome } from '../content/schema';

export const PHASES = ['intro', 'lot', 'bid', 'live', 'sold', 'flip', 'done'] as const;
export type PhaseId = (typeof PHASES)[number];

export const READERS = ['george', 'fable', 'jessica', 'sky', 'original', 'none'] as const;
export type Reader = (typeof READERS)[number];

/** P00 §3.4 (ADR-047, pending on main): where everyone is, fixed at start. */
export type PresenceMode = 'together' | 'remote-voice' | 'remote-text';
export interface Presence {
  mode: PresenceMode;
  phoneOnly: boolean;
}

export interface Cfg {
  lots: number;
  startCoins: number;
  bidSeconds: number;
  /** Live mode in effect: asked for AND everyone is in one room (§8.15). */
  live: boolean;
  /** The VIP asked for Live but the room is not `together` — the TV says why it is sealed. */
  liveRefused: boolean;
  chaos: Chaos;
  grandLot: boolean;
  spicy: boolean;
  reader: Reader;
}

/** A drawn lot, amounts already scaled to `startCoins`. */
export interface LotItem {
  id: string;
  name: string;
  icon: string;
  flavour: string;
  outcomes: Outcome[];
  grand: boolean;
}

export type EffectKind = 'gain' | 'lose' | 'steal' | 'swap' | 'double' | 'refund' | 'dud' | 'none';

/** What the flip did (filled at `flip`). `amount` is what changed hands; `other` the victim/partner. */
export interface Effect {
  kind: EffectKind;
  amount: number;
  other: string | null;
  /** The winner's and the other player's coins before the flip (the TV animates from them). */
  before: { winner: number; other: number };
}

export interface LotState {
  idx: number;
  /** Sealed bids, SECRET until `sold`. */
  bids: Record<string, number>;
  /** Live: the standing bid (public). */
  high: { by: string; amount: number } | null;
  /** Live: 0 after a bid, 1 "Going once…", 2 "Going twice…". */
  stage: 0 | 1 | 2;
  openedAt: number;
  winner: string | null;
  price: number;
  /** Sealed: the top bid was tied (fewer coins won, then the rng). */
  tie: boolean;
  /** `sold` / `flip`: 0 while the stage builds, 1 once it has landed (own lines go out then). */
  step: 0 | 1;
  effect: Effect | null;
  /** `lot`: when the TV starts the reading (null = no voice for this lot). */
  voiceAt: number | null;
}

export interface Stats {
  biggestBid: number;
  bestProfit: number | null;
  thief: number;
  trapped: number;
  traps: number;
  spent: number;
}

/** A rejected input, shown on that phone (§8.9); `at` keys the toast so a repeat shows again. */
export interface Notice {
  code: 'over' | 'outbid' | 'winning';
  have: number;
  at: number;
}

export interface State extends GameStateBase {
  cfg: Cfg;
  presence: Presence;
  seats: string[];
  left: string[];
  /** Each lot's outcome index is SECRET until its flip. */
  lots: { item: LotItem; outcome: number }[];
  l: LotState;
  coins: Record<string, number>;
  stats: Record<string, Stats>;
  /** Bot personalities (0.5 cautious … 1.1 reckless), drawn at init. */
  factors: Record<string, number>;
  notices: Record<string, Notice>;
  /** READER-VOICES: key → length in ms (−1 = could not be made). */
  speechMs: Record<string, number>;
}

export const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bid'), amount: z.number().int().min(0).max(100000) }),
  z.object({ type: z.literal('raise'), amount: z.number().int().min(1).max(100000) }),
]);
export type Input = z.infer<typeof inputSchema>;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts (`advance`). */
export type Transition = (state: State, now: number) => State;
