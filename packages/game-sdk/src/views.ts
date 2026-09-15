// View-building helpers: the envelope every view must carry (docs/GAME_CONTRACT.md "Views").
import type {
  ControllerView,
  GameStateBase,
  PlayerStatus,
  ViewEnvelope,
  ViewPlayer,
} from '@partybox/shared';

export interface EnvelopeOptions {
  /** Per-player chip state; defaults to 'active'. */
  statusOf?: (playerId: string) => PlayerStatus;
  /** Shown on chips when provided. */
  scores?: Record<string, number>;
}

/** `players[]` for the envelope, in a stable order (by id) so TVs agree. */
export function viewPlayers(state: GameStateBase, options: EnvelopeOptions = {}): ViewPlayer[] {
  return Object.values(state.players)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => {
      const player: ViewPlayer = {
        id: p.id,
        name: p.name,
        avatarId: p.avatarId,
        connected: p.connected,
        status: options.statusOf ? options.statusOf(p.id) : 'active',
      };
      if (options.scores) player.score = options.scores[p.id] ?? 0;
      return player;
    });
}

/** The common part of a TV view. Spread your own fields after it. */
export function envelope(
  state: GameStateBase,
  gameId: string,
  options: EnvelopeOptions = {},
): ViewEnvelope {
  return {
    gameId,
    phaseId: state.phase.id,
    deadline: state.phase.deadline,
    paused: state.phase.paused !== undefined,
    players: viewPlayers(state, options),
  };
}

/** The common part of a controller view: envelope + `me`. Unknown ids are spectators. */
export function controllerEnvelope(
  state: GameStateBase,
  gameId: string,
  playerId: string,
  options: EnvelopeOptions = {},
): ControllerView {
  return {
    ...envelope(state, gameId, options),
    me: { id: playerId, role: Object.hasOwn(state.players, playerId) ? 'player' : 'spectator' },
  };
}
