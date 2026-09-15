// Quick Poll — the template game. `game` is what the registry imports. One file per phase under
// ./phases; this file only wires init / reduce / views / results / bot together.
import {
  applyVip,
  controllerEnvelope,
  envelope,
  gameManifestSchema,
  seedRng,
  setConnected,
} from '@partybox/game-sdk';
import type {
  ControllerView,
  GameDefinition,
  GameEvent,
  InitContext,
  TvView,
} from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { WORDS } from './content';
import { enterAnswer, reduceAnswer } from './phases/answer';
import { enterDone, enterReveal, reduceReveal } from './phases/reveal';
import { results } from './scoring';
import { PHASES, inputSchema } from './types';
import type { Input, State } from './types';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

export interface QuickPollTvView extends TvView {
  prompt: string;
  /** Only filled from `reveal` on; the TV never spoils answers early. */
  answers: { playerId: string; name: string; text: string }[];
  answeredCount: number;
  totalCount: number;
}

export interface QuickPollControllerView extends ControllerView {
  prompt: string;
  submitted: boolean;
  myAnswer: string | null;
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const base: State = {
    phase: { id: 'answer', startedAt: ctx.now, deadline: null },
    rng: seedRng(ctx.seed),
    players,
    prompt: WORDS.prompt,
    answers: {},
    scores: {},
    settings: { answerSeconds: Number(ctx.settings['answerSeconds'] ?? 30) },
  };
  return enterAnswer(base, ctx.now);
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return setConnected(state, event);
  // VIP skip from "answer" still shows the reveal (people want to see the answers); from
  // "reveal" it ends the game. VIP end always ends.
  const vip = applyVip(state, event, {
    skip: (s, now) => (s.phase.id === 'answer' ? enterReveal(s, now) : enterDone(s, now)),
    end: enterDone,
  });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'answer':
      return reduceAnswer(state, event);
    case 'reveal':
      return reduceReveal(state, event);
    default:
      return state;
  }
}

function statusOf(state: State): (id: string) => 'active' | 'submitted' | 'waiting' {
  return (id) =>
    id in state.answers ? 'submitted' : state.phase.id === 'answer' ? 'active' : 'waiting';
}

function tvView(state: State): QuickPollTvView {
  const revealed = state.phase.id !== 'answer';
  return {
    ...envelope(state, manifest.id, {
      statusOf: statusOf(state),
      scores: revealed ? state.scores : undefined,
    }),
    prompt: state.prompt,
    answers: revealed
      ? Object.entries(state.answers).map(([playerId, text]) => ({
          playerId,
          name: state.players[playerId]?.name ?? '?',
          text,
        }))
      : [],
    answeredCount: Object.keys(state.answers).length,
    totalCount: Object.values(state.players).filter((p) => p.connected).length,
  };
}

function controllerView(state: State, playerId: string): QuickPollControllerView {
  return {
    ...controllerEnvelope(state, manifest.id, playerId, { statusOf: statusOf(state) }),
    prompt: state.prompt,
    submitted: playerId in state.answers,
    myAnswer: state.answers[playerId] ?? null,
  };
}

export const game: GameDefinition<State, Input> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView,
  results,
  bot: {
    sampleInput(state, playerId, rng) {
      if (
        state.phase.id !== 'answer' ||
        !Object.hasOwn(state.players, playerId) ||
        playerId in state.answers
      )
        return null;
      return { type: 'answer', text: rng.pick(WORDS.words) };
    },
  },
};
