// VIP powers (docs/PROTOCOL.md `vip` payload). Every action is validated against the room status
// and the sender; a non-VIP gets `not_vip` and nothing changes (the server counts those).
import type { GameManifest, VipAction } from '@partybox/shared';
import { removePlayer } from './players';
import { abortGame, applyGameEvent, startGame } from './runner';
import { coerceSettings, defaultSettings } from './settings';
import type { ApplyResult, EngineDeps, RoomState } from './types';

function reject(
  room: RoomState,
  to: string,
  code: 'not_vip' | 'unknown_game' | 'cannot_start' | 'not_playing' | 'not_in_room',
  message: string,
): ApplyResult {
  return { room, effects: [{ type: 'error', to, code, message }] };
}

/** Why the Start button is disabled, or ok. Shown to everyone in the room snapshot. */
export function canStart(
  room: RoomState,
  deps: EngineDeps,
): { ok: true } | { ok: false; reason: string } {
  if (room.status !== 'selecting' && room.status !== 'results' && room.status !== 'lobby')
    return { ok: false, reason: 'A game is already running.' };
  const gameId = room.selectedGameId;
  const game = gameId ? deps.games[gameId] : undefined;
  if (!game) return { ok: false, reason: 'Pick a game first.' };
  const count = Object.keys(room.players).length;
  const { minPlayers, maxPlayers, name } = game.manifest;
  const bots = Object.values(room.players).filter((p) => p.bot).length;
  if (bots > 0 && !game.manifest.supportsBots)
    return {
      ok: false,
      reason: `${name} has no bot support — remove the ${bots === 1 ? 'bot' : `${bots} bots`} or pick a game that welcomes bots.`,
    };
  if (count < minPlayers)
    return { ok: false, reason: `${name} needs at least ${minPlayers} players (${count} here).` };
  if (count > maxPlayers)
    return { ok: false, reason: `${name} takes at most ${maxPlayers} players (${count} here).` };
  return { ok: true };
}

function manifestOf(room: RoomState, deps: EngineDeps): GameManifest | undefined {
  return room.selectedGameId ? deps.games[room.selectedGameId]?.manifest : undefined;
}

export function applyVip(
  room: RoomState,
  playerId: string,
  action: VipAction,
  now: number,
  seed: number | undefined,
  deps: EngineDeps,
  host = false,
): ApplyResult {
  // The TV is the host's screen (ADR-031): it may do anything the VIP can, even in a room with no
  // human VIP yet (bots only). Every other rule below still applies.
  const sender = room.players[playerId];
  if (!host) {
    if (!sender) return reject(room, playerId, 'not_in_room', 'You are not in this room.');
    if (!sender.isVip) return reject(room, playerId, 'not_vip', 'Only the VIP can do that.');
  }

  switch (action.action) {
    case 'selectGame': {
      const game = deps.games[action.gameId];
      if (!game) return reject(room, playerId, 'unknown_game', 'Unknown game.');
      if (room.status === 'playing')
        return reject(room, playerId, 'cannot_start', 'End the current game first.');
      return {
        room: {
          ...room,
          status: 'selecting',
          selectedGameId: action.gameId,
          // I-763 A: the game's own tuned settings, not the factory ones — browsing another game,
          // "New game" or the lobby and back no longer resets the steppers. coerceSettings fills any
          // key the manifest added since and drops keys it no longer has.
          settings: room.settingsByGame?.[action.gameId]
            ? coerceSettings(game.manifest, room.settingsByGame[action.gameId] ?? {}, {})
            : defaultSettings(game.manifest),
          results: null,
        },
        effects: [{ type: 'push' }],
      };
    }
    case 'updateSettings': {
      const manifest = manifestOf(room, deps);
      if (room.status !== 'selecting' || !manifest)
        return reject(room, playerId, 'cannot_start', 'Pick a game first.');
      const settings = coerceSettings(manifest, room.settings, action.settings);
      return {
        room: {
          ...room,
          settings,
          // I-763 A: remembered for this game for the rest of the night
          settingsByGame: {
            ...(room.settingsByGame ?? {}),
            [room.selectedGameId as string]: settings,
          },
        },
        effects: [{ type: 'push' }],
      };
    }
    case 'start': {
      if (room.status !== 'selecting')
        return reject(room, playerId, 'cannot_start', 'Pick a game first.');
      const check = canStart(room, deps);
      if (!check.ok) return reject(room, playerId, 'cannot_start', check.reason);
      return startGame(room, room.selectedGameId as string, room.settings, seed ?? now, now, deps);
    }
    case 'playAgain': {
      if (room.status !== 'results' || !room.lastGame)
        return reject(room, playerId, 'cannot_start', 'Nothing to replay.');
      const again: RoomState = {
        ...room,
        status: 'selecting',
        selectedGameId: room.lastGame.gameId,
        settings: room.lastGame.settings,
      };
      const check = canStart(again, deps);
      if (!check.ok) return reject(room, playerId, 'cannot_start', check.reason);
      return startGame(
        again,
        again.selectedGameId as string,
        again.settings,
        seed ?? now,
        now,
        deps,
      );
    }
    case 'skip':
    case 'pause':
    case 'resume':
    case 'end': {
      if (room.status !== 'playing')
        return reject(room, playerId, 'not_playing', 'No game is running.');
      const result = applyGameEvent(room, { type: 'vip', now, action: action.action }, deps);
      // A game that ignores `end` still has to stop: fall back to aborting without a scoreboard.
      if (action.action === 'end' && result.room.status === 'playing')
        return abortGame(result.room);
      return result;
    }
    case 'kick': {
      if (action.playerId === playerId && !host)
        return reject(room, playerId, 'cannot_start', 'You cannot kick yourself.');
      if (!room.players[action.playerId])
        return reject(room, playerId, 'not_in_room', 'That player already left.');
      const removed = removePlayer(room, action.playerId, now, deps, 'kicked');
      return {
        room: removed.room,
        effects: [
          {
            type: 'kicked',
            playerId: action.playerId,
            reason: 'The VIP removed you from the room.',
          },
          ...removed.effects,
        ],
      };
    }
    case 'transferVip': {
      const target = room.players[action.playerId];
      if (!target || target.id === room.vipId || target.bot)
        return reject(room, playerId, 'not_in_room', 'Pick another player.');
      const players: Record<string, RoomState['players'][string]> = {};
      for (const p of Object.values(room.players))
        players[p.id] = { ...p, isVip: p.id === target.id };
      const demoted: RoomState = { ...room, vipId: target.id, players };
      return {
        room: demoted,
        effects: [
          { type: 'push' },
          { type: 'toast', to: 'all', kind: 'info', text: `${target.name} is now the VIP` },
        ],
      };
    }
    case 'lock':
    case 'unlock':
      return { room: { ...room, locked: action.action === 'lock' }, effects: [{ type: 'push' }] };
    case 'setCapacity': {
      // I-088 A: never below the head count; a no-op when unchanged.
      const floor = Object.keys(room.players).length;
      const capacity = Math.max(floor, Math.min(16, action.capacity));
      if (capacity === room.capacity) return { room, effects: [] };
      return { room: { ...room, capacity }, effects: [{ type: 'push' }] };
    }
    case 'setRecording': {
      if (room.status === 'playing')
        return reject(room, playerId, 'cannot_start', 'Change that before the next game.');
      if (room.recording === action.on) return { room, effects: [] };
      return { room: { ...room, recording: action.on }, effects: [{ type: 'push' }] };
    }
    case 'setMusicOnPhones': {
      // S-004 (the owner): "If VIP enables it, then it is auto for everyone" — any time.
      if (room.musicOnPhones === action.on) return { room, effects: [] };
      return { room: { ...room, musicOnPhones: action.on }, effects: [{ type: 'push' }] };
    }
    case 'setListed': {
      // The owner (2026-09-22): public rooms are browsable; a private one still joins by code.
      if (room.listed === action.on) return { room, effects: [] };
      return { room: { ...room, listed: action.on }, effects: [{ type: 'push' }] };
    }
    case 'setPhoneOnly': {
      // S-005: like the recap switch — any time but mid-game.
      if (room.status === 'playing')
        return reject(room, playerId, 'cannot_start', 'Change that before the next game.');
      if (room.phoneOnly === action.on) return { room, effects: [] };
      return { room: { ...room, phoneOnly: action.on }, effects: [{ type: 'push' }] };
    }
    case 'toLobby': {
      if (room.status === 'playing')
        return reject(room, playerId, 'cannot_start', 'End the current game first.');
      // I-073 A: the results stay with the room until the next game starts (the lobby's "last up").
      return { room: { ...room, status: 'lobby' }, effects: [{ type: 'push' }] };
    }
  }
}
