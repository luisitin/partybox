// Bot players (ADR-028): room players a person adds from the lobby (or the dev API adds ownerless).
// The engine treats them as players in every rule except VIP (never) and lifetime (they leave with
// their owner). The host drives their inputs from `game.bot.sampleInput`.
import { MAX_BOTS_PER_OWNER, nameKey } from '@partybox/shared';
import type { ErrorCode } from '@partybox/shared';
import { removePlayer } from './players';
import type { ApplyResult, Effect, EngineDeps, RoomEvent, RoomPlayer, RoomState } from './types';

type BotAddEvent = Extract<RoomEvent, { type: 'bot-add' }>;
type BotRemoveEvent = Extract<RoomEvent, { type: 'bot-remove' }>;

function error(to: string, code: ErrorCode, message: string): Effect {
  return { type: 'error', to, code, message };
}

export function isBot(player: RoomPlayer): boolean {
  return player.bot !== undefined;
}

export function botsOf(room: RoomState, ownerId: string | null): RoomPlayer[] {
  return Object.values(room.players).filter((p) => p.bot && p.bot.ownerId === ownerId);
}

/**
 * "<Owner>'s bot", "<Owner>'s bot 2", …; ownerless bots are "Bot 1", "Bot 2", … (a lone "Bot" next to
 * "Bot 2" read as a typo on the TV strip — review-loop #1). Unique per room, case-insensitive.
 */
function botName(room: RoomState, owner: RoomPlayer | null): string {
  const base = owner ? `${owner.name}'s bot` : 'Bot';
  const taken = new Set(Object.values(room.players).map((p) => nameKey(p.name)));
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 && owner ? base : `${base} ${n}`;
    if (!taken.has(nameKey(candidate))) return candidate;
  }
  return `${base} ${Object.keys(room.players).length + 1}`;
}

export function addBot(room: RoomState, event: BotAddEvent): ApplyResult {
  const owner = event.ownerId === null ? null : (room.players[event.ownerId] ?? null);
  const to = event.ownerId ?? event.playerId;
  if (event.ownerId !== null && !owner)
    return { room, effects: [error(to, 'not_in_room', 'Join the room first.')] };
  if (owner?.bot) return { room, effects: [error(to, 'bot_limit', 'Bots cannot add bots.')] };
  if (Object.keys(room.players).length >= room.capacity)
    return { room, effects: [error(to, 'room_full', 'This room is full.')] };
  if (owner && botsOf(room, owner.id).length >= MAX_BOTS_PER_OWNER)
    return {
      room,
      effects: [error(to, 'bot_limit', `You can add at most ${MAX_BOTS_PER_OWNER} bots.`)],
    };
  const bot: RoomPlayer = {
    id: event.playerId,
    name: botName(room, owner),
    avatarId: 'robot',
    token: event.token,
    isVip: false,
    connected: true,
    joinedAt: event.now,
    disconnectedAt: null,
    spectator: room.status === 'playing',
    bot: { ownerId: event.ownerId, strategy: event.strategy },
  };
  return {
    room: { ...room, players: { ...room.players, [bot.id]: bot } },
    effects: [
      { type: 'push' },
      {
        type: 'toast',
        to: 'all',
        kind: 'info',
        text: `${bot.name} joined${bot.spectator ? ' (next game)' : ''}`,
      },
    ],
  };
}

/** Owners remove their own bots; the VIP (or the dev API, ownerId null) can remove any bot. */
export function removeBot(room: RoomState, event: BotRemoveEvent, deps: EngineDeps): ApplyResult {
  const bot = room.players[event.botId];
  const to = event.ownerId ?? event.botId;
  if (!bot?.bot) return { room, effects: [error(to, 'not_in_room', 'That bot is already gone.')] };
  if (event.ownerId !== null) {
    const requester = room.players[event.ownerId];
    if (!requester) return { room, effects: [error(to, 'not_in_room', 'Join the room first.')] };
    if (bot.bot.ownerId !== requester.id && !requester.isVip)
      return {
        room,
        effects: [error(to, 'not_vip', "Only the bot's owner or the VIP can remove it.")],
      };
  }
  return removePlayer(room, bot.id, event.now, deps, 'left');
}
