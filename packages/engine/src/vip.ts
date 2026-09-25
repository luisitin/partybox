// VIP powers (docs/PROTOCOL.md `vip` payload). Every action is validated against the room status
// and the sender; a non-VIP gets `not_vip` and nothing changes (the server counts those).
import type { GameManifest, VipAction } from '@partybox/shared';
import { removePlayer } from './players';
import { abortGame, applyGameEvent, startGame } from './runner';
import { applyHighlight } from './picker';
import { setPresenceMode } from './presence';
import { coerceSettings, defaultSettings } from './settings';
import { canStart } from './can-start';
import { backFromStage, beginStage, holdStage, startNow } from './start-stage';
import { switchToast } from './switch-toast';

export { canStart };
import type { ApplyResult, EngineDeps, RoomState } from './types';

function reject(
  room: RoomState,
  to: string,
  code: 'not_vip' | 'unknown_game' | 'cannot_start' | 'not_playing' | 'not_in_room',
  message: string,
): ApplyResult {
  return { room, effects: [{ type: 'error', to, code, message }] };
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
    // I-347 C: the former VIP may take the role back (no one else may use this)
    const reclaiming = action.action === 'reclaimVip' && room.formerVip === playerId;
    if (!sender.isVip && !reclaiming)
      return reject(room, playerId, 'not_vip', 'Only the VIP can do that.');
  }

  // ADR-053: in the start stage, pause is "Wait" (the count stops) and resume is Start now
  if (room.starting && action.action === 'pause') return holdStage(room);
  if (room.starting && action.action === 'resume') return startNow(room, now);
  switch (action.action) {
    case 'selectGame': {
      if (room.status === 'playing')
        return reject(room, playerId, 'cannot_start', 'End the current game first.');
      // Part 00 §1.3 (the owner's ruling 6): the list with nothing chosen — no game is preloaded
      // and nothing downloads until someone picks one.
      if (action.gameId === null)
        return {
          room: {
            ...room,
            status: 'selecting',
            selectedGameId: null,
            settings: {},
            results: null,
            highlight: undefined,
          },
          effects: [{ type: 'push' }],
        };
      const game = deps.games[action.gameId];
      if (!game) return reject(room, playerId, 'unknown_game', 'Unknown game.');
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
          highlight: undefined,
        },
        effects: [{ type: 'push' }],
      };
    }
    case 'updateSettings': {
      const manifest = manifestOf(room, deps);
      if (room.status !== 'selecting' || !manifest)
        return reject(room, playerId, 'cannot_start', 'Pick a game first.');
      // the rules on every screen describe these settings: change them from the picker
      if (room.starting) return reject(room, playerId, 'cannot_start', 'Go back to change that.');
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
      // ADR-053: the start stage — rules, everyone's READY, 3·2·1 (start-stage.ts)
      return beginStage(room, seed ?? now, now);
    }
    case 'startNow': {
      // Outside a stage (the dev API, tests) it starts at once, as Start used to.
      if (room.starting) return startNow(room, now);
      if (room.status !== 'selecting')
        return reject(room, playerId, 'cannot_start', 'Pick a game first.');
      const check = canStart(room, deps);
      if (!check.ok) return reject(room, playerId, 'cannot_start', check.reason);
      const { formerVip: _settled, ...settled } = room; // I-347: a new game settles the handover
      void _settled;
      return startGame(settled as RoomState, room.selectedGameId as string, room.settings, seed ?? now, now, deps); // prettier-ignore
    }
    case 'back':
      return backFromStage(room);
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
      return beginStage(again, seed ?? now, now);
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
      const { formerVip: _moved, ...rest } = room; // I-347: the role moved on purpose
      void _moved;
      const demoted: RoomState = { ...(rest as RoomState), vipId: target.id, players };
      return {
        room: demoted,
        effects: [
          { type: 'push' },
          { type: 'toast', to: 'all', kind: 'info', text: `${target.name} is now the VIP` },
        ],
      };
    }
    case 'reclaimVip': {
      // I-347 C: the role goes back to the host it was taken from while they were away
      const back = room.players[playerId];
      if (!back || room.formerVip !== playerId)
        return reject(room, playerId, 'not_vip', 'Only the VIP can do that.');
      const players: Record<string, RoomState['players'][string]> = {};
      for (const p of Object.values(room.players))
        players[p.id] = { ...p, isVip: p.id === back.id };
      const { formerVip: _done, ...rest } = room;
      void _done;
      return {
        room: { ...(rest as RoomState), vipId: back.id, players },
        effects: [
          { type: 'push' },
          { type: 'toast', to: 'all', kind: 'info', text: `${back.name} is the VIP again` },
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
      return {
        room: { ...room, recording: action.on },
        effects: [
          ...switchToast(
            room,
            action.on ? '📼 Saving a recap of each game' : '📼 Not saving recaps',
          ),
          { type: 'push' },
        ],
      };
    }
    case 'setMusicOnPhones': {
      // S-004 (the owner): "If VIP enables it, then it is auto for everyone" — any time.
      if (room.musicOnPhones === action.on) return { room, effects: [] };
      return {
        room: { ...room, musicOnPhones: action.on },
        effects: [
          ...switchToast(
            room,
            action.on
              ? '🎵 Music on every phone'
              : '🎵 Music on the TV only — a phone can turn its own on',
          ),
          { type: 'push' },
        ],
      };
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
      return {
        room: { ...room, phoneOnly: action.on },
        effects: [
          ...switchToast(
            room,
            action.on
              ? '📱 Phone-only room — the phones show what the TV would'
              : '📺 The TV is the stage again',
          ),
          { type: 'push' },
        ],
      };
    }
    case 'setPresenceMode': {
      const done = setPresenceMode(room, action.mode);
      return done === 'mid-game'
        ? reject(room, playerId, 'cannot_start', 'Change that before the next game.')
        : done;
    }
    case 'highlight':
      return applyHighlight(room, action.gameId, playerId, deps);
    case 'toLobby': {
      if (room.status === 'playing')
        return reject(room, playerId, 'cannot_start', 'End the current game first.');
      // I-073 A: the results stay with the room until the next game starts (the lobby's "last up").
      return { room: { ...room, status: 'lobby' }, effects: [{ type: 'push' }] };
    }
  }
}
