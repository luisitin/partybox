// I-238: a room of 12 or 16 can play Broken Pencil, in about an 8-player game's length.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';

const players = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `P${i}`, avatarId: 'fox', connected: true }));

describe('I-238: up to 16', () => {
  it("takes 16; 'everyone' scales down in a big room; a VIP's number is kept", () => {
    expect(game.manifest.maxPlayers).toBe(16);
    const at = (n: number, settings = {}) => game.init({ players: players(n), settings, seed: 1, now: 0 }).passes;
    expect(at(6)).toBe(5);
    expect(at(8)).toBe(7);
    expect(at(9)).toBe(6);
    expect(at(12)).toBe(4);
    expect(at(16)).toBe(3);
    expect(at(12, { passes: 10 })).toBe(10);
  });
});
