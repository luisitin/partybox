// tvView / controllerView. No view carries a box's outcome before it opens (step 1 of `open`) —
// nothing in a view differs by outcome until then — and bets stay on the bettor's own phone until
// `open`. Own lines and the strip's coins move only once the TV has shown the box open. A live
// event's `run` (its winner and how it plays out) is public from `open` step 0 — bets are closed,
// and the TV needs it to play the event before the payouts.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { inGame } from './phases/bet';
import { swappers } from './phases/swap';
import { shareOf, teamOf } from './phases/tug';
import { payout, tierOf } from './odds';
import type { Tier } from './odds';
import { FIXED_LINES, boxRequest, fixedRequest, lineOf, openRequest } from './speech';
import type { FixedLine } from './speech';
import type { Bet, ContentKind, LiveKind, State } from './types';

const GAME_ID = 'blind-auction';

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

interface Common {
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
}

export type OwnLine =
  | { kind: 'won'; option: number; amount: number; back: number }
  | { kind: 'lost'; option: number; amount: number }
  | { kind: 'sat' };

export interface BlindAuctionControllerView extends ControllerView, Common {
  coins: number;
  ready: boolean;
  myBet: Bet | null;
  /** Broke at the start of this bet: topped up to the pity stake. */
  topped: boolean;
  notice: { code: 'over' | 'option' | 'self'; have: number; at: number } | null;
  line: OwnLine | null;
  /** Doors `swap`: the door you bet on (null = no stake, nothing to choose) and where you are now. */
  myDoor: number | null;
  mySwap: number | null;
  /** Hot potato: your own option index (you cannot back yourself), null when not a player. */
  mySeat: number | null;
  /** Tug of war: your team (0 ▲ Sun, 1 ● Moon) and your share of its stake (0…1). */
  myTeam: 0 | 1 | null;
  myShare: number;
}

function boxView(state: State): BoxView | null {
  const phase = state.phase.id;
  const round = state.boxes[state.r.idx];
  if (!round || phase === 'rules' || phase === 'done') return null;
  const { box } = round;
  return {
    n: state.r.idx + 1,
    of: state.boxes.length,
    grand: box.grand,
    name: box.name,
    icon: box.icon,
    flavour: box.flavour,
    options: box.options.map((o) => ({
      kind: o.kind,
      tier: tierOf(o.chance),
      chance: o.chance,
      pay: box.grand ? o.pay * 2 : o.pay,
      ...(o.label ? { label: o.label } : {}),
    })),
    ...(box.event ? { event: box.event } : {}),
  };
}

function betsView(state: State): BetView[] | null {
  if (state.phase.id !== 'open') return null;
  return state.seats
    .filter((id) => (state.r.bets[id]?.amount ?? 0) > 0)
    .map((id) => ({
      id,
      option: state.r.bets[id]?.option ?? 0,
      amount: state.r.bets[id]?.amount ?? 0,
    }));
}

function runView(state: State): RunView | null {
  const round = state.boxes[state.r.idx];
  if (state.phase.id !== 'open' || !round?.box.event) return null;
  const detail = round.box.event === 'doors' ? [state.r.opened ?? -1] : (round.detail ?? []);
  return { kind: round.box.event, outcome: round.outcome, detail };
}

function tugView(state: State): Common['tug'] {
  const round = state.boxes[state.r.idx];
  if (!round?.teams || state.phase.id === 'rules' || state.phase.id === 'done') return null;
  return { ...round.teams, rope: state.r.rope ?? 0, draw: state.r.draw === true };
}

function opened(state: State): boolean {
  return state.phase.id === 'open' && state.r.step === 1;
}

function deltaOf(state: State, bet: Bet | undefined): number {
  const round = state.boxes[state.r.idx];
  if (!bet || bet.amount <= 0 || !round) return 0;
  const option = round.box.options[bet.option];
  if (bet.option !== round.outcome || !option) return -bet.amount;
  return payout(bet.amount, option.pay, round.box.grand) - bet.amount;
}

function resultsView(state: State): ResultView[] | null {
  if (!opened(state)) return null;
  return state.seats
    .filter((id) => (state.r.bets[id]?.amount ?? 0) > 0)
    .map((id) => ({ id, delta: deltaOf(state, state.r.bets[id]) }));
}

/** Coins as the room has seen them: bets settle on entry to `open`, but the strip moves only once
 *  the box is open. */
export function shownCoins(state: State): Record<string, number> {
  if (state.phase.id !== 'open' || state.r.step === 1) return state.coins;
  const before = { ...state.coins };
  for (const [id, bet] of Object.entries(state.r.bets))
    if (Object.hasOwn(before, id)) before[id] = (before[id] ?? 0) - deltaOf(state, bet);
  return before;
}

const url = (key: string): string => `/api/speech/${key}.wav`;

function voice(state: State): VoiceView | null {
  const at = state.r.voiceAt;
  if (at === null) return null;
  const req =
    state.phase.id === 'box'
      ? boxRequest(state, state.r.idx)
      : state.phase.id === 'open'
        ? openRequest(state)
        : null;
  return req ? { url: url(req.key), at } : null;
}

/** The fixed lines this moment may play, once each is made. */
function clips(state: State): Partial<Record<FixedLine, string>> {
  const phase = state.phase.id;
  const inside = opened(state) ? lineOf(state) : null;
  const lines: FixedLine[] =
    phase === 'box'
      ? ['grand']
      : phase === 'bet'
        ? ['bets']
        : phase === 'open'
          ? ['closed', ...(inside ? [inside] : [])]
          : [];
  const out: Partial<Record<FixedLine, string>> = {};
  for (const line of lines) {
    if (!(line in FIXED_LINES)) continue;
    const req = fixedRequest(state, line);
    const ms = req ? state.speechMs[req.key] : undefined;
    if (req && ms !== undefined && ms >= 0) out[line] = url(req.key);
  }
  return out;
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (state.phase.id === 'rules') return state.ready.includes(id) ? 'submitted' : 'active';
    if (state.phase.id === 'bet') return Object.hasOwn(state.r.bets, id) ? 'submitted' : 'active';
    if (state.phase.id === 'potato') return state.r.holder === id ? 'active' : 'waiting';
    if (state.phase.id === 'tug') return teamOf(state, id) === null ? 'waiting' : 'active';
    if (state.phase.id === 'swap')
      return !swappers(state).includes(id) || Object.hasOwn(state.r.swaps ?? {}, id)
        ? 'submitted'
        : 'active';
    return 'waiting';
  };
}

function skipLabel(state: State): string | undefined {
  switch (state.phase.id) {
    case 'rules':
      return state.rulesStep === 0 ? 'Start now' : undefined;
    case 'box':
      return 'Skip to betting';
    case 'bet':
      return 'Close betting';
    case 'swap':
      return 'Open the doors';
    case 'potato':
      return 'Pop it now';
    case 'tug':
      return 'Stop the pull';
    case 'open':
      return state.r.idx + 1 < state.boxes.length ? 'Next box' : 'See results';
    default:
      return undefined;
  }
}

function timerMode(state: State): 'normal' | 'quiet' | 'hidden' {
  if (state.phase.id === 'bet' || state.phase.id === 'swap' || state.phase.id === 'tug')
    return 'normal';
  // The rules' safety net is never shown: nobody should feel hurried while reading.
  return 'hidden';
}

function common(state: State): Common {
  return {
    step: state.phase.id === 'rules' ? state.rulesStep : state.r.step,
    startCoins: state.cfg.startCoins,
    box: boxView(state),
    readyIds:
      state.phase.id === 'rules' ? state.ready.filter((id) => state.seats.includes(id)) : [],
    bets: betsView(state),
    outcome: opened(state) ? (state.boxes[state.r.idx]?.outcome ?? null) : null,
    run: runView(state),
    opened:
      state.phase.id === 'swap' || state.phase.id === 'open' ? (state.r.opened ?? null) : null,
    tug: tugView(state),
    potato:
      (state.phase.id === 'potato' || state.phase.id === 'open') && state.r.holder
        ? { holder: state.r.holder, passes: state.r.passes ?? 0, ring: state.seats }
        : null,
    results: resultsView(state),
    voice: voice(state),
    clips: clips(state),
  };
}

export function tvView(state: State): BlindAuctionTvView {
  const label = skipLabel(state);
  return {
    ...envelope(state, GAME_ID, { statusOf: statusOf(state), scores: shownCoins(state) }),
    timerMode: timerMode(state),
    ...(label ? { vipSkipLabel: label } : {}),
    ...common(state),
    betsIn: Object.keys(state.r.bets).length,
    bettors: state.seats.filter((id) => inGame(state, id) && state.players[id]?.connected).length,
    swapsIn: state.phase.id === 'swap' ? Object.keys(state.r.swaps ?? {}).length : 0,
    swappers: state.phase.id === 'swap' ? swappers(state).length : 0,
  };
}

function ownLine(state: State, me: string): OwnLine | null {
  if (!opened(state)) return null;
  const bet = state.r.bets[me];
  if (!bet || bet.amount <= 0) return { kind: 'sat' };
  if (bet.option === state.boxes[state.r.idx]?.outcome)
    return {
      kind: 'won',
      option: bet.option,
      amount: bet.amount,
      back: deltaOf(state, bet) + bet.amount,
    };
  return { kind: 'lost', option: bet.option, amount: bet.amount };
}

export function controllerView(state: State, playerId: string): BlindAuctionControllerView {
  const base = controllerEnvelope(state, GAME_ID, playerId, {
    statusOf: statusOf(state),
    scores: shownCoins(state),
  });
  const playing = base.me.role === 'player';
  const label = skipLabel(state);
  return {
    ...base,
    timerMode: timerMode(state),
    ...(label ? { vipSkipLabel: label } : {}),
    ...common(state),
    coins: shownCoins(state)[playerId] ?? 0,
    ready: state.ready.includes(playerId),
    myBet: playing && state.phase.id === 'bet' ? (state.r.bets[playerId] ?? null) : null,
    topped: playing && state.phase.id === 'bet' && state.r.topped.includes(playerId),
    notice: playing ? (state.notices[playerId] ?? null) : null,
    line: playing ? ownLine(state, playerId) : null,
    myDoor:
      playing && state.phase.id === 'swap' && swappers(state).includes(playerId)
        ? (state.r.bets[playerId]?.option ?? null)
        : null,
    mySwap: playing && state.phase.id === 'swap' ? (state.r.swaps?.[playerId] ?? null) : null,
    mySeat: playing && state.seats.includes(playerId) ? state.seats.indexOf(playerId) : null,
    myTeam: playing ? teamOf(state, playerId) : null,
    myShare: playing && state.phase.id === 'tug' ? shareOf(state, playerId) : 0,
  };
}
