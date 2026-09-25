// Where everyone is (game pack Part 00 §3, ADR-047): the VIP's room switch, each phone's "I can
// see the TV", what a game learns at `init`, and which phones are the stage. Pure, like the rest
// of the engine; the host decides a phone's first value (its own choice, else its address).
import type { GamePresence, PresenceMode } from '@partybox/shared';
import { switchToast } from './switch-toast';
import type { ApplyResult, RoomPlayer, RoomState } from './types';

/** The room's mode (saved rooms from before presence read as all in one room). */
export function presenceModeOf(room: RoomState): PresenceMode {
  return room.presenceMode ?? 'together';
}

/** Whether this person can see the TV (bots always can; absent means yes). */
export function canSeeTv(player: RoomPlayer | undefined): boolean {
  return player?.canSeeTv !== false;
}

/**
 * This phone is the stage: the room has no TV (ADR-041) or this player can't see it. Live, so a
 * mid-game flip moves only this phone; the game's own copy of presence stays as it started.
 */
export function stageOnPhone(room: RoomState, playerId: string): boolean {
  return room.phoneOnly || !canSeeTv(room.players[playerId]);
}

/** What `init` gets: fixed for the game, part of its seeded inputs. */
export function gamePresence(room: RoomState): GamePresence {
  return { mode: presenceModeOf(room), phoneOnly: room.phoneOnly };
}

const MODE_TOASTS: Record<PresenceMode, string> = {
  together: '📍 Everyone is in one room',
  'remote-voice': '🎧 Some of you are remote, on a call',
  'remote-text': '💬 Some of you are remote, with no call',
};

/** The VIP's "Where is everyone?" — like Phone only: any time but mid-game. */
export function setPresenceMode(room: RoomState, mode: PresenceMode): ApplyResult | 'mid-game' {
  if (room.status === 'playing') return 'mid-game';
  if (presenceModeOf(room) === mode) return { room, effects: [] };
  const { presenceMode: _old, ...rest } = room;
  void _old;
  return {
    room: mode === 'together' ? rest : { ...rest, presenceMode: mode },
    effects: [switchToast(MODE_TOASTS[mode]), { type: 'push' }],
  };
}

/** A phone flips its "I can see the TV" (any time: a running game keeps the value it started with). */
export function setCanSeeTv(room: RoomState, playerId: string, value: boolean): ApplyResult {
  const player = room.players[playerId];
  if (!player || player.bot || canSeeTv(player) === value) return { room, effects: [] };
  return {
    room: { ...room, players: { ...room.players, [playerId]: withCanSeeTv(player, value) } },
    effects: [{ type: 'push' }],
  };
}

/**
 * A join (new seat or resumed) carries the phone's value: it lands on whichever seat the join
 * welcomed — a phone rejoining from another network (home Wi-Fi → mobile data) updates it.
 */
export function withJoinPresence(result: ApplyResult, value: boolean | undefined): ApplyResult {
  if (value === undefined) return result;
  const welcome = result.effects.find((e) => e.type === 'welcome');
  const player = welcome?.type === 'welcome' ? result.room.players[welcome.playerId] : undefined;
  if (!player || player.bot) return result;
  const players = { ...result.room.players, [player.id]: withCanSeeTv(player, value) };
  return { room: { ...result.room, players }, effects: result.effects };
}

/** The player with `canSeeTv` stored only when false (the snapshot and saved rooms stay small). */
export function withCanSeeTv(player: RoomPlayer, value: boolean | undefined): RoomPlayer {
  const { canSeeTv: _old, ...rest } = player;
  void _old;
  return value === false ? { ...rest, canSeeTv: false } : rest;
}
