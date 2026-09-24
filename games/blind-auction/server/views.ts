// tvView / controllerView (SPEC §8.10). No view carries a lot's stored outcome before its flip —
// nothing in a view differs by outcome until then — and sealed bids stay on the bidder's own phone
// until `sold`. Own lines reach a phone only once the TV has shown them (step 1 of sold / flip).
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { inGame, raiseOptions } from './auction';
import { hintsOf } from './hints';
import type { Hint } from './hints';
import { ladder } from './phases/sold';
import {
  FIXED_LINES,
  fixedRequest,
  flipLine,
  flipRequest,
  lotRequest,
  soldRequest,
} from './speech';
import type { FixedLine } from './speech';
import { LIVE_STAGE_MS, LIVE_NO_BIDS_MS } from './timing';
import type { Effect, State } from './types';

const GAME_ID = 'blind-auction';

export interface LotView {
  n: number;
  of: number;
  grand: boolean;
  name: string;
  icon: string;
  flavour: string;
  hints: Hint[];
}

export interface SaleView {
  ladder: { id: string; amount: number }[];
  passes: number;
  winner: string | null;
  price: number;
  tie: boolean;
}

export interface VoiceView {
  url: string;
  /** Server time the reading starts. */
  at: number;
}

export interface LiveView {
  high: { by: string; amount: number } | null;
  stage: 0 | 1 | 2;
  /** The ring clock drains from `from` to the phase deadline. */
  from: number;
}

export interface BlindAuctionTvView extends TvView {
  lot: LotView | null;
  live: boolean;
  liveRefused: boolean;
  startCoins: number;
  step: 0 | 1;
  bidsIn: number;
  bidders: number;
  auction: LiveView | null;
  sale: SaleView | null;
  outcome: Hint | null;
  effect: Effect | null;
  voice: VoiceView | null;
  clips: Partial<Record<FixedLine, string>>;
}

export type OwnLine =
  | { kind: 'won'; amount: number }
  | { kind: 'outbid'; name: string; amount: number }
  | { kind: 'watched'; name: string; amount: number }
  | { kind: 'unsold' }
  | { kind: 'mine'; effect: Effect['kind']; amount: number; name: string }
  | { kind: 'stolen'; name: string; amount: number }
  | { kind: 'swapped'; name: string }
  | { kind: 'theirs'; name: string; effect: Effect['kind']; amount: number };

export interface BlindAuctionControllerView extends ControllerView {
  lot: LotView | null;
  live: boolean;
  startCoins: number;
  coins: number;
  step: 0 | 1;
  myBid: number | null;
  auction:
    (LiveView & { name: string; options: { step: number; amount: number; ok: boolean }[] }) | null;
  notice: { code: 'over' | 'outbid' | 'winning'; have: number; at: number } | null;
  sale: SaleView | null;
  outcome: Hint | null;
  effect: Effect | null;
  line: OwnLine | null;
  /** The same readings and fixed lines as the TV: a phone with no TV plays them (phone-only). */
  voice: VoiceView | null;
  clips: Partial<Record<FixedLine, string>>;
}

function nameOf(state: State, id: string | null): string {
  return (id && state.players[id]?.name) || '?';
}

function lotView(state: State): LotView | null {
  const phase = state.phase.id;
  const lot = state.lots[state.l.idx];
  if (!lot || phase === 'intro' || phase === 'done') return null;
  const { item } = lot;
  return {
    n: state.l.idx + 1,
    of: state.lots.length,
    grand: item.grand,
    name: item.name,
    icon: item.icon,
    flavour: item.flavour,
    hints: hintsOf(item.outcomes),
  };
}

function saleView(state: State): SaleView | null {
  if (state.phase.id !== 'sold' && state.phase.id !== 'flip') return null;
  const rungs = state.cfg.live
    ? state.l.high
      ? [{ id: state.l.high.by, amount: state.l.high.amount }]
      : []
    : ladder(state);
  const bidders = state.seats.filter((id) => inGame(state, id)).length;
  return {
    ladder: rungs,
    passes: state.cfg.live ? 0 : Math.max(0, bidders - rungs.length),
    winner: state.l.winner,
    price: state.l.price,
    tie: state.l.tie,
  };
}

function liveView(state: State): LiveView | null {
  if (state.phase.id !== 'live') return null;
  const { l, phase } = state;
  const span = l.high ? (LIVE_STAGE_MS[l.stage] ?? 2_000) : LIVE_NO_BIDS_MS;
  return { high: l.high, stage: l.stage, from: (phase.deadline ?? phase.startedAt) - span };
}

function outcomeHint(state: State): Hint | null {
  if (state.phase.id !== 'flip') return null;
  const lot = state.lots[state.l.idx];
  const o = lot?.item.outcomes[lot.outcome];
  return o ? (hintsOf([o])[0] ?? null) : null;
}

const url = (key: string): string => `/api/speech/${key}.wav`;

function voice(state: State): VoiceView | null {
  const at = state.l.voiceAt;
  if (at === null) return null;
  const phase = state.phase.id;
  const req =
    phase === 'lot'
      ? lotRequest(state, state.l.idx)
      : phase === 'sold'
        ? soldRequest(state)
        : phase === 'flip'
          ? flipRequest(state)
          : null;
  return req ? { url: url(req.key), at } : null;
}

/** The fixed lines this phase may play, once each is made. */
function clips(state: State): Partial<Record<FixedLine, string>> {
  const phase = state.phase.id;
  const lines: FixedLine[] =
    phase === 'lot'
      ? ['grand']
      : phase === 'bid'
        ? ['bids', 'closed']
        : phase === 'live'
          ? ['bids', 'once', 'twice', 'sold']
          : phase === 'sold'
            ? ['closed', 'sold', 'none']
            : phase === 'flip'
              ? [flipLine(state)].filter((x): x is FixedLine => x !== null)
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

/** Coins as the room has seen them: the price leaves the winner at the stamp, and the flip's
 *  coins move once the outcome is up — never earlier than the stage shows it. */
export function shownCoins(state: State): Record<string, number> {
  const { l, phase } = state;
  if (l.step === 1 || !l.winner) return state.coins;
  if (phase.id === 'sold')
    return { ...state.coins, [l.winner]: (state.coins[l.winner] ?? 0) + l.price };
  if (phase.id === 'flip' && l.effect && l.effect.kind !== 'none') {
    const before = { ...state.coins, [l.winner]: l.effect.before.winner };
    if (l.effect.other) before[l.effect.other] = l.effect.before.other;
    return before;
  }
  return state.coins;
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (state.phase.id !== 'bid') return state.phase.id === 'live' ? 'active' : 'waiting';
    return Object.hasOwn(state.l.bids, id) ? 'submitted' : 'active';
  };
}

const SKIP_LABEL: Record<string, string> = {
  intro: "Let's go",
  lot: 'Skip to bidding',
  bid: 'Close bidding',
  live: 'SOLD!',
  sold: 'Flip the card',
};

function skipLabel(state: State): string | undefined {
  if (state.phase.id === 'flip')
    return state.l.idx + 1 < state.lots.length ? 'Next lot' : 'See results';
  return SKIP_LABEL[state.phase.id];
}

function timerMode(state: State): 'normal' | 'hidden' {
  return state.phase.id === 'bid' ? 'normal' : 'hidden';
}

export function tvView(state: State): BlindAuctionTvView {
  const label = skipLabel(state);
  return {
    ...envelope(state, GAME_ID, { statusOf: statusOf(state), scores: shownCoins(state) }),
    timerMode: timerMode(state),
    ...(label ? { vipSkipLabel: label } : {}),
    lot: lotView(state),
    live: state.cfg.live,
    liveRefused: state.cfg.liveRefused,
    startCoins: state.cfg.startCoins,
    step: state.l.step,
    bidsIn: Object.keys(state.l.bids).length,
    bidders: state.seats.filter((id) => inGame(state, id) && state.players[id]?.connected).length,
    auction: liveView(state),
    sale: saleView(state),
    outcome: outcomeHint(state),
    effect: state.phase.id === 'flip' ? state.l.effect : null,
    voice: voice(state),
    clips: clips(state),
  };
}

function ownLine(state: State, me: string): OwnLine | null {
  const { l } = state;
  const phase = state.phase.id;
  if ((phase !== 'sold' && phase !== 'flip') || l.step !== 1) return null;
  const winner = l.winner;
  if (!winner) return { kind: 'unsold' };
  const name = nameOf(state, winner);
  if (phase === 'sold') {
    if (winner === me) return { kind: 'won', amount: l.price };
    const bid = state.cfg.live ? 0 : (l.bids[me] ?? 0);
    return bid > 0
      ? { kind: 'outbid', name, amount: l.price }
      : { kind: 'watched', name, amount: l.price };
  }
  const e = l.effect;
  if (!e) return null;
  if (winner === me)
    return { kind: 'mine', effect: e.kind, amount: e.amount, name: nameOf(state, e.other) };
  if (e.other === me && e.kind === 'steal') return { kind: 'stolen', name, amount: e.amount };
  if (e.other === me && e.kind === 'swap') return { kind: 'swapped', name };
  return { kind: 'theirs', name, effect: e.kind, amount: e.amount };
}

export function controllerView(state: State, playerId: string): BlindAuctionControllerView {
  const base = controllerEnvelope(state, GAME_ID, playerId, {
    statusOf: statusOf(state),
    scores: shownCoins(state),
  });
  const playing = base.me.role === 'player';
  const liveBase = liveView(state);
  const own = shownCoins(state)[playerId] ?? 0;
  const notice = playing ? (state.notices[playerId] ?? null) : null;
  const label = skipLabel(state);
  return {
    ...base,
    timerMode: timerMode(state),
    ...(label ? { vipSkipLabel: label } : {}),
    lot: lotView(state),
    live: state.cfg.live,
    startCoins: state.cfg.startCoins,
    coins: own,
    step: state.l.step,
    myBid: playing && state.phase.id === 'bid' ? (state.l.bids[playerId] ?? null) : null,
    auction: liveBase
      ? {
          ...liveBase,
          name: nameOf(state, liveBase.high?.by ?? null),
          options: raiseOptions(state, playerId).map((o) => ({
            ...o,
            ok: playing && o.amount <= own && liveBase.high?.by !== playerId,
          })),
        }
      : null,
    notice,
    sale: saleView(state),
    outcome: outcomeHint(state),
    effect: state.phase.id === 'flip' ? state.l.effect : null,
    line: playing ? ownLine(state, playerId) : null,
    voice: voice(state),
    clips: clips(state),
  };
}
