// Lightning Round — speed trivia. `game` is what the registry imports. One file per phase under
// ./phases; this file wires init / reduce / views / results / bot together and owns the phase
// order (`advance`), which is also what a VIP skip does.
import {
  allConnectedDone,
  applyVip,
  gameManifestSchema,
  seedRng,
  setConnected,
} from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { sampleInput } from './bot';
import { drawQuestions } from './draw';
import { enterIntro, reduceIntro } from './phases/intro';
import { enterQuestion, reduceQuestion } from './phases/question';
import { enterDone, enterReveal, reduceReveal } from './phases/reveal';
import { enterWager, reduceWager } from './phases/wager';
import { EMPTY_STATS, results } from './scoring';
import { PHASES, inputSchema, isFinalIndex } from './types';
import type { Input, Settings, State } from './types';
import { controllerView, tvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

export type { LightningControllerView, LightningTvView } from './views';

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

/** Settings as the manifest declares them; out-of-range values (tests, old rooms) are clamped. */
export function settingsFrom(raw: InitContext['settings']): Settings {
  const category = typeof raw['category'] === 'string' ? raw['category'] : 'all';
  return {
    questions: clampInt(raw['questions'], 10, 5, 20),
    answerSeconds: clampInt(raw['answerSeconds'], 15, 5, 30),
    category: manifest.settings.some(
      (s) =>
        s.key === 'category' && s.type === 'select' && s.options.some((o) => o.value === category),
    )
      ? category
      : 'all',
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  const zero: Record<string, number> = {};
  const stats: State['stats'] = {};
  for (const p of ctx.players) {
    players[p.id] = p;
    zero[p.id] = 0;
    stats[p.id] = EMPTY_STATS;
  }
  const settings = settingsFrom(ctx.settings);
  const [draw, rng] = drawQuestions(seedRng(ctx.seed), settings.category, settings.questions);
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    settings,
    drawnFrom: draw.drawnFrom,
    questionIds: draw.ids,
    index: -1,
    picks: {},
    scores: { ...zero },
    streaks: { ...zero },
    wagers: {},
    lastDelta: {},
    stats,
  };
  return enterIntro(base, ctx.now);
}

/** What the deadline of the current phase does — also the VIP "skip" (README "Edge cases"). */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
    case 'wager':
      return enterQuestion(state, now);
    case 'question':
      return enterReveal(state, now);
    case 'reveal': {
      if (isFinalIndex(state, state.index)) return enterDone(state, now);
      const lastRegular = state.index === state.questionIds.length - 2;
      return lastRegular ? enterWager(state, now) : enterQuestion(state, now);
    }
    default:
      return state;
  }
}

/** The drop of the last outstanding player ends the phase like their input would have
 *  (review-loop #48): the room never sits out a full timer for someone who has gone. */
function closeIfDone(state: State, now: number): State {
  const done =
    state.phase.id === 'question'
      ? Object.keys(state.picks)
      : state.phase.id === 'wager'
        ? Object.keys(state.wagers)
        : null;
  return done && allConnectedDone(state, done) ? advance(state, now) : state;
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') {
    const after = setConnected(state, event);
    return event.connected || after.phase.paused ? after : closeIfDone(after, event.now);
  }
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'question':
      return reduceQuestion(state, event, advance);
    case 'reveal':
      return reduceReveal(state, event, advance);
    case 'wager':
      return reduceWager(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  bot: { sampleInput },
};
