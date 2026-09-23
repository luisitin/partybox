// I-667 A: the one-tap fix for "can't start" — the exact bots to remove, or how many to add.
// Bots only: people are never removed. Newest bots go first (the ones just added to pad a room).
import type { GameSummary, RoomSnapshot } from '@partybox/shared';

export type StartFix =
  | { kind: 'remove'; botIds: string[]; label: string }
  | { kind: 'add'; count: number; label: string };

/**
 * What would let `game` start in this room: remove the newest bots over its cap (or every bot for
 * a game without bot support), or add bots up to its minimum when it takes bots. `addRoom` is how
 * many bots the one fixing it may still add (the phone's own cap; the TV's house bots have none).
 * Null when no bot change fixes it (too many people, or the room is full).
 */
export function startFix(room: RoomSnapshot, game: GameSummary, addRoom = Infinity): StartFix | null {
  const bots = room.players.filter((p) => p.bot);
  const count = room.players.length;
  if (bots.length > 0 && !game.supportsBots)
    return {
      kind: 'remove',
      botIds: bots.map((b) => b.id),
      label: bots.length === 1 ? 'Remove the bot' : `Remove the ${bots.length} bots`,
    };
  if (count > game.maxPlayers) {
    const over = count - game.maxPlayers;
    if (over > bots.length) return null; // people over the cap: not ours to remove
    return {
      kind: 'remove',
      botIds: bots.slice(-over).map((b) => b.id),
      label: over === 1 ? 'Remove 1 bot to play' : `Remove ${over} bots to play`,
    };
  }
  if (count < game.minPlayers && game.supportsBots) {
    const short = game.minPlayers - count;
    if (short > Math.min(addRoom, room.capacity - count)) return null;
    return {
      kind: 'add',
      count: short,
      label: short === 1 ? 'Add 1 bot to play' : `Add ${short} bots to play`,
    };
  }
  return null;
}

/** Runs a fix through `bot` — spaced 300 ms apart (a bot action costs 5 of a socket's 20 tokens a
 *  second; a burst left bots behind under "Slow down.", found recording I-048). */
export function runFix(
  fix: StartFix,
  bot: (action: { action: 'add' } | { action: 'remove'; botId: string }) => void,
): void {
  if (fix.kind === 'remove')
    fix.botIds.forEach((botId, i) => setTimeout(() => bot({ action: 'remove', botId }), i * 300));
  else for (let i = 0; i < fix.count; i++) setTimeout(() => bot({ action: 'add' }), i * 300);
}
