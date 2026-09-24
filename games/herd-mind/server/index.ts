// Herd Mind — pick what you think most people will pick (docs/game-pack/herd-mind/SPEC.md). This
// file wires init / reduce / views / results / bot; one file per phase under ./phases.
import { applyVip, gameManifestSchema, seedRng, setConnected } from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { botInput } from './bot';
import { drawQuestions } from './content';
import { enterAnswer, freshQuestion, closeWhenAllIn, reduceAnswer } from './phases/answer';
import { enterHerd, reduceHerd, retimeHerd } from './phases/herd';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterDone, enterScore, reduceScore } from './phases/score';
import { recap } from './recap';
import { results } from './scoring';
import { speech } from './speech';
import { PHASES, READERS, inputSchema } from './types';
import type { Input, Mode, Pace, Reader, Settings, State } from './types';
import { controllerView, tvView } from './views';
import type { HerdControllerView, HerdTvView } from './views';

export type { HerdControllerView, HerdTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

const clamp = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};

function settingsFrom(raw: InitContext['settings']): Settings {
  const reader = String(raw['reader'] ?? 'jessica');
  const pace = String(raw['pace'] ?? 'normal');
  return {
    mode: (raw['mode'] === 'typed' ? 'typed' : 'tiles') as Mode,
    target: clamp(raw['target'], 3, 15, 8),
    maxQuestions: clamp(raw['maxQuestions'], 5, 20, 12),
    pace: (['relaxed', 'normal', 'fast'].includes(pace) ? pace : 'normal') as Pace,
    spicy: raw['spicy'] === true,
    reader: ((READERS as readonly string[]).includes(reader) ? reader : 'jessica') as Reader,
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const cfg = settingsFrom(ctx.settings);
  const [questions, rng] = drawQuestions(seedRng(ctx.seed), cfg);
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    seats: ctx.players.map((p) => p.id),
    left: [],
    questions,
    q: freshQuestion(0),
    scores: Object.fromEntries(ctx.players.map((p) => [p.id, 0])),
    sheep: null,
    winners: [],
    stats: Object.fromEntries(ctx.players.map((p) => [p.id, { herd: 0, alone: 0, sheepHeld: 0 }])),
    pairs: {},
    speechMs: {},
  };
  return enterIntro(base, ctx.now);
}

/** The phase order. What a deadline does — and what a VIP skip does (docs/GAME_CONTRACT.md). */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterAnswer(state, now, 0);
    case 'answer':
      return enterHerd(state, now);
    case 'herd':
      return enterScore(state, now);
    case 'score':
      return state.winners.length > 0 || state.q.n + 1 >= state.questions.length
        ? enterDone(state, now)
        : enterAnswer(state, now, state.q.n + 1);
    default:
      return state;
  }
}

/** A player gone for good: out of the running, and the sheep goes back to the pasture (§2.16). */
function onPlayer(state: State, event: GameEvent<Input>): State {
  if (event.type !== 'player') return state;
  let next = setConnected(state, event);
  if (event.gone && next.seats.includes(event.playerId) && !next.left.includes(event.playerId)) {
    next = {
      ...next,
      left: [...next.left, event.playerId],
      sheep: next.sheep === event.playerId ? null : next.sheep,
    };
  }
  return next.phase.paused ? next : closeWhenAllIn(next, event.now);
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') {
    if (!/^hm[a-z0-9]{4,38}$/.test(event.key)) return state;
    const ms = Number.isFinite(event.ms) ? Math.round(event.ms) : -1;
    return retimeHerd({ ...state, speechMs: { ...state.speechMs, [event.key]: ms } }, event.now);
  }
  // VIP skip = the phase's normal exit; VIP end always jumps to done. Pause/resume shift the deadline.
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'answer':
      return reduceAnswer(state, event, advance);
    case 'herd':
      return reduceHerd(state, event, advance);
    case 'score':
      return reduceScore(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, HerdTvView, HerdControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, playerId, manifest.id),
  results,
  bot: { sampleInput: (state, playerId, rng) => botInput(state, playerId, rng, manifest.id) },
  recap,
  speech,
};
