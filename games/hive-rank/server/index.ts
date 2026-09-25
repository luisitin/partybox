// Hive Rank — rank five things the way the hive would (README.md is the spec). `game` is what the
// registry imports. One file per phase under ./phases; this file wires the order, VIP control,
// speech events, views, results and the bot together.
import { applyVip, gameManifestSchema, seedRng, setConnected } from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { results } from './scoring';
import { decide } from './bot';
import { drawQuestions } from './content';
import { enterHive, nextStep, reduceHive } from './phases/hive';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterRank, rankDone, reduceRank } from './phases/rank';
import { enterDone, enterScore, reduceScore } from './phases/score';
import { recap } from './recap';
import { newRound, recordSpeech } from './round';
import { speech } from './speech';
import { PHASES, READERS, inputSchema } from './types';
import type { Input, Reader, Settings, State } from './types';
import { controllerView, tvView } from './views';
import type { HiveControllerView, HiveTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

function readSettings(raw: InitContext['settings']): Settings {
  const reader = String(raw['reader'] ?? 'jessica');
  return {
    rounds: clamp(raw['rounds'], 3, 10, 6),
    rankSeconds: clamp(raw['rankSeconds'], 15, 60, 30),
    spicy: raw['spicy'] === true,
    reader: (READERS as readonly string[]).includes(reader) ? (reader as Reader) : 'jessica',
  };
}

function init(ctx: InitContext): State {
  const settings = readSettings(ctx.settings);
  const [questions, rng] = drawQuestions(seedRng(ctx.seed), settings.rounds, settings.spicy);
  const players: State['players'] = {};
  const scores: State['scores'] = {};
  for (const p of ctx.players) {
    players[p.id] = p;
    scores[p.id] = 0;
  }
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    settings,
    questions,
    q: newRound(1),
    scores,
    stats: {},
    pairs: {},
    speechMs: {},
  };
  return enterIntro(base, ctx.now);
}

/** After a round's score (or a "Not enough bees!" round): the next round, or the end. */
function afterRound(state: State, now: number): State {
  return state.q.n < state.settings.rounds
    ? enterRank(state, now, state.q.n + 1)
    : enterDone(state, now);
}

/** The phase order. What a deadline does — and what a VIP skip does (docs/GAME_CONTRACT.md). */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterRank(state, now, 1);
    case 'rank':
      return enterHive(state, now);
    case 'hive':
      return state.q.short
        ? afterRound(state, now)
        : (nextStep(state, now) ?? enterScore(state, now));
    case 'score':
      return afterRound(state, now);
    default:
      return state;
  }
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') {
    // A drop can leave everyone still here locked in: the ranking closes.
    const after = setConnected(state, event);
    const closes = after.phase.id === 'rank' && !after.phase.paused && rankDone(after);
    return closes ? advance(after, event.now) : after;
  }
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (event.type === 'speech') {
    const after = recordSpeech(state, event.key, event.ms, event.now);
    return after.phase.id === 'hive' && !after.phase.paused
      ? reduceHive(after, event, advance)
      : after;
  }
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'rank':
      return reduceRank(state, event, advance);
    case 'hive':
      return reduceHive(state, event, advance);
    case 'score':
      return reduceScore(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, HiveTvView, HiveControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  bot: {
    // Honest by construction: the bot sees exactly its own phone's view (foundation §7.9).
    sampleInput: (state, playerId, rng) =>
      decide(controllerView(state, manifest.id, playerId), rng),
  },
  recap,
  speech,
};
