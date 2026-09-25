// tvView / controllerView. No view carries a box's outcome before it opens (step 1 of `open`) —
// nothing in a view differs by outcome until then — and bets stay on the bettor's own phone until
// `open`. Own lines and the strip's coins move only once the TV has shown the box open. A live
// event's `run` (its winner and how it plays out) is public from `open` step 0 — bets are closed,
// and the TV needs it to play the event before the payouts.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import { peekPrice, splitHalves } from './odds';
import type { PlayerStatus } from '@partybox/game-sdk';
import { inGame } from './phases/bet';
import { swappers } from './phases/swap';
import { shareOf, teamOf } from './phases/tug';
import { stakers } from './phases/shells';
import { isBlackjack as isBlackjackRound } from './phases/hands';
import { tierOf } from './odds';
import { returned } from './returns';
import { FIXED_LINES, boxRequest, fixedRequest, lineOf, openRequest } from './speech';
import type { FixedLine } from './speech';
import type { State } from './types';

const GAME_ID = 'blind-auction';

export type {
  OptionView,
  RunView,
  BoxView,
  BetView,
  ResultView,
  VoiceView,
  BlindAuctionTvView,
  OwnLine,
  BlindAuctionControllerView,
} from './view-types';
import type {
  RunView,
  BoxView,
  BetView,
  ResultView,
  VoiceView,
  BlindAuctionTvView,
  OwnLine,
  BlindAuctionControllerView,
  Common,
} from './view-types';

function boxView(state: State): BoxView | null {
  const phase = state.phase.id;
  const round = state.boxes[state.r.idx];
  if (!round || phase === 'done') return null;
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
      // The crowd-sets-the-odds twist: no fixed pay, the pot splits (shown as 'splits the pot').
      pay: box.twist === 'pool' ? 0 : box.grand ? o.pay * 2 : o.pay,
      ...(o.label ? { label: o.label } : {}),
    })),
    ...(box.event ? { event: box.event } : {}),
    ...(box.twist ? { twist: box.twist } : {}),
  };
}

function betsView(state: State): BetView[] | null {
  if (state.phase.id !== 'open') return null;
  return state.seats
    .filter((id) => (state.r.bets[id]?.amount ?? 0) > 0)
    .flatMap((id) => {
      const bet = state.r.bets[id];
      if (!bet) return [];
      if (bet.also === undefined) return [{ id, option: bet.option, amount: bet.amount }];
      const [first, second] = splitHalves(bet.amount);
      return [
        { id, option: bet.option, amount: first },
        { id, option: bet.also, amount: second },
      ];
    });
}

function runView(state: State): RunView | null {
  const round = state.boxes[state.r.idx];
  if (state.phase.id !== 'open' || !round?.box.event) return null;
  const detail = round.box.event === 'doors' ? [state.r.opened ?? -1] : (round.detail ?? []);
  return { kind: round.box.event, outcome: round.outcome, detail };
}

function shellsView(state: State): Common['shells'] {
  const round = state.boxes[state.r.idx];
  const phase = state.phase.id;
  if (round?.box.event !== 'shells' || !['shuffle', 'cups', 'open'].includes(phase)) return null;
  return {
    pot: Object.values(state.r.bets).reduce((s, b) => s + Math.max(0, b.amount), 0),
    tier: state.r.tier ?? 0,
    start: round.detail?.[0] ?? 0,
    picked: Object.keys(state.r.picks ?? {}).length,
    pickers: stakers(state).length,
  };
}

function blackjackView(state: State): Common['blackjack'] {
  const phase = state.phase.id;
  if (!isBlackjackRound(state) || (phase !== 'hands' && phase !== 'open') || !state.r.hands)
    return null;
  const dealer = state.r.dealer ?? [];
  return {
    hands: state.r.hands,
    stood: state.r.stood ?? [],
    // The hole card stays down until the dealer plays (`open`).
    dealer: phase === 'open' ? dealer : dealer.slice(0, 1),
  };
}

function tugView(state: State): Common['tug'] {
  const round = state.boxes[state.r.idx];
  if (!round?.teams || state.phase.id === 'done') return null;
  return { ...round.teams, rope: state.r.rope ?? 0, draw: state.r.draw === true };
}

function opened(state: State): boolean {
  return state.phase.id === 'open' && state.r.step === 1;
}

function deltaOf(state: State, id: string): number {
  const bet = state.r.bets[id];
  if (!bet || bet.amount <= 0) return 0;
  return returned(state, id) - bet.amount;
}

function resultsView(state: State): ResultView[] | null {
  if (!opened(state)) return null;
  return state.seats
    .filter((id) => (state.r.bets[id]?.amount ?? 0) > 0)
    .map((id) => ({ id, delta: deltaOf(state, id) }));
}

/** Coins as the room has seen them: bets settle on entry to `open`, but the strip moves only once
 *  the box is open. */
export function shownCoins(state: State): Record<string, number> {
  if (state.phase.id !== 'open' || state.r.step === 1) return state.coins;
  const before = { ...state.coins };
  for (const id of Object.keys(state.r.bets))
    if (Object.hasOwn(before, id)) before[id] = (before[id] ?? 0) - deltaOf(state, id);
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
    if (state.phase.id === 'bet') return Object.hasOwn(state.r.bets, id) ? 'submitted' : 'active';
    if (state.phase.id === 'potato') return state.r.holder === id ? 'active' : 'waiting';
    if (state.phase.id === 'tug') return teamOf(state, id) === null ? 'waiting' : 'active';
    if (state.phase.id === 'hands')
      return !Object.hasOwn(state.r.hands ?? {}, id) || (state.r.stood ?? []).includes(id)
        ? 'submitted'
        : 'active';
    if (state.phase.id === 'cups')
      return !stakers(state).includes(id) || Object.hasOwn(state.r.picks ?? {}, id)
        ? 'submitted'
        : 'active';
    if (state.phase.id === 'swap')
      return !swappers(state).includes(id) || Object.hasOwn(state.r.swaps ?? {}, id)
        ? 'submitted'
        : 'active';
    return 'waiting';
  };
}

function skipLabel(state: State): string | undefined {
  switch (state.phase.id) {
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
    case 'shuffle':
      return 'Skip to the pick';
    case 'cups':
      return 'Lift the cups';
    case 'hands':
      return 'Dealer plays';
    case 'open':
      return state.r.idx + 1 < state.boxes.length ? 'Next box' : 'See results';
    default:
      return undefined;
  }
}

function timerMode(state: State): 'normal' | 'quiet' | 'hidden' {
  if (['bet', 'swap', 'tug', 'cups', 'hands'].includes(state.phase.id)) return 'normal';
  return 'hidden';
}

function common(state: State): Common {
  return {
    step: state.r.step,
    startCoins: state.cfg.startCoins,
    box: boxView(state),
    bets: betsView(state),
    outcome: opened(state) ? (state.boxes[state.r.idx]?.outcome ?? null) : null,
    run: runView(state),
    opened:
      state.phase.id === 'swap' || state.phase.id === 'open' ? (state.r.opened ?? null) : null,
    tug: tugView(state),
    shells: shellsView(state),
    blackjack: blackjackView(state),
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
    shellSwaps:
      ['shuffle', 'cups', 'open'].includes(state.phase.id) && state.r.moves ? state.r.moves : null,
  };
}

function ownLine(state: State, me: string): OwnLine | null {
  if (!opened(state)) return null;
  const bet = state.r.bets[me];
  if (!bet || bet.amount <= 0) return { kind: 'sat' };
  const back = deltaOf(state, me) + bet.amount;
  const inside = state.boxes[state.r.idx]?.outcome;
  if ((bet.option === inside || bet.also === inside) && back > bet.amount)
    return { kind: 'won', option: inside ?? bet.option, amount: bet.amount, back };
  // The shell game's all-right / all-wrong pot: every stake goes back.
  if (back === bet.amount) return { kind: 'back', amount: bet.amount };
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
    myStake: playing ? (state.r.bets[playerId]?.amount ?? 0) : 0,
    mySpots: playing ? (state.r.spots?.[playerId] ?? []) : [],
    myPeek: playing ? (state.r.peeks?.[playerId] ?? null) : null,
    peekPrice:
      playing && state.boxes[state.r.idx]?.box.twist === 'peek'
        ? peekPrice(state.boxes[state.r.idx]?.box.options.length ?? 0)
        : 0,
    myCup: playing && state.phase.id === 'cups' ? (state.r.picks?.[playerId] ?? null) : null,
    // A phone-only room has no TV: the phones must see the shuffle to follow the ball.
    shellSwaps:
      state.presence.phoneOnly &&
      ['shuffle', 'cups', 'open'].includes(state.phase.id) &&
      state.r.moves
        ? state.r.moves
        : null,
  };
}
