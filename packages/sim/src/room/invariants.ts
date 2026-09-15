// Room-level invariants (engine + views), checked after every RoomEvent of a room-chaos run.
import type { ApplyResult, EngineDeps, RoomState } from '@partybox/engine';
import { controllerView, snapshot, tvView } from '@partybox/engine';
import { nameKey } from '@partybox/shared';
import { jsonSize } from '@partybox/game-sdk/testing';

const VIEW_SIZE_LIMIT = 64 * 1024;
const UNKNOWN_IDS = ['ghost', '', '__proto__', 'constructor', 'toString'];

export function checkRoom(before: RoomState, result: ApplyResult, deps: EngineDeps): string[] {
  const out: string[] = [];
  const room = result.room;
  const pushed = result.effects.filter((e) => e.type === 'push').length;
  if (pushed > 1) out.push(`${pushed} push effects in one event`);
  if (room.rev !== before.rev + pushed)
    out.push(`rev ${before.rev} -> ${room.rev} with ${pushed} push`);

  const players = Object.values(room.players);
  const vips = players.filter((p) => p.isVip);
  if (room.vipId !== null) {
    if (!room.players[room.vipId]) out.push(`vipId ${room.vipId} is not in the room`);
    if (vips.length !== 1 || vips[0]?.id !== room.vipId)
      out.push(`isVip flags ${vips.map((p) => p.id).join(',')} disagree with vipId ${room.vipId}`);
  } else {
    if (vips.length > 0) out.push(`vipId null but ${vips.map((p) => p.id).join(',')} flagged VIP`);
    const connected = players.filter((p) => p.connected);
    if (connected.length > 0)
      out.push(
        `no VIP while ${connected.map((p) => p.name).join(',')} connected (room cannot proceed)`,
      );
  }
  if (players.length > room.capacity)
    out.push(`${players.length} players over capacity ${room.capacity}`);
  const keys = new Set<string>();
  for (const p of players) {
    const key = nameKey(p.name);
    if (keys.has(key)) out.push(`duplicate name key ${JSON.stringify(key)}`);
    keys.add(key);
    if (p.connected && p.disconnectedAt !== null)
      out.push(`${p.id} connected with disconnectedAt set`);
    if (!p.connected && p.disconnectedAt === null)
      out.push(`${p.id} disconnected without disconnectedAt`);
  }

  if ((room.status === 'playing') !== (room.game !== null))
    out.push(`status ${room.status} with game ${room.game ? 'set' : 'null'}`);
  if (room.status === 'results' && !room.results) out.push('status results without results');
  if (room.status === 'playing' && room.game) {
    for (const p of players) {
      const inGame = room.game.state.players[p.id];
      if (p.spectator && inGame) out.push(`spectator ${p.id} is in the game state`);
      if (!p.spectator && !inGame) out.push(`player ${p.id} is missing from the game state`);
      if (inGame && inGame.connected !== p.connected)
        out.push(`${p.id} connected=${p.connected} in room but ${inGame.connected} in game`);
    }
  }
  if (room.results)
    for (const p of room.results.players)
      if (!Number.isFinite(room.results.results.scores[p.id]))
        out.push(`results missing a finite score for ${p.id}`);

  for (const e of result.effects) {
    if (e.type === 'error' && typeof e.to !== 'string') out.push('error effect without a target');
    if (e.type === 'kicked' && room.players[e.playerId])
      out.push(`kicked ${e.playerId} still in room`);
  }

  try {
    const snap = snapshot(room, deps);
    if (jsonSize(snap) > VIEW_SIZE_LIMIT) out.push('snapshot over 64 KB');
    if (snap.players.length !== players.length) out.push('snapshot players differ from room');
  } catch (err) {
    out.push(`snapshot threw: ${String(err)}`);
  }
  try {
    const tv = tvView(room, deps);
    if (room.status === 'playing' && !tv) out.push('tvView null while playing');
    if (tv && jsonSize(tv) > VIEW_SIZE_LIMIT) out.push('tvView over 64 KB');
    if (tv && tv.vip !== room.vipId) out.push('tvView.vip disagrees with room');
  } catch (err) {
    out.push(`tvView threw: ${String(err)}`);
  }
  for (const id of [...Object.keys(room.players), ...UNKNOWN_IDS]) {
    try {
      const cv = controllerView(room, id, deps);
      if (room.status === 'playing' && !cv) out.push(`controllerView(${id}) null while playing`);
      if (cv && jsonSize(cv) > VIEW_SIZE_LIMIT) out.push(`controllerView(${id}) over 64 KB`);
      if (cv && cv.me.id !== id) out.push(`controllerView(${id}).me.id is ${cv.me.id}`);
    } catch (err) {
      out.push(`controllerView(${id}) threw: ${String(err)}`);
    }
  }
  return out;
}
