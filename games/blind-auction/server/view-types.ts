// The view shapes (tvView / controllerView in views.ts), split out to keep views.ts readable.
import type { ControllerView, TvView } from '@partybox/game-sdk';
import type { Tier } from './odds';
import type { FixedLine } from './speech';
import type { Bet, ContentKind, LiveKind } from './types';

export interface OptionView {
  kind: ContentKind;
  tier: Tier;
  chance: number;
  /** × the stake for a right call (already doubled for the grand box). */
  pay: number;
  /** A live event's outcome: its icon and name (English). */
  label?: { icon: string; name: string };
}

/** A live event at `open`: which option wins and how it plays out (dice, finishing order, stop). */
export interface RunView {
  kind: LiveKind;
  outcome: number;
  detail: number[];
}

export interface BoxView {
  n: number;
  of: number;
  grand: boolean;
  name: string;
  icon: string;
  flavour: string;
  options: OptionView[];
  event?: LiveKind;
}

export interface BetView {
  id: string;
  option: number;
  amount: number;
}

export interface ResultView {
  id: string;
  /** What the bet did to their coins. */
  delta: number;
}

export interface VoiceView {
  url: string;
  /** Server time the reading starts. */
  at: number;
}

export interface Common {
  step: 0 | 1;
  startCoins: number;
  box: BoxView | null;
  /** `rules`: who has tapped Ready. */
  readyIds: string[];
  /** `open`: every bet, public from here on. */
  bets: BetView[] | null;
  /** `open` step 1: which content was inside. */
  outcome: number | null;
  run: RunView | null;
  /** Doors, from `swap` on: the goat door the host opened. */
  opened: number | null;
  /** Hot potato: who holds it (`potato`; at `open`, who got burnt) and how many passes so far. */
  potato: { holder: string; passes: number; ring: string[] } | null;
  /** Tug of war, from `box` on: the teams; from `tug` on, the rope (−1 Sun won … +1 Moon won);
   *  `draw` at `open` for a dead heat. */
  tug: { sun: string[]; moon: string[]; rope: number; draw: boolean } | null;
  /** Shell game, from `shuffle` on: the pot, its speed tier, where the ball started, and how
   *  many stakers have picked a cup (`cups`). The swaps are TV-only (BlindAuctionTvView). */
  shells: { pot: number; tier: number; start: number; picked: number; pickers: number } | null;
  results: ResultView[] | null;
  voice: VoiceView | null;
  clips: Partial<Record<FixedLine, string>>;
}

export interface BlindAuctionTvView extends TvView, Common {
  betsIn: number;
  bettors: number;
  /** Doors `swap`: how many bettors have chosen, of how many. */
  swapsIn: number;
  swappers: number;
  /** Shell game `shuffle`/`open`: the cup swaps the TV animates (never sent to a phone). */
  shellSwaps: [number, number][] | null;
}

export type OwnLine =
  | { kind: 'won'; option: number; amount: number; back: number }
  | { kind: 'lost'; option: number; amount: number }
  | { kind: 'back'; amount: number }
  | { kind: 'sat' };

export interface BlindAuctionControllerView extends ControllerView, Common {
  coins: number;
  ready: boolean;
  myBet: Bet | null;
  /** Broke at the start of this bet: topped up to the pity stake. */
  topped: boolean;
  notice: { code: 'over' | 'option' | 'self' | 'spots'; have: number; at: number } | null;
  line: OwnLine | null;
  /** Doors `swap`: the door you bet on (null = no stake, nothing to choose) and where you are now. */
  myDoor: number | null;
  mySwap: number | null;
  /** Hot potato: your own option index (you cannot back yourself), null when not a player. */
  mySeat: number | null;
  /** Tug of war: your team (0 ▲ Sun, 1 ● Moon) and your share of its stake (0…1). */
  myTeam: 0 | 1 | null;
  myShare: number;
  /** Keno: your three numbers (empty until you pick). */
  mySpots: number[];
  /** Shell game `cups`: you staked (so you pick), and the cup you picked. */
  myStake: number;
  /** Shell game: the swaps, only in a phone-only room (no TV to watch). */
  shellSwaps: [number, number][] | null;
  myCup: number | null;
}
