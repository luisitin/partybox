// ADR-043 (the owner, 2026-09-22): a phone can open its own room with a code it picked, and an
// empty phone-made room can be dropped — never the house room, never one with people in it.
import { describe, expect, it } from 'vitest';
import { createClock } from './clock';
import { createHost } from './host';
import type { Transport } from './host';

const quiet: Transport = {
  toPlayer: () => undefined,
  toTvs: () => undefined,
  toAll: () => undefined,
  disconnectPlayer: () => undefined,
};

function host() {
  return createHost({ deps: { games: {} }, clock: createClock(), transport: quiet, log: () => {} });
}

describe('host.createRoom (ADR-043)', () => {
  it('takes a free code the phone picked, upper-cased, listed by default', () => {
    const h = host();
    const room = h.createRoom({ code: ' pqrs ' });
    expect(room.code).toBe('PQRS');
    expect(room.listed).toBe(true);
    expect(h.get('PQRS')).toBeDefined();
  });

  it('can open a private room', () => {
    expect(host().createRoom({ listed: false }).listed).toBe(false);
  });

  it('refuses a taken code and an invalid one, and changes nothing', () => {
    const h = host();
    h.createRoom({ code: 'PQRS' });
    const before = h.rooms().length;
    expect(() => h.createRoom({ code: 'PQRS' })).toThrow('taken');
    // O and I are excluded look-alikes; three letters is too short.
    expect(() => h.createRoom({ code: 'DONE' })).toThrow('invalid');
    expect(() => h.createRoom({ code: 'ABC' })).toThrow('invalid');
    expect(h.rooms().length).toBe(before);
  });

  it('picks a fresh code when none is asked for, never a room that exists', () => {
    const h = host();
    const codes = new Set(h.rooms().map((r) => r.code));
    for (let i = 0; i < 20; i++) {
      const { code } = h.createRoom();
      expect(codes.has(code)).toBe(false);
      codes.add(code);
    }
  });
});

describe('host.drop', () => {
  it('drops an empty room', () => {
    const h = host();
    h.createRoom({ code: 'PQRS' });
    h.drop('PQRS');
    expect(h.get('PQRS')).toBeUndefined();
  });

  it('never drops the house room', () => {
    const h = host();
    const house = h.house().code;
    h.drop(house);
    expect(h.get(house)).toBeDefined();
  });

  it('never drops a room with someone in it', () => {
    const h = host();
    h.createRoom({ code: 'PQRS' });
    h.dispatch('PQRS', { type: 'join', playerId: 'a', token: 'ta', name: 'Ana', avatarId: 'fox' });
    h.drop('PQRS');
    expect(h.get('PQRS')).toBeDefined();
  });
});
