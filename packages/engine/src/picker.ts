// The game picker's room state (game pack Part 00 §1.3–1.4): the VIP's About sheet shows its game
// big on the TV (`highlight`), and a guest's vote reads out as a suggestion. Pure, like the rest of
// the engine: time comes from the event.
import type { ApplyResult, EngineDeps, Effect, RoomState } from './types';

/** One suggestion toast per player per this long (a guest tapping 👍 on several games). */
export const SUGGEST_TOAST_GAP_MS = 10_000;

/**
 * The VIP opened (a game id) or closed (null) a game's About sheet. Kept only while the room is on
 * the list with nothing chosen; `by` pins it to this VIP, so a handover drops it.
 */
export function applyHighlight(
  room: RoomState,
  gameId: string | null,
  by: string,
  deps: EngineDeps,
): ApplyResult {
  if (room.status !== 'selecting' && room.status !== 'lobby') return { room, effects: [] };
  if (gameId !== null && !deps.games[gameId]) return { room, effects: [] };
  if ((room.highlight?.gameId ?? null) === gameId) return { room, effects: [] };
  const { highlight: _gone, ...rest } = room;
  void _gone;
  return {
    room: gameId === null ? rest : { ...rest, highlight: { gameId, by } },
    effects: [{ type: 'push' }],
  };
}

/** What the TV mirrors, if anything: a live highlight from the VIP in charge on the open list. */
export function highlightedGameId(room: RoomState): string | null {
  const h = room.highlight;
  if (!h || room.status !== 'selecting' || room.selectedGameId !== null) return null;
  return h.by === room.vipId ? h.gameId : null;
}

/**
 * The owner's ruling 2: a guest's 👍 Suggest is the I-650 vote, and the room hears it once in a
 * while — "👍 Maya suggests Fake-Out", naming the player so the TV rings their chip.
 */
export function suggestToast(
  room: RoomState,
  playerId: string,
  gameId: string,
  now: number,
  deps: EngineDeps,
): { room: RoomState; effects: Effect[] } {
  const who = room.players[playerId];
  const game = deps.games[gameId];
  const last = room.suggestedAt?.[playerId];
  if (!who || !game || (last !== undefined && now - last < SUGGEST_TOAST_GAP_MS))
    return { room, effects: [] };
  return {
    room: { ...room, suggestedAt: { ...room.suggestedAt, [playerId]: now } },
    effects: [
      {
        type: 'toast',
        to: 'all',
        kind: 'info',
        text: `👍 ${who.name} suggests ${game.manifest.name}`,
        playerId,
      },
    ],
  };
}
