// The owner's pacing [cc45f4], one start for every game (ADR-053): Start → the game's three
// how-to-play steps on every screen → each connected person taps READY (bots count as ready; a
// dropped phone never blocks, and is asked again if it comes back before the count) → a breath
// and 3·2·1 on the server clock → the game starts. There is no timeout: the VIP (or the TV) may
// Start now, which goes straight to the count, or go Back to the picker. Play again goes through it
// too. The room stays 'selecting' meanwhile, so every screen keyed on the status keeps working.
import { canStart } from './can-start';
import { STAGE_COUNT_MS, startGame } from './runner';
import type { ApplyResult, EngineDeps, RoomState, StartStage } from './types';

/** The beat between the last READY and the "3" (the owner: never a snap). */
export const BREATH_MS = 400;
/** 3 · 2 · 1, a second each. */
export const COUNT_MS = STAGE_COUNT_MS;

/** Who the stage waits for: people whose phones are here, not bots. A "spectator" between games
 *  joined during the last one and plays this one, so they read the rules too. */
export function waitingFor(room: RoomState, stage: StartStage): string[] {
  return Object.values(room.players)
    .filter((p) => p.connected && !p.bot && !stage.ready.includes(p.id))
    .map((p) => p.id);
}

/** Start (or Play again): the stage opens with nobody ready yet. */
export function beginStage(room: RoomState, seed: number, now: number): ApplyResult {
  if (room.starting) return { room, effects: [] };
  const stage: StartStage = {
    gameId: room.selectedGameId as string,
    settings: room.settings,
    seed,
    ready: [],
    countdownAt: null,
  };
  return settleStage({ room: { ...room, starting: stage }, effects: [{ type: 'push' }] }, now);
}

export function markReady(room: RoomState, playerId: string): ApplyResult {
  const stage = room.starting;
  const who = room.players[playerId];
  if (!stage || !who || stage.ready.includes(playerId)) return { room, effects: [] };
  return {
    room: { ...room, starting: { ...stage, ready: [...stage.ready, playerId] } },
    effects: [{ type: 'push' }],
  };
}

/** The VIP's "Start now": the count begins at once, whoever is still reading (and ends a Wait). */
export function startNow(room: RoomState, now: number): ApplyResult {
  const stage = room.starting;
  if (!stage || stage.countdownAt !== null) return { room, effects: [] };
  const { held: _held, ...rest } = stage;
  void _held;
  return {
    room: { ...room, starting: { ...rest, countdownAt: now } },
    effects: [{ type: 'push' }],
  };
}

/** The VIP's "Wait" (pause) during the count: the count stops and the rules stay up until their
 *  Start now, which counts from 3 again — no clock is frozen and shifted, so nothing can drift and
 *  a resumed count never lands on a "1" out of nowhere. */
export function holdStage(room: RoomState): ApplyResult {
  const stage = room.starting;
  if (!stage || stage.countdownAt === null) return { room, effects: [] };
  return {
    room: { ...room, starting: { ...stage, countdownAt: null, held: true } },
    effects: [{ type: 'push' }],
  };
}

/** "‹ Back": the picker again, the same game still chosen. */
export function backFromStage(room: RoomState): ApplyResult {
  if (!room.starting) return { room, effects: [] };
  const { starting: _gone, ...rest } = room;
  void _gone;
  return { room: rest, effects: [{ type: 'push' }] };
}

/** After every event: the stage ends with the picker (another game, the lobby, a game running),
 *  and the count begins once nobody is left to wait for. */
export function settleStage(result: ApplyResult, now: number): ApplyResult {
  const { room } = result;
  const stage = room.starting;
  if (!stage) return result;
  if (room.status !== 'selecting' || room.selectedGameId !== stage.gameId) {
    const { starting: _gone, ...rest } = room;
    void _gone;
    return { room: rest, effects: [...result.effects, { type: 'push' }] };
  }
  if (stage.countdownAt !== null || stage.held || waitingFor(room, stage).length > 0) return result;
  return {
    room: { ...room, starting: { ...stage, countdownAt: now + BREATH_MS } },
    effects: [...result.effects, { type: 'push' }],
  };
}

/** When the stage's count ends (the host arms a tick for it), or null. */
export function stageWakeAt(room: RoomState): number | null {
  const at = room.starting?.countdownAt;
  return at === null || at === undefined ? null : at + COUNT_MS;
}

/** The tick at the end of the count: the game starts, with the seed and settings Start fixed. If
 *  the room no longer suits the game (people left), the stage closes with the reason. */
export function fireStage(room: RoomState, now: number, deps: EngineDeps): ApplyResult | null {
  const stage = room.starting;
  const at = stageWakeAt(room);
  if (!stage || at === null || now < at) return null;
  const { starting: _done, formerVip: _settled, ...rest } = room;
  void _done;
  void _settled;
  const check = canStart(rest, deps);
  if (!check.ok)
    return {
      room: rest,
      effects: [
        { type: 'toast', to: 'all', kind: 'warning', text: check.reason },
        { type: 'push' },
      ],
    };
  return startGame(rest, stage.gameId, stage.settings, stage.seed, now, deps);
}
