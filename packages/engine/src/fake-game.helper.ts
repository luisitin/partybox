// A tiny but complete GameDefinition used only by engine tests. Phases: play (10 s, taps count)
// → done. Exercises every event type so the engine can be tested without a real game.
import type {
  ControllerView,
  GameDefinition,
  GameEvent,
  GameResults,
  GameStateBase,
  InitContext,
  TvView,
} from '@partybox/shared';
import { seedRng, z } from '@partybox/shared';

export interface FakeState extends GameStateBase {
  taps: Record<string, number>;
  log: string[];
}

export type FakeInput = { type: 'tap' } | { type: 'boom' };

export const PLAY_MS = 10_000;

function done(state: FakeState, now: number): FakeState {
  return { ...state, phase: { id: 'done', startedAt: now, deadline: null } };
}

export const fakeGame: GameDefinition<FakeState, FakeInput> = {
  manifest: {
    id: 'fake',
    name: 'Fake',
    tagline: 'taps',
    description: 'A test game.',
    version: '1.0.0',
    minPlayers: 2,
    maxPlayers: 4,
    estimatedMinutes: 1,
    tags: [],
    settings: [
      { key: 'rounds', label: 'Rounds', type: 'number', default: 3, min: 1, max: 5, step: 1 },
      { key: 'spicy', label: 'Spicy', type: 'boolean', default: false },
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    ],
  },
  phases: ['play', 'done'],
  inputSchema: z.union([
    z.object({ type: z.literal('tap') }),
    z.object({ type: z.literal('boom') }),
  ]),
  init(ctx: InitContext): FakeState {
    const players: FakeState['players'] = {};
    const taps: Record<string, number> = {};
    for (const p of ctx.players) {
      players[p.id] = p;
      taps[p.id] = 0;
    }
    return {
      phase: { id: 'play', startedAt: ctx.now, deadline: ctx.now + PLAY_MS },
      rng: seedRng(ctx.seed),
      players,
      taps,
      log: [],
    };
  },
  reduce(state: FakeState, event: GameEvent<FakeInput>): FakeState {
    const log = [...state.log, event.type];
    if (event.type === 'player') {
      const p = state.players[event.playerId];
      if (!p) return state;
      return {
        ...state,
        log,
        players: { ...state.players, [p.id]: { ...p, connected: event.connected } },
      };
    }
    if (event.type === 'vip') {
      if (event.action === 'pause' && !state.phase.paused)
        return { ...state, log, phase: { ...state.phase, paused: { at: event.now } } };
      if (event.action === 'resume' && state.phase.paused) {
        const shift = event.now - state.phase.paused.at;
        const deadline = state.phase.deadline === null ? null : state.phase.deadline + shift;
        return {
          ...state,
          log,
          phase: { id: state.phase.id, startedAt: state.phase.startedAt, deadline },
        };
      }
      if (event.action === 'skip' || event.action === 'end')
        return done({ ...state, log }, event.now);
      return { ...state, log };
    }
    if (state.phase.id !== 'play') return { ...state, log };
    if (event.type === 'timer') {
      if (event.phaseId !== state.phase.id || event.startedAt !== state.phase.startedAt)
        return state;
      return done({ ...state, log }, event.now);
    }
    if (event.type !== 'input') return state;
    if (event.input.type === 'boom') throw new Error('boom');
    if (!(event.playerId in state.taps)) return state;
    return {
      ...state,
      log,
      taps: { ...state.taps, [event.playerId]: (state.taps[event.playerId] ?? 0) + 1 },
    };
  },
  tvView(state: FakeState): TvView {
    return {
      gameId: 'fake',
      phaseId: state.phase.id,
      deadline: state.phase.deadline,
      paused: Boolean(state.phase.paused),
      players: Object.values(state.players).map((p) => ({
        ...p,
        status: 'active',
        score: state.taps[p.id],
      })),
    };
  },
  controllerView(state: FakeState, playerId: string): ControllerView {
    if (playerId === 'throw-me') throw new Error('view boom');
    return {
      ...fakeGame.tvView(state),
      me: { id: playerId, role: state.players[playerId] ? 'player' : 'spectator' },
    };
  },
  results(state: FakeState): GameResults | null {
    if (state.phase.id !== 'done') return null;
    const ranking = Object.entries(state.taps)
      .map(([playerId, score]) => ({ playerId, score, rank: 0 }))
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({ ...r, rank: i + 1 }));
    return {
      scores: state.taps,
      ranking,
      winnerIds: ranking[0] ? [ranking[0].playerId] : [],
      awards: [],
    };
  },
  bot: {
    sampleInput(state, playerId) {
      return state.phase.id === 'play' && playerId in state.taps ? { type: 'tap' } : null;
    },
  },
};
