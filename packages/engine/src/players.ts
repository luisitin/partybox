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

function findDisconnectedByName(room: RoomState, rawName: string): RoomPlayer | undefined {
  const name = normalizeName(rawName);
  if (!name) return undefined;
  const key = nameKey(name);
  return Object.values(room.players).find((p) => !p.connected && !p.bot && nameKey(p.name) === key);
}

/** Playing players (not spectators) receive `player` events; others don't exist to the game. */
function notifyGame(
  room: RoomState,
  playerId: string,
  connected: boolean,
  now: number,
  deps: EngineDeps,
  gone?: 'left' | 'kicked', // I-773 B: the game hears why a player went for good
): ApplyResult {
  if (room.status !== 'playing' || !Object.hasOwn(room.game?.state.players ?? {}, playerId))
    return { room, effects: [] };
  const event = gone
    ? { type: 'player' as const, now, playerId, connected, gone }
    : { type: 'player' as const, now, playerId, connected };
  return applyGameEvent(room, event, deps);
}

export function join(room: RoomState, event: JoinEvent, deps: EngineDeps): ApplyResult {
  const existing = event.existingToken ? findByToken(room, event.existingToken) : undefined;
  if (existing) return resume(room, existing, event.now, deps);
  // A closed tab loses its token. A token-less join under the name of a player who is currently
  // DISCONNECTED resumes that player (living-room trust model, ADR-029) instead of "name taken".
  const orphan = findDisconnectedByName(room, event.name);
  // I-741 A: the seat's login moves to the phone that took it back (the minted token)
  if (orphan) return resume(room, orphan, event.now, deps, { token: event.token, byName: true });
  // I-741 C: "That's me — take my seat": the seat still reads connected (its phone died inside the
  // ping window), and this phone claims it; the server drops the old connection.
  if (event.takeOver) {
    const key = nameKey(normalizeName(event.name) ?? '');
    const seat = Object.values(room.players).find((p) => !p.bot && nameKey(p.name) === key);
    if (seat) return resume(room, seat, event.now, deps, { token: event.token, byName: true });
  }

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
  if (nameTaken(room, name)) {
    // I-040 A: the room is told too — the TVs get a toast naming the clash.
    const key = nameKey(name);
    const taken = Object.values(room.players).find((p) => nameKey(p.name) === key);
    return {
      room,
      effects: [
        {
          type: 'error',
          to: event.playerId,
          code: 'name_taken',
          message: 'That name is taken.',
          ...(taken ? { player: { name: taken.name, avatarId: taken.avatarId } } : {}),
        },
        {
          type: 'toast',
          to: 'tvs',
          kind: 'info',
          text: `Someone's trying to join as ${taken?.name ?? name} — that name's taken`,
          ...(taken ? { playerId: taken.id } : {}),
        },
      ],
    };
  }
  if (!isAvatarId(event.avatarId))
    return { room, effects: [error(event.playerId, 'avatar_invalid', 'Pick an avatar.')] };

  const isVip = room.vipId === null;
  const player: RoomPlayer = {
    id: event.playerId,
    name,
    avatarId: event.avatarId,
    ...(event.photo ? { photo: event.photo } : {}),
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

function resume(
  room: RoomState,
  player: RoomPlayer,
  now: number,
  deps: EngineDeps,
  /** I-741: a seat taken back by name (another phone) — its login moves to that phone. */
  byName?: { token: string; byName: true },
): ApplyResult {
  const updated: RoomPlayer = {
    ...player,
    ...(byName ? { token: byName.token } : {}),
    connected: true,
    disconnectedAt: null,
  };
  const next: RoomState = { ...room, players: { ...room.players, [player.id]: updated } };
  const woke = notifyGame(next, player.id, true, now, deps);
  // I-746 B: the first phone back wakes the room: the game carries on
  const game =
    woke.room.asleepSince !== undefined && woke.room.status === 'playing' && !player.bot
      ? (() => {
          // a pause the VIP made before everyone dropped stays theirs to lift
          const r = woke.room.asleepKeptPause
            ? { room: woke.room, effects: [] }
            : applyGameEvent(woke.room, { type: 'vip', now, action: 'resume' }, deps);
          const { asleepSince: _gone, asleepKeptPause: _kept, ...awake } = r.room;
          void _gone;
          void _kept;
          return { room: awake as RoomState, effects: [...woke.effects, ...r.effects] };
        })()
      : woke;
  // I-347 C: no VIP toast here — the phone's "Take it back" pill says who took over
  return {
    room: game.room,
    effects: [
      { type: 'welcome', playerId: player.id },
      ...game.effects,
      { type: 'push' },
      // I-741 B: say it — the phone that came back, and the room
      ...(byName
        ? ([
            {
              type: 'toast',
              to: player.id,
              kind: 'success',
              text: `Welcome back, ${player.name} — picking up where you left off`,
            },
            {
              type: 'toast',
              to: 'tvs',
              kind: 'info',
              text: `${player.name} is back (new phone)`,
              playerId: player.id,
            },
          ] as const)
        : []),
    ],
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
  // I-746 B: the last person's phone went quiet mid-game — pause it (the game's own pause), so
  // nothing is spent on an empty room
  const anyone = Object.values(game.room.players).some((p) => p.connected && !p.bot);
  if (game.room.status === 'playing' && !anyone && game.room.asleepSince === undefined) {
    const kept = game.room.game?.state.phase.paused !== undefined;
    const paused = kept
      ? { room: game.room, effects: [] }
      : applyGameEvent(game.room, { type: 'vip', now, action: 'pause' }, deps);
    return {
      room: { ...paused.room, asleepSince: now, ...(kept ? { asleepKeptPause: true } : {}) },
      effects: [...game.effects, ...paused.effects, { type: 'push' }],
    };
  }
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
  // A human's bots leave with them (ADR-028); bots own nothing, so this recurses one level at most.
  for (const bot of Object.values(room.players)) {
    if (bot.bot?.ownerId !== playerId) continue;
    const gone = removePlayer(next, bot.id, now, deps, 'left');
    next = gone.room;
    effects.push(...gone.effects);
  }
  // Idempotent for the game: a second `connected: false` is harmless, a missed one is not.
  const game = notifyGame(next, playerId, false, now, deps, reason);
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
    .filter((p) => p.connected && p.id !== room.vipId && !p.bot) // bots are never VIP
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
    if (now - p.disconnectedAt >= LIMITS.disconnectGraceMs && next.status === 'playing' && !p.bot) {
      // I-746 A: during a game a quiet seat is kept — its phone comes back to its own cards and
      // score, not as a spectator next to its ghost. The grace restarts; after the game, it applies.
      next = { ...next, players: { ...next.players, [p.id]: { ...p, disconnectedAt: now } } };
    } else if (now - p.disconnectedAt >= LIMITS.disconnectGraceMs) {
      const r = removePlayer(next, p.id, now, deps, 'left');
      next = r.room;
      effects.push(...r.effects);
    } else if (
      p.isVip &&
      now - p.disconnectedAt >= LIMITS.vipHandoverMs &&
      // I-347 B: only a game waits on the VIP; the lobby, the picker and the results have the TV
      next.status === 'playing'
    ) {
      const r = promoteVip(next, now);
      if (r.room !== next) {
        // I-347 A: remember whose role it was, so their phone can be told when it is back
        next = { ...r.room, formerVip: p.id };
        effects.push(...r.effects, { type: 'push' });
      }
    }
  }
  return { room: next, effects };
}
