// GameRunner: the bridge between a room and a pure GameDefinition. Starts games, feeds them events
// (catching anything a buggy reducer throws), detects the end, and turns deadlines into ticks.
import type { GameEvent, GameStateBase, PlayerInfo, Settings } from '@partybox/shared';
import { LIMITS } from '@partybox/shared';
import type { ApplyResult, Effect, EngineDeps, RoomState, RunningGame } from './types';

export function playerInfos(room: RoomState): PlayerInfo[] {
  return Object.values(room.players)
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((p) => ({ id: p.id, name: p.name, avatarId: p.avatarId, connected: p.connected }));
}

/** Everyone in the room plays the next game; spectators are promoted. */
export function startGame(
  room: RoomState,
  gameId: string,
  settings: Settings,
  seed: number,
  now: number,
  deps: EngineDeps,
): ApplyResult {
  const game = deps.games[gameId];
  if (!game)
    return { room, effects: [{ type: 'log', level: 'error', text: `unknown game ${gameId}` }] };
  const players: Record<string, RoomState['players'][string]> = {};
  for (const p of Object.values(room.players)) players[p.id] = { ...p, spectator: false };
  const base = { ...room, players };
  let state: GameStateBase;
  try {
    state = game.init({ players: playerInfos(base), settings, seed, now });
  } catch (err) {
    return {
      room,
      effects: [{ type: 'log', level: 'error', text: `init(${gameId}) threw: ${String(err)}` }],
    };
  }
  const running: RunningGame = { gameId, seed, settings, state, startedAt: now, firedTimer: null };
  return {
    room: {
      ...base,
      status: 'playing',
      selectedGameId: gameId,
      settings,
      game: running,
      results: null,
      lastGame: { gameId, settings },
    },
    effects: [{ type: 'push' }],
  };
}

/** Applies one game event; a throwing reducer leaves state unchanged and logs (contract rule 1). */
export function applyGameEvent(
  room: RoomState,
  event: GameEvent<unknown>,
  deps: EngineDeps,
): ApplyResult {
  const running = room.game;
  if (!running || room.status !== 'playing') return { room, effects: [] };
  const game = deps.games[running.gameId];
  if (!game) return { room, effects: [] };
  const effects: Effect[] = [];
  let state = running.state;
  try {
    state = game.reduce(running.state, event);
  } catch (err) {
    effects.push({
      type: 'log',
      level: 'error',
      text: `reduce(${running.gameId}, ${event.type}) threw: ${String(err)}`,
    });
    return { room, effects };
  }
  const next: RoomState = { ...room, game: { ...running, state } };
  return finishIfOver(next, deps, effects);
}

/** Moves the room to `results` when the game reports it is over. */
export function finishIfOver(room: RoomState, deps: EngineDeps, effects: Effect[]): ApplyResult {
  const running = room.game;
  const game = running ? deps.games[running.gameId] : undefined;
  if (!running || !game) return { room, effects };
  let results = null;
  try {
    results = game.results(running.state);
  } catch (err) {
    effects.push({ type: 'log', level: 'error', text: `results() threw: ${String(err)}` });
  }
  if (!results) return { room, effects: [...effects, { type: 'push' }] };
  return {
    room: {
      ...room,
      status: 'results',
      game: null,
      results: {
        gameId: running.gameId,
        results,
        players: Object.values(running.state.players),
      },
    },
    effects: [...effects, { type: 'push' }],
  };
}

/** Ends a game the VIP abandoned; no scoreboard when the game produced no results. */
export function abortGame(room: RoomState): ApplyResult {
  if (!room.game) return { room, effects: [] };
  return {
    room: { ...room, status: 'lobby', game: null, results: null },
    effects: [
      { type: 'push' },
      { type: 'toast', to: 'all', kind: 'info', text: 'The game was ended.' },
    ],
  };
}

function deadlineDue(running: RunningGame, now: number): boolean {
  const { phase } = running.state;
  if (phase.deadline === null || phase.paused) return false;
  if (running.firedTimer?.phaseId === phase.id && running.firedTimer.startedAt === phase.startedAt)
    return false;
  return now >= phase.deadline;
}

/** Fires the phase timer when its deadline has passed — exactly once per phase instance. */
export function fireDueTimer(room: RoomState, now: number, deps: EngineDeps): ApplyResult {
  const running = room.game;
  if (!running || room.status !== 'playing' || !deadlineDue(running, now))
    return { room, effects: [] };
  const { phase } = running.state;
  const armed: RoomState = {
    ...room,
    game: { ...running, firedTimer: { phaseId: phase.id, startedAt: phase.startedAt } },
  };
  return applyGameEvent(
    armed,
    { type: 'timer', now, phaseId: phase.id, startedAt: phase.startedAt },
    deps,
  );
}

/** When the host should next send a `tick`, or null when nothing is pending. */
export function nextWakeAt(room: RoomState): number | null {
  const candidates: number[] = [];
  const running = room.game;
  if (running && room.status === 'playing') {
    const { phase } = running.state;
    const fired =
      running.firedTimer?.phaseId === phase.id && running.firedTimer.startedAt === phase.startedAt;
    if (phase.deadline !== null && !phase.paused && !fired) candidates.push(phase.deadline);
  }
  for (const p of Object.values(room.players)) {
    if (p.disconnectedAt === null) continue;
    candidates.push(p.disconnectedAt + LIMITS.disconnectGraceMs);
    if (p.isVip) candidates.push(p.disconnectedAt + LIMITS.vipHandoverMs);
  }
  return candidates.length === 0 ? null : Math.min(...candidates);
}
