// Whether the chosen game can start in this room, and why not: shown to everyone in the room
// snapshot (the Start button's reason), checked again when the start stage's count ends.
import type { EngineDeps, RoomState } from './types';

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
