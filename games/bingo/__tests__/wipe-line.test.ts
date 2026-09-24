// I-435 A: a wrong claim takes the never-called daubs and the claimed line; every other right daub
// stays on the card.
import { describe, expect, it } from 'vitest';
import { callUntil, claimRaw, daubAll, start } from './helpers';

describe('I-435 A: lose the line, keep the rest', () => {
  it('the wrong daub and the claimed line go; the other right daubs stay', () => {
    const right = [0, 7, 19]; // different rows and columns
    let s = callUntil(start(), 'a', right);
    const card = s.round.cards['a']?.[0] ?? [];
    const called = new Set(s.round.deck.slice(0, s.round.drawn));
    const wrong = [...Array(25).keys()].find(
      (i) => i !== 12 && !right.includes(i) && !called.has(card[i] ?? -1),
    );
    expect(wrong).toBeDefined();
    s = daubAll(s, 'a', [...right, wrong ?? 1]);
    s = claimRaw(s, 'a');
    expect(s.phase.id).toBe('check');
    const claim = s.round.claim;
    const lost = new Set([...(claim?.red ?? []), ...(claim?.cells ?? [])]);
    const kept = s.round.daubs['a']?.[0] ?? [];
    expect(kept).not.toContain(wrong);
    for (const i of right) expect(kept.includes(i)).toBe(!lost.has(i));
    expect(kept.length).toBeGreaterThan(0); // right daubs off the line survive
    expect([...(claim?.wiped ?? [])].sort()).toEqual(
      [...right, wrong ?? 1].filter((i) => lost.has(i)).sort(),
    );
  });
});
