// The smallest legal game plus a recording transport: shared by the host tests and the server's
// bot tests, so both drive the real engine without a real game or real sockets.
import type { GameDefinition, GameStateBase } from '@partybox/shared';
import { seedRng, z } from '@partybox/shared';
import type { Transport } from './host';

export interface TinyState extends GameStateBase {
  hits: number;
}

/** play (5 s) → done; any input counts a hit. */
export const tiny: GameDefinition<TinyState, { hit: true }> = {
  manifest: {
    id: 'tiny',
    name: 'Tiny',
    tagline: 't',
    description: 'd',
    version: '1.0.0',
    minPlayers: 1,
    maxPlayers: 8,
    estimatedMinutes: 1,
    tags: [],
    settings: [],
    supportsBots: true,
  },
  phases: ['play', 'done'],
  inputSchema: z.object({ hit: z.literal(true) }),
  init: (ctx) => ({
    phase: { id: 'play', startedAt: ctx.now, deadline: ctx.now + 5000 },
    rng: seedRng(ctx.seed),
    players: Object.fromEntries(ctx.players.map((p) => [p.id, p])),
    hits: 0,
  }),
  reduce: (s, e) => {
    if (e.type === 'timer' || (e.type === 'vip' && (e.action === 'skip' || e.action === 'end')))
      return { ...s, phase: { id: 'done', startedAt: e.now, deadline: null } };
    if (e.type === 'input' && s.phase.id === 'play') return { ...s, hits: s.hits + 1 };
    return s;
  },
  tvView: (s) => ({
    gameId: 'tiny',
    phaseId: s.phase.id,
    deadline: s.phase.deadline,
    paused: false,
    players: [],
  }),
  controllerView: (s, id) => ({
    gameId: 'tiny',
    phaseId: s.phase.id,
    deadline: s.phase.deadline,
    paused: false,
    players: [],
    me: { id, role: 'player' },
  }),
  results: (s) =>
    s.phase.id === 'done' ? { scores: {}, ranking: [], winnerIds: [], awards: [] } : null,
  bot: { sampleInput: (s) => (s.phase.id === 'play' ? { hit: true } : null) },
};

export function fakeTransport(): Transport & {
  sent: { to: string; event: string; payload: unknown }[];
} {
  const sent: { to: string; event: string; payload: unknown }[] = [];
  return {
    sent,
    toPlayer: (to, event, payload) => void sent.push({ to, event, payload }),
    toTvs: (code, event, payload) => void sent.push({ to: `tv:${code}`, event, payload }),
    toAll: (code, event, payload) => void sent.push({ to: `all:${code}`, event, payload }),
    disconnectPlayer: (to) => void sent.push({ to, event: 'disconnect', payload: null }),
  };
}
