// The room state machine entry point: `createRoom` and `applyRoomEvent` (ADR-010). Dispatches to
// players / vip / runner, then normalises effects: at most one `push` per event, and `rev` bumps
// exactly when a push is emitted.
import { LIMITS } from '@partybox/shared';
import type { GameEvent, GameStateBase } from '@partybox/shared';
import { addBot, removeBot } from './bots';
import { disconnect, expirePlayers, join, removePlayer } from './players';
import { applyGameEvent, fireDueTimer } from './runner';
import type { ApplyResult, Effect, EngineDeps, RoomEvent, RoomState } from './types';
import { applyVip } from './vip';

export interface CreateRoomOptions {
  code: string;
  now: number;
  capacity?: number;
  /** The owner (2026-09-22): private rooms (listed: false) are join-by-code only. */
  listed?: boolean;
}

export function createRoom(options: CreateRoomOptions): RoomState {
  return {
    code: options.code,
    createdAt: options.now,
    capacity: options.capacity ?? LIMITS.roomCapacity,
    locked: false,
    status: 'lobby',
    rev: 0,
    players: {},
    vipId: null,
    selectedGameId: null,
    settings: {},
    game: null,
    results: null,
    lastGame: null,
    recording: true,
    musicOnPhones: false,
    listed: options.listed ?? true,
    phoneOnly: false,
  };
}

/** Deadlines that are already due when a phase starts fire in the same tick, up to this many. */
const MAX_TIMERS_PER_TICK = 10;

function handleInput(
  room: RoomState,
  playerId: string,
  input: unknown,
  now: number,
  deps: EngineDeps,
): ApplyResult {
  const player = room.players[playerId];
  if (!player)
    return {
      room,
      effects: [
        { type: 'error', to: playerId, code: 'not_in_room', message: 'You are not in this room.' },
      ],
    };
  const running = room.game;
  if (!running || room.status !== 'playing')
    return {
      room,
      effects: [
        { type: 'error', to: playerId, code: 'not_playing', message: 'No game is running.' },
      ],
    };
  if (player.spectator || !Object.hasOwn(running.state.players, playerId))
    return {
      room,
      effects: [
        { type: 'error', to: playerId, code: 'not_playing', message: 'You join the next game.' },
      ],
    };
  const game = deps.games[running.gameId];
  if (!game) return { room, effects: [] };
  const parsed = game.inputSchema.safeParse(input);
  if (!parsed.success)
    return {
      room,
      effects: [
        {
          type: 'error',
          to: playerId,
          code: 'invalid_input',
          message: 'That input was not accepted.',
        },
      ],
    };
  return applyGameEvent(
    room,
    { type: 'input', now, playerId, input: parsed.data, vip: playerId === room.vipId },
    deps,
  );
}

function handleTick(room: RoomState, now: number, deps: EngineDeps): ApplyResult {
  let result = expirePlayers(room, now, deps);
  const effects = [...result.effects];
  for (let i = 0; i < MAX_TIMERS_PER_TICK; i++) {
    const fired = fireDueTimer(result.room, now, deps);
    if (fired.room === result.room && fired.effects.length === 0) break;
    effects.push(...fired.effects);
    result = fired;
  }
  return { room: result.room, effects };
}

function isGameEvent(value: unknown): value is GameEvent<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as { type?: unknown; now?: unknown };
  return (
    typeof v.now === 'number' &&
    ['input', 'timer', 'player', 'vip', 'speech'].includes(String(v.type))
  );
}

function isStateBase(value: unknown): value is GameStateBase {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<GameStateBase>;
  return (
    typeof v.phase === 'object' &&
    v.phase !== null &&
    typeof v.rng === 'object' &&
    typeof v.players === 'object'
  );
}

function dispatch(room: RoomState, event: RoomEvent, deps: EngineDeps): ApplyResult {
  switch (event.type) {
    case 'join':
      return join(room, event, deps);
    case 'bot-add':
      return addBot(room, event);
    case 'bot-remove':
      return removeBot(room, event, deps);
    case 'disconnect':
      return disconnect(room, event.playerId, event.now, deps);
    case 'leave':
      return removePlayer(room, event.playerId, event.now, deps, 'left');
    case 'vip':
      return applyVip(room, event.playerId, event.action, event.now, event.seed, deps, event.host);
    case 'input':
      return handleInput(room, event.playerId, event.input, event.now, deps);
    case 'tick':
      return handleTick(room, event.now, deps);
    case 'nudge': {
      // I-070 A: only in the lobby, only from a player who is not the VIP; the toast names the
      // sender so a TV rings their chip (I-040 B).
      const who = room.players[event.playerId];
      const vip = room.vipId ? room.players[room.vipId] : undefined;
      if (room.status !== 'lobby' || !who || who.isVip) return { room, effects: [] };
      return {
        room,
        effects: [
          {
            type: 'toast',
            to: 'all',
            kind: 'info',
            text: `👋 ${who.name} says: hurry up${vip ? `, ${vip.name}` : ''}!`,
            playerId: who.id,
          },
        ],
      };
    }
    case 'here': {
      // I-388: the lobby only; a person (bots are always here)
      const who = room.players[event.playerId];
      if (!who || who.bot || room.status !== 'lobby') return { room, effects: [] };
      const was = room.here?.includes(who.id) ?? false;
      if (was === event.on) return { room, effects: [] };
      const here = event.on
        ? [...(room.here ?? []), who.id]
        : (room.here ?? []).filter((id) => id !== who.id);
      return { room: { ...room, here }, effects: [{ type: 'push' }] };
    }
    case 'dev:loadState': {
      const game = deps.games[event.gameId];
      if (!game || !isStateBase(event.state))
        return { room, effects: [{ type: 'log', level: 'warn', text: 'dev:loadState rejected' }] };
      const settings = event.settings ?? room.settings;
      return {
        room: {
          ...room,
          status: 'playing',
          selectedGameId: event.gameId,
          settings,
          results: null,
          game: {
            gameId: event.gameId,
            seed: 0,
            settings,
            state: event.state,
            startedAt: event.now,
            firedTimer: null,
          },
          lastGame: { gameId: event.gameId, settings },
        },
        effects: [{ type: 'push' }],
      };
    }
    case 'speech':
      // ADR-045: the host's speech service finished a reading the game asked for.
      if (!room.game || room.status !== 'playing') return { room, effects: [] };
      return applyGameEvent(
        room,
        { type: 'speech', now: event.now, key: event.key, ms: event.ms },
        deps,
      );
    case 'dev:gameEvent':
      if (!isGameEvent(event.event))
        return { room, effects: [{ type: 'log', level: 'warn', text: 'dev:gameEvent rejected' }] };
      return applyGameEvent(room, event.event, deps);
  }
}

/** Collapses pushes into one trailing push and bumps rev when there is one. */
function normalise(before: RoomState, result: ApplyResult): ApplyResult {
  const effects: Effect[] = result.effects.filter((e) => e.type !== 'push');
  const pushed = result.effects.some((e) => e.type === 'push');
  if (!pushed) return { room: result.room, effects };
  return { room: { ...result.room, rev: before.rev + 1 }, effects: [...effects, { type: 'push' }] };
}

export function applyRoomEvent(room: RoomState, event: RoomEvent, deps: EngineDeps): ApplyResult {
  return normalise(room, dispatch(room, event, deps));
}
