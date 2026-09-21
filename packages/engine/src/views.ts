// Turns room state into what clients see: the RoomSnapshot (lobby/selecting/results) and the
// per-TV / per-controller game views, decorated with the VIP (ADR-020). A view function that
// throws (contract violation) degrades to a bare envelope instead of taking the room down.
import { avatarIdOf } from './avatar';
import type {
  ControllerView,
  GameSummary,
  PlayerPublic,
  PushedView,
  RoomSnapshot,
  TvView,
} from '@partybox/shared';
import type { EngineDeps, RoomState } from './types';
import { canStart } from './vip';

export function gameSummaries(deps: EngineDeps): GameSummary[] {
  return Object.values(deps.games)
    .map((g) => g.manifest)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      ({
        id,
        name,
        tagline,
        description,
        minPlayers,
        maxPlayers,
        estimatedMinutes,
        tags,
        settings,
        supportsBots,
      }) => ({
        id,
        name,
        tagline,
        description,
        minPlayers,
        maxPlayers,
        estimatedMinutes,
        tags,
        settings,
        supportsBots: supportsBots === true,
      }),
    );
}

export function publicPlayers(room: RoomState): PlayerPublic[] {
  return Object.values(room.players)
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarId: avatarIdOf(p),
      ...(p.photo ? { photo: p.photo } : {}),
      isVip: p.isVip,
      connected: p.connected,
      spectator: p.spectator,
      joinedAt: p.joinedAt,
      ...(p.bot ? { bot: p.bot } : {}),
    }));
}

export function snapshot(room: RoomState, deps: EngineDeps): RoomSnapshot {
  return {
    code: room.code,
    status: room.status,
    locked: room.locked,
    capacity: room.capacity,
    players: publicPlayers(room),
    vip: room.vipId,
    selectedGameId: room.selectedGameId,
    settings: room.settings,
    games: gameSummaries(deps),
    results: room.results,
    canStart: canStart(room, deps),
    recording: room.recording,
  };
}

function fallbackEnvelope(room: RoomState): TvView {
  const running = room.game;
  return {
    gameId: running?.gameId ?? '',
    phaseId: running?.state.phase.id ?? '',
    deadline: null,
    paused: false,
    players: [],
  };
}

export function tvView(room: RoomState, deps: EngineDeps): PushedView<TvView> | null {
  const running = room.game;
  if (!running || room.status !== 'playing') return null;
  const game = deps.games[running.gameId];
  if (!game) return null;
  try {
    return { ...game.tvView(running.state), vip: room.vipId };
  } catch {
    return { ...fallbackEnvelope(room), vip: room.vipId };
  }
}

export function controllerView(
  room: RoomState,
  playerId: string,
  deps: EngineDeps,
): PushedView<ControllerView> | null {
  const running = room.game;
  if (!running || room.status !== 'playing') return null;
  const game = deps.games[running.gameId];
  if (!game) return null;
  const role = Object.hasOwn(running.state.players, playerId) ? 'player' : 'spectator';
  try {
    return { ...game.controllerView(running.state, playerId), vip: room.vipId };
  } catch {
    return { ...fallbackEnvelope(room), me: { id: playerId, role }, vip: room.vipId };
  }
}
