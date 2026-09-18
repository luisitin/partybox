// The judge's pick (czar mode): three black cards, one chosen — README "Phases" (pick).
import { describe, expect, it } from 'vitest';
import { PICK_HOLD_MS, PICK_MS, UNTIMED_PICK_MS } from '../server/types';
import { T0, connect, cv, reduce, start, timer, tv } from './helpers';

describe('pick (czar mode)', () => {
  it('the judge chooses one of three black cards; the rest go under the deck', () => {
    const s = timer(start({ judge: 'czar', players: 4, timed: true }));
    expect(s.phase.id).toBe('pick');
    expect(s.phase.deadline).toBe(s.phase.startedAt + PICK_MS);
    expect(s.blackChoices).toHaveLength(3);
    expect(tv(s).blackChoices).toHaveLength(3);
    expect(cv(s, s.czarId as string).blackChoices).toHaveLength(3);
    const judge = s.czarId as string;
    const other = s.order.find((id) => id !== judge) as string;
    const before = s.blackDeck.length;
    const [a, b, c] = s.blackChoices as [string, string, string];
    // Only the judge chooses; a bad index is ignored.
    expect(
      reduce(s, { type: 'input', now: T0, playerId: other, input: { type: 'choose', index: 1 } }),
    ).toBe(s);
    expect(
      reduce(s, { type: 'input', now: T0, playerId: judge, input: { type: 'choose', index: 3 } }),
    ).toBe(s);
    const chosen = reduce(s, {
      type: 'input',
      now: T0,
      playerId: judge,
      input: { type: 'choose', index: 1 },
    });
    // The choice holds the stage for a beat with the taken card lit, then picking opens.
    expect(chosen.phase.id).toBe('pick');
    expect(chosen.blackId).toBe(b);
    expect(chosen.phase.deadline).toBe(T0 + PICK_HOLD_MS);
    expect(tv(chosen).blackChoices.map((x) => x.chosen)).toEqual([false, true, false]);
    // A second tap cannot push the beat out again.
    expect(
      reduce(chosen, {
        type: 'input',
        now: T0 + 100,
        playerId: judge,
        input: { type: 'choose', index: 2 },
      }),
    ).toBe(chosen);
    const open = timer(chosen);
    expect(open.phase.id).toBe('answer');
    expect(open.blackId).toBe(b);
    expect(open.blackChoices).toEqual([]);
    expect(open.blackDeck.slice(-2)).toEqual([a, c]);
    expect(open.blackDeck.length).toBe(before + 2);
    // The deadline defaults to the first card; a dropped judge defaults at once.
    expect(timer(s).blackId).toBe(a);
    expect(timer(s).phase.id).toBe('answer');
    const dropped = connect(s, judge, false, s.phase.startedAt + 100);
    expect(dropped.phase.id).toBe('answer');
    expect(dropped.blackId).toBe(a);
    // Vote mode has no pick: one card, straight to answer.
    const vote = timer(start({ players: 4 }));
    expect(vote.phase.id).toBe('answer');
    expect(vote.blackChoices).toEqual([]);
    // Untimed: a hidden 60 s fallback; the phones show no clock.
    const untimed = timer(start({ judge: 'czar', players: 4, timed: false }));
    expect(untimed.phase.deadline).toBe(untimed.phase.startedAt + UNTIMED_PICK_MS);
    expect(tv(untimed).timerMode).toBe('hidden');
  });
});
