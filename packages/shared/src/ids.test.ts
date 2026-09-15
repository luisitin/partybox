import { describe, expect, it } from 'vitest';
import {
  AVATAR_IDS,
  isAvatarId,
  isRoomCode,
  nameKey,
  normalizeName,
  normalizeRoomCode,
  roomCodeFrom,
} from './ids';
import { createRng } from './rng';

describe('room codes', () => {
  it('generates valid codes without ambiguous letters', () => {
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const code = roomCodeFrom(rng);
      expect(isRoomCode(code)).toBe(true);
      expect(code).not.toMatch(/[01IOL]/);
    }
  });
  it('rejects wrong length or characters', () => {
    expect(isRoomCode('ABC')).toBe(false);
    expect(isRoomCode('ABCO')).toBe(false);
    expect(isRoomCode('abcd')).toBe(false);
    expect(isRoomCode(normalizeRoomCode(' abcd '))).toBe(true);
  });
});

describe('names', () => {
  it('trims, collapses and strips invisible characters', () => {
    expect(normalizeName('  Ana   Maria ')).toBe('Ana Maria');
    expect(normalizeName(`bob${String.fromCodePoint(0x200b, 0x202e)}`)).toBe('bob');
    expect(normalizeName('\t\n')).toBeNull();
    expect(normalizeName('')).toBeNull();
  });
  it('limits to 16 code points, counting emoji as one', () => {
    expect(normalizeName('abcdefghijklmnop')).toBe('abcdefghijklmnop');
    expect(normalizeName('abcdefghijklmnopq')).toBeNull();
    expect(normalizeName('😀'.repeat(16))).toHaveLength(32);
    expect(normalizeName('😀'.repeat(17))).toBeNull();
  });
  it('compares case-insensitively', () => {
    expect(nameKey('Ana')).toBe(nameKey('aNA'));
  });
});

describe('avatars', () => {
  it('has 16 unique ids', () => {
    expect(new Set(AVATAR_IDS).size).toBe(16);
    expect(isAvatarId('fox')).toBe(true);
    expect(isAvatarId('dragon')).toBe(false);
  });
});
