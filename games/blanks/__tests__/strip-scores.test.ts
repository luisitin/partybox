// Retro 0ac5d8: after a result the TV strip still showed 0 for everyone — the hold lasted the
// whole result phase, which now waits on the VIP's Next. The strip holds only until the winner
// is named (the result's last beat), then shows the point.
import { describe, expect, it } from 'vitest';
import { tv } from '../client/tv-entry';
import { RESULT_BEATS_MS } from '../client/timing';

type View = Parameters<NonNullable<typeof tv.stripScores>>[0];
const view = (phaseId: string): View =>
  ({ phaseId, players: [], deadline: null, paused: false }) as unknown as View;

describe('blanks TV strip scores', () => {
  it('holds the result strip only until the winner is named', () => {
    expect(tv.stripScores?.(view('result'))).toBe(RESULT_BEATS_MS[2]);
  });
  it('shows running totals in every other phase', () => {
    for (const id of ['intro', 'answer', 'reveal', 'judge', 'final', 'done'])
      expect(tv.stripScores?.(view(id))).toBe(true);
  });
});
