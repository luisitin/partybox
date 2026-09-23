// I-112 C: "Calls shown" is one three-way choice mapped onto the TV's two flags, and the board
// always implies the previous call (B) — a stored "previous off" can never ride along with it.
import { describe, expect, it } from 'vitest';
import { readSettings } from '../server/index';

const flags = (raw: Record<string, unknown>): [boolean, boolean] => {
  const s = readSettings(raw as Parameters<typeof readSettings>[0]);
  return [s.showBoard, s.showPrevious];
};

describe('calls shown', () => {
  it('maps the three choices onto board / previous', () => {
    expect(flags({ callsShown: 'none' })).toEqual([false, false]);
    expect(flags({ callsShown: 'last' })).toEqual([false, true]);
    expect(flags({ callsShown: 'board' })).toEqual([true, true]);
  });
  it('reads the old two booleans consistently: the board implies the previous call', () => {
    expect(flags({ showBoard: true, showPrevious: false })).toEqual([true, true]);
    expect(flags({ showPrevious: false })).toEqual([false, false]);
    expect(flags({})).toEqual([false, true]);
  });
});
