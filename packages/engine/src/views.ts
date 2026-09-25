// Turns room state into what clients see: the RoomSnapshot (lobby/selecting/results) and the
// per-TV / per-controller game views, decorated with the VIP (ADR-020). A view function that
// throws (contract violation) degrades to a bare envelope instead of taking the room down.
import { contentLangOf } from './content-lang';
import { avatarIdOf } from './avatar';
import type {
  ControllerView,
  PlayerPublic,
  PushedView,
  RoomSnapshot,
  SelectedGame,
  TvView,
} from '@partybox/shared';
import type { EngineDeps, RoomState } from './types';
import { highlightedGameId } from './picker';
import { stageOnPhone } from './presence';
import { canStart } from './vip';

/** The chosen game's settings form (the list itself is the host's catalog, sent once). */
function selectedGame(room: RoomState, deps: EngineDeps): SelectedGame | undefined {
  const game = room.selectedGameId ? deps.games[room.selectedGameId] : undefined;
  return game ? { id: game.manifest.id, settings: game.manifest.settings } : undefined;
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
      ...(p.canSeeTv === false ? { canSeeTv: false as const } : {}),
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
    ...(room.settingsByGame ? { tuned: room.settingsByGame } : {}),
    ...(selectedGame(room, deps) ? { selectedGame: selectedGame(room, deps) } : {}),
    results: room.results,
    canStart: canStart(room, deps),
    recording: room.recording,
    musicOnPhones: room.musicOnPhones,
    contentLang: contentLangOf(room),
    listed: room.listed,
    phoneOnly: room.phoneOnly,
    ...(room.presenceMode && room.presenceMode !== 'together'
      ? { presenceMode: room.presenceMode }
      : {}),
    ...(room.asleepSince !== undefined ? { asleep: true } : {}),
    ...(room.tonight?.length
      ? {
          tonight: room.tonight.map((g) => ({
            gameId: g.gameId,
            winners: g.winners,
            botsWon: g.botsWon,
          })),
        }
      : {}),
    ...(room.formerVip ? { formerVip: room.formerVip } : {}),
    ...(room.votes ? { votes: peopleVotes(room) } : {}),
    ...(highlightedGameId(room) ? { highlightedGameId: highlightedGameId(room) ?? undefined } : {}),
    ...(room.starting
      ? {
          starting: {
            gameId: room.starting.gameId,
            ready: room.starting.ready.filter((id) => room.players[id]),
            countdownAt: room.starting.countdownAt,
            ...(room.starting.held ? { held: true } : {}),
          },
        }
      : {}),
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
    return {
      ...game.controllerView(running.state, playerId),
      vip: room.vipId,
      // ADR-047: per phone — a remote phone in a TV room is the stage too (live, not the game's copy)
      phoneOnly: stageOnPhone(room, playerId),
    };
  } catch {
    return { ...fallbackEnvelope(room), me: { id: playerId, role }, vip: room.vipId };
  }
}

/** I-650: the votes of the people still in the room (a vote leaves with its voter). */
function peopleVotes(room: RoomState): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, gameId] of Object.entries(room.votes ?? {})) {
    const p = room.players[id];
    if (p && !p.bot) out[id] = gameId;
  }
  return out;
}
