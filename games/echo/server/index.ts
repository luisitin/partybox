// Echo 🔁 — the pack's co-op word game (docs/game-pack/echo/SPEC.md). `game` is what the registry
// imports; one file per phase under ./phases; this file wires init / reduce / views / bot together
// and owns the phase order (`advance`, which a deadline and a VIP skip both run).
import {
  applyVip,
  gameManifestSchema,
  multiselectPicks,
  nextInt,
  seedRng,
  setConnected,
} from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext, Settings } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { decide } from './bot';
import { drawWords } from './content';
import { piles } from './deck';
import { enterCheck, recheckCheck, reduceCheck, wantsCheck } from './phases/check';
import { enterClue, recheckClue, reduceClue } from './phases/clue';
import { enterGuess, reduceGuess } from './phases/guess';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterDone, enterResult, reduceResult } from './phases/result';
import { recap } from './recap';
import { guesserFor } from './roles';
import { results } from './scoring';
import { applySpeech, speech } from './speech';
import { PHASES, READERS, SPARES, inputSchema } from './types';
import type { Cfg, Input, Reader, State } from './types';
import { controllerView, tvView } from './views';
import type { EchoControllerView, EchoTvView } from './views';

const manifest = gameManifestSchema.parse(manifestJson);

function num(settings: Settings, key: string, fallback: number, min: number, max: number): number {
  const v = Number(settings[key] ?? fallback);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
}

export function readCfg(settings: Settings): Cfg {
  const reader = String(settings['reader'] ?? 'george');
  return {
    words: num(settings, 'words', 10, 6, 13),
    clueSeconds: num(settings, 'clueSeconds', 35, 20, 60),
    guessSeconds: num(settings, 'guessSeconds', 25, 15, 45),
    check: settings['check'] !== false,
    categories: multiselectPicks(String(settings['categories'] ?? '')),
    spicy: settings['spicy'] === true,
    reader: (READERS as readonly string[]).includes(reader) ? (reader as Reader) : 'george',
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const cfg = readCfg(ctx.settings);
  const seats = ctx.players.map((p) => p.id);
  const [deck, spares, r1] = drawWords(
    seedRng(ctx.seed),
    cfg.categories,
    cfg.spicy,
    cfg.words,
    SPARES,
  );
  const [start, rng] = nextInt(r1, 0, Math.max(0, seats.length - 1));
  const rotation = [...seats.slice(start), ...seats.slice(0, start)];
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    twoClues: seats.length === 3,
    seats,
    left: [],
    deck,
    spares,
    rotation,
    w: {
      idx: 0,
      word: deck[0] as State['w']['word'],
      guesser: guesserFor({ rotation, left: [] }, 0),
      clues: {},
      rejects: {},
      dontKnow: [],
      swaps: 0,
      groups: null,
      checkOk: [],
      guess: null,
    },
    turns: [],
    speechMs: {},
  };
  return enterIntro(base, ctx.now);
}

/** The phase order: what a deadline does — and what a VIP skip does. */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterClue(state, now);
    case 'clue':
      return wantsCheck(state) ? enterCheck(state, now) : enterGuess(state, now);
    case 'check':
      return enterGuess(state, now);
    case 'guess':
      return enterResult(state, now, 'pass', '');
    case 'result':
      return piles(state).left === 0 ? enterDone(state, now) : enterClue(state, now);
    default:
      return state;
  }
}

function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let next = setConnected(state, event);
  if (event.gone && state.seats.includes(event.playerId) && !state.left.includes(event.playerId))
    next = { ...next, left: [...next.left, event.playerId] };
  if (next.phase.paused) return next;
  // A drop may leave everyone still here done.
  if (next.phase.id === 'clue') return recheckClue(next, event.now, advance);
  if (next.phase.id === 'check') return recheckCheck(next, event.now, advance);
  return next;
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return applySpeech(state, event.key, event.ms);
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'clue':
      return reduceClue(state, event, advance);
    case 'check':
      return reduceCheck(state, event, advance);
    case 'guess':
      return reduceGuess(state, event, enterResult);
    case 'result':
      return reduceResult(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, EchoTvView, EchoControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView,
  results,
  recap,
  speech,
  bot: {
    sampleInput(state, playerId, rng) {
      return decide(controllerView(state, playerId), rng);
    },
  },
};
