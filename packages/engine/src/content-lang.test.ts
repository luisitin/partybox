// ADR-054: the room's content language — the VIP phone's language until someone chooses, the
// VIP's or the TV's switch after that, and what a game is told at its start.
import { describe, expect, it } from 'vitest';
import type { ContentLang, InitContext } from '@partybox/shared';
import { createRoom } from './room';
import { fakeGame } from './fake-game.helper';
import { applyRoomEvent } from './room';
import type { EngineDeps, RoomState } from './types';
import { T0, deps, errorsOf, joinEvent, vip } from './test-utils.helper';
import { snapshot } from './views';

/** A lobby whose phones joined with these languages (p1 first, so p1 is the VIP). */
function roomIn(...langs: (ContentLang | undefined)[]): RoomState {
  let room = createRoom({ code: 'ABCD', now: T0 });
  langs.forEach((lang, i) => {
    const event = { ...joinEvent(i + 1), ...(lang ? { lang } : {}) };
    room = applyRoomEvent(room, event, deps).room;
  });
  return room;
}

describe('the default', () => {
  it('is English for a new room and for a phone that says nothing', () => {
    expect(snapshot(createRoom({ code: 'ABCD', now: T0 }), deps).contentLang).toBe('en');
    expect(snapshot(roomIn(undefined, 'es'), deps).contentLang).toBe('en');
  });

  it("follows the VIP phone's language, not the guests'", () => {
    expect(snapshot(roomIn('es', 'en', 'en'), deps).contentLang).toBe('es');
    expect(snapshot(roomIn('en', 'es'), deps).contentLang).toBe('en');
  });

  it('follows a new VIP until someone has chosen', () => {
    const room = roomIn('es', 'en');
    const handed = vip(room, { action: 'transferVip', playerId: 'p2' }).room;
    expect(snapshot(handed, deps).contentLang).toBe('en');
  });

  it('keeps no language on the wire per player', () => {
    const players = snapshot(roomIn('es'), deps).players;
    expect(players[0]).not.toHaveProperty('lang');
  });
});

describe('the switch', () => {
  it("the VIP's choice wins over their phone, and sticks through a handover", () => {
    const chosen = vip(roomIn('es', 'en'), { action: 'setContentLang', lang: 'en' });
    expect(chosen.effects).toContainEqual({ type: 'push' });
    expect(snapshot(chosen.room, deps).contentLang).toBe('en');
    const handed = vip(chosen.room, { action: 'transferVip', playerId: 'p2' }).room;
    expect(snapshot(vip(handed, { action: 'setContentLang', lang: 'es' }, T0 + 200, 'p2').room, deps).contentLang).toBe('es'); // prettier-ignore
  });

  it("is the VIP's or the TV's, and a repeat changes nothing", () => {
    const room = roomIn('en', 'es');
    expect(errorsOf(vip(room, { action: 'setContentLang', lang: 'es' }, T0 + 100, 'p2').effects)).toEqual(['not_vip']); // prettier-ignore
    const tv = applyRoomEvent(room, { type: 'vip', now: T0 + 100, playerId: 'tv', action: { action: 'setContentLang', lang: 'es' }, host: true }, deps); // prettier-ignore
    expect(snapshot(tv.room, deps).contentLang).toBe('es');
    expect(vip(tv.room, { action: 'setContentLang', lang: 'es' }).effects).toEqual([]);
  });
});

describe('what the game is told', () => {
  const seen: InitContext[] = [];
  const spy = { ...fakeGame, manifest: { ...fakeGame.manifest, id: 'spy' }, init: (ctx: InitContext) => (seen.push(ctx), fakeGame.init(ctx)) }; // prettier-ignore
  const spyDeps: EngineDeps = { games: { fake: fakeGame, spy } };
  const start = (room: RoomState): RoomState => {
    const chosen = applyRoomEvent(room, { type: 'vip', now: T0 + 100, playerId: 'p1', action: { action: 'selectGame', gameId: 'spy' } }, spyDeps).room; // prettier-ignore
    return applyRoomEvent(chosen, { type: 'vip', now: T0 + 101, playerId: 'p1', action: { action: 'startNow' }, seed: 7 }, spyDeps).room; // prettier-ignore
  };

  it('gets the content language at start, and a later switch is for the next game', () => {
    seen.length = 0;
    const room = start(roomIn('es', 'en'));
    expect(seen[0]?.contentLang).toBe('es');
    const switched = applyRoomEvent(room, { type: 'vip', now: T0 + 300, playerId: 'p1', action: { action: 'setContentLang', lang: 'en' } }, spyDeps).room; // prettier-ignore
    expect(switched.game?.gameId).toBe('spy');
    expect(snapshot(switched, spyDeps).contentLang).toBe('en');
    expect(seen).toHaveLength(1);
  });
});
