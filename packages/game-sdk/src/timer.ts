// Phase + timer helpers for reducers (docs/GAME_CONTRACT.md "Timers are data"). All pure: they
// return new state and never touch the old one.
import type { GameEvent, GameStateBase, VipGameAction } from '@partybox/shared';

/** Enters a phase now; `durationMs = null` means no deadline (the phase must exit another way). */
export function enterPhase<S extends GameStateBase>(
  state: S,
  id: string,
  now: number,
  durationMs: number | null,
): S {
  return {
    ...state,
    phase: { id, startedAt: now, deadline: durationMs === null ? null : now + durationMs },
  };
}

/** True when a timer event belongs to the CURRENT phase instance (stale timers must be ignored). */
export function isTimerFor(state: GameStateBase, event: GameEvent<unknown>): boolean {
  return (
    event.type === 'timer' &&
    event.phaseId === state.phase.id &&
    event.startedAt === state.phase.startedAt
  );
}

export function isPaused(state: GameStateBase): boolean {
  return state.phase.paused !== undefined;
}

/** Applies `player` events to `state.players[].connected`; other players are ignored. */
export function setConnected<S extends GameStateBase>(state: S, event: GameEvent<unknown>): S {
  if (event.type !== 'player' || !hasPlayer(state, event.playerId)) return state;
  const player = state.players[event.playerId];
  if (!player || player.connected === event.connected) return state;
  return {
    ...state,
    players: { ...state.players, [event.playerId]: { ...player, connected: event.connected } },
  };
}

export interface VipHandlers<S> {
  /** Advance past the current phase (what a deadline would do). */
  skip: (state: S, now: number) => S;
  /** Jump to the terminal phase so `results()` becomes non-null. */
  end: (state: S, now: number) => S;
}

/** Pause/resume shift the deadline; skip/end delegate to the game. Returns null for non-VIP events. */
export function applyVip<S extends GameStateBase>(
  state: S,
  event: GameEvent<unknown>,
  handlers: VipHandlers<S>,
): S | null {
  if (event.type !== 'vip') return null;
  const action: VipGameAction = event.action;
  const { phase } = state;
  switch (action) {
    case 'pause':
      if (phase.paused) return state;
      return { ...state, phase: { ...phase, paused: { at: event.now } } };
    case 'resume': {
      if (!phase.paused) return state;
      const shift = Math.max(0, event.now - phase.paused.at);
      return {
        ...state,
        phase: {
          id: phase.id,
          startedAt: phase.startedAt,
          deadline: phase.deadline === null ? null : phase.deadline + shift,
        },
      };
    }
    case 'skip':
      return handlers.skip(phase.paused ? unpause(state, event.now) : state, event.now);
    case 'end':
      return handlers.end(state, event.now);
  }
}

function unpause<S extends GameStateBase>(state: S, now: number): S {
  const resumed = applyVip(
    state,
    { type: 'vip', now, action: 'resume' },
    {
      skip: (s) => s,
      end: (s) => s,
    },
  );
  return resumed ?? state;
}

/** Ids of players who are connected (the usual "everyone submitted" denominator). */
export function connectedIds(state: GameStateBase): string[] {
  return Object.values(state.players)
    .filter((p) => p.connected)
    .map((p) => p.id);
}

/** True when every connected player id is in `done` (and at least one player is connected). */
export function allConnectedDone(state: GameStateBase, done: Iterable<string>): boolean {
  const set = new Set(done);
  const ids = connectedIds(state);
  return ids.length > 0 && ids.every((id) => set.has(id));
}

/**
 * True when `playerId` is one of the game's players. Use this instead of `state.players[id]`
 * truthiness: `state.players['__proto__']` is Object.prototype, which is truthy.
 */
export function hasPlayer(state: GameStateBase, playerId: string): boolean {
  return Object.hasOwn(state.players, playerId);
}
