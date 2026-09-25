// ADR-053, the start stage: Start opens it; every connected person's READY (bots are ready, a
// dropped phone never blocks) begins a breath and the 3·2·1; the host's tick at the count's end
// starts the game with the seed and settings Start fixed. Start now and Back are the VIP's.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { nextWakeAt } from './runner';
import { BREATH_MS, COUNT_MS } from './start-stage';
import type { RoomState } from './types';
import { snapshot } from './views';
import { deps, joinEvent, roomWith, T0, vip } from './test-utils.helper';

const staged = (n = 3): RoomState => {
  const selected = vip(roomWith(n), { action: 'selectGame', gameId: 'fake' }, T0 + 100).room;
  return vip(selected, { action: 'start' }, T0 + 200, 'p1', 7).room;
};
const ready = (room: RoomState, playerId: string, now = T0 + 300): RoomState =>
  applyRoomEvent(room, { type: 'ready', now, playerId }, deps).room;
const tick = (room: RoomState, now: number): RoomState =>
  applyRoomEvent(room, { type: 'tick', now }, deps).room;

describe('the start stage', () => {
  it('Start opens it: still selecting, nobody ready, no count, nothing to wake for', () => {
    const room = staged();
    expect(room.status).toBe('selecting');
    expect(room.starting).toMatchObject({ gameId: 'fake', seed: 7, ready: [], countdownAt: null });
    expect(snapshot(room, deps).starting).toEqual({ gameId: 'fake', ready: [], countdownAt: null });
    expect(nextWakeAt(room)).toBeNull();
  });

  it('the last READY begins a breath then the count; the tick at its end starts the game', () => {
    let room = ready(ready(staged(), 'p1'), 'p2');
    expect(room.starting?.countdownAt).toBeNull();
    room = ready(room, 'p3', T0 + 1000);
    expect(room.starting?.countdownAt).toBe(T0 + 1000 + BREATH_MS);
    const end = T0 + 1000 + BREATH_MS + COUNT_MS;
    expect(nextWakeAt(room)).toBe(end);
    expect(tick(room, end - 1).status).toBe('selecting');
    const playing = tick(room, end);
    expect(playing.status).toBe('playing');
    expect(playing.game?.seed).toBe(7);
    expect(playing.starting).toBeUndefined();
  });

  it('bots are ready already, and READY twice or from a stranger changes nothing', () => {
    const base = staged(2);
    const p2 = base.players['p2'] as RoomState['players'][string];
    const bot = {
      ...p2,
      id: 'b1',
      name: 'Bot',
      bot: { ownerId: 'p1', strategy: 'random' as const },
    };
    const room: RoomState = { ...base, players: { ...base.players, b1: bot } };
    const once = ready(ready(room, 'p1'), 'p2');
    expect(once.starting?.countdownAt).toBe(T0 + 300 + BREATH_MS);
    expect(ready(once, 'p1', T0 + 400)).toBe(once);
    expect(ready(room, 'nobody')).toBe(room);
  });

  it('a phone that drops unready never blocks; back before the count, it is asked again', () => {
    let room = ready(ready(staged(), 'p1'), 'p2');
    const dropped = applyRoomEvent(room, { type: 'disconnect', now: T0 + 400, playerId: 'p3' }, deps).room; // prettier-ignore
    expect(dropped.starting?.countdownAt).toBe(T0 + 400 + BREATH_MS);
    // a drop and return before everyone else was ready: they still owe their READY
    room = applyRoomEvent(staged(), { type: 'disconnect', now: T0 + 300, playerId: 'p3' }, deps).room; // prettier-ignore
    room = applyRoomEvent(room, joinEvent(3, T0 + 350), deps).room; // the same token: a rejoin
    room = ready(ready(room, 'p1'), 'p2');
    expect(room.starting?.countdownAt).toBeNull();
  });

  it('someone who joins during the stage reads the rules too; once the count runs, they play', () => {
    let room = applyRoomEvent(staged(2), joinEvent(3, T0 + 250), deps).room;
    room = ready(ready(room, 'p1'), 'p2');
    expect(room.starting?.countdownAt).toBeNull();
    room = ready(room, 'p3', T0 + 500);
    const late = applyRoomEvent(room, joinEvent(4, T0 + 600), deps).room;
    const playing = tick(late, T0 + 500 + BREATH_MS + COUNT_MS);
    expect(Object.keys(playing.game?.state.players ?? {})).toContain('p4');
  });

  it('Start now counts at once; Back returns to the picker; only the VIP may do either', () => {
    const room = staged();
    expect(vip(room, { action: 'startNow' }, T0 + 300).room.starting?.countdownAt).toBe(T0 + 300);
    expect(vip(room, { action: 'startNow' }, T0 + 300, 'p2').room).toBe(room);
    const back = vip(room, { action: 'back' }, T0 + 300).room;
    expect(back.starting).toBeUndefined();
    expect(back.selectedGameId).toBe('fake');
    expect(vip(room, { action: 'back' }, T0 + 300, 'p2').room).toBe(room);
  });

  it('closes when the picker moves on, and settings wait for the picker', () => {
    const room = staged();
    expect(
      vip(room, { action: 'selectGame', gameId: null }, T0 + 300).room.starting,
    ).toBeUndefined();
    expect(vip(room, { action: 'toLobby' }, T0 + 300).room.starting).toBeUndefined();
    const change = vip(room, { action: 'updateSettings', settings: {} }, T0 + 300);
    expect(change.room).toBe(room);
  });

  it('a room that no longer suits the game at the count’s end goes back, saying why', () => {
    let room = ready(ready(ready(staged(3), 'p1'), 'p2'), 'p3');
    room = applyRoomEvent(room, { type: 'leave', now: T0 + 400, playerId: 'p2' }, deps).room;
    room = applyRoomEvent(room, { type: 'leave', now: T0 + 400, playerId: 'p3' }, deps).room;
    const at = nextWakeAt(room) as number;
    const result = applyRoomEvent(room, { type: 'tick', now: at }, deps);
    expect(result.room.status).toBe('selecting');
    expect(result.room.starting).toBeUndefined();
    expect(result.effects.some((e) => e.type === 'toast' && e.kind === 'warning')).toBe(true);
  });

  it('Wait during the count holds the rules up; only Start now counts again, from 3', () => {
    const counting = ready(ready(ready(staged(), 'p1'), 'p2'), 'p3', T0 + 1000);
    const held = vip(counting, { action: 'pause' }, T0 + 2000).room;
    expect(held.starting).toMatchObject({ countdownAt: null, held: true });
    expect(nextWakeAt(held)).toBeNull();
    // another READY or a join never restarts it behind the VIP's back
    const still = applyRoomEvent(held, joinEvent(4, T0 + 2500), deps).room;
    expect(ready(still, 'p4', T0 + 2600).starting?.countdownAt).toBeNull();
    const again = vip(held, { action: 'resume' }, T0 + 5000).room;
    expect(again.starting?.countdownAt).toBe(T0 + 5000);
    expect(again.starting?.held).toBeUndefined();
  });
});
