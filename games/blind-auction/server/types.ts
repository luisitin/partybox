// State and input types for Mystery Box — "Bet on the box" (the owner's redesign, 2026-09-24:
// everyone bets on what's inside, paid by the odds). Everything JSON-serializable.
import { z } from '@partybox/game-sdk';
import type { GameStateBase } from '@partybox/game-sdk';

export const PHASES = [
  'box',
  'bet',
  'swap',
  'potato',
  'tug',
  'shuffle',
  'cups',
  'hands',
  'open',
  'done',
] as const;
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
  rounds: number;
  startCoins: number;
  betSeconds: number;
  grand: boolean;
  spicy: boolean;
  /** Live events: every other box is an event the TV runs (a race, dice, a wheel). */
  live: boolean;
  /** Twists (the owner: a toggle; each live event gets one that fits it, at random). */
  twists: boolean;
  reader: Reader;
}

/** The live events (the owner's picks, docs/game-pack/blind-auction/LIVE-EVENTS.md). */
export const LIVE_KINDS = [
  'race',
  'dice',
  'wheel',
  'doors',
  'potato',
  'tug',
  'shells',
  'coins',
  'keno',
  'penalty',
  'ghost',
  'wires',
  'blackjack',
] as const;
export type LiveKind = (typeof LIVE_KINDS)[number];

/** What a box can hold. Each kind has its icon and words on the client (EN + ES). */
export const CONTENT_KINDS = [
  'treasure',
  'jackpot',
  'trap',
  'raccoon',
  'mirror',
  'twins',
  'receipt',
  'empty',
  // A live event's outcome (a racer, a dice call, a wheel prize): its `label` names it.
  'pick',
] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

/** One thing the box might hold: its chance (whole %) and what a right call pays (× the stake). */
export interface BoxOption {
  kind: ContentKind;
  chance: number;
  pay: number;
  /** A live event's outcome: its own icon and name (English; the client translates the fixed ones). */
  label?: { icon: string; name: string };
}

export interface Box {
  id: string;
  name: string;
  icon: string;
  flavour: string;
  options: BoxOption[];
  /** The last box: payouts doubled. */
  grand: boolean;
  /** A live event instead of a box: the TV runs it at `open`. */
  event?: LiveKind;
  /** A twist on this event's betting (Cfg.twists). */
  twist?: Twist;
}

/** A box and its SECRET outcome. `detail` is how a live event plays out (the dice, the race's
 *  finishing order, where the wheel stops), secret like the outcome until `open`. */
export interface Round {
  box: Box;
  outcome: number;
  detail?: number[];
  /** Tug of war: the two teams (seat ids), dealt at `init`, public from `box` on. */
  teams?: { sun: string[]; moon: string[] };
}

export interface Bet {
  option: number;
  amount: number;
  /** When it was placed (the early-bird twist pays more for an early bet). */
  at?: number;
  /** The insurance twist: paid 10 % on top, half the stake back if wrong. */
  insured?: boolean;
}

/** The twists (LIVE-EVENTS.md): each event with odds may get one. */
export const TWISTS = ['early', 'insure', 'pool'] as const;
export type Twist = (typeof TWISTS)[number];

export interface RoundState {
  idx: number;
  /** SECRET until `open`: each phone sees only its own. */
  bets: Record<string, Bet>;
  /** `open`: 0 while the bets land on the table, 1 once the box is open (payouts, own lines). */
  step: 0 | 1;
  /** `box`: when the TV starts the reading (null = no voice this round). */
  voiceAt: number | null;
  /** `open` step 1: when the box turned (server time). */
  turnedAt: number | null;
  /** Players topped up to the pity stake this round (they were broke). */
  topped: string[];
  /** When betting opened (the early-bird twist measures from it). */
  betOpenedAt?: number;
  /** Doors (`swap`): the goat door the host opened, and each bettor's stay/switch choice (their
   *  final door; absent = undecided, which stays). */
  opened?: number;
  swaps?: Record<string, number>;
  /** Hot potato (`potato`): who holds it, since when, how many passes; `popAt` is SECRET. */
  holder?: string;
  heldAt?: number;
  passes?: number;
  popAt?: number;
  /** Tug of war (`tug`): the rope, −1 (▲ Sun has won) … +1 (● Moon has won), and each player's
   *  last counted tap (the rate limit). `draw` = a dead heat: every stake goes back. */
  rope?: number;
  lastTap?: Record<string, number>;
  draw?: boolean;
  /** Shell game: the speed tier the pot reached (0 … 5), the shuffle (`moves`: cup pairs swapped, in order;
   *  the ball starts under `detail[0]` of the round), and each staker's picked cup (`cups`). */
  tier?: number;
  moves?: [number, number][];
  picks?: Record<string, number>;
  /** Keno: each bettor's three numbers (1 … KENO_NUMBERS), secret until `open`. */
  spots?: Record<string, number[]>;
  /** Blackjack (`hands`): the round's shoe (SECRET), each staker's cards, who has stood, and the
   *  dealer's cards (the second is the SECRET hole card until `open`). */
  shoe?: number[];
  hands?: Record<string, number[]>;
  stood?: string[];
  dealer?: number[];
}

export interface Stats {
  biggestBet: number;
  biggestWin: number;
  longShots: number;
  calls: number;
  lost: number;
}

/** A refused input, shown on that phone; `at` keys the toast so a repeat shows again. */
export interface Notice {
  code: 'over' | 'option' | 'self' | 'spots';
  have: number;
  at: number;
}

export interface State extends GameStateBase {
  cfg: Cfg;
  presence: Presence;
  seats: string[];
  left: string[];
  /** Each box's outcome index is SECRET until it opens. */
  boxes: Round[];
  r: RoundState;
  coins: Record<string, number>;
  stats: Record<string, Stats>;
  /** Bot personalities: 0 cautious (likely, small) … 1 reckless (long shots, big). */
  factors: Record<string, number>;
  notices: Record<string, Notice>;
  /** READER-VOICES: key → length in ms (−1 = could not be made). */
  speechMs: Record<string, number>;
}

export const inputSchema = z.discriminatedUnion('type', [
  // Doors: the door you end on after the host opens one (your own = stay).
  z.object({ type: z.literal('swap'), door: z.number().int().min(0).max(2) }),
  // Hot potato: the holder passes it on.
  z.object({ type: z.literal('pass') }),
  // Tug of war: one pull.
  z.object({ type: z.literal('tug') }),
  // Shell game: the cup you think hides the ball.
  z.object({ type: z.literal('cup'), cup: z.number().int().min(0).max(2) }),
  // Blackjack: another card, or stand.
  z.object({ type: z.literal('hit') }),
  z.object({ type: z.literal('stand') }),
  // Keno: your three numbers.
  z.object({
    type: z.literal('spots'),
    spots: z.array(z.number().int().min(1).max(20)).length(3),
  }),
  z.object({
    type: z.literal('bet'),
    // Up to 16 for hot potato (one option per player).
    option: z.number().int().min(0).max(15),
    amount: z.number().int().min(0).max(100000),
    insured: z.boolean().optional(),
  }),
]);
export type Input = z.infer<typeof inputSchema>;

/** "Leave the current phase now" — injected into phase reducers by server/index.ts (`advance`). */
export type Transition = (state: State, now: number) => State;
