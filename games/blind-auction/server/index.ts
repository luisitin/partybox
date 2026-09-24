// Blind Auction — bid on mystery lots (docs/game-pack/blind-auction/SPEC.md). `game` is what the
// registry imports. One file per phase under ./phases; this file wires init / reduce / views /
// results / bot / speech / recap together and owns the phase order (`advance`).
import {
  allConnectedDone,
  applyVip,
  enterPhase,
  gameManifestSchema,
  hasPlayer,
  nextFloat,
  seedRng,
  setConnected,
} from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext, Settings } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { CHAOS } from '../content/schema';
import type { Chaos } from '../content/schema';
import { decide } from './bot';
import { drawLots } from './content';
import { enterBid, reduceBid } from './phases/bid';
import { enterFlip, flipSpeech, reduceFlip } from './phases/flip';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterLive, reduceLive } from './phases/live';
import { enterLot, lotSpeech, reduceLot } from './phases/lot';
import { enterSold, reduceSold } from './phases/sold';
import { recap } from './recap';
import { results } from './scoring';
import { speech } from './speech';
import { PHASES, READERS, inputSchema } from './types';
import type { Cfg, Input, Presence, Reader, State } from './types';
import { controllerView, tvView } from './views';
import type { BlindAuctionControllerView, BlindAuctionTvView } from './views';

const manifest = gameManifestSchema.parse(manifestJson);

function num(settings: Settings, key: string, fallback: number, min: number, max: number): number {
  const v = Number(settings[key] ?? fallback);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
}

/** P00 §3.4: presence arrives in the init context once F4 lands; until then, a room is together. */
function presenceOf(ctx: InitContext): Presence {
  const given = (ctx as InitContext & { presence?: Partial<Presence> }).presence;
  const mode = given?.mode;
  return {
    mode: mode === 'remote-voice' || mode === 'remote-text' ? mode : 'together',
    phoneOnly: given?.phoneOnly === true,
  };
}

function cfgOf(settings: Settings, presence: Presence): Cfg {
  const wantsLive = settings['style'] === 'live';
  const chaos = String(settings['chaos'] ?? 'normal');
  const reader = String(settings['reader'] ?? 'george');
  return {
    lots: num(settings, 'lots', 8, 5, 12),
    startCoins: Math.round(num(settings, 'startCoins', 100, 50, 300) / 50) * 50,
    bidSeconds: num(settings, 'bidSeconds', 20, 10, 40),
    live: wantsLive && presence.mode === 'together',
    liveRefused: wantsLive && presence.mode !== 'together',
    chaos: (CHAOS as readonly string[]).includes(chaos) ? (chaos as Chaos) : 'normal',
    grandLot: settings['grandLot'] !== false,
    spicy: settings['spicy'] === true,
    reader: (READERS as readonly string[]).includes(reader) ? (reader as Reader) : 'george',
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const seats = ctx.players.map((p) => p.id);
  const presence = presenceOf(ctx);
  const cfg = cfgOf(ctx.settings, presence);
  const [lots, afterDraw] = drawLots(cfg, seedRng(ctx.seed));
  let rng = afterDraw;
  const factors: Record<string, number> = {};
  for (const p of ctx.players) {
    if (p.bot !== true) continue;
    const [f, next] = nextFloat(rng);
    rng = next;
    factors[p.id] = Math.round((0.5 + f * 0.6) * 100) / 100;
  }
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    presence,
    seats,
    left: [],
    lots,
    l: {
      idx: 0,
      bids: {},
      high: null,
      stage: 0,
      openedAt: ctx.now,
      winner: null,
      price: 0,
      tie: false,
      step: 0,
      effect: null,
      voiceAt: null,
    },
    coins: Object.fromEntries(seats.map((id) => [id, cfg.startCoins])),
    stats: Object.fromEntries(
      seats.map((id) => [
        id,
        { biggestBid: 0, bestProfit: null, thief: 0, trapped: 0, traps: 0, spent: 0 },
      ]),
    ),
    factors,
    notices: {},
    speechMs: {},
  };
  return enterIntro(base, ctx.now);
}

function enterDone(state: State, now: number): State {
  return enterPhase({ ...state, notices: {} }, 'done', now, null);
}

/** The phase order: what a deadline does — and what a VIP skip does. */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterLot(state, now, 0);
    case 'lot':
      return state.cfg.live ? enterLive(state, now) : enterBid(state, now);
    case 'bid':
    case 'live':
      return enterSold(state, now);
    case 'sold':
      return enterFlip(state, now);
    case 'flip':
      return state.l.idx + 1 < state.lots.length
        ? enterLot(state, now, state.l.idx + 1)
        : enterDone(state, now);
    default:
      return state;
  }
}

/** Connections (and leaving for good, ADR-046); a drop can complete the sealed round. */
function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let next = setConnected(state, event);
  if (event.gone && hasPlayer(state, event.playerId) && !state.left.includes(event.playerId))
    next = { ...next, left: [...next.left, event.playerId] };
  if (
    next.phase.id === 'bid' &&
    !next.phase.paused &&
    allConnectedDone(next, Object.keys(next.l.bids))
  )
    return advance(next, event.now);
  return next;
}

function onSpeech(state: State, key: string, ms: number, now: number): State {
  const stored: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  return flipSpeech(lotSpeech(stored, key, ms, now), key, ms, now);
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return onSpeech(state, event.key, event.ms, event.now);
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'lot':
      return reduceLot(state, event, advance);
    case 'bid':
      return reduceBid(state, event, advance);
    case 'live':
      return reduceLive(state, event, advance);
    case 'sold':
      return reduceSold(state, event, advance);
    case 'flip':
      return reduceFlip(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, BlindAuctionTvView, BlindAuctionControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView,
  results,
  bot: {
    // Honest by construction (P00 §7.9): the bot sees only its own phone's view.
    sampleInput(state, playerId, rng) {
      if (!hasPlayer(state, playerId) || state.left.includes(playerId)) return null;
      return decide(controllerView(state, playerId), state.factors[playerId] ?? 0.8, rng);
    },
  },
  speech,
  recap,
};
