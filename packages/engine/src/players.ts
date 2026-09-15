// Player lifecycle: join (with name/capacity/lock rules), resume by token, disconnect, leave,
// removal, spectators, and the time-based rules (120 s leave grace, 30 s VIP handover).
import type { ErrorCode } from '@partybox/shared';
import { LIMITS, isAvatarId, nameKey, normalizeName } from '@partybox/shared';
import { applyGameEvent } from './runner';
import type { ApplyResult, Effect, EngineDeps, RoomEvent, RoomPlayer, RoomState } from './types';

type JoinEvent = Extract<RoomEvent, { type: 'join' }>;

function error(to: string, code: ErrorCode, message: string): Effect {
  return { type: 'error', to, code, message };
}

function findByToken(room: RoomState, token: string): RoomPlayer | undefined {
  return Object.values(room.players).find((p) => p.token === token);
}

function nameTaken(room: RoomState, name: string): boolean {
  const key = nameKey(name);
  return Object.values(room.players).some((p) => nameKey(p.name) === key);
}

/** Playing players (not spectators) receive `player` events; others don't exist to the game. */
function notifyGame(
  room: RoomState,
  playerId: string,
  connected: boolean,
  now: number,
  deps: EngineDeps,
): ApplyResult {
  if (room.status !== 'playing' || !room.game?.state.players[playerId])
    return { room, effects: [] };
  return applyGameEvent(room, { type: 'player', now, playerId, connected }, deps);
}

export function join(room: RoomState, event: JoinEvent, deps: EngineDeps): ApplyResult {
  const existing = event.existingToken ? findByToken(room, event.existingToken) : undefined;
  if (existing) return resume(room, existing, event.now, deps);

  if (room.locked)
    return { room, effects: [error(event.playerId, 'room_locked', 'This room is locked.')] };
  if (Object.keys(room.players).length >= room.capacity)
    return { room, effects: [error(event.playerId, 'room_full', 'This room is full.')] };
  const name = normalizeName(event.name);
  if (!name)
    return {
      room,
      effects: [error(event.playerId, 'name_invalid', 'Pick a name of 1–16 characters.')],
    };
  if (nameTaken(room, name))
    return { room, effects: [error(event.playerId, 'name_taken', 'That name is taken.')] };
  if (!isAvatarId(event.avatarId))
    return { room, effects: [error(event.playerId, 'avatar_invalid', 'Pick an avatar.')] };

  const isVip = room.vipId === null;
  const player: RoomPlayer = {
    id: event.playerId,
    name,
    avatarId: event.avatarId,
    token: event.token,
    isVip,
    connected: true,
    joinedAt: event.now,
    disconnectedAt: null,
    spectator: room.status === 'playing',
  };
  const next: RoomState = {
    ...room,
    players: { ...room.players, [player.id]: player },
    vipId: isVip ? player.id : room.vipId,
  };
  return {
    room: next,
    effects: [
      { type: 'welcome', playerId: player.id },
      { type: 'push' },
      {
        type: 'toast',
        to: 'all',
        kind: 'info',
        text: `${name} joined${player.spectator ? ' (next game)' : ''}`,
      },
    ],
  };
}

function resume(room: RoomState, player: RoomPlayer, now: number, deps: EngineDeps): ApplyResult {
  const updated: RoomPlayer = { ...player, connected: true, disconnectedAt: null };
  const next: RoomState = { ...room, players: { ...room.players, [player.id]: updated } };
  const game = notifyGame(next, player.id, true, now, deps);
  return {
    room: game.room,
    effects: [{ type: 'welcome', playerId: player.id }, ...game.effects, { type: 'push' }],
  };
}

export function disconnect(
  room: RoomState,
  playerId: string,
  now: number,
  deps: EngineDeps,
): ApplyResult {
  const player = room.players[playerId];
  if (!player || !player.connected) return { room, effects: [] };
  const next: RoomState = {
    ...room,
    players: { ...room.players, [playerId]: { ...player, connected: false, disconnectedAt: now } },
  };
  const game = notifyGame(next, playerId, false, now, deps);
  return { room: game.room, effects: [...game.effects, { type: 'push' }] };
}

/** Removes a player for good (explicit leave, grace expiry, or kick). VIP passes on immediately. */
export function removePlayer(
  room: RoomState,
  playerId: string,
  now: number,
  deps: EngineDeps,
  reason: 'left' | 'kicked',
): ApplyResult {
  const player = room.players[playerId];
  if (!player) return { room, effects: [] };
  const players = { ...room.players };
  delete players[playerId];
  let next: RoomState = { ...room, players, vipId: room.vipId === playerId ? null : room.vipId };
  const effects: Effect[] = [];
  // Idempotent for the game: a second `connected: false` is harmless, a missed one is not.
  const game = notifyGame(next, playerId, false, now, deps);
  next = game.room;
  effects.push(...game.effects);
  if (room.vipId === playerId) {
    const handover = promoteVip(next, now);
    next = handover.room;
    effects.push(...handover.effects);
  }
  effects.push(
    { type: 'push' },
    {
      type: 'toast',
      to: 'all',
      kind: 'info',
      text: reason === 'kicked' ? `${player.name} was kicked` : `${player.name} left`,
    },
  );
  return { room: next, effects };
}

/** Longest-connected connected player becomes VIP. No-op when nobody is connected. */
export function promoteVip(room: RoomState, _now: number): ApplyResult {
  const candidates = Object.values(room.players)
    .filter((p) => p.connected && p.id !== room.vipId)
    .sort((a, b) => a.joinedAt - b.joinedAt);
  const chosen = candidates[0];
  if (!chosen) return { room, effects: [] };
  const players: Record<string, RoomPlayer> = {};
  for (const p of Object.values(room.players)) players[p.id] = { ...p, isVip: p.id === chosen.id };
  return {
    room: { ...room, players, vipId: chosen.id },
    effects: [{ type: 'toast', to: 'all', kind: 'info', text: `${chosen.name} is now the VIP` }],
  };
}

/** Time-based rules: expire long disconnects, hand the VIP over after 30 s away. */
export function expirePlayers(room: RoomState, now: number, deps: EngineDeps): ApplyResult {
  let next = room;
  const effects: Effect[] = [];
  for (const id of Object.keys(room.players)) {
    const p = next.players[id]; // re-read: an earlier removal may have promoted a new VIP
    if (!p || p.disconnectedAt === null) continue;
    if (now - p.disconnectedAt >= LIMITS.disconnectGraceMs) {
      const r = removePlayer(next, p.id, now, deps, 'left');
      next = r.room;
      effects.push(...r.effects);
    } else if (p.isVip && now - p.disconnectedAt >= LIMITS.vipHandoverMs) {
      const r = promoteVip(next, now);
      if (r.room !== next) {
        next = r.room;
        effects.push(...r.effects, { type: 'push' });
      }
    }
  }
  return { room: next, effects };
}
