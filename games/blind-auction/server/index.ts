// Blind Auction — "Bet on the box" (docs/game-pack/blind-auction/, the owner's redesign 2026-09-24).
// `game` is what the registry imports. One file per phase under ./phases; this file wires init /
// reduce / views / results / bot / speech / recap together and owns the phase order (`advance`).
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
import { decide } from './bot';
import { drawBoxes } from './content';
import { enterBet, reduceBet } from './phases/bet';
import { boxSpeech, enterBox, reduceBox } from './phases/box';
import { enterOpen, openSpeech, reduceOpen } from './phases/open';
import { allReady, countDown, enterRules, reduceRules } from './phases/rules';
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

function cfgOf(settings: Settings): Cfg {
  const reader = String(settings['reader'] ?? 'george');
  return {
    rounds: num(settings, 'rounds', 8, 5, 12),
    startCoins: Math.round(num(settings, 'startCoins', 100, 50, 300) / 50) * 50,
    betSeconds: num(settings, 'betSeconds', 20, 10, 40),
    grand: settings['grand'] !== false,
    spicy: settings['spicy'] === true,
    live: settings['live'] === true,
    reader: (READERS as readonly string[]).includes(reader) ? (reader as Reader) : 'george',
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const seats = ctx.players.map((p) => p.id);
  const cfg = cfgOf(ctx.settings);
  const [boxes, afterDraw] = drawBoxes(cfg, seedRng(ctx.seed));
  let rng = afterDraw;
  const factors: Record<string, number> = {};
  for (const p of ctx.players) {
    if (p.bot !== true) continue;
    const [f, next] = nextFloat(rng);
    rng = next;
    factors[p.id] = Math.round(f * 100) / 100;
  }
  const base: State = {
    phase: { id: 'rules', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    presence: presenceOf(ctx),
    seats,
    left: [],
    boxes,
    r: { idx: 0, bets: {}, step: 0, voiceAt: null, turnedAt: null, topped: [] },
    // Bots have read the rules.
    ready: ctx.players.filter((p) => p.bot === true).map((p) => p.id),
    rulesStep: 0,
    coins: Object.fromEntries(seats.map((id) => [id, cfg.startCoins])),
    stats: Object.fromEntries(
      seats.map((id) => [id, { biggestBet: 0, biggestWin: 0, longShots: 0, calls: 0, lost: 0 }]),
    ),
    factors,
    notices: {},
    speechMs: {},
  };
  return enterRules(base, ctx.now);
}

function enterDone(state: State, now: number): State {
  return enterPhase({ ...state, notices: {} }, 'done', now, null);
}

/** The phase order: what a deadline does — and what a VIP skip does. */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'rules':
      return enterBox(state, now, 0);
    case 'box':
      return enterBet(state, now);
    case 'bet':
      return enterOpen(state, now);
    case 'open':
      return state.r.idx + 1 < state.boxes.length
        ? enterBox(state, now, state.r.idx + 1)
        : enterDone(state, now);
    default:
      return state;
  }
}

/** Connections (and leaving for good, ADR-046); a drop can complete the ready-up or the betting. */
function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let next = setConnected(state, event);
  if (event.gone && hasPlayer(state, event.playerId) && !state.left.includes(event.playerId))
    next = { ...next, left: [...next.left, event.playerId] };
  if (next.phase.paused) return next;
  if (next.phase.id === 'rules' && next.rulesStep === 0 && allReady(next))
    return countDown(next, event.now);
  if (next.phase.id === 'bet' && allConnectedDone(next, Object.keys(next.r.bets)))
    return advance(next, event.now);
  return next;
}

function onSpeech(state: State, key: string, ms: number, now: number): State {
  const stored: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  return openSpeech(boxSpeech(stored, key, ms, now), key, ms, now);
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return onSpeech(state, event.key, event.ms, event.now);
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'rules':
      return reduceRules(state, event, advance);
    case 'box':
      return reduceBox(state, event, advance);
    case 'bet':
      return reduceBet(state, event, advance);
    case 'open':
      return reduceOpen(state, event, advance);
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
      return decide(controllerView(state, playerId), state.factors[playerId] ?? 0.5, rng);
    },
  },
  speech,
  recap,
};
